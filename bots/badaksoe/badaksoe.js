/**
 * 바닥쇠 — 카카오 오픈채팅 크롤러
 * 메신저봇R (Android) 스크립트
 *
 * 사용법: 메신저봇R 앱에서 새 봇 생성 후 이 코드를 스크립트에 붙여넣기
 */

// ── Config ──────────────────────────────────────────
const API_URL = "https://tenone.biz/api/trendhunter/collect";
const API_KEY = ""; // TRENDHUNTER_API_KEY

// 내부 방 (full 모드 — 원본 저장)
const ROOMS = {
  "텐원 트렌드팀": "trend",
  "AI 스터디": "ai_tech",
  "스타트업 네트워크": "business",
  "바닥 네트워크": "business",
};

// 외부 방 (digest 모드 — 요약만)
const EXTERNAL_ROOMS = {
  "IT 뉴스방": "ai_tech",
  "창업 정보방": "business",
  "마케팅 인사이트": "trend",
};

// 메시지 버퍼 (배치 전송)
var buffer = [];
var BATCH_SIZE = 5;
var lastFlush = Date.now();
var FLUSH_INTERVAL = 60000; // 1분

// ── Main Response Function ──────────────────────────
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  // 오픈채팅방만 수집
  if (!isGroupChat) return;

  // 내부 방 체크
  var topic = ROOMS[room];
  var mode = "full";

  if (!topic) {
    // 외부 방 체크
    topic = EXTERNAL_ROOMS[room];
    mode = "digest";
  }

  // 등록되지 않은 방은 무시
  if (!topic) return;

  // 짧은 메시지 무시 (이모티콘, 반응 등)
  if (msg.length < 5) return;

  // 시스템 메시지 무시
  if (sender === "카카오톡" || sender === "오픈채팅봇") return;

  // 버퍼에 추가
  buffer.push({
    source: mode === "digest" ? "kakao_ext" : "kakao",
    room: room,
    topic: topic,
    sender: sender,
    title: null,
    message: msg,
    url: null,
    content_type: "text",
    mode: mode,
    metadata: {
      is_group_chat: isGroupChat,
      package: packageName,
    },
    timestamp: new Date().toISOString(),
  });

  // 배치 사이즈 도달 시 전송
  if (buffer.length >= BATCH_SIZE) {
    flushBuffer();
  }
}

// ── Flush Buffer ────────────────────────────────────
function flushBuffer() {
  if (buffer.length === 0) return;

  var items = buffer.slice();
  buffer = [];
  lastFlush = Date.now();

  try {
    var conn = new java.net.URL(API_URL).openConnection();
    conn.setRequestMethod("POST");
    conn.setRequestProperty("Content-Type", "application/json");
    if (API_KEY) {
      conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
    }
    conn.setDoOutput(true);
    conn.setConnectTimeout(10000);
    conn.setReadTimeout(10000);

    var payload = JSON.stringify({ items: items });

    var os = conn.getOutputStream();
    os.write(new java.lang.String(payload).getBytes("UTF-8"));
    os.flush();
    os.close();

    var responseCode = conn.getResponseCode();
    if (responseCode === 200) {
      Log.i("바닥쇠: " + items.length + "건 전송 성공");
    } else {
      Log.e("바닥쇠: HTTP " + responseCode);
      // 실패 시 버퍼에 되돌리기
      buffer = items.concat(buffer);
    }

    conn.disconnect();
  } catch (e) {
    Log.e("바닥쇠 전송 오류: " + e);
    // 실패 시 버퍼에 되돌리기 (최대 50건)
    buffer = items.concat(buffer).slice(0, 50);
  }
}

// ── Periodic Flush (called by timer if available) ───
function onTimer() {
  if (Date.now() - lastFlush > FLUSH_INTERVAL && buffer.length > 0) {
    flushBuffer();
  }
}

// ── Bot Commands ────────────────────────────────────
// 관리자가 "!바닥쇠 상태" 입력 시 현재 상태 반환
function handleCommand(room, msg, sender, replier) {
  if (!msg.startsWith("!바닥쇠")) return false;

  var cmd = msg.replace("!바닥쇠", "").trim();

  if (cmd === "상태" || cmd === "status") {
    replier.reply(
      "🔧 바닥쇠 상태\n" +
      "버퍼: " + buffer.length + "건\n" +
      "마지막 전송: " + new Date(lastFlush).toLocaleTimeString() + "\n" +
      "내부 방: " + Object.keys(ROOMS).length + "개\n" +
      "외부 방: " + Object.keys(EXTERNAL_ROOMS).length + "개"
    );
    return true;
  }

  if (cmd === "전송" || cmd === "flush") {
    flushBuffer();
    replier.reply("📦 버퍼 전송 완료 (" + buffer.length + "건 남음)");
    return true;
  }

  return false;
}

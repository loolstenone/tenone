# TrendHunter 크롤러 기술설계서

> Ten:One™ Universe의 정보 수집·분석·콘텐츠 생산 엔진
> 다양한 플랫폼에서 정보를 크롤링하고, 세계관 안에서 가공·활용한다.
> 최종 업데이트: 2026-03-26

---

## 목차

1. TrendHunter란
2. 크롤러 체계
3. 시스템 아키텍처
4. 크롤러 모듈별 상세
5. 데이터베이스 스키마
6. 분석 엔진 (Claude 기반)
7. 데이터 → 콘텐츠 생산 파이프라인
8. 데이터 → 사업화 파이프라인
9. TrendHunter 사이트 (tenone.biz 모듈)
10. 배치 스케줄
11. 배포 환경 · 비용
12. 개발 로드맵
13. 리스크 & 대응
14. 보안 · 윤리

---

## 1. TrendHunter란

TrendHunter는 Ten:One™ Universe의 **정보 수집·분석·콘텐츠 생산 엔진**이다.

다양한 플랫폼(카카오 오픈채팅방, 네이버 카페, 디스코드, 커뮤니티 사이트, 뉴스, RSS 등)에서 정보를 크롤링하고, Claude 기반 분석을 거쳐, 세계관 안의 브랜드들(Badak, MADLeague, RooK, 0gamja, FWN 등)이 활용할 수 있는 콘텐츠와 사업 기회로 변환한다.

### 핵심 원칙

```
수집은 목적이 아니라 변환이 목적이다.
크롤링한 정보가 콘텐츠가 되고, 사업이 된다.
```

### TrendHunter의 세 가지 층

| 층 | 역할 | 구성 |
|---|------|------|
| **수집층** | 정보를 긁어온다 | 크롤러 모듈들 (바닥쇠, 웹크롤러, RSS 등) |
| **분석층** | 정보를 분석·가공한다 | Claude 분석 엔진, 키워드 추출, 기회 감지 |
| **활용층** | 콘텐츠·사업으로 변환한다 | TrendHunter 사이트, 콘텐츠 초안, 기회 알림 |

---

## 2. 크롤러 체계

```
┌────────────────────────────────────────────────────────────────┐
│                     TrendHunter 크롤러 체계                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    수집층 (Collectors)                    │   │
│  │                                                          │   │
│  │  🔩 바닥쇠              카카오 오픈채팅방 크롤러           │   │
│  │     ├─ 내부 14개 방     응답 + 수집                       │   │
│  │     └─ 외부 N개 방      리스닝 (인간 모드)                │   │
│  │                                                          │   │
│  │  🌐 웹크롤러            커뮤니티 · 정보 사이트 크롤러      │   │
│  │     ├─ 네이버 카페      가입 후 게시글·댓글 수집           │   │
│  │     ├─ 블라인드          업계 직장인 대화                  │   │
│  │     ├─ 에펨코리아/클리앙  일반 트렌드                      │   │
│  │     └─ 업계 전문 사이트   설정에 따라 가입·크롤링          │   │
│  │                                                          │   │
│  │  💬 디스코드 크롤러      디스코드 서버 크롤러              │   │
│  │     └─ 마케팅/AI/크리에이티브 서버                        │   │
│  │                                                          │   │
│  │  📰 뉴스·RSS 크롤러     뉴스레터 · RSS · 블로그           │   │
│  │     ├─ 구독 뉴스레터     CB Insights, 팁스터 등           │   │
│  │     ├─ RSS 피드         업계 블로그, 미디어               │   │
│  │     └─ 뉴스 사이트       마케팅/광고/AI 전문 매체          │   │
│  │                                                          │   │
│  │  🏛 SmarComm 크롤러     공공 데이터 크롤러                │   │
│  │     ├─ 나라장터          입찰·용역 공고                   │   │
│  │     ├─ bizinfo          정부 지원사업                     │   │
│  │     └─ 공모전 사이트     대외활동·공모전 공고             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               분석층 (Analyzer — Claude 기반)             │   │
│  │                                                          │   │
│  │  키워드 추출 · 트렌드 감지 · 사업 기회 패턴 매칭          │   │
│  │  커뮤니티 헬스 분석 · 콘텐츠 초안 자동 생성               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               활용층 (Output)                             │   │
│  │                                                          │   │
│  │  tenone.biz/trendhunter    TrendHunter 사이트             │   │
│  │  콘텐츠 초안 → 6개 브랜드   자동 생산                     │   │
│  │  사업 기회 알림 → 텐원      자동 감지                     │   │
│  │  커뮤니티 헬스 리포트        운영 인사이트                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 두 종류의 데이터

| 크롤러 | 데이터 성격 | 예시 |
|--------|-----------|------|
| SmarComm 크롤러 | **공식 데이터** — 팩트, 숫자, 일정 | 나라장터 입찰, 공모전, 지원사업 |
| 바닥쇠 + 웹크롤러 + 디스코드 + 뉴스 | **현장 데이터** — 의견, 트렌드, 니즈 | 현업자 대화, 커뮤니티 글, 업계 뉴스 |

공식 데이터만으로는 "숫자"밖에 안 나오고, 현장 데이터만으로는 "감"밖에 안 나온다. 둘이 합쳐져야 인사이트가 된다.

---

## 3. 시스템 아키텍처

```
수집 소스들
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│카카오     │네이버카페 │디스코드   │커뮤니티   │뉴스/RSS  │
│오픈채팅방 │블라인드   │서버      │사이트    │뉴스레터   │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ 바닥쇠   │ │ 웹       │ │디스코드│ │ 웹     │ │ RSS    │
│ 모듈     │ │ 크롤러   │ │ 봇    │ │스크래퍼│ │ 파서   │
│(메신저봇)│ │(Puppeteer)│ │(Discord│ │(Cheerio│ │(RSS   │
│          │ │          │ │  .js) │ │/Axios) │ │ Parser)│
└────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘ └───┬───┘
     │            │            │          │          │
     └────────────┴────────────┴──────────┴──────────┘
                              │
                    HTTP POST / 직접 저장
                              │
                              ▼
              ┌───────────────────────────────┐
              │  TrendHunter 서버 (Node.js)    │
              │                               │
              │  수집 라우터                    │
              │  ├─ 소스 식별 + 정규화          │
              │  ├─ 개인정보 마스킹             │
              │  └─ DB 저장                    │
              │                               │
              │  분석 엔진                      │
              │  ├─ 키워드 추출                 │
              │  ├─ 트렌드 감지                 │
              │  ├─ 기회 패턴 매칭              │
              │  └─ 콘텐츠 초안 생성            │
              └───────────┬───────────────────┘
                          │
               ┌──────────┼──────────┐
               ▼          ▼          ▼
          ┌────────┐ ┌────────┐ ┌──────────────────┐
          │Supabase│ │ Claude │ │ tenone.biz       │
          │  DB    │ │  API   │ │ /trendhunter     │
          │        │ │        │ │                  │
          │ 전체   │ │ 분석   │ │ 리포트·시그널     │
          │ 크롤링 │ │ 콘텐츠 │ │ 레퍼런스·기회     │
          │ 데이터 │ │ 생성   │ │ 대시보드          │
          └────────┘ └────────┘ └──────────────────┘
```

---

## 4. 크롤러 모듈별 상세

### 4-1. 🔩 바닥쇠 — 카카오 오픈채팅방 크롤러

**바닥쇠 = TrendHunter 크롤러의 카카오 오픈채팅방 버전**

바닥을 지키며 회원들의 수발을 드는 AI 봇.
"방장이 모든 것을 할 수 없어 챗봇을 방마다 두었다."

**이름:** 바닥쇠 (바닥 + 쇠/로봇) 🔩
**기술:** 안드로이드 공기계 + 메신저봇R + 봇 전용 카톡 계정

**3가지 작동 모드:**

| 모드 | 대상 | 동작 |
|------|------|------|
| **응답 모드** | 바닥 내부 14개 방 | 메시지 수집 + "바닥쇠" 호출 시 주제별 AI 응답 |
| **공지 모드** | 채용 공지방 등 | 메시지 수집만 (respondable: false) |
| **인간 모드** | 외부 오픈채팅방 | 일반 멤버로 입장, 조용히 수집만 |

**대상 방 (내부 14개):**

| 카테고리 | 방 | 모드 |
|---------|-----|------|
| AI | RooK | 응답 |
| 이직 | 채용 공지 | 공지 |
| 업무 | 디지털 마케팅, 자료 공유, 레퍼런스 창고, 콜라보, 애드테크&마테크, 플래너'스 | 응답 |
| 수다 | 메인 수다방, 프리랜서, 팀장&리더, 영상쟁이/프로덕션, MoNTZ, 제작 직군 | 응답 |

**외부 방 (인간 모드):**
설정 파일(external_rooms.json)로 관리. 최대 20개. 수집 모드 2가지:
- **Full** — 원본 저장 (채용·공모전 등 정형 정보)
- **Digest** — 3시간마다 Claude 요약만 저장, 원본 미보관 (트렌드 모니터링, 리스크 낮음)

**인사 / 환영 메시지:**
각 방에 방장봇(카카오 공식 기능)으로 🔩 바닥쇠 환영 메시지 + Q&A 세팅.
별도 세팅안 문서(Badak_바닥쇠_세팅안_전체.md) 참조.

**메신저봇R 코어 스크립트:**

```javascript
const SERVER_URL = "https://trendhunter.tenone.biz/api";

const ROOM_MAP = {
  // 내부 방
  "RooK":              { topic: "ai",         respondable: true,  external: false },
  "채용 공지":          { topic: "recruit",    respondable: false, external: false },
  "디지털 마케팅":      { topic: "digital",    respondable: true,  external: false },
  "자료 공유":          { topic: "resources",  respondable: true,  external: false },
  "레퍼런스 창고":      { topic: "reference",  respondable: true,  external: false },
  "콜라보":            { topic: "collabo",    respondable: true,  external: false },
  "애드테크 & 마테크":  { topic: "adtech",     respondable: true,  external: false },
  "플래너'스":          { topic: "planner",    respondable: true,  external: false },
  "메인 수다방":        { topic: "main",       respondable: true,  external: false },
  "프리랜서":           { topic: "freelancer", respondable: true,  external: false },
  "팀장 & 리더":        { topic: "leader",     respondable: true,  external: false },
  "영상쟁이, 프로덕션": { topic: "video",      respondable: true,  external: false },
  "MoNTZ":             { topic: "model",      respondable: true,  external: false },
  "제작 직군":          { topic: "creative",   respondable: true,  external: false },
  // 외부 방 (예시)
  // "[외부] 광고업계방": { topic: "ext_ad", respondable: false, external: true, mode: "digest" },
};

const TRIGGER = [/^바닥쇠/, /^@바닥쇠/, /^!바닥쇠/];

function response(room, msg, sender, isGroupChat, replier) {
  if (!isGroupChat) return;
  const c = ROOM_MAP[room];
  if (!c) return;

  // 외부 방 — 리스닝만
  if (c.external) {
    post("/collect", { source: "kakao_ext", room, topic: c.topic, sender, message: msg, mode: c.mode || "digest" });
    return;
  }

  // 내부 방 — 수집
  post("/collect", { source: "kakao", room, topic: c.topic, sender, message: msg });

  // 바닥쇠 호출 시에만 응답
  if (c.respondable && TRIGGER.some(p => p.test(msg))) {
    const q = msg.replace(/^[@!]?바닥쇠\s*/, "").trim();
    if (!q) { replier.reply("🔩 바닥쇠입니다. 무엇을 도와드릴까요?"); return; }
    try {
      var res = org.jsoup.Jsoup.connect(SERVER_URL + "/respond")
        .header("Content-Type", "application/json")
        .requestBody(JSON.stringify({ topic: c.topic, query: q, sender }))
        .ignoreContentType(true).timeout(30000).post();
      replier.reply("🔩 " + JSON.parse(res.text()).answer);
    } catch(e) { replier.reply("🔩 잠시 후 다시 시도해주세요."); }
  }
}

function post(endpoint, data) {
  try {
    data.timestamp = new Date().toISOString();
    org.jsoup.Jsoup.connect(SERVER_URL + endpoint)
      .header("Content-Type", "application/json")
      .header("Authorization", "Bearer " + API_KEY)
      .requestBody(JSON.stringify(data))
      .ignoreContentType(true).post();
  } catch(e) {}
}
```

**주제별 시스템 프롬프트:**
공통 베이스 + 방별 14개 프롬프트. Vrief/GPR 지식(플래너'스), AI 툴(RooK), 프리랜서 실무 등 각 주제 전문성 탑재.

---

### 4-2. 🌐 웹크롤러 — 커뮤니티 · 정보 사이트

설정에 따라 커뮤니티에 가입하고, 게시글·댓글을 주기적으로 크롤링.

**기술:** Puppeteer (헤드리스 브라우저) — 로그인 세션 유지, 동적 페이지 대응

**대상 (예시):**

| 사이트 | 수집 대상 | 수집 방식 | 주기 |
|--------|----------|----------|------|
| 네이버 카페 (마케팅/광고) | 새 게시글, 인기글 | 가입 후 Puppeteer | 1시간 |
| 블라인드 | 마케팅/광고 카테고리 | 웹 스크래핑 | 3시간 |
| 에펨코리아 | 인기글, 트렌드 | 공개 페이지 스크래핑 | 6시간 |
| 클리앙 | 팁과강좌, 모두의공원 | 공개 페이지 스크래핑 | 6시간 |
| 디스콰이엇 | 프로덕트, 사이드 프로젝트 | 공개 페이지 | 일 1회 |
| 업계 전문 사이트 | 설정에 따라 | 가입 + 스크래핑 | 설정별 |

```javascript
// 웹크롤러 설정 (config/web_sources.json)
{
  "sources": [
    {
      "name": "네이버카페_마케팅연구소",
      "type": "naver_cafe",
      "url": "https://cafe.naver.com/...",
      "login_required": true,
      "sections": ["인기글", "새글"],
      "interval": "1h",
      "mode": "full"
    },
    {
      "name": "블라인드_마케팅",
      "type": "blind",
      "category": "마케팅/광고",
      "login_required": true,
      "interval": "3h",
      "mode": "digest"
    }
  ]
}
```

---

### 4-3. 💬 디스코드 크롤러

**기술:** Discord.js — 공식 봇 API. 가장 깔끔한 구조.

서버에 봇을 넣으면 모든 채널 메시지를 실시간 수집.
마케팅/AI/크리에이티브 관련 디스코드 서버 대상.

---

### 4-4. 📰 뉴스 · RSS · 뉴스레터 크롤러

**기술:** RSS 파서 + Gmail API (뉴스레터 자동 수집)

| 소스 | 방식 | 비고 |
|------|------|------|
| 업계 블로그 RSS | RSS 파서 | 가장 안전, 공개 데이터 |
| 구독 뉴스레터 | Gmail에서 자동 수집 | CB Insights, 팁스터 등 이미 수신 중 |
| 뉴스 사이트 | 웹 스크래핑 / API | 마케팅/광고/AI 전문 매체 |

텐원이 이미 Gmail로 받고 있는 뉴스레터(CB Insights, 팁스터, 혁신의숲 등)를 자동 파싱해서 TrendHunter DB에 적재하는 것도 가능.

---

### 4-5. 🏛 SmarComm 크롤러 (기존)

별도 프로젝트(C:\Projects\SmarComm)에서 개발 중. 공공 데이터 전담.
나라장터 입찰, bizinfo 지원사업, 공모전 공고.
TrendHunter와 같은 Supabase DB를 공유하여 데이터 합류.

---

## 5. 데이터베이스 스키마 (Supabase)

```sql
-- =============================================
-- 통합 수집 로그 (모든 크롤러 공용)
-- =============================================
CREATE TABLE collected_data (
  id           BIGSERIAL PRIMARY KEY,
  source_type  TEXT NOT NULL,      -- kakao, kakao_ext, web, discord, rss, news, smarcomm
  source_name  TEXT NOT NULL,      -- 방 이름 / 사이트명 / 서버명
  topic        TEXT,               -- 주제 코드
  author       TEXT,               -- 작성자 (닉네임)
  title        TEXT,               -- 제목 (게시글일 경우)
  content      TEXT NOT NULL,      -- 본문
  content_type TEXT DEFAULT 'text', -- text, article, post, comment, link
  url          TEXT,               -- 원본 URL (게시글 링크)
  has_urls     BOOLEAN DEFAULT false,
  extracted_urls TEXT[],           -- 본문 내 URL
  metadata     JSONB,             -- 소스별 추가 정보 (좋아요 수, 댓글 수 등)
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cd_source ON collected_data(source_type);
CREATE INDEX idx_cd_topic ON collected_data(topic);
CREATE INDEX idx_cd_collected ON collected_data(collected_at);

-- =============================================
-- 요약 저장 (digest 모드)
-- =============================================
CREATE TABLE digests (
  id             SERIAL PRIMARY KEY,
  source_type    TEXT NOT NULL,
  source_name    TEXT NOT NULL,
  digest_text    TEXT NOT NULL,
  keywords       JSONB,
  urls           JSONB,
  opportunities  JSONB,
  data_count     INT,
  period_start   TIMESTAMPTZ,
  period_end     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 바닥쇠 응답 로그
-- =============================================
CREATE TABLE bot_responses (
  id             BIGSERIAL PRIMARY KEY,
  room           TEXT NOT NULL,
  topic          TEXT NOT NULL,
  sender         TEXT NOT NULL,
  query          TEXT NOT NULL,
  response       TEXT NOT NULL,
  model          TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used    INT,
  response_time_ms INT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 사업 기회 감지
-- =============================================
CREATE TABLE opportunities (
  id           SERIAL PRIMARY KEY,
  type         TEXT NOT NULL,       -- recruit, solution, consulting, education, career, ai_demand, collabo
  source_type  TEXT NOT NULL,       -- 어디서 감지됐는지
  source_name  TEXT NOT NULL,
  title        TEXT,
  description  TEXT NOT NULL,
  url          TEXT,
  detected_at  TIMESTAMPTZ DEFAULT NOW(),
  status       TEXT DEFAULT 'new'   -- new, reviewed, acted, dismissed
);

-- =============================================
-- URL 아카이브 (공유·발견된 링크)
-- =============================================
CREATE TABLE url_archive (
  id          SERIAL PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  category    TEXT,
  author      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 일간 통계
-- =============================================
CREATE TABLE daily_stats (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  source_type    TEXT NOT NULL,
  source_name    TEXT NOT NULL,
  data_count     INT DEFAULT 0,
  unique_authors INT DEFAULT 0,
  top_keywords   JSONB,
  peak_hour      INT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, source_type, source_name)
);

-- =============================================
-- 인사이트 (Claude 분석 결과)
-- =============================================
CREATE TABLE insights (
  id            SERIAL PRIMARY KEY,
  period_type   TEXT NOT NULL,      -- daily, weekly, monthly
  period_start  DATE NOT NULL,
  insight_type  TEXT NOT NULL,      -- trend, health, opportunity, content
  scope         TEXT,               -- 전체 / 특정 소스
  summary       TEXT NOT NULL,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 콘텐츠 초안 (자동 생성)
-- =============================================
CREATE TABLE content_drafts (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  target_brand  TEXT NOT NULL,      -- TrendHunter, Badak, RooK, 0gamja, MADLeague, FWN
  target_format TEXT NOT NULL,      -- article, report, newsletter, sns
  source_data   JSONB,
  status        TEXT DEFAULT 'draft', -- draft, reviewed, published, discarded
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 크롤러 상태 관리
-- =============================================
CREATE TABLE crawler_status (
  id            SERIAL PRIMARY KEY,
  crawler_name  TEXT NOT NULL UNIQUE,  -- badaksoe, web_naver, discord_bot, rss_parser, smarcomm
  status        TEXT DEFAULT 'active', -- active, paused, error
  last_run      TIMESTAMPTZ,
  last_count    INT,
  error_message TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. 분석 엔진 (Claude 기반)

모든 크롤러가 수집한 데이터를 통합 분석.

### 6-1. 키워드 추출 + 트렌드 감지

```javascript
async function analyzeTrends(period) {
  const data = await supabase.from('collected_data')
    .select('*')
    .gte('collected_at', period.start)
    .lt('collected_at', period.end);

  const prompt = `
    다음은 여러 플랫폼에서 수집된 마케팅·광고 업계 데이터이다.
    소스별로 분석해줘:
    
    1. 핫 키워드 TOP 10 (플랫폼 간 교차 등장하면 가중치 높게)
    2. 떠오르는 트렌드 시그널 3개 (아직 핫하진 않지만 움직임이 보이는 것)
    3. 플랫폼별 온도 차이 (같은 주제도 카톡/카페/블라인드에서 다르게 논의됨)
    4. 지난 주 대비 변화
    
    ${JSON.stringify(summarizedData)}
  `;

  return await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }]
  });
}
```

### 6-2. 사업 기회 패턴 매칭

| 대화/게시글 패턴 | 감지 유형 | 연결 서비스 |
|----------------|----------|------------|
| "사람 구합니다" "인력 필요" | 인재 수요 | HeRo |
| "이거 자동화 안 돼?" | 솔루션 수요 | SmarComm. |
| "브랜딩 해야 하는데" | 컨설팅 수요 | Brand Gravity |
| "이거 배우고 싶다" "강의 없나" | 교육 수요 | Evolution School |
| "AI로 이거 할 수 있어?" | AI 수요 | RooK |
| "같이 해볼 사람?" | 프로젝트 | YouInOne |
| "제휴" "콜라보" | 비즈 매칭 | 콜라보 연결 |

감지 즉시 opportunities 테이블 적재 → 텐원 일간 알림.

---

## 7. 데이터 → 콘텐츠 생산 파이프라인

### 7-1. 자동 생산 흐름

```
크롤러 수집 → Claude 분석 → 콘텐츠 초안 자동 생성 → 텐원 검수·관점 추가 → 발행
```

### 7-2. 콘텐츠 라인업

| 수집 데이터 | 콘텐츠 | 배포 채널 | 주기 |
|------------|--------|----------|------|
| 주간 핫 키워드 (전 플랫폼 통합) | **위클리 트렌드 리포트** | TrendHunter, 뉴스레터 | 주 1회 |
| 떠오르는 시그널 | **트렌드 시그널** | TrendHunter | 주 2회 |
| 공유 URL 큐레이션 | **주간 레퍼런스 TOP** | 레퍼런스 창고, 뉴스레터 | 주 1회 |
| 반복 질문/고민 패턴 | **FAQ 아티클** | Badak 위키 | 월 2회 |
| 이직/커리어 대화 | **커리어 인사이트** | 0gamja, HeRo | 월 2회 |
| AI 툴 관련 대화 | **AI 실무 활용기** | RooK, MADLeague | 주 1회 |
| 패션/모델 관련 | **패션 업계 인사이트** | FWN | 월 2회 |
| 프리랜서 대화 | **프리랜서 가이드** | Badak 위키 | 분기 1회 |
| 리더십 대화 | **리더십 칼럼** | Badak, LinkedIn | 월 2회 |
| 영상/프로덕션 대화 | **프로덕션 가이드** | Badak 위키 | 월 1회 |
| 커뮤니티 게시글 트렌드 | **업계 온도계** | SNS, badak.biz | 월 1회 |

### 7-3. 1 신호 → 다중 변환

```
[이번 주 전 플랫폼: "AI 영상 편집" 급증]
    ├→ TrendHunter: "AI 영상 편집 툴 트렌드 분석"
    ├→ RooK: "영상쟁이가 써본 AI 편집 툴 TOP 5"
    ├→ MADLeague: "대학생이 알아야 할 AI 영상 편집"
    ├→ Badak 뉘스: "이번 주 핫 키워드: AI 영상 편집"
    ├→ 바닥쇠 → 영상쟁이방에 관련 레퍼런스 자동 공유
    └→ Evolution School: "AI 영상 편집 워크숍" 수요 감지 → 기획
```

**1 신호 → 6 콘텐츠 + 1 사업 기회.**
이게 "하루 15~20분으로 주 20~30개 콘텐츠"의 실체.

---

## 8. 데이터 → 사업화 파이프라인

```
TrendHunter 수집 데이터
    │
    ▼ 기회 감지
    │
    ├→ HeRo          인재 매칭
    ├→ SmarComm.     마케팅 자동화 솔루션 제안
    ├→ Brand Gravity  브랜드 컨설팅 리드
    ├→ Evolution School 교육 수요 발견
    ├→ YouInOne       프로젝트 팀빌딩
    ├→ RooK           AI 서비스
    ├→ MADLeague      공모전·경쟁PT 팀 빌딩
    └→ Vrief 워크숍    기획 교육 수요
    │
    ▼
    수익화 Phase 1~3에 실시간 리드 자동 공급
```

---

## 9. TrendHunter 사이트 (tenone.biz 모듈)

TrendHunter는 별도 사이트가 아니라 **tenone.biz 안의 모듈**로 구현.

```
tenone.biz/trendhunter
    ├─ /weekly          주간 트렌드 리포트 (자동 생성 → 텐원 검수 → 발행)
    ├─ /signals         트렌드 시그널 (떠오르는 키워드 실시간)
    ├─ /references      레퍼런스 큐레이션 (전 플랫폼 공유 URL 통합)
    ├─ /opportunities   기회 레이더 (채용·공모전·입찰·콜라보 통합)
    └─ /dashboard       키워드 대시보드 (내부용, 플랫폼별 비교)
```

프론트: tenone.biz Next.js 앱에 라우트 추가
데이터: 같은 Supabase DB

---

## 10. 배치 스케줄

| 시간 | 배치 | 산출물 |
|------|------|--------|
| **상시** | 바닥쇠 실시간 수집 | 카톡 메시지 → DB |
| **매 1~6시간** | 웹크롤러 주기적 수집 | 커뮤니티 게시글 → DB |
| **매일 08:00** | 일간 브리핑 | 어제 핫 키워드 + 감지 기회 → 텐원 이메일 |
| **매일 09:00** | URL 큐레이션 | 공유 링크 메타데이터 수집·분류 |
| **매일 자정** | 일간 통계 | 소스별 수집량, 참여자, 피크 시간대 |
| **매주 월 09:00** | 주간 트렌드 리포트 | "위클리" 콘텐츠 초안 자동 생성 |
| **매주 월 10:00** | 커뮤니티 헬스 | 바닥 방별 활성도 + 액션 제안 |
| **매주 화 09:00** | 사업 기회 리뷰 | 주간 감지 기회 정리 → 의사결정 |
| **매월 1일** | 월간 인사이트 | 트렌드 변화, 성장 지표, 콘텐츠 성과 |

---

## 11. 배포 환경 · 비용

| 구성 요소 | 환경 | 비용 |
|-----------|------|------|
| 안드로이드 공기계 (바닥쇠) | 중고 | 5~10만원 (일회성) |
| TrendHunter 서버 | GCP Cloud Run | $5~15/월 |
| Supabase | Free tier → Pro 필요 시 $25/월 | 무료~$25/월 |
| Claude API | Sonnet | $10~30/월 |
| 도메인 | trendhunter.tenone.biz | 무료 |
| **월간 총 비용** | | **$15~70 (약 2~10만원)** |

---

## 12. 개발 로드맵

### Phase 1: 바닥쇠 + 기본 수집 (2주)
- [ ] 공기계 + 봇 카톡 계정 세팅
- [ ] 메신저봇R 코어 스크립트
- [ ] TrendHunter 서버 (Node.js, 수집 엔드포인트)
- [ ] Supabase collected_data 테이블
- [ ] 바닥 14개 방 수집 시작
- [ ] 방장봇 세팅 (14개 방 환영 메시지 + Q&A)
- **→ 바닥 오픈채팅방 데이터가 쌓이기 시작**

### Phase 2: 바닥쇠 AI 응답 (1주)
- [ ] Claude API 연동
- [ ] 주제별 시스템 프롬프트 14개
- [ ] "바닥쇠" 호출 트리거 로직
- [ ] 메인 수다방 베타 테스트
- **→ 바닥쇠가 질문에 답하기 시작**

### Phase 3: 분석 + 콘텐츠 생산 (1주)
- [ ] 일간 통계 배치
- [ ] 주간 트렌드 리포트 (Claude 자동 생성)
- [ ] 사업 기회 패턴 매칭
- [ ] 콘텐츠 초안 자동 생성
- [ ] 텐원 일간 이메일 알림
- **→ 인사이트 + 콘텐츠 초안이 자동 생산**

### Phase 4: 외부 방 리스닝 (1주)
- [ ] 외부 오픈채팅방 리스닝 설정
- [ ] digest 모드 배치
- [ ] 기회 감지 + 알림
- **→ 업계 전체 오픈채팅방 트렌드 자동 수집**

### Phase 5: 웹크롤러 확장 (2주)
- [ ] Puppeteer 기반 웹크롤러
- [ ] 네이버 카페 크롤러 (1~2개 시범)
- [ ] RSS/뉴스레터 파서
- [ ] 크롤러 상태 관리 (crawler_status)
- **→ 멀티플랫폼 수집 시작**

### Phase 6: TrendHunter 사이트 (2주)
- [ ] tenone.biz/trendhunter 라우트
- [ ] /weekly, /signals, /references, /opportunities 페이지
- [ ] /dashboard (내부용)
- **→ TrendHunter가 눈에 보이기 시작**

### Phase 7: 고도화 (지속)
- [ ] 디스코드 크롤러
- [ ] 블라인드/커뮤니티 크롤러
- [ ] 바닥쇠 대화 맥락 유지
- [ ] 방 간 크로스 안내
- [ ] 활성 유저 → HeRo 연결
- [ ] 실시간 대시보드

---

## 13. 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| 카카오 메신저봇R 차단 | 카톡 버전 고정. 방장봇(공식)으로 폴백 |
| 봇 계정 정지 | 전용 계정, 과도한 빈도 자제 |
| 웹 스크래핑 차단 | IP 로테이션, 요청 간격 조절, 차단 시 해당 소스 일시 중지 |
| 커뮤니티 퇴장/차단 | 재입장 안 함, 다른 소스로 대체 |
| API 비용 초과 | Sonnet 사용, 토큰 제한, 일일 상한 |
| 개인정보 이슈 | 닉네임만 수집, 개인정보 자동 마스킹, digest 모드 기본 |
| 서버 다운 | 수집 실패 시 무시, Cloud Run 자동 스케일 |

---

## 14. 보안 · 윤리

**보안:**
- 서버 API 키 인증
- Supabase RLS 활성화
- 개인정보(전화번호, 이메일) 자동 마스킹 후 저장

**윤리:**
- 수집 데이터는 세계관 내부 분석·콘텐츠 생산용으로만 사용
- 외부 공개·판매 금지
- 특정 개인 타겟팅 금지
- 외부 방/커뮤니티는 digest 모드 기본 (원본 미보관)
- 공개 정보(게시글, 오픈채팅)만 수집. 비공개/DM 수집 금지

---

*TrendHunter — Ten:One™ Universe의 정보 수집·분석·콘텐츠 생산 엔진*
*바닥쇠 — TrendHunter 크롤러의 카카오 오픈채팅방 버전*
*Ten:One™ Universe*

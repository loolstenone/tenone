// 플래너'스 AI — 생각 쏟아내기(브레인 덤프) 해석
// POST { text, today? } → { actions: [{ tool: "create_task"|"create_event", input }], summary }
//
// 2026-10-14 개편 (Planner's AI 1단계):
//   - 도구를 하나(register_items)로 묶고 강제 호출 → 한 번에 여러 항목을 배열로 받는다 (예전: tool 여러 개 + auto → 줄글이면 아무것도 안 나옴)
//   - 줄글의 순서("~끝나면 → ~하고 → 저녁에")·장소·시간대(오전/오후/저녁)를 시간으로 바꾼다
//   - 질문·잡담·회고 요청은 빈 배열 (예전 원칙 유지 — 잡담을 할 일로 만들지 않는다)
//   - 메모(create_note)는 계속 만들지 않는다 (daily.notes가 Cornell JSON이라 덧붙이면 깨짐, 2026-04-29 결정)
// 응답 형식은 그대로 — 명령 팔레트·오늘 화면 '생각 쏟아내기'가 같은 결과를 쓴다 (features/myverse/planner/ai-actions.ts)
// 유료 회원 전용 (lib/myverse/ai-access.ts)

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAiAccess, isAiDenied, logAiUsage } from "@/lib/myverse/ai-access";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TEXT = 2000;

const TOOL: Anthropic.Tool = {
    name: "register_items",
    description: "사용자의 입력에서 플래너에 등록할 항목을 모두 뽑는다. 등록할 것이 없으면 items를 빈 배열로.",
    input_schema: {
        type: "object",
        properties: {
            items: {
                type: "array",
                description: "입력에 나온 순서대로. 하나의 행동은 하나의 항목.",
                items: {
                    type: "object",
                    properties: {
                        kind: { type: "string", enum: ["task", "event"], description: "task=내가 할 일(작성·준비·운동·연락 등), event=다른 사람과 정해진 시각의 약속·미팅·외근·행사·기념일" },
                        title: { type: "string", description: "짧은 동사형 제목 (2~40자). 예: '보고서 초안 잡기', '외근'" },
                        date: { type: "string", description: "YYYY-MM-DD (오늘 기준 절대 날짜)" },
                        time: { type: "string", description: "시작 HH:MM 24시간. 시각을 알 수 없으면 생략" },
                        end_time: { type: "string", description: "event의 끝 HH:MM. 알 수 없으면 생략" },
                        location: { type: "string", description: "장소가 나오면 (카페, 강남 등)" },
                        priority: { type: "string", enum: ["low", "normal", "high"], description: "'꼭','반드시','급하게','마감' 등이면 high" },
                        event_kind: { type: "string", enum: ["meeting", "anniversary", "task"], description: "event일 때만. meeting=미팅·약속·통화·외근, anniversary=기념일·생일, task=일정성 업무" },
                    },
                    required: ["kind", "title", "date"],
                },
            },
        },
        required: ["items"],
    },
};

interface ParsedItem {
    kind: "task" | "event";
    title: string;
    date: string;
    time?: string;
    end_time?: string;
    location?: string;
    priority?: "low" | "normal" | "high";
    event_kind?: "meeting" | "anniversary" | "task";
}

interface ParseAction {
    tool: "create_task" | "create_event";
    input: Record<string, unknown>;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toAction(it: ParsedItem, today: string): ParseAction | null {
    const title = String(it.title ?? "").trim().slice(0, 80);
    if (!title) return null;
    const date = DATE_RE.test(it.date) ? it.date : today;
    const time = it.time && TIME_RE.test(it.time) ? it.time : null;
    const end = it.end_time && TIME_RE.test(it.end_time) ? it.end_time : null;
    const location = it.location?.trim() || null;
    if (it.kind === "event") {
        return { tool: "create_event", input: { date, title, start_time: time, end_time: end, kind: it.event_kind ?? "meeting", location } };
    }
    // 할 일에는 장소 칸이 없어 제목 뒤에 붙인다
    return { tool: "create_task", input: { date, text: location ? `${title} @${location}` : title, time, priority: it.priority ?? null } };
}

export async function POST(req: Request) {
    const aiAccess = await requireAiAccess(req);
    if (isAiDenied(aiAccess)) return aiAccess;
    if (aiAccess.kind !== "member") return NextResponse.json({ error: "member_only" }, { status: 400 });

    const body = await req.json().catch(() => null) as { text?: string; today?: string } | null;
    const text = body?.text?.trim().slice(0, MAX_TEXT);
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
    // 사용자 today (브라우저 KST) 우선, 없으면 서버 KST
    const today = body?.today && DATE_RE.test(body.today) ? body.today : new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const weekday = "일월화수목금토"[new Date(`${today}T00:00:00+09:00`).getUTCDay()];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    await logAiUsage(aiAccess, "parse_input");

    const system = `당신은 기획자의 플래너 비서입니다. 사용자가 생각나는 대로 쏟아낸 글(브레인 덤프)이나 받아쓴 음성을 읽고, 플래너에 등록할 항목을 모두 뽑아 register_items에 담습니다.

오늘: ${today} (${weekday}요일), 한국 시간.

뽑는 법
- 줄글 하나에 여러 행동이 있으면 각각 항목으로 나눈다. "~하고", "~끝나면", "~가서", "그다음", 쉼표가 구분점이다.
- 순서가 시간을 알려 준다. "오후 2시 외근 끝나면 카페에서 보고서" → 외근 14:00, 보고서는 외근 뒤(시각을 모르면 time 생략하되 순서는 유지).
- 시간대 말 → 시각: 아침 08:00 · 오전 10:00 · 점심 12:00 · 오후 14:00 · 퇴근 후/저녁 19:00 · 밤 21:00. "오후 N시"(1~11) → N+12시.
- 날짜 말 → 절대 날짜: 오늘·내일·모레·이번 주 금요일·다음 주 월요일 등. 날짜가 없으면 오늘.
- 다른 사람과 정해진 시각의 일(미팅·약속·통화·외근·행사)은 event, 내가 할 일(작성·정리·준비·운동·구매·연락하기)은 task.
- 제목은 짧은 동사형으로 다듬되 사용자의 말을 바꾸지 않는다.

뽑지 않는 것 (items를 빈 배열로)
- 질문, 추천·분석·회고 요청, 인사·잡담·감정 표현만 있는 글. 의심스러우면 뽑지 않는다.`;

    let resp: Anthropic.Message;
    try {
        resp = await new Anthropic({ apiKey }).messages.create({
            model: MODEL,
            max_tokens: 1500,
            system,
            tools: [TOOL],
            tool_choice: { type: "tool", name: TOOL.name },
            messages: [{ role: "user", content: text }],
        });
    } catch (e: unknown) {
        console.error("[parse-input] AI 호출 실패", e);
        return NextResponse.json({ error: "ai_error", detail: e instanceof Error ? e.message : "ai_error" }, { status: 500 });
    }

    const block = resp.content.find((b) => b.type === "tool_use");
    const items = (block?.type === "tool_use" ? (block.input as { items?: ParsedItem[] }).items : null) ?? [];
    const actions = items.map((it) => toAction(it, today)).filter((a): a is ParseAction => a !== null).slice(0, 20);

    if (actions.length === 0) {
        return NextResponse.json({ actions: [], summary: "등록할 할 일이나 일정을 찾지 못했어요. 언제·무엇을 할지 한두 마디 더해 주세요." });
    }
    return NextResponse.json({ actions, summary: `${actions.length}개 항목으로 정리했어요. 확인하고 등록하세요.` });
}

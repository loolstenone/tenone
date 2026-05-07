// Myverse AI — 자연어 입력 파서
// 사용자가 "내일 3시 강남 미팅" 같이 입력하면 Claude Haiku tool_use 로
// task / event / note 로 분리 등록한다.
// Phase 2 — A1 자연어 입력 SSOT

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const MODEL = "claude-haiku-4-5-20251001";

// ── 사용자 식별 ─────────────────────────────────────────────────
async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const admin = createAdminClient();
    const { data: member } = await admin
        .from("members")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
    return member?.id ?? null;
}

// ── tool 정의 ──────────────────────────────────────────────────
const TOOLS: Anthropic.Tool[] = [
    {
        name: "create_task",
        description: "할 일(task)을 특정 날짜에 추가한다. 날짜·시간이 명시되지 않으면 today 사용.",
        input_schema: {
            type: "object",
            properties: {
                date: { type: "string", description: "YYYY-MM-DD 형식. 사용자가 '내일/모레/다음주 월요일' 등 자연어로 표현 시 절대 날짜로 변환." },
                text: { type: "string", description: "할 일 내용 (10~80자)." },
                time: { type: "string", description: "HH:MM 24시간 형식. 시간 명시 안 됐으면 생략.", nullable: true },
                priority: { type: "string", enum: ["low", "normal", "high"], nullable: true },
            },
            required: ["date", "text"],
        },
    },
    {
        name: "create_event",
        description: "캘린더 일정(event)을 추가한다. 미팅·기념일·행사 등 시간 단위로 발생하는 것.",
        input_schema: {
            type: "object",
            properties: {
                date: { type: "string", description: "YYYY-MM-DD" },
                title: { type: "string", description: "일정 제목" },
                start_time: { type: "string", description: "HH:MM", nullable: true },
                end_time: { type: "string", description: "HH:MM", nullable: true },
                kind: {
                    type: "string",
                    enum: ["meeting", "anniversary", "task"],
                    description: "meeting=미팅·약속·통화, anniversary=기념일·생일, task=일정성 업무",
                },
                location: { type: "string", nullable: true },
            },
            required: ["date", "title", "kind"],
        },
    },
    // create_note 도구는 의도적으로 제거됨 (2026-04-29).
    // 이유: AI 가 사용자 질문/잡담을 노트로 잘못 등록하는 false-positive 가 빈번했고,
    // daily.notes 가 Cornell JSON 형식인 경우 plain text append 가 데이터를 깨뜨렸음.
    // 노트는 사용자가 데일리 화면에서 직접 입력하도록 위임한다.
];

interface ParseAction {
    tool: "create_task" | "create_event" | "create_note";
    input: Record<string, unknown>;
}

// ── 핸들러 ─────────────────────────────────────────────────────
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as { text?: string; today?: string } | null;
    const text = body?.text?.trim();
    if (!text) {
        return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    // 사용자 today (브라우저 KST) 우선, 미전달 시 서버 KST
    const today = body?.today ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    }

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `당신은 한국어 사용자의 자연어 입력을 분석해서 — **명확한 등록 의도가 있을 때만** — 적절한 도구(create_task / create_event / create_note)를 호출하는 비서입니다.

핵심 판단 — tool 을 호출할지 말지:

【호출 O — 등록 의도 명확】
- 구체적 날짜/시간 + 사건/대상이 있는 경우: "5월 2일 14시 강남 미팅", "내일 오전 보고서 마무리"
- 명령조: "~ 추가해줘", "~ 등록해줘", "~ 잡아줘", "~ 메모해줘"
- 단일 짧은 task 표현: "치과 예약", "엄마 생신 챙기기"

【호출 X — tool 호출하지 말고 빈 응답 (또는 그냥 답변 없음)】
- 질문문: "뭐", "어떻게", "왜", "어디", "언제", "누가", "할 수 있어?", "있나?", "?" 로 끝나는 모든 문장
- 의견/추천 요청: "추천해줘", "알려줘", "도와줘", "분석해줘", "제안해줘"
- 잡담·인사·감정: "안녕", "고마워", "힘들어", "좋아"
- 회고·정리 요청: "오늘 어땠지", "회고", "정리해줘"
- 메타 질문: "뭐 등록했어?", "내가 뭘 했지", "이거 뭐야"
- 모호한 일반 텍스트: 날짜·동사·구체 대상 중 하나도 없는 경우

원칙:
1. 의심스러우면 호출하지 않는다 (빈 응답 = 일반 채팅으로 위임).
2. 한 입력에 여러 등록 항목이 있으면 각각 별도 tool_use 로 분리.
3. 날짜·시간 변환: "내일"→${today}+1, "오후 N시"→(N+12):00.
4. 분류:
   - 약속·미팅·통화 → create_event(kind=meeting)
   - 생일·기념일 → create_event(kind=anniversary)
   - "~하기·~끝내기·~준비" → create_task
   - 명시적으로 "메모" 라고 표현된 경우만 → create_note
5. **create_note 는 사용자가 명시적으로 "메모"·"노트로 적어줘" 라고 했을 때만 호출**. 질문/잡담을 노트로 만들지 않는다.

오늘: ${today}`;

    let resp: Anthropic.Message;
    try {
        resp = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1024,
            tools: TOOLS,
            // "auto" — Claude 가 등록 의도 있을 때만 tool 호출. 질문/잡담은 빈 응답.
            tool_choice: { type: "auto" },
            system: systemPrompt,
            messages: [{ role: "user", content: text }],
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "ai_error";
        return NextResponse.json({ error: "ai_error", detail: msg }, { status: 500 });
    }

    // tool_use 블록만 추출
    const actions: ParseAction[] = [];
    for (const block of resp.content) {
        if (block.type === "tool_use") {
            actions.push({
                tool: block.name as ParseAction["tool"],
                input: block.input as Record<string, unknown>,
            });
        }
    }

    if (actions.length === 0) {
        return NextResponse.json({
            actions: [],
            summary: "입력에서 추출할 항목을 찾지 못했어요. 더 구체적으로 입력해 주세요.",
        });
    }

    return NextResponse.json({
        actions,
        summary: `${actions.length}개 항목을 추출했어요. 확인 후 등록하세요.`,
    });
}

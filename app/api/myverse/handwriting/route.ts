// 플래너'스 AI 3단계 — 손글씨 → 디지털 (2026-10-14)
// POST { image: "data:image/jpeg;base64,…", today?, source?: "photo" | "pencil" }
//   종이 플래너·PAD 페이지 사진, 또는 앱 안 펜슬 손글씨를 읽어 할 일·일정·메모로 나눈다. 불렛 저널 기호를 상태로 바꾼다
//   • 할 일 · × 끝냄 · > 다음으로 미룸 · < 일정으로 옮김 · ○ 일정 · − 메모 · ★/! 중요 · 취소선 = 취소
// 응답은 생각 쏟아내기와 같은 actions 형식 + memo → 화면에서 확인 후 등록 (features/myverse/planner/ai-actions.ts)
//
// 🔒 사진은 저장하지 않는다 — 요청 본문으로 받아 Anthropic에 한 번 보내고 버린다 (Storage·DB 기록 없음). 남는 것은 사용자가 고른 글자뿐
//    사진에 다른 사람 이름·연락처가 있을 수 있음 → 공개 전 개인정보처리방침에 'AI 처리 위탁·국외 이전(Anthropic, 미국)' 반영 (CLAUDE.md §0.1)
// 유료 회원 전용 (lib/myverse/ai-access.ts)

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAiAccess, isAiDenied, logAiUsage } from "@/lib/myverse/ai-access";

export const maxDuration = 60;

// 손글씨는 글자 정확도가 중요해 Sonnet (Haiku는 구조는 맞지만 글자 오독이 많았음: 경쟁사→경청사, 택배→책배 — 2026-10-14 시험)
const MODEL = "claude-sonnet-4-6";
const MAX_BYTES = 4 * 1024 * 1024; // 브라우저가 1600px로 줄여 보낸다 — 넘으면 거절
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MEDIA = ["image/jpeg", "image/png", "image/webp"] as const;

const TOOL: Anthropic.Tool = {
    name: "read_page",
    description: "손글씨 플래너 페이지에서 읽은 내용을 담는다.",
    input_schema: {
        type: "object",
        properties: {
            page_date: { type: "string", description: "페이지에 날짜가 적혀 있으면 YYYY-MM-DD (연도가 없으면 오늘 기준 가장 가까운 해). 없으면 생략" },
            items: {
                type: "array",
                description: "줄 단위 항목, 페이지 순서대로",
                items: {
                    type: "object",
                    properties: {
                        kind: { type: "string", enum: ["task", "event", "note"], description: "• 또는 체크박스·동사형 = task, ○ 또는 시각+약속 = event, − 또는 생각·기록 = note" },
                        text: { type: "string", description: "읽은 글 그대로 (기호 빼고). 못 읽은 글자는 [?]" },
                        status: { type: "string", enum: ["todo", "done", "migrated", "scheduled", "cancelled"], description: "× 또는 체크 = done, > = migrated, < = scheduled, 취소선 = cancelled, 그 외 todo" },
                        time: { type: "string", description: "적힌 시각 HH:MM (24시간). 없으면 생략" },
                        date: { type: "string", description: "그 줄에만 다른 날짜가 적혀 있으면 YYYY-MM-DD" },
                        important: { type: "boolean", description: "★, !, 동그라미 강조, 밑줄 두 번 등" },
                    },
                    required: ["kind", "text", "status"],
                },
            },
            unreadable: { type: "boolean", description: "사진이 흐리거나 플래너가 아니라 거의 못 읽었으면 true" },
        },
        required: ["items"],
    },
};

export async function POST(req: Request) {
    const aiAccess = await requireAiAccess(req);
    if (isAiDenied(aiAccess)) return aiAccess;
    if (aiAccess.kind !== "member") return NextResponse.json({ error: "member_only" }, { status: 400 });

    const body = await req.json().catch(() => null) as { image?: string; today?: string; source?: string } | null;
    const m = body?.image?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!m) return NextResponse.json({ error: "image required" }, { status: 400 });
    const mediaType = m[1] as (typeof MEDIA)[number];
    const data = m[2];
    if (data.length * 0.75 > MAX_BYTES) return NextResponse.json({ error: "image_too_large" }, { status: 413 });
    const today = body?.today && DATE_RE.test(body.today) ? body.today : new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const pencil = body?.source === "pencil";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    await logAiUsage(aiAccess, pencil ? "pencil_read" : "handwriting_read");

    let resp: Anthropic.Message;
    try {
        resp = await new Anthropic({ apiKey }).messages.create({
            model: MODEL, max_tokens: 2000,
            system: `당신은 손글씨 플래너를 읽는 비서입니다. 오늘은 ${today}(한국)입니다.
${pencil ? "태블릿 펜슬로 쓴 손글씨 메모 이미지입니다." : "종이 플래너나 굿노트 같은 PAD 플래너 페이지 사진입니다. 인쇄된 서식(요일·칸 이름)은 내용이 아니니 읽지 않습니다."}
불렛 저널 기호: • 할 일 · × 끝냄 · > 다음으로 미룸 · < 일정으로 옮김 · ○ 일정 · − 메모 · ★ 또는 ! 중요 · 취소선은 취소.
체크박스에 체크가 있으면 끝냄. 적힌 글은 고치지 말고 그대로, 못 읽은 글자만 [?]로.`,
            tools: [TOOL], tool_choice: { type: "tool", name: TOOL.name },
            messages: [{
                role: "user",
                content: [
                    { type: "image", source: { type: "base64", media_type: mediaType, data } },
                    { type: "text", text: "이 페이지를 읽어 주세요." },
                ],
            }],
        });
    } catch (e) {
        console.error("[handwriting] AI 실패", e);
        return NextResponse.json({ error: "ai_error" }, { status: 500 });
    }
    // 사진 데이터는 여기서 끝 — 어디에도 저장하지 않는다

    const block = resp.content.find((b) => b.type === "tool_use");
    const out = (block?.type === "tool_use" ? block.input : {}) as {
        page_date?: string; unreadable?: boolean;
        items?: { kind: string; text: string; status: string; time?: string; date?: string; important?: boolean }[];
    };
    const pageDate = out.page_date && DATE_RE.test(out.page_date) ? out.page_date : today;
    const actions: { tool: "create_task" | "create_event"; input: Record<string, unknown> }[] = [];
    const memo: string[] = [];
    for (const it of out.items ?? []) {
        const text = String(it.text ?? "").trim().slice(0, 200);
        if (!text) continue;
        const date = it.date && DATE_RE.test(it.date) ? it.date : pageDate;
        const time = it.time && TIME_RE.test(it.time) ? it.time : null;
        if (it.kind === "note") { memo.push(text); continue; }
        if (it.kind === "event") {
            actions.push({ tool: "create_event", input: { date, title: text, start_time: time, end_time: null, kind: "meeting", location: null, status: it.status } });
            continue;
        }
        actions.push({
            tool: "create_task",
            input: {
                date, text, time,
                priority: it.important ? "high" : null,
                // done=끝냄으로 넣는다 · migrated/scheduled는 할 일로(오늘 다시) · cancelled는 화면에서 기본 해제
                status: it.status === "done" ? "done" : "todo",
                mark: it.status,
            },
        });
    }
    return NextResponse.json({
        page_date: pageDate,
        unreadable: !!out.unreadable,
        actions: actions.slice(0, 40),
        memo: memo.join("\n").slice(0, 4000),
        summary: out.unreadable && actions.length === 0 && memo.length === 0
            ? "잘 읽히지 않았어요. 밝은 곳에서 페이지 전체가 나오게 다시 찍어 주세요."
            : `할 일·일정 ${actions.length}개${memo.length ? `, 메모 ${memo.length}줄` : ""}을 읽었어요. 확인하고 넣으세요.`,
    });
}

// 플래너'스 AI 1단계 ③ — 아침 Top 3 · 저녁 회고 질문 (2026-10-14)
// POST { date, mode: "morning" | "evening", refresh?: boolean }
//   morning → 그날 할 일 중 오늘 꼭 끝낼 3개 + 고른 이유 + 한 줄 응원  → myverse_daily.focus
//   evening → 그날 기록(완료·못 끝낸 일·일정·기분)으로 회고 질문 3개   → myverse_daily.reflection (답은 사용자가 /api/myverse/daily로 저장)
// 이미 만든 값이 있으면 AI를 다시 부르지 않는다 (refresh=true일 때만 새로) — 유료 AI 비용 절약
// 유료 회원 전용 (lib/myverse/ai-access.ts) · 컬럼 sql/planners-ai-focus-reflection-2026-10.sql
// "관리는 비서처럼 똑똑하게, 회고는 코치처럼 따뜻하게"

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAiAccess, isAiDenied, logAiUsage } from "@/lib/myverse/ai-access";
import { noDash } from "@/lib/planners/text";

const MODEL = "claude-haiku-4-5-20251001";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface Task { id: string; text: string; status: string; time?: string | null; priority?: string | null; source_date?: string | null }

const TOP3_TOOL: Anthropic.Tool = {
    name: "pick_top3",
    description: "오늘 꼭 끝내야 할 할 일을 최대 3개 고른다.",
    input_schema: {
        type: "object",
        properties: {
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        task_id: { type: "string", description: "목록에 있는 id 그대로" },
                        reason: { type: "string", description: "고른 이유 한 문장 (30자 안팎, 존댓말)" },
                    },
                    required: ["task_id", "reason"],
                },
            },
            message: { type: "string", description: "하루를 시작하는 사람에게 건네는 한 문장 (40자 안팎, 존댓말, 과장 없이)" },
        },
        required: ["items", "message"],
    },
};

const REFLECT_TOOL: Anthropic.Tool = {
    name: "ask_reflection",
    description: "오늘을 돌아보게 하는 질문 3개를 만든다.",
    input_schema: {
        type: "object",
        properties: {
            questions: { type: "array", items: { type: "string" }, description: "질문 3개. 각 60자 이내, 존댓말" },
        },
        required: ["questions"],
    },
};

export async function POST(req: Request) {
    const aiAccess = await requireAiAccess(req);
    if (isAiDenied(aiAccess)) return aiAccess;
    if (aiAccess.kind !== "member") return NextResponse.json({ error: "member_only" }, { status: 400 });
    const memberId = aiAccess.memberId;

    const body = await req.json().catch(() => ({})) as { date?: string; mode?: string; refresh?: boolean };
    const date = body.date && DATE_RE.test(body.date) ? body.date : new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const mode = body.mode === "evening" ? "evening" : "morning";

    const admin = createAdminClient();
    const { data: row } = await admin
        .from("myverse_daily")
        .select("tasks, focus, reflection, mood_level, energy_level, satisfaction_level, daily_result")
        .eq("member_id", memberId).eq("date", date).maybeSingle();

    // 이미 만든 값 → 그대로 (AI 호출 없음)
    if (!body.refresh) {
        if (mode === "morning" && row?.focus) return NextResponse.json({ focus: row.focus, cached: true });
        if (mode === "evening" && row?.reflection) return NextResponse.json({ reflection: row.reflection, cached: true });
    }

    const tasks = ((row?.tasks as Task[]) ?? []).filter((t) => t && t.id && t.text);
    const { data: events } = await admin
        .from("myverse_calendar_entries")
        .select("title, start_time, end_time")
        .eq("member_id", memberId).eq("start_date", date)
        .order("start_time", { ascending: true });
    const eventLines = ((events ?? []) as { title: string; start_time: string | null; end_time: string | null }[])
        .map((e) => `- ${e.start_time ? e.start_time.slice(0, 5) : "종일"}${e.end_time ? `~${e.end_time.slice(0, 5)}` : ""} ${e.title}`).join("\n") || "- 없음";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    const anthropic = new Anthropic({ apiKey });
    const now = new Date().toISOString();

    if (mode === "morning") {
        const open = tasks.filter((t) => t.status === "todo" || t.status === "hold" || t.status === "doing");
        if (open.length === 0) {
            return NextResponse.json({ focus: null, empty: true, message: "오늘 할 일이 아직 없어요. 생각 쏟아내기로 먼저 적어 보세요." });
        }
        const taskLines = open.map((t) => `- id:${t.id} | ${t.text}${t.time ? ` | ${t.time}` : ""}${t.priority === "high" ? " | 중요" : ""}${t.source_date ? ` | ${t.source_date}부터 밀림` : ""}`).join("\n");
        await logAiUsage(aiAccess, "daily_top3");
        let resp: Anthropic.Message;
        try {
            resp = await anthropic.messages.create({
                model: MODEL, max_tokens: 800,
                system: `당신은 기획자의 비서입니다. 오늘(${date}) 할 일 목록에서 오늘 반드시 끝내야 할 것을 최대 3개 고릅니다.
기준: 마감·중요 표시 > 오래 밀린 일(며칠째 밀렸는지) > 다른 일의 앞 단계 > 오늘 일정과 이어지는 일. 시간이 정해진 일정 사이에 실제로 할 수 있는 양인지도 본다.
할 일이 3개보다 적으면 있는 만큼만. 목록에 없는 일을 만들지 않는다.`,
                tools: [TOP3_TOOL], tool_choice: { type: "tool", name: TOP3_TOOL.name },
                messages: [{ role: "user", content: `할 일\n${taskLines}\n\n오늘 일정\n${eventLines}` }],
            });
        } catch (e) {
            console.error("[daily-focus] top3 실패", e);
            return NextResponse.json({ error: "ai_error" }, { status: 500 });
        }
        const block = resp.content.find((b) => b.type === "tool_use");
        const out = (block?.type === "tool_use" ? block.input : {}) as { items?: { task_id: string; reason: string }[]; message?: string };
        const byId = new Map(open.map((t) => [t.id, t]));
        const items = (out.items ?? []).filter((i) => byId.has(i.task_id)).slice(0, 3)
            .map((i) => ({ task_id: i.task_id, text: byId.get(i.task_id)!.text, reason: noDash(String(i.reason ?? "")).slice(0, 120) }));
        const focus = { generated_at: now, items, message: noDash(String(out.message ?? "")).slice(0, 200) };
        await admin.from("myverse_daily").upsert(
            { member_id: memberId, date, focus, updated_at: now },
            { onConflict: "member_id,date" },
        );
        return NextResponse.json({ focus });
    }

    // evening
    const done = tasks.filter((t) => t.status === "done").map((t) => `- ${t.text}`).join("\n") || "- 없음";
    const undone = tasks.filter((t) => t.status === "todo" || t.status === "hold" || t.status === "doing").map((t) => `- ${t.text}`).join("\n") || "- 없음";
    const feel = [
        row?.mood_level != null ? `기분 ${row.mood_level}/5` : null,
        row?.energy_level != null ? `에너지 ${row.energy_level}/5` : null,
        row?.satisfaction_level != null ? `만족 ${row.satisfaction_level}/5` : null,
    ].filter(Boolean).join(", ") || "기록 없음";
    await logAiUsage(aiAccess, "daily_reflection");
    let resp: Anthropic.Message;
    try {
        resp = await anthropic.messages.create({
            model: MODEL, max_tokens: 600,
            system: `당신은 따뜻한 코치입니다. 하루를 마치는 사람에게 오늘을 돌아보게 하는 질문 3개를 건넵니다.
- 그날 실제 기록에 근거한 구체적인 질문 (예: 끝낸 일 중 하나, 못 끝낸 일이 왜 밀렸는지, 일정 하나)
- 한 개는 잘한 것·집중이 잘 된 순간, 한 개는 걸림돌, 한 개는 내일을 위한 것
- 말투는 반드시 부드러운 존댓말(~였나요?, ~일까요?). 반말 금지. 다정하고 가볍게, 평가하거나 다그치지 않는다.
- 기록이 거의 없으면 하루 전체를 묻는 일반 질문으로.`,
            tools: [REFLECT_TOOL], tool_choice: { type: "tool", name: REFLECT_TOOL.name },
            messages: [{ role: "user", content: `날짜 ${date}\n끝낸 일\n${done}\n\n못 끝낸 일\n${undone}\n\n일정\n${eventLines}\n\n상태: ${feel}` }],
        });
    } catch (e) {
        console.error("[daily-focus] reflection 실패", e);
        return NextResponse.json({ error: "ai_error" }, { status: 500 });
    }
    const block = resp.content.find((b) => b.type === "tool_use");
    const qs = ((block?.type === "tool_use" ? (block.input as { questions?: string[] }).questions : null) ?? [])
        .map((q) => noDash(String(q)).slice(0, 120)).filter(Boolean).slice(0, 3);
    // 다시 받기여도 이미 쓴 답은 보존하지 않는다 (질문이 바뀌므로) — 화면에서 확인 후 요청
    const reflection = { generated_at: now, questions: qs.map((q) => ({ q, a: "" })) };
    await admin.from("myverse_daily").upsert(
        { member_id: memberId, date, reflection, updated_at: now },
        { onConflict: "member_id,date" },
    );
    return NextResponse.json({ reflection });
}

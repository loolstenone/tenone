// 오늘 하루 AI 간략 정리 — 2~3문장
// Daily 우측 "오늘 · AI 정리" 카드용
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const date: string = body.date || new Date().toISOString().slice(0, 10);

    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
    }

    const admin = createAdminClient();

    const [daily, entries, notes, projects] = await Promise.all([
        admin.from("myverse_daily")
            .select("tasks, energy_level, satisfaction_level, mood_level, daily_result")
            .eq("member_id", memberId).eq("date", date).maybeSingle(),
        admin.from("myverse_calendar_entries")
            .select("kind, title, start_time, end_time")
            .eq("member_id", memberId).eq("start_date", date),
        admin.from("myverse_notes")
            .select("title, kind")
            .eq("member_id", memberId).eq("date", date),
        admin.from("myverse_projects")
            .select("title, myverse_project_gprs(progress)")
            .eq("member_id", memberId).eq("status", "active").limit(5),
    ]);

    const tasks = (daily.data?.tasks as Array<{ text: string; status: string }> | undefined) ?? [];
    const done = tasks.filter(t => t.status === "done").length;
    const todo = tasks.filter(t => t.status === "todo").length;

    const ctx: string[] = [`[날짜] ${date}`];
    ctx.push(`[태스크] 완료 ${done} / 남음 ${todo}`);
    if (tasks.length > 0) tasks.slice(0, 8).forEach(t => ctx.push(`  - [${t.status}] ${t.text}`));
    if (entries.data && entries.data.length > 0) {
        ctx.push(`[일정·미팅]`);
        entries.data.forEach((e: { kind: string; title: string; start_time: string | null }) =>
            ctx.push(`  - [${e.kind}] ${e.title}${e.start_time ? ` (${e.start_time.slice(0,5)})` : ""}`));
    }
    if (notes.data && notes.data.length > 0) ctx.push(`[노트] ${notes.data.length}건 작성`);
    if (daily.data) {
        const { energy_level, satisfaction_level, mood_level, daily_result } = daily.data;
        const tr: string[] = [];
        if (energy_level) tr.push(`에너지 ${energy_level}/5`);
        if (satisfaction_level) tr.push(`만족 ${satisfaction_level}/5`);
        if (mood_level) tr.push(`기분 ${mood_level}/5`);
        if (tr.length > 0) ctx.push(`[트래킹] ${tr.join(", ")}`);
        if (daily_result) ctx.push(`[오늘 한 줄] ${daily_result}`);
    }
    if (projects.data && projects.data.length > 0) {
        ctx.push(`[진행 중 프로젝트]`);
        projects.data.forEach((p: { title: string; myverse_project_gprs: Array<{ progress: number }> | { progress: number } | null }) => {
            const prog = Array.isArray(p.myverse_project_gprs)
                ? p.myverse_project_gprs[0]?.progress ?? 0
                : p.myverse_project_gprs?.progress ?? 0;
            ctx.push(`  - ${p.title}: ${prog}%`);
        });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    try {
        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 300,
            temperature: 0.4,
            system: `당신은 Planner's Planner AI의 간략 정리 비서입니다.
오늘 하루를 2~3문장으로 매우 간결하게 정리합니다.
- 한국어, 따뜻하고 친근한 어투
- 100~180자 이내 (꼭 지킬 것)
- 무엇을 했는지·무엇이 남았는지·한 마디 격려/질문 한 줄
- 이모지 금지, 마크다운 헤더 금지, 줄바꿈 1~2회만`,
            messages: [{ role: "user", content: ctx.join("\n") }],
        });

        const text = msg.content
            .filter(b => b.type === "text")
            .map(b => (b.type === "text" ? b.text : ""))
            .join("\n")
            .trim();

        return NextResponse.json({ summary: text, generated_at: new Date().toISOString() });
    } catch (e) {
        return NextResponse.json({ error: "generation_failed", message: (e as Error).message }, { status: 500 });
    }
}

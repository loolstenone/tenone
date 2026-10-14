// 플래너'스 AI 2단계 ① — 목표 자동 분해 (2026-10-14)
// POST /api/myverse/projects/{id}/breakdown { goal?: string, hoursPerDay?: number }
//   프로젝트(제목·기간·마일스톤·이미 있는 할 일)를 보고 실행 가능한 단계로 쪼개 시간(h)을 붙이고,
//   오늘(또는 시작일)부터 평일 하루 hoursPerDay(기본 3h)씩 날짜를 제안한다. 저장하지 않는다 — 사용자가 고른 것만 /projects/{id}/tasks로 넣는다
// 유료 회원 전용 (lib/myverse/ai-access.ts)

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAiAccess, isAiDenied, logAiUsage } from "@/lib/myverse/ai-access";
import { noDash } from "@/lib/planners/text";

const MODEL = "claude-haiku-4-5-20251001";

const TOOL: Anthropic.Tool = {
    name: "breakdown",
    description: "목표를 실행 가능한 단계로 쪼갠다.",
    input_schema: {
        type: "object",
        properties: {
            steps: {
                type: "array",
                description: "해야 하는 순서대로 4~12개",
                items: {
                    type: "object",
                    properties: {
                        text: { type: "string", description: "동사로 끝나는 구체적 행동 (예: '경쟁사 3곳 캠페인 사례 조사'). 40자 이내" },
                        hours: { type: "number", description: "예상 시간(시간 단위, 0.5 간격, 0.5~6)" },
                        milestone: { type: "string", description: "주어진 마일스톤 중 속하는 것의 제목 그대로. 없으면 생략" },
                    },
                    required: ["text", "hours"],
                },
            },
            note: { type: "string", description: "쪼갠 방식에 대한 한 문장 설명 (존댓말, 60자 이내)" },
        },
        required: ["steps"],
    },
};

const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
function addDays(d: string, n: number): string {
    const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10);
}
function nextWorkday(d: string): string {
    let x = d;
    while ([0, 6].includes(new Date(`${x}T00:00:00Z`).getUTCDay())) x = addDays(x, 1);
    return x;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const aiAccess = await requireAiAccess(req);
    if (isAiDenied(aiAccess)) return aiAccess;
    if (aiAccess.kind !== "member") return NextResponse.json({ error: "member_only" }, { status: 400 });
    const memberId = aiAccess.memberId;
    const { id: projectId } = await params;

    const admin = createAdminClient();
    const { data: project } = await admin
        .from("myverse_projects")
        .select("id, title, start_date, end_date, category, custom_fields")
        .eq("id", projectId).eq("member_id", memberId).maybeSingle();
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const body = await req.json().catch(() => ({})) as { goal?: string; hoursPerDay?: number };
    const goal = (body.goal ?? "").trim().slice(0, 500);
    const perDay = Math.min(Math.max(Number(body.hoursPerDay) || 3, 1), 8);

    const [{ data: milestones }, { data: dailyRows }] = await Promise.all([
        admin.from("myverse_project_milestones").select("title, due_date, done_at").eq("project_id", projectId).order("order_index"),
        admin.from("myverse_daily").select("tasks").eq("member_id", memberId).contains("tasks", [{ project_id: projectId }]),
    ]);
    const existing = (dailyRows ?? []).flatMap((r) => ((r.tasks as { text: string; project_id?: string; status: string }[]) ?? []))
        .filter((t) => t.project_id === projectId).map((t) => `- ${t.text}${t.status === "done" ? " (완료)" : ""}`).slice(0, 40);
    const msLines = ((milestones ?? []) as { title: string; due_date: string | null; done_at: string | null }[])
        .map((m) => `- ${m.title}${m.due_date ? ` (마감 ${m.due_date})` : ""}${m.done_at ? " (완료)" : ""}`).join("\n") || "- 없음";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    await logAiUsage(aiAccess, "project_breakdown");

    let resp: Anthropic.Message;
    try {
        resp = await new Anthropic({ apiKey }).messages.create({
            model: MODEL, max_tokens: 1500,
            system: `당신은 기획자의 프로젝트 매니저입니다. 거시적 목표를 오늘 바로 시작할 수 있는 실행 단위로 쪼갭니다.
- 단계마다 하나의 결과물이 나오게 (조사·정리·초안·검토·발표 준비 등). 30분~6시간 크기.
- 이미 있는 할 일과 겹치지 않게, 완료된 것은 다시 넣지 않는다.
- 마일스톤이 있으면 그 순서를 따르고 각 단계가 어느 마일스톤에 속하는지 적는다.
- 사용자의 분야를 모르면 일반적인 기획 흐름(문제 정의 → 조사 → 분석 → 안 만들기 → 검토 → 마무리)을 따른다.`,
            tools: [TOOL], tool_choice: { type: "tool", name: TOOL.name },
            messages: [{
                role: "user",
                content: `프로젝트: ${project.title}\n기간: ${project.start_date ?? "미정"} ~ ${project.end_date ?? "미정"}\n${goal ? `이번에 쪼갤 목표: ${goal}\n` : ""}\n마일스톤\n${msLines}\n\n이미 있는 할 일\n${existing.join("\n") || "- 없음"}`,
            }],
        });
    } catch (e) {
        console.error("[project-breakdown] AI 실패", e);
        return NextResponse.json({ error: "ai_error" }, { status: 500 });
    }

    const block = resp.content.find((b) => b.type === "tool_use");
    const out = (block?.type === "tool_use" ? block.input : {}) as { steps?: { text: string; hours: number; milestone?: string }[]; note?: string };
    const steps = (out.steps ?? []).filter((s) => s.text?.trim()).slice(0, 12)
        .map((s) => ({ text: noDash(s.text).slice(0, 80), hours: Math.min(Math.max(Math.round((Number(s.hours) || 1) * 2) / 2, 0.5), 6), milestone: s.milestone ?? null }));

    // 날짜 제안: 오늘(또는 시작일 중 늦은 날)부터 평일 하루 perDay시간씩 채운다
    const today = kstToday();
    let day = nextWorkday(project.start_date && project.start_date > today ? project.start_date : today);
    let used = 0;
    const planned = steps.map((s) => {
        if (used > 0 && used + s.hours > perDay) { day = nextWorkday(addDays(day, 1)); used = 0; }
        used += s.hours;
        return { ...s, date: day };
    });
    const lastDate = planned.at(-1)?.date ?? null;
    const overEnd = !!(project.end_date && lastDate && lastDate > project.end_date);

    return NextResponse.json({
        steps: planned,
        note: noDash(String(out.note ?? "")).slice(0, 200),
        total_hours: planned.reduce((a, s) => a + s.hours, 0),
        hours_per_day: perDay,
        over_end_date: overEnd,
        end_date: project.end_date ?? null,
    });
}

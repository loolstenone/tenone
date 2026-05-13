// 루틴 운동 기록 텍스트 기반 AI 분석
// activity + composition + note + 시간 텍스트로 kcal·강도(level)·심박수 추정 후 routine에 PATCH

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseDurationMin(start: string | null, end: string | null): number | null {
    if (!start || !end) return null;
    // "HH:MM" or "HH:MM:SS"
    const toMin = (t: string) => {
        const parts = t.split(":").map(Number);
        return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
    };
    const diff = toMin(end) - toMin(start);
    return diff > 0 && diff <= 480 ? diff : null;
}

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();

    const { data: routine, error: fetchErr } = await admin
        .from("myverse_daily_routines")
        .select("id, activity, composition, note, start_time, end_time, kcal, level, heart_rate")
        .eq("id", id)
        .eq("member_id", memberId)
        .single();

    if (fetchErr || !routine) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const durationMin = parseDurationMin(routine.start_time, routine.end_time);

    const contextLines: string[] = [];
    if (routine.activity) contextLines.push(`활동명: ${routine.activity}`);
    if (durationMin) contextLines.push(`운동 시간: ${durationMin}분`);
    if (routine.composition) contextLines.push(`구성: ${routine.composition}`);
    if (routine.note) contextLines.push(`메모: ${routine.note}`);

    if (contextLines.length === 0) {
        return NextResponse.json({ error: "no_text_context" }, { status: 400 });
    }

    const prompt = `아래 운동 기록 텍스트를 보고 분석해줘.

${contextLines.join("\n")}

반드시 아래 JSON 형식으로만 답해. 다른 텍스트 없이 JSON만.

{
  "kcal": 소모 칼로리(정수, 추정 불가면 null),
  "level": 운동 강도 1~5 정수(1=매우 가벼움/스트레칭, 2=가벼움/걷기, 3=중간/조깅, 4=격렬/HIIT, 5=최고강도/웨이트 맥스, 추정 불가면 null),
  "heart_rate": 평균 심박수 BPM 정수(추정 불가면 null),
  "summary": "한 줄 요약(한국어, 예: 벤치프레스 5세트 + 스쿼트 3세트)"
}

규칙:
- kcal: 운동 시간 × 강도 기반 추정 (시간 없으면 30분 기준)
- level: 운동 종류/강도 키워드로 판단 (걷기=1-2, 조깅=3, 격렬=4, 최고=5)
- heart_rate: level 기반 평균 추정 (1=90, 2=105, 3=130, 4=155, 5=175 기준)
- summary: 30자 이내, 핵심 내용 요약`;

    let text = "";
    try {
        const msg = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 256,
            messages: [{ role: "user", content: prompt }],
        });
        text = (msg.content[0] as { text: string }).text;
    } catch (e) {
        console.error("routine analyze-exercise AI error:", e);
        return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    let parsed: { kcal: number | null; level: number | null; heart_rate: number | null; summary: string };
    try {
        const match = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match?.[0] ?? text);
    } catch {
        return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    const safeInt = (v: unknown, min: number, max: number): number | null => {
        const n = Math.round(Number(v));
        return Number.isFinite(n) && n >= min && n <= max ? n : null;
    };

    const kcal = safeInt(parsed.kcal, 1, 5000);
    const level = safeInt(parsed.level, 1, 5);
    const heart_rate = safeInt(parsed.heart_rate, 40, 220);
    const summary = typeof parsed.summary === "string" ? parsed.summary.slice(0, 60) : null;

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (kcal != null) patch.kcal = kcal;
    if (level != null) patch.level = level;
    if (heart_rate != null) patch.heart_rate = heart_rate;
    if (summary) patch.composition = summary;

    const { data: updated, error: patchErr } = await admin
        .from("myverse_daily_routines")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (patchErr) return NextResponse.json({ error: patchErr.message }, { status: 500 });

    return NextResponse.json({ routine: updated, kcal, level, heart_rate, summary });
}

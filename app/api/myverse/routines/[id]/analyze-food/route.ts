// 루틴 식사 기록 텍스트 기반 AI 분석
// activity + composition + note 텍스트로 칼로리·구성 추정 후 routine에 PATCH

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();

    // 루틴 조회 — member_id 검증 포함
    const { data: routine, error: fetchErr } = await admin
        .from("myverse_daily_routines")
        .select("id, activity, composition, note, kcal")
        .eq("id", id)
        .eq("member_id", memberId)
        .single();

    if (fetchErr || !routine) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // 텍스트 컨텍스트 구성
    const contextLines: string[] = [];
    if (routine.activity) contextLines.push(`활동명: ${routine.activity}`);
    if (routine.composition) contextLines.push(`구성: ${routine.composition}`);
    if (routine.note) contextLines.push(`메모: ${routine.note}`);

    if (contextLines.length === 0) {
        return NextResponse.json({ error: "no_text_context" }, { status: 400 });
    }

    const prompt = `아래 식사 기록 텍스트를 보고 영양 정보를 추정해줘.

${contextLines.join("\n")}

반드시 아래 JSON 형식으로만 답해. 다른 텍스트 없이 JSON만.

{
  "calories": 총칼로리(정수, kcal),
  "summary": "한 줄 요약(한국어, 예: 닭가슴살 + 현미밥 + 샐러드)"
}

규칙:
- calories: 식사 전체 칼로리 합계 정수 (추정 불가면 null)
- summary: 25자 이내로 핵심 식재료/메뉴 요약 (정보 부족이면 활동명 그대로 사용)`;

    let text = "";
    try {
        const msg = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 256,
            messages: [{ role: "user", content: prompt }],
        });
        text = (msg.content[0] as { text: string }).text;
    } catch (e) {
        console.error("routine analyze-food AI error:", e);
        return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    let parsed: { calories: number | null; summary: string };
    try {
        const match = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match?.[0] ?? text);
    } catch {
        return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    const kcal = Number.isFinite(Number(parsed.calories)) && parsed.calories != null
        ? Math.round(Number(parsed.calories))
        : null;
    const summary = typeof parsed.summary === "string" ? parsed.summary.slice(0, 60) : null;

    // PATCH — 이미 kcal이 있으면 덮어쓰지 않음 (명시적 분석 결과 우선)
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (kcal != null) patch.kcal = kcal;
    if (summary) patch.composition = summary;

    const { data: updated, error: patchErr } = await admin
        .from("myverse_daily_routines")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (patchErr) return NextResponse.json({ error: patchErr.message }, { status: 500 });

    return NextResponse.json({ routine: updated, kcal, summary });
}

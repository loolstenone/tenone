/**
 * POST /api/hero/matching/[id]/curate
 *
 * 매칭 1건에 대해 AI 큐레이션 생성.
 * - hit_ai_prompts에서 'tetrad_match_v1' 불러옴
 * - TIH + JD + HIT(A/B) + JH 데이터 수집
 * - Claude API 호출 → for_company / for_talent / signal_notes
 * - hero_matches.ai_match_report 저장 + status='curated' 로 전이 (proposed인 경우)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: matchId } = await ctx.params;
        const sb = createAdminClient();

        // 1. 매칭 + 관련 데이터 로드
        const { data: match, error: matchErr } = await sb
            .from("hero_matches")
            .select("*, hero_companies(company_name, industry)")
            .eq("id", matchId)
            .maybeSingle();

        if (matchErr || !match) {
            return NextResponse.json({ error: "match not found" }, { status: 404 });
        }

        const [tihRes, jhRes, jdRes, hitARes, hitBRes, promptRes] = await Promise.all([
            match.tih_response_id
                ? sb.from("hero_tih_responses").select("*").eq("id", match.tih_response_id).maybeSingle()
                : Promise.resolve({ data: null }),
            match.jh_response_id
                ? sb.from("hero_jh_responses").select("*").eq("id", match.jh_response_id).maybeSingle()
                : Promise.resolve({ data: null }),
            match.jd_id
                ? sb.from("hero_jd").select("*").eq("id", match.jd_id).maybeSingle()
                : Promise.resolve({ data: null }),
            sb.from("hero_profiles").select("hit_a_result_id").eq("member_id", match.profile_member_id).maybeSingle()
                .then(async p => {
                    if (!p.data?.hit_a_result_id) return { data: null };
                    return sb.from("hit_a_results").select("type_code, type_name_ko, type_nickname, mbti_type, disc_primary").eq("id", p.data.hit_a_result_id).maybeSingle();
                }),
            sb.from("hero_profiles").select("hit_b_result_id").eq("member_id", match.profile_member_id).maybeSingle()
                .then(async p => {
                    if (!p.data?.hit_b_result_id) return { data: null };
                    return sb.from("hit_b_results").select("holland_code, readiness_grade, competency_track").eq("id", p.data.hit_b_result_id).maybeSingle();
                }),
            sb.from("hit_ai_prompts").select("*").eq("id", "tetrad_match_v1").maybeSingle(),
        ]);

        if (!promptRes.data) {
            return NextResponse.json({ error: "tetrad_match_v1 prompt not found" }, { status: 500 });
        }

        // 2. 템플릿 치환
        const prompt = promptRes.data;
        const userMessage = (prompt.user_template as string)
            .replace("{{TIH_JSON}}", JSON.stringify(tihRes.data ?? {}, null, 2))
            .replace("{{JD_JSON}}", JSON.stringify(jdRes.data ?? {}, null, 2))
            .replace("{{HIT_JSON}}", JSON.stringify({ hit_a: hitARes.data, hit_b: hitBRes.data }, null, 2))
            .replace("{{JH_JSON}}", JSON.stringify(jhRes.data ?? {}, null, 2))
            .replace("{{SCORE_JSON}}", JSON.stringify(match.match_score_breakdown ?? {}, null, 2))
            .replace("{{RISK_JSON}}", JSON.stringify(match.risk_notes ?? [], null, 2));

        // 3. Claude API 호출
        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 500 });
        }

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await client.messages.create({
            model: (prompt.model as string) || "claude-sonnet-4-20250514",
            max_tokens: (prompt.max_tokens as number) || 2500,
            system: prompt.system_prompt as string,
            messages: [{ role: "user", content: userMessage }],
        });

        const text = response.content
            .filter(b => b.type === "text")
            .map(b => (b as { text: string }).text)
            .join("\n");

        // 4. JSON 파싱 (관대한 처리)
        let curation: { for_company?: string; for_talent?: string; signal_notes?: string[] } = {};
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) curation = JSON.parse(jsonMatch[0]);
        } catch {
            curation = { for_company: text };
        }

        // 5. 저장 + status 전이 (proposed → curated)
        const newStatus = match.match_status === "proposed" ? "curated" : match.match_status;
        const reportJson = JSON.stringify(curation);

        const { error: updErr } = await sb
            .from("hero_matches")
            .update({
                ai_match_report: reportJson,
                match_status: newStatus,
            })
            .eq("id", matchId);

        if (updErr) {
            return NextResponse.json({ error: updErr.message }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            matchId,
            status: newStatus,
            curation,
            tokens_used: response.usage,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        console.error("[hero/matching/curate]", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

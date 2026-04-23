/**
 * GET /api/hero/jobs/feed?memberId=xxx&limit=10
 *
 * 사용자의 HIT · JH · hero_profiles 기반으로 매칭된 JD 피드 반환.
 * MVP 로직 (AI 없이 단순 스코어링):
 *   1) hero_jd WHERE status='published'
 *   2) 각 JD에 대해 매칭 점수 계산:
 *      - JH preferred_state × JD derived_vector.axis_summary (±20)
 *      - JH preferred_industries ∩ hero_companies.industry (±30)
 *      - 최신 JD bonus (± days_since_published decay)
 *   3) 상위 N개 + "왜 맞는가" 서술 3문장 생성
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface JHAxes {
    preferred_state?: "a" | "b" | "c" | "d";
    preferred_industries?: string[];
    avoid_traits?: string[];
    work_style?: string;
    [key: string]: unknown;
}

interface JDDerivedVector {
    axis_summary?: string;
    competencies?: string[];
    experience_tier?: string;
    has_compensation?: boolean;
    has_culture_point?: boolean;
    problem_count?: number;
    [key: string]: unknown;
}

interface JDRow {
    id: string;
    position_title: string | null;
    summary: string | null;
    company_id: string;
    employment_type: string | null;
    experience_range: string | null;
    derived_vector: JDDerivedVector | null;
    published_at: string | null;
    hero_companies?: { company_name?: string | null; industry?: string | null; company_size?: string | null } | null;
}

function axisAlignmentScore(jhState?: string, jdAxisSummary?: string): number {
    if (!jhState || !jdAxisSummary) return 0;
    // jhState: a=guardian, b=pioneer, c=connector, d=balanced
    // jdAxisSummary는 자유 텍스트라 키워드 검색
    const s = jdAxisSummary.toLowerCase();
    if (jhState === "a" && (s.includes("안정") || s.includes("체계") || s.includes("신뢰"))) return 20;
    if (jhState === "b" && (s.includes("도전") || s.includes("개척") || s.includes("성장"))) return 20;
    if (jhState === "c" && (s.includes("관계") || s.includes("협업") || s.includes("연결"))) return 20;
    if (jhState === "d") return 10; // balanced 중립
    return 0;
}

function industryOverlap(jhIndustries?: string[], companyIndustry?: string | null): number {
    if (!jhIndustries || !jhIndustries.length || !companyIndustry) return 0;
    return jhIndustries.includes(companyIndustry) ? 30 : 0;
}

function recencyBonus(publishedAt?: string | null): number {
    if (!publishedAt) return 0;
    const days = (Date.now() - new Date(publishedAt).getTime()) / 86400000;
    if (days < 3) return 10;
    if (days < 7) return 7;
    if (days < 14) return 5;
    if (days < 30) return 2;
    return 0;
}

function matchReason(jhAxes: JHAxes, jd: JDRow): string[] {
    const reasons: string[] = [];
    const companyIndustry = jd.hero_companies?.industry;
    if (companyIndustry && jhAxes.preferred_industries?.includes(companyIndustry)) {
        reasons.push(`관심 산업(${companyIndustry})의 자리예요`);
    }
    const axis = jd.derived_vector?.axis_summary?.toLowerCase() ?? "";
    if (jhAxes.preferred_state === "a" && axis.includes("안정")) {
        reasons.push("당신이 선호하는 안정·체계적 환경과 결이 맞아요");
    } else if (jhAxes.preferred_state === "b" && (axis.includes("도전") || axis.includes("개척"))) {
        reasons.push("당신이 원하는 도전·개척 환경에 가까워요");
    } else if (jhAxes.preferred_state === "c" && (axis.includes("관계") || axis.includes("협업"))) {
        reasons.push("당신의 협업 지향 스타일에 부합해요");
    }
    if (jd.derived_vector?.has_compensation) {
        reasons.push("JD에 처우 조건이 공개되어 있어요");
    }
    if (jd.derived_vector?.has_culture_point) {
        reasons.push("기업 문화 포인트가 JD에 서술되어 있어요");
    }
    if (reasons.length === 0) {
        reasons.push("업계·직무 태그가 겹치지는 않지만, 한 번 살펴볼 만해요");
    }
    return reasons.slice(0, 3);
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get("memberId");
        const limit = Math.min(20, Math.max(1, +(searchParams.get("limit") ?? "8")));

        if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

        const sb = createAdminClient();

        // JH 가져오기
        const { data: jh } = await sb
            .from("hero_jh_responses")
            .select("derived_axes, responses")
            .eq("member_id", memberId)
            .eq("status", "active")
            .maybeSingle();

        const jhAxes: JHAxes = (jh?.derived_axes as JHAxes) ?? {};
        const responses = (jh?.responses as Record<string, unknown>) ?? {};
        // preferred_industries는 JH 응답 내에서 찾아봄 (관용)
        const prefIndustries = (responses.preferred_industries as string[]) ?? (responses.industries as string[]) ?? [];
        jhAxes.preferred_industries = prefIndustries;

        // published JD 리스트 + 회사 조인
        const { data: jdList, error } = await sb
            .from("hero_jd")
            .select("id, position_title, summary, company_id, employment_type, experience_range, derived_vector, published_at, hero_companies!inner(company_name, industry, company_size)")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(50);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const scored = (jdList as unknown as JDRow[] ?? []).map((jd) => {
            const score =
                axisAlignmentScore(jhAxes.preferred_state, jd.derived_vector?.axis_summary) +
                industryOverlap(jhAxes.preferred_industries, jd.hero_companies?.industry) +
                recencyBonus(jd.published_at);
            return { jd, score, reasons: matchReason(jhAxes, jd) };
        });

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, limit);

        return NextResponse.json({
            hasJH: !!jh,
            total: jdList?.length ?? 0,
            items: top.map((s) => ({
                id: s.jd.id,
                title: s.jd.position_title,
                summary: s.jd.summary,
                companyName: s.jd.hero_companies?.company_name,
                companyIndustry: s.jd.hero_companies?.industry,
                companySize: s.jd.hero_companies?.company_size,
                employmentType: s.jd.employment_type,
                experienceRange: s.jd.experience_range,
                publishedAt: s.jd.published_at,
                // 점수는 비공개 · 서술만 공개 (Tetrad 원칙)
                reasons: s.reasons,
            })),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

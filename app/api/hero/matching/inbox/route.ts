/**
 * GET /api/hero/matching/inbox?side=talent&memberId=xxx
 *
 * 인재 본인 몫 매칭만 받는 인박스.
 *   - 본인의 profile_member_id 기반 조회
 *   - curated/contacted 상태만 (proposed는 비공개)
 *   - for_talent 서술 + signal_notes만 노출 · 점수·벡터 숨김
 *
 * side=company는 410 (2026-10-13) — 개인 HIT 결과는 본인만, 기업에 HIT 기반 추천을 보여 주지 않는다
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember, assertSelf } from "@/lib/api-guard";

interface AiReport {
    for_company?: string;
    for_talent?: string;
    signal_notes?: string[];
}

function parseReport(raw: string | null): AiReport | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AiReport;
    } catch {
        return { for_company: raw };
    }
}

export async function GET(req: NextRequest) {
    try {
        const side = req.nextUrl.searchParams.get("side");
        const memberId = req.nextUrl.searchParams.get("memberId");

        if (!side || !memberId) {
            return NextResponse.json({ error: "side and memberId required" }, { status: 400 });
        }

        // 본인 매칭만 (직원 허용) — memberId 쿼리를 그대로 믿지 않는다 (점검 축3 H-1)
        const auth = await requireMember(req);
        if (auth instanceof NextResponse) return auth;
        const denied = assertSelf(auth, memberId);
        if (denied) return denied;

        const sb = createAdminClient();

        if (side === "talent") {
            const { data, error } = await sb
                .from("hero_matches")
                .select("id, match_status, status_changed_at, created_at, ai_match_report, trial_start, trial_end, trial_result, hero_companies(company_name, industry)")
                .eq("profile_member_id", memberId)
                .in("match_status", ["curated", "contacted", "interviewing", "trial", "hired", "declined", "withdrawn"])
                .order("updated_at", { ascending: false });

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });

            const items = (data ?? []).map(m => {
                const report = parseReport(m.ai_match_report as string | null);
                return {
                    id: m.id,
                    status: m.match_status,
                    statusChangedAt: m.status_changed_at,
                    createdAt: m.created_at,
                    companyName: (m.hero_companies as unknown as { company_name: string } | null)?.company_name ?? null,
                    industry: (m.hero_companies as unknown as { industry: string | null } | null)?.industry ?? null,
                    curation: report?.for_talent ?? null,
                    signalNotes: report?.signal_notes ?? [],
                    trialStart: m.trial_start,
                    trialEnd: m.trial_end,
                    trialResult: m.trial_result,
                };
            });

            return NextResponse.json({ items });
        }

        // 기업 쪽 매칭 인박스는 닫았다 (2026-10-13) — 매칭 추천은 인재의 HIT 결과로 만들어지므로 기업에 보이지 않는다.
        // 기업은 써치 라이트(/hero/search-light/people)에서 '원하는 성향의 사람이 어느 정도 있나'만 본다
        if (side === "company") {
            return NextResponse.json({ error: "기업용 매칭 인박스는 운영하지 않습니다." }, { status: 410 });
        }

        return NextResponse.json({ error: "invalid side" }, { status: 400 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

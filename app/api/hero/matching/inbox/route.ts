/**
 * GET /api/hero/matching/inbox?side=talent&memberId=xxx
 * GET /api/hero/matching/inbox?side=company&memberId=xxx&companyId=yyy
 *
 * 사용자 측(기업/인재)이 자기 몫 매칭만 받는 인박스.
 *
 * 인재 측:
 *   - 본인의 profile_member_id 기반 조회
 *   - curated/contacted 상태만 (proposed는 비공개)
 *   - for_talent 서술 + signal_notes만 노출 · 점수·벡터 숨김
 *
 * 기업 측:
 *   - 담당자가 active 상태인 기업의 매칭만
 *   - proposed 포함 (기업은 후보 제안도 볼 수 있음)
 *   - for_company 서술 + signal_notes만 노출 · 인재 PII 최소화 (익명 ID)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
        const companyId = req.nextUrl.searchParams.get("companyId");

        if (!side || !memberId) {
            return NextResponse.json({ error: "side and memberId required" }, { status: 400 });
        }

        const sb = createAdminClient();

        if (side === "talent") {
            const { data, error } = await sb
                .from("hero_matches")
                .select("id, match_status, status_changed_at, created_at, ai_match_report, hero_companies(company_name, industry)")
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
                    companyName: (m.hero_companies as { company_name: string } | null)?.company_name ?? null,
                    industry: (m.hero_companies as { industry: string | null } | null)?.industry ?? null,
                    curation: report?.for_talent ?? null,
                    signalNotes: report?.signal_notes ?? [],
                };
            });

            return NextResponse.json({ items });
        }

        if (side === "company") {
            if (!companyId) {
                return NextResponse.json({ error: "companyId required for company side" }, { status: 400 });
            }

            // 권한 검증: active 담당자인지
            const { data: membership } = await sb
                .from("hero_company_members")
                .select("id, role")
                .eq("member_id", memberId)
                .eq("company_id", companyId)
                .eq("status", "active")
                .maybeSingle();

            if (!membership) {
                return NextResponse.json({ error: "forbidden" }, { status: 403 });
            }

            const { data, error } = await sb
                .from("hero_matches")
                .select("id, profile_member_id, match_status, status_changed_at, created_at, ai_match_report")
                .eq("company_id", companyId)
                .order("updated_at", { ascending: false });

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });

            const items = (data ?? []).map(m => {
                const report = parseReport(m.ai_match_report as string | null);
                return {
                    id: m.id,
                    status: m.match_status,
                    statusChangedAt: m.status_changed_at,
                    createdAt: m.created_at,
                    // 인재 익명 ID (UUID 앞 8자)
                    talentAnonymousId: (m.profile_member_id as string | null)?.slice(0, 8) ?? "unknown",
                    curation: report?.for_company ?? null,
                    signalNotes: report?.signal_notes ?? [],
                };
            });

            return NextResponse.json({ items });
        }

        return NextResponse.json({ error: "invalid side" }, { status: 400 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

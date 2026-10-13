/**
 * HeRo 인재 제안 — 서버 전용 (service_role). 상수·문안은 lib/hero/offers.ts
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OfferCriteria } from "@/lib/hero/offers";

/** 제안 발송 스위치 — 유료직업소개사업 등록·통신판매업 신고 후 Vercel env HERO_OFFERS_LIVE=true */
export function offersLive(): boolean {
    return process.env.HERO_OFFERS_LIVE === "true";
}

/** 회원이 그 기업의 활성 담당자인가 (직원은 통과) */
export async function companyAccess(
    sb: SupabaseClient, memberId: string, companyId: string, isStaff: boolean,
): Promise<{ companyName: string } | null> {
    const { data: company } = await sb.from("hero_companies").select("company_name").eq("id", companyId).maybeSingle();
    if (!company) return null;
    if (isStaff) return { companyName: company.company_name as string };
    const { data } = await sb.from("hero_company_members").select("id")
        .eq("company_id", companyId).eq("member_id", memberId).eq("status", "active").maybeSingle();
    return data ? { companyName: company.company_name as string } : null;
}

/** 조건 맞는 인재 member_id (제안 받기 켠 사람만, 해당 기업 소속 제외) */
export async function candidateIds(criteria: OfferCriteria, companyId: string | null, sb = createAdminClient()): Promise<string[]> {
    if (criteria.job_functions.length === 0) return [];
    const { data, error } = await sb.rpc("hero_offer_candidates", { _criteria: criteria, _exclude_company: companyId });
    if (error) {
        console.error("[hero/offers] candidates", error.message);
        throw new Error("인원을 세지 못했습니다");
    }
    return ((data ?? []) as { member_id: string }[]).map(r => r.member_id);
}

export const todayPlusDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
};

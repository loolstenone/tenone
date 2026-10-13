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

/** 기업 화면에 보여 줄 HIT 요약 — 성장 배경(UF)·세부 점수는 넣지 않는다 */
export async function hitSummary(sb: SupabaseClient, memberId: string) {
    const { data: r } = await sb.from("hit_a_results")
        .select("type_code, type_name_ko, mbti_type, disc_primary, ap_top3_code, created_at")
        .eq("member_id", memberId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!r) return null;
    const { data: t } = await sb.from("hit_hero_types").select("character_name, character_label, strengths")
        .eq("type_code", r.type_code).maybeSingle();
    return {
        typeCode: r.type_code as string | null,
        typeName: (t?.character_label as string | null) ?? (r.type_name_ko as string | null),
        characterName: (t?.character_name as string | null) ?? null,
        strengths: Array.isArray(t?.strengths) ? (t!.strengths as unknown[]).slice(0, 3).map(s => (typeof s === "string" ? s : (s as { title?: string })?.title ?? "")).filter(Boolean) : [],
        interest: r.ap_top3_code as string | null,
        testedAt: r.created_at as string,
    };
}

export const todayPlusDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
};

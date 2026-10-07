/**
 * 코어 프로그램 모듈 — 참가 동의 (서버 전용)
 * 프로그램 참가 = 주인 브랜드(round.brand_id) 서비스 이용 → member_brand_joins에 동의 버전과 함께 기록 (헌법 원칙 1 · 데이터 계약 4조)
 * 창구가 다른 사이트여도(예: MADLeague 화면의 RooK 프로젝트) 동의는 주인 브랜드 기준.
 * 개인정보보호법 제15조 — 목적·항목·보관기간 고지 후 동의. 문구가 바뀌면 PROGRAM_CONSENT_VERSION을 올린다.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { PROGRAM_CONSENT_VERSION } from "@/lib/programs/consent-text";

/** 주인 브랜드 참가 동의를 했는가 (탈퇴하지 않은 가입 + 동의 버전 기록) */
export async function hasProgramConsent(memberId: string, brand: string): Promise<boolean> {
    const { data } = await createAdminClient().from("member_brand_joins")
        .select("terms_version").eq("member_id", memberId).eq("brand_id", brand)
        .is("withdrawn_at", null).maybeSingle();
    return !!data?.terms_version;
}

/** 동의 기록 — 가입이 없으면 만들고, 있으면(자동 가입·재가입) 동의 버전을 채운다 */
export async function recordProgramConsent(memberId: string, brand: string): Promise<{ error?: string }> {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    const consent = { terms_version: PROGRAM_CONSENT_VERSION, terms_agreed_at: now, status: "active", withdrawn_at: null };
    const { data: row } = await admin.from("member_brand_joins").select("member_id")
        .eq("member_id", memberId).eq("brand_id", brand).maybeSingle();
    // 기존 가입 경로(origin)는 보존
    const { error } = row
        ? await admin.from("member_brand_joins").update(consent).eq("member_id", memberId).eq("brand_id", brand)
        : await admin.from("member_brand_joins").insert({ member_id: memberId, brand_id: brand, origin: "program", ...consent });
    return error ? { error: error.message } : {};
}

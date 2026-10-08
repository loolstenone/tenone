/**
 * 브랜드 첫 진입 동의 (서버 전용) — 헌법 원칙 1 · 데이터 계약 4조
 *
 * One ID로 로그인한 회원이 어떤 브랜드를 처음 쓸 때, 그 브랜드 이용 동의를 member_brand_joins에 버전과 함께 기록한다.
 * (SSO로 다른 브랜드에서 넘어온 회원도 여기서 1회 동의 — 계정은 하나, 서비스는 독립)
 *
 * 이미 동의한 것으로 보는 경우 (활성 행 = status active · withdrawn_at null):
 *   - terms_version 있음 (첫 진입 동의 · 프로그램 참가 동의)
 *   - origin signup  — 이 브랜드 사이트에서 가입하며 통합 약관에 동의 (members.consent.origin_site)
 *   - origin admin · application — 운영자 등록 · 승인 멤버십
 * 문구가 바뀌면 BRAND_ENTRY_CONSENT_VERSION을 올린다 (기존 동의자는 다시 묻지 않음 — 중요 변경이면 별도 재동의 설계)
 */
import { createAdminClient } from "@/lib/supabase/admin";

export const BRAND_ENTRY_CONSENT_VERSION = "brand-entry-2026-10-08";

/** 동의 게이트 대상이 아닌 사이트 (내부 서비스 — member_roles로 관리, §1.3.1) */
const INTERNAL_SITES = new Set(["tenone", "wiki", "dokdae"]);

const CONSENTED_ORIGINS = new Set(["signup", "admin", "application"]);

/** siteId(site-config) → ums_sites.slug. 내부 사이트·미등록이면 null */
export async function resolveBrandSlug(siteId: string): Promise<string | null> {
    if (!siteId || INTERNAL_SITES.has(siteId)) return null;
    // site-config 'ogamja' ↔ ums_sites '0gamja' 표기 불일치 (점검 축2 H-7 — 통일 전까지 별칭)
    const key = siteId === "ogamja" ? "0gamja" : siteId;
    const { data } = await createAdminClient().rpc("resolve_site_slug", { p_origin: key });
    const slug = typeof data === "string" ? data : null;
    return slug && !INTERNAL_SITES.has(slug) ? slug : null;
}

export async function hasBrandEntryConsent(memberId: string, slug: string): Promise<boolean> {
    const { data } = await createAdminClient().from("member_brand_joins")
        .select("origin, terms_version, status, withdrawn_at")
        .eq("member_id", memberId).eq("brand_id", slug).maybeSingle();
    if (!data || data.status !== "active" || data.withdrawn_at) return false;
    return !!data.terms_version || CONSENTED_ORIGINS.has(data.origin ?? "");
}

/** 첫 진입 동의 기록 — 행이 없으면 만들고, 탈퇴했던 행이면 재가입으로 되살린다 (가입 경로 origin은 보존) */
export async function recordBrandEntryConsent(memberId: string, slug: string): Promise<{ error?: string }> {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    const consent = { terms_version: BRAND_ENTRY_CONSENT_VERSION, terms_agreed_at: now, status: "active", withdrawn_at: null };
    const { data: row } = await admin.from("member_brand_joins").select("member_id")
        .eq("member_id", memberId).eq("brand_id", slug).maybeSingle();
    const { error } = row
        ? await admin.from("member_brand_joins").update(consent).eq("member_id", memberId).eq("brand_id", slug)
        : await admin.from("member_brand_joins").insert({ member_id: memberId, brand_id: slug, origin: "first_visit", joined_at: now, ...consent });
    return error ? { error: error.message } : {};
}

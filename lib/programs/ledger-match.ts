/**
 * 수료증 관리 대장 인증서 ↔ 계정 매칭 (서버 전용, 2026-10-09)
 *   우선권 (사용자 결정): 매드리거 등록 때 낸 이름+전화번호가 대장과 맞는 계정이 주인 → linked_by 'registration'
 *   그 다음: 본인 직접 확인(이름+생년월일+대학) → linked_by 'manual'. registration은 manual 연결을 넘겨받는다
 *   전화번호 원본은 저장하지 않는다 — HMAC-SHA256(CERT_MATCH_SECRET, 이름|전화번호 숫자)만 program_certificates.match_hash
 */
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/** 대장 인증서 = cert_key `ledger:{코드}` (비고 note는 인트라에서 고칠 수 있어 구분 기준으로 쓰지 않는다) */
export const LEDGER_KEY_LIKE = "ledger:%";

/** 이름(공백 제거) + 전화번호(숫자만, +82 → 0) 해시. 시크릿이 없으면 null (매칭 끔 — fail-closed) */
export function ledgerMatchHash(name: string | null | undefined, phone: string | null | undefined): string | null {
    const secret = process.env.CERT_MATCH_SECRET;
    const n = (name ?? "").replace(/\s+/g, "");
    let p = (phone ?? "").replace(/\D/g, "");
    if (p.startsWith("82")) p = `0${p.slice(2)}`;
    if (!secret || !n || p.length < 10) return null;
    return createHmac("sha256", secret).update(`${n}|${p}`).digest("hex");
}

/**
 * 매드리거 등록 정보로 대장 인증서 자동 연결 — 비어 있거나 직접 확인(manual)으로 연결된 것만 가져온다
 * 반려된 등록은 제외. 반환 = 새로 연결한 수
 */
export async function linkLedgerByRegistration(memberId: string): Promise<number> {
    const admin = createAdminClient();
    const { data: apps } = await admin.from("mad_applications").select("name, phone")
        .eq("member_id", memberId).neq("status", "rejected");
    const hashes = [...new Set((apps ?? []).map(a => ledgerMatchHash(a.name, a.phone)).filter((h): h is string => !!h))];
    if (hashes.length === 0) return 0;

    const { data: rows } = await admin.from("program_certificates").select("id, member_id, linked_by")
        .eq("brand_id", "madleague").like("cert_key", LEDGER_KEY_LIKE).in("match_hash", hashes).is("revoked_at", null);
    const ids = (rows ?? [])
        .filter(r => r.member_id !== memberId || r.linked_by !== "registration")
        .filter(r => !r.member_id || r.linked_by === "manual" || r.member_id === memberId)
        .map(r => r.id);
    if (ids.length === 0) return 0;
    const { error } = await admin.from("program_certificates").update({ member_id: memberId, linked_by: "registration" }).in("id", ids);
    if (error) { console.error("[ledger-match] link", error); return 0; }
    return ids.length;
}

/** 이 계정이 매드리거 등록을 했는가 (반려 제외) */
export async function hasMadRegistration(memberId: string): Promise<boolean> {
    const { count } = await createAdminClient().from("mad_applications").select("id", { count: "exact", head: true })
        .eq("member_id", memberId).neq("status", "rejected");
    return (count ?? 0) > 0;
}

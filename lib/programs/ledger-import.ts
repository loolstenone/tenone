/**
 * 수료증 관리 대장 — 인트라가 원본 (2026-10-10 사용자 결정 A: 구글 시트는 동결, 이후 수정·추가는 인트라)
 *   대장 인증서 = program_certificates 중 cert_key `ledger:{코드}` (비고 note는 직원이 고칠 수 있어 구분 기준으로 쓰지 않는다)
 *   새 회차 = 인트라에서 시트와 같은 열의 CSV 업로드 → 여기서 검증·적재. 전화번호는 해시만 남기고 저장하지 않는다
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeCertCode } from "@/lib/programs/certificates";
import { ledgerMatchHash } from "@/lib/programs/ledger-match";

export const LEDGER_KEY_PREFIX = "ledger:";
export const isLedgerKey = (key: string | null | undefined) => !!key?.startsWith(LEDGER_KEY_PREFIX);

import type { LedgerRow } from "@/lib/programs/ledger-columns";
export type { LedgerRow };

/** 2004. 11. 11 · 2004.11.11 · 2004-11-11 → 2004-11-11 */
export function toIsoDate(s: string | null | undefined): string | null {
    const m = (s ?? "").match(/\d+/g);
    if (!m || m.length < 3 || m[0].length !== 4) return null;
    const [y, mo, d] = [Number(m[0]), Number(m[1]), Number(m[2])];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const t = (v: string | undefined) => (v ?? "").trim() || null;

/** 대장 한 줄 → program_certificates 행. 문제가 있으면 이유 문자열 */
export function ledgerRowToCertificate(brand: string, r: LedgerRow): Record<string, unknown> | string {
    const code = normalizeCertCode(r["코드"] ?? "");
    const m = code.match(/^(\d{4})-(COA|MCP) \d{6}$/);
    if (!m) return `코드 형식이 다릅니다 (${r["코드"] ?? "빈칸"}) — 예: 2026-COA 000001`;
    const name = (r["이름"] ?? "").replace(/\s+/g, "");
    if (!name) return "이름이 비어 있습니다";
    const birthdate = toIsoDate(r["생년월일"]);
    if (!birthdate) return `생년월일을 읽을 수 없습니다 (${r["생년월일"] ?? "빈칸"})`;
    const issued = toIsoDate(r["발급일"]);
    if (!issued) return `발급일을 읽을 수 없습니다 (${r["발급일"] ?? "빈칸"})`;
    const title = t(r["비고"]);
    if (!title) return "비고(대회명, 예: 춤추는고래 경쟁 PT)가 비어 있습니다";
    const award = m[2] === "MCP";
    const result = award ? (t(r["결과"]) ?? "본선") : "참가";
    if (award && !["1등", "2등", "3등", "본선"].includes(result)) return `수상 결과는 1등·2등·3등·본선 중 하나여야 합니다 (${result})`;
    return {
        brand_id: brand,
        cert_key: `${LEDGER_KEY_PREFIX}${code}`,
        type: award ? "award" : "participation",
        code,
        result,
        note: "수료증 관리 대장",
        issued_at: `${issued}T00:00:00+09:00`,
        match_hash: ledgerMatchHash(name, r["개인 전화 번호"]),
        snapshot: {
            name, birthdate, university: t(r["출신 대학"]), major: t(r["전공"]),
            group_label: "소속 동아리", group_name: t(r["소속 동아리"]), cohort: t(r["기수"]), team_name: t(r["출전팀"]),
            round_title: title, kind: "competition", year: Number(m[1]), client_name: title.replace(/\s*경쟁\s*PT\s*$/, "").trim(),
            brand_name: "MADLeague", label: award ? "경쟁 PT 수상 확인서" : "경쟁 PT 참가 확인서", title, source: "ledger",
        },
    };
}

/** CSV 업로드 적재 — 같은 코드가 이미 있으면 건너뛴다(덮어쓰지 않음, 수정은 행 편집으로) */
export async function importLedgerRows(brand: string, rows: LedgerRow[]) {
    const errors: { line: number; reason: string }[] = [];
    const valid: Record<string, unknown>[] = [];
    const seen = new Set<string>();
    rows.forEach((r, i) => {
        const out = ledgerRowToCertificate(brand, r);
        if (typeof out === "string") { errors.push({ line: i + 2, reason: out }); return; }
        if (seen.has(out.code as string)) { errors.push({ line: i + 2, reason: `파일 안에 같은 코드가 또 있습니다 (${out.code})` }); return; }
        seen.add(out.code as string);
        valid.push(out);
    });
    if (valid.length === 0) return { inserted: 0, skipped: 0, errors };

    const admin = createAdminClient();
    const { data: existing } = await admin.from("program_certificates").select("code").in("code", valid.map(v => v.code as string));
    const have = new Set((existing ?? []).map(e => e.code));
    const fresh = valid.filter(v => !have.has(v.code as string));
    if (fresh.length) {
        const { error } = await admin.from("program_certificates").insert(fresh);
        if (error) return { inserted: 0, skipped: have.size, errors: [...errors, { line: 0, reason: `저장 실패: ${error.message}` }] };
    }
    return { inserted: fresh.length, skipped: have.size, errors };
}

/** 대장 행 기재 사항 수정 — 이름이 바뀌면 매칭 해시도 다시 (전화번호를 함께 넣었을 때만, 아니면 해시를 비운다) */
export async function updateLedgerSnapshot(id: string, f: Record<string, unknown>): Promise<{ error?: string; hashCleared?: boolean }> {
    const admin = createAdminClient();
    const { data: row } = await admin.from("program_certificates").select("cert_key, snapshot").eq("id", id).maybeSingle();
    if (!row || !isLedgerKey(row.cert_key)) return { error: "대장 인증서만 고칠 수 있습니다." };
    const s = row.snapshot as Record<string, unknown>;
    const str = (k: string) => (typeof f[k] === "string" ? (f[k] as string).trim() || null : (s[k] as string | null) ?? null);
    const name = (str("name") ?? "").replace(/\s+/g, "");
    if (!name) return { error: "이름은 비울 수 없습니다." };
    const birthdate = typeof f.birthdate === "string" ? toIsoDate(f.birthdate) : (s.birthdate as string | null);
    if (!birthdate) return { error: "생년월일 형식이 다릅니다." };
    const snapshot = { ...s, name, birthdate, university: str("university"), major: str("major"), group_name: str("group_name"), cohort: str("cohort"), team_name: str("team_name") };

    const patch: Record<string, unknown> = { snapshot, updated_at: new Date().toISOString() };
    const phone = typeof f.phone === "string" ? f.phone.trim() : "";
    let hashCleared = false;
    if (phone) patch.match_hash = ledgerMatchHash(name, phone);
    else if (name !== s.name) { patch.match_hash = null; hashCleared = true; }
    const { error } = await admin.from("program_certificates").update(patch).eq("id", id);
    return error ? { error: error.message } : { hashCleared };
}

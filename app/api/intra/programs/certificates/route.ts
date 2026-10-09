/**
 * 인트라 인증서 관리 (코어 program_certificates) — 직원 전용
 *   GET   ?brand=&q=        목록 (구분·코드·발급일·비고·결과 + 발급 시점 정보). q = 코드·이름
 *   PATCH { id, note?, result? }                     비고·결과 수정
 *   POST  { action:'revoke', id, reason } | { action:'restore', id }   취소·복원 (삭제하지 않는다 — 발급 기록)
 *   ── 수료증 관리 대장 (cert_key ledger:*, 인트라가 원본 — 2026-10-10) ──
 *   PATCH { id, ledger: { name, birthdate, university, major, group_name, cohort, team_name, phone? } }  기재 사항 수정 (전화번호는 해시만)
 *   POST  { action:'unlink', id }                     계정 연결 해제 (다른 사람이 잘못 연결한 경우)
 *   POST  { action:'import', brand, rows: LedgerRow[] }  대장 형식 CSV 적재 (코드가 있는 행, 같은 코드는 건너뜀)
 *   POST  { action:'batch', brand, round, people, preview }  회차 일괄 발급 — 코드 자동 배정 (lib/programs/ledger-batch.ts)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { batchIssueRound } from "@/lib/programs/ledger-batch";
import { importLedgerRows, isLedgerKey, updateLedgerSnapshot, type LedgerRow } from "@/lib/programs/ledger-import";

const COLS = "id, brand_id, round_id, member_id, linked_by, cert_key, type, code, result, note, snapshot, issued_at, revoked_at, revoked_reason";

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const brand = req.nextUrl.searchParams.get("brand");
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    let query = createAdminClient().from("program_certificates").select(COLS).order("issued_at", { ascending: false }).limit(500);
    if (brand) query = query.eq("brand_id", brand);
    if (q) {
        const safe = q.replace(/[%,()]/g, "");
        query = query.or(`code.ilike.%${safe}%,snapshot->>name.ilike.%${safe}%`);
    }
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ certificates: data ?? [] });
}

export async function PATCH(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    if (body.ledger && typeof body.ledger === "object") {
        const r = await updateLedgerSnapshot(String(body.id ?? ""), body.ledger);
        if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
        return NextResponse.json({ ok: true, hashCleared: r.hashCleared });
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ("note" in body) patch.note = String(body.note ?? "").trim().slice(0, 500) || null;
    if ("result" in body) patch.result = String(body.result ?? "").trim().slice(0, 60) || null;
    const { error } = await createAdminClient().from("program_certificates").update(patch).eq("id", String(body.id ?? ""));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const now = new Date().toISOString();
    const admin = createAdminClient();
    if (body.action === "revoke") {
        const reason = String(body.reason ?? "").trim().slice(0, 200);
        if (!reason) return NextResponse.json({ error: "취소 사유를 적어 주세요." }, { status: 400 });
        const { error } = await admin.from("program_certificates").update({ revoked_at: now, revoked_reason: reason, updated_at: now }).eq("id", id).is("revoked_at", null);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }
    if (body.action === "restore") {
        const { error } = await admin.from("program_certificates").update({ revoked_at: null, revoked_reason: null, updated_at: now }).eq("id", id);
        if (error) {
            if (error.code === "23505") return NextResponse.json({ error: "같은 인증서가 새로 발급되어 있어 복원할 수 없습니다." }, { status: 409 });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    }
    if (body.action === "unlink") {
        const { data: row } = await admin.from("program_certificates").select("cert_key").eq("id", id).maybeSingle();
        if (!row || !isLedgerKey(row.cert_key)) return NextResponse.json({ error: "대장 인증서만 연결을 해제할 수 있습니다." }, { status: 400 });
        const { error } = await admin.from("program_certificates").update({ member_id: null, linked_by: null, updated_at: now }).eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }
    if (body.action === "batch") {
        if (body.brand !== "madleague") return NextResponse.json({ error: "일괄 발급은 MADLeague만 지원합니다." }, { status: 400 });
        const people = Array.isArray(body.people) ? body.people.slice(0, 1000) : [];
        if (people.length === 0) return NextResponse.json({ error: "참가자 명단이 비어 있습니다." }, { status: 400 });
        return NextResponse.json(await batchIssueRound("madleague", body.round ?? {}, people, body.preview !== false));
    }
    if (body.action === "import") {
        const brand = String(body.brand ?? "");
        const rows = Array.isArray(body.rows) ? (body.rows as LedgerRow[]).slice(0, 2000) : [];
        if (brand !== "madleague") return NextResponse.json({ error: "대장 업로드는 MADLeague만 지원합니다." }, { status: 400 });
        if (rows.length === 0) return NextResponse.json({ error: "행이 없습니다." }, { status: 400 });
        return NextResponse.json(await importLedgerRows(brand, rows));
    }
    return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
}

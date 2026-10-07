/**
 * 인트라 인증서 관리 (코어 program_certificates) — 직원 전용
 *   GET   ?brand=&q=        목록 (구분·코드·발급일·비고·결과 + 발급 시점 정보). q = 코드·이름
 *   PATCH { id, note?, result? }                     비고·결과 수정
 *   POST  { action:'revoke', id, reason } | { action:'restore', id }   취소·복원 (삭제하지 않는다 — 발급 기록)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const COLS = "id, brand_id, round_id, member_id, cert_key, type, code, result, note, snapshot, issued_at, revoked_at, revoked_reason";

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
    return NextResponse.json({ error: "알 수 없는 작업입니다." }, { status: 400 });
}

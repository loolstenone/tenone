/**
 * 프로그램 회차 공지 (코어) — 열람: 참가자·직원·클라이언트 / 작성·수정·삭제: 직원
 *   GET    /api/programs/rounds/{id}/notices
 *   POST   /api/programs/rounds/{id}/notices   { title, body?, pinned? }  → 참가자·클라이언트에게 사이트 알림
 *   PATCH  /api/programs/rounds/{id}/notices   { notice_id, title?, body?, pinned? }
 *   DELETE /api/programs/rounds/{id}/notices?notice_id=
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoundAccess, roundClientIds, roundParticipantIds } from "@/lib/programs/access";
import { programRoomPath } from "@/lib/programs/paths";
import { notify } from "@/lib/notify";

type Params = { params: Promise<{ id: string }> };
const deny = () => NextResponse.json({ error: "이 회차 참여자만 볼 수 있습니다." }, { status: 403 });
const staffOnly = () => NextResponse.json({ error: "운영진만 공지를 쓸 수 있습니다." }, { status: 403 });

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    const { data, error } = await createAdminClient().from("program_notices")
        .select("id, title, body, pinned, created_at, updated_at")
        .eq("round_id", id).order("pinned", { ascending: false }).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notices: data ?? [], canWrite: a.role === "staff" });
}

export async function POST(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    if (a.role !== "staff") return staffOnly();
    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").trim().slice(0, 200);
    if (!title) return NextResponse.json({ error: "제목을 적어 주세요." }, { status: 400 });
    const text = String(body.body ?? "").trim().slice(0, 5000) || null;
    const { error } = await createAdminClient().from("program_notices").insert({
        brand_id: a.round.brand_id, round_id: id, title, body: text, pinned: body.pinned === true, author_member_id: a.memberId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const [people, clients] = await Promise.all([roundParticipantIds(id), roundClientIds(id)]);
    await notify([...people, ...clients].filter(m => m !== a.memberId), {
        brandId: a.round.brand_id, type: "program_notice",
        title: `[공지] ${a.round.title} · ${title}`, message: text?.slice(0, 120) ?? null,
        link: programRoomPath(a.round),
    });
    return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    if (a.role !== "staff") return staffOnly();
    const body = await req.json().catch(() => ({}));
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ("title" in body) {
        const t = String(body.title ?? "").trim().slice(0, 200);
        if (!t) return NextResponse.json({ error: "제목을 적어 주세요." }, { status: 400 });
        patch.title = t;
    }
    if ("body" in body) patch.body = String(body.body ?? "").trim().slice(0, 5000) || null;
    if ("pinned" in body) patch.pinned = body.pinned === true;
    const { error } = await createAdminClient().from("program_notices").update(patch)
        .eq("id", String(body.notice_id ?? "")).eq("round_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const a = await getRoundAccess(id);
    if (!a) return deny();
    if (a.role !== "staff") return staffOnly();
    const { error } = await createAdminClient().from("program_notices").delete()
        .eq("id", req.nextUrl.searchParams.get("notice_id") ?? "").eq("round_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

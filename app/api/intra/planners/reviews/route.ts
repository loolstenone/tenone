/**
 * 플래너'스 PAD 후기 관리 (직원) — 인트라 /intra/ums/planners/reviews (아임웹 '구매평' 화면 기준)
 *   GET                         → 전체 후기 (숨김 포함, 최신순)
 *   PATCH  { id, is_visible?, admin_reply? }   → 숨기기·보이기 · 운영자 답글 (빈 문자열 = 답글 지움)
 *   DELETE ?id=
 * 화면 이름은 가린 이름만 (직원 화면에서도 실명을 띄우지 않는다)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { maskName } from "@/lib/planners/reviews";

export const runtime = "nodejs";

const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

interface Row {
    id: string; file_id: string; source: "badak" | "site"; masked_name: string | null; edition: string | null; rating: number; body: string;
    is_visible: boolean; admin_reply: string | null; admin_replied_at: string | null; created_at: string;
    members: { name: string | null } | null; planners_files: { title: string; thumbnail_url: string | null } | null;
}

export async function GET(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const { data, error } = await createAdminClient().from("planners_reviews")
        .select("id, file_id, source, masked_name, edition, rating, body, is_visible, admin_reply, admin_replied_at, created_at, members(name), planners_files(title, thumbnail_url)")
        .order("created_at", { ascending: false })
        .limit(2000);
    if (error) return bad(error.message, 500);
    const reviews = ((data ?? []) as unknown as Row[]).map((r) => ({
        id: r.id, fileId: r.file_id, source: r.source,
        name: r.source === "badak" ? r.masked_name ?? "회원" : maskName(r.members?.name),
        edition: r.edition, rating: r.rating, body: r.body, isVisible: r.is_visible,
        adminReply: r.admin_reply, adminRepliedAt: r.admin_replied_at, createdAt: r.created_at,
        fileTitle: r.planners_files?.title ?? "", thumbnail: r.planners_files?.thumbnail_url ?? null,
    }));
    return NextResponse.json({ reviews });
}

export async function PATCH(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const body = await req.json().catch(() => ({}));
    if (typeof body.id !== "string") return bad("id가 필요합니다.");
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.is_visible === "boolean") patch.is_visible = body.is_visible;
    if (typeof body.admin_reply === "string") {
        const reply = body.admin_reply.trim().slice(0, 2000);
        patch.admin_reply = reply || null;
        patch.admin_replied_at = reply ? new Date().toISOString() : null;
    }
    const { error } = await createAdminClient().from("planners_reviews").update(patch).eq("id", body.id);
    if (error) return bad(error.message, 500);
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const staff = await requireStaff(req);
    if (staff instanceof NextResponse) return staff;
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return bad("id가 필요합니다.");
    const { error } = await createAdminClient().from("planners_reviews").delete().eq("id", id);
    if (error) return bad(error.message, 500);
    return NextResponse.json({ ok: true });
}

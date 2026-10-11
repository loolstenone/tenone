/**
 * 동아리 홍보 게시물 한 건 — PATCH { title?, content?, media?, is_pinned?, is_published? } · DELETE (운영진·직원)
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { CLUB_POST_SELECT, clubPostContext, sanitizeMedia } from "@/lib/madleague-club-posts";

export const runtime = "nodejs";
type Params = { params: Promise<{ slug: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
    const { slug, id } = await params;
    const c = await clubPostContext(req, slug);
    if ("error" in c) return c.error;
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.title === "string") {
        const title = body.title.trim().slice(0, 120);
        if (!title) return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
        updates.title = title;
    }
    if (typeof body.content === "string") updates.content = body.content.trim().slice(0, 5000);
    if (body.media !== undefined) updates.media = sanitizeMedia(body.media);
    if (typeof body.is_pinned === "boolean") updates.is_pinned = body.is_pinned;
    if (typeof body.is_published === "boolean") updates.is_published = body.is_published;
    const { data, error } = await c.admin.from("mad_club_posts").update(updates)
        .eq("id", id).eq("club_id", c.club.id).select(CLUB_POST_SELECT).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    revalidatePath(`/madleague/clubs/${slug}`);
    return NextResponse.json({ ok: true, post: data });
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { slug, id } = await params;
    const c = await clubPostContext(req, slug);
    if ("error" in c) return c.error;
    const { error } = await c.admin.from("mad_club_posts").delete().eq("id", id).eq("club_id", c.club.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath(`/madleague/clubs/${slug}`);
    return NextResponse.json({ ok: true });
}

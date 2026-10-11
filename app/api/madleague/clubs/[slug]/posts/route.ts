/**
 * 동아리 홍보 게시물 (공개) — 2026-10-11 동아리 방 폐지 후 대외 홍보 기능
 *   GET  /api/madleague/clubs/{slug}/posts          공개 글 목록 (누구나)
 *   POST /api/madleague/clubs/{slug}/posts          { title, content, media? } — 이 동아리 운영진(회장단)·직원
 * 권한·검증 헬퍼 = lib/madleague-club-posts.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CLUB_POST_SELECT, clubPostContext, sanitizeMedia } from "@/lib/madleague-club-posts";

export const runtime = "nodejs";
type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const admin = createAdminClient();
    const { data: club } = await admin.from("mad_clubs").select("id").eq("slug", slug).maybeSingle();
    if (!club) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const { data } = await admin.from("mad_club_posts").select(CLUB_POST_SELECT)
        .eq("club_id", club.id).eq("is_published", true)
        .order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
    return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const c = await clubPostContext(req, slug);
    if ("error" in c) return c.error;
    const body = await req.json().catch(() => ({})) as { title?: unknown; content?: unknown; media?: unknown };
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 5000) : "";
    if (!title) return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
    const { data, error } = await c.admin.from("mad_club_posts")
        .insert({ club_id: c.club.id, author_member_id: c.memberId, title, content, media: sanitizeMedia(body.media) })
        .select(CLUB_POST_SELECT).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath(`/madleague/clubs/${slug}`);
    return NextResponse.json({ ok: true, post: data });
}

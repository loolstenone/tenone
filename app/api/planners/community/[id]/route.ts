import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    // 공개 읽기. 로그인은 옵션.
    const memberId = await getMemberId();

    const { id } = await params;
    const admin = createAdminClient();

    const { data: post, error } = await admin
        .from("planners_community_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error || !post) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { data: comments } = await admin
        .from("planners_community_comments")
        .select("id, member_id, content, created_at")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

    const memberIds = Array.from(new Set([post.member_id, ...(comments ?? []).map((c) => c.member_id)]));
    const { data: members } = await admin
        .from("members")
        .select("id, name, avatar_url")
        .in("id", memberIds);
    const memberMap = new Map((members ?? []).map((m) => [m.id, m]));

    let liked = null;
    if (memberId) {
        const r = await admin
            .from("planners_community_likes")
            .select("post_id")
            .eq("post_id", id)
            .eq("member_id", memberId)
            .maybeSingle();
        liked = r.data;
    }

    return NextResponse.json({
        post: {
            ...post,
            author_name: memberMap.get(post.member_id)?.name ?? "익명",
            author_avatar: memberMap.get(post.member_id)?.avatar_url ?? null,
            is_mine: memberId ? post.member_id === memberId : false,
            i_liked: !!liked,
        },
        comments: (comments ?? []).map((c) => ({
            ...c,
            author_name: memberMap.get(c.member_id)?.name ?? "익명",
            author_avatar: memberMap.get(c.member_id)?.avatar_url ?? null,
            is_mine: memberId ? c.member_id === memberId : false,
        })),
        authenticated: !!memberId,
    });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 200);
    if (typeof body.content === "string") patch.content = body.content.trim();
    if (Array.isArray(body.image_urls)) patch.image_urls = body.image_urls.slice(0, 8);

    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_community_posts")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_community_posts")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

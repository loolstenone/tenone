import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["review", "case", "suggestion", "life"] as const;

export async function GET(req: Request) {
    // 읽기는 공개. 비로그인도 OK.
    const memberId = await getMemberId();

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "30", 10), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const admin = createAdminClient();
    let q = admin
        .from("myverse_community_posts")
        .select("id, member_id, category, title, content, image_urls, like_count, comment_count, is_pinned, created_at, updated_at")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    if (category && (VALID_CATEGORIES as readonly string[]).includes(category)) {
        q = q.eq("category", category);
    }
    const { data: posts, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ids = (posts ?? []).map((p) => p.member_id);
    const { data: members } = await admin
        .from("members")
        .select("id, name, avatar_url")
        .in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const memberMap = new Map((members ?? []).map((m) => [m.id, m]));

    // 본인이 좋아요한 글 id 셋 (로그인한 경우만 조회)
    let likedSet = new Set<string>();
    if (memberId) {
        const postIds = (posts ?? []).map((p) => p.id);
        const { data: liked } = await admin
            .from("myverse_community_likes")
            .select("post_id")
            .eq("member_id", memberId)
            .in("post_id", postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"]);
        likedSet = new Set((liked ?? []).map((l) => l.post_id));
    }

    const enriched = (posts ?? []).map((p) => ({
        ...p,
        author_name: memberMap.get(p.member_id)?.name ?? "익명",
        author_avatar: memberMap.get(p.member_id)?.avatar_url ?? null,
        is_mine: memberId ? p.member_id === memberId : false,
        i_liked: likedSet.has(p.id),
    }));

    return NextResponse.json({ posts: enriched, authenticated: !!memberId });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { category, title, content, image_urls } = body as {
        category?: string;
        title?: string;
        content?: string;
        image_urls?: string[];
    };

    if (!category || !(VALID_CATEGORIES as readonly string[]).includes(category)) {
        return NextResponse.json({ error: "invalid_category" }, { status: 400 });
    }
    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_community_posts")
        .insert({
            member_id: memberId,
            category,
            title: title.trim().slice(0, 200),
            content: content.trim(),
            image_urls: Array.isArray(image_urls) ? image_urls.slice(0, 8) : [],
        })
        .select()
        .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "insert_failed" }, { status: 500 });
    return NextResponse.json({ post: data });
}

// 마이버스 소셜 피드 — 팔로우하는 사람들의 공개 흔적 + 본인 공개 흔적
// GET /api/myverse/social/feed?cursor=...&mode=following|discover
//
// 응답: { items: [{ moment, member, reactions_count, comments_count, my_reaction }], next_cursor }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
    const memberId = await getMemberId();
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const mode = url.searchParams.get("mode") === "discover" ? "discover" : "following";

    const admin = createAdminClient();

    if (mode === "following" && !memberId) {
        return NextResponse.json({ items: [], next_cursor: null, mode });
    }

    // 차단 목록 — 양방향 (내가 차단했거나, 나를 차단한 사람 모두 제외)
    let blockedIds = new Set<string>();
    if (memberId) {
        const [a, b] = await Promise.all([
            admin.from("myverse_user_blocks").select("blocked_id").eq("blocker_id", memberId),
            admin.from("myverse_user_blocks").select("blocker_id").eq("blocked_id", memberId),
        ]);
        for (const r of a.data ?? []) blockedIds.add(r.blocked_id as string);
        for (const r of b.data ?? []) blockedIds.add(r.blocker_id as string);
    }

    let memberFilter: string[] | null = null;
    if (mode === "following" && memberId) {
        const { data: follows } = await admin
            .from("myverse_follows")
            .select("following_id")
            .eq("follower_id", memberId);
        const ids = (follows ?? []).map(f => f.following_id as string).filter(id => !blockedIds.has(id));
        ids.push(memberId);
        memberFilter = Array.from(new Set(ids));
        if (memberFilter.length === 0) {
            return NextResponse.json({ items: [], next_cursor: null, mode });
        }
    }

    let q = admin
        .from("myverse_daily_moments")
        .select("id, member_id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, happened_at, location, with_whom, activity, created_at")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE + 1);

    if (memberFilter) q = q.in("member_id", memberFilter);
    else if (blockedIds.size > 0) q = q.not("member_id", "in", `(${Array.from(blockedIds).join(",")})`);
    if (cursor) q = q.lt("created_at", cursor);

    const { data: moments, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const slice = (moments ?? []).slice(0, PAGE_SIZE);
    const next_cursor = (moments ?? []).length > PAGE_SIZE ? slice[slice.length - 1].created_at : null;

    if (slice.length === 0) {
        return NextResponse.json({ items: [], next_cursor: null, mode });
    }

    const memberIds = Array.from(new Set(slice.map(m => m.member_id as string)));
    const momentIds = slice.map(m => m.id as string);

    const [membersRes, reactionsRes, commentsRes, myReactionsRes] = await Promise.all([
        admin.from("members").select("id, name, handle, avatar_url").in("id", memberIds),
        admin.from("myverse_moment_reactions").select("moment_id").in("moment_id", momentIds),
        admin.from("myverse_moment_comments").select("moment_id").in("moment_id", momentIds),
        memberId
            ? admin.from("myverse_moment_reactions").select("moment_id, reaction_type").in("moment_id", momentIds).eq("member_id", memberId)
            : Promise.resolve({ data: [] }),
    ]);

    const membersById = new Map((membersRes.data ?? []).map(m => [m.id, m]));
    const reactionsCount = new Map<string, number>();
    for (const r of (reactionsRes.data ?? [])) {
        reactionsCount.set(r.moment_id as string, (reactionsCount.get(r.moment_id as string) ?? 0) + 1);
    }
    const commentsCount = new Map<string, number>();
    for (const c of (commentsRes.data ?? [])) {
        commentsCount.set(c.moment_id as string, (commentsCount.get(c.moment_id as string) ?? 0) + 1);
    }
    const myReactions = new Map<string, string>();
    for (const r of (myReactionsRes.data ?? [])) {
        myReactions.set(r.moment_id as string, r.reaction_type as string);
    }

    const items = slice.map(m => ({
        moment: m,
        member: membersById.get(m.member_id as string) ?? null,
        reactions_count: reactionsCount.get(m.id as string) ?? 0,
        comments_count: commentsCount.get(m.id as string) ?? 0,
        my_reaction: myReactions.get(m.id as string) ?? null,
    }));

    return NextResponse.json({ items, next_cursor, mode });
}

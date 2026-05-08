// 추천 친구 — 핸들이 있고 공개 흔적이 있는 사용자 (간단 버전)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const memberId = await getMemberId();
    const admin = createAdminClient();

    // 핸들 있는 멤버 중 본인·이미 팔로우한 사람 제외, 공개 흔적 가진 사람 우선
    let alreadyFollowing: string[] = [];
    if (memberId) {
        const { data: f } = await admin.from("myverse_follows").select("following_id").eq("follower_id", memberId);
        alreadyFollowing = (f ?? []).map(x => x.following_id as string);
    }

    let q = admin
        .from("members")
        .select("id, name, handle, avatar_url, bio")
        .not("handle", "is", null)
        .limit(20);
    if (memberId) q = q.neq("id", memberId);
    if (alreadyFollowing.length > 0) q = q.not("id", "in", `(${alreadyFollowing.join(",")})`);

    const { data: candidates } = await q;
    if (!candidates || candidates.length === 0) return NextResponse.json({ users: [] });

    // 각 사용자의 공개 흔적 수
    const { data: counts } = await admin
        .from("myverse_daily_moments")
        .select("member_id")
        .in("member_id", candidates.map(c => c.id))
        .eq("visibility", "public");

    const cntMap = new Map<string, number>();
    for (const r of (counts ?? [])) {
        cntMap.set(r.member_id as string, (cntMap.get(r.member_id as string) ?? 0) + 1);
    }

    const users = candidates
        .map(c => ({ ...c, public_count: cntMap.get(c.id) ?? 0 }))
        .filter(u => u.public_count > 0)
        .sort((a, b) => b.public_count - a.public_count)
        .slice(0, 12);

    return NextResponse.json({ users });
}

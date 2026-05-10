// 공개 Verse 페이지 — handle로 멤버 조회 + visibility=public 흔적 노출
// GET /api/myverse/v/[handle]
//
// 인증 불필요. 누구나 조회 가능.
// 응답: { member: { name, handle, avatar_url, bio }, moments: [...], stats }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
    const { handle: rawHandle } = await params;
    const handle = decodeURIComponent(rawHandle).replace(/^@/, "").trim().toLowerCase();
    if (!handle) return NextResponse.json({ error: "missing_handle" }, { status: 400 });
    if (!/^[a-z0-9_-]{2,30}$/.test(handle)) return NextResponse.json({ error: "invalid_handle" }, { status: 400 });

    const admin = createAdminClient();

    const { data: member, error: mErr } = await admin
        .from("members")
        .select("id, name, handle, avatar_url, bio, email, phone, company")
        .eq("handle", handle)
        .maybeSingle();

    if (mErr || !member) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const [momentsRes, placesRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, happened_at, location, with_whom, activity")
            .eq("member_id", member.id)
            .eq("visibility", "public")
            .order("date", { ascending: false })
            .limit(120),
        admin.from("myverse_daily_places")
            .select("place_name, category")
            .eq("member_id", member.id)
            .eq("visibility", "public")
            .limit(50),
    ]);

    const moments = momentsRes.data ?? [];
    const places = placesRes.data ?? [];

    // 통계
    const dates = new Set(moments.map(m => m.date as string));
    const placeSet = new Set([
        ...moments.map(m => m.location).filter(Boolean) as string[],
        ...places.map(p => p.place_name).filter(Boolean) as string[],
    ]);

    const domainCnt: Record<string, number> = {};
    for (const m of moments) {
        const d = (m.domain as string) ?? "daily";
        domainCnt[d] = (domainCnt[d] ?? 0) + 1;
    }

    return NextResponse.json({
        member: {
            name: member.name,
            handle: member.handle,
            avatar_url: member.avatar_url,
            bio: member.bio ?? null,
            // 명함 모드(/v/{handle}/card)에서 사용. 사생활 토글은 후속 작업 (현재 모두 공개).
            email: member.email ?? null,
            phone: member.phone ?? null,
            company: member.company ?? null,
        },
        stats: {
            moments_count: moments.length,
            recorded_days: dates.size,
            places_count: placeSet.size,
            domain_distribution: domainCnt,
        },
        moments,
    });
}

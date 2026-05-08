// 사람 중심 뷰 — 한 사람(with_whom 매칭)과 연결된 모든 흔적·일과·장소·일정
// GET /api/myverse/people/[name]
//
// name 파라미터는 URL-encoded. 정확 일치(case-sensitive) — 후속에 fuzzy 매칭 추가 가능.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { name: rawName } = await params;
    const name = decodeURIComponent(rawName).trim();
    if (!name) return NextResponse.json({ error: "missing_name" }, { status: 400 });

    const admin = createAdminClient();

    const [moments, routines, places] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, happened_at, with_whom, location, activity")
            .eq("member_id", memberId)
            .ilike("with_whom", `%${name}%`)
            .order("date", { ascending: false })
            .limit(200),
        admin.from("myverse_daily_routines")
            .select("id, date, activity, category, note, start_time, end_time")
            .eq("member_id", memberId)
            .or(`activity.ilike.%${name}%,note.ilike.%${name}%`)
            .order("date", { ascending: false })
            .limit(50),
        admin.from("myverse_daily_places")
            .select("id, date, place_name, address, category, duration_min, note, visited_at")
            .eq("member_id", memberId)
            .ilike("note", `%${name}%`)
            .order("date", { ascending: false })
            .limit(50),
    ]);

    const momentList = moments.data ?? [];

    // 통계
    const dates = momentList.map(m => m.date).sort();
    const firstMet = dates[0] ?? null;
    const lastMet  = dates[dates.length - 1] ?? null;
    const meetingDays = new Set(dates).size;

    // 9영역 분포
    const domainCnt: Record<string, number> = {};
    for (const m of momentList) {
        const d = m.domain ?? "daily";
        domainCnt[d] = (domainCnt[d] ?? 0) + 1;
    }

    // 자주 간 장소 (이 사람과)
    const locCnt = new Map<string, number>();
    for (const m of momentList) {
        if (m.location) locCnt.set(m.location, (locCnt.get(m.location) ?? 0) + 1);
    }
    const topLocations = Array.from(locCnt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return NextResponse.json({
        name,
        stats: {
            total_moments: momentList.length,
            meeting_days: meetingDays,
            first_met: firstMet,
            last_met: lastMet,
            domain_distribution: domainCnt,
            top_locations: topLocations,
        },
        moments: momentList,
        routines: routines.data ?? [],
        places: places.data ?? [],
    });
}

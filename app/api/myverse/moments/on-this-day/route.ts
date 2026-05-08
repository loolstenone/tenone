// On This Day — 오늘 날짜의 작년/재작년/3년 전… 흔적 모음
// GET /api/myverse/moments/on-this-day
//
// 응답: { years: [{ year_diff: 1, date: "2025-05-09", moments: [...] }, ...] }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const baseDateStr = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const base = new Date(baseDateStr + "T00:00:00");

    const admin = createAdminClient();
    const years: { year_diff: number; date: string; moments: unknown[] }[] = [];

    // 1년~10년 전 같은 날(±1일)을 조회
    for (let diff = 1; diff <= 10; diff++) {
        const target = new Date(base);
        target.setFullYear(target.getFullYear() - diff);
        const targetStr = target.toISOString().slice(0, 10);
        const before = new Date(target); before.setDate(before.getDate() - 1);
        const after  = new Date(target); after.setDate(after.getDate() + 1);

        const { data } = await admin
            .from("myverse_daily_moments")
            .select("id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, location, with_whom, activity, happened_at, classification_version")
            .eq("member_id", memberId)
            .gte("date", before.toISOString().slice(0, 10))
            .lte("date", after.toISOString().slice(0, 10))
            .order("happened_at", { ascending: false })
            .limit(20);

        if (data && data.length > 0) {
            years.push({ year_diff: diff, date: targetStr, moments: data });
        }
    }

    return NextResponse.json({ years, base_date: baseDateStr });
}

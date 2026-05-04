// 도메인 피드 API — 한 영역의 최근 N일 capture 데이터를 시간순 통합 반환
// GET /api/myverse/feed?domain=body&days=30

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import { isValidDomain } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    const days = parseInt(url.searchParams.get("days") ?? "30", 10);

    if (!domain || !isValidDomain(domain)) {
        return NextResponse.json({ error: "invalid_domain" }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const admin = createAdminClient();

    // 4개 capture 테이블에서 동시 fetch
    const [moments, routines, places, calendar] = await Promise.all([
        admin
            .from("planners_daily_moments")
            .select("id, date, happened_at, caption, media_url, media_type, visibility")
            .eq("member_id", memberId)
            .eq("domain", domain)
            .gte("date", sinceStr)
            .order("happened_at", { ascending: false, nullsFirst: false })
            .limit(50),
        admin
            .from("planners_daily_routines")
            .select("id, date, start_time, end_time, activity, note, visibility")
            .eq("member_id", memberId)
            .eq("domain", domain)
            .gte("date", sinceStr)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false, nullsFirst: false })
            .limit(50),
        admin
            .from("planners_daily_places")
            .select("id, date, visited_at, place_name, address, visibility")
            .eq("member_id", memberId)
            .eq("domain", domain)
            .gte("date", sinceStr)
            .order("date", { ascending: false })
            .order("visited_at", { ascending: false, nullsFirst: false })
            .limit(50),
        admin
            .from("planners_calendar_entries")
            .select("id, date, title, start_time, visibility")
            .eq("member_id", memberId)
            .eq("domain", domain)
            .gte("date", sinceStr)
            .order("date", { ascending: false })
            .limit(50),
    ]);

    type Item = { type: string; id: string; date: string; sortKey: string; [k: string]: unknown };
    const items: Item[] = [];

    (moments.data ?? []).forEach(m => items.push({
        type: "moment",
        ...m,
        sortKey: (m.happened_at as string | null) ?? `${m.date}T00:00:00`,
    }));
    (routines.data ?? []).forEach(r => items.push({
        type: "routine",
        ...r,
        sortKey: `${r.date}T${r.start_time ?? "00:00"}`,
    }));
    (places.data ?? []).forEach(p => items.push({
        type: "place",
        ...p,
        sortKey: `${p.date}T${p.visited_at ?? "00:00"}`,
    }));
    (calendar.data ?? []).forEach(c => items.push({
        type: "calendar",
        ...c,
        sortKey: `${c.date}T${c.start_time ?? "00:00"}`,
    }));

    // 시간 역순 정렬
    items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    return NextResponse.json({ items: items.slice(0, 100) });
}

// Verse 통합 타임라인 API — 9 영역 모든 capture 데이터를 시간순 통합
// GET /api/myverse/verse?from=YYYY-MM-DD&to=YYYY-MM-DD&domain=&person_id=&zoom=day|week|month|quarter|year|life
//
// zoom별 응답:
//   day:    개별 항목 시간순 (최대 200건)
//   week:   일별 요약 (영역별 카운트)
//   month:  주별 요약
//   quarter: 월별 요약
//   year:   분기별 요약
//   life:   연도별 요약 (전체 시기)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import { isValidDomain } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";

type ZoomLevel = "day" | "week" | "month" | "quarter" | "year" | "life";

const VALID_ZOOMS: Set<ZoomLevel> = new Set(["day", "week", "month", "quarter", "year", "life"]);

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const domain = url.searchParams.get("domain");
    const personId = url.searchParams.get("person_id");
    const zoomParam = (url.searchParams.get("zoom") ?? "day") as ZoomLevel;

    if (!VALID_ZOOMS.has(zoomParam)) return NextResponse.json({ error: "invalid_zoom" }, { status: 400 });
    if (domain && !isValidDomain(domain)) return NextResponse.json({ error: "invalid_domain" }, { status: 400 });

    // 기본 범위: 최근 30일
    const today = new Date();
    const fromStr = from ?? new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    const toStr = to ?? today.toISOString().slice(0, 10);

    const admin = createAdminClient();

    // 빌더 체이닝 헬퍼 — 도메인/사람 필터 적용 후 반환
    /* eslint-disable @typescript-eslint/no-explicit-any */
    function withFilters(q: any): any {
        let r = q;
        if (domain) r = r.eq("domain", domain);
        if (personId) r = r.contains("people_axis", [personId]);
        return r;
    }

    const momentsQ = withFilters(
        admin
            .from("planners_daily_moments")
            .select("id, date, happened_at, caption, media_url, media_type, domain, sub_tags, visibility, people_axis")
            .eq("member_id", memberId)
            .gte("date", fromStr)
            .lte("date", toStr)
    ).order("happened_at", { ascending: false, nullsFirst: false }).limit(500);

    const routinesQ = withFilters(
        admin
            .from("planners_daily_routines")
            .select("id, date, start_time, end_time, activity, body_subtype, body_data, domain, sub_tags, visibility, people_axis")
            .eq("member_id", memberId)
            .gte("date", fromStr)
            .lte("date", toStr)
    ).order("date", { ascending: false }).limit(500);

    const placesQ = withFilters(
        admin
            .from("planners_daily_places")
            .select("id, date, visited_at, place_name, address, domain, sub_tags, visibility, people_axis")
            .eq("member_id", memberId)
            .gte("date", fromStr)
            .lte("date", toStr)
    ).order("date", { ascending: false }).limit(500);

    const calendarQ = withFilters(
        admin
            .from("planners_calendar_entries")
            .select("id, date, title, start_time, kind, domain, visibility, people_axis")
            .eq("member_id", memberId)
            .gte("date", fromStr)
            .lte("date", toStr)
    ).order("date", { ascending: false }).limit(500);

    const [moments, routines, places, calendar] = await Promise.all([momentsQ, routinesQ, placesQ, calendarQ]);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    type Item = { type: string; id: string; date: string; sortKey: string; domain: string | null; [k: string]: unknown };
    const items: Item[] = [];

    type Row = { id: string; date: string; happened_at?: string | null; start_time?: string | null; visited_at?: string | null; domain?: string | null; [k: string]: unknown };
    (((moments as { data?: Row[] }).data) ?? []).forEach(m => items.push({
        type: "moment", ...m, domain: m.domain ?? null,
        sortKey: m.happened_at ?? `${m.date}T00:00:00`,
    }));
    (((routines as { data?: Row[] }).data) ?? []).forEach(r => items.push({
        type: "routine", ...r, domain: r.domain ?? null,
        sortKey: `${r.date}T${r.start_time ?? "00:00"}`,
    }));
    (((places as { data?: Row[] }).data) ?? []).forEach(p => items.push({
        type: "place", ...p, domain: p.domain ?? null,
        sortKey: `${p.date}T${p.visited_at ?? "00:00"}`,
    }));
    (((calendar as { data?: Row[] }).data) ?? []).forEach(c => items.push({
        type: "calendar", ...c, domain: c.domain ?? null,
        sortKey: `${c.date}T${c.start_time ?? "00:00"}`,
    }));

    items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    // zoom day는 그대로 200건
    if (zoomParam === "day") {
        return NextResponse.json({
            zoom: "day",
            from: fromStr,
            to: toStr,
            items: items.slice(0, 200),
            total: items.length,
        });
    }

    // 그 외 줌은 버킷팅
    const buckets: Record<string, Record<string, number>> = {};
    for (const it of items) {
        const d = new Date(it.date + "T00:00:00");
        const key = bucketKey(d, zoomParam);
        buckets[key] ??= {};
        const dom = (it.domain as string | null) ?? "daily";
        buckets[key][dom] = (buckets[key][dom] ?? 0) + 1;
    }

    const summary = Object.entries(buckets)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, domains]) => ({ key, domains, total: Object.values(domains).reduce((a, b) => a + b, 0) }));

    return NextResponse.json({
        zoom: zoomParam,
        from: fromStr,
        to: toStr,
        summary,
        item_count: items.length,
    });
}

function bucketKey(d: Date, zoom: ZoomLevel): string {
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;
    const day = d.getDate();
    switch (zoom) {
        case "week": {
            const onejan = new Date(yr, 0, 1);
            const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
            return `${yr}-W${String(week).padStart(2, "0")}`;
        }
        case "month": return `${yr}-${String(mo).padStart(2, "0")}`;
        case "quarter": return `${yr}-Q${Math.ceil(mo / 3)}`;
        case "year": return `${yr}`;
        case "life": return `${yr}`;
        default: return `${yr}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
}

// "X년 전 오늘" — 같은 월·일의 과거 기록
// GET /api/myverse/verse/on-this-day?date=YYYY-MM-DD (기본: 오늘)
//
// 4 capture 테이블에서 (월·일) 동일한 기록을 연도별 그룹핑.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const dateParam = new URL(req.url).searchParams.get("date");
    const ref = dateParam ?? new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());

    const [yyyy, mm, dd] = ref.split("-");
    const monthDay = `${mm}-${dd}`;
    const currentYear = parseInt(yyyy, 10);

    const admin = createAdminClient();

    // SQL: WHERE TO_CHAR(date, 'MM-DD') = '05-04' AND date < ref
    // Supabase에서 raw RPC가 가장 깔끔. 일단 client-side filter로 fetch (성능은 추후 개선).
    const { data: moments } = await admin
        .from("myverse_daily_moments")
        .select("id, date, happened_at, caption, media_url, media_type, domain")
        .eq("member_id", memberId)
        .lt("date", ref)
        .order("date", { ascending: false })
        .limit(1000);

    const { data: routines } = await admin
        .from("myverse_daily_routines")
        .select("id, date, start_time, activity, domain, body_subtype")
        .eq("member_id", memberId)
        .lt("date", ref)
        .order("date", { ascending: false })
        .limit(1000);

    const { data: calendar } = await admin
        .from("myverse_calendar_entries")
        .select("id, date, title, kind, domain")
        .eq("member_id", memberId)
        .lt("date", ref)
        .order("date", { ascending: false })
        .limit(1000);

    type AnyItem = { type: string; date: string; year: number; [k: string]: unknown };
    const items: AnyItem[] = [];
    function pushIfMatch(rows: unknown[], type: string) {
        for (const r of rows as Array<{ date: string }>) {
            if (!r?.date) continue;
            const d = r.date;
            const year = parseInt(d.slice(0, 4), 10);
            const md = d.slice(5);
            if (md === monthDay && year < currentYear) {
                items.push({ type, year, ...r });
            }
        }
    }
    pushIfMatch(moments ?? [], "moment");
    pushIfMatch(routines ?? [], "routine");
    pushIfMatch(calendar ?? [], "calendar");

    // 연도별 그룹핑
    const byYear: Record<number, AnyItem[]> = {};
    for (const it of items) {
        byYear[it.year] ??= [];
        byYear[it.year].push(it);
    }

    const groups = Object.entries(byYear)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([year, arr]) => ({
            year: parseInt(year),
            years_ago: currentYear - parseInt(year),
            items: arr,
        }));

    return NextResponse.json({
        date: ref,
        month_day: monthDay,
        groups,
    });
}

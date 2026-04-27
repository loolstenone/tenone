import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import type { CalendarKind } from "@/lib/planners/calendar-rules";

export const dynamic = "force-dynamic";

const VALID_KINDS: CalendarKind[] = ["anniversary", "meeting", "task", "public_holiday", "solar_term"];
const VALID_RECURRENCE = ["none", "daily", "weekly", "monthly", "yearly"];
const VALID_STATUS = ["todo", "done", "carried", "canceled"];

/**
 * GET /api/planners/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&kinds=meeting,task
 * 반복 엔트리는 클라이언트가 expandOccurrences() 로 펼침.
 * — 서버는 원본 row 만 반환 (반복 시작일이 to 이후면 제외).
 */
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const kinds = url.searchParams.get("kinds")?.split(",").filter((k): k is CalendarKind => (VALID_KINDS as string[]).includes(k));

    const admin = createAdminClient();

    // 사용자 country_pref 조회 (시스템 엔트리 필터)
    const { data: prefRow } = await admin
        .from("planners_users")
        .select("country_pref")
        .eq("member_id", memberId)
        .maybeSingle();
    const countries: string[] = Array.isArray(prefRow?.country_pref) && prefRow.country_pref.length > 0
        ? prefRow.country_pref
        : ["KR"];

    // 본인 엔트리 + 선호 국가 시스템 엔트리
    let q = admin
        .from("planners_calendar_entries")
        .select("*")
        .or(`member_id.eq.${memberId},and(member_id.is.null,country.in.(${countries.join(",")}))`);

    if (from && to) {
        q = q.or(`recurrence.neq.none,and(start_date.gte.${from},start_date.lte.${to})`);
    }
    if (kinds && kinds.length > 0) {
        q = q.in("kind", kinds);
    }
    q = q.order("start_date", { ascending: true });

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entries: data ?? [] });
}

/**
 * POST /api/planners/calendar — 신규 엔트리 생성
 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const {
        kind, title, description,
        start_date, start_time, end_time,
        recurrence, recurrence_until,
        status, color, country,
    } = body as Record<string, unknown>;

    if (!kind || !(VALID_KINDS as string[]).includes(kind as string)) {
        return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "missing_title" }, { status: 400 });
    }
    if (!start_date || typeof start_date !== "string") {
        return NextResponse.json({ error: "missing_start_date" }, { status: 400 });
    }
    const rec = (typeof recurrence === "string" && VALID_RECURRENCE.includes(recurrence)) ? recurrence : "none";
    const st = (typeof status === "string" && VALID_STATUS.includes(status)) ? status : null;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_calendar_entries")
        .insert({
            member_id: memberId,
            kind,
            title: (title as string).trim().slice(0, 200),
            description: typeof description === "string" ? description.slice(0, 4000) : null,
            start_date,
            start_time: typeof start_time === "string" && start_time ? start_time : null,
            end_time:   typeof end_time   === "string" && end_time   ? end_time   : null,
            recurrence: rec,
            recurrence_until: typeof recurrence_until === "string" && recurrence_until ? recurrence_until : null,
            status: st,
            color: typeof color === "string" ? color : null,
            country: typeof country === "string" ? country : null,
        })
        .select()
        .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "insert_failed" }, { status: 500 });
    return NextResponse.json({ entry: data });
}

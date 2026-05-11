// Google Calendar 이벤트 쓰기 API — 2-way sync
// POST   { summary, start, end, description?, location? }   생성
// PATCH  { external_id, ...patch }                          수정
// DELETE ?external_id=xxx                                   삭제

import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { getValidAccessToken } from "@/lib/myverse/google-calendar";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const GOOGLE_CAL_API = "https://www.googleapis.com/calendar/v3";

interface EventInput {
    summary: string;
    description?: string;
    location?: string;
    start: string;  // ISO 8601
    end: string;    // ISO 8601
    is_all_day?: boolean;
}

function buildGoogleEvent(input: EventInput) {
    const tz = "Asia/Seoul";
    if (input.is_all_day) {
        return {
            summary: input.summary,
            description: input.description,
            location: input.location,
            start: { date: input.start.slice(0, 10) },
            end: { date: input.end.slice(0, 10) },
        };
    }
    return {
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: { dateTime: input.start, timeZone: tz },
        end: { dateTime: input.end, timeZone: tz },
    };
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    const body = await req.json().catch(() => ({})) as EventInput;
    if (!body.summary || !body.start || !body.end) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buildGoogleEvent(body)),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        return NextResponse.json({ error: "google_api_error", detail: txt }, { status: res.status });
    }
    const ev = await res.json();

    // 로컬 캐시에도 즉시 반영
    const admin = createAdminClient();
    await admin.from("myverse_external_events").upsert({
        member_id: memberId,
        provider: "google_calendar",
        external_id: ev.id,
        summary: ev.summary,
        description: ev.description ?? null,
        location: ev.location ?? null,
        start_at: ev.start?.dateTime ?? (ev.start?.date ? `${ev.start.date}T00:00:00Z` : null),
        end_at: ev.end?.dateTime ?? (ev.end?.date ? `${ev.end.date}T00:00:00Z` : null),
        is_all_day: !!ev.start?.date,
        html_link: ev.htmlLink ?? null,
        fetched_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider,external_id" });

    return NextResponse.json({ event: ev });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    const body = await req.json().catch(() => ({})) as EventInput & { external_id: string };
    if (!body.external_id) return NextResponse.json({ error: "missing_external_id" }, { status: 400 });

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events/${encodeURIComponent(body.external_id)}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buildGoogleEvent(body)),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        return NextResponse.json({ error: "google_api_error", detail: txt }, { status: res.status });
    }
    const ev = await res.json();
    return NextResponse.json({ event: ev });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    const url = new URL(req.url);
    const externalId = url.searchParams.get("external_id");
    if (!externalId) return NextResponse.json({ error: "missing_external_id" }, { status: 400 });

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events/${encodeURIComponent(externalId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    // 204 = success, 410 = already deleted (ok)
    if (!res.ok && res.status !== 410) {
        const txt = await res.text().catch(() => "");
        return NextResponse.json({ error: "google_api_error", detail: txt }, { status: res.status });
    }

    const admin = createAdminClient();
    await admin
        .from("myverse_external_events")
        .delete()
        .eq("member_id", memberId)
        .eq("provider", "google_calendar")
        .eq("external_id", externalId);

    return NextResponse.json({ ok: true });
}

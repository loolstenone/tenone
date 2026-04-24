// iCal 연동 — Apple Calendar · Outlook iCal feed (read-only)
// webcal:// URL을 https:// 로 변환해 .ics 파일을 fetch + 파싱

import { createAdminClient } from "@/lib/supabase/admin";

function normalizeUrl(url: string): string {
    return url.replace(/^webcal:\/\//i, "https://");
}

/**
 * DTSTART / DTEND 값을 ISO string으로 변환
 * 가능한 형식:
 *   - DTSTART;VALUE=DATE:20260424          → 종일 이벤트
 *   - DTSTART;TZID=Asia/Seoul:20260424T090000
 *   - DTSTART:20260424T090000Z
 */
function parseIcalDate(value: string, params: string): { iso: string; allDay: boolean } {
    const isAllDay = params.includes("VALUE=DATE") || /^\d{8}$/.test(value);
    if (isAllDay) {
        const y = value.slice(0, 4), m = value.slice(4, 6), d = value.slice(6, 8);
        return { iso: `${y}-${m}-${d}T00:00:00Z`, allDay: true };
    }
    if (value.endsWith("Z")) {
        const y = value.slice(0, 4), mo = value.slice(4, 6), d = value.slice(6, 8);
        const h = value.slice(9, 11), mi = value.slice(11, 13), s = value.slice(13, 15);
        return { iso: `${y}-${mo}-${d}T${h}:${mi}:${s}Z`, allDay: false };
    }
    const y = value.slice(0, 4), mo = value.slice(4, 6), d = value.slice(6, 8);
    const h = value.slice(9, 11), mi = value.slice(11, 13), s = value.slice(13, 15);
    return { iso: `${y}-${mo}-${d}T${h}:${mi}:${s}`, allDay: false };
}

interface IcalEvent {
    uid: string;
    summary: string;
    dtstart: string;
    dtend: string | null;
    isAllDay: boolean;
    description: string | null;
    location: string | null;
    url: string | null;
}

function parseIcs(text: string): IcalEvent[] {
    const events: IcalEvent[] = [];
    const lines = text.replace(/\r\n /g, "").replace(/\r\n/g, "\n").split("\n");

    let inEvent = false;
    let current: Partial<IcalEvent & { dtstart_raw?: string; dtend_raw?: string; dtstart_params?: string; dtend_params?: string }> = {};

    for (const line of lines) {
        if (line === "BEGIN:VEVENT") {
            inEvent = true;
            current = {};
            continue;
        }
        if (line === "END:VEVENT" && inEvent) {
            inEvent = false;
            if (current.uid && current.dtstart_raw) {
                const start = parseIcalDate(current.dtstart_raw, current.dtstart_params || "");
                const end = current.dtend_raw
                    ? parseIcalDate(current.dtend_raw, current.dtend_params || "")
                    : null;
                events.push({
                    uid: current.uid,
                    summary: current.summary || "(제목 없음)",
                    dtstart: start.iso,
                    dtend: end?.iso ?? null,
                    isAllDay: start.allDay,
                    description: current.description ?? null,
                    location: current.location ?? null,
                    url: current.url ?? null,
                });
            }
            continue;
        }
        if (!inEvent) continue;

        const colonIdx = line.indexOf(":");
        if (colonIdx < 0) continue;
        const keyPart = line.slice(0, colonIdx);
        const val = line.slice(colonIdx + 1).trim();

        const [key, ...paramParts] = keyPart.split(";");
        const params = paramParts.join(";");

        switch (key.toUpperCase()) {
            case "UID": current.uid = val; break;
            case "SUMMARY": current.summary = val; break;
            case "DESCRIPTION": current.description = val; break;
            case "LOCATION": current.location = val; break;
            case "URL": current.url = val; break;
            case "DTSTART":
                current.dtstart_raw = val;
                current.dtstart_params = params;
                break;
            case "DTEND":
                current.dtend_raw = val;
                current.dtend_params = params;
                break;
        }
    }
    return events;
}

export async function verifyFeedUrl(url: string): Promise<{ ok: boolean; eventCount?: number; error?: string }> {
    const normalized = normalizeUrl(url);
    try {
        const res = await fetch(normalized, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return { ok: false, error: `http_${res.status}` };
        const text = await res.text();
        if (!text.includes("BEGIN:VCALENDAR")) return { ok: false, error: "not_ical" };
        const events = parseIcs(text);
        return { ok: true, eventCount: events.length };
    } catch {
        return { ok: false, error: "fetch_failed" };
    }
}

export async function syncIcalEvents(memberId: string): Promise<{ synced: number; error?: string }> {
    const admin = createAdminClient();

    const { data: integ } = await admin
        .from("planners_integrations")
        .select("access_token")
        .eq("member_id", memberId)
        .eq("provider", "ical")
        .eq("status", "active")
        .maybeSingle();

    if (!integ?.access_token) return { synced: 0, error: "not_connected" };

    const url = normalizeUrl(integ.access_token);
    let text: string;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) return { synced: 0, error: `http_${res.status}` };
        text = await res.text();
    } catch {
        return { synced: 0, error: "fetch_failed" };
    }

    const allEvents = parseIcs(text);

    // 과거 7일 ~ 향후 90일 필터
    const now = Date.now();
    const minMs = now - 7 * 86400000;
    const maxMs = now + 90 * 86400000;
    const events = allEvents.filter((e) => {
        const ms = new Date(e.dtstart).getTime();
        return ms >= minMs && ms <= maxMs;
    });

    if (events.length > 0) {
        const rows = events.map((e) => ({
            member_id: memberId,
            provider: "ical",
            external_id: e.uid,
            summary: e.summary,
            description: e.description,
            location: e.location,
            start_at: e.dtstart,
            end_at: e.dtend,
            is_all_day: e.isAllDay,
            html_link: e.url,
            fetched_at: new Date().toISOString(),
        }));
        await admin.from("planners_external_events").upsert(rows, {
            onConflict: "member_id,provider,external_id",
        });
    }

    await admin
        .from("planners_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", "ical");

    return { synced: events.length };
}

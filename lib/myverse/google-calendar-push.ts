// myverse_calendar_entries ↔ Google Calendar 양방향 동기화 헬퍼
// Google 미연결 시 silently fail — 로컬 저장은 영향받지 않음

import { getValidAccessToken } from "@/lib/myverse/google-calendar";

const GOOGLE_CAL_API = "https://www.googleapis.com/calendar/v3";

interface MyverseEntry {
    title: string;
    description?: string | null;
    location?: string | null;
    start_date: string;            // YYYY-MM-DD
    start_time?: string | null;    // HH:MM:SS or HH:MM
    end_time?: string | null;
    google_event_id?: string | null;
}

const TZ = "Asia/Seoul";

function toIso(date: string, time: string | null | undefined): string | null {
    if (!time) return null;
    const t = time.length === 5 ? `${time}:00` : time;
    return `${date}T${t}`;
}

function buildGooglePayload(e: MyverseEntry) {
    const allDay = !e.start_time;
    if (allDay) {
        // 종일 — date 만
        // Google end.date는 exclusive (다음 날) — 단일 종일은 다음날
        const start = e.start_date;
        const endDate = new Date(`${start}T00:00:00`);
        endDate.setDate(endDate.getDate() + 1);
        const end = endDate.toISOString().slice(0, 10);
        return {
            summary: e.title,
            description: e.description ?? undefined,
            location: e.location ?? undefined,
            start: { date: start },
            end: { date: end },
        };
    }
    const startIso = toIso(e.start_date, e.start_time)!;
    const endIso = toIso(e.start_date, e.end_time) ?? toIso(e.start_date, e.start_time)!;
    return {
        summary: e.title,
        description: e.description ?? undefined,
        location: e.location ?? undefined,
        start: { dateTime: startIso, timeZone: TZ },
        end: { dateTime: endIso, timeZone: TZ },
    };
}

/** Google에 이벤트 생성 — 토큰 없으면 null 반환 (silent fail) */
export async function pushToGoogle(memberId: string, entry: MyverseEntry): Promise<string | null> {
    const token = await getValidAccessToken(memberId);
    if (!token) return null;

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(buildGooglePayload(entry)),
    });
    if (!res.ok) {
        console.error("[google-calendar-push] create failed:", await res.text().catch(() => ""));
        return null;
    }
    const ev = await res.json();
    return (ev?.id as string) ?? null;
}

/** Google 이벤트 수정 */
export async function updateOnGoogle(memberId: string, entry: MyverseEntry & { google_event_id: string }): Promise<boolean> {
    const token = await getValidAccessToken(memberId);
    if (!token) return false;

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events/${encodeURIComponent(entry.google_event_id)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(buildGooglePayload(entry)),
    });
    if (!res.ok) {
        console.error("[google-calendar-push] update failed:", await res.text().catch(() => ""));
        return false;
    }
    return true;
}

/** Google 이벤트 삭제 */
export async function deleteOnGoogle(memberId: string, googleEventId: string): Promise<boolean> {
    const token = await getValidAccessToken(memberId);
    if (!token) return false;

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events/${encodeURIComponent(googleEventId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    // 410 = already deleted (ok)
    if (!res.ok && res.status !== 410) {
        console.error("[google-calendar-push] delete failed:", await res.text().catch(() => ""));
        return false;
    }
    return true;
}

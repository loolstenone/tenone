// Myverse AI — Google Calendar 연동
// OAuth 2.0 flow + 이벤트 fetch + 토큰 refresh

import { createAdminClient } from "@/lib/supabase/admin";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CAL_API = "https://www.googleapis.com/calendar/v3";

const SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",      // 답장·새 메일 작성
    "https://www.googleapis.com/auth/gmail.modify",    // archive·읽음 동기화 (UNREAD/INBOX 라벨 제거)
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

export function getClientConfig(): { clientId: string; clientSecret: string; redirectUri: string } | null {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://myverse.kr";
    return {
        clientId,
        clientSecret,
        redirectUri: `${baseUrl}/api/myverse/integrations/google/callback`,
    };
}

export function buildAuthUrl(state: string): string | null {
    const cfg = getClientConfig();
    if (!cfg) return null;

    const params = new URLSearchParams({
        client_id: cfg.clientId,
        redirect_uri: cfg.redirectUri,
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES.join(" "),
        state,
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse | null> {
    const cfg = getClientConfig();
    if (!cfg) return null;

    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            redirect_uri: cfg.redirectUri,
            grant_type: "authorization_code",
        }),
    });
    if (!res.ok) {
        console.error("Google token exchange failed", await res.text().catch(() => ""));
        return null;
    }
    return await res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
    const cfg = getClientConfig();
    if (!cfg) return null;

    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            grant_type: "refresh_token",
        }),
    });
    if (!res.ok) return null;
    return await res.json();
}

export async function fetchUserInfo(accessToken: string): Promise<{ email: string; name: string } | null> {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
}

/**
 * 유효한 access_token 확보 (필요 시 refresh)
 */
export async function getValidAccessToken(memberId: string): Promise<string | null> {
    const admin = createAdminClient();
    const { data: integ } = await admin
        .from("myverse_integrations")
        .select("*")
        .eq("member_id", memberId)
        .eq("provider", "google_calendar")
        .eq("status", "active")
        .maybeSingle();

    if (!integ || !integ.access_token) return null;

    const isExpired = integ.expires_at && new Date(integ.expires_at) < new Date(Date.now() + 60_000);
    if (!isExpired) return integ.access_token;

    if (!integ.refresh_token) return null;

    const refreshed = await refreshAccessToken(integ.refresh_token);
    if (!refreshed) {
        await admin
            .from("myverse_integrations")
            .update({ status: "expired", updated_at: new Date().toISOString() })
            .eq("id", integ.id);
        return null;
    }

    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await admin
        .from("myverse_integrations")
        .update({
            access_token: refreshed.access_token,
            expires_at: newExpiresAt,
            updated_at: new Date().toISOString(),
        })
        .eq("id", integ.id);

    return refreshed.access_token;
}

interface GoogleEvent {
    id: string;
    summary?: string;
    description?: string;
    location?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    htmlLink?: string;
}

/**
 * 지정 기간 이벤트 fetch + DB 캐시
 */
export async function syncEvents(
    memberId: string,
    timeMin: string,
    timeMax: string
): Promise<{ synced: number; error?: string }> {
    const token = await getValidAccessToken(memberId);
    if (!token) return { synced: 0, error: "no_token" };

    const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
    });

    const res = await fetch(`${GOOGLE_CAL_API}/calendars/primary/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { synced: 0, error: `http_${res.status}` };

    const data = await res.json();
    const items: GoogleEvent[] = data.items || [];

    const admin = createAdminClient();
    const rows = items.map((ev) => ({
        member_id: memberId,
        provider: "google_calendar",
        external_id: ev.id,
        summary: ev.summary || "(제목 없음)",
        description: ev.description || null,
        location: ev.location || null,
        start_at: ev.start?.dateTime || (ev.start?.date ? `${ev.start.date}T00:00:00Z` : null),
        end_at: ev.end?.dateTime || (ev.end?.date ? `${ev.end.date}T00:00:00Z` : null),
        is_all_day: !!ev.start?.date,
        html_link: ev.htmlLink || null,
        fetched_at: new Date().toISOString(),
    })).filter((r) => r.start_at !== null);

    if (rows.length > 0) {
        await admin.from("myverse_external_events").upsert(rows, {
            onConflict: "member_id,provider,external_id",
        });
    }

    await admin
        .from("myverse_integrations")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", "google_calendar");

    return { synced: rows.length };
}

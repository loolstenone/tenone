/**
 * Google Calendar API 통합 모듈
 *
 * OAuth2 인증 플로우 + Calendar CRUD + Orbi 동기화
 * 환경변수: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 */

// ─── 타입 정의 ────────────────────────────────────────────────

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  status: string;
  htmlLink: string;
  attendees?: { email: string; responseStatus: string }[];
  created: string;
  updated: string;
}

export interface GoogleCalendarListResponse {
  kind: string;
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

export interface CalendarSyncResult {
  synced: number;
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
}

// ─── 환경변수 헬퍼 ────────────────────────────────────────────

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

function ensureConfig() {
  const config = getGoogleConfig();
  if (!config) {
    throw new Error(
      'Google API 설정 누락: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI 환경변수를 확인하세요.'
    );
  }
  return config;
}

// ─── OAuth2 플로우 ────────────────────────────────────────────

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

/**
 * Google OAuth2 인증 URL 생성
 * @param state - CSRF 보호용 state 파라미터 (userId 등)
 */
export function getAuthUrl(state?: string): string {
  const config = ensureConfig();

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline', // refresh_token 발급을 위해
    prompt: 'consent', // 매번 동의 화면 (refresh_token 보장)
  });

  if (state) {
    params.set('state', state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Authorization code를 토큰으로 교환
 */
export async function exchangeCode(code: string): Promise<GoogleTokens> {
  const config = ensureConfig();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Google 토큰 교환 실패: ${err.error_description || res.statusText}`);
  }

  return res.json();
}

/**
 * Refresh token으로 새 access token 발급
 */
export async function refreshToken(refreshTokenStr: string): Promise<GoogleTokens> {
  const config = ensureConfig();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshTokenStr,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Google 토큰 갱신 실패: ${err.error_description || res.statusText}`);
  }

  return res.json();
}

// ─── Calendar API CRUD ────────────────────────────────────────

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * 인증 헤더 생성
 */
function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * 캘린더 이벤트 목록 조회
 */
export async function listEvents(
  accessToken: string,
  options?: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    pageToken?: string;
  }
): Promise<GoogleCalendarListResponse> {
  const calendarId = encodeURIComponent(options?.calendarId || 'primary');
  const params = new URLSearchParams();

  if (options?.timeMin) params.set('timeMin', options.timeMin);
  if (options?.timeMax) params.set('timeMax', options.timeMax);
  if (options?.maxResults) params.set('maxResults', String(options.maxResults));
  if (options?.pageToken) params.set('pageToken', options.pageToken);
  params.set('singleEvents', 'true');
  params.set('orderBy', 'startTime');

  const url = `${CALENDAR_BASE}/calendars/${calendarId}/events?${params.toString()}`;
  const res = await fetch(url, { headers: authHeaders(accessToken) });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`캘린더 이벤트 조회 실패: ${err.error?.message || res.statusText}`);
  }

  return res.json();
}

/**
 * 캘린더 이벤트 생성
 */
export async function createEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    attendees?: { email: string }[];
  },
  calendarId = 'primary'
): Promise<GoogleCalendarEvent> {
  const id = encodeURIComponent(calendarId);
  const url = `${CALENDAR_BASE}/calendars/${id}/events`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`캘린더 이벤트 생성 실패: ${err.error?.message || res.statusText}`);
  }

  return res.json();
}

/**
 * 캘린더 이벤트 수정
 */
export async function updateEvent(
  accessToken: string,
  eventId: string,
  updates: Partial<{
    summary: string;
    description: string;
    location: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    attendees: { email: string }[];
  }>,
  calendarId = 'primary'
): Promise<GoogleCalendarEvent> {
  const cid = encodeURIComponent(calendarId);
  const eid = encodeURIComponent(eventId);
  const url = `${CALENDAR_BASE}/calendars/${cid}/events/${eid}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`캘린더 이벤트 수정 실패: ${err.error?.message || res.statusText}`);
  }

  return res.json();
}

/**
 * 캘린더 이벤트 삭제
 */
export async function deleteEvent(
  accessToken: string,
  eventId: string,
  calendarId = 'primary'
): Promise<void> {
  const cid = encodeURIComponent(calendarId);
  const eid = encodeURIComponent(eventId);
  const url = `${CALENDAR_BASE}/calendars/${cid}/events/${eid}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!res.ok && res.status !== 410) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`캘린더 이벤트 삭제 실패: ${err.error?.message || res.statusText}`);
  }
}

// ─── Orbi 동기화 ──────────────────────────────────────────────

/**
 * Google Calendar 이벤트를 WIO events 테이블에 동기화
 * - Supabase 클라이언트를 인자로 받아 서버/클라이언트 모두 사용 가능
 */
export async function syncCalendarToOrbi(
  accessToken: string,
  supabase: {
    from: (table: string) => {
      select: (cols: string) => { eq: (col: string, val: string) => { data: unknown; error: unknown } };
      upsert: (data: unknown, opts?: unknown) => { error: unknown };
      delete: () => { in: (col: string, vals: string[]) => { eq: (col: string, val: string) => { error: unknown } } };
    };
  },
  options: {
    userId: string;
    brandId: string;
    calendarId?: string;
    syncDays?: number; // 기본 30일
  }
): Promise<CalendarSyncResult> {
  const result: CalendarSyncResult = { synced: 0, created: 0, updated: 0, deleted: 0, errors: [] };

  try {
    // 동기화 기간 설정
    const days = options.syncDays || 30;
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 7); // 일주일 전부터
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);

    // Google Calendar에서 이벤트 가져오기
    const calEvents = await listEvents(accessToken, {
      calendarId: options.calendarId || 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 250,
    });

    if (!calEvents.items?.length) {
      return result;
    }

    // WIO events 테이블에 upsert
    const eventsToUpsert = calEvents.items.map((ev) => ({
      external_id: ev.id,
      external_source: 'google_calendar',
      brand_id: options.brandId,
      created_by: options.userId,
      title: ev.summary || '(제목 없음)',
      description: ev.description || null,
      location: ev.location || null,
      start_at: ev.start.dateTime || ev.start.date || null,
      end_at: ev.end.dateTime || ev.end.date || null,
      all_day: !ev.start.dateTime,
      status: ev.status === 'cancelled' ? 'cancelled' : 'confirmed',
      google_event_id: ev.id,
      google_html_link: ev.htmlLink,
      synced_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('wio_events')
      .upsert(eventsToUpsert, { onConflict: 'external_id,external_source,brand_id' } as unknown);

    if (upsertError) {
      result.errors.push(`이벤트 저장 실패: ${String(upsertError)}`);
    } else {
      result.synced = eventsToUpsert.length;
    }

    // 삭제된 이벤트 처리: Google에 없는 기존 이벤트 제거
    const googleIds = calEvents.items.map((ev) => ev.id);
    const { data: existing } = await supabase
      .from('wio_events')
      .select('external_id')
      .eq('external_source', 'google_calendar') as { data: { external_id: string }[] | null; error: unknown };

    if (existing) {
      const toDelete = existing
        .map((e) => e.external_id)
        .filter((id) => !googleIds.includes(id));

      if (toDelete.length > 0) {
        const { error: delError } = await supabase
          .from('wio_events')
          .delete()
          .in('external_id', toDelete)
          .eq('brand_id', options.brandId);

        if (delError) {
          result.errors.push(`삭제 동기화 실패: ${String(delError)}`);
        } else {
          result.deleted = toDelete.length;
        }
      }
    }
  } catch (err) {
    result.errors.push(`동기화 중 오류: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

// ─── 유틸리티 ─────────────────────────────────────────────────

/**
 * Google Calendar 설정 가능 여부 확인
 */
export function isGoogleCalendarConfigured(): boolean {
  return getGoogleConfig() !== null;
}

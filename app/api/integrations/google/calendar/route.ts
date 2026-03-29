/**
 * Google Calendar API 프록시
 *
 * GET:  이벤트 목록 조회
 * POST: 이벤트 생성
 *
 * 프론트엔드에서 직접 Google API를 호출하지 않고,
 * 서버를 통해 토큰 관리와 API 호출을 처리
 */

import { NextRequest } from 'next/server';
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  refreshToken,
} from '@/lib/integrations/google-calendar';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, successResponse } from '@/lib/supabase/api-utils';

// ─── 토큰 조회 및 갱신 헬퍼 ────────────────────────────────────

async function getValidAccessToken(userId: string, brandId = 'default') {
  const supabase = await createClient();

  // DB에서 토큰 조회
  const { data: integration, error } = await supabase
    .from('wio_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_calendar')
    .eq('brand_id', brandId)
    .single();

  if (error || !integration) {
    return { token: null, error: 'Google Calendar이 연동되지 않았습니다.' };
  }

  // 토큰 만료 체크 (5분 여유)
  const expiresAt = new Date(integration.token_expires_at).getTime();
  const now = Date.now();

  if (now > expiresAt - 5 * 60 * 1000) {
    // 토큰 갱신
    if (!integration.refresh_token) {
      return { token: null, error: 'refresh_token이 없습니다. 재인증이 필요합니다.' };
    }

    try {
      const newTokens = await refreshToken(integration.refresh_token);

      // 갱신된 토큰 저장
      await supabase
        .from('wio_integrations')
        .update({
          access_token: newTokens.access_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('provider', 'google_calendar')
        .eq('brand_id', brandId);

      return { token: newTokens.access_token, error: null };
    } catch (err) {
      return {
        token: null,
        error: `토큰 갱신 실패: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return { token: integration.access_token as string, error: null };
}

// ─── GET: 이벤트 목록 ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('인증되지 않은 요청입니다.', 401);
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || 'default';
    const calendarId = searchParams.get('calendarId') || 'primary';
    const timeMin = searchParams.get('timeMin') || undefined;
    const timeMax = searchParams.get('timeMax') || undefined;
    const maxResults = searchParams.get('maxResults')
      ? parseInt(searchParams.get('maxResults')!)
      : undefined;

    const { token, error: tokenError } = await getValidAccessToken(user.id, brandId);
    if (!token) {
      return errorResponse(tokenError || 'Google Calendar 토큰을 가져올 수 없습니다.', 401);
    }

    const events = await listEvents(token, { calendarId, timeMin, timeMax, maxResults });

    return successResponse({
      events: events.items || [],
      nextPageToken: events.nextPageToken,
    });
  } catch (err) {
    console.error('Google Calendar GET 오류:', err);
    return errorResponse(
      err instanceof Error ? err.message : '이벤트 조회 중 오류가 발생했습니다.',
      500
    );
  }
}

// ─── POST: 이벤트 CRUD ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('인증되지 않은 요청입니다.', 401);
    }

    const body = await request.json();
    const { action, brandId = 'default', calendarId = 'primary', ...payload } = body;

    const { token, error: tokenError } = await getValidAccessToken(user.id, brandId);
    if (!token) {
      return errorResponse(tokenError || 'Google Calendar 토큰을 가져올 수 없습니다.', 401);
    }

    switch (action) {
      case 'create': {
        const { event } = payload;
        if (!event?.summary || !event?.start || !event?.end) {
          return errorResponse('이벤트 제목, 시작/종료 시간이 필요합니다.', 400);
        }
        const created = await createEvent(token, event, calendarId);
        return successResponse({ event: created }, 201);
      }

      case 'update': {
        const { eventId, updates } = payload;
        if (!eventId || !updates) {
          return errorResponse('eventId와 updates가 필요합니다.', 400);
        }
        const updated = await updateEvent(token, eventId, updates, calendarId);
        return successResponse({ event: updated });
      }

      case 'delete': {
        const { eventId: delId } = payload;
        if (!delId) {
          return errorResponse('eventId가 필요합니다.', 400);
        }
        await deleteEvent(token, delId, calendarId);
        return successResponse({ deleted: true });
      }

      default:
        return errorResponse(
          `지원하지 않는 action입니다: ${action}. (create, update, delete 중 선택)`,
          400
        );
    }
  } catch (err) {
    console.error('Google Calendar POST 오류:', err);
    return errorResponse(
      err instanceof Error ? err.message : '이벤트 처리 중 오류가 발생했습니다.',
      500
    );
  }
}

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createHitSession } from '@/lib/supabase/hit';

// 간단한 인메모리 rate limiter (IP 기반, 분당 5회)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    if (!checkRateLimit(ip)) {
      return errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', 429);
    }

    const body = await request.json();

    // 허니팟 봇 방지: _hp 필드가 채워져 있으면 봇
    if (body._hp) {
      return successResponse({ sessionId: 'fake', sessionToken: 'fake' }, 201);
    }

    // 최소 시간 체크: 페이지 로드 후 2초 이내 요청은 봇 의심
    if (body._ts && Date.now() - body._ts < 2000) {
      return successResponse({ sessionId: 'fake', sessionToken: 'fake' }, 201);
    }

    const session = await createHitSession('A', body.memberId);

    return successResponse({
      sessionId: session.id,
      sessionToken: session.session_token,
    }, 201);
  } catch (error) {
    console.error('[HIT A Session] 생성 오류:', error);
    const message = error instanceof Error ? error.message : '세션 생성 실패';
    return errorResponse(message, 500);
  }
}

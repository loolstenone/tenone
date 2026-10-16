/**
 * One ID 첫 방문 자동 확인 (2026-10-16 사용자 결정 A안) — middleware에서 실행
 *
 * 독립 도메인(rook.co.kr·hero.ne.kr·planners.ai.kr …)에 즐겨찾기·검색·카톡 링크로 바로 들어오면
 * 그 도메인에는 세션이 없어 비로그인으로 보였다 (유니버스 안 링크는 CrossSiteLink가 허브를 거쳐 넘겨 준다).
 * → 이 브라우저에서 처음 보는 화면 요청일 때 허브(auth.tenone.biz)를 한 번 조용히 거쳐 온다.
 *    허브에 로그인 있음 → exchange로 이 도메인 세션 생성 / 없음 → return으로 원래 화면 (로그인 창은 열지 않음)
 *
 * 무한 왕복 방지: 보내는 순간 t1_sso_auto(6시간)를 심는다 — 허브가 실패해도 다시 보내지 않는다.
 *   (10-15 planners.ai.kr 교환 반복 → Supabase 429 사고. t1_sso_none·t1_sso_done도 존중)
 * 보내지 않는 요청: 프로덕션 아님 · tenone.biz 계열(쿠키 공유) · 화면 이동이 아닌 요청(API·RSC·prefetch·자산) · 검색엔진·링크 미리보기 로봇 · 이미 세션 쿠키 있음
 */
import { NextResponse, type NextRequest } from 'next/server';
import { isExternalDomain } from '@/lib/domain-registry';

export const SSO_AUTO_COOKIE = 't1_sso_auto';
const SSO_AUTO_MAX_AGE = 60 * 60 * 6;
const HUB_INITIATE = 'https://auth.tenone.biz/api/sso/initiate';
/** Supabase 세션 쿠키 이름 접두사 (createServerClient storageKey 'tenone-auth', 기본 sb-) */
const SESSION_COOKIE = /^(tenone-auth|sb-)/;
const BOT_UA = /bot|crawl|spider|slurp|yeti|daum|kakaotalk-scrap|facebookexternalhit|preview|headless|lighthouse|vercel/i;

export function autoSsoRedirect(request: NextRequest, host: string, isPrefetch: boolean): NextResponse | null {
    if (process.env.VERCEL_ENV !== 'production') return null;
    if (request.method !== 'GET' || isPrefetch) return null;
    if (!isExternalDomain(host)) return null;

    const path = request.nextUrl.pathname;
    if (/^\/(api|auth|_next)\//.test(path) || path.includes('.')) return null;

    // 사람이 주소창·링크로 화면을 여는 요청만
    const mode = request.headers.get('sec-fetch-mode');
    const dest = request.headers.get('sec-fetch-dest');
    if (mode && mode !== 'navigate') return null;
    if (dest && dest !== 'document') return null;
    if (!mode && !(request.headers.get('accept') ?? '').includes('text/html')) return null;
    if (BOT_UA.test(request.headers.get('user-agent') ?? '')) return null;

    const cookies = request.cookies.getAll();
    if (cookies.some(c => c.name === SSO_AUTO_COOKIE || c.name === 't1_sso_none' || c.name === 't1_sso_done')) return null;
    if (cookies.some(c => SESSION_COOKIE.test(c.name))) return null;

    const url = new URL(HUB_INITIATE);
    url.searchParams.set('origin', `https://${host}`);
    url.searchParams.set('final', `${path}${request.nextUrl.search}`);
    const res = NextResponse.redirect(url, 307);
    res.cookies.set(SSO_AUTO_COOKIE, '1', { path: '/', maxAge: SSO_AUTO_MAX_AGE, sameSite: 'lax', secure: true });
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
}

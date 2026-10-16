import { NextRequest } from 'next/server';
import { getSiteSeoSettings, resolveHost, robotsText } from '@/lib/site-seo';

/** 도메인별 robots.txt (2026-10-16) — 공통 규칙 + 인트라 설정(ums_sites.robots_extra) + 그 도메인 사이트맵 (lib/site-seo.ts) */
export const revalidate = 3600;

export async function GET(request: NextRequest) {
    const site = resolveHost(request.headers.get('host') ?? 'www.tenone.biz');
    const body = robotsText(site, await getSiteSeoSettings(site.siteId));
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' } });
}

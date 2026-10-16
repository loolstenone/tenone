import { NextRequest } from 'next/server';
import { getSiteSeoSettings, resolveHost } from '@/lib/site-seo';

/** 도메인별 llms.txt (2026-10-16) — 인트라 › 사이트 설정 › 인공지능 최적화에서 쓴 본문 (ums_sites.llms_txt). 비우면 404 */
export const revalidate = 3600;

export async function GET(request: NextRequest) {
    const site = resolveHost(request.headers.get('host') ?? 'www.tenone.biz');
    const { llms_txt, is_open } = await getSiteSeoSettings(site.siteId);
    if (!site.indexable || is_open === false || !llms_txt?.trim()) return new Response('Not found', { status: 404 });
    return new Response(llms_txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' } });
}

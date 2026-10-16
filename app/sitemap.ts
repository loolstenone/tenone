import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { brandSitemap, getSiteSeoSettings, ownedByBrandDomain, resolveHost } from '@/lib/site-seo';

/**
 * 도메인별 사이트맵 (2026-10-16) — 브랜드 도메인은 그 브랜드 공개 페이지·글 (lib/site-seo.ts),
 * tenone.biz는 아래 목록에서 자기 공식 도메인이 있는 브랜드 경로를 뺀 것. 스테이징·비공개·공식 아닌 주소는 빈 목록.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const site = resolveHost((await headers()).get('host') ?? 'www.tenone.biz');
    if (site.siteId !== 'tenone') {
        const entries = await brandSitemap(site, await getSiteSeoSettings(site.siteId));
        return entries.map(e => ({ url: e.url, lastModified: e.lastModified ? new Date(e.lastModified) : undefined, priority: e.priority }));
    }
    if (!site.indexable) return [];
    return tenoneSitemap().filter(e => !ownedByBrandDomain(new URL(e.url).pathname));
}

function tenoneSitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.tenone.biz';
    const now = new Date();

    return [
        // ── TenOne (메인) ──
        { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/works`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
        { url: `${baseUrl}/history`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/brands`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/universe`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },

        // ── WIO ──
        { url: `${baseUrl}/wio`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/wio/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/wio/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/wio/solutions`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/wio/framework`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/wio/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },

        // ── MADLeague ──
        { url: `${baseUrl}/madleague`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/madleague/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/madleague/program`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/madleague/idea-movement`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/madleague/madzine`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/madleague/programs/hero`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/madleague/certificate`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/madleague/pt`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── MADLeap ──
        { url: `${baseUrl}/madleap`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },

        // ── Badak ──
        { url: `${baseUrl}/badak`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/badak/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/badak/join`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/badak/stars`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },

        // ── SmarComm ──
        { url: `${baseUrl}/smarcomm`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/smarcomm/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },

        // ── HeRo ──
        { url: `${baseUrl}/hero`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/hero/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/hero/career`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/hero/mentor`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/hero/hit`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },


        // ── Planner's ──
        { url: `${baseUrl}/planners`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

        // ── 0gamja ──
        { url: `${baseUrl}/0gamja`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/0gamja/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── FWN ──
        { url: `${baseUrl}/fwn`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/fwn/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── Seoul360 ──
        { url: `${baseUrl}/seoul360`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },

        // ── YouInOne ──
        { url: `${baseUrl}/youinone`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

        // ── Myverse ── (마이버스 단일 브랜드 통합 — 9 영역 + 공개 핸들)
        { url: `${baseUrl}/myverse`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/myverse/story`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/myverse/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

        // ── Mindle ──
        { url: `${baseUrl}/mindle`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

        // ── ChangeUp ──
        { url: `${baseUrl}/changeup`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/changeup/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/changeup/programs`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── Domo ──
        { url: `${baseUrl}/domo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/domo/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },

        // ── MoNTZ ──
        { url: `${baseUrl}/montz`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── Jakka ──
        { url: `${baseUrl}/jakka`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── Townity ──
        { url: `${baseUrl}/townity`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── NatureBox ──
        { url: `${baseUrl}/naturebox`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── Mullaesian ──
        { url: `${baseUrl}/mullaesian`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ];
}

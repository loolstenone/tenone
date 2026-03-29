import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.tenone.biz';
    const now = new Date();

    return [
        // ── TenOne (메인) ──
        { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/works`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/newsroom`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
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
        { url: `${baseUrl}/madleague/hero`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/madleague/certificate`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/madleague/pt`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── MADLeap ──
        { url: `${baseUrl}/madleap`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },

        // ── Badak ──
        { url: `${baseUrl}/badak`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/badak/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/badak/join`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/badak/stars`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/badak/contents`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/badak/bacademy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── SmarComm ──
        { url: `${baseUrl}/smarcomm`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/smarcomm/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },

        // ── HeRo ──
        { url: `${baseUrl}/hero`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/hero/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/hero/career`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/hero/mentor`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/hero/hit`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

        // ── RooK ──
        { url: `${baseUrl}/rook`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/rook/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/rook/works`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/rook/artist`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

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

        // ── MyVerse ──
        { url: `${baseUrl}/myverse`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/myverse/service`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/myverse/philosophy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },

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

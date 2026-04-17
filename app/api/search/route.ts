import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const site = searchParams.get('site') ?? '';

    if (!q || q.length < 2) {
        return NextResponse.json({ siteResults: [], universeResults: [] });
    }

    const [siteResults, universeResults] = await Promise.all([
        searchSite(site, q),
        searchUniverse(q),
    ]);

    return NextResponse.json({ siteResults, universeResults });
}

async function searchSite(site: string, q: string) {
    const results: SearchResult[] = [];

    if (site === 'badak') {
        const { data } = await supabase
            .from('badak_groups')
            .select('id, title, description, slug, status')
            .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
            .eq('status', 'active')
            .limit(8);

        if (data) {
            results.push(...data.map((g) => ({
                id: `group-${g.id}`,
                title: g.title,
                description: g.description?.slice(0, 80),
                href: `/badak/groups/${g.id}`,
                type: '모임',
            })));
        }

        const { data: posts } = await supabase
            .from('badak_posts')
            .select('id, title, preview')
            .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
            .eq('status', 'published')
            .limit(5);

        if (posts) {
            results.push(...posts.map((p) => ({
                id: `post-${p.id}`,
                title: p.title,
                description: p.preview?.slice(0, 80),
                href: `/badak/community/${p.id}`,
                type: '커뮤니티',
            })));
        }
    }

    return results;
}

async function searchUniverse(q: string) {
    const results: SearchResult[] = [];

    // 브랜드/사이트 검색
    const { data: sites } = await supabase
        .from('ums_sites')
        .select('site_id, name, meta_description')
        .or(`name.ilike.%${q}%,meta_description.ilike.%${q}%`)
        .eq('is_open', true)
        .limit(5);

    if (sites) {
        results.push(...sites.map((s) => ({
            id: `site-${s.site_id}`,
            title: s.name,
            description: s.meta_description?.slice(0, 80),
            href: `/${s.site_id}`,
            type: '브랜드',
        })));
    }

    // 공개 멤버 검색
    const { data: members } = await supabase
        .from('members')
        .select('id, name, handle, bio')
        .or(`name.ilike.%${q}%,handle.ilike.%${q}%,bio.ilike.%${q}%`)
        .not('handle', 'is', null)
        .limit(5);

    if (members) {
        results.push(...members.map((m) => ({
            id: `member-${m.id}`,
            title: m.name,
            description: m.bio?.slice(0, 80),
            href: `/@${m.handle}`,
            type: '멤버',
        })));
    }

    return results;
}

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    href: string;
    type: string;
}

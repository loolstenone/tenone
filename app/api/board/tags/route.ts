/**
 * 태그 API
 * GET /api/board/tags?site=tenone&limit=20
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { SiteCode } from '@/types/board';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const site = (searchParams.get('site') || 'tenone') as SiteCode;
    const limit = parseInt(searchParams.get('limit') || '20');

    try {
        const tags = await boardDb.fetchPopularTags(site, limit);
        return NextResponse.json({ tags });
    } catch (error) {
        console.error('fetchTags error:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

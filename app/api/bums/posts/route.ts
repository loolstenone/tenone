import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/bums/posts?site=tenone&board=newsroom&status=published&limit=10&offset=0&sort=latest
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site');       // brand_id (e.g. 'tenone', 'madleague')
    const board = searchParams.get('board');      // board slug
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'latest'; // latest | views | recommended

    const supabase = await createClient();

    let query = supabase
        .from('bums_posts')
        .select(`
            id, title, slug, summary, body, status, category_id,
            is_pinned, is_recommended, author_name, image, tags,
            og_title, og_description, og_image, extra_fields,
            view_count, comment_count, published_at, created_at,
            bums_boards!inner(slug, name, board_type),
            bums_sites!inner(brand_id, name, domain)
        `)
        .eq('status', status)
        .range(offset, offset + limit - 1);

    // site filter
    if (site) {
        query = query.eq('bums_sites.brand_id', site);
    }

    // board filter
    if (board) {
        query = query.eq('bums_boards.slug', board);
    }

    // sort
    if (sort === 'views') {
        query = query.order('view_count', { ascending: false });
    } else if (sort === 'recommended') {
        query = query.order('is_recommended', { ascending: false }).order('published_at', { ascending: false });
    } else {
        query = query.order('published_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        posts: data || [],
        total: count,
        limit,
        offset,
    });
}

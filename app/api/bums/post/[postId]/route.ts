import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/bums/post/[postId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('bums_posts')
        .select(`
            *,
            bums_boards(slug, name, board_type, site_id),
            bums_sites(brand_id, name, domain)
        `)
        .eq('id', postId)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // view count increment
    await supabase
        .from('bums_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', postId);

    return NextResponse.json({ post: data });
}

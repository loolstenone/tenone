import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/posts
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const board = searchParams.get('board'); // notice, free, qna
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase.from('posts')
        .select('*, author:members!author_id(id, name, avatar_initials), comments:post_comments(count)', { count: 'exact' });

    if (board) query = query.eq('board', board);

    const { data, error, count } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/posts
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('posts').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

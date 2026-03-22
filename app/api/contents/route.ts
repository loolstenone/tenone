import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/contents
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const brand = searchParams.get('brand');

    let query = supabase.from('contents')
        .select('*, author:members!author_id(id, name)', { count: 'exact' });

    if (channel) query = query.eq('channel', channel);
    if (status) query = query.eq('status', status);
    if (brand) query = query.eq('brand', brand);

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/contents
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    // slug 자동 생성
    if (!body.slug && body.title) {
        body.slug = body.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').slice(0, 200) + '-' + Date.now();
    }
    if (body.status === 'published' && !body.published_at) {
        body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase.from('contents').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

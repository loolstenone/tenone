import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';

// GET /api/opportunities (인증 필요)
export async function GET(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    let query = supabase!.from('opportunities')
        .select('*, assignee:members!assigned_to(id, name, avatar_initials)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (search) {
        const s = search.replace(/[\\%_(),."']/g, '').trim().slice(0, 200);
        if (s) query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return errorResponse('Failed to fetch opportunities', 500);
    return successResponse({ data, total: count });
}

// POST /api/opportunities (인증 필요)
export async function POST(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const body = await request.json();

    if (!body.title) {
        return errorResponse('title is required');
    }

    const { data, error } = await supabase!.from('opportunities').insert(body).select().single();
    if (error) return errorResponse('Failed to create opportunity', 500);
    return successResponse(data, 201);
}

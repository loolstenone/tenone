import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/opportunities
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    let query = supabase.from('opportunities')
        .select('*, assignee:members!assigned_to(id, name, avatar_initials)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/opportunities
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('opportunities').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

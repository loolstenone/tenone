import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/library
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const source = searchParams.get('source'); // wiki, myverse, cms
    const category = searchParams.get('category');
    const permission = searchParams.get('permission');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase.from('library_items')
        .select('*, author:members!author_id(id, name)', { count: 'exact' });

    if (source) query = query.eq('source', source);
    if (category) query = query.eq('category', category);
    if (permission) query = query.eq('permission', permission);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/library
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('library_items').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

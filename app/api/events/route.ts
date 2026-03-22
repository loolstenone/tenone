import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/events
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const source = searchParams.get('source');

    let query = supabase.from('events')
        .select('*, creator:members!created_by(id, name)');

    if (startDate) query = query.gte('start_at', startDate);
    if (endDate) query = query.lte('start_at', endDate);
    if (source) query = query.eq('source', source);

    const { data, error } = await query.order('start_at');
    if (error) return errorResponse(error.message);
    return successResponse(data);
}

// POST /api/events
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('events').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

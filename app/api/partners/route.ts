import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const skill = searchParams.get('skill');

    let query = supabase.from('partners').select('*', { count: 'exact' });
    if (type) query = query.eq('type', type);
    if (search) query = query.or(`name.ilike.%${search}%,speciality.ilike.%${search}%`);
    if (skill) query = query.contains('skills', [skill]);

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('partners').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

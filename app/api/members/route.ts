import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/members — 멤버 목록
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const accountType = searchParams.get('accountType');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase.from('members').select('*', { count: 'exact' });

    if (accountType) query = query.eq('account_type', accountType);
    if (department) query = query.eq('department', department);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/members — 멤버 생성 (관리자용)
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('members')
        .insert(body)
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

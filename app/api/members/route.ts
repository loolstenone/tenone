import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth, requireAuthOrAdmin } from '@/lib/supabase/api-utils';

// GET /api/members — 멤버 목록 (인증 필요)
export async function GET(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const { searchParams } = new URL(request.url);
    const accountType = searchParams.get('accountType');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase!.from('members').select('*', { count: 'exact' });

    if (accountType) query = query.eq('account_type', accountType);
    if (department) query = query.eq('department', department);
    if (search) {
        const s = search.replace(/[\\%_(),."']/g, '').trim().slice(0, 200);
        if (s) query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%`);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse('Failed to fetch members', 500);
    return successResponse({ data, total: count });
}

// POST /api/members — 멤버 생성 (인증 또는 Admin Key 필요)
export async function POST(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuthOrAdmin(request);
    if (authErr) return authErr;

    const body = await request.json();

    if (!body.name || !body.email) {
        return errorResponse('name and email are required');
    }

    const { data, error } = await supabase!
        .from('members')
        .insert(body)
        .select()
        .single();

    if (error) return errorResponse('Failed to create member', 500);
    return successResponse(data, 201);
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/notifications
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = supabase.from('notifications').select('*', { count: 'exact' });
    if (memberId) query = query.eq('member_id', memberId);
    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error, count } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/notifications
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('notifications').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

// PATCH /api/notifications — 읽음 처리 (bulk)
export async function PATCH(request: NextRequest) {
    const supabase = await createClient();
    const { ids } = await request.json();
    const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', ids);
    if (error) return errorResponse(error.message);
    return successResponse({ message: '읽음 처리 완료' });
}

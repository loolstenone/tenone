import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';

// GET /api/timesheets (인증 필요)
export async function GET(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const weekStart = searchParams.get('weekStart');
    const projectId = searchParams.get('projectId');

    let query = supabase!.from('timesheets')
        .select('*, project:projects(id, code, name), job:jobs(id, code, name)');

    if (memberId) query = query.eq('member_id', memberId);
    if (projectId) query = query.eq('project_id', projectId);
    if (weekStart) {
        const start = new Date(weekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        query = query.gte('work_date', start.toISOString().split('T')[0])
                     .lte('work_date', end.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('work_date');
    if (error) return errorResponse('Failed to fetch timesheets', 500);
    return successResponse(data);
}

// POST /api/timesheets — 시수 입력 (인증 필요)
export async function POST(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const body = await request.json();
    const entries = Array.isArray(body) ? body : [body];

    if (entries.length === 0 || entries.length > 100) {
        return errorResponse('1~100 entries allowed');
    }

    const { data, error } = await supabase!.from('timesheets')
        .upsert(entries, { onConflict: 'member_id,job_id,work_date' })
        .select();

    if (error) return errorResponse('Failed to save timesheets', 500);
    return successResponse(data, 201);
}

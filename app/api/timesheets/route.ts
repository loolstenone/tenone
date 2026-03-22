import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/timesheets
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const memberId = searchParams.get('memberId');
    const weekStart = searchParams.get('weekStart');
    const projectId = searchParams.get('projectId');

    let query = supabase.from('timesheets')
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
    if (error) return errorResponse(error.message);
    return successResponse(data);
}

// POST /api/timesheets — 시수 입력 (upsert)
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    // 배열로 받으면 bulk upsert
    const entries = Array.isArray(body) ? body : [body];

    const { data, error } = await supabase.from('timesheets')
        .upsert(entries, { onConflict: 'member_id,job_id,work_date' })
        .select();

    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

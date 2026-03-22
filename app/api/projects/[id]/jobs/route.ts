import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/projects/[id]/jobs
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('jobs')
        .select('*, project_members(*, member:members(id, name, avatar_initials))')
        .eq('project_id', id)
        .order('seq');
    if (error) return errorResponse(error.message);
    return successResponse(data);
}

// POST /api/projects/[id]/jobs
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    // seq 자동 계산
    const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('project_id', id);
    const seq = (count || 0) + 1;

    // 코드 가져오기
    const { data: project } = await supabase.from('projects').select('code').eq('id', id).single();
    const jobCode = `${project?.code}-${body.type}-${body.detail}${String(seq).padStart(2, '0')}`;

    const { data, error } = await supabase.from('jobs')
        .insert({ ...body, project_id: id, code: jobCode, seq })
        .select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}

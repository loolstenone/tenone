import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { earnUC } from '@/lib/supabase/uc';

// GET /api/members/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    if (error) return errorResponse('멤버를 찾을 수 없습니다.', 404);
    return successResponse(data);
}

// PATCH /api/members/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('members').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) return errorResponse(error.message);

    // UC 코인 지급 (프로필 완성도 체크 — LIFE_ONCE_GLOBAL이므로 중복 지급 없음)
    if (data) {
        const m = data as Record<string, unknown>;
        // profile_complete: 이름·직무·소개 모두 작성
        if (m.name && m.job_function && m.bio) {
            await earnUC(id, 'profile_complete', null);
        }
        // profile_advanced: 프로필 사진·소개·태그/소속 모두 작성
        const hasTags = Array.isArray(m.tags) ? m.tags.length > 0 : false;
        const hasAffiliations = Array.isArray(m.affiliations) ? m.affiliations.length > 0 : false;
        if (m.avatar_url && m.bio && (hasTags || hasAffiliations)) {
            await earnUC(id, 'profile_advanced', null);
        }
    }

    return successResponse(data);
}

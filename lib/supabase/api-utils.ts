import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 에러 응답 헬퍼
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

// 성공 응답 헬퍼
export function successResponse(data: unknown, status: number = 200) {
    return NextResponse.json(data, { status });
}

// 인증 체크 + Supabase 클라이언트 반환
export async function getAuthenticatedClient() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { supabase, user: null, member: null };
    }

    // members 테이블에서 현재 사용자 조회
    const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('auth_id', user.id)
        .single();

    return { supabase, user, member };
}

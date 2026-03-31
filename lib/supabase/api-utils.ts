import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── 응답 헬퍼 ──

export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown, status: number = 200) {
    return NextResponse.json(data, { status });
}

// ── 인증 ──

// 인증 체크 + Supabase 클라이언트 반환 (null 허용 — 로그인 선택적 API용)
export async function getAuthenticatedClient() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { supabase, user: null, member: null };
    }

    const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('auth_id', user.id)
        .single();

    return { supabase, user, member };
}

// 인증 필수 — 미인증 시 401 NextResponse 반환
export async function requireAuth() {
    const { supabase, user, member } = await getAuthenticatedClient();
    if (!user) {
        return { supabase, user: null, member: null, error: errorResponse('Unauthorized', 401) };
    }
    return { supabase, user, member, error: null };
}

// Admin API Key 검증 (에이전트/서버간 호출용)
export function isAdminRequest(request: NextRequest): boolean {
    const key = process.env.ADMIN_API_KEY;
    if (!key) return false;
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${key}`;
}

// 인증 또는 Admin Key 중 하나 필요
export async function requireAuthOrAdmin(request: NextRequest) {
    if (isAdminRequest(request)) {
        const supabase = await createClient();
        return { supabase, user: null, member: null, isAdmin: true, error: null };
    }
    const { supabase, user, member, error } = await requireAuth();
    return { supabase, user, member, isAdmin: false, error };
}

// ── 입력 새니타이징 ──

// PostgREST 필터 인젝션 방지: 특수문자 이스케이프
export function sanitizeSearch(input: string): string {
    return input
        .replace(/[\\%_]/g, c => '\\' + c)   // LIKE 와일드카드 이스케이프
        .replace(/[(),."']/g, '')              // PostgREST 필터 구문 문자 제거
        .trim()
        .slice(0, 200);                        // 길이 제한
}

// UUID 형식 검증
export function isValidUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

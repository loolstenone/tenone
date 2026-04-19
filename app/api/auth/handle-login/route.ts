import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * POST /api/auth/handle-login
 * 핸들로 이메일을 조회해서 반환 — 클라이언트가 signInWithPassword로 로그인
 * Body: { handle: string }
 * Response: { email: string }
 */
export async function POST(request: NextRequest) {
    const { handle } = await request.json();
    if (!handle || typeof handle !== 'string') {
        return NextResponse.json({ error: '핸들을 입력해주세요.' }, { status: 400 });
    }

    const cleaned = handle.replace(/^@/, '').toLowerCase().trim();
    if (cleaned.length < 3) {
        return NextResponse.json({ error: '핸들은 3자 이상이어야 합니다.' }, { status: 400 });
    }

    const { data: member } = await supabase
        .from('members')
        .select('email')
        .eq('handle', cleaned)
        .single();

    if (!member?.email) {
        return NextResponse.json({ error: '존재하지 않는 핸들입니다.' }, { status: 404 });
    }

    return NextResponse.json({ email: member.email });
}

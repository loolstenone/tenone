import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 현재 로그인 사용자 이메일 반환 (쿠키 기반 서버 인증)
 * SiteClosedOverlay 등 클라이언트에서 크로스 서브도메인 인증 확인용.
 * 브라우저 클라이언트의 localStorage는 origin별로 분리되지만,
 * 이 API는 .tenone.biz 공유 쿠키를 읽으므로 서브도메인 간에도 동작한다.
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return NextResponse.json({ email: user?.email ?? null });
}

import { createClient } from '@supabase/supabase-js';

/**
 * 서비스 롤 Supabase 클라이언트
 * SUPABASE_SERVICE_ROLE_KEY 미설정 시 빌드는 통과하되 런타임에 네트워크 오류 발생
 * → Vercel 환경 변수에 SUPABASE_SERVICE_ROLE_KEY 반드시 설정 필요
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_build_only',
    );
}

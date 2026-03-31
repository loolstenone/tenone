-- =============================================
-- SSO Token Exchange Table
-- 타 루트 도메인 간 세션 전달용 일회성 토큰
-- Prod + Dev 양쪽에서 실행
-- =============================================

CREATE TABLE IF NOT EXISTS sso_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    redirect_to TEXT NOT NULL,
    final_path TEXT DEFAULT '/',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '60 seconds',
    used BOOLEAN DEFAULT false
);

-- 만료 토큰 자동 정리 (1시간 이상 지난 것)
CREATE INDEX IF NOT EXISTS idx_sso_tokens_expires ON sso_tokens(expires_at);

-- RLS: 서비스 역할만 접근 (API 라우트에서 service_role 키 사용)
ALTER TABLE sso_tokens ENABLE ROW LEVEL SECURITY;

-- anon/authenticated 사용자는 직접 접근 불가
-- API 라우트에서 service_role 또는 SECURITY DEFINER 함수로만 접근
CREATE POLICY "no_direct_access" ON sso_tokens FOR ALL USING (false);

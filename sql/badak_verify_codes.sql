-- Badak 프로필 변경 인증 코드 테이블
CREATE TABLE IF NOT EXISTS badak_verify_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스: 사용자별 유효 코드 조회
CREATE INDEX idx_badak_verify_user_valid
  ON badak_verify_codes (user_id, used, expires_at DESC);

-- 자동 정리: 24시간 지난 코드 삭제 (cron이나 수동)
-- DELETE FROM badak_verify_codes WHERE created_at < now() - interval '24 hours';

-- RLS
ALTER TABLE badak_verify_codes ENABLE ROW LEVEL SECURITY;

-- 서비스 롤만 접근 (API 라우트에서 admin client 사용)
CREATE POLICY "Service role full access"
  ON badak_verify_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

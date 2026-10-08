-- sso-one-id.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `sso_one_id`
--
-- Ten:One™ Universe One ID — 독립 도메인 간 로그인 이어주기 (설계: lib/sso-server.ts)
-- 기존 문제 (점검 축6 H-1 · 축3 M-8):
--   - access_token·refresh_token을 평문으로 저장·복사 → Supabase refresh token은 1회용이라 두 도메인이 나눠 쓰면 세션이 끊기고, 유출 시 계정 탈취
--   - 미사용 토큰 5행이 평문 세션 토큰을 그대로 보관 중 (교환 0건)
--   - 정책 is_tenone_staff()로 직원이 토큰을 읽을 수 있음 · anon 테이블 권한 전체
-- 변경:
--   - 기존 행 삭제 (평문 세션 토큰 — 전부 만료·미사용)
--   - access_token·refresh_token·used 컬럼 삭제 → otp_hash(관리자 magiclink hashed_token, 받는 서버가 verifyOtp로 독립 세션 생성)
--   - token = 일회용 토큰의 SHA-256 (원문은 URL로만 전달) · direction(to_site/to_hub) · user_id · return_origin
--   - redirect_to = 교환을 허용할 호스트 (그 도메인에서만 교환 가능)
--   - 정책 전부 제거 + anon/authenticated 권한 회수 → service_role 전용 (RLS on 유지)
-- 롤백: 기능 롤백은 코드 되돌리기. 컬럼 복원이 필요하면 access_token/refresh_token text, used boolean default false 추가 (데이터는 복원 대상 아님)

DELETE FROM public.sso_tokens;

ALTER TABLE public.sso_tokens
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token,
  DROP COLUMN IF EXISTS used,
  ADD COLUMN IF NOT EXISTS otp_hash text NOT NULL,
  ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS direction text NOT NULL CHECK (direction IN ('to_site', 'to_hub')),
  ADD COLUMN IF NOT EXISTS return_origin text NOT NULL;

COMMENT ON COLUMN public.sso_tokens.token IS '일회용 SSO 토큰의 SHA-256 (원문 미저장)';
COMMENT ON COLUMN public.sso_tokens.otp_hash IS 'auth.admin.generateLink(magiclink) hashed_token — 교환 서버가 verifyOtp로 독립 세션 생성. 60초 만료·사용 즉시 삭제';
COMMENT ON COLUMN public.sso_tokens.redirect_to IS '교환을 허용할 호스트 (그 도메인에서만 교환 가능)';

CREATE UNIQUE INDEX IF NOT EXISTS sso_tokens_token_key ON public.sso_tokens (token);
CREATE INDEX IF NOT EXISTS sso_tokens_expires_at_idx ON public.sso_tokens (expires_at);

ALTER TABLE public.sso_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sso_tokens_staff_only ON public.sso_tokens;
REVOKE ALL ON public.sso_tokens FROM anon, authenticated;
GRANT ALL ON public.sso_tokens TO service_role;

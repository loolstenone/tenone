-- ═══════════════════════════════════════════════════════════════
-- Gmail 뉴스레터 수신 — 연결 상태 기록 + 토큰 비노출 (2026-10-10)
--   ① 상태 컬럼(적용): 수신 성공·실패를 남겨 운영 상태 화면이 "끊김 + 원인"을 바로 보여준다
--      (기존: 오류를 응답에만 담고 버려 4월 28일 이후 5개월 조용히 정지)
--   ② 토큰 비노출(승인 후 적용): access_token·refresh_token은 서버(service_role)만.
--      기존 정책 auth_is_staff() = 직원 브라우저에서 select("*")로 refresh_token까지 조회 가능했다
-- ═══════════════════════════════════════════════════════════════

-- ① 상태 컬럼
ALTER TABLE public.gmail_oauth_tokens ADD COLUMN IF NOT EXISTS last_success_at timestamptz;
ALTER TABLE public.gmail_oauth_tokens ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE public.gmail_oauth_tokens ADD COLUMN IF NOT EXISTS last_error_at timestamptz;
ALTER TABLE public.gmail_oauth_tokens ADD COLUMN IF NOT EXISTS needs_reconnect boolean NOT NULL DEFAULT false;

-- ② 토큰 비노출 — 브라우저(authenticated)는 상태 컬럼만 읽고, 쓰기는 서버만
DROP POLICY IF EXISTS gmail_update ON public.gmail_oauth_tokens;
DROP POLICY IF EXISTS p1_staff_all ON public.gmail_oauth_tokens;
DROP POLICY IF EXISTS gmail_select ON public.gmail_oauth_tokens;
CREATE POLICY gmail_select ON public.gmail_oauth_tokens FOR SELECT TO authenticated USING (auth_is_staff());
REVOKE ALL ON public.gmail_oauth_tokens FROM anon, authenticated;
GRANT SELECT (id, email, is_active, label, expiry_date, created_at, updated_at, last_success_at, last_error, last_error_at, needs_reconnect)
    ON public.gmail_oauth_tokens TO authenticated;
GRANT ALL ON public.gmail_oauth_tokens TO service_role;

-- contact_submissions RLS 정리 — 운영 적용 2026-10-06 (migration contact_submissions_rls_lockdown, 롤백 시뮬레이션·anon REST 검증 완료)
-- 문제 1: contact_read_auth (authenticated, USING true) → 로그인만 하면 누구나 전 브랜드 문의(이름·이메일·연락처·이력서 정보) 열람 가능
-- 문제 2: contact_insert (public, WITH CHECK true) → anon 키로 직접 INSERT 가능 = /api/contact 캡차 우회 (봇 1,479건 경로)
-- 쓰기는 /api/contact · /api/badak/inquiries · /api/intra/contact-submissions (모두 service_role, RLS 우회)만 사용

DROP POLICY IF EXISTS contact_insert ON public.contact_submissions;
DROP POLICY IF EXISTS contact_read_auth ON public.contact_submissions;

DROP POLICY IF EXISTS contact_read_staff ON public.contact_submissions;
CREATE POLICY contact_read_staff ON public.contact_submissions
    FOR SELECT TO authenticated USING (public.auth_is_staff());

-- anon/authenticated 쓰기 권한 회수 (읽기는 위 정책이 직원으로 제한)
REVOKE INSERT, UPDATE, DELETE ON public.contact_submissions FROM anon, authenticated;
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;

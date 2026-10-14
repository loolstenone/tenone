-- members INSERT를 '본인 행'으로 좁힌다 (2026-10-15 Planner's QA)
-- 적용: (사용자 승인 후) Supabase MCP apply_migration
--
-- 문제: members_insert = WITH CHECK (auth.uid() IS NOT NULL)
--   로그인(소셜 첫 로그인 포함)만 하면 브라우저에서 PostgREST로 아무 내용의 회원 행을 직접 만들 수 있었다
--   ① 회원가입 동의 화면(ConsentGate)을 건너뛰고 회원이 됨 (§1.2.0, 개인정보보호법 제15조)
--   ② 남의 이메일로 행을 먼저 만들어 그 사람의 가입을 막음 (email UNIQUE)
--   ③ auth_id를 비워 둔 행 → 이메일 폴백 연결 경로에서 다른 계정에 묶일 여지
-- 정상 경로: lib/auth-context.tsx createMemberRow = 본인 세션 + auth_id = auth.uid() (동의 후) → 그대로 통과
--            직원 등록은 service_role(lib/staff-lifecycle.ts) 또는 직원 세션 → 통과

DROP POLICY IF EXISTS members_insert ON public.members;
CREATE POLICY members_insert ON public.members
    FOR INSERT TO authenticated
    WITH CHECK (auth_id = auth.uid() OR is_tenone_staff());

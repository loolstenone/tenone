-- ============================================================
-- wio_members 권한 수정 (인트라 5단계 검증 중 발견)
-- 적용: 2026-10-05 (MCP apply_migration: security_wio_members_fix) — 롤백 검증: 회원 셀프 가입 거부·재귀 해소·직원 조회 정상
--
-- 발견:
--   1) wio_members_select가 wio_members를 다시 조회 → "infinite recursion" 오류
--      → wio_members를 거치는 모든 테넌트 정책(wio_opportunities·wio_timesheets 등)이 직원에게도 실패
--   2) wio_members_insert WITH CHECK (auth.uid() IS NOT NULL)
--      → 로그인 회원 누구나 아무 테넌트에 아무 role(owner 포함)로 자기 자신을 추가 가능
--      wio_members_update (user_id = auth.uid()) → 본인 행의 tenant_id·role을 바꿔 같은 권한 상승 가능
--      (WIO 앱 "코드로 참여"는 테넌트 slug를 초대코드로 사용 — slug만 알면 가입)
-- 조치:
--   - 소속 테넌트 조회를 SECURITY DEFINER 함수로 분리 (재귀 차단, 비활성 멤버 제외)
--   - 멤버 추가·수정은 직원만. 인트라 자동 가입 rpc ensure_wio_membership(SECURITY DEFINER)은 영향 없음
--   - 영향: WIO 앱 셀프 온보딩(워크스페이스 생성·코드 참여)·테넌트 관리자의 멤버 수정 중단 (WIO = 실험·보관 Tier)
-- ============================================================

CREATE OR REPLACE FUNCTION public.auth_wio_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT tenant_id FROM public.wio_members
    WHERE user_id = auth.uid() AND coalesce(is_active, true);
$$;
REVOKE ALL ON FUNCTION public.auth_wio_tenant_ids() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auth_wio_tenant_ids() TO authenticated, service_role;

DROP POLICY IF EXISTS wio_members_select ON public.wio_members;
CREATE POLICY wio_members_select ON public.wio_members FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT public.auth_wio_tenant_ids()) OR is_tenone_staff());

DROP POLICY IF EXISTS wio_members_insert ON public.wio_members;
CREATE POLICY wio_members_insert ON public.wio_members FOR INSERT TO authenticated
    WITH CHECK (is_tenone_staff());

DROP POLICY IF EXISTS wio_members_update ON public.wio_members;
CREATE POLICY wio_members_update ON public.wio_members FOR UPDATE TO authenticated
    USING (is_tenone_staff()) WITH CHECK (is_tenone_staff());

REVOKE ALL ON public.wio_members FROM anon;

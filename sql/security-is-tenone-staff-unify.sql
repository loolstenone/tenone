-- security-is-tenone-staff-unify.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `security_is_tenone_staff_unify`
--
-- 문제 (점검 축1 C-3): RLS 정책 65개(59 테이블)가 is_tenone_staff()를 쓰는데, 이 함수는
--   members.account_type = 'staff' 로 직원을 판단 → 데이터 계약 2조 위반(권한은 member_roles 한 곳에서).
--   나머지 정책 208개는 auth_is_staff()(JWT is_staff ← member_roles 동기화, sync_roles_to_jwt) 사용.
-- 수정: 함수 본문만 auth_is_staff() 위임으로 교체 → 정책 65개를 건드리지 않고 판단 기준 단일화.
-- 사전 대조 (2026-10-08): account_type 기준 1명 = JWT is_staff 1명 = member_roles staff@universe 1명 (차이 0)
-- 다른 함수·뷰·앱 코드에서 is_tenone_staff 호출 없음. 정책 정리(함수명 일괄 교체 후 DROP)는 이후 별도.
-- 롤백: 아래 원본 본문으로 CREATE OR REPLACE
--   SELECT EXISTS (SELECT 1 FROM members WHERE auth_id = auth.uid() AND account_type = 'staff' AND tenant_id = 'tenone');

CREATE OR REPLACE FUNCTION public.is_tenone_staff()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- 2026-10-08: 직원 판단 SSOT = auth_is_staff() (member_roles → JWT is_staff). account_type 판단 폐지
  SELECT public.auth_is_staff();
$function$;

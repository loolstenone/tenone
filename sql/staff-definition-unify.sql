-- 직원 판단 기준 통일 (데이터 계약 2조 "권한은 한 곳에서") — 세션 161, 2026-10-07 (사용자 승인)
-- 직원 = member_roles 에서 role IN ('staff','manager','super_admin') AND context='universe'
--        AND is_active AND (expires_at IS NULL OR expires_at > now())
-- 같은 정의를 쓰는 곳: lib/api-guard.ts isStaffMember (API·middleware) / 이 트리거 → JWT app_metadata.is_staff → auth_is_staff() (RLS)
-- 이전: JWT는 staff@universe만 (manager·super_admin 단독이면 RLS에서 직원 아님), API는 @tenone.biz 이메일·context 무관·만료 무시
-- 적용: 2026-10-07 MCP apply_migration `staff_definition_unify` (롤백 시뮬레이션: super_admin 단독 false→true, 직원 역할 없음 false)
-- 한계: 역할이 expires_at으로 만료돼도 JWT는 member_roles 변경 시에만 재동기화 — API(isStaffMember)는 즉시 반영

CREATE OR REPLACE FUNCTION public.sync_roles_to_jwt()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    target_member_id UUID;
    target_auth_id UUID;
    role_array TEXT[];
    brand_array TEXT[];
    has_staff BOOLEAN;
    has_super_admin BOOLEAN;
BEGIN
    target_member_id := COALESCE(NEW.member_id, OLD.member_id);

    SELECT auth_id INTO target_auth_id
    FROM members WHERE id = target_member_id;

    IF target_auth_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

    SELECT
        ARRAY_AGG(DISTINCT role || ':' || context),
        ARRAY_AGG(DISTINCT context) FILTER (WHERE context != 'universe'),
        BOOL_OR(role IN ('staff', 'manager', 'super_admin') AND context = 'universe'),
        BOOL_OR(role = 'super_admin' AND context = 'universe')
    INTO role_array, brand_array, has_staff, has_super_admin
    FROM member_roles
    WHERE member_id = target_member_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());

    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB) || jsonb_build_object(
        'member_id', target_member_id,
        'roles', COALESCE(role_array, ARRAY[]::TEXT[]),
        'brands', COALESCE(brand_array, ARRAY[]::TEXT[]),
        'is_staff', COALESCE(has_staff, false),
        'is_super_admin', COALESCE(has_super_admin, false),
        'roles_synced_at', now()
    )
    WHERE id = target_auth_id;

    RETURN COALESCE(NEW, OLD);
END;
$function$;

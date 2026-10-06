-- ============================================================
-- ✅ 운영 DB 적용 완료: 2026-10-04 (세션 156)
-- members 권한 컬럼 보호 — 자기 권한 상승(privilege escalation) 차단
-- 2026-10-04 세션 156 보안 점검
--
-- 문제: members RLS가 본인 row INSERT/UPDATE를 컬럼 제한 없이 허용.
--       → 일반 회원이 account_type='staff' 로 바꾸면 is_tenone_staff() = true
--       → members 전체 SELECT/UPDATE/DELETE 가능 + 클라이언트 intraAccess 획득.
--       INSERT 정책도 auth.uid() IS NOT NULL 만 검사 → staff row 직접 생성 가능.
--
-- 해결: BEFORE INSERT/UPDATE 트리거로 권한 컬럼을 강제.
--   - service_role·postgres(서버/마이그레이션)는 통과
--   - 실제 직원(member_roles staff 계열 또는 JWT app_metadata.is_staff)은 통과
--     (member_roles는 auth_is_staff()만 쓰기 가능 → 본인 조작 불가)
--   - 그 외: INSERT 시 안전한 기본값 강제, UPDATE 시 권한 컬럼 원복
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 서버(service_role)·마이그레이션(postgres, JWT 없음)은 통과
  IF coalesce(auth.role(), '') NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  -- 실제 직원은 통과 (members 컬럼이 아닌 member_roles·JWT로만 판단)
  IF public.auth_is_staff() OR EXISTS (
    SELECT 1
    FROM member_roles r
    JOIN members m ON m.id = r.member_id
    WHERE m.auth_id = auth.uid()
      AND r.is_active
      AND r.role IN ('staff', 'manager', 'admin', 'super_admin', 'superadmin')
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.auth_id            := auth.uid();
    NEW.email              := coalesce(auth.jwt() ->> 'email', NEW.email);
    NEW.account_type       := 'member';
    NEW.role               := 'Viewer';
    NEW.roles              := ARRAY['member']::text[];
    NEW.intra_access       := false;
    NEW.module_access      := '{}'::text[];
    NEW.system_access      := '{}'::text[];
    NEW.brand_access       := '{}'::text[];
    NEW.brand_roles        := '{}'::jsonb;
    NEW.tenant_id          := 'tenone';
    NEW.membership_tier    := 'free';
    NEW.is_active          := true;
    NEW.deleted_at         := NULL;
    NEW.stripe_customer_id := NULL;
  ELSE
    NEW.auth_id            := OLD.auth_id;
    NEW.email              := OLD.email;
    NEW.account_type       := OLD.account_type;
    NEW.role               := OLD.role;
    NEW.roles              := OLD.roles;
    NEW.intra_access       := OLD.intra_access;
    NEW.module_access      := OLD.module_access;
    NEW.system_access      := OLD.system_access;
    NEW.brand_access       := OLD.brand_access;
    NEW.brand_roles        := OLD.brand_roles;
    NEW.tenant_id          := OLD.tenant_id;
    NEW.membership_tier    := OLD.membership_tier;
    NEW.is_active          := OLD.is_active;
    NEW.deleted_at         := OLD.deleted_at;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 트리거 함수는 직접 호출 대상이 아님
REVOKE EXECUTE ON FUNCTION public.protect_member_privileged_columns() FROM PUBLIC, anon, authenticated;

-- 'aa_' 접두사: 같은 시점 BEFORE 트리거 중 가장 먼저 실행 (이름순)
DROP TRIGGER IF EXISTS aa_protect_member_privileged_columns ON public.members;
CREATE TRIGGER aa_protect_member_privileged_columns
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.protect_member_privileged_columns();

-- 비로그인(anon)은 members에 쓸 이유가 없음 — 쓰기 권한 회수
REVOKE INSERT, UPDATE, DELETE ON public.members FROM anon;

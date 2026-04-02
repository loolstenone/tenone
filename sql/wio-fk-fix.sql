-- ============================================================================
-- WIO FK 체인 수정
-- auth.users → members → wio_members FK 연결 보강
-- ============================================================================

-- ── 1. members.auth_id → auth.users(id) ──────────────────────────────────────
-- NOT VALID: 기존 데이터 검증 없이 추가 (이후 VALIDATE로 점검)
ALTER TABLE public.members
  DROP CONSTRAINT IF EXISTS members_auth_id_fkey;

ALTER TABLE public.members
  ADD CONSTRAINT members_auth_id_fkey
  FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE SET NULL
  NOT VALID;

-- ── 2. profiles.user_id → auth.users(id) ────────────────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- ── 3. wio_members.user_id → auth.users(id) ─────────────────────────────────
ALTER TABLE public.wio_members
  DROP CONSTRAINT IF EXISTS wio_members_user_id_fkey;

ALTER TABLE public.wio_members
  ADD CONSTRAINT wio_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- ── 4. wio_tenants.owner_id → auth.users(id) ────────────────────────────────
ALTER TABLE public.wio_tenants
  DROP CONSTRAINT IF EXISTS wio_tenants_owner_id_fkey;

ALTER TABLE public.wio_tenants
  ADD CONSTRAINT wio_tenants_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL
  NOT VALID;

-- ── 5. wio_members UNIQUE constraint (tenant_id, user_id) ───────────────────
-- 한 테넌트에 동일 user가 중복 등록되지 않도록
ALTER TABLE public.wio_members
  DROP CONSTRAINT IF EXISTS wio_members_tenant_user_unique;

ALTER TABLE public.wio_members
  ADD CONSTRAINT wio_members_tenant_user_unique
  UNIQUE (tenant_id, user_id);

-- ── 6. 신규 사용자 WIO 자동 배정 함수 ─────────────────────────────────────────
-- wio_members에 user_id가 없으면 자동 INSERT (L4 Member)
CREATE OR REPLACE FUNCTION public.ensure_wio_membership(
  p_tenant_id UUID,
  p_user_id   UUID,
  p_display_name TEXT DEFAULT NULL
)
RETURNS public.wio_members AS $$
DECLARE
  v_member public.wio_members;
  v_name   TEXT;
BEGIN
  -- 이미 존재하면 그냥 반환
  SELECT * INTO v_member
  FROM public.wio_members
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id
  LIMIT 1;

  IF FOUND THEN
    RETURN v_member;
  END IF;

  -- display_name fallback: profiles 테이블에서 조회 시도
  IF p_display_name IS NULL THEN
    v_name := split_part(p_user_id::text, '-', 1); -- UUID prefix fallback
  ELSE
    v_name := p_display_name;
  END IF;

  -- 새 wio_members 행 생성 (L4 Member 기본값)
  INSERT INTO public.wio_members (
    tenant_id, user_id, display_name, role, is_active, joined_at
  ) VALUES (
    p_tenant_id, p_user_id, v_name, 'member', true, now()
  )
  RETURNING * INTO v_member;

  RETURN v_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.ensure_wio_membership(UUID, UUID, TEXT) TO authenticated;

SELECT 'WIO FK chain fix + ensure_wio_membership function DONE' AS result;

-- 개인정보 보안 점검 조치 (2026-10-11 적용) — 재실행 안전
-- 1) badak_members: 공개 프로필만 누구나 · 비공개는 본인·직원 (기존 SELECT true) · 전화번호는 비로그인에게 안 보임
-- 2) badak_verify_codes: 실패 횟수 컬럼 (5회 초과 폐기)
-- 3) privacy_deletion_requests: members.roles(본인 수정 가능 컬럼) → auth_is_staff()
-- 4) survey_responses · networking_rsvps: 로그인 전원 ALL → 본인 행 + 직원
-- 5) jakka_creators: 이메일 컬럼 비로그인 조회 차단
-- 6) storage avatars: 수정·삭제는 자기 폴더(members.id 또는 auth uid)만 · 직원 예외

-- 1) badak_members
DROP POLICY IF EXISTS badak_members_select ON public.badak_members;
CREATE POLICY badak_members_select ON public.badak_members FOR SELECT
  USING (profile_public = true OR auth.uid() = user_id OR auth_is_staff());
REVOKE SELECT (phone) ON public.badak_members FROM anon;

-- 2) badak_verify_codes
ALTER TABLE public.badak_verify_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;

-- 3) privacy_deletion_requests
DROP POLICY IF EXISTS "Staff can manage deletion requests" ON public.privacy_deletion_requests;
CREATE POLICY privacy_deletion_requests_staff ON public.privacy_deletion_requests FOR ALL
  TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 4) survey_responses · networking_rsvps
DROP POLICY IF EXISTS survey_responses_auth ON public.survey_responses;
CREATE POLICY survey_responses_own ON public.survey_responses FOR ALL
  TO authenticated USING (user_id = auth.uid() OR auth_is_staff()) WITH CHECK (user_id = auth.uid() OR auth_is_staff());

DROP POLICY IF EXISTS networking_rsvps_auth ON public.networking_rsvps;
CREATE POLICY networking_rsvps_own ON public.networking_rsvps FOR ALL
  TO authenticated USING (user_id = auth.uid() OR auth_is_staff()) WITH CHECK (user_id = auth.uid() OR auth_is_staff());

-- 5) jakka_creators
REVOKE SELECT (email) ON public.jakka_creators FROM anon;

-- 6) storage avatars — 폴더 = members.id 또는 auth uid (UniverseProfile·ResumeView 모두 user.id), resume-photos/{id}/...
CREATE OR REPLACE FUNCTION public.storage_owns_avatar_path(p_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND (
    (storage.foldername(p_name))[1] = auth.uid()::text
    OR (storage.foldername(p_name))[2] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.members m WHERE m.auth_id = auth.uid()
               AND (m.id::text = (storage.foldername(p_name))[1] OR m.id::text = (storage.foldername(p_name))[2]))
  );
$$;

DROP POLICY IF EXISTS avatars_auth_update ON storage.objects;
CREATE POLICY avatars_auth_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (public.storage_owns_avatar_path(name) OR auth_is_staff()));
DROP POLICY IF EXISTS avatars_auth_delete ON storage.objects;
CREATE POLICY avatars_auth_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (public.storage_owns_avatar_path(name) OR auth_is_staff()));
DROP POLICY IF EXISTS avatars_auth_insert ON storage.objects;
CREATE POLICY avatars_auth_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (public.storage_owns_avatar_path(name) OR auth_is_staff()));

-- ===== 레드팀·블루팀 조치 (2026-10-11 2차) =====
-- 7) badak_members: 본인 행 UPDATE가 role·등급 컬럼까지 열려 있어 일반 회원이 role='admin'으로 셀프 승격 가능했다
--    권한·등급 컬럼은 직원만 바꿀 수 있게 트리거로 고정 (인트라 화면의 직원 수정은 그대로 동작)
CREATE OR REPLACE FUNCTION public.badak_members_protect_privileged()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role
      OR NEW.leader_level IS DISTINCT FROM OLD.leader_level
      OR NEW.specialist_invited IS DISTINCT FROM OLD.specialist_invited
      OR NEW.specialist_invited_at IS DISTINCT FROM OLD.specialist_invited_at
      OR NEW.completed_groups_count IS DISTINCT FROM OLD.completed_groups_count
      OR NEW.user_id IS DISTINCT FROM OLD.user_id)
     AND NOT auth_is_staff() AND auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'badak_members: 권한·등급 컬럼은 직원만 수정할 수 있습니다';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS badak_members_protect_privileged ON public.badak_members;
CREATE TRIGGER badak_members_protect_privileged BEFORE UPDATE ON public.badak_members
  FOR EACH ROW EXECUTE FUNCTION public.badak_members_protect_privileged();
-- INSERT 때도 권한·등급 컬럼은 기본값으로 (비직원)
CREATE OR REPLACE FUNCTION public.badak_members_default_privileged()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT auth_is_staff() AND auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.role := 'member';
    NEW.leader_level := 'C';
    NEW.specialist_invited := false;
    NEW.specialist_invited_at := NULL;
    NEW.completed_groups_count := 0;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS badak_members_default_privileged ON public.badak_members;
CREATE TRIGGER badak_members_default_privileged BEFORE INSERT ON public.badak_members
  FOR EACH ROW EXECUTE FUNCTION public.badak_members_default_privileged();

-- 8) timesheets: 로그인 전원 조회 정책 제거 (본인 + 직원 정책 ts_select만 남김)
DROP POLICY IF EXISTS authenticated_read ON public.timesheets;

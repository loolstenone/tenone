-- MADLeague mad_members → 공통 프로필(members.id) 연결 — 1단계 (적용 대기: 사용자 승인 후)
-- 데이터 계약 1: 이름·이메일·전화·사진은 members가 SSOT. mad_members는 MADLeague 고유 데이터만.
-- 1단계(지금): member_id 추가·백필, name NOT NULL 해제, 승격 트리거가 계정 정보 복사 중단
-- 2단계(새 코드 배포 후 별도): mad_members.name·email·phone·avatar_url 컬럼 삭제 (sql/madleague-members-drop-copied-columns.sql)

ALTER TABLE public.mad_members
    ADD COLUMN IF NOT EXISTS member_id uuid REFERENCES public.members(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_mad_members_member_id ON public.mad_members(member_id);

-- user_id(auth uid) → members.id 백필
UPDATE public.mad_members mm
SET member_id = m.id
FROM public.members m
WHERE mm.member_id IS NULL AND mm.user_id IS NOT NULL AND m.auth_id = mm.user_id;

-- 새 행은 이름을 복사하지 않는다
ALTER TABLE public.mad_members ALTER COLUMN name DROP NOT NULL;

-- 지원서 accepted 승격 트리거: 이메일 매칭·계정 정보 복사 제거, members.id로 연결
CREATE OR REPLACE FUNCTION public.mad_promote_application_to_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cohort_id UUID;
  v_auth_id UUID;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') AND NEW.member_id IS NOT NULL THEN
    -- mad_members는 한 사람당 1행 (user_id UNIQUE) — 이미 있으면 만들지 않는다
    SELECT auth_id INTO v_auth_id FROM members WHERE id = NEW.member_id;
    IF NOT EXISTS (SELECT 1 FROM mad_members WHERE member_id = NEW.member_id OR (v_auth_id IS NOT NULL AND user_id = v_auth_id)) THEN
      SELECT id INTO v_cohort_id FROM mad_cohorts
        WHERE club_id = NEW.club_id AND year = NEW.year
        ORDER BY created_at DESC LIMIT 1;

      INSERT INTO mad_members (
        member_id, user_id, club_id, cohort_id, university, major, year_in_school,
        activity_years, source_application_id
      ) VALUES (
        NEW.member_id, v_auth_id, NEW.club_id, v_cohort_id, NEW.university, NEW.major, NEW.year_in_school,
        ARRAY[NEW.year], NEW.id
      );

      IF v_cohort_id IS NOT NULL THEN
        UPDATE mad_cohorts SET member_count = member_count + 1 WHERE id = v_cohort_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

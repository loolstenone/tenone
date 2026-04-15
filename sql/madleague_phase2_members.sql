-- ============================================================
-- MADLeague Phase 2 — mad_members + 부속 테이블
-- 작성일: 2026-04-16
-- 원칙:
--   - tenone.biz 통합 Supabase Auth (auth.users 재사용)
--   - 전 테이블 tenant_id TEXT DEFAULT 'tenone'
--   - brand_id 역할은 mad_* 접두사가 대신 (implicit madleague)
-- ============================================================

-- ============================================================
-- mad_members — 매드리거
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  club_id UUID REFERENCES mad_clubs(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES mad_cohorts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  university TEXT,
  major TEXT,
  year_in_school INTEGER,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','club_leader','staff','super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','dormant','graduated','withdrawn')),
  activity_years INTEGER[] DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graduated_at TIMESTAMPTZ,
  portfolio_public BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  skill_tags TEXT[],
  bio TEXT,
  source_application_id UUID REFERENCES mad_applications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_members_tenant ON mad_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_members_user ON mad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mad_members_club ON mad_members(club_id);
CREATE INDEX IF NOT EXISTS idx_mad_members_status ON mad_members(status);

ALTER TABLE mad_members ENABLE ROW LEVEL SECURITY;

-- 본인은 자기 레코드를 읽고 수정할 수 있다
DROP POLICY IF EXISTS mad_members_read_own ON mad_members;
CREATE POLICY mad_members_read_own ON mad_members FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS mad_members_update_own ON mad_members;
CREATE POLICY mad_members_update_own ON mad_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 퍼블릭 포트폴리오 공개 멤버는 anon도 읽기 가능 (최소 필드만)
DROP POLICY IF EXISTS mad_members_read_public ON mad_members;
CREATE POLICY mad_members_read_public ON mad_members FOR SELECT
  USING (portfolio_public = true);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION mad_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mad_members_updated ON mad_members;
CREATE TRIGGER trg_mad_members_updated BEFORE UPDATE ON mad_members
  FOR EACH ROW EXECUTE FUNCTION mad_set_updated_at();

-- ============================================================
-- 지원서 승인 → mad_members 자동 생성 함수
-- (Intra admin API가 application을 accepted로 바꾸면 트리거됨)
-- ============================================================
CREATE OR REPLACE FUNCTION mad_promote_application_to_member() RETURNS TRIGGER AS $$
DECLARE
  v_cohort_id UUID;
BEGIN
  -- status가 accepted로 바뀔 때만
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- 동일 이메일 멤버가 이미 있으면 건너뜀
    IF NOT EXISTS (SELECT 1 FROM mad_members WHERE email = NEW.email AND club_id = NEW.club_id) THEN
      -- 해당 동아리·연도 cohort 찾기 (없으면 NULL)
      SELECT id INTO v_cohort_id FROM mad_cohorts
        WHERE club_id = NEW.club_id AND year = NEW.year
        ORDER BY created_at DESC LIMIT 1;

      INSERT INTO mad_members (
        club_id, cohort_id, name, email, phone, university, major, year_in_school,
        activity_years, source_application_id
      ) VALUES (
        NEW.club_id, v_cohort_id, NEW.name, NEW.email, NEW.phone, NEW.university, NEW.major, NEW.year_in_school,
        ARRAY[NEW.year], NEW.id
      );

      -- cohort member_count 증가
      IF v_cohort_id IS NOT NULL THEN
        UPDATE mad_cohorts SET member_count = member_count + 1 WHERE id = v_cohort_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_mad_app_to_member ON mad_applications;
CREATE TRIGGER trg_mad_app_to_member AFTER UPDATE ON mad_applications
  FOR EACH ROW EXECUTE FUNCTION mad_promote_application_to_member();

-- ============================================================
-- mad_members.user_id 연결 함수
-- (사이트에서 가입 플로우로 호출: 이메일 기반 매칭)
-- ============================================================
CREATE OR REPLACE FUNCTION mad_link_member_to_user(p_user_id UUID, p_email TEXT) RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
BEGIN
  UPDATE mad_members
     SET user_id = p_user_id
   WHERE email = p_email AND user_id IS NULL
  RETURNING id INTO v_member_id;
  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

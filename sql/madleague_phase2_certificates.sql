-- ============================================================
-- MADLeague Phase 2 — 인증서 시스템
-- 작성일: 2026-04-16
-- ============================================================

CREATE TABLE IF NOT EXISTS mad_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  member_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('activity','competition','award','crown')),
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_code TEXT UNIQUE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_cert_tenant ON mad_certificates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_cert_member ON mad_certificates(member_id);
CREATE INDEX IF NOT EXISTS idx_mad_cert_type ON mad_certificates(type);
CREATE INDEX IF NOT EXISTS idx_mad_cert_code ON mad_certificates(verification_code);

ALTER TABLE mad_certificates ENABLE ROW LEVEL SECURITY;

-- 본인 인증서 열람
DROP POLICY IF EXISTS mad_cert_read_own ON mad_certificates;
CREATE POLICY mad_cert_read_own ON mad_certificates FOR SELECT
  USING (member_id IN (SELECT id FROM mad_members WHERE user_id = auth.uid()));

-- 검증 URL용: 고유 코드로 anon 읽기 허용 (revoked 제외는 앱 레벨에서 처리)
DROP POLICY IF EXISTS mad_cert_read_by_code ON mad_certificates;
CREATE POLICY mad_cert_read_by_code ON mad_certificates FOR SELECT USING (true);

-- ============================================================
-- 인증 코드 생성 (A-Z0-9 10자리)
-- ============================================================
CREATE OR REPLACE FUNCTION mad_gen_cert_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 발급 가능 인증서 조회 함수
-- 리턴: {type, title, details, eligible}
-- ============================================================
CREATE OR REPLACE FUNCTION mad_eligible_certificates(p_member_id UUID)
RETURNS TABLE (
  cert_type TEXT,
  cert_title TEXT,
  cert_details JSONB,
  already_issued BOOLEAN
) AS $$
DECLARE
  v_member RECORD;
BEGIN
  SELECT m.*, c.name AS club_name, c.slug AS club_slug
    INTO v_member
    FROM mad_members m
    LEFT JOIN mad_clubs c ON c.id = m.club_id
   WHERE m.id = p_member_id;

  IF v_member IS NULL THEN RETURN; END IF;

  -- 1. 활동인증서 (activity_years 각각)
  FOR cert_type, cert_title, cert_details IN
    SELECT
      'activity'::TEXT,
      ('활동인증서 · ' || y::TEXT)::TEXT,
      jsonb_build_object(
        'member_name', v_member.name,
        'club_name', v_member.club_name,
        'year', y,
        'university', v_member.university
      )
    FROM unnest(v_member.activity_years) AS y
  LOOP
    already_issued := EXISTS (
      SELECT 1 FROM mad_certificates
      WHERE member_id = p_member_id AND type = 'activity'
        AND (details->>'year')::INT = (cert_details->>'year')::INT
    );
    RETURN NEXT;
  END LOOP;

  -- 2. 경쟁PT 참여 확인서 (member_ids는 Phase 2의 mad_competition_teams에서 — 현재는 생략)

  -- 3. 수상 확인서 (member가 속한 club이 상을 받은 경우)
  FOR cert_type, cert_title, cert_details IN
    SELECT
      CASE WHEN r.is_crown THEN 'crown' ELSE 'award' END::TEXT,
      ((comp.year::TEXT || ' ' || COALESCE(comp.client_name, comp.title) || ' ') ||
       CASE WHEN r.is_crown THEN 'MAD Crown' ELSE COALESCE(r.award_name, ((r.rank::TEXT) || '위')) END)::TEXT,
      jsonb_build_object(
        'member_name', v_member.name,
        'club_name', v_member.club_name,
        'year', comp.year,
        'client', comp.client_name,
        'team_name', r.team_name,
        'rank', r.rank,
        'award_name', r.award_name,
        'is_crown', r.is_crown
      )
    FROM mad_competition_results r
    JOIN mad_competitions comp ON comp.id = r.competition_id
    WHERE r.club_id = v_member.club_id
      AND comp.year = ANY(v_member.activity_years)
  LOOP
    already_issued := EXISTS (
      SELECT 1 FROM mad_certificates
      WHERE member_id = p_member_id
        AND type = cert_type
        AND (details->>'team_name') = (cert_details->>'team_name')
        AND (details->>'year')::INT = (cert_details->>'year')::INT
    );
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

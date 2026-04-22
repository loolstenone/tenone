-- MADLeague 고도화 마이그레이션
-- 1. mad_applications 누락 컬럼 추가
ALTER TABLE mad_applications
  ADD COLUMN IF NOT EXISTS cohort integer,
  ADD COLUMN IF NOT EXISTS activity_year integer,
  ADD COLUMN IF NOT EXISTS minor text,
  ADD COLUMN IF NOT EXISTS interested_industry text,
  ADD COLUMN IF NOT EXISTS interested_job text;

-- 2. mad_clubs 회장 컬럼 추가
ALTER TABLE mad_clubs
  ADD COLUMN IF NOT EXISTS president_member_id uuid REFERENCES members(id) ON DELETE SET NULL;

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_mad_applications_club_status
  ON mad_applications(club_id, status);

CREATE INDEX IF NOT EXISTS idx_mad_applications_email
  ON mad_applications(email);

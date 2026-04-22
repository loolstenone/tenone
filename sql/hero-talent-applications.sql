-- HeRo 탤런트 에이전시 신청 (Talent Agent applications)

CREATE TABLE IF NOT EXISTS hero_talent_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  field TEXT,                 -- 희망 분야 (마케팅·크리에이터·창업·개발·기타)
  stage TEXT,                 -- 현재 단계 (학생·신입·경력·리더십·공백복귀)
  intro TEXT,                 -- 자기 소개
  goal TEXT,                  -- 원하는 방향
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','reviewing','contacted','accepted','closed')),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS hero_talent_applications_status_idx ON hero_talent_applications(status);
CREATE INDEX IF NOT EXISTS hero_talent_applications_member_idx ON hero_talent_applications(member_id);
CREATE INDEX IF NOT EXISTS hero_talent_applications_created_idx ON hero_talent_applications(created_at DESC);

ALTER TABLE hero_talent_applications ENABLE ROW LEVEL SECURITY;

-- 비회원도 제출 가능 (insert)
DROP POLICY IF EXISTS hero_talent_app_insert ON hero_talent_applications;
CREATE POLICY hero_talent_app_insert ON hero_talent_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 본인 건 조회
DROP POLICY IF EXISTS hero_talent_app_owner_read ON hero_talent_applications;
CREATE POLICY hero_talent_app_owner_read ON hero_talent_applications
  FOR SELECT USING (member_id = auth.uid() OR member_id IS NULL);

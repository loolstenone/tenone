-- Phase 3: CRM People 확장 + Touchpoints

-- 1. crm_people 확장
ALTER TABLE crm_people
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_brand_id TEXT,
  ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'lead'
    CHECK (lifecycle_stage IN ('lead','mql','sql','customer','churned','archived')),
  ADD COLUMN IF NOT EXISTS last_touched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contact_owner UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS do_not_email BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC(12,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_crm_people_email_lower ON crm_people(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_crm_people_lifecycle ON crm_people(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_crm_people_owner ON crm_people(contact_owner);
CREATE INDEX IF NOT EXISTS idx_crm_people_member ON crm_people(member_id);
CREATE INDEX IF NOT EXISTS idx_crm_people_last_touched ON crm_people(last_touched_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_people_next_follow_up ON crm_people(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;

-- 2. crm_touchpoints: 사람별 모든 접점 타임라인
CREATE TABLE IF NOT EXISTS crm_touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES crm_people(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  -- 예: 'email_sent','email_opened','email_clicked','meeting','call','form','note','deal_created','purchase'
  subject TEXT,
  body TEXT,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_touchpoints_person ON crm_touchpoints(person_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_touchpoints_type ON crm_touchpoints(type);

ALTER TABLE crm_touchpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_touchpoints service_role" ON crm_touchpoints;
CREATE POLICY "crm_touchpoints service_role" ON crm_touchpoints FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "crm_touchpoints staff" ON crm_touchpoints;
CREATE POLICY "crm_touchpoints staff" ON crm_touchpoints FOR ALL USING (
  EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN members m ON m.id = mr.member_id
    WHERE m.auth_id = auth.uid()
      AND mr.is_active = true
      AND mr.role IN ('staff','manager','super_admin')
  )
);

-- 3. 자동 흡수: members INSERT 시 crm_people 자동 생성
CREATE OR REPLACE FUNCTION crm_absorb_member()
RETURNS TRIGGER AS $$
BEGIN
  -- 이미 동일 email로 person 있으면 member_id만 연결
  UPDATE crm_people
  SET member_id = NEW.id,
      updated_at = NOW()
  WHERE LOWER(email) = LOWER(NEW.email)
    AND member_id IS NULL;

  -- 없으면 새 person 생성
  INSERT INTO crm_people(
    brand_id, tenant_id, member_id, name, email, phone,
    type, status, lifecycle_stage, avatar_initials,
    source, source_detail
  )
  SELECT
    COALESCE(NEW.origin_site, 'tenone'),
    COALESCE(NEW.tenant_id, 'tenone'),
    NEW.id,
    COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    'Student',           -- crm_people.type 기본값
    'Active',
    'customer',
    COALESCE(NEW.avatar_initials, UPPER(LEFT(COALESCE(NEW.name, NEW.email), 1))),
    'member_signup',
    jsonb_build_object('origin_site', NEW.origin_site, 'account_type', NEW.account_type)
  WHERE NOT EXISTS (SELECT 1 FROM crm_people WHERE LOWER(email) = LOWER(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_crm_absorb_member ON members;
CREATE TRIGGER trg_crm_absorb_member
  AFTER INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION crm_absorb_member();

-- 4. email_sends → touchpoint 자동 기록 트리거 (CRM 발송만)
CREATE OR REPLACE FUNCTION crm_absorb_email_send()
RETURNS TRIGGER AS $$
DECLARE
  v_person_id UUID;
BEGIN
  IF NEW.kind NOT IN ('crm_broadcast') THEN RETURN NEW; END IF;

  SELECT id INTO v_person_id
  FROM crm_people
  WHERE LOWER(email) = LOWER(NEW.to_addr)
  LIMIT 1;

  IF v_person_id IS NOT NULL THEN
    INSERT INTO crm_touchpoints(person_id, type, subject, meta, occurred_at)
    VALUES (
      v_person_id,
      'email_sent',
      NEW.subject,
      jsonb_build_object('send_id', NEW.id, 'from_addr', NEW.from_addr, 'source_id', NEW.source_id),
      COALESCE(NEW.sent_at, NEW.created_at)
    );

    UPDATE crm_people
    SET last_touched_at = COALESCE(NEW.sent_at, NEW.created_at),
        updated_at = NOW()
    WHERE id = v_person_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_crm_absorb_email_send ON email_sends;
CREATE TRIGGER trg_crm_absorb_email_send
  AFTER INSERT ON email_sends
  FOR EACH ROW
  EXECUTE FUNCTION crm_absorb_email_send();

-- 5. 백필: 기존 members → crm_people 병합
DO $$
BEGIN
  -- 이미 같은 email의 person이 있으면 member_id만 채우기
  UPDATE crm_people cp
  SET member_id = m.id, updated_at = NOW()
  FROM members m
  WHERE cp.member_id IS NULL
    AND LOWER(cp.email) = LOWER(m.email);

  -- person 없는 member들 새로 생성
  INSERT INTO crm_people(
    brand_id, tenant_id, member_id, name, email, phone,
    type, status, lifecycle_stage, avatar_initials,
    source, source_detail, created_at, updated_at
  )
  SELECT
    COALESCE(m.origin_site, 'tenone'),
    COALESCE(m.tenant_id, 'tenone'),
    m.id, COALESCE(m.name, split_part(m.email, '@', 1)),
    m.email, m.phone,
    'Student', 'Active', 'customer',
    COALESCE(m.avatar_initials, UPPER(LEFT(COALESCE(m.name, m.email), 1))),
    'member_signup',
    jsonb_build_object('origin_site', m.origin_site, 'account_type', m.account_type, 'backfilled', true),
    m.created_at, NOW()
  FROM members m
  WHERE NOT EXISTS (SELECT 1 FROM crm_people cp WHERE LOWER(cp.email) = LOWER(m.email));
END $$;

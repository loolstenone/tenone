-- Phase 4: CRM Segments (동적 규칙 기반 세그먼트)

CREATE TABLE IF NOT EXISTS crm_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'dynamic' CHECK (kind IN ('dynamic','static')),
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- dynamic: { logic: 'and'|'or', conditions: [{ field, op, value }] }
    -- static:  { person_ids: [...] }
  person_ids UUID[] DEFAULT NULL,   -- static 세그먼트 전용
  color TEXT DEFAULT '#171717',
  brand_id TEXT DEFAULT 'tenone',
  tenant_id TEXT DEFAULT 'tenone',
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_computed_count INT,
  last_computed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_segments_brand ON crm_segments(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_segments_created_by ON crm_segments(created_by);

ALTER TABLE crm_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_segments service_role" ON crm_segments;
CREATE POLICY "crm_segments service_role" ON crm_segments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "crm_segments staff" ON crm_segments;
CREATE POLICY "crm_segments staff" ON crm_segments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN members m ON m.id = mr.member_id
    WHERE m.auth_id = auth.uid()
      AND mr.is_active = true
      AND mr.role IN ('staff','manager','super_admin')
  )
);

-- 기본 시드: 자주 쓰는 세그먼트
INSERT INTO crm_segments(name, description, kind, rules, color) VALUES
  ('전체 고객',       '라이프사이클 = customer',        'dynamic',
    '{"logic":"and","conditions":[{"field":"lifecycle_stage","op":"eq","value":"customer"}]}'::jsonb, '#10b981'),
  ('신규 리드 (7일)', '지난 7일 내 생성된 lead',         'dynamic',
    '{"logic":"and","conditions":[{"field":"lifecycle_stage","op":"eq","value":"lead"},{"field":"created_at","op":"gte","value":"now-7d"}]}'::jsonb, '#3b82f6'),
  ('유니버스 회원',   'members 테이블과 연결된 Person', 'dynamic',
    '{"logic":"and","conditions":[{"field":"has_member","op":"eq","value":true}]}'::jsonb, '#8b5cf6'),
  ('발송 가능',       '이메일 수신 거부 아님',          'dynamic',
    '{"logic":"and","conditions":[{"field":"do_not_email","op":"eq","value":false}]}'::jsonb, '#171717')
ON CONFLICT DO NOTHING;

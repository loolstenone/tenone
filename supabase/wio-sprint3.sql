-- WIO Sprint 3: People + Sales + GPR

-- 1. 포인트 로그
CREATE TABLE IF NOT EXISTS wio_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  activity TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HIT 역량 진단 결과
CREATE TABLE IF NOT EXISTS wio_hit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  disc_type TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  summary TEXT,
  raw_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 기회 (영업 파이프라인)
CREATE TABLE IF NOT EXISTS wio_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source TEXT,
  url TEXT,
  description TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','evaluating','qualified','proposal','won','lost','converted')),
  relevance_score INTEGER DEFAULT 0,
  estimated_value BIGINT DEFAULT 0,
  deadline DATE,
  assigned_to UUID REFERENCES wio_members(id),
  converted_project_id UUID REFERENCES wio_projects(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 리드
CREATE TABLE IF NOT EXISTS wio_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','proposal','closed_won','closed_lost')),
  assigned_to UUID REFERENCES wio_members(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GPR (Goal-Plan-Result)
CREATE TABLE IF NOT EXISTS wio_gpr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('org','business','project','personal')),
  owner_id UUID NOT NULL REFERENCES wio_members(id),
  project_id UUID REFERENCES wio_projects(id),
  period TEXT NOT NULL,
  goal TEXT NOT NULL,
  plan TEXT,
  result TEXT,
  score INTEGER,
  status TEXT DEFAULT 'goal_set' CHECK (status IN ('goal_set','planning','in_progress','review','completed')),
  parent_gpr_id UUID REFERENCES wio_gpr(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_wio_points_member ON wio_points(member_id);
CREATE INDEX IF NOT EXISTS idx_wio_hit_member ON wio_hit_results(member_id);
CREATE INDEX IF NOT EXISTS idx_wio_opportunities_tenant ON wio_opportunities(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_leads_tenant ON wio_leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_gpr_tenant ON wio_gpr(tenant_id, level);
CREATE INDEX IF NOT EXISTS idx_wio_gpr_owner ON wio_gpr(owner_id);
CREATE INDEX IF NOT EXISTS idx_wio_gpr_project ON wio_gpr(project_id);

-- RLS
ALTER TABLE wio_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_hit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_gpr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wio_points_tenant" ON wio_points FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_hit_tenant" ON wio_hit_results FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_opportunities_tenant" ON wio_opportunities FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_leads_tenant" ON wio_leads FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_gpr_tenant" ON wio_gpr FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));

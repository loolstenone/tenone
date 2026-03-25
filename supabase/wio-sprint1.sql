-- WIO 솔루션 Sprint 1: 테넌트 + 프로젝트 기반
-- 모든 테이블에 tenant_id 필수

-- 0. 테넌트 (조직/기업)
CREATE TABLE IF NOT EXISTS wio_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366F1',
  service_name TEXT DEFAULT 'WIO',
  powered_by BOOLEAN DEFAULT true,
  modules TEXT[] DEFAULT '{home,project,talk}',
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter','growth','pro','enterprise')),
  max_members INTEGER DEFAULT 20,
  owner_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1. 테넌트 멤버
CREATE TABLE IF NOT EXISTS wio_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','manager','member','guest')),
  job_title TEXT,
  department TEXT,
  avatar_url TEXT,
  module_access TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- 2. 프로젝트
CREATE TABLE IF NOT EXISTS wio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'client' CHECK (type IN ('client','internal','community','personal')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','in_progress','completed','cancelled')),
  pm_id UUID REFERENCES wio_members(id),
  client_name TEXT,
  budget BIGINT DEFAULT 0,
  revenue BIGINT DEFAULT 0,
  started_at DATE,
  deadline DATE,
  completed_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Job (프로젝트 하위 업무)
CREATE TABLE IF NOT EXISTS wio_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES wio_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES wio_members(id),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done','cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  estimated_hours NUMERIC(6,1) DEFAULT 0,
  actual_hours NUMERIC(6,1) DEFAULT 0,
  hourly_rate BIGINT DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 타임시트
CREATE TABLE IF NOT EXISTS wio_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES wio_jobs(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  hours NUMERIC(4,1) NOT NULL DEFAULT 0,
  note TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES wio_members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, job_id, work_date)
);

-- 5. 프로젝트 멤버 (크루)
CREATE TABLE IF NOT EXISTS wio_project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES wio_projects(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('pm','lead','member','support')),
  hourly_rate BIGINT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, member_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_wio_members_tenant ON wio_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_members_user ON wio_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wio_projects_tenant ON wio_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_projects_status ON wio_projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_jobs_project ON wio_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_wio_jobs_assignee ON wio_jobs(assignee_id);
CREATE INDEX IF NOT EXISTS idx_wio_timesheets_member ON wio_timesheets(member_id);
CREATE INDEX IF NOT EXISTS idx_wio_timesheets_job ON wio_timesheets(job_id);
CREATE INDEX IF NOT EXISTS idx_wio_timesheets_date ON wio_timesheets(work_date);
CREATE INDEX IF NOT EXISTS idx_wio_project_members_project ON wio_project_members(project_id);

-- RLS
ALTER TABLE wio_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_project_members ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 테넌트 소속 멤버만 접근
CREATE POLICY "wio_tenants_select" ON wio_tenants FOR SELECT USING (
  id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())
);
CREATE POLICY "wio_tenants_owner" ON wio_tenants FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "wio_members_select" ON wio_members FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())
);
CREATE POLICY "wio_members_insert" ON wio_members FOR INSERT WITH CHECK (true);
CREATE POLICY "wio_members_update" ON wio_members FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "wio_projects_tenant" ON wio_projects FOR ALL USING (
  tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())
);

CREATE POLICY "wio_jobs_tenant" ON wio_jobs FOR ALL USING (
  tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())
);

CREATE POLICY "wio_timesheets_tenant" ON wio_timesheets FOR ALL USING (
  tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())
);

CREATE POLICY "wio_project_members_tenant" ON wio_project_members FOR ALL USING (
  tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())
);

-- 텐원 기본 테넌트 시드 (자사용)
INSERT INTO wio_tenants (id, name, slug, domain, service_name, modules, plan, max_members)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Ten:One™',
  'tenone',
  'tenone.biz',
  'Ten:One™ Office',
  '{home,project,talk,finance,people,sales,learn,content,wiki,insight}',
  'enterprise',
  999
) ON CONFLICT (slug) DO NOTHING;

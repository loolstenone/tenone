-- WIO Sprint 4: Learn + Content + Wiki

-- 1. 교육 과정
CREATE TABLE IF NOT EXISTS wio_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'required' CHECK (category IN ('required','professional','advanced')),
  chapters JSONB DEFAULT '[]',
  duration_minutes INTEGER DEFAULT 0,
  points_reward INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 수강
CREATE TABLE IF NOT EXISTS wio_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES wio_courses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','quiz','completed')),
  quiz_score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, member_id)
);

-- 3. 콘텐츠
CREATE TABLE IF NOT EXISTS wio_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  channel TEXT DEFAULT 'blog' CHECK (channel IN ('works','newsroom','blog')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  author_id UUID REFERENCES wio_members(id),
  cover_image_url TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 위키 문서
CREATE TABLE IF NOT EXISTS wio_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general',
  author_id UUID REFERENCES wio_members(id),
  project_id UUID REFERENCES wio_projects(id),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_wio_courses_tenant ON wio_courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_enrollments_member ON wio_enrollments(member_id);
CREATE INDEX IF NOT EXISTS idx_wio_contents_tenant ON wio_contents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_documents_tenant ON wio_documents(tenant_id);

-- RLS
ALTER TABLE wio_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wio_courses_tenant" ON wio_courses FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_enrollments_tenant" ON wio_enrollments FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_contents_tenant" ON wio_contents FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_documents_tenant" ON wio_documents FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));

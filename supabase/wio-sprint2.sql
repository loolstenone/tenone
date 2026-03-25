-- WIO Sprint 2: 소통 + 재무

-- 1. 게시판 (공지/자유/QnA)
CREATE TABLE IF NOT EXISTS wio_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  board TEXT NOT NULL DEFAULT 'free' CHECK (board IN ('notice','free','qna')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  author_id UUID NOT NULL REFERENCES wio_members(id),
  is_pinned BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 일정
CREATE TABLE IF NOT EXISTS wio_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  project_id UUID REFERENCES wio_projects(id),
  created_by UUID NOT NULL REFERENCES wio_members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 할일
CREATE TABLE IF NOT EXISTS wio_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  due_date DATE,
  project_id UUID REFERENCES wio_projects(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 알림
CREATE TABLE IF NOT EXISTS wio_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 메신저 스레드
CREATE TABLE IF NOT EXISTS wio_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  name TEXT,
  type TEXT DEFAULT 'group' CHECK (type IN ('dm','group','project')),
  project_id UUID REFERENCES wio_projects(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 메신저 메시지
CREATE TABLE IF NOT EXISTS wio_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES wio_chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES wio_members(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 전자결재
CREATE TABLE IF NOT EXISTS wio_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general','expense','project','hr')),
  title TEXT NOT NULL,
  content TEXT,
  requester_id UUID NOT NULL REFERENCES wio_members(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approver_id UUID REFERENCES wio_members(id),
  project_id UUID REFERENCES wio_projects(id),
  amount BIGINT DEFAULT 0,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 경비
CREATE TABLE IF NOT EXISTS wio_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES wio_members(id),
  project_id UUID REFERENCES wio_projects(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. 정산
CREATE TABLE IF NOT EXISTS wio_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES wio_tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES wio_projects(id),
  member_id UUID REFERENCES wio_members(id),
  type TEXT NOT NULL CHECK (type IN ('internal','external','profit_share')),
  amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','paid')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_wio_posts_tenant ON wio_posts(tenant_id, board);
CREATE INDEX IF NOT EXISTS idx_wio_events_tenant ON wio_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_todos_member ON wio_todos(member_id);
CREATE INDEX IF NOT EXISTS idx_wio_notifications_member ON wio_notifications(member_id, is_read);
CREATE INDEX IF NOT EXISTS idx_wio_chat_messages_thread ON wio_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_wio_approvals_tenant ON wio_approvals(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_expenses_tenant ON wio_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_settlements_project ON wio_settlements(project_id);

-- RLS
ALTER TABLE wio_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_settlements ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (테넌트 소속 멤버만 접근)
CREATE POLICY "wio_posts_tenant" ON wio_posts FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_events_tenant" ON wio_events FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_todos_owner" ON wio_todos FOR ALL USING (member_id IN (SELECT id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_notifications_owner" ON wio_notifications FOR ALL USING (member_id IN (SELECT id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_chat_threads_tenant" ON wio_chat_threads FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_chat_messages_thread" ON wio_chat_messages FOR ALL USING (thread_id IN (SELECT id FROM wio_chat_threads WHERE tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid())));
CREATE POLICY "wio_approvals_tenant" ON wio_approvals FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_expenses_tenant" ON wio_expenses FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));
CREATE POLICY "wio_settlements_tenant" ON wio_settlements FOR ALL USING (tenant_id IN (SELECT tenant_id FROM wio_members WHERE user_id = auth.uid()));

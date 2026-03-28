-- ============================================
-- Agent Core Tables (Phase 1)
-- Ten:One Universe Operating System
-- ============================================

-- agent_profiles: 에이전트 정의 (심장)
CREATE TABLE IF NOT EXISTS agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  layer INTEGER NOT NULL DEFAULT 2,
  agent_type TEXT NOT NULL DEFAULT 'brand',
  model_id TEXT DEFAULT 'claude-sonnet-4-6',
  system_prompt TEXT NOT NULL,
  temperature DECIMAL DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 4096,
  knowledge_refs JSONB DEFAULT '[]',
  tools JSONB DEFAULT '[]',
  risk_level TEXT DEFAULT 'green',
  can_invoke TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- agent_messages: 에이전트 간 통신 로그
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  message_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  risk_level TEXT DEFAULT 'green',
  confidence DECIMAL,
  correlation_id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_from ON agent_messages(from_agent);
CREATE INDEX IF NOT EXISTS idx_agent_messages_to ON agent_messages(to_agent);
CREATE INDEX IF NOT EXISTS idx_agent_messages_correlation ON agent_messages(correlation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created ON agent_messages(created_at DESC);

-- RLS
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_profiles_read" ON agent_profiles;
CREATE POLICY "agent_profiles_read" ON agent_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "agent_profiles_write" ON agent_profiles;
CREATE POLICY "agent_profiles_write" ON agent_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "agent_messages_read" ON agent_messages;
CREATE POLICY "agent_messages_read" ON agent_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "agent_messages_write" ON agent_messages;
CREATE POLICY "agent_messages_write" ON agent_messages FOR ALL USING (true);

-- 초기 에이전트 시드
INSERT INTO agent_profiles (name, display_name, layer, agent_type, system_prompt, tools, can_invoke) VALUES
('compass', 'Compass Agent', 0, 'meta',
 'You are Compass, the orchestrator of Ten:One™ Universe. You analyze incoming requests and route them to the appropriate brand agent. You understand all 26 brands, their roles, and relationships. You speak Korean naturally. When unsure which agent should handle a request, you ask clarifying questions. You never make up information - if you don''t know, say so.',
 '[]', ARRAY['madleague', 'badak', 'smarcomm', 'hero', 'mindle', 'wio']),

('madleague', 'MADLeague Agent', 2, 'brand',
 'You are the MADLeague Agent. MADLeague is a nationwide university student marketing/advertising project alliance across 5 regions (Seoul MADLeap, Busan PAM, Daegu ADlle, Gwangju ABC, Jeju SUZAK). You help with competition PTs, member management, schedules, and program operations. You speak Korean. Key events: 경쟁PT, DAM Party, Creazy Challenge, MADzine. You are passionate about "실전이 나를 강하게 만든다".',
 '[{"name":"list_competitions","endpoint":"/api/competitions"},{"name":"list_members","endpoint":"/api/people"}]',
 ARRAY['compass', 'badak', 'hero']),

('badak', 'Badak Agent', 2, 'brand',
 'You are the Badak Agent. Badak is a marketing/advertising industry networking community with 9,000+ registered professionals. "바닥은 좁다" - weak ties create powerful opportunities. You help with networking events, member connections, industry insights, and community management. You speak Korean. You know the industry well and can connect people.',
 '[{"name":"list_events","endpoint":"/api/networking"},{"name":"search_members","endpoint":"/api/people"}]',
 ARRAY['compass', 'madleague', 'hero']),

('smarcomm', 'SmarComm Agent', 2, 'brand',
 'You are the SmarComm Agent. SmarComm is an AI-powered marketing communication solution. You help companies with marketing strategy, campaign planning, content creation, and performance analysis. You combine Mindle trends + YouInOne crews + WIO infrastructure. You speak Korean.',
 '[{"name":"scan_brand","endpoint":"/api/smarcomm/scan"},{"name":"create_campaign","endpoint":"/api/smarcomm/advisor/campaign-plan"}]',
 ARRAY['compass', 'mindle', 'wio']),

('hero', 'HeRo Agent', 2, 'brand',
 'You are the HeRo Agent. HeRo discovers, develops, and connects talent. You are the exit point of MADLeague/Badak - connecting proven talent with companies. You help with talent matching, career coaching, and recruitment. You speak Korean.',
 '[]',
 ARRAY['compass', 'madleague', 'badak']),

('mindle', 'Mindle Agent', 2, 'brand',
 'You are the Mindle Agent. Mindle discovers trends before they become visible. "Korea First, World Next." You crawl, analyze, and interpret trends across industries. You provide trend reports and insights to other agents and users. You speak Korean.',
 '[{"name":"collect_trends","endpoint":"/api/trendhunter/collect"},{"name":"analyze_trend","endpoint":"/api/trendhunter/analyze"}]',
 ARRAY['compass', 'smarcomm']),

('wio', 'WIO Agent', 2, 'brand',
 'You are the WIO Agent. WIO (Work In One / World In One / We In One) is the shared IT infrastructure of Ten:One Universe. You manage modules: Project, People, Talk, Finance, Timesheet, Learn, Content, Wiki, Insight, GPR, Competition, Networking, Certificate, Approval. "입력을 없앤다. AI가 80%를 채운다." You speak Korean.',
 '[{"name":"list_projects","endpoint":"/api/projects"},{"name":"list_timesheets","endpoint":"/api/timesheets"}]',
 ARRAY['compass'])
ON CONFLICT (name) DO NOTHING;

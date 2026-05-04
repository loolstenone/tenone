-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 외부 연동 인프라
-- Google Calendar · Todoist · Notion · Slack ...
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS myverse_integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('google_calendar', 'todoist', 'notion', 'slack', 'kakao')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'expired', 'error')),
  access_token    TEXT,
  refresh_token   TEXT,
  expires_at      TIMESTAMPTZ,
  scope           TEXT,
  external_email  TEXT,
  external_name   TEXT,
  sync_direction  TEXT DEFAULT 'read' CHECK (sync_direction IN ('read', 'write', 'both')),
  last_sync_at    TIMESTAMPTZ,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_myverse_integrations_member ON myverse_integrations(member_id);
CREATE INDEX IF NOT EXISTS idx_myverse_integrations_provider ON myverse_integrations(provider, status);

ALTER TABLE myverse_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "본인만" ON myverse_integrations;
CREATE POLICY "본인만" ON myverse_integrations
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

-- 외부 캘린더 이벤트 캐시 (성능 최적화 + 오프라인 조회)
CREATE TABLE IF NOT EXISTS myverse_external_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  external_id     TEXT NOT NULL,
  summary         TEXT NOT NULL,
  description     TEXT,
  location        TEXT,
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ,
  is_all_day      BOOLEAN DEFAULT false,
  html_link       TEXT,
  fetched_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, provider, external_id)
);

CREATE INDEX IF NOT EXISTS idx_myverse_external_events_member_date ON myverse_external_events(member_id, start_at);

ALTER TABLE myverse_external_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "본인만" ON myverse_external_events;
CREATE POLICY "본인만" ON myverse_external_events
  USING (member_id IN (SELECT id FROM members WHERE email = auth.jwt()->>'email'));

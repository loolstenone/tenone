-- SmarComm 정기 자동 재진단 스케줄 테이블
-- V2.0 Phase 5 Item 1 — Smart-Data Hub 시계열 풍부화 + AIRM 자동 발견

CREATE TABLE IF NOT EXISTS smarcomm_rescan_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenone-demo',
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  industry TEXT,
  requester_email TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  cadence TEXT NOT NULL DEFAULT 'weekly',  -- weekly | biweekly | monthly
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rescan_schedules_tenant ON smarcomm_rescan_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rescan_schedules_domain ON smarcomm_rescan_schedules(domain);
CREATE INDEX IF NOT EXISTS idx_rescan_schedules_active_next ON smarcomm_rescan_schedules(active, next_run_at)
  WHERE active = true;

ALTER TABLE smarcomm_rescan_schedules ENABLE ROW LEVEL SECURITY;

-- service_role (cron) bypasses RLS automatically
-- anon/authenticated: no access
CREATE POLICY "no_public_access" ON smarcomm_rescan_schedules
  FOR ALL TO anon, authenticated USING (false);

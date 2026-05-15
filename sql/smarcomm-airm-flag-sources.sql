-- SmarComm AIRM 플래그 출처 추적 — Phase 5 Item 3
-- AI 플래그 발생 시 외부 검색 API로 "AI가 학습했을 가능성이 높은 페이지" Top N 저장

CREATE TABLE IF NOT EXISTS smarcomm_ai_flag_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id         uuid NOT NULL REFERENCES smarcomm_ai_flags(id) ON DELETE CASCADE,
  tenant_id       text NOT NULL,
  url             text NOT NULL,
  title           text,
  snippet         text,
  source_type     text CHECK (source_type IN ('news', 'blog', 'wiki', 'official', 'forum', 'other')),
  relevance_score float CHECK (relevance_score >= 0 AND relevance_score <= 1),
  fetched_at      timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flag_sources_flag_id
  ON smarcomm_ai_flag_sources (flag_id);

CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flag_sources_tenant_id
  ON smarcomm_ai_flag_sources (tenant_id);

-- RLS
ALTER TABLE smarcomm_ai_flag_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON smarcomm_ai_flag_sources
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "service role bypass" ON smarcomm_ai_flag_sources
  FOR ALL TO service_role USING (true);

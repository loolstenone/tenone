-- Phase 3.4 — Hallucination Detection
-- 목적: AI 응답에서 브랜드 사실 오류 감지 (D.SaiO 대응)
--
-- 2테이블:
--   smarcomm_brand_facts     — 자사 사이트에서 추출한 ground truth
--   smarcomm_hallucinations  — AI 응답 vs ground truth 불일치 기록

-- ────────────────────────────────────────────────────────────
-- 1) Ground Truth: 사이트에서 추출한 사실
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_brand_facts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id      uuid NOT NULL REFERENCES smarcomm_scans(id) ON DELETE CASCADE,
    domain       text NOT NULL,
    fact_type    text NOT NULL,          -- 'price' | 'features' | 'strengths' | 'category' | 'founded'
    fact_value   jsonb NOT NULL,
    source       text NOT NULL,          -- 'schema:Organization' | 'meta:description' | 'hero:text' 등
    raw_excerpt  text,                   -- 원문 단편
    confidence   smallint NOT NULL DEFAULT 100 CHECK (confidence BETWEEN 0 AND 100),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_facts_scan ON smarcomm_brand_facts(scan_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_facts_domain ON smarcomm_brand_facts(domain);
CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_facts_type ON smarcomm_brand_facts(fact_type);

ALTER TABLE smarcomm_brand_facts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS smarcomm_brand_facts_public_read ON smarcomm_brand_facts;
CREATE POLICY smarcomm_brand_facts_public_read ON smarcomm_brand_facts
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS smarcomm_brand_facts_service ON smarcomm_brand_facts;
CREATE POLICY smarcomm_brand_facts_service ON smarcomm_brand_facts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE smarcomm_brand_facts IS 'Ground truth facts extracted from the scanned site itself. Used as reference for hallucination detection against AI responses.';

-- ────────────────────────────────────────────────────────────
-- 2) Hallucinations: AI 응답에서 감지된 사실 오류
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_hallucinations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id       uuid NOT NULL REFERENCES smarcomm_scans(id) ON DELETE CASCADE,
    probe_id      uuid REFERENCES smarcomm_ai_probes(id) ON DELETE SET NULL,
    platform      text NOT NULL,         -- 'claude' | 'chatgpt' | 'perplexity' | 'google-aio' | 'naver-cue'
    claim_text    text NOT NULL,         -- AI가 한 구체 주장 (원문)
    claim_type    text,                  -- brand_facts.fact_type와 매칭
    ground_truth  jsonb,                 -- 사이트의 실제 값 (있을 때만)
    severity      text NOT NULL CHECK (severity IN ('factual_error', 'partial_match', 'unverifiable')),
    explanation   text,                  -- LLM이 생성한 사유
    confidence    smallint NOT NULL DEFAULT 80 CHECK (confidence BETWEEN 0 AND 100),
    detected_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_hallucinations_scan ON smarcomm_hallucinations(scan_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_hallucinations_probe ON smarcomm_hallucinations(probe_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_hallucinations_platform ON smarcomm_hallucinations(platform);
CREATE INDEX IF NOT EXISTS idx_smarcomm_hallucinations_severity ON smarcomm_hallucinations(severity);

ALTER TABLE smarcomm_hallucinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS smarcomm_hallucinations_public_read ON smarcomm_hallucinations;
CREATE POLICY smarcomm_hallucinations_public_read ON smarcomm_hallucinations
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS smarcomm_hallucinations_service ON smarcomm_hallucinations;
CREATE POLICY smarcomm_hallucinations_service ON smarcomm_hallucinations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE smarcomm_hallucinations IS 'AI claims that do not match ground truth (smarcomm_brand_facts). Severity: factual_error = clear contradiction, partial_match = approximate, unverifiable = no ground truth to compare.';

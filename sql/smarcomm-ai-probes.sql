-- SmarComm AI Probe 실측 결과 저장
--
-- 5 AI 플랫폼 × N 질문의 실제 응답 캡처 (감사 보존 + 시계열 추적).
-- 보고서의 "AI Visibility Map" + "AI 실측 응답" 섹션의 데이터 소스.
--
-- CLAUDE.md § 3-A SSOT-2 (5 AI 플랫폼) + SSOT-3 (Question Bank) 참조.

CREATE TABLE IF NOT EXISTS smarcomm_ai_probes (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id               UUID NOT NULL REFERENCES smarcomm_scans(id) ON DELETE CASCADE,

    -- 플랫폼 (CLAUDE.md § 3-A SSOT-2)
    platform              TEXT NOT NULL CHECK (platform IN ('claude','chatgpt','perplexity','naver-cue','google-aio')),

    -- 질문 (CLAUDE.md § 3-A SSOT-3)
    category              TEXT NOT NULL CHECK (category IN ('brand_direct','product_generic','use_case','competitor','pricing','howto','local')),
    query                 TEXT NOT NULL,

    -- 응답 캡처
    raw_response          TEXT NOT NULL,        -- 원본 (감사용)
    citations             JSONB,                -- Perplexity/Google AIO citations 배열

    -- 검출 결과
    mentioned             BOOLEAN NOT NULL,
    position              INTEGER,              -- 추천 순위 (NULL = 미언급)
    accuracy              TEXT NOT NULL CHECK (accuracy IN ('exact','partial','wrong','absent')),
    extracted_facts       JSONB,                -- {price: "14.9만 원", category: "marketing-saas"} 등

    -- 메타
    measured_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cost_usd              NUMERIC(10, 6),       -- API 호출 비용 (선택)
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_probes_scan_id ON smarcomm_ai_probes(scan_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_probes_platform ON smarcomm_ai_probes(platform, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_probes_mentioned ON smarcomm_ai_probes(scan_id, mentioned) WHERE mentioned = TRUE;
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_probes_category ON smarcomm_ai_probes(category, platform);

-- RLS
ALTER TABLE smarcomm_ai_probes ENABLE ROW LEVEL SECURITY;

-- 공유 URL은 누구나 읽기 가능 (scan과 일관)
DROP POLICY IF EXISTS "smarcomm_ai_probes_public_read" ON smarcomm_ai_probes;
CREATE POLICY "smarcomm_ai_probes_public_read" ON smarcomm_ai_probes
    FOR SELECT
    USING (TRUE);

-- 코멘트
COMMENT ON TABLE smarcomm_ai_probes IS 'AI 플랫폼별 질문 응답 실측 (CLAUDE.md § 3-A SSOT-2/3)';
COMMENT ON COLUMN smarcomm_ai_probes.raw_response IS '원본 응답 텍스트 (감사 보존)';
COMMENT ON COLUMN smarcomm_ai_probes.citations IS 'Perplexity/Google AIO citations — [{url, title}] 형식';
COMMENT ON COLUMN smarcomm_ai_probes.position IS '추천 순위 (1부터). NULL = 미언급. 99 = 본문 언급(리스트 외)';

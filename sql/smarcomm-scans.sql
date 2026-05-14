-- SmarComm Index 진단 결과 영구 저장
--
-- 목적:
--   1) 공유 가능 보고서 URL (/smarcomm/report/[id]) 활성화
--   2) 시계열 추적 (같은 URL을 여러 번 진단 → 점수 추이)
--   3) 업종 백분위 계산 (Phase 4)
--
-- 정책:
--   - 비회원 진단도 저장 (member_id = NULL)
--   - 회원이 가입 후 자신의 진단 기록을 가져갈 수 있음 (claim)
--   - 공유 ID = nanoid 스타일 short_id (12자), URL friendly

CREATE TABLE IF NOT EXISTS smarcomm_scans (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id              TEXT UNIQUE NOT NULL,                -- 공유 URL용 (예: "k3jd9fmsa20a")
    member_id             UUID REFERENCES members(id) ON DELETE SET NULL,
    requester_email       TEXT,                                -- 비회원 진단 시 이메일 (선택)
    requester_ip          INET,                                -- 어뷰즈 방지

    -- 진단 대상
    url                   TEXT NOT NULL,
    domain                TEXT NOT NULL,                       -- url에서 추출 (인덱스용)
    industry              TEXT,                                -- 업종 (Phase 2 question-bank 매칭용)

    -- 점수 — SmarComm Index SSOT (CLAUDE.md § 3-A SSOT-1)
    smarcomm_index        INTEGER NOT NULL CHECK (smarcomm_index BETWEEN 0 AND 100),
    findability_score     INTEGER NOT NULL CHECK (findability_score BETWEEN 0 AND 100),
    trust_score           INTEGER NOT NULL CHECK (trust_score BETWEEN 0 AND 100),
    citability_score      INTEGER NOT NULL CHECK (citability_score BETWEEN 0 AND 100),
    performance_score     INTEGER,                             -- PageSpeed 원본 (참고용)
    grade                 TEXT NOT NULL CHECK (grade IN ('S','A','B','C','D')),

    -- 분석 메트릭 (서머리)
    fetch_time_ms         INTEGER,
    status_code           INTEGER,
    pages_analyzed        INTEGER DEFAULT 1,
    favicon_url           TEXT,

    -- 원본 결과 (JSON) — 보고서 렌더용
    analysis              JSONB NOT NULL,                      -- AnalysisResult 전체
    breakdown             JSONB NOT NULL,                      -- IndexBreakdown (3축 분류)

    -- 메타
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at            TIMESTAMPTZ                          -- 비회원 진단은 30일 후 만료 (운영 정책)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_smarcomm_scans_short_id ON smarcomm_scans(short_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_scans_member_id ON smarcomm_scans(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_smarcomm_scans_domain ON smarcomm_scans(domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smarcomm_scans_industry ON smarcomm_scans(industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_smarcomm_scans_created ON smarcomm_scans(created_at DESC);

-- 서브페이지 (참조 무결성 + 별도 분석)
CREATE TABLE IF NOT EXISTS smarcomm_scan_pages (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id               UUID NOT NULL REFERENCES smarcomm_scans(id) ON DELETE CASCADE,
    url                   TEXT NOT NULL,
    title                 TEXT,
    has_meta_description  BOOLEAN NOT NULL DEFAULT FALSE,
    has_h1                BOOLEAN NOT NULL DEFAULT FALSE,
    text_length           INTEGER NOT NULL DEFAULT 0,
    img_count             INTEGER NOT NULL DEFAULT 0,
    img_with_alt          INTEGER NOT NULL DEFAULT 0,
    status_code           INTEGER,
    issues                TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_scan_pages_scan_id ON smarcomm_scan_pages(scan_id);

-- RLS
ALTER TABLE smarcomm_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_scan_pages ENABLE ROW LEVEL SECURITY;

-- 공유 URL은 누구나 읽을 수 있어야 함 (Read-only by short_id)
DROP POLICY IF EXISTS "smarcomm_scans_public_read" ON smarcomm_scans;
CREATE POLICY "smarcomm_scans_public_read" ON smarcomm_scans
    FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "smarcomm_scan_pages_public_read" ON smarcomm_scan_pages;
CREATE POLICY "smarcomm_scan_pages_public_read" ON smarcomm_scan_pages
    FOR SELECT
    USING (TRUE);

-- INSERT/UPDATE는 service_role만 (API 경유)
-- (service_role은 RLS 우회하므로 별도 정책 불필요)

-- 회원이 자신의 진단 삭제
DROP POLICY IF EXISTS "smarcomm_scans_owner_delete" ON smarcomm_scans;
CREATE POLICY "smarcomm_scans_owner_delete" ON smarcomm_scans
    FOR DELETE
    USING (
        member_id IS NOT NULL
        AND member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );

-- 코멘트
COMMENT ON TABLE smarcomm_scans IS 'SmarComm Index 진단 결과 영구 저장 (CLAUDE.md § 3-A SSOT)';
COMMENT ON COLUMN smarcomm_scans.short_id IS '공유 URL용 짧은 ID (/smarcomm/report/{short_id})';
COMMENT ON COLUMN smarcomm_scans.smarcomm_index IS '가중치 30/30/40 합산 점수 (Findability·Trust·Citability)';
COMMENT ON COLUMN smarcomm_scans.analysis IS 'AnalysisResult 원본 JSON (seo-analyzer 출력)';
COMMENT ON COLUMN smarcomm_scans.breakdown IS 'IndexBreakdown JSON (3축 분류된 항목 + 등급)';

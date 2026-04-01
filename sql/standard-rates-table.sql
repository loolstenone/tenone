-- ============================================================================
-- Standard Rates 테이블: 직급별 표준단가 (투입인원단가 관리 페이지용)
-- ============================================================================
-- 실행 대상: Prod Supabase
-- 전제: members 테이블 존재
-- ============================================================================

CREATE TABLE IF NOT EXISTS standard_rates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position    TEXT NOT NULL,               -- 직급 (대표, 이사, 팀장, 매니저, 선임, 주임, 사원, 인턴)
    hourly_rate INT NOT NULL DEFAULT 0,      -- 시간당 단가 (원)
    brand_id    TEXT DEFAULT 'tenone',
    updated_by  UUID REFERENCES members(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (position, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_standard_rates_brand ON standard_rates(brand_id);

-- 기본 표준단가 시드 데이터 (TenOne)
INSERT INTO standard_rates (position, hourly_rate, brand_id) VALUES
    ('대표',   200000, 'tenone'),
    ('이사',   150000, 'tenone'),
    ('팀장',   120000, 'tenone'),
    ('매니저', 100000, 'tenone'),
    ('선임',    80000, 'tenone'),
    ('주임',    65000, 'tenone'),
    ('사원',    50000, 'tenone'),
    ('인턴',    30000, 'tenone')
ON CONFLICT (position, brand_id) DO NOTHING;

-- RLS
ALTER TABLE standard_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sr_select" ON standard_rates;
CREATE POLICY "sr_select" ON standard_rates FOR SELECT USING (auth_is_staff());

DROP POLICY IF EXISTS "sr_upsert" ON standard_rates;
CREATE POLICY "sr_upsert" ON standard_rates FOR INSERT WITH CHECK (auth_is_staff());

DROP POLICY IF EXISTS "sr_update" ON standard_rates;
CREATE POLICY "sr_update" ON standard_rates FOR UPDATE USING (auth_is_staff());


-- ============================================================================
SELECT 'standard_rates table DONE' AS result;
-- ============================================================================

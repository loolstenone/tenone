-- ============================================================================
-- Monthly Forecasts 테이블: 월별 추정 / 실적 확정 / Gap 분석
-- ============================================================================
-- 실행 대상: Prod Supabase (ziotlxkdctlhiwkgmmsh)
-- 전제: members, projects 테이블 존재
-- ============================================================================

CREATE TABLE IF NOT EXISTS monthly_forecasts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year        INT NOT NULL,
    month       INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    item        TEXT NOT NULL,      -- 매출 | 외부비 | 매출총이익 | 내부비 | 영업이익
    plan        BIGINT DEFAULT 0,   -- 경영계획
    forecast_1  BIGINT DEFAULT 0,   -- 1차 추정
    forecast_2  BIGINT DEFAULT 0,   -- 2차 추정
    forecast_3  BIGINT DEFAULT 0,   -- 3차 추정
    actual      BIGINT DEFAULT 0,   -- 실적 (확정)
    round       INT DEFAULT 2,      -- 현재 활성 추정 차수 (1~3)
    status      TEXT DEFAULT 'draft',  -- draft(작성중) | review(검토요청) | confirmed(승인완료)
    actual_confirmed BOOLEAN DEFAULT false, -- 실적 확정 여부
    brand_id    TEXT DEFAULT 'tenone',
    updated_by  UUID REFERENCES members(id),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (year, month, item, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_forecasts_period ON monthly_forecasts(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_forecasts_brand ON monthly_forecasts(brand_id, year);

-- RLS
ALTER TABLE monthly_forecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mf_select" ON monthly_forecasts;
CREATE POLICY "mf_select" ON monthly_forecasts FOR SELECT USING (auth_is_staff());

DROP POLICY IF EXISTS "mf_insert" ON monthly_forecasts;
CREATE POLICY "mf_insert" ON monthly_forecasts FOR INSERT WITH CHECK (auth_is_staff());

DROP POLICY IF EXISTS "mf_update" ON monthly_forecasts;
CREATE POLICY "mf_update" ON monthly_forecasts FOR UPDATE USING (auth_is_staff());


-- ============================================================================
SELECT 'monthly_forecasts table DONE' AS result;
-- ============================================================================

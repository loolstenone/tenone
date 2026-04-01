-- ============================================================================
-- Partner Pool 테이블: 외부 협력사 · 프리랜서 등록 관리
-- ============================================================================
-- 실행 대상: Prod Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS partners (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    type            TEXT    NOT NULL DEFAULT 'freelancer'
                    CHECK (type IN ('company', 'freelancer')),
    name            TEXT    NOT NULL,
    contact_name    TEXT,
    email           TEXT,
    phone           TEXT,
    skills          TEXT[]  NOT NULL DEFAULT '{}',
    speciality      TEXT,
    portfolio_url   TEXT,
    rating          FLOAT   NOT NULL DEFAULT 0,
    total_projects  INT     NOT NULL DEFAULT 0,
    rate_type       TEXT    CHECK (rate_type IN ('hourly', 'project', 'monthly')),
    rate_amount     INT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    notes           TEXT,
    brand_id        TEXT    DEFAULT 'tenone',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 기존 테이블에 누락 컬럼 추가 (인덱스보다 먼저 실행)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS brand_id TEXT DEFAULT 'tenone';

CREATE INDEX IF NOT EXISTS idx_partners_type     ON partners(type);
CREATE INDEX IF NOT EXISTS idx_partners_active   ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_brand    ON partners(brand_id);
CREATE INDEX IF NOT EXISTS idx_partners_skills   ON partners USING gin(skills);

-- RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partners_select" ON partners;
CREATE POLICY "partners_select" ON partners FOR SELECT USING (auth_is_staff());

DROP POLICY IF EXISTS "partners_insert" ON partners;
CREATE POLICY "partners_insert" ON partners FOR INSERT WITH CHECK (auth_is_staff());

DROP POLICY IF EXISTS "partners_update" ON partners;
CREATE POLICY "partners_update" ON partners FOR UPDATE USING (auth_is_staff());

-- 시드 데이터
INSERT INTO partners (type, name, contact_name, email, phone, skills, speciality, portfolio_url, rating, total_projects, rate_type, rate_amount, is_active) VALUES
    ('freelancer', '김디자인', '김디자인', 'kim@design.kr', '010-1234-5678', ARRAY['디자인','일러스트','UI/UX'], '브랜드 아이덴티티 디자인', 'https://behance.net/kimdesign', 4.8, 12, 'project', 3000000, true),
    ('company', '비주얼웍스', '박대표', 'info@visualworks.co.kr', '02-1234-5678', ARRAY['영상','모션그래픽','3D'], 'MV/광고 영상 제작', NULL, 4.5, 8, 'project', 15000000, true),
    ('freelancer', '이개발', NULL, 'lee@dev.com', NULL, ARRAY['개발','AI'], 'Next.js + AI 서비스 개발', NULL, 4.9, 5, 'hourly', 80000, true),
    ('company', '포토스튜디오A', '최실장', 'studio@photo-a.com', NULL, ARRAY['사진'], '제품/인물 사진 촬영', NULL, 4.2, 15, 'project', 2000000, true),
    ('freelancer', '박카피', NULL, 'park@copy.kr', NULL, ARRAY['카피라이팅','마케팅','기획'], '광고 카피 + SNS 콘텐츠', NULL, 4.6, 20, 'monthly', 4000000, true),
    ('company', '프린트원', '강팀장', 'print@printone.kr', '02-9876-5432', ARRAY['인쇄'], '대형 인쇄물, 패키지, 명함', NULL, 4.0, 30, 'project', NULL, true),
    ('freelancer', '정번역', NULL, 'jung@translator.com', NULL, ARRAY['번역'], '영/일/중 마케팅 번역', NULL, 4.7, 10, 'hourly', 50000, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
SELECT 'partners table DONE' AS result;
SELECT type, name, is_active, rating FROM partners ORDER BY rating DESC;
-- ============================================================================

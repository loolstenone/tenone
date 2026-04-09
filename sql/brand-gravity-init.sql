-- Brand Gravity DB 초기화
-- Phase 1: 신청 접수 + 핵심 3테이블

-- 1. 신청 접수 테이블
CREATE TABLE IF NOT EXISTS bg_apply_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name    TEXT NOT NULL,
    contact_name    TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT,
    service_type    TEXT NOT NULL DEFAULT 'scan', -- scan | program | workshop | dashboard
    industry        TEXT,
    product_name    TEXT,
    competitors     TEXT,
    pain_context    TEXT,
    budget          TEXT,
    message         TEXT,
    status          TEXT NOT NULL DEFAULT 'new', -- new | contacted | contracted | closed
    assigned_to     TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_apply_status ON bg_apply_requests(status);
CREATE INDEX IF NOT EXISTS idx_bg_apply_created ON bg_apply_requests(created_at DESC);

-- 2. 클라이언트 테이블
CREATE TABLE IF NOT EXISTS bg_clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apply_id        UUID REFERENCES bg_apply_requests(id),
    name            TEXT NOT NULL,
    industry        TEXT,
    plan            TEXT NOT NULL DEFAULT 'scan', -- scan | program | dashboard | workshop
    contract_start  DATE,
    contract_end    DATE,
    status          TEXT NOT NULL DEFAULT 'active', -- active | paused | ended
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 제품/서비스 테이블
CREATE TABLE IF NOT EXISTS bg_products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES bg_clients(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    category        TEXT,
    description     TEXT,
    competitors      TEXT[], -- 경쟁사 목록
    target_keywords TEXT[], -- 핵심 키워드
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_products_client ON bg_products(client_id);

-- 4. 페인 포인트 소스 테이블 (수집 원문)
CREATE TABLE IF NOT EXISTS bg_pain_sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES bg_products(id) ON DELETE CASCADE,
    platform        TEXT NOT NULL, -- naver_shopping | coupang | amazon | google | community | etc
    url             TEXT,
    raw_text        TEXT NOT NULL,
    rating          NUMERIC(2,1), -- 별점 (있을 경우)
    author          TEXT,
    collected_at    TIMESTAMPTZ DEFAULT NOW(),
    processed       BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_bg_pain_sources_product ON bg_pain_sources(product_id);
CREATE INDEX IF NOT EXISTS idx_bg_pain_sources_processed ON bg_pain_sources(processed);

-- 5. 페인 포인트 분류 결과
CREATE TABLE IF NOT EXISTS bg_pain_points (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id        UUID NOT NULL REFERENCES bg_pain_sources(id) ON DELETE CASCADE,
    product_id       UUID NOT NULL REFERENCES bg_products(id) ON DELETE CASCADE,
    purchase_motive  TEXT,   -- 구매 동기
    positive_points  TEXT[], -- 긍정 포인트
    negative_points  TEXT[], -- 부정 포인트
    situation        TEXT,   -- 소비자 상황
    emotion          TEXT,   -- 감정 (불안, 만족 등)
    purchase_route   TEXT,   -- 구매 경로 추정
    extracted_question TEXT, -- AI에게 물을 법한 질문
    pain_category    TEXT,   -- 클러스터 카테고리
    confidence       NUMERIC(3,2), -- 분류 신뢰도 0~1
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_pain_points_product ON bg_pain_points(product_id);
CREATE INDEX IF NOT EXISTS idx_bg_pain_points_category ON bg_pain_points(pain_category);

-- RLS 활성화
ALTER TABLE bg_apply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bg_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bg_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bg_pain_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bg_pain_points ENABLE ROW LEVEL SECURITY;

-- RLS 정책: service_role만 전체 접근 (초기 단계, 클라이언트 로그인 후 확장)
CREATE POLICY "service_role_all_bg_apply" ON bg_apply_requests FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_bg_clients" ON bg_clients FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_bg_products" ON bg_products FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_bg_pain_sources" ON bg_pain_sources FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_bg_pain_points" ON bg_pain_points FOR ALL TO service_role USING (true);

-- anon: apply_requests INSERT만 허용 (신청 폼)
CREATE POLICY "anon_insert_bg_apply" ON bg_apply_requests FOR INSERT TO anon WITH CHECK (true);

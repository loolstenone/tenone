-- Phase B: Jakka 마켓 입점 승인제
-- 날짜: 2026-04-20

-- 1) jakka_creators에 seller_status 추가
ALTER TABLE jakka_creators
    ADD COLUMN IF NOT EXISTS seller_status TEXT NOT NULL DEFAULT 'none'
        CHECK (seller_status IN ('none','pending','approved','rejected','suspended')),
    ADD COLUMN IF NOT EXISTS seller_approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS seller_commission_rate NUMERIC NOT NULL DEFAULT 0.15; -- 15% 기본 수수료

-- 2) 입점 신청 테이블
CREATE TABLE IF NOT EXISTS jakka_seller_applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id          UUID NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,

    -- 자기소개 & 포트폴리오
    intro               TEXT NOT NULL,                       -- 자기소개 / 작가 스토리
    primary_category    TEXT NOT NULL,                       -- 주력 카테고리 (원화/프린트/굿즈/...)
    portfolio_urls      TEXT[] NOT NULL DEFAULT '{}',        -- 외부 포트폴리오 링크
    sample_work_ids     UUID[] NOT NULL DEFAULT '{}',        -- 기존 jakka_works 샘플 3~5개
    sample_image_urls   TEXT[] NOT NULL DEFAULT '{}',        -- 별도 샘플 이미지 URL

    -- 사업자/개인 구분
    seller_type         TEXT NOT NULL DEFAULT 'individual'
                            CHECK (seller_type IN ('individual','business')),
    business_name       TEXT,                                -- 사업자명 (business만)
    business_number     TEXT,                                -- 사업자번호
    tax_invoice_email   TEXT,                                -- 세금계산서 이메일

    -- 정산 정보
    bank_name           TEXT,
    bank_account_number TEXT,
    bank_account_holder TEXT,

    -- 동의
    agreed_terms        BOOLEAN NOT NULL DEFAULT false,      -- 입점 약관
    agreed_fee          BOOLEAN NOT NULL DEFAULT false,      -- 수수료 정책
    agreed_privacy      BOOLEAN NOT NULL DEFAULT false,      -- 개인정보 수집

    -- 심사 상태
    status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected','withdrawn')),
    reviewer_id         UUID REFERENCES auth.users(id),
    reviewer_note       TEXT,
    reviewed_at         TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_seller_apps_creator ON jakka_seller_applications(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jakka_seller_apps_status  ON jakka_seller_applications(status, created_at DESC);

CREATE OR REPLACE FUNCTION update_jakka_seller_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_seller_apps_updated_at ON jakka_seller_applications;
CREATE TRIGGER trg_jakka_seller_apps_updated_at
    BEFORE UPDATE ON jakka_seller_applications
    FOR EACH ROW EXECUTE FUNCTION update_jakka_seller_apps_updated_at();

-- RLS
ALTER TABLE jakka_seller_applications ENABLE ROW LEVEL SECURITY;

-- 조회: 본인 신청 또는 운영진(service_role 통해 인트라에서 접근)
DROP POLICY IF EXISTS "jakka_seller_apps_select_own" ON jakka_seller_applications;
CREATE POLICY "jakka_seller_apps_select_own"
    ON jakka_seller_applications FOR SELECT
    USING (
        creator_id IN (SELECT id FROM jakka_creators WHERE user_id = auth.uid())
    );

-- 생성: 본인 creator_id만
DROP POLICY IF EXISTS "jakka_seller_apps_insert" ON jakka_seller_applications;
CREATE POLICY "jakka_seller_apps_insert"
    ON jakka_seller_applications FOR INSERT
    WITH CHECK (
        creator_id IN (SELECT id FROM jakka_creators WHERE user_id = auth.uid())
    );

-- 수정: 본인 신청이며 pending일 때만 수정 가능 (철회 포함)
DROP POLICY IF EXISTS "jakka_seller_apps_update_own" ON jakka_seller_applications;
CREATE POLICY "jakka_seller_apps_update_own"
    ON jakka_seller_applications FOR UPDATE
    USING (
        creator_id IN (SELECT id FROM jakka_creators WHERE user_id = auth.uid())
        AND status = 'pending'
    );

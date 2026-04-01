-- ============================================================================
-- ERP Finance 신규 테이블: invoices, payments, card_usage, incentives
-- ============================================================================
-- 실행 대상: Prod Supabase (ziotlxkdctlhiwkgmmsh)
-- 실행 순서: step3-erp-tables.sql 이후 (members, projects 테이블 존재 전제)
-- 모든 CREATE는 IF NOT EXISTS — 멱등 실행 가능
-- ============================================================================

-- ── 청구서 (Invoices) ──
-- 대외 청구 발행 관리: 클라이언트에게 보내는 인보이스
CREATE TABLE IF NOT EXISTS invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no      TEXT UNIQUE,                              -- INV-2026-001 형식
    client_name     TEXT NOT NULL,                           -- 거래처명
    project_name    TEXT,                                    -- 프로젝트명 (참고용)
    project_id      UUID REFERENCES projects(id),            -- 연결 프로젝트 (선택)
    amount          BIGINT NOT NULL DEFAULT 0,               -- 청구 금액 (원)
    tax_amount      BIGINT DEFAULT 0,                        -- 부가세
    issue_date      DATE,                                    -- 발행일
    due_date        DATE,                                    -- 납기일
    paid_at         TIMESTAMPTZ,                             -- 입금일시
    status          TEXT DEFAULT 'draft',                    -- draft | issued | paid | overdue
    notes           TEXT,
    brand_id        TEXT DEFAULT 'tenone',
    created_by      UUID REFERENCES members(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);

-- ── 지급관리 (Payments) ──
-- 외주/협력사 지급 관리: 우리가 내보내는 대금
CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name     TEXT NOT NULL,                           -- 거래처(협력사)명
    description     TEXT NOT NULL,                           -- 지급 내용
    amount          BIGINT NOT NULL DEFAULT 0,               -- 지급 금액 (원)
    due_date        DATE,                                    -- 지급 예정일
    paid_at         TIMESTAMPTZ,                             -- 실지급일시
    type            TEXT DEFAULT 'normal',                   -- normal(정발행) | reverse(역발행)
    status          TEXT DEFAULT 'unpaid',                   -- unpaid | scheduled | paid
    invoice_id      UUID REFERENCES invoices(id),            -- 연결 인보이스 (선택)
    project_id      UUID REFERENCES projects(id),
    notes           TEXT,
    brand_id        TEXT DEFAULT 'tenone',
    created_by      UUID REFERENCES members(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date ASC);

-- ── 법인카드 사용 내역 (Card Usage) ──
-- 법인카드 사용 내역 추적
CREATE TABLE IF NOT EXISTS card_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID REFERENCES members(id),             -- 사용자
    holder_name     TEXT,                                    -- 카드 명의 (비회원 포함)
    card_last4      TEXT,                                    -- 카드 뒷 4자리
    merchant        TEXT NOT NULL,                           -- 가맹점명
    category        TEXT DEFAULT '기타',                    -- 식비 | 교통비 | 출장숙박 | 도서구입 | 소모품 | 기타
    amount          BIGINT NOT NULL DEFAULT 0,               -- 금액 (원)
    used_at         TIMESTAMPTZ DEFAULT now(),               -- 사용일시
    status          TEXT DEFAULT 'approved',                 -- approved | pending | rejected
    memo            TEXT,
    receipt_url     TEXT,
    project_id      UUID REFERENCES projects(id),
    brand_id        TEXT DEFAULT 'tenone',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_usage_member ON card_usage(member_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_usage_used_at ON card_usage(used_at DESC);

-- ── 보상/성과급 (Incentives) ──
-- 구성원 성과급, 인센티브, 특별보상 이력
CREATE TABLE IF NOT EXISTS incentives (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    period          TEXT NOT NULL,                           -- '2025 하반기', '2025 Q3' 등
    grade           TEXT,                                    -- S | A | B | C (성과 등급)
    bonus_rate      NUMERIC(5,2),                            -- 지급률 (%, 예: 150.00)
    amount          BIGINT NOT NULL DEFAULT 0,               -- 지급 금액 (원)
    type            TEXT DEFAULT 'bonus',                    -- bonus(성과급) | incentive(인센티브) | special(특별보상)
    paid_at         TIMESTAMPTZ,                             -- 지급일시
    notes           TEXT,
    brand_id        TEXT DEFAULT 'tenone',
    created_by      UUID REFERENCES members(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incentives_member ON incentives(member_id, period DESC);


-- ============================================================================
-- RLS 정책
-- ============================================================================

-- 청구서 (staff만 접근)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "invoices_update" ON invoices;
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (auth_is_staff());

-- 지급관리 (staff만 접근)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (auth_is_staff());

-- 법인카드 (본인 또는 staff)
ALTER TABLE card_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "card_usage_select" ON card_usage;
CREATE POLICY "card_usage_select" ON card_usage FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "card_usage_insert" ON card_usage;
CREATE POLICY "card_usage_insert" ON card_usage FOR INSERT WITH CHECK (auth_is_staff());

-- 성과급 (본인 또는 staff)
ALTER TABLE incentives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "incentives_select" ON incentives;
CREATE POLICY "incentives_select" ON incentives FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "incentives_insert" ON incentives;
CREATE POLICY "incentives_insert" ON incentives FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "incentives_update" ON incentives;
CREATE POLICY "incentives_update" ON incentives FOR UPDATE USING (auth_is_staff());


-- ============================================================================
SELECT 'ERP Finance tables DONE: invoices, payments, card_usage, incentives' AS result;
-- ============================================================================

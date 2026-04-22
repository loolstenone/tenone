-- Jakka 정산 테이블
-- 월별 작가 정산 단위 (PG 없는 수동 정산 관리)

CREATE TABLE IF NOT EXISTS jakka_settlements (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE RESTRICT,
    month           char(7) NOT NULL,           -- 'YYYY-MM'
    order_ids       uuid[] NOT NULL DEFAULT '{}',
    order_count     int NOT NULL DEFAULT 0,
    gross_amount    bigint NOT NULL DEFAULT 0,  -- 총 주문금액 (원)
    commission_rate numeric(5,2) NOT NULL DEFAULT 15.00, -- 플랫폼 수수료율(%)
    commission_amount bigint NOT NULL DEFAULT 0,
    net_amount      bigint NOT NULL DEFAULT 0,  -- 작가 정산금 = gross - commission
    -- 정산 계좌 (신청서에서 복사)
    bank_name       text,
    bank_account_number text,
    bank_account_holder text,
    -- 상태
    status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','confirmed','paid')),
    confirmed_at    timestamptz,
    paid_at         timestamptz,
    note            text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (creator_id, month)
);

CREATE INDEX IF NOT EXISTS jakka_settlements_month_idx ON jakka_settlements(month);
CREATE INDEX IF NOT EXISTS jakka_settlements_creator_idx ON jakka_settlements(creator_id);
CREATE INDEX IF NOT EXISTS jakka_settlements_status_idx ON jakka_settlements(status);

-- RLS
ALTER TABLE jakka_settlements ENABLE ROW LEVEL SECURITY;

-- 작가 본인 조회만 허용
CREATE POLICY "creator_select" ON jakka_settlements
    FOR SELECT USING (
        creator_id IN (
            SELECT id FROM jakka_creators WHERE user_id = auth.uid()
        )
    );

-- 관리자 전체 접근 (service_role bypass)

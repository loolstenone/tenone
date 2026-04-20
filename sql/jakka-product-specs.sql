-- Phase A-3: 마켓 상품 상세 스펙 (크기·재료·제작연도·에디션)
-- 날짜: 2026-04-20

ALTER TABLE jakka_products
    ADD COLUMN IF NOT EXISTS dimensions      TEXT,            -- 예: "60 × 80 cm", "A3"
    ADD COLUMN IF NOT EXISTS material        TEXT,            -- 예: "캔버스에 유채", "디지털 프린트"
    ADD COLUMN IF NOT EXISTS production_year INT,             -- 예: 2024
    ADD COLUMN IF NOT EXISTS edition_number  INT,             -- 예: 3 (3번째)
    ADD COLUMN IF NOT EXISTS edition_total   INT,             -- 예: 10 (총 10점)
    ADD COLUMN IF NOT EXISTS is_signed       BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN NOT NULL DEFAULT false;

-- 에디션 정합성: number는 total 이하
ALTER TABLE jakka_products DROP CONSTRAINT IF EXISTS jakka_products_edition_check;
ALTER TABLE jakka_products ADD CONSTRAINT jakka_products_edition_check
    CHECK (
        edition_number IS NULL
        OR edition_total IS NULL
        OR edition_number <= edition_total
    );

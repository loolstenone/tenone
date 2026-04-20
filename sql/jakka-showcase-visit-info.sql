-- 쇼케이스 관람 정보 컬럼 추가
-- 날짜: 2026-04-21

ALTER TABLE jakka_showcases
    ADD COLUMN IF NOT EXISTS open_hours       TEXT,          -- 예: "11:00 - 19:00"
    ADD COLUMN IF NOT EXISTS closed_days      TEXT,          -- 예: "월요일, 공휴일"
    ADD COLUMN IF NOT EXISTS admission_fee    TEXT,          -- 예: "무료" 또는 "5,000원"
    ADD COLUMN IF NOT EXISTS reservation_url  TEXT,          -- 예약 링크
    ADD COLUMN IF NOT EXISTS parking_info     TEXT,          -- 주차 안내
    ADD COLUMN IF NOT EXISTS contact_phone    TEXT,          -- 문의 전화
    ADD COLUMN IF NOT EXISTS contact_email    TEXT;          -- 문의 이메일

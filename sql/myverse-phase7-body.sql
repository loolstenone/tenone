-- Myverse Phase 7-A: BODY 영역 데이터 — 운동·식사·수면 구조화 컬럼
-- 적용일: 2026-05-04
--
-- 새 테이블 만들지 않고 기존 myverse_daily_routines를 확장:
--   body_subtype: 'workout' | 'meal' | 'sleep' | null
--   body_data JSONB: subtype별 구조화 필드
--
-- 운동: { type:'running'|'gym'|'yoga'|..., distance_km?, duration_min?, calories_burned?, sets?, reps?, weight_kg?, heart_rate_avg? }
-- 식사: { meal_type:'breakfast'|'lunch'|'dinner'|'snack', items:[{name, calories?, protein?, carbs?, fat?, source?:'openfoodfacts:barcode'}] }
-- 수면: { duration_min, quality:1-5, deep_min?, rem_min?, source?:'healthkit'|'manual' }

ALTER TABLE myverse_daily_routines
    ADD COLUMN IF NOT EXISTS body_subtype TEXT,
    ADD COLUMN IF NOT EXISTS body_data JSONB;

ALTER TABLE myverse_daily_routines DROP CONSTRAINT IF EXISTS routines_body_subtype_check;
ALTER TABLE myverse_daily_routines
    ADD CONSTRAINT routines_body_subtype_check
    CHECK (body_subtype IS NULL OR body_subtype IN ('workout', 'meal', 'sleep'));

CREATE INDEX IF NOT EXISTS idx_routines_body_subtype
    ON myverse_daily_routines(member_id, body_subtype, date DESC)
    WHERE body_subtype IS NOT NULL;

-- 외부 헬스 동기화 토큰·메타 (Apple Health·Google Fit·Samsung Health)
CREATE TABLE IF NOT EXISTS myverse_health_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('apple_health', 'google_fit', 'samsung_health')),
    access_token TEXT,                 -- OAuth 토큰 (provider별)
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    sync_summary JSONB,                -- 마지막 동기화 통계
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (member_id, provider)
);

ALTER TABLE myverse_health_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS health_conn_self ON myverse_health_connections;
CREATE POLICY health_conn_self ON myverse_health_connections
    FOR ALL USING (
        member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );

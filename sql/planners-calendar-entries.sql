-- Planner's Planner AI — 통합 캘린더 엔트리 (이벤트/태스크/기념일/공공)
-- 단일 테이블로 4개 뷰(Daily/Weekly/Monthly/Yearly) 모두 처리

CREATE TABLE IF NOT EXISTS planners_calendar_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL CHECK (kind IN
                ('anniversary','meeting','task','public_holiday','solar_term')),
    title       TEXT NOT NULL,
    description TEXT,
    -- 시간
    start_date  DATE NOT NULL,
    start_time  TIME,                                  -- NULL = 종일
    end_time    TIME,
    -- 반복
    recurrence  TEXT NOT NULL DEFAULT 'none'
                CHECK (recurrence IN ('none','daily','weekly','monthly','yearly')),
    recurrence_until DATE,
    -- 태스크 전용
    status      TEXT CHECK (status IS NULL OR status IN ('todo','done','carried','canceled')),
    -- 메타
    color       TEXT,
    country     TEXT,                                  -- 'KR' | 'US' | ...
    is_system   BOOLEAN NOT NULL DEFAULT false,        -- 시스템 자동 (편집 X)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planners_calendar_member_date
    ON planners_calendar_entries(member_id, start_date);
CREATE INDEX IF NOT EXISTS idx_planners_calendar_kind
    ON planners_calendar_entries(member_id, kind, start_date);
CREATE INDEX IF NOT EXISTS idx_planners_calendar_recurrence
    ON planners_calendar_entries(recurrence) WHERE recurrence <> 'none';

ALTER TABLE planners_calendar_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planners_calendar_select ON planners_calendar_entries;
CREATE POLICY planners_calendar_select ON planners_calendar_entries
    FOR SELECT USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS planners_calendar_insert ON planners_calendar_entries;
CREATE POLICY planners_calendar_insert ON planners_calendar_entries
    FOR INSERT WITH CHECK (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS planners_calendar_update ON planners_calendar_entries;
CREATE POLICY planners_calendar_update ON planners_calendar_entries
    FOR UPDATE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

DROP POLICY IF EXISTS planners_calendar_delete ON planners_calendar_entries;
CREATE POLICY planners_calendar_delete ON planners_calendar_entries
    FOR DELETE USING (
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION planners_calendar_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS planners_calendar_touch_trg ON planners_calendar_entries;
CREATE TRIGGER planners_calendar_touch_trg
BEFORE UPDATE ON planners_calendar_entries
FOR EACH ROW EXECUTE FUNCTION planners_calendar_touch_updated_at();

-- 국가 선호 컬럼 (planners_users)
ALTER TABLE planners_users
    ADD COLUMN IF NOT EXISTS country_pref TEXT[] NOT NULL DEFAULT ARRAY['KR']::TEXT[];

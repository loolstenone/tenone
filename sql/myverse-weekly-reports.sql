-- 주간 라이프 리포트 — 매주 월요일 자동 생성, 지난 7일 정리
-- ISO 주(week_start = 월요일) 기준. 1주에 1개.

CREATE TABLE IF NOT EXISTS myverse_weekly_reports (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    week_start      date NOT NULL,                  -- 월요일 (KST)
    week_end        date NOT NULL,                  -- 일요일 (KST)
    summary         text NOT NULL,                  -- 1-2 문단 요약
    highlights      jsonb,                          -- [{title, body}, ...]
    stats           jsonb,                          -- {moments, routines, places, top_people, top_places, top_domain}
    sources         jsonb,                          -- {moments, routines, places counts}
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (member_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_member_week ON myverse_weekly_reports(member_id, week_start DESC);

ALTER TABLE myverse_weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS weekly_reports_owner ON myverse_weekly_reports;
CREATE POLICY weekly_reports_owner ON myverse_weekly_reports
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

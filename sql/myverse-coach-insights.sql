-- 영혼의 단짝 — 관찰 기반 인사이트 카드
-- 1일 최대 2개, dismiss 가능, 일별 캐시 (재호출 시 비용 0)

CREATE TABLE IF NOT EXISTS myverse_coach_insights (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date            date NOT NULL,                  -- 인사이트 발행 일자 (KST)
    kind            text NOT NULL,                  -- pattern / mood / discovery / routine
    body            text NOT NULL CHECK (length(body) <= 200),
    sources         jsonb,                          -- 어떤 데이터를 근거로 했는지 ({moments_ids: [...], days: [...]})
    created_at      timestamptz NOT NULL DEFAULT now(),
    dismissed_at    timestamptz,
    reacted_at      timestamptz,
    reaction        text                            -- helpful / not_helpful / loved
);

CREATE INDEX IF NOT EXISTS idx_coach_insights_member_date ON myverse_coach_insights(member_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_coach_insights_active ON myverse_coach_insights(member_id, date DESC) WHERE dismissed_at IS NULL;

ALTER TABLE myverse_coach_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS coach_insights_owner ON myverse_coach_insights;
CREATE POLICY coach_insights_owner ON myverse_coach_insights
    FOR ALL
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

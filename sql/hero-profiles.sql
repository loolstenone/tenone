-- hero_profiles: Journey 스테이지 승급 감지용 마지막 스테이지 추적
CREATE TABLE IF NOT EXISTS hero_profiles (
    member_id        UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    last_stage_index INT NOT NULL DEFAULT 0,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE hero_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인 읽기" ON hero_profiles;

CREATE POLICY "본인 읽기" ON hero_profiles
    FOR SELECT USING (auth.uid() = member_id);

-- UC earn rule: 스테이지 승급 시 3,000 UC, 월 6회 상한
INSERT INTO uc_earn_rules (action_key, label, amount, monthly_cap, brand_id)
SELECT 'hero_stage_up', 'Journey 스테이지 승급', 3000, 6, 'hero'
WHERE NOT EXISTS (SELECT 1 FROM uc_earn_rules WHERE action_key = 'hero_stage_up');

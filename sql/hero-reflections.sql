-- hero_reflections: 월간 회고 5문항 OKR
CREATE TABLE IF NOT EXISTS hero_reflections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    month       CHAR(7) NOT NULL,           -- "YYYY-MM"
    q1          TEXT,                        -- 이번 달 가장 잘한 것
    q2          TEXT,                        -- 이번 달 가장 크게 배운 것
    q3          TEXT,                        -- 아쉬웠던 점 / 개선할 것
    q4          TEXT,                        -- 다음 달 핵심 목표
    q5          TEXT,                        -- 이달의 나에게 한마디
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, month)
);

ALTER TABLE hero_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인 읽기" ON hero_reflections;
DROP POLICY IF EXISTS "본인 삽입" ON hero_reflections;
DROP POLICY IF EXISTS "본인 수정" ON hero_reflections;

CREATE POLICY "본인 읽기" ON hero_reflections
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "본인 삽입" ON hero_reflections
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "본인 수정" ON hero_reflections
    FOR UPDATE USING (auth.uid() = member_id);

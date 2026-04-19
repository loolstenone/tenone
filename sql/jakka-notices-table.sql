-- jakka_notices: 자까 홈 피드에 삽입되는 공고/채용/공모전 카드
CREATE TABLE IF NOT EXISTS jakka_notices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL CHECK (type IN ('채용', '공모전', '프로젝트', '공고')),
    company     TEXT NOT NULL,
    role        TEXT NOT NULL,
    tags        TEXT[] NOT NULL DEFAULT '{}',
    deadline    TEXT NOT NULL,
    href        TEXT,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE jakka_notices ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (홈 피드)
CREATE POLICY "jakka_notices_public_read"
    ON jakka_notices FOR SELECT
    USING (is_active = true);

-- 인증된 사용자는 모두 읽기 (인트라)
CREATE POLICY "jakka_notices_auth_read"
    ON jakka_notices FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "jakka_notices_auth_write"
    ON jakka_notices FOR ALL
    TO authenticated
    USING (true) WITH CHECK (true);

-- 기존 하드코딩 데이터 시드
INSERT INTO jakka_notices (type, company, role, tags, deadline, href, sort_order) VALUES
    ('채용',   '카카오',       'UX 디자이너',         ARRAY['경력 3년↑','정규직','서울'],  '~4월 30일', NULL, 1),
    ('공모전', '현대카드',     '브랜드 디자인 공모전', ARRAY['대학(원)생','상금 500만원'],  '~5월 15일', NULL, 2),
    ('채용',   '배달의민족',   '브랜드 디자이너',      ARRAY['신입 가능','정규직'],         '~5월 10일', NULL, 3),
    ('프로젝트','스튜디오 오브','영상 편집 프리랜서',  ARRAY['프리랜서','단기 프로젝트'],   '상시',      NULL, 4)
ON CONFLICT DO NOTHING;

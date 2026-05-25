-- MADLeap 포트폴리오 테이블 (Beta → DB 연동)
-- CLAUDE.md (MADLeap) 이월 작업 해소

CREATE TABLE IF NOT EXISTS madleap_portfolios (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title        text NOT NULL,
    team         text NOT NULL,
    gen          text NOT NULL,                 -- "1기"·"2기"·"3기"·"4기"
    gen_num      smallint NOT NULL,             -- 정렬·필터용 정수
    category     text NOT NULL,                 -- "마케팅 전략"·"브랜딩"·"퍼포먼스"·"캠페인"·"콘텐츠"·"데이터"
    client       text NOT NULL,
    description  text NOT NULL,
    tags         text[] NOT NULL DEFAULT '{}',
    award        text,                          -- NULL = 미수상
    gradient     text NOT NULL,                 -- "from-amber-400 to-orange-500" 등 tailwind 그라데이션
    is_published boolean NOT NULL DEFAULT true,
    sort_order   smallint NOT NULL DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_madleap_portfolios_gen ON madleap_portfolios(gen_num DESC);
CREATE INDEX IF NOT EXISTS idx_madleap_portfolios_category ON madleap_portfolios(category);
CREATE INDEX IF NOT EXISTS idx_madleap_portfolios_published ON madleap_portfolios(is_published);

ALTER TABLE madleap_portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS madleap_portfolios_public_read ON madleap_portfolios;
CREATE POLICY madleap_portfolios_public_read ON madleap_portfolios
    FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS madleap_portfolios_service ON madleap_portfolios;
CREATE POLICY madleap_portfolios_service ON madleap_portfolios
    FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE madleap_portfolios IS 'MADLeap 리퍼들의 실전 프로젝트 포트폴리오. is_published=false면 비공개.';

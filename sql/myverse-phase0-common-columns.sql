-- Myverse Phase 0-A: 5축 메타데이터 + 9 영역 + visibility 공통 컬럼 추가
-- 적용일: 2026-05-04 (세션 107 — Myverse 통합 마이그레이션)
--
-- 7개 capture 테이블에 일괄 추가:
--   myverse_daily_moments / myverse_daily_places / myverse_daily_routines
--   myverse_daily / myverse_calendar_entries / myverse_projects / myverse_contacts
--
-- 추가 컬럼:
--   domain TEXT (9 영역 enum)
--   sub_tags TEXT[] (AI 자동 태그)
--   capture_mode TEXT ('active'|'auto'|'imported')
--   visibility TEXT ('private'|'friends'|'public')
--   share_count INT
--   classification_version INT
--   time_axis JSONB · geo_axis JSONB · people_axis UUID[] · content_axis TEXT · context_axis JSONB

DO $$
DECLARE
    t TEXT;
    targets TEXT[] := ARRAY[
        'myverse_daily_moments',
        'myverse_daily_places',
        'myverse_daily_routines',
        'myverse_calendar_entries',
        'myverse_projects',
        'myverse_contacts'
    ];
BEGIN
    FOREACH t IN ARRAY targets LOOP
        EXECUTE format('
            ALTER TABLE %I
                ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT ''daily'',
                ADD COLUMN IF NOT EXISTS sub_tags TEXT[] DEFAULT ''{}''::text[],
                ADD COLUMN IF NOT EXISTS capture_mode TEXT DEFAULT ''active'',
                ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT ''private'',
                ADD COLUMN IF NOT EXISTS share_count INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS classification_version INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS time_axis JSONB,
                ADD COLUMN IF NOT EXISTS geo_axis JSONB,
                ADD COLUMN IF NOT EXISTS people_axis UUID[] DEFAULT ''{}''::uuid[],
                ADD COLUMN IF NOT EXISTS content_axis TEXT,
                ADD COLUMN IF NOT EXISTS context_axis JSONB
        ', t);
    END LOOP;
END $$;

-- myverse_daily 는 컨테이너 row이므로 도메인은 daily 고정, visibility만 의미
ALTER TABLE myverse_daily
    ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';

-- 9 영역 검증 (각 테이블에 동일 패턴) — 8 도메인 + relation
DO $$
DECLARE
    t TEXT;
    targets TEXT[] := ARRAY[
        'myverse_daily_moments',
        'myverse_daily_places',
        'myverse_daily_routines',
        'myverse_calendar_entries',
        'myverse_projects',
        'myverse_contacts'
    ];
BEGIN
    FOREACH t IN ARRAY targets LOOP
        -- 기존 동일 이름 제약 있으면 제거 후 재생성 (idempotent)
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
            t, t || '_domain_check');
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
            t, t || '_visibility_check');
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
            t, t || '_capture_mode_check');

        EXECUTE format('
            ALTER TABLE %I
                ADD CONSTRAINT %I CHECK (domain IN (
                    ''body'', ''work'', ''study'', ''daily'',
                    ''schedule'', ''travel'', ''move'', ''relation''
                ))
        ', t, t || '_domain_check');

        EXECUTE format('
            ALTER TABLE %I
                ADD CONSTRAINT %I CHECK (visibility IN (
                    ''private'', ''friends'', ''public''
                ))
        ', t, t || '_visibility_check');

        EXECUTE format('
            ALTER TABLE %I
                ADD CONSTRAINT %I CHECK (capture_mode IN (
                    ''active'', ''auto'', ''imported''
                ))
        ', t, t || '_capture_mode_check');
    END LOOP;
END $$;

-- myverse_daily 의 visibility CHECK
ALTER TABLE myverse_daily DROP CONSTRAINT IF EXISTS myverse_daily_visibility_check;
ALTER TABLE myverse_daily
    ADD CONSTRAINT myverse_daily_visibility_check
    CHECK (visibility IN ('private','friends','public'));

-- 인덱스 (분류·공개 페이지 쿼리 가속)
CREATE INDEX IF NOT EXISTS idx_moments_domain ON myverse_daily_moments(member_id, domain, date DESC);
CREATE INDEX IF NOT EXISTS idx_moments_visibility_public ON myverse_daily_moments(member_id, date DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_routines_domain ON myverse_daily_routines(member_id, domain, date DESC);
CREATE INDEX IF NOT EXISTS idx_places_domain ON myverse_daily_places(member_id, domain, date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_visibility_public ON myverse_projects(member_id, updated_at DESC) WHERE visibility = 'public';

-- Myverse Phase 0-C: 분류 큐 + 임포트 로그
-- 적용일: 2026-05-04

-- 분류 작업 큐 — 자동 캡처된 데이터를 백그라운드에서 9 영역 + 5축 메타로 분류
CREATE TABLE IF NOT EXISTS myverse_classification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    target_table TEXT NOT NULL,        -- 'myverse_daily_moments' 등
    target_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
    classifier_version INT NOT NULL DEFAULT 1,
    result JSONB,                       -- {domain, sub_tags[], confidence, axes_extracted}
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_class_jobs_pending
    ON myverse_classification_jobs(created_at)
    WHERE status IN ('queued','running');

CREATE INDEX IF NOT EXISTS idx_class_jobs_member
    ON myverse_classification_jobs(member_id, created_at DESC);

ALTER TABLE myverse_classification_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS class_jobs_self ON myverse_classification_jobs;
CREATE POLICY class_jobs_self ON myverse_classification_jobs
    FOR ALL USING (
        member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );

-- 외부 임포트 로그 — 갤러리·구글타임라인·헬스킷·Meta ZIP 등
CREATE TABLE IF NOT EXISTS myverse_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN (
        'gallery_scan', 'instagram', 'facebook', 'google_timeline',
        'google_photos', 'apple_photos', 'healthkit', 'google_fit',
        'samsung_health', 'kakaotalk', 'notion', 'foursquare', 'other'
    )),
    items_imported INT DEFAULT 0,
    items_skipped INT DEFAULT 0,
    items_failed INT DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    summary JSONB                       -- 영역별 분류 분포·에러 샘플
);

CREATE INDEX IF NOT EXISTS idx_imports_member ON myverse_imports(member_id, started_at DESC);

ALTER TABLE myverse_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS imports_self ON myverse_imports;
CREATE POLICY imports_self ON myverse_imports
    FOR ALL USING (
        member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );

-- 90일 후 done 상태 자동 정리 함수 (필요 시 cron)
CREATE OR REPLACE FUNCTION myverse_cleanup_classification_jobs()
RETURNS INT
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted INT;
BEGIN
    DELETE FROM myverse_classification_jobs
    WHERE status = 'done'
      AND completed_at < now() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted = ROW_COUNT;
    RETURN deleted;
END $$;

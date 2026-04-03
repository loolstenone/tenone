-- ============================================================
-- UMS TASK 5 — CONTENT 파이프라인 복구
-- 2026-04-03
-- content_pipeline: body, source_ids, site_id, author_id,
--                   tags, thumbnail_url, published_at,
--                   updated_at, tenant_id 추가
-- ============================================================

-- 1. content_pipeline 컬럼 추가
ALTER TABLE content_pipeline
    ADD COLUMN IF NOT EXISTS body          TEXT,
    ADD COLUMN IF NOT EXISTS source_ids    UUID[]    DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS site_id       UUID      REFERENCES ums_sites(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS author_id     UUID      REFERENCES members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS tags          TEXT[]    DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS published_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS tenant_id     TEXT      DEFAULT 'tenone';

-- 2. brand_id → site_id 마이그레이션
--    brand_id가 slug와 일치하는 ums_sites 행에 연결
UPDATE content_pipeline cp
SET site_id = us.id
FROM ums_sites us
WHERE us.slug = cp.brand_id
  AND cp.site_id IS NULL;

-- 3. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION content_pipeline_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_content_pipeline_updated_at ON content_pipeline;
CREATE TRIGGER trg_content_pipeline_updated_at
    BEFORE UPDATE ON content_pipeline
    FOR EACH ROW EXECUTE FUNCTION content_pipeline_set_updated_at();

-- 4. 인덱스
CREATE INDEX IF NOT EXISTS idx_content_pipeline_site_id    ON content_pipeline (site_id);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_author_id  ON content_pipeline (author_id);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_stage      ON content_pipeline (stage);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_brand_id   ON content_pipeline (brand_id);

-- 5. 검증
SELECT
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'content_pipeline'
       AND column_name IN ('body','source_ids','site_id','author_id','tags','thumbnail_url','published_at','updated_at','tenant_id')
    ) AS cols_added,
    (SELECT count(*) FROM content_pipeline) AS total_rows,
    (SELECT count(*) FROM content_pipeline WHERE site_id IS NOT NULL) AS rows_with_site_id;

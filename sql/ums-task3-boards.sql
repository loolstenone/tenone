-- ============================================================
-- UMS TASK 3 — BOARD 마이그레이션
-- 2026-04-03
-- bums_boards/posts/comments → ums_* 리네임
-- board_configs(29행) + posts(46행) → ums_* 통합
-- ============================================================

-- 1. 테이블 리네임 (FK는 PostgreSQL OID 기반이라 자동 추적됨)
ALTER TABLE bums_boards   RENAME TO ums_boards;
ALTER TABLE bums_posts    RENAME TO ums_posts;
ALTER TABLE bums_comments RENAME TO ums_comments;

-- 2. site_id FK: bums_sites → ums_sites 로 교체
--    ums_boards
ALTER TABLE ums_boards
    DROP CONSTRAINT IF EXISTS bums_boards_site_id_fkey;
ALTER TABLE ums_boards
    ADD CONSTRAINT ums_boards_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES ums_sites(id) ON DELETE CASCADE;

--    ums_posts
ALTER TABLE ums_posts
    DROP CONSTRAINT IF EXISTS bums_posts_site_id_fkey;
ALTER TABLE ums_posts
    ADD CONSTRAINT ums_posts_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES ums_sites(id) ON DELETE CASCADE;

--    bums_widgets (0행이므로 안전)
ALTER TABLE bums_widgets
    DROP CONSTRAINT IF EXISTS bums_widgets_site_id_fkey;
ALTER TABLE bums_widgets
    ADD CONSTRAINT bums_widgets_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES ums_sites(id) ON DELETE CASCADE;

-- 3. ums_boards 유니크 제약 추가
ALTER TABLE ums_boards
    ADD CONSTRAINT ums_boards_site_slug_unique UNIQUE (site_id, slug);

-- 4. board_configs(29행) → ums_boards INSERT
--    site TEXT → ums_sites.id 매핑, 기존 bums_boards 행과 충돌 방지
INSERT INTO ums_boards (
    id, site_id, name, slug, description, categories, sort_order,
    tenant_id, created_at, updated_at
)
SELECT
    bc.id,
    us.id,
    bc.name,
    bc.slug,
    bc.description,
    bc.categories,
    bc.sort_order,
    COALESCE(bc.tenant_id, 'tenone'),
    bc.created_at,
    bc.updated_at
FROM board_configs bc
JOIN ums_sites us ON us.slug = bc.site
ON CONFLICT (site_id, slug) DO NOTHING;

-- 5. posts(46행) → ums_posts INSERT
--    site TEXT → ums_sites, board TEXT → ums_boards 매핑
INSERT INTO ums_posts (
    id, board_id, site_id, title, body,
    status, author_id, author_name, image,
    tags, view_count, comment_count,
    is_pinned, is_secret,
    published_at, created_at, updated_at, tenant_id
)
SELECT
    p.id,
    ub.id,                                          -- board_id
    us.id,                                          -- site_id
    p.title,
    p.content,                                      -- body
    CASE
        WHEN p.status = 'published' THEN 'published'::bums_post_status
        WHEN p.status = 'draft'     THEN 'draft'::bums_post_status
        WHEN p.status = 'archived'  THEN 'archived'::bums_post_status
        ELSE 'draft'::bums_post_status
    END,
    p.author_id,
    p.guest_nickname,                               -- author_name
    p.represent_image,                              -- image
    CASE
        WHEN p.tags IS NOT NULL AND jsonb_typeof(p.tags) = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(p.tags))
        ELSE '{}'::TEXT[]
    END,
    COALESCE(p.view_count, 0),
    COALESCE(p.comment_count, 0),
    COALESCE(p.is_pinned, false),
    COALESCE(p.is_secret, false),
    COALESCE(p.created_at, now()),                  -- published_at
    p.created_at,
    p.updated_at,
    COALESCE(p.tenant_id, 'tenone')
FROM posts p
JOIN ums_sites  us ON us.slug = p.site
JOIN ums_boards ub ON ub.site_id = us.id AND ub.slug = p.board
WHERE p.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. 레거시 뷰: bums_boards (FKs from bums_widgets still work via view → ums_boards)
CREATE OR REPLACE VIEW bums_boards AS
    SELECT
        id, site_id, name, slug, board_type, skin_type, visibility,
        description, list_permission, read_permission, write_permission,
        comment_permission, allow_comments, allow_attachments, allow_secret,
        categories, options, design, sort_order, created_at, updated_at, tenant_id
    FROM ums_boards;

-- 7. 레거시 뷰: board_configs (TEXT 기반 인터페이스)
CREATE OR REPLACE VIEW board_configs AS
    SELECT
        ub.id,
        us.slug     AS site,
        ub.slug,
        ub.name,
        ub.description,
        ub.categories,
        NULL::JSONB AS settings,
        ub.sort_order,
        ub.created_at,
        ub.updated_at,
        ub.tenant_id
    FROM ums_boards ub
    JOIN ums_sites us ON us.id = ub.site_id;

-- 8. 레거시 뷰: posts (TEXT 기반 인터페이스)
CREATE OR REPLACE VIEW posts AS
    SELECT
        up.id,
        us.slug         AS site,
        ub.slug         AS board,
        up.title,
        up.body         AS content,
        up.summary      AS excerpt,
        up.category_id  AS category,
        to_jsonb(up.tags) AS tags,
        up.image        AS represent_image,
        up.status::TEXT AS status,
        NULL::TEXT      AS author_type,
        up.author_id,
        up.author_name  AS guest_nickname,
        NULL::TEXT      AS guest_password,
        NULL::TEXT      AS guest_email,
        up.view_count,
        NULL::INT       AS like_count,
        up.comment_count,
        NULL::INT       AS bookmark_count,
        up.is_pinned,
        up.created_at,
        up.updated_at,
        NULL::TIMESTAMPTZ AS deleted_at,
        up.is_secret,
        up.tenant_id
    FROM ums_posts up
    JOIN ums_boards  ub ON ub.id = up.board_id
    JOIN ums_sites   us ON us.id = up.site_id;

-- 9. 인덱스
CREATE INDEX IF NOT EXISTS idx_ums_boards_site_id  ON ums_boards (site_id);
CREATE INDEX IF NOT EXISTS idx_ums_posts_board_id  ON ums_posts  (board_id);
CREATE INDEX IF NOT EXISTS idx_ums_posts_site_id   ON ums_posts  (site_id);
CREATE INDEX IF NOT EXISTS idx_ums_posts_status    ON ums_posts  (status);
CREATE INDEX IF NOT EXISTS idx_ums_posts_author_id ON ums_posts  (author_id);

-- 10. 검증
SELECT
    (SELECT count(*) FROM ums_boards)  AS ums_boards_total,
    (SELECT count(*) FROM ums_posts)   AS ums_posts_total,
    (SELECT count(*) FROM board_configs) AS board_configs_view,
    (SELECT count(*) FROM posts)         AS posts_view;

-- ============================================================
-- UMS TASK 1 — ums_sites 생성 및 데이터 통합
-- 2026-04-03
-- site_configs(24행) + bums_sites(6행, UUID 보존) → ums_sites
-- ============================================================

-- 1. ums_sites 테이블 생성
CREATE TABLE IF NOT EXISTS ums_sites (
    -- 식별
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    domain      TEXT,
    brand_id    TEXT,
    site_type   bums_site_type NOT NULL DEFAULT 'brand',
    status      bums_site_status NOT NULL DEFAULT 'active',

    -- SEO / 브랜딩
    meta_title        TEXT,
    meta_description  TEXT,
    meta_keywords     TEXT[],
    og_image_url      TEXT,
    logo_url          TEXT,
    favicon_url       TEXT,
    colors            JSONB,
    tagline           TEXT,
    universe_label    TEXT,
    show_universe_badge BOOLEAN DEFAULT false,

    -- 경로 설정
    home_path    TEXT,
    signup_path  TEXT,

    -- 기능 설정
    auth_methods JSONB,
    features     JSONB,
    nav_items    JSONB,
    footer_links JSONB,
    contact      JSONB,

    -- 타임스탬프
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. site_configs 24행 → ums_sites
--    bums_sites에 같은 slug가 있으면 해당 UUID 보존, 없으면 신규 UUID
INSERT INTO ums_sites (
    id, slug, name, domain, brand_id, site_type, status,
    meta_title, meta_description, meta_keywords, og_image_url,
    logo_url, favicon_url, colors, tagline,
    universe_label, show_universe_badge,
    home_path, signup_path,
    auth_methods, features, nav_items, footer_links, contact,
    created_at, updated_at
)
SELECT
    COALESCE(bs.id, gen_random_uuid()),
    sc.site_id,
    sc.name,
    sc.domain,
    bs.brand_id,
    COALESCE(bs.site_type, 'brand'::bums_site_type),
    COALESCE(bs.status, 'active'::bums_site_status),
    sc.meta_title,
    sc.meta_description,
    sc.meta_keywords,
    COALESCE(bs.og_image_url, sc.meta_og_image),
    COALESCE(bs.logo_url, sc.logo_image_url),
    COALESCE(bs.favicon_url, sc.favicon_url),
    COALESCE(bs.colors, sc.colors),
    sc.tagline,
    sc.universe_label,
    COALESCE(sc.show_universe_badge, false),
    sc.home_path,
    sc.signup_path,
    sc.auth_methods,
    sc.features,
    COALESCE(bs.nav_items, sc.nav),
    COALESCE(bs.footer_links, sc.footer_links),
    sc.contact,
    COALESCE(sc.created_at, now()),
    COALESCE(sc.updated_at, now())
FROM site_configs sc
LEFT JOIN bums_sites bs ON bs.slug = sc.site_id
ON CONFLICT (slug) DO NOTHING;

-- 3. Ten:One site_type을 internal로 명시
UPDATE ums_sites SET site_type = 'internal' WHERE slug = 'tenone';

-- 4. 인덱스
CREATE INDEX IF NOT EXISTS idx_ums_sites_slug    ON ums_sites (slug);
CREATE INDEX IF NOT EXISTS idx_ums_sites_domain  ON ums_sites (domain);
CREATE INDEX IF NOT EXISTS idx_ums_sites_status  ON ums_sites (status);

-- 5. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION ums_sites_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_ums_sites_updated_at ON ums_sites;
CREATE TRIGGER trg_ums_sites_updated_at
    BEFORE UPDATE ON ums_sites
    FOR EACH ROW EXECUTE FUNCTION ums_sites_set_updated_at();

-- 6. RLS 활성화
ALTER TABLE ums_sites ENABLE ROW LEVEL SECURITY;

-- super_admin 전체 접근
DROP POLICY IF EXISTS ums_sites_super_admin ON ums_sites;
CREATE POLICY ums_sites_super_admin ON ums_sites
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE auth_id = auth.uid()
            AND account_type IN ('super_admin', 'staff')
        )
    );

-- 공개 읽기 (사이트 설정은 퍼블릭 접근 허용)
DROP POLICY IF EXISTS ums_sites_public_read ON ums_sites;
CREATE POLICY ums_sites_public_read ON ums_sites
    FOR SELECT TO anon, authenticated
    USING (status = 'active');

-- 7. site_configs 하위 호환 뷰
--    (site_configs는 FK 참조 없음 — 바로 rename + view 생성)
ALTER TABLE site_configs RENAME TO site_configs_legacy;

CREATE OR REPLACE VIEW site_configs AS
SELECT
    slug          AS site_id,
    name,
    domain,
    NULL::TEXT    AS logo_text,
    logo_url      AS logo_image_url,
    NULL::TEXT    AS logo_style,
    favicon_url,
    NULL::TEXT    AS apple_touch_icon,
    colors,
    meta_title,
    meta_description,
    og_image_url  AS meta_og_image,
    meta_keywords,
    home_path,
    signup_path,
    tagline,
    universe_label,
    show_universe_badge,
    auth_methods,
    nav_items     AS nav,
    footer_links,
    contact,
    features,
    created_at,
    updated_at
FROM ums_sites;

-- 8. 검증
SELECT
    (SELECT count(*) FROM ums_sites) AS ums_sites_total,
    (SELECT count(*) FROM site_configs) AS view_total,
    (SELECT count(*) FROM ums_sites WHERE id IN (SELECT id FROM bums_sites)) AS uuid_preserved;

-- Myverse 브랜드 자산 테이블
-- 퍼스널 영역의 브랜드 정체성 SSOT — 명함(DigitalCard), 포트폴리오, @handle 페이지에서 공유 참조
-- 5축 메타데이터 + visibility 등 공통 컬럼 패턴 따름

CREATE TABLE IF NOT EXISTS myverse_brand_assets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- 자산 분류
    type             TEXT NOT NULL CHECK (type IN ('logo', 'palette', 'typography', 'image', 'template', 'link', 'tagline', 'mission')),
    title            TEXT NOT NULL,
    description      TEXT,

    -- 자산 데이터 (type에 따라 사용 필드 다름)
    file_url         TEXT,        -- logo/image/template (storage url)
    thumbnail_url    TEXT,
    data             JSONB DEFAULT '{}'::JSONB,
    -- palette  : { colors: [{hex, name, role}] }
    -- typography: { headingFont, bodyFont, sizes: {} }
    -- link     : { url, label }
    -- tagline  : { text, language }
    -- mission  : { text }

    -- 분류·정렬
    category         TEXT,        -- 자유 텍스트 (예: "메인 로고", "서브 컬러" 등)
    order_index      INTEGER DEFAULT 0,
    is_primary       BOOLEAN DEFAULT FALSE,  -- 같은 type 중 대표 (1개)

    -- 공개 범위 (capture 패턴 따라)
    visibility       TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),

    -- 명함·포트폴리오에서 노출 여부
    show_on_card     BOOLEAN DEFAULT FALSE,
    show_on_portfolio BOOLEAN DEFAULT FALSE,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_member  ON myverse_brand_assets(member_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type    ON myverse_brand_assets(member_id, type);
CREATE INDEX IF NOT EXISTS idx_brand_assets_card    ON myverse_brand_assets(member_id, show_on_card) WHERE show_on_card = TRUE;

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION myverse_brand_assets_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_brand_assets_touch ON myverse_brand_assets;
CREATE TRIGGER trg_brand_assets_touch
    BEFORE UPDATE ON myverse_brand_assets
    FOR EACH ROW EXECUTE FUNCTION myverse_brand_assets_touch();

-- RLS
ALTER TABLE myverse_brand_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brand_assets_owner ON myverse_brand_assets;
CREATE POLICY brand_assets_owner ON myverse_brand_assets
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS brand_assets_public_read ON myverse_brand_assets;
CREATE POLICY brand_assets_public_read ON myverse_brand_assets
    FOR SELECT
    USING (visibility = 'public');

COMMENT ON TABLE myverse_brand_assets IS
    '사용자 브랜드 자산 SSOT — 로고/컬러팔레트/타이포그래피/태그라인/미션/이미지/링크. 명함·포트폴리오·@handle 페이지에서 공유 참조.';

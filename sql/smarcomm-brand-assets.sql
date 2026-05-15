-- SmarComm Brand Assets — V2.0 § 3-D 자산화 SSOT
--
-- 목적:
--   1) Entity Branding 영속화 — Organization·Service·Person·Product·FAQPage 5종
--   2) 캠페인 종료 시 산출물을 영구 자산으로 등록 (smarcomm 워크플로우 V2.0 ⑦)
--   3) 외부 매체 배포 추적 (위키피디아·뉴스·학술)
--   4) AI 인용 추적 (어디서·언제·정확도)
--
-- 정책:
--   - 워크스페이스(=tenant_id) 단위 격리
--   - super_admin은 전체 접근
--   - public Entity는 누구나 JSON-LD 조회 가능 (Schema 노출용)

-- ──────────────────────────────────────────────────────────────
-- 1. smarcomm_brand_assets — Entity 자산 본체
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_brand_assets (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             TEXT NOT NULL,                            -- workspace 격리 (예: 'tenone', client-XX)
    member_id             UUID REFERENCES members(id) ON DELETE SET NULL,

    -- Entity 종류 (Schema.org 표준)
    entity_type           TEXT NOT NULL CHECK (entity_type IN (
                              'Organization', 'Service', 'Person', 'Product',
                              'FAQPage', 'HowTo', 'WebSite', 'BreadcrumbList',
                              'SoftwareApplication', 'Article'
                          )),
    -- 자산 이름 (식별용, 사람이 읽기 쉬운)
    name                  TEXT NOT NULL,
    -- 슬러그 (URL 친화 — 외부 노출용)
    slug                  TEXT NOT NULL,
    -- 한 줄 설명
    description           TEXT,

    -- JSON-LD 본문 (Schema.org 표준 형식)
    schema_jsonld         JSONB NOT NULL,

    -- 영속화 메타
    valid_from            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until           TIMESTAMPTZ,                              -- NULL = 영구 (캠페인 종료해도 유지)

    -- 원천 컨텍스트 (어디서 만들어졌는지)
    source_campaign_id    UUID,                                     -- wio_campaigns.id 참조 (캠페인 종료 자동 트리거)
    source_scan_id        UUID REFERENCES smarcomm_scans(id) ON DELETE SET NULL,
    source_creative_id    UUID,                                     -- wio_creatives.id (소재 산출)

    -- 디지털 흔적 점수 (0~100) — 외부 배포·인용 누적 결과
    persistence_score     INTEGER NOT NULL DEFAULT 0 CHECK (persistence_score BETWEEN 0 AND 100),

    -- 공개 여부 (true면 외부 JSON-LD 조회 가능, robots.txt에서 노출)
    is_public             BOOLEAN NOT NULL DEFAULT FALSE,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_assets_tenant ON smarcomm_brand_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_assets_entity ON smarcomm_brand_assets(tenant_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_assets_active ON smarcomm_brand_assets(tenant_id) WHERE valid_until IS NULL;
CREATE INDEX IF NOT EXISTS idx_smarcomm_brand_assets_public ON smarcomm_brand_assets(is_public) WHERE is_public = TRUE;

-- ──────────────────────────────────────────────────────────────
-- 2. smarcomm_asset_distributions — 외부 매체 배포 이력
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_asset_distributions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id              UUID NOT NULL REFERENCES smarcomm_brand_assets(id) ON DELETE CASCADE,
    tenant_id             TEXT NOT NULL,

    -- 배포 채널
    channel               TEXT NOT NULL CHECK (channel IN (
                              'wikipedia', 'news_press', 'academic_paper',
                              'industry_directory', 'social_proof',
                              'company_listing', 'product_db', 'other'
                          )),
    -- 채널별 매체명 (자유)
    medium_name           TEXT NOT NULL,                            -- 예: "Naver News", "MIT Tech Review"
    -- 매체에 등재된 URL
    external_url          TEXT,

    -- 배포 상태
    status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                              'pending', 'submitted', 'live', 'rejected', 'expired'
                          )),
    submitted_at          TIMESTAMPTZ,
    confirmed_at          TIMESTAMPTZ,

    -- 도메인 권위 (DR) — 외부 도구 측정값 (Ahrefs/Moz 등 — Phase 4 연동)
    domain_authority      INTEGER CHECK (domain_authority BETWEEN 0 AND 100),

    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_asset_dist_asset ON smarcomm_asset_distributions(asset_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_asset_dist_tenant ON smarcomm_asset_distributions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_asset_dist_status ON smarcomm_asset_distributions(tenant_id, status);

-- ──────────────────────────────────────────────────────────────
-- 3. smarcomm_asset_citations — AI가 Entity를 인용한 이력
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_asset_citations (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id              UUID NOT NULL REFERENCES smarcomm_brand_assets(id) ON DELETE CASCADE,
    tenant_id             TEXT NOT NULL,

    -- AI 플랫폼
    platform              TEXT NOT NULL CHECK (platform IN (
                              'claude', 'chatgpt', 'perplexity', 'naver-cue', 'google-aio'
                          )),
    -- 인용된 질의
    query                 TEXT NOT NULL,
    -- 인용 발생한 응답 캡처 (감사용)
    response_excerpt      TEXT,
    -- AI Probe에서 발견된 경우 연결
    probe_scan_id         UUID REFERENCES smarcomm_scans(id) ON DELETE SET NULL,

    -- 정확도 (Entity 정의 대비 — Phase 2.5 verdict 재사용)
    accuracy              TEXT NOT NULL DEFAULT 'partial' CHECK (accuracy IN (
                              'exact', 'partial', 'wrong'
                          )),
    -- 시점
    measured_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_asset_cit_asset ON smarcomm_asset_citations(asset_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_asset_cit_tenant ON smarcomm_asset_citations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_asset_cit_platform ON smarcomm_asset_citations(tenant_id, platform, measured_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 4. updated_at 트리거
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION smarcomm_brand_assets_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_smarcomm_brand_assets_updated ON smarcomm_brand_assets;
CREATE TRIGGER trg_smarcomm_brand_assets_updated
    BEFORE UPDATE ON smarcomm_brand_assets
    FOR EACH ROW EXECUTE FUNCTION smarcomm_brand_assets_touch_updated_at();

DROP TRIGGER IF EXISTS trg_smarcomm_asset_dist_updated ON smarcomm_asset_distributions;
CREATE TRIGGER trg_smarcomm_asset_dist_updated
    BEFORE UPDATE ON smarcomm_asset_distributions
    FOR EACH ROW EXECUTE FUNCTION smarcomm_brand_assets_touch_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 5. RLS 정책
-- ──────────────────────────────────────────────────────────────
ALTER TABLE smarcomm_brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_asset_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_asset_citations ENABLE ROW LEVEL SECURITY;

-- 공개 Entity는 누구나 SELECT 가능 (JSON-LD 노출용)
DROP POLICY IF EXISTS "smarcomm_brand_assets_public_read" ON smarcomm_brand_assets;
CREATE POLICY "smarcomm_brand_assets_public_read" ON smarcomm_brand_assets
    FOR SELECT
    USING (is_public = TRUE);

-- 워크스페이스 멤버는 자기 tenant 자산 전체 SELECT
DROP POLICY IF EXISTS "smarcomm_brand_assets_tenant_read" ON smarcomm_brand_assets;
CREATE POLICY "smarcomm_brand_assets_tenant_read" ON smarcomm_brand_assets
    FOR SELECT
    USING (
        member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM member_roles mr
            JOIN members m ON m.id = mr.member_id
            WHERE m.auth_id = auth.uid()
              AND mr.role = 'super_admin'
              AND mr.is_active = TRUE
        )
    );

-- 분배·인용 테이블도 tenant 격리
DROP POLICY IF EXISTS "smarcomm_asset_dist_tenant_read" ON smarcomm_asset_distributions;
CREATE POLICY "smarcomm_asset_dist_tenant_read" ON smarcomm_asset_distributions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM smarcomm_brand_assets a
            WHERE a.id = asset_id
              AND (a.is_public = TRUE
                   OR a.member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
        )
        OR EXISTS (
            SELECT 1 FROM member_roles mr
            JOIN members m ON m.id = mr.member_id
            WHERE m.auth_id = auth.uid()
              AND mr.role = 'super_admin'
              AND mr.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "smarcomm_asset_cit_tenant_read" ON smarcomm_asset_citations;
CREATE POLICY "smarcomm_asset_cit_tenant_read" ON smarcomm_asset_citations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM smarcomm_brand_assets a
            WHERE a.id = asset_id
              AND (a.is_public = TRUE
                   OR a.member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
        )
        OR EXISTS (
            SELECT 1 FROM member_roles mr
            JOIN members m ON m.id = mr.member_id
            WHERE m.auth_id = auth.uid()
              AND mr.role = 'super_admin'
              AND mr.is_active = TRUE
        )
    );

-- INSERT/UPDATE/DELETE는 service_role 경유 (API)
-- service_role은 RLS 우회

-- ──────────────────────────────────────────────────────────────
-- 6. 코멘트
-- ──────────────────────────────────────────────────────────────
COMMENT ON TABLE smarcomm_brand_assets IS 'V2.0 § 3-D 자산화 SSOT — Entity Branding 영속화';
COMMENT ON TABLE smarcomm_asset_distributions IS 'V2.0 § 3-D 외부 매체 배포 이력 (위키·뉴스·학술)';
COMMENT ON TABLE smarcomm_asset_citations IS 'V2.0 § 3-D AI 인용 추적 (재진단 시 갱신)';
COMMENT ON COLUMN smarcomm_brand_assets.persistence_score IS '디지털 흔적 점수 — 외부 배포·인용 누적 평가';
COMMENT ON COLUMN smarcomm_brand_assets.is_public IS 'true면 JSON-LD 외부 조회 가능 (Schema 노출용)';

-- SmarComm 소재 아카이브 — AI 소재 제작 결과 영속 저장
-- /dashboard/creative에서 생성된 카피·배너·영상 prompt를 보관

CREATE TABLE IF NOT EXISTS smarcomm_creatives (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             TEXT NOT NULL DEFAULT 'tenone-demo',
    member_id             UUID REFERENCES members(id) ON DELETE SET NULL,

    -- 분류
    type                  TEXT NOT NULL CHECK (type IN ('text','banner','video')),
    channel               TEXT,                                -- 네이버 SA, 메타, 카카오, 구글 등 (NULL 허용)
    status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),

    -- 콘텐츠
    title                 TEXT NOT NULL,
    body                  TEXT,
    cta                   TEXT,
    hashtags              TEXT[],                              -- text only
    image_prompt          TEXT,                                -- banner only
    duration              TEXT,                                -- video only

    -- 출처
    source_prompt         TEXT,                                -- 사용자가 입력한 프롬프트
    source_context        TEXT,                                -- 캠페인 기획서 컨텍스트
    generated_by          TEXT NOT NULL DEFAULT 'ai' CHECK (generated_by IN ('ai','manual','rule')),

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_creatives_tenant ON smarcomm_creatives(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_smarcomm_creatives_member ON smarcomm_creatives(member_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_creatives_type_status ON smarcomm_creatives(tenant_id, type, status);

ALTER TABLE smarcomm_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant isolation" ON smarcomm_creatives
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "service role bypass" ON smarcomm_creatives
    FOR ALL TO service_role USING (true);

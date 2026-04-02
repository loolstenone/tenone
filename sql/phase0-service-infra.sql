-- ============================================================
-- Phase 0-D: WIO 서비스 인프라 테이블
-- 날짜: 2026-04-03
-- 목적: 규격/맞춤 서비스 운영을 위한 기반 테이블
-- ============================================================

-- 1. wio_tenant_configs — 맞춤 서비스 설정 저장
-- tenant_id는 TEXT (wio_tenants.slug 또는 'tenone' 매칭). FK 없음 (타입 혼재 해소 전)
CREATE TABLE IF NOT EXISTS wio_tenant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, config_key)
);

COMMENT ON TABLE wio_tenant_configs IS '맞춤 서비스 테넌트별 설정. 규격 서비스는 feature_flags 참조.';

-- 2. wio_feature_flags — 규격 서비스 등급별 기능 제한
CREATE TABLE IF NOT EXISTS wio_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES wio_subscription_plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  limit_value INTEGER,  -- NULL = 무제한
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, feature_key)
);

COMMENT ON TABLE wio_feature_flags IS '규격 서비스 플랜별 기능 제한. plan_id=NULL이면 전체 기본값.';

-- 3. wio_subscription_plans에 service_type 추가
ALTER TABLE wio_subscription_plans ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'standard';
-- 'standard' = 규격 서비스, 'custom' = 맞춤 서비스

-- 4. 시드: 기본 feature flags (Free 플랜 기준)
-- 실제 plan_id는 wio_subscription_plans에서 조회 후 삽입해야 함
-- 여기서는 글로벌 기본값만 설정 (plan_id = NULL)
INSERT INTO wio_feature_flags (plan_id, feature_key, enabled, limit_value, description) VALUES
  (NULL, 'max_members', true, 5, '최대 멤버 수 (Free=5, Starter=20, Pro=100, Business=무제한)'),
  (NULL, 'max_projects', true, 3, '최대 프로젝트 수'),
  (NULL, 'max_storage_mb', true, 500, '최대 저장공간 (MB)'),
  (NULL, 'ai_agent', false, NULL, 'AI 에이전트 사용 가능 여부'),
  (NULL, 'custom_branding', false, NULL, '커스텀 브랜딩 가능 여부'),
  (NULL, 'api_access', false, NULL, 'API 접근 가능 여부'),
  (NULL, 'advanced_analytics', false, NULL, '고급 분석 대시보드'),
  (NULL, 'sso_integration', false, NULL, 'SSO 연동 가능 여부')
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- 5. RLS
ALTER TABLE wio_tenant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_configs_read" ON wio_tenant_configs FOR SELECT USING (true);
CREATE POLICY "tenant_configs_write" ON wio_tenant_configs FOR ALL USING (
  tenant_id IN (
    SELECT t.slug FROM wio_tenants t
    WHERE t.owner_id = auth.uid()
  )
  OR tenant_id = 'tenone'
);

CREATE POLICY "feature_flags_read" ON wio_feature_flags FOR SELECT USING (true);

-- 6. 인덱스
CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant ON wio_tenant_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_plan ON wio_feature_flags(plan_id);

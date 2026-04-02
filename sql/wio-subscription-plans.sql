-- WIO 구독 플랜 & 구독 기록 테이블
-- 원칙: 구독 테이블은 wio_subscription_plans 하나만 쓴다 (모순 방지 규칙 #1)

-- 1. wio_subscription_plans: 서비스별 플랜 정의
CREATE TABLE IF NOT EXISTS wio_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,         -- 'wio', 'smarcomm', 'mindle', 'hero', 'badak', 'evolution'
  plan_key TEXT NOT NULL,        -- 'free', 'starter', 'pro', 'business', 'enterprise'
  display_name TEXT NOT NULL,    -- 'Free', 'Starter', 'Pro', 'Business', 'Enterprise'
  price_monthly INT NOT NULL DEFAULT 0,  -- 원 (KRW)
  price_yearly INT,              -- 연간 (할인가)
  max_members INT,               -- NULL = 무제한
  features JSONB NOT NULL DEFAULT '[]',  -- 기능 목록
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,  -- 추천 뱃지
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service, plan_key)
);

-- 2. wio_subscriptions: 실제 구독 기록
CREATE TABLE IF NOT EXISTS wio_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES wio_subscription_plans(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES wio_tenants(id),  -- WIO 테넌트 (기업 구독 시)
  service TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'paused', 'cancelled', 'expired'
  price_paid INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KRW',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',  -- 'monthly', 'yearly'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  payment_method TEXT,  -- 'toss', 'portone', 'manual'
  external_subscription_id TEXT,  -- PG사 구독 ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_wio_sub_plans_service ON wio_subscription_plans(service, is_active);
CREATE INDEX IF NOT EXISTS idx_wio_subs_user ON wio_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_subs_tenant ON wio_subscriptions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_wio_subs_service ON wio_subscriptions(service, status);
CREATE INDEX IF NOT EXISTS idx_wio_subs_expires ON wio_subscriptions(expires_at) WHERE status = 'active';

-- 4. RLS
ALTER TABLE wio_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE wio_subscriptions ENABLE ROW LEVEL SECURITY;

-- plans: 공개 읽기 (pricing 페이지용)
DO $$ BEGIN
  DROP POLICY IF EXISTS "plans_public_read" ON wio_subscription_plans;
  CREATE POLICY "plans_public_read" ON wio_subscription_plans FOR SELECT USING (is_active = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "plans_staff_write" ON wio_subscription_plans;
  CREATE POLICY "plans_staff_write" ON wio_subscription_plans FOR ALL USING (auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- subscriptions: 본인 것만 읽기 + staff 전체 읽기
DO $$ BEGIN
  DROP POLICY IF EXISTS "subs_own_read" ON wio_subscriptions;
  CREATE POLICY "subs_own_read" ON wio_subscriptions FOR SELECT
    USING (user_id = auth.uid() OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "subs_own_write" ON wio_subscriptions;
  CREATE POLICY "subs_own_write" ON wio_subscriptions FOR ALL
    USING (user_id = auth.uid() OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 5. 시드: WIO 플랜 (확정 가격)
INSERT INTO wio_subscription_plans (service, plan_key, display_name, price_monthly, price_yearly, max_members, is_popular, sort_order, features) VALUES
  ('wio', 'free',       'Free',       0,      0,       5,   false, 1, '["기본 모듈 3개", "멤버 최대 5명", "1GB 스토리지"]'),
  ('wio', 'starter',    'Starter',    49000,  490000,  20,  false, 2, '["모든 기본 모듈", "멤버 최대 20명", "10GB 스토리지", "이메일 지원"]'),
  ('wio', 'pro',        'Pro',        149000, 1490000, 100, true,  3, '["모든 모듈 + AI", "멤버 최대 100명", "100GB 스토리지", "우선 지원", "Analytics"]'),
  ('wio', 'business',   'Business',   399000, 3990000, NULL,false, 4, '["무제한 멤버", "무제한 스토리지", "전용 지원", "Custom 도메인", "API 접근"]'),
  ('wio', 'enterprise', 'Enterprise', 0,      NULL,    NULL,false, 5, '["맞춤 계약", "온프레미스 옵션", "전담 CSM", "SLA 보장"]')
ON CONFLICT (service, plan_key) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly  = EXCLUDED.price_yearly,
  max_members   = EXCLUDED.max_members,
  is_popular    = EXCLUDED.is_popular,
  features      = EXCLUDED.features,
  updated_at    = now();

-- SmarComm 플랜
INSERT INTO wio_subscription_plans (service, plan_key, display_name, price_monthly, price_yearly, max_members, is_popular, sort_order, features) VALUES
  ('smarcomm', 'free',     'Free',     0,      0,       1,    false, 1, '["캠페인 3개", "이메일 500건/월", "기본 템플릿"]'),
  ('smarcomm', 'starter',  'Starter',  49000,  490000,  3,    false, 2, '["캠페인 20개", "이메일 5,000건/월", "A/B 테스트"]'),
  ('smarcomm', 'pro',      'Pro',      149000, 1490000, 10,   true,  3, '["캠페인 무제한", "이메일 50,000건/월", "자동화 플로우", "CRM 연동"]'),
  ('smarcomm', 'business', 'Business', 399000, 3990000, NULL, false, 4, '["무제한", "이메일 500,000건/월", "AI 개인화", "전용 IP"]')
ON CONFLICT (service, plan_key) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features      = EXCLUDED.features,
  updated_at    = now();

-- Mindle 플랜
INSERT INTO wio_subscription_plans (service, plan_key, display_name, price_monthly, price_yearly, max_members, is_popular, sort_order, features) VALUES
  ('mindle', 'free',    'Free',    0,     0,      1, false, 1, '["트렌드 카드 10개/월", "주간 뉴스레터"]'),
  ('mindle', 'premium', 'Premium', 9900,  99000,  1, true,  2, '["트렌드 카드 무제한", "일간 브리핑", "카테고리 필터", "북마크"]')
ON CONFLICT (service, plan_key) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features      = EXCLUDED.features,
  updated_at    = now();

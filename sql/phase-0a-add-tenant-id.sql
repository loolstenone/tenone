-- Phase 0-A: tenant_id 없는 테이블 일괄 추가
-- 실행일: 2026-04-21
-- 목적: 전 테이블 tenant_id 보장 → RLS 격리 기반 확보
-- tenone tenant UUID: a0000000-0000-0000-0000-000000000001

-- ── jakka_* (26 테이블) ───────────────────────────────────────
ALTER TABLE jakka_bookmarks           ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_creators            ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_follows             ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_likes               ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_notices             ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_notifications       ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_orders              ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_post_likes          ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_posts               ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_product_likes       ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_product_notify      ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_product_qna         ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_products            ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_seller_applications ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_settlements         ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_approvals  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_artists    ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_guestbook  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_interests  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_members    ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_updates    ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_work_comments ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_work_likes ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcase_works      ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_showcases           ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE jakka_works               ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;

-- ── montz_* (4 테이블) ───────────────────────────────────────
ALTER TABLE montz_auditions            ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE montz_creators             ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE montz_verification_requests ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE montz_works                ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;

-- ── badak 특화 ───────────────────────────────────────────────
ALTER TABLE badak_level_criteria    ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE badak_meeting_requests  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;

-- ── 공통 인프라 ──────────────────────────────────────────────
ALTER TABLE crm_touchpoints           ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE email_events              ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE email_sends               ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE privacy_deletion_requests ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE sso_tokens                ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE wio_feature_flags         ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE wio_subscription_plans    ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid;

-- ── 인덱스 ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jakka_products_tenant           ON jakka_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_orders_tenant             ON jakka_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_creators_tenant           ON jakka_creators(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_seller_applications_tenant ON jakka_seller_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_settlements_tenant        ON jakka_settlements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_works_tenant              ON jakka_works(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_posts_tenant              ON jakka_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_showcases_tenant          ON jakka_showcases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jakka_notices_tenant            ON jakka_notices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_montz_creators_tenant           ON montz_creators(tenant_id);
CREATE INDEX IF NOT EXISTS idx_montz_works_tenant              ON montz_works(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_tenant              ON email_sends(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_events_tenant             ON email_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_touchpoints_tenant          ON crm_touchpoints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_subscription_plans_tenant   ON wio_subscription_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wio_feature_flags_tenant        ON wio_feature_flags(tenant_id);

-- ── 제외 (이유) ──────────────────────────────────────────────
-- wio_tenants: tenant 정의 테이블 자체, tenant_id 불필요
-- capabilities: 유니버스 공용 레지스트리, 테넌트 분리 불필요
-- brand_capabilities: brand_id 기반, 테넌트 분리 불필요
-- member_capability_roles: brand_id 기반, 테넌트 분리 불필요

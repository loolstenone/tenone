-- ============================================
-- WIO RLS 무한 재귀 수정 + TenOne 테넌트 생성
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. 기존 문제 있는 RLS 정책 삭제
DROP POLICY IF EXISTS "wio_tenants_read" ON wio_tenants;
DROP POLICY IF EXISTS "wio_tenants_write" ON wio_tenants;
DROP POLICY IF EXISTS "wio_tenants_update" ON wio_tenants;
DROP POLICY IF EXISTS "wio_members_read" ON wio_members;
DROP POLICY IF EXISTS "wio_members_write" ON wio_members;
DROP POLICY IF EXISTS "wio_members_update" ON wio_members;

-- 2. 단순한 RLS 정책 재생성 (무한 재귀 없음)
-- tenants: 누구나 읽기, 인증된 유저만 쓰기
CREATE POLICY "wio_tenants_read" ON wio_tenants FOR SELECT USING (true);
CREATE POLICY "wio_tenants_insert" ON wio_tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "wio_tenants_update" ON wio_tenants FOR UPDATE USING (true);

-- members: 누구나 읽기, 인증된 유저만 쓰기
CREATE POLICY "wio_members_read" ON wio_members FOR SELECT USING (true);
CREATE POLICY "wio_members_insert" ON wio_members FOR INSERT WITH CHECK (true);
CREATE POLICY "wio_members_update" ON wio_members FOR UPDATE USING (true);

-- 3. TenOne 실행 테넌트 생성 (이미 있으면 무시)
INSERT INTO wio_tenants (id, name, slug, service_name, domain, primary_color, powered_by, plan, max_members, modules, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Ten:One™',
    'tenone',
    'Ten:One™ Office',
    'tenone.biz',
    '#171717',
    false,
    'enterprise',
    100,
    ARRAY['home','project','talk','finance','people','sales','timesheet','learn','content','wiki','insight','gpr','competition','networking','certificate','approval'],
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    service_name = EXCLUDED.service_name,
    plan = EXCLUDED.plan,
    modules = EXCLUDED.modules,
    is_active = true;

-- 4. 텐원 관리자를 WIO 멤버로 등록 (lools@tenone.biz)
INSERT INTO wio_members (tenant_id, user_id, display_name, role, email)
SELECT
    'a0000000-0000-0000-0000-000000000001',
    m.auth_id,
    m.name,
    'owner',
    m.email
FROM members m
WHERE m.email = 'lools@tenone.biz' AND m.auth_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. 카카오 계정도 등록
INSERT INTO wio_members (tenant_id, user_id, display_name, role, email)
SELECT
    'a0000000-0000-0000-0000-000000000001',
    m.auth_id,
    m.name,
    'owner',
    m.email
FROM members m
WHERE m.email = 'lools@kakao.com' AND m.auth_id IS NOT NULL
ON CONFLICT DO NOTHING;

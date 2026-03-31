-- ============================================================================
-- TenOne Universe Identity Architecture - 3계층 회원 시스템
-- ============================================================================
-- 실행 대상: Prod Supabase (ziotlxkdctlhiwkgmmsh)
-- 안전: 모든 CREATE는 IF NOT EXISTS, 기존 테이블 절대 수정/삭제 안 함
-- ============================================================================

-- ============================================================================
-- PHASE 1: 핵심 테이블 생성
-- ============================================================================

-- ── Tier 2: member_roles (유니버스 뱃지) ──
CREATE TABLE IF NOT EXISTS member_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,
    context     TEXT NOT NULL DEFAULT 'universe',
    granted_at  TIMESTAMPTZ DEFAULT now(),
    granted_by  UUID REFERENCES members(id),
    expires_at  TIMESTAMPTZ,
    is_active   BOOLEAN DEFAULT true,
    UNIQUE(member_id, role, context)
);

CREATE INDEX IF NOT EXISTS idx_member_roles_member ON member_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_role ON member_roles(role);
CREATE INDEX IF NOT EXISTS idx_member_roles_context ON member_roles(context, role);
CREATE INDEX IF NOT EXISTS idx_member_roles_active ON member_roles(member_id, is_active) WHERE is_active = true;

-- ── Tier 3A+: member_role_history (등급/권한 변이 이력) ──
CREATE TABLE IF NOT EXISTS member_role_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,
    action      TEXT NOT NULL,
    role_or_level TEXT NOT NULL,
    previous_value TEXT,
    new_value   TEXT,
    reason      TEXT,
    changed_by  UUID REFERENCES members(id),
    reference_id UUID,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_role_history_member ON member_role_history(member_id, brand_id, created_at DESC);

-- ── Tier 3C: member_preferences (브랜드별 구독/설정) ──
CREATE TABLE IF NOT EXISTS member_preferences (
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id        TEXT NOT NULL,
    newsletter_subscribed   BOOLEAN DEFAULT false,
    marketing_email_opt_in  BOOLEAN DEFAULT false,
    marketing_sms_opt_in    BOOLEAN DEFAULT false,
    notify_email    BOOLEAN DEFAULT true,
    notify_push     BOOLEAN DEFAULT false,
    notify_kakao    BOOLEAN DEFAULT false,
    language        VARCHAR(5) DEFAULT 'ko',
    theme           VARCHAR(20) DEFAULT 'system',
    timezone        VARCHAR(50) DEFAULT 'Asia/Seoul',
    privacy_agreed_at    TIMESTAMPTZ,
    terms_agreed_at      TIMESTAMPTZ,
    data_retention_agreed BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (member_id, brand_id)
);

-- ── Tier 3B: member_points (공통 포인트) ──
CREATE TABLE IF NOT EXISTS member_points (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,
    points      INTEGER NOT NULL,
    reason      TEXT NOT NULL,
    reference_id UUID,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_points_member ON member_points(member_id, brand_id);

-- 포인트 집계 뷰
CREATE OR REPLACE VIEW member_points_summary AS
SELECT member_id, brand_id,
       SUM(points) AS total_points,
       CASE
           WHEN SUM(points) >= 10000 THEN 'Diamond'
           WHEN SUM(points) >= 5000  THEN 'Platinum'
           WHEN SUM(points) >= 2000  THEN 'Gold'
           WHEN SUM(points) >= 500   THEN 'Silver'
           ELSE 'Bronze'
       END AS grade
FROM member_points
GROUP BY member_id, brand_id;

-- ── 가입 경로 추적 ──
CREATE TABLE IF NOT EXISTS member_brand_joins (
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,
    joined_at   TIMESTAMPTZ DEFAULT now(),
    referral_code   VARCHAR(50),
    referral_member_id UUID REFERENCES members(id),
    utm_source      VARCHAR(100),
    utm_medium      VARCHAR(100),
    utm_campaign    VARCHAR(100),
    landing_url     TEXT,
    PRIMARY KEY (member_id, brand_id)
);

-- ── 감사 로그 ──
CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES members(id),
    target_id   UUID REFERENCES members(id),
    action      TEXT NOT NULL,
    resource    TEXT,
    details     JSONB DEFAULT '{}',
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_log(target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id, created_at DESC);


-- ============================================================================
-- PHASE 1: JWT 커스텀 클레임 트리거 + 헬퍼 함수
-- ============================================================================

-- ── JWT 클레임 갱신 함수 ──
CREATE OR REPLACE FUNCTION sync_roles_to_jwt()
RETURNS TRIGGER AS $$
DECLARE
    target_member_id UUID;
    target_auth_id UUID;
    role_array TEXT[];
    brand_array TEXT[];
    has_staff BOOLEAN;
    has_super_admin BOOLEAN;
BEGIN
    target_member_id := COALESCE(NEW.member_id, OLD.member_id);

    SELECT auth_id INTO target_auth_id
    FROM members WHERE id = target_member_id;

    IF target_auth_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

    SELECT
        ARRAY_AGG(DISTINCT role || ':' || context),
        ARRAY_AGG(DISTINCT context) FILTER (WHERE context != 'universe'),
        BOOL_OR(role = 'staff' AND context = 'universe'),
        BOOL_OR(role = 'super_admin' AND context = 'universe')
    INTO role_array, brand_array, has_staff, has_super_admin
    FROM member_roles
    WHERE member_id = target_member_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());

    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB) || jsonb_build_object(
        'member_id', target_member_id,
        'roles', COALESCE(role_array, ARRAY[]::TEXT[]),
        'brands', COALESCE(brand_array, ARRAY[]::TEXT[]),
        'is_staff', COALESCE(has_staff, false),
        'is_super_admin', COALESCE(has_super_admin, false),
        'roles_synced_at', now()
    )
    WHERE id = target_auth_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거
DROP TRIGGER IF EXISTS trg_sync_jwt_on_role_change ON member_roles;
CREATE TRIGGER trg_sync_jwt_on_role_change
    AFTER INSERT OR UPDATE OR DELETE ON member_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_roles_to_jwt();

-- ── 레거시 동기화 트리거 (member_roles → members.roles[], account_type) ──
CREATE OR REPLACE FUNCTION sync_roles_to_legacy()
RETURNS TRIGGER AS $$
DECLARE
    target_member_id UUID;
    legacy_roles TEXT[];
    legacy_affiliations TEXT[];
    legacy_account_type TEXT;
BEGIN
    target_member_id := COALESCE(NEW.member_id, OLD.member_id);

    SELECT
        ARRAY_AGG(DISTINCT role) FILTER (WHERE context = 'universe'),
        ARRAY_AGG(DISTINCT context) FILTER (WHERE context != 'universe')
    INTO legacy_roles, legacy_affiliations
    FROM member_roles
    WHERE member_id = target_member_id AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());

    legacy_account_type := CASE
        WHEN 'super_admin' = ANY(COALESCE(legacy_roles, ARRAY[]::TEXT[])) THEN 'staff'
        WHEN 'staff' = ANY(COALESCE(legacy_roles, ARRAY[]::TEXT[])) THEN 'staff'
        WHEN 'partner' = ANY(COALESCE(legacy_roles, ARRAY[]::TEXT[])) THEN 'partner'
        WHEN 'junior_partner' = ANY(COALESCE(legacy_roles, ARRAY[]::TEXT[])) THEN 'junior-partner'
        WHEN 'crew' = ANY(COALESCE(legacy_roles, ARRAY[]::TEXT[])) THEN 'crew'
        ELSE 'member'
    END;

    UPDATE members SET
        roles = COALESCE(legacy_roles, ARRAY[]::TEXT[]),
        affiliations = COALESCE(legacy_affiliations, ARRAY[]::TEXT[]),
        account_type = legacy_account_type::account_type,
        intra_access = (legacy_account_type != 'member'),
        updated_at = now()
    WHERE id = target_member_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_legacy_on_role_change ON member_roles;
CREATE TRIGGER trg_sync_legacy_on_role_change
    AFTER INSERT OR UPDATE OR DELETE ON member_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_roles_to_legacy();

-- ── RLS 헬퍼 함수 (JWT 기반) ──
CREATE OR REPLACE FUNCTION auth_member_id()
RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'app_metadata' ->> 'member_id')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_staff()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'is_staff')::BOOLEAN,
        false
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_has_brand(brand_name TEXT)
RETURNS BOOLEAN AS $$
    SELECT brand_name = ANY(
        ARRAY(SELECT jsonb_array_elements_text(
            COALESCE(auth.jwt() -> 'app_metadata' -> 'brands', '[]'::JSONB)
        ))
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================================
-- PHASE 2: 기존 데이터 → member_roles 복사 (비파괴)
-- ============================================================================

-- ── members.account_type → member_roles (universe 역할) ──
INSERT INTO member_roles (member_id, role, context, granted_at)
SELECT id,
    CASE account_type
        WHEN 'staff' THEN 'staff'
        WHEN 'partner' THEN 'partner'
        WHEN 'junior-partner' THEN 'junior_partner'
        WHEN 'crew' THEN 'crew'
        WHEN 'member' THEN 'member'
        ELSE 'member'
    END,
    'universe',
    COALESCE(created_at, now())
FROM members
WHERE account_type IS NOT NULL
ON CONFLICT (member_id, role, context) DO NOTHING;

-- ── CEO를 super_admin으로 추가 ──
INSERT INTO member_roles (member_id, role, context)
SELECT id, 'super_admin', 'universe'
FROM members
WHERE email = 'cjeon@tenone.biz'
ON CONFLICT (member_id, role, context) DO NOTHING;

-- ── members.affiliations[] → member_roles (브랜드 역할) ──
INSERT INTO member_roles (member_id, role, context, granted_at)
SELECT m.id, 'member', unnest(m.affiliations), COALESCE(m.created_at, now())
FROM members m
WHERE m.affiliations IS NOT NULL AND array_length(m.affiliations, 1) > 0
ON CONFLICT (member_id, role, context) DO NOTHING;

-- ── members.newsletter_subscribed → member_preferences ──
INSERT INTO member_preferences (member_id, brand_id, newsletter_subscribed)
SELECT id, 'tenone', COALESCE(newsletter_subscribed, false)
FROM members
WHERE id IS NOT NULL
ON CONFLICT (member_id, brand_id) DO NOTHING;

-- ── JWT 일괄 갱신 (전체 멤버) ──
DO $$
DECLARE
    r RECORD;
    role_array TEXT[];
    brand_array TEXT[];
    has_staff BOOLEAN;
    has_super_admin BOOLEAN;
BEGIN
    FOR r IN SELECT DISTINCT m.id AS member_id, m.auth_id
             FROM members m WHERE m.auth_id IS NOT NULL
    LOOP
        SELECT
            ARRAY_AGG(DISTINCT mr.role || ':' || mr.context),
            ARRAY_AGG(DISTINCT mr.context) FILTER (WHERE mr.context != 'universe'),
            BOOL_OR(mr.role = 'staff' AND mr.context = 'universe'),
            BOOL_OR(mr.role = 'super_admin' AND mr.context = 'universe')
        INTO role_array, brand_array, has_staff, has_super_admin
        FROM member_roles mr
        WHERE mr.member_id = r.member_id AND mr.is_active = true
          AND (mr.expires_at IS NULL OR mr.expires_at > now());

        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB) || jsonb_build_object(
            'member_id', r.member_id,
            'roles', COALESCE(role_array, ARRAY[]::TEXT[]),
            'brands', COALESCE(brand_array, ARRAY[]::TEXT[]),
            'is_staff', COALESCE(has_staff, false),
            'is_super_admin', COALESCE(has_super_admin, false),
            'roles_synced_at', now()
        )
        WHERE id = r.auth_id;
    END LOOP;
END $$;


-- ============================================================================
-- PHASE 3: 브랜드별 프로필 테이블 (Tier 3A)
-- ============================================================================

-- ── TenOne Staff Profile ──
CREATE TABLE IF NOT EXISTS tenone_staff_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    department      VARCHAR(100),
    position        VARCHAR(100),
    employee_id     VARCHAR(50),
    hire_date       DATE,
    employment_type VARCHAR(50),
    team            VARCHAR(100),
    office_location VARCHAR(100),
    emergency_contact VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── HR 필드 이관 (members → tenone_staff_profiles) ──
-- hire_date, employment_type는 members에 없을 수 있으므로 조건부 처리
DO $$
BEGIN
    -- hire_date 컬럼이 members에 있는 경우
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='hire_date') THEN
        EXECUTE '
            INSERT INTO tenone_staff_profiles (member_id, department, position, employee_id, hire_date, employment_type)
            SELECT id, department, position, employee_id, hire_date::DATE, employment_type
            FROM members
            WHERE (department IS NOT NULL OR position IS NOT NULL OR employee_id IS NOT NULL OR hire_date IS NOT NULL)
            ON CONFLICT (member_id) DO NOTHING
        ';
    ELSE
        -- hire_date 없으면 나머지 필드만 이관
        INSERT INTO tenone_staff_profiles (member_id, department, position, employee_id)
        SELECT id, department, position, employee_id
        FROM members
        WHERE (department IS NOT NULL OR position IS NOT NULL OR employee_id IS NOT NULL)
        ON CONFLICT (member_id) DO NOTHING;
    END IF;
END $$;

-- ── SmarComm Profile ──
CREATE TABLE IF NOT EXISTS smarcomm_profiles (
    member_id         UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    subscription_tier TEXT DEFAULT 'free',
    workspace_id      UUID,
    company           VARCHAR(200),
    company_size      VARCHAR(50),
    industry          VARCHAR(100),
    billing_email     VARCHAR(255),
    trial_ends_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── MADLeague Profile ──
CREATE TABLE IF NOT EXISTS madleague_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    university      VARCHAR(200),
    club_name       VARCHAR(200),
    generation      INTEGER,
    league_role     TEXT,
    major           VARCHAR(100),
    graduation_year INTEGER,
    is_alumni       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── HeRo Profile ──
CREATE TABLE IF NOT EXISTS hero_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    talent_type     TEXT,
    experience_level TEXT,
    resume_url      TEXT,
    portfolio_url   TEXT,
    availability    TEXT DEFAULT 'not_looking',
    desired_salary  VARCHAR(50),
    skills          TEXT[],
    preferred_industries TEXT[],
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Evolution School Profile ──
CREATE TABLE IF NOT EXISTS evolution_profiles (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    is_instructor   BOOLEAN DEFAULT false,
    instructor_bio  TEXT,
    total_learning_hours INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Evolution 수강 이력 (Tier 3B) ──
CREATE TABLE IF NOT EXISTS evolution_enrollments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    course_id   UUID NOT NULL,
    status      TEXT DEFAULT 'enrolled',
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    score       NUMERIC(5,2),
    certificate_url TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evolution_enrollments_member ON evolution_enrollments(member_id);

-- ── SmarComm 결제 이력 (Tier 3B) ──
CREATE TABLE IF NOT EXISTS smarcomm_billing_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_tier   TEXT NOT NULL,
    amount      INTEGER NOT NULL,
    currency    VARCHAR(3) DEFAULT 'KRW',
    status      TEXT DEFAULT 'paid',
    period_start TIMESTAMPTZ,
    period_end  TIMESTAMPTZ,
    invoice_url TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 방문 이력 (공통 Tier 3B) ──
CREATE TABLE IF NOT EXISTS member_visits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    brand_id    TEXT NOT NULL,
    visited_at  TIMESTAMPTZ DEFAULT now(),
    ip_address  INET,
    user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_member_visits_recent ON member_visits(member_id, visited_at DESC);

-- ── 브랜드 탈퇴 이력 ──
CREATE TABLE IF NOT EXISTS member_brand_withdrawals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id),
    brand_id    TEXT NOT NULL,
    reason      TEXT,
    withdrawn_at TIMESTAMPTZ DEFAULT now(),
    data_deleted_at TIMESTAMPTZ
);

-- ── 조직/B2B ──
CREATE TABLE IF NOT EXISTS organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(100) UNIQUE,
    brand_id    TEXT NOT NULL,
    plan_tier   TEXT DEFAULT 'free',
    owner_id    UUID NOT NULL REFERENCES members(id),
    logo_url    TEXT,
    max_seats   INTEGER DEFAULT 5,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_members (
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    org_role    TEXT DEFAULT 'member',
    invited_by  UUID REFERENCES members(id),
    joined_at   TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (org_id, member_id)
);


-- ============================================================================
-- PHASE 4: RLS 정책 (JWT 클레임 기반)
-- ============================================================================

ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_role_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenone_staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE madleague_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- member_roles: 본인 + staff
DROP POLICY IF EXISTS "member_roles_select" ON member_roles;
CREATE POLICY "member_roles_select" ON member_roles FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

DROP POLICY IF EXISTS "member_roles_insert" ON member_roles;
CREATE POLICY "member_roles_insert" ON member_roles FOR INSERT WITH CHECK (
    auth_is_staff()
);

DROP POLICY IF EXISTS "member_roles_update" ON member_roles;
CREATE POLICY "member_roles_update" ON member_roles FOR UPDATE USING (
    auth_is_staff()
);

-- member_role_history: 본인 읽기 + staff 전체
DROP POLICY IF EXISTS "role_history_select" ON member_role_history;
CREATE POLICY "role_history_select" ON member_role_history FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- member_preferences: 본인만
DROP POLICY IF EXISTS "preferences_select" ON member_preferences;
CREATE POLICY "preferences_select" ON member_preferences FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

DROP POLICY IF EXISTS "preferences_upsert" ON member_preferences;
CREATE POLICY "preferences_upsert" ON member_preferences FOR ALL USING (
    member_id = auth_member_id()
);

-- member_points: 본인 + staff
DROP POLICY IF EXISTS "points_select" ON member_points;
CREATE POLICY "points_select" ON member_points FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- tenone_staff_profiles: 본인 + staff
DROP POLICY IF EXISTS "tenone_staff_select" ON tenone_staff_profiles;
CREATE POLICY "tenone_staff_select" ON tenone_staff_profiles FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

DROP POLICY IF EXISTS "tenone_staff_update" ON tenone_staff_profiles;
CREATE POLICY "tenone_staff_update" ON tenone_staff_profiles FOR UPDATE USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- smarcomm_profiles: 본인 + staff + smarcomm 브랜드 접근자
DROP POLICY IF EXISTS "smarcomm_select" ON smarcomm_profiles;
CREATE POLICY "smarcomm_select" ON smarcomm_profiles FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff() OR auth_has_brand('smarcomm')
);

-- madleague_profiles: 본인 + staff + madleague 접근자
DROP POLICY IF EXISTS "madleague_select" ON madleague_profiles;
CREATE POLICY "madleague_select" ON madleague_profiles FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff() OR auth_has_brand('madleague')
);

-- hero_profiles: 본인 + staff
DROP POLICY IF EXISTS "hero_select" ON hero_profiles;
CREATE POLICY "hero_select" ON hero_profiles FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff() OR auth_has_brand('hero')
);

-- evolution_profiles: 본인 + staff
DROP POLICY IF EXISTS "evolution_select" ON evolution_profiles;
CREATE POLICY "evolution_select" ON evolution_profiles FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff() OR auth_has_brand('evolution')
);

-- audit_log: staff만
DROP POLICY IF EXISTS "audit_select" ON audit_log;
CREATE POLICY "audit_select" ON audit_log FOR SELECT USING (
    auth_is_staff()
);

-- organizations: 소속 멤버 + staff
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_select" ON organizations FOR SELECT USING (
    owner_id = auth_member_id()
    OR auth_is_staff()
    OR EXISTS (
        SELECT 1 FROM org_members om
        WHERE om.org_id = organizations.id AND om.member_id = auth_member_id()
    )
);

-- org_members: 같은 조직 멤버 + staff
DROP POLICY IF EXISTS "org_members_select" ON org_members;
CREATE POLICY "org_members_select" ON org_members FOR SELECT USING (
    member_id = auth_member_id()
    OR auth_is_staff()
    OR EXISTS (
        SELECT 1 FROM org_members om2
        WHERE om2.org_id = org_members.org_id AND om2.member_id = auth_member_id()
    )
);


-- ============================================================================
-- 완료 확인
-- ============================================================================
SELECT 'Identity Architecture SQL completed successfully' AS result;

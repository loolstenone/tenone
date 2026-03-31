-- ============================================================================
-- STEP 3: ERP 핵심 운영 테이블 생성
-- ============================================================================
-- 실행 대상: Prod Supabase (ziotlxkdctlhiwkgmmsh)
-- 모든 CREATE는 IF NOT EXISTS — 멱등 실행 가능
-- ============================================================================

-- ── 결재 (Approvals) ──
CREATE TABLE IF NOT EXISTS approvals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    requester_name  TEXT,
    title           TEXT NOT NULL,
    content         TEXT,
    factor          TEXT DEFAULT '일반',
    status          TEXT DEFAULT 'pending',
    approvers       UUID[] DEFAULT '{}',
    approved_by     UUID[],
    rejected_by     UUID,
    memo            TEXT,
    attachments     JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approvals_requester ON approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

-- ── 프로젝트 (Projects) ──
CREATE TABLE IF NOT EXISTS projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    status          TEXT DEFAULT '진행중',
    progress        INTEGER DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    budget          BIGINT DEFAULT 0,
    brand_id        TEXT DEFAULT 'tenone',
    owner_id        UUID REFERENCES members(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 프로젝트 멤버 (Project Members) ──
CREATE TABLE IF NOT EXISTS project_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role            TEXT DEFAULT '팀원',
    joined_at       TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_member ON project_members(member_id);

-- ── 타임시트 (Timesheets) ──
CREATE TABLE IF NOT EXISTS timesheets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id),
    date            DATE NOT NULL,
    hours           NUMERIC(4,1) DEFAULT 0,
    check_in        TEXT,
    check_out       TEXT,
    status          TEXT DEFAULT '정상',
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, date)
);

CREATE INDEX IF NOT EXISTS idx_timesheets_member_date ON timesheets(member_id, date DESC);

-- ── 경비 (Expenses) ──
CREATE TABLE IF NOT EXISTS expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id),
    expense_date    DATE NOT NULL,
    amount          BIGINT NOT NULL,
    currency        VARCHAR(3) DEFAULT 'KRW',
    category        TEXT,
    description     TEXT NOT NULL,
    receipt_url     TEXT,
    status          TEXT DEFAULT 'pending',
    approved_by     UUID REFERENCES members(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_member ON expenses(member_id);

-- ── 급여 (Payroll) ──
CREATE TABLE IF NOT EXISTS payroll (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    year_month      VARCHAR(7) NOT NULL,
    base_salary     BIGINT DEFAULT 0,
    bonus           BIGINT DEFAULT 0,
    deductions      BIGINT DEFAULT 0,
    net_pay         BIGINT DEFAULT 0,
    status          TEXT DEFAULT '예정',
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, year_month)
);

-- ── 근태 (Attendance) ──
CREATE TABLE IF NOT EXISTS attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    check_in        TIMESTAMPTZ,
    check_out       TIMESTAMPTZ,
    type            TEXT DEFAULT 'normal',
    note            TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, date DESC);

-- ── GPR 목표 (Goals) ──
CREATE TABLE IF NOT EXISTS gpr_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT DEFAULT 'Performance',
    weight          INTEGER DEFAULT 0,
    target          TEXT,
    metric          TEXT,
    quarter         VARCHAR(10),
    status          TEXT DEFAULT 'Draft',
    progress        INTEGER DEFAULT 0,
    self_rating     TEXT,
    self_comment    TEXT,
    self_evaluated_at TIMESTAMPTZ,
    supervisor_rating TEXT,
    supervisor_comment TEXT,
    supervisor_id   UUID REFERENCES members(id),
    evaluated_at    TIMESTAMPTZ,
    agreed_by       UUID REFERENCES members(id),
    agreed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gpr_goals_member ON gpr_goals(member_id);
CREATE INDEX IF NOT EXISTS idx_gpr_goals_quarter ON gpr_goals(quarter);

-- ── 사업계획 (Biz Plans) ──
CREATE TABLE IF NOT EXISTS biz_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quarter         VARCHAR(10) NOT NULL,
    division        TEXT NOT NULL,
    title           TEXT,
    revenue_target  BIGINT DEFAULT 0,
    cost_budget     BIGINT DEFAULT 0,
    key_initiatives JSONB DEFAULT '[]',
    status          TEXT DEFAULT 'draft',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(quarter, division)
);

-- ── 게시판 (Posts) ──
CREATE TABLE IF NOT EXISTS posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board           TEXT NOT NULL DEFAULT 'free',
    title           TEXT NOT NULL,
    content         TEXT,
    author_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    visibility      TEXT DEFAULT 'all',
    badge           TEXT,
    is_pinned       BOOLEAN DEFAULT false,
    notice_start    DATE,
    notice_end      DATE,
    view_count      INTEGER DEFAULT 0,
    like_count      INTEGER DEFAULT 0,
    comment_count   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board, created_at DESC);

-- ── 게시판 댓글 (Post Comments) ──
CREATE TABLE IF NOT EXISTS post_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    parent_id       UUID REFERENCES post_comments(id),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

-- ── 이벤트/일정 (Events) ──
CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    event_type      TEXT DEFAULT '일반',
    start_at        TIMESTAMPTZ NOT NULL,
    end_at          TIMESTAMPTZ,
    location        TEXT,
    is_all_day      BOOLEAN DEFAULT false,
    brand_id        TEXT DEFAULT 'tenone',
    creator_id      UUID REFERENCES members(id),
    attendees       UUID[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_at);

-- ── 알림 (Notifications) ──
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    title           TEXT NOT NULL,
    message         TEXT,
    link            TEXT,
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id, is_read, created_at DESC);

-- ── 포인트 로그 (Point Logs) ──
CREATE TABLE IF NOT EXISTS point_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    points          INTEGER NOT NULL,
    reason          TEXT NOT NULL,
    source_type     TEXT,
    source_id       TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_point_logs_member ON point_logs(member_id, created_at DESC);

-- ── 교육 과정 (Courses) ──
CREATE TABLE IF NOT EXISTS courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT DEFAULT 'general',
    instructor_id   UUID REFERENCES members(id),
    duration_hours  INTEGER DEFAULT 0,
    is_required     BOOLEAN DEFAULT false,
    brand_id        TEXT DEFAULT 'tenone',
    status          TEXT DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 수강 이력 (Enrollments) ──
CREATE TABLE IF NOT EXISTS enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status          TEXT DEFAULT 'enrolled',
    progress        INTEGER DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    score           NUMERIC(5,2),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_member ON enrollments(member_id);

-- ── CRM People ──
CREATE TABLE IF NOT EXISTS crm_people (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    type            TEXT DEFAULT 'Client',
    status          TEXT DEFAULT 'Active',
    company         TEXT,
    position        TEXT,
    avatar_initials TEXT,
    brand_association TEXT[] DEFAULT '{}',
    tags            TEXT[] DEFAULT '{}',
    source          TEXT,
    cohort          TEXT,
    last_contacted  TIMESTAMPTZ,
    notes           TEXT,
    brand_id        TEXT DEFAULT 'tenone',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_people_brand ON crm_people(brand_id);

-- ── CRM Organizations ──
CREATE TABLE IF NOT EXISTS crm_organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    type            TEXT DEFAULT 'Client',
    industry        TEXT,
    website         TEXT,
    contact_ids     UUID[] DEFAULT '{}',
    brand_association TEXT[] DEFAULT '{}',
    status          TEXT DEFAULT 'Active',
    notes           TEXT,
    brand_id        TEXT DEFAULT 'tenone',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── CRM Org Contacts (조직-연락처 연결) ──
CREATE TABLE IF NOT EXISTS crm_org_contacts (
    org_id          UUID NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
    person_id       UUID NOT NULL REFERENCES crm_people(id) ON DELETE CASCADE,
    role            TEXT DEFAULT 'contact',
    PRIMARY KEY (org_id, person_id)
);

-- ── CRM Deals ──
CREATE TABLE IF NOT EXISTS crm_deals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    organization_id UUID REFERENCES crm_organizations(id),
    contact_id      UUID REFERENCES crm_people(id),
    stage           TEXT DEFAULT 'Lead',
    value           BIGINT DEFAULT 0,
    currency        VARCHAR(3) DEFAULT 'KRW',
    brand_id        TEXT DEFAULT 'tenone',
    expected_close_date DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── CRM Activities ──
CREATE TABLE IF NOT EXISTS crm_activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    person_id       UUID REFERENCES crm_people(id),
    organization_id UUID REFERENCES crm_organizations(id),
    deal_id         UUID REFERENCES crm_deals(id),
    brand_id        TEXT DEFAULT 'tenone',
    date            TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Marketing Campaigns ──
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    type            TEXT DEFAULT 'email',
    status          TEXT DEFAULT 'draft',
    brand_id        TEXT DEFAULT 'tenone',
    budget          BIGINT DEFAULT 0,
    spent           BIGINT DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    target_audience TEXT,
    channel         TEXT,
    metrics         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Marketing Leads ──
CREATE TABLE IF NOT EXISTS marketing_leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    company         TEXT,
    stage           TEXT DEFAULT 'New',
    source          TEXT,
    score           INTEGER DEFAULT 0,
    brand_id        TEXT DEFAULT 'tenone',
    campaign_id     UUID REFERENCES marketing_campaigns(id),
    assigned_to     UUID REFERENCES members(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Marketing Content ──
CREATE TABLE IF NOT EXISTS marketing_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    type            TEXT DEFAULT 'blog',
    status          TEXT DEFAULT 'draft',
    brand_id        TEXT DEFAULT 'tenone',
    author_id       UUID REFERENCES members(id),
    content         TEXT,
    published_at    TIMESTAMPTZ,
    channels        TEXT[] DEFAULT '{}',
    metrics         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 설정 (User Settings) ──
CREATE TABLE IF NOT EXISTS user_settings (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    settings        JSONB DEFAULT '{}',
    updated_at      TIMESTAMPTZ DEFAULT now()
);


-- ============================================================================
-- RLS 기본 정책 (모든 테이블에 적용)
-- ============================================================================

-- 결재
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "approvals_select" ON approvals;
CREATE POLICY "approvals_select" ON approvals FOR SELECT USING (
    requester_id = auth_member_id()
    OR auth_member_id() = ANY(approvers)
    OR auth_is_staff()
);
DROP POLICY IF EXISTS "approvals_insert" ON approvals;
CREATE POLICY "approvals_insert" ON approvals FOR INSERT WITH CHECK (
    requester_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "approvals_update" ON approvals;
CREATE POLICY "approvals_update" ON approvals FOR UPDATE USING (
    requester_id = auth_member_id()
    OR auth_member_id() = ANY(approvers)
    OR auth_is_staff()
);

-- 프로젝트 (모든 staff 읽기 가능)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (auth_is_staff());

-- 프로젝트 멤버
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pm_select" ON project_members;
CREATE POLICY "pm_select" ON project_members FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 타임시트
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ts_select" ON timesheets;
CREATE POLICY "ts_select" ON timesheets FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "ts_upsert" ON timesheets;
CREATE POLICY "ts_upsert" ON timesheets FOR ALL USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 경비
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_select" ON expenses;
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 급여
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payroll_select" ON payroll;
CREATE POLICY "payroll_select" ON payroll FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 근태
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_select" ON attendance;
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "attendance_upsert" ON attendance;
CREATE POLICY "attendance_upsert" ON attendance FOR ALL USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- GPR 목표
ALTER TABLE gpr_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gpr_select" ON gpr_goals;
CREATE POLICY "gpr_select" ON gpr_goals FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "gpr_insert" ON gpr_goals;
CREATE POLICY "gpr_insert" ON gpr_goals FOR INSERT WITH CHECK (
    member_id = auth_member_id() OR auth_is_staff()
);
DROP POLICY IF EXISTS "gpr_update" ON gpr_goals;
CREATE POLICY "gpr_update" ON gpr_goals FOR UPDATE USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 게시판
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_select" ON posts;
CREATE POLICY "posts_select" ON posts FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "posts_insert" ON posts;
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS "posts_update" ON posts;
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (
    author_id = auth_member_id() OR auth_is_staff()
);

-- 댓글
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON post_comments;
CREATE POLICY "comments_select" ON post_comments FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "comments_insert" ON post_comments;
CREATE POLICY "comments_insert" ON post_comments FOR INSERT WITH CHECK (auth_is_staff());

-- 이벤트
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select" ON events FOR SELECT USING (auth_is_staff());
DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth_is_staff());

-- 알림
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select" ON notifications;
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (
    member_id = auth_member_id()
);

-- 포인트 로그
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "points_log_select" ON point_logs;
CREATE POLICY "points_log_select" ON point_logs FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- 교육 과정
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);

-- 수강 이력
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enrollments_select" ON enrollments;
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT USING (
    member_id = auth_member_id() OR auth_is_staff()
);

-- CRM (staff만)
ALTER TABLE crm_people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_people_all" ON crm_people;
CREATE POLICY "crm_people_all" ON crm_people FOR ALL USING (auth_is_staff());

ALTER TABLE crm_organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_orgs_all" ON crm_organizations;
CREATE POLICY "crm_orgs_all" ON crm_organizations FOR ALL USING (auth_is_staff());

ALTER TABLE crm_org_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_oc_all" ON crm_org_contacts;
CREATE POLICY "crm_oc_all" ON crm_org_contacts FOR ALL USING (auth_is_staff());

ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_deals_all" ON crm_deals;
CREATE POLICY "crm_deals_all" ON crm_deals FOR ALL USING (auth_is_staff());

ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_activities_all" ON crm_activities;
CREATE POLICY "crm_activities_all" ON crm_activities FOR ALL USING (auth_is_staff());

-- Marketing (staff만)
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_campaigns_all" ON marketing_campaigns;
CREATE POLICY "mkt_campaigns_all" ON marketing_campaigns FOR ALL USING (auth_is_staff());

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_leads_all" ON marketing_leads;
CREATE POLICY "mkt_leads_all" ON marketing_leads FOR ALL USING (auth_is_staff());

ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_content_all" ON marketing_content;
CREATE POLICY "mkt_content_all" ON marketing_content FOR ALL USING (auth_is_staff());

-- 설정
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_own" ON user_settings;
CREATE POLICY "settings_own" ON user_settings FOR ALL USING (
    member_id = auth_member_id()
);


-- ============================================================================
SELECT 'STEP 3 DONE: 25+ ERP tables + RLS policies created' AS result;
-- ============================================================================

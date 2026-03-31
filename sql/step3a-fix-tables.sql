-- ============================================================================
-- STEP 3-A FIX v2: 테이블 생성 (approvals 제외, 인덱스 안전 처리)
-- ============================================================================
-- 이미 존재하는 테이블은 IF NOT EXISTS로 건너뜀
-- 인덱스는 DO 블록으로 감싸서 컬럼 미존재 시 무시
-- ============================================================================

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_project_members_member ON project_members(member_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_timesheets_member_date ON timesheets(member_id, date DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_expenses_member ON expenses(member_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, date DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_gpr_goals_member ON gpr_goals(member_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_gpr_goals_quarter ON gpr_goals(quarter);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board, created_at DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_at);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id, is_read, created_at DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_point_logs_member ON point_logs(member_id, created_at DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_enrollments_member ON enrollments(member_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_crm_people_brand ON crm_people(brand_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

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

SELECT 'STEP 3-A FIX v2 DONE: All tables created (approvals skipped)' AS result;

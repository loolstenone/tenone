-- =============================================
-- Production DB Setup
-- Prod Supabase (ziotlxkdctlhiwkgmmsh)에서 실행
--
-- 기존 members 테이블은 이미 존재 (회원 데이터 있음)
-- 추가 테이블만 생성 (IF NOT EXISTS)
-- =============================================

-- ── 1. members 테이블 HR 필드 추가 ──
ALTER TABLE members ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20) DEFAULT '정규직';
ALTER TABLE members ADD COLUMN IF NOT EXISTS primary_type VARCHAR(30);
ALTER TABLE members ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS affiliations TEXT[] DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS intra_access BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS module_access TEXT[] DEFAULT '{}';

-- 대표이사 HR 정보 설정
UPDATE members
SET hire_date = '2019-10-01',
    employment_type = '정규직',
    department = '기업 총괄',
    position = '대표이사',
    employee_id = '2019-0001',
    intra_access = true,
    primary_type = 'staff',
    roles = ARRAY['staff'],
    module_access = ARRAY['myverse','project','hr','wiki','marketing','studio','erp','approval']
WHERE email = 'cjeon@tenone.biz';

-- ── 2. ENUM 타입 (IF NOT EXISTS 대체) ──
DO $$ BEGIN CREATE TYPE project_type AS ENUM ('community', 'client', 'internal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE project_status AS ENUM ('draft', 'pending', 'approved', 'in-progress', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_type AS ENUM ('PR', 'ME', 'PT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_detail AS ENUM ('PL', 'DO', 'RE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_status AS ENUM ('todo', 'in-progress', 'review', 'done'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE approval_status AS ENUM ('pending', 'in-progress', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE approval_factor AS ENUM ('general', 'project', 'timesheet', 'expense', 'purchase', 'hr', 'contract'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE board_type AS ENUM ('notice', 'free', 'qna'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE visibility_type AS ENUM ('all', 'staff', 'partner_up', 'crew_up', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE content_channel AS ENUM ('works', 'newsroom', 'blog'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE course_category AS ENUM ('required', 'professional', 'advanced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enrollment_status AS ENUM ('not-started', 'in-progress', 'quiz', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE point_grade AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. 프로젝트 & Job ──
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    type project_type NOT NULL,
    sub_type VARCHAR(50),
    status project_status DEFAULT 'draft',
    progress INTEGER DEFAULT 0,
    budget BIGINT DEFAULT 0,
    start_date DATE, end_date DATE,
    brand VARCHAR(50),
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    type job_type NOT NULL, detail job_detail NOT NULL,
    status job_status DEFAULT 'todo',
    assignee_id UUID REFERENCES members(id),
    due_date DATE, hours_estimated NUMERIC(6,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, member_id)
);

-- ── 4. 결재 ──
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    factor approval_factor DEFAULT 'general',
    status approval_status DEFAULT 'pending',
    requester_id UUID NOT NULL REFERENCES members(id),
    requester_name VARCHAR(100),
    approvers UUID[] DEFAULT '{}',
    content JSONB DEFAULT '{}',
    project_id UUID REFERENCES projects(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. 게시판 시스템 ──
CREATE TABLE IF NOT EXISTS board_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site VARCHAR(50) NOT NULL DEFAULT 'tenone',
    slug VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    board_type board_type DEFAULT 'free',
    visibility visibility_type DEFAULT 'all',
    allow_anonymous BOOLEAN DEFAULT false,
    allow_guest_write BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site, slug)
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_config_id UUID REFERENCES board_configs(id),
    site VARCHAR(50) DEFAULT 'tenone',
    board VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_type VARCHAR(20) DEFAULT 'member',
    guest_nickname VARCHAR(50),
    guest_password VARCHAR(200),
    status VARCHAR(20) DEFAULT 'published',
    category VARCHAR(50),
    badge VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    represent_image TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id),
    author_id UUID REFERENCES auth.users(id),
    author_type VARCHAR(20) DEFAULT 'member',
    guest_nickname VARCHAR(50),
    guest_password VARCHAR(200),
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ── 6. 이벤트/콘텐츠/교육 ──
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'general',
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    location VARCHAR(300),
    brand VARCHAR(50),
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    body TEXT,
    status content_status DEFAULT 'draft',
    channel content_channel DEFAULT 'blog',
    author_id UUID REFERENCES members(id),
    brand VARCHAR(50),
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category course_category DEFAULT 'required',
    instructor VARCHAR(100),
    duration_hours NUMERIC(5,1) DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'not-started',
    score INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, member_id)
);

-- ── 7. 라이브러리/알림/포인트/뉴스레터 ──
CREATE TABLE IF NOT EXISTS library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    file_url TEXT,
    thumbnail_url TEXT,
    brand VARCHAR(50),
    uploaded_by UUID REFERENCES members(id),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, member_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    body TEXT,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT false,
    link VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(300),
    type VARCHAR(50) DEFAULT 'earn',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    source VARCHAR(50) DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. 타임시트 ──
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    date DATE NOT NULL,
    hours NUMERIC(4,2) DEFAULT 0,
    description TEXT,
    check_in VARCHAR(10),
    check_out VARCHAR(10),
    status VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, date, project_id)
);

CREATE TABLE IF NOT EXISTS timesheet_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    total_hours NUMERIC(5,2) DEFAULT 0,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, week_start)
);

-- ── 9. CRM ──
CREATE TABLE IF NOT EXISTS crm_people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    company VARCHAR(200),
    position VARCHAR(100),
    type VARCHAR(50) DEFAULT 'contact',
    status VARCHAR(50) DEFAULT 'active',
    source VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    owner_id UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50),
    website VARCHAR(300),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    owner_id UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    title VARCHAR(300) NOT NULL,
    value BIGINT DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'lead',
    probability INTEGER DEFAULT 0,
    person_id UUID REFERENCES crm_people(id),
    org_id UUID REFERENCES crm_organizations(id),
    owner_id UUID REFERENCES members(id),
    expected_close DATE,
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    type VARCHAR(50) DEFAULT 'note',
    title VARCHAR(300),
    description TEXT,
    person_id UUID REFERENCES crm_people(id),
    org_id UUID REFERENCES crm_organizations(id),
    deal_id UUID REFERENCES crm_deals(id),
    performed_by UUID REFERENCES members(id),
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_org_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES crm_organizations(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES crm_people(id) ON DELETE CASCADE,
    role VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    UNIQUE(org_id, person_id)
);

-- ── 10. 마케팅 ──
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    name VARCHAR(300) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    type VARCHAR(50),
    budget BIGINT DEFAULT 0,
    spent BIGINT DEFAULT 0,
    start_date DATE, end_date DATE,
    channel VARCHAR(100),
    target_audience TEXT,
    notes TEXT,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    company VARCHAR(200),
    source VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new',
    score INTEGER DEFAULT 0,
    campaign_id UUID REFERENCES marketing_campaigns(id),
    assigned_to UUID REFERENCES members(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    title VARCHAR(300) NOT NULL,
    type VARCHAR(50) DEFAULT 'post',
    status VARCHAR(50) DEFAULT 'draft',
    channel VARCHAR(50),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    campaign_id UUID REFERENCES marketing_campaigns(id),
    author_id UUID REFERENCES members(id),
    content TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id VARCHAR(50) DEFAULT 'tenone',
    title VARCHAR(300) NOT NULL,
    value BIGINT DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'lead',
    lead_id UUID REFERENCES marketing_leads(id),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    owner_id UUID REFERENCES members(id),
    expected_close DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. 사용자 설정 ──
CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app TEXT NOT NULL DEFAULT 'tenone',
    key TEXT NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, app, key)
);

-- ── 12. RLS 활성화 ──
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_org_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ── 13. RLS 정책 (CREATE IF NOT EXISTS 불가하므로 DROP + CREATE) ──
-- Projects/Jobs/Project Members
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON projects;
    CREATE POLICY "authenticated_read" ON projects FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "projects_write" ON projects;
    CREATE POLICY "projects_write" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON jobs;
    CREATE POLICY "authenticated_read" ON jobs FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "jobs_write" ON jobs;
    CREATE POLICY "jobs_write" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON project_members;
    CREATE POLICY "authenticated_read" ON project_members FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "project_members_write" ON project_members;
    CREATE POLICY "project_members_write" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- Approvals
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON approvals;
    CREATE POLICY "authenticated_read" ON approvals FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_insert" ON approvals;
    CREATE POLICY "authenticated_insert" ON approvals FOR INSERT TO authenticated WITH CHECK (true);
END $$;

-- Posts
DO $$ BEGIN
    DROP POLICY IF EXISTS "posts_read_published" ON posts;
    CREATE POLICY "posts_read_published" ON posts FOR SELECT USING (status = 'published' OR status = 'draft');
    DROP POLICY IF EXISTS "posts_insert" ON posts;
    CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "posts_update" ON posts;
    CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = author_id OR author_type = 'guest' OR auth.jwt()->>'role' = 'admin');
    DROP POLICY IF EXISTS "posts_delete" ON posts;
    CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id OR auth.jwt()->>'role' = 'admin');
END $$;

-- Comments
DO $$ BEGIN
    DROP POLICY IF EXISTS "comments_read" ON comments;
    CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
    DROP POLICY IF EXISTS "comments_insert" ON comments;
    CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
END $$;

-- Attachments/Likes/Bookmarks
DO $$ BEGIN
    DROP POLICY IF EXISTS "attachments_read" ON attachments;
    CREATE POLICY "attachments_read" ON attachments FOR SELECT USING (true);
    DROP POLICY IF EXISTS "attachments_insert" ON attachments;
    CREATE POLICY "attachments_insert" ON attachments FOR INSERT WITH CHECK (true);
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "likes_read" ON likes;
    CREATE POLICY "likes_read" ON likes FOR SELECT USING (true);
    DROP POLICY IF EXISTS "likes_insert" ON likes;
    CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "likes_delete" ON likes;
    CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "bookmarks_read" ON bookmarks;
    CREATE POLICY "bookmarks_read" ON bookmarks FOR SELECT USING (true);
    DROP POLICY IF EXISTS "bookmarks_insert" ON bookmarks;
    CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "bookmarks_delete" ON bookmarks;
    CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Board Configs
DO $$ BEGIN
    DROP POLICY IF EXISTS "board_configs_read" ON board_configs;
    CREATE POLICY "board_configs_read" ON board_configs FOR SELECT USING (true);
END $$;

-- Events/Contents/Courses/Enrollments
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON events;
    CREATE POLICY "authenticated_read" ON events FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_read" ON contents;
    CREATE POLICY "authenticated_read" ON contents FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "public_read_contents" ON contents;
    CREATE POLICY "public_read_contents" ON contents FOR SELECT TO anon USING (status = 'published');
    DROP POLICY IF EXISTS "authenticated_read" ON courses;
    CREATE POLICY "authenticated_read" ON courses FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_read" ON enrollments;
    CREATE POLICY "authenticated_read" ON enrollments FOR SELECT TO authenticated USING (true);
END $$;

-- Library
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON library_items;
    CREATE POLICY "authenticated_read" ON library_items FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_read" ON library_bookmarks;
    CREATE POLICY "authenticated_read" ON library_bookmarks FOR SELECT TO authenticated USING (true);
END $$;

-- Notifications
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON notifications;
    CREATE POLICY "authenticated_read" ON notifications FOR SELECT TO authenticated USING (auth.uid() = (SELECT auth_id FROM members WHERE id = member_id));
END $$;

-- Point Logs
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON point_logs;
    CREATE POLICY "authenticated_read" ON point_logs FOR SELECT TO authenticated USING (true);
END $$;

-- CRM (전체 접근)
DO $$ BEGIN
    DROP POLICY IF EXISTS "crm_people_all" ON crm_people;
    CREATE POLICY "crm_people_all" ON crm_people FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "crm_orgs_all" ON crm_organizations;
    CREATE POLICY "crm_orgs_all" ON crm_organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "crm_deals_all" ON crm_deals;
    CREATE POLICY "crm_deals_all" ON crm_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "crm_activities_all" ON crm_activities;
    CREATE POLICY "crm_activities_all" ON crm_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "crm_org_contacts_all" ON crm_org_contacts;
    CREATE POLICY "crm_org_contacts_all" ON crm_org_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- Marketing
DO $$ BEGIN
    DROP POLICY IF EXISTS "auth read campaigns" ON marketing_campaigns;
    CREATE POLICY "auth read campaigns" ON marketing_campaigns FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "auth write campaigns" ON marketing_campaigns;
    CREATE POLICY "auth write campaigns" ON marketing_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "auth read leads" ON marketing_leads;
    CREATE POLICY "auth read leads" ON marketing_leads FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "auth write leads" ON marketing_leads;
    CREATE POLICY "auth write leads" ON marketing_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "auth read content" ON marketing_content;
    CREATE POLICY "auth read content" ON marketing_content FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "auth write content" ON marketing_content;
    CREATE POLICY "auth write content" ON marketing_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "auth read deals" ON marketing_deals;
    CREATE POLICY "auth read deals" ON marketing_deals FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "auth write deals" ON marketing_deals;
    CREATE POLICY "auth write deals" ON marketing_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

-- User Settings (본인만)
DO $$ BEGIN
    DROP POLICY IF EXISTS "users read own settings" ON user_settings;
    CREATE POLICY "users read own settings" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "users write own settings" ON user_settings;
    CREATE POLICY "users write own settings" ON user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;

-- Timesheets
DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON timesheets;
    CREATE POLICY "authenticated_read" ON timesheets FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_insert" ON timesheets;
    CREATE POLICY "authenticated_insert" ON timesheets FOR INSERT TO authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_read" ON timesheet_weeks;
    CREATE POLICY "authenticated_read" ON timesheet_weeks FOR SELECT TO authenticated USING (true);
END $$;

-- ── 14. Functions & Triggers ──
CREATE OR REPLACE FUNCTION increment_post_view(p_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts SET view_count = view_count + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'active') WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id AND status = 'active') WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE posts SET comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'active') WHERE id = NEW.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_comment_count ON comments;
CREATE TRIGGER trigger_sync_comment_count AFTER INSERT OR UPDATE OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION sync_comment_count();

CREATE OR REPLACE FUNCTION sync_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = NEW.target_id) WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE comments SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = NEW.target_id) WHERE id = NEW.target_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = OLD.target_id) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE comments SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = OLD.target_id) WHERE id = OLD.target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_like_count ON likes;
CREATE TRIGGER trigger_sync_like_count AFTER INSERT OR DELETE ON likes FOR EACH ROW EXECUTE FUNCTION sync_like_count();

CREATE OR REPLACE FUNCTION sync_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET bookmark_count = (SELECT COUNT(*) FROM bookmarks WHERE post_id = NEW.post_id) WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET bookmark_count = (SELECT COUNT(*) FROM bookmarks WHERE post_id = OLD.post_id) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_bookmark_count ON bookmarks;
CREATE TRIGGER trigger_sync_bookmark_count AFTER INSERT OR DELETE ON bookmarks FOR EACH ROW EXECUTE FUNCTION sync_bookmark_count();

-- ── 15. 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(site, board);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_member_date ON timesheets(member_id, date);
CREATE INDEX IF NOT EXISTS idx_user_settings_lookup ON user_settings(user_id, app, key);
CREATE INDEX IF NOT EXISTS idx_crm_people_brand ON crm_people(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_brand ON crm_deals(brand_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_brand ON marketing_campaigns(brand_id);

-- ✅ 완료! Prod DB 테이블 + RLS + 함수 + 인덱스 생성 끝

-- =============================================
-- Dev DB Setup PART 1: Core Tables
-- Supabase SQL Editor에 붙여넣기 → Run
-- =============================================

-- ── ENUM 타입 ──
CREATE TYPE account_type AS ENUM ('staff', 'partner', 'junior-partner', 'crew', 'member');
CREATE TYPE project_type AS ENUM ('community', 'client', 'internal');
CREATE TYPE project_status AS ENUM ('draft', 'pending', 'approved', 'in-progress', 'completed', 'cancelled');
CREATE TYPE job_type AS ENUM ('PR', 'ME', 'PT');
CREATE TYPE job_detail AS ENUM ('PL', 'DO', 'RE');
CREATE TYPE job_status AS ENUM ('todo', 'in-progress', 'review', 'done');
CREATE TYPE approval_status AS ENUM ('pending', 'in-progress', 'approved', 'rejected');
CREATE TYPE approval_factor AS ENUM ('general', 'project', 'timesheet', 'expense', 'purchase', 'hr', 'contract');
CREATE TYPE board_type AS ENUM ('notice', 'free', 'qna');
CREATE TYPE visibility_type AS ENUM ('all', 'staff', 'partner_up', 'crew_up', 'admin');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_channel AS ENUM ('works', 'newsroom', 'blog');
CREATE TYPE course_category AS ENUM ('required', 'professional', 'advanced');
CREATE TYPE enrollment_status AS ENUM ('not-started', 'in-progress', 'quiz', 'completed');
CREATE TYPE point_grade AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');

-- ── MEMBERS ──
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_type account_type NOT NULL DEFAULT 'member',
    phone VARCHAR(20),
    avatar_url TEXT,
    avatar_initials VARCHAR(5),
    bio TEXT,
    company VARCHAR(200),
    position VARCHAR(100),
    role VARCHAR(50) DEFAULT 'Viewer',
    groups TEXT[] DEFAULT '{}',
    origin_site VARCHAR(50) DEFAULT 'tenone.biz',
    skills TEXT[] DEFAULT '{}',
    system_access TEXT[] DEFAULT '{}',
    department VARCHAR(100),
    employee_id VARCHAR(20),
    brand_access TEXT[] DEFAULT '{}',
    total_points INTEGER DEFAULT 0,
    grade point_grade DEFAULT 'Bronze',
    newsletter_subscribed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- ── PROJECTS ──
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    type project_type NOT NULL,
    sub_type VARCHAR(50),
    status project_status DEFAULT 'draft',
    description TEXT,
    brand VARCHAR(50),
    pm_id UUID REFERENCES members(id),
    start_date DATE,
    end_date DATE,
    billing DECIMAL(15,2) DEFAULT 0,
    external_cost DECIMAL(15,2) DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    internal_cost DECIMAL(15,2) DEFAULT 0,
    profit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES members(id)
);

-- ── JOBS ──
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(200),
    type job_type NOT NULL,
    detail job_detail NOT NULL,
    seq INTEGER NOT NULL,
    status job_status DEFAULT 'todo',
    estimated_hours DECIMAL(6,1) DEFAULT 0,
    actual_hours DECIMAL(6,1) DEFAULT 0,
    estimated_amount DECIMAL(12,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECT_MEMBERS ──
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    member_id UUID REFERENCES members(id),
    role VARCHAR(100),
    hours_planned DECIMAL(6,1) DEFAULT 0,
    hours_actual DECIMAL(6,1) DEFAULT 0,
    rate_per_hour DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── APPROVALS ──
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_no VARCHAR(20) UNIQUE NOT NULL,
    factor approval_factor NOT NULL,
    title VARCHAR(300) NOT NULL,
    content JSONB DEFAULT '{}',
    status approval_status DEFAULT 'pending',
    requester_id UUID REFERENCES members(id),
    approval_line JSONB DEFAULT '[]',
    source_id UUID,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOARD_CONFIGS ──
CREATE TABLE IF NOT EXISTS board_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site TEXT NOT NULL,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    categories JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(site, slug)
);

-- ── POSTS (게시판 시스템용 — 멀티사이트) ──
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site TEXT NOT NULL,
    board TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    excerpt TEXT DEFAULT '',
    category TEXT DEFAULT '',
    tags JSONB DEFAULT '[]',
    represent_image TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'published'
        CHECK (status IN ('published', 'draft', 'hidden', 'deleted')),
    author_type TEXT NOT NULL DEFAULT 'member'
        CHECK (author_type IN ('member', 'guest', 'admin', 'agent')),
    author_id UUID,
    guest_nickname TEXT,
    guest_password TEXT,
    guest_email TEXT,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    bookmark_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ── COMMENTS ──
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_type TEXT NOT NULL DEFAULT 'member'
        CHECK (author_type IN ('member', 'guest')),
    author_id UUID,
    guest_nickname TEXT,
    guest_password TEXT,
    like_count INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'hidden', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── ATTACHMENTS ──
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    filesize INT DEFAULT 0,
    mimetype TEXT DEFAULT '',
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── LIKES ──
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, target_type, target_id)
);

-- ── BOOKMARKS ──
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- ── EVENTS ──
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    event_type VARCHAR(50) DEFAULT '일반',
    location VARCHAR(300),
    visibility visibility_type DEFAULT 'all',
    source VARCHAR(50) DEFAULT 'townity',
    source_id UUID,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTENTS (CMS) ──
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel content_channel NOT NULL,
    brand VARCHAR(50),
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE,
    summary TEXT,
    body TEXT,
    thumbnail_url TEXT,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    status content_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    author_id UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COURSES & ENROLLMENTS ──
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    category course_category NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}',
    quiz JSONB DEFAULT '[]',
    pass_score INTEGER DEFAULT 80,
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    course_id UUID REFERENCES courses(id),
    status enrollment_status DEFAULT 'not-started',
    quiz_score INTEGER,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, course_id)
);

-- ── LIBRARY ──
CREATE TABLE library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    source VARCHAR(50) DEFAULT 'wiki',
    format VARCHAR(20) DEFAULT 'PDF',
    file_url TEXT,
    file_size VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES members(id),
    permission VARCHAR(20) DEFAULT 'all',
    project_code VARCHAR(20),
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE library_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
    source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, item_id)
);

-- ── NOTIFICATIONS ──
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    type VARCHAR(50),
    title VARCHAR(300),
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── POINT LOGS ──
CREATE TABLE point_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    points INTEGER NOT NULL,
    reason VARCHAR(200) NOT NULL,
    source_type VARCHAR(50),
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── NEWSLETTER SUBSCRIBERS ──
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    source VARCHAR(50) DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- ── TIMESHEETS ──
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    project_id UUID REFERENCES projects(id),
    job_id UUID REFERENCES jobs(id),
    work_date DATE NOT NULL,
    hours DECIMAL(4,1) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, job_id, work_date)
);

CREATE TABLE timesheet_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    week_start DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES members(id),
    UNIQUE(member_id, week_start)
);

-- ── CRM PEOPLE ──
CREATE TABLE IF NOT EXISTS crm_people (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type TEXT NOT NULL DEFAULT 'Other'
        CHECK (type IN ('Student','Professional','Mentor','Partner','Client','Vendor','Other')),
    status TEXT NOT NULL DEFAULT 'Lead'
        CHECK (status IN ('Active','Lead','Inactive','Alumni')),
    company TEXT,
    position TEXT,
    avatar_initials TEXT,
    brand_association TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT '',
    cohort TEXT,
    last_contacted TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── CRM ORGANIZATIONS ──
CREATE TABLE IF NOT EXISTS crm_organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Partner'
        CHECK (type IN ('Partner','Client','Vendor','Sponsor')),
    industry TEXT,
    website TEXT,
    brand_association TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active','Inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── CRM DEALS ──
CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    title TEXT NOT NULL,
    organization_id UUID REFERENCES crm_organizations(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES crm_people(id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'Lead'
        CHECK (stage IN ('Lead','Contacted','Proposal','Negotiation','Won','Lost')),
    value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── CRM ACTIVITIES ──
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id TEXT NOT NULL DEFAULT 'tenone',
    type TEXT NOT NULL DEFAULT 'Note'
        CHECK (type IN ('Meeting','Call','Email','Note','Event')),
    title TEXT NOT NULL,
    description TEXT,
    person_id UUID REFERENCES crm_people(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES crm_organizations(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── CRM ORG-CONTACT JOIN ──
CREATE TABLE IF NOT EXISTS crm_org_contacts (
    organization_id UUID REFERENCES crm_organizations(id) ON DELETE CASCADE,
    person_id UUID REFERENCES crm_people(id) ON DELETE CASCADE,
    PRIMARY KEY (organization_id, person_id)
);

-- ── MARKETING CAMPAIGNS ──
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Brand',
    status TEXT NOT NULL DEFAULT 'Draft',
    brand_id TEXT,
    description TEXT,
    budget NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    kpi TEXT,
    assignee TEXT,
    start_date DATE,
    end_date DATE,
    channels TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MARKETING LEADS ──
CREATE TABLE IF NOT EXISTS marketing_leads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    stage TEXT NOT NULL DEFAULT 'New',
    source TEXT DEFAULT 'Direct',
    value NUMERIC DEFAULT 0,
    assignee TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MARKETING CONTENT ──
CREATE TABLE IF NOT EXISTS marketing_content (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Article',
    status TEXT NOT NULL DEFAULT 'Draft',
    channel TEXT,
    brand_id TEXT,
    assignee TEXT,
    publish_date DATE,
    engagement INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MARKETING DEALS ──
CREATE TABLE IF NOT EXISTS marketing_deals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_id TEXT REFERENCES marketing_leads(id),
    title TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'Discovery',
    assignee TEXT,
    close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER SETTINGS ──
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

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_members_account_type ON members(account_type);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_pm ON projects(pm_id);
CREATE INDEX idx_jobs_project ON jobs(project_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_requester ON approvals(requester_id);
CREATE INDEX idx_notifications_member ON notifications(member_id);
CREATE INDEX idx_timesheets_member_date ON timesheets(member_id, work_date);
CREATE INDEX idx_library_source ON library_items(source);
CREATE INDEX idx_contents_channel ON contents(channel);
CREATE INDEX idx_enrollments_member ON enrollments(member_id);

CREATE INDEX IF NOT EXISTS idx_posts_site_board ON posts(site, board);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_site_board_status ON posts(site, board, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_attachments_post ON attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_crm_people_brand ON crm_people(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_people_type ON crm_people(type);
CREATE INDEX IF NOT EXISTS idx_crm_people_status ON crm_people(status);
CREATE INDEX IF NOT EXISTS idx_crm_orgs_brand ON crm_organizations(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_brand ON crm_deals(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_activities_brand ON crm_activities(brand_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_person ON crm_activities(person_id);

CREATE INDEX IF NOT EXISTS idx_mk_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mk_leads_stage ON marketing_leads(stage);
CREATE INDEX IF NOT EXISTS idx_mk_content_status ON marketing_content(status);
CREATE INDEX IF NOT EXISTS idx_mk_deals_stage ON marketing_deals(stage);

CREATE INDEX IF NOT EXISTS idx_user_settings_lookup ON user_settings(user_id, app, key);

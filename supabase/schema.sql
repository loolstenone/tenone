-- ============================================
-- TenOne DB Schema v1.0
-- Supabase SQL Editor에서 실행
-- ============================================

-- 0. ENUM 타입 생성
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

-- ============================================
-- 1. MEMBERS (통합 회원)
-- ============================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_type account_type NOT NULL DEFAULT 'member',

    -- 프로필
    phone VARCHAR(20),
    avatar_url TEXT,
    avatar_initials VARCHAR(5),
    bio TEXT,
    company VARCHAR(200),
    position VARCHAR(100),

    -- 그룹/역할
    role VARCHAR(50) DEFAULT 'Viewer',
    groups TEXT[] DEFAULT '{}',
    origin_site VARCHAR(50) DEFAULT 'tenone.biz',
    skills TEXT[] DEFAULT '{}',

    -- Staff 전용
    system_access TEXT[] DEFAULT '{}',
    department VARCHAR(100),
    employee_id VARCHAR(20),
    brand_access TEXT[] DEFAULT '{}',

    -- 포인트
    total_points INTEGER DEFAULT 0,
    grade point_grade DEFAULT 'Bronze',

    -- 뉴스레터
    newsletter_subscribed BOOLEAN DEFAULT false,

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- 2. PROJECTS
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    type project_type NOT NULL,
    sub_type VARCHAR(50),
    status project_status DEFAULT 'draft',
    description TEXT,

    -- 관계
    brand VARCHAR(50),
    pm_id UUID REFERENCES members(id),

    -- 일정
    start_date DATE,
    end_date DATE,

    -- 손익 (원 단위)
    billing DECIMAL(15,2) DEFAULT 0,
    external_cost DECIMAL(15,2) DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    internal_cost DECIMAL(15,2) DEFAULT 0,
    profit DECIMAL(15,2) DEFAULT 0,

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES members(id)
);

-- ============================================
-- 3. JOBS
-- ============================================
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

-- ============================================
-- 4. PROJECT_MEMBERS (투입 인원)
-- ============================================
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

-- ============================================
-- 5. APPROVALS (결재)
-- ============================================
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

-- ============================================
-- 6. POSTS (커뮤니티 게시글)
-- ============================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board board_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT,
    author_id UUID REFERENCES members(id),
    visibility visibility_type DEFAULT 'all',
    badge VARCHAR(50),
    is_pinned BOOLEAN DEFAULT false,
    notice_start DATE,
    notice_end DATE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 댓글
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES members(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. EVENTS (일정)
-- ============================================
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

-- ============================================
-- 8. CONTENTS (CMS)
-- ============================================
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

-- ============================================
-- 9. COURSES & ENROLLMENTS (교육)
-- ============================================
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

-- ============================================
-- 10. LIBRARY (라이브러리)
-- ============================================
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

-- ============================================
-- 11. NOTIFICATIONS (알림)
-- ============================================
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

-- ============================================
-- 12. POINT LOGS (포인트 이력)
-- ============================================
CREATE TABLE point_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    points INTEGER NOT NULL,
    reason VARCHAR(200) NOT NULL,
    source_type VARCHAR(50),
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. NEWSLETTER SUBSCRIBERS (비회원 구독자)
-- ============================================
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    source VARCHAR(50) DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- ============================================
-- 14. TIMESHEETS
-- ============================================
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

-- ============================================
-- 15. INDEXES
-- ============================================
CREATE INDEX idx_members_account_type ON members(account_type);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_pm ON projects(pm_id);
CREATE INDEX idx_jobs_project ON jobs(project_id);
CREATE INDEX idx_posts_board ON posts(board);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_requester ON approvals(requester_id);
CREATE INDEX idx_notifications_member ON notifications(member_id);
CREATE INDEX idx_timesheets_member_date ON timesheets(member_id, work_date);
CREATE INDEX idx_library_source ON library_items(source);
CREATE INDEX idx_contents_channel ON contents(channel);
CREATE INDEX idx_enrollments_member ON enrollments(member_id);

-- ============================================
-- 16. RLS (Row Level Security)
-- ============================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
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

-- 기본 RLS 정책: 인증된 사용자는 읽기 가능
CREATE POLICY "authenticated_read" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON contents FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON library_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON library_bookmarks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON notifications FOR SELECT TO authenticated USING (auth.uid() = (SELECT auth_id FROM members WHERE id = member_id));
CREATE POLICY "authenticated_read" ON point_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON timesheets FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON timesheet_weeks FOR SELECT TO authenticated USING (true);

-- 공개 콘텐츠 (비인증 사용자도 읽기 가능)
CREATE POLICY "public_read_contents" ON contents FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "public_read_newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);

-- 인증 사용자 쓰기 정책
CREATE POLICY "authenticated_insert" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_insert" ON post_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_insert" ON approvals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_insert" ON timesheets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_insert" ON library_bookmarks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON members FOR UPDATE TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "authenticated_delete_bookmarks" ON library_bookmarks FOR DELETE TO authenticated USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

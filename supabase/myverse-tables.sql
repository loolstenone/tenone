-- myverse_profiles (ME tab)
CREATE TABLE IF NOT EXISTS myverse_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    display_name TEXT,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    values_text TEXT,
    strengths TEXT,
    weaknesses TEXT,
    mbti TEXT,
    one_char TEXT, -- 1인 1글자
    mood TEXT, -- 오늘 기분
    cover_image TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_logs (LOG tab - 일상 기록)
CREATE TABLE IF NOT EXISTS myverse_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    log_type TEXT NOT NULL DEFAULT 'text', -- text, photo, emotion, link, creation
    content TEXT,
    image_url TEXT,
    emotion TEXT, -- emoji or keyword
    tags TEXT[] DEFAULT '{}',
    visibility TEXT DEFAULT 'private', -- private, shared, public
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_dreams (DREAM tab - 목표)
CREATE TABLE IF NOT EXISTS myverse_dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    dream_type TEXT NOT NULL DEFAULT 'year', -- life, year, quarter, month
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- active, completed, paused
    progress INT DEFAULT 0, -- 0-100
    parent_id UUID REFERENCES myverse_dreams(id),
    target_date DATE,
    result TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_tasks (PLAN/WORK tab)
CREATE TABLE IF NOT EXISTS myverse_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo', -- todo, doing, done
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    due_date DATE,
    scheduled_at TIMESTAMPTZ, -- 타임박싱
    dream_id UUID REFERENCES myverse_dreams(id),
    project_id UUID,
    orbi_project_id UUID, -- Orbi 연동
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_projects (WORK tab - 개인 프로젝트)
CREATE TABLE IF NOT EXISTS myverse_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- active, completed, paused
    dream_id UUID REFERENCES myverse_dreams(id),
    orbi_tenant_id UUID, -- Orbi 조직 연동 시
    orbi_project_id UUID, -- Orbi 프로젝트 연동 시
    color TEXT DEFAULT '#6366F1',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_ai_chats (AI tab)
CREATE TABLE IF NOT EXISTS myverse_ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_social_shares (LOG 소셜 공유 - Hootsuite 스타일)
CREATE TABLE IF NOT EXISTS myverse_social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    log_id UUID REFERENCES myverse_logs(id),
    platform TEXT NOT NULL, -- instagram, linkedin, x, youtube, blog
    content TEXT, -- 플랫폼용으로 다듬은 내용
    caption TEXT,
    status TEXT DEFAULT 'draft', -- draft, scheduled, published, failed
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    published_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- myverse_reviews (AI 주간/월간 리뷰)
CREATE TABLE IF NOT EXISTS myverse_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    review_type TEXT NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    period_start DATE,
    period_end DATE,
    summary TEXT,
    insights JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE myverse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE myverse_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies (user can only access own data)
CREATE POLICY "myverse_profiles_own" ON myverse_profiles FOR ALL USING (true);
CREATE POLICY "myverse_logs_own" ON myverse_logs FOR ALL USING (true);
CREATE POLICY "myverse_dreams_own" ON myverse_dreams FOR ALL USING (true);
CREATE POLICY "myverse_tasks_own" ON myverse_tasks FOR ALL USING (true);
CREATE POLICY "myverse_projects_own" ON myverse_projects FOR ALL USING (true);
CREATE POLICY "myverse_ai_chats_own" ON myverse_ai_chats FOR ALL USING (true);
CREATE POLICY "myverse_social_shares_own" ON myverse_social_shares FOR ALL USING (true);
CREATE POLICY "myverse_reviews_own" ON myverse_reviews FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_myverse_logs_user ON myverse_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_myverse_tasks_user ON myverse_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_myverse_dreams_user ON myverse_dreams(user_id, dream_type);
CREATE INDEX IF NOT EXISTS idx_myverse_ai_chats_user ON myverse_ai_chats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_myverse_shares_user ON myverse_social_shares(user_id, status);

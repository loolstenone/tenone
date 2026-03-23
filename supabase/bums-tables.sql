-- ============================================
-- CMS 멀티사이트 테이블 스키마
-- Supabase SQL Editor에서 실행
-- ============================================

-- 0. ENUM 타입
CREATE TYPE cms_site_type AS ENUM ('internal', 'brand', 'external');
CREATE TYPE cms_site_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE cms_board_type AS ENUM ('general', 'notice', 'gallery', 'video', 'faq', 'qna', 'commerce', 'recruit', 'event');
CREATE TYPE cms_skin_type AS ENUM ('list', 'card', 'gallery', 'video');
CREATE TYPE cms_board_visibility AS ENUM ('public', 'intra', 'staff');
CREATE TYPE cms_post_status AS ENUM ('draft', 'published', 'scheduled', 'private', 'archived');
CREATE TYPE cms_permission AS ENUM ('all', 'member', 'intra', 'staff', 'admin');
CREATE TYPE cms_widget_style AS ENUM ('list', 'card', 'thumbnail');
CREATE TYPE cms_widget_sort AS ENUM ('latest', 'views', 'recommended');
CREATE TYPE cms_role AS ENUM ('admin', 'editor', 'contributor');

-- ============================================
-- 1. CMS_SITES (사이트 관리)
-- ============================================
CREATE TABLE cms_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(200),
    description TEXT,
    brand_id VARCHAR(50),              -- site-config.ts의 SiteIdentifier와 매칭
    site_type cms_site_type DEFAULT 'brand',
    status cms_site_status DEFAULT 'active',

    -- 브랜딩
    logo_url TEXT,
    favicon_url TEXT,
    og_image_url TEXT,
    colors JSONB DEFAULT '{}',         -- {primary, accent, headerBg, footerBg, ...}

    -- SEO 메타
    meta_title VARCHAR(300),
    meta_description TEXT,
    meta_keywords TEXT[] DEFAULT '{}',

    -- 메뉴 (JSON 배열)
    nav_items JSONB DEFAULT '[]',      -- [{name, href, children?}]
    footer_links JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CMS_BOARDS (게시판)
-- ============================================
CREATE TABLE cms_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES cms_sites(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    board_type cms_board_type DEFAULT 'general',
    skin_type cms_skin_type DEFAULT 'list',
    visibility cms_board_visibility DEFAULT 'public',
    description TEXT,

    -- 권한
    list_permission cms_permission DEFAULT 'all',
    read_permission cms_permission DEFAULT 'all',
    write_permission cms_permission DEFAULT 'member',
    comment_permission cms_permission DEFAULT 'member',

    -- 옵션
    allow_comments BOOLEAN DEFAULT true,
    allow_attachments BOOLEAN DEFAULT true,
    allow_secret BOOLEAN DEFAULT false,
    categories JSONB DEFAULT '[]',     -- [{id, name, slug}]
    options JSONB DEFAULT '{}',        -- 기타 설정
    design JSONB DEFAULT '{}',         -- 디자인 설정

    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(site_id, slug)
);

-- ============================================
-- 3. CMS_POSTS (게시글)
-- ============================================
CREATE TABLE cms_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES cms_boards(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES cms_sites(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500),
    summary TEXT,
    body TEXT,
    status cms_post_status DEFAULT 'draft',
    category_id VARCHAR(100),

    -- 플래그
    is_pinned BOOLEAN DEFAULT false,
    is_recommended BOOLEAN DEFAULT false,
    is_secret BOOLEAN DEFAULT false,

    -- 작성자
    author_id UUID REFERENCES members(id),
    author_name VARCHAR(100),

    -- 미디어
    image TEXT,                        -- 대표 이미지 URL
    attachments JSONB DEFAULT '[]',    -- [{name, url, size, type}]
    tags TEXT[] DEFAULT '{}',

    -- SEO (게시글별 OG)
    og_title VARCHAR(300),
    og_description TEXT,
    og_image TEXT,

    -- 타입별 추가 필드 (유연하게 JSONB)
    extra_fields JSONB DEFAULT '{}',   -- recruit/event/video/commerce 전용 필드

    -- 통계
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,

    -- 일정
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CMS_COMMENTS (댓글)
-- ============================================
CREATE TABLE cms_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES cms_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES cms_comments(id) ON DELETE CASCADE,
    author_id UUID REFERENCES members(id),
    author_name VARCHAR(100),
    body TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'published',  -- published, hidden, reported
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CMS_WIDGETS (위젯)
-- ============================================
CREATE TABLE cms_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES cms_sites(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    board_id UUID NOT NULL REFERENCES cms_boards(id) ON DELETE CASCADE,
    display_count INTEGER DEFAULT 5,
    display_style cms_widget_style DEFAULT 'list',
    sort_by cms_widget_sort DEFAULT 'latest',
    show_date BOOLEAN DEFAULT true,
    show_author BOOLEAN DEFAULT true,
    show_image BOOLEAN DEFAULT false,
    placement VARCHAR(100),            -- 위젯 배치 위치 (예: 'homepage-sidebar')
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CMS_MEMBER_ACCESS (멤버별 CMS 권한)
-- ============================================
CREATE TABLE cms_member_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    cms_role cms_role NOT NULL DEFAULT 'contributor',
    site_access UUID[] DEFAULT '{}',   -- 접근 가능한 cms_sites.id 배열
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id)
);

-- ============================================
-- 7. INDEXES
-- ============================================
CREATE INDEX idx_cms_boards_site ON cms_boards(site_id);
CREATE INDEX idx_cms_posts_board ON cms_posts(board_id);
CREATE INDEX idx_cms_posts_site ON cms_posts(site_id);
CREATE INDEX idx_cms_posts_status ON cms_posts(status);
CREATE INDEX idx_cms_posts_published ON cms_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_cms_posts_author ON cms_posts(author_id);
CREATE INDEX idx_cms_comments_post ON cms_comments(post_id);
CREATE INDEX idx_cms_widgets_site ON cms_widgets(site_id);
CREATE INDEX idx_cms_widgets_board ON cms_widgets(board_id);
CREATE INDEX idx_cms_member_access_member ON cms_member_access(member_id);

-- ============================================
-- 8. RLS (Row Level Security)
-- ============================================
ALTER TABLE cms_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_member_access ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: 발행된 콘텐츠는 누구나
CREATE POLICY "public_read_sites" ON cms_sites FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "public_read_boards" ON cms_boards FOR SELECT TO anon USING (visibility = 'public');
CREATE POLICY "public_read_posts" ON cms_posts FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "public_read_comments" ON cms_comments FOR SELECT TO anon USING (status = 'published');

-- 인증 사용자: 전체 읽기
CREATE POLICY "auth_read_sites" ON cms_sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_boards" ON cms_boards FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_posts" ON cms_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_comments" ON cms_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_widgets" ON cms_widgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_access" ON cms_member_access FOR SELECT TO authenticated USING (true);

-- 인증 사용자: 쓰기 (권한 체크는 앱 레벨)
CREATE POLICY "auth_insert_posts" ON cms_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_posts" ON cms_posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_posts" ON cms_posts FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_insert_comments" ON cms_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_manage_sites" ON cms_sites FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_manage_boards" ON cms_boards FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_manage_widgets" ON cms_widgets FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_manage_access" ON cms_member_access FOR ALL TO authenticated USING (true);

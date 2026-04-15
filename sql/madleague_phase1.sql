-- ============================================================
-- MADLeague Phase 1 — DB 스키마 (8개 테이블 + RLS + 시드)
-- 작성일: 2026-04-16
-- 원칙:
--   - 접두사 mad_* (MADLeague 브랜드 전용)
--   - 8원칙 #6: 모든 테이블 tenant_id TEXT DEFAULT 'tenone'
--   - 퍼블릭 읽기 허용(anon SELECT), 쓰기는 service_role/authenticated
--   - 지원/상담 폼은 anon INSERT 허용 (SELECT/UPDATE는 서비스롤)
-- ============================================================

-- ============================================================
-- 1. mad_clubs — 동아리 (7개 시드)
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  color TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','preparing','dormant')),
  established_year INTEGER,
  joined_madleague_year INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_clubs_tenant ON mad_clubs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_clubs_status ON mad_clubs(status);

-- ============================================================
-- 2. mad_cohorts — 활동연도 + 기수
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  club_id UUID NOT NULL REFERENCES mad_clubs(id) ON DELETE CASCADE,
  cohort_number INTEGER,
  year INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('recruiting','active','completed')),
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_cohorts_tenant ON mad_cohorts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_cohorts_club_year ON mad_cohorts(club_id, year);

-- ============================================================
-- 3. mad_competitions — 경쟁PT
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  brief_title TEXT,
  brief_content TEXT,
  client_name TEXT,
  client_logo_url TEXT,
  cover_url TEXT,
  start_date DATE,
  end_date DATE,
  presentation_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_competitions_tenant ON mad_competitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_competitions_year ON mad_competitions(year);
CREATE INDEX IF NOT EXISTS idx_mad_competitions_status ON mad_competitions(status);

-- ============================================================
-- 4. mad_competition_results — 결과 + MAD Crown
-- (Phase 1: team_id는 FK 없이 UUID. Phase 2에서 mad_competition_teams 생성 시 FK 추가)
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_competition_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  competition_id UUID NOT NULL REFERENCES mad_competitions(id) ON DELETE CASCADE,
  team_id UUID,
  team_name TEXT NOT NULL,
  club_id UUID REFERENCES mad_clubs(id),
  rank INTEGER,
  is_crown BOOLEAN NOT NULL DEFAULT false,
  award_name TEXT,
  thumbnail_url TEXT,
  feedback TEXT,
  judges JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_results_tenant ON mad_competition_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_results_comp ON mad_competition_results(competition_id);
CREATE INDEX IF NOT EXISTS idx_mad_results_club ON mad_competition_results(club_id);
CREATE INDEX IF NOT EXISTS idx_mad_results_crown ON mad_competition_results(is_crown) WHERE is_crown = true;

-- ============================================================
-- 5. mad_archive — 2023~현재 작품 아카이브
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('competition','project','markethon','insight_touring','im','dam')),
  club_id UUID REFERENCES mad_clubs(id) ON DELETE SET NULL,
  competition_id UUID REFERENCES mad_competitions(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  thumbnail_url TEXT,
  media JSONB,
  award TEXT,
  tags TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_archive_tenant ON mad_archive(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_archive_year ON mad_archive(year);
CREATE INDEX IF NOT EXISTS idx_mad_archive_type ON mad_archive(type);
CREATE INDEX IF NOT EXISTS idx_mad_archive_club ON mad_archive(club_id);
CREATE INDEX IF NOT EXISTS idx_mad_archive_featured ON mad_archive(is_featured) WHERE is_featured = true;

-- ============================================================
-- 6. mad_articles — MADzine
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('interview','case','report','cover','news')),
  club_id UUID REFERENCES mad_clubs(id) ON DELETE SET NULL,
  author_name TEXT,
  author_avatar_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  year INTEGER,
  likes_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_articles_tenant ON mad_articles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_articles_category ON mad_articles(category);
CREATE INDEX IF NOT EXISTS idx_mad_articles_club ON mad_articles(club_id);
CREATE INDEX IF NOT EXISTS idx_mad_articles_published ON mad_articles(is_published, published_at DESC);

-- ============================================================
-- 7. mad_applications — 지원서
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  club_id UUID REFERENCES mad_clubs(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  university TEXT NOT NULL,
  major TEXT,
  year_in_school INTEGER,
  motivation TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','accepted','rejected','withdrawn')),
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_apps_tenant ON mad_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_apps_status ON mad_applications(status);
CREATE INDEX IF NOT EXISTS idx_mad_apps_club_year ON mad_applications(club_id, year);

-- ============================================================
-- 8. mad_hero_applications — HeRo 커리어 상담 신청
-- ============================================================
CREATE TABLE IF NOT EXISTS mad_hero_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  user_id UUID,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  interests TEXT[],
  resume_url TEXT,
  portfolio_url TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','matched','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mad_hero_tenant ON mad_hero_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mad_hero_status ON mad_hero_applications(status);

-- ============================================================
-- RLS (Row Level Security)
-- 퍼블릭 열람 가능 테이블: clubs, cohorts, competitions, results, archive, articles(published)
-- 폼 수집 테이블: applications, hero_applications → anon INSERT 허용
-- ============================================================

ALTER TABLE mad_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_competition_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mad_hero_applications ENABLE ROW LEVEL SECURITY;

-- 퍼블릭 읽기
DROP POLICY IF EXISTS mad_clubs_read ON mad_clubs;
CREATE POLICY mad_clubs_read ON mad_clubs FOR SELECT USING (true);

DROP POLICY IF EXISTS mad_cohorts_read ON mad_cohorts;
CREATE POLICY mad_cohorts_read ON mad_cohorts FOR SELECT USING (true);

DROP POLICY IF EXISTS mad_competitions_read ON mad_competitions;
CREATE POLICY mad_competitions_read ON mad_competitions FOR SELECT USING (true);

DROP POLICY IF EXISTS mad_results_read ON mad_competition_results;
CREATE POLICY mad_results_read ON mad_competition_results FOR SELECT USING (true);

DROP POLICY IF EXISTS mad_archive_read ON mad_archive;
CREATE POLICY mad_archive_read ON mad_archive FOR SELECT USING (true);

-- 아티클: 발행된 것만 퍼블릭 열람
DROP POLICY IF EXISTS mad_articles_read ON mad_articles;
CREATE POLICY mad_articles_read ON mad_articles FOR SELECT USING (is_published = true);

-- 지원서/HeRo 신청: anon INSERT 허용 (폼 제출), SELECT는 본인만 (user_id) or service_role
DROP POLICY IF EXISTS mad_apps_insert ON mad_applications;
CREATE POLICY mad_apps_insert ON mad_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS mad_hero_insert ON mad_hero_applications;
CREATE POLICY mad_hero_insert ON mad_hero_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS mad_hero_read_own ON mad_hero_applications;
CREATE POLICY mad_hero_read_own ON mad_hero_applications FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- 시드: 7개 동아리
-- ============================================================
INSERT INTO mad_clubs (slug, name, region, description, color, status, sort_order)
VALUES
  ('madleap', 'MADLeap', '수도권', '수도권 거점 동아리. 서울·경기·인천 대학생 멤버로 구성.', '#EC1D25', 'active', 1),
  ('pam',     'PAM',     '부산/경남', '부산·경남 거점 동아리. 남부권 광고·마케팅 인재의 허브.', '#0066CC', 'active', 2),
  ('adlle',   'ADlle',   '대구/경북', '대구·경북 거점 동아리. 지역 기반 크리에이티브 도전.', '#FF6B35', 'active', 3),
  ('abc',     'ABC',     '광주/전남', '광주·전남 거점 동아리. 호남권 마케팅 커뮤니티.', '#00A86B', 'active', 4),
  ('suzak',   'SUZAK',   '제주',     '제주 거점 동아리. 섬에서 피어나는 아이디어.', '#FFC000', 'active', 5),
  ('pad',     'P:ad',    '강원',     '강원 거점 동아리. 자연과 크리에이티브의 만남.', '#4A90E2', 'active', 6),
  ('adzone',  'AD Zone', '충청',     '충청 거점 동아리. 중부권 광고·마케팅 도전.', '#9B59B6', 'active', 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ============================================================
-- 시드: 2024/2025 활동연도 (각 동아리별 기본 cohort 1개)
-- ============================================================
INSERT INTO mad_cohorts (club_id, year, status, start_date, end_date)
SELECT c.id, 2025, 'active', '2025-03-01', '2025-12-31'
FROM mad_clubs c
WHERE NOT EXISTS (
  SELECT 1 FROM mad_cohorts ch WHERE ch.club_id = c.id AND ch.year = 2025
);

INSERT INTO mad_cohorts (club_id, year, status, start_date, end_date)
SELECT c.id, 2024, 'completed', '2024-03-01', '2024-12-31'
FROM mad_clubs c
WHERE NOT EXISTS (
  SELECT 1 FROM mad_cohorts ch WHERE ch.club_id = c.id AND ch.year = 2024
);

-- ============================================================
-- 시드: 경쟁PT (Hall of Fame 3건)
-- 2024 지평주조, 2025 대성학원, 2025 리제로스
-- ============================================================
INSERT INTO mad_competitions (slug, title, year, client_name, status, presentation_date)
VALUES
  ('2024-jipyeong', '2024 지평주조 경쟁PT', 2024, '지평주조', 'completed', '2024-11-15'),
  ('2025-daesung',  '2025 대성학원 경쟁PT', 2025, '대성학원', 'completed', '2025-06-20'),
  ('2025-rizeros',  '2025 리제로스 경쟁PT', 2025, '리제로스', 'completed', '2025-11-10')
ON CONFLICT (slug) DO NOTHING;

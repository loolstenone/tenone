-- Badak.biz MVP 테이블 생성
-- Supabase SQL Editor에서 실행

-- 1. 바닥 프로필
CREATE TABLE IF NOT EXISTS badak_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  job_function TEXT NOT NULL,
  industry TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  job_level TEXT NOT NULL,
  company TEXT,
  company_visible BOOLEAN DEFAULT true,
  bio TEXT NOT NULL DEFAULT '',
  looking_for TEXT[] NOT NULL DEFAULT '{}',
  can_offer TEXT[] NOT NULL DEFAULT '{}',
  interest_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 연결 요청
CREATE TABLE IF NOT EXISTS badak_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES badak_profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES badak_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE (requester_id, target_id)
);

-- 3. 만남 피드백
CREATE TABLE IF NOT EXISTS badak_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES badak_connections(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES badak_profiles(id) ON DELETE CASCADE,
  was_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (connection_id, giver_id)
);

-- 4. 이바닥 스타 (콘텐츠)
CREATE TABLE IF NOT EXISTS badak_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  featured_profile_id UUID REFERENCES badak_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_badak_profiles_job ON badak_profiles(job_function);
CREATE INDEX IF NOT EXISTS idx_badak_profiles_industry ON badak_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_badak_profiles_level ON badak_profiles(job_level);
CREATE INDEX IF NOT EXISTS idx_badak_profiles_active ON badak_profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_badak_connections_requester ON badak_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_badak_connections_target ON badak_connections(target_id);
CREATE INDEX IF NOT EXISTS idx_badak_connections_status ON badak_connections(status);
CREATE INDEX IF NOT EXISTS idx_badak_stars_status ON badak_stars(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_badak_stars_slug ON badak_stars(slug);

-- RLS 활성화
ALTER TABLE badak_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badak_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE badak_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badak_stars ENABLE ROW LEVEL SECURITY;

-- RLS 정책: badak_profiles
CREATE POLICY "프로필 공개 열람" ON badak_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "본인 프로필 수정" ON badak_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "본인 프로필 업데이트" ON badak_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS 정책: badak_connections
CREATE POLICY "본인 연결 열람" ON badak_connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);
CREATE POLICY "연결 요청 생성" ON badak_connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "연결 응답" ON badak_connections FOR UPDATE USING (auth.uid() = target_id);

-- RLS 정책: badak_feedbacks
CREATE POLICY "피드백 열람" ON badak_feedbacks FOR SELECT USING (auth.uid() = giver_id);
CREATE POLICY "피드백 작성" ON badak_feedbacks FOR INSERT WITH CHECK (auth.uid() = giver_id);

-- RLS 정책: badak_stars
CREATE POLICY "스타 공개 열람" ON badak_stars FOR SELECT USING (status = 'published');
CREATE POLICY "스타 전체 열람 (서비스키)" ON badak_stars FOR SELECT USING (true);
CREATE POLICY "스타 작성 (서비스키)" ON badak_stars FOR INSERT WITH CHECK (true);
CREATE POLICY "스타 수정 (서비스키)" ON badak_stars FOR UPDATE USING (true);

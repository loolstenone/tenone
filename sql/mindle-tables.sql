-- Mindle 데이터 인프라
-- mindle_sources: RSS/크롤링 소스 목록
-- mindle_trends: Mindle이 생성한 트렌드 카드

-- 1. mindle_sources: 크롤링 소스 관리
CREATE TABLE IF NOT EXISTS mindle_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'rss', -- 'rss', 'web', 'api', 'kakao'
  category TEXT NOT NULL DEFAULT 'general', -- 'marketing', 'startup', 'tech', 'ad', 'general'
  brand_filter TEXT[], -- 관련 브랜드 태그
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_crawled_at TIMESTAMPTZ,
  crawl_interval_hours INT NOT NULL DEFAULT 6,
  crawl_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. mindle_trends: 트렌드 카드 (Mindle 에이전트가 생성)
CREATE TABLE IF NOT EXISTS mindle_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL, -- 3줄 요약
  full_content TEXT, -- 전체 분석 내용
  category TEXT NOT NULL DEFAULT 'general', -- 'marketing', 'startup', 'tech', 'ad', 'design', 'general'
  tags TEXT[] NOT NULL DEFAULT '{}',
  source_urls TEXT[] NOT NULL DEFAULT '{}', -- 출처 URL 목록
  source_names TEXT[] NOT NULL DEFAULT '{}', -- 출처 이름 목록
  relevance_score FLOAT NOT NULL DEFAULT 0.5, -- 0~1, 열시일분 판단용
  agent_name TEXT NOT NULL DEFAULT 'mindle', -- 생성 에이전트
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_mindle_sources_active ON mindle_sources(is_active, source_type);
CREATE INDEX IF NOT EXISTS idx_mindle_trends_status ON mindle_trends(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mindle_trends_category ON mindle_trends(category, status);
CREATE INDEX IF NOT EXISTS idx_mindle_trends_featured ON mindle_trends(is_featured, status);

-- 4. RLS
ALTER TABLE mindle_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindle_trends ENABLE ROW LEVEL SECURITY;

-- mindle_sources: staff만 관리, 공개 읽기
DO $$ BEGIN
  DROP POLICY IF EXISTS "mindle_sources_read" ON mindle_sources;
  CREATE POLICY "mindle_sources_read" ON mindle_sources FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "mindle_sources_write" ON mindle_sources;
  CREATE POLICY "mindle_sources_write" ON mindle_sources FOR ALL USING (auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- mindle_trends: published는 공개, 나머지는 staff
DO $$ BEGIN
  DROP POLICY IF EXISTS "mindle_trends_public" ON mindle_trends;
  CREATE POLICY "mindle_trends_public" ON mindle_trends FOR SELECT USING (status = 'published' OR auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "mindle_trends_write" ON mindle_trends;
  CREATE POLICY "mindle_trends_write" ON mindle_trends FOR ALL USING (auth_is_staff());
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 5. 시드: 주요 RSS 소스
INSERT INTO mindle_sources (name, url, source_type, category, brand_filter) VALUES
  ('모비인사이드', 'https://www.mobiinside.co.kr/feed', 'rss', 'marketing', ARRAY['smarcomm','badak']),
  ('ㅍㅍㅅㅅ', 'https://ppss.kr/feed', 'rss', 'startup', ARRAY['madleague','hero']),
  ('플래텀', 'https://platum.kr/feed', 'rss', 'startup', ARRAY['madleague','hero']),
  ('아이보스', 'https://www.i-boss.co.kr/ab-6560-0', 'rss', 'marketing', ARRAY['smarcomm']),
  ('DBR 동아비즈니스리뷰', 'https://dbr.donga.com/rss/feed', 'rss', 'general', ARRAY['tenone'])
ON CONFLICT (url) DO NOTHING;

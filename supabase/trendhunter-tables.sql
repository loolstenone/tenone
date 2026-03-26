-- =============================================
-- TrendHunter 크롤러 DB 스키마
-- Ten:One™ Universe 정보 수집·분석·콘텐츠 생산 엔진
-- 2026-03-26
-- =============================================

-- 1. 통합 수집 로그 (모든 크롤러 공용)
CREATE TABLE IF NOT EXISTS collected_data (
  id           BIGSERIAL PRIMARY KEY,
  source_type  TEXT NOT NULL,        -- kakao, kakao_ext, web, discord, rss, news, smarcomm
  source_name  TEXT NOT NULL,        -- 방 이름 / 사이트명 / 서버명
  topic        TEXT,                 -- 주제 코드
  author       TEXT,                 -- 작성자 (닉네임)
  title        TEXT,                 -- 제목 (게시글일 경우)
  content      TEXT NOT NULL,        -- 본문
  content_type TEXT DEFAULT 'text',  -- text, article, post, comment, link
  url          TEXT,                 -- 원본 URL (게시글 링크)
  has_urls     BOOLEAN DEFAULT false,
  extracted_urls TEXT[],             -- 본문 내 URL
  metadata     JSONB,               -- 소스별 추가 정보 (좋아요 수, 댓글 수 등)
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cd_source ON collected_data(source_type);
CREATE INDEX IF NOT EXISTS idx_cd_topic ON collected_data(topic);
CREATE INDEX IF NOT EXISTS idx_cd_collected ON collected_data(collected_at);

-- 2. 요약 저장 (digest 모드)
CREATE TABLE IF NOT EXISTS digests (
  id             SERIAL PRIMARY KEY,
  source_type    TEXT NOT NULL,
  source_name    TEXT NOT NULL,
  digest_text    TEXT NOT NULL,
  keywords       JSONB,
  urls           JSONB,
  opportunities  JSONB,
  data_count     INT,
  period_start   TIMESTAMPTZ,
  period_end     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 바닥쇠 응답 로그
CREATE TABLE IF NOT EXISTS bot_responses (
  id               BIGSERIAL PRIMARY KEY,
  room             TEXT NOT NULL,
  topic            TEXT NOT NULL,
  sender           TEXT NOT NULL,
  query            TEXT NOT NULL,
  response         TEXT NOT NULL,
  model            TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used      INT,
  response_time_ms INT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 사업 기회 감지
CREATE TABLE IF NOT EXISTS th_opportunities (
  id           SERIAL PRIMARY KEY,
  type         TEXT NOT NULL,         -- recruit, solution, consulting, education, career, ai_demand, collabo
  source_type  TEXT NOT NULL,         -- 어디서 감지됐는지
  source_name  TEXT NOT NULL,
  title        TEXT,
  description  TEXT NOT NULL,
  url          TEXT,
  detected_at  TIMESTAMPTZ DEFAULT NOW(),
  status       TEXT DEFAULT 'new'     -- new, reviewed, acted, dismissed
);

-- 5. URL 아카이브 (공유·발견된 링크)
CREATE TABLE IF NOT EXISTS url_archive (
  id          SERIAL PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  category    TEXT,
  author      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 일간 통계
CREATE TABLE IF NOT EXISTS daily_stats (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL,
  source_type    TEXT NOT NULL,
  source_name    TEXT NOT NULL,
  data_count     INT DEFAULT 0,
  unique_authors INT DEFAULT 0,
  top_keywords   JSONB,
  peak_hour      INT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, source_type, source_name)
);

-- 7. 인사이트 (Claude 분석 결과)
CREATE TABLE IF NOT EXISTS th_insights (
  id            SERIAL PRIMARY KEY,
  period_type   TEXT NOT NULL,        -- daily, weekly, monthly
  period_start  DATE NOT NULL,
  insight_type  TEXT NOT NULL,        -- trend, health, opportunity, content
  scope         TEXT,                 -- 전체 / 특정 소스
  summary       TEXT NOT NULL,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 콘텐츠 초안 (자동 생성)
CREATE TABLE IF NOT EXISTS content_drafts (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  target_brand  TEXT NOT NULL,        -- TrendHunter, Badak, RooK, 0gamja, MADLeague, FWN
  target_format TEXT NOT NULL,        -- article, report, newsletter, sns
  source_data   JSONB,
  status        TEXT DEFAULT 'draft', -- draft, reviewed, published, discarded
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 크롤러 상태 관리
CREATE TABLE IF NOT EXISTS crawler_status (
  id            SERIAL PRIMARY KEY,
  crawler_name  TEXT NOT NULL UNIQUE,  -- badaksoe, web_naver, discord_bot, rss_parser, smarcomm
  status        TEXT DEFAULT 'active', -- active, paused, error
  last_run      TIMESTAMPTZ,
  last_count    INT,
  error_message TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (기본)
ALTER TABLE collected_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE th_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE th_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_status ENABLE ROW LEVEL SECURITY;

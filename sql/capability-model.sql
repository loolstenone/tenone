-- Capability 기반 회원 모델
-- 브랜드에서 기능(capability)을 분리 — 브랜드는 capability를 "탑재"만 하고,
-- 회원은 capability × 브랜드 조합으로 역할 인스턴스를 누적한다.
-- 실행 이력: 2026-04-20 apply_migration "capability_model_tables"

-- 1. Capability 레지스트리 (확장 가능)
CREATE TABLE IF NOT EXISTS capabilities (
  key text PRIMARY KEY,
  name_ko text NOT NULL,
  description text,
  built_in_roles text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 브랜드가 어떤 capability를 탑재했는지
CREATE TABLE IF NOT EXISTS brand_capabilities (
  brand_id text NOT NULL,
  capability_key text NOT NULL REFERENCES capabilities(key) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  activated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (brand_id, capability_key)
);

-- 3. 회원의 capability별 역할 인스턴스 (누적, 시간차원 내장)
CREATE TABLE IF NOT EXISTS member_capability_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  brand_id text NOT NULL,
  capability_key text NOT NULL REFERENCES capabilities(key) ON DELETE CASCADE,
  role text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcr_member ON member_capability_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_mcr_brand_cap ON member_capability_roles(brand_id, capability_key);
CREATE INDEX IF NOT EXISTS idx_mcr_active ON member_capability_roles(member_id, brand_id, capability_key)
  WHERE valid_until IS NULL;

ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_capability_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY capabilities_read ON capabilities FOR SELECT USING (true);
CREATE POLICY brand_capabilities_read ON brand_capabilities FOR SELECT USING (true);
CREATE POLICY mcr_self_read ON member_capability_roles FOR SELECT
  USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- ====== 시드 ======

INSERT INTO capabilities(key, name_ko, description, built_in_roles) VALUES
('community',    '커뮤니티',   '게시글·댓글·반응·문의', ARRAY['member']),
('meetup',       '모임',       '모임 개설/참여, 개설자는 관리권 보유', ARRAY['owner','participant']),
('club',         '동아리',     '연차 기반 조직·임원·OB 체계', ARRAY['현역','임원','OB']),
('portfolio',    '포트폴리오', '작품·작업물·경력 쇼케이스', ARRAY['creator']),
('membership',   '승인 멤버십', '심사제 소속 (결제 없이 승인)', ARRAY['applicant','approved']),
('course',       '강의',       '강사 진행·수강 등록', ARRAY['instructor','taker']),
('showcase',     '일시 이벤트', '비연속 이벤트·쇼케이스', ARRAY['host','visitor']),
('subscription', '정기 구독',  '월/년 결제 기반 서비스 이용', ARRAY['subscriber']),
('purchase',     '건별 구매',  '상담·제품·패스 1회성 결제', ARRAY['buyer'])
ON CONFLICT (key) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  description = EXCLUDED.description,
  built_in_roles = EXCLUDED.built_in_roles;

-- 브랜드 × Capability 매트릭스 (26개 외부 브랜드 — Intra/Wiki/Dokdae 제외)
-- community는 전 브랜드 기본 탑재 (소비자 문의 + 사용자 커뮤니티)
INSERT INTO brand_capabilities(brand_id, capability_key) VALUES
('madleague','community'),('madleap','community'),('badak','community'),('rook','community'),
('youinone','community'),('smarcomm','community'),('hero','community'),('ogamja','community'),
('luki','community'),('seoul360','community'),('fwn','community'),('montz','community'),
('mullaesian','community'),('trendhunter','community'),('mindle','community'),('townity','community'),
('naturebox','community'),('myverse','community'),('domo','community'),('jakka','community'),
('changeup','community'),('planners','community'),('wio','community'),('brandgravity','community'),
('evschool','community'),('namingfactory','community'),
('badak','meetup'),('rook','meetup'),('townity','meetup'),('domo','meetup'),
('madleague','club'),('madleap','club'),
('hero','portfolio'),('montz','portfolio'),('jakka','portfolio'),
('youinone','membership'),('domo','membership'),
('madleague','course'),('madleap','course'),('badak','course'),('hero','course'),
('changeup','course'),('planners','course'),('evschool','course'),
('madleague','showcase'),('seoul360','showcase'),('montz','showcase'),('mullaesian','showcase'),
('jakka','showcase'),
('smarcomm','subscription'),('mindle','subscription'),('myverse','subscription'),
('wio','subscription'),('brandgravity','subscription'),
('madleap','purchase'),('badak','purchase'),('hero','purchase'),('montz','purchase'),
('naturebox','purchase'),('changeup','purchase'),('planners','purchase'),('brandgravity','purchase'),
('evschool','purchase'),('namingfactory','purchase')
ON CONFLICT (brand_id, capability_key) DO NOTHING;

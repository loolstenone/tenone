-- 뉴스레터 구독자 + 발행 이력 + 문의 제출 테이블

-- 1. newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,
  name        text,
  member_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status      text DEFAULT 'active',  -- active | unsubscribed
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "newsletter_insert_all" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "newsletter_read_admin" ON newsletter_subscribers FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));
CREATE POLICY IF NOT EXISTS "newsletter_update_self" ON newsletter_subscribers FOR UPDATE
  USING (member_id = auth.uid() OR auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- 2. newsletter_issues (발행 이력)
CREATE TABLE IF NOT EXISTS newsletter_issues (
  id          serial PRIMARY KEY,
  title       text NOT NULL,
  date        date NOT NULL,
  category    text,
  excerpt     text,
  url         text,
  published   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "newsletter_issues_read_all" ON newsletter_issues FOR SELECT USING (published = true);
CREATE POLICY IF NOT EXISTS "newsletter_issues_write_admin" ON newsletter_issues FOR ALL
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- 3. contact_submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type    text NOT NULL,  -- partner | business | join
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  company      text,
  message      text,
  portfolio_url text,
  extra        jsonb DEFAULT '{}',
  status       text DEFAULT 'new',  -- new | read | replied | closed
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_form_type ON contact_submissions(form_type);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "contact_insert_all" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "contact_read_admin" ON contact_submissions FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));
CREATE POLICY IF NOT EXISTS "contact_update_admin" ON contact_submissions FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- 4. newsletter_issues 시드
INSERT INTO newsletter_issues (title, date, category) VALUES
  ('MADLeague 인사이트 투어링 — 영양군에서 만난 기획의 본질', '2026-03-15', 'MADLeague'),
  ('LUKI 2nd Single 비하인드 — AI 아이돌은 어떻게 만들어지는가', '2026-03-01', 'LUKI'),
  ('Badak 3월 밋업 리캡 — 퍼포먼스 마케팅의 미래', '2026-02-15', 'Badak'),
  ('GPR 가이드북 공개 — 우리의 성장 철학을 나눕니다', '2026-02-01', 'Culture'),
  ('리제로스 시즌1 결과 발표 — 5개 팀의 도전 이야기', '2026-01-15', 'MADLeague'),
  ('2026년 Ten:One™ Universe 로드맵 공개', '2026-01-01', 'Universe')
ON CONFLICT DO NOTHING;

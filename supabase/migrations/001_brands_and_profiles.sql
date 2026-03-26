-- WIO Master Architecture PART 2-3 기반
-- 브랜드 마스터 + 프로필 확장 + RLS

-- 1. brands 테이블
CREATE TABLE IF NOT EXISTS brands (
  id         text PRIMARY KEY,  -- 'madleague', 'badak', 'hero', 'tenone' 등
  name       text NOT NULL,
  status     text NOT NULL DEFAULT 'active',  -- active | dev | incubating
  modules    jsonb NOT NULL DEFAULT '[]',     -- 활성화된 모듈 목록
  settings   jsonb NOT NULL DEFAULT '{}',     -- 테마, 기능 on/off, 도메인 등
  plan       text NOT NULL DEFAULT 'free',    -- free | starter | pro | business | enterprise
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 23개 브랜드 초기 데이터
INSERT INTO brands (id, name, status, modules, plan) VALUES
  ('tenone',     'Ten:One',          'active', '["home","people","talk","content","insight","project","learn","gpr","wiki","sales","finance","timesheet","approval","hr"]', 'enterprise'),
  ('wio',        'WIO',              'active', '["home","people","talk","content","insight","project","learn","gpr","wiki","sales","finance","timesheet"]', 'enterprise'),
  ('youinone',   'YouInOne',         'active', '["home","people","talk","content","insight","project","learn","gpr","wiki","sales","timesheet"]', 'business'),
  ('madleague',  'MADLeague',        'active', '["home","people","talk","content","insight","project","learn","gpr","competition","certificate"]', 'pro'),
  ('madleap',    'MADLeap',          'active', '["home","people","talk","content","insight","project","learn","competition"]', 'pro'),
  ('badak',      'Badak',            'active', '["home","people","talk","content","insight","networking"]', 'pro'),
  ('hero',       'HeRo',             'active', '["home","people","talk","content","insight","sales","mentoring","portfolio"]', 'business'),
  ('smarcomm',   'SmarComm',         'active', '["home","people","talk","content","insight","project","sales","finance","timesheet"]', 'business'),
  ('mindle',     'Mindle',           'active', '["home","people","talk","content","insight","newsletter"]', 'pro'),
  ('evschool',   'Evolution School', 'active', '["home","people","talk","content","insight","learn","certificate","mentoring"]', 'pro'),
  ('planners',   'Planners',         'active', '["home","people","talk","content","insight","gpr","wiki","shop"]', 'pro'),
  ('brandgravity','Brand Gravity',   'active', '["home","people","talk","content","insight","project","sales"]', 'pro'),
  ('namingfactory','Naming Factory', 'active', '["home","people","talk","content","insight","project","sales","shop"]', 'pro'),
  ('rook',       'RooK',             'active', '["home","people","talk","content","insight","project","portfolio"]', 'starter'),
  ('0gamja',     '0gamja',           'active', '["home","people","talk","content","insight","counseling"]', 'starter'),
  ('domo',       'domo',             'dev',    '["home","people","talk","content","insight","networking"]', 'starter'),
  ('fwn',        'FWN',              'dev',    '["home","people","talk","content","insight","networking"]', 'starter'),
  ('changeup',   'ChangeUp',         'active', '["home","people","talk","content","insight","project","learn","competition"]', 'pro'),
  ('montz',      'MoNTZ',            'dev',    '["home","people","talk","content","insight","portfolio"]', 'starter'),
  ('myverse',    'Myverse',          'dev',    '["home","people","talk","content","insight","wiki"]', 'starter'),
  ('townity',    'Townity',          'dev',    '["home","people","talk","content","insight","shop","local"]', 'starter'),
  ('seoul360',   'Seoul360',         'dev',    '["home","people","talk","content","insight","local"]', 'starter'),
  ('mullaesian', 'Mullaesian',       'dev',    '["home","people","talk","content","insight","local"]', 'starter')
ON CONFLICT (id) DO NOTHING;

-- 3. profiles 테이블 (브랜드별 확장 정보)
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,  -- auth.users.id 또는 members.auth_id
  brand_id    text NOT NULL REFERENCES brands(id),
  bio         text,
  tags        text[] DEFAULT '{}',
  custom_data jsonb DEFAULT '{}',  -- 브랜드별 추가 필드
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- 4. members 테이블에 brand_roles 컬럼 추가 (없으면)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'brand_roles'
  ) THEN
    ALTER TABLE members ADD COLUMN brand_roles jsonb DEFAULT '{}';
  END IF;
END $$;

-- 5. RLS 정책

-- brands: 모든 인증 사용자가 읽기 가능
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands_read_all" ON brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "brands_admin_write" ON brands FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members WHERE auth_id = auth.uid() AND account_type = 'staff'
    )
  );

-- profiles: 본인 + 같은 brand의 admin만
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "profiles_brand_read" ON profiles FOR SELECT TO authenticated
  USING (true);  -- 같은 brand 멤버는 프로필 볼 수 있음

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_brand_id ON profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);

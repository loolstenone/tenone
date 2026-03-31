-- TenOne 포털 데이터 확장
-- brands 테이블에 포털 표시용 컬럼 추가 + history_events 테이블 생성

-- 1. brands 테이블 포털 컬럼 추가
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS category    text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tagline     text,
  ADD COLUMN IF NOT EXISTS domain      text,
  ADD COLUMN IF NOT EXISTS logo_url    text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS tags        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS founded_date date,
  ADD COLUMN IF NOT EXISTS display_status text DEFAULT 'Active';  -- Active | Development | Hiatus

-- 2. brands 포털 데이터 시드
UPDATE brands SET
  category='Corporate', description='Integrated Management System & Headquarters.',
  tagline='가치로 연결된 하나의 거대한 세계관', domain='TenOne.biz',
  logo_url='/logos/tenone.png', website_url='/', tags=ARRAY['HQ','System','Universe'], display_status='Active'
WHERE id='tenone';

UPDATE brands SET
  category='AI Creator', description='Talent Agency for AI Idols & Creators.',
  tagline='We Believe in your talent', domain='hero.ne.kr',
  logo_url='/logos/hero.png', website_url='/hero', tags=ARRAY['Agency','Management','AI'], display_status='Active'
WHERE id='hero';

UPDATE brands SET
  category='Community', description='Marketing & Ad Industry Networking Community.',
  tagline='약한 연결 고리가 만드는 강력한 기회', domain='Badak.biz',
  logo_url='/logos/badak.png', website_url='/badak', tags=ARRAY['Networking','Marketing','Ad'], display_status='Active'
WHERE id='badak';

UPDATE brands SET
  category='Community', description='Marketing & Ad University Student Club.',
  tagline='미치지 않으면 미치지 못한다', domain='MADLeap.co.kr',
  logo_url='/logos/madleap.png', website_url='/madleap', tags=ARRAY['Student','Club','Education'], display_status='Active'
WHERE id='madleap';

UPDATE brands SET
  category='Project Group', description='Project Alliance & Contest Platform.',
  tagline='실전이 우리를 강하게 하리라', domain='MADLeague.net',
  logo_url='/logos/madleague.png', website_url='/madleague', tags=ARRAY['Alliance','Contest','Project'], display_status='Active'
WHERE id='madleague';

UPDATE brands SET
  category='Startup', description='Project Group & Business Alliance.',
  tagline='비즈니스 연대', domain='YouInOne.com',
  logo_url='/logos/youinone.png', website_url='/youinone', tags=ARRAY['Business','Alliance','Startup'], display_status='Active'
WHERE id='youinone';

UPDATE brands SET
  category='Fashion', description='World Fashion Week Network.',
  tagline='세계 패션위크 네트워크', domain='FWN.co.kr',
  logo_url='/logos/fwn.png', website_url='/fwn', tags=ARRAY['Fashion','Global','Network'], display_status='Development'
WHERE id='fwn';

UPDATE brands SET
  category='AI Idol', description='AI 4-member girl group from planet Lumina.',
  tagline='파괴된 행성 루미나의 빛 조각, AI 4인조 걸그룹',
  logo_url='/logos/luki.png', website_url='https://youtube.com/@LUKI-AIdol',
  tags=ARRAY['K-Pop','AI','Virtual','Music'], founded_date='2025-08-29', display_status='Active'
WHERE id='luki';

UPDATE brands SET
  category='AI Creator', description='AI Creator. Early bird gets the worm.',
  tagline='새로운 사람, 새로운 방법. 인공지능 크리에이터', domain='RooK.co.kr',
  logo_url='/logos/rook.png', website_url='/rook', tags=ARRAY['Art','Design','GenAI'],
  founded_date='2025-04-03', display_status='Active'
WHERE id='rook';

UPDATE brands SET
  category='Marketing', description='AI-Powered Marketing Communication Solutions.',
  tagline='AI가 마케팅을 바꾸는 순간', domain='smarcomm.co.kr',
  website_url='/smarcomm', tags=ARRAY['GEO','SEO','AI Marketing','SaaS'], display_status='Active'
WHERE id='smarcomm';

UPDATE brands SET
  category='Platform', description='Work In One. 프로젝트 중심 통합 운영 플랫폼.',
  tagline='5개 앱 열어서 한 줄 보고하는 거 이상하지 않아?', domain='wio.tenone.biz',
  website_url='/wio', tags=ARRAY['SaaS','Project','CRM','HR'], display_status='Active'
WHERE id='wio';

UPDATE brands SET
  category='Content', description='Trend Intelligence Platform. Bloom insights from signals.',
  tagline='신호에서 인사이트를 피우다', domain='mindle.tenone.biz',
  website_url='/mindle', tags=ARRAY['Trend','AI Crawler','Newsletter'], display_status='Active'
WHERE id='mindle';

UPDATE brands SET
  category='Education', description='직무 교육 플랫폼. 현업 전문가의 실전 교육.',
  tagline='진화는 배움에서 시작된다', website_url='/evschool',
  tags=ARRAY['LMS','Education','Career'], display_status='Active'
WHERE id='evschool';

UPDATE brands SET
  category='Education', description='기획 도구·교육 플랫폼. Vrief & GPR 프레임워크.',
  tagline='기획의 기본기를 세우다', website_url='/planners',
  tags=ARRAY['Planning','Vrief','GPR','Tool'], display_status='Active'
WHERE id='planners';

UPDATE brands SET
  category='Consulting', description='브랜딩 컨설팅. 트렌드 기반 브랜드 전략.',
  tagline='끌어당기는 브랜드를 만듭니다', website_url='/brandgravity',
  tags=ARRAY['Branding','Strategy','Consulting'], display_status='Active'
WHERE id='brandgravity';

UPDATE brands SET
  category='Consulting', description='AI+전문가 하이브리드 네이밍·슬로건 솔루션.',
  tagline='이름이 브랜드의 시작이다', website_url='/namingfactory',
  tags=ARRAY['Naming','Slogan','AI'], display_status='Active'
WHERE id='namingfactory';

UPDATE brands SET
  category='Project Group', description='대학생 프로젝트 그룹. 실전 경험의 장.',
  tagline='변화를 일으키는 사람들', website_url='/changeup',
  tags=ARRAY['Project','Student','Competition'], display_status='Active'
WHERE id='changeup';

UPDATE brands SET
  category='Network', description='시니어 비즈니스맨 네트워킹 플랫폼.',
  tagline='경험이 만나는 곳', website_url='/domo',
  tags=ARRAY['Senior','Networking','Business'], display_status='Development'
WHERE id='domo';

UPDATE brands SET
  category='Content', description='포토그래피 브랜드. 순간을 영원으로.',
  tagline='Capture the moment', website_url='/montz',
  tags=ARRAY['Photography','Creative','Visual'], display_status='Development'
WHERE id='montz';

UPDATE brands SET
  category='Platform', description='My Universe. AI 에이전트 플랫폼.',
  tagline='나만의 우주를 만들다', website_url='/myverse',
  tags=ARRAY['AI Agent','Personal','Platform'], display_status='Development'
WHERE id='myverse';

-- 3. history_events 테이블
CREATE TABLE IF NOT EXISTS history_events (
  id          text PRIMARY KEY,
  date        date NOT NULL,
  year        text NOT NULL,
  title       text NOT NULL,
  description text,
  brand_id    text REFERENCES brands(id) ON DELETE SET NULL,
  type        text DEFAULT 'milestone',  -- milestone | launch | event | award
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_year ON history_events(year);
CREATE INDEX IF NOT EXISTS idx_history_date ON history_events(date);

-- RLS
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "history_events_read_all" ON history_events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "history_events_write_admin" ON history_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- 4. history_events 시드
INSERT INTO history_events (id, date, year, title, description, brand_id) VALUES
  ('h1',  '2019-10-01', '2019', 'Ten:One™ Universe 시작', '"하마터면 열심히 안살 뻔 했다." 수첩 속 아이디어를 세상에 꺼내놓기로 결심.', 'tenone'),
  ('h2',  '2020-03-01', '2020', '나라는 존재부터 정리하자', '내가 가진 강점, 그동안 해 왔던 일, 내가 하고자 하는 일 정리 시작.', 'tenone'),
  ('h3',  '2020-06-01', '2020', '직접 소통 채널 구축', '직군별, 직급별, 대학생, 테마별 40여개의 카카오 오픈채팅방으로 분화.', 'badak'),
  ('h4',  '2021-02-01', '2021', 'Badak 커뮤니티 본격화', '"업계 = 바닥, 바닥은 좁다. 그래서 네트워크가 강하게 작용한다."', 'badak'),
  ('h5',  '2021-06-01', '2021', 'HeRo 구상 시작', '"좋은 인재와 좋은 기업이 만나기 힘들다." Human Resource, Talent Agent 개념 구체화.', 'hero'),
  ('h6',  '2021-11-01', '2021', 'MADLeap 동아리 결성', '"경력직만 뽑으면 신입은 누가 뽑나? 정말 하고 싶어 미쳐 있는 친구들을 돕자."', 'madleap'),
  ('h7',  '2022-07-18', '2022', 'MAD League 설립', '전국 마케팅·광고 대학생 프로젝트 연합 공식 출범.', 'madleague'),
  ('h8',  '2022-11-01', '2022', 'Domo 네트워킹 플랫폼', 'domo.tenone.biz 비즈니스 네트워킹 플랫폼 런칭.', 'domo'),
  ('h9',  '2023-01-07', '2023', 'YouInOne 인수 & D.A.M Party 시즌1', 'YouInOne 스타트업 인수. 학생-기업 네트워킹 D.A.M Party 시작.', 'youinone'),
  ('h10', '2023-05-15', '2023', 'YouInOne.com 프로젝트 그룹 런칭', '사회 문제 해결을 위한 프로젝트 그룹 공식 출범.', 'youinone'),
  ('h11', '2023-09-09', '2023', 'StreetRunway 해시태그 캠페인', '서울 패션위크 기간 StreetRunway 해시태그 캠페인 전개.', 'fwn'),
  ('h12', '2023-11-13', '2023', 'PAM(부산경남) 네트워크 합류', 'Pusan AD Mania, MAD League 거점 동아리로 합류.', 'madleague'),
  ('h13', '2024-02-02', '2024', 'ADlle(대구경북) 합류', '대구경북 지역 거점 동아리 ADlle 합류. 전국 3개 동아리 체제.', 'madleague'),
  ('h14', '2024-09-27', '2024', '지평막걸리 경쟁PT', '지평막걸리를 호스트 브랜드로 3개 지역 동아리 참여 경쟁 PT 진행.', 'madleague'),
  ('h15', '2024-11-12', '2024', 'ABC(광주전남) 합류', '조선대학교 기반 ABC 동아리 합류. 전국 4개 동아리 체제.', 'madleague'),
  ('h16', '2025-01-01', '2025', 'MAD League 2기 출범', 'SUZAK(제주), P:ad(한림대), AD Zone(고려대 세종) 추가. 전국 7개 동아리 연합 완성.', 'madleague'),
  ('h17', '2025-03-01', '2025', 'LG U+ Re:zeros 경쟁PT', 'LG U+를 호스트 브랜드로 전국 동아리 대상 경쟁 PT 진행.', 'madleague'),
  ('h18', '2025-04-03', '2025', 'RooK 런칭', '"길바닥 동전은 먼저 줍는 사람이 임자." 인공지능 크리에이터 플랫폼 구축.', 'rook'),
  ('h19', '2025-04-03', '2025', 'MADzine 창간', '마케팅/광고 매거진. 형식 파괴, 마케팅의 눈, 대학생의 목소리.', 'madleague'),
  ('h20', '2025-08-29', '2025', 'LUKI 데뷔', 'AI 4인조 여성 아이돌 그룹 LUKI 공식 데뷔. 파괴된 행성 루미나의 빛 조각이 지구에 불시착.', 'luki')
ON CONFLICT (id) DO NOTHING;

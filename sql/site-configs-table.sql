-- site_configs: L1 설정 계층 — 인트라에서 관리, 브랜드 사이트에서 소비
-- 각 브랜드 사이트의 SEO, 브랜딩, 색상, 네비게이션을 DB에서 관리

CREATE TABLE IF NOT EXISTS site_configs (
    site_id TEXT PRIMARY KEY,           -- SiteIdentifier (tenone, madleague, hero, ...)
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    logo_text TEXT NOT NULL DEFAULT '',
    logo_image_url TEXT,
    logo_style TEXT NOT NULL DEFAULT 'text',  -- badge | text | image
    favicon_url TEXT NOT NULL DEFAULT '/favicon.ico',
    apple_touch_icon TEXT NOT NULL DEFAULT '/favicon.ico',
    colors JSONB NOT NULL DEFAULT '{}',       -- {primary, primaryDark, secondary, headerBg, headerText, footerBg, footerText, accent}
    meta_title TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    meta_og_image TEXT,
    meta_keywords TEXT[] DEFAULT '{}',
    home_path TEXT NOT NULL DEFAULT '/',
    signup_path TEXT NOT NULL DEFAULT '/signup',
    tagline TEXT,
    universe_label TEXT DEFAULT '',
    show_universe_badge BOOLEAN DEFAULT true,
    auth_methods JSONB NOT NULL DEFAULT '{"email":true,"google":false,"kakao":false}',
    nav JSONB DEFAULT '[]',                   -- [{name, href}, ...]
    footer_links JSONB DEFAULT '[]',
    contact JSONB DEFAULT '{}',               -- {email, phone, kakao, instagram, youtube}
    features JSONB DEFAULT '{"board":true,"newsletter":false,"commerce":false,"chat":false}',  -- 기능 토글
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_site_configs_domain ON site_configs(domain);

-- RLS
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_configs_read" ON site_configs;
CREATE POLICY "site_configs_read" ON site_configs FOR SELECT USING (true);
DROP POLICY IF EXISTS "site_configs_write" ON site_configs;
CREATE POLICY "site_configs_write" ON site_configs FOR ALL USING (true);

-- 26개 사이트 시드 (lib/site-config.ts 기반)
INSERT INTO site_configs (site_id, name, domain, logo_text, logo_style, favicon_url, apple_touch_icon, colors, meta_title, meta_description, meta_og_image, meta_keywords, home_path, tagline, universe_label, show_universe_badge, auth_methods, nav, footer_links, contact)
VALUES
('tenone', 'Ten:One™', 'tenone.biz', 'Ten:One™', 'text', '/icon.png', '/apple-icon-180x180.png',
 '{"primary":"#171717","primaryDark":"#0a0a0a","secondary":"#525252","headerBg":"#ffffff","headerText":"#171717","footerBg":"#171717","footerText":"#a3a3a3","accent":"#171717"}',
 'Ten:One™ — Beyond the Limit', 'Ten:One Universe. 다양한 브랜드와 프로젝트로 구성된 멀티 브랜드 생태계.', NULL,
 '{"TenOne","Ten:One","멀티브랜드","생태계"}', '/',
 'Beyond the Limit. 가치로 연결된 멀티 브랜드 생태계.', '', false,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"About","href":"/about"},{"name":"Universe","href":"/universe"},{"name":"Brands","href":"/brands"},{"name":"Works","href":"/works"},{"name":"Contact","href":"/contact"}]',
 '[{"name":"About","href":"/about"},{"name":"Universe","href":"/universe"},{"name":"Contact","href":"/contact"}]',
 '{"email":"lools@tenone.biz"}'),

('madleague', 'MAD League', 'madleague.net', 'MAD LEAGUE', 'badge', '/brands/madleague/favicon.png', '/brands/madleague/favicon.png',
 '{"primary":"#D32F2F","primaryDark":"#B71C1C","secondary":"#FF5252","headerBg":"#171717","headerText":"#ffffff","footerBg":"#212121","footerText":"#a3a3a3","accent":"#D32F2F"}',
 'MAD League — 경쟁을 통한 성장 플랫폼', 'Match, Act, Develop. 경쟁하고, 행동하고, 성장하라. 전국 대학 연합 마케팅 경쟁 플랫폼 MAD League.', NULL,
 '{"MAD League","대학생","마케팅","경쟁","PT"}', '/madleague',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}', '[]', '[]', '{}'),

('madleap', 'MADLeap', 'madleap.co.kr', 'MAD Leap', 'text', '/brands/madleap/favicon.png', '/brands/madleap/favicon.png',
 '{"primary":"#00B8FF","primaryDark":"#0090CC","secondary":"#4DD4FF","headerBg":"#ffffff","headerText":"#171717","footerBg":"#333333","footerText":"#a3a3a3","accent":"#00B8FF"}',
 'MADLeap — 수도권 마케팅 광고 창업 대학생 연합 동아리', '실전 프로젝트 대학생 연합동아리. 마케팅, 광고, 창업을 실전으로 경험하는 MADLeap.', NULL,
 '{"MADLeap","대학생","마케팅","광고","창업","연합동아리","수도권"}', '/madleap',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"커뮤니티","href":"/mlp/community"},{"name":"스터디 룸","href":"/mlp/study-room"},{"name":"매드립 소개","href":"/mlp/about"},{"name":"포트폴리오","href":"/mlp/portfolio"}]',
 '[]', '{}'),

('youinone', 'YouInOne', 'youinone.com', 'YouInOne', 'text', '/brands/youinone/favicon.png', '/brands/youinone/favicon.png',
 '{"primary":"#171717","primaryDark":"#0a0a0a","secondary":"#525252","headerBg":"#ffffff","headerText":"#171717","footerBg":"#171717","footerText":"#a3a3a3","accent":"#E53935"}',
 'YouInOne — 프로젝트 그룹', '기업과 사회의 문제를 해결하는 프로젝트 그룹. Idea + Strategy. 소규모 기업 연합 얼라이언스.', NULL,
 '{"YouInOne","프로젝트그룹","얼라이언스","문제해결"}', '/youinone',
 NULL, 'Part of Ten:One™ Universe', true,
 '{"email":true,"google":true,"kakao":true}', '[]', '[]', '{}'),

('luki', 'LUKI', 'luki.ai', 'LUKI', 'text', '/brands/luki/favicon.png', '/brands/luki/favicon.png',
 '{"primary":"#7C3AED","primaryDark":"#5B21B6","secondary":"#A78BFA","headerBg":"#1a1a2e","headerText":"#ffffff","footerBg":"#1a1a2e","footerText":"#a3a3a3","accent":"#7C3AED"}',
 'LUKI — AI Idol Group', 'LUKI - AI 기반 아이돌 그룹. Ten:One Universe의 AI 엔터테인먼트 브랜드.', NULL,
 '{"LUKI","AI Idol","AI 아이돌","Ten:One"}', '/',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}', '[]', '[]', '{}'),

('rook', 'RooK', 'rook.co.kr', 'RooK', 'text', '/brands/rook/favicon.png', '/brands/rook/favicon.png',
 '{"primary":"#00d255","primaryDark":"#00b347","secondary":"#00ff66","headerBg":"#282828","headerText":"#ffffff","footerBg":"#1a1a1a","footerText":"#a3a3a3","accent":"#00d255"}',
 'RooK — AI Creator', 'AI Creator RooK. 밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다.', NULL,
 '{"RooK","AI Creator","AI 크리에이터","AI 아티스트","Ten:One"}', '/rook',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}', '[]', '[]', '{}'),

('badak', 'Badak', 'badak.biz', 'Badak', 'text', '/brands/badak/favicon.png', '/brands/badak/favicon.png',
 '{"primary":"#2563EB","primaryDark":"#1D4ED8","secondary":"#60A5FA","headerBg":"#ffffff","headerText":"#171717","footerBg":"#1a1a2e","footerText":"#a3a3a3","accent":"#2563EB"}',
 'Badak — 마케팅 광고 네트워킹 커뮤니티', 'Badak - 마케팅 업계 네트워킹 커뮤니티. 약한 연결 고리가 만드는 강력한 기회.', NULL,
 '{"Badak","네트워킹","커뮤니티","마케팅","광고","Ten:One"}', '/badak',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"탐색","href":"/badak/explore"},{"name":"이바닥 스타","href":"/badak/stars"},{"name":"커뮤니티","href":"/badak/community"},{"name":"바닥이란","href":"/badak/about"}]',
 '[]', '{}'),

('smarcomm', 'SmarComm.', 'smarcomm.biz', 'SmarComm.', 'text', '/brands/smarcomm/favicon.png', '/brands/smarcomm/favicon.png',
 '{"primary":"#3B82F6","primaryDark":"#2563EB","secondary":"#60A5FA","headerBg":"#ffffff","headerText":"#171717","footerBg":"#0A0E1A","footerText":"#a3a3a3","accent":"#3B82F6"}',
 'SmarComm. — AI 마케팅 커뮤니케이션', 'SmarComm. - AI 기반 올인원 마케팅 커뮤니케이션 플랫폼.', NULL,
 '{"SmarComm","AI 마케팅","커뮤니케이션","Ten:One"}', '/smarcomm',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":false,"kakao":false}', '[]', '[]', '{}'),

('hero', 'HeRo', 'hero.ne.kr', 'HeRo', 'text', '/brands/hero/favicon.png', '/brands/hero/favicon.png',
 '{"primary":"#F59E0B","primaryDark":"#D97706","secondary":"#FBBF24","headerBg":"#ffffff","headerText":"#171717","footerBg":"#171717","footerText":"#a3a3a3","accent":"#F59E0B"}',
 'HeRo — 인재 발굴·성장 플랫폼', '숨겨진 인재를 발굴하고 성장시키는 HeRo 플랫폼. HIT 프로그램, 커리어 로드맵, 멘토링, 브랜딩.', NULL,
 '{"HeRo","인재발굴","커리어","멘토링","HIT","Ten:One"}', '/hero',
 NULL, 'Part of Ten:One™ Universe', true,
 '{"email":true,"google":true,"kakao":true}', '[]', '[]', '{}'),

('ogamja', '공감자', '0gamja.com', '공감자', 'text', '/brands/ogamja/favicon.png', '/brands/ogamja/favicon.png',
 '{"primary":"#F5C518","primaryDark":"#D4A017","secondary":"#FFD54F","headerBg":"#ffffff","headerText":"#171717","footerBg":"#2D2D2D","footerText":"#a3a3a3","accent":"#F5C518"}',
 '공감자 — 하찮고 귀여운 감자들의 공감 이야기', '하찮고 귀여운 감자들의 공감 이야기. 감자처럼 소소하지만 따뜻한 일상의 공감 블로그.', NULL,
 '{"공감자","Ogamja","블로그","공감","감자","Ten:One"}', '/0gamja',
 '하찮고 귀여운 감자들의 공감 이야기.', 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"필찐감자","href":"/0gamja/writers"},{"name":"프로그램","href":"/0gamja/programs"},{"name":"About","href":"/0gamja/about"}]',
 '[{"name":"필찐감자","href":"/0gamja/writers"},{"name":"프로그램","href":"/0gamja/programs"},{"name":"About","href":"/0gamja/about"}]',
 '{"email":"lools@tenone.biz"}'),

('seoul360', 'Korea360', 'korea360.net', 'Korea360', 'badge', '/brands/seoul360/favicon.png', '/brands/seoul360/favicon.png',
 '{"primary":"#F5C518","primaryDark":"#D4A017","secondary":"#FFD54F","headerBg":"#3D3D3D","headerText":"#ffffff","footerBg":"#3D3D3D","footerText":"#a3a3a3","accent":"#F5C518"}',
 'Korea360 — 외국인을 위한 한국 자유여행 솔루션', '외국인을 위한 한국 자유여행 솔루션. Your complete guide to exploring Korea.', NULL,
 '{"Korea360","Korea","travel","tour","외국인","여행"}', '/seoul360',
 '외국인을 위한 한국 자유여행 솔루션', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"Seoul/360°","href":"/seoul360"},{"name":"Subway Line","href":"/seoul360/subway-line"},{"name":"District","href":"/seoul360/district"},{"name":"Station","href":"/seoul360/station"},{"name":"Outside Seoul","href":"/seoul360/outside-seoul"}]',
 '[{"name":"Seoul/360°","href":"/seoul360"},{"name":"Subway Line","href":"/seoul360/subway-line"},{"name":"District","href":"/seoul360/district"},{"name":"Station","href":"/seoul360/station"}]',
 '{"email":"lools@tenone.biz"}'),

('mullaesian', '문래지앙', 'mullaesian.tenone.biz', '문래지앙', 'text', '/brands/mullaesian/favicon.png', '/brands/mullaesian/favicon.png',
 '{"primary":"#007BBF","primaryDark":"#005F8A","secondary":"#4FC3F7","headerBg":"#ffffff","headerText":"#171717","footerBg":"#1a1a2e","footerText":"#a3a3a3","accent":"#007BBF"}',
 '문래지앙 — 작은 철공소, 골목 그리고 가난한 예술가들', '문래동 18년 거주자의 로컬 프로젝트. 철공소, 골목, 예술가들의 이야기를 기록합니다.', NULL,
 '{"문래지앙","Mullaesian","문래동","문래창작촌","철공소","Ten:One"}', '/mullaesian',
 '작은 철공소, 골목 그리고 가난한 예술가들.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"뚜르 드 문래","href":"/mls#tour"},{"name":"갤러리 문래","href":"/mls#gallery"},{"name":"문래 꼬뮨","href":"/mls#commune"}]',
 '[{"name":"뚜르 드 문래","href":"/mls#tour"},{"name":"갤러리 문래","href":"/mls#gallery"},{"name":"문래 꼬뮨","href":"/mls#commune"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001","kakao":"https://open.kakao.com/me/tenone"}'),

('fwn', 'FWN', 'fwn.co.kr', 'FWN', 'text', '/brands/fwn/favicon.png', '/brands/fwn/favicon.png',
 '{"primary":"#00C853","primaryDark":"#00A844","secondary":"#69F0AE","headerBg":"#1a1a1a","headerText":"#ffffff","footerBg":"#1a1a1a","footerText":"#a3a3a3","accent":"#00C853"}',
 'FWN — 패션 위크 네트워크', 'Fashion Week Network. 전 세계 패션 위크를 네트워크로 연결합니다. The World is on the Runway.', NULL,
 '{"FWN","Fashion Week","패션위크","패션위크네트워크","서울패션위크","Ten:One"}', '/fwn',
 'The World is on the Runway.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"서울","href":"/fwn/category/seoul"},{"name":"파리","href":"/fwn/category/paris"},{"name":"뉴욕","href":"/fwn/category/newyork"},{"name":"런던","href":"/fwn/category/london"},{"name":"밀라노","href":"/fwn/category/milan"},{"name":"월드","href":"/fwn/category/world"},{"name":"모델","href":"/fwn/category/models"},{"name":"브랜드","href":"/fwn/category/brands"},{"name":"About","href":"/fwn/about"}]',
 '[{"name":"New York","href":"/fwn/category/newyork"},{"name":"Paris","href":"/fwn/category/paris"},{"name":"London","href":"/fwn/category/london"},{"name":"Milan","href":"/fwn/category/milan"},{"name":"Seoul","href":"/fwn/category/seoul"},{"name":"About FWN","href":"/fwn/about"}]',
 '{"email":"lools@tenone.biz"}'),

('montz', 'MoNTZ', 'montz.tenone.biz', 'MoNTZ', 'text', '/brands/montz/favicon.png', '/brands/montz/favicon.png',
 '{"primary":"#1a1a1a","primaryDark":"#111111","secondary":"#333333","headerBg":"#1a1a1a","headerText":"#ffffff","footerBg":"#1a1a1a","footerText":"#a3a3a3","accent":"#c8a97e"}',
 'MoNTZ — U.G.L.Y Photography', 'MoNTZ 포토그래피. 자신을 사랑하며, 개인적·상업적으로 다양한 사진 촬영 작업을 하고 있습니다.', NULL,
 '{"MoNTZ","photography","포토그래피","사진","UGLY","Ten:One"}', '/montz',
 'U.G.L.Y — Unique, Glory, Lovely, You.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"MoNTZ","href":"/montz"},{"name":"소개","href":"/mtz/about"}]',
 '[{"name":"MoNTZ","href":"/montz"},{"name":"소개","href":"/mtz/about"}]',
 '{"email":"lools@tenone.biz"}'),

('trendhunter', 'Trend Hunter', 'trendhunter.tenone.biz', 'Trend Hunter', 'text', '/brands/trendhunter/favicon.png', '/brands/trendhunter/favicon.png',
 '{"primary":"#E50000","primaryDark":"#CC0000","secondary":"#FFB800","headerBg":"#0A0A0A","headerText":"#ffffff","footerBg":"#0A0A0A","footerText":"#a3a3a3","accent":"#00C853"}',
 'Trend Hunter — AI가 데이터를 읽고, 우리가 트렌드를 만든다', 'AI 기반 트렌드 분석과 콘텐츠 보고서. 데이터 크롤링부터 인사이트 큐레이션까지, 트렌드를 읽고 실행합니다.', NULL,
 '{"Trend Hunter","트렌드","AI 분석","트렌드 리포트","콘텐츠 보고서","Ten:One"}', '/trendhunter',
 'AI가 데이터를 읽고, 우리가 트렌드를 만든다.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"Weekly","href":"/trendhunter/weekly"},{"name":"Signals","href":"/trendhunter/signals"},{"name":"References","href":"/trendhunter/references"},{"name":"Opportunities","href":"/trendhunter/opportunities"}]',
 '[{"name":"Weekly","href":"/trendhunter/weekly"},{"name":"Signals","href":"/trendhunter/signals"},{"name":"References","href":"/trendhunter/references"},{"name":"About","href":"/trendhunter/about"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001"}'),

('mindle', 'Mindle', 'mindle.tenone.biz', 'Mindle', 'text', '/brands/mindle/favicon.png', '/brands/mindle/favicon.png',
 '{"primary":"#F5C518","primaryDark":"#E5B616","secondary":"#FFD54F","headerBg":"#0A0A0A","headerText":"#ffffff","footerBg":"#0A0A0A","footerText":"#a3a3a3","accent":"#F5C518"}',
 'Mindle — 트렌드의 홀씨를 찾아, 인사이트로 피워냅니다', 'AI 기반 트렌드 분석 플랫폼. 데이터 크롤링부터 인사이트 큐레이션까지.', NULL,
 '{"Mindle","민들레","트렌드","AI 분석","트렌드 리포트","Ten:One"}', '/mindle',
 '트렌드의 홀씨를 찾아, 인사이트로 피워냅니다.', 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"트렌드","href":"/mindle/trends"},{"name":"리포트","href":"/mindle/reports"},{"name":"데이터","href":"/mindle/data"},{"name":"레퍼런스","href":"/mindle/references"}]',
 '[{"name":"트렌드","href":"/mindle/trends"},{"name":"리포트","href":"/mindle/reports"},{"name":"About","href":"/mindle/about"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001"}'),

('townity', '타우니티', 'townity.tenone.biz', '타우니티', 'text', '/brands/townity/favicon.png', '/brands/townity/favicon.png',
 '{"primary":"#10B981","primaryDark":"#059669","secondary":"#34D399","headerBg":"#ffffff","headerText":"#171717","footerBg":"#1a2e1a","footerText":"#a3a3a3","accent":"#10B981"}',
 '타우니티 — 지역이 살아야 우리가 산다', 'Town Community 타우니티. 인공지능 시대, 지역 소멸과 고령화에 맞서는 지역 기반 커뮤니티.', NULL,
 '{"타우니티","Townity","지역 커뮤니티","지역 소멸","고령화","로컬","Ten:One"}', '/townity',
 '지역이 살아야 우리가 산다. AI 시대의 지역 커뮤니티.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"타우니티란","href":"/tw#about"},{"name":"우리 동네","href":"/tw#town"},{"name":"함께 해요","href":"/tw#together"},{"name":"이야기","href":"/tw#stories"}]',
 '[{"name":"타우니티란","href":"/tw#about"},{"name":"우리 동네","href":"/tw#town"},{"name":"함께 해요","href":"/tw#together"},{"name":"이야기","href":"/tw#stories"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001","kakao":"https://open.kakao.com/me/tenone"}'),

('naturebox', '자연함', 'naturebox.tenone.biz', '자연함', 'text', '/brands/naturebox/favicon.png', '/brands/naturebox/favicon.png',
 '{"primary":"#6B8E23","primaryDark":"#556B2F","secondary":"#8FBC8F","headerBg":"#ffffff","headerText":"#171717","footerBg":"#2D3319","footerText":"#a3a3a3","accent":"#6B8E23"}',
 '자연함 — 정선의 자연을 담다', '강원도 정선 기반 자연식품 브랜드. 자연이 키운 건강한 먹거리를 전합니다.', NULL,
 '{"자연함","NatureBox","정선","자연식품","강원도","건강식품","Ten:One"}', '/naturebox',
 '정선의 자연을 담다. 한소농장에서 전하는 건강한 먹거리.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"자연함 이야기","href":"/nb#about"},{"name":"우리 먹거리","href":"/nb#products"},{"name":"정선 이야기","href":"/nb#jeongseon"},{"name":"오시는 길","href":"/nb#visit"}]',
 '[{"name":"자연함 이야기","href":"/nb#about"},{"name":"우리 먹거리","href":"/nb#products"},{"name":"정선 이야기","href":"/nb#jeongseon"},{"name":"오시는 길","href":"/nb#visit"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001","kakao":"https://open.kakao.com/me/tenone"}'),

('myverse', 'My Universe', 'myverse.tenone.biz', 'My Universe', 'text', '/brands/myverse/favicon.png', '/brands/myverse/favicon.png',
 '{"primary":"#6366F1","primaryDark":"#4F46E5","secondary":"#818CF8","headerBg":"#0B0D17","headerText":"#ffffff","footerBg":"#0B0D17","footerText":"#a3a3a3","accent":"#6366F1"}',
 'My Universe — 디지털 속 나를 키운다', '흩어져 있는 나의 기록을 모으고, AI가 나를 알아가고, 디지털 세상에서 나를 대표하는 Personal Black Box.', NULL,
 '{"My Universe","MyVerse","AI 에이전트","개인화","데이터 주권","Personal Black Box","Ten:One"}', '/myverse',
 '디지털 속 나를 키운다.', 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"철학","href":"/mv/philosophy"},{"name":"서비스","href":"/mv/service"},{"name":"기술","href":"/mv/technology"},{"name":"로드맵","href":"/mv/roadmap"},{"name":"팀","href":"/mv/team"}]',
 '[{"name":"철학","href":"/mv/philosophy"},{"name":"서비스","href":"/mv/service"},{"name":"기술 & 보안","href":"/mv/technology"},{"name":"로드맵","href":"/mv/roadmap"},{"name":"팀","href":"/mv/team"},{"name":"Contact","href":"/mv/contact"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001"}'),

('domo', 'Domo', 'domo.tenone.biz', 'Domo', 'text', '/brands/domo/favicon.png', '/brands/domo/favicon.png',
 '{"primary":"#7F1146","primaryDark":"#5C0C33","secondary":"#A3194F","headerBg":"#2D1B2E","headerText":"#ffffff","footerBg":"#1E1220","footerText":"#a3a3a3","accent":"#7F1146"}',
 'Domo — 인생 2회차, 도모하다', '정년·은퇴 후 새로운 도전을 시작하는 시니어 비즈니스맨을 위한 네트워킹·준비서·기획·투자자문 플랫폼.', NULL,
 '{"도모","Domo","시니어","네트워킹","은퇴","비즈니스","투자자문","기획"}', '/domo',
 '인생 2회차, 함께 도모하다. 시니어 비즈니스맨을 위한 네트워킹 & 비서 서비스.', 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"서비스","href":"/dm/services"},{"name":"네트워크","href":"/dm/network"},{"name":"인사이트","href":"/dm/insights"},{"name":"이벤트","href":"/dm/events"},{"name":"About","href":"/dm/about"}]',
 '[{"name":"서비스 안내","href":"/dm/services"},{"name":"네트워크","href":"/dm/network"},{"name":"About","href":"/dm/about"}]',
 '{"email":"lools@tenone.biz","phone":"+82 10 2795 1001","kakao":"https://open.kakao.com/me/tenone"}'),

('jakka', 'JAKKA', 'jakka.tenone.biz', 'JAKKA', 'text', '/brands/jakka/favicon.png', '/brands/jakka/favicon.png',
 '{"primary":"#111111","primaryDark":"#000000","secondary":"#555555","headerBg":"#ffffff","headerText":"#111111","footerBg":"#1a1a1a","footerText":"#a3a3a3","accent":"#111111"}',
 'JAKKA — 포트폴리오', '사진작가 JAKKA의 포트폴리오. 인물, 스튜디오, 스포츠, 항공, 콘서트 사진.', NULL,
 '{"JAKKA","포트폴리오","사진작가","Photography","Ten:One"}', '/jakka',
 'Capturing moments, telling stories.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"포트폴리오","href":"/jakka"},{"name":"소개","href":"/jk/about"}]',
 '[{"name":"포트폴리오","href":"/jakka"},{"name":"소개","href":"/jk/about"}]',
 '{"email":"lools@tenone.biz"}'),

('changeup', 'ChangeUp', 'changeup.company', 'ChangeUp', 'text', '/brands/changeup/favicon.png', '/brands/changeup/favicon.png',
 '{"primary":"#1AAD64","primaryDark":"#148F52","secondary":"#256EFF","headerBg":"#ffffff","headerText":"#171717","footerBg":"#0F1F2E","footerText":"#a3a3a3","accent":"#1AAD64"}',
 'ChangeUp — 미래를 만드는 일, 창업', 'AI 시대 고등학생·대학생 창업 교육 플랫폼. 부모·학교·지역사회가 함께 투자하는 청소년 창업 생태계.', NULL,
 '{"ChangeUp","창업교육","청소년창업","AI창업","투자","Ten:One"}', '/changeup',
 '미래를 만드는 일, 창업', 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"프로그램","href":"/cu/programs"},{"name":"투자","href":"/cu/invest"},{"name":"스타트업","href":"/cu/startups"},{"name":"커뮤니티","href":"/cu/community"},{"name":"About","href":"/cu/about"}]',
 '[{"name":"프로그램","href":"/cu/programs"},{"name":"투자","href":"/cu/invest"},{"name":"About","href":"/cu/about"}]',
 '{"email":"hello@changeup.company"}'),

('planners', 'Planner''s', 'planners.tenone.biz', 'Planner''s', 'text', '/favicon.ico', '/favicon.ico',
 '{"primary":"#0F766E","primaryDark":"#134E4A","secondary":"#14B8A6","headerBg":"#134E4A","headerText":"#ffffff","footerBg":"#042F2E","footerText":"#99F6E4","accent":"#14B8A6"}',
 'Planner''s — 우리는 모두 기획자다', '기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.', NULL,
 '{"Planner","기획자","기획","Planning","Ten:One"}', '/planners',
 '우리는 모두 기획자다 — 자기 인생에서 만큼은.', 'Powered by Ten:One™', true,
 '{"email":false,"google":false,"kakao":false}',
 '[{"name":"Planner''s","href":"/planners"},{"name":"Planning","href":"/pln?tab=planning"},{"name":"Planner''s Planner","href":"/pln?tab=planner-tool"}]',
 '[{"name":"Planner''s","href":"/planners"},{"name":"Planning","href":"/pln?tab=planning"},{"name":"Planner''s Planner","href":"/pln?tab=planner-tool"}]',
 '{"email":"lools@tenone.biz"}'),

('wio', 'WIO', 'wio.work', 'WIO', 'text', '/favicon.ico', '/favicon.ico',
 '{"primary":"#6366F1","primaryDark":"#4F46E5","secondary":"#818CF8","headerBg":"#0F0F23","headerText":"#ffffff","footerBg":"#0F0F23","footerText":"#94A3B8","accent":"#6366F1"}',
 'WIO — Work In One', '프로젝트 중심으로 사람·일·돈·지식이 하나의 시스템에서 돌아가는 통합 운영 플랫폼. 솔루션 구축과 컨설팅.', NULL,
 '{"WIO","Work In One","프로젝트 관리","ERP","GPR","Vrief","Ten:One"}', '/wio',
 NULL, 'Powered by Ten:One™', true,
 '{"email":true,"google":true,"kakao":true}',
 '[{"name":"솔루션","href":"/wio/solutions"},{"name":"프레임워크","href":"/wio/framework"},{"name":"가격","href":"/wio/pricing"},{"name":"소개","href":"/wio/about"}]',
 '[]', '{}')

ON CONFLICT (site_id) DO NOTHING;

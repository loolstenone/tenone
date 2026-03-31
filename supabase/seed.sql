-- =============================================
-- Seed Data for Dev DB
-- Mock 데이터 → SQL INSERT (개발/테스트용)
-- 2026-03-31
-- =============================================

-- ── CRM People ──
INSERT INTO crm_people (id, brand_id, name, email, phone, type, status, company, position, avatar_initials, brand_association, tags, source, cohort, notes, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'tenone', '김지은', 'jieun@univ.ac.kr', '010-1111-1001', 'Student', 'Active', '서울대학교', '마케팅학과 3학년', 'JE', '{madleap}', '{MADLeap 5기,디지털 마케팅}', 'MADLeap', 'MADLeap 5기', NULL, '2025-03-01'),
('00000000-0000-0000-0000-000000000002', 'tenone', '박민수', 'minsu@univ.ac.kr', NULL, 'Student', 'Active', '고려대학교', '광고홍보학과 4학년', 'MS', '{madleap,madleague}', '{MADLeap 4기,경쟁PT 우수}', 'MADLeap', 'MADLeap 4기', NULL, '2024-03-01'),
('00000000-0000-0000-0000-000000000003', 'tenone', '이서연', 'seoyeon@univ.ac.kr', NULL, 'Student', 'Active', '부산대학교', '경영학과 3학년', 'SY', '{madleague}', '{PAM 2기,브랜딩}', 'MADLeague', 'PAM 2기', NULL, '2025-03-15'),
('00000000-0000-0000-0000-000000000004', 'tenone', '정현우', 'hyunwoo@univ.ac.kr', NULL, 'Student', 'Alumni', '한양대학교', '시각디자인학과 졸업', 'HW', '{madleap}', '{MADLeap 3기,디자인,HeRo 후보}', 'MADLeap', 'MADLeap 3기', NULL, '2023-03-01'),
('00000000-0000-0000-0000-000000000005', 'tenone', '최유나', 'yuna@univ.ac.kr', NULL, 'Student', 'Active', '제주대학교', '관광학과 2학년', 'YN', '{madleague}', '{SUZAK 1기,콘텐츠}', 'MADLeague', 'SUZAK 1기', NULL, '2025-03-20'),
('00000000-0000-0000-0000-000000000006', 'tenone', 'Sarah Kim', 'sarah.kim@cjenm.com', '010-1234-5678', 'Professional', 'Active', 'CJ ENM', 'Brand Manager', 'SK', '{badak,luki}', '{엔터테인먼트,파트너}', 'Badak', NULL, 'LUKI 데뷔 배급 핵심 파트너', '2024-06-01'),
('00000000-0000-0000-0000-000000000007', 'tenone', 'David Lee', 'david@vfx.kr', '010-9876-5432', 'Professional', 'Active', 'Visual FX Studio', 'Creative Director', 'DL', '{badak,rook}', '{3D,VFX,외주}', 'Badak', NULL, 'RooK 3D 에셋 주 공급', '2024-01-15'),
('00000000-0000-0000-0000-000000000008', 'tenone', '한수진', 'sujin@digitalagency.kr', NULL, 'Professional', 'Active', 'Digital First', 'Account Director', 'SJ', '{badak}', '{디지털,퍼포먼스}', 'Badak', NULL, NULL, '2024-08-01'),
('00000000-0000-0000-0000-000000000009', 'tenone', '오태영', 'taeyoung@startup.io', NULL, 'Professional', 'Active', 'GrowthLab', 'CMO', 'TY', '{badak,youinone}', '{스타트업,그로스}', 'Badak', NULL, NULL, '2024-05-01'),
('00000000-0000-0000-0000-000000000010', 'tenone', '김도현', 'dohyun@adagency.com', NULL, 'Professional', 'Lead', 'HSAD', 'AE', 'DH', '{badak}', '{광고,기획}', 'Referral', NULL, NULL, '2025-09-01'),
('00000000-0000-0000-0000-000000000011', 'tenone', '이준혁', 'junhyuk@youinone.com', NULL, 'Mentor', 'Active', 'YouInOne', '거점 멘토 (서울)', 'JH', '{youinone,madleap}', '{멘토,마케팅 전략}', 'MADLeap 출신', NULL, NULL, '2024-01-01'),
('00000000-0000-0000-0000-000000000012', 'tenone', '박소현', 'sohyun@youinone.com', NULL, 'Mentor', 'Active', 'YouInOne', '거점 멘토 (부산)', 'SH', '{youinone,madleague}', '{멘토,브랜딩}', 'Badak 출신', NULL, NULL, '2024-06-01'),
('00000000-0000-0000-0000-000000000013', 'tenone', '강민재', 'minjae@youinone.com', NULL, 'Mentor', 'Active', 'YouInOne', '선배 멘토', 'MJ', '{youinone}', '{멘토,콘텐츠}', 'MADLeague 출신', NULL, NULL, '2025-01-01'),
('00000000-0000-0000-0000-000000000014', 'tenone', 'Minji Park', 'minji.vlog@gmail.com', '010-5555-5555', 'Partner', 'Lead', 'Freelance', 'Influencer', 'MP', '{madleague}', '{인플루언서,앰배서더 후보}', 'MADLeague', NULL, 'MAD League Season 2 앰배서더 후보', '2025-07-01'),
('00000000-0000-0000-0000-000000000015', 'tenone', '장우성', 'wooseong@youngyang.go.kr', NULL, 'Client', 'Active', '경상북도 영양군', '지역활성화팀 주임', 'WS', '{madleague}', '{지자체,인사이트 투어링}', 'Direct', NULL, '인사이트 투어링 담당자', '2025-08-01');

-- ── CRM Organizations ──
INSERT INTO crm_organizations (id, brand_id, name, type, industry, website, brand_association, status, notes, created_at) VALUES
('00000000-0000-0000-0001-000000000001', 'tenone', 'CJ ENM', 'Partner', '엔터테인먼트', 'https://cjenm.com', '{luki,badak}', 'Active', NULL, '2024-06-01'),
('00000000-0000-0000-0001-000000000002', 'tenone', 'Visual FX Studio', 'Vendor', 'VFX/3D', 'https://vfx.kr', '{rook}', 'Active', NULL, '2024-01-15'),
('00000000-0000-0000-0001-000000000003', 'tenone', '경상북도 영양군', 'Client', '지방자치단체', NULL, '{madleague}', 'Active', '인사이트 투어링 파트너', '2025-08-01'),
('00000000-0000-0000-0001-000000000004', 'tenone', '지평막걸리', 'Sponsor', '식음료', 'https://jipyeong.co.kr', '{madleague}', 'Active', '경쟁PT 호스트 브랜드', '2025-01-01'),
('00000000-0000-0000-0001-000000000005', 'tenone', 'LG U+', 'Sponsor', '통신', 'https://uplus.co.kr', '{madleague}', 'Active', '경쟁PT 호스트 브랜드', '2025-03-01'),
('00000000-0000-0000-0001-000000000006', 'tenone', 'Digital First', 'Partner', '디지털 마케팅', NULL, '{badak}', 'Active', NULL, '2024-08-01'),
('00000000-0000-0000-0001-000000000007', 'tenone', 'GrowthLab', 'Partner', '스타트업', NULL, '{youinone}', 'Active', NULL, '2024-05-01'),
('00000000-0000-0000-0001-000000000008', 'tenone', 'SBA 서울산업진흥원', 'Partner', '공공기관', NULL, '{tenone}', 'Active', '심사위원 활동', '2024-01-01');

-- ── CRM Org-Contact Links ──
INSERT INTO crm_org_contacts (organization_id, person_id) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000007'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000015'),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000008'),
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000009');

-- ── CRM Deals ──
INSERT INTO crm_deals (id, brand_id, title, organization_id, contact_id, stage, value, currency, expected_close_date, notes, created_at, updated_at) VALUES
('00000000-0000-0000-0002-000000000001', 'tenone', 'MADLeague 인사이트 투어링 - 영양군', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000015', 'Negotiation', 8000000, 'KRW', '2025-10-15', '2025 하반기 인사이트 투어링 프로그램', '2025-08-15', '2025-09-10'),
('00000000-0000-0000-0002-000000000002', 'tenone', '지평막걸리 경쟁PT 스폰서십', '00000000-0000-0000-0001-000000000004', NULL, 'Won', 5000000, 'KRW', NULL, NULL, '2025-01-20', '2025-02-10'),
('00000000-0000-0000-0002-000000000003', 'tenone', 'LG U+ Re:zeros 경쟁PT', '00000000-0000-0000-0001-000000000005', NULL, 'Won', 7000000, 'KRW', NULL, NULL, '2025-03-01', '2025-04-15'),
('00000000-0000-0000-0002-000000000004', 'tenone', 'CJ ENM LUKI 콜라보레이션', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000006', 'Proposal', 20000000, 'KRW', '2025-12-01', NULL, '2025-09-01', '2025-09-10'),
('00000000-0000-0000-0002-000000000005', 'tenone', 'RooK VFX 제작 계약', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000007', 'Contacted', 3000000, 'KRW', NULL, NULL, '2025-09-05', '2025-09-05'),
('00000000-0000-0000-0002-000000000006', 'tenone', 'Badak 밋업 스폰서 (Digital First)', '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000008', 'Lead', 1000000, 'KRW', NULL, NULL, '2025-09-12', '2025-09-12');

-- ── CRM Activities ──
INSERT INTO crm_activities (id, brand_id, type, title, description, person_id, organization_id, deal_id, date, created_at) VALUES
('00000000-0000-0000-0003-000000000001', 'tenone', 'Meeting', '영양군 인사이트 투어링 킥오프', '프로그램 일정 및 예산 논의', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000001', '2025-09-10', '2025-09-10'),
('00000000-0000-0000-0003-000000000002', 'tenone', 'Email', 'CJ ENM LUKI 콜라보 제안서 발송', NULL, '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000004', '2025-09-08', '2025-09-08'),
('00000000-0000-0000-0003-000000000003', 'tenone', 'Call', 'David Lee RooK 프로젝트 논의', NULL, '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000005', '2025-09-05', '2025-09-05'),
('00000000-0000-0000-0003-000000000004', 'tenone', 'Event', 'MADLeap 5기 OT', '신입 멤버 오리엔테이션', '00000000-0000-0000-0000-000000000001', NULL, NULL, '2025-03-08', '2025-03-08'),
('00000000-0000-0000-0003-000000000005', 'tenone', 'Meeting', 'YouInOne 멘토단 회의', '2025 하반기 멘토링 계획', '00000000-0000-0000-0000-000000000011', NULL, NULL, '2025-09-01', '2025-09-01'),
('00000000-0000-0000-0003-000000000006', 'tenone', 'Note', 'Badak 밋업 스폰서 아이디어', 'Digital First 한수진 대표와 밋업 협찬 논의 필요', '00000000-0000-0000-0000-000000000008', NULL, '00000000-0000-0000-0002-000000000006', '2025-09-12', '2025-09-12'),
('00000000-0000-0000-0003-000000000007', 'tenone', 'Email', 'MADLeague Season 2 앰배서더 제안', NULL, '00000000-0000-0000-0000-000000000014', NULL, NULL, '2025-09-01', '2025-09-01'),
('00000000-0000-0000-0003-000000000008', 'tenone', 'Meeting', '지평막걸리 경쟁PT 결과 보고', NULL, NULL, '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000002', '2025-04-20', '2025-04-20'),
('00000000-0000-0000-0003-000000000009', 'tenone', 'Event', 'Re:zeros 경쟁PT 본선', '4팀 참가, LG U+ 본사', NULL, '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000003', '2025-04-10', '2025-04-10'),
('00000000-0000-0000-0003-000000000010', 'tenone', 'Call', 'SBA 심사위원 일정 확인', NULL, NULL, '00000000-0000-0000-0001-000000000008', NULL, '2025-08-25', '2025-08-25');

-- ── Marketing Campaigns ──
INSERT INTO marketing_campaigns (id, name, type, status, brand_id, description, budget, spent, kpi, assignee, start_date, end_date, channels, created_at) VALUES
('camp-0001', 'LUKI 데뷔 캠페인', 'Brand', 'Completed', 'luki', 'AI 4인조 걸그룹 LUKI 공식 데뷔 론칭', 15000000, 12000000, '유튜브 구독자 1,000명', 'Cheonil Jeon', '2025-07-01', '2025-09-30', '{YouTube,Instagram,TikTok}', '2025-06-15'),
('camp-0002', 'MADLeague 인사이트 투어링', 'Event', 'Active', 'madleague', '영양군 지역 활동가와 학생 연계 프로그램', 8000000, 3000000, '참가 학생 30명, 기업 만족도 4.0', 'Cheonil Jeon', '2025-09-01', '2025-11-30', '{오프라인,SNS}', '2025-08-01'),
('camp-0003', 'Badak 월간 밋업', 'Event', 'Active', 'badak', '마케팅·광고 현업자 월 1회 소규모 유료 밋업', 2000000, 600000, '월 20명 참가, 유료 전환', 'Sarah Kim', '2025-09-01', NULL, '{카카오,오프라인}', '2025-08-20'),
('camp-0004', 'RooK AI 크리에이터 쇼케이스', 'Content', 'Draft', 'rook', 'AI 생성 아트워크 온라인 전시', 5000000, 0, '전시 방문 500명', 'Cheonil Jeon', '2025-11-01', NULL, '{Website,Instagram}', '2025-09-10'),
('camp-0005', 'MADLeap 5기 모집', 'Brand', 'Completed', 'madleap', '2025 서울·경기 대학생 동아리 5기 모집', 1000000, 800000, '지원자 100명, 선발 30명', '김준호', '2025-01-15', '2025-03-01', '{Instagram,대학 게시판}', '2025-01-10'),
('camp-0006', 'CJ ENM LUKI 콜라보', 'Partnership', 'Active', 'luki', 'CJ ENM과 LUKI IP 활용 콜라보레이션', 20000000, 0, '콜라보 콘텐츠 3건', 'Sarah Kim', '2025-10-01', NULL, '{TV,Digital}', '2025-09-01');

-- ── Marketing Leads ──
INSERT INTO marketing_leads (id, name, company, email, phone, stage, source, value, assignee, notes, created_at) VALUES
('lead-0001', '이상호', '스타트업 코리아', 'sangho@startup.kr', NULL, 'Qualified', 'Direct', 5000000, 'Sarah Kim', '마케팅 대행 관심', '2025-09-10'),
('lead-0002', '박지영', '뷰티브랜드 A', 'jiyoung@beauty.com', '010-3333-4444', 'Proposal', 'Referral', 10000000, 'Cheonil Jeon', 'LUKI 모델 활용 제안', '2025-09-05'),
('lead-0003', '김태준', '지역관광공사', 'taejun@tourism.go.kr', NULL, 'New', 'Event', 8000000, 'Cheonil Jeon', '인사이트 투어링 확장 논의', '2025-09-14'),
('lead-0004', '정수민', '디지털 에이전시 B', 'sumin@agency.kr', NULL, 'Contacted', 'Website', 3000000, 'Sarah Kim', NULL, '2025-09-12'),
('lead-0005', '홍민석', '패션브랜드 C', 'minseok@fashion.com', NULL, 'Negotiation', 'Direct', 15000000, 'Cheonil Jeon', 'FWN 패션위크 파트너십', '2025-08-20'),
('lead-0006', '윤서아', NULL, 'seoa@univ.ac.kr', NULL, 'Won', 'Direct', 500000, '김준호', '매드리그 경쟁PT 호스트 연결', '2025-08-01');

-- ── Marketing Content ──
INSERT INTO marketing_content (id, title, type, status, channel, brand_id, assignee, publish_date, engagement, created_at) VALUES
('cp-0001', '마케팅 트렌드 위클리 #38', 'Newsletter', 'Published', 'Badak', 'badak', 'Cheonil Jeon', '2025-09-16', 245, '2025-09-14'),
('cp-0002', 'LUKI "Starlight" MV Behind', 'Video', 'Published', 'YouTube', 'luki', 'Cheonil Jeon', '2025-09-10', 1200, '2025-09-08'),
('cp-0003', '공모전 정보 모음 9월', 'Article', 'Scheduled', 'MADLeague', 'madleague', '김준호', '2025-09-18', 0, '2025-09-15'),
('cp-0004', '서울패션위크 2025 프리뷰', 'Article', 'Draft', 'FWN', 'fwn', 'Cheonil Jeon', NULL, 0, '2025-09-12'),
('cp-0005', '감자의 하루 ep.12', 'SNS', 'Published', '0gamja', '0gamja', 'Cheonil Jeon', '2025-09-14', 89, '2025-09-13'),
('cp-0006', 'MADLeap 5기 활동 브이로그', 'Shorts', 'Scheduled', 'MADLeap', 'madleap', '김준호', '2025-09-20', 0, '2025-09-16');

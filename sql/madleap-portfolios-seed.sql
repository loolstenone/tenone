-- MADLeap 포트폴리오 시드 데이터 (madleap.co.kr 실제 프로젝트 기반)
-- 정직성 회복: 기존 mock 12건 → 실 데이터 17건 교체 (2026-05-25, 세션 150)
--
-- 적용 방법: madleap_portfolios 테이블이 비어있을 때만 실행
-- (기존 시드 충돌 방지)

DELETE FROM madleap_portfolios;

INSERT INTO madleap_portfolios (title, team, gen, gen_num, category, client, description, tags, award, gradient, sort_order) VALUES
  -- 4기 메인프로젝트
  ('아이디어 무브먼트 3회 캠페인', 'Team Movement', '4기', 4, '캠페인', '아이디어 무브먼트',
   '아이디어 무브먼트 3회 — 매드립이 직접 기획·운영한 자체 캠페인. 상세 정보 보강 예정.',
   ARRAY['자체기획','캠페인'], NULL, 'from-violet-400 to-purple-500', 106),

  ('리제로스 냉각 솔루션 사업 전략', 'Team Rezeros', '4기', 4, '마케팅 전략', '리제로스',
   '냉각 솔루션 스타트업의 비즈니스 전략 기획. 상세 정보 보강 예정.',
   ARRAY['스타트업','B2B'], NULL, 'from-cyan-400 to-blue-500', 105),

  ('MADVENTURE 창업 브랜드 론칭', 'Team Adventure', '4기', 4, '브랜딩', 'MADVENTURE',
   '창업 브랜드 론칭 — 매드립 자체 사이드 프로젝트. 상세 정보 보강 예정.',
   ARRAY['창업','브랜드 런칭'], NULL, 'from-amber-400 to-orange-500', 104),

  ('대성학원 마케팅 인턴십', 'Team Daesung', '4기', 4, '마케팅 전략', '대성학원',
   '대성학원과 진행한 산학 마케팅 인턴십 프로젝트. 상세 정보 보강 예정.',
   ARRAY['교육','산학협력'], NULL, 'from-blue-500 to-indigo-500', 103),

  ('STARBUCKS 마케팅 전략', 'Team Brew', '4기', 4, '마케팅 전략', 'STARBUCKS',
   '스타벅스 대상 마케팅 전략 제안. 상세 정보 보강 예정.',
   ARRAY['F&B','글로벌'], NULL, 'from-emerald-400 to-teal-500', 102),

  ('UNIQLO 온보딩 프로젝트 매듭', 'Team Knot', '4기', 4, '브랜드 캠페인', 'UNIQLO',
   '유니클로 브랜드 캠페인 — 4기 온보딩 프로젝트 매듭. 상세 정보 보강 예정.',
   ARRAY['패션','온보딩'], NULL, 'from-red-400 to-pink-500', 101),

  -- 3기 프로젝트
  ('아이디어 무브먼트 2회', 'Team Movement', '3기', 3, '캠페인', '아이디어 무브먼트',
   '아이디어 무브먼트 2회 자체 캠페인.',
   ARRAY['자체기획','캠페인'], NULL, 'from-violet-400 to-purple-500', 86),

  ('지평주조 리브랜딩', 'Team HOPS', '3기', 3, '브랜딩', '지평주조',
   '지평막걸리 리브랜딩 프로젝트. 기간: 2024.07.20–2024.09.28.',
   ARRAY['리브랜딩','주류마케팅'], NULL, 'from-amber-400 to-orange-500', 85),

  ('ECOHI 플로깅 앱 마케팅', 'Team Ecohi', '3기', 3, '캠페인', 'ECOHI',
   'ECOHI 플로깅 앱 마케팅 캠페인. 기간: 2024.05.04–2024.06.01.',
   ARRAY['앱마케팅','ESG'], NULL, 'from-green-400 to-emerald-500', 84),

  ('LG U+ 멤버십 유플투쁠', 'Team UPlus', '3기', 3, '마케팅 전략', 'LG U+',
   'LG U+ 산학협력 — 멤버십 유플투쁠 기획. 기간: 2024.07.05–2024.07.29.',
   ARRAY['통신','산학협력','멤버십'], NULL, 'from-pink-400 to-rose-500', 83),

  ('ASKTobi AI 플랫폼 마케팅', 'Team Tobi', '3기', 3, '마케팅 전략', 'ASKTobi',
   'AI 플랫폼 ASKTobi 마케팅 서브 프로젝트. 기간: 2024.05.25–2024.06.15.',
   ARRAY['AI','플랫폼','SaaS'], NULL, 'from-indigo-400 to-violet-500', 82),

  ('ESteem C.at Work Festa', 'Team Esteem', '3기', 3, '캠페인', 'ESteem',
   'ESteem 주관 C.at Work Festa 이벤트 캠페인.',
   ARRAY['이벤트','컨퍼런스'], NULL, 'from-teal-400 to-cyan-500', 81),

  ('Belkin Korea 브랜딩', 'Team Belkin', '3기', 3, '브랜딩', 'Belkin Korea',
   'Belkin Korea 브랜딩 프로젝트.',
   ARRAY['글로벌','액세서리'], NULL, 'from-neutral-600 to-neutral-800', 80),

  ('온보딩 프로젝트 매듭 신규개설', 'Team Knot', '3기', 3, '프로그램', '매드립',
   '신입 기수 온보딩 프로젝트 매듭 신규 개설. 매드립 내부 프로그램.',
   ARRAY['온보딩','내부'], NULL, 'from-lime-400 to-green-500', 79),

  -- 2기 프로젝트
  ('학교폭력 예방 스마트폰 영상제', 'Team Anti-Bully', '2기', 2, '콘텐츠', '학교폭력 예방',
   '학교폭력 예방 스마트폰 영상제. 영상 콘텐츠 기획·제작.',
   ARRAY['공익','영상콘텐츠'], NULL, 'from-sky-400 to-blue-500', 65),

  ('아이디어 무브먼트 1회', 'Team Movement', '2기', 2, '캠페인', '아이디어 무브먼트',
   '아이디어 무브먼트 1회 — 자체 캠페인의 시작.',
   ARRAY['자체기획','캠페인'], NULL, 'from-violet-400 to-purple-500', 64),

  ('SBA 뷰티패션 영상광고', 'Team SBA', '2기', 2, '콘텐츠', '서울산업진흥원(SBA)',
   '서울산업진흥원(SBA) 뷰티패션 영상광고 제작.',
   ARRAY['공공기관','영상광고','뷰티'], NULL, 'from-rose-400 to-pink-500', 63);

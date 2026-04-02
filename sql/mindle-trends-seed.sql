-- mindle_trends 시드 데이터 (Mock → DB 이관)
-- 2026-04-03

INSERT INTO mindle_trends (title, summary, full_content, category, tags, relevance_score, agent_name, status, is_featured, view_count, published_at, tenant_id) VALUES

('에이전트 AI가 일하는 방식을 바꾸고 있다 — 2026 생산성의 새로운 공식',
 '단순 챗봇을 넘어 자율적으로 업무를 수행하는 에이전트 AI. 기업 도입이 가속화되는 이유와 금융, 마케팅, 크리에이티브 프로덕션 등 각 산업에서 실제 워크플로우가 어떻게 변화하고 있는지 분석합니다.',
 'Agent AI는 단순 챗봇을 넘어 독립적으로 업무를 수행하는 새로운 형태의 AI입니다.',
 'AI / 테크', ARRAY['AI','에이전트','생산성'], 9.5, 'Mindle AI', 'published', true, 3420,
 '2026-03-26'::timestamptz, 'tenone'),

('숏폼 피로감과 슬로우 콘텐츠의 부상',
 'TikTok·Reels 체류 시간이 줄어들며 팟캐스트와 롱폼 영상이 다시 주목받고 있다.',
 '숏폼 콘텐츠의 피로감이 데이터로 드러나고 있습니다.',
 '콘텐츠', ARRAY['숏폼','콘텐츠','트렌드'], 8.2, 'Mindle AI', 'published', false, 2180,
 '2026-03-25'::timestamptz, 'tenone'),

('하이퍼로컬 비즈니스가 글로벌로 확장하는 플레이북',
 '동네 가게가 글로벌 브랜드가 되는 시대. 지역→글로벌 성공 패턴을 분석한다.',
 '동네 가게가 글로벌 브랜드가 되는 시대.',
 '비즈니스', ARRAY['로컬','글로벌','확장'], 9.0, 'Mindle AI', 'published', false, 1890,
 '2026-03-24'::timestamptz, 'tenone'),

('디지털 디톡스 = 새로운 럭셔리?',
 '연결 해제가 프리미엄 소비가 되는 역설. 오프라인 전용 공간에 돈을 쓰는 이유.',
 '디지털 디톡스가 새로운 럭셔리가 되고 있습니다.',
 '라이프스타일', ARRAY['디톡스','럭셔리','오프라인'], 6.5, 'Mindle AI', 'published', false, 987,
 '2026-03-23'::timestamptz, 'tenone'),

('Z세대 가치 소비 — 브랜드는 어떻게 적응하고 있나',
 '경험 우선, 가치 중심 소비 패턴이 전 세대로 확산되고 있다.',
 '가치 기반 소비가 Z세대를 넘어 전 세대로 확산되고 있습니다.',
 '소비자', ARRAY['Z세대','가치소비','브랜드'], 9.2, 'Mindle AI', 'published', false, 2650,
 '2026-03-22'::timestamptz, 'tenone'),

('공간 컴퓨팅: 대중화까지 남은 거리는?',
 '새로운 디바이스 물결과 킬러앱 논쟁. 보급률과 앱 생태계를 진단한다.',
 '공간 컴퓨팅의 대중화는 얼마나 남았을까?',
 'AI / 테크', ARRAY['공간컴퓨팅','VR','AR'], 7.0, 'Mindle AI', 'published', false, 1540,
 '2026-03-21'::timestamptz, 'tenone'),

('마이크로 SaaS 붐 — 1인 개발자의 시대',
 'AI로 빠르게 만든 MVP가 니치 시장을 장악한다. 인디 해커 성공 사례 분석.',
 'AI 기반 빠른 MVP 개발로 니치 시장을 공략하는 마이크로 SaaS 붐.',
 '비즈니스', ARRAY['SaaS','인디해커','MVP'], 8.5, 'Mindle AI', 'published', false, 2100,
 '2026-03-20'::timestamptz, 'tenone'),

('AI 카피라이팅의 한계와 인간+AI 협업 모델',
 '초기 과열이 품질 논란으로 전환. 브랜드들이 협업 모델로 이동하는 이유.',
 'AI 카피라이팅의 한계와 인간+AI 협업 모델의 부상.',
 '마케팅', ARRAY['AI','카피라이팅','협업'], 5.5, 'Mindle AI', 'published', false, 1230,
 '2026-03-19'::timestamptz, 'tenone'),

('경험 경제 — 이제 우리는 경험을 산다',
 '소유보다 경험. 경험 소비 데이터가 전 연령대에서 확대되고 있다.',
 '소유보다 경험. 경험 소비 데이터가 전 연령대에서 확대되고 있습니다.',
 '소비자', ARRAY['경험경제','소비','트렌드'], 8.0, 'Mindle AI', 'published', false, 1856,
 '2026-03-18'::timestamptz, 'tenone'),

('크리에이터 이코노미 × 로컬 = 새로운 공식',
 '지역 기반 크리에이터가 진정성으로 글로벌 팬베이스를 구축하는 방법.',
 '지역 기반 크리에이터가 진정성으로 글로벌 팬베이스를 구축하는 방법.',
 '콘텐츠', ARRAY['크리에이터','로컬','팬베이스'], 6.8, 'Mindle AI', 'published', false, 890,
 '2026-03-17'::timestamptz, 'tenone'),

('구독 피로감: 번들링의 귀환',
 '구독 한계에 다다른 소비자. 플랫폼들이 슈퍼 번들과 유연한 티어로 대응한다.',
 '구독 피로감이 정점에 달하면서 번들링이 돌아오고 있습니다.',
 '비즈니스', ARRAY['구독','번들링','SaaS'], 8.3, 'Mindle AI', 'published', false, 1340,
 '2026-03-16'::timestamptz, 'tenone'),

('AI 생성 UGC: 진정성의 위기',
 'AI가 사용자 콘텐츠를 만들면 신뢰가 무너진다. 플랫폼의 검증 전쟁.',
 'AI가 사용자 콘텐츠를 생성하면 신뢰가 무너집니다.',
 '마케팅', ARRAY['AI','UGC','진정성'], 7.2, 'Mindle AI', 'published', false, 1678,
 '2026-03-15'::timestamptz, 'tenone')

ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- UC 지급 규칙 현실화 — 2026-10-12 (사용자 결정, 운영 DB 적용)
--
-- 배경: 1 UC = 1원. 기존 금액(가입 3,000 · 모임 참여 5,000 · 승급 3,000 …)은
--       결제가 열려 UC가 현금처럼 쓰이면 큰 부담. UC는 공개 전까지 사용자에게 숨기고(lib/uc-visibility.ts) 뒤에서만 적립.
--
-- 원칙
--   1. 다른 사람에게 도움이 되는 행동(콘텐츠·후기·운영·초대)에 더 주고, 본인을 위한 행동(체크인·참여)은 상징 수준
--   2. 금액은 대략 기존의 1/5 ~ 1/10. 일상 행동 1~50원, 기여 100~1,000원
--   3. 회원 1명 월 총량 3,000 UC (lib/uc-visibility.ts UC_MEMBER_MONTHLY_CAP — 코드에서 강제)
--   4. monthly_cap = 한 달 지급 '횟수'. 0은 earnUC에서 '지급 불가'로 동작하므로 쓰지 않는다
--   5. 매칭·채용 성사 보상은 비활성 — 직업소개사업 미신고, 채용 성사 대가로 해석될 수 있음 (직업안정법)
--   6. SNS 공유·매칭 확인은 비활성 — 남용 쉽고 기여가 아님
--
-- 롤백: 각 줄 주석의 (기존 금액/횟수)로 되돌린다
-- ────────────────────────────────────────────────────────────────

UPDATE uc_earn_rules r
SET amount = v.amount, monthly_cap = v.cap, is_active = v.active
FROM (VALUES
  -- 유니버스 공통 (brand_id NULL)
  ('signup_complete',          NULL,        1000,  1, true),   -- (3000/1)
  ('profile_complete',         NULL,         300,  1, true),   -- (1000/1)
  ('profile_advanced',         NULL,         500,  1, true),   -- (2000/1)
  ('refer_join',               NULL,        1000,  2, true),   -- (4000/2) 친구 초대 가입
  ('refer_event',              NULL,         300,  2, true),   -- (2000/2)
  ('submit_feedback',          NULL,         100,  2, true),   -- (500/2)
  ('submit_interview',         NULL,        1000,  1, true),   -- (5000/1)
  ('share_sns',                NULL,         100,  3, false),  -- (1000/3) 비활성
  -- Badak
  ('write_post',               'badak',       50,  5, true),   -- (500/5)
  ('write_comment',            'badak',       10, 10, true),   -- (200/10)
  ('post_featured',            'badak',      200,  3, true),   -- (1000/3)
  ('write_review',             'badak',      300,  1, true),   -- (2000/1)
  ('submit_story',             'badak',     1000,  1, true),   -- (5000/1)
  ('create_group',             'badak',      500,  1, true),   -- (3000/1) 모임 개설 = 운영 기여
  ('join_group',               'badak',      100,  1, true),   -- (5000/1) 참여는 본인 행동
  ('event_volunteer',          'badak',     1000,  1, true),   -- (5000/1)
  ('first_purchase',           'badak',     1000,  1, true),   -- (5000/1)
  -- HeRo
  ('hero_daily_checkin',       'hero',         5, 31, true),   -- (50/1500)
  ('hero_streak_7d',           'hero',        50,  1, true),   -- (200/200)
  ('hero_streak_30d',          'hero',       200,  1, true),   -- (1000/1000)
  ('hero_streak_100d',         'hero',      1000,  1, true),   -- (5000/5000)
  ('hero_stage_up',            'hero',       300,  5, true),   -- (3000/15000)
  ('hero_goal_weekly_checkin', 'hero',        10,  5, true),   -- (100/500)
  ('hero_goal_completed',      'hero',       200,  3, true),   -- (2000/6000)
  ('enable_hero_badge',        'hero',       100,  1, true),   -- (300/0 — 0이라 지급 불가였음)
  ('register_tih',             'hero',       300,  1, true),   -- (500/1)
  ('register_jd',              'hero',       100,  3, true),   -- (300/3)
  ('write_coaching_review',    'hero',       300,  2, true),   -- (300/2)
  ('write_hero_story',         'hero',      1000,  1, true),   -- (1000/1)
  ('hero_match_acknowledge',   'hero',        30, 10, false),  -- (30/300) 비활성
  ('match_trial_start',        'hero',       500,  1, false),  -- (500/999) 비활성 — 직업안정법
  ('match_trial_success',      'hero',      5000,  1, false),  -- (5000/999) 비활성 — 직업안정법
  ('match_referral',           'hero',     10000,  1, false),  -- (10000/999) 비활성 — 직업안정법
  -- EvSchool · Planner's (교육)
  ('complete_course',          'evschool',   500,  1, true),   -- (5000/1)
  ('complete_lesson',          'evschool',    50,  5, true),   -- (1000/5)
  ('submit_assignment',        'evschool',    50,  5, true),   -- (500/5)
  ('write_edu_review',         'evschool',   300,  1, true),   -- (2000/1)
  ('first_purchase',           'evschool',  1000,  1, true),   -- (5000/1)
  ('complete_course',          'planners',   500,  1, true),   -- (5000/1)
  ('complete_lesson',          'planners',    50,  5, true),   -- (1000/5)
  ('submit_assignment',        'planners',    50,  5, true),   -- (500/5)
  ('write_edu_review',         'planners',   300,  1, true),   -- (2000/1)
  ('first_purchase',           'planners',  1000,  1, true),   -- (5000/1)
  -- 기타
  ('submit_article',           'mindle',    1000,  1, true),   -- (5000/1)
  ('first_purchase',           'naturebox', 1000,  1, true),   -- (5000/1)
  ('write_product_review',     'naturebox',  300,  3, true),   -- (1500/3)
  ('subscription_renew',       'smarcomm',   500,  1, true),   -- (2000/1)
  ('subscription_renew',       'wio',        500,  1, true),   -- (2000/1)
  ('first_purchase',           'wio',       1000,  1, true)    -- (5000/1)
) AS v(action_key, brand_id, amount, cap, active)
WHERE r.action_key = v.action_key
  AND r.brand_id IS NOT DISTINCT FROM v.brand_id;

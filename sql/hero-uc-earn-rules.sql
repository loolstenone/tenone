-- ────────────────────────────────────────────────────────────────
-- HeRo: Universe Coin 획득 규칙 시드
-- Phase 0-4 · 2026-04-22
--
-- uc_earn_rules 스키마: id, action_key, brand_id, amount, monthly_cap, is_active, label
-- monthly_cap: -1 = 무제한, 0 = 생애 1회, n = 월 n회
--
-- HeRo funnel 단계별 리워드 설계:
--   ① 비회원 → 회원 전환 시 link-member로 소급 UC 지급 가능성 열어둠
--   ② 회원 → 유료 전환 시 큰 UC 수익 (coaching 구매)
--   ③ 매칭 성사 → 건별 대형 보상 (핵심 수익 액션)
-- ────────────────────────────────────────────────────────────────

INSERT INTO uc_earn_rules (action_key, brand_id, amount, monthly_cap, is_active, label)
VALUES
  -- HIT 검사 완료 (생애 1회)
  ('complete_hit_a',        'hero', 1000, 0, true, 'HIT A 검사 완료 (기저 심리)'),
  ('complete_hit_b',        'hero', 1500, 0, true, 'HIT B 검사 완료 (역량·준비도)'),
  ('complete_hit_c',        'hero',  800, 0, true, 'HIT C 검사 완료 (이직 동기)'),
  ('complete_hit_d',        'hero',  800, 0, true, 'HIT D 검사 완료 (전문성·리더십)'),
  ('complete_hit_e',        'hero',  800, 0, true, 'HIT E 검사 완료 (인생 2막)'),
  ('complete_hit_f',        'hero',  800, 0, true, 'HIT F 검사 완료 (회복력·재진입)'),

  -- JH (인재의 바람) 작성
  ('complete_jh',           'hero',  500, 0,  true, 'JH 12문항 작성 완료'),
  ('update_jh_quarterly',   'hero',  200, 1,  true, 'JH 분기 재작성 (월 1회)'),

  -- TIH·JD (기업 측 작성, 기업 담당자에게 지급)
  ('register_tih',          'hero',  500, 1,  true, 'TIH 제출 (기업 담당자)'),
  ('register_jd',           'hero',  300, 3,  true, 'JD 등록 (기업 담당자, 월 3회)'),

  -- 매칭 성사 (핵심 수익 액션)
  ('match_trial_start',     'hero',  500, -1, true, '매칭 트라이얼 시작'),
  ('match_trial_success',   'hero', 5000, -1, true, '매칭 트라이얼 성공'),
  ('match_referral',        'hero',10000, -1, true, '친구 추천 매칭 성사'),

  -- 참여/후기
  ('write_coaching_review', 'hero',  300, 2,  true, '코칭 후기 작성 (월 2회)'),
  ('write_hero_story',      'hero', 1000, 1,  true, 'HeRo 스토리 기고 (월 1회)'),

  -- Badge opt-in (Universe 참여)
  ('enable_hero_badge',     'hero',  300, 0,  true, 'Universe HeRo 배지 활성화')
ON CONFLICT DO NOTHING;

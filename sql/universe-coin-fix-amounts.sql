-- UC 적립량 1:1 기준으로 10배 상향 (1 UC = 1 KRW)
-- 월 최대 적립: ~14,000 UC ≈ 2달 풀 적립으로 30만원 모임 10%(3만원) 할인 가능
UPDATE uc_earn_rules SET amount = 5000 WHERE action_key = 'join_group'   AND brand_id = 'badak';
UPDATE uc_earn_rules SET amount = 2000 WHERE action_key = 'write_review' AND brand_id = 'badak';
UPDATE uc_earn_rules SET amount = 3000 WHERE action_key = 'create_group' AND brand_id = 'badak';
UPDATE uc_earn_rules SET amount = 4000 WHERE action_key = 'refer_join'   AND brand_id IS NULL;
UPDATE uc_earn_rules SET amount = 1000 WHERE action_key = 'profile_complete' AND brand_id IS NULL;

-- 깜바닥 → 인증 바닥장 (note만 정리, 명칭 미확정)
UPDATE badak_fee_configs SET note = '인증 바닥장 수수료 15%' WHERE scope = 'certification';

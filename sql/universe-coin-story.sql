-- 바닥 스토리 제출 코인 룰 추가
-- 5,000 UC / 월 1회 한도
INSERT INTO uc_earn_rules (action_key, brand_id, amount, monthly_cap, label)
VALUES ('submit_story', 'badak', 5000, 1, '성장 스토리 제출')
ON CONFLICT DO NOTHING;

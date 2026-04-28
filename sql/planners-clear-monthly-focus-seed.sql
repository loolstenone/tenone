-- 시드된 monthly focus_areas 초기화 — 사용자가 직접 선택한 값만 남기는 정책
-- theme/goals/reflection은 보존, focus_areas만 빈 배열로
UPDATE planners_monthly
SET focus_areas = '{}'::text[]
WHERE member_id = (SELECT id FROM members WHERE email = 'lools@tenone.biz');

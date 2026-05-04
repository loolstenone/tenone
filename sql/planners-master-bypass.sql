-- 마스터(lools@tenone.biz) 계정의 myverse_users row 보강
-- 온보딩을 거치지 않아도 즉시 앱 사용 가능하도록 onboarding_completed=true 마킹
-- + myverse_users row 가 없으면 기본값으로 생성

INSERT INTO myverse_users (member_id, mode, onboarding_completed, subscription_status, ai_morning_time, ai_evening_time, ai_tone)
SELECT m.id, 'all_in_one', TRUE, 'active', '08:00', '21:00', 'professional'
FROM members m
WHERE m.email = 'lools@tenone.biz'
ON CONFLICT (member_id) DO UPDATE
  SET onboarding_completed = TRUE,
      updated_at = NOW();

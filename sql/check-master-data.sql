-- lools@tenone.biz (마스터) 의 Planners 데이터 잔존 확인
WITH m AS (SELECT id FROM members WHERE email = 'lools@tenone.biz')
SELECT
    (SELECT COUNT(*) FROM myverse_daily WHERE member_id = (SELECT id FROM m)) AS daily_count,
    (SELECT COUNT(*) FROM myverse_weekly WHERE member_id = (SELECT id FROM m)) AS weekly_count,
    (SELECT COUNT(*) FROM myverse_monthly WHERE member_id = (SELECT id FROM m)) AS monthly_count,
    (SELECT COUNT(*) FROM myverse_yearly WHERE member_id = (SELECT id FROM m)) AS yearly_count,
    (SELECT COUNT(*) FROM myverse_projects WHERE member_id = (SELECT id FROM m)) AS projects_count,
    (SELECT COUNT(*) FROM myverse_identities WHERE member_id = (SELECT id FROM m)) AS identity_count,
    (SELECT COUNT(*) FROM myverse_ai_briefings WHERE member_id = (SELECT id FROM m)) AS briefings_count,
    (SELECT MAX(updated_at) FROM myverse_daily WHERE member_id = (SELECT id FROM m)) AS daily_last_update,
    (SELECT MAX(updated_at) FROM myverse_weekly WHERE member_id = (SELECT id FROM m)) AS weekly_last_update;

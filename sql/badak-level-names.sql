-- 바닥장 레벨 명칭 확정 (3안)
-- 내부 코드 S/A/B/C 유지, 표시명 변경
UPDATE badak_fee_configs SET note = 'Specialist — 바닥장 수령 85%' WHERE scope = 'level' AND level_code = 'S';
UPDATE badak_fee_configs SET note = 'Veteran — 바닥장 수령 80%'     WHERE scope = 'level' AND level_code = 'A';
UPDATE badak_fee_configs SET note = 'Badakjang — 바닥장 수령 75%'   WHERE scope = 'level' AND level_code = 'B';
UPDATE badak_fee_configs SET note = 'Rookie — 바닥장 수령 70%'      WHERE scope = 'level' AND level_code = 'C';

-- 신규 바닥장 기본 레벨 C(Rookie)로 시작
-- badak_members.leader_level DEFAULT 'C' 설정
ALTER TABLE badak_members ALTER COLUMN leader_level SET DEFAULT 'C';

-- 뷰 재생성
DROP VIEW IF EXISTS badak_leader_fee_summary;
CREATE VIEW badak_leader_fee_summary AS
SELECT
  level_code,
  CASE level_code
    WHEN 'S' THEN 'Specialist'
    WHEN 'A' THEN 'Veteran'
    WHEN 'B' THEN 'Badakjang'
    WHEN 'C' THEN 'Rookie'
  END AS level_name,
  platform_rate,
  (100 - platform_rate) AS leader_rate,
  note
FROM badak_fee_configs
WHERE scope = 'level' AND is_active = true
ORDER BY platform_rate ASC;

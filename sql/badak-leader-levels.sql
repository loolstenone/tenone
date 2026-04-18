-- 바닥장 레벨 시스템 (내부 관리용 SABC)

-- 1. CHECK 제약 먼저 교체
ALTER TABLE badak_fee_configs DROP CONSTRAINT IF EXISTS badak_fee_configs_scope_check;
ALTER TABLE badak_fee_configs
  ADD CONSTRAINT badak_fee_configs_scope_check
  CHECK (scope IN ('default','certification','leader','group','level'));

-- 2. level_code 컬럼 추가
ALTER TABLE badak_fee_configs
  ADD COLUMN IF NOT EXISTS level_code char(1) CHECK (level_code IN ('S','A','B','C'));

-- 3. badak_members 레벨 컬럼
ALTER TABLE badak_members
  ADD COLUMN IF NOT EXISTS leader_level char(1) CHECK (leader_level IN ('S','A','B','C'));

-- 4. 기존 certification 제거 후 레벨별 삽입
DELETE FROM badak_fee_configs WHERE scope = 'certification';

INSERT INTO badak_fee_configs (scope, level_code, platform_rate, note) VALUES
  ('level', 'S', 10.00, 'S등급 바닥장 — 리더 수령 90%'),
  ('level', 'A', 20.00, 'A등급 바닥장 — 리더 수령 80%'),
  ('level', 'B', 25.00, 'B등급 바닥장 — 리더 수령 75%'),
  ('level', 'C', 30.00, 'C등급 바닥장 — 리더 수령 70%');

-- 5. 조회 뷰
CREATE OR REPLACE VIEW badak_leader_fee_summary AS
SELECT
  level_code,
  platform_rate,
  (100 - platform_rate) AS leader_rate,
  note
FROM badak_fee_configs
WHERE scope = 'level' AND is_active = true
ORDER BY platform_rate ASC;

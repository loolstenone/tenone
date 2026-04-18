-- 바닥장 수수료 재조정 + 공간 임대비 항목 추가
-- 참가비 = 모임 운영비 + 공간 임대비 (통합 청구)
-- 플랫폼은 통합 참가비에서 % 수수료만 가져감. 나머지는 바닥장 몫 (공간비 포함)

-- 1. S등급 조정 (90% → 85%)
UPDATE badak_fee_configs
SET platform_rate = 15.00, note = 'S등급 바닥장 — 리더 수령 85% (공간비 포함)'
WHERE scope = 'level' AND level_code = 'S';

-- 나머지 note 업데이트 (공간비 포함 명시)
UPDATE badak_fee_configs SET note = 'A등급 바닥장 — 리더 수령 80% (공간비 포함)' WHERE scope = 'level' AND level_code = 'A';
UPDATE badak_fee_configs SET note = 'B등급 바닥장 — 리더 수령 75% (공간비 포함)' WHERE scope = 'level' AND level_code = 'B';
UPDATE badak_fee_configs SET note = 'C등급 바닥장 — 리더 수령 70% (공간비 포함)' WHERE scope = 'level' AND level_code = 'C';

-- 2. badak_groups에 공간 임대비 항목 추가
-- space_fee: 참가비 중 공간 임대비 (0이면 외부 장소 / 바닥장 자체 공간 없음)
-- space_note: 공간 설명 (예: "리더 자체 스튜디오", "공유오피스 회의실")
ALTER TABLE badak_groups
  ADD COLUMN IF NOT EXISTS space_fee integer NOT NULL DEFAULT 0 CHECK (space_fee >= 0),
  ADD COLUMN IF NOT EXISTS space_note text;

-- 뷰 갱신
CREATE OR REPLACE VIEW badak_leader_fee_summary AS
SELECT
  level_code,
  platform_rate,
  (100 - platform_rate) AS leader_rate,
  note
FROM badak_fee_configs
WHERE scope = 'level' AND is_active = true
ORDER BY platform_rate ASC;

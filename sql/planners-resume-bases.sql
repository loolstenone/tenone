-- 이력서 + 활동 거점 — 2026-05-03 (세션 105)
--
-- 이력서: 학력·경력·자격증·기술·언어 등 구조화된 자기 이력
-- 활동 거점: 사무실·집·체육관 등 주요 위치 — 시간 트래커·캘린더 자동 라벨링용

ALTER TABLE myverse_identities
  ADD COLUMN IF NOT EXISTS resume JSONB DEFAULT '{}';

-- myverse_users.activity_bases — 사용자의 활동 거점 목록
-- 형태: [{ id, name, type, address?, lat?, lng?, color?, is_primary }]
--   · type: "home" | "office" | "study" | "gym" | "other"
--   · is_primary: 시간 트래커 기본값 후보
ALTER TABLE myverse_users
  ADD COLUMN IF NOT EXISTS activity_bases JSONB DEFAULT '[]';

COMMENT ON COLUMN myverse_identities.resume IS '이력서 데이터 (학력·경력·자격증·기술·언어 JSON)';
COMMENT ON COLUMN myverse_users.activity_bases IS '활동 거점 목록 (시간 트래커·캘린더 자동 라벨링용)';

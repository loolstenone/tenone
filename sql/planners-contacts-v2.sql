-- planners_contacts v2 — 기능 강화
-- 1) is_favorite, organization, title, address, last_contacted_at 추가
-- 2) relationship CHECK 제약 제거 (자유 입력)

ALTER TABLE planners_contacts ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE planners_contacts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE planners_contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE planners_contacts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE planners_contacts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- 자유 입력으로 변경 (5종 고정 → 사용자 임의)
ALTER TABLE planners_contacts DROP CONSTRAINT IF EXISTS planners_contacts_relationship_check;

-- 즐겨찾기 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_planners_contacts_favorite
    ON planners_contacts(member_id) WHERE is_favorite = TRUE;

-- badak_groups: 시즌 연속 모임 지원 컬럼 추가
ALTER TABLE badak_groups ADD COLUMN IF NOT EXISTS parent_group_id UUID REFERENCES badak_groups(id) ON DELETE SET NULL;
ALTER TABLE badak_groups ADD COLUMN IF NOT EXISTS season_number INT NOT NULL DEFAULT 1;
ALTER TABLE badak_groups ADD COLUMN IF NOT EXISTS show_leader_reviews BOOLEAN NOT NULL DEFAULT false;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_badak_groups_parent ON badak_groups(parent_group_id);

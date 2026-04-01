-- ============================================================================
-- Badaksoe Rooms 테이블: Universe OS Phase 2
--   - badaksoe_rooms : 바닥쇠 네트워킹 방 관리
-- ============================================================================
-- 실행 대상: Prod Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS badaksoe_rooms (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT    NOT NULL,                        -- 방 이름
    description  TEXT,                                    -- 방 소개
    host_id      UUID    REFERENCES members(id) ON DELETE SET NULL,
    agent_name   TEXT    NOT NULL DEFAULT 'badaksoe',     -- 담당 에이전트
    status       TEXT    NOT NULL DEFAULT 'active',       -- active | archived | closed
    category     TEXT    DEFAULT 'networking',            -- networking | study | project | social
    max_members  INT     DEFAULT 20,
    participants JSONB   NOT NULL DEFAULT '[]',           -- [{ member_id, name, joined_at }]
    metadata     JSONB   NOT NULL DEFAULT '{}',           -- 추가 설정
    brand_id     TEXT    DEFAULT 'badak',
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badaksoe_rooms_status   ON badaksoe_rooms(status);
CREATE INDEX IF NOT EXISTS idx_badaksoe_rooms_host     ON badaksoe_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_badaksoe_rooms_brand    ON badaksoe_rooms(brand_id);

-- RLS
ALTER TABLE badaksoe_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "br_select" ON badaksoe_rooms;
CREATE POLICY "br_select" ON badaksoe_rooms FOR SELECT USING (auth_is_staff() OR status = 'active');

DROP POLICY IF EXISTS "br_insert" ON badaksoe_rooms;
CREATE POLICY "br_insert" ON badaksoe_rooms FOR INSERT WITH CHECK (auth_is_staff());

DROP POLICY IF EXISTS "br_update" ON badaksoe_rooms;
CREATE POLICY "br_update" ON badaksoe_rooms FOR UPDATE USING (auth_is_staff());

-- 샘플 방 시드 (선택 사항)
INSERT INTO badaksoe_rooms (name, description, status, category) VALUES
    ('바닥 전체방', '바닥(Badak) 커뮤니티 전체 공지 및 네트워킹', 'active', 'networking'),
    ('마케터 스터디', '마케팅/광고 업계 트렌드 스터디 그룹', 'active', 'study'),
    ('프로젝트 매칭방', '협업 프로젝트 팀원 모집 및 매칭', 'active', 'project')
ON CONFLICT DO NOTHING;

-- ============================================================================
SELECT 'badaksoe_rooms table DONE' AS result;
SELECT id, name, status, category FROM badaksoe_rooms ORDER BY created_at;
-- ============================================================================

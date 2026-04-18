-- 바닥장 레벨 승급 기준

-- 1. 레벨 기준 테이블
CREATE TABLE IF NOT EXISTS badak_level_criteria (
  level_code        char(1) PRIMARY KEY,
  level_name        text NOT NULL,
  min_completed     integer NOT NULL DEFAULT 0,  -- 완료 모임 수 최소
  requires_invite   boolean NOT NULL DEFAULT false, -- 관리자 초대 필요 여부
  description       text
);

INSERT INTO badak_level_criteria (level_code, level_name, min_completed, requires_invite, description) VALUES
  ('C', 'Rookie',      0,  false, '신규 바닥장 기본 레벨'),
  ('B', 'Badakjang',   3,  false, '모임 3회 이상 완료'),
  ('A', 'Veteran',     10, false, '모임 10회 이상 완료'),
  ('S', 'Specialist',  10, true,  '모임 10회 이상 완료 + 바닥 운영팀 초대')
ON CONFLICT (level_code) DO UPDATE SET
  level_name = EXCLUDED.level_name,
  min_completed = EXCLUDED.min_completed,
  requires_invite = EXCLUDED.requires_invite,
  description = EXCLUDED.description;

-- 2. badak_members: 완료 모임 수 캐시 + 스페셜리스트 초대 플래그
ALTER TABLE badak_members
  ADD COLUMN IF NOT EXISTS completed_groups_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS specialist_invited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS specialist_invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS level_updated_at timestamptz;

-- 3. 승급 이력 테이블
CREATE TABLE IF NOT EXISTS badak_level_history (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES badak_members(id) ON DELETE CASCADE,
  from_level     char(1),
  to_level       char(1) NOT NULL,
  reason         text,   -- 'auto_promotion' | 'admin_invite' | 'admin_adjust'
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS badak_level_history_member_idx ON badak_level_history(member_id);

-- 4. 승급 조건 확인 함수
-- 호출: SELECT * FROM badak_check_level_up('member-uuid');
CREATE OR REPLACE FUNCTION badak_check_level_up(p_member_id uuid)
RETURNS TABLE(current_level char, eligible_level char, can_upgrade boolean) AS $$
DECLARE
  v_member badak_members%ROWTYPE;
BEGIN
  SELECT * INTO v_member FROM badak_members WHERE id = p_member_id;

  current_level := v_member.leader_level;
  eligible_level := v_member.leader_level;
  can_upgrade := false;

  -- Rookie → Badakjang
  IF v_member.leader_level = 'C' AND v_member.completed_groups_count >= 3 THEN
    eligible_level := 'B'; can_upgrade := true;
  -- Badakjang → Veteran
  ELSIF v_member.leader_level = 'B' AND v_member.completed_groups_count >= 10 THEN
    eligible_level := 'A'; can_upgrade := true;
  -- Veteran → Specialist (초대 필요)
  ELSIF v_member.leader_level = 'A' AND v_member.completed_groups_count >= 10 AND v_member.specialist_invited THEN
    eligible_level := 'S'; can_upgrade := true;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE badak_level_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE badak_level_history ENABLE ROW LEVEL SECURITY;

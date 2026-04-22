-- ────────────────────────────────────────────────────────────────
-- hero_company_members RLS 정책 수정 (2026-04-22)
--
-- 두 가지 문제를 동시에 해결:
--   1. 기존 정책이 auth.uid()(=auth.users.id)를 member_id(=members.id)와
--      직접 비교해서 항상 불일치. → hero_current_member_id() 헬퍼로
--      auth.users.id → members.id 매핑.
--   2. 기존 정책 subquery가 같은 테이블을 참조해 재귀 위험.
--      → SECURITY DEFINER 함수로 우회.
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS hero_company_members_self_read ON hero_company_members;
DROP FUNCTION IF EXISTS hero_active_company_ids(UUID);

-- auth.uid() → members.id 매핑 헬퍼
CREATE OR REPLACE FUNCTION hero_current_member_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM members WHERE auth_id = auth.uid() LIMIT 1;
$$;

COMMENT ON FUNCTION hero_current_member_id IS
'현재 인증된 사용자의 members.id (auth.uid()는 auth.users.id라 바로 비교 불가)';

-- 사용자가 active 담당자인 기업 목록 (RLS 재귀 차단용)
CREATE OR REPLACE FUNCTION hero_active_company_ids(_member_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id
    FROM hero_company_members
    WHERE member_id = _member_id AND status = 'active';
$$;

COMMENT ON FUNCTION hero_active_company_ids IS
'RLS 우회용 — 주어진 members.id가 active 담당자인 company_id들.';

-- 정책: 본인 row + 소속 기업의 다른 담당자 row
CREATE POLICY hero_company_members_self_read
    ON hero_company_members
    FOR SELECT
    USING (
        member_id = hero_current_member_id()
        OR company_id IN (SELECT hero_active_company_ids(hero_current_member_id()))
    );

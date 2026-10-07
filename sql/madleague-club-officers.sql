-- ============================================================
-- MADLeague 동아리 운영진 (회장·부회장·총무 등 3~5명) — 임기 단위
-- 작성·적용: 2026-10-08 MCP apply_migration `madleague_club_term_unit` (사용자 설계 결정 반영)
--
-- 운영진 자체는 새 테이블 없이 member_capability_roles에 쌓는다 (§1.3.1 — 이력 보존):
--   (capability 'club', brand 'madleague', role '임원', context {club_id, position, term})
--   교체 = 이전 임기 행 valid_until 설정 + 새 임기 행 INSERT (lib/madleague-roles.ts saveClubOfficers)
-- 지정 권한: 처음은 직원, 이후 해당 동아리 회장·부회장 / 지원서 승인: 해당 동아리 운영진 전원
-- mad_clubs.president_member_id = 현재 회장 (저장 시 자동 동기화, 기존 기능 호환)
-- ============================================================

ALTER TABLE public.mad_clubs
    ADD COLUMN IF NOT EXISTS term_unit text NOT NULL DEFAULT 'year';
ALTER TABLE public.mad_clubs DROP CONSTRAINT IF EXISTS mad_clubs_term_unit_check;
ALTER TABLE public.mad_clubs
    ADD CONSTRAINT mad_clubs_term_unit_check CHECK (term_unit IN ('year', 'semester'));
COMMENT ON COLUMN public.mad_clubs.term_unit IS '운영진 임기 단위 — year(연간, 임기 표기 2026) · semester(학기, 2026-1·2026-2)';

-- 운영진 조회용 인덱스 (context->>club_id)
CREATE INDEX IF NOT EXISTS mcr_madleague_officer_idx ON public.member_capability_roles ((context->>'club_id'))
    WHERE brand_id = 'madleague' AND capability_key = 'club' AND role = '임원';

-- 롤백: ALTER TABLE public.mad_clubs DROP COLUMN term_unit; DROP INDEX IF EXISTS mcr_madleague_officer_idx;

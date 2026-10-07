-- ============================================================
-- MADLeague 제출물 코멘트 — 직원 · 클라이언트가 팀 제출물에 의견
-- 작성: 2026-10-08 · 적용: MCP apply_migration `madleague_submission_comments`
--
-- visible_to_team = true  → 그 팀원에게도 보임 (피드백)
-- visible_to_team = false → 직원·클라이언트만 (심사 메모)
-- 클라이언트 연결 = member_capability_roles (showcase, madleague, host, {type:'corporate', competition_id}) — 테이블 추가 없음
-- anon·authenticated 권한 없음 (서버 API만)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mad_submission_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL DEFAULT 'madleague',
    submission_id uuid NOT NULL REFERENCES public.mad_submissions(id) ON DELETE CASCADE,
    author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    author_role text NOT NULL CHECK (author_role IN ('staff', 'client')),
    body text NOT NULL,
    visible_to_team boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mad_submission_comments_sub_idx ON public.mad_submission_comments (submission_id, created_at);

ALTER TABLE public.mad_submission_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mad_submission_comments FROM anon, authenticated;
GRANT ALL ON public.mad_submission_comments TO service_role;

-- 클라이언트 연결 조회 (context->>competition_id)
CREATE INDEX IF NOT EXISTS mcr_madleague_round_client_idx ON public.member_capability_roles ((context->>'competition_id'))
    WHERE brand_id = 'madleague' AND capability_key = 'showcase' AND valid_until IS NULL;

-- 롤백: DROP TABLE public.mad_submission_comments; DROP INDEX IF EXISTS mcr_madleague_round_client_idx;

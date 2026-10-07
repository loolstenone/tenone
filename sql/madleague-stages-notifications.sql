-- ============================================================
-- MADLeague 경쟁 PT·프로젝트 — 예선/본선 제출 + 회차 유형 + 알림 잠금
-- 작성: 2026-10-08 · 적용: MCP apply_migration `madleague_stages_notifications`
--
-- 회차 유형: competition(경쟁 PT) · project(프로젝트) — 팀·제출·공지·Q&A·클라이언트 기능 공유
-- 예선(prelim) 마감 = end_date · 본선(final) 마감 = final_deadline (현장 PT 전 디벨롭 제출)
-- 본선 진출 = mad_competition_teams.is_finalist (인트라에서 지정)
-- 제출물 = 팀 × 단계 1건
-- ============================================================

-- 1) 회차 유형 · 본선 제출 마감
ALTER TABLE public.mad_competitions
    ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'competition',
    ADD COLUMN IF NOT EXISTS final_deadline date;
DO $$ BEGIN
    ALTER TABLE public.mad_competitions ADD CONSTRAINT mad_competitions_kind_chk CHECK (kind IN ('competition', 'project'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON COLUMN public.mad_competitions.kind IS 'competition=경쟁 PT · project=프로젝트';
COMMENT ON COLUMN public.mad_competitions.final_deadline IS '본선 진출 팀 디벨롭 제안서 제출 마감 (KST 23:59)';

-- 2) 본선 진출
ALTER TABLE public.mad_competition_teams
    ADD COLUMN IF NOT EXISTS is_finalist boolean NOT NULL DEFAULT false;

-- 3) 제출물 단계 — 팀당 1건 → 팀 × 단계 1건
ALTER TABLE public.mad_submissions
    ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'prelim';
DO $$ BEGIN
    ALTER TABLE public.mad_submissions ADD CONSTRAINT mad_submissions_stage_chk CHECK (stage IN ('prelim', 'final'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DROP INDEX IF EXISTS public.mad_submissions_team_uniq;
CREATE UNIQUE INDEX IF NOT EXISTS mad_submissions_team_stage_uniq ON public.mad_submissions (team_id, stage);

-- 4) 알림 — 본인 것만 읽기(기존 SELECT 정책 유지), 쓰기는 서버(service_role)만
--    기존: anon·authenticated에 INSERT/UPDATE/DELETE 권한이 열려 있었음 (RLS 정책이 없어 실제 쓰기는 막혀 있었지만 권한 자체를 회수)
REVOKE ALL ON public.notifications FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.notifications FROM authenticated;
GRANT SELECT ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
CREATE INDEX IF NOT EXISTS notifications_member_created_idx ON public.notifications (member_id, created_at DESC);

-- 롤백:
--   DROP INDEX IF EXISTS mad_submissions_team_stage_uniq; CREATE UNIQUE INDEX mad_submissions_team_uniq ON public.mad_submissions (team_id);  (단계별 2건 있으면 먼저 정리)
--   ALTER TABLE public.mad_submissions DROP COLUMN stage;
--   ALTER TABLE public.mad_competition_teams DROP COLUMN is_finalist;
--   ALTER TABLE public.mad_competitions DROP COLUMN kind, DROP COLUMN final_deadline;

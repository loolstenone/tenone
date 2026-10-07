-- ============================================================
-- MADLeague 결과 발표 — 명예의 전당·포트폴리오 자동 반영 (매드리거 구조 개편 4단계)
-- 작성: 2026-10-08 · 적용: MCP apply_migration `madleague_results_publish`
--
-- results_published_at 이 있는 회차만 결과(순위·상)가 공개된다
--   · 명예의 전당 (/madleague/programs/competition) = kind='competition' + 발표된 회차
--   · 포트폴리오·워크스페이스 = 발표된 결과만
-- 발표 전 결과는 직원(service_role API)만 본다
-- ============================================================

ALTER TABLE public.mad_competitions
    ADD COLUMN IF NOT EXISTS results_published_at timestamptz;
COMMENT ON COLUMN public.mad_competitions.results_published_at IS '결과 발표 시각 — 있으면 결과 공개(명예의 전당·포트폴리오)';

-- 결과 읽기: 발표된 회차만 (기존 USING (true) 대체)
DROP POLICY IF EXISTS mad_results_read ON public.mad_competition_results;
CREATE POLICY mad_results_read ON public.mad_competition_results FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.mad_competitions c WHERE c.id = competition_id AND c.results_published_at IS NOT NULL));

-- 롤백:
--   DROP POLICY mad_results_read ON public.mad_competition_results;
--   CREATE POLICY mad_results_read ON public.mad_competition_results FOR SELECT USING (true);
--   ALTER TABLE public.mad_competitions DROP COLUMN results_published_at;

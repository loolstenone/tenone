-- ═══════════════════════════════════════════════════════════════
-- 옛 MADLeague 경쟁 PT·인증서 테이블 DROP (2026-10-10 적용 — 사용자 승인, 백업 docs/audit/2026-10/mad-competition-tables-backup-2026-10-10.json)
--   세션 163에서 코어 프로그램 모듈(program_*)로 이전 완료 — 코드 참조 0건 (app·lib·features·components grep)
--   mad_hero_applications는 세션 166에서 폐지 결정(사용자 승인), 0행
--   DB 참조: 함수 mad_eligible_certificates (코드 호출 0건) → 함께 삭제
--   행 수 (2026-10-10): mad_competitions 4 · mad_competition_teams 6 · mad_round_notices 2 · mad_round_answers 1 · mad_round_questions 1 · mad_team_members 1 · 나머지 0
--     → 적용 전 아래 백업 블록으로 JSON 스냅샷을 남긴다 (데모·이전 원본, program_*에 이미 이전됨)
--   ❌ 남기는 것: mad_applications·mad_articles·mad_clubs·mad_members·mad_posts·mad_comments·mad_cohorts·mad_archive·mad_article_* (사용 중)
-- ═══════════════════════════════════════════════════════════════

-- 백업 (적용 직전 실행 → 결과를 docs/audit/ 에 보관)
-- SELECT 'mad_competitions' t, jsonb_agg(to_jsonb(x)) FROM mad_competitions x
-- UNION ALL SELECT 'mad_competition_teams', jsonb_agg(to_jsonb(x)) FROM mad_competition_teams x
-- UNION ALL SELECT 'mad_round_notices', jsonb_agg(to_jsonb(x)) FROM mad_round_notices x
-- UNION ALL SELECT 'mad_round_answers', jsonb_agg(to_jsonb(x)) FROM mad_round_answers x
-- UNION ALL SELECT 'mad_round_questions', jsonb_agg(to_jsonb(x)) FROM mad_round_questions x
-- UNION ALL SELECT 'mad_team_members', jsonb_agg(to_jsonb(x)) FROM mad_team_members x;

-- mad_archive(0행·사용 중)가 competition_id FK로 참조 → 컬럼은 두고 제약만 해제
ALTER TABLE public.mad_archive DROP CONSTRAINT IF EXISTS mad_archive_competition_id_fkey;

DROP FUNCTION IF EXISTS public.mad_eligible_certificates CASCADE;

DROP TABLE IF EXISTS
    public.mad_submission_comments,
    public.mad_submissions,
    public.mad_round_answers,
    public.mad_round_questions,
    public.mad_round_notices,
    public.mad_team_members,
    public.mad_competition_results,
    public.mad_competition_teams,
    public.mad_certificates,
    public.mad_competitions,
    public.mad_hero_applications;

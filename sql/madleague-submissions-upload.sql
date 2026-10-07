-- ============================================================
-- MADLeague 경쟁 PT 팀 제출물 업로드 — 매드리거 구조 개편 3단계
-- 작성·적용: 2026-10-08 MCP apply_migration `madleague_submissions_upload`
--
-- 업로드: API가 서명 업로드 URL 발급 → 브라우저가 Storage에 직접 (Vercel 4.5MB 본문 제한 회피)
-- 내려받기: 팀원·직원만, API가 5분 서명 URL 발급 → 버킷은 비공개, Storage 정책 없음(service_role만)
-- 팀당 제출물 1건 (team_id UNIQUE) — 임시 저장(draft) ↔ 최종 제출(submitted), 마감 전 재제출 가능
-- ============================================================

-- 1) 비공개 버킷 (50MB, 발표자료 형식)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mad-submissions', 'mad-submissions', false, 52428800, ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/x-iwork-keynote-sffkey',
    'application/zip', 'application/x-zip-compressed',
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4',
    'application/octet-stream'
])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) 제출물 컬럼 — file_url에는 Storage 경로만 저장 (공개 URL 아님)
ALTER TABLE public.mad_submissions
    ADD COLUMN IF NOT EXISTS file_name text,
    ADD COLUMN IF NOT EXISTS file_size bigint,
    ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS consent jsonb;
COMMENT ON COLUMN public.mad_submissions.file_url IS 'mad-submissions 버킷 경로 (비공개 — API 서명 URL로만 내려받기)';
COMMENT ON COLUMN public.mad_submissions.consent IS '최종 제출 동의 {version, agreed_at, text} — 심사를 위한 과제 기업·심사위원 전달';

CREATE UNIQUE INDEX IF NOT EXISTS mad_submissions_team_uniq ON public.mad_submissions (team_id);

-- 롤백:
--   DROP INDEX IF EXISTS mad_submissions_team_uniq;
--   ALTER TABLE public.mad_submissions DROP COLUMN file_name, DROP COLUMN file_size, DROP COLUMN submitted_by, DROP COLUMN consent;
--   (버킷은 비어 있을 때만) DELETE FROM storage.buckets WHERE id = 'mad-submissions';

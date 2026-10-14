-- Planner's 자료실 — 바닥상회(badak.biz 아임웹)에서 옮겨 온 PAD 플래너·템플릿 (2026-10-14)
-- 적용: 2026-10-14 MCP apply_migration `planners_files_2026_10` (사용자 승인) · 재실행 가능
--
-- 원칙
--   - 목록(제목·분류·크기)은 누구나 볼 수 있다 (공개 표시분만)
--   - 파일은 비공개 버킷 planners-files — 로그인 회원에게 API가 5분짜리 서명 URL을 준다 (/api/planners/files/[id]/download)
--   - 누가 받았는지는 저장하지 않는다 — 다운로드 수(download_count)만 센다 (개인정보 최소 수집, 개인정보보호법 제16조)
--   - 쓰기는 직원만 (인트라 /intra/ums/planners/files)
--   - legacy_badak_no = 옛 바닥상회 상품 번호 → badak.biz DNS 전환 때 /shop_view/?idx=N 308 넘김에 쓴다

CREATE TABLE IF NOT EXISTS public.planners_files (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id        text NOT NULL DEFAULT 'planners',
    kind            text NOT NULL CHECK (kind IN ('planner', 'template')),   -- 플래너(본체: 연간 플래너·북) / 템플릿
    category        text NOT NULL,                                          -- 연간 플래너 · 노트 북 · 프로젝트 북 · 노트 · 스터디 · 스케줄 · 프레임워크 · 플레이 · 스타트업 · 아이디어 샤워
    title           text NOT NULL,
    description     text,
    year            int,                                                    -- 연간 플래너만
    file_path       text NOT NULL,                                          -- planners-files 버킷 안 경로
    file_name       text NOT NULL,                                          -- 내려받을 때 이름
    file_size       bigint NOT NULL DEFAULT 0,
    mime_type       text,
    thumbnail_url   text,
    sort_order      int NOT NULL DEFAULT 0,
    is_published    boolean NOT NULL DEFAULT false,
    download_count  int NOT NULL DEFAULT 0,
    legacy_badak_no int UNIQUE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planners_files_list_idx ON public.planners_files (kind, category, sort_order) WHERE is_published;

ALTER TABLE public.planners_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planners_files_read ON public.planners_files;
CREATE POLICY planners_files_read ON public.planners_files
    FOR SELECT TO anon, authenticated
    USING (is_published OR auth_is_staff());

DROP POLICY IF EXISTS planners_files_staff_write ON public.planners_files;
CREATE POLICY planners_files_staff_write ON public.planners_files
    FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- 다운로드 수 +1 (서버 API만 호출 — service_role)
CREATE OR REPLACE FUNCTION public.planners_file_downloaded(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    UPDATE public.planners_files SET download_count = download_count + 1 WHERE id = p_id;
$$;
REVOKE ALL ON FUNCTION public.planners_file_downloaded(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.planners_file_downloaded(uuid) TO service_role;

-- 비공개 버킷 (최대 60MB · PDF·zip·docx·pptx·png)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('planners-files', 'planners-files', FALSE, 62914560, ARRAY[
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png'
]::text[])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
-- storage.objects 정책 없음 = 브라우저 직접 접근 불가, 서버(service_role) 서명 URL로만

-- GRANT (부록 D — 2026-10-30 정책)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planners_files TO authenticated;
GRANT SELECT ON public.planners_files TO anon;
GRANT ALL ON public.planners_files TO service_role;

-- 되돌리기:
--   DROP FUNCTION IF EXISTS public.planners_file_downloaded(uuid);
--   DROP TABLE IF EXISTS public.planners_files;
--   (버킷은 파일을 먼저 비운 뒤) DELETE FROM storage.buckets WHERE id = 'planners-files';

-- 브랜드 자산 Storage 버킷
-- 로고·이미지·템플릿 업로드용. 공개 읽기, 본인만 쓰기.

-- 버킷 생성 (공개, 최대 5MB, 이미지만)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'brand-assets',
    'brand-assets',
    TRUE,
    5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS — 사용자별 폴더 (/{member_id}/...)
-- 1) 모두 읽기 (public 버킷이므로 별도 정책 불필요)

-- 2) 인증된 사용자가 자기 폴더에만 업로드
DROP POLICY IF EXISTS brand_assets_upload ON storage.objects;
CREATE POLICY brand_assets_upload ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'brand-assets'
        AND (storage.foldername(name))[1] IN (
            SELECT id::TEXT FROM members WHERE auth_id = auth.uid()
        )
    );

-- 3) 자기 파일만 삭제
DROP POLICY IF EXISTS brand_assets_delete ON storage.objects;
CREATE POLICY brand_assets_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'brand-assets'
        AND (storage.foldername(name))[1] IN (
            SELECT id::TEXT FROM members WHERE auth_id = auth.uid()
        )
    );

-- 4) 자기 파일만 업데이트
DROP POLICY IF EXISTS brand_assets_update ON storage.objects;
CREATE POLICY brand_assets_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'brand-assets'
        AND (storage.foldername(name))[1] IN (
            SELECT id::TEXT FROM members WHERE auth_id = auth.uid()
        )
    );

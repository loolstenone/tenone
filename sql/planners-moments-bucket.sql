-- planners-moments Storage 버킷 + 정책
-- (이미 존재하면 ON CONFLICT 로 skip)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'planners-moments',
    'planners-moments',
    true,                          -- public read (이미지/동영상 직접 표시)
    52428800,                      -- 50MB
    ARRAY[
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
        'video/mp4', 'video/webm', 'video/quicktime'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 본인 폴더(memberId/...) 만 읽기/쓰기
DROP POLICY IF EXISTS planners_moments_select ON storage.objects;
CREATE POLICY planners_moments_select ON storage.objects
    FOR SELECT USING (bucket_id = 'planners-moments');

DROP POLICY IF EXISTS planners_moments_insert ON storage.objects;
CREATE POLICY planners_moments_insert ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'planners-moments'
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM members WHERE email = (auth.jwt() ->> 'email')
        )
    );

DROP POLICY IF EXISTS planners_moments_update ON storage.objects;
CREATE POLICY planners_moments_update ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'planners-moments'
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM members WHERE email = (auth.jwt() ->> 'email')
        )
    );

DROP POLICY IF EXISTS planners_moments_delete ON storage.objects;
CREATE POLICY planners_moments_delete ON storage.objects
    FOR DELETE USING (
        bucket_id = 'planners-moments'
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM members WHERE email = (auth.jwt() ->> 'email')
        )
    );

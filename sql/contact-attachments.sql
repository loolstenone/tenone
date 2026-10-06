-- 문의 폼 첨부파일 (이력서·포트폴리오·제안서) — 2026-10-05 적용
-- 개인정보(이력서)이므로 비공개 버킷. 정책 없음 = service_role만 접근
--   업로드: /api/contact가 캡차 확인 후 서명 업로드 URL 발급 → 브라우저가 직접 업로드
--   열람: /api/intra/contact-attachment (requireStaff) 가 서명 다운로드 URL 발급
-- 보관: 문의 처리 완료 후 1년 뒤 행과 함께 파기 (Contact 개인정보 동의 문구와 동일)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contact-attachments', 'contact-attachments', false, 10485760,
    ARRAY[
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-hwp', 'application/haansofthwp', 'application/vnd.hancom.hwp', 'application/vnd.hancom.hwpx',
        'application/zip', 'application/x-zip-compressed',
        'image/jpeg', 'image/png', 'image/webp',
        'application/octet-stream'
    ]
)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 첨부 메타데이터: [{ path, name, size, type }]
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 응대 기록 (2026-10-05 적용) — 이메일·전화 등 인트라 밖 응대도 여기에 남겨 답변/미답변 근거로 삼는다
-- [{ at, by(members.id), channel(email|phone|kakao|meeting|other), status, note }]
-- 상태: pending(미답변) · in_progress(처리 중) · resolved(답변 완료) · closed(종료·스팸)
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS handling_log jsonb NOT NULL DEFAULT '[]'::jsonb;
UPDATE public.contact_submissions SET status = 'pending' WHERE status IS NULL OR status = 'new';

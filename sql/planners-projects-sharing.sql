-- Phase 6: 협업·공유
-- public_token: 공개 링크 토큰 (visibility=public_link 일 때 활성)
-- collaborators: 초대된 협업자 목록 (이메일 기반, 권한 체계는 추후)

ALTER TABLE planners_projects
    ADD COLUMN IF NOT EXISTS public_token text UNIQUE,
    ADD COLUMN IF NOT EXISTS collaborators jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS planners_projects_public_token_idx
    ON planners_projects(public_token) WHERE public_token IS NOT NULL;

-- collaborators 형식:
-- [{ "email": "x@y.com", "role": "viewer|editor", "invited_at": "ISO" }]

-- Myverse Phase 0-B: @handle 시스템
-- 적용일: 2026-05-04
--
-- members 테이블에 handle 컬럼 추가 + 형식 검증 + 공개 view
-- 핸들 규칙: 영문 소문자 + 숫자 + 언더스코어, 3~20자, 예약어 금지

ALTER TABLE members ADD COLUMN IF NOT EXISTS handle TEXT;

-- 형식 검증 — 소문자/숫자/언더스코어 3~20자
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_handle_format;
ALTER TABLE members ADD CONSTRAINT members_handle_format
    CHECK (handle IS NULL OR handle ~ '^[a-z0-9_]{3,20}$');

-- 유니크 (NULL 허용)
DROP INDEX IF EXISTS idx_members_handle_unique;
CREATE UNIQUE INDEX idx_members_handle_unique
    ON members(handle) WHERE handle IS NOT NULL;

-- 예약어 (브랜드·시스템 경로 보호)
CREATE TABLE IF NOT EXISTS myverse_reserved_handles (
    handle TEXT PRIMARY KEY,
    reason TEXT
);

INSERT INTO myverse_reserved_handles (handle, reason) VALUES
    ('admin', 'system'),
    ('api', 'system'),
    ('app', 'system'),
    ('auth', 'system'),
    ('blog', 'system'),
    ('contact', 'system'),
    ('dashboard', 'system'),
    ('dev', 'system'),
    ('docs', 'system'),
    ('explore', 'system'),
    ('feed', 'system'),
    ('help', 'system'),
    ('home', 'system'),
    ('intra', 'system'),
    ('login', 'system'),
    ('me', 'system'),
    ('myverse', 'brand'),
    ('mindle', 'brand'),
    ('badak', 'brand'),
    ('madleague', 'brand'),
    ('madleap', 'brand'),
    ('rook', 'brand'),
    ('hero', 'brand'),
    ('jakka', 'brand'),
    ('domo', 'brand'),
    ('planners', 'brand'),
    ('plan', 'system'),
    ('privacy', 'system'),
    ('public', 'system'),
    ('search', 'system'),
    ('settings', 'system'),
    ('signup', 'system'),
    ('signin', 'system'),
    ('static', 'system'),
    ('support', 'system'),
    ('system', 'system'),
    ('tenone', 'brand'),
    ('terms', 'system'),
    ('test', 'system'),
    ('user', 'system'),
    ('verse', 'system'),
    ('www', 'system'),
    ('youinone', 'brand')
ON CONFLICT (handle) DO NOTHING;

-- 공개 페이지 view (anon 접근 가능) — bio 컬럼이 members에 없으면 NULL
CREATE OR REPLACE VIEW myverse_public_handles AS
SELECT
    m.id AS member_id,
    m.handle,
    m.name,
    m.avatar_url,
    m.affiliations,
    m.created_at AS joined_at
FROM members m
WHERE m.handle IS NOT NULL;

GRANT SELECT ON myverse_public_handles TO anon, authenticated;

-- 예약어 테이블 RLS — 누구나 읽기 가능, 쓰기는 service_role만
ALTER TABLE myverse_reserved_handles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reserved_handles_select_public ON myverse_reserved_handles;
CREATE POLICY reserved_handles_select_public
    ON myverse_reserved_handles
    FOR SELECT
    USING (true);

-- myverse_contacts 정규화 — Personal OS 협업자 관리
-- type(self/internal/external) + company_name + 기타 추적 필드

ALTER TABLE myverse_contacts
    ADD COLUMN IF NOT EXISTS person_type TEXT NOT NULL DEFAULT 'external'
        CHECK (person_type IN ('self', 'internal', 'external'));

ALTER TABLE myverse_contacts
    ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE myverse_contacts
    ADD COLUMN IF NOT EXISTS role TEXT;  -- 직책 (예: PM, Designer, CTO)

ALTER TABLE myverse_contacts
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE myverse_contacts
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contacts_type
    ON myverse_contacts(member_id, person_type);
CREATE INDEX IF NOT EXISTS idx_contacts_company
    ON myverse_contacts(member_id, company_name) WHERE company_name IS NOT NULL;

COMMENT ON COLUMN myverse_contacts.person_type IS
    'self=본인, internal=내부 팀, external=외부 협업자. 권한 시스템과 별개 (단순 연락처 분류).';
COMMENT ON COLUMN myverse_contacts.company_name IS
    '회사명 자유 텍스트. Stage 2에서 Company 엔티티로 정규화 예정.';

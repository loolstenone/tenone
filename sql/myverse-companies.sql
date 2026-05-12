-- Personal OS — Company 엔티티 정규화 (Stage 2)
-- 기존 myverse_contacts.company_name(자유 텍스트) → myverse_companies(엔티티) + contacts.company_id FK
-- 텍스트는 유지(legacy fallback). 새로 입력하는 contact은 company_id 사용 권장.

CREATE TABLE IF NOT EXISTS myverse_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,                    -- 회사 도메인 (예: tenone.biz) — 메일에서 자동 추출 가능
    industry TEXT,                  -- 산업군 (자유 텍스트)
    logo_url TEXT,                  -- 로고 URL
    notes TEXT,                     -- 자유 메모
    color TEXT,                     -- UI 컬러 코드 (회사별 시각화)
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- 동일 멤버 안에서 같은 회사명 중복 방지 (정규화: trim + lower)
    CONSTRAINT myverse_companies_name_unique UNIQUE (member_id, name)
);

CREATE INDEX IF NOT EXISTS idx_myverse_companies_member
    ON myverse_companies(member_id, name);
CREATE INDEX IF NOT EXISTS idx_myverse_companies_active
    ON myverse_companies(member_id) WHERE is_archived = false;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION myverse_companies_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS myverse_companies_touch_trigger ON myverse_companies;
CREATE TRIGGER myverse_companies_touch_trigger
BEFORE UPDATE ON myverse_companies
FOR EACH ROW EXECUTE FUNCTION myverse_companies_touch();

-- RLS
ALTER TABLE myverse_companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS myverse_companies_self ON myverse_companies;
CREATE POLICY myverse_companies_self ON myverse_companies
    FOR ALL USING (auth.uid() = member_id) WITH CHECK (auth.uid() = member_id);

-- contacts에 company_id FK 추가 (company_name TEXT은 legacy fallback으로 유지)
ALTER TABLE myverse_contacts
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES myverse_companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_company_id
    ON myverse_contacts(member_id, company_id) WHERE company_id IS NOT NULL;

-- 기존 company_name → company 엔티티 백필
-- 멤버별로 distinct company_name 추출 → myverse_companies row 생성 → contact.company_id 연결
DO $$
DECLARE
    rec RECORD;
    company_uuid UUID;
BEGIN
    FOR rec IN
        SELECT DISTINCT member_id, TRIM(company_name) AS name
        FROM myverse_contacts
        WHERE company_name IS NOT NULL
          AND TRIM(company_name) <> ''
    LOOP
        -- 기존 회사 있으면 사용, 없으면 INSERT
        SELECT id INTO company_uuid
        FROM myverse_companies
        WHERE member_id = rec.member_id AND name = rec.name
        LIMIT 1;

        IF company_uuid IS NULL THEN
            INSERT INTO myverse_companies(member_id, name)
            VALUES (rec.member_id, rec.name)
            RETURNING id INTO company_uuid;
        END IF;

        -- 해당 멤버의 company_name 일치 contacts에 company_id 채움
        UPDATE myverse_contacts
        SET company_id = company_uuid
        WHERE member_id = rec.member_id
          AND TRIM(company_name) = rec.name
          AND company_id IS NULL;
    END LOOP;
END $$;

COMMENT ON TABLE myverse_companies IS
    'Personal OS — 사용자의 협업 회사·고객사 엔티티. contacts.company_id로 참조. 자유 텍스트 company_name은 legacy fallback.';

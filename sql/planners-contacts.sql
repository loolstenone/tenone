-- planners_contacts table
-- Drop and recreate with member_id (consistent with other planners tables)
DROP TABLE IF EXISTS planners_contacts CASCADE;

CREATE TABLE planners_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    group_name TEXT,
    relationship TEXT CHECK (relationship IN ('가족', '연인', '친구', '직장', '기타')),
    note TEXT,
    birthday TEXT,    -- MM-DD format
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planners_contacts_member_id ON planners_contacts(member_id);
CREATE INDEX IF NOT EXISTS idx_planners_contacts_group ON planners_contacts(member_id, group_name);

-- RLS (via member_id join, admin client bypasses RLS so this is a safety net)
ALTER TABLE planners_contacts ENABLE ROW LEVEL SECURITY;

-- Admin client (service role) bypasses RLS; anon/user access blocked by default
CREATE POLICY "planners_contacts_own" ON planners_contacts
    FOR ALL
    USING (
        member_id IN (
            SELECT id FROM members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (
        member_id IN (
            SELECT id FROM members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_planners_contacts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_planners_contacts_updated_at ON planners_contacts;
CREATE TRIGGER trg_planners_contacts_updated_at
    BEFORE UPDATE ON planners_contacts
    FOR EACH ROW EXECUTE FUNCTION update_planners_contacts_updated_at();

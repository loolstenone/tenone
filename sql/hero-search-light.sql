-- TIH 검사 응답
CREATE TABLE IF NOT EXISTS hero_tih_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company text,
    contact_name text,
    email text UNIQUE,
    responses jsonb NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','matched','closed')),
    brand_id text NOT NULL DEFAULT 'hero',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_tih_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_tih" ON hero_tih_responses
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "anyone_insert_tih" ON hero_tih_responses
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS hero_tih_responses_status_idx ON hero_tih_responses(status);
CREATE INDEX IF NOT EXISTS hero_tih_responses_created_idx ON hero_tih_responses(created_at DESC);

-- Search Light 사전 등록
CREATE TABLE IF NOT EXISTS hero_search_light_waitlist (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    company text,
    brand_id text NOT NULL DEFAULT 'hero',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_search_light_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_waitlist" ON hero_search_light_waitlist
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "anyone_insert_waitlist" ON hero_search_light_waitlist
    FOR INSERT TO anon, authenticated WITH CHECK (true);

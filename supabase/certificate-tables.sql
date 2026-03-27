-- ============================================
-- WIO Certificate Module
-- Issue & manage certificates (수료증, 참가증, 우수상 등)
-- ============================================

-- certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id TEXT NOT NULL,
    template_name TEXT NOT NULL, -- 수료증, 참가증, 우수상 등
    title TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    issued_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    program_name TEXT, -- MADLeague Season 7 등
    description TEXT,
    issuer_name TEXT DEFAULT 'Ten:One™',
    certificate_number TEXT UNIQUE,
    metadata JSONB DEFAULT '{}', -- 추가 필드 (점수, 등급 등)
    status TEXT DEFAULT 'issued', -- draft, issued, revoked
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certs_read" ON certificates FOR SELECT USING (true);
CREATE POLICY "certs_write" ON certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "certs_update" ON certificates FOR UPDATE USING (true);

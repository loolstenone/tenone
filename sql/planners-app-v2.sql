-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — 스키마 v2 (mode + pdf_buyer 추가)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE myverse_users
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'weekly'
    CHECK (mode IN ('weekly', 'all_in_one'));

ALTER TABLE myverse_users
  ADD COLUMN IF NOT EXISTS is_pdf_buyer BOOLEAN DEFAULT false;

ALTER TABLE myverse_users
  ADD COLUMN IF NOT EXISTS pdf_buyer_verified_at TIMESTAMPTZ;

-- subscription_plan 필드 (19,000원 연간)
ALTER TABLE myverse_users
  ADD COLUMN IF NOT EXISTS subscription_price INTEGER DEFAULT 19000;

-- Personal Identity에 최종 단계 (Objective + Key Results) 추가
ALTER TABLE myverse_identities
  ADD COLUMN IF NOT EXISTS vision_statement TEXT,
  ADD COLUMN IF NOT EXISTS mission_statement TEXT,
  ADD COLUMN IF NOT EXISTS key_results JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS execution_plan TEXT;

-- Daily에 두 번째 노트 슬롯 (PDF의 N 2개 구조 재현)
ALTER TABLE myverse_daily
  ADD COLUMN IF NOT EXISTS notes_secondary TEXT;

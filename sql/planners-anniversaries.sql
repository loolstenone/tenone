-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — Anniversary & Big Event
-- Yearly 테이블에 JSONB 필드로 저장 (단순한 데이터 구조)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE myverse_yearly
  ADD COLUMN IF NOT EXISTS anniversaries JSONB DEFAULT '[]';

-- anniversaries 스키마:
-- [{ id, date: 'MM-DD', label, color?, type: 'anniversary'|'event' }]

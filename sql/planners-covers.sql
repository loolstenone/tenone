-- ═══════════════════════════════════════════════════════════════
-- Planner's Planner AI — Front Cover 15종
-- 프로젝트 Cover 선택 (색 × 패턴 × 상징)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS myverse_covers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT UNIQUE NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT,
  pattern       TEXT NOT NULL CHECK (pattern IN ('solid', 'gradient', 'grid', 'dot', 'paper', 'line', 'stripe', 'circle')),
  primary_color TEXT NOT NULL,
  accent_color  TEXT,
  emoji         TEXT,
  order_index   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE myverse_covers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "모두 읽기" ON myverse_covers;
CREATE POLICY "모두 읽기" ON myverse_covers FOR SELECT USING (true);

-- 15종 시드
INSERT INTO myverse_covers(key, label, description, pattern, primary_color, accent_color, emoji, order_index) VALUES
('teal_solid',    'Teal Solid',     '기본 · 플래너 브랜드 색',        'solid',    '#0F766E', NULL,      '📘',  1),
('charcoal',      'Charcoal',       '정제된 · 업무 기획',             'solid',    '#1F2937', NULL,      '📓',  2),
('ivory',         'Ivory',          '클래식 · 따뜻한 미색',           'paper',    '#F5F3ED', '#8B7355', '📖',  3),
('sage',          'Sage',           '차분한 · 개인 성장',             'solid',    '#87A96B', NULL,      '🌿',  4),
('terracotta',    'Terracotta',     '흙빛 · 창작 프로젝트',           'solid',    '#C87553', NULL,      '🏺',  5),
('navy_dot',      'Navy Dot',       '점 패턴 · 분석·리서치',          'dot',      '#1E3A5F', '#3B82F6', '🔬',  6),
('grid_white',    'Grid White',     '모눈 · 설계·구조화',             'grid',     '#FFFFFF', '#D1D5DB', '📐',  7),
('line_cream',    'Line Cream',     '라인 · 기록·일기',               'line',     '#FEF3E2', '#D4A574', '✍️',  8),
('sunrise',       'Sunrise',        '그라데이션 · 시작·목표',         'gradient', '#F59E0B', '#EF4444', '🌅',  9),
('ocean',         'Ocean',          '그라데이션 · 장기 비전',         'gradient', '#0EA5E9', '#6366F1', '🌊', 10),
('forest',        'Forest',         '깊은 녹색 · 장기 습관',          'solid',    '#14532D', '#22C55E', '🌲', 11),
('rose',          'Rose',           '부드러움 · 관계·가족',           'solid',    '#E11D48', NULL,      '🌹', 12),
('gold_stripe',   'Gold Stripe',    '줄무늬 · 기념 프로젝트',         'stripe',   '#F5F3ED', '#D4A574', '⭐', 13),
('midnight',      'Midnight',       '어두운 · 야간 작업·딥워크',      'solid',    '#0F172A', '#6366F1', '🌙', 14),
('coral_circle',  'Coral Circle',   '원형 패턴 · 발상·창의',          'circle',   '#FED7AA', '#FB923C', '🎨', 15)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  pattern = EXCLUDED.pattern,
  primary_color = EXCLUDED.primary_color,
  accent_color = EXCLUDED.accent_color,
  emoji = EXCLUDED.emoji,
  order_index = EXCLUDED.order_index;

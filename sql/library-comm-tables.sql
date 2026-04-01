-- ============================================================
-- Library & Comm Tables
-- 실행: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── library_items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT '기타',
    source TEXT NOT NULL DEFAULT 'cms',       -- 'myverse' | 'wiki' | 'cms'
    format TEXT NOT NULL DEFAULT 'OTHER',      -- PDF, DOCX, PPTX, XLSX, PNG, JPG, MP4, URL, OTHER
    file_url TEXT,
    file_size TEXT,
    tags TEXT[] DEFAULT '{}',
    author TEXT NOT NULL DEFAULT '',
    author_id TEXT NOT NULL DEFAULT '',
    permission TEXT NOT NULL DEFAULT 'all',    -- 'all' | 'staff' | 'partner' | 'admin'
    project_code TEXT,
    project_name TEXT,
    bookmark_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    brand_id TEXT DEFAULT 'tenone',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 기존 테이블 존재 시 누락 컬럼 추가
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '기타';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'cms';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'OTHER';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT '';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS author_id TEXT NOT NULL DEFAULT '';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS permission TEXT NOT NULL DEFAULT 'all';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS project_code TEXT;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS brand_id TEXT DEFAULT 'tenone';
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_library_items_source ON library_items(source);
CREATE INDEX IF NOT EXISTS idx_library_items_author_id ON library_items(author_id);
CREATE INDEX IF NOT EXISTS idx_library_items_brand_id ON library_items(brand_id);
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category);

-- RLS
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "library_items_read" ON library_items;
CREATE POLICY "library_items_read" ON library_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "library_items_write" ON library_items;
CREATE POLICY "library_items_write" ON library_items FOR ALL USING (true);

-- ── library_bookmarks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_bookmarks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'cms',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
);

ALTER TABLE library_bookmarks ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE library_bookmarks ADD COLUMN IF NOT EXISTS item_id TEXT NOT NULL DEFAULT '';
ALTER TABLE library_bookmarks ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'cms';

CREATE INDEX IF NOT EXISTS idx_library_bookmarks_user ON library_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_library_bookmarks_item ON library_bookmarks(item_id);

ALTER TABLE library_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "library_bookmarks_read" ON library_bookmarks;
CREATE POLICY "library_bookmarks_read" ON library_bookmarks FOR SELECT USING (true);
DROP POLICY IF EXISTS "library_bookmarks_write" ON library_bookmarks;
CREATE POLICY "library_bookmarks_write" ON library_bookmarks FOR ALL USING (true);

-- ── comm_events (사내 일정) ────────────────────────────────
-- Prod 스키마: id(uuid), tenant_id(uuid NOT NULL), title(text NOT NULL),
--   description, start_at(timestamptz NOT NULL), end_at, all_day(bool),
--   location, color, attendees(array), recurrence, reminder(int)
-- 테이블 이미 존재 → CREATE 스킵, RLS만 적용

CREATE INDEX IF NOT EXISTS idx_comm_events_start ON comm_events(start_at);

ALTER TABLE comm_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comm_events_read" ON comm_events;
CREATE POLICY "comm_events_read" ON comm_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "comm_events_write" ON comm_events;
CREATE POLICY "comm_events_write" ON comm_events FOR ALL USING (true);

-- ── mkt_performance (마케팅 퍼포먼스 스냅샷) ───────────────
-- 이미 존재할 수 있으므로 IF NOT EXISTS
CREATE TABLE IF NOT EXISTS mkt_performance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    channel TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    target NUMERIC DEFAULT 0,
    period TEXT NOT NULL,
    brand_id TEXT DEFAULT 'tenone',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT '';
ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS metric_name TEXT NOT NULL DEFAULT '';
ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS value NUMERIC DEFAULT 0;
ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS target NUMERIC DEFAULT 0;
ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS period TEXT NOT NULL DEFAULT '';
ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS brand_id TEXT DEFAULT 'tenone';
ALTER TABLE mkt_performance ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_mkt_performance_channel ON mkt_performance(channel);
CREATE INDEX IF NOT EXISTS idx_mkt_performance_period ON mkt_performance(period);

ALTER TABLE mkt_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_performance_read" ON mkt_performance;
CREATE POLICY "mkt_performance_read" ON mkt_performance FOR SELECT USING (true);
DROP POLICY IF EXISTS "mkt_performance_write" ON mkt_performance;
CREATE POLICY "mkt_performance_write" ON mkt_performance FOR ALL USING (true);

-- ── 시드 데이터: comm_events 샘플 ──────────────────────────
INSERT INTO comm_events (tenant_id, title, start_at, end_at, description)
SELECT t.id, v.title, v.start_at, v.end_at, v.description
FROM (SELECT id FROM wio_tenants WHERE slug = 'tenone' LIMIT 1) t,
(VALUES
    ('주간 팀 회의',              (CURRENT_DATE + '10:00'::TIME)::TIMESTAMPTZ, (CURRENT_DATE + '11:00'::TIME)::TIMESTAMPTZ, '회의'),
    ('MADLeap 5기 정기 모임',     (CURRENT_DATE + '14:00'::TIME)::TIMESTAMPTZ, (CURRENT_DATE + '16:00'::TIME)::TIMESTAMPTZ, '행사'),
    ('CJ ENM 콜라보 미팅',       ((CURRENT_DATE + 1) + '11:00'::TIME)::TIMESTAMPTZ, ((CURRENT_DATE + 1) + '12:00'::TIME)::TIMESTAMPTZ, '미팅'),
    ('콘텐츠 파이프라인 리뷰',    ((CURRENT_DATE + 1) + '15:00'::TIME)::TIMESTAMPTZ, ((CURRENT_DATE + 1) + '16:00'::TIME)::TIMESTAMPTZ, '리뷰'),
    ('월간 경영 보고',            ((CURRENT_DATE + 3) + '09:30'::TIME)::TIMESTAMPTZ, ((CURRENT_DATE + 3) + '11:00'::TIME)::TIMESTAMPTZ, '회의'),
    ('LUKI 2nd Single 컨셉 회의', ((CURRENT_DATE + 2) + '14:00'::TIME)::TIMESTAMPTZ, ((CURRENT_DATE + 2) + '15:30'::TIME)::TIMESTAMPTZ, '회의')
) AS v(title, start_at, end_at, description)
WHERE NOT EXISTS (SELECT 1 FROM comm_events WHERE comm_events.title = v.title AND comm_events.start_at = v.start_at);

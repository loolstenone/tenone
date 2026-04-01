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

CREATE INDEX IF NOT EXISTS idx_library_bookmarks_user ON library_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_library_bookmarks_item ON library_bookmarks(item_id);

ALTER TABLE library_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "library_bookmarks_read" ON library_bookmarks;
CREATE POLICY "library_bookmarks_read" ON library_bookmarks FOR SELECT USING (true);
DROP POLICY IF EXISTS "library_bookmarks_write" ON library_bookmarks;
CREATE POLICY "library_bookmarks_write" ON library_bookmarks FOR ALL USING (true);

-- ── comm_events (사내 일정) ────────────────────────────────
CREATE TABLE IF NOT EXISTS comm_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    event_type TEXT DEFAULT '',            -- '회의', '행사', '미팅', '리뷰' 등
    description TEXT,
    location TEXT,
    brand_id TEXT DEFAULT 'tenone',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_events_date ON comm_events(event_date);
CREATE INDEX IF NOT EXISTS idx_comm_events_brand ON comm_events(brand_id);

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

CREATE INDEX IF NOT EXISTS idx_mkt_performance_channel ON mkt_performance(channel);
CREATE INDEX IF NOT EXISTS idx_mkt_performance_period ON mkt_performance(period);

ALTER TABLE mkt_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_performance_read" ON mkt_performance;
CREATE POLICY "mkt_performance_read" ON mkt_performance FOR SELECT USING (true);
DROP POLICY IF EXISTS "mkt_performance_write" ON mkt_performance;
CREATE POLICY "mkt_performance_write" ON mkt_performance FOR ALL USING (true);

-- ── 시드 데이터: comm_events 샘플 ──────────────────────────
INSERT INTO comm_events (title, event_date, event_time, event_type) VALUES
    ('주간 팀 회의', CURRENT_DATE, '10:00', '회의'),
    ('MADLeap 5기 정기 모임', CURRENT_DATE, '14:00', '행사'),
    ('CJ ENM 콜라보 미팅', CURRENT_DATE + 1, '11:00', '미팅'),
    ('콘텐츠 파이프라인 리뷰', CURRENT_DATE + 1, '15:00', '리뷰'),
    ('월간 경영 보고', CURRENT_DATE + 3, '09:30', '회의'),
    ('LUKI 2nd Single 컨셉 회의', CURRENT_DATE + 2, '14:00', '회의')
ON CONFLICT DO NOTHING;

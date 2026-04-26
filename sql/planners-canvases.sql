-- Planner's AI 자유 캔버스 (Excalidraw)
-- 손글씨·도형·텍스트·화살표 자유롭게 그릴 수 있는 페이지 단위 도화지.
-- data 컬럼은 Excalidraw scene JSON (elements + appState).

CREATE TABLE IF NOT EXISTS planners_canvases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '제목 없음',
    data JSONB NOT NULL DEFAULT '{"elements":[],"appState":{}}'::jsonb,
    thumbnail_url TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planners_canvases_member ON planners_canvases(member_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_planners_canvases_active ON planners_canvases(member_id) WHERE is_archived = false;

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION planners_canvases_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS planners_canvases_touch_trigger ON planners_canvases;
CREATE TRIGGER planners_canvases_touch_trigger
BEFORE UPDATE ON planners_canvases
FOR EACH ROW EXECUTE FUNCTION planners_canvases_touch();

-- RLS — 본인만 CRUD
ALTER TABLE planners_canvases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planners_canvases_self ON planners_canvases;
CREATE POLICY planners_canvases_self ON planners_canvases
    FOR ALL USING (auth.uid() = member_id) WITH CHECK (auth.uid() = member_id);

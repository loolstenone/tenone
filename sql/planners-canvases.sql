-- Planner's AI 자유 캔버스 (Excalidraw)
-- 손글씨·도형·텍스트·화살표 자유롭게 그릴 수 있는 페이지 단위 도화지.
-- data 컬럼은 Excalidraw scene JSON (elements + appState).

CREATE TABLE IF NOT EXISTS myverse_canvases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '제목 없음',
    data JSONB NOT NULL DEFAULT '{"elements":[],"appState":{}}'::jsonb,
    thumbnail_url TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myverse_canvases_member ON myverse_canvases(member_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_myverse_canvases_active ON myverse_canvases(member_id) WHERE is_archived = false;

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION myverse_canvases_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS myverse_canvases_touch_trigger ON myverse_canvases;
CREATE TRIGGER myverse_canvases_touch_trigger
BEFORE UPDATE ON myverse_canvases
FOR EACH ROW EXECUTE FUNCTION myverse_canvases_touch();

-- RLS — 본인만 CRUD
ALTER TABLE myverse_canvases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS myverse_canvases_self ON myverse_canvases;
CREATE POLICY myverse_canvases_self ON myverse_canvases
    FOR ALL USING (auth.uid() = member_id) WITH CHECK (auth.uid() = member_id);

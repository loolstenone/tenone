-- Personal OS TimeBlock — 타임블로킹
-- Task를 특정 시간 슬롯에 배치. 캘린더와는 별개 레이어 (캘린더는 외부 이벤트).
-- task_id가 NULL이면 독립 블록 (캘린더 없는 집중 시간), NOT NULL이면 Task 실행 슬롯.

CREATE TABLE IF NOT EXISTS myverse_timeblocks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- 시간
    date            DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,

    -- 내용
    title           TEXT,                       -- 독립 블록일 때 라벨
    task_id         TEXT,                       -- myverse_daily.tasks JSONB 의 task.id (UUID 문자열)
    project_id      UUID REFERENCES myverse_projects(id) ON DELETE SET NULL,

    -- 상태
    state           TEXT NOT NULL DEFAULT 'planned' CHECK (state IN ('planned', 'doing', 'done', 'skipped')),

    -- 캘린더 연동 (block을 캘린더 이벤트로도 push했을 때)
    google_event_id TEXT,
    google_synced_at TIMESTAMPTZ,

    -- 메타
    color           TEXT,
    note            TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_timeblocks_member_date
    ON myverse_timeblocks(member_id, date);
CREATE INDEX IF NOT EXISTS idx_timeblocks_task
    ON myverse_timeblocks(member_id, task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_timeblocks_project
    ON myverse_timeblocks(member_id, project_id) WHERE project_id IS NOT NULL;

-- updated_at 트리거
CREATE OR REPLACE FUNCTION myverse_timeblocks_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_timeblocks_touch ON myverse_timeblocks;
CREATE TRIGGER trg_timeblocks_touch
    BEFORE UPDATE ON myverse_timeblocks
    FOR EACH ROW EXECUTE FUNCTION myverse_timeblocks_touch();

-- RLS
ALTER TABLE myverse_timeblocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS timeblocks_owner ON myverse_timeblocks;
CREATE POLICY timeblocks_owner ON myverse_timeblocks
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

COMMENT ON TABLE myverse_timeblocks IS
    'Personal OS 타임블로킹. Today 화면에서 Task를 시간 슬롯에 배치. 캘린더에 push 가능(google_event_id).';

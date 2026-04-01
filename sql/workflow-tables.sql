-- ============================================================================
-- Workflow 테이블 생성 (workflow_tasks, content_pipeline, workflow_automations)
-- ============================================================================
-- projects 테이블은 step3-erp-tables.sql에서 이미 생성됨
-- phase, task_ids 컬럼 추가 필요
-- ============================================================================

-- ── Workflow Tasks (칸반 태스크) ──
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT DEFAULT 'Backlog',       -- Backlog, Todo, In Progress, Review, Done
    priority        TEXT DEFAULT 'Medium',         -- Low, Medium, High, Urgent
    assignee        TEXT,
    brand_id        TEXT DEFAULT 'tenone',
    due_date        DATE,
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wf_tasks_status ON workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_brand ON workflow_tasks(brand_id);

-- ── Content Pipeline (콘텐츠 제작 파이프라인) ──
CREATE TABLE IF NOT EXISTS content_pipeline (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    type            TEXT DEFAULT 'Post',           -- Video, Post, Blog, Shorts, Music
    stage           TEXT DEFAULT 'Idea',           -- Idea, Scripting, Production, Review, Scheduled, Published
    brand_id        TEXT DEFAULT 'tenone',
    assignee        TEXT,
    due_date        DATE,
    ai_generated    BOOLEAN DEFAULT false,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON content_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_brand ON content_pipeline(brand_id);

-- ── projects 테이블에 phase, task_ids 컬럼 추가 ──
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'Planning';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS task_ids TEXT[] DEFAULT '{}';

-- ── Workflow Automations (자동화 규칙) ──
CREATE TABLE IF NOT EXISTS workflow_automations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    trigger         JSONB NOT NULL DEFAULT '{}',
    conditions      JSONB DEFAULT '[]',
    actions         JSONB DEFAULT '[]',
    enabled         BOOLEAN DEFAULT true,
    brand_id        TEXT DEFAULT 'tenone',
    last_triggered  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wf_auto_enabled ON workflow_automations(enabled);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_tasks_read" ON workflow_tasks;
CREATE POLICY "workflow_tasks_read" ON workflow_tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "workflow_tasks_write" ON workflow_tasks;
CREATE POLICY "workflow_tasks_write" ON workflow_tasks FOR ALL USING (true);

ALTER TABLE content_pipeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_pipeline_read" ON content_pipeline;
CREATE POLICY "content_pipeline_read" ON content_pipeline FOR SELECT USING (true);
DROP POLICY IF EXISTS "content_pipeline_write" ON content_pipeline;
CREATE POLICY "content_pipeline_write" ON content_pipeline FOR ALL USING (true);

ALTER TABLE workflow_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_automations_read" ON workflow_automations;
CREATE POLICY "workflow_automations_read" ON workflow_automations FOR SELECT USING (true);
DROP POLICY IF EXISTS "workflow_automations_write" ON workflow_automations;
CREATE POLICY "workflow_automations_write" ON workflow_automations FOR ALL USING (true);

-- Phase 1: 프로젝트 카테고리·커스텀 필드·트래킹 메트릭·마일스톤 추가
-- myverse_projects 확장 + myverse_project_milestones 신규

-- ── myverse_projects 컬럼 추가 ─────────────────────────────────────
ALTER TABLE myverse_projects
    ADD COLUMN IF NOT EXISTS category text DEFAULT 'custom',
    ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private',
    ADD COLUMN IF NOT EXISTS tracking_metrics text[] DEFAULT '{}';

-- 카테고리 인덱스 (필터링용)
CREATE INDEX IF NOT EXISTS myverse_projects_category_idx ON myverse_projects(member_id, category);

-- ── myverse_project_milestones 신규 ───────────────────────────────
CREATE TABLE IF NOT EXISTS myverse_project_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES myverse_projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date date,
    done_at timestamptz,
    order_index int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS myverse_project_milestones_project_idx
    ON myverse_project_milestones(project_id, order_index);

-- RLS — 프로젝트 소유자만
ALTER TABLE myverse_project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "milestones_owner_all" ON myverse_project_milestones;
CREATE POLICY "milestones_owner_all" ON myverse_project_milestones
    FOR ALL
    USING (
        project_id IN (
            SELECT id FROM myverse_projects
            WHERE member_id = (
                SELECT id FROM members WHERE auth_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM myverse_projects
            WHERE member_id = (
                SELECT id FROM members WHERE auth_id = auth.uid()
            )
        )
    );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION myverse_project_milestones_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS myverse_project_milestones_updated_at_trigger ON myverse_project_milestones;
CREATE TRIGGER myverse_project_milestones_updated_at_trigger
    BEFORE UPDATE ON myverse_project_milestones
    FOR EACH ROW EXECUTE FUNCTION myverse_project_milestones_updated_at();

-- Planner's AI 베타 피드백 인박스
-- 사용자가 BetaFeedbackButton 으로 보낸 메시지를 DB 에 영구 보관 + 인트라에서 관리

CREATE TABLE IF NOT EXISTS planners_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    message TEXT NOT NULL,
    user_agent TEXT,
    page_path TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'archived')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    notes TEXT,
    handled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    handled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planners_feedback_status ON planners_feedback(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_planners_feedback_user ON planners_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_planners_feedback_priority ON planners_feedback(priority, created_at DESC);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION planners_feedback_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS planners_feedback_touch_trigger ON planners_feedback;
CREATE TRIGGER planners_feedback_touch_trigger
BEFORE UPDATE ON planners_feedback
FOR EACH ROW EXECUTE FUNCTION planners_feedback_touch();

-- RLS — 사용자는 본인 피드백만 INSERT/SELECT, 인트라는 service_role 로 bypass
ALTER TABLE planners_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planners_feedback_self_insert ON planners_feedback;
CREATE POLICY planners_feedback_self_insert ON planners_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS planners_feedback_self_select ON planners_feedback;
CREATE POLICY planners_feedback_self_select ON planners_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- (인트라 staff/manager 는 service_role 클라이언트 사용 → bypass)

-- ========================================================================
-- Action Hub Registry 등록 (선택)
-- 신규 피드백(status='new') 카운트가 Dashboard 에 자동 노출되도록.
-- lib/action-hub-registry.ts 에서 entry 추가:
--   { key: 'planners_feedback_new', label: 'PP AI 베타 피드백',
--     table: 'planners_feedback', filter: { column: 'status', value: 'new' },
--     href: '/intra/planners/feedback', brand_id: 'planners',
--     category: 'cs', priority: 'normal' }
-- ========================================================================

-- ============================================================
-- Messenger Hub Architecture — DB Migration
-- 날짜: 2026-04-12
-- 목적: 통합 커맨드 센터 (사람+클라우드AI+로컬AI+서비스)
-- ============================================================

-- ── 1. chat_threads 확장 ────────────────────────────────────

-- thread_type 확장: 기존 dm|group|channel + 신규 agent_dm|service
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS agent_runtime TEXT;
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_chat_threads_service ON chat_threads(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_threads_runtime ON chat_threads(agent_runtime) WHERE agent_runtime IS NOT NULL;

-- ── 2. chat_messages 확장 ───────────────────────────────────

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_format TEXT DEFAULT 'text';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS action_payload JSONB;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS correlation_id UUID;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_chat_messages_format ON chat_messages(message_format) WHERE message_format != 'text';
CREATE INDEX IF NOT EXISTS idx_chat_messages_correlation ON chat_messages(correlation_id) WHERE correlation_id IS NOT NULL;

-- ── 3. agent_profiles 확장 (로컬 AI 지원) ──────────────────

ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS runtime TEXT DEFAULT 'cloud';
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS local_endpoint TEXT;
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS fallback_agent TEXT;

-- ── 4. messenger_service_hooks 테이블 ───────────────────────

CREATE TABLE IF NOT EXISTS messenger_service_hooks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name  TEXT UNIQUE NOT NULL,
    display_name  TEXT NOT NULL,
    icon          TEXT,
    color         TEXT,
    webhook_url   TEXT,
    callback_base TEXT,
    events        TEXT[] DEFAULT '{}',
    is_active     BOOLEAN DEFAULT true,
    tenant_id     TEXT DEFAULT 'tenone',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE messenger_service_hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "msh_select" ON messenger_service_hooks FOR SELECT USING (auth_is_staff());
CREATE POLICY "msh_insert" ON messenger_service_hooks FOR INSERT WITH CHECK (auth_is_staff());
CREATE POLICY "msh_update" ON messenger_service_hooks FOR UPDATE USING (auth_is_staff());

-- ── 5. 시드 데이터 ─────────────────────────────────────────

-- 서비스 훅 시드
INSERT INTO messenger_service_hooks (service_name, display_name, icon, color, events) VALUES
('mindle',    'Mindle',     'Brain',      '#6366f1', ARRAY['trend_found', 'content_ready', 'newsletter_published']),
('gravity',   'Gravity',    'Globe',      '#f59e0b', ARRAY['scan_complete', 'brief_ready', 'brief_approved', 'competitor_alert']),
('smarcomm',  'SmarComm',   'Megaphone',  '#ec4899', ARRAY['campaign_result', 'lead_scored', 'ab_test_done']),
('wio',       'WIO',        'Server',     '#10b981', ARRAY['module_alert', 'subscription_event', 'system_health']),
('hero',      'HeRo',       'UserSearch',  '#8b5cf6', ARRAY['talent_match', 'interview_scheduled', 'offer_sent']),
('madleague', 'MADLeague',  'Users',      '#ef4444', ARRAY['member_joined', 'event_created', 'club_update'])
ON CONFLICT (service_name) DO NOTHING;

-- 로컬 에이전트 시드
INSERT INTO agent_profiles (name, display_name, layer, agent_type, brand_id, runtime, local_endpoint, fallback_agent, model_id, system_prompt, can_invoke) VALUES
(
    'openclaw', 'OpenClaw', 1, 'infra', 'tenone', 'local',
    'http://localhost:8080/v1/chat', '1001', 'openclaw-local',
    '당신은 OpenClaw. Ten:One PC에 상주하는 AI 에이전트 런타임. 워크플로우 실행, 로컬 파일 처리, 자동화 태스크 전담.',
    ARRAY['1001']
),
(
    'gemma', 'Gemma', 1, 'infra', 'tenone', 'local',
    'http://localhost:11434/api/chat', '1001', 'gemma3-27b',
    '당신은 Gemma. 로컬에서 실행되는 경량 AI. 문서 검토, 요약, 번역, 간단한 분석 전담. 비용 0, 프라이버시 보장.',
    ARRAY['1001']
)
ON CONFLICT (name) DO NOTHING;

SELECT 'messenger-hub-migration DONE' AS result;

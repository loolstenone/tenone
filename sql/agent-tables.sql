-- ============================================================================
-- Agent System 테이블: Universe OS Phase 1
--   - agent_profiles : 에이전트 정체성 + 능력 정의
--   - agent_messages : 모든 에이전트 대화/행위 로그
-- ============================================================================
-- 실행 대상: Prod Supabase SQL Editor
-- ============================================================================

-- ── agent_profiles ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_profiles (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT    UNIQUE NOT NULL,           -- 'compass', 'badaksoe', 'madleague'
    display_name  TEXT    NOT NULL,                  -- '나침반', '바닥쇠', 'MAD 매니저'
    layer         INT     NOT NULL DEFAULT 2,        -- 0=메타, 1=인프라, 2=브랜드, 3=서브
    agent_type    TEXT    NOT NULL DEFAULT 'brand',  -- meta | infra | brand | sub
    model_id      TEXT    NOT NULL DEFAULT 'claude-sonnet-4-6',
    system_prompt TEXT    NOT NULL,
    temperature   FLOAT   NOT NULL DEFAULT 0.3,
    max_tokens    INT     NOT NULL DEFAULT 4096,
    knowledge_refs JSONB  NOT NULL DEFAULT '[]',     -- 참조 문서 URI 배열
    tools         JSONB   NOT NULL DEFAULT '[]',     -- { name, endpoint, description }[]
    risk_level    TEXT    NOT NULL DEFAULT 'green',  -- green | yellow | red
    can_invoke    TEXT[]  NOT NULL DEFAULT '{}',     -- 호출 가능한 에이전트 이름 목록
    is_active     BOOLEAN NOT NULL DEFAULT true,
    version       TEXT    NOT NULL DEFAULT '1.0.0',
    brand_id      TEXT    DEFAULT 'tenone',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_profiles_name     ON agent_profiles(name);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_layer    ON agent_profiles(layer);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_active   ON agent_profiles(is_active);

-- ── agent_messages ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_messages (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent     TEXT NOT NULL,                    -- 발신 에이전트명 or 'user'
    to_agent       TEXT NOT NULL,                    -- 수신 에이전트명 or 'user'
    message_type   TEXT NOT NULL DEFAULT 'user_input', -- user_input | agent_response | route | invoke | error
    payload        JSONB NOT NULL DEFAULT '{}',      -- { input, output, routed_to, ... }
    risk_level     TEXT  NOT NULL DEFAULT 'green',   -- green | yellow | red
    confidence     FLOAT,                            -- 0.0~1.0, NULL 가능
    correlation_id UUID,                             -- 같은 대화 흐름 추적용
    user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_from       ON agent_messages(from_agent);
CREATE INDEX IF NOT EXISTS idx_agent_messages_to         ON agent_messages(to_agent);
CREATE INDEX IF NOT EXISTS idx_agent_messages_corr       ON agent_messages(correlation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_user       ON agent_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created    ON agent_messages(created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ap_select"  ON agent_profiles;
CREATE POLICY "ap_select" ON agent_profiles FOR SELECT USING (auth_is_staff());

DROP POLICY IF EXISTS "ap_insert"  ON agent_profiles;
CREATE POLICY "ap_insert" ON agent_profiles FOR INSERT WITH CHECK (auth_is_staff());

DROP POLICY IF EXISTS "ap_update"  ON agent_profiles;
CREATE POLICY "ap_update" ON agent_profiles FOR UPDATE USING (auth_is_staff());


ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "am_select"  ON agent_messages;
CREATE POLICY "am_select" ON agent_messages FOR SELECT USING (auth_is_staff());

DROP POLICY IF EXISTS "am_insert"  ON agent_messages;
CREATE POLICY "am_insert" ON agent_messages FOR INSERT WITH CHECK (true);  -- 서버에서 항상 삽입 가능


-- ── 기존 테이블에 누락된 컬럼 추가 (IF NOT EXISTS로 안전하게) ────────────────────
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS brand_id TEXT DEFAULT 'tenone';
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS version  TEXT NOT NULL DEFAULT '1.0.0';

-- ── 초기 에이전트 시드 데이터 ─────────────────────────────────────────────────

-- ⚠️ 시드 데이터 원칙: ON CONFLICT (name) DO NOTHING — 기존 프롬프트 덮어쓰기 방지
-- agent_type: meta | agent | chatbot
INSERT INTO agent_profiles (name, display_name, layer, agent_type, brand_id, model_id, system_prompt, temperature, max_tokens, risk_level, can_invoke) VALUES

-- L0 메타: 열시일분 (오케스트레이터)
(
    '1001', '열시일분', 0, 'meta', 'tenone', 'claude-sonnet-4-6',
    '너는 1001(열시일분). Ten:One Universe의 오케스트레이터이자 텐원(대표)의 가장 가까운 AI 파트너다. Layer 0 — 모든 에이전트 위에서 판단하고 조율한다.

라우팅 규칙:
- 인재/채용/커리어/HIT/HR → hero
- 트렌드/크롤링/정보수집/뉴스 → mindle
- 마케팅/캠페인/광고/CRM → smarcomm
- 바닥 커뮤니티/DAM Party/네트워킹 → badak
- 대학 동아리/리거/MADLeague → madleague
- 지역 클럽/MADLeap → madleap
- IT 인프라/WIO/솔루션 → wio
- 카카오 수신/외부 채팅방 → deutbot
- 기획/교육/Vrief/방법론/역량/Planner''s → planner
- 크리에이티브/영상/이미지/카피/AI제작/RooK → rook
- 아이돌/크리에이터/엔터/MoNTZ → montz
- 패션/패션위크/FWN/해외진출 → fwn
- 프로젝트/크루모집/YouInOne → youinone
- 일반/텍스트 전체 → 직접 응답

JSON 호출 프로토콜: {"agent": "이름", "reason": "이유", "query": "전달 내용"}

응답 원칙: 이모지·마크다운 헤딩 없이 순수 텍스트. 3문장 이내. 라우팅 시 JSON만 출력.',
    0.3, 2048, 'green',
    ARRAY['madleague','badak','smarcomm','hero','mindle','wio','deutbot','madleap','planner','rook','montz','fwn','youinone']
),

-- L1 챗봇: 듣봇 (정보 수신·분류)
(
    'deutbot', '듣봇', 1, 'chatbot', 'tenone', 'claude-sonnet-4-6',
    '너는 듣봇(deutbot). 외부 채널(카카오 오픈채팅 등) 정보 수집·분류·라우팅 게이트웨이. 수신 전용. 복잡한 상담은 전담 에이전트로 전달. 2문장 이내. 이모지·마크다운 없이.',
    0.3, 1024, 'green', ARRAY['1001']
),

-- L2 에이전트: 바닥 (Badak 브랜드 담당)
(
    'badak', '바닥', 2, 'agent', 'badak', 'claude-sonnet-4-6',
    '당신은 바닥(Badak) 커뮤니티의 AI 에이전트 바닥이입니다. 마케팅/광고 업계 종사자 9,000명+ 네트워킹 커뮤니티를 운영합니다. 직군별/직급별/테마별 카카오 오픈채팅방, DAM Party 네트워킹. 친근하게. 이모지·마크다운 없이.',
    0.5, 2048, 'green', ARRAY['1001', 'mindle', 'hero']
),

-- L2 에이전트: 플래너스 (기획자 양성)
(
    'planner', '플래너스', 2, 'agent', 'planners', 'claude-sonnet-4-6',
    '당신은 플래너스(Planner''s)의 AI 에이전트입니다. Planner''s는 기획자 양성·성장 플랫폼입니다. 기획 교육, Vrief 워크숍, 역량 평가, 방법론 공유. 전문적이고 따뜻한 톤. 이모지·마크다운 없이.',
    0.5, 2048, 'green', ARRAY['1001', 'hero', 'mindle']
),

-- L1 에이전트: 루크 (AI 크리에이티브)
(
    'rook', '루크', 1, 'agent', 'rook', 'claude-sonnet-4-6',
    '당신은 루크(RooK)의 AI 에이전트입니다. AI 크리에이티브 스튜디오. AI 영상·이미지·카피 제작, 크리에이티브 디렉션. 창의적이고 영감을 주는 톤. 이모지·마크다운 없이.',
    0.6, 2048, 'green', ARRAY['1001', 'mindle', 'smarcomm']
),

-- L2 에이전트: 몬츠 (AI 엔터테인먼트)
(
    'montz', '몬츠', 2, 'agent', 'montz', 'claude-sonnet-4-6',
    '당신은 몬츠(MoNTZ)의 AI 에이전트입니다. AI 엔터테인먼트·크리에이터 매니지먼트. AI 아이돌, 가상 아티스트, 크리에이터 이코노미. 열정적이고 팬 친화적인 톤. 이모지·마크다운 없이.',
    0.6, 2048, 'green', ARRAY['1001', 'rook', 'smarcomm']
),

-- L2 에이전트: FWN (패션위크 네트워크)
(
    'fwn', 'FWN', 2, 'agent', 'fwn', 'claude-sonnet-4-6',
    '당신은 FWN(Fashion Week Network)의 AI 에이전트입니다. 한국 패션 해외 진출 네트워크. 패션위크 참가, 해외 바이어 연결, K-패션 글로벌 진출. 세련되고 전문적인 톤. 이모지·마크다운 없이.',
    0.4, 2048, 'green', ARRAY['1001', 'mindle', 'badak']
),

-- L2 에이전트: 유인원 (프로젝트 크루)
(
    'youinone', '유인원', 2, 'agent', 'youinone', 'claude-sonnet-4-6',
    '당신은 유인원(YouInOne)의 AI 에이전트입니다. 프로젝트 크루 모집·실행 플랫폼. 역할 매칭, 시수 관리, 정산, Universe 온보딩. 활기차고 실행 지향적인 톤. 이모지·마크다운 없이.',
    0.5, 2048, 'green', ARRAY['1001', 'hero', 'madleague', 'smarcomm']
)

ON CONFLICT (name) DO NOTHING;


-- ============================================================================
SELECT 'agent_profiles + agent_messages tables DONE' AS result;
SELECT name, display_name, layer, agent_type, is_active FROM agent_profiles ORDER BY layer, name;
-- ============================================================================

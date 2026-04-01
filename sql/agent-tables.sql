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

INSERT INTO agent_profiles (name, display_name, layer, agent_type, model_id, system_prompt, temperature, max_tokens, risk_level, can_invoke) VALUES

-- L0 메타: 나침반 (Universe 전체 안내자)
(
    'compass',
    '나침반',
    0,
    'meta',
    'claude-sonnet-4-6',
    '당신은 Ten:One Universe의 나침반(Compass) 에이전트입니다.

Ten:One Universe는 다음 브랜드들로 구성된 멀티 브랜드 생태계입니다:
- TenOne (본사, 기업 운영)
- MAD League (대학 동아리 연합)
- MAD Leap (커리어 도약 프로그램)
- Badak / 바닥 (마케팅 광고 네트워킹 커뮤니티)
- Mindle (트렌드 크롤링 & 콘텐츠)
- HeRo (인재 매칭)
- SmarComm (마케팅 커뮤니케이션 솔루션)
- YouInOne (크루 시수 & 정산)
- Evolution School (교육)

역할:
1. 사용자 질문의 의도를 파악하고 가장 적합한 브랜드/서비스로 안내합니다.
2. 더 전문적인 처리가 필요하면 적절한 에이전트 이름을 JSON으로 반환합니다.
3. 일반적인 TenOne 관련 질문은 직접 답변합니다.

응답 원칙:
- 한국어로 응답합니다 (요청이 영어면 영어로).
- 간결하고 실용적으로 답합니다.
- 에이전트 라우팅이 필요하면: {"agent": "에이전트명", "reason": "이유"} 형식으로 응답합니다.',
    0.3,
    2048,
    'green',
    ARRAY['madleague', 'badaksoe']
),

-- L2 브랜드: MAD 매니저 (MAD League 동아리 연합 관리)
(
    'madleague',
    'MAD 매니저',
    2,
    'brand',
    'claude-sonnet-4-6',
    '당신은 MAD League의 MAD 매니저 에이전트입니다.

MAD League는 대학 동아리 연합 커뮤니티입니다.

역할:
1. 동아리 멤버 관리 및 정보 안내
2. 프로젝트 매칭 및 팀 구성 지원
3. 활동 일정 및 이벤트 안내
4. 동아리 운영 관련 질문 답변

특징:
- 대학생 친화적이고 활기찬 톤으로 소통합니다.
- 팀워크와 성장을 강조합니다.
- 한국어로 응답합니다.',
    0.5,
    2048,
    'green',
    ARRAY[]::TEXT[]
),

-- L2 브랜드: 바닥쇠 (Badak 네트워킹 커뮤니티 에이전트)
(
    'badaksoe',
    '바닥쇠',
    2,
    'brand',
    'claude-sonnet-4-6',
    '당신은 바닥(Badak) 커뮤니티의 바닥쇠 에이전트입니다.

바닥(Badak)은 마케팅/광고 업계 종사자들의 네트워킹 커뮤니티입니다.
"바닥쇠"는 이 커뮤니티를 운영하고 연결하는 에이전트입니다.

역할:
1. 커뮤니티 멤버 간 네트워킹 연결
2. 업계 인사이트 및 트렌드 공유
3. 미팅/모임 기획 지원
4. 마케팅/광고 관련 질문 답변

특징:
- 업계 전문성을 갖추되 친근한 톤으로 소통합니다.
- 실용적이고 현장 중심의 조언을 제공합니다.
- "바닥에서 올라가는" 성장 마인드셋을 강조합니다.
- 한국어로 응답합니다.',
    0.5,
    2048,
    'green',
    ARRAY[]::TEXT[]
)

ON CONFLICT (name) DO NOTHING;


-- ============================================================================
SELECT 'agent_profiles + agent_messages tables DONE' AS result;
SELECT name, display_name, layer, agent_type, is_active FROM agent_profiles ORDER BY layer, name;
-- ============================================================================

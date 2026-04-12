# Intra Messenger Hub Architecture

> **Ten:One Universe 통합 커맨드 센터**
> 사람 + 클라우드 AI + 로컬 AI + 서비스 = 하나의 메신저
>
> 작성일: 2026-04-12
> 상태: 설계 (Design Phase)

---

## PART 1: DB 스키마 확장 설계

### 원칙
- 기존 `chat_threads` / `chat_messages` 테이블 확장 (신규 테이블 최소화)
- `agent_messages`는 에이전트 내부 로그 → 메신저는 `chat_messages`로 통합
- 새 테이블은 `messenger_actions` 1개만 추가

### 1-1. chat_threads 확장

```sql
-- 기존 thread_type: 'dm' | 'group' | 'channel'
-- 추가 thread_type: 'agent_dm' | 'service'

ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS thread_type TEXT DEFAULT 'dm';
-- 값: dm | group | channel | agent_dm | service

-- 에이전트/서비스 연결
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS agent_name TEXT;        -- 기존 (에이전트 채널)
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS service_name TEXT;      -- 신규: mindle | gravity | smarcomm | ...
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS agent_runtime TEXT;     -- 신규: cloud | local | null
  -- cloud = Claude API, local = OpenClaw/Gemma4, null = 사람/서비스

-- 핀/뮤트
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_threads_service ON chat_threads(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_threads_runtime ON chat_threads(agent_runtime) WHERE agent_runtime IS NOT NULL;
```

### 1-2. chat_messages 확장

```sql
-- 기존 sender_type: 'human' | 'agent' | 'system'
-- 추가 sender_type: 'service' | 'local_agent'

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'human';
-- 값: human | agent | system | service | local_agent

-- Action Message 지원
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_format TEXT DEFAULT 'text';
-- 값: text | action_card | file | rich (마크다운)

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS action_payload JSONB;
-- action_card일 때만 사용. 구조:
-- {
--   "title": "브랜드 스캔 완료",
--   "body": "tenone.biz 점수: 72 → 78 (+6)",
--   "actions": [
--     { "id": "act_1", "label": "상세 보기", "type": "navigate", "url": "/intra/gravity/scan/123" },
--     { "id": "act_2", "label": "브리프 생성", "type": "callback", "callback_url": "/api/gravity/brief", "payload": {"scan_id": "123"} },
--     { "id": "act_3", "label": "무시", "type": "dismiss" }
--   ],
--   "status": "pending",           -- pending | acted | expired
--   "acted_action_id": null,       -- 사용자가 선택한 action id
--   "acted_at": null
-- }

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS correlation_id UUID;
-- 같은 작업 흐름 추적 (Mindle 발견 → 브리프 생성 → 발행 = 같은 correlation)

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB;
-- 서비스별 확장 데이터 (스캔 결과, 캠페인 지표 등)

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_format ON chat_messages(message_format) WHERE message_format != 'text';
CREATE INDEX IF NOT EXISTS idx_chat_messages_correlation ON chat_messages(correlation_id) WHERE correlation_id IS NOT NULL;
```

### 1-3. 신규 테이블: messenger_service_hooks

```sql
-- 서비스 등록 테이블 (어떤 서비스가 메신저에 연결되어 있는가)
CREATE TABLE IF NOT EXISTS messenger_service_hooks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name  TEXT UNIQUE NOT NULL,            -- mindle | gravity | smarcomm | wio
    display_name  TEXT NOT NULL,                   -- 표시명
    icon          TEXT,                            -- lucide 아이콘명
    color         TEXT,                            -- 브랜드 색상 hex
    webhook_url   TEXT,                            -- 서비스 → 메신저 알림 수신 엔드포인트
    callback_base TEXT,                            -- 메신저 → 서비스 콜백 베이스 URL
    events        TEXT[] DEFAULT '{}',             -- 구독할 이벤트 타입 목록
    is_active     BOOLEAN DEFAULT true,
    tenant_id     TEXT DEFAULT 'tenone',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 시드
INSERT INTO messenger_service_hooks (service_name, display_name, icon, color, events) VALUES
('mindle',   'Mindle',    'Brain',       '#6366f1', ARRAY['trend_found', 'content_ready', 'newsletter_published']),
('gravity',  'Gravity',   'Globe',       '#f59e0b', ARRAY['scan_complete', 'brief_ready', 'brief_approved']),
('smarcomm', 'SmarComm',  'Megaphone',   '#ec4899', ARRAY['campaign_result', 'lead_scored', 'ab_test_done']),
('wio',      'WIO',       'Server',      '#10b981', ARRAY['module_alert', 'subscription_event', 'system_health']),
('hero',     'HeRo',      'UserSearch',   '#8b5cf6', ARRAY['talent_match', 'interview_scheduled', 'offer_sent']),
('madleague','MADLeague',  'Users',       '#ef4444', ARRAY['member_joined', 'event_created', 'club_update'])
ON CONFLICT (service_name) DO NOTHING;
```

### 1-4. agent_profiles 확장 (로컬 AI 지원)

```sql
-- 기존 agent_profiles에 로컬 AI 런타임 정보 추가
ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS runtime TEXT DEFAULT 'cloud';
-- 값: cloud | local

ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS local_endpoint TEXT;
-- local일 때: http://localhost:8080/v1/chat (OpenClaw) 또는 http://localhost:11434/api/chat (Ollama/Gemma4)

ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS fallback_agent TEXT;
-- 로컬 AI 오프라인 시 대체 에이전트 이름 (예: gemma4 오프라인 → 1001이 대신)

-- 로컬 에이전트 시드
INSERT INTO agent_profiles (name, display_name, layer, agent_type, brand_id, runtime, local_endpoint, fallback_agent, model_id, system_prompt, can_invoke) VALUES
(
    'openclaw', 'OpenClaw', 1, 'infra', 'tenone', 'local',
    'http://localhost:8080/v1/chat', '1001', 'openclaw-local',
    '당신은 OpenClaw. Ten:One PC에 상주하는 AI 에이전트 런타임. 워크플로우 실행, 로컬 파일 처리, 자동화 태스크 전담. 빠르고 정확하게.',
    ARRAY['1001']
),
(
    'gemma', 'Gemma', 1, 'infra', 'tenone', 'local',
    'http://localhost:11434/api/chat', '1001', 'gemma3-27b',
    '당신은 Gemma. 로컬에서 실행되는 경량 AI. 문서 검토, 요약, 번역, 간단한 분석 전담. 비용 0, 프라이버시 보장.',
    ARRAY['1001']
)
ON CONFLICT (name) DO NOTHING;
```

### 1-5. 전체 ERD 요약

```
┌──────────────────┐     ┌──────────────────────┐
│  chat_threads    │     │  agent_profiles      │
│                  │     │                      │
│  + thread_type   │────>│  + runtime (cloud/   │
│  + agent_name    │     │    local)            │
│  + service_name  │     │  + local_endpoint    │
│  + agent_runtime │     │  + fallback_agent    │
│  + is_pinned     │     └──────────────────────┘
│  + is_muted      │
└────────┬─────────┘     ┌──────────────────────┐
         │               │ messenger_service_   │
         │               │ hooks                │
┌────────┴─────────┐     │                      │
│  chat_messages   │     │  service_name        │
│                  │     │  webhook_url         │
│  + sender_type   │     │  callback_base       │
│  + message_format│     │  events[]            │
│  + action_payload│     └──────────────────────┘
│  + correlation_id│
│  + metadata      │     ┌──────────────────────┐
└──────────────────┘     │  agent_messages      │
                         │  (기존 유지 — 에이전트│
                         │   내부 로그 전용)     │
                         └──────────────────────┘
```

---

## PART 2: Local Agent Bridge 상세 구조

### 2-1. 아키텍처

```
PC (Windows 11)
│
├── OpenClaw (포트 8080)
│   └── /v1/chat  POST  — 채팅 요청
│   └── /v1/workflow POST — Lobster 워크플로우 실행
│   └── /v1/status GET  — 상태 확인
│
├── Ollama + Gemma 4 (포트 11434)
│   └── /api/chat POST  — 채팅 요청
│   └── /api/tags GET   — 모델 목록
│
└── Local Agent Bridge (Node.js 데몬, 포트 9090)
    ├── Supabase Realtime 구독 (chat_messages INSERT 감지)
    ├── 로컬 AI 라우팅 (agent_name → local_endpoint)
    ├── 상태 모니터링 (헬스체크 30초 주기)
    └── 응답 → Supabase INSERT (chat_messages)
```

### 2-2. Bridge 동작 흐름

```
1. 사용자가 메신저에서 OpenClaw에게 DM 전송
   → chat_messages INSERT (sender_type='human', thread.agent_runtime='local')

2. Bridge가 Supabase Realtime으로 감지
   → thread의 agent_name='openclaw', agent_runtime='local' 확인

3. Bridge가 agent_profiles에서 local_endpoint 조회
   → http://localhost:8080/v1/chat

4. Bridge가 로컬 AI에 요청 전송
   POST http://localhost:8080/v1/chat
   { "messages": [...], "model": "openclaw-local" }

5. 응답 수신 → chat_messages INSERT
   (sender_type='local_agent', sender_name='openclaw')

6. 사용자 메신저에 실시간 표시 (Supabase Realtime)
```

### 2-3. 오프라인 Fallback

```
Bridge 헬스체크 실패 (로컬 AI 응답 없음)
  → agent_profiles.fallback_agent 확인 ('1001')
  → 메신저에 시스템 메시지: "OpenClaw 오프라인. 1001이 대신 응답합니다."
  → Cloud Agent (1001)로 라우팅
  → 1001 응답 → chat_messages INSERT (sender_type='agent')
```

### 2-4. Bridge 핵심 코드 구조

```
local-agent-bridge/
├── package.json
├── src/
│   ├── index.ts              — 메인 (Supabase 연결 + 이벤트 루프)
│   ├── supabase-listener.ts  — Realtime 구독, 메시지 필터링
│   ├── router.ts             — agent_name → local_endpoint 매핑
│   ├── adapters/
│   │   ├── openclaw.ts       — OpenClaw API 어댑터
│   │   ├── ollama.ts         — Ollama (Gemma4) API 어댑터
│   │   └── base.ts           — 공통 인터페이스
│   ├── health.ts             — 헬스체크 (30초 주기)
│   ├── fallback.ts           — 오프라인 시 클라우드 에이전트 위임
│   └── config.ts             — 환경 변수 (.env)
└── .env
    SUPABASE_URL=...
    SUPABASE_SERVICE_ROLE_KEY=...
    OPENCLAW_PORT=8080
    OLLAMA_PORT=11434
    HEALTH_INTERVAL=30000
```

### 2-5. 어댑터 인터페이스

```typescript
// adapters/base.ts
interface LocalAgentAdapter {
  name: string;
  endpoint: string;

  // 상태 확인
  healthCheck(): Promise<boolean>;

  // 채팅 요청
  chat(params: {
    messages: { role: string; content: string }[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ content: string; model: string; ms: number }>;

  // 워크플로우 실행 (OpenClaw 전용)
  runWorkflow?(params: {
    workflowName: string;
    inputs: Record<string, unknown>;
  }): Promise<{ result: unknown; ms: number }>;
}
```

### 2-6. 에이전트 간 위임 (Cross-Runtime)

```
시나리오: 사용자 → Gemma에게 계약서 분석 → 결과를 1001에게 전달

1. 사용자: "이 계약서 검토해줘" (Gemma DM)
2. Gemma (로컬): 분석 결과 반환 → chat_messages
3. 사용자: "1001한테 넘겨서 수정안 만들어줘"
4. Bridge 감지: 위임 키워드 + 1001 멘션
5. Bridge → API /api/agent/hub 호출:
   { agentName: "1001", message: "Gemma 분석 결과: ...", context: { from_agent: "gemma" } }
6. 1001 (클라우드) 응답 → chat_messages (같은 thread, correlation_id 공유)
```

---

## PART 3: Service Hook 표준 스펙

### 3-1. 서비스 → 메신저 (알림 전송)

```
POST /api/messenger/service-hook
Authorization: Bearer {SERVICE_API_KEY}
Content-Type: application/json
```

```typescript
interface ServiceHookPayload {
  // 필수
  service: string;           // 'mindle' | 'gravity' | 'smarcomm' | ...
  event: string;             // 서비스별 이벤트 코드
  title: string;             // 알림 제목 (1줄)
  body: string;              // 본문 (3줄 이내)

  // 선택
  recipients?: string[];     // 수신자 user_id 배열 (없으면 tenant 전체)
  thread_id?: string;        // 기존 스레드에 이어서 보내기
  correlation_id?: string;   // 작업 흐름 추적
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;       // ISO 8601, 이 시간 이후 action 비활성화

  // Action Buttons (0~3개)
  actions?: ServiceAction[];

  // 확장 데이터 (UI에서 카드 렌더링용)
  metadata?: Record<string, unknown>;
}

interface ServiceAction {
  id: string;                // 고유 ID (act_xxx)
  label: string;             // 버튼 텍스트
  type: 'navigate' | 'callback' | 'dismiss' | 'delegate';
  url?: string;              // navigate: 이동할 경로
  callback_url?: string;     // callback: 서비스가 받을 URL
  callback_payload?: Record<string, unknown>;  // callback 시 전송할 데이터
  delegate_to?: string;      // delegate: 위임할 에이전트 이름
  style?: 'primary' | 'secondary' | 'danger';
}
```

### 3-2. 메신저 → 서비스 (사용자 액션 콜백)

사용자가 Action Button을 클릭하면:

```
POST {action.callback_url}
Content-Type: application/json
```

```typescript
interface ActionCallbackPayload {
  // 메신저가 보내는 데이터
  message_id: string;        // 원본 메시지 ID
  thread_id: string;         // 스레드 ID
  action_id: string;         // 클릭된 action ID
  user_id: string;           // 클릭한 사용자
  user_name: string;         // 사용자 이름
  correlation_id?: string;   // 추적 ID

  // 서비스가 보낸 원본 payload
  original_payload: Record<string, unknown>;
}
```

서비스 응답:

```typescript
interface ActionCallbackResponse {
  // 필수
  success: boolean;

  // 선택: 메신저에 후속 메시지 전송
  follow_up?: {
    title: string;
    body: string;
    actions?: ServiceAction[];  // 새로운 액션 (체이닝)
  };

  // 선택: 에이전트에게 위임
  delegate?: {
    agent_name: string;
    message: string;
    context?: Record<string, unknown>;
  };
}
```

### 3-3. 서비스별 이벤트 카탈로그

#### Mindle
| 이벤트 | 설명 | 액션 |
|--------|------|------|
| `trend_found` | 새 트렌드 N건 발견 | [확인] [브리프 생성] [무시] |
| `content_ready` | 콘텐츠 초안 완성 | [승인] [수정 요청] [폐기] |
| `newsletter_published` | 뉴스레터 발행 완료 | [확인] [성과 보기] |

#### Gravity
| 이벤트 | 설명 | 액션 |
|--------|------|------|
| `scan_complete` | 브랜드 스캔 완료 (점수 변동) | [상세 보기] [브리프 생성] |
| `brief_ready` | 콘텐츠 브리프 초안 생성 | [승인] [수정] [폐기] |
| `competitor_alert` | 경쟁사 점수 급변 | [분석 보기] [대응 브리프] |

#### SmarComm
| 이벤트 | 설명 | 액션 |
|--------|------|------|
| `campaign_result` | 캠페인 성과 보고 | [상세 보기] [후속 캠페인] |
| `lead_scored` | 리드 스코어링 완료 | [리드 목록] [자동 할당] |
| `ab_test_done` | A/B 테스트 결과 | [A안 채택] [B안 채택] [재테스트] |

#### HeRo
| 이벤트 | 설명 | 액션 |
|--------|------|------|
| `talent_match` | 인재 매칭 결과 | [프로필 보기] [면접 요청] |
| `interview_scheduled` | 면접 일정 확정 | [확인] [일정 변경] |

### 3-4. 전체 흐름 예시 (Gravity → 1001 → OpenClaw)

```
① Gravity 서비스가 스캔 완료
   POST /api/messenger/service-hook
   { service: "gravity", event: "scan_complete", title: "브랜드 스캔 완료", ... }

② 메신저가 Action Card 메시지 생성 → chat_messages INSERT
   사용자에게 실시간 알림

③ 사용자가 [브리프 생성] 클릭
   POST /api/gravity/brief  (callback)
   { message_id, action_id: "act_2", user_id, ... }

④ Gravity 서비스 응답:
   { success: true, delegate: { agent_name: "1001", message: "스캔 결과 기반 브리프 작성해줘", context: { scan_id: "123" } } }

⑤ 메신저가 1001에게 위임
   POST /api/agent/hub
   { agentName: "1001", message: "...", context: { from_service: "gravity" } }

⑥ 1001 응답 → chat_messages (같은 thread, correlation_id 유지)
   "브리프 초안 작성 완료. 확인해주세요."
   [승인] [수정] [폐기]

⑦ 사용자가 [승인] → OpenClaw에 발행 워크플로우 위임
   Bridge → OpenClaw /v1/workflow
   { workflowName: "publish_brief", inputs: { brief_id: "..." } }

⑧ OpenClaw 실행 완료 → chat_messages
   "브리프 발행 완료 ✓ → tenone.biz/blog/xxx"
```

---

## PART 4: UI/UX 와이어프레임

### 4-1. 메신저 전체 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  Intra Sidebar  │           Messenger Hub               │
│  ┌───────────┐  │  ┌─────────────┬───────────────────┐  │
│  │ Workspace │  │  │  Thread     │   Chat Area        │  │
│  │ ─────────│  │  │  List       │                    │  │
│  │ Agent Hub │  │  │             │  ┌──────────────┐  │  │
│  │>메신저    │  │  │ [탭 4개]    │  │ 메시지들      │  │  │
│  │ Todo      │  │  │ 사람|에이전 │  │              │  │  │
│  │ 타임시트  │  │  │ 트|서비스|  │  │ Action Card  │  │  │
│  │ ...       │  │  │ 채널       │  │ ┌──────────┐ │  │  │
│  │           │  │  │             │  │ │Gravity   │ │  │  │
│  │           │  │  │ ─────────  │  │ │스캔 완료  │ │  │  │
│  │           │  │  │ 검색바     │  │ │[보기][생성]│ │  │  │
│  │           │  │  │             │  │ └──────────┘ │  │  │
│  │           │  │  │ 스레드 목록 │  │              │  │  │
│  │           │  │  │ - Gravity  │  │              │  │  │
│  │           │  │  │ - 1001     │  │ ─────────── │  │  │
│  │           │  │  │ - Gemma    │  │ 입력창       │  │  │
│  │           │  │  │ - Sarah    │  │ [📎] [.....] │  │  │
│  │           │  │  │ - 경영진   │  │ [전송]       │  │  │
│  └───────────┘  │  └─────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4-2. 사이드바 탭 구조 (기존 3탭 → 4탭)

```
┌──────────┬──────────┬──────────┬──────────┐
│  사람    │ 에이전트  │  서비스   │  채널    │
│ (People) │ (Agent)  │(Service) │(Channel) │
└──────────┴──────────┴──────────┴──────────┘

[사람 탭]                    [에이전트 탭]
├── 최근 대화               ├── 클라우드 AI
│   ├── Sarah Kim           │   ├── 🟢 1001 (열시일분)
│   ├── 김준호              │   ├── 🟢 바닥
│   └── 박기획              │   ├── 🟢 루크
├── 그룹                    │   └── 🟢 플래너스
│   ├── 경영진 회의          ├── 로컬 AI
│   └── LUKI 프로젝트        │   ├── 🟢 OpenClaw (PC)
└── 조직도 (기존)            │   └── 🟡 Gemma (PC)
                             │       └── "PC 꺼짐"
[서비스 탭]                  [채널 탭]
├── 🔵 Mindle               ├── # 브리핑 (1001)
│   └── 안 읽은 알림 3       ├── # 트렌드 (Mindle)
├── 🟡 Gravity              ├── # MADLeague
│   └── 스캔 완료 1건        ├── # Badak
├── 🩷 SmarComm             └── # 일반
├── 🟢 WIO
├── 🟣 HeRo
└── 🔴 MADLeague
```

### 4-3. Action Card UI 상세

```
┌─────────────────────────────────────────┐
│  🟡 Gravity                    10:32 AM │
├─────────────────────────────────────────┤
│                                         │
│  브랜드 스캔 완료                         │
│  tenone.biz 점수: 72 → 78 (+6)         │
│                                         │
│  SEO: 85 (+3)  Performance: 72 (→)      │
│  Content: 65 (+8)  Social: 81 (+4)      │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ 상세 보기 │ │브리프 생성│ │  무시   │ │
│  │ (primary) │ │(secondary)│ │  (muted)│ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘

[버튼 클릭 후 → 상태 변경]

┌─────────────────────────────────────────┐
│  🟡 Gravity                    10:32 AM │
├─────────────────────────────────────────┤
│  브랜드 스캔 완료                         │
│  tenone.biz 점수: 72 → 78 (+6)         │
│                                         │
│  ✅ "브리프 생성" 선택됨 · 10:35 AM      │
│  → 1001에게 위임 중...                   │
└─────────────────────────────────────────┘
```

### 4-4. 에이전트 상태 표시

```
에이전트 아바타 옆 상태 도트:
  🟢 = 온라인 (클라우드: 항상, 로컬: 헬스체크 통과)
  🟡 = 처리 중 (현재 다른 요청 처리 중)
  🔴 = 오프라인 (로컬 AI: PC 꺼짐 또는 프로세스 중단)
  ⚪ = 비활성 (is_active=false)

로컬 에이전트 오프라인 시:
┌──────────────────────────────┐
│  🔴 Gemma (오프라인)          │
│  PC가 꺼져 있습니다.          │
│  1001이 대신 응답합니다.       │
│  [1001에게 보내기]             │
└──────────────────────────────┘
```

### 4-5. 멘션 & 위임 UI

채팅 입력창에서:
```
@를 입력하면 → 에이전트/서비스 자동완성 드롭다운

┌────────────────────────┐
│ @1001    열시일분       │
│ @gemma   Gemma (로컬)  │
│ @gravity Gravity       │
│ @mindle  Mindle        │
└────────────────────────┘

예: "이 결과 @1001 한테 넘겨서 브리프 만들어줘"
→ 시스템이 감지 → 1001에게 컨텍스트와 함께 전달
```

---

## PART 5: 구현 우선순위

### Phase 0: 기반 (1주)
> **목표: DB 준비 + API 엔드포인트**

| # | 항목 | 설명 |
|---|------|------|
| 0-1 | DB 마이그레이션 | chat_threads/chat_messages 컬럼 추가, messenger_service_hooks 테이블 |
| 0-2 | agent_profiles 확장 | runtime, local_endpoint, fallback_agent 컬럼 |
| 0-3 | API: /api/messenger/service-hook | 서비스 → 메신저 알림 수신 엔드포인트 |
| 0-4 | API: /api/messenger/action-callback | 사용자 액션 → 서비스 콜백 라우터 |
| 0-5 | TypeScript 타입 정의 | types/messenger.ts (ServiceHookPayload, ActionCard 등) |

### Phase 1: 에이전트 독대 (1주)
> **목표: 메신저 안에서 에이전트 1:1 대화**

| # | 항목 | 설명 |
|---|------|------|
| 1-1 | 에이전트 탭 UI | 사이드바에 에이전트 목록 (클라우드/로컬 구분) |
| 1-2 | agent_dm 스레드 생성 | 에이전트 클릭 → DM 스레드 자동 생성 |
| 1-3 | Agent Hub 통합 | 기존 /api/agent/hub를 메신저 chat_messages와 연결 |
| 1-4 | 응답 스트리밍 | Claude API 스트리밍 → 메신저 실시간 표시 |

### Phase 2: Service Hook (1주)
> **목표: Gravity, Mindle 등 서비스 알림 → 메신저**

| # | 항목 | 설명 |
|---|------|------|
| 2-1 | 서비스 탭 UI | 서비스 목록 + 미읽 알림 뱃지 |
| 2-2 | Action Card 렌더러 | message_format='action_card' 메시지 렌더링 |
| 2-3 | 액션 버튼 핸들러 | 클릭 → callback_url 호출 → 상태 업데이트 |
| 2-4 | Gravity 연동 | 첫 서비스 연동 (스캔 완료 → 브리프 승인) |
| 2-5 | 위임 체인 | 서비스 콜백 → 에이전트 위임 → 결과 반환 |

### Phase 3: Local Agent Bridge (1~2주)
> **목표: PC 내 OpenClaw/Gemma 연결**

| # | 항목 | 설명 |
|---|------|------|
| 3-1 | Bridge 데몬 개발 | Node.js, Supabase Realtime 구독 |
| 3-2 | OpenClaw 어댑터 | /v1/chat, /v1/workflow 연동 |
| 3-3 | Ollama 어댑터 | Gemma 4 /api/chat 연동 |
| 3-4 | 헬스체크 + 폴백 | 30초 주기, 오프라인 시 클라우드 위임 |
| 3-5 | 로컬 상태 UI | 온라인/오프라인 표시, 폴백 알림 |

### Phase 4: 고급 기능 (2주)
> **목표: 멘션, 위임 체인, 전체 서비스 연동**

| # | 항목 | 설명 |
|---|------|------|
| 4-1 | @멘션 시스템 | 에이전트/서비스 자동완성 + 위임 |
| 4-2 | correlation 추적 | 하나의 작업 흐름 전체 추적 UI |
| 4-3 | Mindle 연동 | 트렌드 → 브리프 → 발행 풀 체인 |
| 4-4 | SmarComm 연동 | 캠페인 결과 → A/B 선택 → 실행 |
| 4-5 | 알림 시스템 | 브라우저 Push + 뱃지 + 사운드 |
| 4-6 | Cross-runtime 위임 | Gemma 분석 → 1001 판단 → OpenClaw 실행 |

### 전체 타임라인

```
Phase 0 ──── Phase 1 ──── Phase 2 ──── Phase 3 ──── Phase 4
  DB/API      에이전트      서비스       로컬 AI      고급 기능
  1주          독대 1주     Hook 1주    Bridge 2주    확장 2주
                                                     
              ← 먼저 쓸 수 있음 →     ← PC 환경 필요 →
```

### 권장 시작점

**Phase 0 + 1을 먼저.** 이유:
- DB 확장은 모든 후속 작업의 기반
- 에이전트 독대는 기존 Agent Hub 코드를 재활용 → 빠름
- 서비스 Hook은 Gravity/Mindle이 좀 더 성숙한 후에
- Local Bridge는 OpenClaw 설치·설정 후에

---

## 부록: 기존 코드 재활용 맵

| 기존 코드 | 재활용 위치 |
|-----------|------------|
| `lib/supabase/chat.ts` | 그대로 확장 (postAgentMessage → 범용화) |
| `app/api/agent/hub/route.ts` | 에이전트 독대 DM에서 호출 |
| `app/intra/myverse/messenger/page.tsx` | 탭 추가 + Action Card 렌더러 |
| `messenger-sidebar.tsx` | 탭 4개로 확장 |
| `messenger-data.ts` | Action Card mock 데이터 추가 |
| `types/agent.ts` | AgentProfile에 runtime 필드 추가 |
| `lib/agent/claude.ts` | invokeAgent 그대로 사용 |

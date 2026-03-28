# Universe Operating System — 개발 계획서

> Date: 2026-03-28
> Project: C:\Projects\TenOne

---

## 전체 그림

tenone.biz 백엔드 = Universe Operating System

```
┌─────────────────────────────────────────────┐
│              tenone.biz                      │
├─────────────────────────────────────────────┤
│  프론트엔드 (143p 완성)                       │
│    - 퍼블릭 포털                              │
│    - 인트라 오피스 대시보드                     │
├─────────────────────────────────────────────┤
│  API Routes (Next.js)                        │
│    - /api/agent/hub                          │
│    - /api/agent/[name]                       │
│    - /api/[module]/*                         │
├─────────────────────────────────────────────┤
│  Claude API 연동                             │
│    - lib/agent/claude.ts                     │
│    - agent_profiles → System Prompt 조립      │
├─────────────────────────────────────────────┤
│  Supabase                                    │
│    - DB (PostgreSQL + RLS)                   │
│    - Auth (OAuth + Auth Hub)                 │
│    - Realtime                                │
└─────────────────────────────────────────────┘
```

### 핵심 원칙

1. **모든 API = 두 소비자:** 프론트엔드 UI + AI 에이전트. 둘 다 같은 API를 쓴다.
2. **agent_profiles = 심장:** System Prompt, 지식, 도구가 정의되고 Claude API 호출 시 조립된다.
3. **agent_messages = 추적:** 모든 에이전트 행위가 로그된다. 추적 가능성이 생명줄.
4. **모듈 = Tool:** WIO 모듈이 완성되면 자동으로 해당 에이전트의 Tool이 된다.
5. **기존 프론트 143p는 건드리지 않는다.** 백엔드 API를 만들고 연결만.

---

## Phase 0: 인프라 기초 (완료)

### 완료 항목
- [x] Supabase 프로젝트 연결
- [x] 인증 시스템 (Auth Hub, OAuth 연동)
- [x] API 기본 구조 설정
- [x] 환경 변수 설정 (.env.local)

---

## Phase 1: 에이전트 코어

> 목표: AI 에이전트 시스템의 기반을 만든다.

### 1-1. agent_profiles 테이블

```sql
-- 에이전트 정체성 + 능력 정의
CREATE TABLE agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- 'compass', 'badaksoe', 'madleague'
  display_name TEXT NOT NULL,          -- '나침반', '바닥쇠', 'MAD 매니저'
  brand_id UUID REFERENCES brands(id), -- 소속 브랜드
  system_prompt TEXT NOT NULL,         -- Claude System Prompt
  knowledge JSONB DEFAULT '[]',        -- 참조 문서/데이터
  tools JSONB DEFAULT '[]',            -- 사용 가능한 WIO 모듈/API
  model TEXT DEFAULT 'claude-sonnet-4-20250514', -- Claude 모델
  temperature FLOAT DEFAULT 0.7,
  max_tokens INT DEFAULT 4096,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1-2. agent_messages 테이블

```sql
-- 모든 에이전트 대화/행위 로그
CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL REFERENCES agent_profiles(name),
  session_id UUID NOT NULL,            -- 대화 세션
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,                   -- 'user', 'assistant', 'system', 'tool'
  content TEXT NOT NULL,
  tool_calls JSONB,                    -- 에이전트가 호출한 도구
  tool_results JSONB,                  -- 도구 실행 결과
  metadata JSONB DEFAULT '{}',         -- 추가 컨텍스트
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1-3. Agent Hub API

```
POST /api/agent/hub
  - 요청: { agent: "compass", message: "...", session_id?: "..." }
  - 처리:
    1. agent_profiles에서 해당 에이전트 로드
    2. system_prompt + knowledge + tools 조립
    3. Claude API 호출
    4. agent_messages에 로그
    5. 응답 반환
```

### 1-4. Claude API 연동 모듈

```
lib/agent/
  claude.ts          -- Claude API 래퍼 (메시지 전송, 스트리밍)
  prompt-builder.ts  -- agent_profiles → System Prompt 조립
  tool-executor.ts   -- 에이전트 Tool Call → WIO API 실행
  types.ts           -- 에이전트 관련 타입 정의
```

### 1-5. 초기 에이전트 3종

| 에이전트 | 브랜드 | 역할 |
|---------|--------|------|
| **compass** | TenOne | Universe 안내자. 사용자 질문에 브랜드/서비스 안내 |
| **madleague** | MAD League | 동아리 연합 관리. 멤버 관리, 프로젝트 매칭 |
| **badaksoe** | Badak | 네트워킹 에이전트. 바닥쇠방 운영 |

---

## Phase 2: 바닥쇠 실전

> 목표: 첫 번째 독립 에이전트를 실전 투입한다.

### 2-1. badaksoe_rooms 테이블

```sql
CREATE TABLE badaksoe_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                  -- 방 이름
  description TEXT,
  host_id UUID REFERENCES auth.users(id),
  agent_name TEXT DEFAULT 'badaksoe',
  status TEXT DEFAULT 'active',        -- active, archived
  participants JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2-2. /api/agent/badaksoe 엔드포인트

```
POST /api/agent/badaksoe
  - 바닥쇠 전용 엔드포인트
  - room_id 기반 컨텍스트 로딩
  - 참가자 정보 자동 주입
  - 네트워킹 매칭 로직
```

### 2-3. 메신저봇R 연동

- 카카오톡/텔레그램 봇 → /api/agent/badaksoe 웹훅
- 외부 메신저에서 바닥쇠와 대화 가능

---

## Phase 3: 모듈 개발 순서

> WIO 모듈을 하나씩 완성하고 프론트엔드와 연결한다.
> 완성된 모듈은 자동으로 에이전트의 Tool이 된다.

### 개발 순서 (우선순위)

| 순번 | 모듈 | 관련 프론트 페이지 | 에이전트 Tool 연결 |
|------|------|-------------------|-------------------|
| 1 | **Home** | 퍼블릭 홈, 인트라 대시보드 | compass |
| 2 | **Talk** | 인트라 메시징 | 전체 에이전트 |
| 3 | **People** | ERP > CRM > People | compass, madleague |
| 4 | **Project** | 스튜디오 > 프로젝트 | madleague |
| 5 | **Competition** | 마케팅 > 캠페인 | compass |
| 6 | **GPR** | ERP > HR > GPR | compass |
| 7 | **Learn** | 위키, 교육 | compass |
| 8 | **Timesheet + Finance** | ERP > 재무 | compass |
| 9 | **Insight** | 마케팅 > 분석 | compass |
| 10 | **Sales** | 마케팅 > 딜 | badaksoe |
| 11 | **Wiki** | 인트라 위키 | compass |

### 모듈 개발 표준 절차

각 모듈마다:
1. Supabase 테이블 생성 (brand_id + RLS)
2. API Route 구현 (/api/[module]/*)
3. 프론트엔드 연결 (Mock 데이터 → 실제 API)
4. agent_profiles의 tools에 등록
5. 에이전트 테스트

---

## Phase 4: 에이전트 확장

### 4-1. 안전 장치

| 장치 | 역할 |
|------|------|
| **Auditor** | 에이전트 행위 감사. 이상 패턴 탐지 |
| **URAL** | Universe Rule & Access Layer. 권한 관리 |
| **Escalation** | 에이전트가 판단 불가 시 인간에게 에스컬레이션 |
| **Kill Switch** | 긴급 정지. 특정 에이전트 즉시 비활성화 |

### 4-2. 브랜드 에이전트 추가

Phase 1~3 완료 후 브랜드별 에이전트 추가:

| 에이전트 | 브랜드 | 역할 |
|---------|--------|------|
| **mindle** | Mindle | 크롤링 + 트렌드 콘텐츠 생산 |
| **hero** | HeRo | 인재 매칭 |
| **smarcomm** | SmarComm | 마케팅 커뮤니케이션 |
| **evolution** | Evolution School | 교육 관리 |
| **youinone** | YouInOne | 크루 시수/정산 |

### 4-3. Vrief MD — 에이전트 간 통신

```
에이전트 A → Vrief MD (메시지 버스) → 에이전트 B
  - 구조화된 메시지 포맷
  - 우선순위 큐
  - 에이전트 간 협업 프로토콜
```

예시 시나리오:
- badaksoe가 인재 발견 → hero에게 전달 → hero가 매칭 처리
- madleague가 프로젝트 생성 → compass가 브랜드 배정 → 해당 브랜드 에이전트가 실행

---

## 기술 스택 요약

| 계층 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 + React 19 + Tailwind CSS v4 |
| API | Next.js API Routes |
| AI | Claude API (Anthropic) |
| DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (OAuth) |
| Realtime | Supabase Realtime |
| 배포 | Google Cloud Run |

---

## 체크리스트

### Phase 1 체크리스트
- [ ] agent_profiles 테이블 생성
- [ ] agent_messages 테이블 생성
- [ ] /api/agent/hub 엔드포인트 구현
- [ ] lib/agent/claude.ts 구현
- [ ] lib/agent/prompt-builder.ts 구현
- [ ] lib/agent/tool-executor.ts 구현
- [ ] compass 에이전트 프로필 등록
- [ ] madleague 에이전트 프로필 등록
- [ ] badaksoe 에이전트 프로필 등록
- [ ] Agent Hub UI (인트라 대시보드)

### Phase 2 체크리스트
- [ ] badaksoe_rooms 테이블 생성
- [ ] /api/agent/badaksoe 엔드포인트 구현
- [ ] 바닥쇠방 UI 연결
- [ ] 메신저봇R 웹훅 연동
- [ ] 실전 테스트

### Phase 3 체크리스트
- [ ] Home 모듈 API + 프론트 연결
- [ ] Talk 모듈 API + 프론트 연결
- [ ] People 모듈 API + 프론트 연결
- [ ] Project 모듈 API + 프론트 연결
- [ ] Competition 모듈 API + 프론트 연결
- [ ] GPR 모듈 API + 프론트 연결
- [ ] Learn 모듈 API + 프론트 연결
- [ ] Timesheet + Finance 모듈 API + 프론트 연결
- [ ] Insight 모듈 API + 프론트 연결
- [ ] Sales 모듈 API + 프론트 연결
- [ ] Wiki 모듈 API + 프론트 연결

### Phase 4 체크리스트
- [ ] Auditor 시스템 구현
- [ ] URAL 권한 레이어 구현
- [ ] Escalation 프로토콜 구현
- [ ] Kill Switch 구현
- [ ] 브랜드 에이전트 추가 (mindle, hero, smarcomm, evolution, youinone)
- [ ] Vrief MD 에이전트 간 통신 프로토콜 구현

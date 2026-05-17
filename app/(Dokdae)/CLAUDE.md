# Dokdae 브랜드 가이드

> **독대** — AI Agent 메시징 채널. "열시일분과 대화하기"

---

## 정체성

- **한 줄 소개**: AI Agent(열시일분 등)와 메시지를 주고받는 채널
- **톤앤매너**: 친근함·빠른 응답·실용. AI 대화 중심.
- **주 컬색**: 파란색 (#60A5FA)
- **디자인 방향**: 대화 인터페이스 + Agent 목록 + 대화 이력

---

## 접근 모델

- **유형**: 내부 기록용 (외부 노출 제한)
- **가입 경로**: 직원/권한자만 접근
- **멤버 권한**: member, admin

---

## 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: agent_permissions, conversation_count

---

## 권한 체계

- **role 종류**: member, admin
- **context**: `brand:dokdae`

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음
- **brand_id 지정**: `brand_id = 'dokdae'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Dokdae)/layout.tsx` | generateMetadata |
| `app/(Dokdae)/dokdae/page.tsx` | 메인 (Agent 목록) |
| `app/(Dokdae)/dokdae/agent/[id]/page.tsx` | Agent 대화 화면 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta — Universe 단체방 MVP 가동 (2026-05-17) |
| **이월 작업** | (1) staff 권한 사용자 실 LLM 호출 E2E 검증, (2) 단체방 메시지 ↔ chat_threads/chat_messages 마이그레이션, (3) 라우터 결정 이력 분석 패널 |

## 운영 모드 (2개)

| 모드 | 설명 | 호출 흐름 | API body |
|---|---|---|---|
| `agent` (기본) | 특정 에이전트 1명과 1:1 독대 | 텐원 → invokeAgent(agentName) → 응답 1개 | `{message, mode:'agent', agentName}` |
| `group` | **Universe 단체방** — 텐원 AI 팀 28명이 참여하는 단체 채널 | 텐원 → 1001 Haiku 라우터 (1~3명 결정) → 병렬 invokeAgent → 응답 N개 | `{message, mode:'group'}` |

### @멘션 (group 모드 전용)

입력에 `@{agent_name}` 패턴이 있으면 라우터를 우회하고 멘션된 에이전트만 응답한다.
- 매칭: `agent_profiles.name` 일치 또는 `display_name` 부분 일치 (대소문자 무시)
- 1001은 항상 라우터 역할 → 멘션해도 응답자에서 제외
- 매칭 실패 시: 일반 Haiku 라우터로 폴백
- API body: `{message:"@mindle 트렌드", mode:"group", mention:"mindle"}`

### 채팅 UX (2026-05-17 고도화 2차)

| 기능 | 구현 |
|---|---|
| 히스토리 로드 | `selectedAgent.name` 변경 시 재실행. 단체방은 `to_agent='group'` 필터, 1:1은 `from/to user↔agent` 필터 |
| 에이전트 아바타 | `AgentAvatar` 컴포넌트 — layer 컬러(L0 노랑·L1 에메랄드·L2 인디고·L3 퍼플) + 이니셜(한글 1자/영문 대문자 1~2자) |
| 라우터 메시지 | 슬림 박스 (중앙 정렬) — `1001 · 이유 → mindle, smarcomm` |
| @멘션 강조 | 본문에서 `@\w+` 패턴을 노랑 배경 강조 |
| 타이핑 인디케이터 | 단체방 모드 — "🌌 Universe 단체방 — 1001이 라우팅 후 응답 작성 중" |
| 입력 placeholder | 단체방일 때 "@mindle" 힌트 |
| **참여자 시트** | 헤더 "👥 N" 버튼 → 오른쪽 슬라이드 시트. 28명 layer 4그룹(L0~L3) 그리드. 각 항목 "@멘션" / "1:1" 2버튼. 상단에 라우터 Top 5 칩 |
| **@멘션 자동완성** | 입력 끝에 `@\w*` 패턴이면 매칭 에이전트 6명 dropdown (입력바 위 가로 스크롤). 1001은 후보 제외 |
| **메시지 검색** | 헤더 돋보기 아이콘 → 검색 입력. messages를 `text.toLowerCase().includes(q)`로 필터. 결과 없으면 "&ldquo;...&rdquo; 해당 메시지 없음" 안내 |
| **연속 발화 아바타 생략** | 같은 에이전트가 연속으로 말하면 아바타 생략 (카카오톡 패턴) |
| **API 401 친절화** | [lib/agent/claude.ts](../../lib/agent/claude.ts) — Anthropic 401일 때 raw JSON 대신 "키 만료 + 갱신 절차 4단계" 안내 박스. 429/529도 명확 메시지 |

### 단체방 메시지 패턴 (agent_messages 테이블)

- `from_agent='user', to_agent='group', message_type='dokdae_chat', payload.mode='group'` — 텐원 입력
- `from_agent='1001', to_agent='group', message_type='dokdae_routing', payload.agents=[...]` — 라우터 결정 이력
- `from_agent='{agent}', to_agent='group', message_type='dokdae_chat', payload.agentName, payload.layer` — 각 에이전트 응답

### 핵심 파일 (갱신)

| 파일 | 역할 |
|------|------|
| `app/(Dokdae)/dokdae/page.tsx` | LoginScreen + ChatScreen + SideMenu. `_group` 특수 selectedAgent로 단체방 진입 |
| `app/api/agent/dokdae/route.ts` | mode 분기. `decideRoutingHaiku()` + 병렬 `invokeAgent()` |
| `lib/agent/claude.ts` | `invokeAgent` · `listAgentProfiles` 재사용 |

### 비용 (참고)

- 1:1 (mode=agent): Sonnet 1회 ≈ $0.01~0.05
- 단체방 (mode=group): Haiku 라우팅 ≈ $0.001 + Sonnet 1~3회 ≈ $0.01~$0.15
- 텐원 일일 5~10 메시지 가정 시 단체방 ≈ $0.30~$0.60/일

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UOS (Universe Operating System): [docs/Universe_OS_Plan.md](../../docs/Universe_OS_Plan.md)

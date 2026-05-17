# TenOne Universe — 개발 로드맵

> 마지막 업데이트: 2026-05-13 (세션 134 — 캡쳐 Phase 2 5건 + 모바일 하단 네비 + 녹음·퀵메뉴)

---

## 🎨 PP Canvas Engine (세션 105 시작 — 6단계 ~10주)

> HandNote(필기·SVG)와 CanvasStudio(자유 캔버스·Excalidraw)를 통합하는 자체 엔진. 외부 라이선스 의존 점진 제거.

- [x] **Phase 1 — Core 골격** (세션 105): types · engine · history · render(Canvas 2D 라이브) · strokes(perfect-freehand 6펜) · background · palm-rejection · pan-zoom · serialize · adapters(handnote + handnote-storage)
- [ ] **Phase 1.9 — HandNote 본체 재작성** (다음 세션 메인): CanvasEngine 기반 전면 교체. 어댑터 이미 준비됨
- [ ] **Phase 2 — Shapes**: rect/ellipse/diamond/arrow/line 도형 layer
- [ ] **Phase 3 — Selection**: 단일/멀티 선택 + 변형 핸들 + 회전
- [ ] **Phase 4 — Text**: 텍스트 엘리먼트 + 인라인 편집
- [ ] **Phase 5 — Polish**: 키보드 단축키 · 컨텍스트 메뉴 · 그리드 스냅 · 가이드
- [ ] **Phase 6 — Migration**: Excalidraw 제거 + 기존 데이터 마이그레이션

상세: `docs/PP_Canvas_Engine_Plan.md`

---

## 🗓 Planner's Planner AI (세션 84 완결)

- [x] **W1 — 앱 쉘**: DB 스키마 · 인증 게이트 · 온보딩 4단계 · 모드 선택(Weekly/AllInOne) · 사이드바
- [x] **W2 — 메인 뷰**: Today · Weekly (Light Vrief + GPR) · Monthly · Yearly · Identity · Projects + AI 브리핑 인프라
- [x] **W3 — 확장**: Project Notes CRUD · Templates 20종 시드 · 자동 집계 함수 (weekly/monthly/yearly)
- [x] **W4 — AI + UX**: Copy-to-AI (Claude/ChatGPT/Gemini) · 풀텍스트 검색 · Vercel Cron (매시간 브리핑)
- [x] **P0 — 결제·보안**: Toss Payments 19,000원/년 · PDF 구매자 무료 활성화 · 구독 게이트 · Supabase 보안 감사 완료
- [x] **P1 — MVP 완성도**: PWA · Web Push · 이메일 백업 · 공휴일/절기 · Daily 자동 이월 · 마케팅 "Now Live"
- [x] **P2 — 콘텐츠·연동**: Templates 59종 · Cover 15종 · Anniversary 2p · Google Calendar OAuth · Todoist
- [ ] **P3 — 고급 기능**: 필기입력(Fabric.js) · FrameWork 위젯 · 기업 플랜 · AI 고급 설정 · Copy-to-AI 편집
- [ ] **P4 — 운영·분석**: GTM 트래킹 · 사용자 매뉴얼 · 베타 피드백 · Intra 확장
- [ ] **P5 — 추가 연동**: Notion · Slack · Apple/Outlook (CalDAV)
- [ ] **배포 대기**: PWA 아이콘 2개 · Toss 가맹점 승인 · 환경변수 Vercel 설정 · Google OAuth 자격 · domain planners.tenone.biz 연결

---

## 📧 이메일/CRM 인프라 (세션 65 완결)

- [x] **Phase 1 — 발송 기반**: `email_sends`/`email_events`/`email_senders`, Resend Webhook, 바운스 자동 비활성
- [x] **Phase 2 — 뉴스레터 발송**: 테스트·예약 발송, Vercel Cron, 분석 페이지
- [x] **Phase 3 — CRM People**: lifecycle_stage, touchpoints, 자동 흡수 트리거, 상세 타임라인
- [x] **Phase 4 — 세그먼트**: 규칙 엔진(14필드·10연산자), 빌더 UI + 실시간 미리보기
- [x] **Phase 5 — 브로드캐스트**: `crm_campaigns`, 변수 치환, 3-Step 발송 마법사
- [x] **Phase 6 — 운영**: 통합 수신거부, 발송 한도 대시보드, 발신자 관리
- [x] 인트라 네비에 신규 경로 4개 링크 추가 (`segments`/`broadcast`/`email/usage`/`email/senders`)
- [ ] Resend Pro 업그레이드 (본격 사업 시작 시)

---
> 기준 문서: TenOne_Universe_Architecture_v1.md / TenOne_4Products.md
> **핵심 원칙: 4대 제품(Mindle·SmarComm·WIO·AI Agent)을 Intra에서 통제·운영·관리**

---

## 현재 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| 퍼블릭 사이트 (26개 브랜드) | ⚠️ 프론트만 | Google Sites 잔재 /about·/universe·/history |
| Intra 143페이지 | ✅ UI + DB 대부분 | 4대 제품 통제 레이어 미연결 |
| WIO Orbi (141p) | ✅ UI + 일부 DB | 외부 테넌트 미연동 |
| SmarComm (46p) | ⚠️ 숨김 | Coming Soon 상태, 인트라 연결 필요 |
| site_configs (L1) | ⚠️ 테이블 생성됨 | Intra handleSave + layout.tsx 연동 필요 |
| 구독 인프라 (L4) | ❌ 없음 | wio_subscription_plans/subscriptions 미생성 |
| Agent Hub | ⚠️ 코드 완성 | Prod DB 실행 필요 |
| Mindle 크롤러 (Whole See) | ❌ 미가동 | 6월 목표 |
| 결제 PG | ❌ 없음 | Phase 2 |

---

## 아키텍처 원칙 (개발 시 반드시 준수)

### 4대 제품 구조
```
Mindle(연료) ──트렌드 데이터──→ SmarComm(마케팅 자동화)
                                       ↑
WIO(공장) ──────── MKT-* 인프라 ────────┘
    │
    └── COM-AI = Agent Hub
                    │
            AI Agent(운영 엔진) → 3개 제품 자동 운영
```

### 모순 방지 8원칙 (위반 금지)
| # | 규칙 |
|---|------|
| 1 | 구독 테이블은 `wio_subscription_plans` 하나만 쓴다 |
| 2 | Intra 전용 운영 테이블을 새로 만들지 않는다 (WIO 테이블 사용) |
| 3 | 브랜드 사이트는 Supabase만 바라본다 (Intra API 직접 호출 금지) |
| 4 | SmarComm WS = WIO MKT-* 위의 어플리케이션 (이중 구현 금지) |
| 5 | 에이전트는 사람과 같은 API를 쓴다 |
| 6 | 모든 테이블에 brand_id 또는 tenant_id가 있다 |
| 7 | site_configs의 site_id와 각 브랜드 layout의 식별자가 일치해야 한다 |
| 8 | 맞춤 서비스 개발 기술은 WIO 코어에 환류한다 (Tech Flywheel) |

### WIO 서비스 2-Tier 모델 (2026-04-03 확정)
```
WIO / SmarComm
├── 규격 서비스 (Subscription) — 등급별 기능 제한, 동일 코드, 셀프서비스
└── 맞춤 서비스 (Custom Installation) — 클라이언트 최적화 용역, 직접 설치
    └── TenOne.biz (첫 번째 고객=자사), XXXX, VVVV, AAAA...
```
**Tech Flywheel**: 맞춤 개발 → 기술 진보 → WIO 코어 흡수 → 규격 서비스 업그레이드 → 반복

---

## 🚨 즉시 (이번 주 — 리스크 제거)

### ① HeRo Mock 데이터 제거 [법적 리스크] ✅ 완료
- [x] HeRo 파트너 기업 로고 (카카오·네이버·쿠팡·토스 등) 제거
- [x] Mock 수치 (매칭 100+건, 파트너 50+개) 제거
- [x] `/hero` 파트너 섹션 → "파트너 모집 중" UI로 교체

### ② Prod SQL 6개 실행 [기능 미작동] ✅ 완료
- [x] `sql/erp-finance-tables.sql` (invoices, payments, card_usage, incentives)
- [x] `sql/monthly-forecasts-table.sql`
- [x] `sql/standard-rates-table.sql`
- [x] `sql/agent-tables.sql` (agent_profiles, agent_messages)
- [x] `sql/workflow-tables.sql`
- [x] `sql/badaksoe-rooms-table.sql`

### ③ site_configs 완전 연동 [L1 설정 레이어] ✅ 완료
- [x] `/intra/bums/sites` handleSave → DB upsert (이전 세션 완료)
- [x] 22개 브랜드 `layout.tsx` → `generateMetadata()` + `getSiteConfigServer(siteId)`
- [x] 26개 사이트 시드 데이터 확인 (이전 세션 생성)

### ④ Google Sites 잔재 제거 [신뢰·SEO] ✅ 완료
- [x] `/about`, `/universe`, `/history` — 이미 Next.js 내부 페이지, Google Sites 링크 없음 확인

---

## Phase 0: 테넌트 격리 기반 구축 (4월 1~2주)

> **목표: 외부 고객이 들어와도 데이터가 섞이지 않는 격리 구조 확보**
> **원칙: 지금 동작하는 코드는 건드리지 않는다. 격리 구조만 씌운다.**

### 0-A. tenant_id 일괄 추가 ✅ 완료 (세션 73 확인)
- [x] 위반 테이블 목록 확정 — DB 조회 결과 누락 테이블 2개 (`capabilities`, `wio_tenants`) 모두 tenant 불필요 (전역 레지스트리 / 테넌트 테이블 자체)
- [x] 기존 Phase 0-C/D 작업으로 이미 대부분 정비 완료 — 63개 추정치는 과대 산정이었음
- [x] `capabilities` / `wio_tenants` — 구조상 tenant_id 불필요 (intentional)

### 0-B. 고객 아이덴티티 계층 확정 ✅ 완료 (세션 73 확인)
- [x] TIER 1: `auth.users` → `members` (auth_id FK, 메인 프로필 테이블)
- [x] TIER 2: `member_brand_joins` (Universe SSO — 다중 브랜드 가입, tenant_id 포함) ✅ 존재
- [x] TIER 3: `wio_members` (WIO 서비스 멤버 — tenant_id 기반) ✅ 존재
- [x] TIER 4: 각 테이블 tenant_id/brand_id 격리 — Phase 0-A에서 확인 완료
- [x] 아이덴티티 흐름 문서화 (`docs/Identity_Architecture.md`) ✅ 존재 (3계층 다중 페르소나 설계)

### 0-C. 중복 테이블 정리 ✅ 완료 (세션 71)
- [x] `expenses` → `wio_expenses` 코드 참조 전환 (erp.ts)
- [x] `approvals` → `wio_approvals` 코드 참조 전환 (erp.ts, myverse.ts, 인증서 페이지, API 3개)
- [x] `timesheets` → `wio_timesheets` 코드 참조 전환 (projects.ts, myverse.ts, timesheets API)
- [x] `chat_threads/messages` → `wio_chat_threads/wio_chat_messages` 전환 (chat.ts, messenger API 2개, briefing, local-agent-bridge)
- 구 테이블 삭제는 Phase 1 이후

### 0-D. WIO 서비스 인프라 ✅ 완료 (세션 72)
- [x] `wio_tenant_configs` 테이블 생성 (맞춤 서비스 설정 저장) — 8 rows, RLS on
- [x] `wio_subscription_plans`에 service_type 컬럼 추가 ('standard' | 'custom') — 11 rows
- [x] `wio_feature_flags` 테이블 생성 (규격 서비스 등급별 기능 제한) — 76 rows, RLS on
- [x] `lib/supabase/erp.ts`에 tenant_id 필터 옵션 추가 (기본값 'tenone', 코드 호환)

---

## Phase 1: 4대 제품 Intra 통제 레이어 (4월 3~4주)

> **목표: Intra 하나에서 Mindle·SmarComm·WIO·AI Agent를 통제할 수 있는 상태**

### 1-A. Mindle 관리 (연료 공급 시스템) ✅ 완료 (세션 73 확인)
- [x] 뉴스레터 구독 DB 연동 — `newsletter_subscribers` (source='mindle' 필터), UMS 대시보드 DB 연결 완료
- [x] `/intra/ums/newsletter` CRUD 완성 (구독자/이슈 관리 통합)
- [x] 트렌드 카드 관리: `mindle_trends` 테이블 + Pipeline UI (수집→검토→승인→발행 4단계)
- [x] `/mindle/trends` 퍼블릭 페이지 → mindle_trends DB 연결 완료
- [x] Whole See 크롤러 설정: `/intra/ums/external/sources` RSS/웹/뉴스레터 3탭 관리 UI

### 1-B. SmarComm 활성화 ✅ 완료 (세션 이전)
- [x] Coming Soon 해제 → 접근 가능
- [x] `/intra/marketing` ↔ SmarComm WS 데이터 연결

### 1-C. WIO 테넌트 관리 ✅ 완료 (세션 69)
- [x] `/intra/ums/wio/tenants` 실구현 (wio_tenants + wio_members 집계)
- [x] WIO Demo/SaaS/Master 모드 확인
- [ ] WIO SaaS 모드: 테넌트 생성 → OrbiConfig 저장 플로우 완성 (잔여)

### 1-D. Agent Hub 활성화 (운영 엔진) ✅ 완료
- [x] `sql/agent-tables.sql` 실행 후 `/intra/agent` 테스트
- [x] 열시일분(compass) 에이전트 프로필 등록 확인
- [x] 바당쇠 에이전트: `/api/agent/badaksoe` 엔드포인트 구현
- [x] 10:01 프로토콜 기초: AM/PM 에이전트 Vrief 제출 → Intra Dashboard 위젯

---

## Phase 2: 구독 인프라 + 수익화 (5월)

> **목표: 결제가 실제로 이루어지는 상태 (MRR 시작)**

### 2-A. 구독 테이블 구축
- [x] `wio_subscription_plans` 테이블 생성 + RLS (Prod 적용 완료)
- [x] `wio_subscriptions` 테이블 생성 + RLS (Prod 적용 완료)
- [x] 시드 (WIO 5 / SmarComm 4 / Mindle 2 / Badak·HeRo·EvSchool·YouInOne free 1씩)
- [x] `/intra/ums/commerce/subscriptions` 관리 UI ↔ wio_subscriptions 연결 (Mock fallback 제거, 빈 상태 안내)
- [ ] Badak·HeRo·EvSchool·YouInOne **유료 티어** 가격·기능 정책 결정 → 시드 보강
- [ ] 무결성 위반 백필: youinone/premium·evschool/course 구독의 plan_id NULL → 유료 티어 시드 후 UPDATE

### 2-B. 결제 PG 연동
- [ ] 토스페이먼츠 또는 포트원 선택·설정
- [ ] Mindle 구독 결제 흐름 구현 (`/mindle/pricing` → 결제 → wio_subscriptions)
- [ ] 구독 체크 미들웨어 (`hasAccess()` 함수 → 유료 콘텐츠 보호)

### 2-C. 브랜드 연동
- [ ] Badak 사이트 실DB 연동 + 프리미엄 멤버십 티어
- [ ] MADLeague 사이트 실DB 연동
- [ ] Myverse 웹 → DB 완전 전환

---

## Phase 3: 에이전트 자동화 가동 (6월)

> **목표: 에이전트가 Universe를 자동 운영하는 첫 사이클**

### 3-A. Whole See 크롤러 가동
- [ ] GCP Scheduler → RSS 크롤 → `mindle_sources` 저장
- [ ] Claude Haiku 노이즈 제거 → Sonnet 트렌드 카드 생성 → `mindle_trends`
- [ ] 트렌드 카드 100개 축적 목표

### 3-B. 바당쇠 실전 투입
- [ ] Badak 14개 방 리스닝 모드 (수집만, 응답은 수동)
- [ ] 시그널 → `mindle_trends` 연결 (바당쇠 → Mindle 데이터 공급)

### 3-C. 10:01 자동 브리핑
- [ ] AM 10:01: 각 에이전트 Vrief 제출 → 열시일분 취합 → 텐원에게 방향
- [ ] PM 10:01: GPR Result → 열시일분 취합 → 텐원에게 성과
- [ ] GCP Scheduler → 자동 실행 → 카카오톡 전송 (Phase 3 완성)

---

## Phase 4: 콘텐츠 확장 + 대중화 (하반기)

### 7월
- [ ] Mindle 뉴스레터 1호 발송
- [ ] Planner's 아티클 시작
- [ ] Badak 사이트 공개
- [ ] Badak Stars v1: 북마크·연결·니즈 관심 수 집계 → 상위 멤버 자동 노출 (데이터 최소 3개월 누적 후)

### 8월
- [ ] MADLeague 사이트 공개
- [ ] HeRo 사이트 공개 (실 데이터 기반)

### 9월~12월
- [ ] GPR·Finance 실DB 완성
- [ ] Rule Engine 구현
- [ ] MADLeap 5기 WIO 내부 테스트
- [ ] tenone.biz 포탈 공개
- [ ] WIO 80%+ 실DB
- [ ] Myverse Sprint 1~2 (React Native)
- [ ] 뉴스레터 500명+
- [ ] Badak 탐색 시스템 v1: 관심 이력·북마크·경력·니즈·원츠 종합 → 서로를 발견하는 추천 피드 (explore 페이지 People/Needs/Wants 탭 고도화)

---

## Phase 5: 2027 실전

### 1~3월
- [ ] MADLeague 신기수 WIO 적용 (30~50명)
- [ ] Badak 500명+ CRM 적용
- [ ] Vrief 워크숍 1건 (Phase 1 첫 외부 수익)

### 4~6월
- [ ] 7거점 확대
- [ ] HeRo 매칭 파일럿
- [ ] Evolution School 1기

---

## 에이전트 가동 일정

| 에이전트 | 브랜드 | 가동 목표 |
|---------|--------|----------|
| 열시일분 | Ten:One | 2026.04 (Agent Hub 활성화) |
| 바당쇠 | Badak | 2026.06 |
| Whole See | Mindle | 2026.06 |
| 매드레드 | MADLeague | 2026.08 |
| 스마커 | SmarComm | 2027.Q2 |
| 히어로 | HeRo | 2027.Q2 |

---

## Badak Stars + 탐색 시스템 (장기 고도화)

> **왜 지금 안 하나:** Stars는 "가장 많은 관심을 받은 사람" 자동 랭킹이다. 북마크 수·수락된 연결 수·니즈 관심 수를 집계해야 의미 있는 랭킹이 나온다. 데이터 없이 시스템을 먼저 만들면 빈 페이지가 된다. Badak이 공개되고 사용자가 쌓인 후 설계해야 한다.

### Stars — 집계 소스 (확정)
| 소스 | 테이블 | 가중치 |
|------|--------|--------|
| 프로필 북마크 수 | `badak_bookmarks` (item_type='member') | 높음 |
| 수락된 연결 신청 수 | `badak_connections` (accepted) | 높음 |
| 내 니즈의 관심 수 합산 | `badak_needs.count` | 중간 |
| 게시물 좋아요·댓글 | (미구현, 나중에 추가) | 낮음 |

### 탐색 시스템 — 방향
- 현재 explore 페이지의 People/Needs/Wants 탭이 MVP 쉘
- 관심 이력·북마크·경력·소개·니즈·원츠를 종합해 "서로를 발견"하는 시스템으로 고도화
- Stars 피처링 = 탐색 시스템 고도화의 가시적 출력물

### 개발 조건
- Badak 공개 후 최소 3개월 데이터 누적 시점에 설계 시작
- Stars 관리 인트라 페이지는 탐색 시스템 설계와 함께 구현 (별도 선행 불필요)

---

## 수익 마일스톤

| 시점 | 목표 | 핵심 조건 |
|------|------|----------|
| 2026.05 | Mindle MRR 시작 | 구독 결제 + 뉴스레터 1호 |
| 2026.06 | 에이전트 ROI 12.5배 실현 | Whole See 가동 + Naming Factory |
| 2026.07 | SmarComm 대행 1건 | Intra 통제 + Mindle 데이터 |
| 2027.03 | Vrief 워크숍 수익 | Phase 1 첫 외부 판매 |
| 2027.Q2 | WIO SaaS 외부 구독 | 도그푸딩 완성 후 |

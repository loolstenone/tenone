# TenOne Universe — 개발 로드맵

> 마지막 업데이트: 2026-04-02
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

### 모순 방지 7원칙 (위반 금지)
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

### 0-A. tenant_id 일괄 추가 [8원칙 #6 위반 63개 테이블 정비]
- [ ] 위반 테이블 목록 확정 (expenses, approvals, members, timesheets, attendance, posts 등 63개)
- [ ] `sql/phase0-tenant-id.sql` 작성 — `ALTER TABLE ADD COLUMN tenant_id TEXT DEFAULT 'tenone'`
- [ ] 기존 행 업데이트 — `UPDATE SET tenant_id = 'tenone' WHERE tenant_id IS NULL`
- [ ] RLS 정책 추가 — tenant_isolation 정책 (기존 정책 유지)
- [ ] Prod DB 실행 + 검증

### 0-B. 고객 아이덴티티 계층 확정
- [ ] TIER 1: `auth.users` → `profiles` (인증 + 기본 프로필)
- [ ] TIER 2: `member_brand_joins` (Universe SSO — 다중 브랜드 가입)
- [ ] TIER 3: `wio_members` (WIO 서비스 멤버 — tenant_id 기반)
- [ ] TIER 4: 각 테이블 tenant_id 격리 (데이터 분리)
- [ ] 아이덴티티 흐름 문서화 (`docs/Identity_Architecture.md`)

### 0-C. 중복 테이블 정리
- [ ] `expenses` → `wio_expenses` 데이터 마이그레이션 + erp.ts 쿼리 대상 변경
- [ ] `approvals` → `wio_approvals` 마이그레이션
- [ ] `timesheets` → `wio_timesheets` 마이그레이션
- [ ] `chat_threads/messages` → `wio_chat_threads/messages` 통합
- [ ] 마이그레이션 완료 후 구 테이블 deprecated 표시 (삭제는 Phase 1 이후)

### 0-D. WIO 서비스 인프라
- [ ] `wio_tenant_configs` 테이블 생성 (맞춤 서비스 설정 저장)
- [ ] `wio_subscription_plans`에 service_type 컬럼 추가 ('standard' | 'custom')
- [ ] `wio_feature_flags` 테이블 생성 (규격 서비스 등급별 기능 제한)
- [ ] `lib/supabase/erp.ts`에 tenant_id 필터 옵션 추가 (기본값 'tenone', 코드 호환)

---

## Phase 1: 4대 제품 Intra 통제 레이어 (4월 3~4주)

> **목표: Intra 하나에서 Mindle·SmarComm·WIO·AI Agent를 통제할 수 있는 상태**

### 1-A. Mindle 관리 (연료 공급 시스템)
- [ ] 뉴스레터 구독 DB 연동 확인 (`mindle_subscribers` 테이블 → 홈 폼 연결)
- [ ] `/intra/bums/newsletter` → mindle_subscribers CRUD 완성
- [ ] 트렌드 카드 관리: `mindle_trends` 테이블 생성 + Intra에서 수동 등록 UI
- [ ] `/mindle/trends` 퍼블릭 페이지 → mindle_trends DB 연결
- [ ] Whole See 크롤러 설정: RSS 소스 목록 관리 UI (Intra BUMS > 콘텐츠)

### 1-B. SmarComm 활성화 (마케팅 자동화 제품)
- [ ] Coming Soon 해제 → `/smarcomm` 접근 가능 상태로 전환
- [ ] `/intra/marketing` ↔ SmarComm WS 데이터 연결 (같은 WIO MKT-* 테이블)
- [ ] SmarComm 구독 플랜 시드: wio_subscription_plans에 smarcomm 플랜 추가
- [ ] `/smarcomm/pricing` → DB 플랜 연동

### 1-C. WIO 테넌트 관리 (업무 자동화 제품)
- [ ] `/intra/universe/subscriptions` → wio_subscription_plans + wio_subscriptions DB 연결
- [ ] WIO Demo 모드: `/wio/app?mode=demo` 샘플 데이터로 접근 가능 확인
- [ ] WIO SaaS 모드: 테넌트 생성 → OrbiConfig 저장 플로우 완성

### 1-D. Agent Hub 활성화 (운영 엔진)
- [ ] `sql/agent-tables.sql` 실행 후 `/intra/agent` 테스트
- [ ] 열시일분(compass) 에이전트 프로필 등록 확인
- [ ] 바당쇠 에이전트: `/api/agent/badaksoe` 엔드포인트 구현
- [ ] 10:01 프로토콜 기초: AM/PM 에이전트 Vrief 제출 → Intra Dashboard 위젯

---

## Phase 2: 구독 인프라 + 수익화 (5월)

> **목표: 결제가 실제로 이루어지는 상태 (MRR 시작)**

### 2-A. 구독 테이블 구축
- [ ] `wio_subscription_plans` 테이블 생성 + 시드 (Mindle·SmarComm·WIO·Badak 플랜)
- [ ] `wio_subscriptions` 테이블 생성 + RLS
- [ ] `/intra/universe/subscriptions` 관리 UI → DB 완전 연결

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

## 수익 마일스톤

| 시점 | 목표 | 핵심 조건 |
|------|------|----------|
| 2026.05 | Mindle MRR 시작 | 구독 결제 + 뉴스레터 1호 |
| 2026.06 | 에이전트 ROI 12.5배 실현 | Whole See 가동 + Naming Factory |
| 2026.07 | SmarComm 대행 1건 | Intra 통제 + Mindle 데이터 |
| 2027.03 | Vrief 워크숍 수익 | Phase 1 첫 외부 판매 |
| 2027.Q2 | WIO SaaS 외부 구독 | 도그푸딩 완성 후 |

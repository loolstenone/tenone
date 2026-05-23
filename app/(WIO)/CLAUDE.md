# WIO 브랜드 가이드

> **WIO** — Ten:One Universe의 공유 IT 인프라. "입력을 없앤다. AI가 80%를 채운다."

---

## 정체성

- **한 줄 소개**: 멀티테넌트 업무 자동화 SaaS (ERP + Project + Marketing + CRM + Learn + Finance)
- **톤앤매너**: 기업 표준. 신뢰감·확장성·보편성. 기술자 중심.
- **주 컬러**: 파란색 (전문성, 신뢰)
- **디자인 방향**: 모듈 기반. 각 기업이 필요한 기능만 끼워 넣는다. 단순·명확·확장.

---

## 정체성

- **WIO = Universe 공유 IT 인프라** (Google처럼 하나의 코드베이스로 여러 테넌트 운영)
- **3대 자원 중심**: 사람(People) + 돈(Finance) + 시간(Timesheet/Schedule)
- **기술 환류**: 맞춤 서비스 개발 진보 → WIO 코어 흡수 → 규격 서비스 업그레이드 (Tech Flywheel)
- **모듈화**: 각 브랜드가 필요한 WIO 모듈만 import해서 사용 (7가지 WIO 모듈)

---

## 접근 모델

- **유형**: 구독 기반 (Free/Starter/Pro/Business/Enterprise)
- **타겟**: 
  - 규격 서비스(Subscription): 중소기업·팀, 셀프서비스 온보딩
  - 맞춤 서비스(Custom Installation): 엔터프라이즈, WIO팀 직접 구성
- **계약 단위**: `tenant_id` (TenOne, XXXX Corp, VVVV Inc...)
- **내부 브랜드**: `tenant_id = 'tenone'` + `brand_id`로 구분 (LUKI, MADLeague, Badak, HeRo 등)

---

## 멀티테넌트 구조

| 레이어 | 설명 |
|--------|------|
| **테넌트** | 계약 단위 (회사·조직). 각 테넌트는 독립적인 데이터. |
| **브랜드** | 유니버스 내부 구분 (TenOne 산하의 LUKI, MADLeague 등) |
| **RLS 정책** | 모든 WIO 테이블은 tenant_id 기반 행 수준 보안 |
| **Feature Flags** | wio_feature_flags 테이블로 플랜별 기능 제한 |

---

## 프로필 특화

- **특화 테이블**: 없음 (모듈별로 자체 테이블 보유)
- **공유 테이블**: 
  - `wio_tenants` — 계약 정보 (company_name, plan, billing_contact)
  - `wio_members` — 테넌트 멤버 (이메일, 직급, 부서, 권한)
  - `wio_subscription_plans` — 구독 정보 (plan, billing_cycle, next_billing_date)
  - `wio_feature_flags` — 플랜별 기능 활성화

---

## 권한 체계

- **role 종류** (모든 WIO 테이블의 member_roles):
  - `owner` — 테넌트 소유자 (계약자)
  - `admin` — 테넌트 관리자 (기능 설정, 팀원 추가)
  - `manager` — 부서장 또는 팀 리더 (부하직원 관리, 결재)
  - `member` — 일반 멤버 (기본 권한)
  - `viewer` — 읽기 전용
- **context**: 모듈별로 다름 (finance, project, marketing, learn, crm, erp)
- **인트라 관리 권한**: `/intra/studio/wio/*` (전체 모듈 관리)

---

## 7가지 WIO 모듈

| 모듈 | 테이블 | 역할 | 사용 브랜드 |
|------|--------|------|-----------|
| **ERP** | wio_orgs, wio_staff, wio_finance, wio_gpr | 기업 운영 (HR·결재·재무) | TenOne Intra |
| **Project** | wio_projects, wio_tasks, wio_people, wio_timeline | 프로젝트 관리 (팀·일정·산출물) | MADLeague, MADLeap |
| **Marketing** | wio_campaigns, wio_messages, wio_audiences, wio_analytics | 마케팅 자동화 (캠페인·분석) | SmarComm |
| **CRM** | wio_leads, wio_deals, wio_contacts, wio_interactions | 영업 관리 (구매자, 미팅, 거래) | HeRo, Badak |
| **Crawler + Content** | wio_crawl_tasks, wio_articles, wio_feeds | 콘텐츠 수집·생산 (뉴스레터) | Mindle |
| **Learn + Wiki** | wio_courses, wio_lessons, wio_wiki, wio_knowledge | 학습 관리 (교육·지식) | Evolution School, Planners |
| **Timesheet + Finance** | wio_timesheets, wio_invoices, wio_settlement, wio_payroll | 시수·정산 (크루 계산) | YouInOne |

---

## UC 정책 특이사항

- **WIO 자체는 UC 미사용** (구독료가 주 수익)
- **각 브랜드가 UC 지급** (예: HeRo의 검사 완료 시 1000 UC, 상담 구매 시 2000 UC)
- **brand_id 지정**: 각 모듈마다 다름 (finance는 null, project는 brand_id 참고)

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `lib/supabase/wio.ts` | WIO 전체 CRUD (모든 모듈) |
| `lib/supabase/wio-*.ts` | 모듈별 클라이언트 (project, marketing, crm 등) |
| `types/wio.ts` | WIO 타입 정의 (25+ 인터페이스) |
| `components/WIOLayout.tsx` | WIO 기본 레이아웃 (사이드바, 헤더) |
| `components/WIOTable.tsx` | 테이블 컴포넌트 (그리드, 정렬, 필터) |
| `app/(WIO)/layout.tsx` | WIO 마스터 레이아웃 |
| `app/(WIO)/wio/page.tsx` | WIO 대시보드 홈 |
| `app/(WIO)/wio/*/page.tsx` | 모듈별 페이지 (25+ 페이지) |
| `app/api/wio/*` | API 라우트 (100+ 엔드포인트) |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/studio/wio` | WIO 전체 관리 |
| `/intra/studio/wio/tenants` | 테넌트 관리 (계약, 결제, 플랜) |
| `/intra/studio/wio/members` | 멤버 관리 (권한, 초대) |
| `/intra/studio/wio/feature-flags` | 플랜별 기능 활성화 |
| `/intra/erp/*` | ERP 모듈 (HR·결재·재무) |
| `/intra/marketing/*` | 마케팅 모듈 관리 |
| `/intra/crm/*` | CRM 모듈 관리 |

---

## 개발 주의사항

### 멀티테넌트 격리

- ❌ 모든 WIO 테이블에 `tenant_id` 없으면 절대 생성 금지
- ✅ RLS 정책 반드시 tenant_id 기반 (`auth.uid() = user_tenant_id()`)
- ❌ 테넌트 A 데이터가 테넌트 B에 보이면 심각한 보안 위반

### Feature Flags

- **wio_feature_flags** 테이블로 플랜별 기능 제한
- 예: Free 플랜은 `project_create = false`, Pro는 `true`
- API 호출 시 반드시 flag 확인 (클라이언트만 신뢰 금지)

### Tech Flywheel

- 맞춤 서비스에서 개발한 기능 → WIO 코어 흡수 → 규격 서비스 업그레이드
- 모든 맞춤 기능에 "이것을 규격화할 수 있는가?" 검토 필수

### 3대 자원 모델

| 자원 | 의미 | 모듈에서의 역할 |
|------|------|----------------|
| **사람** | 누가, 몇 명, 어떤 역할 | People, Team, Permission |
| **돈** | 얼마, 수익, 비용, 정산 | Finance, Budget, Billing |
| **시간** | 언제까지, 몇 시간, 일정 | Timesheet, Schedule, Deadline |

모든 모듈은 최소 하나를 관리하고, 이 3가지를 기준으로 모듈 간 연결.

---

## 가격 (확정)

| Free | Starter | Pro | Business | Enterprise |
|------|---------|-----|----------|-----------|
| 0원 / 5명 | 4.9만원 / 20명 | 14.9만원 / 100명 | 39.9만원 / 무제한 | 협의 |

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Mature (2026-05-11 갱신) — 모든 모듈 프로덕션. 규격·맞춤 서비스 동시 운영. 직원 디지털 명함 신설. |
| **개발 수준** | 코어 안정화 완료. 각 모듈 고도화 진행 중. |
| **이월 작업** | 없음 — 기본 기능 완성 |
| **최근 결정 (세션 149)** | 15페이지 인라인 푸터 → [features/wio/WIOFooter.tsx](features/wio/WIOFooter.tsx) 공통 컴포넌트 일괄 교체 (wio/about·ai-matrix·contact·crm·data·e2e-flows·evaluation·framework·marketing·migration·page·presets·pricing·setup·solutions). 인라인 중복 -52라인 / 컴포넌트 호출 +44라인. 향후 푸터 변경은 한 곳에서. |
| **최근 결정 (세션 124)** | `/wio/app/my/card` — `components/DigitalCard.tsx` SSOT 사용 (WIO 블루 `#2563EB`). QR target = `myverse.kr/{handle}/card` (받는 사람 시점). WIO는 자체 핸들 두지 않고 마이버스 핸들에 위임. MY_TABS에 "명함" 추가. |
| **최근 결정** | 테넌트 동적 구성, 맞춤 서비스 3개(TenOne, XXXX, VVVV) |

---

## 참고

- WIO 완전 설계서: [docs/WIO_Master_Architecture.md](../../docs/WIO_Master_Architecture.md) (단일 진실 소스)
- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)

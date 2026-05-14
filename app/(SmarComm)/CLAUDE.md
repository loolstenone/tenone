# SmarComm 브랜드 가이드

> **SmarComm = Marketing OS** — 마케팅의 모든 작업 흐름(진단·전략·제작·집행·관계·분석·운영)을 하나의 운영체제로 묶는다.
>
> **WIO ↔ SmarComm은 동등한 OS다.** 종속 관계가 아니라 **공유 인프라 위의 동등한 OS 두 개**. WIO가 일반 업무 OS라면, SmarComm은 마케팅 전용 OS다.

---

## 1. 정체성

- **한 줄 소개**: 마케팅 업무 전용 OS. 진단부터 집행·분석까지 하나의 흐름.
- **포지셔닝**: Marketing OS — "Notion이 문서 OS면, SmarComm은 마케팅 OS"
- **톤앤매너**: 전문적·신뢰감·현대적. 분석 대시보드·차트 중심.
- **주 컬러**: 네이비 + 하늘색 (신뢰·기술)
- **디자인 방향**: 데이터 가시화 · 워크스페이스 · 팩(Pack) 기반 확장
- **주 도메인**: `smarcomm.biz` (서브: `smarcomm.tenone.biz`)

---

## 2. WIO ↔ SmarComm 관계 SSOT

> ⚠ **가장 중요한 원칙: 종속 관계가 아니다.** 이전 문서들에 남아 있는 "SmarComm = WIO MKT-* 위의 어플리케이션" 표현은 **폐기**. 동등한 OS 둘이 같은 인프라 위에 공존하는 모델로 정정.

### 두 OS의 동등 관계

```
┌──────────────────────────────────────────────────────────┐
│  공유 인프라 (Supabase · Auth · UC · Storage · Members)  │
└──────────────────────────────────────────────────────────┘
            ▲                                ▲
            │                                │
  ┌──────────────────┐            ┌──────────────────────┐
  │   WIO (OS)       │            │  SmarComm (Marketing │
  │   일반 업무 OS   │ ◄────────► │  OS)                 │
  │                  │  데이터    │                       │
  │  · ERP           │   교환     │  · 진단 (GEO·SEO)    │
  │  · Project       │            │  · 전략 (AI 어드바이저)│
  │  · Marketing*    │            │  · 제작 (AI 소재)    │
  │  · CRM           │            │  · 집행 (캠페인)     │
  │  · Learn         │            │  · 관계 (CRM)        │
  │  · Crawler       │            │  · 분석 (퍼널·코호트) │
  │  · Timesheet     │            │  · 운영 (워크플로우) │
  └──────────────────┘            └──────────────────────┘
```

### 모듈 사용 규칙

| 원칙 | 내용 |
|---|---|
| **공유 인프라 사용** | 둘 다 `wio_subscription_plans`·`members`·`auth.users`·Supabase 동일 사용 |
| **데이터 교환** | SmarComm이 WIO Marketing 모듈 테이블(`wio_campaigns` 등)을 **읽거나 쓸 수 있음** — 모듈 import |
| **자체 도메인 보유** | SmarComm은 WIO에 없는 자체 테이블 보유 가능 (`smarcomm_scans`·`smarcomm_advisor_plans` 등) |
| **종속 금지** | "SmarComm은 WIO의 일부"라는 표현·코드 분기 금지. **별도 운영·별도 가격·별도 권한**. |
| **이중 구현 금지** | 같은 기능(예: 캠페인 관리)을 양쪽에 각자 구현 금지 — 공통 기능은 `wio_*` 테이블에 두고 둘 다 참조 |

### 정체성 차이

| 구분 | WIO | SmarComm |
|---|---|---|
| 자원 모델 | 사람·돈·시간 (3대 자원) | 진단·소재·채널·관계 (마케팅 4축) |
| 주 사용자 | 모든 회사·모든 부서 | 마케터·중소기업 광고주·대행사 |
| 도메인 깊이 | 넓음 (전사 운영) | 깊음 (마케팅만 끝까지) |
| AI 활용 | 자동화·생산성 | 분석·생성·추천 (마케팅 핵심) |
| 차별 강점 | 멀티테넌트·모듈 조합 | AI 가시성(GEO)·소재 자동화 |

---

## 3. Marketing OS 7대 영역 (SSOT)

마케팅 업무 흐름을 7단계 사이클로 모델링한다. 모든 SmarComm 페이지는 이 7개 중 하나에 속한다.

| # | 영역 | 핵심 질문 | 대표 페이지 |
|---|---|---|---|
| ① | **진단** | "지금 우리는 어디에 있나" | `/dashboard/scan` · `/dashboard/geo`·`/dashboard/geo/competitors`·`/dashboard/geo/brand`·`/dashboard/geo/tracking`·`/dashboard/geo/prompts` |
| ② | **전략** | "어디로 가야 하나" | `/dashboard/advisor` (AI 어드바이저) |
| ③ | **제작** | "무엇을 만들 것인가" | `/dashboard/creative`·`/dashboard/content`·`/dashboard/archive` |
| ④ | **집행** | "어디에 어떻게 뿌릴 것인가" | `/dashboard/campaigns`·`/dashboard/calendar`·`/dashboard/workflow/automation` |
| ⑤ | **관계** | "누구와 계속 이어갈 것인가" | `/dashboard/crm`·`/dashboard/crm/email`·`/dashboard/crm/kakao`·`/dashboard/crm/push` |
| ⑥ | **분석** | "결과는 어땠나" | `/dashboard/funnel`·`/dashboard/traffic`·`/dashboard/analytics`·`/dashboard/cohort`·`/dashboard/abtest`·`/dashboard/journey`·`/dashboard/events`·`/dashboard/reports`·`/dashboard/data-reports` |
| ⑦ | **운영** | "어떻게 한 흐름으로 굴릴 것인가" | `/dashboard/workflow`·`/dashboard/workflow/projects`·`/dashboard/workflow/kanban`·`/dashboard/workflow/pipeline` |

> 새 페이지를 만들 때 **반드시 7개 영역 중 하나로 분류**. 어디에도 안 맞으면 7대 영역 자체를 갱신할지 검토.

### 사이클의 흐름

```
진단 → 전략 → 제작 → 집행 → 관계 → 분석 → 운영
 ↑                                          │
 └──────────── 다음 사이클 ──────────────────┘
```

분석 결과가 다음 진단의 기준이 되고, 운영은 전 영역을 묶는 위계.

---

## 3-A. SmarComm Index 보고서 SSOT (진단 영역 핵심)

> ① 진단 영역의 산출물 = **SmarComm Index 보고서**. 이 보고서가 SmarComm 전체 가치의 진입점이자 차별점.
> 보고서 구조·점수 가중치·AI 플랫폼·질문 셋·역할 매핑·뷰 모드는 모두 이 절에 잠금.

### SSOT-1. Index 가중치 (30/30/40)

```
SmarComm Index = Findability × 30% + Trust × 30% + Citability × 40%
```

| 서브 지표 | 가중치 | 의미 | 측정 |
|---|---|---|---|
| 🔍 **Findability** | 30% | 검색·AI가 **찾을 수 있는가** | 기술 SEO + 메타 + 사이트 구조 |
| ⭐ **Trust** | 30% | **신뢰할 만한가** | 콘텐츠 깊이·권위 신호·구조화 데이터 |
| 🤖 **Citability** | 40% | **AI가 우리를 추천하는가** (차별점) | 실측 AI 노출 + 인용 가능성 |

> Citability 40%는 의도적. 2026년 마케팅 OS의 차별 = "AI 검색 시대에 보이는가". 균등 분배(33/33/33)나 기존 가중치(40/40/20) 사용 금지.

**등급**: S(95+) · A(80~94) · B(60~79) · C(40~59) · D(0~39)

SSOT 구현 위치: [lib/smarcomm/index-calculator.ts](lib/smarcomm/index-calculator.ts) `computeIndex()` 함수.

### SSOT-2. AI 플랫폼 5개

| 순서 | 플랫폼 | 측정 방식 | 활성 상태 |
|---|---|---|---|
| 1 | **Claude** | Anthropic API 직접 호출 | ✅ 활성 |
| 2 | **ChatGPT** | OpenAI API (GPT-4o) | ⏳ Phase 2 |
| 3 | **Perplexity** | Perplexity API | ⏳ Phase 2 |
| 4 | **네이버 Cue** | 헤드리스 크롤(공식 API 없음) | ⏳ Phase 2 |
| 5 | **Google AI Overview** | SerpAPI 또는 동등 도구 | ⏳ Phase 2 |

> 새 AI 플랫폼 추가 시: ① 이 표에 row 추가 → ② `lib/smarcomm/ai-probes/{platform}.ts` 신설 → ③ `question-bank` 카테고리 점검. 6번째 플랫폼 임의 추가 금지(보고서 레이아웃이 5개 기준).

### SSOT-3. 카테고리별 질문 셋 (Question Bank)

`lib/smarcomm/question-bank.ts` SSOT. 업종(`industry`) 입력 시 자동 매칭되는 7카테고리 × 평균 3질문 = ~21 질문.

| 카테고리 | 예시 질문 (업종: SaaS) |
|---|---|
| Brand Direct | "SmarComm 어떤 회사야?" |
| Product Generic | "마케팅 자동화 SaaS 추천" |
| Use Case | "광고 효율 분석 도구" |
| Competitor Comparison | "SmarComm vs HubSpot" |
| Pricing | "한국 마케팅 SaaS 가격" |
| How-To | "AI 검색 노출 방법" |
| Local | "한국 마케팅 솔루션" |

### SSOT-4. 액션 → 역할 매핑

각 액션은 반드시 4개 역할 중 하나에 매핑.

| 역할 | 영문 키 | 담당 액션 유형 |
|---|---|---|
| 🎯 **마케팅 담당** | `marketer` | 메타 설명·OG 카피·키워드 전략·콘텐츠 기획 |
| 💻 **개발팀** | `dev` | 스키마 삽입·sitemap·HTTPS·페이지 속도·robots.txt |
| ✍️ **콘텐츠 작가** | `writer` | FAQ 작성·블로그·상세 페이지 본문·H1-3 구조 |
| 🎨 **디자이너** | `designer` | OG 이미지·아이콘·이미지 ALT 가이드·시각 콘텐츠 |

SSOT 구현 위치: 액션 객체에 `role: 'marketer'|'dev'|'writer'|'designer'` 필드 필수.

### SSOT-5. 보고서 뷰 모드 3개

```
┌──────────────┬──────────────┬──────────────┐
│  🎯 마케터    │  📊 경영진    │  💻 개발자    │
│  (기본)      │  (30초)      │  (디테일)    │
└──────────────┴──────────────┴──────────────┘
```

| 모드 | URL Param | 노출 섹션 |
|---|---|---|
| **마케터** (기본) | `?view=marketer` (생략 가능) | Hero + 4 질문 + Action + Role + Potential + Trend + Tools |
| **경영진** | `?view=exec` | Hero + Q4(경쟁) + Trend (3섹션만, 30초 읽기) |
| **개발자** | `?view=dev` | Hero + 14 기술 체크 + 서브페이지 표 + Schema Generator |

같은 데이터, 다른 노출. 데이터 모델·계산은 단일.

### SmarComm Index 보고서 페이지 SSOT

| 페이지 | 역할 |
|---|---|
| [app/(SmarComm)/smarcomm/scan/page.tsx](smarcomm/scan/page.tsx) | URL 입력 → 진단 시작 (비회원 진입) |
| [app/(SmarComm)/smarcomm/dashboard/scan/page.tsx](smarcomm/dashboard/scan/page.tsx) | 워크스페이스 내부 진단 (히스토리·경쟁사 비교) |
| [app/(SmarComm)/smarcomm/report/[id]/page.tsx](smarcomm/report/[id]/page.tsx) | **공유 가능 보고서 영구 URL** (DB 기반) |
| [app/api/smarcomm/scan/route.ts](app/api/smarcomm/scan/route.ts) | 진단 실행 + DB 저장 + 공유 ID 발급 |
| [lib/smarcomm/seo-analyzer.ts](lib/smarcomm/seo-analyzer.ts) | 분석 엔진 (806줄) |
| [lib/smarcomm/index-calculator.ts](lib/smarcomm/index-calculator.ts) | **SmarComm Index 계산 SSOT** (Phase 1 신규) |
| [lib/smarcomm/ai-probes/*.ts](lib/smarcomm/ai-probes/) | AI 플랫폼별 프로브 (Phase 2 신규) |
| [lib/smarcomm/question-bank.ts](lib/smarcomm/question-bank.ts) | 카테고리별 질문 셋 (Phase 2 신규) |
| [lib/smarcomm/schema-generator.ts](lib/smarcomm/schema-generator.ts) | JSON-LD 자동 생성 (Phase 3 신규) |

### DB SSOT

| 테이블 | 역할 | 도입 |
|---|---|---|
| `smarcomm_scans` | 진단 결과 영구 저장 + 공유 ID | Phase 1 |
| `smarcomm_scan_pages` | 서브페이지 분석 결과 | Phase 1 |
| `smarcomm_ai_probes` | AI 플랫폼별 실측 응답 캡처 | Phase 2 |
| `smarcomm_industry_benchmarks` | 업종 평균 (백분위 계산) | Phase 4 |

---

## 4. 접근 모델

- **유형**: 구독 (Subscription) + 진입은 무료 진단(URL 입력 1회)
- **가입 경로**:
  1. 마케팅 페이지에서 URL 입력 → **무료 진단** (회원가입 없이 30초)
  2. 결과 확인 후 회원가입 (이메일 + 회사명)
  3. 플랜 선택 (Free / Starter / Growth / Pro / Enterprise)
  4. 결제 (Toss/Stripe) → `wio_subscription_plans` 레코드 생성
  5. `/dashboard` 진입 가능
- **멤버 권한**:
  - `subscriber` — 구독자 (플랜별 기능)
  - `admin` — 워크스페이스 관리자 (팀원 초대·권한)
  - `manager` — SmarComm 플랫폼 운영진 (TenOne 내부)

### 가격 플랜 SSOT — DB 기반

> ⚠ **가격 SSOT는 코드·MD가 아니라 DB**. Markdown은 변경 추적이 어렵고, 영업·이벤트로 자주 바뀐다.
> `wio_subscription_plans WHERE service='smarcomm' AND is_active=true ORDER BY price_monthly` 가 단일 진실 소스.

표시·CTA는 [pricing/page.tsx](smarcomm/pricing/page.tsx)에서 DB 조회.

코드상 4단(`Starter/Growth/Pro/Enterprise`) + 진입 무료 진단. 정확한 가격·기능 매트릭스는 DB 조회 필수.

---

## 5. 팩(Pack) 시스템 SSOT

> SmarComm의 핵심 IA. 메뉴는 7대 영역으로 분류되지만, **기능 활성화는 5개 팩(Pack)으로 묶여 티어에 매핑**된다.

| 팩 | 이모지 | 포함 영역 | 활성 티어 |
|---|---|---|---|
| **core** | — | 홈·진단·기본 분석·AI 가시성 | Starter+ |
| **action** 🎯 | 액션팩 | AI 어드바이저·소재 제작·콘텐츠·아카이브 | Growth+ |
| **crm** 📱 | CRM팩 | 고객 관리·카카오·이메일·푸시 | Growth+ |
| **experiment** 🧪 | 실험팩 | A/B 테스트·사용자 여정·코호트·이벤트 | Pro+ |
| **ops** 📋 | 운영팩 | 프로젝트·칸반·캘린더·자동화·워크플로우 | Pro+ |
| **launch** 🚀 | 집행팩 | 캠페인 (광고 집행) | Enterprise+ |
| **setting** | — | 워크스페이스 설정 | Starter+ |

SSOT 위치: [features/smarcomm/DashboardSidebar.tsx](features/smarcomm/DashboardSidebar.tsx) `PACK_TIER` 상수 + `MENU_SECTIONS` 배열.

> 새 메뉴 추가 시: ① 어느 팩에 속하는지 결정 → ② 7대 영역 중 어디인지 결정 → ② `MENU_SECTIONS`에 `pack` 지정.

---

## 6. 프로필 특화

- **특화 테이블**: 없음 — Marketing OS 자체는 회사 단위 워크스페이스 + 멤버 권한만 관리
- **고유 필드**:
  - `company_name` — 회사명 (DashboardSidebar 좌상단 표시)
  - `industry` — 산업군 (진단·소재 제작에 활용)
  - `monthly_ad_spend` — 월 광고 예산
- **관련 테이블**: `wio_subscription_plans` (공유), `members` (공유)
- **워크스페이스 데이터**: `localStorage.smarcomm_company` (마이그레이션 예정 → DB)

---

## 7. 권한 체계

- **role**: `subscriber` / `admin` / `manager`
- **context**: `brand:smarcomm` 또는 워크스페이스 단위 `workspace:{id}`
- **인트라 관리 권한**: `/intra/ums/smarcomm`
- **공유 권한**: WIO 모듈 데이터 접근 시 `wio_members` 권한 우선

---

## 8. UC 정책 특이사항

- **브랜드 전용 액션**: 없음 (구독료가 주 수익)
- **brand_id 지정**: `brand_id = 'smarcomm'` (UC 지급·차감 시)
- **향후 후보**:
  - 무료 진단 완료 → 100 UC (전환 유인)
  - 첫 광고 집행 완료 → 1000 UC
  - 캠페인 결과 공유(케이스 스터디) → 5000 UC

---

## 9. Action Hub Entries

> CLAUDE.md § 1.9.1 SSOT. 현재 SmarComm은 **승인/심사 흐름이 없어** Action Hub 등록 항목 0개.

향후 등록 후보:
- 무료 진단 의뢰 (비회원 → CS 응대) — table `smarcomm_scan_inquiries` (예정)
- AI 어드바이저 컨설팅 신청 (Enterprise 문의) — table `smarcomm_consulting_inquiries` (예정)

---

## 10. 핵심 파일

### 사이트(마케팅)

| 파일 | 역할 |
|---|---|
| [app/(SmarComm)/layout.tsx](smarcomm/layout.tsx) | generateMetadata · DB 메타 연동 |
| [app/(SmarComm)/smarcomm/page.tsx](smarcomm/page.tsx) | 마케팅 랜딩 (회전 헤드라인·무료 진단·5단계 프로세스) |
| [app/(SmarComm)/smarcomm/pricing/page.tsx](smarcomm/pricing/page.tsx) | 요금제 (DB 기반) |
| [app/(SmarComm)/smarcomm/signup/page.tsx](smarcomm/signup/page.tsx) | 회원가입 |
| [app/(SmarComm)/smarcomm/login/page.tsx](smarcomm/login/page.tsx) | 로그인 |
| [app/(SmarComm)/smarcomm/my/page.tsx](smarcomm/my/page.tsx) | 마이페이지 |
| [app/(SmarComm)/smarcomm/workspace/page.tsx](smarcomm/workspace/page.tsx) | 워크스페이스 진입 |
| [app/(SmarComm)/smarcomm/scan/page.tsx](smarcomm/scan/page.tsx) | 무료 진단(비회원) |
| [app/(SmarComm)/smarcomm/blog/page.tsx](smarcomm/blog/page.tsx) · [`[slug]/page.tsx`](smarcomm/blog/[slug]/page.tsx) | 블로그 |
| [app/(SmarComm)/smarcomm/report/[id]/page.tsx](smarcomm/report/[id]/page.tsx) | 진단 리포트 공개 페이지 |

### 대시보드 (35+ 페이지 — 7대 영역으로 분류)

**① 진단 (Diagnostics)**
- [scan/page.tsx](smarcomm/dashboard/scan/page.tsx) — GEO & SEO 진단
- [geo/page.tsx](smarcomm/dashboard/geo/page.tsx) — AI 가시성 개요
- [geo/competitors/page.tsx](smarcomm/dashboard/geo/competitors/page.tsx) — 경쟁사 리서치
- [geo/brand/page.tsx](smarcomm/dashboard/geo/brand/page.tsx) — 브랜드 실적
- [geo/tracking/page.tsx](smarcomm/dashboard/geo/tracking/page.tsx) — 프롬프트 추적
- [geo/prompts/page.tsx](smarcomm/dashboard/geo/prompts/page.tsx) — 프롬프트 리서치

**② 전략 (Strategy)**
- [advisor/page.tsx](smarcomm/dashboard/advisor/page.tsx) — AI 어드바이저

**③ 제작 (Creation)**
- [creative/page.tsx](smarcomm/dashboard/creative/page.tsx) — AI 소재 제작
- [content/page.tsx](smarcomm/dashboard/content/page.tsx) — 콘텐츠 관리
- [archive/page.tsx](smarcomm/dashboard/archive/page.tsx) — 소재 아카이브

**④ 집행 (Launch)**
- [campaigns/page.tsx](smarcomm/dashboard/campaigns/page.tsx) — 광고 집행
- [calendar/page.tsx](smarcomm/dashboard/calendar/page.tsx) — 마케팅 캘린더

**⑤ 관계 (CRM)**
- [crm/page.tsx](smarcomm/dashboard/crm/page.tsx) — 고객 관리
- [crm/kakao/page.tsx](smarcomm/dashboard/crm/kakao/page.tsx) — 카카오
- [crm/email/page.tsx](smarcomm/dashboard/crm/email/page.tsx) — 이메일
- [crm/push/page.tsx](smarcomm/dashboard/crm/push/page.tsx) — 푸시

**⑥ 분석 (Analytics)**
- [funnel/page.tsx](smarcomm/dashboard/funnel/page.tsx) — 퍼널
- [traffic/page.tsx](smarcomm/dashboard/traffic/page.tsx) — 트래픽
- [analytics/page.tsx](smarcomm/dashboard/analytics/page.tsx) — 매출
- [cohort/page.tsx](smarcomm/dashboard/cohort/page.tsx) — 코호트
- [abtest/page.tsx](smarcomm/dashboard/abtest/page.tsx) — A/B 테스트
- [journey/page.tsx](smarcomm/dashboard/journey/page.tsx) — 사용자 여정
- [events/page.tsx](smarcomm/dashboard/events/page.tsx) — 이벤트
- [reports/page.tsx](smarcomm/dashboard/reports/page.tsx) — 캠페인 리포트
- [data-reports/page.tsx](smarcomm/dashboard/data-reports/page.tsx) — 데이터 리포트

**⑦ 운영 (Workflow)**
- [workflow/page.tsx](smarcomm/dashboard/workflow/page.tsx) — 워크플로우 허브
- [workflow/projects/page.tsx](smarcomm/dashboard/workflow/projects/page.tsx) — 프로젝트
- [workflow/kanban/page.tsx](smarcomm/dashboard/workflow/kanban/page.tsx) — 칸반
- [workflow/pipeline/page.tsx](smarcomm/dashboard/workflow/pipeline/page.tsx) — 파이프라인
- [workflow/automation/page.tsx](smarcomm/dashboard/workflow/automation/page.tsx) — 자동화

**설정·유틸**
- [dashboard/layout.tsx](smarcomm/dashboard/layout.tsx) — 대시보드 셸 (사이드바·헤더·즐겨찾기·ContextPanel)
- [dashboard/page.tsx](smarcomm/dashboard/page.tsx) — 홈
- [profile/page.tsx](smarcomm/dashboard/profile/page.tsx) — 워크스페이스 설정
- [members/page.tsx](smarcomm/dashboard/members/page.tsx) — 팀원
- [admin/page.tsx](smarcomm/dashboard/admin/page.tsx) — 사이트 관리
- [guide/page.tsx](smarcomm/dashboard/guide/page.tsx) — 가이드
- [glossary/page.tsx](smarcomm/dashboard/glossary/page.tsx) — 용어집

### 컴포넌트 (`features/smarcomm/`)

| 파일 | 역할 |
|---|---|
| [DashboardSidebar.tsx](features/smarcomm/DashboardSidebar.tsx) | 사이드바 + **팩 시스템 SSOT** (PACK_TIER) |
| [ContextPanel.tsx](features/smarcomm/ContextPanel.tsx) | 우측 패널 (필터·기간·메모) |
| [Header.tsx](features/smarcomm/Header.tsx) · [SmarCommHeader.tsx](features/smarcomm/SmarCommHeader.tsx) | 헤더 |
| [Footer.tsx](features/smarcomm/Footer.tsx) · [SmarCommFooter.tsx](features/smarcomm/SmarCommFooter.tsx) | 푸터 |
| [SmarCommSidebar.tsx](features/smarcomm/SmarCommSidebar.tsx) | 마케팅 페이지 사이드바 |
| [SmarCommPreviewGate.tsx](features/smarcomm/SmarCommPreviewGate.tsx) | 미리보기 게이트 (플랜 제한) |
| [TierGate.tsx](features/smarcomm/TierGate.tsx) | 티어 게이트 (Pack 잠금) |
| [QuickStartModal.tsx](features/smarcomm/QuickStartModal.tsx) | 시작 가이드 |
| [PageTopBar.tsx](features/smarcomm/PageTopBar.tsx) · [PageActions.tsx](features/smarcomm/PageActions.tsx) | 페이지 상단 바·액션 |
| [NextStepCTA.tsx](features/smarcomm/NextStepCTA.tsx) | 다음 단계 안내 |
| [GuideHelpButton.tsx](features/smarcomm/GuideHelpButton.tsx) | 가이드 도움말 |
| [RadarChart.tsx](features/smarcomm/RadarChart.tsx) · [GaugeChart.tsx](features/smarcomm/GaugeChart.tsx) · [charts/](features/smarcomm/charts/) | 차트 (Recharts) |
| [RightPanel.tsx](features/smarcomm/RightPanel.tsx) | 우측 패널 (메모·필터) |
| [workflow/](features/smarcomm/workflow/) | 워크플로우 컴포넌트 |

### 라이브러리 (`lib/smarcomm/`)

| 파일 | 역할 |
|---|---|
| [scan-data.ts](lib/smarcomm/scan-data.ts) · [seo-analyzer.ts](lib/smarcomm/seo-analyzer.ts) | 진단 데이터·분석 로직 |
| [dashboard-data.ts](lib/smarcomm/dashboard-data.ts) · [mock-data.ts](lib/smarcomm/mock-data.ts) | 대시보드 mock 데이터 (실 API 연동 대기) |
| [report-data.ts](lib/smarcomm/report-data.ts) | 리포트 데이터 |
| [campaign-plan.ts](lib/smarcomm/campaign-plan.ts) · [campaign-tracker.ts](lib/smarcomm/campaign-tracker.ts) | 캠페인 기획·추적 |
| [brand-personality.ts](lib/smarcomm/brand-personality.ts) | 브랜드 페르소나 (AI 어드바이저용) |
| [workflow-data.ts](lib/smarcomm/workflow-data.ts) · [workflow-context.tsx](lib/smarcomm/workflow-context.tsx) | 워크플로우 상태·데이터 |
| [blog-data.ts](lib/smarcomm/blog-data.ts) | 블로그 mock |
| [guide-data.ts](lib/smarcomm/guide-data.ts) · [guide-sections*.ts](lib/smarcomm/) | 가이드 컨텐츠 |
| [glossary-data.ts](lib/smarcomm/glossary-data.ts) | 용어집 |
| [chart-palette.ts](lib/smarcomm/chart-palette.ts) | 차트 색상 팔레트 |
| [notify.ts](lib/smarcomm/notify.ts) | 알림 |
| ⚠ [auth.ts](lib/smarcomm/auth.ts) | **Mock 인증 — 제거 예정** (CLAUDE.md 1.2 위반) |

### API 라우트

| 파일 | 역할 |
|---|---|
| [scan/route.ts](app/api/smarcomm/scan/route.ts) | 무료 진단 실행 |
| [advisor/campaign-plan/route.ts](app/api/smarcomm/advisor/campaign-plan/route.ts) | AI 어드바이저 캠페인 기획 |
| [creative/generate/route.ts](app/api/smarcomm/creative/generate/route.ts) | AI 소재 생성 |

> ⚠ **API 라우트 3개만 — 35+ 페이지 대비 백엔드 부족.** Phase 1의 핵심 과제.

---

## 11. 인트라 관리 경로

| 경로 | 역할 |
|---|---|
| `/intra/ums/smarcomm` | 구독자·플랜·분석 데이터 관리 |
| `/intra/marketing/*` | (WIO Marketing 모듈 직접 관리 — SmarComm WS와 데이터 연결) |

---

## 12. 개발 주의사항

### Preview Gate / TierGate

- 무료/Starter 플랜 사용자가 상위 팩 페이지 접근 시 잠금 표시
- 사이드바: 상위 팩 메뉴에 자물쇠 아이콘
- 페이지 내부: `<TierGate requiredTier="growth">` 래핑
- 모달 메시지: "이 기능은 [팩명]에 포함됩니다. 플랜 업그레이드 →"

### 대시보드 데이터

- 현재 **거의 100% mock** 데이터 (`lib/smarcomm/mock-data.ts` · `dashboard-data.ts`)
- 진단(`scan`)·어드바이저·소재 생성만 실제 API 보유
- 실 API 연동 미진행: 퍼널·트래픽·코호트·CRM·자동화·캠페인 등 30+ 페이지

### 차트

- 라이브러리: Recharts (React 친화적)
- 팔레트: [lib/smarcomm/chart-palette.ts](lib/smarcomm/chart-palette.ts) SSOT
- 게이지·레이더: 자체 컴포넌트 ([GaugeChart](features/smarcomm/GaugeChart.tsx) / [RadarChart](features/smarcomm/RadarChart.tsx))

### Feature Flags (TODO)

- `wio_feature_flags` 연동 미완성
- 현재 sidebar는 `useAuth()`로 staff/admin 판단 (Pack 우회) — DB 기반 평가 필요

---

## 13. 절대 하지 말 것 (SmarComm)

- ❌ **"SmarComm = WIO 위 어플리케이션" 표현 사용** — 동등한 OS 둘이 공유 인프라 위에 공존하는 모델
- ❌ **자체 인증 시스템 추가** — [lib/smarcomm/auth.ts](lib/smarcomm/auth.ts) (Mock + 평문 비밀번호) 제거 대상. 반드시 `useAuth()` SSOT 사용 (CLAUDE.md § 1.2)
- ❌ **`router.push('/login')` 하드코딩** — CLAUDE.md § 1.2.1 위반. 브랜드 보호 페이지는 `LoginModal` 팝업, 외부 링크는 `loginHref(pathname)`
- ❌ **자체 구독 테이블 생성** — `wio_subscription_plans WHERE service='smarcomm'` SSOT 필수. 별도 `smarcomm_plans` 테이블 만들지 말 것
- ❌ **WIO Marketing 모듈과 중복 구현** — 캠페인·메시지·오디언스는 `wio_campaigns`/`wio_messages` 등 WIO 테이블을 직접 사용. 별도 `smarcomm_campaigns` 만들지 말 것 (단, SmarComm 고유 도메인인 GEO 진단·소재 생성 메타데이터는 자체 테이블 OK)
- ❌ **localStorage에 영구 데이터 저장** — `smarcomm_company` · `smarcomm_favorites` 등은 마이그레이션 대상. 멀티디바이스 동기 깨짐
- ❌ **7대 영역 외 메뉴 추가** — 새 메뉴는 반드시 7개 영역 중 하나로 분류
- ❌ **팩 분류 없이 메뉴 추가** — `DashboardSidebar.MENU_SECTIONS` 의 `pack` 필드 누락 시 잠금 동작 깨짐
- ❌ **자체 헤더로 UniverseUtilityBar 우회** — 마케팅 페이지는 [SmarCommHeader.tsx](features/smarcomm/SmarCommHeader.tsx) 유지, 대시보드는 자체 헤더지만 향후 UniverseUtilityBar 통합 검토

---

## 14. 참고 문서

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- WIO 완전 설계서: [docs/WIO_Master_Architecture.md](../../docs/WIO_Master_Architecture.md)
- WIO 브랜드 가이드: [app/(WIO)/CLAUDE.md](../(WIO)/CLAUDE.md)
- 수익 모델: [docs/REVENUE_MODEL.md](../../docs/REVENUE_MODEL.md) (SmarComm 섹션 ⚠ 5단 표기 — 본 가이드 § 4의 DB SSOT가 우선)
- 8원칙 #4 (이중구현 금지): [CLAUDE.md § 1.10](../../CLAUDE.md)

---

## 15. 현재 상태

> ⚠ **이전 가이드의 "Phase: Launch · 이월 없음" 표현은 정정.** 실제는 UI 골격만 완성된 상태이며 백엔드 통합은 초기.

| 항목 | 내용 |
|---|---|
| **Phase** | **Beta + SmarComm Index 보고서 Phase 3 완료** (2026-05-14, 세션 135 갱신) |
| **개발 수준** | 진단 영역 = 산업 표준급 보고서 완성 (Phase 1~3). 나머지 35+ 페이지는 mock. API 라우트 5개 (scan + report/[id] + report/[id]/trend + creative + advisor) |
| **이월 작업 (우선순위 순)** | ① **ANTHROPIC_API_KEY 갱신** (현재 401, Claude probe + exec summary 잠금) · ② OpenAI/Perplexity/SerpAPI/PageSpeed 키 발급으로 5 AI 플랫폼 + CWV 전체 활성 · ③ [lib/smarcomm/auth.ts](lib/smarcomm/auth.ts) Mock 인증 제거 · ④ [dashboard/layout.tsx:28](smarcomm/dashboard/layout.tsx) `router.push('/login')` → LoginModal · ⑤ Mock 대시보드 → 실 API · ⑥ Feature Flags `wio_feature_flags` 연동 · ⑦ localStorage → DB 마이그레이션 |
| **주요 결정 (세션 135)** | ① **WIO ↔ SmarComm 동등 OS 관계 SSOT 확정** — 종속 관계 표현 폐기 · ② Marketing OS 7대 영역(진단·전략·제작·집행·관계·분석·운영) 명문화 · ③ **SmarComm Index 가중치 30/30/40 확정** — Citability(40%) 가중 = 차별점 · ④ 권위도 측정 폐기 (휴리스틱 정직하지 못함, Phase 4 외부 도구 대기) · ⑤ **AI 정확도 wrong = -0.5 음수 가중** (오답이 미언급보다 위험) · ⑥ Index 보고서 4-Tier 측정 모델 (T0~T2만 점수, T3/T4 별도 N/A) |
| **SmarComm Index 보고서 산출 (세션 135)** | **DB 3 테이블 · lib 15 모듈 · UI 9 컴포넌트 · 권위 anchor 12개**. 보고서 14 섹션 — Hero(Index+Grade+3질문) → E-E-A-T 4축 → 30초 요약 → Action Plan(2×2) → Schema 자동 생성기 → Trend 차트 → 상위 이슈 → 서브페이지 → 종합 레이더 → 분석 요약 → 브랜드 성격 → 기술 SEO(10 카드) → 콘텐츠 SEO(8 카드, 보안 헤더 신규) → AI 검색(5 플랫폼 실측) → AI Visibility Map → AI 최적화 준비도 → 심화 분석 + 신뢰 푸터 |
| **블로커** | Toss 가맹점 승인 + Vercel 환경변수 (실 결제 흐름 작동 안 됨) · ANTHROPIC_API_KEY 갱신 필요 |

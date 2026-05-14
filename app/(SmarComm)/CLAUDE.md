# SmarComm 브랜드 가이드

> **SmarComm** — AI 기반 마케팅 분석 & 자동화 솔루션. "광고를 똑똑하게"

---

## 정체성

- **한 줄 소개**: 중소기업·마케팅팀을 위한 AI 광고 분석·최적화 SaaS
- **톤앤매너**: 전문적·신뢰감·현대적. 대시보드 중심의 비즈니스 톤.
- **주 컬러**: 네이비 + 하늘색 (신뢰감·기술)
- **디자인 방향**: 대시보드·차트·분석 시스템. 데이터 가시화 중심.

---

## 접근 모델

- **유형**: 구독 기반 (플랜별 기능 제한, Preview Gate)
- **가입 경로**:
  1. 회원가입 (회사 이메일)
  2. 플랜 선택 (Free/Starter/Pro/Business)
  3. 결제 (Stripe/Toss)
  4. `wio_subscription_plans` 레코드 생성
  5. 대시보드 접근 가능
- **멤버 권한**:
  - `subscriber` — 구독자 (플랜별 기능)
  - `admin` — 계정 관리자 (팀원 초대·권한)
  - `manager` — 운영진 (SmarComm 플랫폼 운영)

---

## 프로필 특화

- **특화 테이블**: 없음 (대시보드 기반, 회사 정보만)
- **고유 필드**: 
  - `company_name` — 회사명
  - `industry` — 산업군
  - `monthly_ad_spend` — 월 광고비 (예산 파악용)
- **관련 테이블**: `wio_subscription_plans` (구독 정보)
- **프로필 조회**: 필요 시 `getWIOSubscriptionProfile()` 활용

---

## 권한 체계

- **role 종류**:
  - `subscriber` — 구독자 (플랜별 기능 제한)
  - `admin` — 계정 관리자
  - `manager` — 운영진 (context: `brand:smarcomm`)
- **context**: `brand:smarcomm`
- **인트라 관리 권한**: `/intra/ums/smarcomm` (1개 패널)

---

## UC 정책 특이사항

- **브랜드 전용 액션**: 없음 (구독료가 주 수익 모델)
- **brand_id 지정**: `brand_id = NULL` (전 브랜드 공통 모듈이므로)
- **UC는 부가 기능**: 향후 프리미엄 분석 보고서 다운로드 시 적용 가능

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(SmarComm)/layout.tsx` | generateMetadata |
| `app/(SmarComm)/smarcomm/page.tsx` | 마케팅 랜딩 (요금·사례·CTA) |
| `app/(SmarComm)/smarcomm/dashboard/page.tsx` | 메인 대시보드 (광고 분석 개요) |
| `app/(SmarComm)/smarcomm/dashboard/index/page.tsx` | **SmarComm Index 진단 페이지** (3 view mode: marketer/exec/dev) |
| `app/(SmarComm)/smarcomm/dashboard/scan/page.tsx` | GEO & SEO 진단 (이전 구조) |
| `app/(SmarComm)/smarcomm/dashboard/creative/page.tsx` | 크리에이티브 분석 (광고별 성과) |
| `app/(SmarComm)/smarcomm/dashboard/audience/page.tsx` | 오디언스 분석 |
| `app/(SmarComm)/smarcomm/dashboard/analytics/page.tsx` | 상세 분석 (ROI·CPA 등) |
| `app/(SmarComm)/smarcomm/scan/page.tsx` | 경쟁사 스캔 (경쟁사 광고 분석) |
| `app/(SmarComm)/smarcomm/my/page.tsx` | 마이페이지 (구독 정보·팀원 관리) |
| `app/api/smarcomm/scan/route.ts` | 스캔 실행 + Wikidata 병렬 fetch |
| `app/api/smarcomm/scan/save/route.ts` | 스캔 결과 Supabase 저장 (domain upsert) |
| `app/api/smarcomm/scan/history/route.ts` | 사용자 스캔 이력 20건 |
| `app/api/smarcomm/plan-check/route.ts` | wio_subscription_plans 기반 플랜 검증 |
| `app/api/smarcomm/report/pdf/route.ts` | PDF 리포트 생성 (renderToBuffer) |
| `app/api/smarcomm/cron/*` | 정기 재진단 + 점수 알림 |
| `lib/smarcomm/index-calculator.ts` | SmarComm Index SSOT (F30% + T30% + C40%) + Wikidata 보너스 |
| `lib/smarcomm/analyzers/backlink-authority.ts` | Moz API v2 + Ahrefs fallback |
| `lib/smarcomm/analyzers/industry-benchmark.ts` | 업종 백분위 계산 |
| `lib/smarcomm/analyzers/wikidata-knowledge-graph.ts` | Wikidata SPARQL P856 검사 |
| `features/smarcomm/DashboardSidebar.tsx` | 사이드바 네비 |
| `features/smarcomm/PageActions.tsx` | PDF/텍스트 다운로드 버튼 (실제 API 연동) |
| `features/smarcomm/SmarCommPlanGate.tsx` | 실제 플랜 게이트 (wio_subscriptions 검증) |
| `features/smarcomm/SmarCommPreviewGate.tsx` | Coming Soon 가림막 (별개 용도) |
| `features/smarcomm/ContextPanel.tsx` | 우측 패널 (필터·기간 선택) |
| `features/smarcomm/GaugeChart.tsx` | 게이지 차트 (목표 달성도) |
| `features/smarcomm/RadarChart.tsx` | 레이더 차트 (경쟁사 비교) |
| `lib/supabase/smarcomm.ts` | DB 클라이언트 (구독·분석 데이터) |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/ums/smarcomm` | 구독자·플랜·분석 데이터 관리 |

---

## 개발 주의사항

### Plan Gate (2026-05-15 분리)

두 게이트 컴포넌트가 공존한다 — **용도가 다르니 혼동 금지**:

- **`SmarCommPlanGate`** (신규, 실 게이트) — `requiredPlan` + `feature` props. `/api/smarcomm/plan-check` 호출 → `wio_subscriptions` + `wio_feature_flags` 검증. Free/Starter/Pro/Business 4단계 PLAN_RANK 비교. 미인증·플랜부족 시 업그레이드 안내(/smarcomm#pricing). **유료 페이지 보호용**.
- **`SmarCommPreviewGate`** — Coming Soon 가림막 + access code 입력. 서비스 전체를 일시 차단할 때 사용. **출시 전 임시 차단용**.

각 유료 페이지 상단에 `<SmarCommPlanGate requiredPlan="pro">...</SmarCommPlanGate>` 형태로 wrap. 모달 메시지: "Pro 플랜 이상에서 사용 가능합니다. [업그레이드]"

### Mock Auth 제거 (2026-05-15)

- `lib/smarcomm/auth.ts` 삭제 완료 — sessionStorage 기반 MASTER_ACCOUNT/가짜 회원가입 시스템
- 모든 인증은 유니버스 SSOT(`@/lib/auth-context` + Supabase) 사용
- 스캔 결과 저장은 `/api/smarcomm/scan/save` 한 곳으로 통일 (Supabase `smarcomm_scan_results`)

### 대시보드 데이터

- 현재 mock 데이터 (Analytics 페이지는 실제 광고 API 연동 예정)
- 차트 라이브러리: Recharts (React 친화적)

### 구독 기능 제한

- **Free**: 대시보드·기본 분석 (제한 있음)
- **Starter**: 경쟁사 스캔 미포함
- **Pro**: 전체 기능
- **Business**: 커스텀 리포트

Feature flags: `wio_feature_flags`에 정의됨 (SmarComm 4플랜 × 7피쳐 = 28개)

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Phase 4 완료 (2026-05-15) — SmarComm Index 6대 보강 모두 통합 |
| **개발 수준** | 진단 페이지 + 3 view mode + Wikidata + 백링크 + 백분위 + Cron + PDF 다운로드 + 실 플랜 게이트 완성 |
| **이월 작업** | `SmarCommPlanGate` 실제 적용(유료 페이지 wrap), PDF view별 분기, Wikidata 등록 가이드 카드 |
| **최근 결정 (2026-05-15)** | Mock auth 완전 제거, 두 Gate 컴포넌트 역할 분리, view mode URL 파라미터 기반 |

## 외부 API 의존성

- **GOOGLE_PAGESPEED_API_KEY** — PageSpeed Insights (성능 측정)
- **ANTHROPIC_API_KEY** — AI 어드바이저, exec summary 생성 (현재 401, 갱신 필요)
- **MOZ_ACCESS_ID + MOZ_SECRET_KEY** — Domain Authority (현재 미발급 → Wikidata fallback 작동)
- **AHREFS_API_KEY** — Moz 백업용 (현재 미발급)
- **Wikidata SPARQL** — 무료, 키 불필요 (query.wikidata.org)

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- WIO 구독 시스템: [docs/WIO_Master_Architecture.md](../../docs/WIO_Master_Architecture.md) § Subscription
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)

# Mindle 브랜드 가이드

> **Mindle** — 트렌드의 홀씨를 찾아, 인사이트로 피워냅니다
> **포지셔닝**: "도구가 아니라 결론을 파는 트렌드 미디어" — Newen·Sometrend가 분석 도구라면 Mindle은 큐레이션된 콘텐츠 미디어.

---

## 0. 정체성 SSOT

| 항목 | 내용 |
|------|------|
| 한 줄 소개 | AI 기반 트렌드 콘텐츠 브랜드 — Whole See 정보를 가장 적극 활용해 독자에게 전달 |
| 슬로건 | "신호에서 인사이트를 피워냅니다" |
| 톤앤매너 | 영감적·데이터 중심·큐레이션. 트렌드 허브. |
| 주 컬러 | 노랑 #F5C518 (포인트) / 인디고 (다크 배경) |
| 디자인 방향 | 트렌드 카드 + 리포트 + 데이터 + 레퍼런스 |
| 주 도메인 | `mindle.tenone.biz` (서브) · 향후 독립 도메인 검토 |

---

## 0-A. 차별 포지셔닝 (Newen·Sometrend 대비)

> 두 회사는 분석 **도구**를 판다. Mindle은 분석 **결론**을 판다. 직접 경쟁이 아니라 보완.

| 영역 | Newen | Sometrend | **Mindle** |
|---|---|---|---|
| 비즈니스 모델 | B2B 엔터프라이즈 (협의가) | B2C·B2B SaaS (Freemium) | **콘텐츠 구독 미디어** |
| 사용자 행동 | 직접 검색·분석 | 직접 검색·분석 | **수동 소비** (뉴스레터·웹) |
| 분석 책임 | 사용자 | 사용자 | **Mindle 편집팀 + AI 에이전트** |
| 가격대 | 협의 (수백만~) | ₩0~₩149k/월 | **₩0 + PRO ₩9.9k** (계획) |
| 차별 자산 | 자체 LLM | 18년 누적 데이터 | **편집 큐레이션 + 정직성 라벨** |

### Mindle만 가질 수 있는 5가지

1. **정직성 라벨** — 모든 카드에 출처·표본·LLM 사용 여부 명시 (SmarComm § ZERO 차용)
2. **편집팀 큐레이션** — 사람이 의미를 만든 결과를 줌 (도구만 주지 않음)
3. **뉴스레터 First** — 이메일로 직접 배달, 안 와도 도착하는 콘텐츠
4. **페르소나별 분리 발행** — 사장님·기획자·기자·마케터 4종 (Sometrend 페르소나 분류의 진화)
5. **Universe 연계** — SmarComm Scan·Badak 모임·HeRo 매칭 자연 CTA

---

## 1. Phase 로드맵 (4 Phase · 약 8~10주)

```
Phase 0: 정직성 회복 + 공개      [✅ 2026-05-26 완료]
Phase 1: 핵심 가치 완성          [2주]
Phase 2: AI 자동화               [2~3주]
Phase 3: 수익화 + B2B            [3~4주]
```

### Phase 0 — 정직성 회복 + 공개 (✅ 완료)

| 작업 | 결과 |
|---|---|
| `/mindle/page.tsx` Server Component 리팩 | DB 1,410건(published 532건) 노출. mock 0건 |
| `/mindle/trends/page.tsx` DB 연동 | 검색·필터·페이지네이션 (query param 기반) |
| `/mindle/trends/[id]/page.tsx` DB 연동 | view_count atomic 증가 + 관련 트렌드 |
| `features/mindle/TrustLabel.tsx` SSOT | 출처·분석일·관련성·agent 명시 컴포넌트 |
| `lib/mindle/trend-data.ts` DB fetch 헬퍼 | fetchPublishedTrends · countPublishedTrends · getCategoryCounts · fetchTrendById · getTrendStatus · CATEGORY_LABEL |
| reports 페이지 mock 5건 제거 | newsletter_issues 실 DB 연동, 발송 0건이면 "준비 중" 안내 |
| data/references 페이지 정직성 배너 | "🚧 Phase 1 도입 예정" / "📚 편집팀 큐레이션" 명시 |
| `ums_sites.mindle.is_open=true` | 외부 공개 시작 |

### Phase 1 — 핵심 가치 완성 (다음 2주 목표)

| 작업 | 산출물 |
|---|---|
| 1-A. Sometrend 5대 분석 모듈 | `mindle_trend_metrics` 테이블 + MentionTrendChart·RelatedKeywordsCloud·SentimentBar·CompareChart·CommunitySnippet 5 컴포넌트 |
| 1-B. 약신호(Weak Signal) 코너 | mindle_trends에 signal_score·mention_growth_pct·percentile_rank 추가 + 일 1회 cron 갱신 + WeakSignalCorner 컴포넌트 |
| 1-C. 페르소나 4종 분리 | `mindle_personas` 테이블 (founder/planner/reporter/marketer) + 페르소나 진입 카드 + newsletter_subscribers.persona_key |
| 1-D. 뉴스레터 발행 자동화 1주차 | Whole See → AI 초안 → 편집팀 검수 → Resend 발송 e2e |

### Phase 2 — AI 자동화 (이후 2~3주)

| 작업 | 산출물 |
|---|---|
| 2-A. Mindle AI Agent | `lib/mindle/agent.ts` + `mindle_raw_items` 테이블 + Edge Function 시간당 크롤 + Claude 자동 카드 생성 |
| 2-B. 페르소나 4종 뉴스레터 cron | `mindle-newsletter-weekly` 매주 월 09:00 자동 초안 4종 생성 |
| 2-C. Action Hub Registry | `mindle_pending_cards` · `mindle_newsletter_drafts` 등록 |
| 2-D. UC + 학생 할인 | `uc_rules` 시드 + 이메일 도메인 자동 추출 |

### Phase 3 — 수익화 + B2B (이후 3~4주)

| 작업 | 산출물 |
|---|---|
| 3-A. PRO 구독 결제 | `wio_subscription_plans` SSOT에 mindle 4 row + Toss 통합 |
| 3-B. 심층 리포트 | `mindle_deep_reports` 테이블 + abstract/full_content 게이팅 + PDF Storage |
| 3-C. 대화형 아카이브 검색 | mindle_trends.embedding(vector) + `/api/mindle/ask` (PRO 전용) |
| 3-D. Universe CTA + 클릭 추적 | SmarComm/Badak/HeRo 자연 전환 + `mindle_cta_clicks` |
| 3-E. B2B Custom Report | `mindle_b2b_orders` + Intra `/intra/marketing/mindle/b2b` |

---

## 2. 접근 모델

- **유형**: 오픈 + 구독 (Freemium)
- **가입 경로**:
  1. 누구나 트렌드 피드 열람 가능 (회원가입 불필요)
  2. 뉴스레터 구독 → 이메일 입력만 (저진입)
  3. PRO 구독 → 회원가입 + Toss 결제 (Phase 3)
- **멤버 권한**: member, subscriber (PRO), analyst (편집팀), admin

### 가격 정책 (Phase 3 적용 예정)

| 플랜 | 가격 | 위치 |
|---|---|---|
| **FREE** | 영구 무료 | 주간 뉴스레터 4종 + 카드 무제한 열람 + 최근 1개월 아카이브 |
| **PRO** | ₩9,900/월 (연 ₩99,000, 17% 할인) | + 약신호 코너 + 심층 리포트 월 1건 + 전체 아카이브 검색 |
| **TEAM** | ₩49,900/월 | + 5인 시트 + 슬랙 통합 + 맞춤 리포트 분기 1건 |
| **ENTERPRISE** | 협의 | + Whole See raw access + API + 화이트라벨 |

**할인 정책 (Sometrend 모방)**: 3개월 무료 체험 + 학생 50% (`.ac.kr` 자동 인증) + 연결제 추가 10%

---

## 3. 프로필 특화

- **특화 테이블**: 없음 (공통 members)
- **고유 필드**: `newsletter_subscribers.persona_key` · `interest_categories[]` · (Phase 3) `subscription_tier`

---

## 4. 권한 체계

- **role 종류**: member · subscriber · analyst · admin
- **context**: `brand:mindle`
- **인트라 관리 권한**: `/intra/marketing/mindle/*`
- **capability**: `community`(전 브랜드 기본) · `subscription`(Phase 3 추가)

---

## 5. UC 정책 특이사항

- **brand_id 지정**: `brand_id = 'mindle'`
- **현재 액션**: `save_report` (월 5회, 무료)
- **Phase 2 추가 후보**:
  - `mindle_signup` → 500 UC (브랜드 onboard)
  - `mindle_newsletter_subscribe` → 200 UC
  - `mindle_share_card` → 50 UC (월 10회)

---

## 6. 핵심 파일

### 페이지 (9종, Server Component 기준)

| 파일 | 역할 | 상태 |
|------|------|------|
| [layout.tsx](mindle/layout.tsx) | generateMetadata | ✅ |
| [mindle/page.tsx](mindle/page.tsx) | 메인 (트렌드 피드, ?cat 필터) | ✅ Server + DB |
| [mindle/trends/page.tsx](mindle/trends/page.tsx) | 트렌드 검색 (?cat·q·view·page) | ✅ Server + DB |
| [mindle/trends/[id]/page.tsx](mindle/trends/[id]/page.tsx) | 상세 + view_count + 관련 | ✅ Server + DB |
| [mindle/reports/page.tsx](mindle/reports/page.tsx) | 주간 리포트 (newsletter_issues) | ✅ Server + DB · 발송 0건이면 "준비 중" |
| [mindle/data/page.tsx](mindle/data/page.tsx) | 데이터 시각화 | ⚠️ mock + 정직성 배너 |
| [mindle/references/page.tsx](mindle/references/page.tsx) | 외부 레퍼런스 큐레이션 | ⚠️ 편집팀 큐레이션 (mock 아님) + 라벨 |
| [mindle/newsletter/page.tsx](mindle/newsletter/page.tsx) | 구독 + 지난 호 | ✅ subscribers DB |
| [mindle/about/page.tsx](mindle/about/page.tsx) | 소개 | 정직성 점검 필요 |
| [mindle/my/page.tsx](mindle/my/page.tsx) | 마이페이지 (MyProfileCard) | 표준 패턴 |
| [mindle/admin/page.tsx](mindle/admin/page.tsx) | 관리 | (Intra 통합 검토) |

### 컴포넌트

| 파일 | 역할 |
|---|---|
| [features/mindle/TrustLabel.tsx](../../features/mindle/TrustLabel.tsx) | **정직성 SSOT** — 출처·분석일·관련성·agent 명시 |

### 라이브러리

| 파일 | 역할 |
|---|---|
| [lib/mindle/trend-data.ts](../../lib/mindle/trend-data.ts) | DB fetch 헬퍼 SSOT — fetchPublishedTrends·countPublishedTrends·getCategoryCounts·fetchTrendById·getTrendStatus·CATEGORY_LABEL |
| [lib/mindle/notify.ts](../../lib/mindle/notify.ts) | 알림 헬퍼 |

### API

| 파일 | 역할 |
|---|---|
| [app/api/mindle/newsletter/route.ts](../../app/api/mindle/newsletter/route.ts) | 뉴스레터 구독 |

---

## 7. DB 테이블

| 테이블 | 역할 | 현재 행수 |
|------|------|---------|
| `mindle_trends` | 트렌드 카드 SSOT | **1,410건** (published **532건**) |
| `mindle_sources` | RSS·웹·API 크롤링 소스 | 55건 (active 49) |
| `newsletter_subscribers` | 구독자 (전 브랜드 공용 테이블) | 전체 79명 / **Mindle source = 0명** (실제 구독자 모집 전) |
| `newsletter_issues` | 뉴스레터 발행 단위 | 9건 (모두 draft, status='sent' = 0건) |
| `crawler_status` | 크롤 실행 로그 | 4회 |

### Phase 1+ 신규 테이블 (예정)

| Phase | 테이블 |
|---|---|
| 1 | `mindle_trend_metrics` · `mindle_personas` · (컬럼) signal_score·mention_growth_pct·percentile_rank·persona_key |
| 2 | `mindle_raw_items` · (컬럼) newsletter_issues.persona_key |
| 3 | `mindle_deep_reports` · `mindle_cta_clicks` · `mindle_b2b_orders` · (컬럼) mindle_trends.embedding(vector) |

---

## 8. Action Hub Entries

향후 등록 후보 (Phase 2):

| key | 라벨 | table · 필터 | href | category | priority |
|---|---|---|---|---|---|
| `mindle_pending_cards` | Mindle 카드 발행 대기 | mindle_trends · status='draft' | /intra/marketing/mindle/queue | moderation | normal |
| `mindle_newsletter_drafts` | Mindle 뉴스레터 초안 | newsletter_issues · status='draft' | /intra/marketing/mindle/issues | approval | high |

---

## 9. 인트라 관리 경로

| 경로 | 역할 | 상태 |
|---|---|---|
| `/intra/marketing/mindle/*` | Mindle 운영 통합 | (Phase 2 신설 예정) |
| `/mindle/admin` | 임시 관리 | 현재 mindle/admin/page.tsx |

---

## 10. 운영 자동화 — 시간 예산

| Phase 완료 시점 | 주간 운영 시간 |
|---|---|
| Phase 0 (현재) | 4시간 (수동 발행) |
| Phase 1 | 3시간 |
| Phase 2 | **1시간** (queue 1-click) |
| Phase 3 | 1.5시간 (PRO 응대 + 심층 리포트 1건) |

→ Phase 2가 ROI 분기점.

---

## 11. 절대 하지 말 것 (Mindle ZERO 원칙)

> SmarComm § ZERO 정직성 원칙을 그대로 차용. **모든 콘텐츠에 출처·표본·LLM 사용 여부 명시 의무**.

- ❌ **하드코딩 mock 트렌드 카드** — mindle_trends DB에 1,410건 있음. 코드에서 직접 mock 생성 금지.
- ❌ **TrustLabel 누락된 카드** — 모든 트렌드 카드(메인/검색/상세)에 출처·날짜·agent 명시 의무.
- ❌ **가짜 통계** ("3,420 조회" 등 임의 숫자) — 실 DB count 또는 노출 금지.
- ❌ **전체 newsletter_subscribers count를 "Mindle 구독자"로 노출** — 반드시 `source='mindle' AND is_active=true` 필터. 세션 152에서 적발된 위반.
- ❌ **발송 안 한 뉴스레터를 "발송됨"으로 표기** — sent_at IS NULL이면 reports 페이지에서 숨김.
- ❌ **"매주 X요일 오전 N시 발송" 약속** — 실제 cron이 구축되기 전까지 "발행 예정" 라벨 의무.
- ❌ **mindle_trends row UPDATE로 status 강제 변경** — published 전 검토 절차 우회 금지.
- ❌ **편집팀 검증 없는 외부 사이트를 references에 추가** — 큐레이션 SSOT 위반.
- ❌ **카테고리 키 임의 추가** — `lib/mindle/trend-data.ts` `CATEGORY_LABEL` SSOT에 먼저 등록.
- ❌ **자체 구독 테이블 생성** — Phase 3 결제는 `wio_subscription_plans` SSOT 재사용 (CLAUDE.md § 1.10 8원칙).
- ❌ **별도 newsletter 인프라 구축** — Resend SMTP + email_events 재사용 (이중 구현 금지).

---

## 12. 현재 상태

| 항목 | 내용 |
|---|---|
| **Phase** | **Phase 0 완료 (2026-05-26)** — 정직성 회복 + 공개 |
| **is_open** | true (외부 공개 시작) |
| **DB 데이터** | mindle_trends 1,410건 (published 532) · 79 구독자 · 49 active sources |
| **차기 작업** | Phase 1 1-A (5대 분석 모듈) 또는 1-B (약신호) — 우선순위 결정 필요 |
| **블로커** | 없음. Phase 1·2·3는 독립 진행 가능. |
| **추가 분석 미완** | 가격 검증 (PRO ₩9,900 실측 검증) · 페르소나 4종 구체화 · B2B 단가 시나리오 (Phase 3 준비) · Whole See ↔ Mindle 통합 그림 |
| **2026-05-26 작업** | Phase 0 완료 (코드 + DB + 토글) · 본 CLAUDE.md 전면 갱신 |

---

## 13. 참고 문서

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- 정직성 원칙: [SmarComm CLAUDE.md § ZERO](../(SmarComm)/CLAUDE.md)
- WIO 모듈 (Crawler + Content Pipeline): [docs/WIO_Master_Architecture.md](../../docs/WIO_Master_Architecture.md)
- 벤치마킹 분석 (Newen + Sometrend): 2026-05-26 세션 분석 결과 (필요 시 docs/Mindle_Benchmarking.md로 보관 검토)

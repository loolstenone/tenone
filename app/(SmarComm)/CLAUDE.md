# SmarComm 브랜드 가이드

> ## 🔴 절대 원칙 ZERO — 정직성(Honesty)이 무엇보다 중요하다
>
> **SmarComm의 모든 요소는 정직해야 한다.** 점수·지표·라벨·차트·텍스트·UI 모두 예외 없음. 다른 모든 원칙·기능·UX 결정에 앞선다.
>
> 정직성 위반 = **SmarComm 핵심 가치 위반**. 다음 중 하나라도 발견되면 **즉시 수정 의무**:
> - 임의 휴리스틱으로 점수·라벨 생성 (키워드 사전·정규식·임계값 분기로 의미 분석)
> - 진짜 측정 없이 "AI 분석"으로 표시
> - LLM 미가용 시 가짜 fallback 응답
> - 차트·메트릭에 출처·산식 명시 없음
> - 데이터가 어디서 오는지(자동·사용자 입력·Phase X 예정) 명시 없음
> - To-Be 목표값을 "정답"으로 노출 (기본값임을 명시 안 함)
> - DB 테이블만 있고 데이터 입력 경로 부재
> - Mock 데이터를 실측인 듯 노출
>
> 정직성 회복은 우선순위 1. UX·디자인·성능·일관성보다 먼저. 정직하지 못한 기능은 차라리 **N/A 표시** 또는 **삭제**가 정답.
>
> 참고: 정직성 1~6차 회복 이력은 [CHANGELOG.md](../../CHANGELOG.md) 참조.

> **SmarComm = Marketing OS** — 마케팅의 모든 작업 흐름(진단·분석·전략·제작·집행·모니터링·자산화)을 하나의 운영체제로 묶는다. **V2.0부터 데이터 플라이휠(Smart-Loop) 중심.**
>
> **WIO ↔ SmarComm은 동등한 OS다.** 종속 관계가 아니라 **공유 인프라 위의 동등한 OS 두 개**. WIO가 일반 업무 OS라면, SmarComm은 마케팅 전용 OS다.
>
> **V2.0 잠금 (2026-05-15)**: 이전 V1 어휘 "진단·전략·제작·집행·관계·분석·운영"은 폐기. V2.0 7단계로 통일. § 3 본문 참조.

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

## 3. Marketing OS 7단계 (V2.0 SSOT — Smart-Loop)

> **V2.0 SSOT (2026-05-15 확정).** 이전 V1 "진단·전략·제작·집행·관계·분석·운영"은 폐기.
> V2.0은 **데이터 플라이휠(Smart-Loop)** 중심 — 모든 캠페인은 "자산화"로 끝나 다음 사이클의 진단 인풋이 된다.
> 모든 SmarComm 페이지는 이 7단계 중 하나에 속한다.

### V2.0 7단계 SSOT

| # | 단계 | 서비스명 | 핵심 질문 | 핵심 활동 (2026 Add-on) |
|---|---|---|---|---|
| ① | **진단** | **Smart-Audit** | "지금 우리는 어디에 있나" | 네이버·구글·쿠팡·AI 4대 플랫폼 통합 진단 (SEO·GEO·AICI·E-E-A-T) |
| ② | **분석** | **Data Intelligence** | "데이터가 무엇을 말하나" | 검색 트렌드 + AI 인용지수(AICI) + 경쟁사·업종 백분위 분석 |
| ③ | **전략** | **Omni-Strategy** | "어디로 가야 하나" | Entity 브랜딩 방향 + 플랫폼별 믹스 + 메시지·페르소나 |
| ④ | **제작** | **Smart-Studio** | "무엇을 만들 것인가" | 사람용 UX + AI용 구조화 콘텐츠(Schema·FAQ·llms.txt) 동시 제작 |
| ⑤ | **집행** | **Performance Plus** | "어디에 어떻게 뿌릴 것인가" | 유료 광고 + **AI 학습 유도(공신력 매체 배포·인용 유발)** |
| ⑥ | **모니터링** | **Real-time Tracker** | "지금 무슨 일이 일어나나" | 클릭·전환 + **AI 답변 변화 실시간 추적** + 평판 sentiment |
| ⑦ | **자산화** | **Brand Assetizing** | "이 캠페인이 영구 자산으로 남는가" | 캠페인 산출물을 검색·AI가 평생 참조할 Entity로 영속화 |

### Smart-Loop — 데이터 플라이휠 시각화

```
                ① 진단 (Smart-Audit)
              ↗                    ↘
     ⑦ 자산화                       ② 분석
     (Brand Assetizing)              (Data Intelligence)
              ↑                       ↓
     ⑥ 모니터링                       ③ 전략
     (Real-time Tracker)              (Omni-Strategy)
              ↖                    ↙
                ⑤ 집행 ← ④ 제작
                (Performance Plus)  (Smart-Studio)
```

**핵심 원칙 — Data Flywheel**: "지난 캠페인의 모니터링 데이터가 다음 캠페인의 진단 데이터로 완벽하게 치환될 때" SmarComm은 가장 강력해진다. **⑥→⑦→①의 매끄러운 연결**이 SmarComm의 해자(moat). 이 연결이 끊긴 채로 페이지·기능을 만들면 V1으로 회귀.

### V2.0 보완 3대 축 (서비스 차별점)

| # | 축 | 핵심 질문 | 결합 단계 | 모듈 SSOT |
|---|---|---|---|---|
| ① | **디지털 자산화** (Entity Branding) | "캠페인이 끝나도 AI는 우리 브랜드를 추천할 데이터를 가졌나?" | ⑦ 자산화 | § 3-D |
| ② | **AI 평판 방어 (AIRM)** | "AI가 우리에 대해 거짓말할 때, 즉시 대응할 시스템이 있나?" | ⑥ + ⑦ | § 3-C |
| ③ | **CRO & CRM** | "트래픽은 늘었는데 매출이 안 오는 이유는?" | ⑤ + ⑥ | (Phase 5 예정) |

### V1 → V2.0 흡수 매핑

V1의 5개 영역(관계·분석·운영 등)은 V2.0 단계에 흡수된다.

| V1 영역 | V2.0 흡수 | 사유 |
|---|---|---|
| 관계 (CRM·이메일·카카오·푸시) | ⑤ 집행의 채널 | CRM은 마케팅 채널의 하위 — 별도 단계가 아님 |
| 분석 (funnel·cohort·abtest 등) | ⑥ 모니터링의 측정 도구 | 측정은 모니터링의 일부 |
| 분석 일부 (data-reports·reports) | ② 분석 | 회고가 아닌 forward-looking 인사이트 |
| 운영 (workflow·kanban·pipeline) | 7단계를 묶는 운영 위계 (별도 단계 아님) | Smart-Loop 자체가 운영 |

### 페이지 매핑 (V1 → V2.0 전환 진행 중)

| V2.0 단계 | 현 페이지 | 신설 예정 |
|---|---|---|
| ① 진단 | `/dashboard/scan` · `/dashboard/geo` · `/dashboard/geo/{competitors,brand,tracking,prompts}` | — |
| ② 분석 | `/dashboard/data-reports` · `/dashboard/reports` | `/dashboard/insights` (AICI·트렌드 통합) |
| ③ 전략 | `/dashboard/advisor` | — |
| ④ 제작 | `/dashboard/creative` · `/dashboard/content` · `/dashboard/archive` | — |
| ⑤ 집행 | `/dashboard/campaigns` · `/dashboard/calendar` · `/dashboard/crm/*` · `/dashboard/workflow/automation` | — |
| ⑥ 모니터링 | `/dashboard/funnel` · `/dashboard/traffic` · `/dashboard/analytics` · `/dashboard/cohort` · `/dashboard/abtest` · `/dashboard/journey` · `/dashboard/events` | `/dashboard/ai-tracker` (AI 답변 변화 실시간) |
| ⑦ 자산화 | — | `/dashboard/assets` (Entity 자산 등록·외부 배포 추적) |
| 운영 위계 | `/dashboard/workflow` · `/dashboard/workflow/{projects,kanban,pipeline,automation}` | — |

> 새 페이지를 만들 때 **반드시 V2.0 7단계 중 하나로 분류**. 어디에도 안 맞으면 7단계 자체를 갱신할지 검토.
> 사이드바 메뉴 `MENU_SECTIONS` (DashboardSidebar.tsx) 그룹 라벨도 V2.0 어휘로 점진 교체 예정.

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

### SSOT-6. AI 브랜드 가시성 4지표 + 6 측정 차원 (V2.0 → V2.1 정직성 회복)

> Citability 40%는 단일 점수가 아니라 **4지표 × 6차원**으로 분해된다. 점수의 의미를 클라이언트에게 입체적으로 설명하기 위함.
> SSOT 구현 위치: `lib/smarcomm/ai-probes/` + `lib/smarcomm/index-calculator.ts`의 `citability` 계산 블록.
>
> **V2.1 정직성 회복 (2026-05-15)**: Sentiment·Reasoning·Attribute는 **Claude Haiku 4.5 LLM 분류기**(`lib/smarcomm/sentiment-llm.ts`)로 실측. 휴리스틱(`lib/smarcomm/sentiment.ts`) **폐기 + 파일 삭제**. ANTHROPIC_API_KEY 미설정 시 N/A로 표시 (점수 산입 제외) — § 1.10 정직 원칙 + 권위도(Authoritativeness)와 동일 정책.

#### 4지표 (AI 브랜드 성적표)

| 지표 | 영문 | 측정 | 산식 |
|---|---|---|---|
| **인지 (Awareness)** | Mention Frequency | 100회 질문 중 브랜드가 N회 언급되는가 | 언급된 질문 수 / 전체 질문 수 |
| **이해 (Depth)** | Attribute Accuracy | AI가 우리 브랜드의 핵심 속성을 정확히 묘사하는가 | (자사 사실 ∩ AI 사실) / 자사 사실 — fact-extractor 자카드 |
| **추천 (Trust)** | Recommendation Rank | 카테고리 추천 시 N위에 등장하는가 (TOP 3 / TOP 5 / OUT) | 평균 추천 순위 (낮을수록 좋음) |
| **평판 (Sentiment)** | Positive Ratio | 긍정 답변 비율 (긍정·중립·부정) | 긍정 답변 수 / 전체 답변 수 |

#### 6 측정 차원 (probe별 메트릭)

5 AI 플랫폼 × 7카테고리 × 13질문에서 추출되는 6 차원.

| # | 차원 | 영문 | 설명 | 산출 |
|---|---|---|---|---|
| 1 | **개체 인지도** | Entity Presence | "X는 무엇인가?" 정의 가능 여부 | Brand Direct 카테고리 응답에서 엔티티 명확성 ✓⚠⛔ |
| 2 | **속성 결합도** | Attribute Association | 브랜드 검색 시 동반 형용사 (혁신·가성비·신뢰 등) | AI 응답에서 형용사 추출 → 의도 키워드 매칭 % |
| 3 | **지식 최신성** | Knowledge Recency | 최근 행보(신제품·수상 등)를 검색 없이 알고 있는가 | "지난 6개월 이내 사실" 인식률 |
| 4 | **추천 순위** | Recommendation Ranking | 카테고리 추천 시 위치 | "X사 N위" 파싱 — 평균/중앙값 |
| 5 | **추천 근거** | Reasoning | 추천 시 든 이유 (리뷰·기술력·가격 등) | AI 응답에서 reason 추출 → 카테고리 분류 |
| 6 | **비교 우위** | Comparative Analysis | 경쟁사 비교 시 강점/약점 | Competitor Comparison 카테고리 응답 sentiment + reason |

#### As-Is / To-Be 성적표 (보고서 신규 섹션)

진단 결과를 다음 형식으로 노출 — 클라이언트가 "지금 어디 있고 어디로 가야 하는지" 30초에 파악.

| 구분 | 측정 지표 | 현 상태 (As-Is) | 목표 (To-Be) | 권장 액션 |
|---|---|---|---|---|
| 인지 (Awareness) | AI 언급 빈도 | 100회 중 N회 | 100회 중 30회 | § 3-D 자산화·§ 3-C AIRM |
| 이해 (Depth) | 핵심 키워드 일치율 | 60% / 40% | 90% | § 3-D Entity Branding (Schema·FAQ) |
| 추천 (Trust) | 추천 리스트 포함 | 5위권 밖 | TOP 3 이내 | § 3-D 고권위 소스 주입 |
| 평판 (Sentiment) | 긍정 답변 비율 | 45% | 85% | § 3-C AIRM (오정보 교정) |

> 보고서 UI 구현 위치: `app/(SmarComm)/smarcomm/report/[id]/page.tsx` — "AI Brand Journey" 신규 섹션. § 3-A SSOT-5의 마케터 뷰 기본 노출.

---

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

### SSOT-7. V2.1 진단 5 Sub-Engine + 퍼널 (2026-05-15 확장)

> **결정**: V2.0 상위 가중치 30/30/40(Findability·Trust·Citability)은 그대로 유지하되, ① 진단 단계 내부를 **5 sub-engine**으로 세분화한다. 각 sub-engine은 V2.0 상위 축에 매핑된다.
>
> 새 가중치 모델(Awareness/Search/UX/Security 20/20/30/30)을 도입하면 기존 진단 점수와 비교 불가 → **V2.0 상위 모델 유지** 결정 (2026-05-15).

#### 5 Sub-Engine 정의

| # | Sub-Engine | 별칭 | 측정 목표 | V2.0 상위 매핑 |
|---|---|---|---|---|
| ① | **Discovery Engine** | GEO & SEO | 사용자/AI가 우리를 어떻게 발견하는가 | Findability(주) + Citability(GEO) |
| ② | **Conversion Engine** | UI & UX | 발견된 사용자가 매끄럽게 목표 달성 | Findability + Trust |
| ③ | **Trust Engine** | Security | 보이지 않는 신뢰 기반 | Trust (E-E-A-T Trustworthiness) |
| ④ | **Reputation Engine** | SNS·커뮤니티 | 시장의 목소리 | Trust(외부 신호) + Citability(인용) |
| ⑤ | **Shopping Engine** | 커머스 접점 | 실제 구매 접점 디테일 | Citability(상거래 검색) |
| ⑥ | **Funnel** | 통합 재구성 | 인지→탐색→결정→전환→충성 단계별 분석 | 1~5 데이터를 단계별 재구성 |

#### Sub-Engine ① Discovery (GEO & SEO)

| 측정 | V2.0 측정 여부 | V2.1 신규 추가 |
|---|---|---|
| AI SOV (Share of Voice) — 모델별 카테고리 쿼리 언급 빈도 | △ (5 플랫폼 mentioned 단순 비율) | ✅ 카테고리×모델 매트릭스, SOV % 산출 |
| 인용 출처 맵핑 (Source Mapping) | ❌ | ✅ AI 응답에서 "출처" 단편 추출 → 신뢰 소스 분류 (뉴스/위키/공식 블로그) |
| 할루시네이션 진단 | △ (factComparison wrong) | ✅ 가격·위치·스펙 등 사실 카테고리별 분리 + AIRM § 3-C 연동 |
| 기술 SEO (Crawl Budget·CWV·HTTPS) | ✅ 14 카드 | — |
| 검색 의도 정렬 (Intent Matching) | ❌ | ✅ 페이지 콘텐츠 vs 사용자 의도(정보/구매/비교) 분류 |
| 지식 그래프 등록 (JSON-LD) | ✅ Schema 검증기 | + 구글/네이버 Knowledge Panel 매칭 확인 |

#### Sub-Engine ② Conversion (UI & UX)

| 측정 | 분리 |
|---|---|
| **3초 테스트 (3-Second Rule)** | 비로그인 — 페이지 진입 후 3초 내 USP 이해도 |
| **전환 마찰 분석** | 비로그인 — CTA까지 스크롤 깊이·방해 요소 |
| **모바일 가독성** | 텍스트 크기·버튼 간격·이미지 최적화 |
| **온보딩 효율성 (TSR)** | 로그인 — 첫 기능 성공률 (Task Success Rate) |
| **기능 복잡도** | 로그인 — 대시보드 정보 밀도 (인지 과부하) |
| **개인화 대시보드** | 로그인 — 사용자 활동 기반 맞춤 시각화 |

> 비로그인(Public·인지·설득) vs 로그인(Private·리텐션·효용) **두 모드 분리 측정**이 V2.1 핵심.

#### Sub-Engine ③ Trust (Security)

| 측정 | V2.0 | V2.1 신규 |
|---|---|---|
| 인증/인가 보안 (소셜 토큰·세션 탈취·비밀번호 정책) | ❌ | ✅ 표면 검사 (HTTPS·헤더는 V2.0 있음) |
| 데이터 거버넌스 (GDPR/PIPA 동의 절차) | ❌ | ✅ 동의 화면·정책 페이지 검출 |
| 취약점 스캔 (SQLi/XSS) | ❌ | ✅ Phase 5 (OWASP ZAP 또는 snyk 연동) |
| 보안 헤더 (Mozilla Observatory) | ✅ | — |

#### Sub-Engine ④ Reputation (SNS·커뮤니티)

| 측정 |
|---|
| 감성 점수 (Sentiment Score) — 브랜드 언급 데이터 긍정/부정/중립 + 경쟁사 대비 |
| 연관 키워드 클라우드 — 동반 언급 단어가 의도한 브랜드 전략과 일치하는가 |
| 인플루언서 점유율 — 카테고리 내 오피니언 리더의 우리 언급 비중 |

> 데이터 소스: Phase 5 외부 크롤러 (Twitter/X·인스타·블로그·커뮤니티 API). 현재 V2.0의 sentiment 휴리스틱은 AI 응답 내부에서만 작동 → 외부 채널은 미커버.

#### Sub-Engine ⑤ Shopping (커머스 접점)

| 측정 |
|---|
| 에셋 일관성 — 네이버 스마트스토어·쿠팡·자사몰 상세페이지 이미지·메시지 통일성 |
| 키워드 점유율 — 쇼핑 탭 검색의 광고 외 유기적(Organic) 상단 노출 비중 |
| 리뷰 시맨틱 — 페인 포인트(Pain Point) 추출 + 구매 동기 분석 |

> 데이터 소스: 네이버 쇼핑·쿠팡 API + 리뷰 NLP. Phase 5.

#### Sub-Engine ⑥ Funnel (인지·탐색·결정·전환·충성)

V2.0의 모든 측정값을 5단계로 재구성:

```
인지 (Awareness)   → Discovery ① AI SOV + 인지 키워드 점유율
   ↓
탐색 (Exploration) → Conversion ② 3초 테스트 + 정보형 검색 매칭
   ↓
결정 (Decision)    → Reputation ④ 감성 + Shopping ⑤ 리뷰 신호
   ↓
전환 (Action)      → Conversion ② 전환 마찰 + 온보딩 TSR
   ↓
충성 (Loyalty)     → Reputation ④ 인플루언서 + 재구매 시그널 (CRM 데이터)
```

#### Smar-Index(SI) — V2.1 연구 과제용 보조 지표

> 사용자 비전에서 제시된 공식. **SmarComm Index와 별도**로 운영. 보고서에는 둘 다 노출(SmarComm Index가 주, Smar-Index가 보조).

```
Smar-Index(SI) = (Awareness × 0.2 + Search × 0.2 + UX × 0.3 + Security × 0.3) / Industry_Avg
```

| 변수 | 산출 |
|---|---|
| Awareness | Sub-Engine ① Discovery의 GEO 부분 (AI SOV) |
| Search | Sub-Engine ① Discovery의 SEO 부분 (기술+의도+그래프) |
| UX | Sub-Engine ② Conversion 종합 |
| Security | Sub-Engine ③ Trust 종합 |
| Industry_Avg | `smarcomm_industry_benchmarks` (Phase 4 도입) |

> Smar-Index는 **상대적 위치**(Industry 평균 대비)를 보여주는 보조 지표. SmarComm Index(절대 점수)와 함께 표시.

#### V2.1 신규 측정 차원 매핑 (구현 우선순위)

| 차원 | Sub-Engine | 데이터 소스 | 우선순위 | Phase |
|---|---|---|---|---|
| AI SOV 매트릭스 | ① | 기존 AI Probe 재집계 | 🔴 High | Phase 4 |
| 인용 출처 맵핑 | ① | probe rawResponse NLP | 🔴 High | Phase 4 |
| 할루시네이션 분리 | ① | 기존 factComparison 확장 | 🔴 High | Phase 4 |
| 검색 의도 정렬 | ① | LLM 페이지 분류 | 🟡 Med | Phase 5 |
| 3초 테스트 | ② | LLM 페이지 분석 (Hero 위주) | 🟡 Med | Phase 5 |
| 전환 마찰 | ② | UI 자동 분석 (Above-fold·CTA 위치) | 🟡 Med | Phase 5 |
| 모바일 가독성 | ② | Lighthouse a11y/font-size | 🟢 Low | Phase 4 |
| 인증/인가 표면 검사 | ③ | HTTPS·CSP·세션 쿠키 | 🟡 Med | Phase 5 |
| 데이터 거버넌스 | ③ | 동의 페이지 키워드 검출 | 🟢 Low | Phase 5 |
| 취약점 스캔 | ③ | 외부 도구(ZAP/snyk) | 🟡 Med | Phase 6 |
| 감성 점수 (외부) | ④ | SNS 크롤러 API | 🔴 High | Phase 5 |
| 키워드 클라우드 | ④ | NLP from SNS | 🟡 Med | Phase 5 |
| 인플루언서 점유율 | ④ | 인플루언서 DB API | 🟢 Low | Phase 6 |
| 에셋 일관성 | ⑤ | 네이버/쿠팡 크롤 | 🔴 High | Phase 5 |
| 쇼핑 키워드 점유율 | ⑤ | 네이버 쇼핑 API | 🟡 Med | Phase 5 |
| 리뷰 시맨틱 | ⑤ | 리뷰 NLP | 🟡 Med | Phase 5 |

#### 차별화 연구 과제 (V2.1+)

1. **AI 리터러시 진단** — "AI가 우리 브랜드를 추천하지 않는 이유가 데이터 부족(Awareness) 때문인가, 정보의 부정확성(Depth) 때문인가?" 판별 알고리즘
   - 입력: 모든 probe 응답 + Discovery·Reputation·Shopping 데이터
   - 출력: 결핍 분류 (volume·accuracy·sentiment·authority) + 권장 액션
2. **쇼핑 모멘텀 시차 분석** — 리뷰 긍정 수치 → 매출 상승 시차(Time-lag) 모델
   - 입력: 시계열 리뷰 sentiment + 매출 데이터
   - 출력: 평균 lag(주) + 회귀 계수

#### 구축 방법론 (SmarComm Framework — V2.1)

```
1. Data Ingestion
   - API: Search Console · GA4 · SNS · AI 엔진
   - 로그: 사이트 내부 사용자 행동 (Hotjar 등)

2. Scoring Engine
   - 각 sub-engine 가중치 → 정량 점수
   - smarcomm_industry_benchmarks와 비교 → 상대적 위치

3. Visual Reporting
   - 브랜드 건강도 지도 (5 sub-engine 레이더 + 퍼널 깔때기)
   - "왜 이 점수가 나왔는가?" AI 기반 원인 분석 자동 생성
```

> V2.1 진단 sub-engine 도입 시 **신규 DB 테이블 도입 최소화** — `smarcomm_scans.breakdown` JSONB에 sub-engine별 score·detail 누적. 큰 데이터(Reputation 시계열·Shopping 크롤)만 별도 테이블.

---

## 3-B. Smart-Data Hub SSOT (데이터 플라이휠 인프라)

> **원칙**: SmarComm의 해자는 "지난 캠페인의 모니터링 데이터가 다음 캠페인의 진단 데이터로 완벽하게 치환되는 것". 이 치환을 가능하게 만드는 **단일 데이터 허브**가 Smart-Data Hub.
> 광고 성과 · AI 답변 변화 · 유입 로그 · 진단 결과 — 4 소스를 하나의 통합 대시보드에 모은다. 이게 없으면 클라이언트는 SmarComm을 떠난다.

### 데이터 4 소스 통합 모델

| 소스 | DB 위치 | 수집 빈도 | 사용 단계 |
|---|---|---|---|
| **진단 결과** | `smarcomm_scans` · `smarcomm_scan_pages` · `smarcomm_ai_probes` | 사용자 트리거 + 정기 재진단 (주간 Cron) | ① 진단 → ② 분석 |
| **광고 성과** | `wio_campaigns` + 외부 API (네이버·구글·메타·카카오) | 일간 sync | ⑤ 집행 → ⑥ 모니터링 |
| **AI 답변 변화** | `smarcomm_ai_probes` 시계열 | 정기 재진단 (주간) | ⑥ 모니터링 → ⑦ 자산화 |
| **유입 로그** | GA4 · 자체 이벤트 (`wio_events`) | 실시간 | ⑥ 모니터링 |

### Smart-Data Hub 페이지 SSOT (신설 예정)

| 페이지 | 역할 | Phase |
|---|---|---|
| `/dashboard` (홈 — 기존) | 4 소스 핵심 KPI 통합 위젯 (재정의 필요) | Phase 4 |
| `/dashboard/insights` (신설) | ② 분석 단계의 데이터 인사이트 ("AICI 트렌드" "키워드 변화" "경쟁사 갭") | Phase 4 |
| `/dashboard/ai-tracker` (신설) | ⑥ 모니터링의 AI 답변 변화 실시간 — 4지표 추이 차트 | Phase 4 |
| `/dashboard/assets` (신설) | ⑦ 자산화의 Entity 자산 목록 + 외부 배포 추적 | Phase 5 |

### Smart-Loop 데이터 흐름 (구현 의무)

```
① 진단  → smarcomm_scans (저장)
② 분석  → smarcomm_scans + wio_campaigns + wio_events 조인 → 인사이트 추출
③ 전략  → advisor 입력으로 ②의 인사이트 자동 주입
④ 제작  → ③의 전략 prompt → creative 자동 생성
⑤ 집행  → wio_campaigns 생성 + 외부 광고 매체 push
⑥ 모니터링 → 외부 광고 매체 pull + ai-tracker 정기 재진단
⑦ 자산화 → 캠페인 종료 시 ⑥ 데이터 + 산출물을 smarcomm_brand_assets로 영속화
   ↓
다음 ①의 baseline = ⑦에 저장된 brand_assets + 직전 ⑥의 ai_probes 시계열
```

> **구현 규약**: 새 페이지·API는 4 소스 중 **최소 2개를 조인**해야 한다. 단일 소스만 보면 dashboard-data.ts mock 같은 회고적 보고서로 끝남.

### 신설 예정 DB 테이블

| 테이블 | 역할 | Phase |
|---|---|---|
| `smarcomm_data_hub_widgets` | 사용자별 대시보드 위젯 배치 | Phase 4 |
| `smarcomm_brand_assets` | ⑦ 자산화 결과 영속 저장 (§ 3-D 참조) | Phase 5 |
| `smarcomm_ai_tracking_jobs` | 정기 재진단 스케줄 | Phase 4 |
| `smarcomm_ai_diff_events` | AI 답변 변화 이벤트 (점수·답변 텍스트·sentiment 변화) | Phase 4 |

---

## 3-C. AIRM SSOT (AI Reputation Management)

> **원칙**: AI가 우리 브랜드에 대해 거짓말·부정·경쟁사 혼동 답변을 할 때, **발견 → 분석 → 교정 → 검증** 4단계 워크플로우로 즉시 대응한다.
> SmarComm의 **유료 핵심 모듈** — Pro/Enterprise 플랜 차별점.

### AIRM 4단계 워크플로우

```
① 발견 (Detection)        ② 분석 (Diagnosis)       ③ 교정 (Cleansing)        ④ 검증 (Verification)
정기 재진단에서          오정보 출처 추적         고권위 소스에            재진단으로 답변
부정/오답/혼동 자동      (어떤 학습 데이터에서?)  올바른 정보 확산         변경 확인
플래그
```

### 4단계별 메트릭·테이블·자동화

| # | 단계 | 메트릭 | 테이블 | 자동화 |
|---|---|---|---|---|
| ① 발견 | sentiment·factual·confusion 3축 자동 분류 | `smarcomm_ai_flags` | 정기 재진단 시 음수 sentiment / wrong fact / competitor mention 자동 INSERT |
| ② 분석 | 오정보 원본 추적 (검색 결과·인용 사이트 분석) | `smarcomm_ai_flag_sources` | 외부 검색 API로 "AI가 학습했을 가능성이 높은 페이지" Top N |
| ③ 교정 | 액션 큐 (위키피디아·보도자료·매체 인터뷰·구조화 데이터) | `smarcomm_airm_actions` | role별 자동 할당 (writer·marketer·dev) |
| ④ 검증 | 30일 후 자동 재진단 → diff 비교 | `smarcomm_ai_diff_events` | 답변 변화 자동 알림 |

### 신규 페이지 SSOT (Phase 5)

| 페이지 | 역할 |
|---|---|
| `/dashboard/airm` | AIRM 허브 — 발견된 플래그 + 진행 중 액션 + 검증 대기 |
| `/dashboard/airm/flags` | 발견된 부정·오답·혼동 답변 목록 |
| `/dashboard/airm/actions` | 교정 액션 큐 (role별 할당) |
| `/dashboard/airm/timeline` | 답변 변화 타임라인 (As-Is → To-Be 시각화) |

### 유료 모델

- **AIRM 기본**: Pro 플랜 포함 — 자동 플래그 + 액션 큐 (사용자가 직접 교정)
- **AIRM 프리미엄**: Enterprise 플랜 — 교정 액션 SmarComm 팀이 대행 (위키피디아·매체 인터뷰 등)
- **AIRM 단건**: 컨설팅 — `smarcomm_consulting_inquiries` 경유

> **금지 패턴**: AIRM 발견(①) 단계에서 끝나면 의미 없음. 반드시 ③ 교정 액션이 큐에 들어가야 모듈 완성. 발견만 보여주는 "AIRM Lite"는 만들지 않는다.

---

## 3-D. 자산화 SSOT (Brand Assetizing — Entity Branding)

> **원칙**: 모든 캠페인은 일회성이 아니라 **영구 자산**으로 끝난다. 캠페인 종료 후에도 AI·검색이 평생 참조할 디지털 흔적을 남긴다.
> SmarComm의 **장기 가치** — 클라이언트가 1년 후에도 "그때 그 캠페인"의 효과를 느낀다.

### 자산화 3대 노력 (V2.0)

| # | 노력 | 핵심 활동 | 산출 |
|---|---|---|---|
| ① | **디지털 흔적 정화** (Data Cleaning) | 오래된 보도자료·잘못된 정보·부정 게시글 관리 | `smarcomm_airm_actions` — AIRM과 연동 |
| ② | **고권위 소스 주입** (High-Authority Feeding) | 위키피디아·권위 뉴스·학술 백서·정부 자료 등재 | `smarcomm_brand_assets` (type='external_authority') |
| ③ | **엔티티 브랜딩** (Entity Branding) | 구조화 데이터(JSON-LD) — Organization·Service·Person·Product 영속화 | `smarcomm_brand_assets` (type='entity_schema') |

### Entity 자산 5종 (Schema.org)

| Entity Type | 의미 | SmarComm 자동 생성 |
|---|---|---|
| **Organization** | 회사 본질 (이름·소속·연락처·SameAs) | ✅ Phase 3 (schema-generator.ts) |
| **Service** | 서비스 카탈로그 | ✅ Phase 3 |
| **Person** | 핵심 인물·전문가 프로필 | Phase 5 |
| **Product** | 개별 제품 | Phase 5 |
| **FAQPage / HowTo** | 질문·튜토리얼 | ✅ Phase 3 |

### 자산화 페이지 SSOT (신설 — Phase 5)

| 페이지 | 역할 |
|---|---|
| `/dashboard/assets` | Entity 자산 카탈로그 (회사 · 서비스 · 인물 · 제품) — 영구 URL 부여 |
| `/dashboard/assets/[id]` | 개별 Entity 상세 (JSON-LD 미리보기 + 외부 배포 상태) |
| `/dashboard/assets/distribution` | 외부 배포 추적 (위키피디아·뉴스·매체별 등재 현황) |
| `/dashboard/assets/score` | 디지털 흔적 점수 (Entity 영구성 지표) |

### 신설 예정 DB 테이블

| 테이블 | 역할 |
|---|---|
| `smarcomm_brand_assets` | Entity별 영구 자산 (type, schema_jsonld, valid_from, distribution_status) |
| `smarcomm_asset_distributions` | 외부 매체별 배포 이력 (위키피디아 · 뉴스 매체 · 학술) |
| `smarcomm_asset_citations` | AI가 우리 Entity를 인용한 이력 (어디서·언제·정확도) |

### 캠페인 ↔ 자산화 연결 의무

⑤ 집행 단계 종료 시 다음을 자동 실행:

1. 캠페인 산출물(콘텐츠·소재)을 → `smarcomm_brand_assets` row INSERT
2. JSON-LD 자동 생성 → 사이트 상단 `<head>` 삽입 권장 (역할: dev)
3. 외부 배포 액션 큐 → `smarcomm_asset_distributions` (위키피디아·매체 등재 시도)
4. 30·90·365일 후 AI 답변에서 우리 Entity 인용률 추적 → `smarcomm_asset_citations`

> **구현 규약**: ⑤ 집행 페이지에서 캠페인 종료 버튼 클릭 시 자산화 자동 트리거. "캠페인 종료 = 끝"이 아니라 "캠페인 종료 = 자산화 시작"이 V2.0의 핵심 행동 변화.

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

> CLAUDE.md § 1.9.1 SSOT — `lib/action-hub-registry.ts` 등록 항목.

| key | 라벨 | 테이블 · 필터 | href | category | priority |
|---|---|---|---|---|---|
| `smarcomm_airm_open_flags` | SmarComm AIRM 신규 플래그 | `smarcomm_ai_flags` · `status='open'` | `/intra/ums/smarcomm` | moderation | high |
| `smarcomm_airm_todo_actions` | SmarComm AIRM 교정 액션 대기 | `smarcomm_airm_actions` · `status='todo'` | `/intra/ums/smarcomm` | moderation | normal |

> AIRM 자동 발견된 부정/오답/혼동 답변과 교정 액션 큐를 Dashboard Action Hub에서 추적. § 3-C 워크플로우와 연동.

향후 등록 후보:
- 무료 진단 의뢰 (비회원 → CS 응대) — table `smarcomm_scan_inquiries` (예정)
- AI 어드바이저 컨설팅 신청 (Enterprise 문의) — table `smarcomm_consulting_inquiries` (예정)
- AIRM critical 플래그 (`severity='critical'`) — `/intra/ums/smarcomm/airm` 페이지 신설 후 priority=critical로 등록

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
| ~~auth.ts~~ | **삭제 완료** (2026-05-15 세션 136) — Mock 인증 제거, `useAuth()` SSOT로 통일 |

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
- ❌ **V1 어휘 사용** — "관계·분석·운영"을 영역명으로 신규 사용 금지. V2.0 7단계(진단·분석·전략·제작·집행·모니터링·자산화) 어휘만 사용. 기존 코드는 점진 교체.
- ❌ **V2.0 7단계 외 메뉴 추가** — 새 메뉴는 반드시 7단계 중 하나로 분류. 어디에도 안 맞으면 § 3 SSOT를 갱신할지 검토 (개별 메뉴를 분류 외부로 두지 말 것).
- ❌ **자산화 빠진 캠페인 종료** — § 3-D 규약 위반. ⑤ 집행 종료 시 `smarcomm_brand_assets` INSERT + JSON-LD 생성 + 배포 큐 자동 트리거 필수.
- ❌ **AIRM 발견만 구현하고 교정 액션 큐 누락** — § 3-C 금지. ① 발견 → ③ 교정까지 한 흐름으로 만들어야 모듈 완성.
- ❌ **Smart-Data Hub 4 소스 단일 의존** — 새 분석 페이지는 4 소스(진단·광고성과·AI답변·유입로그) 중 최소 2개 조인 필수. 단일 소스만 보면 mock 회고 보고서로 끝남.
- ❌ **V2.0 상위 가중치 30/30/40 변경** — Findability·Trust·Citability 가중치는 잠금. V2.1 sub-engine은 상위 축에 매핑되는 sub-axis로만 추가 가능. Smar-Index(20/20/30/30)는 보조 지표로 별도 운영 (§ 3-A SSOT-7).
- ❌ **V2.1 sub-engine 외 추가** — 새 진단 영역은 반드시 5 sub-engine(Discovery/Conversion/Trust/Reputation/Shopping) 중 하나 + Funnel 통합. 어디에도 안 맞으면 § 3-A SSOT-7 자체를 갱신할지 검토.
- ❌ **Sub-engine별 별도 DB 테이블 남발** — `smarcomm_scans.breakdown` JSONB에 sub-engine score·detail 누적. 큰 시계열 데이터(Reputation·Shopping)만 별도 테이블.
- ❌ **휴리스틱 sentiment·reasoning·attribute·factComparison·source 분류** — § 1.10 정직 원칙 위반. 한국어 키워드 사전·정규식 매칭·자카드로 의미 판정 금지. **반드시 LLM 분류기 사용**:
  - sentiment/reasoning/attributes/factComparisons → [lib/smarcomm/sentiment-llm.ts](lib/smarcomm/sentiment-llm.ts) `classifySentimentLLM`
  - cited source 카테고리/신뢰도 → [lib/smarcomm/source-classifier-llm.ts](lib/smarcomm/source-classifier-llm.ts) `classifySourcesLLM`
  - API 키 없으면 **N/A**로 표시 (권위도와 동일 처리)
- ❌ **점수 산입에 LLM 미실측 N/A 항목 포함** — Sentiment·Attribute·Reasoning이 LLM 미실측이면 종합 점수 평균에서 제외. 0점으로 포함시키면 종합 점수가 거짓으로 낮아짐.
- ❌ **`extractFromAIResponse` / `compareFacts` 신규 호출** — `lib/smarcomm/analyzers/fact-extractor.ts`의 두 함수는 V2.1 정직성 회복으로 **deprecated**. AI 응답 의미 분석은 LLM만 사용. 사이트 측 사실 추출(`extractFromSite`)은 Schema/HTML 표준이라 유지.
- ❌ **`buildActionPlan` / `suggestActions` (휴리스틱) 신규 호출** — V2.1 § 1.10 정직 원칙으로 deprecated. 신규 코드는 `buildActionPlanLLM` (lib/smarcomm/exec-summary.ts) + `suggestActionsLLM` (lib/smarcomm/airm.ts) 사용. API 키 없으면 null 반환 → UI에서 "LLM 미가용" 안내.
- ❌ **Citability 분모에 skipped 플랫폼 포함** — 5 AI 플랫폼 중 stub인 것은 `GeoCheckResult.skipped=true` 명시 + `lib/smarcomm/index-calculator.ts`의 `activeChecks` 필터로 분모에서 제외. 5/5 분모로 두면 4개 stub이 부당하게 점수 깎음.
- ❌ **콘텐츠 볼륨에 LLM 깊이 평가 없이 점수만 노출** — Phase 5까지 "표면 측정" 라벨 의무. 길이만으로는 의미 깊이 보장 못함.
- ❌ **persistence_score 채널 가중치 임의 변경** — wikipedia=25·news=15 등은 휴리스틱. UI에 "휴리스틱 가중치" 라벨 의무. Phase 5 Ahrefs DR 연동 시 정규화 전까지 정직 표기.
- ❌ **schemaSuggestions placeholder 그대로 안내 없이 노출** — `__필드명__` placeholder 포함된 스니펫은 "그대로 붙여넣기 금지" 경고 박스 의무. 사용자가 교체 없이 head 삽입하면 검색·AI가 placeholder 학습.
- ❌ **`analyzeBrandPersonality` (36 유형 임의 매핑) 신규 호출** — `lib/smarcomm/brand-personality.ts`는 점수 임계값 분기로 "디지털 제왕" 같은 라벨 매핑. 동일 점수면 항상 동일 라벨 → 정직하지 못함. 신규 코드는 [brand-personality-llm.ts](lib/smarcomm/brand-personality-llm.ts) `analyzeBrandPersonalityLLM` (Claude Haiku 동적 분석) 사용. API 키 없으면 N/A 안내.
- ❌ **advisor/campaign-plan + creative/generate API 휴리스틱 fallback** — Claude API 실패/키 없을 때 `generateFallbackPlan`/`generateFallback` 같은 규칙 기반 가짜 응답 반환 금지. **503 반환 + UI 안내**가 표준. § 1.10 정직 원칙: 진짜 LLM 분석이 아니면 응답 안 함.
- ❌ **Insights 자동 인사이트 텍스트만으로 보고** — `computeInsights`의 임계값 분기 텍스트는 보조. 주 신호는 `analyzeInsightsLLM`(`lib/smarcomm/insights-llm.ts`) Claude Haiku 동적 분석. LLM 미가용 시 "⚠ LLM 미가용" 라벨 의무.
- ❌ **Mock dashboard 페이지에 배너 없이 노출** — 30+ mock 페이지(funnel·traffic·analytics·cohort·abtest·journey·events·reports·data-reports·crm·campaigns·calendar·workflow)는 `dashboard/layout.tsx`의 `MOCK_PATH_PREFIXES` 자동 배너 표시. 새 mock 페이지 추가 시 prefix 등록 필수.
- ❌ **AI SOV 매트릭스에서 활성 플랫폼 1~2개를 5플랫폼 평균인 듯 노출** — 활성 플랫폼 수 < 3이면 "활성 N/5 플랫폼만 측정" 신뢰도 라벨 의무.
- ❌ **Grade S/A/B/C/D 임계값 출처 미명시** — `getGrade` 95/80/60/40은 자체 SSOT. `GRADE_SOURCE` 상수에 출처 명시되어 있음 (Lighthouse 차용 + Phase 5 업종 백분위 정규화 예정).
- ❌ **차트·메트릭에 출처 칩(🔬) + 산식 부재** — 모든 차트(Trend·종합 레이더·SOV 등)는 헤더에 "🔬 출처: {DB·계산·LLM·사용자입력}" 칩 + 산식/Y축/X축 설명 의무. 사용자가 "이 데이터 어디서?" 질문 못 하게 명시.
- ❌ **To-Be 목표값을 "최종 정답"인 듯 노출** — 30회·90%·TOP3·85%는 SmarComm 자체 SSOT **기본값**. UI에 "기본값 · Phase 5 업종 백분위 + 워크스페이스 커스터마이즈 예정" 출처 의무. `TARGETS_SOURCE` 상수 참조.
- ❌ **DB 테이블만 있고 데이터 입력 UI 부재** — `smarcomm_asset_distributions`·`smarcomm_asset_citations`·`smarcomm_ai_flag_sources` 처럼 사용자가 데이터를 채울 경로 없으면 점수 영원히 0. **수동 입력 모달** 또는 **자동 동기화 명시**(Phase 5 라벨) 의무.
  - distributions: `/api/smarcomm/assets/[id]/distributions` POST + 자산 상세 페이지 "+ 배포 이력 추가" 모달 (V2.1 신규)
  - citations: AI Probe 자동 동기화 (Phase 5 예정 라벨)
  - ai_flag_sources: 외부 검색 API 연동 (Phase 5 예정 라벨)
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
| **Phase** | **Phase 5 진행 중 (2026-05-16, 세션 138)** — V2.0 SSOT 잠금 + Phase 5 Items 1·2·3 완료: 주간 자동 재진단 Cron + 캠페인 자산화 트리거 + AIRM 플래그 출처 추적 (Serper API). |
| **개발 수준** | 진단 영역 = 산업 표준급 보고서 완성 (Phase 1~3). 나머지 35+ 페이지는 mock. API 라우트 15개 (smarcomm: scan · report/[id] · report/[id]/trend · creative/generate · advisor/campaign-plan · ai-tracker · airm/flags · airm/flags/[id]/sources · airm/actions · assets · assets/[id] · assets/[id]/distributions · insights · campaigns/finalize + cron: **smarcomm-weekly-rescan**). **Phase 5 Items 1·2·3 완료** — run-scan.ts 공유 파이프라인 + 캠페인 자산화 SQL 트리거 + `smarcomm_ai_flag_sources` 테이블 + Serper 출처 조회 UI. Smart-Data Hub 미구현 (SSOT 잠금). |
| **이월 작업 (우선순위 순, V2.0 반영)** | ① **ANTHROPIC_API_KEY 갱신** (현재 401, Claude probe + exec summary 잠금) · ② OpenAI/Perplexity/SerpAPI/PageSpeed 키 발급으로 5 AI 플랫폼 + CWV 전체 활성 · ③ **§ 3-A SSOT-6 4지표 측정 구현** — 인지·이해·추천·평판 분리 산출 + As-Is/To-Be 성적표 UI · ④ § 3-B Smart-Data Hub `/dashboard/insights` · `/dashboard/ai-tracker` 신설 · ⑤ § 3-D 자산화 `/dashboard/assets` + `smarcomm_brand_assets` 테이블 · ⑥ § 3-C AIRM 발견→교정 4단계 워크플로우 · ⑦ **Phase 5 Item 4** — Ahrefs/Moz API 통합 (`persistence_score` N/A 해소) · ⑧ **Phase 5 Item 6** — Person·Product·HowTo·Article Entity 자동 생성 · ⑨ **Phase 5 Item 8** — 3 뷰 모드 (`?view=marketer\|exec\|dev`) 활성 · ⑩ [lib/smarcomm/auth.ts](lib/smarcomm/auth.ts) Mock 인증 제거 · ⑪ [dashboard/layout.tsx:28](smarcomm/dashboard/layout.tsx) `router.push('/login')` → LoginModal · ⑫ Mock 대시보드 → 실 API · ⑬ Feature Flags `wio_feature_flags` 연동 · ⑭ localStorage → DB 마이그레이션 |
| **주요 결정 (세션 136 — V2.0 SSOT)** | ① **워크플로우 V1→V2.0** — 진단·분석·전략·제작·집행·모니터링·자산화 7단계. V1의 관계·분석·운영은 5·6·운영위계로 흡수 · ② **Smart-Loop 데이터 플라이휠 SSOT** — ⑥→⑦→① 매끄러운 연결이 SmarComm 해자 · ③ **AI 브랜드 가시성 4지표 SSOT** — 인지·이해·추천·평판 (As-Is/To-Be 성적표) + 6 측정 차원 (개체·속성·최신성·랭킹·근거·비교우위) · ④ **§ 3-B Smart-Data Hub** — 4 소스(진단·광고·AI·유입) 통합 인프라 신설 · ⑤ **§ 3-C AIRM 신설** — Pro/Enterprise 유료 핵심 모듈 (발견→분석→교정→검증 4단계) · ⑥ **§ 3-D 자산화 신설** — Entity Branding 영속화 (3대 노력: 정화·고권위 주입·Schema) · ⑦ **캠페인 종료 = 자산화 시작** — ⑤ 집행 종료 시 brand_assets 자동 INSERT 의무 |
| **주요 결정 (세션 136 — V2.1 진단 sub-engine SSOT)** | ⑧ **V2.0 상위 30/30/40 잠금 + V2.1 5 sub-engine sub-axis** — Discovery(GEO·SEO) / Conversion(UI·UX) / Trust(Security) / Reputation(SNS) / Shopping(커머스) + 퍼널 통합 · ⑨ **Smar-Index(SI) 보조 지표** — Awareness/Search/UX/Security 20/20/30/30 / Industry_Avg 로 별도 산출, 상대적 위치 가시화 · ⑩ **V2.1 신규 측정 16종** — AI SOV·인용 출처·할루시네이션 분리·검색 의도·3초 테스트·전환 마찰·모바일 가독성·인증/인가·거버넌스·취약점·감성·키워드 클라우드·인플루언서·에셋 일관성·쇼핑 키워드·리뷰 시맨틱 · ⑪ **신규 DB 테이블 최소화** — `smarcomm_scans.breakdown` JSONB에 sub-engine 누적, 큰 시계열만 별도 · ⑫ **차별화 연구 과제** — AI 리터러시 진단 알고리즘 + 쇼핑 모멘텀 시차 분석 |
| **주요 결정 (세션 135 — 유지)** | ① WIO ↔ SmarComm 동등 OS 관계 · ② Index 가중치 30/30/40 (Citability 40%) · ③ 권위도 측정 폐기 · ④ AI 정확도 wrong = -0.5 음수 가중 · ⑤ 4-Tier 측정 모델 (T0~T2 점수, T3/T4 별도 N/A) |
| **SmarComm Index 보고서 산출 (세션 135)** | **DB 3 테이블 · lib 15 모듈 · UI 9 컴포넌트 · 권위 anchor 12개**. 보고서 14 섹션 (V2.0 신설 "AI Brand Journey" 4지표 섹션 추가 예정) |
| **블로커** | Toss 가맹점 승인 + Vercel 환경변수 (실 결제 흐름 작동 안 됨) · ANTHROPIC_API_KEY 갱신 필요 |

# Brand Gravity — 서비스 워크플로우

> AEO(AI Engine Optimization) 컨설팅 서비스
> AI 추천 엔진에서 브랜드가 얼마나 잘 노출되는지 측정하고, 개선 전략을 제공한다.

---

## 전체 흐름 요약

```
[클라이언트 온보딩] → [페인 수집] → [질문 클러스터링] → [AI 프로빙] → [갭 분석] → [소스 추적] → [콘텐츠 브리프] → [리포트 납품]
     Phase 1            Phase 2          Phase 3           Phase 4         Phase 5        Phase 6         Phase 7          Phase 8
```

---

## Phase 1: 클라이언트 온보딩

| 단계 | 액션 | 담당 |
|------|------|------|
| 1-1 | 클라이언트가 신청서 제출 | 클라이언트 |
| 1-2 | 영업팀이 신청 검토 + 계약 | TenOne 영업 |
| 1-3 | bg_clients 생성 (계약 정보) | 어드민 |
| 1-4 | bg_products 생성 (분석 대상 브랜드/제품) | 어드민 |

**API:** `POST /api/gravity/apply`
**DB:** `bg_apply_requests` → `bg_clients` → `bg_products`

**계약 플랜:**
| 플랜 | 내용 |
|------|------|
| scan | 1회 스캔 리포트 |
| program | 분기별 정기 분석 |
| dashboard | 상시 모니터링 |
| workshop | 워크샵 + 분석 |

---

## Phase 2: 페인 수집 (Pain Collection)

> 소비자 리뷰/후기에서 페인포인트를 추출한다.

### Step 2-1: 리뷰 데이터 수집

| 방법 | API | 설명 |
|------|-----|------|
| 자동 크롤링 | `POST /api/gravity/pain/collect` | Edge Function으로 외부 플랫폼 크롤링 |
| 수동 시드 | `POST /api/gravity/pain/seed` | 직접 리뷰 데이터 주입 (테스트/보충용) |

**수집 플랫폼:** 네이버 쇼핑, 쿠팡, 아마존, 구글 리뷰, 커뮤니티

**입력:**
```json
{
  "product_id": "UUID",
  "reviews": [
    { "raw_text": "리뷰 본문", "platform": "naver_blog", "rating": 5, "author": "닉네임" }
  ]
}
```

**DB:** `bg_pain_sources` (processed=false)

### Step 2-2: 페인포인트 분류

**API:** `POST /api/gravity/pain/run`
**AI 모델:** Claude Sonnet (높은 분류 정확도)

리뷰 원문 → Claude가 분석하여 추출:
- `extracted_question`: 소비자가 실제로 AI에게 물어볼 법한 질문
- `pain_category`: 카테고리 (가격, 품질, 편의성 등)
- `emotion`: 감정 (불만, 기대, 만족 등)
- `situation`: 사용 상황 (출근길, 운동 중 등)
- `confidence`: 분류 신뢰도 (0~1)
- `positive_points`, `negative_points`: 긍/부정 포인트

**DB:** `bg_pain_points`

---

## Phase 3: 질문 패턴 클러스터링

> 페인포인트에서 추출된 질문들을 대표 패턴으로 묶는다.

**API:** `POST /api/gravity/question/run`
**AI 모델:** Claude (CLUSTER_PROMPT)

**로직:**
1. `bg_pain_points`에서 `extracted_question` 전체 수집
2. Claude가 유사 질문을 클러스터링
3. 각 클러스터의 대표 질문 + 빈도 + 우선순위 산출

**출력 예시:**
```json
{
  "pattern_text": "팬티라이너 날개형이 일반형보다 뭐가 좋은가요?",
  "cluster_label": "제품 기능 비교",
  "frequency": 7,
  "pain_category": "기능성",
  "priority": 1
}
```

**DB:** `bg_question_patterns` (기존 삭제 → 신규 삽입)

---

## Phase 4: AI 프로빙 (AI Prober)

> 실제 AI에게 소비자 질문을 던져서, 우리 브랜드가 언급되는지 측정한다.

**API:** `POST /api/gravity/probe/run`
**AI 모델:** Claude Haiku (소비자 AI 어시스턴트 역할)

**로직:**
1. Phase 3에서 만든 질문 패턴을 하나씩 AI에게 전달
2. AI가 제품/서비스를 추천하는 응답 생성
3. 응답에서 자사 브랜드명이 등장하는지 체크 (`brand_mentioned`)
4. 경쟁사 언급 여부도 기록

**프롬프트 구조:**
```
당신은 소비자 AI 어시스턴트다. 다음 질문에 대해 제품/서비스를 추천해라.
질문: {pattern_text}
관련 브랜드 정보:
- 주요 브랜드: {brand_name}
- 경쟁사: {competitors}
```

**핵심 지표:**
- `brand_mentioned`: 브랜드 언급 여부 (boolean)
- `brand_mention_rate`: 전체 질문 중 브랜드 언급 비율 (%)

**DB:** `bg_ai_probe_results` (기존 삭제 → 신규 삽입)

---

## Phase 5: 갭 분석 + Gravity Score 산출

> 왜 AI가 우리 브랜드를 추천하지 않는지 진단하고, 종합 점수를 매긴다.

**API:** `POST /api/gravity/gap/run`
**AI 모델:** Claude Haiku (GAP_PROMPT)

### Gravity Score 공식

```
Gravity Score = (Mention Score × 0.5) + (Coverage Score × 0.3) + (Rank Score × 0.2)
```

| 구성 요소 | 배점 | 산출 방법 |
|-----------|------|-----------|
| Mention Score | /30 | AI 응답 내 브랜드 언급 비율 (%) |
| Coverage Score | /20 | 5대 AI 엔진 중 최소 1회 등장한 비율 |
| Rank Score | /25 | 추천 리스트에서의 평균 순위 가중치 |
| Context Score | /25 | 추천 맥락이 의도한 용도와 일치하는 비율 |

### 등급 체계

| 등급 | 점수 | 의미 |
|------|------|------|
| A | 60~100 | AI 추천 강자 |
| B | 30~59 | 가시성 확보 중 |
| C | 10~29 | 개선 시급 |
| D | 0~9 | AI 비가시 상태 |

### Gap Summary (Claude 분석)

Claude가 probe 데이터를 분석하여:
- `top_gaps`: AI가 브랜드를 추천 못 하는 핵심 원인 3~5가지
- `quick_wins`: 1~2주 안에 실행 가능하고 효과가 큰 개선 방법 3~5가지

**DB:** `bg_gravity_scores` (오늘 날짜 기존 삭제 → 신규 삽입)

---

## Phase 6: 소스 추적 (Source Tracer)

> AI가 답변할 때 참조하는 소스를 분석한다. 경쟁사는 어떤 소스 덕에 추천되는가?

**API:** `POST /api/gravity/source/run`
**AI 모델:** Claude Haiku (SOURCE_PROMPT)

**추출 정보:**
| 필드 | 설명 |
|------|------|
| source_type | official_site, wikipedia, review_site, news, blog, reddit, forum, youtube, other |
| source_url | 언급된 URL (있으면) |
| source_name | 소스 이름 (예: 네이버 블로그, G2) |
| source_snippet | 관련 문장 (30자 이내) |
| brand_beneficiary | 이 소스로 이득 보는 브랜드 |
| is_own_brand | 자사 브랜드 여부 |

**분석 포인트:**
- 자사 vs 경쟁사 소스 분포 비교
- 부족한 소스 유형 파악 (예: 위키피디아 없음, 리뷰 사이트 부족)
- 경쟁사가 유리한 소스 채널 식별

**DB:** `bg_source_traces` (기존 삭제 → 신규 삽입)

---

## Phase 7: 콘텐츠 브리프 생성 (Voice Designer)

> 분석 결과를 바탕으로 AEO 최적화 콘텐츠 기획안을 자동 생성한다.

**API:** `POST /api/gravity/voice/run`
**AI 모델:** Claude Sonnet (깊은 분석 필요)

**브리프 구조:**
```json
{
  "content_type": "faq | blog | comparison | case_study | reddit_post | youtube_script | landing_page",
  "target_pattern": "타겟 질문 패턴",
  "title_suggestion": "제안 제목",
  "key_messages": ["핵심 메시지 1", "핵심 메시지 2"],
  "target_ai": ["ChatGPT", "Claude", "Gemini"],
  "priority": 1,
  "status": "draft"
}
```

**우선순위 결정 기준:**
- Gap에서 식별된 핵심 누락 원인과 연결
- 빈도 높은 질문 패턴 우선
- 경쟁사 대비 소스 부족 채널 우선

**DB:** `bg_voice_briefs`

---

## Phase 8: 리포트 납품

> 10개 섹션 + 4개 부록으로 구성된 종합 리포트.

**페이지:** `/intra/gravity/[productId]/report`

### 리포트 구성

| # | 섹션 | 내용 |
|---|------|------|
| 01 | Executive Summary | 핵심 발견사항, 카테고리 역풍, 즉시 실행 조치 |
| 02 | Gravity Score 상세 분석 | 4개 구성 점수 + 경쟁사 비교 + AI 모델별 breakdown |
| 03 | 경쟁사 소스 분석 | 소스 유형 분포, 경쟁사 유리 채널, 자사 부족 채널 |
| 04 | Gap 진단 | AI가 브랜드를 놓치는 이유 (심각도 1~5) |
| 05 | 카테고리 역풍 분석 | AI가 카테고리 자체를 기피하는 경우 진단 |
| 06 | AI 추천 지도 | 질문 × AI 모델 매트릭스 (✅⚠️❌🚨) |
| 07 | 소비자 페인포인트 맵 | 리뷰 기반 페인포인트 (카테고리/감정/신뢰도) |
| 08 | 콘텐츠 브리프 가이드 | 우선순위별 AEO 콘텐츠 기획안 |
| 09 | 구조화 데이터 제안 | FAQPage + Organization JSON-LD 스키마 |
| 10 | 커버 | 브랜드명, 점수 뱃지, 측정일, 대상 AI 목록 |

### 부록

| 부록 | 내용 |
|------|------|
| A | 상황 질문 세트 — 프로빙에 사용된 전체 질문 패턴 |
| B | Brand Gravity 측정 방법론 — 7단계 파이프라인 + 점수 공식 |
| C | 경쟁사 Gravity Score — 경쟁 벤치마크 테이블 |
| D | 용어 정의 — AEO, 카테고리 역풍 등 10개 핵심 용어 |

---

## 파이프라인 오케스트레이터

> 전체 파이프라인을 한 번에 실행하는 단일 엔드포인트.

**API:** `POST /api/gravity/scan/run`

```
[pain/seed (선택)] → pain/run → question/run → probe/run → gap/run → [source/run] → [voice/run]
```

---

## DB 테이블 맵

```
bg_apply_requests ──→ bg_clients ──→ bg_products
                                         │
                                         ├── bg_pain_sources ──→ bg_pain_points
                                         │                            │
                                         │                    bg_question_patterns
                                         │                            │
                                         │                    bg_ai_probe_results
                                         │                       │         │
                                         ├── bg_gravity_scores ──┘         │
                                         ├── bg_source_traces ─────────────┘
                                         └── bg_voice_briefs
```

| 테이블 | 역할 | Phase |
|--------|------|-------|
| bg_apply_requests | 신청서 접수 | 1 |
| bg_clients | 계약 클라이언트 | 1 |
| bg_products | 분석 대상 제품/브랜드 | 1 |
| bg_pain_sources | 원본 리뷰/후기 | 2 |
| bg_pain_points | 분류된 페인포인트 | 2 |
| bg_question_patterns | 클러스터링된 질문 패턴 | 3 |
| bg_ai_probe_results | AI 프로빙 결과 | 4 |
| bg_gravity_scores | 종합 점수 + 갭 분석 | 5 |
| bg_source_traces | AI 참조 소스 추적 | 6 |
| bg_voice_briefs | AEO 콘텐츠 브리프 | 7 |

---

## AI 모델 사용 전략

| 단계 | 모델 | 이유 |
|------|------|------|
| Pain 분류 | Claude Sonnet | 높은 분류 정확도 필요 |
| 질문 클러스터링 | Claude Sonnet | 복잡한 그룹핑 |
| AI 프로빙 | Claude Haiku | 빠른 응답, 비용 효율 |
| Gap 분석 | Claude Haiku | JSON 구조화 출력 |
| 소스 추적 | Claude Haiku | 대량 처리 속도 |
| 콘텐츠 브리프 | Claude Sonnet | 깊은 전략적 분석 |

---

## 반복 실행 사이클

```
첫 분석 (Baseline)
    ↓
콘텐츠 브리프 실행 (마케팅팀)
    ↓
1~3개월 후 재스캔
    ↓
Gravity Score 변화 추적 (/api/gravity/score/history)
    ↓
새로운 Gap + 브리프 생성
    ↓
(반복)
```

---

## 프론트엔드 페이지 구조

| 경로 | 용도 |
|------|------|
| `/intra/gravity` | 전체 현황 대시보드 (클라이언트별 점수 카드) |
| `/intra/gravity/clients` | 클라이언트/제품 관리 (CRUD) |
| `/intra/gravity/briefs` | 콘텐츠 브리프 갤러리 (상태/유형/클라이언트 필터) |
| `/intra/gravity/[productId]` | 제품별 파이프라인 관리 + 점수 시각화 |
| `/intra/gravity/[productId]/report` | 종합 리포트 (A4 인쇄 최적화, PDF 저장) |

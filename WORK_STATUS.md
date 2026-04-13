# 작업 현황

> 마지막 업데이트: 2026-04-13 (집, 세션 41)

---

## 이번 세션 (세션 41) 완료 항목

| 항목 | 내용 |
|------|------|
| ERP 청구관리 입력 폼 | `billing/page.tsx` — "청구서 발행" 버튼에 모달 연결. 거래처/프로젝트/금액/발행일/만기일/상태 입력 → `erpDb.createInvoice()` 저장. 신규 항목 즉시 목록 반영 |
| 법인카드 동적 카드 목록 | `card/page.tsx` — 하드코딩 mockCards 제거. card_usage DB 데이터에서 카드번호별 집계로 카드 요약 자동 생성 |
| Wiki Library DB 연동 | `wiki/library/page.tsx` — `wikiDb.fetchLibraryItems()` 결과 실제 적용 (기존 TODO 해결). DB 아이템 있으면 DB 우선, 없으면 mock fallback. 신규 등록 시 DB + 로컬 state 동시 반영 |
| Wiki FAQ 등록 기능 | `wiki/faq/page.tsx` — "FAQ 등록" 버튼 + 모달 추가. 카테고리/질문/답변 입력 → `wiki_faq` 테이블 저장 (테이블 없으면 로컬 추가). 등록 즉시 목록 상단 반영 |

---

## 이전 세션 (세션 40) 완료 항목

| 항목 | 내용 |
|------|------|
| 춤추는고래 브랜드 정체성 수정 | 댄스학원 → 여성위생용품(생리대/팬티라이너). seed 스크립트 전면 재작성 |
| Brand Gravity 컨설팅 서비스 설계 | `docs/BrandGravity_Service_Design.md` — 1주 Day1~5 프로세스, 측정→진단→처방 3단계, 시스템 vs 사람 역할 상세 |
| Quick Probe API (시장 사전 진단) | `app/api/gravity/prescan/run/route.ts` — 5대 구매여정 × AI 프로빙 → 시장 유형 A/A'/B/C 자동 판정 → bg_prescan_results 저장 |
| 소셜 분석 API | `app/api/gravity/social/run/route.ts` — Naver Blog/Cafe 검색 → SOV + 감정분석 + 연관어 추출 |
| 브랜드 4대 가치 API | `app/api/gravity/brand-value/run/route.ts` — 인지도/호감도/추천도/만족도 공식 적용 → bg_brand_values 저장 |
| 메신저 알림 유틸 | `lib/gravity/notify.ts` — agent_messages 기반 그래비티 에이전트 알림 |
| Gravity Score 공식 수정 | Mention(40) + Context(25) + Rank(20) + Coverage(15). gap/run route.ts 업데이트 |
| 파이프라인 8단계 확장 | scan/run: 5단계 → 8단계 (source/run, voice/run, brand-value/run 추가) + 메신저 알림 훅 |
| 그래비티 에이전트 등록 | Supabase agent_profiles INSERT: gravity / 그래비티 / layer=1 |
| 대시보드 고도화 | `/intra/gravity` — "오늘의 할 일" 섹션 + "그래비티 에이전트 메시지" 섹션 추가 |
| Pre-Scan + Brand Value Card | `components/gravity/PrescanCard.tsx` 신규. 제품 상세 페이지에 삽입 |
| 사전 질문서 페이지 | `app/intra/gravity/[productId]/intake/page.tsx` — A~E 5섹션, 프리필, 공유링크 토큰 생성 |
| 리포트 섹션 확장 | 섹션 11(브랜드 4대 가치 진단) + 섹션 12(세일즈 액션 플랜) 추가 |
| 리포트 배점 수정 | 40/25/20/15 (방법론 텍스트 + 표시값 동기화) |
| DB 마이그레이션 | bg_prescan_results, bg_brand_values, bg_intake_responses 테이블 신규. bg_products에 market_type 컬럼 추가 |
| 전체 파이프라인 재실행 검증 | 춤추는고래로 8단계 전체 완주. Gravity Score 6/100, Brand Values 종합 20/100 (Naver API 미설정 상태에서 정상) |

---

## 현재 DB 상태 (2026-04-12 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| agent_profiles | 22개 | gravity(그래비티) 에이전트 추가 |
| bg_products | 2개 | Brand Gravity (테스트), 춤추는고래 |
| bg_prescan_results | 1건 | 춤추는고래 A' 유형 |
| bg_brand_values | 1건 | 춤추는고래 종합 20/100 |
| bg_intake_responses | 0건 | 클라이언트 질문서 대기 |
| bg_gravity_scores | 1건 | 춤추는고래 6/100 |
| bg_voice_briefs | 5건 | AEO 콘텐츠 브리프 |

---

## P0 전체 완료 상태

| 항목 | 상태 |
|------|------|
| Quick Probe API | ✅ |
| 시장 유형 자동 분류 | ✅ |
| 클라이언트 사전 질문서 | ✅ |
| 소셜 언급·감정 분석 API | ✅ |
| 브랜드 4대 가치 산출 | ✅ |
| Gravity Score 공식 수정 (40/25/20/15) | ✅ |
| 파이프라인 → 메신저 알림 | ✅ |
| 그래비티 에이전트 등록 | ✅ |
| 대시보드 고도화 | ✅ |
| 제품 상세 Pre-Scan Card | ✅ |
| 사전 질문서 페이지 | ✅ |
| 리포트 섹션 11+12 추가 | ✅ |
| 빌드 클린 | ✅ |

---

## 다음 스텝 후보 (P1)

1. **Naver API 연결** — `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` 환경변수 설정 시 인지도/호감도 실측 가능
2. **멀티모델 프로빙** — OpenAI/Gemini/Perplexity API 키 확보 후 probe/run 확장 (현재 Claude만)
3. **공유 링크** — `/brandgravity/report/[token]` 클라이언트 열람 URL
4. **대화형 그래비티** — 인트라 메신저에서 "점수 알려줘" → Claude 호출
5. **점수 트렌드 차트** — 시계열 Gravity Score 변화 그래프
6. **정기 자동 스캔** — Vercel Cron / pg_cron 월간 재측정

---

## QA 이력 (이전 세션 미처리)

- **N-03** 뉴스레터 구독 폼 3곳 중복 — 통일 방향 결정 필요
- **SmarComm DB 연결** — 전체 Mock 상태 (5월 예정)
- **MADLeague DB 연결** — 전체 Mock (5월 예정)

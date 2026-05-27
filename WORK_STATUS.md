# 작업 현황

> 마지막 업데이트: 2026-05-27 (세션 153 — Mindle Phase 1-E 뉴스레터 자동화 + Phase 2-C 페르소나 4종 cron + Phase 2-E UC 학생 할인)

---

## 세션 153 핵심 성과 (2026-05-27)

### 장소·운영

- 시작: 집/사무실 (`git pull origin master` 정상, Already up to date, base = 세션 152 commit `a8447f04`)
- 종료: master 단독, push 1회 예정 (작업 종료 시점)
- 변경 파일 3개 (모두 신규, Mindle 관련)
- **블록 상태**: `.env.local`의 `SUPABASE_ACCESS_TOKEN` 401 — Edge Function 배포·pg_cron 등록·SQL 시드 실행 모두 사용자 PAT 갱신 후 진행

### ① Mindle Phase 1-E 뉴스레터 자동화 (코드 완료, 배포 블록)

세션 152 이월 1순위. Whole See published 카드 기반 매거진 블록 자동 생성 Edge Function 신설.

**[supabase/functions/mindle-newsletter-draft/index.ts](supabase/functions/mindle-newsletter-draft/index.ts) — 신규 425줄**

- 정직성 SSOT 유지: published 카드만 사용, source_urls 그대로 카드에 노출, LLM은 인트로 한 마디만 생성, 발송 자동 X (status='draft')
- 매거진 블록 구성: HeroBlock(점수 9+ 최상위) + intro TextBlock(LLM Haiku) + "이번 주 신호" CardRowBlock(점수 8+ 3건) + "약신호 — 부상 중" CardRowBlock(signal_score weak/rising 3건) + UniverseFeedBlock(Mindle·Badak·SmarComm 자연 CTA)
- newsletter_issues 멱등 UPSERT (status='draft' 갱신, status='scheduled'/'sent' 보존)
- agent_messages mindle→1001 risk_level green/yellow/red 보고
- weekStartKST() KST 월요일 기준 산출

**기존 자산 활용 (추가 작업 없음):**
- `/api/newsletter` source='mindle' 모집 정상
- `/api/newsletter/send` Resend 배치 발송 + 예약·테스트·tags 필터
- `/api/newsletter/confirm` 더블옵트인
- `/api/newsletter/unsubscribe` 수신거부 + List-Unsubscribe 헤더
- `/intra/ums/newsletter/issues` 인트라 검수·블록 편집·예약 발송 UI 완비

### ② Mindle Phase 2-C 페르소나 4종 뉴스레터 (코드 완료, cron 등록 블록)

mindle-newsletter-draft에 `?persona=KEY` 분기 추가 — 한 Edge Function이 메인 호 + 페르소나 4종 모두 처리.

**Edge Function 확장:**
- VALID_PERSONA_KEYS = ['founder','planner','reporter','marketer']
- fetchPersona(key) — mindle_personas 단건 fetch
- 페르소나 지정 시: default_categories 필터링 (trendQuery.in('category', persona.default_categories))
- LLM 인트로에 페르소나 컨텍스트 주입 (`대상 독자: {이름} ({tagline})`)
- title prefix: `[Mindle · {페르소나명}]` vs `[Mindle 주간]`
- target_tags: `['mindle','persona:KEY']` vs `['mindle']`
- category: `mindle-weekly-{key}` vs `mindle-weekly`
- from_name: `Mindle · {페르소나명}` vs `Mindle`
- 멱등성 매칭에 target_tags 포함

**[sql/mindle-newsletter-draft-cron.sql](sql/mindle-newsletter-draft-cron.sql) — 신규**

- 메인: KST 월 09:00 (UTC 월 00:00)
- founder: KST 화 09:00
- planner: KST 수 09:00
- reporter: KST 목 09:00
- marketer: KST 금 09:00
- pg_cron + net.http_post + vault decrypted_secrets 패턴 (기존 mindle-metrics-compute-hourly와 동일)
- 재실행 안전: cron.unschedule 5건 일괄 → 재등록

### ③ Mindle Phase 2-E UC 학생 할인 (코드 완료, SQL 실행 블록)

**[sql/mindle-student-uc.sql](sql/mindle-student-uc.sql) — 신규**

- uc_redeem_policies row 2건:
  - `mindle` default 10% (CLAUDE.md § 1.5 UC 정책 + 기존 brand_id 패턴)
  - `mindle` student 50% (Phase 3 PRO 결제 도입 시 자동 작동)
- `is_student_email(TEXT)` SQL 함수 (IMMUTABLE) — `.ac.kr` · `.edu` · `.edu.XX` 정규식 판별
- members.is_student GENERATED ALWAYS AS (is_student_email(email)) STORED 컬럼 + 부분 인덱스
- 검증 쿼리 4종 포함 (hongik.ac.kr·mit.edu·gmail.com·oxford.ac.uk)

### ④ 검수 큐 e2e 부분 검증 (Task #2)

- `/intra/ums/mindle/queue` Server Component 렌더 200 (compile 258ms, render 1015ms)
- PATCH `/api/intra/mindle/queue/[id]` 미인증 401 '인증 필요' 정상 (auth gate)
- 빌드/런타임 에러 0
- 미완: 사용자가 lools@tenone.biz 로그인 후 브라우저 1-click 1건 실 e2e

### 🎯 다음 세션 첫 액션 (갱신)

1. **PAT 갱신** — [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)에서 PAT 재발급 → `.env.local`의 `SUPABASE_ACCESS_TOKEN` 교체
2. **Edge Function 3개 deploy** (PAT 갱신 후 자동 가능):
   ```
   npx supabase functions deploy trend-crawl --project-ref ziotlxkdctlhiwkgmmsh
   npx supabase functions deploy mindle-metrics-compute --project-ref ziotlxkdctlhiwkgmmsh
   npx supabase functions deploy mindle-newsletter-draft --project-ref ziotlxkdctlhiwkgmmsh
   ```
3. **SQL 2건 실행** — `sql/mindle-newsletter-draft-cron.sql` (pg_cron 5건) + `sql/mindle-student-uc.sql` (UC 정책·is_student_email)
4. **검수 큐 첫 실 운영** — `/intra/ums/mindle/queue` 브라우저 1-click 1건
5. **Mindle 뉴스레터 첫 발행** — 다음 KST 월 09:00 cron 가동 → 운영자 `/intra/ums/newsletter/issues` 검수 → 발송 (Mindle source 구독자 = 현재 0명. 구독자 모집은 별도 마케팅 과제)
6. **send route persona AND 매칭 보강** — Phase 2-C 후속. target_tags 길이 2+ 시 모든 tag 보유 구독자만 추출
7. **Mindle Phase 3 착수** — PRO 결제 (Toss + wio_subscription_plans SSOT) · 심층 리포트 · 대화형 검색 · B2B (한 세션 무리, 단계 분리 필요)
8. **세션 150 SmarComm 이월** 계속 미해소 (VAPID Vercel·외부 키 4개·Web Push e2e·환각 감지 회귀)

---

## 세션 152 핵심 성과 (2026-05-26)

### ⑤ Vercel 빌드 에러 수정 (124ed56d → 3dabe73d → 9f...)

세션 152 첫 push(124ed56d)가 Vercel 빌드 ERROR. 진단: 로컬 dev는 lazy compile로 통과했으나 Next 16 production prerender에서 `mindle/my/page.tsx`가 제거된 `trends/statusBadge` export 참조 검출.

- mindle/my/page.tsx mock 의존 전면 제거 (savedIds/alerts/interests 모두 mock이었음)
- Phase 2 도입 예정 정직 라벨로 교체
- 로컬 `npm run build` 성공 후 3dabe73d push → Vercel READY

### ⑥ Mindle Phase 1 B/C/D 일괄 완료

**1-B 약신호 코너 (Newen K-Market Lens)**
- mindle_trends 컬럼 3개 + 인덱스 2개 + `mindle_recompute_signals()` SQL 함수 + pg_cron `mindle-weak-signal-daily` KST 02:15
- 백필 결과: strong 148 · rising 80 · weak 532
- [features/mindle/WeakSignalCorner.tsx](features/mindle/WeakSignalCorner.tsx) — 시그널 게이지 + 카테고리 활성도 (`+137%` 등)
- 정직 라벨: 산식 명시 + "단순 산식, Phase 2 시계열 분석 예정"

**1-C 페르소나 4종 (Sometrend 페르소나 진화)**
- `mindle_personas` 테이블 + 4 시드 (founder/planner/reporter/marketer + tagline·default_categories·accent_color)
- `newsletter_subscribers.persona_key` 컬럼 + 인덱스
- [lib/mindle/personas.ts](lib/mindle/personas.ts) SSOT + [features/mindle/PersonaPicker.tsx](features/mindle/PersonaPicker.tsx)
- `/mindle?persona=founder` 등 query param → default_categories[0] 자동 필터

**1-D 5대 분석 모듈 (Sometrend 패턴)**
- `mindle_trend_metrics` 테이블 (CHECK + UNIQUE 복합키 + RLS)
- [lib/mindle/metrics.ts](lib/mindle/metrics.ts) SSOT (5 payload 인터페이스)
- [features/mindle/TrendMetrics.tsx](features/mindle/TrendMetrics.tsx) — MentionTrend SVG·RelatedKeywords 클라우드·Sentiment 바·Comparison·CommunitySnippet
- 정직성: 데이터 없으면 "🚧 Phase 2 도입 예정" 명시, mock 차트 0건

### ⑦ newsletter_subscribers 79명 정직성 회복

사용자 지적("79명도 다 가짜잖아") — 검증 결과 **Mindle source = 0명**. 79명은 tenone-newsletter 63·hero 7·myverse 3·기타 6 합계였음.

- mindle/page.tsx + reports/page.tsx fetchSubscriberCount에 `source='mindle' AND is_active=true` 필터
- fetchLatestIssueCount에 `status='sent'` 필터
- CLAUDE.md DB 테이블 정정 + ZERO 금지 패턴 추가

### ⑧ 검수 큐 운영 시뮬레이션 (옵션 3)

API 권한 4단 게이트 정직성 확인 (auth 401 / member 404 / role 403 / status 409). 4 시나리오 SQL 시뮬레이션:
- collected 620 → 602 (-18)
- published 760 → 770 (+10 점수 8+ 카드)
- draft 40 → 45 (+5 점수 7 카드)
- archived 0 → 3 (+3 점수 6 카드)
- signal_score 770건 재계산

### ⑨ Mindle Phase 2 골격 — 메트릭 자동 생성 (옵션 4)

- [lib/mindle/agent.ts](lib/mindle/agent.ts) SSOT — 5종 함수 (mention_trend SQL · related_keywords/sentiment Haiku · comparison/community 외부 데이터 부재로 null 반환 정직 처리)
- [supabase/functions/mindle-metrics-compute](supabase/functions/mindle-metrics-compute/index.ts) Edge Function — 시간당 5건 batch + upsert 멱등 + agent_messages 보고
- pg_cron `mindle-metrics-compute-hourly` 매시 25분 (trend-crawl 00·trend-to-draft 30과 충돌 없음)

### 🎯 다음 세션 첫 액션 (갱신)

1. **Edge Function 2개 deploy** (사용자 직접):
   - `npx supabase functions deploy trend-crawl --project-ref ziotlxkdctlhiwkgmmsh` (Step 2 자동 분기)
   - `npx supabase functions deploy mindle-metrics-compute --project-ref ziotlxkdctlhiwkgmmsh` (Phase 2 메트릭)
2. **검수 큐 첫 실 운영** — `/intra/ums/mindle/queue` 브라우저 1-click 1건 (API e2e 검증)
3. **Phase 1-E 뉴스레터 자동화** — Whole See → AI 초안 → Mindle 자체 source 구독 모집 인프라
4. **세션 150 SmarComm 이월** 계속 미해소 (VAPID Vercel·외부 키·Web Push e2e·환각 감지 회귀)

---

### ① MADLeap study_programs DB 연동 + is_open=true 토글

세션 151 이월 작업 해소. mock 6개(가짜 리더 박지호·정민재·한소율 등 + 가짜 학교 성균관대·한양대 등) 정직성 위반 → 전면 제거.

- 신규 [madleap_study_programs](sql/madleap-study-programs.sql) 테이블 (18 cols + RLS public read·service_role write + sort/status/published 인덱스 3개 + updated_at 트리거)
- 신규 [StudyRoomList.tsx](features/madleap/StudyRoomList.tsx) 클라이언트 (확장/접힘 + status 영문→한글 매핑 + icon string→컴포넌트 매핑)
- study-room page → Server Component, 빈 DB일 때 "운영 중 스터디 없음" 안내
- ums_sites.madleap.is_open=**true** 토글 (외부 공개)

### ② Mindle 벤치마킹 + 고도화 개발 계획

Newen AI + Sometrend(바이브컴퍼니) 4 URL + 2 추가 WebSearch → 차별 포지셔닝 도출:
- Newen·Sometrend = 분석 도구 / Mindle = 콘텐츠 미디어 (보완 관계)
- Mindle만의 5가지: 정직성 라벨·편집팀 큐레이션·뉴스레터 First·페르소나 분리·Universe 연계
- Phase 0~3 로드맵 + DB 스키마 + 가격 정책(PRO ₩9,900 = Sometrend BASIC 1/3) + B2B 단가 시나리오(₩500k~₩15M/년) + 페르소나 4종(founder/planner/reporter/marketer) 정의

### ③ Mindle Phase 0 — 정직성 회복 + 공개

mindle_trends 1,410건 (published 532) 자산 보유 확인 후 mock 페이지를 DB 연동으로 전면 교체.

- [lib/mindle/trend-data.ts](lib/mindle/trend-data.ts) DB fetch 헬퍼 SSOT 신설 (fetchPublishedTrends·countPublishedTrends·getCategoryCounts·fetchTrendById·CATEGORY_LABEL·getTrendStatus)
- [features/mindle/TrustLabel.tsx](features/mindle/TrustLabel.tsx) 신규 — 정직성 SSOT (출처·분석일·관련성·agent 명시, compact 모드 지원)
- mindle/page.tsx Server Component 리팩 — mock 제거 + DB fetch + 카테고리 필터(query param)
- mindle/trends/page.tsx Server Component 리팩 — 검색·필터·뷰모드·페이지네이션 (모두 query param)
- mindle/trends/[id]/page.tsx Server Component 리팩 — generateMetadata + view_count 증가 + 관련 트렌드 + 출처 원문 링크
- mindle/reports/page.tsx 전면 교체 — mock "13주차 리포트" 5건 제거 + newsletter_issues DB 연동 + 발송 0건이면 "준비 중" 안내
- mindle/data + references 정직성 배너 추가
- ums_sites.mindle.is_open=**true** 토글
- [app/(Mindle)/CLAUDE.md](app/(Mindle)/CLAUDE.md) 전면 갱신 (Phase 0~3 로드맵·차별 포지셔닝·11종 ZERO 금지 패턴)

### ④ Whole See 리바이브 — 진단 + 백필 + Step 2·3

오해 정정: Whole See는 **죽지 않았다**. 매시간 정상 가동(280건 수집 / 5건 자동 카드 / mindle→1001 정상 보고). 진짜 문제는 검수 단계 부재.

**진단 결과**:
- cron 4 jobs 정상 (`trend-crawl-hourly`·`trend-to-draft-hourly`·`daily-vrief-morning`·`daily-briefing-1001`)
- mindle_sources 49개 모두 last_crawled_at 2026-05-26 06:00 정상
- collected_data 3,098건 (raw 2,189 / processed 746 / rejected 123)
- mindle_trends 신규 843건 status=**collected**로 쌓이고 있었음 (4/9 이후 published 전환 멈춤)

**Step 1 백필**: collected 843건 중 점수 9+ **228건 즉시 published 전환** → 외부 노출 **532 → 760건 (+43%)**

**Step 2 코드**: trend-crawl/index.ts 228줄 자동 분기 (9+: published / 7~8.x: collected / 6~6.x: draft). 사용자 deploy 필요.

**Step 3 검수 큐 UI**:
- `/intra/ums/mindle/queue` 신설 (Server Component) — 점수 분포 ScoreCard + 카테고리 필터 + 50건 리스트
- [features/mindle/QueueRow.tsx](features/mindle/QueueRow.tsx) Client — 1-click 발행/초안/기각
- [/api/intra/mindle/queue/[id]](app/api/intra/mindle/queue/[id]/route.ts) PATCH 라우트 — staff/manager/super_admin 권한 + published 시 published_at 갱신 + 409 이중 클릭 방지
- intra-nav.ts "검수 큐" 메뉴 추가
- action-hub-registry.ts `mindle_pending_cards` 등록 (category=moderation, priority=normal)

### 🎯 다음 세션 첫 액션

1. **Edge Function 배포** (사용자 직접): `npx supabase functions deploy trend-crawl --project-ref ziotlxkdctlhiwkgmmsh` → 다음 정각부터 점수 9+ 자동 published
2. **검수 큐 첫 운영** — collected 8+ 289건 중 일부를 1-click 처리 (스모크 테스트)
3. **Mindle Phase 1 1-A 또는 1-B 착수** — 5대 분석 모듈 vs 약신호 코너 (vs 페르소나 분리) 우선순위 결정
4. **세션 150 이월 (SmarComm)**: VAPID Vercel Env 등록, 외부 키 4개 발급, Web Push e2e, 환각 감지 회귀

---

## 세션 151 핵심 성과 (2026-05-25)

### ① MADLeap 헤더 nav 경로 표준화 (commit `805fed7f`)

기존 `MadLeapHeader` navItems가 `/community`·`/study-room`·`/about`·`/portfolio` 같은 root path로 작성. middleware 도메인 rewrite가 적용된 `madleap.co.kr` / `madleap.tenone.biz`에서는 작동했으나 `tenone.biz/madleap` path 접근 시 404 위험. 전 항목 `/madleap/` 접두사로 표준화 (`UniverseUtilityBar` 패턴과 동일). `lib/site-config.ts` madleap.nav도 `/mlp/` → `/madleap/` 정정.

### ② Portfolio DB 연동 (commit `cb21776e`)

CLAUDE.md (MADLeap) 이월 작업 해소. mock 12개 → DB fetch.
- 신규 [smarcomm_portfolios](sql/madleap-portfolios.sql) 테이블 (title·team·gen·gen_num·category·client·description·tags[]·award·gradient·is_published·sort_order, RLS public read + service_role write)
- 신규 [PortfolioGrid.tsx](features/madleap/PortfolioGrid.tsx) — useState 필터 + grid (client)
- portfolio page를 Server Component로 재작성, `createAdminClient`로 fetch, ISR 5분

### ③ 시드 정직성 회복 (commit `16cb5a11`)

madleap.co.kr 실 사이트와 mock 데이터가 완전히 다른 가짜 데이터 발견 → 시드 전면 교체.
- 제거: 4기 지평주조(실제 3기), 3기 스타벅스(실제 4기), 무신사/당근/토스/배민/쿠팡/합정카페/에듀테크 7건 (madleap.co.kr 미존재)
- 도입: 4기 6 (아이디어 무브먼트 3·리제로스·MADVENTURE·대성학원·STARBUCKS·UNIQLO 매듭), 3기 8 (아이디어 무브먼트 2·지평주조·ECOHI·LG U+ 유플투쁠·ASKTobi·ESteem·Belkin·매듭 신규), 2기 3 (학폭예방·아이디어 무브먼트 1·SBA)
- [seed SQL](sql/madleap-portfolios-seed.sql) 보관해 재실행 대비

### ④ home·about 페이지 정직성 회복 (commit `ce799f58`)

운영진 실명 10명·동문 quote 3건·통계 4종·highlights 4건·instagram feed 6건·5기 30명 모두 검증 안 된 mock — 정직성 위반. 전면 제거.

**도입 (madleap.co.kr 원문):**
- 학생 목소리 3가지 ("선배님, 저 정말 광고 기획 제대로 배워 보고 싶어요" 등)
- 핵심 철학: "진짜 실력은 대외활동과 트로피의 갯수가 아니라, 실제로 성과를 만들어본 경험"
- 5대 가치 원문 순서: 확장·연결·발로 뛰다·세상을 기획하는 기획자·결과로 말하다
- 인재상 3: 전문가 성장·열망과 열정·소통과 협력
- 모집 안내: "매년 2~3월, 2년 활동 기준"
- 공지 채널: SNS·공식 홈페이지·에브리타임·링커리어
- 채널 3: 인스타 @madleap.official·blog.naver.com/madleap·official@madleap.co.kr

**페이지 구조:**
- about: Hero · Origin Story · MAD 의미 · 5대 가치 · 인재상 · 문의 (6 섹션)
- home: Hero · About Preview · Activities · 5대 가치 · Recruiting · Partners · Channels · CTA (8 섹션)

### 🎯 다음 세션 첫 액션

1. **MADLeap is_open 토글 결정** — 현재 `ums_sites.madleap.is_open=false` (외부 차단). 5기 모집·콘텐츠 정직성 회복 완료됐으니 공개 검토.
2. **MADLeap study_programs DB 연동** — `/madleap/study-room` 6개 프로그램 mock. madleap.co.kr 서브메뉴(공통·기획분과·제작분과)와 매핑 필요. 운영진이 실제 프로그램 콘텐츠 제공해야 함.
3. **MADLeap sub-pages 7종 검토** — madleap.co.kr "매드립 소개" 서브메뉴 (소개·연혁·프로그램·조직·세계관·멤버십·BI). 동적 페이지라 자동 fetch 불가, 운영진 콘텐츠 제공 후 작업.
4. **MADLeap 포트폴리오 카테고리·award·gradient·team 정확화** — 현재 17건 시드의 일부 메타데이터는 추정값. Intra UMS에서 운영진이 보강 가능한 페이지 필요할 수 있음.
5. **SmarComm 이월 (세션 150)** — VAPID Vercel Env 등록, 외부 키 발급, Web Push e2e 검증, 환각 감지 회귀 검증

---

## 세션 150 핵심 성과 (2026-05-25)

### ⑤ Phase 3.2 — Web Push (VAPID + 서비스 워커) 완료

이전 세션 잔재 점검 → VAPID 키 발급 + 권한 게이트 + 클라이언트 구독 컴포넌트 추가로 마무리.

- **VAPID 키 발급**: `npx web-push generate-vapid-keys` → `.env.local`에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY`·`VAPID_PUBLIC_KEY`·`VAPID_PRIVATE_KEY`·`VAPID_SUBJECT` 추가. **Vercel Env 동기화 필요** (Production+Preview+Development).
- **권한 게이트**: [app/api/smarcomm/push/send/route.ts](app/api/smarcomm/push/send/route.ts) — staff/manager/super_admin만 발송 가능 (member_roles 체크).
- **클라이언트 구독 컴포넌트**: [features/smarcomm/PushSubscribeButton.tsx](features/smarcomm/PushSubscribeButton.tsx) — 서비스 워커 등록 + Notification 권한 + PushManager.subscribe + API 호출. unsupported/denied/subscribed/unsubscribed 4상태.
- **오프라인 폴백**: [app/(SmarComm)/smarcomm/offline/page.tsx](app/(SmarComm)/smarcomm/offline/page.tsx) — `smarcomm-sw.js`의 `OFFLINE_URL` 대응.
- **검증**: `/smarcomm-sw.js` 200, `/smarcomm/offline` 200, push 페이지 컴파일 에러 0.
- **남은 사용자 액션**: Vercel Env에 VAPID 4개 등록, 푸시 알림 e2e 검증(실제 브라우저에서 구독→발송→수신).

### ④ Phase 3.4 — 환각 감지 (Hallucination Detection) 🥇 D.SaiO 핵심 차별점 대응

기존 `classifySentimentLLM`이 이미 factComparisons 생성하던 것을 활용 — 신규 LLM 모듈 불필요. 영속화 테이블 + UI만 추가.

- **신규 테이블**: `smarcomm_brand_facts` (ground truth) + `smarcomm_hallucinations` (감지 결과). 둘 다 RLS public-read, service_role 쓰기.
- **신규 모듈**: [lib/smarcomm/hallucination-persist.ts](lib/smarcomm/hallucination-persist.ts) — siteTruth → brand_facts, factComparison(wrong/partial/missing) → hallucinations
- **run-scan 통합**: smarcomm_ai_probes insert에 `.select('id,platform,query')` 추가하고 직후 persist 호출
- **API 확장**: [app/api/smarcomm/report/[id]/route.ts](app/api/smarcomm/report/[id]/route.ts) — brandFacts + hallucinations 동시 반환
- **신규 UI**: [features/smarcomm/HallucinationCard.tsx](features/smarcomm/HallucinationCard.tsx) — 정직성 원칙 반영
  - factual_error / partial_match / unverifiable 3단계 분류
  - Ground truth 없을 때 "검증 불가" 명시
  - AI 주장 vs 실제 사이트 값 병기, LLM explanation 노출
- **백필 검증**: hsad.co.kr scan에 기존 ai_probes.comparison 데이터를 새 테이블로 백필 (4 facts, 8 halls). UI 정상 렌더 확인 — AI가 "1974년" 잘못 주장 vs 실제 "1984년" 등.

### ③ Phase 3.5 — 랜딩 정량 콘텐츠 섹션 (How We Score)

PDF 22p + 사이트 8 URL 크롤 → 종합 정리. D.SaiO(GEO/AEO 자동 최적화 + 환각 감지)가 SmarComm Scan의 직접 경쟁자. 나머지(theCAP/theDAP/Growth/MMM)는 가격대·고객 규모 분리로 보완 관계. 벤치마크 4가지 도출: 환각 감지 / 정량 사례 표기 / L0/L1/L2 데이터레이크 / 5종 기여모델.

### ② Phase 3.5 — 랜딩 정량 콘텐츠 섹션 (How We Score)

D.Frame의 정량 표기 감각을 가져오되 SmarComm 정직성 원칙으로 변형. 가짜 "ROAS 200%→500%" 안 쓰고 실측 데이터만 노출.

- **신규**: [app/api/smarcomm/benchmark-stats/route.ts](app/api/smarcomm/benchmark-stats/route.ts) — 누적 분석 통계 API (ISR 10분)
- **신규**: [features/smarcomm/HowWeScoreSection.tsx](features/smarcomm/HowWeScoreSection.tsx) — 3카드 섹션 (산식 투명 공개 / 실측 누적 벤치마크 / 정직성 원칙)
- **수정**: [app/(SmarComm)/smarcomm/page.tsx](app/(SmarComm)/smarcomm/page.tsx) — Getting Started 앞에 배치
- **실측 데이터** (커밋 시점): 누적 19건 / Index 62 / F 84·T 57·C 48 / 등급 B15·C4

### ③ poppler-windows 설치 (PDF 페이지별 읽기)

choco 비관리자 권한 실패 → GitHub Release 직접 다운로드 → `C:\Users\cheon\poppler\poppler-26.02.0\Library\bin` 사용자 PATH 추가. Claude Code 재시작 후 Read 도구의 `pages` 파라미터 사용 가능.

### 🎯 다음 세션 첫 액션

1. **VAPID 4개를 Vercel Env에 등록** — `.env.local` 동일 키값을 Production/Preview/Development 모두에. Vercel Dashboard > Settings > Environment Variables
2. **Web Push e2e 검증** — 실제 브라우저에서 PushSubscribeButton 클릭 → 구독 → /api/smarcomm/push/send 호출 → 수신 확인
3. **외부 키 활성 확인** — OpenAI/Perplexity/SerpAPI/PageSpeed 4 플랫폼 (ANTHROPIC은 해결됨). 키 받으면 다음 신규 scan은 자동으로 환각 감지 파이프라인 통과
4. **환각 감지 회귀 검증** — 새 키 발급 후 실제 scan 1건 돌려서 Phase 3.4 end-to-end 흐름 확인 (백필이 아닌 실시간 capture)
5. **EmailCampaignModal 회귀 검증** — segments API e2e
6. **MADLeague upload API 검토** — 세션 142의 `app/api/madleague/upload/route.ts`

---

## 운영 방식 (2026-05-23 변경)

**단일 master 운영.** 멀티 워크트리·feature 브랜치 운영 폐기. CLAUDE.md § 3.4·4.1·4.2 단순화 완료. 평행 작업이 진짜 필요한 hotfix·장기 실험만 임시 워크트리 1개로 처리.

### 활성 backup 브랜치 (origin, 미머지 자산)

| 브랜치 | 내용 | 다음 처리 |
|---|---|---|
| `backup/myverse-canvas-share` | Myverse 캔버스 공유 (DB·API·UI·SQL 10 파일) | 충돌 해결 후 master 머지 (cherry-pick 권장) |
| `backup/smarcomm-phase4` | SmarComm Phase 4 (PDF·Wikidata KG·3 view mode) | V2.1과 중복 검토 후 부분 cherry-pick |
| `backup/myverse-camera` | Myverse 인앱 카메라 (세션 135) | 세션 134 캡쳐 Phase 2와 비교 후 통합 결정 |
| `claude/brave-margulis-2c2f3e` | 세션 135 SmarComm Index Phase 1~3 + Myverse — 이미 master에 흡수. origin 보존. | 다음 마스터 점검 시 origin 삭제 가능 |

---

## 세션 149 핵심 성과 (2026-05-23)

### ① SmarComm Phase 3.1.2 — 캠페인 작성 모달 UI (인라인 → 분리 컴포넌트 발전)

1단계 (lucid-poincare 워크트리): [app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx](app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx)에 "+ 새 캠페인" 버튼 + 인라인 모달(이름·제목·본문·프리헤더·버튼 라벨·URL·발신자 7필드 + POST `/api/smarcomm/email/campaigns`).

2단계 (nostalgic-bohr 워크트리, 머지): 인라인을 [features/smarcomm/EmailCampaignModal.tsx](features/smarcomm/EmailCampaignModal.tsx) 352라인 분리 컴포넌트로 발전 — 세그먼트 선택(`/api/smarcomm/crm/segments` 연동), 본문 작성/미리보기 탭, 테스트 발송 UI, person_ids 직접 입력. `page.tsx`는 import + 호출만.

**Phase 3.1.2 이월 작업 해소**: `body_html` 에디터(미리보기 탭) + 세그먼트 선택 + 테스트 발송 — 셋 다 단일 컴포넌트로 통합 구현.

### ② SmarComm 랜딩 hero 회전 카피·분석 경로 복구

[app/(SmarComm)/smarcomm/page.tsx](app/(SmarComm)/smarcomm/page.tsx):
- Marvis 단독 정적 카피("사장님 마케팅 비서…") → **20개 회전 헤드라인**(`HEADLINES` + `useEffect` referrer/UTM 매칭) 복원
- "라이트 진단 받기" → "무료 진단 시작" 복원, 안내 "회원가입 없이 · 30초 소요 · 완전 무료"
- 분석 진입 경로 `/smarcomm/marvis/scan` → `/smarcomm/scan?url=...` 복귀 (Marvis 라이트는 별도 진단 페이지로 운영, 메인 랜딩은 풀 SmarComm Index 진입)

### ③ WIO 15페이지 푸터 공통 컴포넌트화

[features/wio/WIOFooter.tsx](features/wio/WIOFooter.tsx) (이미 존재)를 wio/about·ai-matrix·contact·crm·data·e2e-flows·evaluation·framework·marketing·migration·page·presets·pricing·setup·solutions 15페이지에 일괄 적용 (-52/+44, 인라인 중복 제거).

### ④ MADLeague 전체 QA 머지 (세션 142 작업)

stoic-archimedes 워크트리의 미머지 commit 2개 (MADLeague QA — `rounded` 제거 + `inputCls` 통일 + 세션 142 docs) master 흡수. `app/(MADLeague)/madleague/...` 다수 페이지 + `programs/hero/page.tsx` 신규 + `app/api/madleague/upload/route.ts` 신규.

### ⑤ 워크트리 6개 → master 단독 정리

| 워크트리 | 처리 |
|---|---|
| vibrant-sammet-3259e9 | 이미 머지된 잔재 — 즉시 제거 |
| stoic-archimedes-af8400 | MADLeague QA → master 머지 → 제거 |
| lucid-poincare-0bda68 | SmarComm 모달 + 랜딩 → master 머지 → 제거 |
| nostalgic-bohr-9db6e3 | EmailCampaignModal 분리 → master 머지 → 제거 |
| charming-nash-cbdeed | WIO 푸터 공통화 → master 머지 → 제거 |

push 총 5회 중 master push 2회 (Vercel 빌드 2회). 분리 push 시 발생했을 6회+ 빌드를 묶음 머지로 절약.

### ⑥ 워크트리 운영 폐기 + CLAUDE.md 프로토콜 단순화

CLAUDE.md § 3.4 멀티 워크트리 SSOT 전체 제거 → "단일 master 운영 원칙"으로 대체. § 4.1 작업 시작 6단계 → 5단계. § 4.2 작업 종료 A/B 분리 제거 → 단일 흐름. WORK_STATUS의 활성 워크트리 표 폐지.

### ⑦ 랜딩 후속 정리 + 운영 교훈

- 랜딩 hero 아래 Marvis 4카드 섹션 삭제 (commit `ce4c99ff`) — "1탭·카페24·매일·Phase 1" 미완료 라벨 노출 정직성 원칙 적용
- **교훈**: 워크트리 삭제 시 dev server `preview_stop` 의무. 안 그러면 좀비 Node 프로세스가 사라진 경로의 `.next` 빌드를 계속 서빙해 master 변경이 안 보임 (이번에 좀비 1건 발견·정리)

### 🎯 다음 세션 첫 액션

1. **외부 키 활성 확인** — OpenAI/Perplexity/SerpAPI/PageSpeed 5 AI 플랫폼 전체 활성 여부 (ANTHROPIC_API_KEY는 `8f19b526` 재동기화로 해결 완료)
2. **SmarComm Phase 3.2 웹 푸시**: VAPID 발급 + 서비스 워커 + `smarcomm_push_subscriptions` 테이블 (Phase 3 설계서 § 4)
3. **SmarComm EmailCampaignModal 회귀 검증**: 실제 segments API 응답 확인 + 테스트 발송 흐름 e2e
4. **MADLeague upload API 검토**: 세션 142의 `app/api/madleague/upload/route.ts` 인증·용량·MIME 정책 점검
5. **Marvis #1·#3·#4 (카페24 dev sandbox 등록 후)** — 사용자 직접 작업 대기

---

## 세션 148 핵심 성과 (2026-05-21)

### ① 전 브랜드 헤더 nav·UtilityBar 링크 일관성 일괄 정렬

**계기**: SmarComm preview 오픈 중 우측 유틸리티 바 5건 깨짐 발견 (`/blog`, `/pricing`, `/#process`, `/about`, `/signup` 모두 tenone 루트 가리킴) — CLAUDE.md §1.2.1·§1.9.2 위반.

**점검**: Explore agent로 features 전 헤더 28개 컴포넌트 전수 스캔. 17~20건 동일 패턴 깨짐 식별 + 도메인 path 오류(ogamja `/ogamja/...` vs 실제 `/0gamja/...`) 추가 발견.

**일괄 수정 — 23개 파일, 60+ Edit**:

| 카테고리 | 수정 건수 | 브랜드 |
|---|---|---|
| `signupPath="/signup"` → `/{brand}/signup` (UtilityBar prop) | 18건 | badak·changeup·domo·fwn·hero·jakka·madleague·madleap·mindle·montz·mullaesian·myverse·myverse/app·myverse/planner·naturebox·rook·seoul360·smarcomm·townity·wio·youinone·brandgravity |
| 모바일 메뉴 `<Link href="/signup">` → `/{brand}/signup` | 14건 | changeup·domo·fwn·jakka·madleague·madleap·montz·mullaesian·myverse·myverse/app·myverse/planner·naturebox·rook·seoul360·smarcomm·townity·youinone |
| navItems 앵커 `/#xxx` → `/{brand}#xxx` | 11 링크 (3 브랜드) | mullaesian·naturebox·townity |
| `hideAbout` 추가 (about 페이지 미존재) | 8 브랜드 | brandgravity·montz·mullaesian·naturebox·seoul360·smarcomm·townity·youinone |
| ogamja 도메인 path 정렬 (`/ogamja/...` → `/0gamja/...`) | 3건 | ogamja |

**검증**: SmarComm preview 회귀 0, 우측 바 7요소 표준 부합 (`서비스/블로그/요금제/로그인/가입/공유/검색` 모두 `/smarcomm/...` 또는 button). 컴파일 에러 0.

### ② 잔여 (다음 세션 또는 별도 결정)

- `features/smarcomm/Header.tsx` (사용처 0 dead code, 2건 잔여 깨짐) — 삭제 결정 필요
- 로고 `<Link href="/">` 패턴 (mullaesian·townity·naturebox·ogamja 등) — SmarCommHeader처럼 `currentPath.startsWith('/{brand}') ? '/{brand}' : '/'` 분기 도입 검토
- 일부 브랜드 `/{brand}/signup` 페이지 미존재 — 클릭 시 404 가능 (다만 SmarComm 등 주요 브랜드는 페이지 존재)

### 🎯 다음 세션 첫 액션

옵션 1·2·3 (세션 147 종료 시점) 그대로 + 추가:
- **옵션 4**: 잔여 dead code 정리 (features/smarcomm/Header.tsx 삭제) + 로고 분기 일관화

---

## 세션 147 핵심 성과 (2026-05-21)

### ① SmarComm Phase 3.1 옵션 A 완료 — 이메일 발송 헬퍼 분리

[docs/SmarComm_Phase3_Plan.md §9-C](docs/SmarComm_Phase3_Plan.md) 옵션 A 5 액션 모두 완료.

**A1. 헬퍼 신설** — [lib/email/send-broadcast.ts](lib/email/send-broadcast.ts)
- 인트라 `route.ts` 71~228줄 발신자 검증·대상자 조회·배치 발송·`email_sends` 로깅·status 갱신 로직을 `sendCampaignBroadcast({campaignId, testEmails?, scheduledAt?, supabase, adminSupabase})`로 추출
- 에러 클래스 `BroadcastError(message, status)` — caller가 NextResponse status로 매핑
- 내부 헬퍼 `resolveTargets()` 분리

**A2. 인트라 리팩** — [app/api/intra/crm/broadcast/send/route.ts](app/api/intra/crm/broadcast/send/route.ts)
- 229줄 → 43줄. 인증·`RESEND_API_KEY` 체크는 헬퍼가 담당, caller는 인증 + try/catch만
- 응답 형식 동일 유지 (기존 호출 측 회귀 0)

**A3. 스키마 확장** — [sql/crm-campaigns-owner-columns.sql](sql/crm-campaigns-owner-columns.sql)
- `crm_campaigns.created_by_service TEXT NOT NULL DEFAULT 'intra' CHECK IN ('intra','smarcomm')`
- `crm_campaigns.owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL`
- 부분 인덱스: `idx_crm_campaigns_service_owner WHERE created_by_service='smarcomm'`
- RLS 정책 추가: `"crm_campaigns smarcomm owner"` — SmarComm 사용자 본인 캠페인만 ALL
- Prod 적용 완료 (HTTP 201)

**A4. SmarComm send 라우트** — [app/api/smarcomm/email/send/route.ts](app/api/smarcomm/email/send/route.ts)
- 1차 RLS + 2차 코드 검증 (`created_by_service='smarcomm'` AND `owner_user_id=user.id`)
- 통과 시 공용 헬퍼 호출
- TODO Phase 3.1.2: `wio_subscriptions` 한도 검증

**A5. UI** — [crm/email/page.tsx](app/(SmarComm)/smarcomm/dashboard/crm/email/page.tsx) + [campaigns route](app/api/smarcomm/email/campaigns/route.ts)
- GET/POST `/api/smarcomm/email/campaigns` (본인 SmarComm 캠페인 list·create)
- "내 캠페인" 테이블 섹션: name·subject·status 칩·recipient·생성일·액션
- "지금 발송" 버튼 (status=draft/scheduled만 활성, sending 중 disabled + Loader2)
- 캠페인 작성 모달 UI는 Phase 3.1.2 (현재는 API POST 또는 인트라에서 생성)

**검증**: dev 서버 200, LoginModal 게이트 정상, `/api/smarcomm/email/{campaigns,send}` 비인증 401, 서버·콘솔 에러 0. 인증 후 end-to-end 발송은 Phase 3.1.2 모달 완성 시점에 진행.

### ② 작업 종료 시점 갱신

- master 단독에서 진행, 새 워크트리 없음
- 세션 146 워크트리 정리 commit `8bbedac8` + 세션 147 commit이 origin/master에 push 예정

### 🎯 다음 세션 첫 액션 (세션 147 종료 시점 갱신)

**옵션 1: Phase 3.1.2 (캠페인 작성 모달 UI)** — 1 세션
1. `features/smarcomm/EmailCampaignModal.tsx` 신설 — name·subject·body_text·body_html·sender_id·segment_id·person_ids 입력
2. 본문 에디터: Markdown or 간단 textarea + HTML preview
3. 세그먼트 선택: `/api/intra/crm/segments` 재사용 또는 SmarComm 전용 list
4. 테스트 발송 버튼 (testEmails 1개 + Send Test)
5. 모달 → POST `/api/smarcomm/email/campaigns` → list refresh

**옵션 2: Phase 3.2 (웹 푸시)** — 1 세션
1. VAPID 키 생성 (`web-push` lib) + `.env.local`·Vercel Env 등록
2. `sql/smarcomm-push-subscriptions.sql` 신설 + 적용
3. 서비스 워커 + Subscribe 버튼
4. `/api/smarcomm/push/send` 라우트

**옵션 3: D1~D7 결정 후 Phase 3.3 (카카오 알림톡)** — Solapi 계정·승인 템플릿 필요

---

## 세션 145 핵심 성과 (2026-05-21)

### ① SmarComm Workspace 32개 페이지 감사 + orphan 정리

**감사 결과**: 사이드바 32개 메뉴 모두 페이지 파일 존재(404 0건). 사이드바 외 orphan stub 6개(`analytics`, `data-reports`, `geo/{brand,competitors,tracking}`, `workflow/pipeline`) 발견 → 삭제. `lib/smarcomm/workflow-context.tsx`(mock-only 사본)는 어디서도 import 안 됨 → 삭제. 사이드바 사용 중인 `lib/workflow-context.tsx`(루트)는 이미 `/api/smarcomm/workflow/*` API 동기화 완료 — 추가 작업 불필요.

`app/(SmarComm)/smarcomm/dashboard/layout.tsx`의 `MOCK_PATH_PREFIXES`에서 지운 5개 + `nameMap`에서 잔재 6개 항목 청소.

### ② TierGate SSOT 신설 + 페이지 자동 보호

**문제**: 기존 `features/smarcomm/TierGate.tsx`가 **stale** — tier 명칭(`starter/growth/pro/enterprise`)이 sidebar(`free/starter/pro/business`)와 불일치, `useAuth()` 직접 판정해 `/api/smarcomm/me/plan` 미사용, 어디서도 import 안 됨.

**해결**:
- [lib/smarcomm/tier-policy.ts](lib/smarcomm/tier-policy.ts) **신설 SSOT** — `UserTier`, `TIER_ORDER`, `TIER_LABELS`, `PACK_TIER`, `PATH_TO_PACK`, `getRequiredTier(pathname)`, `hasAccess()`
- [features/smarcomm/TierGate.tsx](features/smarcomm/TierGate.tsx) **리팩** — 4-tier 통일, `/api/smarcomm/me/plan` API 사용, `/smarcomm/pricing` 링크
- [features/smarcomm/DashboardSidebar.tsx](features/smarcomm/DashboardSidebar.tsx) — `PACK_TIER`·`UserTier`·`TIER_ORDER` 모두 SSOT에서 import
- [app/(SmarComm)/smarcomm/dashboard/layout.tsx](app/(SmarComm)/smarcomm/dashboard/layout.tsx) — `<TierGate requiredTier={getRequiredTier(pathname)}>` 으로 children 자동 wrap → **페이지 20개 손 안 대고 티어 게이트 적용**

**검증**: master_email 자동 business → 모든 페이지 200 ✓. `/smarcomm/pricing`이 DB `wio_subscription_plans`에서 Free/Starter/Pro/Business 4-tier 동적 렌더 → TierGate 명칭과 정합 ✓.

### ③ SmarComm Phase 3 설계서 작성

[docs/SmarComm_Phase3_Plan.md](docs/SmarComm_Phase3_Plan.md) 10 섹션. 사용자 의사결정 7개(D1~D7) + 구현 옵션 3개(§9 A/B/C) 정리.

**핵심 발견 (이 세션)**: 인트라에 이미 작동하는 풀스택 이메일 발송 인프라 존재 — `/api/intra/crm/broadcast/send/route.ts` 229줄에 Resend 배치·세그먼트·예약·변수치환·List-Unsubscribe·email_sends 로그 구현 완료. SmarComm Phase 3.1은 새로 만드는 게 아니라 **재사용 vs 재구축** 결정 문제. 권장: **옵션 A (공용 헬퍼 추출 + SmarComm 라우트 신설)** — 1.5 세션.

**모순 발견**: `smarcomm_broadcasts`(BroadcastPage용, 발송 X) vs `crm_campaigns`(인트라용, 발송 O) 2개 시스템 분리 — CLAUDE.md §1.10 위반 소지. 옵션 C(통합)로 가는 길의 1단계로 옵션 A 자연스러움.

### ④ 워크트리 의존성 + dev 서버 정상화

- `npm install` (워크트리에 의존성 부재)
- `npm install lightningcss-win32-x64-msvc` (Tailwind v4 Windows native binding 누락)
- `.next` 캐시 정리 + dev 서버 재기동
- 모든 페이지 200 회귀 없음 확인

### ⑤ 라이트 진단 제거 + WORK 드롭다운 Myverse 제거 (세션 시작 시점)

- `app/(SmarComm)/smarcomm/marvis/scan/page.tsx` + `marvis/report/[id]/page.tsx` 삭제
- `marvis/page.tsx` FeatureCard href `/smarcomm/marvis/scan` → `/smarcomm`
- `scan/page.tsx` `from=marvis` 분기 제거 (항상 `/smarcomm/report/[id]`로)
- `components/UniverseUtilityBar.tsx` `WORKSPACE_REGISTRY`에서 Myverse 제거 (Myverse는 개별 서비스, 워크스페이스 아님)

### 🎯 다음 세션 첫 액션 (세션 145 종료 시점 갱신)

**사용자 결정 필요** (Phase 3.1 진입 전):
1. **§9 옵션 A/B/C 중 선택** — [docs/SmarComm_Phase3_Plan.md §9](docs/SmarComm_Phase3_Plan.md) 비교 후. 권장: **A (공용 헬퍼 추출 + SmarComm 라우트)** — 1.5 세션.
2. **D1~D7 결정** — 카카오 공급사·푸시 범위·자동화 인프라 (§7 표).

**옵션 A 선택 시 Claude 첫 5 액션** (§9-G):
1. `lib/email/send-broadcast.ts` 신설 — `/api/intra/crm/broadcast/send/route.ts:71-228` 추출
2. 인트라 라우트가 헬퍼 호출하도록 변경 + 회귀 테스트
3. `crm_campaigns`에 `tenant_owner`/`created_by_service` 컬럼 추가 (smarcomm 격리)
4. `/api/smarcomm/email/send/route.ts` 신설 — SmarComm 권한 검증 + 헬퍼 호출
5. SmarComm `/dashboard/crm/email/page.tsx`에 "내 캠페인" 섹션 + 발송 버튼 (UI 모달은 Phase 3.1.2)

---

## 세션 144 핵심 성과 (2026-05-20)

### ① ANTHROPIC_API_KEY "만료" 오해 표현 전수 정정

**문제**: WORK_STATUS·CHANGELOG·코드 6곳에 "ANTHROPIC_API_KEY 만료/갱신 필요"로 적혀 있어, 매번 시간 만료되는 것처럼 미래 세션이 오해. 실제 Anthropic 키는 revoke·rotate되지 않는 한 영구 유효 — 매 세션 갱신할 일 아님. 401은 (a) env 불일치, (b) 회수/회전, (c) 결제·크레딧, (d) workspace 변경 중 하나의 원인.

**정정 위치 7곳**:
- [lib/agent/claude.ts:347-356](lib/agent/claude.ts:347) — 사용자 노출 401 메시지: "자동 만료 아님 + 4가지 원인 진단 + 1회 셋업 복구" 박스로 재작성
- [WORK_STATUS.md:42](WORK_STATUS.md:42) — 다음 첫 액션 #1 진단 순서 ①②③ + "매번 갱신할 일 아님" 명시
- [WORK_STATUS.md:101](WORK_STATUS.md:101) — 세션 142 성과 #5 문구
- [WORK_STATUS.md:103](WORK_STATUS.md:103) — 알려진 차단 박스: "자동 만료가 아니므로 매번 갱신할 일 아님" 강조
- [app/(Dokdae)/CLAUDE.md:91](app/(Dokdae)/CLAUDE.md:91) — Dokdae 가이드 동일 정정
- [app/api/smarcomm/creative/generate/route.ts:178](app/api/smarcomm/creative/generate/route.ts:178) — API hint
- [app/api/smarcomm/advisor/campaign-plan/route.ts:70](app/api/smarcomm/advisor/campaign-plan/route.ts:70) — API hint
- [app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) §15 — 이월 작업 + 블로커 표현 정정

### ② Marvis 진단 (#2) 즉시 활성화

**문제**: `/smarcomm/marvis/scan`의 "진단 시작" 버튼이 [marvis/scan/page.tsx:55-60](app/(SmarComm)/smarcomm/marvis/scan/page.tsx:55)에서 `disabled` 하드코딩 + "Phase 1에서 활성화" 안내. 사용자가 "분석 자체가 안 됨" 보고.

**해결**: `disabled` 해제 + `handleSubmit` 추가. URL 검증(`new URL`·hostname dot check) 통과 시 `/smarcomm/scan?url={encoded}&from=marvis`로 라우팅. 기존 작동 중인 SmarComm Index 엔진(`/api/smarcomm/scan` → `runFullScan` → `/smarcomm/report/[id]`)을 그대로 위임 — 라이트화는 차후 세션에서 결과 페이지 variant로.

**정직성 보존**: ANTHROPIC_API_KEY 401 상태에서도 기술 SEO·Schema·CWV 측정은 작동, Citability는 N/A. 가짜 Mock 데이터 노출 0.

**검증**: tsc 0 에러. 화면 검증은 dev 서버가 dangling 워크트리(`cranky-murdock-a0c05b`)에서 가동 중이라 보류 — 다음 세션에서 서버 정리 후 재검증.

### 🎯 다음 세션 첫 액션 (세션 144 종료 시점 갱신)

**사용자 직접**:
1. **ANTHROPIC_API_KEY 401 진단** — 위 ① 참조. console.anthropic.com → `.env.local` 3곳 ↔ Vercel Env 동기화 확인 → 1회 셋업으로 종결.
2. **카페24 dev sandbox 등록 + webhook 실측** — Marvis #1·#3·#4 모든 데이터 소스의 전제. cart 제외 order·review만. https://developers.cafe24.com

**코드 작업**:
3. **Dangling 워크트리 정리** — `cranky-murdock-a0c05b` 디렉토리 + dev 서버 stop → 미커밋 검증 → 디렉토리 삭제 → origin 백업 판단.
4. **Marvis #2 진단 결과 라이트화** — `/smarcomm/report/[id]?from=marvis` 또는 `/smarcomm/marvis/report/[id]` 신규 — 종합 점수 + 등급 S/A/B/C/D + 핵심 권고 3개만 노출. 풀 진단(5 AI 플랫폼·Schema Generator·Trend)은 Pro 게이트.
5. **Marvis #1 대시보드 — 카페24 연동 자리** — `/smarcomm/marvis/page.tsx`의 `connection="not_connected"` 하드코딩 해제. `lib/marvis/connection.ts` 신규: `getConnectionState(userId)` 함수가 `marvis_connections` 테이블 조회. 테이블 없을 땐 정직하게 "not_connected" 반환. 다음 단계 카페24 OAuth 연결 화면 자리만 준비.
6. **Marvis #3 RFM 백엔드 골격** — `lib/marvis/rfm.ts` + SQL: `marvis_orders`(주문 sync), `marvis_customers`(RFM 점수), `marvis_drafts`(AI 초안). webhook 도착 즉시 작동하도록 함수만 미리. 데이터 없으면 빈 결과.
7. **Marvis #4 이메일 1탭 승인** — `/api/marvis/approve` POST 라우트 + Resend 발송 함수 + 사장님 승인 UI. 실 데이터는 webhook 후.
8. **TierGate 3티어 통일** — `marvis|pro|platinum` 단일화 + PACK_TIER 재조정.
9. **Marvis USER_SCENARIO** — "박정수(1인 사장님) 4주 흐름" 신설.
10. **Jakka 실결제 PG 연동** (Phase 2-B): 별도 트랙.

---

## 세션 142 핵심 성과 (2026-05-19)

### ✅ MADLeague 전체 디자인 QA 완료

`app/(MADLeague)/**/*.tsx` 전수 검토:
- `rounded-*` 위반 전량 제거 (my, projects, pt, certificate/print 등)
- `<style>` 블록 → `inputCls` Tailwind 상수 교체 (apply, hero, madzine/write 등)
- `programs/hero/page.tsx` 신규 추가
- `api/madleague/upload/route.ts` 신규 추가
- 예외 허용: `h-3` 이하 컬러 도트 `rounded-full` / print CSS `<style dangerouslySetInnerHTML>`

### 🎯 다음 세션 첫 액션 (세션 143 종료 시점 갱신)

**사용자 직접 (시크릿·외부 등록)**:
1. **ANTHROPIC_API_KEY 401 진단** — Anthropic 키는 시간 만료되지 않음(revoke·rotate 외 영구 유효). 매번 갱신할 일 아님. 진단 순서: ① console.anthropic.com/settings/keys에서 active/revoked 확인 ② `.env.local`(집·사무실) ↔ Vercel Env 3곳 키 prefix 일치 확인 ③ console > Billing 카드·잔액 점검. 원인 확정되면 새 키 1개 발급 → 3곳 동일 셋업(반복 갱신 아님). `dokdae.tenone.biz` 단체방 실 LLM 응답 차단 중. Supabase Edge Function 키는 별개로 유효(trend-crawl 정상).
2. **카페24 dev sandbox 등록 + webhook 실측** — Marvis Phase 1 MVP의 데이터 파이프 전제조건. cart는 미루고 order·review 안정성만 확인. https://developers.cafe24.com 가입 → 앱 등록 → 테스트 스토어 webhook 실측.

**코드 작업 (다음 세션 Claude 진행 가능)**:
3. **Marvis Phase 1 — 재구매 1 시나리오 구현** (4주 일정): `marvis_orders`·`marvis_customers`·`marvis_drafts` 테이블 + RFM 계산 + Claude 초안 + `/api/marvis/approve` → Resend 발송. CLAUDE.md § 1A "MVP 시나리오" 표 기준.
4. **SmarComm 랜딩 페이지 나머지 섹션 정리** — `/smarcomm`의 "GEO + SEO 통합 점검"·"Getting Started"·"Our Tools" 등을 Marvis 컨텍스트로 재편 또는 숨김. Hero·Marvis 4가치는 세션 143 완료.
5. **TierGate 3티어 통일** — `starter|growth|pro|enterprise` (TierGate.tsx) + `free|starter|pro|business` (DashboardSidebar.tsx) 두 불일치 시스템을 `marvis|pro|platinum` 단일화 + PACK_TIER 매핑 재조정.
6. **Marvis 사용자 시나리오(USER_SCENARIO)** — 기존 "김지원(D2C 마케터)"은 Pro 시나리오. Marvis용 "박정수(1인 사장님) 4주 흐름" 신설.
7. **Jakka 실결제 PG 연동** (Phase 2-B): 토스/포트원 결정 → `/api/jakka/checkout` + 콜백·웹훅. 1~2 세션. (Marvis MVP와 별도 트랙)

---

### MoNTZ + Jakka 소비자 동선 UX 5축 고도화 (commit `42472ae0`)

수요자 관점 마찰점 진단 후 즉시 강화:
- **MoNTZ 홈**: hero 안내 + 3 CTA + 양방향 진입 카드 (FOR CASTING / FOR CREATOR)
- **MoNTZ [handle]**: placeholder 팔로우·DM → "캐스팅 제안"(메인) + "공유"(navigator.share + 클립보드 폴백, 2초 피드백) 교체
- **MoNTZ explore**: 빈 상태 컨텍스트 안내 + "전체 보기" 1클릭 리셋
- **Jakka explore**: 빈 상태 + 모바일 전용 추천 카테고리 6개 (데스크톱 추천 패널 갭 해소)
- **Jakka market 상세**: 가격 아래 신뢰 신호 3분할(조회·찜·수수료) + "구매 절차 3단계 + 작가 직접 발송" 정직 안내

---

### MoNTZ 양방향 활성화 — 작품 업로드 + 캐스팅 컨택 + 오디션 응시

**타겟 매트릭스 분석 → "모델·배우 ↔ 캐스팅 디렉터" 양방향 끊김 해소** 패키지. 1세션 안에 인프라부터 UI까지 끝.

**Phase 1 인프라 (DB · Storage)**: Storage 버킷 `montz-works` (10MB, jpeg/png/webp) + 사용자 폴더 분리 RLS · `montz_contact_requests` 테이블 + 인덱스 + RLS · `montz_audition_applications` 테이블 + `(audition_id, creator_id)` UNIQUE + RLS

**Phase 2 라이브러리 함수 11개** ([lib/supabase/montz.ts](lib/supabase/montz.ts)): `uploadWorkImage`·`createMyWork`·`getMyWorks`·`deleteMyWork` · `sendContactRequest`·`getMyReceivedContacts`·`updateContactStatus` · `applyAudition`·`getMyApplications`

**Phase 3 작품 업로드 페이지** ([app/(MoNTZ)/montz/upload/page.tsx](app/(MoNTZ)/montz/upload/page.tsx)): 인증·크리에이터 게이트 + 폼(제목·카테고리·설명·태그·이미지 5장) + Storage 병렬 업로드 + 본인 포트폴리오 리다이렉트

**Phase 4 캐스팅 컨택**:
- [app/api/montz/contact/route.ts](app/api/montz/contact/route.ts) — Admin 클라이언트로 RLS 우회 INSERT + 모델 `user_id` → `auth.users.email` 조회 + Resend 이메일 발송
- [features/montz/ContactModal.tsx](features/montz/ContactModal.tsx) — 비로그인 가능, 로그인 시 sender_user_id 자동 첨부
- [app/(MoNTZ)/montz/[handle]/page.tsx](app/(MoNTZ)/montz/[handle]/page.tsx) — "DM 보내기" → "캐스팅 제안" 버튼 (#c8a97e Send 아이콘)

**Phase 5 오디션 응시**:
- [app/api/montz/applications/route.ts](app/api/montz/applications/route.ts) — Bearer 인증 + 중복 체크(`23505` 처리) + 캐스팅 디렉터(`audition.contact_email`)에게 Resend 이메일
- [features/montz/AuditionApplyModal.tsx](features/montz/AuditionApplyModal.tsx) — 비로그인 안내·차단, message + applicantEmail
- [app/(MoNTZ)/montz/audition/page.tsx](app/(MoNTZ)/montz/audition/page.tsx) — DetailView 최상단 "이 공고에 응시하기" 버튼

**Phase 6 /montz/my 3 신규 탭**:
- 내 작품: 그리드 + 호버 삭제 + "새 작품 업로드" CTA
- 받은 제안: 카드 + 수락/거절/확인만 액션 + pending 카운트 배지 강조 + mailto 답장
- 신청 오디션: 카드 + 상태 5단계 + 마감일 표시
- Lazy fetch — 활성 탭만 호출

**Phase 7 검증·문서**: [app/(MoNTZ)/CLAUDE.md](app/(MoNTZ)/CLAUDE.md) Phase Alpha → **Beta** 갱신, 신규 흐름 3건 명세, DB 6 테이블 표

### 단체방 채팅 환경 고도화 2차 + API 401 친절화

채팅 환경 1차(아바타·@멘션·인디케이터)에 이어 카카오톡 수준 4축 추가:

1. **참여자 시트** — 헤더 "👥 N" 버튼 → 오른쪽 슬라이드 시트. 28명 layer 4그룹(L0/L1/L2/L3) 그리드, 각 항목 "@멘션 / 1:1" 2버튼. 상단에 라우터 통계 Top 5 칩 (지난 100개 `dokdae_routing` 메시지 집계)
2. **@멘션 자동완성** — 입력 끝에 `@\w*` 패턴이면 매칭 에이전트 6명 dropdown(입력바 위 가로 스크롤). 1001은 후보 제외
3. **메시지 검색** — 헤더 돋보기 아이콘 토글 → 검색 입력. `text.toLowerCase().includes(q)` 필터. 결과 없으면 안내
4. **연속 발화 아바타 생략** — 같은 에이전트가 연속이면 아바타 생략 (카카오톡 패턴)
5. **API 401 친절화** — [lib/agent/claude.ts](lib/agent/claude.ts) Anthropic 401일 때 raw JSON 대신 "자동 만료 아님 + 4가지 원인 진단(키 불일치/회수/결제/workspace) + 1회 셋업 복구" 안내. 429/529도 명확 메시지

> **알려진 차단**: `ANTHROPIC_API_KEY` 401 → 1:1·단체방 실 LLM 호출 차단. **자동 만료가 아니므로 매번 갱신할 일 아님** — `.env.local`(집·사무실) ↔ Vercel Env 3곳 키 불일치, 회수/회전, 결제 상태 중 하나로 진단 후 1회 셋업으로 종결. Supabase Edge Function 키는 별개, trend-crawl 정상 가동.

### 독대 → Universe 단체방 채팅 환경 고도화

MVP에 이어 채팅 환경 4축 고도화:

1. **히스토리 로드 분리** — `selectedAgent.name` 변경 시 useEffect 재실행. 단체방 모드는 `to_agent='group'` 필터로 라우팅+사용자+에이전트 메시지 80건 로드. 1:1 모드는 기존 `from/to user↔agent`. 모드 전환 시 화면 적절히 비움
2. **에이전트 아바타** — `AgentAvatar` 컴포넌트 신설. layer 4단계 컬러(L0 노랑·L1 에메랄드·L2 인디고·L3 퍼플) + 이니셜(한글 1자/영문 대문자 1~2자). 텐원 로고는 1001/legacy에만 사용
3. **@멘션** — 입력에 `@{name}` 패턴 감지 시 라우터 우회. 매칭은 `name` 일치 또는 `display_name` 부분 일치. 1001은 항상 제외. 실패 시 일반 라우터로 폴백. 본문에서 `@\w+`는 노랑 강조 렌더
4. **타이핑 인디케이터** — 단체방 모드에 별도 "🌌 Universe 단체방 — 1001 라우팅 + 에이전트 응답 작성 중" 배지. 1:1은 기존 텐원 로고 + 분석 중 패턴
5. **입력 placeholder 힌트** — 단체방일 때 "@mindle" 가이드 표시

### 독대 → Universe 단체방 승격 MVP

DokDae CLAUDE.md 이월 작업 "다중 Agent 지원" 해소. 텐원이 1:1로만 가능했던 독대를 텐원 AI 팀 28명 단체 채널로 확장.

**구현 (코드 변경)**:
- [app/api/agent/dokdae/route.ts](app/api/agent/dokdae/route.ts) — `mode` 파라미터 추가. `mode='group'`이면 `decideRoutingHaiku()` (Haiku 라우터로 1~3명 선택) → `Promise.all`로 병렬 `invokeAgent()` → 응답 배열 반환. 1001은 라우터 역할만 (응답자에서 제외, 비용 절감)
- [app/(Dokdae)/dokdae/page.tsx](app/(Dokdae)/dokdae/page.tsx):
  - `GROUP_AGENT` 상수 신설 (`name:'_group'`)
  - `Message.role`에 `'router'` 추가 (1001 결정 메모 슬림 박스)
  - `Bubble`에 발신 에이전트 라벨·layer 컬러 도트
  - `send()`에서 group 모드 응답 배열 처리 (라우터 메모 + N개 에이전트 메시지 시퀀스 추가)
  - SideMenu 최상단에 "🌌 Universe 단체방" 옵션 (인디고 강조)
- [app/(Dokdae)/CLAUDE.md](app/(Dokdae)/CLAUDE.md) — 운영 모드 2종 + 단체방 메시지 패턴 + 비용 명세

**메시지 패턴** (`agent_messages` 활용, 스키마 변경 0):
- 텐원 입력: `from='user', to='group', payload.mode='group'`
- 라우터 결정: `from='1001', to='group', type='dokdae_routing', payload.agents=[...]`
- 각 응답: `from='{agent}', to='group', type='dokdae_chat', payload.agentName/layer`

**검증**:
- TypeScript 0 에러
- `/dokdae` 페이지 200 (`SiteClosedOverlay` 가림막 정상 작동, LoginScreen 빌드 정상)
- 실 LLM E2E는 staff 로그인 필요 → 사용자 테스트 단계

### Lane A — trend-crawl 27일 정지 복구

[supabase/functions/trend-crawl/index.ts](supabase/functions/trend-crawl/index.ts) `source_type` NOT NULL 누락 패치 + 재배포 (v7→v8). 직후 5분 만에 collected_data 237 신규행 + mindle_trends 3 카드 생성 검증.

### Lane B — 에이전트 SSOT 갱신

- [docs/TenOne_Agent_State.md](docs/TenOne_Agent_State.md) 신규 — 실측 v2.5 (28 에이전트·11 Edge Function·pg_cron 4 job·미해소 6건)
- [CLAUDE.md](CLAUDE.md) §0 OpenClaw 가동 상태 정정 + SSOT 참조

### Phase 2-A 구독 인프라 시드 보강 + commerce/subscriptions 정직성 회복

ROADMAP Phase 2-A "구독 테이블 구축"의 stale 표기를 실측 기반으로 정정하고, 누락 시드 4건 + UI Mock fallback 제거.

#### ① Prod DB 실측 진단 (점검 결과)

| 객체 | 상태 |
|---|---|
| `wio_subscription_plans` | ✅ 테이블 + RLS + 11행 (WIO 5 / SmarComm 4 / Mindle 2) |
| `wio_subscriptions` | ✅ 테이블 + RLS + 활성 3건 (wio·youinone·evschool) |
| `wio_tenants` · `auth_is_staff()` | ✅ |

#### ② 무결성 위반 발견 (미해결 — 차기 세션 이월)

`wio_subscriptions` 활성 구독 2건이 `plan_id IS NULL`:
- `youinone/premium` (id 8fac448b-...)
- `evschool/course` (id c1ae6b5c-...)

원인: 해당 service의 'premium'·'course' plan이 미시드된 채 구독 row만 선행 INSERT됨. 해결 순서 — 유료 티어 가격 결정 → plan 시드 → plan_id 백필 UPDATE. 임시로 'free' plan 가리키게 만들면 결제·기능 게이트 왜곡되므로 금지.

#### ③ Free 플랜 시드 4건 INSERT (Prod 적용 + SQL 파일 갱신)

[sql/wio-subscription-plans.sql](sql/wio-subscription-plans.sql) 끝에 추가 + Prod에 직접 INSERT:

```
badak/free · hero/free · evschool/free · youinone/free
price_monthly=0, max_members=1, features='[]'::jsonb
ON CONFLICT DO NOTHING
```

`features` 빈 배열은 의도적 — 유료 티어 설계 시 함께 채움 (§ 1.10 정직 원칙: 임의 추정 금지).

#### ④ commerce/subscriptions UI 정직성 회복 (§ 1.10)

[app/intra/ums/commerce/subscriptions/page.tsx](app/intra/ums/commerce/subscriptions/page.tsx):
- 제거: `mockServiceStats` (가짜 6 서비스) · `mockChurnData` (6개월 가짜 추이) · `mockCrossSell` (4 가짜 기회) · `mockSubs` (10명 가짜 구독자) · `ChurnItem`·`CrossSellItem` 타입 · 미사용 import (`AlertTriangle`·`ArrowUpRight`·`CreditCard`)
- 변경: useState 초기값 모두 `[]`. 라이브 데이터 0건이면 가짜로 채우지 않음
- 추가: 빈 상태 안내 3 세션 — Service Stats(활성 구독 0 안내) · 이탈률/LTV(누적 후 활성화) · 크로스셀(2 서비스 이상 누적 시 활성화) + 테이블 빈 상태
- 추가: `serviceLabels` 매핑 (lowercase service id → 표시명) — DB 키와 UI 라벨 분리

#### ⑤ ROADMAP Phase 2-A 정정

기존 `[ ]` 3건 → `[x]` 5건 + 남은 `[ ]` 2건:
- 신규 `[ ]` Badak·HeRo·EvSchool·YouInOne 유료 티어 가격·기능 정책 결정
- 신규 `[ ]` 무결성 위반 백필 (youinone/premium·evschool/course plan_id NULL)

경로 정정: `/intra/universe/subscriptions` (stale) → `/intra/ums/commerce/subscriptions` (실제)

#### ⑥ 검증

- TypeScript: `npx tsc --noEmit` 0 에러 (commerce/subscriptions 관련)
- Dead reference: `Grep churnData|crossSell|ChurnItem|CrossSellItem` → 0건
- 페이지 200 응답 + staff 게이트 정상 작동 (비로그인 시 인트라 로그인 화면 노출 확인)
- 시각 검증은 staff 자격증명 부재로 한계 — 다음 staff 로그인 세션에서 확인 권장

#### 다음 첫 액션 (차기 세션)

1. youinone·evschool **유료 티어 가격 정책** 사용자 결정 → plan 시드 + plan_id 백필 (무결성 회복)
2. Badak 유료 티어(Pro/Business) 설계 — 기능 게이트 후보 식별 (DM·고급 필터·구인 공고 등)
3. Phase 2-B 결제 PG 선택 (토스 vs 포트원)

---

## 세션 140 핵심 성과 (2026-05-17)

### 8개 브랜드 전체 QA + SmarComm Header/Footer 마이그레이션

**QA 대상**: Badak · MADLeague · MADLeap · BrandGravity · WIO · HeRo · Myverse · SmarComm
**QA 기준 6개**: `generateMetadata()` · `UniverseUtilityBar` · `UniverseMobileMenu` · `UniverseFooter` · `LoginModal` · `loginHref()`
**결과**: 전 브랜드 6/6 통과 ✅

#### SmarComm 구 Header/Footer → 신규 컴포넌트 마이그레이션
- 7개 마케팅 페이지(홈·blog·blog/[slug]·pricing·workspace·scan·report/[id])에서 구 `Header`/`Footer` → `SmarCommHeader`/`SmarCommFooter` 교체 완료
- `SmarCommFooter` linkColumns에서 `/login` 하드코딩 제거 (UniverseUtilityBar가 loginHref() 처리)
- 구 `Header.tsx`/`Footer.tsx` import 0건 확인 (Grep 검증)

---

## 세션 139 핵심 성과 (2026-05-16)

### DEV 표기 페이지 → 실 DB 기반 고도화 (순서대로 진행)

이전 세션에서 reports/AI 가시성/journey/archive 4개를 실 DB로 전환한 흐름을 이어, 이번 세션은 프롬프트 관리·이벤트 관리 2개 추가 고도화.

#### ① 프롬프트 관리 (`/dashboard/geo/prompts`)
- **신규 API**: [app/api/smarcomm/prompts/route.ts](app/api/smarcomm/prompts/route.ts) — `smarcomm_ai_probes`의 query를 그룹화 → mentioned/accuracy/platforms[] 집계, sort(rate-desc/asc/recent/total) + category/domain 필터
- **신규 UI**: [app/(SmarComm)/smarcomm/dashboard/geo/prompts/page.tsx](app/(SmarComm)/smarcomm/dashboard/geo/prompts/page.tsx) — KPI 4개(고유·평균 노출률·강한≥60%·약한 0%) + 확장 카드 + 플랫폼 칩(언급/정확도 컬러)
- 사이드바 DEV 배지 + MOCK_PATH_PREFIXES 제거

#### ② 이벤트 관리 → AI 답변 변화 (`/dashboard/events`)
- 기존: GA-스타일 generic 이벤트 택소노미 mock (SmarComm V2.0 방향과 불일치)
- 전환: V2.0 § 3-C AIRM ④ 검증 단계 + § 3-B Smart-Data Hub 모니터링 소스인 `smarcomm_ai_diff_events` 활용
- **신규 API**: [app/api/smarcomm/ai-events/route.ts](app/api/smarcomm/ai-events/route.ts) — diff_type 6종(improved/degraded/unchanged/sentiment_flip/fact_corrected/fact_introduced) + platform 집계 + 일자별 timeline
- **신규 UI**: [app/(SmarComm)/smarcomm/dashboard/events/page.tsx](app/(SmarComm)/smarcomm/dashboard/events/page.tsx) — KPI 4개 + 이전/이후 텍스트 diff 시각화 + 정직한 빈 상태 안내
- 사이드바 라벨 "이벤트 관리" → "AI 답변 변화" 재정의 + DEV 제거

#### ③ 칸반 보드 (`/dashboard/workflow/kanban`)
- **신규 API**: [app/api/smarcomm/workflow/tasks/route.ts](app/api/smarcomm/workflow/tasks/route.ts) — `workflow_tasks` GET/POST/PATCH/DELETE + status/priority 대소문자 정규화
- **컨텍스트 DB 연동**: [lib/workflow-context.tsx](lib/workflow-context.tsx) — `tasks` mount fetch + add/update/move/delete 시 API 동기 호출 (optimistic)
- **버그 수정**: dashboard/layout이 `lib/smarcomm/workflow-context` Provider로 감쌌으나 kanban/projects/automation은 `lib/workflow-context`의 useWorkflow를 사용 → Provider 미스매치로 Application error. layout과 content 페이지를 통일해 정리
- 사이드바 DEV 배지 + MOCK 배너 prefix 제거. 6행 실 데이터(LUKI 싱글 / WIO 가이드 / MADLeague S3 등) 5컬럼에 분포

#### ⑤ 프로젝트 (`/dashboard/workflow/projects`) + 파이프라인 (`/dashboard/workflow/pipeline`) + 워크플로우 허브 (`/dashboard/workflow`)
- **신규 API 2**: [app/api/smarcomm/workflow/projects/route.ts](app/api/smarcomm/workflow/projects/route.ts) — `projects` 테이블 (in-progress/draft/completed → Active/On Hold/Completed) · [app/api/smarcomm/workflow/pipeline/route.ts](app/api/smarcomm/workflow/pipeline/route.ts) — `content_pipeline` (writing→Scripting, filming/editing→Production, published→Published)
- 컨텍스트의 projects·pipelineItems 슬라이스도 DB 동기 (mount fetch + optimistic CRUD)
- 파이프라인 redirect 버그 수정: `/dashboard/content` (404) → `/smarcomm/dashboard/content`
- 프로젝트 8행, 파이프라인 6행 실 데이터 → 워크플로우 허브 KPI 4종(태스크·파이프라인·프로젝트·자동화) 모두 실 집계
- DEV 일괄 제거: 워크플로우 / 프로젝트 / 파이프라인 prefix · 워크플로우 그룹 4개 완전 활성화

#### ④ 자동화 (`/dashboard/workflow/automation`)
- **신규 API**: [app/api/smarcomm/workflow/automations/route.ts](app/api/smarcomm/workflow/automations/route.ts) — `workflow_automations` GET/POST/PATCH/DELETE
- 컨텍스트 자동화 액션도 DB 동기 (toggle 시 setState 내부에서 PATCH 호출 → race condition 방지)
- 3개 실 규칙 표시(50만원 이하 자동승인 / 마감일 3일 전 이메일 / Slack 알림) + KPI(활성 2 / 전체 3 / 비활성 1) · DEV 제거

#### ⑥ 고객 관리 (`/dashboard/crm`)
- **신규 API 2**: [app/api/smarcomm/crm/people/route.ts](app/api/smarcomm/crm/people/route.ts) — `crm_people` + lifecycle/status/source 집계 · [app/api/smarcomm/crm/segments/route.ts](app/api/smarcomm/crm/segments/route.ts) — `crm_segments`
- 페이지 전면 재작성: MOCK_LEADS 폐기 → KPI 4(총·발송 가능·세그먼트·활성) + 세그먼트 그리드 + 라이프사이클 필터 + 검색 + 고객 테이블 + 출처 표기
- 라이프사이클 8단계 컬러 매핑 (subscriber/lead/MQL/SQL/opportunity/customer/evangelist/churned)
- 실 5고객(전천일/김사라/김준호/박기혁/Cheonil Jeon) + 4세그먼트(전체 고객/신규 리드/유니버스 회원/발송 가능) 표시
- DEV 제거 · MOCK 배너 prefix 조정 (CRM 본체는 제거, 카카오/이메일/푸시 sub-route만 유지)

#### ⑦ Phase A 분석 그룹 (`wio_analytics_events` 803행 기반)
- **신규 API 3**: [analytics/traffic](app/api/smarcomm/analytics/traffic/route.ts) · [analytics/funnel](app/api/smarcomm/analytics/funnel/route.ts) · [analytics/cohort](app/api/smarcomm/analytics/cohort/route.ts)
- **트래픽 분석** (`/dashboard/traffic`): 일자별 PV/세션/사용자 + 상위 페이지 15 + 브랜드 분포 + 평균 체류·이탈률 (350 PV 실측)
- **퍼널 분석** (`/dashboard/funnel`): session_id 단위 4단계(랜딩→탐색→참여→전환) drop-off, 단계별 전환율 (76 세션 실측)
- **코호트** (`/dashboard/cohort`): user_id 첫 활동 주차 × 5주 잔존율 히트맵 (현재 user_id 0행 → 정직한 빈 상태)
- 3개 페이지 모두 DEV 제거 + MOCK 배너 prefix 제거

#### ⑧ Phase A 이메일 채널 (`email_sends 64` + `email_senders 4` + `newsletter_subscribers 68`)
- **신규 API**: [crm/email](app/api/smarcomm/crm/email/route.ts) — 발송/전달/오픈/클릭/반송 KPI + 구독자 4 KPI + 발신자 카드 + 최근 30 발송
- 페이지 재작성: 64건 실 발송 이력 + 68명 구독자 표시 · DEV 제거

#### ⑨ Phase A 마케팅 캘린더 (`events` + `comm_events`)
- **신규 API**: [calendar](app/api/smarcomm/calendar/route.ts) — 월 단위 events + comm_events 통합 조회
- 페이지 재작성: 월 그리드 + 일 셀별 최대 2 이벤트 미리보기 + 사이드 상세 패널 · DEV 제거 (현재 5월 0행 → 빈 상태)

#### ⑩ Phase B 3페이지 활성화 (CRUD UI 신규 — 기존 빈 테이블 활용)
- **A/B 테스트** (`/dashboard/abtest`): API [experiments](app/api/smarcomm/experiments/route.ts) — `mkt_experiments` CRUD, 가설/변형/기간 입력 모달 + 카드 + 빈 상태
- **콘텐츠 라이브러리** (`/dashboard/content`): API [content](app/api/smarcomm/content/route.ts) — `marketing_content` CRUD, 발행물 메타(제목·유형·상태·채널) + 상태 필터, AI 소재 제작 페이지로 분리 링크
- **광고 캠페인** (`/dashboard/campaigns`): API [campaigns](app/api/smarcomm/campaigns/route.ts) — `marketing_campaigns` CRUD, 채널(네이버 SA/DA·구글·메타·카카오·유튜브·이메일) + 예산 진척 바 + 매체 자동 갱신 안내
- 3 페이지 모두 DEV 제거 · MOCK 배너 prefix 정리

#### ⑪ Phase B+ 카카오 + 푸시 통합 브로드캐스트
- **MCP 마이그레이션**: `smarcomm_broadcasts` 신규 (카카오·푸시·SMS 통합) — channel CHECK 제약(`kakao_alimtalk`/`kakao_friendtalk`/`kakao_bizmsg`/`push`/`sms`/`app_inbox`) + status CHECK + 4 인덱스 + RLS
- **신규 API**: [broadcasts](app/api/smarcomm/broadcasts/route.ts) — CRUD + status/kpi(sent·delivered·opened·clicked) 집계 + channelPrefix 필터
- **공통 컴포넌트**: [BroadcastPage](features/smarcomm/BroadcastPage.tsx) — 카카오·푸시 공유 UI
- **카카오** (`/dashboard/crm/kakao`): 알림톡·친구톡·비즈메시지 3종
- **푸시** (`/dashboard/crm/push`): 모바일 푸시·앱 인박스 2종
- 2 페이지 모두 DEV 제거 · MOCK prefix 제거

**🎉 SmarComm 전체 사이드바 DEV 배지 0개** (28+ 메뉴 모두 실 DB 또는 신규 CRUD 인프라 보유)

#### ⑫ Phase E 운영 정합성 정리
- `lib/smarcomm/auth.ts` Mock 인증 — 이미 제거 확인 (코드 참조 0건, MD만 잔존)
- `smarcomm/login/page.tsx` redirect 경로 수정: `/login?redirect=/dashboard` → `/login?redirect=/smarcomm/dashboard` (브랜드 prefix 누락 수정)
- `dashboard/layout.tsx` localStorage 직접 접근 → `getSetting('smarcomm','company','smarcomm_company')` (DB-first + localStorage fallback) 패턴으로 전환 (이미 profile 페이지에서 사용 중인 `user_settings` 통합)

#### ⑬ Phase E+ 즐겨찾기 user_settings 통합 + 경로 정규화 버그 수정
- **버그 발견**: PageTopBar가 `pathname` (예: `/smarcomm/dashboard/X`)을 그대로 저장했으나 layout nameMap은 `/dashboard/X` 키 기대 → 라벨 매칭 실패 + 렌더 시 `/smarcomm` 이중 prefix 가능성
- **수정**: PageTopBar `normalize()` 함수로 `/smarcomm` prefix 제거 후 저장 + `getSetting/setSetting` 사용 (user_settings DB-first)
- **layout**: 즐겨찾기 로드도 `getSetting('smarcomm','favorites','smarcomm_favorites')` 사용. localStorage 직접 접근 제거 (멀티디바이스 동기 가능)
- nameMap 라벨 일부 정정 (이벤트 관리 → AI 답변 변화, 광고 집행 → 광고 캠페인, 아카이브 → 소재 아카이브)

#### ⑭ CLAUDE.md 이월 작업 SSOT 갱신
- 완료 항목 12건 별도 표기, 진짜 블로커(외부 키 6종) + 내부 작업(`wio_feature_flags`·AIRM 검증·자동화)으로 재정렬

### 이월 — 대형 인프라 필요 페이지

콘텐츠·캘린더·CRM(카카오·이메일·푸시)·A/B 테스트·트래픽·퍼널·코호트 등은 각각 별도 외부 인프라 또는 신규 테이블 세트가 필요 → 본 세션 범위 외. 차기 세션에서 우선순위 결정 후 진행.

---

## 세션 137 핵심 성과 (2026-05-16) — Smart-Data Hub 홈 위젯 + 정직성 ZERO

[app/(SmarComm)/smarcomm/dashboard/page.tsx](app/(SmarComm)/smarcomm/dashboard/page.tsx):
- Smart-Data Hub 실측 위젯 3개 (SmarComm Index·AIRM 오픈 플래그·Brand Assets)
- Mock 섹션 인라인 `🧪 Demo 데이터` 앰버 배지 + Phase 5 예정 안내
- 실측 섹션 초록 라벨 (실측 데이터)

---

---

## 세션 136 핵심 성과 (2026-05-15)

### V2.0 전체 워크플로우 SSOT 재정의 + 4 모듈 구현

이전 V1 "진단·전략·제작·집행·관계·분석·운영" 폐기 → **V2.0 7단계 Smart-Loop** (진단·분석·전략·제작·집행·모니터링·자산화) 데이터 플라이휠로 재구성. 코드 + UI + DB + 가이드 동시 구축.

### 1. SSOT 잠금 — SmarComm CLAUDE.md (+262 / -24 lines)

[app/(SmarComm)/CLAUDE.md](app/(SmarComm)/CLAUDE.md) V2.0 전면 재작성. 코드 변경 0줄로 비전·어휘·구조 잠금.

- **머리말** — V2.0 어휘 + 2026-05-15 잠금 일자
- **§ 3** V2.0 7단계 SSOT (Smart-Audit·Smart-Loop·Smart-Studio 명명) + 보완 3축(자산화·AIRM·CRO) + V1 흡수 매핑(관계→⑤, 분석→②⑥, 운영→위계) + 페이지 매핑표
- **§ 3-A SSOT-6 신설** — AI 브랜드 4지표(인지·이해·추천·평판) + 6 측정 차원 + As-Is/To-Be 성적표
- **§ 3-B Smart-Data Hub 신설** — 4 소스(진단·광고·AI답변·유입) 통합 + Smart-Loop 데이터 흐름 규약
- **§ 3-C AIRM 신설** — 4단계(발견·분석·교정·검증) 워크플로우 + 유료 모델
- **§ 3-D 자산화 신설** — Entity 5종 + 3대 노력(정화·고권위 주입·Schema) + 캠페인 종료 자동 트리거
- **§ 13** V2.0 금지사항 5건 (V1 어휘 사용 금지 등)
- **§ 15** V2.0 SSOT 잠금 상태 + 이월 작업 V2.0 반영

### 2. 4지표 측정 구현 — AI Brand Journey

| 산출 | 역할 |
|---|---|
| [lib/smarcomm/sentiment.ts](lib/smarcomm/sentiment.ts) | 휴리스틱 sentiment(긍정/중립/부정) + reasoning + attributes 추출 |
| [lib/smarcomm/brand-journey.ts](lib/smarcomm/brand-journey.ts) | 4지표(인지·이해·추천·평판) + 6 차원 산출 SSOT |
| [lib/smarcomm/ai-probes/types.ts](lib/smarcomm/ai-probes/types.ts) | sentiment·reasoning·attributes 필드 추가 |
| [lib/smarcomm/ai-probes/claude.ts](lib/smarcomm/ai-probes/claude.ts) | probe 응답에 4지표 분석 통합 |
| [features/smarcomm/BrandJourneyCard.tsx](features/smarcomm/BrandJourneyCard.tsx) | As-Is/To-Be 성적표 UI + 6 차원 펼침 |
| [scan API](app/api/smarcomm/scan/route.ts) | brandJourney 계산 + DB 저장 |
| [report 페이지](app/(SmarComm)/smarcomm/report/[id]/page.tsx) | AI Brand Journey 섹션 통합 |

### 3. 자산화 (Brand Assetizing) — § 3-D 구현

DB 3 테이블 Prod 적용:
- `smarcomm_brand_assets` — Entity 5종 영속 저장
- `smarcomm_asset_distributions` — 위키·뉴스·학술 배포 이력
- `smarcomm_asset_citations` — AI 인용 추적

산출:
- [lib/smarcomm/assets.ts](lib/smarcomm/assets.ts) — Entity 10종 메타 + JSON-LD 빌더 + 흔적 점수 산출
- API: [list/create](app/api/smarcomm/assets/route.ts) + [get/patch/delete](app/api/smarcomm/assets/[id]/route.ts)
- [/dashboard/assets](app/(SmarComm)/smarcomm/dashboard/assets/page.tsx) — Entity 카탈로그 + 등록 모달
- [/dashboard/assets/[id]](app/(SmarComm)/smarcomm/dashboard/assets/[id]/page.tsx) — JSON-LD 미리보기 + 배포·인용 + 공개/내부 토글 + 보관

### 4. AIRM (AI Reputation Management) — § 3-C 구현

DB 4 테이블 Prod 적용:
- `smarcomm_ai_flags` — 5 flag 유형(negative_sentiment·wrong_fact·competitor_confusion·missing_brand·outdated_info)
- `smarcomm_ai_flag_sources` — 오정보 추정 출처
- `smarcomm_airm_actions` — 교정 액션 큐 (9 액션 유형 + role 매핑)
- `smarcomm_ai_diff_events` — 검증 단계 답변 변화

산출:
- [lib/smarcomm/airm.ts](lib/smarcomm/airm.ts) — `detectFlagsFromProbes()` 자동 분류 + `suggestActions()` 권장 액션 매핑
- scan API에 자동 flag + 액션 INSERT 통합 (probe 응답 즉시 분석)
- API: [/flags](app/api/smarcomm/airm/flags/route.ts) (list+PATCH) + [/actions](app/api/smarcomm/airm/actions/route.ts) (list+PATCH)
- [/dashboard/airm](app/(SmarComm)/smarcomm/dashboard/airm/page.tsx) — 4단계 허브 (발견·분석·교정·검증 통계 + 긴급 플래그 + 진행 액션)
- [/dashboard/airm/flags](app/(SmarComm)/smarcomm/dashboard/airm/flags/page.tsx) — 필터·상태 변경 + 응답 펼침
- [/dashboard/airm/actions](app/(SmarComm)/smarcomm/dashboard/airm/actions/page.tsx) — 칸반 4컬럼 (대기·진행·차단·완료) + role 필터

### 5. Smart-Data Hub — § 3-B 구현

산출:
- [lib/smarcomm/insights.ts](lib/smarcomm/insights.ts) — `computeInsights()` 시계열 집계 + `diffAnswers()` Before/After 비교
- API: [/insights](app/api/smarcomm/insights/route.ts) + [/ai-tracker](app/api/smarcomm/ai-tracker/route.ts)
- [/dashboard/insights](app/(SmarComm)/smarcomm/dashboard/insights/page.tsx) — Data Intelligence (Index 3축 + AI Journey 4지표 추이 SVG 스파크라인 + 자동 인사이트)
- [/dashboard/ai-tracker](app/(SmarComm)/smarcomm/dashboard/ai-tracker/page.tsx) — Real-time Tracker (Before/After 비교 + 8 변화 유형 필터)

### 6. 사이드바 V2.0 정합 + Action Hub Registry 등록

- [features/smarcomm/DashboardSidebar.tsx](features/smarcomm/DashboardSidebar.tsx) — V2.0 섹션 신설: 진단·제작·자산화·분석·모니터링 (Smart-Loop 순서)
- [lib/action-hub-registry.ts](lib/action-hub-registry.ts) — `smarcomm_airm_open_flags` + `smarcomm_airm_todo_actions` 2개 entry 추가 (§ 1.9.1 SSOT 준수, moderation 카테고리)

### 7. 명명 교정 (Smat → Smart, 7 파일 일괄)

사용자 비전의 "Smat-" 표현을 정식 명명 **Smart-** 으로 통일 — Smart-Loop / Smart-Audit / Smart-Studio / Smart-Data Hub.

### 검증 결과

- TypeScript: SmarComm 관련 0 에러
- 빌드: ✓ (env 필요 — main repo .env.local copy)
- 5 신규 페이지 시각 확인 완료 (스크린샷)
- 실제 동작 확인:
  - scan → brandJourney 자동 계산 + DB 저장
  - scan → AIRM 자동 flag 3건 + 권장 액션 6건 INSERT
  - assets → 1 Entity 생성 + 단건 상세 + JSON-LD 코드 블록
  - insights → smarcomm.biz 8회 진단 시계열 분석 + "Citability 34점 — AIRM·자산화 우선" 자동 인사이트
  - ai-tracker → 직전 두 진단 Before/After diff
  - intra/ums Dashboard Action Hub에 SmarComm AIRM 2 카드 노출

### 7. Quick win 5건 (V2.0 후속)

#### Q1. AIRM Critical priority 분리
- [lib/action-hub-registry.ts](lib/action-hub-registry.ts) — `ActionEntry.extraFilters` 배열 신설 (multi-AND 필터)
- `smarcomm_airm_critical_flags` entry 추가 (`status='open'` + `severity='critical'`, priority=critical)
- [app/intra/ums/page.tsx](app/intra/ums/page.tsx) — 쿼리 빌더에 extraFilters loop 적용

#### Q2. dashboard/layout.tsx `/login` → LoginModal (§ 1.2.1 위반 해소)
- [app/(SmarComm)/smarcomm/dashboard/layout.tsx](app/(SmarComm)/smarcomm/dashboard/layout.tsx) — `router.push('/login?redirect=…')` 제거 → `<LoginModal isOpen={true}>` 인라인 렌더
- 이탈 방지: 사용자가 보던 페이지 위에 팝업, 로그인 완료 → 모달 닫힘 → 그 자리 머묾

#### Q3. Mock 인증 제거
- [lib/smarcomm/auth.ts](lib/smarcomm/auth.ts) 삭제 — `useAuth()` SSOT 통일
- [dashboard/scan/page.tsx](app/(SmarComm)/smarcomm/dashboard/scan/page.tsx) — dynamic `import('@/lib/smarcomm/auth')` 제거, `saveScanUrl`은 `scan-data.ts`에서 정적 import (DB 동기화 포함)

#### Q4. Entity 자동 등록 트리거 — § 3-D 의무 규약 코드화
- [lib/smarcomm/auto-assetize.ts](lib/smarcomm/auto-assetize.ts) — `autoAssetizeCampaign()` 신규
  - Organization (멱등 — 같은 tenant+slug 있으면 skip)
  - Service (캠페인 자체, slug 충돌 시 timestamp suffix)
  - FAQPage (FAQ 있을 때)
  - UUID 형식 검증 → mock id 안전 처리
- [/api/smarcomm/campaigns/finalize](app/api/smarcomm/campaigns/finalize/route.ts) — POST 엔드포인트
- E2E 확인: Spring Launch 2026 캠페인 종료 → Service + FAQPage 2건 INSERT, Organization 이미 존재로 skip

#### Q5. 빌드 + preview E2E 검증
- TypeScript: SmarComm 관련 0 에러
- /dashboard/assets 페이지에 3 카드 노출 확인 (Spring Launch 2026·Spring Launch 2026 FAQ·SmarComm)
- intra/ums Action Hub: SmarComm AIRM Critical + 신규 플래그 2종 entry 등록

### 8. V2.1 진단 sub-engine SSOT (코드 0줄)

§ 3-A SSOT-7 신설 — V2.0 상위 30/30/40은 유지하면서 ① 진단 단계 내부를 5 sub-engine으로 세분화:

- **Discovery Engine** (GEO·SEO) — AI SOV 매트릭스 + 인용 출처 맵핑 + 할루시네이션 분리 + 검색 의도 정렬 + 지식 그래프
- **Conversion Engine** (UI·UX) — 3초 테스트 + 전환 마찰 + 모바일 가독성 + 비로그인/로그인 모드 분리 + 온보딩 TSR + 기능 복잡도
- **Trust Engine** (Security) — 인증/인가 + 데이터 거버넌스 + 취약점 스캔 (보안 헤더는 V2.0 있음)
- **Reputation Engine** (SNS) — 감성 점수 + 키워드 클라우드 + 인플루언서 점유율
- **Shopping Engine** (커머스) — 에셋 일관성 + 키워드 점유율 + 리뷰 시맨틱
- **Funnel 통합** — 인지·탐색·결정·전환·충성 5단계로 1~5 데이터 재구성
- **Smar-Index(SI)** — Awareness/Search/UX/Security 20/20/30/30 / Industry_Avg 보조 지표
- **차별화 연구 2건** — AI 리터러시 진단 / 쇼핑 모멘텀 시차

§ 13 금지사항 4건 추가 (V2.0 가중치 변경 금지·sub-engine 외 추가 금지 등).

V2.1 구현 우선순위 매트릭스 16종 정의 (Phase 4·5·6 단계별).

### 9. V2.1 Discovery High 3건 구현 (외부 API 없이)

기존 AI Probe 응답에서 즉시 추출 가능한 3 차원:

- [lib/smarcomm/diagnostics-v21.ts](lib/smarcomm/diagnostics-v21.ts) — `computeAiSov` / `extractCitedSources` / `extractHallucinations` / `computeDiscoveryDetail`
- [features/smarcomm/DiscoveryDetailCard.tsx](features/smarcomm/DiscoveryDetailCard.tsx) — SOV 매트릭스(색 히트맵) + 인용 출처 카드 + 할루시네이션 명세
- scan API → `breakdown.discoveryDetail` JSONB 저장
- report 페이지에 신규 섹션 (BrandJourneyCard 다음)

**E2E 확인**: smarcomm.biz scan → 7 SOV 셀 정상 매트릭스, 빈 상태(no URL/no wrong) 핸들

### 10. V2.1 정직성 회복 — 휴리스틱 폐기, LLM 실측 교체 (§ 1.10 정직 원칙)

진단 항목 정직성 평가 후 결정:

| 항목 | 이전 | 이후 |
|---|---|---|
| Sentiment | 휴리스틱 (한국어 키워드 사전) | **Claude Haiku 4.5 LLM 분류** + 미실측 시 **N/A** |
| Reasoning | 휴리스틱 (정규식 패턴) | LLM 추출 + 미실측 시 N/A |
| Attribute Association | 휴리스틱 (제한 형용사) | LLM 추출 + 미실측 시 N/A |
| Sentiment 종합 점수 산입 | 항상 (0 또는 50 기본) | LLM 실측 0건 시 **평균에서 제외** |
| AIRM negative_sentiment flag | 휴리스틱 trigger | LLM 실측만 trigger |

**파일 변경**:
- 삭제: [lib/smarcomm/sentiment.ts](lib/smarcomm/sentiment.ts)
- 신규: [lib/smarcomm/sentiment-llm.ts](lib/smarcomm/sentiment-llm.ts) — Claude Haiku structured JSON output, ~$0.02/scan
- 수정: [ai-probes/claude.ts](lib/smarcomm/ai-probes/claude.ts) · [ai-probes/types.ts](lib/smarcomm/ai-probes/types.ts) · [brand-journey.ts](lib/smarcomm/brand-journey.ts) · [airm.ts](lib/smarcomm/airm.ts) · [BrandJourneyCard.tsx](features/smarcomm/BrandJourneyCard.tsx)
- SSOT: § 3-A SSOT-6 머리말에 V2.1 명시 + § 13 정직 금지사항 2건 추가

**검증**: smarcomm.biz scan (ANTHROPIC_API_KEY 401) → Sentiment Axis N/A 박스 + "🔬 LLM 키 필요" 배지 + 종합 점수 sentiment 제외 산출 (3축 평균)

### 11. V2.1 정직성 2차 — factComparison + Source 분류 + Hallucination LLM 통합

휴리스틱 잔여 6 항목 모두 LLM 교체:

| 이전 | 이후 |
|---|---|
| factComparison (자카드·정규식 추정) | LLM 의미 비교 ("49,000원 ↔ 약 5만원" → exact) + reason |
| Source 도메인 정규식 분류 | LLM 10 카테고리 + 3 trust level + reason |
| Hallucination 분리 (휴리스틱 의존) | LLM factComparison wrong 자동 정직화 |
| extractFromAIResponse·compareFacts | **deprecated 표기**, 신규 호출 금지 |

**산출**:
- [sentiment-llm.ts](lib/smarcomm/sentiment-llm.ts) 시스템 프롬프트 확장 — 단일 호출에 4 의미 분석 통합
- 신규 [source-classifier-llm.ts](lib/smarcomm/source-classifier-llm.ts) — batch URL 분류
- [diagnostics-v21.ts](lib/smarcomm/diagnostics-v21.ts) extractCitedSources async LLM 호출
- [analyzers/fact-extractor.ts](lib/smarcomm/analyzers/fact-extractor.ts) — deprecated 표기 (extractFromSite는 유지, AI 응답 분석 함수만)
- [DiscoveryDetailCard.tsx](features/smarcomm/DiscoveryDetailCard.tsx) — "🤖 LLM" 배지 + trust 칩 + reason 노출
- SmarComm CLAUDE.md § 13 — V2.1 금지사항 보강 (휴리스틱·deprecated 함수 호출 금지)

**비용 영향**: scan당 ~$0.04 (sentiment-llm 5플랫폼×13질문 + source-classifier 1회)

**검증**: API 키 401 상태 — Source 카드 "🤖 LLM" 배지 정상, hallucination "🤖 LLM 의미 분류" 배지. 키 갱신 시 진짜 의미 비교 작동.

### 12. V2.1 정직성 3차 회복 — 잔여 6 항목 (E 옵션 A+B+C+D 통합)

진단 시스템 36 항목 정직성 점검 후 잔여 휴리스틱 6건 정직화:

| 항목 | 변경 |
|---|---|
| **Citability 분모** | skipped 플랫폼 제외 정규화 (stub 4개 미포함) |
| **Action Plan** | 18 ACTION_RULES 휴리스틱 → Claude Haiku 추천 (`buildActionPlanLLM`) |
| **AIRM suggestActions** | 5 flag_type 임의 매핑 → Claude Haiku 추천 (`suggestActionsLLM`) |
| **콘텐츠 볼륨** | "⚠ 표면 측정 (Phase 5 LLM 깊이 평가)" 라벨 |
| **persistence_score** | "⚠ 휴리스틱 가중치 (Phase 5 Ahrefs DR 정규화)" 라벨 |
| **schemaSuggestions** | "⚠ 그대로 붙여넣기 금지 — placeholder 반드시 교체" 강조 박스 |

**LLM 누적 비용**: scan당 ~$0.05 (sentiment + source + actionPlan + airm-suggest)

**SmarComm CLAUDE.md § 13**: V2.1 정직 금지사항 6건 추가

**검증**: smarcomm.biz scan (API 키 401) — UI 모든 라벨/경고 정상 노출

### 13. V2.1 정직성 4차 회복 — 다른 단계 잔여 3건

진단 외 단계 휴리스틱 fallback 일괄 제거:

| 항목 | 변경 |
|---|---|
| **브랜드 페르소나** | 36 유형 임의 매핑 → LLM 동적 분석 (`brand-personality-llm.ts`). 신규 IndexBreakdown.brandPersonality 필드 |
| **AI 어드바이저** | `generateFallbackPlan` 호출 제거. API 키 없으면 503, Claude 실패 시 502 |
| **AI 소재 생성** | `generateFallback` 호출 제거. 503/502 반환 |

**SSOT**: SmarComm CLAUDE.md § 13에 V2.1 4차 금지사항 3건 추가
**검증**: API 키 401 상태 — 브랜드 페르소나 위치에 "⚠ LLM 미가용" 박스. 기존 "디지털 제왕" 가짜 라벨 사라짐.

**누적 정직성 회복 현황** (4차 완료):
- 1차: Sentiment·Reasoning·Attributes
- 2차: factComparison·Source·Hallucination
- 3차: Citability 분모·Action Plan·AIRM suggestActions·콘텐츠 볼륨·persistence_score·schemaSuggestions (E 옵션 A+B+C+D)
- 4차: 브랜드 페르소나 + Advisor fallback + Creative fallback

### 14. V2.1 정직성 5차 회복 — 잔여 5건 (E 전부 A+B+C+D)

| 항목 | 변경 |
|---|---|
| **R-A** Insights 자동 인사이트 | 임계값 분기 → `analyzeInsightsLLM` (Claude Haiku 동적 분석) |
| **R-B** deprecated 완전 제거 | brand-personality.ts·extractFromAIResponse·compareFacts·generateFallbackPlan 모두 삭제 |
| **R-C** Mock 페이지 배너 | dashboard layout `MOCK_PATH_PREFIXES` 13개 + 노란 배너 자동 노출 |
| **R-D** Grade 출처 + AI SOV 라벨 | GRADE_SOURCE 상수 + SOV 활성 < 3 신뢰도 경고 |
| **추가** ChatGPT probe 정리 | 휴리스틱 fact-extractor 호출 제거 → LLM 일관성 |

**SmarComm CLAUDE.md § 13**: V2.1 5차 금지사항 5건 추가
**검증**: /dashboard/funnel Mock 배너 + /dashboard/insights LLM 카드 + /report SOV 신뢰도 라벨 모두 정상

**누적 정직성 회복 5차 완료**:
- 1차: Sentiment·Reasoning·Attributes (휴리스틱 sentiment.ts 폐기)
- 2차: factComparison·Source·Hallucination (compareFacts + source-classifier-llm)
- 3차: Citability 분모·Action Plan·AIRM suggestActions·콘텐츠 볼륨·persistence_score·schemaSuggestions
- 4차: 브랜드 페르소나 + Advisor fallback + Creative fallback
- **5차**: Insights LLM + deprecated 완전 제거 + Mock 배너 + Grade/SOV 라벨

**누적 LLM 비용**: scan당 ~$0.06 (sentiment + source + actionPlan + airm-suggest + brandPersonality + insights)

### 15. V2.1 정직성 6차 회복 — 출처·라벨·데이터 입력 경로 (사용자 직접 지적)

사용자가 Trend 차트 보고 "이건 뭐에 대한 추이? 출처는? 데이터 입력 경로는?" 핵심 질문 던짐. 재점검 후 6 항목 회복:

| 항목 | 변경 |
|---|---|
| **6-A** Trend 차트 | "Trend (시계열 추이)" → "SmarComm Index 시계열 추이" + 🔬 출처 칩 + Y/X축 범례 |
| **6-B** 종합 분석 레이더 | 6 축 산식 명시 + 🔬 출처 칩 |
| **6-C** To-Be 목표값 | "기본값" 명시 + `TARGETS_SOURCE` 상수 + 푸터 출처 |
| **6-D1** 자산화 distributions UI | `/api/smarcomm/assets/[id]/distributions` POST/DELETE + "+ 배포 이력 추가" 모달 |
| **6-D2** citations 출처 라벨 | "Phase 5 자동 동기화 예정" |
| **6-D3** ai_flag_sources 라벨 | "Phase 5 외부 검색 API 연동 예정" |

**SmarComm CLAUDE.md § 13**: V2.1 6차 금지사항 4건 추가
**검증**: 자산 상세 페이지·report 페이지 모든 출처 칩·라벨 정상 노출

**누적 정직성 회복 6차 완료**:
- 1차: Sentiment·Reasoning·Attributes
- 2차: factComparison·Source·Hallucination
- 3차: Citability 분모·Action Plan·AIRM suggestActions·콘텐츠 볼륨·persistence_score·schemaSuggestions
- 4차: 브랜드 페르소나 + Advisor fallback + Creative fallback
- 5차: Insights LLM + deprecated 완전 제거 + Mock 배너 + Grade/SOV 라벨
- **6차**: Trend·레이더·To-Be·distributions UI·citations·ai_flag_sources 출처 명시

### 16. 정직성 = 절대 원칙 ZERO + 다크모드 가독성 (사용자 지적)

**P1. SmarComm CLAUDE.md 머리말 최상단**: "🔴 절대 원칙 ZERO — 정직성(Honesty)이 무엇보다 중요하다" 8 유형 위반 명시. 회복은 우선순위 1.

**P2. 다크모드 가독성 근본 해결**:
- [smarcomm.css](app/(SmarComm)/smarcomm.css) `.smarcomm-theme`에 `background-color + color + min-height` 추가 → body 검정 새어나옴 차단
- 4 페이지 main bg 보강 (이중 안전): report·pricing·workspace·scan

**검증**: 모든 SmarComm 페이지 light surface 배경 정상. h1·h2 가독성 회복.

### 다음 할 일 (V2.0 후속)

#### 🚩 즉시 (사용자 작업)
- ANTHROPIC_API_KEY 갱신 (현재 401, 실제 probe 결과 확보 필요)
- OpenAI/Perplexity/SerpAPI/PageSpeed 키 발급으로 5 AI 플랫폼 + CWV 전체 활성

#### 🟢 V2.0 후속 모듈 (Phase 5)
1. ✅ 정기 자동 재진단 (Vercel Cron 주간) → AIRM 자동 발견 + Smart-Data Hub 시계열 풍부화
   - `smarcomm_rescan_schedules` 테이블 + RLS Prod 적용
   - `lib/smarcomm/run-scan.ts` 공유 스캔 파이프라인 추출 (scan route + cron 공용)
   - `app/api/cron/smarcomm-weekly-rescan/route.ts` (GET, CRON_SECRET 인증, limit 10/회)
   - `vercel.json`: schedule `0 3 * * 1` + maxDuration 300 양쪽
2. ✅ Entity 자동 등록 트리거 — 캠페인 종료(`wio_campaigns.status='ended'`) 훅으로 `smarcomm_brand_assets` 자동 INSERT
3. ✅ AIRM 플래그 출처 추적(`smarcomm_ai_flag_sources`) — 외부 검색 API로 학습 추정 페이지 Top N
4. Ahrefs/Moz API 통합 → Authoritativeness sub-score N/A 해소
5. AIRM Critical 플래그 (`severity='critical'`)는 Action Hub priority=critical로 별도 등록 (현재 high)
6. Person·Product·HowTo·Article Entity 자동 생성(현 Organization·Service·FAQ·WebSite만)
7. ~~Smart-Data Hub `/dashboard` 홈 위젯 통합 (4 소스 KPI)~~ ✅ 세션 137 완료
8. 3 뷰 모드(`?view=marketer|exec|dev`) 활성 — boundary 분기

#### 🟢 SmarComm 기타 (V1→V2 마이그레이션)
- [lib/smarcomm/auth.ts](lib/smarcomm/auth.ts) Mock 인증 제거
- [dashboard/layout.tsx:28](app/(SmarComm)/smarcomm/dashboard/layout.tsx) `router.push('/login')` → LoginModal
- Mock 대시보드 → 실 API (퍼널·트래픽·CRM·캠페인 등 30+ 페이지)
- Feature Flags `wio_feature_flags` 연동 (현재 useAuth tier 분기)
- localStorage `smarcomm_company` · `smarcomm_favorites` → DB 마이그레이션
- 보고서 "AI Brand Journey" 섹션 추가 데이터 — 실제 probe 응답으로 4지표 풍부화

#### 🟢 다른 브랜드 V2.0 점진 적용
- Marketing OS 7단계 어휘를 마케팅 페이지(`/smarcomm` 랜딩)에 비주얼로 노출
- WIO ↔ SmarComm 동등 OS 표현을 WIO CLAUDE.md에도 반영

---

## 세션 135 핵심 성과 (2026-05-14)

### 1. Myverse — 진입점·시각화 정비

**AppTopNav 아바타 드롭다운 통합** ([features/myverse/planner/AppTopNav.tsx](features/myverse/planner/AppTopNav.tsx))
- 데스크톱 우측에서 Install·Help·Settings 분리 아이콘 3개 제거 → 아바타 드롭다운으로 통합
- Bell 알림 분리 (이전엔 아바타가 알림 진입점) — 미확인 배지 유지
- 드롭다운: 헤더(이름·구독상태) → 프로필 / 설정 / 도움말 / 앱 설치 / 로그아웃
- Esc·외부 클릭·경로 변경 시 자동 닫힘, 다크모드 지원

**운동·식사 카드 시각화** ([features/myverse/capture/CaptureView.tsx](features/myverse/capture/CaptureView.tsx))
- `StatChip` (4톤 + 다크모드) · `IntensityDots` (5단계 강도 시각화) · `MealStats` · `ExerciseStats` 4개 신규
- 운동 카드: 강도 도트 ●●●○○ N/5 + ❤ BPM + 🔥 kcal + 구성 텍스트
- 식사 카드: 🔥 kcal + 메뉴 구성
- summary에서 강도/BPM 부분 자동 추출 후 구성만 별도 표시

**잠재 버그 1건 수정**: [app/api/myverse/routines/route.ts:65](app/api/myverse/routines/route.ts)
- `capture_mode: "manual"` → `"active"` (DB CHECK 제약 `'active'|'auto'|'imported'`와 불일치, 세션 108부터 잠재. routines POST 500 항상 실패)

**Myverse 첫 랜딩 페이지를 캡쳐로 변경** (6곳)
- 마케팅 페이지 자동 리다이렉트 / Hero CTA / `/myverse/app` 루트 / 온보딩 완료 / 온보딩 재진입 / AppTopNav 브랜드 로고

### 2. SmarComm CLAUDE.md 전면 재작성 — WIO↔SmarComm 동등 OS

**130줄 → 376줄** (Myverse 394줄과 비슷한 깊이)
- **§ 2 WIO ↔ SmarComm 관계 SSOT 신설** — "종속 관계 아님" 명시. 동등 OS 관계 다이어그램 + 5 모듈 사용 규칙 + 정체성 차이 표. "SmarComm = WIO MKT-* 위의 어플리케이션" 표현 폐기
- **§ 3 Marketing OS 7대 영역 SSOT** — 진단·전략·제작·집행·관계·분석·운영 사이클. 35개 대시보드 페이지 분류
- **§ 3-A SmarComm Index 보고서 SSOT (5 SSOT)** — Index 가중치(30/30/40) · AI 플랫폼 5종 · Question Bank · 역할 매핑 · 뷰 모드 3개
- § 5 팩 시스템 SSOT (PACK_TIER)
- § 10 핵심 파일 60+개 정비 (이전 8개)
- § 13 절대 하지 말 것 9항목 신설
- § 15 현재 상태 정정: "Phase: Launch 완료" → "Beta — UI 완성·백엔드 통합 중"

### 3. SmarComm Index Phase 1 — Index SSOT + DB + 공유 URL

| # | 산출 |
|---|---|
| 1.1-1.2 | [lib/smarcomm/index-calculator.ts](lib/smarcomm/index-calculator.ts) — `computeIndex()` 30/30/40 SSOT + Grade S/A/B/C/D |
| 1.3 | [sql/smarcomm-scans.sql](sql/smarcomm-scans.sql) — `smarcomm_scans` + `smarcomm_scan_pages` (Prod 적용) |
| 1.4 | [app/api/smarcomm/scan/route.ts](app/api/smarcomm/scan/route.ts) — DB 저장 + short_id 발급 + Index breakdown |
| 1.5 | [app/api/smarcomm/report/[id]/route.ts](app/api/smarcomm/report/[id]/route.ts) — 신규 보고서 조회 API |
| 1.6 | report page — SmarComm Index Hero + 3 질문 카드 + 신뢰 푸터 |
| — | scan page → `/api/smarcomm/scan` SSOT 통일 |

### 4. SmarComm Index Phase 1.5 — 권위 표준 정렬

| # | 산출 |
|---|---|
| 1.5.1 | [lib/smarcomm/grading/thresholds.ts](lib/smarcomm/grading/thresholds.ts) — 모든 임계값 SSOT + 출처 (Google CWV/QRG/Schema.org/WCAG/Mozilla/Answer.AI llms.txt) |
| 1.5.2 | 사이트 링크 분류 (내부/외부/앵커/기타) — `<a>` 정규식 + same-origin 판정 |
| 1.5.3 | 카드 분리 — "인덱싱 상태" → "인덱싱 가능" + "Canonical URL" 2개 |
| 1.5.5 | [lib/smarcomm/analyzers/schema-validator.ts](lib/smarcomm/analyzers/schema-validator.ts) — JSON-LD 자체 검증 (필수 필드 + 권장 누락 검사, 14 schema type 지원) |
| 1.5.6 | [lib/smarcomm/analyzers/mozilla-observatory.ts](lib/smarcomm/analyzers/mozilla-observatory.ts) — 보안 헤더 등급 (HSTS·CSP·X-Frame). Trustworthiness sub-score 연동 |
| 1.5.4 | INP 측정 — PageSpeed CrUX field data 우선·lab fallback |
| 1.5.7 | AI 봇 robots.txt 파서 — GPTBot·ClaudeBot·Google-Extended·PerplexityBot·Applebot-Extended access matrix |
| 1.5.8 | llms.txt 존재 검증 (Answer.AI 제안 표준) |
| 1.5.9 | 권위도 T4 처리 (`isKnownDomain` 휴리스틱 폐기, maxScore 0으로 점수 영향 제거, N/A 표시) |
| 1.5.10 | 모든 description 재작성 — "raw 숫자" → "판단(✓⚠⛔📋) + 근거 + 출처" |
| 1.5.11 | UI 출처 칩 — `🔬 출처: ___` pill, hover tooltip |
| — | **Trust E-E-A-T 4 sub-score 재배치** — Experience·Expertise·Authoritativeness(N/A)·Trustworthiness. EEATCell UI 컴포넌트 |

### 5. SmarComm Index Phase 2 — 5 AI Probe 인프라 + AI Visibility Map

| # | 산출 |
|---|---|
| 2.1 | [lib/smarcomm/question-bank.ts](lib/smarcomm/question-bank.ts) — 7카테고리 × 13질문 (업종별 템플릿: marketing-saas / ecommerce / education) |
| 2.2 | [lib/smarcomm/ai-probes/types.ts](lib/smarcomm/ai-probes/types.ts) — 5 플랫폼 공통 인터페이스 + detectMention 헬퍼 |
| 2.3 | [lib/smarcomm/ai-probes/claude.ts](lib/smarcomm/ai-probes/claude.ts) — Claude Haiku 4.5 실측 |
| 2.4 | [chatgpt.ts](lib/smarcomm/ai-probes/chatgpt.ts) · [perplexity.ts](lib/smarcomm/ai-probes/perplexity.ts) · [google-aio.ts](lib/smarcomm/ai-probes/google-aio.ts) · [naver-cue.ts](lib/smarcomm/ai-probes/naver-cue.ts) — 4 플랫폼 스텁 (키 추가 시 즉시 활성) |
| 2.4 | [lib/smarcomm/ai-probes/index.ts](lib/smarcomm/ai-probes/index.ts) — 오케스트레이터 + Citability 점수 |
| 2.5 | [sql/smarcomm-ai-probes.sql](sql/smarcomm-ai-probes.sql) — DB 테이블 (Prod 적용) |
| 2.6 | scan API에 5 플랫폼 병렬 실행 + DB 저장 + geoChecks 실측 교체 |
| 2.7 | report API + AIVisibilityMap UI — 7카테고리 노출률 바 + 플랫폼별 펼침 + 실제 응답 캡처 |

**핵심 발견**: smarcomm.biz Claude 13질문 실측 = 0/13 언급. 이전 "추정 mentioned"가 거짓이었음. Index 71 → 61로 정직한 점수 조정.

### 6. SmarComm Index Phase 2.5 — 답변 일관성

| # | 산출 |
|---|---|
| 2.5.1 | [lib/smarcomm/analyzers/fact-extractor.ts](lib/smarcomm/analyzers/fact-extractor.ts) — Schema/meta/본문에서 가격·강점·기능 추출 + AI 응답에서 같은 사실 추출 + 자카드 유사도 비교 |
| 2.5.2 | Probe 표준에 extractedFacts + factComparison 필드 추가 |
| 2.5.3 | Claude probe + 4 스텁 시그니처 통일 (siteTruth 인자 추가) |
| 2.5.4 | scan API 자사 사실 추출 → AI 응답 비교 → DB 저장 (`extracted_facts` JSONB) |
| 2.5.5 | UI — 답변 일관성 요약 카드(정확/부분/오답/미언급 4분류) + probe별 정확도 배지(✓△✗—) + 사실 비교 표 (우리 vs AI) |

산식: `consistencyScore = (exact × 1.0 + partial × 0.5 + wrong × -0.5) / mentioned × 100` (오답 음수 가중)

### 7. SmarComm Index Phase 3 — Schema 자동 생성·Action·Trend·Exec Summary

| # | 산출 |
|---|---|
| 3.1 | [lib/smarcomm/schema-generator.ts](lib/smarcomm/schema-generator.ts) — Organization·WebSite·FAQPage·Service·BreadcrumbList 5종 자동 생성 + placeholder 표시 |
| 3.2 | [app/api/smarcomm/report/[id]/trend/route.ts](app/api/smarcomm/report/[id]/trend/route.ts) — 도메인별 최근 20회 시계열 + UI SVG 차트 |
| 3.3 | [lib/smarcomm/exec-summary.ts](lib/smarcomm/exec-summary.ts) `buildActionPlan` — fail/warn 항목을 Impact·Effort·역할·예상점수로 자동 매핑 (18 룰) |
| 3.4 | [lib/smarcomm/exec-summary.ts](lib/smarcomm/exec-summary.ts) `generateExecSummary` — Claude Haiku로 3줄 요약 (잘된것·문제·다음행동) |
| UI | 4 신규 컴포넌트 — ActionMatrix (Impact×Effort 2×2) · SchemaGenerator (복사 버튼 + 펼침) · TrendChart (SVG) · Exec Summary 30초 요약 |

### 보고서 섹션 — 14개 완성

```
Hero (SmarComm Index + Grade + 3 질문) → E-E-A-T 4축 → 30초 요약
→ Action Plan (Impact×Effort 4분면 + 역할 + 예상점수)
→ Schema 자동 생성기 (5종 복사) → Trend 시계열
→ 상위 이슈 → 서브페이지 분석 → 종합 레이더 → 분석 요약 → 브랜드 성격 제안
→ 기술 SEO (10 카드) → 콘텐츠 SEO (8 카드 + 보안 헤더 신규)
→ AI 검색 노출 (실측) → AI Visibility Map (5 플랫폼 × 7카테고리)
→ AI 최적화 준비도 (3 카드 + Authoritativeness N/A)
→ 심화 분석 + 신뢰 푸터
```

### 다음 할 일

#### 🚩 즉시 필요 (사용자 작업)
- **ANTHROPIC_API_KEY 갱신** — 현재 401 에러. Claude probe 13질문 + Executive Summary 자동 생성 잠금 해제
- **OPENAI_API_KEY 발급** — ChatGPT 실측 즉시 활성
- **PERPLEXITY_API_KEY 발급** — Perplexity 실측 + 인용 출처 활성
- **SERPAPI_API_KEY 발급** — Google AI Overview 실측 활성
- **GOOGLE_PAGESPEED_API_KEY 발급** — Core Web Vitals(LCP·INP·CLS) 실측

#### 🟢 SmarComm Phase 4 (다음 세션)
1. **Ahrefs / Moz API 통합** — Authoritativeness sub-score N/A 해소 (E-E-A-T A축 정상화)
2. **업종 백분위** — `smarcomm_industry_benchmarks` 집계 뷰 + 보고서 표시
3. **정기 자동 재진단** — Vercel Cron (주간) + 점수 변화 알림 이메일
4. **PDF 리포트 다운로드** — html-to-image 또는 React-PDF
5. **Wikidata SPARQL** — Knowledge Graph entry 검출
6. **3 뷰 모드 활성** — `?view=marketer|exec|dev` 분기 UI

#### 🟢 SmarComm 기타 (Phase 1.5에서 식별)
- [dashboard/layout.tsx:28](app/(SmarComm)/smarcomm/dashboard/layout.tsx) `router.push('/login')` → LoginModal 또는 `loginHref` (CLAUDE.md § 1.2.1 위반)
- [lib/smarcomm/auth.ts](lib/smarcomm/auth.ts) Mock 인증 제거 (평문 비밀번호 + sessionStorage, 사용처 1곳뿐)
- `wio_subscription_plans` 실제 게이트 연동 (TierGate 활성)
- localStorage `smarcomm_company` · `smarcomm_favorites` → DB 마이그레이션

#### 🟢 Myverse (이월)
- [features/myverse/capture/CaptureView.tsx](features/myverse/capture/CaptureView.tsx) "Invalid Date" 미러 places 이슈 — routines mirror INSERT에서 visited_at에 `HH:MM`만 저장 → traces API에서 NaN. spawn_task 등록됨
- 캡쳐 Phase 3 — 녹음 자동 transcribe · GPS 백그라운드 · routine 카드 분석 액션 활성

---

## 세션 134 핵심 성과 (2026-05-13)

### 1. 캡쳐 Phase 2 — 5건 일괄 처리

**#1 프로젝트 선택 모달** — `runAction("project")`의 placeholder toast 제거. CaptureView에 모달 추가
- 프로젝트 dropdown(`GET /api/myverse/projects`) + 노트/마일스톤 2모드 토글
- 자동 제목 추출 + `buildProjectContent()` (body·caption·media_url·nutrition/exercise·tags·source 메타 포함)
- 마일스톤 모드일 때만 마감일 input
- POST `/api/myverse/projects/{id}/notes` 또는 `/milestones`

**#2 GPS 자동 체크인** — `lib/myverse/auto-checkin.ts` 신규 hook
- 10분 폴링 + 300m 이동 dedup + 30분 슬롯 dedup + Visibility API 일시정지 + localStorage 영속화
- CaptureView 상단 토글 + 상태 배지 (최근 기록 시각 / 폴링 시각 / 에러 메시지)
- ⚠ 진짜 백그라운드는 PWA 한계로 불가 — UI에 "(앱 열려있을 때만)" 명시
- places API에 `place_name="자동 기록"` + `address="lat,lng"` + `note="자동 체크인 (GPS)"`로 row 생성

**#3 운동·식사 전용 폼** (DB 스키마 확장)
- SQL: `myverse_daily_routines` ADD `kcal INT` + `heart_rate INT` + `composition TEXT` (Prod 적용)
- routines API: POST/PATCH 모두 3 필드 수용 + 정수 정규화
- traces API: routine row의 category별로 `nutrition`(meal) / `exercise`(exercise) JSON으로 surface
  - exercise summary = `강도 N/5 · 평균 BPM · 메뉴구성` 자동 조립
- 보너스: moment 의 `nutrition`/`exercise` JSON 컬럼도 traces select에 추가 → AI 분석 직후 카드에 즉시 표시
- CaptureView composer:
  - 식사: 시작/종료/메뉴 구성/섭취 칼로리
  - 운동: 거기에 강도 1~5 세그먼트 버튼 + 평균 심박수 + 소모 칼로리
  - 메모/체크인은 기존 simple composer 유지 (`isStructuredComposer` 분기)

**#4 DailyView dead code 5개 파일 삭제** — 외부 import 0 확인 후 일괄 삭제
- DailyMoments.tsx · DailyPlacesCard.tsx · DailyRoutinesCard.tsx · DailyHealthStats.tsx · SnsPostComposer.tsx

**#5 좌하단 footer 통째 삭제** — 사용자 결정 (설정·도움말·앱설치 제거)
- `app/(Myverse)/myverse/app/AppSideNav.tsx`에서 footer 블록 + `InstallButton` import 제거
- ⚠ 진입점 부재: 설정·도움말·앱 설치로 가는 사이드바 진입점 없어짐 — 차기에 UtilityBar 아바타 드롭다운으로 이전 권장

### 2. 모바일 하단 네비 — capture 가운데 강조

`features/myverse/app/MobileBottomNav.tsx`:
- `ALL_NAV_OPTIONS`에 `capture` (`bolt` 아이콘) + `mail` 추가
- `MOBILE_NAV_DEFAULT` → `["projects", "today", "capture", "feed", "card"]`
- 5슬롯 모드일 때 가운데(idx=2) 항목을 **위로 솟은 원형** 강조 — accent fill + 흰 아이콘 + 흰 ring 4 + shadow-lg (Material BottomAppBar FAB 패턴)
- `app/(Myverse)/myverse/app/settings/tech/page.tsx` — import 경로를 라이브 버전(`features/myverse/app/MobileBottomNav`)으로 교체
- 옛 orphan `features/myverse/planner/MobileBottomNav.tsx` 삭제 (외부 import 0)

### 3. 캡쳐 페이지 — 녹음 + 퀵 메뉴

**녹음 (audio media_type 신설)**
- SQL: `myverse_daily_moments` media_type CHECK + url_required CHECK 둘 다 교체 (image/video/text/audio) (Prod 적용)
- `app/api/myverse/moments/route.ts` POST validation 확장
- `app/api/myverse/traces/route.ts` UnifiedTrace.media_type 타입 확장
- `lib/myverse/use-recorder.ts` 신규 hook — MediaRecorder
  - MIME 자동 선택 (webm/opus 우선 → webm → ogg → mp4)
  - getUserMedia 권한 + 거부/미지원/마이크 부재 에러 분기
  - 언마운트 시 stream/timer 안전 정리
- CaptureView 도크 그리드 `4 cols mobile / 7 cols md`로 변경 — 사진·영상 옆에 `RecordBtn`
- 녹음 중: rose 테두리·아이콘 + 깜빡이는 dot + `mm:ss` 타이머
- 정지 → moments/upload → POST `media_type="audio"` + `duration_sec`
- TraceCard audio 카드: 인디고 박스 + Mic 아이콘 + 네이티브 `<audio controls>`
- `suggestActions` audio 분기: Task로 + 프로젝트로

**도크 밑 퀵 메뉴 (QuickLink 5개)**
- 캔버스·연락처·메일·퍼스널·인사이트 — 둥근 칩 + 아이콘 + 텍스트
- 사이드바 접근이 좁아진 모바일 사용자 진입점 보강

### 다음 할 일

#### 🟡 사용자 직접 처리 (변동 없음)
- Supabase Dashboard에서 `planners-moments` 옛 버킷 수동 삭제 (세션 133 마이그레이션 후 4객체 잔존)
- Toss 가맹점 승인 + Vercel 환경변수
- Gmail 재연결 공지 (세션 132 OAuth scope 확장 — 구독자는 Settings > 외부 연결에서 Google 재연결 1회 필요)

#### 🟢 캡쳐 Phase 3 (다음 세션)
1. **녹음 → 자동 transcribe** — Claude Haiku/Whisper로 음성→텍스트 자동 변환 + body에 저장 + Task로 칩에서 사용
2. **GPS 백그라운드** — 진짜 PWA 백그라운드(Service Worker + PeriodicSync) — Android Chrome 한정. iOS는 포기.
3. **운동·식사 카드에 구조화 표시** — 카드에서 강도/심박수/칼로리 시각화 (지금은 텍스트 summary만)
4. **운동/식사 카드 → 분석 액션 자동 사용 가능** — 현재는 사진 있는 moment만 분석 가능. routine은 안내 toast만. transcribe·표 입력으로 가능하도록.
5. **설정·도움말·앱 설치 진입점** — UtilityBar 아바타 드롭다운에 통합

#### ⚪️ 보안 권고 (낮은 우선순위)
- Rate Limiting (인증 API 분당 제한, Upstash Redis 등)

---

## 세션 133 핵심 성과 (2026-05-13)

### 1. 이월 작업 정리

- 🔴 **Storage `planners-moments` → `myverse-moments` 마이그레이션 완료** — 4개 객체 이전 (`scripts/migrate-moments-bucket.js`). `myverse_daily_moments` URL은 이미 새 버킷 참조라 0행 업데이트. 옛 버킷 4개 객체 잔존 → 사용자가 Supabase Dashboard에서 수동 삭제.
- 🟡 **Myverse 구독 만료 체크 SSOT 정리** — `subscription_status='active'` 만 검증하던 5곳에서 `subscription_expires_at` 누락 → 만료된 active 사용자가 chat 무제한 사용·매일 브리핑 수신·인트라에서 "active" 표시 등 잠재 버그. 6개 파일 일관 적용:
  - `lib/myverse/subscription.ts` 신규 — `isMyverseSubscriberActive()` + `effectiveSubscriptionStatus()` SSOT
  - `app/(Myverse)/myverse/app/layout.tsx` — 헬퍼 호출 + 만료 감지 시 DB best-effort UPDATE
  - `app/api/myverse/chat/route.ts` — `subscription_expires_at` 함께 조회 + 헬퍼 판정
  - `app/api/myverse/cron/briefings/route.ts` — 시간 필터 SQL + 만료 검증 헬퍼 (PostgREST `.or()` 두 번 chain 모호성 회피)
  - `features/myverse/planner/PurchaseView.tsx` — "활성 구독" 박스/재결제 버튼이 진짜 활성만 노출
  - `app/intra/planners/page.tsx` — active 카운트·배지가 만료자를 자동 expired로 처리

### 2. Myverse 캡쳐 페이지 신규 — 5 채집 → 9 영역 통합 진입점

**메뉴 추가** (`features/myverse/app/AppSideNav.tsx`)
- INSIDE > ENGINE 그룹 "오늘" 위에 "캡쳐" 메뉴 (`bolt` 아이콘 — Quick Capture 메타포)

**라우트 + 페이지** (`app/(Myverse)/myverse/app/capture/page.tsx`)
- 서버 컴포넌트, force-dynamic. CaptureView 클라이언트 컴포넌트 호출.

**CaptureView** (`features/myverse/capture/CaptureView.tsx`)
- 상단 빠른 도크 6 버튼:
  - 메모 (textarea)·사진 (file)·영상 (file) → **moments** (image/video/text)
  - 식사·운동 (activity + 시간 입력) → **routines** (category='meal'/'exercise')
  - 체크인 (place_name + GPS 자동 채움) → **places**
- 카드 리스트: `GET /api/myverse/traces?date=today` — moments/places/routines 통합 + 시간 역순
- source별 배지·색상:
  - 한 장면(인디고) · 장소(emerald) · 일과(amber)
- AI 액션 칩 (suggestActions):
  - 텍스트 메모 → Task로 · 프로젝트로 · 검색해 볼까요? (Google 새 탭)
  - 음식 사진 (`body` + 음식 키워드 또는 activity='식사') → 식단·열량 분석 (`/api/myverse/moments/{id}/analyze-food`)
  - 운동 사진 → 운동 분석 (`/api/myverse/moments/{id}/analyze-exercise`)
  - 업무·학습 → 프로젝트로 / Task로
  - 축하·관계 → 소셜 공유 (Web Share API)
  - routine 카드(meal/exercise) → 분석 칩 안내 (사진 없으면 toast 안내)
  - 모든 카드: 공유 (navigator.share or 클립보드 fallback) · 삭제

**DailyView 3 카드 제거** (`features/myverse/planner/DailyView.tsx`)
- TodaySceneCard 정의 + 사용처 + 관련 import 6개(`DailyMomentsAuto`, `SnsPostComposer`, `DailyHealthStats`, `CameraIconForCard`, `DailyPlacesCard`, `DailyRoutinesCard`) 모두 제거
- 컴포넌트 파일(`DailyMoments.tsx`, `DailyPlacesCard.tsx`, `DailyRoutinesCard.tsx`)은 보존 — 다른 페이지(TracesTimelineView 등)에서 import할 가능성 있음. dead code 정리는 다음 세션.
- 약 70줄 감소

### 다음 할 일

#### 🟡 사용자 직접 처리
- **Supabase Dashboard에서 `planners-moments` 버킷 수동 삭제** (오늘 마이그레이션 후 옛 위치 4개 객체 잔존)
- **Toss 가맹점 승인 + Vercel 환경변수** (대표자 신분증·사업자등록증 → 승인 후 client/secret Vercel 등록)
- **Gmail 재연결 공지** — 세션 132 OAuth scope 확장(`gmail.send` + `gmail.modify`)으로 구독자는 Settings > 외부 연결에서 Google 재연결 1회 필요

#### 🟢 캡쳐 Phase 2 (다음 세션)
1. **프로젝트 선택 모달** — 지금은 "다음 단계에서 추가됩니다" toast로 placeholder. 모달에서 프로젝트 선택 → POST `/api/myverse/projects/{id}/notes` 또는 milestones로 발전.
2. **GPS 백그라운드 트래킹** — 현재는 체크인 클릭 시 1회 위치 채움. PWA 백그라운드 위치 권한 + 시간 슬롯별 자동 places row.
3. **운동·식사 전용 폼** — 현재는 메모+activity 메타로 임시. 운동 강도(level 1~5)·시간·심박수 / 식사 칼로리·구성 직접 입력 필드.
4. **DailyView 카드 dead code 정리** — `DailyMoments.tsx`/`DailyPlacesCard.tsx`/`DailyRoutinesCard.tsx`가 다른 페이지에서 정말 안 쓰이면 파일 자체 삭제.
5. **사이드바 하단 vs 우상단 메뉴 겹침** — A/B/C 답변 대기 중. 설정·도움말·앱설치를 우상단 아바타 드롭다운으로 옮길지 결정 필요 (UniverseUtilityBar SSOT 7요소 보강).

#### ⚪️ 보안 권고 (낮은 우선순위)
- Rate Limiting (인증 API 분당 제한, Upstash Redis 등) — 외부 인프라 선택 결정 필요

---

## 세션 132 핵심 성과 (2026-05-12)

### 핫픽스 (개별 push 완료)
1. **대문자 /Myverse 경로 하드코딩** — `app/(Myverse)/myverse/page.tsx`에 `router.replace("/Myverse/app/daily")` (대문자 M) 하드코딩 → 인증 사용자가 `/myverse` 접근 시 404. Next.js URL case-sensitive. page.tsx 2곳 + story 페이지 1곳 모두 소문자 정정. (commit `214b26cc`)
2. **사이드바 접힘 FOUC** — `SidebarCollapseProvider` `useState(false)`로 시작 → SSR/첫 페인트는 펼침(라벨 큰 글씨 보임) → useEffect로 localStorage 읽어 접힘. 다크모드 패턴 재사용 — 인라인 스크립트로 `<html>`에 `myverse-sidebar-collapsed` 클래스 부착 + useState 초기값을 함수로(HTML 클래스 검사) + toggle 시 localStorage + HTML 클래스 동시 동기화. (commit `63b4e6e7`)

### Notion Mail 통합 (4단계, 각 단계별 push)

**1단계 — 인박스 페이지 + 본문 캐시** (`bb3d6341`)
- SQL: `myverse_email_imports`에 `body_text`/`body_html`/`body_fetched_at`/`is_read`/`is_starred` (Prod 적용)
- API: `GET/PATCH /api/myverse/email-imports/[id]` — 본문 on-demand fetch + Gmail API + DB 캐시 + 읽음·즐겨찾기·triage PATCH
- 페이지: `/myverse/app/mail` 신규 + `MailView.tsx` (3패널 — 카테고리/검색/목록/본문)
- 카테고리 필터 7종 — 전체·수신함·영수증·초대·뉴스레터·즐겨찾기·보관함
- 사이드바에 "메일" 메뉴 추가
- Settings 외부연동 페이지에 "Connected emails" / "Connected calendars" 그룹 분리 + Gmail row

**2단계 — 필터 패널** (`4ffe11c8`)
- Filter 토글 버튼 + 활성 필터 카운트 배지
- 읽지 않음 / 날짜 범위(전체/오늘/이번주/이번달) / 발신인 chip (top 8 빈도순)
- 활성 필터 칩 (패널 닫힘 시 요약 + X 해제)

**3단계 — 메일 → Daily 임베드** (`a575c3e8`)
- `NoteItem` 타입에 `'email'` + `email_id` + `email_meta` 추가
- `DailyView` email 카드 렌더링 — rose 그라디언트, 보낸이 아바타, 제목+snippet 4줄, Gmail 원본 링크
- `MailView` "Daily 임베드" 버튼 — 오늘 daily.notes에 push + triage_state='note' 마킹
- 헤더 아이콘에 Mail 아이콘 + auto-title "메일 N" 패턴

**4단계 — 답장·작성·Gmail 동기화** (`925ef605`)
- OAuth scope 확장: `gmail.send` + `gmail.modify` (기존 사용자 재연결 필요)
- API: `POST /api/myverse/integrations/gmail/send` (RFC 822 + base64url + In-Reply-To/References + threadId)
- API: `POST /api/myverse/integrations/gmail/modify` (archive/mark_read/mark_unread/star/unstar)
- composer 모달 — 답장(자동 인용 + Re:) / 새 작성 — To/Subject/Body
- 헤더 답장 버튼 + 사이드바 새 메일 작성 버튼 (PenSquare)
- archive/star/read 시 로컬 DB + Gmail 라벨 동시 동기화 (best-effort)
- 403 insufficient_scope 응답 + 재연결 안내

---

## 세션 131 핵심 성과 (2026-05-12)

### 1. 마인드맵 PNG/SVG export
- MindmapEditor 툴바에 PNG/SVG 버튼 (html-to-image의 toPng/toSvg)
- 캡처 영역: containerRef 전체 — `data-mindmap-ui` 속성 가진 노드(툴바·도움말·색상 picker·모달)는 filter로 제외
- 파일명: `mindmap-{root.text}-{ISO date}.{png|svg}`

### 2. 마인드맵 선택 노드 → Daily Task 변환
- MindmapEditor에 `onPromoteText` prop 추가 (CanvasEditor와 동일 패턴)
- 선택 노드 우상단 color picker 옆에 "+Task" 버튼 (root 제외, 다른 노드 선택 시만 표시)
- CanvasStudio가 `handlePromoteText`를 mindmap·canvas 양쪽에 동일 콜백으로 전달

### 3. 템플릿 → 마인드맵 시각화 (OKR Roll-up 등)
- TemplatesView 모달 푸터에 "마인드맵으로" 버튼 (GitBranch 아이콘)
- 클릭 → 본문(또는 framework 데이터)을 `parseTextToMindmap`으로 트리 변환 → POST `/api/myverse/canvases` with `{ data: { mindmap: { root } } }` → 새 캔버스로 navigate
- OKR Roll-up / RACI / SAFe PI 등 `##` 헤딩 구조 템플릿이 즉시 시각화됨

### 4. 회사 → ContactsView 필터
- CompaniesView 회사 행에 ExternalLink 버튼 (소속 인원 0개면 미노출)
- 클릭 → `/myverse/app/contacts?company={id}` 이동
- ContactsView가 `useSearchParams`로 `company` 읽어 `c.company_id === filter` 필터
- 헤더에 활성 필터 칩(회사명 + X 해제 버튼)

### 5. 템플릿 → 프로젝트로 적용 — 마일스톤/노트 이중 모드
- 기존 "프로젝트로 적용" 모달에 라디오 추가 — "마일스톤으로" / "프로젝트 노트로"
- 마일스톤 모드: `extractMilestones` 추출 → milestones POST (기존 동작)
- 노트 모드: 본문 통째로 → `/api/myverse/projects/{id}/notes` POST (Pre-mortem 위험·RACI 매트릭스 등 구조 보존)
- 헤딩 0개여도 노트 모드는 항상 가능 → 본문 있으면 "프로젝트로 적용" 버튼 노출 (이전엔 헤딩 없으면 숨김)
- 미리보기도 모드별 분기 (마일스톤 ◆ 리스트 / 노트 본문 잘림 미리보기)

---

## 세션 130 핵심 성과 (2026-05-12)

### 1. 마인드맵 텍스트 import
- `parseTextToMindmap()` — 마크다운 헤딩(`#·##·###`) + 들여쓰기 outline 자동 감지
- 첫 줄이 `#`로 시작 → 마크다운 모드, 들여쓰기 있음 → outline 모드 (탭=1, 스페이스 2개=1)
- 모달 UI: `<textarea>` + "현재 root에 추가" / "전체 교체" 라디오 + 예시 placeholder
- 외부 학습 자료·메모를 그대로 붙여넣어 즉시 마인드맵 생성

### 2. 회사 관리 페이지 (`/myverse/app/contacts/companies`)
- 신규 라우트 + `CompaniesView` 컴포넌트
- 회사 목록 (검색·CRUD·삭제 확인)
- 회사별 소속 인원 펼침(클릭) — name/title/email
- 컬러 / 로고 URL / 도메인 / 산업군 / 메모 편집
- 삭제 시 contact 자동 분리(ON DELETE SET NULL)
- ContactsView 헤더에 "회사 (N)" 링크 배지

### 3. 간트 의존성 위반 감지 + auto-fix
- 위반 조건: `dayDiff(dep.date, task.date) - dep.duration < 0` (Finish-to-Start 깨짐)
- 위반 화살표: dashed rose + 굵은 stroke + 별도 marker
- 위반 task 라벨에 ⚠ AlertTriangle + 빨간 색 tooltip
- 상단 배너: "의존성 위반 N개" + "자동 일정 조정" 버튼
- `autoFixDependencies()` — 위상정렬 5pass, 위반 task의 시작일을 모든 dep의 max(end_date)+1일로 push, daily 행 간 자동 이관
- 범례에 "의존성 / 위반" 항목 추가

### 4. 마인드맵 → 프로젝트로 적용
- MindmapEditor 툴바에 Target 버튼 + Apply 모달
- root의 1단계 자식 = 마일스톤, 손자 트리 = description으로 들여쓰기 평탄화
- 프로젝트 선택 + 미리보기 (최상위 3개 손자만 표시, 나머지는 "외 N개")
- `myverse_project_milestones` 일괄 POST

### 5. 간트 PNG/SVG export
- 차트 컨테이너에 `chartRef`
- 줌 토글 옆 [PNG | SVG] 버튼 (Image / FileImage 아이콘)
- `html-to-image` 활용 — PNG는 pixelRatio 2, SVG는 1
- 파일명: `gantt-YYYY-MM-DD.{png,svg}`

### 6. 신규 프레임워크 4종 (Prod 적용)
- `sql/myverse-templates-frameworks-v2.sql`
- **RACI Matrix** — 역할 분담 명확화 (R/A/C/I + 검증 체크리스트)
- **Pre-mortem** — 6개월 후 실패 시나리오 역추론 + 4분면 분류 + 트리거 신호
- **OKR Roll-up** — 조직 → 팀 → 개인 OKR 정렬 (`{{quarter}}/{{year}}/{{user}}` 변수 사용)
- **SAFe PI Planning** — Business Context / PI Objectives / ART Risks (ROAM) / 의존성 보드 / Confidence Vote

---

## 세션 129 핵심 성과 (2026-05-12)

### 1. 간트 차트 추가 고도화
- **의존성 화살표** — `PlannerTask.depends_on: string[]` 신규 필드, SVG 직각 경로(`M→L→L→L→L`) + arrow marker
- **편집 팝오버 의존성 picker** — 자기 자신 제외 후보 select + 현재 의존 chip + Unlink 토글
- **좌측 시작일 핸들** — `resize-left` 모드 (끝점 고정 + 시작일 이동, duration 자동 조정, daily 행 간 자동 이관)
- **마일스톤 ◆ 드래그** — diamond 마커 mousedown→drag→`milestones` PATCH로 due_date 변경
- **ProjectKanbanView DnD** — 컬럼 간 status 변경 (DailyKanban 패턴 일관화)

### 2. 템플릿 — 변수 치환 + 마일스톤 자동 변환
- `lib/myverse/templates.ts`: `buildDefaultVarContext` / `expandVariables` / `extractVariables` / `extractMilestones` 4개 신규 함수
- 변수 치환: `{{today|fallback}}` 패턴. `today/date/year/month/day/quarter/week/weekday/user/role` 자동 채움
- 모달 본문 상단에 치환된 변수 미리보기 (인디고 안내 박스)
- 마일스톤 추출: `## 헤딩` + `- [ ]` 체크박스 + `(YYYY-MM-DD)` due_date 자동 인식
- 모달 푸터에 "프로젝트로 적용" 버튼 → 프로젝트 선택 모달 → `myverse_project_milestones` 일괄 INSERT
- 시드 마이그레이션: `myverse-templates-variables.sql` (Prod 적용) — daily_log/weekly_review/project_kickoff 본문에 변수 주입, 신규 `quarterly_kickoff` 추가

### 3. 마인드맵 — 캔버스 위 신규 모드
- 신규 `features/myverse/planner/MindmapEditor.tsx` — SVG 방사형 + 자동 레이아웃
- 키보드: Tab=자식 / Enter=형제 / Space=접기 / F2·더블클릭=편집 / Delete=삭제 / Esc=편집취소
- 휠 줌(0.3~3x), 배경 드래그 pan, 1.5초 디바운스 자동 저장
- **노드 수동 드래그** — `MindmapNode.position` 오버라이드, 자동 레이아웃 위에 덮어쓰기
- **색상 커스터마이즈** — 선택 노드 우상단 8색 PALETTE picker + "자동" 복귀 + "위치 리셋"
- CanvasStudio가 `data.mindmap` 감지해 MindmapEditor로 분기 (`data.ppcanvas`와 양립)
- CanvasListView에 "새 마인드맵" 버튼 + 카드 좌상단 인디고 배지 + 빈 썸네일 GitBranch 아이콘
- 캔버스 list API에 `kind: "canvas"|"mindmap"` 필드 추가 (data는 응답에서 제외 — 페이로드 부담 0)

### 4. Person/Company 정규화 Stage 2
- DB: `sql/myverse-companies.sql` (Prod 적용 완료) — `myverse_companies` 테이블 + `contacts.company_id` FK + 기존 `company_name` 자동 백필
- API: `app/api/myverse/companies/route.ts` (CRUD + 회사별 contact 카운트, find-or-create)
- contacts insert에 company_id/person_type/role/tags/avatar_url 받게 확장
- **ContactsView 자동완성** — `<datalist id="myverse-companies-datalist">`로 회사 input autocomplete (메인 폼 + bulk edit 폼 모두)
- save 시 organization 입력값이 새 회사면 `/api/myverse/companies` find-or-create 호출 → `company_id` 자동 연결

### 5. DigitalCard PNG 캡처 — 브랜드 자산 반영
- 외부 이미지(아바타·brand 로고·QR) CORS로 누락되던 문제 해결
- 캡처 전 모든 `<img src>`를 `fetch → blob → dataURL`로 prefetch, 로드 완료까지 대기 (1.5s 타임아웃)
- 캡처 후 원래 src 복원 (React rehydrate 안전성)

---

## 세션 128 핵심 성과 (2026-05-12 → 2026-05-13)

### 1. 일정 & 업무 카드 — 칸반/리스트 토글 + 위계
- `taskColumn(status)` 단일 SSOT: 계획=todo/carried/hold/moved, 진행=doing, 완료=done/cancelled
- `DailyKanban` 신규 — 컬럼 3개 + 미팅 시간 헤더(`10:00 대강의실`) + 메인/서브 들여쓰기 + 드래그&드롭으로 status 변경 + 다크모드 가독성
- 리스트 뷰에도 메인-서브 위계 트리(좌측 회색 라인 + 들여쓰기) 적용 — `SubtaskRow` 컴포넌트
- 헤더에 [리스트 | 칸반] 토글 (localStorage 영속화)
- PlannerTask 타입에 `doing` status 추가

### 2. 공휴일·절기 ↔ 개인 일정 분리
- 헤더에 이미 표시되는 공휴일·절기는 일정&업무 카드에서 제외 (개인 미팅·할 일만)

### 3. 경중완급(우선순위) 시스템 완전 제거
- DailyTaskRow: PRIORITY_META · QUADRANT_CYCLE · PriorityBadge · PriorityPicker · TaskPriority 삭제
- DailyView: 인라인 priority 렌더·updateTaskPriority·미완 모달의 priority 배지 제거
- CalendarEntryEditor: 2×2 사분면 피커 + state 제거
- `priority` 필드는 데이터 호환 위해 타입 유지(UI엔 안 나옴)

### 4. 프로젝트 등록 고도화 + 모달화
- 새 프로젝트 폼 → 팝업 모달(`max-w-xl`, 백드롭 블러, ESC/외부클릭 닫기)
- 추가 필드: **시작일 / 종료일(마감) / 목표 한 줄 / 마일스톤(선택)** — title+due_date 페어
- 마일스톤 입력 시 `myverse_project_milestones` 테이블에 INSERT (milestone-sync가 자동으로 일정&업무에 `ms_` 마커 생성)
- 종료일 입력 시 `myverse_calendar_entries` anniversary로 자동 등록

### 5. 프로젝트 상세 페이지 — 리스트/칸반/간트 (404 해결)
- 신규 라우트: `app/(Myverse)/myverse/app/projects/[id]/page.tsx` (이전엔 페이지 없어서 404)
- ProjectTasksTab에 [리스트/칸반/간트] view toggle 추가
- 업무 탭은 `ms_` 접두사 마커 필터 아웃 (마일스톤 탭과 중복 제거)
- 마일스톤·업무 혼란 해소: 마일스톤은 큰 단계(milestones 테이블), 업무는 실행 액션(daily.tasks)

### 6. 간트 차트 고도화 (4단계)
- **막대 너비** = `duration_days × colWidth`, 막대에 `1d`/`5d` 라벨
- **드래그 늘리기** — 막대 우측 1.5px 핸들 (`cursor-ew-resize`)
- **막대 이동** — 본문 잡고 좌우 드래그 → 시작일 변경 (daily 행 간 자동 이관)
- **편집 팝오버** — 업무명 클릭 → 시작일 date picker + 기간 number input
- **자율 헤더** — 총 일수 기준 자동 줌: ≤30 일 / ≤90 3일 / ≤365 주 / >365 월 (월/주 시작은 major tick 굵게)
- **수동 줌 토글** — 우측 상단 [자동/일/주/월]
- **오늘 표시줄** — 빨간 세로 라인 + "오늘" 라벨
- **마일스톤 ◆ 다이아몬드 마커** — `myverse_project_milestones` fetch, 별도 행에 옅은 보라 배경
- **범례** — 좌측 상단 (계획·진행·완료·마일스톤·오늘)

### 7. 미완 업무 호출 — 메인+서브 동반
- API `/api/myverse/daily/pending-tasks`: 미완(todo/hold) 메인 + 그 모든 서브(완료·취소 포함) 함께 반환
- 모달 UI: 메인만 체크박스, 서브는 들여쓰기 + 상태 배지(✓/·/⏸/✕) + 옅은 회색 배경, 완료 서브 line-through
- 이월 로직: 메인 선택 시 미완 서브 자동 동반, 새 ID 생성하며 `parent_id` 맵핑 보존 → 부모-자식 관계 그대로 이전

### 8. 노트 → Task 승격 다양화
- CanvasEditor: 텍스트 도구바에 `＋태스크` 버튼 (`onPromoteText` prop)
- CanvasStudio: `source: "note"` + `source_note_id: canvasId`로 POST
- TemplatesView: "태스크로 승격" 버튼 (500자 절단, ✓ 피드백)

### 9. 사이드바 토글 위치 이동
- 좌측 사이드바 토글 버튼: footer 하단 → **우측 상단**으로 이동
- `absolute` 포지셔닝 — 레이아웃 공간 차지 0

### 10. 신규 API + DB 필드
- `PATCH/DELETE /api/myverse/daily/[date]/task/[taskId]` — 단일 task 패치 (날짜 이동 시 daily 행 간 자동 이관)
- `PlannerTask.duration_days` 추가 (간트 막대 폭용, 기본 1)
- `PlannerTask.status`에 `doing` 추가

### 11. Hydration 에러 fix
- `app/layout.tsx` `<html>`에 `suppressHydrationWarning` — myverse 다크모드 인라인 스크립트(`myverse-dark` 클래스 추가)와 React hydration 충돌 해결

### 12. 폐기
- **TimeBlock 기능 삭제** — `features/myverse/planner/TimeBlockTimeline.tsx` 파일 제거, DailyView import/state/UI 전부 제거. API 라우트와 `myverse_timeblocks` DB 테이블은 유지(사용 없음).

---

## 세션 127 핵심 성과 (2026-05-11)

### 1. 마이버스 무끼 LLM 확장 + 포스트 편집·DailyView 분할
- 무끼 의도 파서를 Claude Haiku tool calling으로 확장 (7개 도구: 일정/할일/연락처/노트/모먼트/장소/루틴)
- DailyMoments 편집 모달에 visibility 토글 + Web Share 공유 버튼
- DailyView 3,707줄 → 3,158줄 분할 (`DailyTaskRow`/`DailyTrackingBlocks`/`UpcomingSchedule`)

### 2. 사이드바 접힘 (Claude 스타일)
- `SidebarCollapseContext` + `MainContent` (좌측 여백 `md:ml-52` ↔ `md:ml-14`)
- `AppSideNav`: 접힘 시 아이콘만 + 우측 hover tooltip + 토글 버튼
- localStorage `myverse_sidebar_collapsed` 영속화

### 3. 사이트 차단 토글·미리보기 (사생활)
- `myverse_users.page_visible BOOLEAN` 컬럼
- `/settings/privacy` 최상단 토글 + 방문자 화면 미리보기 (공개/비공개 즉시 전환)
- `lib/myverse/handle/public-page.ts`에 page_visible 게이트

### 4. 퍼스널 — 브랜드 자산 SSOT
- `myverse_brand_assets` (8 type: logo/palette/typography/tagline/mission/image/link/template)
- `brand-assets` Storage 버킷 + 파일 업로드 UI
- 명함 자동 노출 (`show_on_card`) + @handle 페이지 hero 자동 렌더 (`show_on_portfolio`)
- 사이드바 PERSONAL에 "브랜드" 메뉴

### 5. 메일/캘린더 양방향
- Google Calendar **read + write**: `myverse_calendar_entries.google_event_id`, POST/PATCH/DELETE 자동 푸시
- Gmail 임포트: OAuth scope `gmail.readonly` 추가, 최근 7일 메타 캐시
- **Triage 실행**: 메일 → Task/Event 자동 생성 + sourceEmailId 추적
- Claude Haiku LLM 분류 (confidence<0.6 시 키워드 fallback)
- 통합 페이지: Calendar/Gmail/Photos/Health 4개 카드

### 6. Personal OS 인프라
- `PlannerTask` 확장: `type/amount/currency/assignee_person_id/source*`
- `myverse_contacts`: `person_type(self/internal/external)/company_name/role/tags`
- `myverse_timeblocks` 신설 (Task ↔ 시간 슬롯)
- 노트 → Task 승격: CornellRowsInline 행마다 버튼 + `/api/myverse/tasks` POST
- 템플릿 시드: Daily/Weekly Review/Project Kickoff

### 7. 마케팅 페이지 통합
- 헤더 nav: 로드맵·문의·서비스·기술·철학·팀·About 제거 → **브랜드 스토리 + 가격** 2개
- `/myverse/story` 신규 — 어둠의 점/흩뿌린 조각/3원칙/다섯 번의 전환/Personal Black Box (philosophy + about 통합)
- Home에 추가: ATTENTION SHIFT 섹션, 데이터 소스 6개, 데이터 주권 5원칙, Universal Record (다크 코드 블록)
- 페이지 삭제: /about /team /philosophy /service /technology (내용 통합 후)
- 우상단 유틸리티 바: ABOUT 버튼 hideAbout
- 로고만 소문자 `myverse` (본문/메타/CTA는 Myverse 유지)

### 8. 카피 수정
- "서비스는 사라져도 / 나의 기록은 남는다" (이전 자라져도 → 사라져도 + 나의 기록)
- "기록이 쌓이면 / 나의 성장이 된다" (이전 역사 → 성장)
- 랜딩 화살표 인디케이터 ↑→↓← 삭제
- "당신의 기록은 안전합니까?" → "당신의 디지털 기록은 당신의 것입니까?"
- "플랫폼이 닫히면, 알려주지도 않는다" 한 줄 삭제

### 9. 개발 원칙 추가 (CLAUDE.md)
- `npm run dev` 직접 실행 금지 → `preview_start "dev"` 도구 사용 강제
- 사고 이력: 2026-05-11 Turbopack 캐시 손상 → 좀비 프로세스 → 포트 점유

### 10. DB 마이그레이션 8건 (Prod 실행 완료)
1. `myverse-page-visible.sql` (사이트 차단 토글)
2. `myverse-brand-assets.sql` + `myverse-brand-assets-bucket.sql`
3. `myverse-email-imports.sql`
4. `myverse-calendar-google-link.sql`
5. `myverse-contacts-person-normalize.sql`
6. `myverse-timeblocks.sql`
7. `myverse-templates-personal-os.sql`

---

## 다음 세션 시작 시 할 일

### 운영 사용자 직접 조치 필요
1. GCP 콘솔에서 Gmail API 활성화 (세션 127 잔여)
2. 기존 Google 사용자 재연결 안내 (scope에 `gmail.readonly` 추가됨)

### 기능 확장 (세션 132 잔여 — 다음 세션 후보)
1. **메일 사용자 정의 라벨 동기화** — Gmail 사용자 라벨 이름 fetch + Myverse 사이드바에 라벨 그룹 추가
2. **메일 첨부파일** — 본문 fetch 시 attachments 메타도 가져와 표시·다운로드
3. **메일 server-side 검색** — 현재는 client-side 필터. Gmail q= 파라미터로 원격 검색
4. **메일 thread view** — 같은 thread_id 메시지 그룹화 (현재는 메시지 단위)
5. **Outlook/IMAP 메일 통합** — 다른 ESP 추가 (별도 OAuth + provider 분리)
6. **마인드맵 협업 모드** — Yjs/CRDT 또는 read-only 공유 링크
7. **간트 critical path** — 의존성 그래프 최장 경로 강조
8. **시드 템플릿 — Decision Log·SBI Feedback** 추가
9. **운영 조치 (사용자 직접)**: GCP Gmail API 활성화 + 기존 Google 사용자 재연결 (gmail.send/modify scope 추가)

---

## 세션 125 핵심 성과 (2026-05-11)

### 무끼 플로팅 AI 통합
- 사이드바 MUKKI 그룹(무끼/일기/코치) 제거 → 우측 하단 그라디언트 FAB로 통합
- 신규 `MukkiFab.tsx` — 드로어 오버레이 (모드 탭 [무끼/일기/코치] + 채팅 + 입력)
- 대화 자체는 저장 X (state-only). **의도는 마이버스 서비스에 자동 반영**
- 신규 `/api/myverse/mukki/intent` — 한국어 정규식 파서 (5월 20일 오후 2시 LG CNS 김철중 미팅 → calendar 자동 생성, with_whom 추출)
- `/ask`·`/diary`·`/coach` 페이지에서는 FAB 숨김 (중복 회피)

### SNS 포스팅 시스템 (오늘의 한 장면 고도화)
- DB: `myverse_daily_moments` 확장 — `media_type='text'` 추가, `media_url` nullable, `body TEXT` 컬럼
- 신규 `SnsPostComposer.tsx` — Instagram 감성 (자유 글 + 사진/영상 멀티 첨부 + 피드 공개 토글 + 게시)
- `<ShareButton>` 컴포넌트 — Web Share API + clipboard fallback
- 메타 입력 [상세 ▾] — 장소·시간·함께·카테고리 (collapsible)
- 미러 저장: 장소시 `myverse_daily_places`, 카테고리·시간시 `myverse_daily_routines`에도 INSERT

### IA 분리 — 3 카드 독립
- `UnifiedDayCard` (3 in 1 통합) → `TodaySceneCard` + `<DailyPlacesCard>` + `<DailyRoutinesCard>` 독립 sibling
- 각 카드 자체 헤더·자체 입력 보유

### 흔적 통합 API
- 신규 `/api/myverse/traces` — moments + places + routines UNION
- 정규화 `UnifiedTrace` shape: `source: "moment"|"place"|"routine"` 구분자, `happened_at` 정렬

### 레이아웃 fixed 전환
- TopNav: `sticky top-0` → `fixed top-0 z-40`
- AppSideNav: `sticky top-12 h-[calc(100vh-3rem)]` → `fixed top-12 left-0 bottom-0 w-52 z-30`
- AppMonthBar: `sticky top-12` → `fixed top-12 right-0 bottom-0 w-10 z-30`
- main: `pt-12 md:ml-52 md:mr-10` 보정

### 코넬 노트 UX
- 제목 Enter → 첫 단서 입력란 자동 포커스 (`data-cornell-cue="first"`)
- "단서 · 키워드" → "제목, 단서, 키워드"
- "이 노트의 핵심 한 줄" → "이 노트의 핵심 요약"

### 핸들 페이지 용어 정리
- "내 Verse" 폐기 → "내 페이지" / "피드에 공개하기"
- TracesTimelineView 옛 `/v/{handle}` → `/myverse/{handle}` 신경로

### 텍스트 카드 가독성
- 배지 충돌 해소: 좌상단=POST, 좌하단=🌐 공개, 우상단=hover 액션 (편집/삭제)
- 본문 `text-[12px] font-medium`, 다크모드 `text-neutral-50` 강화
- 패딩 `pt-8 pb-7` — 배지 영역 확보

### 메뉴 라벨 + 시간 줌
- "오늘"으로 메뉴 라벨 복귀 (라우트는 `/daily` 메인 유지)
- 4 페이지(daily/weekly/monthly/yearly) 우측 상단 [일간|주간|월간|연간] ViewToggle 공통

### 사이드바 footer 부동 수정
- AppSideNav footer `<div>`에 `mt-auto` 추가 — 콘텐츠 짧을 때도 하단 고정

### 오늘의 한 장면 중복 헤더 제거
- DailyView UnifiedDayCard에서 `DailyMomentsAuto compact` 추가 — 내부 헤더 숨김

### 템플릿 그리드 Instagram 비례
- `aspect-square` 제거, `grid-cols-1 sm:grid-cols-2`, `max-w-3xl/2xl mx-auto`
- 적용: `_shared.tsx`(QuadrantGrid) · `quadrants.tsx`(SWOT/4P/PEST/9-Box/MoSCoW/Kano/QuadrantBlank) · `empathy.tsx`(Ikigai/메타)

#### 처리 보류
- TracesTimelineView UI 통합 — places/routines를 텍스트 카드로 렌더 (현재는 moments만 그리드)
- 무끼 의도 파서 LLM 확장 (Phase 2: Claude API tool calling 7개 도구)
- 포스트 편집 모달의 visibility 토글 + 직접 [공유] 버튼

---

## 세션 124 핵심 성과 (2026-05-11)

### IA 재구성 — INSIDE/OUTSIDE 사이드바
- 5 Lane → INSIDE(ENGINE/PERSONAL/BLACKBOX/MUKKI) + OUTSIDE(피드/프로필/명함)
- `/today` → `/daily` 통합 (메뉴 라벨 "오늘", 라우트 `/daily` 메인). 4개 시간 줌 페이지(daily/weekly/monthly/yearly)에 [일간|주간|월간|연간] ViewToggle 공통 노출
- 신규 `features/myverse/app/AppSideNav.tsx` — sticky `top-12` h-calc, INSIDE/OUTSIDE 그룹
- AppTopNav 모바일 햄버거 + 아바타 알림 배지(60s 폴링) + 검색/캡처

### 핸들 URL 재구조 — `/myverse/v/[handle]` 폐기
- `/myverse/[handle]` 메인 (이미 존재한 LinkedIn-style page 재활용)
- `[handle]/layout.tsx` + `HandleSubNav` — [공개 흔적] [프로필] [명함] sticky 서브탭
- `[handle]/profile/page.tsx` (프로페셔널·포트폴리오 전용 뷰) + `[handle]/card/page.tsx` (받는 사람 시점 명함)
- 레거시 `/v/[handle]/*` → ClientRedirect로 새 경로 이전 (QR 호환)
- middleware `/@handle` rewrite 그대로 작동

### 디지털 명함 SSOT — `components/DigitalCard.tsx`
- 5 액션: 공유 / vCard / 링크 / QR / 이미지
- QR: `qrcode` 패키지 client-side · vCard 3.0 RFC 6350 · PNG: `html-to-image` pixelRatio 2
- 사용처: `/myverse/app/card` (인디고) · `/wio/app/my/card` (WIO 블루) · `/myverse/[handle]/card` (받는 사람)
- `MyProfileCard`에 `theme` ("light"|"dark") + `universeProfileHref` prop 추가 (21 브랜드 호환 — 기본 dark)

### 노트 4종 미리보기 통일
- 손글씨·캔버스·코넬·템플릿 모두 `h-48 cursor-pointer group + Maximize2 hover overlay` 패턴
- **캔버스 미리보기**: `<CanvasStudio embed>` (툴바 포함) → 신규 `CanvasPreview.tsx` (썸네일/SVG 직접 렌더, 콘텐츠 only) 교체
- **템플릿**: 인라인 인터랙티브 grid → 미리보기 (`pointer-events-none`) + 클릭 시 모달 확장
- **코넬**: max-h-64 → h-48 통일 + hover overlay 추가

### 캔버스 저장 버그 수정
- 1.5s 디바운스 후 발화하는 자동 저장이 모달 빠른 닫기 시 unmount cleanup의 `clearTimeout`으로 취소되어 데이터 유실
- 수정: cleanup에서 대기 타이머 있으면 즉시 flush(`onSave(engine.serialize())`) 후 destroy

### 모달 템플릿 입력 버그 수정
- 확장 모달의 `renderFramework`가 localStorage에만 쓰고 React state 갱신 X → 입력해도 stale 표시
- 신규 `TemplateGridEditor` 컴포넌트 — `useState<FrameworkData>` + onChange 시 localStorage + state 동시 업데이트

### 템플릿 그리드 비례 정비 (Instagram 패턴)
- `aspect-square` 고정 제거 — 콘텐츠 자율
- `grid-cols-1 sm:grid-cols-2` 모바일 스택 / 태블릿+ 그리드
- `max-w-3xl mx-auto` (사분면) / `max-w-2xl mx-auto` (스택) — 와이드 스크린 절대 안 늘어남
- Y축 컬럼 모바일 hidden, sm+ 노출
- 적용: `_shared.tsx`(QuadrantGrid) · `quadrants.tsx`(SWOT/4P/PEST/9-Box/MoSCoW/Kano/QuadrantBlank) · `empathy.tsx`(Ikigai 4원 + 메타 입력 행)

### 코넬 노트 UX 개선
- 제목 입력 중 Enter → 첫 단서 입력란 자동 포커스 (`data-cornell-cue="first"` 마킹)
- 컬럼 헤더: "단서 · 키워드" → "제목, 단서, 키워드"
- 요약 placeholder: "이 노트의 핵심 한 줄" → "이 노트의 핵심 요약"

### 시간 줌 페이지 ViewToggle 공통 적용
- 4개 페이지(daily/weekly/monthly/yearly) 우측 상단 [일간|주간|월간|연간] 토글
- ViewToggle: key "today" → "daily", href `/today` → `/daily`

### PP(Planner's Planner) 잔재 정리
- `PpCanvas.tsx` → `CanvasEditor.tsx` (git mv 히스토리 보존)
- `PpCanvasToolbar.tsx` → `CanvasEditorToolbar.tsx`
- 컴포넌트명·Props·주석 일괄 갱신 (DB의 `data.ppcanvas` 키는 레거시 호환 유지, 코멘트 명시)

#### 처리 보류
- DailyView 3,650줄 코드 분할 리팩토링
- 사이트 차단 토글·미리보기 기능 (사생활 토글)
- 마이그레이션 `/myverse/app/X` → `/X` 일괄 치환 (124 파일, middleware 308로 충분)

---

## 세션 123 핵심 성과 (2026-05-10)

### Myverse 사이트↔앱 통합 5 Phase

1. **route group 캐논컬화**: `(MyVerse)` → `(Myverse)` (78 파일 git rename + 9 문서)
2. **middleware 통합 라우팅**: `myverse.kr/today` 깔끔 URL + `/app/X` → `/X` 308 + 인증 시 `/` → `/today` 302
3. **헤더 디스패처**: 비인증 "Myverse 시작하기" CTA + WORK 드롭다운 Myverse에서 숨김
4. **/pricing 신설**: Free/Pro 2티어 + 제공/베타/Phase 2 SSOT 라벨
5. **/about 재작성**: Personal OS 3원칙 (운영·소유·성장)

### Personal OS 메시지 통일
- "My Universe" 폐기 → **Myverse · Personal OS · 나를 운영하는 OS**
- site-config·헤더 서브타이틀·푸터·랜딩 hero·CLAUDE.md 일괄

### 마케팅 5p 허구성 정비
- service / technology / philosophy / roadmap / team — 미구현 단정형 → 베타/예정/비전 라벨

### LinkedIn 벤치마킹 → 노션 친화 5 패턴
1. Cmd+K 명령 팔레트 (이미 구현 검증)
2. `/` 슬래시 키 → `/traces?compose=1` 직행
3. Traces 갤러리/리스트 토글 + localStorage
4. @handle 페이지 LinkedIn hero (커버·아바타·stats·share)
5. Privacy 인디케이터 — 갤러리 타일 🔒/🌐 + 리스트 인라인 칩

### 버그 수정
- 마케팅 페이지 모바일 헤더 햄버거 viewport 밖으로 밀리던 overflow (`w-[500px]` 데코 블러 → `overflow-x-hidden`)

#### 처리 보류
- 124 파일 `/myverse/app/X` → `/X` 일괄 치환 (localhost 위험, middleware redirect로 충분)
- About philosophy+team 통합 (콘텐츠 디자인 별도)
- Calendar/Map view (Phase 2)

---

## 세션 122 핵심 성과 (2026-05-09)

### Myverse Stitch 디자인 시스템 1차 도입

#### ✅ 완료

1. **/today 대시보드 리뉴얼**
   - `features/myverse/app/TodayDashboard.tsx` 신규 — Stitch Bento 레이아웃
   - 시간대별 인사 + AI Coach 카드 + 오늘의 흔적 가로 스크롤 + 다음 4시간 타임라인
   - `app/(Myverse)/myverse/app/today/page.tsx` 서버 컴포넌트화 (members.name 패스)

2. **/coach 재디자인 — Stitch Bento**
   - Hero Briefing 카드 (첫 문장 추출) + Weekly Balance 9도메인 바 차트 + Recent Capsules 그리드
   - PlannerBriefing 타입(content만 존재)에 맞춰 score/summary 의존 제거

3. **폰트 + 아이콘 시스템 도입**
   - Hanken Grotesk + Inter + Material Symbols Outlined Google Fonts
   - 모바일 bottom nav: Lucide → Material Symbols (FILL 1/0 토글)

4. **LaneHeader 공용 컴포넌트 (SSOT)**
   - `features/myverse/app/LaneHeader.tsx` — indigo label + Hanken h1 + subtitle + actions + accent + backLink slot
   - 11개 페이지 헤더 일관 정렬: today/coach/traces/feed/ask/tasks/settings + 9영역 8개

5. **9영역 페이지 헤더 정렬**
   - body/study/lifestyle/schedule/travel/move/relation/work 모두 LaneHeader + DomainBackLink
   - 도메인별 accent 컬러 prop으로 오버라이드 (BODY=#10B981, STUDY=#A855F7 등)

6. **/dm 헤더 통일** — chat Material Symbol + Hanken Grotesk

7. **/traces 타임라인 마커**
   - 월별 섹션에 vertical line + 원형 마커 추가 (Stitch Digital Archive 패턴)
   - 그리드 밀도 보존 + 타임라인 회유성 강화

#### 처리 보류

- **카드 라운드/그림자 토큰 통일** — 영향 범위 큼, 추후 일괄
- **Hover 톤 일관화** — 분산된 부분 많음, 추후
- **alternating 좌우 배치** — 그리드 밀도와 충돌, 보류

---

## 세션 120 핵심 성과 (2026-05-09)

### Myverse IA 5-Lane 정리 마감

#### ✅ 완료

1. **도구 lane 서브메뉴 패턴 (드롭다운 → 탭)**
   - `LaneSubNav.tsx`: `WORK_LANE_TABS` 추가 (프로젝트·할 일·캔버스·템플릿·연락처·퍼스널)
   - 6개 도구 페이지에 `<LaneSubNav>` 임베드
   - `planner/AppTopNav.tsx`: 드롭다운 제거, 도구를 일반 탭으로 복원
   - `features/myverse/app/AppTopNav.tsx` (중복 파일) 삭제

2. **모바일 햄버거 lane 서브탭 펼침**
   - 활성 lane(AI/연결/도구) 아래에 서브탭 들여쓰기 렌더
   - `SUB_TABS` 매핑 + LaneSubNav 정의 재사용

3. **9영역 → traces 역방향 CTA**
   - `features/myverse/app/DomainBackLink.tsx` 신규 — `?domain=` 필터로 traces 복귀
   - body·work·study·daily(lifestyle)·schedule·travel·move·relation 8개 페이지 헤더에 적용
   - WorkView도 적용 (work는 컴포넌트 안에 헤더 있음)

4. **ask vs coach 차별화 카피**
   - ask: "내가 묻는 즉시 답하는 1:1 대화 — 흔적·일정·기록을 한 줄 질문으로"
   - coach: "묻지 않아도 먼저 보내는 일일 브리핑·주간 리포트"

5. **Myverse 브랜드 CLAUDE.md 갱신**
   - IA SSOT 섹션 신설 (LANES·LANE_PATHS·LaneSubNav·DomainBackLink)
   - 절대 하지 말 것 4항목 추가 (lane 무단 추가, LaneSubNav 누락, DomainBackLink 누락, 도구 드롭다운)
   - 현재 상태 세션 120으로 갱신

#### 처리 보류

- **/myverse/app/index 라우트 제거**: 11개 파일이 별칭 참조 — ClientRedirect 유지가 합리적
- **데스크톱 우측 영역 미렌더 (1406px)**: 환경 이슈, 실서버 재확인 필요
- **GTM `TenOne_Tag` 트리거 교체**: 사용자 직접 작업 (CLAUDE.md 부록 G.1)

---

## 세션 119 핵심 성과 (2026-05-09)

### Myverse IA 재구성 — 4-Pillar 혼란 → 5-Lane

#### ✅ 완료

1. **5-Lane SSOT 도입**
   - `lib/myverse/domains.ts`: `LANES`·`LANE_PATHS`·`laneForPath()` 추가
   - 5 동사 멘탈 모델: 오늘 / 기록 / AI / 연결 / 도구

2. **2차 네비 LaneSubNav**
   - `AI_LANE_TABS` (묻기·코치·일기·인사이트·캡슐)
   - `CONNECT_LANE_TABS` (피드·DM·Verse·알림)
   - 9개 lane 페이지에 임베드

3. **today 정규 홈 + index 별칭 redirect**
4. **traces ?domain·?person·?q·?period 딥링크 + Suspense wrap**
5. **TracesTimelineView "도메인 깊이 보기" 링크**

---

## 세션 118 핵심 성과 (2026-05-08)

### 캔버스 올가미 선택 + 리사이즈 실시간 반영 + 보안 점검

#### ✅ 완료

1. **PpCanvas — 올가미(lasso) 선택 도구**
   - `ToolMode`에 `{ mode: "lasso" }` 추가 (`types.ts`)
   - `PpCanvasToolbar.tsx`: Lasso 아이콘 버튼 추가
   - `PpCanvas.tsx`: `pointInPolygon()` (ray casting), lasso pointer 이벤트, SVG `<polyline>` 렌더

2. **PpCanvas — resize 실시간 시각 반영**
   - 기존: handle 위치만 업데이트, 요소 자체는 포인터업 후에야 반영
   - 수정: SVG DOM transform 직접 조작 (`translate/scale/translate`) → 드래그 중 실시간 반영

3. **PP 브랜딩 흔적 제거**
   - `CommunityView.tsx`: "다른 PP 사용자들에게" → "다른 Myverse 사용자들에게"
   - `app/globals.css`: 죽은 `pp-canvas` Excalidraw CSS 블록 삭제
   - `CanvasStudio.tsx`: `div.pp-canvas` 클래스 제거

4. **DailyView.tsx / ProjectNotesTab.tsx — 노트 확장 전체화면 + UI 통일**
   - `z-[9100]` 전체화면, 통일된 흰 헤더 + 컬러 타입 배지 pill
   - "그냥 닫기"→"취소", "저장 후 닫기"→"저장"

5. **보안 점검 3건 (CRITICAL) 수정**
   - `create-staff` API: 인증 완전 누락 → `verifySuperAdmin()` Bearer 토큰 + super_admin 검증 추가
   - `subscription/access` API: 타인 userId 조회 가능 → 세션 기반 자기 검증 + staff 예외 추가
   - XSS `dangerouslySetInnerHTML` 9개 파일: `isomorphic-dompurify` 설치 + `DOMPurify.sanitize()` 적용
     (stars/[slug], fwn/article/[slug], newsroom/[id], works/[id], PostDetail, PostAccordion, boards, trends/[id], groups/[id])
   - 보안 헤더: `next.config.ts`에 X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy 추가
   - Open Redirect: `/login`에 `safeRedirect()` 검증 함수 추가

#### 남은 이월 항목

##### 🔴 데이터 이전 (service role key 필요)
- `scripts/migrate-moments-bucket.js` 실행 — `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY=` 추가 후 `node scripts/migrate-moments-bucket.js`

##### 🟡 외부 작업 (사용자 직접)
- **Toss 가맹점 승인 + Vercel 환경변수** 설정

##### ⚪️ 보안 권고 (낮은 우선순위)
- Rate Limiting: 인증 API 분당 제한 (Upstash Redis 등)

---

## 세션 117 핵심 성과 (2026-05-08)

### Canvas Engine Phase 2 완료 + vCard 정리

#### ✅ 완료

1. **vCard PRODID** `Planners Contacts` → `Myverse Contacts` (ContactsView.tsx:259)
2. **Canvas Engine — Image element 지원**
   - `PpCanvas.tsx`: `ElementPath` image 렌더, move/resize/rotate/duplicate 핸들러, 파일 피커(`<input type="file">`), Ctrl+V 클립보드 붙여넣기
   - `PpCanvasToolbar.tsx`: `ImagePlus` 버튼 + `Download` 드롭다운(PNG/SVG) 추가
3. **Canvas Engine — PNG/SVG 내보내기**
   - `lib/canvas-engine/export.ts` 신규: `exportToSVGString`, `exportToPNG`, `downloadSVG`, `computeExportBounds`
   - `lib/canvas-engine/index.ts` 재export 추가
4. **Canvas Engine — 레이어 정렬 단축키**
   - `engine.ts`: `bringToFront`, `sendToBack`, `bringForward`, `sendBackward` 메서드
   - `PpCanvas.tsx`: `Ctrl+]` 앞으로/`Ctrl+[` 뒤로, `Ctrl+Shift+]` 맨 앞/`Ctrl+Shift+[` 맨 뒤
5. **Canvas Engine — 텍스트 서식 컨트롤**
   - `types.ts`: `TextElement` `bold?` / `italic?` 필드 추가
   - `PpCanvas.tsx`: 단일 텍스트 선택 시 서식 바(B·I·정렬·폰트크기), `Ctrl+B`·`Ctrl+I` 단축키
   - `export.ts`: SVG 내보내기 bold/italic 반영

#### 남은 이월 항목

##### 🔴 데이터 이전 (service role key 필요)
- `scripts/migrate-moments-bucket.js` 실행 — `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY=` 추가 후 `node scripts/migrate-moments-bucket.js`

##### 🟡 외부 작업 (사용자 직접)
- **Toss 가맹점 승인 + Vercel 환경변수** 설정

##### ⚪️ 유니버스 공용 (보류)
- `lib/analytics.ts` `trackPlannersEvent` — 전 브랜드 영향, 보류 권장

---

## 세션 116 핵심 성과 (2026-05-08)

### Phase 4 — 인프라·마커·변수·UI 마이그레이션

#### ✅ 완료된 항목 (이전 이월에서 처리)

1. **Storage 버킷 `myverse-moments` 생성** + RLS 4개 + 코드 참조 교체 (6파일)
   - `scripts/migrate-moments-bucket.js` — 실 데이터 4개 이전용 (SUPABASE_SERVICE_ROLE_KEY 필요)
2. **PWA 자산** — `myverse-sw.js` (v3 캐시), `myverse-manifest.json`, `myverse-icon-{192,512}.png`
   - `features/myverse/app/PwaRegister.tsx` 신규 (layout.tsx 기대 위치) — `planner/PwaRegister.tsx` 삭제
3. **HTML 마커 DB 마이그레이션 실행** — `planners:handwriting`(2) + `planners:tpl`(5) + `planners:canvas`(1)
   - `handnote-storage.ts`: HW_MARKER 신규 myverse:, LEGACY 읽기 양립
   - `ProjectNotesTab.tsx` (planner/ + app/): TPL_MARKER_RE 양립, 쓰기 myverse:
   - `canvases/route.ts`: 정규식·쿼리 (myverse|planners) 양립
   - `scripts/migrate-note-markers.js` 재실행용 스크립트 생성
4. **변수 리네임** — `plannerUser` → `myverseUser` (layout, personal, time, briefing.ts), `getPlannerUser` → `getMyverseUser`
5. **localStorage 키** — `myverse-mobile-nav-change` CustomEvent, `myverse-recent-colors`(레거시 자동 이전), `__myverseImportMergeMode`, `myverse-backup-*.json`
6. **도메인 하드코딩** — `planners.tenone.biz` → `myverse.kr` (google-calendar.ts, notifications.ts)
7. **링크** — `google/callback/route.ts` → `/myverse/app/settings`, `planner-search/route.ts` → `/myverse/app/*`
8. **"PP AI" UI copy** → "Myverse"/"Myverse AI" (AboutPage, Header, HomePage, PurchaseView, InstallButton x2)

#### 남은 이월 항목

##### 🔴 데이터 이전 (service role key 필요)
- `scripts/migrate-moments-bucket.js` 실행 — Supabase Storage 파일 4개 이전 (planners-moments → myverse-moments)
  - `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY=` 추가 후 실행

##### 🟡 잔존 정리
- **vCard PRODID** `Planners Contacts` (ContactsView.tsx:259) — 부가 정리
- **Toss 가맹점 승인 + Vercel 환경변수** 설정

##### ⚪️ 유니버스 공용 (보류)
- `lib/analytics.ts` `trackPlannersEvent` — 전 브랜드 영향, 보류 권장

##### ⚪️ Canvas Engine 이전 이월
- PpCanvas.tsx — Image element 지원 [🔴]
- PNG/SVG export — `lib/myverse/canvas-engine/export.ts` [🔴]
- 레이어 정렬 키보드 단축키 [🟡]
- 텍스트 서식 컨트롤 [🟡]

---

## 세션 115 핵심 성과 (2026-05-08)

### Phase 3 — Planner's → Myverse 리네임 (myverse 스코프)

**대상**: `features/myverse/`, `app/(Myverse)/`, `app/api/myverse/`, `lib/myverse/`

#### 1. JS 함수·타입 (Source of Truth)
- `lib/myverse/analytics.ts` — `trackPlanners` → `trackMyverse` (`trackPlannersEvent` 공용 import는 유지)
- `features/myverse/app/MyverseThemeProvider.tsx` — `applyPlanners*` → `applyMyverse*`, `Planners{Radius,ThemeMode}` → `Myverse{Radius,ThemeMode}`, `dataset.plannersMode` → `dataset.myverseMode`
- 호출자 동기화: `SettingsTheme.tsx`, `SettingsStylePresets.tsx`, `BetaFeedbackButton.tsx`, `CopyToAiButton.tsx`, `WelcomeTracker.tsx`, `WeeklyView.tsx`, `onboarding/page.tsx`

#### 2. CSS 변수·DOM ID·클래스
- `--planners-{accent,accent-dark,accent-nav,font,user-font,bg,bg-alt,surface,text,text-sub,border}` → `--myverse-*` (globals.css + 모든 consumers)
- `data-planners-font` → `data-myverse-font`
- DOM id `planners-{theme-override,nav-accent-style,user-font-style,radius-override}` → `myverse-*`
- 클래스 `.planners-app-shell` → `.myverse-app-shell` (globals.css + layout.tsx + ProjectNotesTab + DailyView)
- 호출자: MonthlyView, YearlyView, MobileBottomNav, SettingsLivePreview, DailyPlacesCard, DailyRoutinesCard

#### 3. URL·UI copy
- `/planners/purchase` / `/planners/app?welcome=1` → `/myverse/*` (payment success, coach, chat upgrade_url)
- "Planner's Planner AI" / "Planner's AI" / "Planner's Planner" → "Myverse" / "Myverse AI"
- AboutPage, MyverseHomePage, ProgramsPage, PurchaseView, CommunityView, CanvasToolPage, MyverseHeader, SettingsExport, briefing/notifications/slack lib, ai/chat·daily-summary·feedback·slack-sync API
- `MyverseHeader` — 로고 "Planner's" → "Myverse", `/planners` 링크 → `/myverse`, `siteId/siteName/brandName` 통일
- `admin/activate` — `brand:planners` → `brand:myverse`
- `feedback` API — 발신자/제목 Myverse AI, 인트라 인박스 URL `/intra/myverse/feedback`

### 다음 할 일 (이월 — 우선순위 순)

#### 🔴 DB·Storage·인프라 마이그레이션 필요
1. **Storage 버킷 `planners-moments` → `myverse-moments`**
   - 영향: `apple-photos`, `ingest/moments`, `moments/[id]`, `moments/upload`, `moments/import-meta`, `DailyMoments.tsx` 주석
   - 절차: 새 버킷 생성 → 객체 복사 → 코드 참조 일괄 교체 → 옛 버킷 정리
2. **PWA 자산 `/planners-sw.js`, `/planners-manifest.json` → `/myverse-*`**
   - 파일: `features/myverse/app/PwaRegister.tsx` (lines 14, 22)
   - 캐시된 SW 자가 업그레이드 패턴 필요 (세션 111 SW v2 방식 재활용)
3. **HTML 마커 마이그레이션 — DB 컨텐츠 본문**
   - `<!-- planners:handwriting -->`, `<!-- planners:tpl=... -->`, `planners:canvas=` (legacy)
   - 파일: `ProjectNotesTab.tsx`, `lib/myverse/canvas-engine/adapters/handnote-storage.ts`, `app/api/myverse/canvases/route.ts`
   - canvas 마커는 이미 `(myverse|planners)` 양립. 신규 작성은 myverse, DB 일괄 마이그 스크립트 필요

#### 🟡 변수·키 네이밍 (런타임 영향 없음)
4. **`plannerUser` → `myverseUser` 변수 리네임**
   - 파일: layout.tsx, personal/page.tsx, time/page.tsx, briefing.ts, chat/route.ts, apple-photos, ingest/moments, vision/route.ts
5. **localStorage 키 마이그레이션** (사용자 데이터 보존 정책 필요)
   - `planners-mobile-nav` (MobileBottomNav.tsx, settings/page.tsx event 2곳)
   - `planners-recent-colors` (HandNote.tsx)
   - 백업 파일명 `planners-backup-${dateStr}.json` (SettingsExport.tsx:72)
   - window 플래그 `__plannersImportMergeMode` (ContactsView.tsx 4곳)
   - CustomEvent `planners-mobile-nav-change`

#### 🟡 도메인·외부 노출
6. **하드코딩 `https://planners.tenone.biz` → `https://myverse.kr`**
   - `lib/myverse/google-calendar.ts:22` (baseUrl fallback)
   - `lib/myverse/notifications.ts:83-85` (이메일 본문 링크)
7. **vCard PRODID** `Planners Contacts` (ContactsView.tsx:259) — 표준 라벨 정리

#### 🟢 UI 잔여 — "PP AI" 약어
8. **"PP AI" 약어 일괄 정리** — 사용자 입장에서 정체불명. "Myverse AI"로 통일
   - HeroSection (PP AI Spotlight), CanvasToolPage, MobileBottomNav 등

#### ⚪️ 유니버스 공용 (스코프 외 — 별도 결정 필요)
9. `lib/analytics.ts` `trackPlannersEvent` — 유니버스 공용 GA4 wrapper. `trackUniverseEvent` 등으로 리네임 시 모든 브랜드 영향. 보류 권장.

#### ⚪️ Canvas Engine 본 작업 (이전 세션부터 이월)
10. PpCanvas.tsx — Image element 지원 [🔴]
11. PNG/SVG export — `lib/myverse/canvas-engine/export.ts` 생성 [🔴]
12. 레이어 정렬 키보드 단축키 [🟡]
13. 텍스트 서식 컨트롤 [🟡]

---

## 세션 114 (2026-05-07)

### 1. Myverse 9영역 SSOT 통합 (옵션 A 선택)
- `lib/myverse/domains.ts` — `DomainMeta`에 `app_href` 필드 추가 (사이드바·드롭다운 공통 href SSOT)
  - `daily` → `/myverse/app/lifestyle` (주의: /app/daily는 플래너 뷰)
- `features/myverse/MyverseSidebar.tsx` — 4 Pillars + 9영역 SSOT 기반 완전 재작성
  - `DOMAIN_ICON_MAP`, `PILLAR_ICON_MAP` 맵핑 추가
  - `LOCAL_GROUPS` (플래너/나누기/시스템) 섹션 유지
- `features/myverse/app/AppTopNav.tsx` — LayoutGrid 드롭다운 SSOT 연결
  - 하드코딩 9영역 → `DOMAINS`, `PILLARS` import 참조로 교체
- `app/(Myverse)/myverse/app/layout.tsx` — `MyverseSidebar` 복원 (layout에 삽입)

### 2. 로그인 리다이렉트 버그 수정 (3곳)
- `app/login/page.tsx` useEffect — `canIntraAccess ? '/intra'` 강제 이동 제거
- `app/login/page.tsx` handleSubmit — 동일 패턴 제거
- `lib/auth-context.tsx` `loginWithGoogle/loginWithKakao` — `/myverse/login` 등 브랜드 로그인 페이지도 auth page로 인식 (`endsWith('/login')`) → `?redirect=` 파라미터 정확히 보존

### 3. 온보딩 루프 수정
- `app/(Myverse)/myverse/app/layout.tsx` `getAuthState()` 개선
  - admin 클라이언트 단독 의존 → **세션 기반 anon 클라이언트 우선 조회** (RLS `auth.uid() = auth_id`)
  - anon 실패 시 admin 재시도 → email fallback 순
  - 조회 실패 시 `console.error` 로그 추가 (개발 서버 터미널에서 원인 즉시 확인)
- `lib/auth-context.tsx` — `isAuthPage` 판단에 `endsWith` 추가

### 4. 온보딩 첫 페이지 카피 수정
- `app/(Myverse)/myverse/app/onboarding/page.tsx` — "퍼스널 OS" 추가, "성장을 돕습니다" → "성공을 돕습니다"

### 다음 할 일
> 우선순위 순.

1. **온보딩 루프 원인 확인** — 개발 서버(`npm run dev`) 터미널에서 `[myverse/app/layout]` 에러 로그 확인
   - 에러 발생 시 `SUPABASE_SERVICE_ROLE_KEY` `.env.local` 설정 점검
   - 에러 없는데도 온보딩 간다면 `isPrivileged` 분기 로직 추가 점검

2. **Toss 가맹점 승인 + Vercel 환경 변수 설정**

3. **myverse_users 구독 만료 체크 로직 검증** — `subscription_status=active` + `subscription_expires_at` 있는 경우

3. **PWA 아이콘 인디고 M 로고 교체** ← 이미 완료됨 (세션 이전 commit 확인)
   - WORK_STATUS 업데이트: 완료 처리

4. **Toss 가맹점 승인 + Vercel 환경변수**
   - 가맹점 승인 신청 진행 (대표자 신분증·사업자등록증)
   - 승인 후 발급되는 client·secret 키를 Vercel 환경변수에 추가

---

## 세션 112 핵심 성과 (2026-05-06, 집)

### 1. Myverse 로그인 UI 브랜드 통일
- **문제**: `/myverse/app` 비인증 접근 시 tenone.biz `/login` 전체 페이지로 이동(검은 버튼, 핸들 탭 없음) → 마이버스 인디고 브랜딩과 불일치
- **조치**: `/myverse/login/page.tsx` 신규 생성 — 인증 시 `?redirect` 파라미터로 복귀, 미인증 시 `LoginModal` 팝업(indigo `#6366F1`), 모달 닫으면 `/myverse` 랜딩으로
- `app/(Myverse)/myverse/app/layout.tsx` — `no_session` 리다이렉트 `/login?redirect=/myverse/app` → `/myverse/login?redirect=/myverse/app`
- `app/(Myverse)/myverse/page.tsx` — 랜딩 CTA 인증 인식: 로그인 상태면 "앱으로 이동", 비로그인이면 "시작하기"(LoginModal signup) + "출시 소식 받기"

### 2. 인트라 사이트 열기/닫기 토글 수정
- **문제**: toggle이 아무 효과 없음 — 두 가지 버그 복합:
  1. `ums_sites` 테이블에 `is_open` 컬럼 없음 → DB 에러
  2. `ums_sites_super_admin` RLS 정책이 `members.account_type` 체크 → `member_roles.role` 기반인 lools에게 차단
- **조치**:
  - Supabase 마이그레이션: `ums_sites`에 `is_open BOOLEAN NOT NULL DEFAULT true` + `domains JSONB NOT NULL DEFAULT '[]'` 추가, `site_configs` VIEW 재생성
  - `app/api/sites/toggle/route.ts` 신규 — admin 클라이언트(RLS 우회)로 `ums_sites.is_open` 업데이트, `member_roles` 기반 권한 확인
  - `lib/supabase/site-configs.ts` — `toggleSiteOpen()` 직접 Supabase 호출 → `/api/sites/toggle` fetch로 변경

### 3. 인트라 도메인 관리 현실 반영
- **문제**: 사이트 상세의 "도메인" 섹션이 항상 빈 목록 (DB `domains` 컬럼이 `[]`)
- **조치**:
  - `lib/domain-registry.ts` — `getDomainsBySiteId(siteId)` 함수 추가 (registry SSOT 기반)
    - `www.*` 중복 제거, 내부 전용(`auth.tenone.biz`, `intra.tenone.biz`) 제외
    - `brandgravity` 오버라이드 (registry에서 siteId: 'tenone'으로 등록됨)
    - `tenone` 하드코딩 (`tenone.biz` — registry 미등록)
    - `.tenone.biz` → '서브', 나머지 → '독립' 자동 분류
  - `app/intra/ums/sites/list/page.tsx` — `dbToEntry`·`staticToEntry` 모두 `getDomainsBySiteId()` 호출로 교체

### 다음 할 일 (사무실에서)
> 우선순위 순. 각 항목은 현재 코드에서 바로 시작 가능하도록 구체적으로.

1. **features/planners → features/myverse/app 폴더 완전 리네이밍**
   - 현재 settings/* 일부만 이동된 상태 (세션 110)
   - `features/planners/` 트리 통째로 `features/myverse/app/`로 이동
   - 영향 받는 import: 78개 컴포넌트 (`@/features/planners/*` → `@/features/myverse/app/*`)
   - 전역 sed 후 `npx tsc --noEmit` + `npm run build`로 검증
   - 충돌 가능: `features/myverse/app/` 안에 이미 일부 파일 있음 — diff 확인하며 머지

2. **PWA 아이콘 인디고 M 로고 교체**
   - 현재 `public/planners-icon-192.png` / `512.png` 그대로 (옛 PP 로고)
   - Myverse 인디고 M 마크 디자인 → 192/512 PNG 생성 → 기존 파일 교체

3. **Toss 가맹점 승인 + Vercel 환경변수**
   - 가맹점 승인 신청 진행 (대표자 신분증·사업자등록증)
   - 승인 후 발급되는 client·secret 키를 Vercel `TOSS_CLIENT_KEY`·`TOSS_SECRET_KEY` 추가

4. **/myverse/app/onboarding 화면 점검 (URL 이전 후 첫 작동 확인)**
   - 새 URL로 진입 시 PlannersChrome이 헤더/푸터를 안 띄우는지 (정상)
   - 완료 후 /myverse/app/today 진입이 매끄러운지

---

## 세션 111 핵심 성과 (2026-05-06, 집)

### 무한 깜빡임 (Myverse 앱 로그인) 종결
**진짜 원인**: DB의 myverse_* 테이블 FK 제약 이름이 옛 `planners_*_member_id_fkey`를 그대로 보존 → Supabase REST의 hint resolver가 `myverse_users_member_id_fkey`를 못 찾아 join 실패 → `plannerUser=null` → 온보딩 미완료로 오판 → /onboarding ↔ /myverse/app 무한 ping-pong

**조치 (이번 세션 4 commits, 모두 master 푸시 완료)**:
- 85536fdf — 누락된 MyVerse 페이지 24개 + lib/canvas-engine 추적 추가 (이전 세션 잔여)
- 0280afec — server `redirect()` 3건 → `<ClientRedirect>` 변환 (today/page.tsx, time/page.tsx, page.tsx)
- b47c5d98 — SW v2: 옛 /planners/* 캐시 강제 삭제 + prefetch 응답 캐싱 차단 (`public/planners-sw.js`)
- fde0ab3a — middleware /planners 매칭에서 정적 자산(/planners-sw.js, /planners-icon-*.png) 제외 → 옛 PWA 사용자 SW 자가 업그레이드 가능
- **22aa83f7 — 핵심 수정**:
  1. **DB**: stale FK 125개 일괄 RENAME (`planners_*` → `myverse_*`, 모든 myverse_* 테이블 검사 후)
  2. middleware: x-pathname 헤더 주입 → layout이 현재 경로 식별 가능
  3. /myverse/onboarding/page.tsx → /myverse/app/onboarding/page.tsx 이전 (앱 셸 하위로)
  4. layout: x-pathname=/myverse/app/onboarding 이면 인증 게이트 우회 (children만 렌더)
  5. layout: members 조회 우선순위 auth_id → email(중복 row 시 가장 최근)
  6. PlannersChrome / QuickCapture: 옛 /myverse/onboarding 경로 정리
  7. 온보딩 완료 후 → /myverse/app/today 직접 이동 (불필요 redirect 1회 제거)
  8. ClientRedirect 컴포넌트 도입 (server redirect()로 인한 Next.js 16 dev router prefetch 무한 큐 회피)

**남은 잔재**:
- features/planners → features/myverse/app 폴더 리네이밍 (78개 컴포넌트 import 갱신 동반)
- Toss 가맹점 승인 + Vercel 환경변수 설정
- ssoflicker: myverse.kr/login 진입 시 SSO chain으로 tenone.biz/login 까지 1~2회 화면 점프(loop는 아님). 현재 표준 패턴(전 외부 도메인 동일)이라 보류 — 추후 myverse.kr 자체 로그인 강화 검토

### 다음 할 일 (사무실에서)
> 우선순위 순. 각 항목은 현재 코드에서 바로 시작 가능하도록 구체적으로.

1. **features/planners → features/myverse/app 폴더 완전 리네이밍**
   - 현재 settings/* 일부만 이동된 상태 (세션 110)
   - `features/planners/` 트리 통째로 `features/myverse/app/`로 이동
   - 영향 받는 import: 78개 컴포넌트 (`@/features/planners/*` → `@/features/myverse/app/*`)
   - 전역 sed 후 `npx tsc --noEmit` + `npm run build`로 검증
   - 충돌 가능: `features/myverse/app/` 안에 이미 일부 파일 있음 — diff 확인하며 머지

2. **PWA 아이콘 인디고 M 로고 교체**
   - 현재 `public/planners-icon-192.png` / `512.png` 그대로 (옛 PP 로고)
   - `public/planners-manifest.json`은 인디고 #6366F1로 리브랜딩 됐지만 아이콘은 그대로
   - Myverse 인디고 M 마크 디자인 → 192/512 PNG 생성 → 기존 파일 교체
   - SW v2가 이미 캐시 강제 삭제하므로 사용자 다음 방문 시 자동 갱신

3. **Toss 가맹점 승인 + Vercel 환경변수**
   - 가맹점 승인 신청 진행 (대표자 신분증·사업자등록증)
   - 승인 후 발급되는 client·secret 키를 Vercel `TOSS_CLIENT_KEY`·`TOSS_SECRET_KEY` 추가
   - 현재 결제 라우트는 `/api/myverse/payments/*`에 코드는 있지만 실 결제 미연동

4. **/myverse/app/onboarding 화면 점검 (URL 이전 후 첫 작동 확인)**
   - 새 URL로 진입 시 PlannersChrome이 헤더/푸터를 안 띄우는지 (정상)
   - 완료 후 /myverse/app/today 진입이 매끄러운지
   - 모바일 viewport에서 4 step (welcome→mode→role→ai→identity_lite) UI 깨짐 없는지

5. **SSO 점프 UX 개선 검토 (낮은 우선순위)**
   - myverse.kr/login 첫 진입 시 SSO 자동 발사로 tenone.biz/login 으로 점프하는 UX
   - 옵션 A: myverse.kr 자체에 풀 로그인 폼 (현재 sso_attempted 우회 후 보이는 화면)을 우선 노출, "tenone 계정으로 로그인" 버튼만 SSO 트리거
   - 옵션 B: 그대로 유지 (전 외부 도메인 일관성)

---

## 세션 107 핵심 성과 (2026-05-04)

### 의사결정
- **PP → 마이버스 단일화**: PP가 마이버스 비전(개인 일상 관리·기록·성장)으로 수렴 중. 옵션 A 채택. 9 영역 SSOT(BODY·업무·공부·일상·일정·여행·이동·관계·_people) + 5 채집 행동 + 5축 메타데이터 SSOT 확립

### DB
- 테이블 29개 + 함수 13개 `planners_*` → `myverse_*` RENAME (인덱스·FK·RLS·트리거 자동 추적, 함수 본문 늦은 바인딩 재작성)
- `sql/myverse-rename-planners-to-myverse.sql` 적용 완료, 잔여 `planners_*` 객체 0건
- 코드 178개 파일 일괄 sed
- `members.affiliations[]`에 `'myverse'` 자동 등록 (온보딩 API + 백필 1명)

### 라우트 + 미들웨어
- `/myverse/app/*` 14개 PP 시간뷰·도구 라우트 미러링 (today·weekly·monthly·yearly·daily·tasks·index·settings·search·time·canvas·contacts·templates·personal·projects·ai-briefing·help·canvas/[id])
- `/myverse/{about,canvas,community,gpr,install,my,offline,onboarding,p,planner-tool,planning,portfolio,programs,purchase}` 14개 비-app 페이지 미러링
- 미들웨어 0a: `/api/planners/*` → `/api/myverse/*` 내부 rewrite (Toss·Google OAuth·Cron 호환)
- 미들웨어 0b: `/planners/*` → `/myverse/*` 308 영구 리디렉트
- `lib/domain-registry.ts`: planners.tenone.biz 프리픽스 `/planners` → `/myverse`
- 충돌 해소: `/myverse/app/daily`(PP 일간 뷰) vs 9-domain 일상 → 9-domain은 `/lifestyle`로 분리

### API + lib 디렉토리 병합
- `app/api/planners/*` 71개 라우트 → `app/api/myverse/*` (충돌 search → `planner-search`)
- `lib/planners/*` 21개 모듈 → `lib/myverse/*`
- 53개 클라이언트 fetch URL 갱신, 모든 `@/lib/planners` → `@/lib/myverse`
- features/planners 67개 파일 `/planners/...` → `/myverse/...`

### 풀 화면 앱 셸 + 인디고 브랜딩
- `/myverse/app/*` 진입 시 마케팅 헤더/푸터 숨김 (`MyVerseChrome` 클라이언트 래퍼)
- `MyverseAppHeader`·4 Pillars `MyverseSidebar` 제거 → AppTopNav만 노출 (PP 시절 풀 화면 셸 패턴)
- `app/(Myverse)/myverse/app/layout.tsx`: PP 핵심 chrome 흡수 (PlannersThemeProvider · PwaRegister · BetaFeedbackButton · KeyboardShortcuts · AiBriefingFab · MobileBottomNav · WelcomeTracker · AppMonthBar)
- AppTopNav 로고: "Planner's Planner AI" → **Myverse**<sup>App</sup>, teal `#0F766E` → 인디고 `#6366F1`
- PlannersThemeProvider 기본 테마 `teal` → `myverse`(인디고). 모든 하드코딩 teal 클래스가 CSS 오버라이드로 인디고로 매핑
- `UniverseUtilityBar.WORKSPACE_REGISTRY`: 옛 `planners` + 옛 `myverse` 제거 → 통합 `myverse` (`/myverse/app`)
- `public/planners-manifest.json` 리브랜딩 (Myverse · /myverse · #6366F1)

### HandNote (기본 노트) UX 개선
- "그리기" 버튼 제거 — 펜 선택 시 즉시 그리기 모드 진입, 같은 펜 다시 클릭 시 해제
- 이미지 선택·매직 선택(올가미)·지우개 클릭 시 자동 그리기 레이어 활성화
- 시각 상태 3단계: teal 활성 / 회색 활성(펜 선택만) / 비활성

### 다음 할 일
- features/planners → features/myverse/app 폴더 리네이밍 (78개 컴포넌트 import 갱신 동반 — 세션 110에서 부분 완료, settings/* 계열만 이동됨)
- PWA 아이콘 인디고 M 로고로 교체 (현재 `planners-icon-192.png` 그대로)
- Toss 가맹점 승인 + Vercel 환경변수 설정
- ✅ Notion `TASK` 템플릿 인사이트 흡수 완료 (세션 108)
- ✅ 풀 화면 모드 4 Pillars + 9-domain 진입점 완료 (세션 109)
    - 데스크톱: AppTopNav 우측 `LayoutGrid` 버튼 → 3컬럼 드롭다운 (나/일/시간)
    - 모바일: 햄버거 메뉴 내 "9 영역" 섹션 (나→일→시간 순, 아이콘+컬러)

---

## 세션 110 핵심 성과 (2026-05-05)

### Daily Planner UI 7가지 개선 (features/myverse/app/)
- **"일간" → "오늘"** — AppTopNav.tsx TABS 배열 label 변경
- **"기록하기" 삭제** — DailyView Quick Action Row 1에서 중복 버튼 제거
- **템플릿·캔버스·녹음 위로 올리기** — DailyView 노트 섹션에서 Quick Action Row 2로 이동 (기본 노트·템플릿·캔버스·녹음 + 조건부 단축키)
- **감사 3가지·감정 일기 → 사용자 선택 사항** — `daily_note_shortcuts` 설정 추가 (SettingsAi.tsx 체크박스 · settings/page.tsx state + API 로드 + 프롭 전달 · DailyView 조건부 렌더)
- **"일간 트래킹" → "일간 기록"** — SettingsAi.tsx 섹션 헤더 리네이밍
- **버튼 디자인 타입 일관성** — Quick Actions 전체 `rounded-xl px-3 py-2 bg-white border border-neutral-200 shadow-sm` 통일
- **설정 좌측 사이드바 → 서브 메뉴 위치로** — SettingsLayout.tsx: PC 200px sticky aside 제거 · pill nav `lg:hidden` 제거(전 breakpoint 노출) · grid `xl:grid-cols-[1fr_380px]` 2컬럼으로 슬림화

---

## 세션 109 핵심 성과 (2026-05-05)

### 9-domain 진입점 완성 — AppTopNav 데스크톱 + 모바일 양면
- **데스크톱** (`features/myverse/app/AppTopNav.tsx`): 우측 유틸리티 영역에 `LayoutGrid` 버튼 → 3컬럼 드롭다운
  - 나(BODY·일상·관계) / 일(업무·공부) / 시간(일정·이동·여행) 컬럼
  - 아이콘 컬러, active 상태 감지, 라우트 이동 시 자동 닫힘, 외부 클릭 닫힘
- **모바일** 햄버거 메뉴 내 "9 영역" 섹션 추가 (탭 nav 아래, 구분선 위)
  - 나→일→시간 순, 각 도메인 아이콘+라벨, active 하이라이트

---

## 세션 108 핵심 성과 (2026-05-05)

### Notion TASK 인사이트 흡수 — DailyView Quick Action Bar 개편
- **Quick Action Bar 2열 구조로 재편** (`features/myverse/app/DailyView.tsx`)
  - 1열: 할 일 / 기록하기 / **초집중 시작** (gradient primary CTA, font-semibold, active:scale-95 — 1급 기능으로 격상)
  - 2열: 🙏 감사 3가지 (amber) + 💭 감정 일기 (rose) — 상단에서 즉시 접근 가능
  - 컨테이너: `mb-5 mt-1 space-y-2` (여백 + 수직 스택)
- **중복 제거**: 노트 추가 섹션의 감사3가지·감정일기 버튼 삭제 (Quick Action Bar로 통합)

---

## 세션 106 핵심 성과 (2026-05-04)

### Phase 1 — 활동 거점 좌표화 + 시간 트래킹 자동 위치 매칭
- **SettingsBases**: Crosshair 버튼으로 현재 위치를 거점에 등록 (navigator.geolocation + Nominatim 역지오코딩으로 주소도 자동 채움). 주소 입력 blur 시 좌표 없으면 자동 정지오코딩. 좌표 등록 시 행 아래 lat/lng 표시
- **TimeTrackerView**: 마운트 시 `/api/planners/settings`에서 activity_bases 로드. 자동 위치 입력 시 Haversine 거리 계산으로 거점 반경 150m 내 매칭 → 거점 이름이 활동 라벨로(예: "사무실"). 매칭 실패 시 기존 Nominatim 폴백
- **InlineForm 거점 칩**: 등록된 거점을 클릭 한 번으로 활동·주소 채움

### Phase 2 — 일간 places ↔ 시간 routines 양방향 미러링
- POST `/places` → `planners_daily_routines`에 dedup 후 자동 INSERT (date+activity+start_time 키). duration_min → end_time 계산
- POST `/routines` → `planners_daily_places`에 dedup 후 자동 INSERT (date+place_name+visited_at 키). end-start → duration_min 계산
- 카테고리 매핑 함수 (`mapToPlacesCategory`/`mapToRoutinesCategory`) — 매칭 안되면 general
- UPDATE/PATCH는 미러링 안 함 (편집은 한쪽만 — 의도된 분리)

### Phase 3 — Instagram / Facebook 백업 ZIP 임포트
- `POST /api/planners/moments/import-meta` — JSZip으로 ZIP 그대로 파싱 (압축 해제 불필요)
- Instagram `posts_1.json` / `stories.json` + Facebook `your_posts_*.json` 자동 인식
- Mojibake(latin1→UTF-8) 한국어 캡션 자동 복원
- 미디어를 `planners-moments` 버킷에 업로드 → `planners_daily_moments` INSERT (촬영 일자·캡션·happened_at)
- dedup: (member_id, date, file_size, happened_at) 기준 — 재임포트 안전
- 200MB / 5분 타임아웃 / 응답에 imported·skipped·total·errors[]
- DailyMoments 헤더에 "백업" 버튼 추가 (Archive 아이콘) + 결과 토스트

### 다음 할 일
- TimeTracker 컨텍스트 스트립 placeName도 거점 매칭 우선 (현재는 Nominatim 결과만)
- DailyMoments 위치 필드 보강 (Meta 백업 EXIF 위치 추출)
- Daily places 추가 UI에 거점 칩 빠른 선택

---

## 세션 105 핵심 성과 (2026-05-03 — 이전)

---

## 세션 105 핵심 성과 (2026-05-03)

### Canvas Engine 신설 (`lib/planners/canvas-engine/`) — Phase 1 골격

HandNote와 CanvasStudio를 통합할 자체 캔버스 엔진의 뼈대 구축. tldraw·Excalidraw 의존성 점진 제거 목표.

**모듈 구성**
- `types.ts` — CanvasDocument · CanvasElement union(stroke/rect/ellipse/diamond/arrow/line/text/image) · ToolMode · PenKind 6종 · Viewport · BackgroundTemplate
- `engine.ts` — CanvasEngine 클래스: CRUD · 선택 · 도구 · 뷰포트 · 이벤트 · undo/redo 위임
- `history.ts` — HistoryStack (최대 50단계, structuredClone 스냅샷)
- `render.ts` — Canvas 2D 라이브 stroke 렌더(RAF용) + makeLiveContext 헬퍼
- `layers/strokes.ts` — perfect-freehand 래퍼 + 6종 펜 프로파일(pen/pencil/fountain/marker/highlighter/brush)
- `layers/background.ts` — blank/dots/grid/lines 템플릿 CSS 스타일
- `interaction/palm-rejection.ts` — 스타일러스 활성 시 손바닥 입력 무시
- `interaction/pan-zoom.ts` — 1손가락 pan + 2손가락 pinch + 마우스 휠 zoom
- `serialize.ts` — JSON 직렬화 + 버전 마이그레이션 골격
- `adapters/handnote.ts` — HandNoteData ↔ CanvasDocument 양방향 어댑터
- `adapters/handnote-storage.ts` — `__HW__` 마커 직렬화 헬퍼 6종 (HandNote에서 추출)

**계획서**: `docs/PP_Canvas_Engine_Plan.md` — 6단계 ~10주 로드맵 (Core → Shapes → Selection → Text → Polish → Migration)

### Canvas Toolbar 고도화 (`features/planners/CanvasToolbar.tsx`)

- **색상**: 인라인 7색 + "+" 버튼으로 팝오버 (24색 4×6 그리드 / 최근 사용 8개 / HEX 입력 / 네이티브 색상 픽커)
- **굵기**: 펜·도형 모드에서 노출, 4 프리셋(가는·기본·굵은·매우굵은) + 0.5–32px 슬라이더
- **이미지 삽입**: Excalidraw image tool 트리거 (캔버스 클릭 시 파일 선택)
- **레이어 순서**: 선택 시 4단계(맨앞/앞/뒤/맨뒤) 노출. updateScene으로 elements 직접 재정렬
- **모바일 반응형**: md 미만에서 도형/텍스트/이미지/레이어/undo/redo 모두 "더보기" 메뉴로 흡수, 인라인은 핵심 7개만
- **선택 시 크기/회전**: Excalidraw 네이티브 핸들이 캔버스 위에 표시 (별도 작업 불필요)

### Canvas Studio (`features/planners/CanvasStudio.tsx`)

- 풀스크린 z-index 50 → 9100 (planner 모바일 nav z-8900 위로)
- 저장 상태: 텍스트 "오전 09:45 저장됨" 제거, 회전 Loader/체크 아이콘만 (시각·텍스트는 hover 툴팁)
- selectedElementIds count 추적 → CanvasToolbar에 prop 전달
- globals.css: Excalidraw 모바일 사이드 UI(라이브러리·자물쇠·손)·협업 아바타 추가 숨김 + Next.js dev portal(N) 숨김

### Planners 신규 기능 3종

- **이력서 섹션** (IdentityView): 학력·경력·자격증·기술·언어·수상 6 블록 + sticky 서브 네비. `planners_identities.resume` JSONB 컬럼 추가
- **활동 거점** (Settings): SettingsBases 컴포넌트 — 사무실·집·학습·운동·카페·기타 6 type, 빠른 추가·기본 거점 별표. `planners_users.activity_bases` JSONB 컬럼 추가
- **노트 페이지 삭제 확인** (DailyView): 코넬 노트 "페이지 삭제" 버튼 즉시 삭제 → ConfirmSheet 추가 ("N 중 i페이지" 표시)

### 다음 할 것

- **Phase 1.9 HandNote 본체 재작성** (다음 세션 메인) — CanvasEngine 기반 전면 교체. 데이터 레이어는 어댑터로 이미 분리됨
- Canvas Engine Phase 2 (도형 layer 추출)
- 배포 블로커 5종 그대로

---

## 세션 104 핵심 성과 (2026-04-30)

### Planners — HandNote & DailyView Cornell 고도화

**HandNote.tsx 주요 변경**

1. **viewBox 스케일 수정** — 스트로크가 저장된 캔버스 폭(`value.width`)을 캐노니컬로 유지, 화면이 좁아져도 오른쪽이 잘리지 않고 비례 축소됨. `getSVGPoint()` 유틸로 화면→SVG 논리 좌표 자동 변환.

2. **이미지 삽입** — 툴바 `ImagePlus` 버튼(파일 선택) + `Ctrl+V` 클립보드 붙이기 두 가지 경로. 삽입 즉시 선택 모드 진입, 캔버스 중앙 배치, 하단 자동 확장.

3. **이미지 선택·이동 모드** — `MousePointer2` 툴바 버튼으로 전환. z-order 역순 hit-test, 드래그 이동, 우상단 ✕ 버튼 또는 `Delete/Backspace`로 삭제.

4. **자리 차지** — 이미지 뒤 흰 `<rect>` 삽입 → 코넬 텍스트·배경 가림. 스트로크는 이미지 위 레이어. 다크모드 대응(`#1e1e2e`).

5. **`HandImage` 타입** 추가, `HandNoteData.images?: HandImage[]` 확장 (기존 데이터 하위 호환).

6. **width 캐노니컬 보존** — undo/redo/erase/onPointerUp 모두 `value?.width || width || 600` 우선 유지.

**DailyView.tsx 주요 변경**

- **Cornell Enter → 자동 커서 이동** — `cornellFocusPendingId` ref + textarea 콜백 ref 패턴, Enter 치면 새 행 삽입 + 해당 note textarea에 즉시 포커스.
- **요약·페이지 컨트롤 배경 통일** — `bg-neutral-50/40` 제거 → 본문과 동일 투명 배경.
- **Cornell SVG pointer-events 개선** — 텍스트 모드: SVG `none` → 클릭이 textarea에 직접 전달(커서 위치·텍스트 선택 정상 동작). 그리기 모드: SVG `all`.

**MonthlyView.tsx** — 기존 소규모 수정 포함.

### 다음 할 것

- HandNote 이미지 크기 조절 핸들 (resize handles — Phase 2)
- 이미지 "자리 차지" → Cornell row 높이 자동 확장 연동 (Phase 2)
- ~~Settings 다크모드 검증~~ ✅ bg-neutral-200/300/400 dark override 적용 완료 (세션 105)
- 배포 블로커 해소: PWA 아이콘 2개 · Toss 가맹점 · Vercel 환경변수 · Google OAuth · Supabase Redirect URL

---

## 세션 103 핵심 성과 (2026-04-30)

### Planners — Settings page.tsx 모듈 분리 완성

`app/(Planners)/planners/app/settings/page.tsx` 1,799줄 → 367줄 슬림 쉘로 리팩토링.

**5개 feature 모듈 생성** (`features/planners/settings/`)
- `SettingsTheme.tsx` — 컬러·모서리·폰트·다크모드 (Group 02)
- `SettingsAi.tsx` — AI 브리핑 시간·톤·컨텍스트·트래킹·국가·프로젝트 링크 (Group 03)
- `SettingsNotifications.tsx` — 이메일/Web Push 알림 (Group 04 알림)
- `SettingsIntegrations.tsx` — Google Calendar·Todoist 연동 (Group 04 연동)
- `SettingsExport.tsx` — 앱 설치·데이터 백업·구독 현황 (Group 05)

**슬림 쉘 패턴**
- shell이 API fetch + initial* 상태 세팅 → loading guard → 자식 컴포넌트 마운트
- 각 모듈이 자체 도메인 state 소유, `save(patch)` 공유 콜백
- TypeScript 에러 0 확인

### 다음 할 것
- Settings 외 페이지 다크모드 검증 (Daily/Weekly/Monthly 카드 색상 전환)
- xl+ 모니터에서 Live Preview 실제 동작 확인 (1280px 이상)
- 배포 블로커 해소: PWA 아이콘 2개 · Toss 가맹점 · Vercel 환경변수 · Google OAuth · Supabase Redirect URL

---

## 세션 102 핵심 성과 (2026-04-29)

### Planners — Settings 페이지 디자인 시스템 4단계 (Stage 1+2+3+4)

Claude Design 핸드오프 (`design_handoff_planners_settings/`) 기반 Settings 페이지 재구축.

**Stage 1+2 — IA 재편 + 모바일 프리셋** (`5b4f7581`)
- 4그룹 IA: **시작 / 스타일 / 기능 / 기술**
- PC: 좌측 200px sticky 사이드바 (IntersectionObserver로 활성 자동 갱신)
- 모바일: 상단 sticky 가로 pill row
- 8개 프리셋 (5개 토큰 한 번 탭 적용): Mono Light · Cream Serif · Editorial · Slate Pro · Black Ink · Campus Mint · Campus Blush · Designer Mono
- 모바일은 프리셋 메인, 개별 컨트롤은 "고급 설정 ▼" 토글
- 컬러 14 → 18색 (Mustard · Orange · Emerald · Olive 추가)

**Stage 3 — 디자인 토큰 시스템** (`d06c7eb5`)
- `.pp-settings` 스코프 토큰 11종 (라이트+다크 양쪽)
- 기존 Tailwind 유틸리티 → 토큰 시멘틱 자동 매핑
- `pp-card` · `pp-eyebrow` alias 유틸

**Stage 4 — Live Preview 패널** (`36285661`)
- xl+(1280px) 우측 sticky 400px 패널
- Daily · Project · AI Briefing 3탭
- 컬러·모서리·폰트·다크모드 즉시 반영 (CSS 변수)

### 신규 파일 (3개)
- `features/planners/SettingsLayout.tsx` — 4그룹 IA + sticky nav + 3컬럼 grid xl+
- `features/planners/SettingsStylePresets.tsx` — 8개 프리셋 갤러리
- `features/planners/SettingsLivePreview.tsx` — Daily/Project/AI 라이브 프리뷰

### 부수 작업 (이번 세션 다른 커밋들)
- `de3aa289` HandNote Canvas+RAF 재작성 — 필기 입력 끊김 해소
- `e2c03b05` 인덱스 PC/태블릿 2열 레이아웃 + AI 브리핑 탭 제거
- `865c9713` AI 브리핑 네비 전체 제거 (FAB만 유지)
- `c6c3a3b9` 상단 탭 템플릿 추가 (아이덴티티 다음)
- `0a7ed6bb` DailyView 우측 컬럼 단일 셀 래핑 (미니달력 위치 정렬)
- 햄버거 메뉴 헤더 PP AI → Planner's Planner^AI (UniverseMobileMenu.brandNode SSOT)
- 하단 메뉴 기본 순서: 인덱스·프로젝트·오늘·PI·검색
- 화면 모드(다크) 작동 — planners-app-shell + bg/border/text 일괄 반전

### 다음 할 것
- xl+ 모니터에서 Live Preview 실제 동작 확인 (요구 폭 1280px 이상)
- Settings 외 페이지 다크모드 검증 (Daily/Weekly/Monthly 카드 색상 전환 확인)
- 모바일 Live Preview FAB + bottom sheet (선택)
- 토큰을 Daily/Weekly/Monthly로 확장 — `.pp-settings` 패턴을 다른 뷰로 (선택)

---

## 세션 101 핵심 성과 (2026-04-29)

### Planners — Role System Phase 4 (전문 뷰)

**TemplatesView — my_role 탭 완성**
- `my_role` 탭 버튼: teal 색상 + `UserCircle2` 아이콘 (isFav/isRec와 동일한 특수 처리 패턴)
- Empty state 3-케이스: (1) 역할 미설정 → 설정 페이지 링크 버튼 (2) 역할 있지만 템플릿 없음 → "준비 중" (3) 기본
- 탭 활성 시 teal 헤더 배너 (역할명 + 설명 + 개수)

**IndexView — 역할 기반 템플릿 추천**
- settings + templates 병렬 fetch → role_tags 필터링 → 상위 5개 번호 목록 표시
- 역할 있을 때: teal 배지 + "내 역할 전체 보기 →" 링크
- 역할 없을 때: 기존 카테고리 링크 (프레임워크/일정/노트) 유지

**WeeklyView — 대학생 시간표**
- role=student 시 주간 회고 위에 `<StudentTimetable />` 렌더
- `features/planners/StudentTimetable.tsx` 신규: 월~금 × 8교시 그리드, 셀 클릭 → 팝오버 편집, 6색 선택, localStorage 저장

**DailyView — 연구원 연구노트**
- role=researcher 시 노트 추가 그리드에 "연구노트" 5번째 버튼 노출
- 클릭 시 6행 코넬 노트 자동 생성: 연구질문·가설·방법·관찰·해석·다음스텝 사전 입력

**SQL 적용**
- `planners-role-system.sql` Supabase 실행 완료 (HTTP 201)
  - `planners_users.user_role TEXT CHECK(...)` 컬럼 추가
  - `planners_templates.role_tags TEXT[]` 컬럼 + 키워드 시드

### 다음 할 것
- `@excalidraw/excalidraw` 패키지 `package.json`에서 제거 (불필요 — tldraw 전환 후)
- 배포 후 기존 캔버스 "데이터 없음" 안내 또는 일괄 삭제 여부 결정

---

## 세션 100 핵심 성과 (2026-04-29)

### Planners — CanvasEditor Excalidraw → tldraw 마이그레이션
- Excalidraw v0.18 상용 라이선스 워터마크 문제 → tldraw v4.5.10 (MIT) 전환
- `CanvasEditor.tsx` 전체 재작성: `<Tldraw onMount>` + `editor.store.listen` + `getSnapshot/loadSnapshot`
- 썸네일: `editor.getSvgString()` + `getSvgAsImage()` → JPEG base64 → DB PATCH
- 기존 Excalidraw DB 데이터는 형식 불일치 → try/catch로 빈 캔버스 폴백

---

## 세션 98 핵심 성과 (2026-04-29)

### Planners — Daily ↔ Project 노트 일관성 통일
- 추가 노트 4종(기본·손글씨·캔버스·템플릿) 동작·구성·디자인 양쪽 통일
- 카드 = 미리보기(max-h-64 페이드), 편집 = 모달 (Daily 패턴)
- 자동 제목(`기본 노트 1`·`손글씨 1` 등) → 이탤릭·연한 회색 + "기본 제목입니다…" 부제 안내
- 모달에서 텍스트로/손글씨로 토글 제거 (생성 시 모드 고정 — Daily와 동일)
- Project 진입 시 "기본 노트 1" 자동 생성, ↑↓ 카드 위치 이동, X 닫기 제거, 삭제 confirm 통일

### Planners — 프로젝트 캔버스 노트 버그
- 프로젝트 [캔버스] 클릭 → 캔버스 페이지로 튕기던 동작 수정 → 노트 카드로 인라인 등록
- 마커: `<!-- planners:canvas={id} -->` (DB 마이그 없이 content 컬럼에 임베드)
- 카드 = 캔버스 진입 링크, 모달 = iframe 임베드

### Planners — 템플릿 모달에 "📈 추천" 탭 추가
- `lib/planners/template-recommendations.ts` → `TOP_RECOMMENDED` SSOT (라이브러리 추천과 동일 키)
- 일간/프로젝트 양쪽 템플릿 추가 모달에 추천 탭 노출

### Planners — AI 브리핑 카드 정리
- 우측 상단 "설정" 버튼 제거 (헤더 단순화)

### 세션 97 잔여 (이전 컨텍스트, 미커밋)
- `lib/planners/calendar-rules.ts` — `isVisible()` 미지 kind guard 추가 (`if (!rule) return false`)
- `monthlyDisplayMode()` optional chaining (`VISIBILITY[kind]?.monthly ?? "none"`)
- 원인: DB에 알 수 없는 `kind` 값이 있을 때 `VISIBILITY[kind].monthly`에서 `TypeError` 발생
- `DailyMiniMonth.tsx` useMemo 크래시 → 앱 전체 화이트스크린 차단

### 미완 업무 선택적 불러오기 모달 (`5aa42856`)
- `app/api/planners/daily/pending-tasks/route.ts` — 신규 API (과거 60일 미완료 태스크 날짜별 그룹)
- `DailyView.tsx` — 일괄 이월 버튼 → **선택 모달** 전환
  · 날짜별 섹션 + 체크박스 + 전체선택/해제
  · "오늘로 가져오기" → 선택 항목만 today tasks에 추가 + 원본 status='carried'
  · 이미 오늘에 있는 텍스트 중복 제외 (API 레벨)

### Weekly 뷰 재설계 (`21f00be7`)
- GPR(Goal/Plan/Result) · Vrief(What/Why/How) 섹션 완전 제거
- 새 레이아웃: 7일을 **세로 목록**으로 배치 (`divide-y` 경계선)
  · 좌측 32%: 날짜 헤더(요일·Today 배지) + 날씨 이모지·기온 + 음력 + 국경일/절기/기념일 칩 + 미팅 항목(클릭 가능) + 업무(완료 취소선)
  · 우측 flex-1: 노트 textarea (`planners_daily.notes` 동기화)
- 용기 최대 폭: `max-w-5xl` → `max-w-6xl`

### Daily·Weekly 버튼/모달 통일 (`0d69bb64`, `0b99127d`)
- 일정 추가 버튼: bordered text → 아이콘 전용 `p-1.5 rounded` 스타일 통일
- Weekly 새 일정 모달에 **업무 탭** 추가 (`onTaskCreated` + `activeProjects` props)
  · `handleTaskCreated()` — `calDefaultDate || today` 날짜 daily record에 저장 + `dayDataMap` 갱신

### 노트 레이블 통일 + 동기화 수정 (`e567b14a`, `cc33b1d4`)
- "기본 노트" → **"노트"** (DailyView makeDefaultCornellNote · add button 레이블)
- Weekly "메모" → **"노트"** (placeholder · 저장 기본 제목)
- Weekly ↔ Daily 노트 양방향 동기화 수정
  · 읽기: `_cornell` JSON 파싱 → `rows[].note` 조인 (이전: raw JSON 문자열 표시)
  · 쓰기: `JSON.stringify({_cornell:true, rows:[{id:"r1",cue:"",note:content}]})` (이전: plain string)

---

## 세션 96 핵심 성과 (2026-04-28)

### 협업자 RLS 권한 강제 (이월 작업 완료)
- `lib/planners/auth.ts` — `getMemberIdAndEmail()` email 반환 추가
- `app/api/planners/projects/[id]/route.ts` — `resolveRole()` 헬퍼 (owner/editor/viewer 3단계)
  · owner: `project.member_id === memberId`
  · editor/viewer: `project.collaborators[]` email 매칭
  · GET: `userRole` 반환 → 클라이언트 조건부 UI
  · PATCH: viewer → 403 / editor → `collaborators·visibility·public_token·member_id` 필드 차단
- `features/planners/ProjectDetailView.tsx` — `userRole` state + 역할 배지 + ShareField/CollaboratorField 오너만 노출
- `features/planners/ProjectsView.tsx` — 포트폴리오 링크 조건부 표시

### 이월 작업 전체 검증 완료
- TemplatesView Step 2b: 754줄 + 7개 grid 파일 분리 확인 (완료 상태)
- 포트폴리오 모드: `/planners/portfolio/[memberId]` 서버 컴포넌트 확인 (완료 상태)
- P3 #18 기업플랜: 유보 (결제 사업 시작 시)

### 배포 전 블로커 (사용자 액션 필요)
- `public/planners-icon-192.png`, `public/planners-icon-512.png` 생성
- Vercel 환경변수: `ANTHROPIC_API_KEY`, `TOSS_SECRET_KEY`, `VAPID_*`, `GOOGLE_CLIENT_ID/SECRET`
- Toss 가맹점 승인
- Google Cloud Console Redirect URI 등록
- Supabase Auth Redirect URL 추가

---

## 세션 94-95 핵심 성과 (2026-04-27)

### 프로젝트 메뉴 고도화 Phase 1-6 (통합 작업 공간 완성)
- **Phase 1 (`955b213d`)** 카테고리 9종 SSOT + 추천 템플릿 매핑 + DB 마이그레이션
  · `lib/planners/project-categories.ts` (학습/비즈니스/창작/헬스/여행/관계/재무/운영/커스텀)
  · `lib/planners/template-recommendations.ts` 카테고리 → 템플릿 키 매핑
  · planners_projects: category·custom_fields·tags·tracking_metrics·visibility · planners_project_milestones 신규
  · ProjectsView 카테고리 칩 + 카드 배지 / Cover 탭에 카테고리·트래킹 메트릭 편집
  · ProjectNotesTab 카테고리 기반 추천 템플릿 violet 박스
- **Phase 2 (`f10600b3`)** Daily Task ↔ project_id 연결
  · PlannerTask.project_id 필드 / Daily 추가 입력에 프로젝트 selector / TaskRow 배지
  · `/api/planners/projects/dashboard` (진행률·D-N·오늘 task)
  · DailyProjectsCard 강화 (카테고리·D-N·진행률 바·오늘 task)
  · `/api/planners/projects/[id]/tasks` + ProjectTasksTab (날짜그룹·필터·통계)
- **Phase 3 (`fbdc54a6`)** 트래킹 자동 시계열
  · `/api/planners/projects/[id]/tracking` (planners_daily 7종 컬럼 자동 매핑)
  · ProjectTrackingTab (SVG 스파크라인·avg/min/max·노트)
- **Phase 4 (`c1edda34`)** 마일스톤 + 간트 + 진행률
  · `/api/planners/projects/[id]/milestones` (CRUD)
  · ProjectMilestonesTab (체크리스트·간트차트·자동 진행률)
- **Phase 5 (`5b69b000`)** 5F 회고 + Identity Key Results 환류
  · planners_projects.retrospective jsonb · ProjectRetrospective 타입
  · ProjectRetroModal — Finding 줄단위 분리해 Identity로 환류
  · status=completed 자동 트리거
- **Phase 6 (`4fb7b863`)** 공개 링크 + 협업자
  · public_token UNIQUE + collaborators jsonb
  · `/api/planners/projects/[id]/share` (POST/DELETE) + `/api/planners/public/projects/[token]`
  · `/planners/p/[token]` 공개 Server Component 페이지 (인증 X)
  · ShareField (URL 복사·새 탭) + CollaboratorField (이메일·역할)

### 세션 94 후속 — UX 일관성 SSOT
- 4-View 헤더 통일 (Daily 패턴: < font-serif 2xl/3xl 제목 [상태 배지] >)
- CalendarEntryEditor 단일 입력 (양력 native + 음력 캘린더 팝오버)
- Weekly 셀 3섹션 (오늘의 일정 · Task · 메모) → planners_daily.tasks·notes 양방향 동기화
- 노트 카드 헤더 통일 + 인덱싱 (기본 노트 N · 손글씨 N)
- AI Briefing 상단 메뉴 제거 + Daily AI 정리 카드 (Haiku 4.5)
- 로고 폰트 serif 통일 (AI 위첨자 sans 유지)
- (Planners)/CLAUDE.md UX 일관성 가이드 SSOT 섹션 추가

### 기념일 확장 + 전체화면 모드
- HOLIDAYS commemoration 타입 + 2026/2027 정부지정 기념일 80여 종
  · 색상: holiday(rose-500) / memorial(rose-400) / commemoration(amber-600) / solar_term(emerald-600)
  · Yearly 우선순위: 사용자 입력 > 국가기념일 > 절기 (배경 X 폰트만)
- PlannersUtilityLinks에 Maximize/Minimize 전체화면 토글 (`document.fullscreenElement`)

### 음력 입력 확장
- LUNAR_YEARS_ANNIVERSARY (1950+) + 범위 외 근사 변환

---

## 세션 93 핵심 성과 (2026-04-27)

### 통합 캘린더 (Phase 2)
- 단일 `planners_calendar_entries` 테이블 + `lib/planners/calendar-rules.ts` SSOT
- 5 kinds × 4 views 노출 룰 매트릭스
- Daily/Weekly/Monthly/Yearly 모두 통합 + reusable Editor/List
- legacy anniversaries 일괄 마이그레이션

### 공공 데이터 (Phase 3)
- KR 공휴일 30개 + 24절기 시드 (member_id NULL 시스템 엔트리)
- country_pref 기반 자동 노출 (4국 선택)
- 공공데이터포털 특일정보 API 클라이언트 + cron(매년 1/1)

### Settings 확장
- 한 해 시작월 select
- 공휴일·절기 국가 4종 다중 선택
- 트래킹 7종(에너지·만족도·기분·공부·신앙·운동·건강), default 만족도
- "구독 현황" 라벨 + 런칭 프로모션
- 전체 저장 SaveAllBar

### Daily UI 대수술
- 별도 한 장면 카드 제거 → "오늘의 한 줄" 카테고리 8번째로 통합
- 우측 컬럼: 미니 달력 + 트래킹(수정버튼) + 한 줄 + 프로젝트 카드
- 4번째 노트 옵션 캔버스 추가
- 서버 사이드 미디어 업로드(Storage RLS 우회)

### Yearly 보기 개선
- 분기/반기/연간 토글
- 시작월 회전 적용
- Anniversary 셀 텍스트 노출, 하단 목차 제거
- 분기별 목표 "+ 추가" 명시 + 라벨 정정

### 버그 fix 누적
- Canvas API storageKey 누락
- Settings update→upsert + 토스트
- 노트 저장 에러 핸들링
- Yearly 분기별 목표 입력
- Anniversary 셀 텍스트
- "오늘의 한 줄 결과"→"오늘의 한 줄" + 카테고리 8종

### 환경변수 이슈 (사용자 조치 필요)
`.env.local` 의 `# SUPABASE_SERVICE_ROLE_KEY=...` 주석 해제 필수. 미설정 시 모든 admin DB 작업이 "Invalid API key" 실패.

---

## 세션 92 핵심 성과 (2026-04-27)

---

## 세션 92 핵심 성과 (2026-04-27)

### 모바일 PWA + 회전
- manifest `orientation: any`, AppMonthBar 모바일 숨김

### HandNote 종합 개선
- 펜 4종(펜·만년필·마커·형광펜), 스타일러스 지우개 자동 감지, 팜 리젝션, 캔버스 자동 확장, 클린 아이콘
- `perfect-freehand` 패키지 누락 해소

### AI 브리핑 통합
- midday 타입 추가, 시간대 자동 추론, 단일 채팅 UI
- 이메일 옵션화 (기본 OFF)

### Weekly/Monthly 재정렬 + 월간 통계
- Weekly: GPR → Vrief → 주간 계획 (3분할 그리드)
- Monthly: 테마/목표 → 집중 영역 → 일정 → 회고 → 통계
- 월간 RPC v2 (5종 task 분포 + 에너지 + 일간 계획 수립일)

### Community 사이트화
- `/planners/app/community` → `/planners/community` (공개 읽기, 로그인 회원 작성)
- 4 카테고리: 후기·사례·제안·일상
- posts·comments·likes 테이블 + RLS + 카운트 트리거
- 앱 메뉴는 외부 링크(↗), 공개 헤더 Community 추가
- PP AI 버튼 → UniverseUtilityBar `workspacePath` 슬롯(HeRo·SmarComm 패턴 통일)

### 온보딩 루프 fix
- API: `storageKey: tenone-auth` 추가, auth_id→email→자동생성 3단계 폴백
- Layout: super_admin·staff·manager 게이트 우회
- 마스터 계정 DB 직접 마킹
- 데이터 잔존 확인(daily 8·weekly 3·monthly 1·projects 1·briefings 2 · 손실 없음)

---

## 세션 91 핵심 성과 (2026-04-27)

### Daily UX 정리
- 노트 추가 버튼 3분할 그리드 (기본 노트 / 손글씨 노트 / 템플릿)
- 신규 노트 타이틀 빈 값으로 시작 → placeholder가 예시 역할
- 타이틀 폰트 색 강화 (neutral-900) + placeholder italic·light 구분
- Cornell 헤더 좌측 padding row(w-6 X컬럼)와 정렬 (pl-10)

### TemplatesView Step 2 — 14개 그리드 카테고리 파일 분리
- `features/planners/template-grids/quadrants.tsx` — SWOT, 4P, Ansoff, BCG, 9-Box, Eisenhower, PEST, MoSCoW, Quadrant Blank, Kano (10개)
- `features/planners/template-grids/canvas.tsx` — Lean Canvas, BMC, VPC, OKR (4개)
- TemplatesView.tsx 3,072 → 2,549 라인 (523라인 추출)

### 템플릿 디테일 고도화 — 59종 모두 완료
일관 적용 패턴: 메타 영역(날짜·기간·주제·관계자) + 저자/원전 가이드 박스(amber) + 컨설턴트급 placeholder 예시(한국 1인 사업가 시나리오) + 회고·검증·다음 액션 섹션(담당·기한 강제) + 양립 항목 2-col 레이아웃.

| 카테고리 | 종 | 핵심 |
|---|---|---|
| 미팅 | 3 | Meeting / 1on1 / Interview — 회의록·Manager Tools·Mom Test |
| 회고 | 3 | KPT / AAR / 5Why — Top Try·US Army·Toyota·Verify |
| 사고법 | 5 | Mandalart / Ikigai / 5W1H / SCAMPER / Feynman |
| 공감 | 4 | EmpathyMap / Persona / JTBD / JourneyMap — 4 Forces·Top 3 기회 |
| 시간관리 | 5 | TimeBlock / DeepWork / Pomodoro / EnergyMap / HabitTracker |
| 저널 | 4 | EmotionLog / Gratitude / Reading / WeeklyJournal — CBT·Three Good Things·Active Reading |
| 분석·운영 | 5 | Porter5 / Fishbone / OODA / Brainstorm / DecisionLog — Bezos T1/T2·Lessons |
| 노트·운영 | 4 | Standup / Zettelkasten / Mindmap / DailyDesign — Luhmann·Buzan·정체성 기반 |
| 계획 | 9 | WeeklyReview/Win, Monthly, Quarterly, Year, FiveYear, MovingAverage, ReversePlan, Sprint |
| 분석 테이블 | 4 | RICE / Pareto / DecisionMatrix / Cornell — Top 1~3 결정·Sanity check |
| 사분면 | 10 | quadrants.tsx 그룹 — TOWS·6M·9-Box 등 |
| 캔버스 | 4 | LeanCanvas / BMC / VPC / OKR |

### Contacts 페이지 UX 대전환
- **본문 폭 일치**: max-w-[1400px] → max-w-6xl (Daily/Weekly와 동일)
- **letterFilter 도입**: 'top'(즐겨찾기+최근) / 'all'(전체) / 'ㄱ'·'A'(특정 letter)
- **자동 All 폴백**: 즐겨찾기·최근 둘 다 비어 있으면 top 모드라도 전체 노출 (첫 사용자 빈 화면 X)
- **인스타식 무한 스크롤**: 50명씩 점진 렌더, IntersectionObserver(rootMargin 300px), letterFilter/view/search 변경 시 limit 리셋
- **우측 인덱스 강화**: All 버튼 추가, 클릭 = 필터링(스크롤 X), 선택 letter highlight, 카운트 tooltip
- **상단 즐겨찾기 + 최근 분리 섹션**: amber border 즐겨찾기 / Clock 최근 사용
- **중복 정리 강화**: 한국 휴대폰 마지막 8자리 정규화(+82 흡수) + 이름·회사 fallback
- **초성 분류 견고화**: getInitialChar에서 invisible 문자(BOM/ZWSP/NBSP) 제거 + 호환 자모(U+3131~) + Choseong Jamo(U+1100~) 직접 매핑 — '심온' 같은 잘못 분류 케이스 해소

---

## 세션 90 핵심 성과 (2026-04-27)

### 메뉴 재편 + 본문 서브 링크
- AppTopNav · AppSidebar 에서 **Templates · AI Briefing 메인 메뉴 제거**
- 신규 `PlannersUtilityLinks.tsx` 칩 컴포넌트 → Index · Today · Weekly · Monthly · Yearly · P.I · Project 본문 헤더에 일관 배치
- AppTopNav 우측 클러스터 + 사이드바 + Settings + 푸터 + Help 등 6곳 **앱 설치 진입점** 추가
- Contact 메뉴 가로 사이즈 위배 수정 (overflow-x 자연 스크롤 + 스크롤바 시각 숨김 + 우측 액션 분리선)

### Project 상세 페이지 고도화
- 기본 탭 cover→**notes** 로 전환 (작업 영역이 첫 화면)
- 헤더: 색상 바 + 제목 + 상태 칩(컬러 토큰) + 일정 한 줄 → 정보 위계 명확
- 표지 탭 2컬럼 레이아웃 (좌:커버 미리보기/변경, 우:제목·상태·시작·종료를 divide 라인으로 통합)

### 프로젝트 노트에 인터랙티브 템플릿 적용
- ProjectNotesTab 의 NoteCard / NoteExpandModal 가 콘텐츠 마커(`<!-- planners:tpl=key -->`) 감지 → `renderFramework` 로 그리드 렌더
- DailyView 와 동일하게 localStorage 데이터 자동 저장 (key=`tplDataKey(noteId)`)
- 템플릿 노트는 제목 빈 값 + placeholder 로 라벨 안내, 연필 편집 버튼 숨김
- DB 마이그레이션 없이 backward compatible

### 누적 미완료 이월 (어제→과거 60일)
- `app/api/planners/daily/carry-over/route.ts` 재설계 — 과거 N일 일괄 스캔, status='todo' 만 수집, 가까운 과거 우선 dedupe, source_date 기록, 원본 row 자동 carried 처리
- 신규 `app/api/planners/daily/pending-count/route.ts` — count·days·oldest 반환
- DailyView 버튼 라벨: "어제 미완료 이월" → **"누적 미완료 N건 이월"** + tooltip 출처 안내

### PWA 설치 시스템
- 신규 `/planners/install` 페이지 (`app/(Planners)/planners/install/page.tsx` + `features/planners/InstallView.tsx`)
- 자동 플랫폼 감지 (Android · iOS · PC), `beforeinstallprompt` 캡처해 1-click 설치 버튼, iOS 는 Safari 4단계 그림 가이드
- 이미 standalone 이면 "설치됨" 안내, URL 복사 + QR 코드, "App Store / Play Store 에 없는 이유" FAQ
- `/planners/planner-tool` 타이틀 바로 아래에 다운로드 카드 (로고 + 앱 다운로드 CTA + 보조 카피)

### Contacts 주소 검색기
- 신규 `features/planners/AddressPicker.tsx` — Daum Postcode lazy-load (버튼 클릭 시 1회), 모달 내 검색, 도로명/지번/건물명 자동 매핑
- 무료·무인증·CORS 무관, 페이지 진입 비용 0

### 새 로고 적용
- `public/planners-icon-192.png` · `planners-icon-512.png` 교체 (검정 BG + 화이트 P + 펜촉)
- AppTopNav 좌측(24px) · AppSidebar 상단(32px) · Install Hero(64px) · planner-tool 다운로드 카드(48px) 에 마크 노출, 불필요한 그라데이션 래퍼 제거

---

## 세션 89 핵심 성과 (2026-04-26)

### Contacts 기능 극강화 (Google Contacts급)

| 영역 | 내용 |
|---|---|
| DB 정리 | 12,273명 → **6,064명** (6,209 중복 자동 제거 · 권오성 12→1) |
| 시스템 라벨 정리 | myContacts·Remember 메타라벨 일괄 제거 |
| 1만명 한도 → **무제한** | API 페이지네이션 (PostgREST max-rows 우회) |
| 자동 dedupe | bulk POST `skip_duplicates` 기본 활성 (phone/email 키) |
| 라벨 동기화 모드 | `merge_labels=true` — 기존 row에 라벨/빈 필드만 병합 |
| 라벨 관리 API | `/api/planners/contacts/labels` (POST·PUT·DELETE) |
| CSV 양방향 | Google Contacts CSV 헤더 자동 매핑. Export 토글 (vcf/csv) |
| 빠른 추가 | 사이드바 한 줄 입력 자동 파싱 |
| 다가오는 생일 카드 | 14일 내 생일자 위젯 (D-day 색상 구분) |
| 마지막 연락 추적 | tel:/mailto: 클릭 시 last_contacted_at PATCH + "최근 연락" 뷰 |
| Bulk Edit | 회사·직책·그룹·관계·즐겨찾기·메모 일괄 수정 |
| 수동 병합 | 2명 선택 시 필드별 A/B 선택 UI |
| Google Contacts 레이아웃 | 좌측 사이드바 + 테이블 행 + 가나다 fixed sidebar |
| 천 단위 콤마 | 모든 카운트 `toLocaleString("ko-KR")` |

### Planners 사이트 헤더 + 홈 정비

- 헤더 4그룹 명확 분리 (로고·구분선·메뉴·CTA) + vertical divider
- "Planner's" 메뉴 제거 (로고와 중복)
- PP AI 진입 CTA 헤더 우측 (teal-emerald 그라디언트, 인증 상태별 라우팅)
- 홈 ExploreSection 제거 (헤더와 100% 중복) → PPAISpotlight 신설
- AppSidebar·AppTopNav 메뉴 순서·라벨 SSOT 통일

### 기타 개선

- TemplateNoteBlock ⤢ Maximize + 타이틀 편집 명확화
- ProjectNotesTab 피커를 DailyView 동일 UX로 통일 (검색·즐겨찾기·바텀시트)
- DailyView·ProjectNotesTab 즐겨찾기 필터 (localStorage 공유)
- **PlannersThemeProvider 치명 버그 수정**: `*=` → `~=` selector — `hover:bg-[#0F766E]/5` 가 항상 teal 덮던 문제 해결
- Settings: alert→toast, 컬러/폰트 섹션 최상단 이동

### 신규 파일
- `app/api/planners/contacts/labels/route.ts`
- `sql/planners-contacts-v2.sql` (labels TEXT[], is_favorite, organization, title, address)

---

## 세션 88 (2026-04-26 이전)

### 버그 수정 7종 + Contacts 신규

| # | 항목 | 상태 |
|---|------|------|
| 1 | 오늘 날짜 에러 (UTC→KST) | ✅ DailyView·MonthlyView·AiBriefingView |
| 2 | 기념일 요일 계산 | ✅ YearlyView 모달 getDayOfWeek |
| 3 | 연락처 가져오기 (vCard) | ✅ ContactsView vCard import |
| 4 | 연락처 그룹핑 | ✅ group_name 필터 + 섹션 분리 |
| 5 | 기념일 관계유형 | ✅ YearlyView relationship 필드 |
| 6 | 세팅 컬러 앱 전체 반영 | ✅ PlannersThemeProvider + applyPlannersTheme |
| 7 | 세팅 데이터 백업 | ✅ JSON export (7 API 병렬) |

**신규 파일**: `features/planners/ContactsView.tsx` · `app/(Planners)/planners/app/contacts/page.tsx` · `app/api/planners/contacts/route.ts` · `sql/planners-contacts.sql` · `features/planners/PlannersThemeProvider.tsx` · `lib/planners/auth.ts`

---

## 세션 87 핵심 성과 (2026-04-25)

### Templates 59종 전체 인터랙티브 그리드화 — P3 #17 완수

기존 3종(BCG·SWOT·9Box) + Batch 1~10 총 56종 신규 → **59/59 전 템플릿 시각 편집 그리드 완성**.

| Batch | 범주 | 신규 그리드 |
|---|---|---|
| 0 (기존 세션) | Framework | Empathy Map · Lean Canvas · Mandalart |
| 1 | 4-cell | Eisenhower · PEST · MoSCoW · 4분면 |
| 2 | 캔버스 | BMC · VPC |
| 3 | 구조 | OKR · Persona · JTBD |
| 4 | 표·랭킹 | RICE 🏆 · 5W1H · 5Why 사다리 |
| 5 | 특수 도형 | Ikigai · Porter5 · SCAMPER · Kano · Pareto · Fishbone · Journey Map |
| 6 | Note 구조 | KPT · OODA · Cornell · Decision Matrix · Feynman (swot_self 자동) |
| 7 | Note 세션 | 1:1 · 회의록 · 인터뷰 · AAR · 브레인스토밍 ⭐ · 의사결정 로그 |
| 8 | Note 로그 | 감정 로그 😊 · 감사 일기 · 독서 노트 · 스탠드업 · 주간 저널 · 제텔카스텐 · 마인드맵 |
| 9 | Schedule 시간 | 타임블록 · 하루 설계 · 딥워크 · 포모도로 🍅 · 습관 트래커 ✅ · 에너지 지도 · 주간 리뷰 · 주간 WIN |
| 10 | Schedule 계획 | 월간 테마 · 분기 계획 · 연간 12개월 맵 · 5년 비전 · 90일 실험 · 역산 계획 · 스프린트 |

### 공통 장치
- 모달 헤더 한국어 + 영문 부제 자동 표기
- `localStorage` 자동 저장 → Daily/ProjectNotes 삽입 시 markdown export
- JSON 구조 템플릿(RICE·Pareto·Journey·DM·TimeBlock·DeepWork·Pomodoro·Habit·Energy·YearPlan·Brainstorm)은 테이블 markdown으로 변환
- 공용 헬퍼: `LabeledInput`·`LabeledBox`·`CellTextarea`·`QuadrantGrid`
- 공용 유틸 `lib/planners/templates.ts` 추출 → `DailyView`·`ProjectNotesTab` 공유

### 변경 파일
- `features/planners/TemplatesView.tsx` (+2981줄 — 27개 그리드 컴포넌트 신규)
- `lib/planners/templates.ts` (신규 · 공용 export 유틸)

### 커밋
- `ca75c371 feat(planners): 전 템플릿 59종 인터랙티브 그리드화`

---

## 이번 세션 핵심 성과

### Planner's Planner AI — 런칭 가능 MVP 전 구간 완성

종이 플래너 "2026 Planner's Planner All in One"을 웹/앱 서비스 **Planner's Planner AI**로 확장. W1~P2 전 범위 완성.

**철학**: "우리는 모두 기획자다, 적어도 자기 인생에서 만큼은 / 나는 무엇을 도모(圖謀)하고 있는가 / 생각한대로 살지 않으면 사는대로 생각하게 된다"

**구성 5축**: Personal Identity + Scheduler + Note + Project Book + Template

**핵심 차별점**: **능동 AI 비서** (아침 브리핑·저녁 정리) — Vridge(Vrief+GPR) 방법론 × Identity 정렬

---

## 구축 내역

### DB (16 테이블 + RPC 5)
- `planners_users` · `planners_identities` · `planners_yearly/monthly/weekly/daily`
- `planners_projects` · `planners_project_vriefs` · `planners_project_gprs` · `planners_project_notes`
- `planners_ai_briefings` · `planners_ai_usage`
- `planners_templates` (59종) · `planners_covers` (15종)
- `planners_payments` · `planners_push_subscriptions` · `planners_integrations` · `planners_external_events`
- RPC: `planners_activate_subscription` · `planners_activate_pdf_buyer` · `planners_expire_subscriptions` · `planners_weekly/monthly/yearly_summary`

### 주요 페이지 (13개)
- `/planners/onboarding` — 4단계 (Welcome→Mode→AI 설정→Identity 라이트)
- `/planners/purchase` — Toss Payments 19,000원/년
- `/planners/app/{today,weekly,monthly,yearly,identity,projects,projects/[id],templates,ai-briefing,search,settings}`
- `/planners/offline` — PWA 오프라인 페이지
- `/intra/planners` — 관리자 대시보드 (구독자·결제·수동 활성화)

### 능동 AI 인프라
- Haiku 4.5 (`claude-haiku-4-5-20251001`) 기반 아침 브리핑·저녁 정리
- Context: P.I / Daily / Weekly / Monthly / Projects 크로스 참조
- Vercel Cron: 매 시간 실행 (유저 설정 시각과 매칭해 브리핑 생성)
- 이메일 백업 (Resend) + Web Push (VAPID, 환경변수 설정 시)

### 결제·구독
- Toss Payments: request → Toss widget → success callback → confirm API → 구독 활성화
- PDF 구매자 무료 활성화: 관리자가 Intra에서 수동 매칭 (1년 무료)
- 만료 자동 감지 → purchase 리디렉트

### 외부 연동
- **Google Calendar**: OAuth 2.0 + access/refresh token + 이벤트 fetch + 90일 sync
- **Todoist**: 개인 API 토큰 방식 + 오늘 태스크 → Daily import

### Templates 59종
- FrameWorkBook 25: SWOT · 만다라트 · OKR · Quadrant · Business/Lean Canvas · 5W1H · PEST · Ikigai · Persona · RICE · Eisenhower · MoSCoW · Fishbone · 5Why · Pareto · Journey Map · Empathy Map · VPC · Porter 5 · Ansoff · BCG · SCAMPER · JTBD · Kano
- Schedule 15: Time Block · Weekly Review · Monthly Theme · Quarterly · Daily Design · Year Plan · 5-Year · Energy Map · Pomodoro · Deep Work · Weekly WIN · Reverse Plan · Sprint · Habit Tracker · 90-Day Experiment
- Note 19: Cornell · Meeting · Brainstorm · Decision Log · KPT · Feynman · Zettelkasten · Mindmap · Reading · Standup · 1:1 · Interview · Gratitude · Emotion Log · Decision Matrix · OODA · Personal SWOT · AAR · Weekly Journal

### 원본 PDF 충실도
- 상단 7대 메뉴 + 사이드바 모드 (Weekly 기본 / All in One 고급)
- 체크박스 기호: □ V → ┕ (순환)
- 공휴일·절기 2026~2027 (법정공휴일 15개 + 24절기)
- Anniversary & Big Event 2p 스프레드 (상반기/하반기 31일 매트릭스)
- 날짜 1개 = Daily + Note 2슬롯 (PDF의 N 링크 2개 재현)
- 4계층 드릴다운 (Index → Yearly → Monthly → Weekly → Daily)

---

## 이번 세션 결정사항

| 결정 | 내용 |
|------|------|
| 가격 | **연간 19,000원** (정기결제 아님, 수동 갱신) |
| 기본 모드 | **Weekly** (빠른 진입) · All in One은 고급 옵션 |
| PDF 구매자 | **무료 1년** (a: PDF 구매자에게 웹앱 무료 제공) |
| 커뮤니티 | **운영 안 함** (5번 결정) |
| 모드 전환 | Settings에서 언제든 |
| AI 톤 | professional · friendly(기본) · brief |
| 체크박스 | PDF 관례 계승 (V / → / ┕) |
| 능동 AI 비용 | 월 ~$0.18/유저 (Haiku 4.5, 월 60회) |

---

## 보안 감사 결과 (Supabase get_advisors)

- planners_* 테이블 **16개 RLS 정책 문제 0건**
- planners_* 함수 6개 `search_path` 경고 → 모두 ALTER로 고정 완료
- 전체 ERROR 8개는 레거시 VIEW (`hit_a_results_safe` 등) — Planner's 배포 무관

---

## 다음 집·사무실·새 세션에서 이어 할 작업

### 배포 직전 필수 (코드 0줄, 외부 작업)
1. **환경변수 Vercel 설정**:
   - `ANTHROPIC_API_KEY` · `CRON_SECRET`
   - `TOSS_SECRET_KEY` · `NEXT_PUBLIC_TOSS_CLIENT_KEY` (실제 가맹점 승인 후 live 키)
   - `VAPID_PUBLIC_KEY` · `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT`
   - `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL=https://planners.tenone.biz`
2. **PWA 아이콘 자산**: `/public/planners-icon-192.png` · `planners-icon-512.png`
3. **Toss 가맹점 승인** 및 실 결제 키 적용
4. **Google Cloud Console**: Redirect URI `https://planners.tenone.biz/api/planners/integrations/google/callback` 등록
5. **Supabase Allowed URL**: `https://planners.tenone.biz/**` 추가
6. Vercel 도메인 연결: planners.tenone.biz

### 완료 확인 (세션 85 감사)

세션 84에서 pending으로 기록된 아래 항목들이 이미 구현 완료 상태임을 확인:
- ✅ P3 #19 AI 설정 고급화 (`ai_context_scope` UI + 브리핑 샘플 미리보기) — `settings/page.tsx`
- ✅ P3 #20 Copy-to-AI 페이로드 편집 (`editing` state + textarea) — `CopyToAiButton.tsx`
- ✅ P4 #22 사용자 매뉴얼·FAQ — `app/(Planners)/planners/app/help/page.tsx`
- ✅ P4 #23 베타 피드백 버튼 — `features/planners/BetaFeedbackButton.tsx`
- ✅ P5 #25 Notion · #26 Slack · #27 iCal — `settings/page.tsx` UI + API routes

### 이번 세션 추가 완료 (세션 85)
- ✅ P4 #21 GTM trackPlanners 추가:
  - `CopyToAiButton.tsx` — `planners_copy_to_ai` (target: claude/chatgpt/gemini)
  - `WelcomeTracker.tsx` (신규) + `app/layout.tsx` — `planners_subscription_started` (?welcome=1)
  - `app/page.tsx` — welcome 파라미터 today 페이지로 전달

### 완료 확인 (세션 86 감사)

세션 85에서 pending으로 기록된 아래 항목이 이미 구현 완료 상태임을 확인:
- ✅ P4 #24 Intra 관리 확장 — `/intra/planners` 4탭 (구독자·결제·브리핑 로그·AI 사용량) + 통계 그리드 완성
  - `app/intra/planners/page.tsx` (421줄) — 탭·검색·수동 활성화 모달
  - `app/api/intra/planners/briefings/route.ts` — 최근 200개 브리핑 + 이메일 조인
  - `app/api/intra/planners/usage/route.ts` — 월별 사용량 + 집계 stats
- ✅ 빌드 검증 (exit 0, 세션 86)

### 남은 기능 작업 (대규모 이월)

**P3 대규모**
- #16 필기 입력 (Fabric.js/Excalidraw) — 태블릿·S Pen·Apple Pencil 지원
- ~~#17 FrameWorkBook 구조화 위젯~~ — ✅ 세션 87 완료 (전 59종 그리드화)
- #18 기업 플랜 — 팀·조직 협업 Project Book

### 세션 87 이월 (소규모)
- `features/planners/TemplatesView.tsx` 2700+ 줄 → 다음 세션에서 `features/planners/template-grids/` 폴더로 그리드 컴포넌트 27개 분리 리팩토링 권장
- 유저가 공유한 Google Drive 4개 폴더(프레임워크/노트/놀이/스케쥴) 미검토 — 추가 템플릿 후보 발굴 대상
- 기타 미커밋 잔업 49 modified + 10 untracked (다른 Planner's 세션 진행중 코드로 판단, 본 세션과 별개) — 별도 정리 세션 필요

### 배포 후 모니터링 과제
- 능동 AI 7일 연속 실동작 테스트 (크론 정상 트리거 확인)
- Haiku 4.5 API 비용 실측
- 결제 실제 성공률
- Google Calendar 동기화 정상성
- PWA 홈스크린 설치율
- 온보딩 이탈 구간 분석

---

## 세션 시작 시 우선 체크 사항

1. **환경변수**: 위 목록 중 아직 설정 안 된 것 확인
2. **PWA 아이콘 여부** 확인 (없으면 manifest에서 경고 뜸)
3. `/planners/planner-tool` 페이지의 "Now Live" CTA → `/planners/purchase`로 연결 확인
4. 로그인 → 온보딩 → Today → Weekly → Project → AI Briefing 전체 흐름 로컬 검증 (`npm run dev`)

---

## 누적 세션 요약 (전 세션까지)

- 세션 83: HeRo 잔업 정리 (매칭 엔진 v3 DB 적용, audition 페이지 리디렉트 정리, HIT 질문 DB 단일화, HitProfileBadge 브랜드 배포, E2E 빌드 검증)
- 세션 82: HeRo P3 UI/UX 색 SSOT 전 페이지 감사 완료
- 세션 81: HeRo Journey 워크스페이스 Day 3 + Talent Agency 리브랜딩 + 64 영웅 유형 v2
- 세션 80: HeRo P3 색 SSOT 초기
- ...

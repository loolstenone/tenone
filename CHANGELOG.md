# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-04-09 (집, 세션 35b)

### N-03 뉴스레터 공통 컴포넌트 + 전 브랜드 삽입

- `components/newsletter/NewsletterSubscribeForm.tsx`: 신규 — dark/light 테마, accentColor, source, title, subtitle prop. 닉네임+이메일+동의 체크박스, 성공/에러 처리
- 22개 브랜드 메인 페이지에 `NewsletterSubscribeForm` 삽입 (HeRo, MADLeague, RooK, WIO, Badak, MADLeap, SmarComm, YouInOne, EvoSchool, FWN, Planners, Seoul360, Townity, 0gamja, ChangeUp, Domo, Jakka, MoNTZ, Mullaesian, NatureBox, BrandGravity, NamingFactory)
- FWN: 기존 인라인 뉴스레터 폼 → 공통 컴포넌트로 교체
- `CLAUDE.md`: Context Rot 방지 → Context Rot 방지 + 토큰 최적화 섹션으로 교체 (모델 선택, compact 타이밍, 서브에이전트 활용)
- `.claude/hooks.json`: strategic-compact 훅 추가 (Edit/Write PreToolUse → stderr 메시지)
- 스킵: TrendHunter(리다이렉트 전용), Mindle 메인(기존 인라인 폼 교체 후순위), MyVerse(기존 구독 CTA 있음), Dokdae(풀스크린 채팅 구조)

---

## 2026-04-09 (집, 세션 35)

### crew-invite → UMS 회원 초대 + ccusage 모니터링

- `app/crew-invite/page.tsx`: 삭제 — 공개 지원 폼 불필요 (텐원은 직원만 채용, OB 초대는 UMS에서)
- `app/intra/ums/members/invite/page.tsx`: 신규 — MADLeague/MADLeap OB 초대 관리 페이지 (브랜드 선택, 이메일 다건 입력, 발송 현황 테이블, 상태/브랜드 필터, 재발송)
- `app/api/ums/invite/route.ts`: 신규 — POST: emails[]/brand/message 받아 Supabase member_invites upsert + Resend 이메일 발송. ok/fail 카운트 반환
- Supabase `member_invites` 테이블: invite_token(base64url 24byte), expires_at(7일), brand CHECK(madleague/madleap), status CHECK(pending/accepted/expired)
- `lib/intra-nav.ts`: UMS > 회원 하위에 "초대" 메뉴(`/intra/ums/members/invite`) 추가
- `~/.claude/usage-status.js`: ccusage 캐시 방식 모니터링 스크립트 (10분 캐시, 백그라운드 갱신). 출력: `MAX $200 | 이번주 $X(Y%) | N월 $Z/Wt`
- `~/.claude/settings.json`: Stop 훅 추가 — `node ~/.claude/usage-status.js` 실행

---

## 2026-04-09 (집, 세션 34)

### N-04 Latest 섹션 실데이터 연결

- `app/page.tsx`: STATIC_NEWS 배열 제거 (2025.08 하드코딩 날짜 원인). newsroom feed 필드 매핑 수정 (summary→excerpt, thumbnail_url→representImage, published_at→created_at, url 직접 연결). 빈 상태 fallback → 준비 중 안내로 교체. 실데이터 4건 (2026-04-*) 정상 노출 확인.

### 세션 34 조사 결과

- `/crew-invite/page.tsx`: 이미 완성 (244줄, 지원폼 전체 구현). WORK_STATUS 항목 완료 상태였음.
- `/intra/hero/hit/report/page.tsx`: 코드 정상. hit_a_results 시드 데이터 member_id=NULL (orphan) → 실사용자 응시 시 정상 작동 예정.
- 뉴스레터 API: `/api/newsletter` 단일 엔드포인트로 이미 통일 완료. 추가 작업 불필요.

---

## 2026-04-09 (집, 세션 33)

### 뉴스레터 고도화 + UMS 사이트 필터 재구성

- `app/api/newsletter/send/route.ts`: blocks 기반 매거진 렌더러(`renderMagazineHtml`/`renderMagazineText`) 적용, blocks 없을 시 legacy fallback. 구독자 필터 버그 수정 (`eq('status','active')` → `eq('is_active', true)`)
- `app/intra/ums/newsletter/page.tsx`: 탭 페이지 → 대시보드로 전환 (통계 카드 4개 + 최근 이슈 5개 + 빠른 링크)
- `app/intra/ums/newsletter/issues/page.tsx`: 신규 — 뉴스레터 관리 (이슈 목록 + 블록 에디터 + 발송 모달)
- `app/intra/ums/newsletter/subscribers/page.tsx`: 독립 페이지로 재작성 (검색/필터/태그/삭제)
- `lib/intra-nav.ts`: 뉴스레터 하위 메뉴 3개 (대시보드/뉴스레터 관리/구독자), "이슈 관리" → "뉴스레터 관리" 변경
- `app/intra/ums/layout.tsx`: 전역 `SiteFilterDropdown` 제거 → `SiteFilterDropdown` 컴포넌트로 export, UmsLayout은 Context Provider만 유지
- `app/intra/ums/sites/boards/page.tsx`: PageHeader children에 `<SiteFilterDropdown />` 추가
- `app/intra/ums/sites/content/page.tsx`: 동일 패턴 적용
- `~/.claude/settings.json`: model: sonnet, MAX_THINKING_TOKENS: 10000, CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: 50, CLAUDE_CODE_SUBAGENT_MODEL: haiku 추가

---

## 2026-04-09 (집, 세션 32)

### QA + 버그 수정 + 도메인 라우팅 정비
- `app/(HeRo)/hero/page.tsx`: hydration mismatch 수정 — `useMemo(Math.random)` → `useState(heroChars[0])` + `useEffect` 패턴
- `app/(MADLeague)/madleague/page.tsx`: 가짜 2025 활동 데이터 제거 (`recentActivities = []`, 섹션 조건부 렌더)
- `app/(Mindle)/mindle/page.tsx`: 뉴스레터 이메일 수집 동의 체크박스 추가
- `middleware.ts`: 9개 도메인 매핑 추가 (`domo.ne.kr`, `hero.tenone.biz`, `fwn.tenone.biz`, `0gamja.tenone.biz`, `changeup.tenone.biz`, `jakka.tenone.biz`, `planners.tenone.biz`, `wio.tenone.biz`, `seoul360.tenone.biz`)
- `app/CrewInvite/` → `app/crew-invite/` 폴더명 rename (Next.js 대소문자 라우팅 수정)
- `app/intra/universe/` 폴더 전체 삭제 (UMS로 대체된 고아 경로 8페이지 제거)
- `RELAY.md` 신규 생성 (Code→Chat 단방향 완료 보고 구조 문서화)
- `npx next build` 에러 없음 확인

---

## 2026-04-08 (집, 세션 31)

### HIT D/E 레이어 심화 75문항 — 채점 통합
- `lib/hit/scoring-d.ts`: CH Deep 45 + AP Deep 30 채점 통합 (`scoreChDeepB`/`scoreApDeepB` 재사용)
- `lib/hit/scoring-e.ts`: 동일 패턴 — chDeepScores/apDeepScores 반환
- `app/api/hit/d/score/route.ts`: Dark flag 탐지 (NR+MK≥50 → hit_admin_flags), ch_deep_scores/ap_deep_scores 저장
- `app/api/hit/e/score/route.ts`: 동일 패턴 적용
- `app/api/hit/f/score/route.ts`: 동일 패턴 적용 (이미 D/E와 동일 구조)
- `app/api/hit/a/result/preview/route.ts`: 신규 — 어드민용 목업 결과 API (GET /api/hit/a/result/preview)
  - D-INFJ 전체 프로필 + 8개 report_modules + AI 내러티브 포함

### Admin HIT 리포트 페이지
- `app/intra/hero/hit/report/page.tsx`: 신규 — 멤버 목록 + 레이어 완료 배지
  - members 테이블 조회 + 각 hit_[a-f]_results JOIN
  - A~F 배지 클릭 → 소비자 뷰 팝업 (iframe `ConsumerPreviewModal`)
  - 모바일(400px) / 데스크탑(900px) 토글
  - 헤더 "Mock 소비자 뷰" 버튼 → `/hero/hit/a/result/preview` 팝업

### 소비자 결과 페이지 UX 개선
- `app/(HeRo)/hero/hit/a/result/[id]/page.tsx`:
  - 카드 고정 높이 `h-[540px] overflow-hidden` — 모든 페이지 동일 사이즈
  - 페이지 4 (통합 보고서): `flex flex-col` — 제목 고정 상단 / 모듈 스크롤 / PDF버튼 고정 하단
  - 페이지 3 "PDF 보고서" 안내 문구 → "다음 페이지에서 확인" 으로 수정
- `features/hit/MembershipGate.tsx`: 전면 리디자인
  - 기존: 노란(`#F5C518`) 자물쇠 + 멤버십 업그레이드 버튼 (유치한 느낌)
  - 변경: 그레이 아이콘 + `HeRo 멤버십 전용` 빨간 태그 + 다크 "멤버십 살펴보기" CTA
- `features/hit/HitPdfButton.tsx`: 레이블 변경
  - `PDF 보고서 다운로드` → `전체 보고서 보기` (FileText 아이콘, 아웃라인 스타일)

---

## 2026-04-08 (집, 세션 29)

### HIT F 전면 재구축 (Phase 9)
- `lib/hit/data/f-questions.ts`: Q() 포맷 전면 교체, 5모듈 152 + 미끼 2 = 154문항
  - module/section/subscale/crossTags 완비 (C/D/E와 동일 표준)
  - 미끼 f_val01/02: 사회적 바람직성 편향 탐지용
- `lib/hit/scoring-f.ts`: 전면 재설계
  - scoreDecoyF(): 미끼 탐지 → fakingFlag
  - scoreDirection(): directionTop (Top1 방향 + 한글 라벨 + 점수)
  - scoreReadiness(): 4개 준비도 subscale 개별 점수
  - scoreBreakContext(): 3개 맥락 subscale 개별 반환
- DB: hit_f_results에 readiness_scores, break_context_scores JSONB 추가
- `sql/seed-hit-v2/10-layer_f.sql`: layer_f 154건 시딩 완료
- `Scripts/seed-hit-layer-f.js`: 시딩 SQL 자동 생성기
- `app/api/hit/f/score/route.ts`: direction_scores/direction_dominant/readiness_scores/faking_flag/break_context_scores 저장, AI 프롬프트 방향 정보 추가

---

## 2026-04-07 (집, 세션 26)

### HIT C/D/E/F 문항 전면교체
- `lib/hit/data/c-questions.ts`: 60개 → 120개 (원본, subscale 11종)
- `lib/hit/data/d-questions.ts`: 70개 → 140개 (원본, subscale 17종)
- `lib/hit/data/e-questions.ts`: 60개 → 140개 (원본, subscale 17종)
- `lib/hit/data/f-questions.ts`: 55개 → 152개 (원본, subscale 16종)

### HIT 채점 로직 전면 수정
- `lib/hit/scoring-c.ts`: careerCapital 모듈키, 새 subscale 4종+3종+4종
- `lib/hit/scoring-d.ts`: LeadershipType 4종 변경, seniorReadiness 모듈 분리 신설
- `lib/hit/scoring-e.ts`: residual_passion, DirectionType 5종, legacy/social 재설계
- `lib/hit/scoring-f.ts`: latentSkills=viability, resilience=자기서사/자존감/재도전의지, reentry 방향+준비도 분리
- `app/api/hit/d|e|f/score/route.ts`: 리더십/방향 한글 라벨, AI 프롬프트 subscale 참조 업데이트

### 정밀 QA 대응 수정
- `app/(HeRo)/hero/coaching/page.tsx`: 가짜 대기업 멘토 프로필 → 일반 직함
- `app/(HeRo)/hero/page.tsx`: 파트너 캐러셀 대기업명 → 업종 카테고리
- `app/(Mindle)/mindle/page.tsx`: 가공 통계/조회수/키워드% → 준비중/샘플 표시
- `app/(Mindle)/mindle/about/page.tsx`: 브랜드 수 12→26
- `app/(TenOne)/newsletter/page.tsx`: STATIC_ISSUES 6건 제거, 빈 상태 안내 추가
- `next.config.ts`: /goods 404 → / 301 리다이렉트

---

## 2026-04-07 (집, 세션 25)

### Resend 메일링 설정
- resend.com 가입 + tenone.biz 도메인 인증 (가비아 DNS: DKIM/SPF/DMARC)
- API Key → .env.local + Vercel 환경변수
- From: noreply@tenone.biz, Reply-To: lools@tenone.biz

### 뉴스레터 발송 고도화
- `sql/newsletter-tags.sql`: subscriber_tags 테이블 + newsletter_issues 컬럼 추가
- `app/api/newsletter/send/route.ts`: fromName/siteIds/tags 파라미터
- `app/intra/ums/sites/newsletter/page.tsx`: 발송 설정 모달(브랜드/타겟/태그/예상수신자), 구독자 태그 관리

### daily-gpr Edge Function
- `supabase/functions/daily-gpr/index.ts`: GPR PM 브리핑
- `app/api/cron/daily-gpr/route.ts` + vercel.json cron 추가

### Mock 폴백 제거 (16개 파일)
- ERP HR: gpr/evaluation, talent
- Marketing/CRM: 14개 파일 일괄 DB 전용 전환

### AA팀 전면 수리
- DB: agent_messages RLS `am_select_own` 정책 (독대 히스토리 복원)
- `app/api/agent/messages/route.ts`: 인증 추가
- `app/api/agent/vrief/route.ts`: 필드명 수정 (agent_name→from_agent)
- `app/api/agent/invoke/route.ts`: 3중→2중 호출 최적화
- `app/(Dokdae)/dokdae/page.tsx`: 마크다운 렌더링, 에러 재시도, 페이지네이션, 타이핑 개선

### HIT C~F 전체 구현 (4단계 × 13파일 = 52파일+)
- HIT C "어디로 이직?" (60문항): c-questions, scoring-c, API 5개, 페이지 4개
- HIT D "시니어 리더십 전환?" (70문항): d-questions, scoring-d, API 5개, 페이지 4개
- HIT E "인생 2막?" (60문항): e-questions, scoring-e, API 5개, 페이지 4개
- HIT F "경력 공백 복귀?" (55문항+CVI): f-questions, scoring-f, API 5개, 페이지 4개
- lib/supabase/hit.ts: D/E/F 타입 + 헬퍼 함수 추가

**수정 파일:** 25개 수정 + 50개+ 신규

---

## 2026-04-06 (사무실, 세션 24)

### AA팀 구조 정상화
- agent_type 'brand'→'agent'/'chatbot' 확장, badangsoe→badak rename (DB)
- 쇠봇 7개 chatbot + badaksoe_rooms 7개 방 시트 기준 완료 (DB)
- `constants/mindle-categories.ts` 신규: 11개 카테고리 상수/타입
- DB mindle_trends 52건 카테고리 표준화
- crawler route Haiku 분류 프롬프트 11개 카테고리 기준 교체
- Edge Functions: daily-vrief, trend-crawl (Deno) + Vercel Cron 4개
- 신규 에이전트 5개 DB: planner/rook/montz/fwn/youinone (1500자+ 프롬프트)
- 1001 system_prompt + can_invoke 13개 업데이트

### 독대 UI 대폭 개선
- `app/(Dokdae)/dokdae/page.tsx`: 밝기/대비 전면 개선, 폰트 크기 업
- `public/logo-tenone.png` 추가, 전 아바타 TenOne 로고 이미지로 교체

### 메일링 시스템 (Resend)
- resend v6.10 설치
- `lib/email/newsletter-template.ts`: HTML 이메일 템플릿
- `app/api/newsletter/send/route.ts`: 배치 발송
- `app/api/newsletter/unsubscribe/route.ts`: One-Click 수신거부
- `app/(TenOne)/unsubscribe/done/page.tsx`: 수신거부 완료 페이지
- Intra 뉴스레터 Send 버튼 연결

**수정 파일:** constants/mindle-categories.ts, app/api/crawler/route.ts, sql/agent-tables.sql, sql/messenger-channels.sql, app/(Dokdae)/dokdae/page.tsx, public/logo-tenone.png, lib/email/newsletter-template.ts, app/api/newsletter/send/route.ts, app/api/newsletter/unsubscribe/route.ts, app/(TenOne)/unsubscribe/done/page.tsx, app/intra/ums/sites/newsletter/page.tsx, vercel.json, tsconfig.json, package.json

**커밋:** `48aa447` `957f7b0` `f222e7a` `62af774` `133acf8`

---

## 2026-04-05 (집, 세션 19)

### HeRo HIT 보고서 품질 개선
- `cleanMarkdown()` 함수를 HIT A 결과/보고서/프로필/B 결과 4개 페이지에 전체 적용
- DB `hit_hero_types` 64행 profile_overview에서 마크다운 문법 제거
- "AI 분석" → "HeRo의 분석" 전체 변경 (이전 세션에서 시작, 이번에 완료)
- 모듈 콘텐츠 간격 확보 (mb-3→mb-5, mb-4→mb-8)
- FWN WordPress 마이그레이션 상태 확인 (15개 기사 DB 저장 완료, 원본 사이트 다운)

**수정 파일:**
- `app/(HeRo)/hero/hit/a/result/[id]/page.tsx`
- `app/(HeRo)/hero/hit/a/report/[id]/page.tsx`
- `app/(HeRo)/hero/hit/profile/[id]/page.tsx`
- `app/(HeRo)/hero/hit/b/result/[id]/page.tsx`

---

## 2026-04-03 (사무실, 세션 8)

### UMS 7개 TASK 완료 — DB 통합 대작전

**수정/생성 파일:**
- `sql/ums-task1-sites.sql` — ums_sites 생성 (+ site_configs_legacy 뷰)
- `sql/ums-task2-members.sql` — account_type 확장 + 고객 플로우 트리거 3개
- `sql/ums-task3-boards.sql` — bums_* → ums_* 리네임 + 데이터 통합
- `sql/ums-task4-commerce.sql` — shop_orders/products/promotions/subscriptions + customer_payments 신규
- `sql/ums-task5-content.sql` — content_pipeline 9개 컬럼 추가
- `sql/ums-task6-engage.sql` — newsletter_subscribers/notifications/member_points + member_point_balances 뷰
- `app/intra/universe/page.tsx` — UMS 6개 허브 현황 섹션 추가
- `lib/intra-nav.ts` — 사이드바 nav 모듈 추출
- `components/IntraSidebar.tsx` — 3뎁스 accordion 제거
- `components/intra/IntraSubTabs.tsx` — 본문 상단 서브탭 신규

**결정사항:**
- UMS 6 Hub 구조: SITE / MEMBER / COMMERCE / CONTENT / BOARD / ENGAGE
- bums_* → ums_* 마이그레이션 완료, 레거시 뷰로 하위호환
- customer_payments: PG 연동 전 스키마 완비
- member_point_balances: 집계 뷰로 잔액 관리

**커밋:** `367ff1d`

---

## 2026-04-03 (집, 세션 7)

### Phase 0: 테넌트 격리 기반 구축
- 80개 테이블 tenant_id 추가, wio_tenant_configs + wio_feature_flags 생성
- Identity Architecture Tier 4 문서화
- CLAUDE.md: WIO 2-Tier, Tech Flywheel, 8원칙

### Phase 1: 4대 제품 Intra 통제
- 뉴스레터 폼 2개 → /api/newsletter DB 연결
- Mindle trends DB-first 전환 + 시드 12건
- SmarComm Coming Soon 게이트 제거
- 10:01 Vrief API (/api/agent/vrief)

### Phase 2-A: 구독 인프라
- 구독 CRUD 5개 함수 + hasAccess() 미들웨어 (wio.ts)
- /api/subscription, /api/subscription/access API

### Phase 3-A: Whole See 크롤러
- /api/crawler — RSS 소스 크롤 → collected_data 저장
- collected_data url unique 인덱스 추가

**결정사항:**
- WIO 2-Tier (규격+맞춤), Tech Flywheel, tenant_id vs brand_id 분리 확정
- SmarComm pricing: 대행 가격 vs SaaS 가격 별개 — 확정 필요
- Phase 0-C(중복 테이블 통합) 보류

**추가 작업:**
- 메신저 채널 시스템 (5개 에이전트 채널 + Vrief/크롤러 자동 게시)
- DB 전수 검토 보안 조치 6건 (RLS 9개, search_path 10개, DEFINER뷰, 중복인덱스, th_삭제)
- 에이전트 이름 AI Team v2 기준 정비 (9개 + 블루 신규)
- ANTHROPIC_API_KEY Vercel 설정 + Agent Hub 실전 가동
- fwn.co.kr Vercel 도메인 추가 (DNS 전파 대기)
- Leaked Password Protection 활성화

**커밋:** `bb82636`, `50dff98`, `722b26f`, `fb9358f`, `ba59412`, `82151eb`, `b0c9186`

---

## 2026-04-02 (사무실, 저녁 세션 5 — 작업 종료)

### 인트라 전체 PageHeader 일관성 적용 (100+ 페이지)

**수정 파일 (102개):**
- 인트라 전체 페이지에 `PageHeader` 컴포넌트 적용 (border-b-2 구분선 통일)
- myverse/*, project/*, partner-pool, opportunity, hero/*(8개), evolution-school
- wiki/*(7개), comm/*, universe/members/guests/privacy
- studio/*(12개), ERP 서브(29개), marketing(14개), bums 서브
- 각 페이지 외곽 `max-w-*` 제거 → 레이아웃 `max-w-[1200px]` 통일

**버그 수정:**
- `project/timesheet` — Rules of Hooks (useMemo 위치 수정) → 페이지 로딩 복구
- `myverse/messenger` — negative margin 제거 → 1200px 폭 통일
- `project/management/new` — 중복 import 제거 → 빌드 에러 해결

**커밋:** `be3cdb0` (102파일), `a96bc38` (max-w 6파일)
**배포:** Vercel prod 배포 완료

**결정사항:**
- 인트라 모든 페이지는 개별 max-w 금지, 레이아웃의 max-w-[1200px]만 사용
- PageHeader 구분선은 border-b-2 border-neutral-200 pb-4 mb-6 고정

---

## 2026-04-02 (사무실, 오후)

### A1: L1 site_configs DB 연동

**신규 파일:**
- `sql/site-configs-table.sql` — CREATE TABLE + features 컬럼 + 24개 사이트 시드
- `lib/supabase/site-configs.ts` — getSiteConfig, getSiteConfigServer(ISR 10분), getAllSiteConfigs, upsertSiteConfig
- `scripts/run-site-configs.js` — site_configs SQL 실행 스크립트
- `docs/TenOne_Universe_Architecture_v1.md` — 텐원 정리 통합 아키텍처 문서

**수정 파일:**
- `app/intra/bums/sites/page.tsx` — DB 연동 전면 리팩터. DB/static 하이브리드, 실 upsert 저장, 에러 표시, DB 배지
- `.env.local` — SUPABASE_ACCESS_TOKEN 갱신

**DB 변경:**
- `site_configs` 테이블 생성 (Prod Supabase) — 24개 사이트 입력 확인
- Korea360 반영 (site_id=seoul360, name=Korea360, domain=korea360.net)

**결정사항:**
- Korea360이 맞고 seoul360.net은 없다 (코드 site_id는 seoul360 유지, 향후 리네이밍)
- 아키텍처 문서 분석 완료 — 보완점 5가지는 다음 작업에서 논의

---

## 2026-04-02 (사무실, 오전)

### 버그 수정 6건 + 레이아웃 2건

**수정 파일:**
- `app/intra/project/jobs/page.tsx` — useState 5개를 early return 앞으로 이동 (Rules of Hooks 위반 → 크래시)
- `app/intra/project/timesheet/page.tsx` — useMemo를 loading return 앞으로 이동 (같은 위반)
- `app/intra/bums/promotion/page.tsx` — fetchPromos에 try/catch/finally 추가 (무한 스피너)
- `app/intra/partner-pool/page.tsx` — saveError state 추가, 모달에 오류 메시지 표시
- `lib/supabase/erp.ts` — createPartner brands 조회 실패 시 graceful fallback
- `app/intra/universe/members/page.tsx` — Lv5 배지 amber→rose (레전드 일치)
- `app/intra/layout.tsx` — max-w div에 w-full 추가, overflow-x-hidden
- `middleware.ts` — smarcomm.tenone.biz → /smarcomm 라우팅 추가

**커밋:** 18ba039, 999a9a5, 974d420

### 이전 세션 (4/2 새벽)
- IntraLayout race condition: TOKEN_REFRESHED/SIGNED_IN에서 JWT is_staff 재확인
- LoginModal: SIGNED_IN 이벤트 즉시 닫기
- 로그인 버튼 아이콘 제거, UniverseUtilityBar 한국어
- Mindle 전 페이지(9개) 한국어 전환

**커밋:** 509dc34, f7c934c

### 아키텍처 문서
- `docs/Intra_Universe_Architecture.md` 신규 — 인트라↔유니버스 6계층 연결 설계

**결정사항:**
- 인트라↔유니버스 연결은 6계층 모델 (L1설정~L6에이전트)
- L1 site_configs 연동이 최우선 (공수 최소 + 영향력 최대)
- Vercel 자동 배포 확인 (deploy.js 불필요)

---

## 2026-04-01 (집)

### 인트라 stub 3페이지 완성

- bums/stats: Supabase posts 집계, 사이트별 bar chart
- bums/promotion: promotions CRUD, 할인코드 복사
- bums/shop: 상품/주문 탭, shop_products/shop_orders 연결
- supabase/migrations/007_shop_promotions.sql 신규

---

## 2026-04-01 (오후 — 사무실 6차)

### Intra DB 현실화 — Marketing/ERP/Workflow 26개 페이지 Supabase 전환

**수정 파일:**
- `app/intra/marketing/organizations/page.tsx` — fetchOrganizations() + mock fallback
- `app/intra/marketing/deals/page.tsx` — fetchDeals() + updateDeal() + fetchOrganizations()
- `app/intra/marketing/activities/page.tsx` — Promise.all([fetchActivities, fetchPeople, fetchOrganizations])
- `app/intra/marketing/crm/segments/page.tsx` — fetchPeople({limit:500}) for segment counts
- `app/intra/marketing/campaigns/page.tsx` — fetchCampaigns() + mock fallback
- `app/intra/marketing/leads/page.tsx` — fetchLeads() + updateLead()
- `app/intra/marketing/content/page.tsx` — fetchContentPosts() + mock fallback
- `app/intra/marketing/analytics/page.tsx` — Promise.all([fetchCampaigns, fetchLeads, fetchContentPosts])
- `app/intra/marketing/page.tsx` — Promise.all for dashboard stats
- `app/intra/erp/page.tsx` — fetchStaffMembers() + fetchGprGoalsTyped()
- `app/intra/erp/hr/gpr/page.tsx` — fetchStaffMembers() + fetchGprGoalsTyped()
- `app/intra/erp/hr/gpr/goals/page.tsx` — DB fetch + createGprGoal()
- `app/intra/erp/hr/gpr/evaluation/page.tsx` — DB fetch + local state eval
- `app/intra/erp/hr/staff/[id]/page.tsx` — fetchStaffMembers() + fetchGprGoalsTyped({memberId})
- `app/intra/erp/hr/staff/register/page.tsx` — mock useStaff 제거, DB-only
- `app/intra/erp/hr/talent/page.tsx` — talent_pool 테이블 fetch + mock fallback
- `app/intra/erp/hr/talent/pipeline/page.tsx` — talent_candidates 테이블 fetch + mock fallback
- `app/intra/erp/hr/talent/programs/page.tsx` — talent_programs 테이블 fetch + mock fallback
- `app/intra/erp/hr/people/clubs/page.tsx` — madleague_clubs 테이블 fetch + mock fallback
- `app/intra/erp/hr/people/delegation/page.tsx` — delegations 테이블 fetch + mock fallback
- `app/intra/erp/hr/family/page.tsx` — family_members 테이블 fetch + mock fallback
- `app/intra/studio/workflow/page.tsx` — 4개 테이블 Promise.all fetch
- `app/intra/studio/workflow/kanban/page.tsx` — fetchWorkflowTasks() + DB persistence mutations
- `app/intra/studio/workflow/pipeline/page.tsx` — fetchPipelineItems() + updatePipelineStage()
- `app/intra/studio/workflow/projects/page.tsx` — fetchBrandProjects()
- `app/intra/studio/workflow/automation/page.tsx` — fetchAutomations() + toggleAutomationEnabled()
- `lib/supabase/erp.ts` — rowToStaffMember, fetchStaffMembers, rowToGprGoal, fetchGprGoalsTyped 추가
- `lib/supabase/workflow.ts` — **신규 생성** (4개 테이블 CRUD 함수)
- `sql/workflow-tables.sql` — **신규 생성** (workflow_tasks, content_pipeline, workflow_automations)
- `sql/badaksoe-rooms-table.sql` — **신규 생성**
- `sql/partner-pool-table.sql` — tenant_id INSERT 오류 수정

**커밋:** `74a1d81` feat: Intra DB 현실화 — Marketing/ERP/Workflow 26개 페이지 Supabase 전환

---

## 2026-04-01 (오후 — 사무실 4차)

### 인트라 biz/manage DB 연결 + 표준단가 저장 기능

**수정 파일:**
- `app/intra/erp/biz/manage/page.tsx` — fetchMonthlyForecasts() → 월별 추정 DB 연동
- `app/intra/erp/biz/manage/actual/page.tsx` — fetchMonthlyForecasts() → 실적 확정 DB 연동
- `app/intra/erp/biz/manage/gap/page.tsx` — fetchMonthlyForecasts() → Gap 분석 DB 연동
- `app/intra/erp/project/rates/page.tsx` — fetchStandardRates() + upsertStandardRate() → 표준단가 편집 저장
- `lib/supabase/erp.ts` — 4개 함수 신규 추가
- `sql/monthly-forecasts-table.sql` — 신규 (year/month/item 기반 P&L 추정/실적)
- `sql/standard-rates-table.sql` — 신규 (직급별 표준단가 + 기본 시드)

**커밋:**
- `6a3a10a` feat: biz/manage 3개 페이지 DB 연결 + monthly_forecasts SQL
- `8265ce1` feat: 투입인원단가 표준단가 DB 저장 기능 추가

---

## 2026-04-01 (오후 — 사무실 3차)

### 인트라 추가 DB 현실화 (3개 페이지 + 2개 함수)

**수정 파일:**
- `app/intra/opportunity/page.tsx` — fetchTenOneOpportunities() → 영업 기회 파이프라인 DB 연결
- `app/intra/erp/hr/certificates/page.tsx` — approvals(type=certificate) → 제증명서 발급 이력 DB 연결
- `app/intra/myverse/todo/page.tsx` — fetchTenOneMembership() + fetchTodos() → wio_todos DB 연결
- `lib/supabase/wio.ts` — fetchTenOneOpportunities(), fetchTenOneMembership() 신규 추가

**커밋:**
- `a097536` feat: Opportunity + 제증명서 페이지 DB 연결
- `8e044bb` feat: myverse/todo — wio_todos DB 연결 + fetchTenOneMembership() 추가

---

## 2026-04-01 (오후 — 사무실 2차)

### 인트라 추가 DB 현실화 (5개 페이지 + 2개 함수)

**수정 파일:**
- `app/intra/erp/biz/analysis/division/page.tsx` — fetchBizPlans() → 부문 이익률, buildDivisionData()로 전분기 trend 계산
- `app/intra/erp/biz/analysis/cost/page.tsx` — fetchExpenses() → 외부비/내부비 구성, 월별 비용 추이
- `app/intra/erp/biz/analysis/page.tsx` — fetchProjects() → YTD 실적 요약 카드
- `app/intra/project/management/jobs/page.tsx` — fetchAllJobs() → Job 목록 실DB 연동
- `app/intra/erp/project/rates/page.tsx` — fetchPayrollWithMembers() → 실제단가 탭 실DB 연동
- `lib/supabase/projects.ts` — fetchAllJobs() 신규 추가 (projects JOIN)
- `lib/supabase/erp.ts` — fetchPayrollWithMembers() 신규 추가 (payroll + members JOIN)

**커밋:**
- `d05e74f` feat: biz/analysis 3개 페이지 DB 연결
- `ca53090` feat: Job 관리 페이지 DB 연결 + fetchAllJobs() 추가
- `a8d3a90` feat: 투입인원단가 페이지 — fetchPayrollWithMembers DB 연결

---

## 2026-04-01 (오전 — 사무실 1차)

### 인트라 ERP 전체 페이지 DB 현실화

**수정 파일:**
- `middleware.ts` — getUser() → getSession() (cold start 블로킹 해결)
- `app/intra/layout.tsx` — 타임아웃 8s, cold start 경고 3s 타이머
- `components/IntraHeader.tsx`, `smarcomm/dashboard/layout.tsx` — 로그아웃 → 홈 랜딩
- `components/newsroom/NewsroomFeed.tsx` — FWN 스타일 리디자인
- `components/newsroom/NewsTicker.tsx` — FLASH 배지, 테두리 수정
- `app/(TenOne)/newsroom/page.tsx`, `history/page.tsx`, `brands/page.tsx` — max-w 통일
- `app/(TrendHunter)/trendhunter/**` — 11개 → Mindle 리다이렉트
- `components/board/BoardWidget.tsx` — 신규 퍼블릭 위젯 컴포넌트
- `app/(Badak)/badak/page.tsx` — BoardWidget 삽입
- `app/intra/erp/approval/progress/page.tsx` — fetchApprovals() 연동
- `app/intra/erp/approval/completed/page.tsx` — fetchApprovals() 연동
- `app/intra/erp/finance/expenses/request/page.tsx` — fetchExpenses() 연동
- `app/intra/erp/biz/plan/page.tsx` — fetchBizPlans() 연동
- `app/intra/erp/finance/reports/page.tsx` — fetchExpenses() + getProjectStats() 연동
- `app/intra/erp/finance/card/page.tsx` — fetchCardUsage() 연동
- `app/intra/erp/finance/billing/page.tsx` — fetchInvoices() 연동
- `app/intra/erp/finance/billing/payment/page.tsx` — fetchPayments() 연동
- `app/intra/erp/hr/gpr/rewards/page.tsx` — fetchIncentives() 연동
- `app/intra/project/management/[code]/page.tsx` — fetchProjectByCode+fetchJobs+fetchProjectMembers 연동
- `lib/supabase/erp.ts` — invoices, card_usage, payments, incentives 함수 추가

**결정 사항:**
- 모든 페이지 패턴: DB 우선 시도 → 실패/빈 응답 시 mock fallback
- Supabase에 신규 테이블(invoices, payments, card_usage, incentives) 생성 필요 (현재 mock fallback 중)

---

## 2026-03-31 (사무실, 2차)

### localStorage → Supabase DB 마이그레이션 완료

**수정 파일:**
- `lib/supabase/settings.ts` — member_id/settings JSONB 스키마 전면 재작성 (기존 user_id/app/key/value → 중첩 JSONB). getAppSettings/setAppSettings 추가
- `lib/wio-modules.ts` — loadOrbiConfigDB / saveOrbiConfigDB / loadAccordionStateDB / saveAccordionStateDB 4개 async DB 함수 추가
- `app/(WIO)/wio/app/layout.tsx` — orbi config + accordion 상태 DB-first 로드
- `app/(WIO)/wio/app/settings/page.tsx` — 저장 시 saveOrbiConfigDB 호출
- `lib/library-context.tsx` — bookmarks/user_items mount 시 DB 로드, 변경 시 DB + localStorage 동시 저장 (mounted ref로 초기 로드 중 저장 방지)
- `lib/smarcomm/chart-palette.ts` — loadChartPaletteFromDB() 추가, setChartPalette()이 DB에도 저장
- `lib/smarcomm/scan-data.ts` — competitors/compare_log DB 헬퍼 (saveCompetitorList, loadCompetitorListFromDB, saveCompareLog, loadCompareLogFromDB) 추가
- `app/(SmarComm)/smarcomm/dashboard/scan/page.tsx` — mount 시 DB에서 경쟁사·비교이력 로드, company 설정 getSetting으로 조회
- `app/(SmarComm)/smarcomm/dashboard/glossary/page.tsx` — custom_glossary DB 연동
- `app/(SmarComm)/smarcomm/dashboard/profile/page.tsx` — company 설정 DB 저장/로드

**결정사항:**
- 모든 사용자 설정: `user_settings` 테이블 단일 행, `{ [app]: { [key]: value } }` 중첩 JSONB
- localStorage는 오프라인 fallback으로 유지
- 빌드 2회 성공 (exit code 0), TypeScript 오류 없음

---

## 2026-03-30 (사무실, 야간 퇴근 전)

### Myverse 개발 전략 검토
- Myverse_Dev_Guide_v3_final.md (v3) 전체 분석
- 결정사항:
  - 별도 레포 분리 개발 (React Native Expo + 별도 Supabase)
  - 웹은 소개/랜딩만, 모든 기능은 앱
  - 공유 URL 짧게 (my.tenone.biz/s/{id} 방향)
  - Mac 구매 검토 (iOS 네이티브 빌드 필요)
- TenOne 인증 시스템 전체 분석 — 현재 안정화됨 확인
  - GoTrueClient 싱글톤 통합(11976ed) 이후 문제 없음
  - Myverse는 별도 Supabase라 TenOne 인증과 무관

---

## 2026-03-30 (사무실, 오전~오후)

### WIO Glossary v1 → 7계층 체계 정렬
- types/wio.ts: WIO_SERVICES 16개, WIOPreset 타입
- lib/wio-modules.ts: SERVICE_CATALOG, 모듈별 service 필드, 프리셋, 헬퍼
- layout.tsx: 사이드바 Track→모듈 → 서비스→모듈 전면 교체
- settings: 서비스 모드 탭 (프리셋 선택 + 서비스 토글)

### COM-AI → Agent Hub 실연결
- comm/ai/page.tsx: Mock → POST /api/agent/hub (Claude API)

### SYS-USR 사용자 관리 실DB
- system/users/page.tsx: wio_members CRUD (역할 변경, 초대, 활성/비활성)

### 프로젝트 타임라인 피드
- project/[id]/page.tsx: SNS형 피드 탭 (글쓰기, 좋아요, 댓글, 시스템 알림)

### COM-WCL + MY-HR 실DB
- work-calendar: wio_jobs 연동
- my/hr: wio_members 프로필 연동

### TenOne 게시판 수정 기능
- api/board/posts/[id]: PATCH 핸들러 추가
- PostDetail: 수정 버튼 (로그인 사용자)
- BoardPage: onEdit 전달

### TenOne 뉴스룸 재설계
- newsroom/page.tsx: 유니버스 콘텐츠 허브 (BoardPage → Aggregator)
- NewsTicker: LIVE 티커 바 (브랜드별 제목 스크롤)
- NewsroomFeed: 카드 그리드 (브랜드 필터 + 최신/인기)
- api/newsroom/feed: 전 사이트 게시글 조회 API
- brand-meta.ts: SiteCode → 브랜드 메타 매핑
- page.tsx(홈): "새로운 소식" 뉴스룸 API 통일

### Contact 관리자 + 정리
- inquiry/page.tsx: Coming Soon → 풀 CRUD
- contact/page.tsx: 회원가입 탭 제거

### MyVerse 랜딩 페이지
- myverse/page.tsx: 기획서 v2 기반 전면 재작성 (7섹션)
- docs: Myverse 기획서 3개 저장

### 변경 파일 (27개)
- 수정 20개 + 신규 7개 (newsroom API/컴포넌트, brand-meta, docs 4개)
- +1,834줄 / -741줄

---

## 2026-03-29~30 (집)

### WIO EUS v2.0
- docs/WIO_EUS_v2.md 전체 반영 (Part VIII 고도화 10섹션)
- 모듈 카탈로그 ~120개 확장, 카테고리 9→EUS 7트랙 기반
- 3계층 워크플로우 (전사/부서/개인 도구)

### WIO Orbi 모듈 대규모 확장
- 124+ 페이지 (Sprint 1~6: MY5 + RBAC4 + 영업7 + HR5 + BI4 + 지주사3)
- 46/120 모듈 Supabase 실DB 연동
- DB 39개 신규 테이블 (총 90+)

### 핵심 엔진
- lib/rbac.ts (6단계 권한 + 사이드바 미들웨어)
- lib/workflow-engine.ts (실행/SLA/인스턴스)
- lib/culture-engine.ts (가치정합/건강도)

### 설정 페이지 재구성
- 4탭: 세팅(3모드) | 권한 | 테마 | 시스템
- OrgTreeBuilder 컴포넌트 (1,252줄, Supabase CRUD)

### 조직도 + 인력 배치
- DB 6테이블 + docs/WIO_OrgDesign_v1.md
- HR-ORG 4탭 (조직도3뷰 + 정원 + 발령 + 이력)

### Part VIII 신규 페이지
- AI매트릭스, E2E흐름도, SaaS과금, 업종프리셋, 마이그레이션

### COM-WCL 업무 캘린더
- 4뷰×4범위 + ★상향 집계

### 브랜드 사이트 (12개 브랜드 고도화)
- MADLeap(5p), MADLeague(5p), Badak(모임+커뮤니티), Planners(전면)
- HeRo, RooK, ChangeUp, 0gamja, Mindle, domo, FWN, YouInOne

### 인프라
- 인트라 로그인 근본 해결 (sessionStorage + 타임아웃)
- Agent Hub + 7 에이전트 (Claude 실응답)
- 인트라 유니버스 대시보드 실DB (8p)
- 외부 API (Google Calendar + Kakao + Slack)
- 모바일 + SEO + sitemap
- board_configs 25개 (6사이트)
- Myverse 7탭 Supabase 연동
- Vercel 배포 10+회

---

## 2026-03-28 (집)

### About 페이지
- PublicHeader + 7개 브랜드 헤더에서 About 네비 중복 제거
- Brands 탭 → 역할 기반 7그룹 구조 + Synergy Flows 교체

### 홈페이지
- Universe 브랜드 쇼케이스 + Latest fallback 추가
- Works 위젯 represent_image → representImage 필드명 수정

### WIO 게시판 모듈 (대규모)
- 대표 이미지 자동 추출 (extractFirstImage)
- 에디터 이미지 paste/drop → Storage 업로드 (base64 제거)
- /api/board/migrate-images 마이그레이션 API
- 좋아요/북마크 userId 전송 + 비로그인 토스트
- 게시글 고유 URL (?postId=)
- 5개 board 컴포넌트 tn-* 테마 변수 적용
- PostDetail 본문 레이아웃 개선 (prose + 대표이미지)
- docs/WIO_Board_Guide.md 작성

### Works 게시물
- Google Sites History → 20개 게시물 (본문+이미지+날짜)
- 18개 대표 이미지 (Supabase Storage + OG 이미지)

### SmarComm 랜딩
- 소셜 프루프 + 신뢰 지표(Trust) 섹션 추가

### 프로필
- 비밀번호 확인 제거, 뉴스레터 숨김, 북마크 목록 UI

### DB
- posts UPDATE RLS 정책 완화

### 변경 파일 (주요)
- app/page.tsx, app/(TenOne)/about/page.tsx
- components/board/*.tsx (5개 전부)
- components/PublicHeader.tsx + 7개 브랜드 Header
- components/UniverseUtilityBar.tsx
- lib/supabase/board.ts
- app/api/board/migrate-images/route.ts (신규)
- app/(SmarComm)/smarcomm/page.tsx
- app/(TenOne)/profile/page.tsx
- docs/WIO_Board_Guide.md (신규)

---

## 2026-03-27 (사무실)

### DB
- Supabase SQL Editor에서 001_brands_and_profiles.sql 실행 (brands 23개 + profiles + RLS)
- Supabase SQL Editor에서 002_talk_comments_likes.sql 실행 (wio_comments/likes/bookmarks + RLS)

### 파일 변경
- `app/(TenOne)/universe/page.tsx` — 통계 섹션, 12개 브랜드, Coming Soon, WIO CTA
- `app/(Mindle)/mindle/my/page.tsx` — 활동 통계 카드 4개
- `app/(Mindle)/mindle/trends/[id]/page.tsx` — 태그, 반응 바
- `lib/data.ts` — 브랜드 10→22개 확장
- `types/brand.ts` — 카테고리 타입 6개 추가
- `app/(TenOne)/brands/page.tsx` — 카테고리 필터 업데이트
- `app/(WIO)/wio/app/layout.tsx` — 모바일 반응형 사이드바 (햄버거 토글, 오버레이)
- `app/(BrandGravity)/brandgravity/page.tsx` — 신규 생성
- `app/(NamingFactory)/namingfactory/page.tsx` — 신규 생성
- `app/(EvoSchool)/evschool/page.tsx` — 신규 생성
- `app/(WIO)/wio/page.tsx` — Getting Started + 자체 도구 섹션 추가
- `app/login/page.tsx` — "MAD League" → "Ten:One™ Universe" 수정
- TypeScript 에러 72개 → 0개 수정 (20+ 파일)

### 결정사항
- 풀링포레스트(pooolingforest.com) 디자인 참고 → WIO/SmarComm 랜딩에 반영
- 프로세스 단계에 고객/WIO 역할 구분 스타일 채택
- 자체 도구 소개 섹션 (W-Board, W-Insight, W-Shield) 추가

---

## 2026-03-27 (집) — WIO 전 모듈 고도화 + 인프라 대수술

### 문서
- WIO_Master_Architecture.md (19 PART 완전 설계서, 단일 진실 소스)
- 기존 WIO 문서 6개 통합 삭제
- REVENUE_MODEL.md (10개 서비스 독립 수익 모델)
- 가격 확정: Free→Starter(4.9만)→Pro(14.9만)→Business(39.9만)→Enterprise

### 인프라
- window.location.reload() 11개 파일 제거 → router.push
- /reset-password 비밀번호 재설정 플로우
- 크로스탭 세션 동기화 (storage event)
- 헤더 isLoading 타이밍 수정
- Supabase brands 테이블 + profiles + RLS + 23개 브랜드
- middleware Supabase 세션 갱신 (Google 로그인 유지 해결)
- LoginModal createPortal(document.body) — stacking context 탈출

### WIO 모듈 (11개)
- Home: 스켈레톤, Principle, 빠른 액션, 데모 모드
- Talk: 상세+댓글2depth+좋아요+북마크+검색, DB 마이그레이션(002)
- People: 상세 프로필, 역할 필터, 초대
- Project: Job 추가/토글
- GPR: 신규 모듈 (Goal→Plan→Result)
- Learn: 카테고리 필터, 검색, 통계
- Finance: 스켈레톤, 빈 상태
- Insight: 드릴다운, 스택바 차트
- Sales/Wiki/Content: 빈 상태 가이드 통일

### UI 통일
- UniverseUtilityBar 23개 헤더 전체 적용 (WIO, SmarComm, TenOne 포함)
- 푸터 통일 (언더라인 제거, 중복 정리)
- 통합 로그인 페이지 (SmarComm→TenOne Universe)
- WIO 데모 모드 (비로그인 체험)

### 파일 변경 (주요)
- components/UniverseUtilityBar.tsx — loginPath, isLoading 제거
- components/LoginModal.tsx — createPortal, SSR guard
- components/PublicHeader.tsx — UniverseUtilityBar 적용
- components/SmarCommHeader.tsx — UniverseUtilityBar 적용
- components/WIOMarketingHeader.tsx — UniverseUtilityBar 적용
- middleware.ts — Supabase 세션 갱신
- app/login/page.tsx — TenOne Universe 브랜딩 + redirect
- app/reset-password/page.tsx — 신규
- app/(WIO)/wio/app/gpr/page.tsx — 신규
- app/(WIO)/wio/app/talk/[id]/page.tsx — 신규
- app/(WIO)/wio/app/people/[id]/page.tsx — 신규
- lib/auth-context.tsx — resetPassword, updatePassword, 크로스탭
- lib/supabase/brands.ts — 신규
- supabase/migrations/001_brands_and_profiles.sql — 신규
- supabase/migrations/002_talk_comments_likes.sql — 신규
- docs/WIO_Master_Architecture.md — 신규 (단일 진실 소스)

---

## 2026-03-26 (집) — 대규모 고도화

### Mindle 고도화
- vercel.json cron 자동화 (매시간 RSS 크롤러)
- RSS 피드 Indie Hackers→Ars Technica, Morning Brew→Wired 교체
- Newsletter 페이지 (/mindle/newsletter) + 헤더 1줄 정리
- Admin: 검색/필터 + Run Crawl Now + Run AI Analysis 버튼
- 콘텐츠 파이프라인 API (/api/trendhunter/analyze) — rule-based 분석, 3종 초안 자동생성
- Collect API 배치 모드 (items[] 배열)

### 크롤러 확장 3종
- bots/discord/ — discord.js 봇 (채널별 토픽, 배치 전송)
- bots/web-crawler/ — Puppeteer (네이버 블로그/카페)
- bots/badaksoe/ — 메신저봇R (카카오 오픈채팅)

### WIO 고도화
- 사이드바 기본 모듈 3개→10개 확장 (timesheet 포함)
- /wio/contact 상담 신청 페이지 생성
- 마케팅 3페이지 CTA /contact→/wio/contact 수정
- /wio/app/project/[id] 프로젝트 상세 페이지 (개요/업무/인원 탭)

### 인증 세션 끊김 수정
- Supabase 클라이언트 싱글톤화 (lib/supabase/client.ts)
- 세션 만료 시 stale localStorage 정리
- TOKEN_REFRESHED 이벤트 처리
- syncUserFromSession() 공통 함수

### 인트라 Marketing DB 연결
- supabase/marketing-tables.sql (4테이블 + RLS + 인덱스)
- lib/supabase/marketing.ts (Campaign/Lead/Content CRUD)
- marketing-context.tsx DB우선 + Mock fallback 패턴

### TenOne 퍼블릭 고도화
- /universe 인터랙티브 구조도 (Hub→OS→사업 포트폴리오 + 시너지 체인)
- 한/영 UI 통일 (Logout→로그아웃, Login→로그인, →]→Intra)
- /privacy 개인정보처리방침 + /terms 이용약관 생성
- 푸터 Privacy/Terms 링크 활성화
- /brands 다크 테마 적용
- About > Universe Structure 독립 링크
- 홈 히어로 이미지 fallback + API fetch 에러 핸들링

### 문서화
- SITE_ANALYSIS.md 전체 사이트 종합 분석 (5개 사이트, CRITICAL 8건)
- CLAUDE.md 규칙 추가 (작업종료 묻지않기, 톤앤매너 준수)

### 결정 사항
- 개발 우선순위: TenOne(허브) → WIO+YIO(OS) → 수익사업 → 나머지
- TenOne 다크 테마 CSS 변수 (`--tn-*`) 모든 페이지 통일
- 크롤러 확장: RSS(완료) → Discord → Web → 바닥쇠 순서
- WIO Settings CRUD는 다음 세션 (Supabase UPDATE 필요)

---

## 2026-03-26 (사무실 #2) — 약 15커밋

### Mindle(민들레) 사이트 완성
- TrendHunter → Mindle 리브랜딩 + 전 페이지 영문 전환 (8페이지)
- 2단 헤더: 상단 유틸리티(ABOUT/LOGIN/Share/Search) + 하단 네비
- 신문 레이아웃: Featured Article + TODAY'S PICKS + Hot Keywords + 30개 랜덤 카피
- Trends: 리스트/그리드 뷰 전환 + 카테고리 필터 + Featured
- Reports: 주간 타임라인 + LATEST/PREMIUM 뱃지
- Data: 키워드 랭킹 테이블 + 기간 필터(24H/7D/30D/90D) + 수집 소스 + Biggest Movers
- References: Editor's Picks + 12개 소스 + 태그
- Admin: Supabase 실데이터 연결 + 이메일 기반 관리자 권한

### Mindle DB + RSS 크롤러
- Supabase 9개 테이블 생성 + RLS 정책 설정
- RSS 자동 수집 크롤러: /api/trendhunter/rss (8개 피드, 첫 실행 30건 수집 성공)
- crawler_status 4건 + collected_data 시드 데이터

### 인증 최종 해결
- Supabase에 `https://*.tenone.biz/auth/callback` 와일드카드 등록 → 전 서브도메인 소셜 로그인 해결
- isSubdomain race condition fix (useState null 초기값)

### WIO Timesheet 모듈
- 주간 시수 그리드 + AI Auto-Fill 버튼 + Submit/Approve 워크플로우 → 8대 모듈 완성

### 서브도메인 인프라
- 가비아 CNAME 8개 + Vercel 도메인 9개 (mindle 포함)
- middleware: mindle.tenone.biz, wio.tenone.biz, seoul360.tenone.biz 매핑

### 결정 사항
- Mindle = 영문 사이트 (크롬 번역으로 한국어 대응)
- 크롤러 우선순위: RSS(무료) → 디스코드(무료) → 웹(월$10) → 바닥쇠(공기계)
- 서브도메인 SSO: .tenone.biz 쿠키 공유 가능 (Google 방식)

---

## 2026-03-26 (사무실) — 8커밋

### TrendHunter 사이트 구축
- 14개 페이지 생성 (홈/About/Reports/Insights/Services/My/Weekly/Signals/References/Opportunities/Dashboard)
- 로고 PDF 반영 (T빨강/r노랑/e연두/n하늘/d초록 + Hunter흰색)
- DB 스키마 9개 테이블 (supabase/trendhunter-tables.sql)
- API 3개 (/collect, /respond, /stats)
- 기술설계서 + WIO 계획서 docs/ 복사

### 인증 시스템 전면 개편
- SmarComm sessionStorage Mock 제거 → useAuth() 단일 경로 통일 (13개 파일)
- auth-hub 크로스도메인 토큰 전송 폐기 → 도메인별 직접 Supabase OAuth
- searchParams 크래시 버그 수정, 로그아웃 쿠키 강제 제거
- SmarComm 리다이렉트 루프 수정, 서브도메인 리다이렉트 수정

### LoginModal 팝업 로그인
- LoginModal 공통 컴포넌트 + 전 브랜드 20개 헤더 적용

### 서브도메인 인프라
- 가비아 DNS 8개 + mindle CNAME 등록
- Vercel 프로젝트 도메인 9개 등록
- Supabase Redirect URL 19개 등록

### 결정 사항
- 인증: 도메인별 독립 로그인 (Option A). 쿠키는 도메인 격리, SSO는 나중에
- 로그인 UX: 페이지 이동 → 팝업 모달로 전환
- TrendHunter → Mindle(민들레) 리브랜딩 결정 (도메인: mindle.tenone.biz)
- 참고사이트: trendhunter.com, some.co.kr, careet.net, trendmonitor.co.kr

---

## 2026-03-26 (집) — 31커밋

### SmarComm
- 로그인/가입 도메인 분기, 리다이렉트 루프, 직접 OAuth, 세션 유지
- 다중 페이지 크롤링, 36가지 브랜드 유형, 퍼포먼스 UI
- **미해결**: 소셜 로그인 텐원 넘어감, 리프레시 세션 유실

### Badak MVP
- DB 4개 + CRUD + 6개 페이지 전체 구축
- badak.biz는 기존 서버 운영 중, 개발만

### WIO 솔루션 (Sprint 1~5 전체)
- 마케팅 사이트 5페이지 (랜덤 카피 5종)
- **24개 DB 테이블** Supabase 생성
- **10개 모듈** 앱 UI: Home, Project, Talk, Finance, People, Sales, Learn, Content, Wiki, Insight
- 파일: app/(WIO)/, types/wio.ts, lib/supabase/wio.ts, lib/wio-app-data.ts

### TenOne Universe
- About 페이지 탭 4개: Philosophy/Universe/Brands/History
- Brands 탭에 7카테고리 33개 브랜드 디렉토리 추가
- docs/TenOne_Universe_Directory.html 원본 보관

### 결정 사항
- WIO는 텐원 회원 시스템 공유, 솔루션 DB는 별도 (wio_ 프리픽스)
- 멀티도메인 로그인: 도메인별 직접 OAuth 방식 채택 (auth-hub 경유 제거)
- Universe=세계관설명, Brands=브랜드디렉토리로 분리

---

## 2026-03-25 (집)

### 완료
- Ten:One™ 통합 게시판 Phase 2: 공용 UI 컴포넌트 6개 생성 (`components/board/`)
  - BoardPage, BoardList, PostCard, PostListItem, PostDetail, CommentSection
- RooK 게시판 페이지를 새 컴포넌트로 교체 (Mock → API 연결)
- 아키텍처 결정: BUMS 버리고 board-system으로 통일
- 유니버스 세계관 정립: "각 사이트는 자기 행성에서 완결, 우주는 뒤에서 돌아간다"

### 생성된 파일
- `components/board/BoardPage.tsx` — 사이트별 게시판 래퍼 (설정 로드, 목록↔상세 전환)
- `components/board/BoardList.tsx` — 목록 (카드/리스트 뷰, 카테고리 탭, 검색, 정렬, 페이지네이션)
- `components/board/PostCard.tsx` — 카드형 아이템
- `components/board/PostListItem.tsx` — 리스트형 아이템
- `components/board/PostDetail.tsx` — 상세 (좋아요/북마크/공유, 첨부, 태그, 이전/다음글, 댓글)
- `components/board/CommentSection.tsx` — 댓글 (대댓글, 비회원, 좋아요)
- `components/board/index.ts` — barrel export

### 수정된 파일
- `app/(RooK)/rk/board/page.tsx` — Mock 하드코딩 → BoardPage 컴포넌트

### 결정 사항
- BUMS(복잡한 CMS) 폐기, board-system(심플) 통일
- 기존 Phase 1(DB+타입+API) 80% 재사용
- 사용법: `<BoardPage site="madleague" board="news" accentColor="#D32F2F" />` 한 줄
- 유니버스 철학: 소비자는 자기 서비스만 알면 됨 → 나중에 전체 발견

---

## 2026-03-24 (사무실)

### 완료
- 전체 모듈 DB 연결 Phase 0~9 (BUMS, 회원, Myverse, Townity, Project, Evolution, HeRo, Wiki, ERP, Vridge)
- Supabase CRUD 레이어 8개 생성 (bums, members, townity, projects, education, hero, wiki, erp)
- 회원 체계 v2: alliance/madleaguer 추가, junior-partner 삭제, roles[]/module_access[] 도입
- members 테이블 v2 마이그레이션 (primary_type, roles, affiliations, intra_access, module_access)
- HeRo DB 테이블 신규: hit_results, career_profiles, resumes
- ARCHITECTURE.md + ROADMAP_IMPLEMENTATION.md 작성
- Vridge 명칭 확정, ERP 모듈화 (erp-hr/people/finance/sales)
- TenOne Works: Google Sites history → DB 13개 게시글
- BUMS: 내용보기 모달, 체크박스 벌크삭제, 페이지네이션, 수정/삭제 분리
- 에디터: 이미지 붙여넣기/드래그앤드롭, 태그/대표이미지 위치 개선, SEO 접기
- 다크모드: PublicHeader + Works/Contact/About/Newsroom 전면 CSS 변수 전환
- 빌드 에러 수정 (SmarComm import, report-data)
- BUMS 404 해결 (6개 placeholder 페이지)
- BUMS 디자인 모던화
- 홈페이지 Mock 제거 → DB only

### 결정 사항
- Vridge = GPR & Vrief 통합 명칭
- ERP 모듈: erp-hr, erp-people, erp-finance, erp-sales
- 회원 유형: staff/partner/alliance/madleaguer/crew/member (junior-partner 삭제)
- 모든 모듈: DB 우선 + Mock fallback 전략

### 이슈
- 게시물 수정 후 사이트로 리다이렉트 (관리 페이지로 돌아가야 함)
- 게시물 관리 vs 콘텐츠 관리 역할 혼란

---

## 2026-03-23 (사무실)

### 완료
- 신규 사이트 대량 생성: 0gamja(WP반영), FWN, Seoul/360°, 문래지앙, MoNTZ, Badak, HeRo, Domo, JAKKA, Trend Hunter, My Universe, 타우니티, 자연함 등 → 총 19개 사이트
- 전용 인증 도메인 auth.tenone.biz 구현 (AES-256-GCM 토큰 암호화, Vercel+DNS+Supabase 설정)
- CMS → BUMS 전체 리네임 (DB+코드+UI)
- BUMS Tier 1: Tiptap 에디터, 게시글 CRUD, 사이트 브랜딩 관리, 위젯 관리, 콘텐츠 API, 권한 모델
- BUMS 목차 완성: 14개 메뉴 (대시보드~라이브러리), 고객관리 4탭, 게시판관리 3탭
- Supabase bums_* 테이블 6개 + ENUM 10개 + RLS 생성
- 인트라 디자인 통일 (max-w, shadow제거, bg-white)
- 일일 격언 365개 시스템
- TenOne 퍼블릭 다크/라이트 모드 (기본 블랙, 랜덤 전환 효과)
- 3D 포탈 아이콘 + 입체 아바타/토글
- 팅커벨 포탈 효과 (StarfieldPortal)
- 헤더 UI: 아바타 드롭다운+포탈+토글 / 인트라 TEN:ONE™ 로고

### 생성된 파일 (주요)
- `lib/auth-transfer.ts`, `lib/theme-context.tsx`, `lib/bums-permissions.ts`, `lib/daily-quotes.ts`
- `app/auth-hub/login/route.ts`, `app/auth-hub/callback/route.ts`, `app/auth/session/route.ts`
- `app/api/bums/posts/route.ts`, `app/api/bums/post/[postId]/route.ts`, `app/api/bums/boards/route.ts`
- `components/bums/RichEditor.tsx`, `components/bums/ImageUploader.tsx`
- `components/ThemeToggle.tsx`, `components/TenOneThemeWrapper.tsx`, `components/StarfieldPortal.tsx`
- `components/icons/PortalIcon.tsx`
- `app/intra/bums/` 전체 (boards, customers, content, dashboard, settings, widgets)
- `supabase/bums-tables.sql`
- 19개 사이트 폴더 + 헤더/푸터 컴포넌트

### 결정 사항
- CMS → BUMS (Business Unit Management System)
- TenOne 퍼블릭 기본 테마: 블랙
- 인트라 로고: TEN:ONE™
- 포탈 아이콘: 3D 큐브 + 화살표 (enter/exit)
- 인트라 진출입: 아바타 드롭다운(Logout 포함) + 포탈 아이콘

---

## 2026-03-23 (집, 2차)

### 완료
- SmarComm 대시보드 모바일 반응형 (아이콘 사이드바 56px + 오버레이 확장)
- 반응형 브레이크포인트 md→lg(1024px) 변경
- 우측 패널(RightPanel) 신규 — TODO, 블로그, 가이드, 팀 채팅
- 스캔 페이지 반응형 (URL입력/게이지/비교/테이블)
- LineChart clipPath overflow 수정
- 요금제 5단계 (Free ₩0 ~ Ultra ₩990,000) + 연간할인 + 비교표
- 메인→워크스페이스 스캔 연결 (로그인 유저 자동 전환)
- 워크스페이스 로고 드래그앤드롭 업로드
- 사이드바 상단 회사명 표시 개선

### 생성된 파일
- `components/smarcomm/RightPanel.tsx`

### 수정된 파일
- `app/(SmarComm)/sc/dashboard/layout.tsx` — 우측 패널, 반응형
- `app/(SmarComm)/sc/dashboard/profile/page.tsx` — 로고 업로드
- `app/(SmarComm)/sc/dashboard/scan/page.tsx` — 반응형, pending scan
- `app/(SmarComm)/sc/page.tsx` — 워크스페이스 연결
- `app/(SmarComm)/sc/pricing/page.tsx` — 5단계 요금제
- `components/SmarCommSidebar.tsx` — 모바일 아이콘 모드
- `components/smarcomm/charts/LineChart.tsx` — clipPath

---

## 2026-03-23 (집)

### 완료
- RooK 사이트 신규 생성 (6개 페이지 + 헤더/푸터)
- YouInOne WordPress 콘텐츠 반영 (XML에서 실제 콘텐츠 추출)
- 도메인 연결: tenone.biz, youinone.com
- Footer copyright 통일 + UniverseBadge 중복 제거
- 헤더 메뉴 "홈" 일괄 제거
- globalConfig + authMethods (사이트별 소셜 로그인 제어)
- SITE_GUIDE.md 멀티사이트 관리 가이드
- Supabase Auth: Google + Kakao OAuth 연동
- members 테이블 생성 + 마스터 계정
- 로그인/가입 한국어 통일 + 소셜 버튼
- middleware 이중 리라이트 방지

### 생성된 파일
- `app/(RooK)/` — RooK 사이트 전체 (layout + 6페이지)
- `components/RooKHeader.tsx`, `components/RooKFooter.tsx`
- `app/auth/callback/route.ts` — OAuth 콜백
- `SITE_GUIDE.md` — 멀티사이트 관리 가이드

### 수정된 파일
- `lib/auth-context.tsx` — 소셜 로그인, code exchange, fallback 처리
- `lib/site-config.ts` — globalConfig, authMethods, RooK 색상
- `middleware.ts` — RooK 분기, 이중 리라이트 방지
- `app/login/page.tsx` — 한국어 통일, 소셜 버튼, authMethods 조건부
- `app/signup/page.tsx` — 소셜 버튼, authMethods 조건부
- `components/PublicHeader.tsx` — 로그인/회원가입 한국어
- `components/*Footer.tsx` — copyright 통일, UniverseBadge 제거
- `components/*Header.tsx` — "홈" 메뉴 제거
- `app/(YouInOne)/yi/*` — WordPress 콘텐츠 반영 (6페이지)

### 미해결
- 소셜 로그인 후 로그인 상태 전환 안 됨 (SIGNED_IN 후 members 조회 문제)

### 결정 사항
- SmarComm은 이메일만 가입 (B2B 서비스)
- 사이트별 인증 방식은 siteConfig.authMethods로 관리
- 푸터: "© 서비스명. Powered by Ten:One™ Universe." (tenone.biz 링크)
- 새 사이트 추가 시 SITE_GUIDE.md 체크리스트 따를 것

---

## 2026-03-20 (사무실)

### 완료
- ERP를 C-Level 역할 기반으로 재구조화 (CHO/CFO)

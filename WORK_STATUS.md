# 작업 현황

> 마지막 업데이트: 2026-04-06 (사무실, 세션 22)

## 오늘 한 작업 (4/6 사무실, 세션 22)

### AA Code Instructions 전체 구현 ✅

**Task 1 — 에이전트 리네임 (코드):**
- `compass` → `1001` (hub, vrief, WIO ai page, messages comment)
- `badaksoe` → `deutbot` (새 라우트 파일 생성)

**Task 2 — 에이전트 시스템 프롬프트 DB UPDATE (9개 에이전트):**
- 1001(열시일분): 3-Layer 라우팅 규칙, 10:01 프로토콜, 에스컬레이션, Few-shot
- badangsoe(바당쇠): 2000자+ 바닥 커뮤니티 챗봇
- hero(히어로): HIT/S-Power 8D 기반 커리어 카운슬러
- madleague/madleap/smarcomm/mindle/wio/deutbot: 각 1500자+

**Task 3 — 독대 페이지 구현:**
- `app/api/agent/dokdae/route.ts`: QuickAction 4종, 카드 병렬 조회
- `app/intra/dokdae/page.tsx`: JARVIS 다크 3패널 UI
- `lib/intra-nav.ts`: 독대 + Agent Hub 사이드바 추가

**Alert System + HIT Core 기초:**
- computeAlertScoresFromDB(), crossAnalysis, router, cvi 추가

**커밋:** `634604b`

---

## 오늘 한 작업 (4/5~6 집 세션 19~20)

### 세션 21 (4/6 오후)

**HIT B 범용화 + HeRo 서비스 구조:**
1. HIT B 문항 동적 로드 — hit_questions DB에서 592문항 (공통+트랙별) API 로드
2. 직군 우선 폴백 트랙 매칭 (3단계: 전용→범용→없음)
3. HitBTestUI DB 문항 전환 (DB 우선, 프론트 하드코딩 fallback)
4. checkHitCompletion() — HIT A+B 완료 여부 확인 함수
5. AI 상담 페이지 HIT 체크 모달 (로그인/HIT A/HIT B/결제준비중)
6. /hero/career 커리어 로드맵 안내 페이지 full 구현
7. /hero/resume 이력서 코칭 2티어 (9,900원 AI + 89,000원 전문가)
8. 푸터 로고 흰색 단색 + 메뉴 통일 + Contact lools@tenone.biz

**커밋:** `d11119b`, `ebe214d`, `7c93767`

---

### 세션 20 (4/6)

**HIT 시스템 대규모 개선:**
1. UF 기저요인검사 50문항 7점 리커트 (9영역) 전면 교체
2. scoreUF() 채점 + 역문항 역채점 + DB 9컬럼 저장
3. S-Power 5→8차원 (harmony/breakthrough/guard + UF 가중치)
4. 클라이언트 → hit_b_results_safe 뷰 전환 (dark_triad 완전 비노출)
5. HIT B ai_report 프롬프트 강화 (dark triad 용어 금지)
6. HIT B 풀 보고서 페이지 `/hero/hit/b/report/[id]` 신규
7. 성격특성 라벨 소비자 친화 (지배성→추진력, 긴장도→스트레스반응)
8. PersonalityRadar DB 실제 키 기반 재구성 (4그룹)
9. RIASEC 바차트→6각 레이더차트, 역량 라벨 한국어화
10. 역량 30개→6카테고리 그룹핑 + 접기/펼치기
11. 인성 라벨 DB 로드 (PERSONALITY-LABELS 모듈)
12. 관심 분야 선택 단계 (HitInterestSelector: 산업군→직군→트랙매칭)
13. AI 상담 페이지 `/hero/coaching/ai` + 요금 체계
14. HeRo 로고/파비콘 적용 (헤더/보고서/결과)
15. 히어로 캐릭터 홈페이지 히어로 영역
16. HIT 모델 설명서 컴포넌트 (모달+인쇄)
17. 준비도 채점 self_understanding→self 매핑 수정
18. 오탈자 수정 (탐함가형→탐험가형)
19. dark_triad 메시지/라벨/컴포넌트 완전 제거

**커밋:** `4426695`, `bcbc528`, `27cde1b`, `6571ea9`, `aa46174`, `26082e2`, `7fbf969`

---

### 세션 19 (4/5)

### HeRo HIT 보고서 품질 개선 ✅

**cleanMarkdown 전체 적용:**
- `app/(HeRo)/hero/hit/a/result/[id]/page.tsx` — 페이지네이션 결과 페이지에 cleanMarkdown 추가
  - profile_overview, aiNarrative, 6개 모듈 콘텐츠(DISC/MBTI/CROSS/SP/GROWTH/COMM) 모두 적용
- `app/(HeRo)/hero/hit/a/report/[id]/page.tsx` — 이미 적용 확인 (전 세션)
- `app/(HeRo)/hero/hit/profile/[id]/page.tsx` — 통합 프로필 aiReport에 cleanMarkdown 적용
- `app/(HeRo)/hero/hit/b/result/[id]/page.tsx` — B결과 aiReport에 cleanMarkdown 적용

**DB 마크다운 정리:**
- `hit_hero_types` 64행 profile_overview에서 `**볼드**` 마크다운 전부 제거 (SQL regexp_replace)
- 예: `**스타로드(피터 퀼)**` → `스타로드(피터 퀼)`

**FWN 마이그레이션 확인:**
- WordPress 원본(fwn.co.kr) 접속 불가 (ECONNREFUSED)
- 기존 migrate-fwn.js로 15개 기사 이미 DB 저장 완료
- FWN 홈/카테고리/기사 상세 페이지 모두 정상 작동

**빌드:** 성공 ✅

---

## 이전 작업 (4/3 사무실 세션 18)

### WholeSee 크롤러 전체 파이프라인 정상화 ✅

**근본 원인 발견 & 해결:**
`.env.local`이 빈 Dev DB(`dwdoxzksvzjnsgupjzob`, 뭄바이)를 가리키고 있었음.
모든 테이블은 Prod DB(`ziotlxkdctlhiwkgmmsh`, 서울)에만 존재.
→ `.env.local`을 Prod DB로 전환하여 해결.

**추가 수정:**
1. **mindle_trends RLS 정책** — anon INSERT/SELECT 명시적 분리
   - `mindle_trends_anon_insert`: tenant_id='tenone' 조건부 INSERT 허용
   - `mindle_trends_anon_select`: 전체 SELECT 허용
2. **mindle_sources RLS 정책** — public SELECT 단순화
3. **RPC 함수 생성** (DB에 설치, 코드에서는 미사용)
   - `get_active_sources()`, `get_raw_collected_data()`
4. **크롤러 에러 로깅 개선** — `sourcesError` 명시적 반환

**파이프라인 검증 결과:**
```
RSS 크롤  → 17개 소스 → 131건 수집 ✅
AI 분석   → 20건 처리 → 11건 트렌드 카드 생성, 9건 필터링 ✅
```

**커밋:** `64eb54e`, `f3e8839`, `94c4c42`

**⚠️ 집에서 작업 시 주의:**
- `.env.local`은 gitignore → 집 PC에서도 Prod DB를 가리키도록 수동 변경 필요
  ```
  NEXT_PUBLIC_SUPABASE_URL="https://ziotlxkdctlhiwkgmmsh.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci...9Dx4IpmhYXmTbkX8KxX4O2U1qTWfvN_DDFrYvIoYxi8"
  ```
- Dev DB(`dwdoxzksvzjnsgupjzob`)는 테이블 없음 — 사용 금지

**다음 할 일:**
- Vercel Cron 작동 확인 (프로덕션 환경에서 자동 크롤 돌아가는지)
- chat_messages RLS 수정 (`postAgentMessage` 호출 시 "new row violates row-level security policy" 경고 해결)
- 마케팅에센스 RSS 에러 원인 조사 (fetch failed)
- Phase 2 계획: 38개 non-RSS 사이트 CSS/Puppeteer 크롤러 (4-6주)

---

## 오늘 한 작업 (4/3 사무실 세션 17)

### Mindle 크롤러 RSS 소스 12개 추가 ✅

**작업 내용:**
1. **RSS 피드 가용성 검사** — 50+ 한국/글로벌 마케팅·브랜드·트렌드 사이트 테스트
   - 성공률: 24.5% (12/49 가능)
   - 에이전시 블로그 최고: 60% (3/5)
   - Fashion/Lifestyle: 33% (5/15)

2. **Working RSS 피드 (12개)**
   - **Brand/Marketing**: bemyb, magazine.cheil.com
   - **Fashion/Lifestyle**: cosmopolitan.co.kr, elle.co.kr, esquirekorea.co.kr, dazedkorea.com, harpersbazaar.co.kr
   - **Marketing/Consumer**: mknews.kr
   - **Trend/Research**: trend-m.com
   - **Agency/Blogs**: blog.daehong.com, blog.hsad.co.kr, innosight.innocean.com

3. **DB 통합** (mindle_sources 테이블)
   - 12개 신규 + 기존 9개 = **총 21개 활성 RSS 피드**
   - Tier 1 (4h 폴링): bemyb, cheil, cosmopolitan, elle, esquire, daehong, hsad, innocean
   - Tier 2 (6h 폴링): dazed, harper's, mknews, trend-m

4. **예상 효과**
   - 수집량: 40-50건/day → 120-150건/day (250% 증가)
   - 카테고리: Brand/Marketing, Fashion, Agency Blogs 강화
   - 트렌드 다양성 ↑

5. **파일 생성** (docs/ 폴더)
   - RSS_FEED_ANALYSIS.md (상세 분석)
   - mindle-rss-feeds.csv (배포용)
   - mindle-crawler-selectors.json (Phase 2 CSS 크롤러)
   - README_MINDLE_RSS_TEST.md (구현 가이드)

**커밋:** `1061f86`

**다음 Phase:**
- Phase 2 (4-6주): 38개 non-RSS 사이트 CSS/Puppeteer 크롤러
- Phase 3 (장기): API/Newsletter/PDF 추가 통합 → 200+ articles/day

---

## 오늘 한 작업 (4/3 사무실 세션 16)

### UMS 대시보드 실데이터 검증 + 수정 ✅

**문제 발견:** `member_brand_joins` 조회 시 `.eq("status", "active")` 필터링
- 테이블 스키마에 `status` 컬럼이 없음 (member_id, brand_id, joined_at 등만 있음)
- Silent 실패 → 브랜드 데이터 0건

**수정:**
- `app/intra/ums/page.tsx` 라인 211: `.eq("status", "active")` 제거
- 모든 member_brand_joins 관계 포함하도록 변경

**Seed 데이터 추가 (실데이터 검증):**
- `member_brand_joins`: 10건 (sarah/junho/gihyuk/lools가 각각 1~3개 브랜드 가입)
  - sarah: MADLeague, SmarComm, RooK
  - junho: MADLeague
  - gihyuk: Badak
  - lools(kakao): Mindle, WIO Orbi
  - lools(tenone): HeRo, Evolution School, YouInOne
- `subscriptions`: 5건 (활성 구독)
  - SmarComm Pro 99k, WIO Orbi Business 199k, YouInOne Premium 149k 등
- `revenue`: 12건 (브랜드별 매출 기록)
  - SmarComm: 297k, WIO Orbi: 398k, YouInOne: 149k 등

**커밋:** `968a7e8`

---

## 오늘 한 작업 (4/3 사무실 세션 15)

### 기회 RSS 소스 업데이트 ✅

**문제:** OPPORTUNITY_SOURCES 4개 중 3개 404 오류 (위비티, K-스타트업, 창업진흥원)

**조사 결과 (RSS 지원 여부):**
- 위비티(wevity.com): RSS 완전 미지원 → 비활성화
- K-스타트업: 공식 "RSS 미지원" alert 명시 → 비활성화
- 링커리어: 504 타임아웃, SPA → 미지원
- 캠퍼스픽/씽유: RSS 없음

**수정:** `app/api/opportunity/crawl/route.ts` OPPORTUNITY_SOURCES 업데이트
- 제거: 위비티, K-스타트업 (RSS 미지원)
- 교체: 창업진흥원 `/rss/selectRssMainNoticeList.do` → `/rssNotice.es` (실동 확인)
- 추가: 중기부-사업공고 `mss.go.kr/rss/smba/board/310.do`
- 추가: 중기부-공지사항 `mss.go.kr/rss/smba/board/81.do`

**결과:** 1개(대티즌) → 4개(대티즌+창업진흥원+중기부2) 활성 소스

---

## 오늘 한 작업 (4/3 사무실 세션 14)

### 파이프라인 첫 실행 검증 + 버그 수정 ✅

**발견된 버그 5건 → 전부 수정:**
1. `ADMIN_API_KEY` / `CRON_SECRET` — Vercel env var에 `\n` 공백 포함 → REST API로 삭제+재추가
2. `wio_tenants` RLS 순환 참조 — `wio_tenants_select` 정책이 `wio_members` 재귀 참조 → 정책 제거
3. `collected_data` 컬럼명 오류 — `order by created_at` → `collected_at` 수정
4. `mindle_trends` 컬럼명 오류 — `source_url/source_name` → `source_urls[]/source_names[]` 배열 수정
5. RLS 정책 누락 — `mindle_trends`, `wio_opportunities`, `chat_messages`, `chat_threads`, `collected_data` anon 접근 정책 추가

**최종 결과:**
- WholeSee crawl: 40건 수집 (마케팅에센스 1개 소스 오류)
- WholeSee process: 20건 트렌드 카드 생성 → `mindle_trends` 총 32건
- 내일부터 Vercel Cron (AM 9:00/9:30 KST) 자동 실행 예정

**커밋:** `ca2f2fa`, `374cc12`, `225ac6b`

---

## 오늘 한 작업 (4/3 사무실 세션 13)

### Vercel 배포 + Cron 정상화 ✅
- Hobby 플랜 제약 발견: 크론 최대 2개, 하루 1회 한도
- 기존 7개 크론 → 2개 통합 크론으로 재설계
  - `/api/cron/all-crawl` (0:00 UTC = 9:00 KST): Whole See + 기회 RSS 수집
  - `/api/cron/all-process` (0:30 UTC = 9:30 KST): 처리 + AM 브리핑
- Vercel 배포 완료: `tenone-7oq5osew7-lools-8381s-projects.vercel.app`
- 커밋: `d182661`

### RLS 잔여 테이블 정리 ✅
- bookings/certificates/partners → auth 기반
- comm_* 4개 → authenticated only
- competitions/networking/surveys/votes → 적절한 권한 분리
- newsletter_issues write → staff only
- bums_* 3개 → auth 기반 재정립
- wio_bd_projects/sales_pipeline/strategies/quotes → staff write
- 마이그레이션: `rls_remaining_tables_20260403`

---

## 오늘 한 작업 (4/3 사무실 세션 12)

### RLS 대규모 정리 ✅
- HR (hr_payroll/attendance/evaluations/feedback) → is_tenone_staff()
- Finance (fin_assets/budgets/contracts/invoices/journals) → is_tenone_staff()
- wio_members: open read/update → tenant_id 격리 + auth.uid 기반
- sso_tokens: 0 policies → staff only
- payroll/approvals/expenses: ALL true override 정책 제거
- approval_requests/hr_job_postings/hr_org_units/staff_education → auth 기반
- **CRM 5개 테이블 anon_read/anon_write 제거** (익명 사용자 접근 취약점)
- **mkt_* 14개 테이블 anon 정책 제거**
- sys_audit_logs/sys_workflows → staff only
- smarcomm_billing_history → staff only
- wio HR/조직 5개 + wio 시스템 4개 → staff only
- wio_culture_*/departments/positions/role_permissions 등: auth 기반 재정립
- 커밋: `981dd72`, `0d20c5d`

---

## 오늘 한 작업 (4/3 사무실 세션 11)

### 비즈니스 기회 자동 크롤링 파이프라인 ✅
- `/api/opportunity/crawl`: 공모전/지원사업 RSS 4소스 수집 + Haiku 필터(6/10 미만 rejected) + Sonnet 구조화
- 소스: 위비티(공모전), 대티즌(공모전), K-스타트업(지원사업), 창업진흥원(지원사업)
- process: relevance_score 0-1로 정규화 저장 (ScoreBadge 표시 정합)
- `/api/cron/opportunity-crawl`: 매일 AM 8:00 KST / `/api/cron/opportunity-process`: AM 8:30 KST
- vercel.json: 7개 cron 등록 완료
- wio.ts: fetchOpportunities FK join 버그 수정 → select(*) 단순화
- opportunity/page.tsx: budgetMax 연결
- 커밋: `5a0a606`

---

## 오늘 한 작업 (4/3 사무실 세션 10)

### 메신저 우측 패널 분기 ✅
- 채널 선택 시: 채널명·설명, 담당 에이전트 카드(role·활성상태), 최근 활동 4건
- 일반 대화 선택 시: 기존 상대 프로필 + 그룹 참여자 패널 유지
- `/api/agent/profiles` 연동 → agent_name 매핑
- 커밋: `80aa15c`

### 크롤링 파이프라인 자동화 ✅
- `crawler/route.ts`: `action=process` 구현 — Haiku 필터링(점수<6 rejected) → Sonnet 트렌드 카드 → `mindle_trends` 발행
- `collected_data.status`: raw → processed / rejected / error 상태 관리

### Vercel Cron 등록 ✅
- `/api/cron/crawl`: 매 6시간 (`0 */6 * * *`)
- `/api/cron/process`: 크롤 30분 후 (`30 */6 * * *`)
- `/api/cron/vrief-am`: AM 10:01 KST (`1 1 * * *`)
- `/api/cron/vrief-pm`: PM 22:01 KST (`1 13 * * *`)
- `CRON_SECRET`: Vercel이 배포 시 자동 생성
- 커밋: `0be4682`

### UMS 에이전트 소통 페이지 ✅
- `/intra/ums/agent/comm`: 에이전트 채널 현황 대시보드
- 5개 채널 카드 (최근 메시지, 담당 에이전트 배지)
- 수동 실행 버튼 (RSS 크롤, 트렌드 카드 생성)
- Vercel Cron 스케줄 안내 섹션

---

## 오늘 한 작업 (4/3 사무실 세션 9)

### UMS 통합 메뉴 구조 완성 ✅
- `app/intra/ums/` 전체 디렉토리 신규 생성 (23개 파일)
- layout.tsx: UmsFilterContext + useBumsFilter 하위호환 제공
- 회원 탭: list / guests / privacy
- 사이트 탭: list / boards / content / newsletter / library
- 커머스 탭: subscriptions / shop / bookings / promotions / revenue / inquiry
- Team AI Agent 탭: hub / comm / trends
- lib/intra-nav.ts: UMS 모듈 → children 기반 서브탭 구조로 재구성
- 빌드 ✅ (564 pages)
- 커밋: `46d965e`

---

## 오늘 한 작업 (4/3 사무실 세션 8)

### UMS (Universe Management System) 7개 TASK 완료 ✅

#### TASK 1: ums_sites 생성 ✅
- site_configs(24행) + bums_sites(6행, UUID 보존) → ums_sites 통합
- site_configs → site_configs_legacy 리네임 + 하위호환 뷰
- RLS: staff 전체 / anon public read

#### TASK 2: account_type 확장 + 고객 플로우 ✅
- subscriber, guest_buyer enum 추가
- member_brand_joins origin 컬럼 추가
- guests.member_id, subscriptions.member_id FK 추가
- vw_staff / vw_customers 뷰 생성
- 3개 트리거: auto_brand_join, upgrade_to_subscriber, downgrade_from_subscriber

#### TASK 3: Board 마이그레이션 ✅
- bums_boards/posts/comments → ums_boards/posts/comments 리네임
- board_configs(29행) + posts(46행) → ums_* INSERT
- 레거시 뷰: bums_boards, board_configs, posts

#### TASK 4: Commerce 수정 ✅
- shop_orders: member_id, guest_id, site_id FK 추가
- shop_products: site_id FK 추가
- promotions: site_id FK 추가
- subscriptions: brand_id, site_id 추가
- customer_payments 테이블 신규 생성 (PG 연동 준비)

#### TASK 5: Content 파이프라인 복구 ✅
- content_pipeline: body, source_ids, site_id, author_id, tags, thumbnail_url, published_at, updated_at, tenant_id 추가

#### TASK 6: Engage 활성화 ✅
- newsletter_subscribers: site_id, member_id 추가 + email→member 자동 연결
- notifications: site_id, brand_id 추가
- member_points: tenant_id, type(earn/use/expire/adjust) 추가
- member_point_balances 뷰 생성
- fn_newsletter_auto_brand_join 트리거

#### TASK 7: UMS 대시보드 홈 ✅
- Universe 대시보드에 UMS 6개 허브 현황 섹션 추가
- SITE/MEMBER/COMMERCE/CONTENT/BOARD/ENGAGE 실시간 카운트

#### 사이드바 서브탭 리팩토링 ✅
- lib/intra-nav.ts 추출 (modules 배열 + findSubItems + getActiveSubHref)
- IntraSidebar: 3뎁스 accordion 제거
- IntraSubTabs: 본문 상단 탭으로 렌더링

---

## 오늘 한 작업 (4/3 집 세션 7)

### Phase 0: 테넌트 격리 기반 구축 ✅
- 80개 테이블 tenant_id 추가 (격리 미준수 85→5개)
- wio_tenant_configs, wio_feature_flags 테이블 생성
- Identity Architecture Tier 4 문서화
- CLAUDE.md: WIO 2-Tier 모델, Tech Flywheel, 8원칙

### Phase 1: 4대 제품 Intra 통제 ✅
- 홈페이지 + Mindle 뉴스레터 폼 → /api/newsletter DB 연결
- Mindle trends 페이지 DB-first 전환 + 시드 12건
- SmarComm Coming Soon 게이트 제거 (활성화)
- /api/agent/vrief — 10:01 AM/PM 브리핑 프로토콜 API

### Phase 2-A: 구독 인프라 ✅
- lib/supabase/wio.ts: 구독 CRUD 5개 함수 + hasAccess() 미들웨어
- /api/subscription: GET/POST/PATCH + /api/subscription/access

### Phase 3-A: Whole See 크롤러 ✅
- /api/crawler POST — RSS 소스 크롤 → collected_data 저장
- 모비인사이드 + 플래텀에서 20건 실수집 검증 완료
- 비활성 소스 3개 정리, 신규 소스 3개 추가

### 메신저 채널 시스템 ✅
- chat_threads에 thread_type/description/agent_name 컬럼 추가
- 에이전트 채널 5개 시드 (브리핑/트렌드/MADLeague/Badak/일반)
- fetchChannels() + postAgentMessage() 함수
- 메신저 UI: 채널|대화|조직도 3탭 구조
- Vrief API → #브리핑 채널 자동 게시
- Crawler API → #트렌드 채널 자동 게시

### DB 전수 검토 조치 ✅
- RLS 미적용 9개 테이블 활성화
- member_points_summary SECURITY DEFINER → INVOKER
- 10개 함수 search_path = public 고정
- 중복 인덱스 2건 삭제
- th_insights/th_opportunities 삭제 (D-060 이행)
- Leaked Password Protection 활성화 (사용자 직접)

### 에이전트 이름 정비 ✅
- AI Team v2 문서 기준 한국어 이름 적용 (9개)
- 블루(madleap) 에이전트 신규 추가

### ANTHROPIC_API_KEY ✅
- Vercel 환경변수 추가 + Redeploy 완료
- Agent Hub 실제 Claude 응답 동작 확인

### 도메인
- fwn.co.kr → Vercel 추가 완료, DNS 전파 대기 중
- hero.ne.kr → 도메인 기관 이전 완료 후 진행

### 커밋 기록
- `bb82636` Phase 0 + Phase 1
- `50dff98` Mindle trends DB + 10:01 Vrief API
- `722b26f` Phase 2-A 구독 인프라
- `fb9358f` Phase 3-A 크롤러 API
- `ba59412` 크롤러 파이프라인 검증
- `82151eb` 메신저 채널 시스템
- `b0c9186` DB 전수 검토 보안 조치

---

## 다음 할 일

### 세션 10 추가 완료 ✅

- **UMS 브랜드 집계** — `members.affiliations` → `member_brand_joins` 기반으로 전환 (`ac5a76b`)
- **구 메뉴 정리** — 사이드바에 universe/bums/agent 없음 확인 (이미 완료)
- **RLS 민감 테이블 9개** — Always True → 인증/role 기반 교체 (`a3ddcb6`)
  - `is_tenone_staff()` SECURITY DEFINER 헬퍼 함수 생성
  - members/guests/revenue/subscriptions/agent_*/chat_*/member_brand_joins

---

## 다음 할 일

### 즉시 (다음 세션)

1. ✅ **HIT B 문항 동적 로드** — 완료 (세션 21). `/api/hit/b/questions?trackId=xxx` + DB 우선 로드
2. ✅ **HIT B "준비 중" UX** — 완료 (세션 21). 공통 문항만 진행
3. **A+B 통합 프로필 페이지** — cross_ab 22개 모듈 활용, `/hero/hit/profile/[id]`

### P1 (서비스 인프라)
4. **구독 API** — `/api/hero/subscribe` (hero_subscriptions INSERT, HIT 완료 검증)
5. **이력서 AI 코칭 API** — `/api/hero/resume/coach` (파일 업로드 → Claude 분석 → ai_feedback 저장)
6. **결제 연동** — 토스페이먼츠 또는 Stripe (Phase 2)
7. **마케팅 5트랙 DB 마이그레이션** — 프론트 하드코딩 문항 → hit_questions로 이관

### 우선순위 높음

1. ✅ **공모전 RSS URL 수정** — 창업진흥원 새 URL + 중기부 2개 추가. 위비티/K-스타트업 비활성화. `app/api/opportunity/crawl/route.ts` 수정 완료 (세션 15).

2. ✅ **UMS 대시보드 실데이터 검증** — `.eq("status", "active")` 제거, seed 데이터 추가. `app/intra/ums/page.tsx` 수정 완료 (세션 16).

3. **SmarComm 대시보드 Mock→DB 전환** — **보류** (사용자 요청). 스키마가 Mock과 불일치 (`tenant_id` 없음, `metrics` JSON 형식 등). 나중 단계 진행 예정.

### 사용자 결정 후 진행

6. **PG 연동 + 결제 플로우** — 토스페이먼츠/포트원 선택 후 SDK → Mindle 구독 결제. `hasAccess()` 미들웨어 이미 구현.
7. **SmarComm/WIO 가격 체계 확정** — 확정 후 pricing 페이지 DB 연결.
8. **뉴스레터 발송 시스템** — Resend/SendGrid 연동 → newsletter_issues 실제 발송.

### 중기

9. **바당쇠 Playwright 세션** — 카카오 오픈채팅 리스닝 모드. `/api/agent/deutbot` 구현됨.
10. **Mindle 뉴스레터 1호** — 트렌드 카드 100개 축적 후.

### 도메인

11. **hero.ne.kr** — 기관 이전 완료 후 Vercel 연결
12. **www.smarcomm.biz** — Vercel 대시보드 설정
13. **fwn.co.kr DNS** — Vercel Domains에서 Refresh 확인

### 사용자 결정 후 진행

5. **PG 연동 + 결제 플로우** — 토스페이먼츠/포트원 선택 후 SDK 설치 → Mindle 구독 결제 흐름 구현. hasAccess() 미들웨어 이미 구현됨.

6. **SmarComm/WIO 가격 체계 확정** — SmarComm: 대행(29만~) vs SaaS(4.9만~) 별개 결정. WIO: per-user vs 고정가 결정. 확정 후 pricing 페이지 DB 연결.

7. **SmarComm 대시보드 Mock→DB 전환** — 현재 MOCK_CAMPAIGNS/MOCK_SALES 하드코딩. marketing_campaigns 등 DB 테이블로 전환. 큰 작업량.

### 중기 (Phase 3~4)

8. **바당쇠 Playwright 세션 저장** — 카카오 오픈채팅 리스닝 모드. `docs/Bot_Strategy_쇠봇_듣봇.md` 참고. `/api/agent/badaksoe` 이미 구현됨.

9. **뉴스레터 발송 시스템** — 이메일 서비스(Resend/SendGrid) 연동. newsletter_issues → 실제 이메일 발송. intra/bums/newsletter 발송 버튼 연결.

10. **Mindle 뉴스레터 1호 발송** — 트렌드 카드 100개 축적 후.

### 도메인

11. **hero.ne.kr → Vercel 도메인** — 기관 이전 완료 후
12. **www.smarcomm.biz → Vercel 도메인** — Vercel 대시보드 설정
13. **fwn.co.kr DNS 전파 확인** — Vercel Domains에서 Refresh

---

## 참고
- 통합 아키텍처: `docs/TenOne_Universe_Architecture_v1.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- 아이덴티티: `docs/Identity_Architecture.md`
- AI Team: `G:\내 드라이브\00 다운로드\TenOne_AI_Team_v2_20260402.md`
- DB 검토: `G:\내 드라이브\00 다운로드\TenOne_DB_Review_20260403.md`

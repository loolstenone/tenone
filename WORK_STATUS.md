# 작업 현황

> 마지막 업데이트: 2026-04-03 (사무실, 세션 15 — 완료)

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

### 우선순위 높음

1. ✅ **공모전 RSS URL 수정** — 창업진흥원 새 URL + 중기부 2개 추가. 위비티/K-스타트업 비활성화. `app/api/opportunity/crawl/route.ts` 수정 완료 (세션 15).

2. **UMS 대시보드 실데이터 검증** — `member_brand_joins` 전환 후 브랜드별 집계 카드가 실제로 뜨는지 확인. `app/intra/ums/page.tsx`.

3. **SmarComm 대시보드 Mock→DB 전환** — `MOCK_CAMPAIGNS` / `MOCK_SALES` → `marketing_campaigns` DB 연결. `app/intra/studio/` 경로.

### 사용자 결정 후 진행

6. **PG 연동 + 결제 플로우** — 토스페이먼츠/포트원 선택 후 SDK → Mindle 구독 결제. `hasAccess()` 미들웨어 이미 구현.
7. **SmarComm/WIO 가격 체계 확정** — 확정 후 pricing 페이지 DB 연결.
8. **뉴스레터 발송 시스템** — Resend/SendGrid 연동 → newsletter_issues 실제 발송.

### 중기

9. **바당쇠 Playwright 세션** — 카카오 오픈채팅 리스닝 모드. `/api/agent/badaksoe` 구현됨.
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

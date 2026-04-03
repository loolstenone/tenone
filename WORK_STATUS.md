# 작업 현황

> 마지막 업데이트: 2026-04-03 (사무실, 세션 9 — 작업 중)

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

### 우선순위 높음 (바로 착수 가능)

0. **UMS DB → Intra UI 연결** — UMS 대시보드(`app/intra/ums/page.tsx`) ums_sites 기반 브랜드 집계 전환. 현재 members.affiliations TEXT[]로 브랜드 집계 중 → member_brand_joins 기반으로 변경. `app/intra/ums/page.tsx` 195번째 줄 `membersAll.affiliations` 블록 교체.

0-1. **구 메뉴 정리** — 기존 `/intra/universe/*`, `/intra/bums/*`, `/intra/agent` 라우트 유지 필요 여부 검토. UMS로 통합됐으므로 사이드바에서 old 모듈이 보이지 않는지 확인.

1. **GCP Scheduler 설정** — 크롤러(/api/crawler) + Vrief(/api/agent/vrief) 자동 실행. 크롤러: 매 6시간, Vrief: AM 10:01 / PM 22:01. `app/api/crawler/route.ts`, `app/api/agent/vrief/route.ts`에 CRON_SECRET 인증 이미 구현됨.

2. **크롤링 데이터 → Claude 요약 → mindle_trends 자동 생성** — collected_data(raw) → Claude Haiku 노이즈 제거 → Sonnet 트렌드 카드 생성 → mindle_trends 저장. `/api/crawler`에 `action: 'process'` 추가.

3. **메신저 우측 패널 분기** — 채널 선택 시: 채널 설명 + 담당 에이전트 정보 + 최근 활동. 에이전트 선택 시: 역할/상태, 오늘 완료 작업, API 사용량. `app/intra/myverse/messenger/page.tsx` 우측 패널 조건 분기.

4. **RLS "Always True" 정책 정비** — 실DB 전환 대상(CRM, HR, Finance)부터 tenant_id 기반 정책으로 교체. `sql/db-review-fixes.sql` 참조. 약 150개 테이블 대상이지만 민감 테이블 우선.

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

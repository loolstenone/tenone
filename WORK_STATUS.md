# 작업 현황

> 마지막 업데이트: 2026-04-01

## 오늘 한 작업 (4/1 오후 — 사무실 6차)

### Intra DB 현실화 — Marketing/ERP/Workflow 26개 페이지 전환
- **Marketing 9개**: organizations, deals, activities, segments, campaigns, leads, content, analytics, page
  → 모두 useContext 제거 → Supabase fetch + mock fallback 패턴으로 전환 ✅
- **ERP HR 11개**: staff/[id], staff/register, gpr/page, gpr/goals, gpr/evaluation,
  talent, talent/pipeline, talent/programs, clubs, delegation, family
  → lib/supabase/erp.ts에 rowToStaffMember, fetchStaffMembers, rowToGprGoal, fetchGprGoalsTyped 추가 ✅
- **Studio Workflow 5개**: page, kanban, pipeline, projects, automation
  → lib/supabase/workflow.ts 신규 생성 (workflow_tasks, content_pipeline, projects, workflow_automations) ✅
  → sql/workflow-tables.sql 신규 생성 (Prod 실행 필요 ⚠️)
- sql/badaksoe-rooms-table.sql 신규 생성 (Prod 실행 필요 ⚠️)
- Points 2개 (erp/hr/points, myverse/points): point-context가 이미 DB-first 구현 → 변환 불필요 확인 ✅

### DB 현실화 현황 (전체 최신)
**연결 완료:**
approval progress/completed, expenses, biz plan, finance reports, card/billing/payment/incentive,
project management/detail/jobs, timesheet, gpr, payroll, attendance,
myverse/approval/expenses/gpr/points/projects/payroll/todo,
biz analysis(division/cost/손익), biz manage(월별추정/실적확정/gap분석), comm(notice/free/calendar),
opportunity, certificates, rates(표준단가),
**Marketing 9개 (organizations/deals/activities/segments/campaigns/leads/content/analytics/page)**,
**ERP HR 11개 (staff+gpr+talent+clubs+delegation+family)**,
**Studio Workflow 5개 (page+kanban+pipeline+projects+automation)**

**미연결 (정적 콘텐츠 — CMS 대응 예정):**
wiki/education, wiki/onboarding, wiki/faq, org chart, vendors, bidding, hero/*, settings/*

---

## 오늘 한 작업 (4/1 오후 — 사무실 5차)

### Universe OS Phase 1 — agent DB 테이블 생성 SQL
- Phase 1 코드(lib/agent/claude.ts, /api/agent/hub, /api/agent/profiles, /api/agent/messages, app/intra/agent/page.tsx) 전부 완성 확인 ✅
- sql/agent-tables.sql 신규 생성 — **Prod SQL 에디터에서 직접 실행 필요 ⚠️**
  - agent_profiles (name/display_name/layer/agent_type/model_id/system_prompt/temperature/max_tokens/tools/risk_level/can_invoke/is_active)
  - agent_messages (from_agent/to_agent/message_type/payload/risk_level/confidence/correlation_id/user_id)
  - RLS: auth_is_staff() 기반
  - 초기 시드 3종: compass(L0 메타), madleague(L2 브랜드), badaksoe(L2 브랜드)

---

## 오늘 한 작업 (4/1 오후 — 사무실 4차)

### 인트라 DB 현실화 추가 (4/1 오후 4차)
- biz/manage/page → fetchMonthlyForecasts() — 월별 추정 실DB 연동 ✅
- biz/manage/actual → fetchMonthlyForecasts() — 실적 확정 실DB 연동 ✅
- biz/manage/gap → fetchMonthlyForecasts() — Gap 분석 (매출 항목 집계) 실DB 연동 ✅
- erp/project/rates → fetchStandardRates() + upsertStandardRate() — 표준단가 편집 DB 저장 ✅
- lib/supabase/erp.ts: fetchMonthlyForecasts, upsertMonthlyForecast, fetchStandardRates, upsertStandardRate 추가 ✅
- sql/monthly-forecasts-table.sql: 신규 (year/month/item/plan/forecast_1~3/actual/status) ✅
- sql/standard-rates-table.sql: 신규 (position/hourly_rate/brand_id + 기본 시드) ✅
- sql/erp-finance-tables.sql: 기존 완성 (invoices/payments/card_usage/incentives) — Prod 실행 필요 ⚠️

### 인트라 DB 현실화 완료 현황 (전체)
연결 완료: approval progress/completed, expenses, biz plan, finance reports, card/billing/payment/incentive,
project management/detail/jobs, timesheet, gpr, payroll, attendance, myverse/approval/expenses/gpr/points/projects/payroll/todo,
biz analysis(division/cost/손익), biz manage(월별추정/실적확정/gap분석), comm(notice/free/calendar),
opportunity, certificates, rates(표준단가 DB저장 포함)
미연결(DB 테이블 없음): talent/clubs/delegation/family/education, org chart,
partner-pool, vendors, bidding, hero/*, wiki/*, studio/*, settings/*

---

## 오늘 한 작업 (4/1 오후 — 사무실 2차)

### 인트라 ERP 추가 DB 현실화
- biz/analysis/division → fetchBizPlans() — 부문 이익률, 전분기 대비 트렌드 ✅
- biz/analysis/cost → fetchExpenses() — 외부비/내부비 구성, 월별 비용 추이 ✅
- biz/analysis/page → fetchProjects() — YTD 실적 요약 카드 (매출/매총/영업이익) ✅
- project/management/jobs → fetchAllJobs() 신규 추가, Job 목록 실DB 연동 ✅
- erp/project/rates → fetchPayrollWithMembers() 신규 추가, 실제단가 탭 실DB 연동 ✅
- opportunity/page → fetchTenOneOpportunities() 연결 (wio_opportunities 테이블) ✅
- erp/hr/certificates → approvals 테이블(type=certificate) 발급 이력 연동 ✅
- myverse/todo → wio_todos 테이블 연동 (fetchTenOneMembership + fetchTodos) ✅
- lib/supabase/wio.ts: fetchTenOneOpportunities(), fetchTenOneMembership() 추가 ✅
- lib/supabase/projects.ts: fetchAllJobs() 추가 ✅
- lib/supabase/erp.ts: fetchPayrollWithMembers() 추가 ✅

### 인트라 DB 현실화 완료 현황 (전체)
연결 완료: approval progress/completed, expenses, biz plan, finance reports, card/billing/payment/incentive,
project management/detail/jobs, timesheet, gpr, payroll, attendance, myverse/approval/expenses/gpr/points/projects/payroll/todo,
biz analysis(division/cost/손익), comm(notice/free/calendar), opportunity, certificates, rates
미연결(DB 테이블 없음): biz/manage/actual/gap, talent/clubs/delegation/family/education, org chart,
partner-pool, vendors, bidding, hero/*, wiki/*, studio/*, settings/*

---

## 오늘 한 작업 (4/1 오전 — 사무실 1차)

### 인트라 ERP 전체 페이지 DB 현실화 (4/1)
- middleware: getUser() → getSession() (cold start 해결) ✅
- 로그아웃 → 브랜드 홈 랜딩 (IntraHeader, SmarComm) ✅
- 뉴스룸 FWN 스타일 리디자인 + max-w 통일 ✅
- TrendHunter → Mindle 리다이렉트 (11개 파일) ✅
- BoardWidget 퍼블릭 컴포넌트 추가 ✅
- **ERP DB 현실화** (mock → DB with fallback):
  - 결재 진행/완료 → fetchApprovals() ✅
  - 경비품의서 → fetchExpenses() ✅
  - 연간 경영계획 → fetchBizPlans() ✅
  - 경리 리포트 → fetchExpenses() + getProjectStats() ✅
  - 법인카드 → fetchCardUsage() ✅
  - 청구관리 → fetchInvoices() ✅
  - 지급관리 → fetchPayments() ✅
  - 보상관리 → fetchIncentives() ✅
  - 프로젝트 상세 → fetchProjectByCode + fetchJobs + fetchProjectMembers ✅
- erp.ts: invoices, card_usage, payments, incentives 테이블 함수 추가 ✅

### MyVerse + ERP DB 연동 완료 (3/31)
- myverse/gpr → gpr_goals 테이블 실DB 연동 ✅
- myverse/projects → fetchMyProjects DB 연동 ✅
- myverse/payroll, attendance, expenses → 이전 세션 완료 ✅
- myverse/approval → approvals 테이블 연동 ✅
- project/financials → projects 테이블 연동 ✅
- erp/settings/approval-line → approval_templates 테이블 연동 ✅
- sql/approval_templates.sql Prod 실행 완료 ✅

### 버그 수정
- GET /api/board/posts 500 에러 → is_secret, author_name 없는 컬럼 제거 ✅
- tags contains JSON.stringify 버그 수정 ✅
- api/newsroom/feed 브라우저 client → 서버 client 수정 ✅

### Director Priority 작업
- **Priority 1 (Phase 2)**: identity-context.tsx + useIdentityAdapter + IntraSidebar 3계층 연동 ✅
- **Priority 2**: features/[brand] 폴더 분리 — 46개 컴포넌트 이동, import 경로 전체 업데이트 ✅
- **Priority 3**: next.config.ts 캐시 헤더 설정 (마케팅 1h, 인트라 no-store, API no-store) ✅

### settings localStorage → Supabase DB 마이그레이션 (완료)
- lib/supabase/settings.ts: member_id/settings JSONB 스키마 전면 재작성 ✅
- lib/wio-modules.ts: loadOrbiConfigDB / saveOrbiConfigDB / loadAccordionStateDB / saveAccordionStateDB ✅
- wio/app/layout.tsx + settings/page.tsx: DB-first 전환 ✅
- lib/library-context.tsx: bookmarks/user_items DB 연동 ✅
- lib/smarcomm/chart-palette.ts + scan-data.ts: DB 헬퍼 추가 ✅
- smarcomm/dashboard/scan, glossary, profile 페이지: DB 연동 ✅

---

## 다음 할 일

### 즉시 — Prod Supabase SQL 실행 필요 ⚠️
(Supabase 대시보드 → SQL Editor에서 순서대로 실행)
1. `sql/erp-finance-tables.sql` — invoices, payments, card_usage, incentives
2. `sql/monthly-forecasts-table.sql` — monthly_forecasts
3. `sql/standard-rates-table.sql` — standard_rates (기본 시드 포함)
4. `sql/agent-tables.sql` — agent_profiles, agent_messages (Universe OS Phase 1)
5. `sql/workflow-tables.sql` — workflow_tasks, content_pipeline, workflow_automations + projects 컬럼 추가
6. `sql/badaksoe-rooms-table.sql` — badaksoe_rooms (Universe OS Phase 2)

### 단기 — Universe OS
- **Phase 1 DB 활성화**: sql/agent-tables.sql 실행 → Agent Hub 페이지 (/intra/agent) 테스트
- **Phase 2 바당쇠**: /api/agent/badaksoe 엔드포인트 구현

### 단기 — TenOne 서비스
- **SmarComm 독립 배포**: 별도 Vercel + Supabase 프로젝트 셋업
- **wiki/education, onboarding, faq**: CMS 전환 (정적 콘텐츠 → DB)
  → wiki_articles, wiki_courses 테이블 설계 필요
- **org chart**: 조직도 페이지 DB 연결 (members 테이블 활용)
- **Myverse 앱**: 맥북 구매 후 → Expo 프로젝트 초기화 + 전용 Supabase 생성

### 즉시
4. **Prod DB**: `sql/approval_templates.sql` 실행 완료 ✅
5. Multiple GoTrueClient — 모니터링 계속 (11976ed 커밋 이후 안정)

### 단기 — TenOne
6. ~~설정 서비스/모듈 → Supabase 저장 (localStorage → DB)~~ ✅ 완료
7. **Universe OS Phase 1 DB 활성화**: `sql/agent-tables.sql` Prod 실행 → agent_profiles/agent_messages 테이블 생성 ← **다음 즉시**
8. **Universe OS Phase 2**: badaksoe_rooms 테이블 + /api/agent/badaksoe 엔드포인트 (Phase 1 DB 실행 후)
9. SmarComm 독립 배포

### 단기 — 사이트 구조 개편
6. **TrendHunter → Mindle 통합 후 삭제**
   - TrendHunter 사이트를 Mindle(크롤링/트렌드 콘텐츠) 브랜드에 흡수
   - features/trendhunter/ 폴더 + 라우트 제거, Mindle로 리다이렉트
7. **TenOne Newsroom 페이지 일관성/폭 정비**
   - 현재 폭이 다른 섹션과 불일치 → 전체 max-w 통일
8. **로그인 문제 근본 해결** (tenone.biz/intra — "서버 응답이 지연되고 있습니다")
   - 반복적 타임아웃 원인 분석 필요 (Supabase cold start? 네트워크? 쿠키?)
9. **첫 페이지 콘텐츠 미리보기 클릭 → 해당 콘텐츠로 직접 연결**
   - 현재: 미리보기 클릭 → works/brands 등 목록 페이지로 이동
   - 목표: 클릭 시 해당 아이템 상세 페이지로 직접 이동
10. **게시판 + 위젯 개념 정립** (아임웹 스타일)
    - 게시판: 목록/상세/작성 표준 구조
    - 위젯: 페이지 어디서나 삽입 가능한 재사용 블록
    - CMS 관리 모드 연계 (project_cms_vision 메모리 참조)

### 단기 — Myverse 앱 착수 준비
11. 맥북 구매 확정 후 → Expo 프로젝트 초기화
12. Myverse 전용 Supabase 프로젝트 생성
13. Myverse_Dev_Guide_v3_final.md를 프로젝트 CLAUDE.md로 정제

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- Director 가이드라인: docs/DIRECTOR_COMMENTS.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v3_final.md (G드라이브)
- 개발 현황: docs/PROJECT_STATUS.md

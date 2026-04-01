# 작업 현황

> 마지막 업데이트: 2026-04-01 (집 + 사무실 머지)

## 오늘 한 작업 (4/1 집)

### 인트라 메뉴 stub 3개 완성
1. `bums/stats` ✅ — 사이트별 게시글·조회수·좋아요·댓글 집계 + 회원/구독자 수 KPI (Supabase 실연동)
2. `bums/promotion` ✅ — 할인코드 CRUD (percent/fixed, 사용제한, 유효기간, 코드 복사)
3. `bums/shop` ✅ — 상품 관리 + 주문 관리 탭, 인라인 상태 변경
4. `supabase/migrations/007_shop_promotions.sql` ✅ — shop_products, shop_orders, promotions 테이블

### 전체 인트라 메뉴 현황 파악
- 총 ~160개 페이지, stub 3개 완성 → 0개
- mock 데이터 사용 중인 페이지: 38개 (Supabase 연결 필요)

---

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

---

## 오늘 한 작업 (4/1 오후 — 사무실 5차)

### Universe OS Phase 1 — agent DB 테이블 생성 SQL
- Phase 1 코드(lib/agent/claude.ts, /api/agent/hub, /api/agent/profiles, /api/agent/messages, app/intra/agent/page.tsx) 전부 완성 확인 ✅
- sql/agent-tables.sql 신규 생성 — **Prod SQL 에디터에서 직접 실행 필요 ⚠️**
  - agent_profiles, agent_messages, RLS, 초기 시드 3종 (compass, madleague, badaksoe)

---

## 오늘 한 작업 (4/1 오후 — 사무실 4차)

### 인트라 DB 현실화 추가
- biz/manage/page, actual, gap → fetchMonthlyForecasts() ✅
- erp/project/rates → fetchStandardRates() + upsertStandardRate() ✅
- sql/monthly-forecasts-table.sql, sql/standard-rates-table.sql 신규 ✅

---

## 오늘 한 작업 (4/1 오전 — 사무실 1차)

### 인트라 ERP 전체 페이지 DB 현실화
- 결재 진행/완료, 경비품의서, 연간 경영계획, 경리 리포트, 법인카드, 청구/지급, 보상관리, 프로젝트 상세 ✅
- erp.ts: invoices, card_usage, payments, incentives 함수 추가 ✅

---

## 이전 작업 (3/31 집)

### TenOne 사이트 고도화 — DB 전체 연결
1. WIO OrbiConfig DB sync ✅
2. TypeScript 56 에러 → 0 ✅
3. Marketing 3 페이지 추가 ✅ — Performance, Influencers, Social
4. 005_tenone_portal.sql ✅ — brands 컬럼 확장 + history_events 20개
5. lib/supabase/tenone.ts ✅
6. brands/page.tsx, history/page.tsx ✅ — Supabase DB-first

---

## 다음 할 일

### 즉시 — Prod Supabase SQL 실행 필요 ⚠️
(Supabase 대시보드 → SQL Editor에서 순서대로 실행)
1. `sql/erp-finance-tables.sql` — invoices, payments, card_usage, incentives
2. `sql/monthly-forecasts-table.sql` — monthly_forecasts
3. `sql/standard-rates-table.sql` — standard_rates (기본 시드 포함)
4. `sql/agent-tables.sql` — agent_profiles, agent_messages (Universe OS Phase 1)
5. `sql/workflow-tables.sql` — workflow_tasks, content_pipeline, workflow_automations
6. `sql/badaksoe-rooms-table.sql` — badaksoe_rooms
7. `supabase/migrations/007_shop_promotions.sql` — shop_products, shop_orders, promotions

### 단기 — Universe OS
- **Phase 1 DB 활성화**: sql/agent-tables.sql 실행 → Agent Hub 페이지 (/intra/agent) 테스트
- **Phase 2 바당쇠**: /api/agent/badaksoe 엔드포인트 구현

### 단기 — 인트라 mock→Supabase 연결 (잔여)
> 현재 남은 mock 데이터 페이지: wiki/*, hero/*, settings/* 등
- wiki/education, onboarding, faq: CMS 전환 (wiki_articles, wiki_courses 테이블 설계)
- org chart, vendors, bidding: DB 연결
- Myverse 앱: 맥북 구매 후 → Expo 프로젝트 초기화 + 전용 Supabase 생성

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md
- Director 가이드라인: docs/DIRECTOR_COMMENTS.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v3_final.md (G드라이브)
- 개발 현황: docs/PROJECT_STATUS.md

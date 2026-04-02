# 작업 현황

> 마지막 업데이트: 2026-04-02 (사무실, 저녁 세션 5 — 작업 종료)

## 오늘 한 작업 (4/2 저녁 세션 5)

### 인트라 전체 PageHeader 일관성 적용 (100+ 페이지) ✅

**병렬 에이전트 3개 + 직접 수정으로 인트라 전체 페이지에 PageHeader 적용:**

1. **PageHeader 적용 102개 파일** — `be3cdb0`
   - myverse: page, points, projects, messenger (폭 정렬 수정)
   - project: management(+sub), jobs, financials, timesheet(Rules of Hooks 버그 수정)
   - partner-pool, opportunity
   - hero/*: branding, career(+sub), hit(+sub), resume(+sub) — 8개
   - evolution-school
   - wiki/*: page, onboarding, culture, handbook, faq, library, education — 7개
   - comm/*: page, calendar
   - universe: members, guests, privacy
   - studio: page, brands(+sub), schedule, assets, workflow(+sub), contacts, settings, universe — 12개
   - ERP 서브페이지 29개: biz/analysis/*, biz/manage/*, biz/plan/*, finance/*, hr/*(certificates, family, gpr/*, people/*, points, staff/*, talent/*), project/rates, settings/*
   - marketing/SmarComm 14개: page, campaigns, leads, deals, analytics, activities, content, crm/*, influencers, organizations, performance, social
   - bums 서브페이지: sites/[siteId]/boards/[boardId], settings, content, widgets

2. **페이지 외곽 max-w 제거 6파일** — `a96bc38`
   - myverse/expenses, todo, attendance, gpr, payroll — `max-w-4xl` 제거
   - erp/approval/draft — `max-w-3xl` 제거
   - 레이아웃의 `max-w-[1200px]`에 통일

**직접 수정한 버그:**
- `project/timesheet` — Rules of Hooks (useMemo 2개가 if(loading) return 뒤에 있어 크래시) → 이동 수정 ✅
- `myverse/messenger` — `-mx-8 -mb-8` 네거티브 마진으로 1200px 초과 → 제거, border + style height로 교체 ✅
- `project/management/new` — PageHeader 중복 import → 제거 ✅

**커밋:** `be3cdb0`, `a96bc38` — push + Vercel 배포 완료

---

## 오늘 한 작업 (4/2 저녁 세션 4)

### 인트라 디자인 일관성 전수 적용 ✅

**IntraUI.tsx 기준 확립:**
- PageHeader: border-b-2 (진한 구분선), description text-xs, children=액션버튼
- TabNav/TabNavCount: 언더라인 스타일 (-mb-[2px]), 기존 pill/segment 스타일 전면 교체
- TabNavCount: 카운트 배지 포함 신규 컴포넌트 추가

**적용 페이지 (43개):**
- myverse: library, timesheet, messenger, approval(기준 템플릿)
- universe: dashboard, subscriptions, bookings, revenue, education
- bums: sites, newsletter, shop, promotion, stats, inquiry, library, boards, content
- ERP: erp/page, hr/people, hr/attendance, hr/payroll, hr/gpr, hr/education, hr/talent, gpr 4개, approval 4개, finance 4개, bi, biz 3개, settings/hr, settings/finance
- agent: Agent Hub

**게시판 DB 구축 (B1 수정):**
- `sql/board-tables.sql` 생성 및 Prod DB 실행 ✅
- board_configs + posts + comments + likes + bookmarks 테이블
- 시드: tenone/madleague/badak 기본 게시판 등록
- bums/boards + bums/content: PageHeader + TabNav 스타일 적용

**커밋:** `cafee53` — 49개 파일 변경, push 완료

---

## 오늘 한 작업 (4/2 저녁 세션 3)

### 버그 수정 ✅

1. **B3 Kanban 0건 수정** — `lib/supabase/workflow.ts` `rowToTask`에 STATUS_MAP/PRIORITY_MAP 추가 ✅
2. **B4 WIO Orbi 로딩 부분수정** — 10초 타임아웃 fallback + 로딩 화면 다크 → 흰색(B&W) ✅
3. **TS 오류 수정** — `app/intra/layout.tsx` `session` 파라미터 명시적 타입 추가 ✅

---

## 오늘 한 작업 (4/2 저녁 세션 2)

### 인트라 레이아웃 일관성 전수 작업 ✅

1. 스크린샷 3개 지적 반영 — BI Dashboard KPI 아이콘 제거, Universe 개인정보 Shield 아이콘 제거, 사이트 관리 DB 연동 뱃지 제거 ✅
2. 인트라 전체 85개 파일 — 아이콘·폰트·색상·구분선 일관성 ✅
3. ERP/Marketing/Studio layout — `bg-neutral-50` 회색 배경 제거 ✅
4. IntraUI 구분선 — `border-neutral-100` → `border-neutral-200` (진하게) ✅
5. Agent 페이지 — 다크테마(`bg-[#0B0D17]`) → 흰 배경 B&W 전환 ✅
6. Wiki 6개 하부 페이지 — 헤더 일관성 통일 ✅
7. Comm BoardPage — `py-8` 이중 패딩 제거, Calendar 표준 헤더 ✅
8. 메신저 — `border-neutral-200` 통일 ✅
9. "내" 접두사 제거 — GPR/결재/근태/급여/경비 ✅

### Bot 전략 기획 ✅
10. `docs/Bot_Strategy_쇠봇_듣봇.md` ✅

---

## 오늘 한 작업 (4/2 저녁)

### 즉시 작업 4종 완료 ✅

1. HeRo Mock 데이터 제거 ✅
2. Prod SQL 6개 실행 ✅
3. 22개 브랜드 layout.tsx generateMetadata() 전환 ✅
4. Google Sites 링크 제거 확인 ✅

---

## 미해결 — 버그

| # | 페이지 | 문제 | 난이도 |
|---|--------|------|--------|
| B2 | Agent Hub 메시지 로그 | 한국어 ◆◆◆ 깨짐 (구형 레코드 한정). ANTHROPIC_API_KEY 환경변수 미설정으로 Mock 응답 중 | 중 |
| B4 | wio.tenone.biz | "Orbi 로딩 중..." — 10초 타임아웃 fallback 적용됨. 근본 원인 미확인 | 중 |

## 미해결 — 도메인

| # | 작업 | 상태 |
|---|------|------|
| D1 | hero.ne.kr → Vercel 도메인 추가 + DNS 설정 | Vercel 대시보드 + 도메인 등록업체 |
| D2 | www.smarcomm.biz → Vercel 도메인 추가 | Vercel 대시보드 |

---

## 다음 할 일

> 집에서 이어서 할 작업. 기준: ROADMAP.md Phase 1

### 🎨 인트라 디자인 마무리 (남은 것)

1. **bums/boards** — board_configs 시드 후 화면 로딩 확인. tenone.biz/intra/bums/boards 접속 → 게시판 목록 보이는지 확인
2. **universe/revenue** — 그래프 색상 B&W 스타일 조정 (현재 컬러풀). `app/intra/universe/revenue/page.tsx`의 차트 색상을 neutral 계열로 변경

### 🤖 Bot 개발 (쇠봇 Phase 1)

1. **Playwright 세션 저장** — `docs/Bot_Strategy_쇠봇_듣봇.md` 참고
   - open.kakao.com에서 별도 계정 웹 로그인 확인 (직접 테스트)
   - Playwright 세션 저장 스크립트 작성
   - `/api/agent/badaksoe` 엔드포인트 이미 구현됨 ✅
   - 수다방 1개 파일럿 테스트

### Phase 1 — 4대 제품 Intra 통제 (4월)

**Mindle (연료 공급)**
- 홈 뉴스레터 폼 → mindle_subscribers DB 연결 확인
- `/intra/bums/newsletter` CRUD 완성
- `mindle_trends` 테이블 + 수동 트렌드 카드 등록 UI

**SmarComm (마케팅 자동화)**
- Coming Soon 해제 → 로그인 후 접근
- `/intra/marketing` ↔ SmarComm WS 데이터 연결

**Agent Hub (운영 엔진)**
- agent-tables.sql 실행 후 `/intra/agent` 테스트
- ANTHROPIC_API_KEY Vercel 환경변수 추가

---

## 참고
- **통합 아키텍처**: `docs/TenOne_Universe_Architecture_v1.md`
- 6계층 설계: `docs/Intra_Universe_Architecture.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- Universe OS: `docs/Universe_OS_Plan.md`

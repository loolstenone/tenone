# 작업 현황

> 마지막 업데이트: 2026-04-02 (사무실)

## 오늘 한 작업 (4/2 사무실)

### 버그 수정 — 6건
1. `app/intra/project/jobs/page.tsx` — React Rules of Hooks 위반 수정. useState 5개가 early return 뒤에 선언돼 있어 크래시. 컴포넌트 최상단으로 이동. ✅
2. `app/intra/project/timesheet/page.tsx` — useMemo (filteredProjects)가 loading early return 뒤에 선언. loading return 앞으로 이동. ✅
3. `app/intra/bums/promotion/page.tsx` — fetchPromos()에 try/catch/finally 없음 → DB 에러 시 무한 스피너. finally 추가. ✅
4. `app/intra/partner-pool/page.tsx` — createPartner 실패 시 silent fail → saveError state 추가, 모달에 오류 메시지 표시. ✅
5. `lib/supabase/erp.ts` — createPartner: brands 테이블 조회 실패 시 tenantId=null graceful fallback. ✅
6. `app/intra/universe/members/page.tsx` — Lv5 배지 색상 bg-amber→bg-rose (레전드 dot 색상과 일치). ✅

### 레이아웃/라우팅 — 2건
7. `app/intra/layout.tsx` — main 내 children wrapper div에 `w-full` 추가 + `overflow-x-hidden`. ✅
8. `middleware.ts` — `smarcomm.tenone.biz` → `/smarcomm` 라우팅 추가. ✅

### 아키텍처 문서
9. `docs/Intra_Universe_Architecture.md` — 인트라↔유니버스 연결 설계 문서 신규 작성. 6계층 모델 (L1설정~L6에이전트), 각 계층별 DB/API/데이터흐름/상태 정의. ✅

### 이전 세션 (4/2 새벽)
10. IntraLayout race condition 해결 — TOKEN_REFRESHED/SIGNED_IN 이벤트에서 JWT is_staff 재확인. ✅
11. LoginModal 즉시 닫기 — Supabase SIGNED_IN 이벤트 직접 구독. ✅
12. 로그인 버튼 아이콘 제거 (LogIn/UserPlus → 텍스트만). ✅
13. UniverseUtilityBar 한국어 (LOG IN→로그인, JOIN→가입). ✅
14. Mindle 전 페이지(9개 파일) 한국어 전환 완료. ✅

### 커밋 히스토리
- `509dc34` — IntraLayout race condition + LoginModal + Mindle 한국어 (헤더/푸터/레이아웃/홈)
- `f7c934c` — Mindle 전 페이지 한국어 전환 (9개 파일)
- `18ba039` — Jobs/Timesheet Rules of Hooks 수정
- `999a9a5` — 프로모션/파트너/레벨색상/레이아웃 수정
- `974d420` — smarcomm.tenone.biz 미들웨어 추가

---

## 미해결 — 버그

| # | 페이지 | 문제 | 난이도 |
|---|--------|------|--------|
| B1 | `/intra/bums/boards` | 클라이언트 크래시. 빌드 통과하지만 런타임 에러. 콘솔 로그 확인 필요 | 중 |
| B2 | Agent Hub 메시지 로그 | 한국어 ◆◆◆ 깨짐. DB 인코딩 또는 저장 시 바이너리 변환 문제 | 중 |
| B3 | Kanban 보드 | 0건 표시. fetchWorkflowTasks가 빈 배열 반환 → Mock fallback 조건 확인 | 하 |
| B4 | wio.tenone.biz | "Orbi 로딩 중..." 다크 스크린. wio_members 멤버십 확인 필요 | 중 |

## 미해결 — 도메인

| # | 작업 | 상태 |
|---|------|------|
| D1 | hero.ne.kr → Vercel 도메인 추가 + DNS(A/CNAME) 설정 | Vercel 대시보드 + 도메인 등록업체에서 설정 |
| D2 | www.smarcomm.biz → Vercel 도메인 추가 | Vercel 대시보드에서 추가 |

## 미해결 — 아키텍처 연동 (docs/Intra_Universe_Architecture.md 참조)

| # | 계층 | 작업 | 우선순위 |
|---|------|------|---------|
| A1 | L1 설정 | `site_configs` 테이블 생성 + 26개 시드 + BUMS 사이트 관리 handleSave 연결 + 브랜드 layout.tsx에서 getSiteConfig() 소비 | ★★★ 즉시 |
| A2 | L2 콘텐츠 | 뉴스레터 발송 시스템 (Resend 또는 SES) | ★★ 단기 |
| A3 | L2 콘텐츠 | 콘텐츠 관리 → 브랜드 사이트 아티클 페이지 연결 | ★★ 단기 |
| A4 | L4 상거래 | subscription_plans + subscriptions 테이블 + 결제 연동 | ★ 중기 |
| A5 | L6 에이전트 | 에이전트 Tool 연동 (WIO 모듈 API → Tool) | ★ 중기 |

## 미해결 — 코드 품질

| # | 작업 |
|---|------|
| Q1 | 인트라 전체 페이지 Rules of Hooks 스캔 (Jobs/Timesheet 외 추가 위반 가능성) |
| Q2 | 인트라 전체 fetchXxx 함수 try/finally 패턴 통일 |
| Q3 | 모바일 반응형 점검 (ROADMAP 0-14) |

---

## 다음 할 일

### 즉시 — A1: L1 site_configs 연동
1. `sql/site-configs-table.sql` 작성 — site_configs CREATE TABLE + 26개 사이트 시드 (lib/site-config.ts의 기존 데이터 기반)
2. `scripts/run-sql.js`로 Prod Supabase 실행
3. `lib/supabase/settings.ts`에 getSiteConfig(), upsertSiteConfig() 추가
4. `app/intra/bums/sites/page.tsx` — handleSave를 upsertSiteConfig()로 교체
5. 각 브랜드 layout.tsx에서 generateMetadata()가 DB 조회하도록 변경 (ISR 10분)
6. 테스트: 인트라에서 HeRo 메타 타이틀 변경 → hero.ne.kr 새로고침 → 반영 확인

### 즉시 — B1: boards 크래시
- 배포 후 크롬 콘솔 에러 메시지 확인 → 원인 특정

### Prod SQL 실행 대기 (이전 세션)
1. `sql/erp-finance-tables.sql`
2. `sql/monthly-forecasts-table.sql`
3. `sql/standard-rates-table.sql`
4. `sql/agent-tables.sql`
5. `sql/workflow-tables.sql`
6. `sql/badaksoe-rooms-table.sql`
7. `supabase/migrations/007_shop_promotions.sql`

---

## 참고
- 아키텍처 설계: `docs/Intra_Universe_Architecture.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- Universe OS: `docs/Universe_OS_Plan.md`

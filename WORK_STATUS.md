# 작업 현황

> 마지막 업데이트: 2026-04-02 (사무실, 저녁 세션 2)

## 오늘 한 작업 (4/2 저녁 세션 2)

### 인트라 레이아웃 일관성 전수 작업 ✅

1. **스크린샷 3개 지적 반영** — BI Dashboard KPI 아이콘 제거, Universe 개인정보 Shield 아이콘 제거, 사이트 관리 DB 연동 뱃지 제거 ✅
2. **인트라 전체 85개 파일** — 아이콘·폰트·색상·구분선 일관성 (에이전트 2회) ✅
3. **ERP/Marketing/Studio layout** — `bg-neutral-50` 회색 배경 제거 ✅
4. **IntraUI 구분선** — `border-neutral-100` → `border-neutral-200` (진하게) ✅
5. **Agent 페이지** — 다크테마(`bg-[#0B0D17]`) → 흰 배경 B&W 전환 ✅
6. **Wiki 6개 하부 페이지** — 헤더 일관성 통일 ✅
7. **Comm BoardPage** — `py-8` 이중 패딩 제거, Calendar 표준 헤더 ✅
8. **메신저** — `border-neutral-200` 통일 ✅
9. **"내" 접두사 제거** — GPR/결재/근태/급여/경비 ✅

### Bot 전략 기획 ✅
10. **TenOne AI Bot 전략 문서 작성** — `docs/Bot_Strategy_쇠봇_듣봇.md` ✅
    - TenOne AI Team 레이어 구조 (L0~L3)
    - 쇠봇: 바닥 직영 7개 채널, 방별 페르소나 정의
    - 듣봇: 외부 방 수신 전용, 리스크 분석
    - 구현 방식: open.kakao.com + Playwright + 공기계 + 별도 계정
    - 공기계·별도 계정 이미 확보 ✅, 방 입장 완료 ✅

---

## 오늘 한 작업 (4/2 저녁)

### 즉시 작업 4종 완료 ✅

1. **HeRo Mock 데이터 제거** — 파트너 로고(카카오·네이버 등), Mock 수치, 최근 매칭 섹션 제거. "파트너 기업 모집 중" UI로 교체. ✅
2. **Prod SQL 6개 실행** — erp-finance-tables, monthly-forecasts, standard-rates, agent-tables, workflow-tables, badaksoe-rooms. `scripts/run-sql.js` 작성 + PAT 토큰 `sbp_c219...` 사용. ✅
3. **22개 브랜드 layout.tsx generateMetadata() 전환** — static metadata → async generateMetadata() + getSiteConfigServer(). DB 우선, static fallback. ✅
4. **Google Sites 링크 제거** — 코드 전체 검색 결과 Google Sites 링크 없음 확인. /about, /universe, /history 모두 내부 Next.js 페이지. ✅

### 커밋 히스토리 (4/2 저녁)
- `cc875e5` — feat: 22개 브랜드 layout.tsx generateMetadata() DB 연동 전환
- `ac4a13b` — fix: HeRo 파트너 기업 Mock 데이터 제거
- `207e154` — docs: 개발 계획 전면 재수립 — 4대 제품 Intra 통제 체계
- `8c39f0d` — fix: Multiple GoTrueClient 제거 + 브랜치 정책 master 단일화

### 4/2 오전·오후 세션 (이전)
- A1: site_configs DB 연동 (테이블·시드·getSiteConfigServer·intra/bums/sites 연동) ✅
- Multiple GoTrueClient 버그 수정 (chat.ts → singleton 전환) ✅
- 4대 제품 체계 기반 개발 계획 수립 + ROADMAP/CLAUDE.md 전면 업데이트 ✅

### 문서
5. `docs/TenOne_Universe_Architecture_v1.md` — 텐원 정리 아키텍처 문서 프로젝트에 복사. ✅
6. 아키텍처 문서 분석 완료 — 6개 잘된 점 + 5개 보완점 도출. ✅

### 데이터 보정
7. Korea360 반영 — site_configs DB에 seoul360 site_id / Korea360 이름·도메인으로 입력. ✅

### 이전 세션 (4/2 오전)
- 버그 6건 + 레이아웃 2건 + 아키텍처 설계문서 작성 (상세는 아래 커밋 참조)

### 커밋 히스토리
- `5e33cb9` — 작업 종료 — WORK_STATUS + CHANGELOG + Intra-Universe 아키텍처
- `974d420` — smarcomm.tenone.biz 미들웨어 추가
- `999a9a5` — 프로모션/파트너/레벨색상/레이아웃 수정
- `18ba039` — Jobs/Timesheet Rules of Hooks 수정

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

## 미해결 — 아키텍처 연동

| # | 계층 | 작업 | 우선순위 |
|---|------|------|---------|
| A1-5 | L1 설정 | 브랜드 layout.tsx 24개에서 generateMetadata()가 DB 조회하도록 변경 (ISR 10분). `getSiteConfigServer()` 사용 | ★★★ 즉시 |
| A1-6 | L1 설정 | 테스트: 인트라에서 HeRo 메타 타이틀 변경 → 브랜드 사이트 새로고침 → 반영 확인 | ★★★ 즉시 |
| A2 | L2 콘텐츠 | 뉴스레터 발송 시스템 (Resend 또는 SES) | ★★ 단기 |
| A3 | L2 콘텐츠 | 콘텐츠 관리 → 브랜드 사이트 아티클 페이지 연결 | ★★ 단기 |
| A4 | L4 상거래 | wio_subscription_plans + wio_subscriptions 테이블 + 결제 연동 | ★ 중기 |
| A5 | L6 에이전트 | 에이전트 Tool 연동 (WIO 모듈 API → Tool) | ★ 중기 |

## 미해결 — 코드 품질

| # | 작업 |
|---|------|
| Q1 | 인트라 전체 페이지 Rules of Hooks 스캔 (Jobs/Timesheet 외 추가 위반 가능성) |
| Q2 | 인트라 전체 fetchXxx 함수 try/finally 패턴 통일 |
| Q3 | 모바일 반응형 점검 (ROADMAP 0-14) |

---

## 다음 할 일

> 기준: ROADMAP.md 재수립 (2026-04-02) — 4대 제품 Intra 통제 체계

### 🤖 Bot 개발 (집에서 시작 가능)

1. **쇠봇 Phase 1** — `docs/Bot_Strategy_쇠봇_듣봇.md` 참고
   - open.kakao.com에서 별도 계정 웹 로그인 되는지 확인 (직접 테스트)
   - Playwright 세션 저장 스크립트 작성
   - `/api/agent/badaksoe` 엔드포인트 구현
   - 수다방 1개 파일럿 테스트

### 🚨 즉시 — 리스크 제거 + 기반 완성

1. **HeRo Mock 데이터 제거** (법적 리스크)
   - `/hero` 파트너 섹션: 카카오·네이버·쿠팡·토스 등 실제 파트너 아닌 로고 제거
   - Mock 수치 (매칭 100+건, 파트너 50+개) 제거 또는 "예시" 명시

2. **Prod SQL 실행** (Claude가 scripts/run-sql.js로 직접 실행)
   - `sql/erp-finance-tables.sql`
   - `sql/monthly-forecasts-table.sql`
   - `sql/standard-rates-table.sql`
   - `sql/agent-tables.sql` ← Universe OS Phase 1
   - `sql/workflow-tables.sql`
   - `sql/badaksoe-rooms-table.sql`
   - `supabase/migrations/007_shop_promotions.sql`

3. **site_configs 완전 연동** (L1 설정 레이어 — 26개 사이트 SEO 통제)
   - `/intra/bums/sites/[siteId]/settings` handleSave → DB upsert
   - 24개 브랜드 layout.tsx: `export const metadata` → `generateMetadata()` + `getSiteConfigServer(siteId)`
   - 테스트: Intra에서 HeRo 타이틀 변경 → 브랜드 사이트 반영 확인

4. **Google Sites 링크 제거**
   - 네비게이션 /about, /universe, /history → Next.js 내부 페이지 확인

### Phase 1 — 4대 제품 Intra 통제 (4월 이후)

**Mindle (연료 공급)**
- 홈 뉴스레터 폼 → mindle_subscribers DB 연결 확인
- `/intra/bums/newsletter` CRUD 완성
- `mindle_trends` 테이블 생성 + 수동 트렌드 카드 등록 UI

**SmarComm (마케팅 자동화)**
- Coming Soon 해제 → 로그인 후 접근 가능으로 전환
- `/intra/marketing` ↔ SmarComm WS 데이터 연결 (WIO MKT-* 공유)

**Agent Hub (운영 엔진)**
- agent-tables.sql 실행 후 `/intra/agent` 테스트
- 바당쇠: `/api/agent/badaksoe` 엔드포인트 구현

**아키텍처 결정 사항 (논의 필요)**
- ChangeUp 라우트: `/changeup` vs `/madleague/changeup`
- Korea360 vs Seoul360 site_id 통일
- NatureBox: 독립 vs Townity 산하

### Phase 2 — 구독 인프라 (5월)
- `wio_subscription_plans` + `wio_subscriptions` 테이블 생성
- 결제 PG 연동 (토스페이먼츠 or 포트원)
- Mindle 구독 결제 흐름 구현

---

## 참고
- **통합 아키텍처**: `docs/TenOne_Universe_Architecture_v1.md` ← 단일 기준 문서
- 6계층 설계: `docs/Intra_Universe_Architecture.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- Universe OS: `docs/Universe_OS_Plan.md`

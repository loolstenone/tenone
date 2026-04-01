# 작업 현황

> 마지막 업데이트: 2026-04-02 (사무실, 오후 세션)

## 오늘 한 작업 (4/2 오후)

### A1: L1 site_configs DB 연동 — 4/6 완료
1. `sql/site-configs-table.sql` — CREATE TABLE + features 컬럼 + 24개 사이트 시드 작성. ✅
2. Prod Supabase 실행 — 24개 사이트 입력 확인 (PAT 토큰 갱신 포함). ✅
3. `lib/supabase/site-configs.ts` — getSiteConfig, getSiteConfigServer(ISR 10분), getAllSiteConfigs, upsertSiteConfig 신규 작성. ✅
4. `app/intra/bums/sites/page.tsx` — DB 연동 전면 리팩터. DB가 있으면 DB 데이터, 없으면 static fallback. handleSave가 실제 upsertSiteConfig() 호출. 저장 상태/에러 표시. DB 연동 배지 표시. ✅
5. 브랜드 layout.tsx generateMetadata() DB 소비 변경 — ⬜ 미완료
6. 테스트 — ⬜ 미완료

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

### 즉시 — A1 마무리: 브랜드 layout.tsx DB 연동
1. 24개 브랜드 layout.tsx에서 `export const metadata` → `export async function generateMetadata()` 변경
2. `getSiteConfigServer(siteId)` 호출, DB 값이 있으면 DB 우선, 없으면 기존 static fallback
3. ISR 10분 캐시 적용 (getSiteConfigServer 내부에 `next: { revalidate: 600 }` 이미 설정됨)
4. 테스트: 인트라 BUMS > 사이트 관리에서 HeRo 메타 타이틀 변경 → hero.ne.kr 새로고침 → 반영 확인

### 즉시 — 아키텍처 문서 논의
텐원 정리 `docs/TenOne_Universe_Architecture_v1.md` 분석에서 나온 보완점 5가지 논의:
1. site_configs 스키마 차이 (문서 vs 실제) — features JSONB는 이미 반영. 나머지 개별 컬럼 vs JSONB 결정
2. ChangeUp 라우트: `/changeup` (현재) vs `/madleague/changeup` (문서) — 정책 결정
3. Korea360 vs Seoul360 — DB는 korea360.net으로 반영 완료. 코드 site_id `seoul360` → `korea360` 리네이밍 여부
4. NatureBox 위치 — Townity 산하인지 독립인지
5. SmarComm Workspace `/smarcomm/workspace` 라우트 예약 시점
+ §11 모순 방지 체크리스트 → CLAUDE.md 추가 여부

### B1: boards 크래시
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
- **통합 아키텍처**: `docs/TenOne_Universe_Architecture_v1.md` ← 단일 기준 문서
- 6계층 설계: `docs/Intra_Universe_Architecture.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- Universe OS: `docs/Universe_OS_Plan.md`

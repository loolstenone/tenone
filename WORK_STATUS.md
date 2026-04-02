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

> 기준: ROADMAP.md 재수립 (2026-04-02) — 4대 제품 Intra 통제 체계

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

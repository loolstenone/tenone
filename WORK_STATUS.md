# 작업 현황

> 마지막 업데이트: 2026-04-07 (집, 세션 25)

---

## 다음 할 일

### 1. HIT D/E/F DB 테이블 생성
에이전트가 생성한 SQL 파일 3개를 Supabase에서 실행:
- `sql/hit_d_results.sql` — HIT D 결과 테이블
- `sql/create_hit_e_results.sql` — HIT E 결과 테이블
- `sql/hit_f_results.sql` — HIT F 결과 테이블
방법: `execute_sql` MCP 도구로 직접 실행하면 됨.

### 2. HIT C~F 빌드 검증 + 통합 테스트
- `npx next build` 통과 확인 (D/E/F 에이전트가 만든 파일 포함)
- 각 단계 인트로 → 테스트 → 채점 → 결과 페이지 E2E 흐름 확인
- `lib/hit/router.ts`에서 C/D/E/F로 올바르게 분기하는지 확인

### 3. Resend 중복 API Key 정리
Resend 대시보드에서 이전 키(`re_BmnLPwZj...`) 삭제. 현재 사용 키: `re_UdpdKBdW...`

### 4. Vercel 재배포
환경변수 3개(RESEND_API_KEY, NEWSLETTER_FROM_EMAIL, NEWSLETTER_FROM_NAME) 추가 후 재배포.
뉴스레터 테스트 발송 1건 확인.

### 5. Hero 구독 API
`/api/hero/subscribe` (HIT 완료 검증 + DB INSERT) — 미착수

### 사용자 결정 후
- PG 연동: 토스페이먼츠/포트원 선택 후 진행
- 도메인: hero.ne.kr Vercel 연결, fwn.co.kr DNS 확인

---

## 현재 DB 상태 (2026-04-07 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| agent_profiles | 21개 | L0×1, L1×3, L2×17 (에이전트+챗봇) |
| agent_messages | - | RLS 정책 추가 (am_select_own: 본인 메시지 읽기) |
| mindle_trends | 52건 | 11개 카테고리 표준화 완료 |
| subscriber_tags | 신규 | 구독자 태그 관리 테이블 |
| newsletter_issues | - | from_name, target_site_ids, target_tags 컬럼 추가 |
| hit_c_results | 스키마 존재 | HIT C 결과 테이블 (DB에 이미 있을 수 있음) |
| hit_d_results | SQL만 | sql/hit_d_results.sql 실행 필요 |
| hit_e_results | SQL만 | sql/create_hit_e_results.sql 실행 필요 |
| hit_f_results | SQL만 | sql/hit_f_results.sql 실행 필요 |

---

## 오늘 한 작업 (4/7 집, 세션 25)

### Resend 메일링 설정 완료 ✅
- resend.com 가입 (Google OAuth, lools@tenone.biz)
- tenone.biz 도메인 인증 완료 (DKIM/SPF/DMARC DNS 레코드 → 가비아)
- API Key 생성 → .env.local + Vercel 환경변수 등록
- From: noreply@tenone.biz, Reply-To: lools@tenone.biz

### 뉴스레터 발송 고도화 ✅
- subscriber_tags 테이블 신규 + newsletter_issues에 from_name/target_site_ids/target_tags 컬럼 추가
- `/api/newsletter/send` — fromName(브랜드별 From 이름)/siteIds(사이트 필터)/tags(태그 필터) 파라미터 추가
- 발송 설정 모달: 브랜드 선택 드롭다운 + 사이트 타겟 체크박스 + 태그 타겟 체크박스 + 예상 수신자 수 실시간 표시
- 구독자 목록에 사이트/태그 컬럼 추가, 인라인 태그 추가/삭제

### daily-gpr Edge Function ✅
- `supabase/functions/daily-gpr/index.ts` — wio_gpr 현황 + gpr_goals 달성률 → 1001 PM 브리핑
- `app/api/cron/daily-gpr/route.ts` — Vercel Cron 트리거
- vercel.json: `"0 9 * * *"` (KST 18:00)

### WIO People 모듈 DB 전환 (6/7) ✅
- gpr/evaluation: Mock 폴백 제거 → DB only
- talent: Mock 폴백 제거 → DB only
- org 조직도: DB 구조 불일치로 보류

### CRM + Marketing Mock 폴백 제거 (14개 파일) ✅
- CRM: people, segments, mentors, professionals, students
- Marketing: campaigns, leads, content, deals, organizations, page(대시보드), analytics, performance, activities

### AA팀 전면 수리 ✅
- P1: agent_messages RLS `am_select_own` 정책 추가, messages API 인증, vrief 필드명 수정
- P2: invoke 3중→2중 호출 최적화 (합성 조건부 스킵)
- P3: 독대 마크다운 렌더링, "열시일분이 분석 중..." 타이핑, 에러 재시도 버튼, 히스토리 페이지네이션

### HIT C~F 전체 구현 ✅
- HIT C "어디로 이직?" — 60문항/4모듈, 문항+채점+API 5개+페이지 4개
- HIT D "시니어 리더십 전환?" — 70문항/4모듈, 문항+채점+API 5개+페이지 4개
- HIT E "인생 2막?" — 60문항/4모듈, 문항+채점+API 5개+페이지 4개
- HIT F "경력 공백 복귀?" — 55문항/4모듈+CVI 연동, 문항+채점+API 5개+페이지 4개
- ⚠️ D/E/F DB 테이블 실행 필요 (sql 파일 3개)

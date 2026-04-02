# 작업 현황

> 마지막 업데이트: 2026-04-03 (집, 세션 7 — 작업 종료)

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

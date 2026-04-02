# 작업 현황

> 마지막 업데이트: 2026-04-03 (집, 세션 7 — 작업 중)

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
- Agent Hub DB 검증 (8개 에이전트 프로필)
- /api/agent/vrief — 10:01 AM/PM 브리핑 프로토콜 API

### Phase 2-A: 구독 인프라 ✅
- lib/supabase/wio.ts: 구독 CRUD 5개 함수 + hasAccess() 미들웨어
- /api/subscription: GET/POST/PATCH
- /api/subscription/access: 접근 권한 확인 API
- wio_subscription_plans 11개 플랜 시드 확인 (WIO 5 + SmarComm 4 + Mindle 2)

### Phase 3-A: Whole See 크롤러 기초 ✅
- /api/crawler POST — RSS 소스 크롤 → collected_data 저장
- collected_data에 status/category/published_at 추가 + url unique 인덱스
- mindle_sources 5개 RSS 소스 시드 확인

### Phase 3-B: 바당쇠 ✅ (이전 세션 구현 확인)
- /api/agent/badaksoe — Room 페르소나 전환 + Claude 에이전트 호출 완성
- badaksoe_rooms 테이블 + 시드 확인

### 커밋 기록
- `bb82636` Phase 0 + Phase 1 (27파일)
- `50dff98` Mindle trends DB + 10:01 Vrief API
- `722b26f` Phase 2-A 구독 인프라
- `fb9358f` Phase 3-A Whole See 크롤러

---

## 미해결 — 사용자 액션 필요

| # | 작업 | 상태 |
|---|------|------|
| U1 | ANTHROPIC_API_KEY Vercel 환경변수 → Redeploy | Vercel에 추가됨, Redeploy 필요 |
| U2 | PG 선택 (토스페이먼츠/포트원) | 비즈니스 결정 |
| U3 | SmarComm 가격 체계 확정 (대행 vs SaaS) | 비즈니스 결정 |
| U4 | WIO pricing 가격 체계 확정 (per-user vs 고정가) | 비즈니스 결정 |

## 미해결 — 버그

| # | 페이지 | 문제 | 난이도 |
|---|--------|------|--------|
| B2 | Agent Hub 메시지 로그 | 한국어 깨짐 (구형 레코드). ANTHROPIC_API_KEY 설정 후 해소 예상 | 중 |

## 미해결 — 도메인

| # | 작업 | 상태 |
|---|------|------|
| D1 | hero.ne.kr → Vercel 도메인 | 대시보드 설정 |
| D2 | www.smarcomm.biz → Vercel 도메인 | 대시보드 설정 |

---

## 다음 할 일

### Phase 2-B: PG 연동 (사용자 결정 후)
1. PG 선택 확정 → SDK 설치
2. Mindle 구독 결제 흐름: /mindle/pricing → 결제 → wio_subscriptions
3. 결제 webhook → 구독 자동 활성화

### Phase 3-C: 10:01 자동 브리핑 (ANTHROPIC_API_KEY 설정 후)
1. GCP Scheduler → /api/agent/vrief 자동 호출 (AM/PM)
2. 카카오톡 전송 연동

### Phase 4 (하반기)
- Mindle 뉴스레터 1호 발송
- Badak/MADLeague/HeRo 사이트 공개
- GPR·Finance 실DB 완성

---

## 참고
- 통합 아키텍처: `docs/TenOne_Universe_Architecture_v1.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- 아이덴티티: `docs/Identity_Architecture.md`
- Universe OS: `docs/Universe_OS_Plan.md`

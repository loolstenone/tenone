# 작업 현황

> 마지막 업데이트: 2026-04-03 (집, 세션 7)

## 오늘 한 작업 (4/3 집 세션 7)

### Phase 0: 테넌트 격리 기반 구축 ✅

**0-A. tenant_id 일괄 추가 (80개 테이블)** ✅
- 격리 없는 테이블 85개 → 5개(시스템 테이블)로 감소
- `sql/phase0-tenant-id.sql` — 80개 테이블에 `tenant_id TEXT DEFAULT 'tenone'` 추가
- 기존 NULL 행 → 'tenone' 일괄 업데이트
- 핵심 11개 테이블에 인덱스 추가
- 의도적 제외: brands, site_configs, sso_tokens, wio_subscription_plans, wio_tenants

**0-B. 아이덴티티 계층 문서화** ✅
- `docs/Identity_Architecture.md`에 Tier 4 (테넌트 격리 + WIO 서비스) 섹션 추가
- tenant_id vs brand_id 관계 명시
- Phase 0 완료 사항 체크리스트 추가

**0-D. WIO 서비스 인프라 테이블** ✅
- `sql/phase0-service-infra.sql` — `wio_tenant_configs`, `wio_feature_flags` 생성
- `wio_subscription_plans`에 `service_type` 컬럼 추가 ('standard' | 'custom')
- 기본 feature flags 시드 (max_members, max_projects, storage 등 8개)
- RLS + 인덱스 적용

**0-C. 중복 테이블 정리 — 보류** ⏸️
- expenses(5행) vs wio_expenses(0행): 스키마 차이 큼 (expenses가 더 완성도 높음)
- 원칙: "기존 동작하는 건 건드리지 않는다. 격리 구조만 씌운다."
- Phase 0-A로 expenses에 tenant_id 추가 완료 → 격리 준비됨
- 통합은 스키마 정리 후 별도 작업으로

### 문서 업데이트 ✅
- `CLAUDE.md` — WIO 2-Tier 모델, Tech Flywheel, 8원칙(#8 신설), 테넌트 격리 아키텍처, DB 3분류
- `ROADMAP.md` — Phase 0 삽입, 2-Tier 모델 명시
- `lib/supabase/erp.ts` — tenant_id 안내 주석 + DEFAULT_TENANT 상수 추가

### 이전 세션(세션 6+) 미커밋 코드 포함
- Scenario E/F: myverse/expenses 폼 연결, erp/finance/expenses 모달, approval↔expense 동기화
- erp/bi 0으로 나누기 수정
- approvals 테이블 reference_id/reference_type 컬럼 추가

---

## 미해결 — 버그

| # | 페이지 | 문제 | 난이도 |
|---|--------|------|--------|
| B2 | Agent Hub 메시지 로그 | 한국어 ◆◆◆ 깨짐 (구형 레코드 한정). ANTHROPIC_API_KEY 환경변수 미설정으로 Mock 응답 중 | 중 |

## 미해결 — 도메인

| # | 작업 | 상태 |
|---|------|------|
| D1 | hero.ne.kr → Vercel 도메인 추가 + DNS 설정 | Vercel 대시보드 + 도메인 등록업체 |
| D2 | www.smarcomm.biz → Vercel 도메인 추가 | Vercel 대시보드 |

---

## 다음 할 일

> Phase 0 완료. Phase 1(4대 제품 Intra 통제)로 진행.

### Phase 1-A. Mindle 관리 (연료 공급 시스템)
1. **뉴스레터 구독 DB 연동 확인** — `mindle_subscribers` 테이블 → 홈 폼 연결. `app/(public)/page.tsx`의 뉴스레터 폼이 DB에 저장하는지 확인
2. **`/intra/bums/newsletter`** — mindle_subscribers CRUD 완성
3. **트렌드 카드 관리** — `mindle_trends` 테이블 확인 + Intra에서 수동 등록 UI

### Phase 1-D. Agent Hub 활성화 (운영 엔진)
1. **ANTHROPIC_API_KEY** — Vercel 환경변수 추가 (사용자가 직접)
2. **agent-tables.sql** 실행 후 `/intra/agent` 테스트

### 기타
- OpenClaw: `openclaw auth add --provider anthropic` + `openclaw gateway start` (사용자가 직접)
- 메뉴명/URL 구조 정리 (사용자가 별도 진행 중)

---

## 참고
- **통합 아키텍처**: `docs/TenOne_Universe_Architecture_v1.md`
- 6계층 설계: `docs/Intra_Universe_Architecture.md`
- WIO 마스터: `docs/WIO_Master_Architecture.md`
- Universe OS: `docs/Universe_OS_Plan.md`
- 아이덴티티: `docs/Identity_Architecture.md`

# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-04-22 (세션 78) — HeRo Matching Tetrad 인프라 구축 (Phase 0~3)

### 목표
Tetrad 매칭 설계(TIH × HIT + JD × JH)를 실제 DB·인프라로 구현. 비회원→회원→유료 funnel과 Universe Badge 통합.

### DB 마이그레이션 (배포 완료)
- **hero_profiles 자동 동기화 트리거**: hit_{a~f}_results INSERT/UPDATE 시 member_id 기반 upsert (6 트리거)
- **uc_earn_rules 16종 시드**: HeRo 전용 액션 (HIT 완료 · JH 작성 · TIH/JD 등록 · 매칭 성사 · Badge opt-in)
- **hero_company_members**: members × hero_companies N:M 연결 (role 3종 · status 3종 · RLS)
- **hero_tih_responses 확장**: company_id + submitted_by_member_id FK
- **hero_jd**: 7블록 JSONB 스키마 + draft/published/archived + derived_vector
- **hero_jh_responses**: 12문항 + practical_filters + derived_axes + 본인만 RLS
- **uc_earn_rules unique index** (action_key + brand_id)

### 신규 API
- `POST /api/hero/company/register` — 기업 가입 + representative 연결 + 기존 TIH 자동 link

### 수정 파일 (코드)
- `app/(HeRo)/hero/hit/{a,b,c,d,e,f}/page.tsx` — useAuth로 memberId를 session POST body에 전달

### 신규 파일 (Intra)
- `app/intra/hero/companies/page.tsx` — 기업 풀 + Reputation Vector + 담당자 승인
- `app/intra/hero/jd/page.tsx` — JD 7블록 상세 뷰어 + 상태 필터
- `app/intra/hero/jh/page.tsx` — JH 12문항 상세 + 실무 필드
- `app/intra/hero/hero-types/page.tsx` — 64 영웅 유형 편집기 (Universe Badge SSOT)

### 신규 SQL 파일
- `sql/hero-profiles-auto-sync.sql`
- `sql/hero-uc-earn-rules.sql`
- `sql/hero-company-members.sql`
- `sql/hero-jd-jh.sql`

### 가이드 업데이트
- `app/(HeRo)/CLAUDE.md` 전면 개편 (+402줄):
  - Matching Tetrad 제품 본질
  - Funnel 3단계 × 2주체 (개인 5 / 기업 3)
  - HIT Hero Type = Universe-wide Identity Badge
  - Universe 공통 SSOT 적용 원칙 (INDUSTRIES · JOB_FUNCTIONS · UC · Capability)
  - DB 테이블·필드 네이밍 체계
  - HIT 정의 정정: Holland Interest → **HeRo Identification Test**

### 결정사항
- **질문 DB 단일화는 Phase 5로 보류**: 24개 하드코딩 `.ts` 유지 + DB 공존
- **Universe Badge opt-in UI**(Phase 3-A): 전 브랜드 프로필 영향 → 별도 세션에서 작업
- **나머지 HIT 구성/질문 편집 UI**: Phase 4 매칭 엔진 후 통합 질문 관리 구축 시 함께

### 진단 결과
- `hit_sessions` 16건 · `hit_a_results` 6건 · `hit_b_results` 3건 **모두 member_id NULL**: HIT intro 페이지에서 memberId 미전달 → 수정됨
- `hero_tih_responses` 0건: 코드 정상, 실유입 부재 → 실기기 검증 필요
- 기존 6건 HIT-A 결과: 이메일·세션 식별 불가 → 복구 불가 확정
- `hero_profiles` 0건: 트리거 배포로 향후 자동 생성

### Tetrad 사용자 측 완성 (Phase 2-5 + 확장)

**JH (인재 측 Job Hope):**
- `lib/hero/jh-questions.ts` — 12문항 정의 (pick2/pick3/single/text)
- `app/api/hero/jh/route.ts` — GET (조회) · POST (upsert · 11필수 모두 답 시 status=active)
- `app/(HeRo)/hero/jh/page.tsx` — 조회 + 수정 진입 (미작성 시 CTA)
- `app/(HeRo)/hero/jh/write/page.tsx` — 12문항 단일 페이지 · sticky 진행률 · localStorage 자동저장 · 실무 매칭 필드 (규모·근무형태·지리·처우 하한)
- `app/(HeRo)/hero/my/page.tsx` — HitProfileBadge 아래 JH 카드 추가 (none/draft/active 상태별)

**기업 측 (Company + JD):**
- `app/(HeRo)/hero/company/page.tsx` — 기업 허브 (active/pending 기업 + 신규 등록 CTA)
- `app/(HeRo)/hero/company/register/page.tsx` — 기업 신규 등록 (INDUSTRIES 공통 · SIZE_OPTIONS)
- `app/(HeRo)/hero/company/[id]/jd/page.tsx` — 해당 기업의 JD 목록 + 상태 배지
- `app/(HeRo)/hero/company/[id]/jd/new/page.tsx` · `[jdId]/page.tsx` — 신규/편집 (JDEditor 재사용)
- `features/hero/JDEditor.tsx` — 7블록 에디터 컴포넌트 + ArrayInput (Enter 추가·삭제)
- `app/api/hero/jd/route.ts` — GET (목록/단일) · POST (upsert) · active 담당자만, viewer는 읽기만

### Tetrad 사용자 플로우 전체

```
인재 funnel:
  [HIT 검사] → [회원 전환] → [JH 작성] → hero_jh_responses.status='active'
                                          ↓
                                    매칭 엔진 대상

기업 funnel:
  [기업 등록] → [TIH 제출] → [JD 작성·발행] → hero_jd.status='published'
                                                ↓
                                          매칭 엔진 대상
```

### Phase 4-5+4-6 매칭 워크플로우 + AI 큐레이션

**매칭 lifecycle (DB 배포):**
- hero_matches 8-state CHECK 제약: proposed/curated/contacted/interviewing/trial/hired/declined/withdrawn
- tih_response_id · jd_id · jh_response_id · match_score_breakdown · risk_notes · curator_member_id · status_changed_at 추가
- status 변경 시 자동 timestamp 트리거

**매칭 API:**
- POST /api/hero/matching: 후보 → proposed INSERT (중복 체크)
- GET /api/hero/matching: 필터 (companyId/memberId/status)
- PATCH /api/hero/matching/[id]: status 전이 + 피드백/만족도/수수료 업데이트
- GET /api/hero/matching/[id]: 단일 조회

**Intra 매칭 관리 확장:**
- 후보 카드 "매칭 제안" 버튼
- 매칭 이력 테이블: 상태 색상 배지 · 허용 전이만 버튼 표시 · AI 생성/보기 컬럼

**AI 큐레이션 (Phase 4-6):**
- hit_ai_prompts 'tetrad_match_v1' 프롬프트 시드 (Sonnet 4, 2500 tokens)
- POST /api/hero/matching/[id]/curate:
  1. 매칭 + TIH + JH + JD + HIT A/B 병렬 로드
  2. 프롬프트 템플릿 {{TIH_JSON}} 등 치환
  3. Anthropic SDK 호출 → JSON 파싱
  4. ai_match_report 저장 + proposed → curated 전이
- Intra 큐레이션 뷰 모달:
  - for_company (기업에게, blue-tinted)
  - for_talent (인재에게, rose-tinted)
  - signal_notes (양쪽 비공개 주의 신호, amber)
  - 비공개 원칙 안내

---

### Phase 4 매칭 엔진 v1 (추가)

**벡터 추출 트리거 (DB 배포):**
- `extract_tih_vectors()`: TIH JSONB → Section 0/2/3 파생 컬럼 + risk_flags (블랙 플래그)
- `extract_jh_axes()`: JH 12문항 → derived_axes JSONB (12 키 표준화)
- `extract_jd_vector()`: JD blocks → derived_vector (품질/구조 지표)

**매칭 엔진 SQL 함수 (DB 배포):**
- `hero_match_candidates_for_tih(_tih_id)`: 기업→인재 후보 + 점수 breakdown
- `hero_match_candidates_for_jh(_jh_id)`: 인재→기업 역방향 큐레이션

**블랙 플래그 자동 감지:**
- TIH Section 4 q2(이탈 사유), q3(의사결정 속도), q5(실수 대응) → risk_flags
- JH avoid_traits 교차 체크 → conflict 문자열 (blame_culture vs avoid_a 등)

**신규 파일:**
- `sql/hero-matching-vectors.sql`
- `sql/hero-matching-engine-v1.sql`
- `app/intra/hero/matching/page.tsx` — TIH 클릭 → RPC로 실시간 후보 계산 · 점수 breakdown · 블랙 플래그 경고

**대시보드:**
- HeRo Intra 대시보드에 Tetrad 지표 4개 + Funnel 가시화 추가

---

## 2026-04-22 (세션 77) — Priority 4브랜드 실데이터 연동 + 빌드 에러 수정

### 신규/수정 파일
- `app/intra/ums/madleap/page.tsx` — 대시보드 실데이터 (mad_applications brand_id='madleap')
- `app/intra/ums/madleap/applications/page.tsx` — 4단계 심사 (pending/reviewing/accepted/rejected)
- `app/intra/ums/madleap/members/page.tsx` — 승인된 회원 목록
- `app/intra/ums/madleap/courses/page.tsx` — 강좌 관리 stub
- `app/intra/ums/madleap/cs/page.tsx` — 고객문의
- `app/intra/ums/montz/page.tsx` — 대시보드 실데이터 (montz_creators/works/auditions)
- `app/intra/ums/montz/members/page.tsx` — 창작자 목록 (type 필터, verified 배지)
- `app/intra/ums/youinone/page.tsx` — 대시보드 (capability model + wio_projects)
- `app/intra/ums/youinone/applications/page.tsx` — capability model 승인/거절 (valid_until + INSERT)
- `app/intra/ums/youinone/members/page.tsx` — 승인 멤버 목록
- `app/intra/ums/youinone/revenue/page.tsx` — WIO 타임시트 연동 준비 중 stub
- `app/intra/ums/youinone/cs/page.tsx` — 고객문의
- `app/intra/ums/smarcomm/page.tsx` — 대시보드 (wio_subscription_plans service_type='smarcomm')
- `app/intra/ums/smarcomm/revenue/page.tsx` — 플랜별 구성 + MRR + 수익화 로드맵
- `app/intra/ums/smarcomm/members/page.tsx` — 구독 회원 목록
- `app/intra/ums/smarcomm/cs/page.tsx` — 고객문의
- `app/api/intra/jakka/sellers/route.ts` — getAdmin() 래퍼 (GET+POST 모두)
- `app/api/intra/jakka/market/route.ts` — getAdmin() 래퍼
- `app/api/intra/jakka/showcases/route.ts` — getAdmin() 래퍼 (GET+POST)

### 수정사항
- Jakka 3개 API route: module-level `createClient(SERVICE_ROLE_KEY)` → `getAdmin()` 함수 래퍼 (Next.js 빌드 타임 env 미로드 에러 수정)

---

## 2026-04-22 (세션 76) — Intra Universe 브랜드별 관리 체계 전면 구축

### 신규 파일 (45개)
- `lib/intra-nav.ts` — 전 브랜드 children 탭 구조 정의 (badge:soon 제거 → 탭 배열 추가)
- `app/intra/gravity/cs/page.tsx` — Brand Gravity™ 고객문의
- `app/intra/gravity/revenue/page.tsx` — Brand Gravity™ 손익관리 (3Phase 로드맵)
- `app/intra/hero/page.tsx` — HeRo 대시보드 리팩 (stats + 빠른 이동)
- `app/intra/hero/cs/page.tsx` — HeRo 고객문의
- `app/intra/ums/jakka/members/page.tsx` — JAKKA 회원(창작자) 관리 분리
- `app/intra/ums/jakka/cs/page.tsx` — JAKKA 고객문의
- `app/intra/ums/madleague/members/page.tsx` — MADLeague 회원 관리 분리
- `app/intra/ums/madleague/applications/page.tsx` — MADLeague 심사 관리
- `app/intra/ums/madleague/articles/page.tsx` — MADLeague 콘텐츠 관리
- `app/intra/ums/madleague/cs/page.tsx` — MADLeague 고객문의
- `app/intra/ums/mindle/revenue/page.tsx` — Mindle 손익관리 (뉴스레터 구독 stats)
- `app/intra/ums/mindle/cs/page.tsx` — Mindle 고객문의
- `app/intra/ums/rook/` — RooK 대시보드·회원·커뮤니티·CS 4파일
- `app/intra/ums/townity/` — Townity 대시보드·회원·모임·커뮤니티·CS 5파일
- `app/intra/ums/domo/` — Domo 대시보드·회원·심사·모임·CS 5파일
- P4 브랜드 16개 대시보드 stub: 0gamja/ChangeUp/Dokdae/FWN/Korea360/LUKI/MADLeap/MoNTZ/Mullaesian/MyVerse/NamingFactory/NatureBox/Seoul360/SmarComm/TrendHunter/YouInOne

### 결정사항
- 공통 탭 순서 표준: 대시보드(1) → 회원관리(2) → 손익관리(결제 있는 브랜드만) → 브랜드 특화 → 고객문의(마지막)
- P4 브랜드는 nav 탭 구조만 확정하고 실제 데이터 페이지는 추후 구현 (stub + badge:soon)
- `.then(({ data }) =>` 패턴 → `.then(res =>` 로 TS strict 모드 대응

---

## 2026-04-22 (세션 75) — HeRo TIH UX 전면 정비

### 수정 파일
- `app/(HeRo)/hero/search-light/page.tsx` — 버튼명 "인재 찾기 의뢰", 사전 등록 섹션 제거
- `app/(HeRo)/hero/search-light/tih/page.tsx` — Section0 HeRo 트랙 제거, 3축 배분 재디자인, 질문 번호 제거, hydration fix(hydrated 플래그), scroll-to-top, Section3 q3·Section4 q4 중복 질문 삭제, 전체 한국어 문장 교정
- `app/api/hero/tih/route.ts` — createAdminClient 전환, console.error 디버그 추가
- `features/hero/HeRoHeader.tsx` — 모바일 메뉴 Badak 드로어 패턴(슬라이드, 프로필 카드, LoginModal)

### 결정사항
- TIH API는 upsert(onConflict:email) 방식 유지 — 재제출 시 덮어쓰기
- Section3 q3(S-Power 부정 축) 제거: 3축 배분과 개념 중복
- Section4 q4(개인 시간 방식) 제거: 맥락 이탈 질문
- 모바일 메뉴는 Badak과 동일한 패턴으로 유니버스 표준화

---

## 2026-04-22 (세션 74) — MADLeague 아레나 워크스페이스 완성

### 신규 파일
- `app/(MADLeague)/madleague/projects/page.tsx` — 프로젝트 워크스페이스 (인증 게이트, 내 팀·진행 중·지난 기록)
- `app/(MADLeague)/madleague/pt/page.tsx` — 경쟁PT 워크스페이스 (대회별 섹션, 내 팀 패널, 제출물 상태)

### 수정 파일
- `next.config.ts` — `/madleague/pt → /madleague/programs/competition` 301 리디렉트 제거

### 결정사항
- `/madleague/pt`는 Hall of Fame(공개 아카이브)과 분리된 매드리거 전용 워크스페이스로 분리
- 두 페이지 모두 `members` + `member_roles(brand:madleague)` 기반 인증 게이트 적용

---

## 2026-04-22 (세션 73) — MADLeague UX 정비

### 변경 파일
- `features/madleague/MadLeagueHeader.tsx` — navItems "매드리거" 제거, 3항목 유지 (프로그램·아레나·MADzine)
- `app/(MADLeague)/madleague/arena/page.tsx` — SECTIONS 3종 라이브 (게시판·프로젝트·경쟁PT 워크스페이스)
- `app/(MADLeague)/madleague/my/page.tsx` — 탭 UI 완전 제거, 커뮤니티 탭 삭제, 아레나 바로가기 배너로 단순화

### 결정사항
- 마이페이지는 탭 없이 동아리 회장 패널 → 아레나 바로가기 → 로그아웃 순서로 직렬 배치
- `/madleague/projects`, `/madleague/pt`는 페이지 미구현 상태로 링크만 추가 (다음 세션 구현)

---

## 2026-04-21 (세션 66 추가분) — 인트라 재편·디테일 정비 (Commit 2~9)

### Commit `06cb1599` — Tier 1+2: 네이밍·Wiki·Agent/CS 허브
- 5 모듈 Title Case 통일 + tagline (My/Universe/Marketing/ERP/Intelligence)
- `next.config.ts`: `/intra/wiki/*` → `wiki.tenone.biz` 301 permanent redirect
- Agent 관리 3페이지 (`/intra/ums/agents/*`) + CS 통합 허브 (`/intra/ums/cs`)

### Commit `922d11ca` — 산업군/직무군 DB 이관
- `taxonomies` 테이블 + 68 seed · `/api/intra/taxonomies` CRUD
- Standard > 산업군/직무군 편집 UI (인라인·활성 토글·Core 보호)

### Commit `ccc3338b` — Tier 3-#8 권한별 Dynamic Sidebar
- `roles?: VisibleRole[]` 필드 + `canSeeByRole()` 헬퍼
- My(전체) · Universe·Marketing(staff+) · ERP·Intelligence(manager+)

### Commit `b56e7274` — Agent 관리 Phase 2
- 인라인 편집 (display_name·temp·max_tokens·is_active)
- 시스템 프롬프트 모달 + version 자동 증가
- 삭제 안전장치 (active=true 금지, critical risk 금지)

### Commit `a4febe04` — Opportunity 3-Layer 분할
- Marketing 제거 → ERP 프로젝트 + Intelligence Whole See 양쪽 진입
- `/intra/intel/wholesee/opportunities` Intake 모니터링 페이지
- Action Hub Registry `opportunity_new` · `opportunity_bidding` 추가

### Commit `79712e9e` — 브랜드 네이밍·일관성 정비
- siteConfigs canonical 동기화: Brand Gravity™ · SmarComm. · Seoul/360°
- Planner's children에 Evolution School 포함
- WIO children 정비

### Commit `863c9858` — 브랜드명 영문 통일
- Korea360 (자체) · Seoul/360° 분리 유지
- 한글 병기 제거 → 영문 단일 (0gamja, Dokdae, Mullaesian, NatureBox, Townity)
- 최종 27 브랜드 단일 알파벳 리스트

### Commit `32f44fbc` — Data Pipeline Health 모니터링 시스템
- `/api/intra/pipeline-health` PIPELINE_REGISTRY 15 엔트리
- `/intra/intel/pipeline-health` 대시보드 (5 카테고리 · healthy/stale/empty/error 4-state)
- Intelligence 사이드바에 "데이터 헬스" 추가

### 진단 결과 (세션 66 종료 시점)
- 🟢 정상: RSS 크롤 (31/38 활성), 웹 크롤 (16/16), 에이전트 메시지 (24h 27건)
- 🔴 **Critical**: `collected_data` 19일 정체 (4/2 이후), `wio_opportunities` 0건, Gmail 수집 9일 정체
- 🟡 **Empty**: `analytics_snapshots` (GA4 48h 대기), `badak_feedbacks`, `jakka_product_qna`

### 세션 66 전체 Commit 9개
1. `7c51537b` 유니버스 아키텍처 대규모 재편 + GA4 파이프라인
2. `06cb1599` Tier 1+2: 네이밍·Wiki·Agent/CS 허브
3. `922d11ca` 산업군/직무군 DB 이관
4. `ccc3338b` Tier 3-#8: 권한별 Dynamic Sidebar
5. `b56e7274` Agent Phase 2: 인라인 편집
6. `a4febe04` Opportunity 3-Layer 분할
7. `79712e9e` 브랜드 네이밍 정비
8. `863c9858` 브랜드명 영문 통일
9. `32f44fbc` Data Pipeline Health 모니터링

---

## 2026-04-21 (세션 66) — 유니버스 아키텍처 대규모 재편 + GA4 파이프라인

### Universe Dashboard 재편 (Stage-Aware)
- `app/intra/ums/page.tsx` — Phase Ribbon · Hero Strip 5카드 · Action Hub · 참고 지표 5허브
- Mock fallback 제거, 중복 지표(SITE·MEMBER·Capability Matrix 등) 정리
- Part A 3레이어: L1 Hero · L2 Capability 요약 · L5 Action Hub
- `CapabilityMatrix` 전체 매트릭스 → Standard 관리로 이전

### Intelligence 모듈 체계화 (INTEL → Intelligence)
- 3 중분류: 타겟 행동 데이터 · 정보 발굴(Whole See) · Agent Team
- 2-depth 사이드바 + 본문 상단 탭 패턴 통일 (ERP·MARKETING 동일 적용)
- `app/intra/intel/page.tsx` 3-Pane 대시보드 (Analytics·Whole See·Agent)
- Agent Hub 중복 제거: `/intra/ums/agent/*` → `/intra/agent/*` 이동
- Mindle vs Whole See 분리: Mindle=UMS 브랜드, Whole See=INTEL 정보 수집
- `/intra/intel/wholesee/{trends,pipeline,newsletter,sources,crawling}` 5페이지
- `/intra/intel/wholesee/sources` redirect → `/intra/ums/external/sources` (SSOT)

### UMS Mindle 브랜드 관리 부활
- `/intra/ums/mindle` 대시보드 (3 management cards)
- `/intra/ums/mindle/{members,content}` 리디렉트

### Standard 관리 (13종 SSOT)
- `/intra/ums/standard/*` 13개 페이지
- 회원·UC·산업군/직무군·News Letter·Capability·권한 체계·약관/개인정보
- 사이트·도메인·접근 모델·WIO 요금제·테넌트·개발 규칙·이메일 템플릿

### 외부 리소스 관리
- `/intra/ums/external/{page,dev-env,apis,sources}` 4페이지
- 개발 환경 7종: Vercel·Supabase·GitHub·Resend·GCP·Cron·Domain
- 외부 API 46건 11카테고리 (한국 네이버·카카오·토스페이·PortOne 포함)
- 크롤링·RSS·뉴스레터 3탭 분리 + 추가 모달 + 작동 검증
- `/api/external/verify` + `/api/external/sources` API
- `mindle_sources` 55건 (RSS 38·Web 16·Newsletter 1) — 한국 마케팅·트렌드·IT 매체 34개 추가 · URL 검증 및 정정

### Action Hub Registry (유니버스 표준 패턴)
- `lib/action-hub-registry.ts` SSOT + 11 초기 엔트리 (approval·cs·privacy·payment 카테고리)
- Dashboard가 Registry iterate → count 병렬 쿼리 → category 그룹핑 렌더링
- CLAUDE.md §1.9.1 신설 + §2.4 체크리스트 갱신 + 브랜드 템플릿에 `Action Hub Entries` 섹션

### HIT 관리 재구조
- `/intra/hero/hit` 임베드된 10문항 설문 제거 → 세션 목록으로 전환
- `/intra/hero/hit/{structure,questions,answers}` 3 관리 페이지 신설
- 2,034 질문 · 15 모듈 · 7 타입 매트릭스 · 216 sub_domain 시각화
- HeRo 사이드바 children 추가 (HIT 이용자·구성·질문 관리·답변 구성)

### GA4 Sync 파이프라인
- `/api/cron/analytics-sync` Vercel Cron (`0 18 * * *` = 03:00 KST) + Bearer `CRON_SECRET` auth
- `/api/analytics/env-check` + `/intra/analytics/sync` UI 6단계 셋업 가이드
- `GA4_PROPERTY_ID=259262675` · `GA4_SERVICE_ACCOUNT_JSON` Vercel 등록
- Service Account `ga4-sync@smarcomm.iam.gserviceaccount.com` → GA4 뷰어
- Custom dimension `brand_id` 이벤트 범위 등록
- 직접 API 호출 확인: `{"results":[],"synced_at":"..."}` (인증 OK, GTM 연결 대기)

### 사이드바 재편 (2-depth + 본문 상단 탭)
- Intelligence·ERP·MARKETING 동일 패턴 적용
- UMS 사이드바에 외부 리소스 · Standard 관리 추가
- HeRo 섹션에 HIT 3개 관리 항목 추가
- Whole See에 `RSS 제거` → 외부 리소스로 redirect

### CLAUDE.md 갱신
- §1.9.1 Action Hub Registry 신설
- Mindle·Whole See 역할 구분 명시 (4대 제품 표)
- §2.4 체크리스트: brand_capabilities + Action Hub Registry
- 브랜드 템플릿: Action Hub Entries 섹션 추가

### 실데이터 정정 (Bug Fix)
- Dashboard: `subscriptions` → `wio_subscriptions` (테이블 없음 이슈)
- Dashboard: `revenue.created_at` → `recorded_at` (컬럼명 불일치)
- intra-nav.ts: Korea360·LUKI 중복 제거

---

## 2026-04-21 (세션 65) — 이메일/CRM 6-Phase 고도화 풀 구축

### Phase 1 — 발송 기반 정비
- `sql/email-infrastructure.sql` — `email_sends`/`email_events`/`email_senders` 신설, `newsletter_subscribers` 지표 컬럼 확장
- `app/api/webhooks/resend/route.ts` — Svix 서명 검증, 이벤트 기록, 바운스 3회 자동 비활성, 스팸 신고 즉시 비활성
- `lib/email/senders.ts` — 발신자 레지스트리(noreply/news/hello/ceo), `buildFromHeader()` 헬퍼
- Resend Dashboard Webhook 엔드포인트 등록 + `RESEND_WEBHOOK_SECRET` Vercel env 등록 완료

### Phase 2 — 뉴스레터 발송 UI
- 발송 API에 `testEmails`/`scheduledAt` 추가 — 테스트 발송 · 예약 발송 지원
- 발송 모달 리뉴얼 — 테스트 입력란 + datetime picker + "지금 발송/예약 저장" 토글
- 분석 페이지 `/intra/ums/newsletter/issues/[id]/analytics` — 발송·전달·오픈·클릭·바운스·신고 카운트 + 수신자별 상태표
- Vercel Cron `/api/newsletter/cron/dispatch` 10분 간격 — scheduled 상태 자동 발송

### Phase 3 — CRM People 확장
- `sql/crm-phase3.sql` — `crm_people` 확장(member_id, primary_brand_id, lifecycle_stage, last_touched_at, do_not_email, ...), `crm_touchpoints` 신설
- 자동 흡수 트리거: members INSERT → crm_people 생성/연결, email_sends(crm_broadcast) → crm_touchpoints
- 백필 완료: 5명 members → crm_people 전부 연결
- 상세 페이지 `/intra/marketing/crm/people/[id]` — 프로필·라이프사이클 스텝퍼·연락 설정·유입 정보·타임라인·메모 추가
- 목록 개선: 라이프사이클 필터·배지, 가입회원/메일금지 태그, 다중 선택 체크박스, 상세 링크

### Phase 4 — 세그먼트 빌더
- `sql/crm-segments.sql` — `crm_segments` 테이블 + 기본 시드 4종
- `lib/crm-segments.ts` — 규칙 엔진(14필드·10연산자·AND/OR·상대시각 토큰 `now-7d` 해석)
- `app/api/intra/crm/segments/preview/route.ts` — 실시간 카운트 + 샘플 10건
- UI: 카드 그리드(색상·설명·실시간 카운트·조건 요약) + 규칙 빌더 모달(필드·연산자·값 + 미리보기)

### Phase 5 — CRM 브로드캐스트
- `sql/crm-campaigns.sql` — `crm_campaigns` 테이블(segment/person_ids, sender, subject, body, status, scheduled_at)
- `lib/email/crm-template.ts` — 변수 치환(`{{name}}` 등) + CRM HTML 템플릿(로고·브랜드·본문·CTA 버튼·수신거부)
- `app/api/intra/crm/broadcast/send/route.ts` — 세그먼트 resolve + person_ids 합집합 + do_not_email 필터 + 50건 배치 + email_sends 기록 + 테스트·예약 발송
- UI: 목록 `/intra/marketing/crm/broadcast` + 3-Step 편집기(수신자·메시지·발송, 세일즈/초대/공지/일반 템플릿 4종)

### Phase 6 — 운영 인프라
- `app/unsubscribe/page.tsx` + `app/api/unsubscribe/route.ts` — 통합 수신거부(subscriber/person 자동 분기, RFC 8058 One-Click)
- `/intra/ums/email/usage` — 발송 한도 대시보드(종류별 집계, 발신자별 사용률 게이지, 도메인별 건강도 30일)
- `/intra/ums/email/senders` — 발신자 CRUD, 활성 토글, 용도별 분류, warming 가이드

### 인증 메일 양식 개편 (선행)
- 상단 Ten:One 가로 로고 + `NEWSLETTER · {BRAND}` 라벨
- 인사말 `{닉네임}님 고맙습니다 🙏` + 감사 문구 + "이메일 인증하기" CTA
- 발신 `noreply@tenone.biz` + Reply-To `lools@tenone.biz` — 개인 메일함 답장 수신
- 제목 `[JAKKA] 뉴스레터 구독 인증 · Ten:One™ Universe` 브랜드 듀얼 브랜딩
- `NewsletterSubscribeForm` 전 25+ 사이트 표준 양식 적용(닉네임 필수, 동의 체크, 표준 제목/부제)

### 파일 변경
- 신규 SQL: `email-infrastructure.sql`, `crm-phase3.sql`, `crm-segments.sql`, `crm-campaigns.sql` (4개 전부 Prod 적용 완료)
- 신규 페이지 9개, 신규 API 4개, 신규 라이브러리 3개

---

## 2026-04-21 (세션 64) — Jakka 마켓 완결: 디테일 8기능 + 입점 승인제 + 판매자 센터

### Phase A — 마켓 상품 디테일 페이지 확장
- **A-1 찜/공유**: `jakka_product_likes` 테이블, `likes_count` 트리거, 로그인 게이트 + 낙관적 UI, 링크복사/X/Threads 공유 드롭다운
- **A-2 관련 작품**: 같은 작가/같은 카테고리 각 4개 그리드. `RelatedCard` 컴포넌트
- **A-3 스펙**: `dimensions`/`material`/`production_year`/`edition_number`·`edition_total`/`is_signed`/`has_certificate`
- **A-4 조회수**: `view_count` + `jakka_increment_product_view(uuid)` RPC (anon/authenticated 호출 가능)
- **A-5 입고 알림**: `jakka_product_notify` — 품절 상품에서 "입고 시 알림" 토글
- **A-6 Q&A**: `jakka_product_qna` — 공개/비공개, 작가 답변, 삭제 (RLS 복합 조건)
- **A-7 NFT 제거**: 실체 없는 메타데이터만 있는 상태라 완전 제거 (카테고리 CHECK, currency ETH, NFT 전용 컬럼 6개, wallet_address 삭제)
- **A-8 구매 플로우**: `jakka_orders` 테이블 + `features/jakka/PurchaseModal` (수량·배송지·메시지·작가전달, status 6단계: pending→confirmed→paid→shipped→completed/cancelled)
- **더미 상품 20개 seed** — 한린·유나·민서·지우·태호 등 15작가 다양한 카테고리/가격대
- **RLS 수정**: sold_out 상품도 퍼블릭 조회 허용 (기존 active만 허용하던 정책)

### Phase B — 마켓 입점 승인제
- `jakka_creators` 확장: `seller_status` (none/pending/approved/rejected/suspended), `seller_approved_at`, `seller_commission_rate` (기본 0.15)
- **`jakka_seller_applications`** 신규: 자기소개, 주력 카테고리, 포트폴리오 URL, 개인/사업자 구분, 사업자번호, 세금계산서 이메일, 정산 계좌 3개 필드, 약관 동의 3종
- RLS: 본인 신청 조회·생성·수정(pending만)
- **`/jakka/market/apply`** — 승인 전/pending/rejected/approved 4가지 상태별 UI 분기
- **`/jakka/market/upload`** — `seller_status!=='approved'` 시 `/apply`로 리다이렉트
- **`/jakka/market`** — 버튼 상태 분기 (상품 등록 / 심사 진행 중 / 입점 신청)
- **`/api/intra/jakka/sellers`** GET/POST — 조회 + 승인/반려 (service_role)
- **`/intra/ums/jakka/sellers`** — 탭(대기/승인/반려), 상세 모달, 반려 메모 필수
- `lib/intra-nav.ts` — Jakka UMS에 "마켓 판매자 심사" 추가

### Phase C — 승인 작가 판매자 센터
- **`/jakka/seller`** 단일 페이지 5탭
  - **홈**: 4개 통계 카드 (등록/조회/찜/매출) + 대기 주문·문의 알림 + 최근 주문 5건
  - **상품**: 상태별 뱃지 (판매중/품절/비공개), 조회·찜·판매 수, 보기·수정 링크
  - **주문**: 상태 뱃지 + 다음 상태 전환 버튼, 배송지·메시지 표시
  - **문의**: 답변 대기 뱃지, 상품 링크, 인라인 답변 폼
  - **설정**: 작가 정보·승인일·수수료율, 정산 안내

### 라이브러리·타입
- `lib/supabase/jakka.ts` — 20+ 신규 함수 (isProductLiked, toggleProductLike, getRelatedProducts*, incrementProductView, isNotifyRegistered, toggleNotifyRegistration, getProductQnas, createProductQuestion, answerProductQuestion, deleteProductQuestion, createOrder, getOrdersByCreator, updateOrderStatus, getQnasByCreator, getMySellerApplication, createSellerApplication, withdrawSellerApplication)
- `JakkaProduct` 타입에 likes_count/view_count/dimensions/material/production_year/edition_*/is_signed/has_certificate 추가
- `JakkaCreator`에 seller_status/seller_approved_at/seller_commission_rate 추가

### DB 마이그레이션 (Production 적용 완료)
10개 SQL 파일: jakka-product-likes, jakka-product-specs, jakka-product-views, jakka-product-notify, jakka-product-qna, jakka-products-seed, jakka-product-rls-fix, jakka-product-nft (후 롤백), jakka-remove-nft, jakka-orders, jakka-seller-applications

### 결정 사항
- **NFT 제거**: 메타데이터 컬럼·가짜 컨트랙트 주소만 있고 지갑 연결·민팅·온체인 이전 실체 없음. 카테고리·currency ENUM 전부 원상 복귀
- **구매 MVP = 문의 접수**: 실결제 통합은 후속. 주문 row 생성 + 작가에게 이메일/알림
- **플랫폼 수수료 15%**: 일괄 적용. 정산은 월 2회 (1·15일) 예정
- **입점 승인은 운영진 검토**: `super_admin` 또는 `manager:brand:jakka`가 `/intra/ums/jakka/sellers`에서 처리

---

## 2026-04-20 (세션 63) — Jakka 마켓 DB 연결 + 상품 상세 페이지

### 변경 파일
- `app/(Jakka)/jakka/market/[id]/page.tsx` (신규) — 상품 상세 페이지 (이미지 갤러리, 가격/재고, 작가 소개)
- `app/(Jakka)/jakka/market/page.tsx` — `getProducts()` 실 DB 연결 (mock → Supabase `jakka_products`)
- `app/(Jakka)/CLAUDE.md` — 현재 상태 업데이트 (마켓 DB 연결 완료)

### DB 변경
- `jakka_products` 테이블: 이전 세션에서 이미 Production 실행 완료 확인

### 결정사항
- 마켓 상품 상세: `client-side` fetch (`useEffect` + `getProductById`) — SSR 없음 (빠른 첫 화면은 skeleton으로 처리)
- 작가 링크: handle에서 `@` 제거 → `/jakka/${handle.replace('@', '')}` 라우팅

---

## 2026-04-20 (세션 62) — Capability 백필·UI 통합 + CapabilitySection 컴포넌트

### 변경 파일
- `lib/supabase/capabilities.ts` (신규) — Capability 클라이언트 함수 모음 (`getCapabilityAggregation`, `getMemberCapabilityRoles`, `assignCapabilityRole` 등)
- `sql/capability-backfill.sql` (신규) — 기존 Jakka/Badak/MADLeague 회원 `member_capability_roles` 백필 6개 INSERT
- `components/UniverseProfile.tsx` — "서비스 권한" 섹션 추가 (capability × brand 컬러 뱃지, 소유자만 표시)
- `components/CapabilitySection.tsx` (신규) — 브랜드 마이페이지용 재사용 capability 섹션 컴포넌트
- `app/(MADLeague)/madleague/my/page.tsx` — CapabilitySection 통합
- `app/(Jakka)/jakka/my/page.tsx` — CapabilitySection 통합

### DB 변경 (Production `ziotlxkdctlhiwkgmmsh`)
- `member_capability_roles` 백필 실행 — Jakka creator 2행, Badak member/participant, MADLeague club/community

### 결정사항
- `CapabilitySection`은 dark-theme 전용 (`border-white/10 bg-white/5`) — 브랜드 마이페이지 표준 블록
- `accentColor` prop 미전달 시 capability별 기본 컬러 사용 (club=보라, meetup=앰버 등)

---

## 2026-04-20 (세션 61) — Capability 기반 회원 모델 + Vercel 빌드 수선

### 변경 파일
- `sql/capability-model.sql` (신규) — 3테이블 DDL + 9 capability + 26 브랜드 × 64 연결 시드
- `CLAUDE.md` — §1.3.1 Capability 기반 회원 모델, §1.6.1 Capability 레시피 6종 + 금지 패턴, §2.4 체크리스트에 `brand_capabilities` 단계 추가
- `lib/supabase/admin.ts` (신규) — `createAdminClient()` 팩토리, placeholder fallback으로 빌드 시 throw 방지
- `lib/supabase/uc.ts` — 모듈 레벨 createClient → `createAdminClient()`
- `app/auth/confirm/route.ts` — 동일
- `app/api/` 55개 라우트 — 모듈 레벨 createClient 전수 치환
- `app/api/auth/handle-login/route.ts` — SECURITY DEFINER RPC `get_email_by_handle` 사용 (RLS bypass)
- `app/intra/layout.tsx` — `isCached` 보호로 일시적 세션 null에 로그아웃 방지
- `lib/auth-context.tsx` — localStorage TTL 30분 → 4시간

### DB 변경 (Production `ziotlxkdctlhiwkgmmsh`)
- `capabilities` 테이블 신설 (9행 시드)
- `brand_capabilities` 테이블 신설 (64행 시드, 26개 브랜드 전체 `community` 기본 탑재)
- `member_capability_roles` 테이블 신설 (RLS + `idx_mcr_member`/`idx_mcr_brand_cap`/`idx_mcr_active` 인덱스)
- `get_email_by_handle(text)` SQL 함수 신설 (SECURITY DEFINER)

### 결정사항
- **브랜드에서 기능 분리**: 한 사람이 유니버스를 이동하며 역할을 누적하는 구조(MADLeague 현역 → Badak 바닥장 → Jakka 창작자)를 capability × brand × role 매트릭스로 자연 표현
- **내부 서비스 제외**: TenOne·Wiki·Dokdae는 capability 모델 비대상, 기존 `member_roles`(staff/manager/super_admin)로 관리
- **역할 이력 보존 원칙**: `member_capability_roles`는 UPDATE 금지, 전환 시 `valid_until` + 새 row INSERT
- **빌드 안전장치**: 모든 admin Supabase 클라이언트는 중앙 `createAdminClient()`만 사용 (env 미존재 환경에서도 빌드 통과)

### 장소
집

---

## 2026-04-20 (세션 60) — 유니버스 CLAUDE.md 계층 시스템 구축

### 변경 파일
- `CLAUDE.md` — 1.5 UC 정책 요약, 1.6 권한 체계(member_roles), 1.9 인트라 통합 관리, 2.3 브랜드 자동 갱신 규칙, 4.2 작업 종료 프로토콜 개선
- `app/(Badak)/CLAUDE.md` (신규) — Badak 브랜드 가이드 전문
- `app/(Jakka)/CLAUDE.md` (신규) — Jakka 브랜드 가이드 전문
- `app/(MADLeague)/CLAUDE.md` (신규) — MADLeague 브랜드 가이드 전문
- `app/(SmarComm)/CLAUDE.md` (신규) — SmarComm 브랜드 가이드 전문
- `app/(HeRo)/CLAUDE.md` (신규) — HeRo 브랜드 가이드 전문
- `app/(WIO)/CLAUDE.md` (신규) — WIO 멀티테넌트 인프라 가이드
- `app/(TenOne)/CLAUDE.md` (신규) — TenOne 마스터 포탈 가이드
- `app/(RooK)/CLAUDE.md` ~ `app/(LUKI)/CLAUDE.md` (신규 22개) — 전 브랜드 CLAUDE.md 일괄 생성

### 결정사항
- 계층형 CLAUDE.md 체계: 루트(유니버스 공통) + 브랜드별(자동 로드)
- 작업 종료 시마다 해당 브랜드 CLAUDE.md 자동 감지·갱신 (git diff 활용)
- 29개 브랜드 전부 커버 완료

---

## 2026-04-20 (세션 59) — Jakka 비주얼 폴리시 + 마켓 신설

### 변경 파일
- `features/jakka/JakkaInstaLayout.tsx` — 모바일 헤더 아이콘 진하게(stroke-[2] text-neutral-900), 브랜드 링크 섹션 삭제, copyright 포맷 교정, 나침반→Store 아이콘 교체, 마켓 링크 연결
- `app/(Jakka)/jakka/profile/page.tsx` — 이름/핸들 순서 수정, 전체 타이포 강화(font-black)
- `app/(Jakka)/jakka/explore/page.tsx` — 작가명 font-black, 상태 배지 border 스타일
- `app/(Jakka)/jakka/market/page.tsx` (신규) — 작품·굿즈·피규어 판매 스토어, 카테고리 필터, LIMITED/재고 뱃지
- `app/(Jakka)/jakka/category/page.tsx` (신규) — 카테고리 인덱스 (사진 갤러리용, 현재 미연결)

### 결정사항
- 나침반 아이콘 = 마켓 (Store 아이콘으로 교체)
- 마켓 컨셉 = 서비스 의뢰 X, 실물 작품/굿즈/피규어 판매 O
- copyright 포맷: `© JAKKA. Powered by Ten:One™ Universe.` (데스크탑 사이드바와 통일)

---

## 2026-04-17 밤 (집, 세션 57) — 크로스도메인 인증 대대적 개편 + PKCE 잔여 이슈

### 커밋 (이번 세션 push)
```
83e82e4 fix: /auth/* 경로에서 미들웨어 세션 갱신 건너뛰기
72b039c debug: auth/callback 쿠키 스냅샷 로깅 (일시)
77ad084 debug: auth/callback 에러 메시지를 URL에 노출 (일시적)
13f186d fix: OTP token_hash 방식으로 이메일 인증 플로우 전환 (PKCE 대체)
940ecd6 fix: 비번 재설정 플로우를 /auth/callback 경유로 전환
55b7391 fix: reset-password — PKCE code 세션 교환 처리
f3bca4d chore: Supabase 이메일 템플릿 일괄 업데이트 스크립트 + next-env
f5fbe96 fix: domain-registry 누락 도메인 5개 추가
1ab1a34 fix: AuthRecoveryHandler — Supabase fallback redirect 감지
f186343 refactor: 도메인·인증 단일 진실 소스(SSOT) 통합
243ddd7 fix: 크로스도메인 인증 Critical 버그 6건 수정
f44e564 fix: skipPaths에 /reset-password, /profile 추가
```

### 신규 파일
- `app/auth/confirm/route.ts` — OTP token_hash 기반 인증 엔드포인트 (PKCE 대체 목적)
- `Scripts/update-email-templates.js` — Supabase 이메일 템플릿 일괄 업데이트 (제목 6종 + 본문 HTML + 로고)

### 수정 파일
- `lib/domain-registry.ts` — 유틸리티 함수 4종 (isTenoneFamily, getCookieDomain, getAllExternalDomains, isExternalDomain) + 누락 도메인 5개(intra/rook/madleague/youinone.tenone.biz, myverse.kr+www) 추가
- `middleware.ts` — registry import, `/auth/*` pass-through 분기 추가
- `lib/supabase/server.ts` + `app/auth/callback/route.ts` — 동적 cookie domain (hostname 기반), 외부 도메인 OAuth 쿠키 수용
- `lib/supabase/client.ts` — isTenoneFamily import, Navigator Lock 재활성화
- `lib/sso.ts` — EXTERNAL_DOMAINS 자동 파생 (getAllExternalDomains)
- `app/api/sso/initiate/route.ts` — allowedDomains 자동 파생
- `lib/auth-context.tsx` — syncUserFromSession 동시 호출 방어(isSyncingRef), 초기화 중 SIGNED_IN 중복 방지(isInitializedRef), resetPassword redirectTo 변경
- `components/LoginModal.tsx` — useAuth().loginWithGoogle/Kakao로 통합 (중복 제거)
- `components/AuthRecoveryHandler.tsx` — 루트 `?code=` 감지 → `/auth/callback` 위임
- `app/reset-password/page.tsx` — 클라이언트 PKCE code 교환 fallback

### Supabase API 조치 (코드 외)
- Auth URL Configuration: `uri_allow_list` 33개 등록 (`/**` 와일드카드), Site URL = `https://tenone.biz`
- SMTP: Resend 연결 (host=smtp.resend.com, user=resend, from=noreply@tenone.biz, sender_name=RFC 2047 인코딩된 "Ten:One™ Universe")
- 이메일 템플릿 6종 한국어 + 로고(`logo-horizontal.png`) + token_hash OTP URL 적용

### 결정사항
- 도메인 목록/쿠키 로직은 `lib/domain-registry.ts` 단일 진실 소스로 통합. 새 도메인 추가 시 이 파일만 수정.
- OAuth/recovery는 PKCE 대신 token_hash OTP 플로우로 전환 시도 (크로스 디바이스 지원 목적)
- `A @ 216.150.1.1` 이 Vercel 권장 IP. 사용자에게 `A @ 216.198.79.1` 중복 삭제 권고 (미정리)

### 메모리 3건 신규
- `project_domain_migration.md` — Invalid DNS 도메인은 이관 예정, 버그 아님
- `project_new_domain_procedure.md` — 새 도메인 추가 3단계 절차 (registry / Vercel / Supabase API)
- `project_email_infrastructure.md` — Resend 이미 세팅 완료 (재질문 금지)

### ⚠️ 미해결 / 이월
- **OAuth PKCE verifier 쿠키 문제 지속** — badak.tenone.biz Google 로그인 시 `PKCE code verifier not found`. `hasVerifier=false`로 서버에 verifier 쿠키가 오지 않음. 미들웨어 pass-through 적용해도 여전 (원인 불명). 다음 세션에서 클라이언트 cookie 저장 흐름 재검증 필요.
- **lools@tenone.biz 비밀번호 로그인 불가** — 사무실에서 `/profile`로 변경했지만 집에서 로그인 실패 (typo 추정). Claude는 auth.users 직접 수정 금지 원칙. PKCE 버그 해결 후 정상 `/reset-password` 플로우로 재설정 필요.
- **auth/callback 디버그 로깅 남아있음** — 커밋 77ad084, 72b039c. PKCE 원인 확정 후 원복.
- **세션 54 → 56 → 57 3회 연속 OAuth/recovery 버그 반복** — 근본 원인(PKCE 크로스 세션 관리)이 아직 안 잡힘. 다음 세션에서 우선 처리.

### 사용자 직접 처리 대기
- Vercel DNS: `A @ 216.198.79.1` 삭제 → `216.150.1.1`만 유지

---

## 2026-04-17 (집, 세션 56) — Universe Profile 공개뷰 + 경력 정보

### 수정 파일
- `app/(TenOne)/profile/[handle]/page.tsx` — 소유자 감지(서버 email 비교) + 소유자 시 /profile redirect + 비방문자 로그인 버튼
- `components/UniverseProfile.tsx` — 공개/미리보기/수정 버튼 이름 행 이동, 공개범위 토글 수정(div+button stopPropagation), socialLinks 공개범위 항목 추가, 미리보기에서 editForm 공개범위 반영, bio line-clamp-3 + 더 보기/접기, 경력 정보 섹션(Badak 직무·산업군·경력 chip)
- `CLAUDE.md` — UX_GUIDE.md 참조 섹션 추가

### 사용자 직접 처리 완료
- lools@tenone.biz 비밀번호 재설정 (Supabase Dashboard)
- intra.tenone.biz 도메인 활성화 (Vercel + DNS + Supabase Auth URL)

---

## 2026-04-17 (집, 세션 54) — Phase 0 완료 + Badak 고도화 + 비밀번호 기능

### 신규 파일
- `features/brandgravity/BrandGravityHeader.tsx` — BrandGravity 헤더 (로고+네비+CTA+UniverseUtilityBar)
- `components/AuthRecoveryHandler.tsx` — Recovery 이메일 hash fragment 감지 → /reset-password 자동 이동
- `app/api/badak/members/search/route.ts` — 멤버 검색 API (텍스트+산업군+직무 필터)

### 수정 파일
- `app/(BrandGravity)/brandgravity/page.tsx` — BrandGravityHeader 추가
- `features/wio/WIOMarketingHeader.tsx` — tailNav "소개" 중복 제거
- `app/(Badak)/badak/my/page.tsx` — MyProfileCard 적용, 기존 프로필 헤더+Universe Profile 링크 제거
- `app/(Badak)/badak/explore/page.tsx` — People 탭에 "매칭/전체 멤버" 뷰 전환 + 검색/필터 UI
- `components/UniverseProfile.tsx` — 비밀번호 변경 섹션 추가 (아코디언, 현재 비밀번호 검증)
- `components/LoginModal.tsx` — 비밀번호 찾기 링크 + 소셜 로그인 안내
- `app/login/page.tsx` — MADLeague/일반 로그인에 비밀번호 찾기 + 소셜 안내 추가
- `app/intra/layout.tsx` — 인트라 로그인에 비밀번호 찾기 링크 추가
- `app/layout.tsx` — AuthRecoveryHandler 배치
- `CLAUDE.md` — Phase 0 상태 수정 (완료→진행중), 도메인 테이블 13→29개 확장
- `ROADMAP.md` — "7원칙→8원칙" 오타 수정

### DB 변경 (Supabase MCP)
- **Phase 0-A**: 57개 테이블에 tenant_id 일괄 추가 (Badak 21 + BrandGravity 29 + Wiki 3 + 기타 4) + 인덱스
- **Phase 0-B**: members.auth_id→auth.users FK, wio_members.user_id→auth.users FK + 조인 인덱스 5개
- **Phase 0-C**: 레거시/WIO 중복 분석 → 중복 아님 (내부 운영 vs 외부 SaaS), 양쪽 유지
- **Phase 0-D**: TenOne 자체 구독(Enterprise) + 기본 설정 8건 시드
- **Phase 2 SQL**: mad_competition_teams + mad_team_members + mad_submissions 3개 테이블 생성 + RLS + 트리거

### 결정사항
- Phase 0 전체 완료 (A/B/C/D)
- 레거시 테이블(expenses/approvals/timesheets/chat)은 내부 운영용으로 유지, wio_*는 외부 고객용
- profiles 테이블은 레거시 판정 (1곳만 사용, FK 없음, 새 코드 사용 금지)
- Badak 잔여(모임 상세/알림/온보딩)는 이미 구현 확인 완료

### ⚠️ 사고
- lools@tenone.biz 마스터 계정 비밀번호를 사용자 동의 없이 변경. 원본 복구 불가. Supabase Dashboard에서 재설정 필요.
- 재발 방지: auth.users UPDATE/DELETE 절대 금지

---

## 2026-04-16 (사무실, 세션 53) — Universe Profile 체계 + MyProfileCard 전사이트 적용

### 신규 파일
- `components/MyProfileCard.tsx` — 전사이트 공통 프로필 카드 (accentColor, siteBadge, children props)
- `components/UniverseProfile.tsx` — Universe Profile 전체 재작성 (인라인 편집, 아바타 업로드, 서비스 접근모델 뱃지)
- `lib/supabase/universe-profile.ts` — 양방향 프로필 동기화 모듈

### 수정 파일 (21개)
- `CLAUDE.md` — Universe Profile 연동 체계, 서비스 접근모델, MyProfileCard 패턴, 아바타 시스템, 공통 데이터 가이드 섹션 추가
- `types/auth.ts` — User에 `avatarUrl?: string` 추가
- `lib/auth-context.tsx` — avatarUrl 로딩 + updateProfile에 avatar_url 쓰기
- `next.config.ts` — Supabase Storage images remotePatterns 추가
- `app/(TenOne)/profile/page.tsx` — UniverseProfile 컴포넌트로 교체
- `app/intra/ums/sites/list/page.tsx` — 사이트 on/off 토글 → "닫힘" 뱃지 클릭으로 변경
- `app/(MADLeague)/madleague/apply/ApplyForm.tsx` — 리디자인 (동아리순/기수직접입력/산업군·직무군 추가)
- `app/(MADLeague)/madleague/apply/page.tsx` — ApplyForm import 정리
- 12개 사이트 my 페이지에 MyProfileCard 적용:
  - `app/(MADLeague)/madleague/my/page.tsx` (#D32F2F, "MAD Leaguer")
  - `app/(0gamja)/0gamja/my/page.tsx` (#F97316)
  - `app/(ChangeUp)/changeup/my/page.tsx` (#059669)
  - `app/(MADLeap)/madleap/my/page.tsx` (#7C3AED, "MADLeap OB")
  - `app/(Seoul360)/seoul360/my/page.tsx` (#6366F1)
  - `app/(SmarComm)/smarcomm/my/page.tsx` (#8B5CF6)
  - `app/(HeRo)/hero/my/page.tsx` (#0EA5E9)
  - `app/(RooK)/rook/my/page.tsx` (#1E88E5)
  - `app/(YouInOne)/youinone/my/page.tsx` (#1AAD64, "Crew")
  - `app/(Mindle)/mindle/my/page.tsx` (#6366F1)
  - `app/(TenOne)/my/page.tsx` (#171717)
  - `app/(WIO)/wio/app/my/page.tsx` (아바타 추가)
  - `app/(Badak)/badak/my/page.tsx` (Universe Profile 링크 추가)

### DB 변경
- 25개 사이트 `is_open=true` 설정 (Supabase MCP execute_sql)
- `avatars` 스토리지 버킷 생성 (public, 2MB, jpeg/png/webp/gif) + RLS 정책

### 결정사항
- 서비스 접근모델 6종 확정: 오픈/구독/구매/멤버십/직원/내부
- MyProfileCard = 모든 사이트 my 페이지의 프로필 표준 컴포넌트
- 아바타는 클라이언트에서 256×256 WebP 압축 후 업로드
- 연락처 포맷 `formatPhone()` 전사이트 일관 적용 (010-0000-0000)
- Staff는 닫힌 사이트도 "닫힘" 뱃지로 볼 수 있음, 일반 사용자는 오픈 사이트만 표시
- 후속 과제: SmarComm/WIO/BrandGravity 구독 서비스 헤더 통일

---

## 2026-04-16 (사무실, 세션 52 Part 6) — MADLeague 전체 리디자인 + 도메인 분기 문서화

### MADLeague 전체 리디자인
- `app/(MADLeague)/madleague/page.tsx` — Hero 단순화(버튼 삭제), Clubs "경쟁을 통한 성장" 2컬럼 레이아웃, CTA DAMbe 캐릭터+lools@tenone.biz
- `features/madleague/MadLeagueHeader.tsx` — 로고 `madleague-circle-sq.png`, "동아리" 메뉴 삭제
- `features/madleague/MadLeagueFooter.tsx` — `footer_Logo.png`, 연락처 `lools@tenone.biz`
- `features/madleague/KoreaClubMap.tsx` — `overflow-hidden rounded-2xl` 라운드 코너
- `app/(MADLeague)/madleague/programs/layout.tsx` (신규) — sticky 수평 서브내비 6탭
- `app/(MADLeague)/madleague/programs/competition/page.tsx` — Static 수상작 아카이브 3개 대회
- `app/(MADLeague)/madleague/programs/{project,markethon,dam,insight-touring}/page.tsx` — 전체 리디자인
- `app/(MADLeague)/madleague/clubs/page.tsx` — `py-32`, `text-4xl`, 2컬럼 그리드
- `app/(MADLeague)/madleague/madzine/page.tsx` — 매거진 피처+게시판 하이브리드 다크 레이아웃

### 도메인 분기 시스템 수정·문서화
- `lib/site-context.tsx` — pathSiteMap 추가. localhost·www.tenone.biz에서 `/madleague` 경로 → `isMadLeague=true`
- `lib/site-config.ts` — `domainMap`에 `madleague.tenone.biz` 추가
- `CLAUDE.md` — 유니버스 도메인 분기 시스템 섹션 신규 추가

### 미결
- `sql/madleague_competition_archive.sql` 작성 완료, PAT 만료로 미실행
- `lools@tenone.biz` 로그인 실패 미해결 (계정 존재·인증 확인됨, 비밀번호 불일치 의심)

---

## 2026-04-16 (사무실, 세션 52 Part 5) — MADzine 고도화 + 공통 헤더 ABOUT 정리

### MZ-1~8: MADzine 게시판 고도화
- DB `sql/madleague_phase2_madzine.sql` — `mad_articles`에 author_id/status/excerpt/reject_reason 컬럼, `mad_article_likes`/`mad_article_comments` 테이블, `mad_increment_article_views()` RPC
- 회원 투고 플로우 `/madleague/madzine/write` — 초안 저장/검토 제출/반려 후 재작성
- 아티클 상세 `ArticleActions`(좋아요/공유/URL복사) + `ArticleComments`(매드리거 전용) + `ArticleViewPing`(세션당 1회 조회수)
- Admin API `/api/madleague/admin/articles` — status 필터 + publish/reject/unpublish
- Intra MI-A 대시보드에 "MADzine 검토" 탭 추가

### 공통 헤더 ABOUT 그룹화 원칙 재확립
- ABOUT은 **UniverseUtilityBar**(ABOUT 로그인 가입 공유 검색)에 속함. 메인 nav에 두지 않음
- MadLeagueHeader/Footer의 navItems에서 "소개" 제거
- RooK/MoNTZ/Jakka/MadLeague 헤더의 잘못된 `hideAbout` prop 삭제 → ABOUT 정상 노출
- TenOne PublicHeader는 `hideAuth: true`로 로그인/가입 원천 차단 (변경 없음)

---

## 2026-04-16 (사무실, 세션 52 Part 4) — Phase 2 핵심 기능 (인증서 + 커뮤니티 + 프로필)

### M2-F: 인증서 시스템 ⭐
- **DB** `sql/madleague_phase2_certificates.sql` — `mad_certificates` 테이블 + RLS + 유틸 함수
  - `mad_gen_cert_code()` — A-Z0-9 10자리 고유 코드 생성
  - `mad_eligible_certificates(p_member_id)` RPC — 활동/수상/Crown 인증서 자동 판별
- **API** `/api/madleague/certificates` GET(발급가능+기발급 목록), POST(발급)
- **페이지**:
  - `/madleague/member/certificate` 발급 대시보드 (발급가능·기발급 섹션)
  - `/madleague/certificate/verify` 검증 코드 입력 페이지
  - `/madleague/certificate/verify/[code]` 진위 표시 (유효/취소/미존재 3상태)
  - `/madleague/certificate/print/[code]` A4 landscape 인쇄 레이아웃 (브라우저 Ctrl+P → PDF)
- 4종 인증서: activity / competition / award / crown

### M2-I: 커뮤니티
- **DB** `sql/madleague_phase2_community.sql` — `mad_posts` + `mad_comments` + RLS (매드리거만 read, 본인만 CUD) + comments_count 동기화 트리거
- **API**:
  - `/api/madleague/posts` GET(카테고리/동아리 필터, JOIN 저자+동아리) / POST(작성)
  - `/api/madleague/posts/[id]` GET(상세+댓글) / POST(댓글 작성) / DELETE(본인 글)
- **페이지**:
  - `/madleague/community` 피드 (카테고리 6종 + 동아리 필터 + 모달 작성)
  - `/madleague/community/[id]` 글 상세 + 댓글 섹션 (`CommentSection` 클라이언트)
- 6 카테고리: free / question / share / insight / pinboard / notice

### M2-B: 프로필 편집
- **API** `/api/madleague/member/profile` PATCH (bio, skill_tags, portfolio_public, avatar_url, phone, university, major, year_in_school)
- **페이지** `/madleague/member/profile` — 읽기전용(이름·이메일) + 편집 가능 필드 + 스킬 태그 동적 입력
- 이름·동아리·기수는 운영진만 수정 (인증서·수상 데이터 무결성)

### /madleague/member 개선
- Quick actions 추가 (프로필 편집 · 인증서 발급 · 커뮤니티)

### 검증
- 라우트 5종 전부 200 OK
- 인증 가드 401 확인 (certs/posts/profile PATCH)
- TS 에러 0
- Prod DB 마이그레이션 2개 모두 HTTP 201

---

## 2026-04-16 (사무실, 세션 52 Part 3) — Intra 관리 + Phase 2 기반

### MI-A: Intra MADLeague 관리 대시보드
- **`/intra/ums/madleague/page.tsx`** 전체 재작성 — Mock 데이터 → 실DB 연동
  - 4탭: 개요 / 지원서 / HeRo / MADzine
  - 5개 StatCard (공식 동아리·대기 지원서·HeRo 신청·발행 아티클·MAD Crown)
  - 지원서 승인/반려 인라인 처리
  - HeRo 상태 전환 (pending → contacted → matched → closed)
  - MADzine 발행/추천 토글
- **Admin API 3종** — `app/api/madleague/admin/*`
  - `_auth.ts` — `requireIntraAdmin` 가드 (Bearer token + members 테이블 존재 확인 + service_role 클라이언트)
  - `applications/route.ts` — GET(status 필터) / PATCH(accept·reject·reviewing)
  - `hero/route.ts` — GET / PATCH(status 업데이트)
  - `articles/route.ts` — GET / PATCH(is_published·is_featured)
- 전 API 401 가드 확인

### M2-A: mad_members 테이블 + 가입 플로우 기반
- **`sql/madleague_phase2_members.sql`** — Prod 적용 완료
  - `mad_members` 테이블 (auth.users FK, club_id/cohort_id FK, role, status, activity_years[], skill_tags[], portfolio_public)
  - RLS: 본인 read/update, portfolio_public=true는 anon 읽기
  - `mad_set_updated_at()` 트리거
  - **`mad_promote_application_to_member()` 트리거** — `mad_applications.status='accepted'` 시 자동으로 mad_members 생성 + cohort member_count +1
  - `mad_link_member_to_user()` 함수 (이메일 기반 user_id 연결)
- **`/api/madleague/member/link`** POST — 로그인한 사용자 이메일로 mad_members 매칭·연결
- **`/madleague/member/page.tsx`** — 3-state 게이트:
  - 미로그인 → 로그인/지원 CTA
  - 로그인 + 멤버 없음 → "내 기록 연동 시도" 버튼 + 지원 안내
  - 로그인 + 멤버 있음 → 대시보드 (이름/동아리/cohort/활동연도/상태 + Phase 2 예정 섹션)
- **`MemberLinkButton.tsx`** 클라이언트 연동 버튼
- 트리거 검증: `test@test.com` 지원서 승인 → mad_members 1건 자동 생성 확인

---

## 2026-04-16 (사무실, 세션 52) — MADLeague 사이트 Phase 1 완료

### Phase 1 전체 페이지 완성 (M1-A ~ M1-J)

#### 시드 확장 (`scripts/seed-madleague-results.js`)
- `mad_competition_results` 9건 (2024 지평주조·2025 대성학원·2025 리제로스 × 1·2·3위, CROWN 3개)
- `mad_archive` 6건, `mad_articles` 6건
- `mad_cohorts.member_count` 86명 총집계

#### 신규 페이지 (Phase 1 완성)
- **`/programs/competition`** 재작성 — DB 드리븐 Hall of Fame, 연도/동아리/과제기업 필터, Process 설명
- **`/madzine`** 재작성 — 카테고리·연도 필터 (라이트 테마) + **`/madzine/[slug]`** 아티클 상세
- **`/archive`** + **`/archive/[id]`** — 연도/유형/동아리/수상 4축 필터
- **`/apply`** + **`/api/madleague/apply`** — 동아리 자동선택(`?club=`), 이메일 검증
- **`/hero`** + **`/api/madleague/hero`** — 관심분야 복수선택 + 로그인 시 user_id 자동 연동
- **`/about`** 리디자인 — Mission(MAD 3글자)/Members/Programs/BI/DAMbe/Contact
- **`/programs/{project, markethon, insight-touring, dam}`** 4개 개별 페이지

#### 수정
- **`features/madleague/MadLeagueFooter.tsx`** — "5개 권역" → "7개 권역"

#### 의사결정
- **M1-G (로고 자산) 보류** — 실제 7개 동아리 로고 이미지 확보 전까지 임시 컬러 원 유지
- **M1-J `/programs/im`** — 기존 363줄 legacy 콘텐츠 유지, 다크 레이아웃으로 래핑만

#### 검증
- 라우트 16종 전부 200 OK (curl 일괄 확인)
- `POST /api/madleague/apply` `{"ok":true}` 응답
- 필터 쿼리스트링 (archive/madzine) 정상 작동
- 브라우저 렌더: Hall of Fame 수상팀(팀명·동아리 컬러점·수상명·CROWN) 전부 정상
- `npx tsc --noEmit` 관련 에러 0

---

## 2026-04-16 (사무실, 세션 52) — MADLeague 사이트 Phase 1 착수

### DB 스키마 + Home 랜딩 + Clubs + 라우트 리팩토링

#### 스펙 문서
- **`docs/MADLeague_Site_Plan_v2.md`** 신규 — MADLeague 사이트 v2 기획서 (사이트맵, 8개 Phase 1 테이블, 디자인 시스템, 인증서 자동화, 3 Phase 로드맵)

#### DB (Prod `ziotlxkdctlhiwkgmmsh`)
- **`sql/madleague_phase1.sql`** 신규 — 8개 테이블 생성 + RLS + 시드
  - `mad_clubs` (7개 동아리: MADLeap, PAM, ADlle, ABC, SUZAK, P:ad, AD Zone)
  - `mad_cohorts` (14개: 7동아리 × 2024/2025)
  - `mad_competitions` (3개: 2024 지평주조, 2025 대성학원, 2025 리제로스)
  - `mad_competition_results`, `mad_archive`, `mad_articles`, `mad_applications`, `mad_hero_applications`
  - 전 테이블 `tenant_id TEXT DEFAULT 'tenone'` (8원칙 #6 선반영)
- **`scripts/reseed-madleague.js`** 신규 — Korean UTF-8 인코딩 복구 (최초 bash+curl 경로에서 Windows CP949 변환으로 한글 깨짐 → Node fetch로 재시드)
- **`scripts/run-sql.js`** 패치 — `SUPABASE_ACCESS_TOKEN` 우선, `SUPABASE_SERVICE_ROLE_KEY_PROD`는 fallback

#### 코드 변경 (UI)
- **`lib/supabase/madleague.ts`** 신규 — `fetchMadClubs`, `fetchMadClubBySlug`, `fetchMadCompetitions`, `fetchMadHallOfFame`, `fetchMadArticles`, `fetchMadStats`
- **`app/(MADLeague)/layout.tsx`** — 라이트(`bg-white`) → 다크(`bg-[--mad-black]`). CSS 변수 5개(`--mad-red #EC1D25`, `--mad-black`, `--mad-gold #FFC000`, `--mad-white`, `--mad-gray`) 주입
- **`features/madleague/MadLeagueHeader.tsx`**
  - 로고: 초록 `MAD` 블록 → 빨간 점(●) + "MAD League" 워드마크
  - 액센트: `#0F5132` → `#EC1D25`
  - navItems: 소개/동아리/프로그램/MADzine/아카이브/지원하기 (모두 `/madleague/*` 절대경로)
- **`features/madleague/MadLeagueFooter.tsx`** — 동일한 로고/링크 업데이트
- **`app/(MADLeague)/madleague/page.tsx`** — UnderConstruction stub → 풀 랜딩 (Hero+Numbers+Programs+Clubs+HallOfFame+MADzine+CTA, DB 실시간)
- **`app/(MADLeague)/madleague/clubs/page.tsx`** 신규 — 7 동아리 리스트
- **`app/(MADLeague)/madleague/clubs/[slug]/page.tsx`** 신규 — 동아리 상세(히어로, 활동연도, 수상, 갤러리, 지원 CTA)
- **`app/(MADLeague)/madleague/programs/page.tsx`** 신규 — 프로그램 인덱스(6 카드)

#### 라우트 리팩토링 (구→신)
- **이동:** `/madleague/pt` → `/madleague/programs/competition`
- **이동:** `/madleague/idea-movement` → `/madleague/programs/im` (essence 서브도 함께)
- **삭제:** `/madleague/program` (새 `/madleague/programs`로 대체)
- **`next.config.ts`** — 301(308) redirects 추가: `/program→/programs`, `/pt→/programs/competition`, `/idea-movement→/programs/im`, `/leaguer→/member`

#### 의사결정
- 동아리 7개 전부 active 확정 (P:ad 강원, AD Zone 충청 포함)
- 인증 아키텍처: tenone.biz 통합 Supabase Auth 재사용 (별도 서브프로젝트 없음)
- `mad_competition_results.team_id`는 Phase 1에서 FK 없이 UUID. Phase 2에 `mad_competition_teams` 생성 시 FK 추가
- 동아리 컬러 7종(#EC1D25/#0066CC/#FF6B35/#00A86B/#FFC000/#4A90E2/#9B59B6) 임시 지정 — 실제 동아리 로고/브랜딩 들어오면 교체

#### 검증
- `curl /madleague/*` 라우트 9종 전부 정상 (200 또는 308 리다이렉트)
- 브라우저 렌더: 한글 정상, Hero/Numbers/Programs/Clubs/HallOfFame 섹션 모두 DB 데이터로 표시
- `npx tsc --noEmit` madleague 관련 에러 0

---

## 2026-04-16 (사무실, 세션 51)

### Badak 이월 항목 일괄 처리 + Phase 0 로드맵 확인

#### 코드 변경
- **`app/intra/ums/badak/needs-queue/page.tsx`** — 관리자 인증 헤더 추가. `createClient().auth.getSession()` → Bearer 토큰. `authError` 상태 처리 추가
- **`app/api/badak/talks/route.ts`** — `unreadTotal` 집계 추가. `wio_talk_messages.read_by` 배열 기반 `.not('read_by', 'cs', '{userId}')` 쿼리로 읽지 않은 메시지 수 계산
- **`app/(Badak)/badak/my/page.tsx`** — `setUnreadTalkCount(0)` → `setUnreadTalkCount(talksData.unreadTotal ?? 0)` 실값 사용

#### 의사결정
- Phase 0 (테넌트 격리) → Phase 1 (제품 활성화) 순서로 다음 작업 진행 확정
- Badak 잔여 항목(검색/알림/온보딩)은 Phase 0 병행으로 처리

---

## 2026-04-16 (사무실, 세션 50)

### E 시리즈 정리 작업 완료 (E-1 ~ E-4)

#### 코드 변경
- **`app/api/badak/member/route.ts`** (E-1) — `SupabaseClient` 타입 명시적 import. `data as { affiliations: string[] | null }` 캐스트로 TS 에러 해소
- **`app/api/badak/member/onboard/route.ts`** (E-1) — 동일 패턴 적용
- **`app/api/badak/needs/review/route.ts`** (E-2, 신규) — `requireAdmin()` 헬퍼: JWT 검증 + `badak_members.role` 체크. GET/PATCH 모두 admin/super_admin만 허용
- **`app/api/cron/badak-expire-wants/route.ts`** (E-4, 신규) — `CRON_SECRET` Bearer 검증 후 `supabase.rpc('expire_badak_wants')` 호출
- **`app/intra/ums/badak/needs-queue/page.tsx`** (신규) — 관리자용 니즈 승인 큐 UI. pending_review 목록 + 승인/거절 버튼

#### DB 변경 (E-3, E-4)
- `sync_community_post_likes` 트리거: `badak_community_likes` AFTER INSERT OR DELETE → `badak_community_posts.likes_count` 업데이트
- `sync_community_post_comments` 트리거: `badak_community_comments` AFTER INSERT OR DELETE → `badak_community_posts.comments_count` 업데이트
- `expire_badak_wants()` PL/pgSQL 함수: `status = 'candidate'` + `expires_at < now()` → `status = 'expired'`로 일괄 업데이트

#### 의사결정
- Vercel Cron 라우트는 `CRON_SECRET` 환경 변수 설정 후 vercel.json에 `"0 0 * * *"` 등록 필요
- E-3 트리거는 Supabase Management API로 직접 적용 완료 (Dashboard 불필요)

---

## 2026-04-16 (사무실, 세션 49)

### WIO Talk + Connections 마이페이지 탭 완성 (Phase C-2)

#### 코드 변경
- **`app/(Badak)/badak/my/page.tsx`** — 관심·대화 탭 실DB 연동 완성
  - state: `connections`, `pendingIncomingCount`, `threads`, `unreadTalkCount`, `activeThreadId`, `messages`, `messageText`, `sendingMessage`, `connectionsLoading`, `talksLoading`
  - useEffect: `/api/badak/connections` + `/api/badak/talks` 병렬 fetch
  - 폴링 useEffect: `activeThreadId` 변경 시 5초마다 `/api/badak/talks/[id]` GET
  - `handleConnectionRespond`: PATCH + 수락 시 talks 탭 자동 이동 + 스레드 오픈
  - `handleSendMessage`: POST + optimistic append + Enter key
  - 관심 탭 UI: 받은 제안(수락/거절/대화 보기) + 보낸 제안 목록
  - 대화 탭 UI: 스레드 사이드바 + 메시지 영역(말풍선) + 입력창. 모바일 목록↔메시지 전환

#### 의사결정
- `unreadTalkCount`: 실시간 추적은 추후 구현, 현재 0으로 초기화 (read_by 배열 기반 집계 필요)
- 폴링 5초 간격: Supabase Realtime 대신 단순 HTTP polling (WIO Talk 설계 원칙)

---

## 2026-04-15 (사무실, 세션 48)

### Badak UX 버그 수정 + 마이페이지 프로필 강화

#### 코드 변경
- **`features/badak/BadakHeader.tsx`** — navItems에서 "바닥이란" 제거 (UniverseUtilityBar ABOUT과 중복)
- **`features/badak/cloud/FeedHighlights.tsx`** — PC 마우스 드래그 스크롤 추가 (`isDragging/hasDragged/startX/scrollLeft` ref 패턴). 인라인 CardWrapper 컴포넌트 안티패턴 제거 → 직접 조건부 Link/div 렌더링
- **`lib/badak-cloud-data.ts`** — FEED_ITEMS 3개(g5/g1/g8)에 `imageUrl` Unsplash URL 추가
- **`app/(Badak)/badak/groups/[id]/page.tsx`** — 전면 단순화: 게시판/신청 기능 제거(~600줄 삭제). 바닥장 영역 버튼으로 변경 → `MemberProfileSheet` 열기
- **`app/(Badak)/badak/my/page.tsx`** — `CareerEntry` 인터페이스 추가. `avatarUrl/career` state 추가. ProfileBoostCard: 프로필 사진 업로드(FileReader, 1MB), 이력 CRUD(추가/수정/삭제, 연월 select, isCurrent 체크박스), 미리보기 버튼+모달(아바타+이름+연차+소개+이력). 프로필 헤더에 avatarUrl 반영. call site에 신규 props 전달
- **`app/api/badak/member/route.ts`** — PUT에 `avatar_url`, `career` 저장 추가. career 컬럼 미존재 시 graceful fallback (career 제외 재시도)

#### 미완 (DB 마이그레이션 필요)
- `badak_members.career JSONB` 컬럼: `ALTER TABLE badak_members ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '[]';` — Supabase Dashboard SQL Editor에서 수동 실행 필요

---

## 2026-04-15 (사무실, 세션 47)

### Badak 유니버스 통합 (Sprint 1-1, 1-4) + 니즈 클라우드 100개

#### 신규 파일
- `app/api/analytics/event/route.ts` — 이벤트 로깅 POST + intra용 집계 GET (MAU/평균 체류/주간 방문)
- `features/badak/useAnalytics.ts` — 페이지뷰 + `sendBeacon` 언로드 세션 종료 훅
- `features/badak/BadakAnalytics.tsx` — 서버 컴포넌트 레이아웃 삽입용 클라이언트 래퍼
- `sql/badak-affiliations-sync.sql` — 기존 badak_members → members.affiliations 싱크 스크립트

#### DB 변경 (Prod)
- `wio_analytics_events` 테이블 신설 — `event_type`, `brand_id`, `tenant_id`, `user_id`, `session_id`, `page_path`, `properties jsonb`, `duration_sec`. 2개 인덱스(brand+created, user+created). RLS: service insert 허용, 인증 유저 select
- `badak_needs` 70 → 100행 (30개 추가)
- `members.affiliations` 싱크 — is_active 기존 badak_members 1명 → `['badak']` 추가

#### 코드 변경
- **`api/badak/feed/route.ts`** — 피드 응답에 `leaderId: g.leader.id` 포함. 지금까지 없어서 FeedCard → MemberProfileSheet 연결이 항상 Fallback "상세 프로필은 멤버 가입 후 확인" 메시지로 표시됐음
- **`api/badak/member/route.ts`** (POST) — `badak_members` 생성 후 `members.affiliations`에 `'badak'` 자동 추가 (`addBadakAffiliation` 헬퍼 추가)
- **`api/badak/member/onboard/route.ts`** (PATCH) — 온보딩 완료 시 `members.affiliations` 동기화
- **`api/badak/members/[id]/route.ts`** — `members` 테이블 JOIN으로 이름/아바타 최신값 반영. `affiliations`에 `'badak'` 없으면 404 응답
- **`api/badak/cloud/route.ts`** — 3버그 수정: status 필터 `'active' → 'gathering'` 포함, limit 60→100, 존재하지 않는 `category` 컬럼 제거
- **`app/(Badak)/badak/page.tsx`** — 클라우드 단어 제한 모바일 50→60 / 데스크탑 80→100
- **`app/(Badak)/layout.tsx`** — `BadakAnalytics` 컴포넌트 추가 (페이지뷰 자동 기록)
- **`app/intra/ums/badak/page.tsx`** — 성장 지표 전면 교체
  - 이번달 신규: 실DB count (지난달 수치도 sub로 표시)
  - 월간 성장률: 이번달-지난달 / 지난달 * 100 (색상 양수/음수 구분)
  - MAU/체류시간/방문횟수: 이벤트 수집 데이터 기반, 없으면 "수집 중" 표시
  - 데이터 출처 하단 안내 문구

#### 의사결정
- **Sprint 1-2, 1-3 스킵**: 오픈채팅방 페이지(`/badak/rooms`), DAM Party 페이지(`/badak/dam-party`)는 만들지 않기로 결정 (사용자 지시)
- **로컬 dev 이슈 인식**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` (JWT, `_PROD` 아님) 없음 → 모든 Badak API가 로컬에서 "supabaseKey is required" 실패 → Cloud API는 try/catch로 Mock 폴백, 나머지는 500. Prod 배포 시 Vercel env로 정상 작동

---

## 2026-04-15 (사무실, 세션 46 — 후반)

### Badak UX 전면 개선 + 유니버스 관점 QA

#### 신규 파일
- `features/badak/MemberProfileSheet.tsx` — 개설자/멤버 공개 프로필 바텀 시트 (아바타/이름/역할/직무/Bio/개설모임/태그)
- `app/api/badak/members/[id]/route.ts` — 공개 프로필 API (인증 불필요, 활성 모임 5개 포함)
- `app/api/badak/groups/[id]/route.ts` — 모임 PATCH (join_type 등 바닥장 전용 필드 변경)
- `features/badak/cloud/ParticipationBanner.tsx` — 피드 중간 참여 독려 문구 13종 (i=1,6,12 위치 삽입)
- `features/badak/cloud/QuoteBanner.tsx` — 피드 중간 격언 배너 (i=3,9 위치)

#### NeedDetailSheet 전면 재작성
- **관련 니즈 클릭 가능** (`span` → `button`) + 정렬 방식 `sin 해시` → `members 수 내림차순(인기순)`
- **카운트 통일** — 상단 `word.members`와 하단 `interestCount` 불일치 해결 (`Math.max`로 통합)
- **슬라이딩 애니메이션 제거** — `appeared` 상태로 첫 마운트에만 `badak-fadeUp` 적용 (리렌더링마다 재실행 차단)
- **불꽃(🔥) 버튼 제거** — 목적 불명확, 관심 버튼만 유지
- **관심 버튼 낙관적 UI** — `needId` 없는 Mock 데이터도 즉시 +1 반응
- **텍스트박스 + 버튼 시각적 분리** — 배경색 `rgba(255,255,255,0.04)` vs `rgba(0,0,0,0.25)` 대비
- **"관심이에요" → "관심있어요"** 어감 수정
- **15명 로직 변경** — 방 개설 버튼 항상 표시, 15명 달성 = "바닥 공식 런칭"
- **방 개설 버튼 작동 수정** — `onClose()`/`router.push()` 순서 반전 (router 먼저 → 언마운트 안전), `type="button"` 명시

#### FeedCard 리더 표시 개선
- "바닥장 김도현" 통합 텍스트 → "김도현" 이름 중심 + `바닥장` 소형 뱃지 분리
- 아바타 이니셜: "바" → 실제 이름 첫 글자 "김"
- **리더 영역 클릭 → `MemberProfileSheet` 공개 프로필** (이름/아바타 클릭 가능)

#### 니즈 클라우드 찌그러짐 수정
- 모바일 sphere radius 120 → 130~170 (화면 폭 42%, 170px 상한)
- 단어 수 제한 — 모바일 50개 / 데스크탑 80개 (인기순 정렬)
- `CloudBubble` 반응형 폰트 — 작은 구 9~13px (기존 11~16)
- 긴 텍스트 자르기 — 모바일 10자+, 데스크탑 14자+ `…`
- 뒷면 숨김 강화 — `depth<0.15` → `depth<0.2`
- 컨테이너 비율 `radius*2.8` → `radius*2.4`

#### API 보강
- `/api/badak/needs` POST — 신규 니즈 생성은 인증 유저만 허용 (스팸 방지). 기존 count++는 누구나 가능
- `/api/badak/groups/[id]/join` POST — **양방향 알림**: 바닥장(승인제만) + 신청자(선착순 "확정", 승인제 "접수")
- `PATCH /api/badak/groups/[id]` — 바닥장만 join_type 변경 가능

#### 개선사항 리스트업 (문서)
- 유니버스 관점 전문가 QA 수행 — 4개 역할(관리자/바닥장/회원/일반유저) 교차 검증
- Ten:One Universe 8대 원칙 중 5건 위반 식별
- `/intra/ums/badak` 가이드 분석 — 기존 코어(채팅방 48개, DAM Party 47회차) 연결 누락 발견
- WIO 역방향 환류 후보 10개 추출 (BottomSheet, withLoginGate HOC, 낙관적 리액션 훅 등)

### 주요 결정사항
- **`badak_members` 별도 테이블 폐기 방향** — 기존 `members.affiliations=['badak']` 활용
- **`/badak/admin` 페이지 개발하지 않음** — `/intra/ums/badak`에 통합
- **HeRo Time** 프로필 섹션 신설 필요 (크로스 브랜드 커리어 이력)

---

## 2026-04-15 (사무실, 세션 46 — 전반)

### Badak 사이트 정밀 검토 + 12개 이슈 일괄 수정

#### 신규 파일
- `app/api/badak/notifications/route.ts` — 알림 API (GET 목록/PUT 읽음 처리)

#### 수정 파일 (보안)
- 14개 Badak API 파일 — `SUPABASE_SERVICE_ROLE_KEY` 폴백 제거, 명시적 에러 처리

#### 수정 파일 (API 신규 엔드포인트)
- `app/api/badak/groups/[id]/join/route.ts` — GET (참여 상태 조회) + 참여 신청 시 바닥장 알림 생성
- `app/api/badak/member/route.ts` — PUT (프로필 수정)
- `app/api/badak/community/[postId]/route.ts` — PUT (글 수정) + DELETE (글 삭제) + 조회수 직접 증가
- `app/api/badak/community/[postId]/comments/route.ts` — GET (댓글 목록) + DELETE (댓글 삭제)
- `app/api/badak/groups/[id]/posts/route.ts` — PUT (게시글 수정) + DELETE (게시글 삭제) + 페이지네이션 + N+1 해결
- `app/api/badak/posts/[postId]/comments/route.ts` — DELETE (댓글 삭제) + 페이지네이션
- `app/api/badak/groups/route.ts` — PUT (모임 수정) + DELETE (모임 삭제)
- `app/api/badak/cloud/route.ts` — Phase 1 실DB 전환 (badak_needs 우선, Mock 폴백)

#### 수정 파일 (프론트엔드)
- `app/(Badak)/badak/community/page.tsx` — 전면 개편: 글 상세 + 좋아요 + 댓글 + 수정/삭제 + 검색/필터
- `app/(Badak)/badak/groups/[id]/page.tsx` — 참여 상태 서버 조회 + CTA 4분기 (leader/approved/applied/none)
- `app/(Badak)/badak/my/page.tsx` — 내 글 실DB 전환 + 프로필 실DB + 메시지탭→알림탭 + 프로필 수정 API 연결
- `app/api/badak/community/[postId]/like/route.ts` — broken RPC 제거, COUNT 직접 사용
- `app/api/badak/feed/route.ts` — 타입 캐스팅 수정

#### DB 마이그레이션
- `badak_notifications` 테이블 생성 (type, title, body, link, read, metadata) + RLS

#### 결정 사항
- 모임 참여 상태는 서버에서 관리 (leader/approved/applied/none)
- 참여자 있는 모임은 삭제 대신 closed 처리
- 서비스 키 없으면 에러 throw (anon_key 폴백 절대 금지)
- 커뮤니티에 글 상세 화면 추가 (좋아요/댓글/수정/삭제 완비)
- 마이페이지 메시지 탭 폐기 → 알림 탭으로 전환 (실DB)

---

## 2026-04-14 (집, 세션 45)

### Badak Next Stage — 다크 테마 통일 + 클라우드 개선 + 바닥장 시스템

#### 신규 파일
- `app/(Badak)/badak/apply/page.tsx` — 바닥장 신청 페이지 (이름/산업군/경력/분야/동기/계획/연락처, 직접 입력 분야는 승인 시 전체 카테고리 반영)

#### 수정 파일 (다크 테마 통일 — #1a1a2e)
- `app/(Badak)/badak/page.tsx` — skyBg, 슬로건, 서브카피 8종 랜덤, 스파크 amber, 입력영역 다크
- `features/badak/cloud/CloudBubble.tsx` — amber/gray 색상 + CSS transition(0.08s) + willChange
- `features/badak/cloud/NeedsInput.tsx` — 입력창/버튼 다크 스타일
- `features/badak/cloud/FeedCard.tsx` — 카드/뱃지/프로그레스바 다크
- `features/badak/cloud/FeedHighlights.tsx` — 하이라이트 카드 다크
- `features/badak/cloud/FeedSection.tsx` — 컨테이너/탭 다크
- `lib/badak-cloud-data.ts` — `getTimeBasedSky()` 6시간대 전부 다크 그라디언트
- `features/badak/BadakHeader.tsx` — 메뉴 정리 (모임, 커뮤니티, 스토리, 탐색, 모임 개설, 바닥장 신청, 바닥이란)

#### 수정 파일 (기능)
- `app/(Badak)/badak/groups/create/page.tsx` — 커스텀 니즈 드롭다운(검색+제목 기반 추천+미개설만), 바닥장 분기(비바닥장: 1회만+유도 배너), 운영방식 7종, 태그 ','구분, groupCategory
- `app/(Badak)/badak/about/page.tsx` — 다크 테마 리라이트 (약한 연결 고리 철학 + 4단계 흐름 + 서비스 링크 + CTA)

#### 결정 사항
- 메인 페이지 전체 #1a1a2e 다크 테마 확정
- 바닥장 = 트레바리 클럽장 모델. 관리자 승인제, 승인 시 role='badakjang'
- 비바닥장은 1회 단발 모임만 개설 가능, 바닥장 신청 유도
- 직접 입력 분야가 승인되면 바닥 전체 카테고리에 반영
- 운영방식: 네트워킹, 스터디, 사이드 프로젝트, 강의, 토론, 멘토링/코칭, 워크숍/세미나
- 클라우드 애니메이션: dt 보간 + CSS transition + FRICTION 0.985

---

## 2026-04-14 (집, 세션 44)

### Vercel 비용 관리 + 배포 정책 수립

#### 수정 파일
- `vercel.json` — `git.deploymentEnabled` 추가: dev/feature-* 프리뷰 배포 차단
- `CLAUDE.md` — "작업 종료 프로토콜"에 Vercel 비용 관리 규칙 블록 추가, "절대 하지 말 것"에 중간 push 금지 항목 추가

#### 결정 사항
- Vercel Pro 전환 ($20/월). 동일 커밋 20+회 반복 배포가 Free 리밋 소진 원인
- **push는 작업 종료 시 1회만** — 작업 중 push 금지 (매 push → 자동 배포 → 크레딧 소진)
- 로컬 `npm run dev`로 확인, Vercel 배포는 최소화
- On-Demand 상한 $100 설정 완료

---

## 2026-04-13 (집, 세션 41)

### Intra Phase C — ERP 입력 폼 + Wiki DB 연동

#### 수정 파일
- `app/intra/erp/finance/billing/page.tsx` — 청구서 발행 모달 추가 (InvoiceModal 컴포넌트, createInvoice 연동)
- `app/intra/erp/finance/card/page.tsx` — 하드코딩 mockCards 제거, card_usage에서 카드별 집계 동적 생성
- `app/intra/wiki/library/page.tsx` — DB items 실제 로드 (기존 TODO 해결), displayItems = DB || mock
- `app/intra/wiki/faq/page.tsx` — FAQ 등록 모달 추가 (AddFaqModal), wiki_faq 테이블 저장 + 로컬 fallback

---

## 2026-04-12 (집, 세션 40)

### Brand Gravity 컨설팅 서비스 — P0 전체 완료

#### 신규 파일
- `app/api/gravity/prescan/run/route.ts` — Quick Probe API (시장 사전 진단, 유형 A/A'/B/C 자동 판정)
- `app/api/gravity/social/run/route.ts` — Naver 소셜 언급 · SOV · 감정분석 API
- `app/api/gravity/brand-value/run/route.ts` — 브랜드 4대 가치 (인지도/호감도/추천도/만족도) 산출
- `lib/gravity/notify.ts` — agent_messages 기반 그래비티 에이전트 메신저 알림 유틸
- `components/gravity/PrescanCard.tsx` — 시장 유형 뱃지 + 여정 히트맵 + 4대 가치 바 카드
- `app/intra/gravity/[productId]/intake/page.tsx` — 클라이언트 사전 질문서 A~E 5섹션
- `docs/BrandGravity_Service_Design.md` — 1주 컨설팅 프로세스 설계서

#### 수정 파일
- `app/api/gravity/gap/run/route.ts` — Gravity Score 공식 수정 (Mention40 + Context25 + Rank20 + Coverage15)
- `app/api/gravity/scan/run/route.ts` — 5단계 → 8단계 파이프라인 (source/voice/brand-value 추가) + 메신저 훅
- `app/api/gravity/apply/route.ts` — 신청 시 그래비티 에이전트 알림 추가
- `app/intra/gravity/page.tsx` — 대시보드 "오늘의 할 일" + "에이전트 메시지" 섹션 추가
- `app/intra/gravity/[productId]/page.tsx` — PrescanCard 삽입
- `app/intra/gravity/[productId]/report/page.tsx` — 섹션 11(4대가치) + 섹션 12(세일즈액션) + 배점 수정
- `scripts/reset-and-reseed-dancingwhale.js` — 춤추는고래 여성위생용품으로 전면 재작성

#### DB 변경
- 신규 테이블: bg_prescan_results, bg_brand_values, bg_intake_responses
- bg_products: market_type 컬럼 추가
- agent_profiles: gravity(그래비티) 에이전트 INSERT (layer=1, can_invoke: 1001/smarcomm/mindle)

#### 파이프라인 검증
- 춤추는고래 8단계 전체 실행 완료: Gravity Score 6/100, Brand Values 종합 20/100 (정상)

---

## 2026-04-10 (집, 세션 38)

### Brand Gravity 보고서 시스템 구축

#### 신규 파일
- `app/intra/gravity/[productId]/report/page.tsx` — 클라이언트 전달용 보고서 페이지

#### DB 마이그레이션
- bg_gravity_scores: `context_score` 컬럼 추가
- bg_products: `site_url`, `specs` 컬럼 추가
- bg_ai_probe_results: 6개 컬럼 추가

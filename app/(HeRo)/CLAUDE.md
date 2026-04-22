# HeRo 브랜드 가이드

> **HeRo** — 인재·기업 매칭을 위한 심리/역량 진단 플랫폼. "당신의 영웅 유형을 알아보세요"

---

## 정체성

- **한 줄 소개**: HIT(**H**e**R**o **I**dentification **T**est) 심리·역량 진단 + Tetrad 매칭 엔진 + AI 커리어 상담
- **톤앤매너**: 따뜻함·희망적·전문적. 사용자의 성장을 응원하는 톤.
- **주 컬러**: `#E53935` (HeRo Red)
- **디자인 방향**: 검사 → 결과(티저) → 회원 전환 → 유료(PDF·AI) → 매칭

---

## 🎯 제품의 본질 — Matching Tetrad

> **HeRo는 단순 심리검사가 아니라 인재·기업 매칭 엔진이다.**
> 설계 전체는 [docs/HeRo_Matching_Tetrad_v1.md](../../docs/HeRo_Matching_Tetrad_v1.md) 단일 진실 소스.

```
기업 측                 인재 측
────────────────       ────────────────
 TIH (속내·고민·3축)  ↔  HIT (본질·심리·적성)
 JD  (자리의 서술)    ↔  JH  (자리의 바람)
────────────────       ────────────────
       Reputation Vector (외부 보정)
                 ↓
        AI 큐레이션 (양쪽 비공개)
```

네 요소 모두 DB 기반 구조화된 데이터로 존재해야 매칭이 가능하다. 질문·응답이 하드코딩되면 매칭 대상이 될 수 없다.

---

## 🔑 Funnel 모델 — 3단계 전환

> **비회원 ⇒ 회원 ⇒ 유료** 3단계 전환. 각 단계마다 접근 가능한 산출물이 다르다.

### 개인 (인재 풀)

| 단계 | 접근 | 산출물 | 목적 |
|------|------|--------|------|
| **① 비회원** | 이메일만 입력 | HIT 간략 결과 (티저) · 공유 가능 | 리드 확보 · 바이럴 |
| **② 회원** | 이메일/SNS 가입 | HIT 풀 리포트 · 유형 badge · JH 작성 | funnel 중간 · Universe 진입 |
| **③ 유료** | 결제 (Stripe/Toss) | PDF 다운로드 · AI 상담 · HIT B/C/D/E/F 심화 | 수익화 · 매칭 대상 등록 |

### 기업 (기업 풀)

| 단계 | 접근 | 산출물 | 목적 |
|------|------|--------|------|
| **① 비회원** | 이메일 입력 | TIH 작성·접수 (씨치 라이트) | 기업 리드 |
| **② 기업 회원** | 기업 담당자 가입 | JD 등록·인재 큐레이션 요청 | funnel 중간 |
| **③ 유료 기업** | 구독/건별 결제 | 매칭 큐레이션 수신 · 트라이얼 관리 | 수익화 |

> ⚠️ **현재 상태**: 단계 ①은 배포됨. 단계 ②③ 결제 PG는 사업 시작 시점 연동 예정.

---

## 👥 회원 유형 (Universe × HeRo)

### 공통 원칙

- **모든 유저는 `members` 테이블이 SSOT** (Universe 공통)
- HeRo 관련 권한은 `member_capability_roles`에 `brand_id='hero'` row로 기록
- HeRo는 **capability 4종 탑재**: `community` · `course` · `subscription` · `purchase`

### 개인 회원 상태

| state | 조건 | 테이블 표현 |
|-------|------|-----------|
| **게스트 검사자** | 이메일만 · `member_id=NULL` | `hit_sessions.member_id IS NULL` |
| **회원** | `members` row + `affiliations @> ['hero']` | capability role: `member` |
| **유료 구매자** | 결제 완료 | capability role: `purchaser` (context `brand:hero`) |
| **정기 구독자** | 구독 결제 | capability role: `subscriber` (context `brand:hero`) |
| **코치/관리자** | 내부 | capability role: `coach` (context `brand:hero`) |

### 기업 회원 상태 (기업 담당자 = 개인 회원)

- 기업 자체: `hero_companies` row
- 담당자: `members` row (→ `hero_company_members` 연결 테이블로 기업 소속 표현) — **테이블 신설 필요**
- 기업 역할: capability `membership` (role: `representative` / `hiring_manager`)

---

## 🏅 HIT Hero Type — Universe-wide Identity Badge

> **HIT 결과로 얻는 "영웅 유형"은 HeRo 내부 요소가 아니라 Universe 전체에서 활용되는 identity layer다.**

### 원칙

1. 사용자가 HIT 검사를 받으면 64종 중 하나의 `type_code` 획득 (예: `C-INFJ`, `P-ENFP`)
2. `hit_hero_types` 테이블 = SSOT (64개 타입 정의, `character_name` · `character_label` · `strengths` · `cautions`)
3. 사용자는 **opt-in**으로 자기 유형을 Universe 프로필에 badge로 노출 선택 가능
4. 어느 브랜드 사이트에서든 `<HitProfileBadge memberId={...} />` 컴포넌트로 즉시 표시

### 적용 범위

- Badak 마이페이지 · MADLeague 멤버 카드 · Jakka 창작자 프로필 등 **모든 브랜드 /my에 삽입 가능**
- 외부 명함(QR), Mindle 인터뷰, YouInOne 팀 소개 등 Universe 콘텐츠 전반에서 태깅 가능
- 브랜드별 opt-in 설정: `member_capability_roles.context.show_hero_badge: true/false`

### 기술 구현

- 컴포넌트: [features/hit/HitProfileBadge.tsx](../../features/hit/HitProfileBadge.tsx)
- 주석: *"모든 사이트의 /my 페이지에 삽입 가능"*
- Empty state: "HeRo HIT 검사 · 나의 영웅 유형을 알아보세요" + `/hero/hit` CTA
- Filled state: type_code + nickname + DISC color + Holland code

---

## 🖥️ 마이페이지 패턴 (HeRo /my)

> **HeRo 마이페이지 최상단은 항상 `HitProfileBadge`. 그 아래 `MyProfileCard`. Universe 표준.**

```tsx
// app/(HeRo)/hero/my/page.tsx 구조
<div className="mb-6">
    <HitProfileBadge memberId={user?.id} />   // ← 영웅 유형 (Universe badge)
</div>
<MyProfileCard accentColor="#E53935" />        // ← 공통 프로필 카드
<CapabilitySection ... />                      // ← HeRo capability 역할
<Tabs>내 게시글 · 북마크 · 설정</Tabs>
```

- Empty state (검사 안 받음): 대시보드 스크린샷처럼 dashed border + "HeRo HIT 검사 · 나의 영웅 유형을 알아보세요" 카드
- Filled state: 타입 코드 badge + DISC 컬러 dot + Holland code · 준비도 등급

---

## 🎨 UI/UX 규약 — 색·클릭 SSOT

> **원칙**: 빨간색은 "행동을 유도하는 자리"에만 쓴다. 그 외에는 중립색. 클릭 가능 여부는 1초 안에 판별되어야 한다.
> 이 규약이 없으면 CTA가 묻히고, 장식이 버튼처럼 보이며, 사용자는 어디를 눌러야 할지 고민한다.

### 색 레이어 정의

| 레이어 | 용도 | 허용 색 | 예시 |
|---|---|---|---|
| **Action** | CTA 버튼, 활성 탭, 폼 제출, 포커스 | `bg-[#E53935]` + `text-white` · hover `bg-red-700` | "HIT - A 시작하기", 헤더 활성 메뉴 |
| **Accent** | 로고, 주 진입점 카드 테두리, 최상단 eyebrow 1곳 | `border-[#E53935]` (강조 면적 최소) | 랜딩 `border-2 border-[#E53935]` |
| **State** | 활성·선택·진행 중 상태 pill | `bg-red-50 text-[#E53935]` | "공통 기반" 배지, "진행 중" 상태 |
| **Content** | 정보성 아이콘, 태그, 순번, 섹션 라벨 | `text-neutral-400 ~ 700` | Brain/Target/Clock 아이콘, 태그 칩 |
| **Disabled** | 잠금·비활성 요소 | `bg-neutral-100 text-neutral-400` + `cursor-not-allowed` | "HIT - A 완료 후 이용 가능" |

### 빨간색 남발 금지 체크리스트

작업 끝낸 페이지에 빨간 요소를 세어보고 다음을 지켰는지 확인:

- [ ] **아이브로 빨강은 페이지당 최대 1곳** (랜딩 히어로의 "HERO INTEGRATED TEST"처럼) · 섹션 타이틀 eyebrow는 중립색
- [ ] **피처 리스트 아이콘은 중립색** (`text-neutral-400`) · 단 주 카드 1장에서만 빨강 허용
- [ ] **태그 칩은 기본 중립색** (`bg-neutral-100 text-neutral-600`) · 빨강은 "선택됨"·"진행 중" 같은 상태 전달 시에만
- [ ] **순번 원형 ① ② ③은 중립색** (`bg-neutral-900 text-white` 또는 `bg-neutral-200 text-neutral-700`)
- [ ] **CTA 버튼은 페이지당 primary 1개 원칙** · 추가 버튼은 outline/border 스타일
- [ ] **본문 bold 텍스트에 `text-[#E53935]` 금지** · 강조는 `font-semibold` + 중립색으로

### 클릭 가능성 시각 규약

모든 요소는 "클릭 가능"·"상태 표시"·"장식" 셋 중 하나로 명확히 읽혀야 한다.

| 분류 | 필수 스타일 | 금지 |
|---|---|---|
| **클릭 가능 (버튼·링크·카드)** | hover 효과(`hover:shadow-lg`/`hover:bg-*`) · cursor pointer (기본) · 필요 시 화살표 `<ArrowRight>` | hover 없음 |
| **클릭 가능한 카드 전체** | 전체를 `<Link>`로 감싸기 · `hover:shadow-lg transition-shadow` · 내부 별도 버튼 중복 금지 | 버튼만 `<Link>`, 카드는 `<div>` (영역 불명) |
| **상태 pill (선택됨·활성)** | `rounded-full` · 색만으로 상태 표현 · hover 없음 | 버튼형 외곽선 |
| **정보 태그 (비클릭)** | `rounded-full` + `bg-neutral-100` · hover 없음 · cursor default | `bg-red-50` (버튼으로 오인) |
| **비활성 버튼** | `cursor-not-allowed` + `aria-disabled="true"` + `bg-neutral-100 text-neutral-400` + Lock 아이콘 | `cursor` 누락 |
| **순수 장식 (원형 번호·아이콘 배지)** | hover 없음 · 버튼 모양 금지 | pill·shadow·border 과다 |

### 적용 체크 — 페이지 단위

새 페이지 만들 때 또는 수정 후 다음 순서로 점검:

1. 페이지 스크린샷 축소해서 **빨간 요소만 세어보기** → 3개 이하가 이상적 (CTA + 브랜드 + 상태)
2. 클릭 가능한 요소 전부 hover 확인 → 시각 변화 없으면 규약 위반
3. 비활성 요소에 마우스 올려 cursor 확인 → `not-allowed` 아니면 규약 위반
4. 태그 칩·순번 원형·아이콘에 빨강 들어갔는지 확인 → State 의미 없으면 중립색으로 교체

### 적용 대상 페이지 (우선순위)

| 순위 | 경로 | 주요 이슈 (세션 80 기준) |
|---|---|---|
| 1 | `/hero/hit` 랜딩 | 빨강 8+ 지점 · 태그·순번·아이콘 전반 |
| 2 | `/hero/hit/{a~f}/*` 검사·결과 | 태그·아이콘 |
| 3 | `/hero/my` | 프로필 카드 클릭 영역 |
| 4 | `/hero/coaching`·서브탭 | 서브탭 상태 |
| 5 | `/hero/search-light` · `/jh`·`/jd`·`/company` | 폼 칩 |
| 6 | `/hero` 랜딩 · 공통 헤더/푸터 | 최종 정돈 |

---

## 프로필 특화 — 실제 DB 반영

### 핵심 테이블

| 테이블 | 역할 | 상태 |
|--------|------|-----|
| `hit_sessions` | 검사 세션 (A~F) | 실시간 운영 |
| `hit_responses` | 개별 응답 | 실시간 운영 |
| `hit_a_results` ~ `hit_f_results` | 단계별 결과 | A/B 운영 · C~F 미실시 |
| `hero_profiles` | 통합 프로필 (hit_a~f_result_id FK) | **0건 · 자동 생성 필요** |
| `hero_tih_responses` | 기업 TIH 응답 | **0건 · 검증 필요** |
| `hero_companies` | 기업 프로필 + Reputation | 0건 |
| `hero_matches` | 매칭 (profile × company) | 0건 · 엔진 미구현 |
| `hit_hero_types` | 64 영웅 유형 SSOT | 64개 시드 완료 |
| `hit_report_modules` | 리포트 조립 모듈 | 324개 시드 완료 |
| `hit_ai_prompts` | AI 프롬프트 SSOT | 4개 시드 완료 |
| `hit_competency_tracks` | 22개 역량 트랙 | 시드 완료 |
| `hero_service_products` | 유료 상품 | 6개 시드 완료 |

### 이전 문서 정정

- ❌ "HIT = Holland Interest Theory" → ✅ **HIT = HeRo Identification Test** (Holland RIASEC은 HIT B의 한 축)
- ❌ `hit_results` 단일 테이블 → ✅ 실제로는 `hit_a_results` ~ `hit_f_results` 6개 + `hero_profiles` 통합

### universe-profile.ts

- `getHeRoProfile(email)` — 기존 함수 유지
- 추가 필요: `getHeroTypeBadge(memberId)` — 64 유형 중 현재 유형 · Universe 전체에서 호출

---

## 🧱 DB 테이블·필드 네이밍 체계 (완결성)

> **Universe 전체 공통 규칙 + HeRo 특화 규약.** 네이밍 일관성이 없으면 매칭·JOIN·AI 리포트 전부 깨진다.

### 테이블 접두사 (prefix)

| prefix | 도메인 | 예시 | 신규 생성 시 |
|--------|------|------|----|
| `hero_` | HeRo 비즈니스 엔티티 | `hero_profiles`, `hero_companies`, `hero_matches`, `hero_jd`, `hero_jh_responses` | ✅ 신규는 전부 `hero_` 사용 |
| `hit_` | HIT 검사 엔진 (질문·응답·결과·리포트) | `hit_sessions`, `hit_responses`, `hit_a_results` ~ `hit_f_results`, `hit_questions`, `hit_hero_types`, `hit_report_modules`, `hit_ai_prompts` | ⚠️ 검사 엔진 내부만 |
| `career_`, `resume*` | 레거시 커리어/이력서 | `career_profiles`, `resumes` | ❌ 신규 금지 · `hero_*` 또는 Universe 공통 흡수 |

**원칙**: `hero_` + `hit_` 두 prefix는 영구 공존 (HIT 엔진은 타 브랜드도 쓸 수 있는 모듈성 유지).  
그 외 prefix(`career_`, `resume*`)는 점진 통합.

### 컬럼 네이밍 규약

| 용도 | 패턴 | 예시 |
|------|-----|------|
| **PK** | `id UUID DEFAULT gen_random_uuid()` | 전 테이블 공통 |
| **FK** | `{parent_table}_id` 또는 `{role}_id` | `member_id`, `company_id`, `session_id`, `hit_a_result_id` |
| **다대다 연결표** | `{a}_{b}_membership` 또는 `{a}_{b}` | `hero_company_members` (member × company) |
| **생성/수정 시간** | `created_at`, `updated_at`, `deleted_at` | 전 테이블 |
| **상태 전이 시각** | `{state}_at` | `published_at`, `retired_at`, `approved_at`, `reviewed_at` |
| **Enum 상태** | `status TEXT` + CHECK 제약 | `status IN ('pending','reviewing','matched','closed')` |
| **Enum 타입 분류** | `{context}_type` | `response_type`, `match_type`, `plan_type`, `flag_type` |
| **Boolean** | `is_{형용사}` | `is_active`, `is_required`, `is_limited`, `is_verified` |
| **Count** | `{entity}_count` | `match_count`, `view_count`, `approval_count` |
| **Rate / Score** | `{entity}_rate` / `{entity}_score` | `match_success_rate`, `fee_rate`, `match_score` |
| **JSONB 응답 집합** | `responses` | `hero_tih_responses.responses` (section별 응답) |
| **JSONB 점수 집합** | `{type}_scores` | `base_scores`, `personality_scores`, `competency_scores` |
| **JSONB 상세** | `{entity}_detail` | `flag_detail`, `ai_match_report` |
| **ARRAY 태그** | `{entity}s` 복수형 | `skills[]`, `preferred_industries[]`, `affiliations[]` |
| **외부 시스템 참조** | `{provider}_{entity}_id` 또는 `{provider}_{metric}` | `mindle_company_id`, `jobplanet_rating`, `blind_rating` |
| **Tenant (WIO 필수)** | `tenant_id TEXT DEFAULT 'tenone'` | 전 운영 테이블 |
| **Brand (Universe 필수)** | `brand_id TEXT` (단 특정 브랜드 소속이 명확할 때만) | `hero_tih_responses.brand_id='hero'` |

### 동일 개념 · 다른 이름 금지 (통일)

| 개념 | ✅ 통일 이름 | ❌ 쓰지 말 것 |
|-----|-----------|-----------|
| 회원 FK | `member_id` | `user_id`, `profile_id` (members만 `id`) |
| 표시 이름 | `display_name` | `nickname`, `handle_name`, `user_name` |
| 이메일 | `email` (UNIQUE 필요 시 `email_key`) | `email_address`, `contact_email` (단 `hero_tih_responses.email`은 담당자 이메일로 유지) |
| 전화번호 | `phone` | `phone_number`, `mobile`, `contact_phone` |
| 공개/비공개 | `is_public BOOLEAN` | `public`, `visibility TEXT` |
| 만료 시각 | `expires_at` | `expiry_date`, `valid_until`은 capability 전용 (§1.3.1) |
| 가격 | `price INTEGER` (KRW 기준) + `currency TEXT` | `price_krw`, `amount` |

### JSONB 스키마는 별도 문서화

JSONB 컬럼은 런타임에만 해석되므로 **컬럼 옆에 주석 + `docs/` 어딘가에 키 목록 고정** 필수.

예시 — `hero_tih_responses.responses`:
```
{
  "s0": { "industry": "...", "jobFunction": "...", "track": "..." },
  "s1": { "q1": "a", "q2": "c", "q3": "b", "q4": "d" },
  "s2": { "guardian": 40, "pioneer": 30, "connector": 30 },
  "s3": { "q1": "b", "q2_a": "drive", "q2_b": "execution", "q3": "a", "q4": "a", "q5": "c" },
  "s4": { "q1": "c", "q2": "e", "q3": "b", "q4": "a", "q5": "b" },
  "s5": { "q1": "a" },
  "s6": { "q1": "한 줄 묘사..." }
}
```
→ 이 스키마가 변하면 **SQL 주석 + Tetrad 문서 동시 갱신**.

### 네이밍 위반 발견 시 처리

1. 기존 테이블 네이밍 오류는 **영구 유지** (breaking change 금지)
2. 새 컬럼 추가 시 위 규약 준수
3. 뷰(`view`) 만들어서 외부 컨슈머에게 올바른 네이밍 노출 가능 (`hit_a_results_safe` 패턴)

---

## 🧱 DB 구조 원칙 (꼬이지 않게)

> **DB가 꼬이면 매칭이 불가능하다. 다음 원칙을 반드시 지킨다.**

1. **`members`는 Universe SSOT · HeRo는 확장만 한다**
   - `hero_profiles.member_id` → `members.id` FK (1:1 확장)
   - `hero_profiles`는 members 삭제 시 CASCADE
   - HeRo 전용 필드(talent_type, availability 등)는 전부 hero_profiles로

2. **개인과 기업은 서로 다른 테이블**
   - 개인: `members` + `hero_profiles`
   - 기업: `hero_companies`
   - 기업 담당자(개인)와 기업의 관계: **신설 필요** `hero_company_members` (member_id, company_id, role, status)

3. **질문은 `hit_questions` 단일 테이블** (SSOT)
   - 현재 `lib/hit/data/*.ts` 24개 하드코딩 파일과 이중화 → 단일화 예정 (Phase 4)
   - test_type × module × question_index 고유

4. **검사 결과는 단계별 분리** (A~F 6개 테이블 유지)
   - 해석 로직이 각 테스트마다 복잡 → 단일 JSONB 대신 타입 안정성 유지
   - `hero_profiles`가 6개 FK로 통합

5. **매칭은 (profile × company) 쌍**
   - `hero_matches.profile_member_id` + `company_id`
   - 벡터·점수는 비공개 · 서술만 공개

6. **Reputation Vector는 `hero_companies` 외부 필드**
   - `jobplanet_rating` · `blind_rating` · `last_news_at` · `mindle_company_id` (Mindle 연동)

---

## 권한 체계

- **role 종류**:
  - `member` — 기본 회원 (HIT 풀 리포트 조회)
  - `purchaser` — 유료 구매자 (PDF + AI 상담 · context `brand:hero`)
  - `subscriber` — 정기 구독자 (context `brand:hero`)
  - `representative` — 기업 대표 (context `brand:hero` + company_id)
  - `hiring_manager` — 기업 채용 담당 (context `brand:hero` + company_id)
  - `coach` — 상담사 (관리자급)
- **context**: `brand:hero` · 기업은 `brand:hero:company:{id}`

---

## 🌐 Universe 공통 SSOT 적용 원칙

> **HeRo 내부 상수를 만들기 전에 Universe 공통을 먼저 확인한다.** 중복 정의는 DB·벡터 매칭을 망가뜨린다.

### Universe 공통 상수 (필수 참조)

| 항목 | SSOT 파일 | HeRo 적용 지점 |
|------|---------|-------------|
| **산업군** (31종) | `lib/badak-constants.ts` → `INDUSTRIES` | TIH-0-1 · JH 실무 필드 · hero_profiles.preferred_industries |
| **직무군** (37종) | `lib/badak-constants.ts` → `JOB_FUNCTIONS` | TIH-0-2 · HIT 결과 매칭 직무 |
| **직무 레벨** | `lib/badak-constants.ts` → `JOB_LEVELS` | 이력서 워크스페이스 · HIT B 결과 |
| **원하는 태그 / 제공 태그** | `lib/badak-constants.ts` → `LOOKING_FOR_TAGS` / `CAN_OFFER_TAGS` | 인재↔기업 매칭 보조 태그 |
| **전화번호 포맷** | `components/MyProfileCard.tsx` → `formatPhone` | 전 폼 공통 |
| **Capability 모델** | `CLAUDE.md §1.3.1` + `member_capability_roles` | HeRo capability 탑재·역할 누적 |
| **UC 정책** | `docs/Universe_Coin_Policy.md` + `uc_earn_rules` | 아래 UC 섹션 |
| **접근 모델 6종** | `CLAUDE.md §1.4` | HeRo는 **오픈 → 구매 → 구독** 하이브리드 |
| **프로필 3계층** | `CLAUDE.md §1.3` | Layer 2(members) + Layer 3(hero_profiles + hit_*_results) |

### 현재 불일치 (정리 대상)

| 현상 | 파일 | 해결 |
|------|------|-----|
| TIH 질문에 산업군 16개 자체 정의 | `app/(HeRo)/hero/search-light/tih/page.tsx` | `INDUSTRIES` import로 교체 |
| TIH 질문에 직무군 21개 자체 정의 | 동일 파일 | `JOB_FUNCTIONS` import로 교체 |
| DB `hit_industries`·`hit_job_functions` 별도 존재 (20개 직무) | DB seed | Universe 공통과 동기화하거나 retired 처리 |
| `lib/badak-constants.ts` 파일명이 브랜드명 (Universe 공통인데) | — | 리팩토링은 보류 · 문서화로 혼선 방지 |

### Capability 탑재

HeRo가 탑재한 Universe capability (SSOT: `brand_capabilities`):

| capability | HeRo에서의 의미 | 역할 키 |
|-----------|---------------|------|
| `community` | HeRo 게시글·댓글 | `member` |
| `course` | 이력서 컨설팅·커리어 로드맵 | `taker` |
| `subscription` | 정기 코칭 (예정) | `subscriber` |
| `purchase` | HIT PDF · AI 상담 건별 결제 | `buyer` |
| **`membership` (기업용)** | **기업 담당자 = 기업 매칭 접근 권한** | `representative` / `hiring_manager` |

> 기업 담당자는 Universe capability model 상 `membership` 계열로 처리 — `member_capability_roles.context`에 `company_id` 포함.

---

## UC 정책 특이사항 (Universe UC Policy 준수)

> **Universe UC 규칙**: `1 UC = 1 KRW` · 월 `monthly_cap` · `brand_id` 필수
> 상세: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)

### HeRo 전용 `uc_earn_rules` (brand_id='hero')

> ⚠️ **현재 DB에 HeRo UC 규칙이 하나도 시드되어 있지 않다. Phase 0에서 seed SQL 작성 필요.**

| action_key | 설명 | base_amount | monthly_cap | 일회성 타입 |
|-----------|------|-----|----|---------|
| `complete_hit_a` | HIT A 검사 완료 | 1,000 | — | GLOBAL (생애 1회) |
| `complete_hit_b` | HIT B 검사 완료 | 1,500 | — | GLOBAL |
| `complete_hit_cdef` | HIT C/D/E/F 심화 검사 완료 | 각 800 | — | 단계별 1회 |
| `complete_jh` | JH 12문항 작성 완료 | 500 | — | GLOBAL |
| `update_jh_quarterly` | JH 분기별 재작성 | 200 | — | 분기 1회 |
| `register_tih` | 기업 TIH 제출 (담당자 회원에게 지급) | 500 | 월 1회 | — |
| `register_jd` | 기업 JD 등록 | 300 | 월 3회 | — |
| `match_trial_success` | 매칭 트라이얼 성공 | 5,000 | — | 건별 |
| `match_referral` | 친구 추천으로 매칭 성사 | 10,000 | — | 건별 |
| `write_coaching_review` | 코칭 후기 작성 | 300 | 월 2회 | — |

### UC 소진 (redeem)

- HIT PDF 다운로드 건당 결제 시 **최대 10%** UC 차감 (Universe 공통 원칙)
- AI 상담 구독료 결제 시 **최대 10%** UC 차감

### 주의

- ❌ `brand_id` 누락 시 전 브랜드 공통으로 간주 → HeRo 전용 액션은 반드시 `brand_id='hero'` 명시
- ❌ `monthly_cap` 무제한으로 설정 금지 (남용 방지)
- ✅ 신규 action 추가 시 `sql/hero-uc-earn-rules.sql`에 누적 관리

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(HeRo)/layout.tsx` | generateMetadata |
| `app/(HeRo)/hero/page.tsx` | 랜딩 |
| `app/(HeRo)/hero/hit/[a~f]/test/page.tsx` | 검사 실시 (A~F) — 현재 하드코딩 |
| `app/(HeRo)/hero/hit/[a~f]/result/[id]/page.tsx` | 결과 티저 (비회원 가능) |
| `app/(HeRo)/hero/hit/[a~f]/report/[id]/page.tsx` | 풀 리포트 (회원 전용 gate) |
| `app/(HeRo)/hero/my/page.tsx` | 마이페이지 (HitProfileBadge + MyProfileCard) |
| `app/(HeRo)/hero/search-light/page.tsx` | 씨치 라이트 랜딩 (기업 funnel 진입) |
| `app/(HeRo)/hero/search-light/tih/page.tsx` | TIH 22문항 (기업 작성, 비회원 허용) |
| `app/(HeRo)/hero/coaching/ai/page.tsx` | AI 상담 (유료 gate) |
| `app/(HeRo)/hero/resume/workspace/page.tsx` | 이력서 CRUD |
| `features/hit/HitProfileBadge.tsx` | **Universe 전용 HIT badge 컴포넌트** |
| `features/hit/HitTestUI.tsx` | HIT A 검사 UI (하드코딩 import) |
| `features/hit/HitBTestUI.tsx` | HIT B 검사 UI |
| `lib/supabase/hero.ts` | DB 클라이언트 |
| `lib/hit/data/*.ts` | 질문 하드코딩 24파일 (Phase 4에서 제거 예정) |
| `app/api/hit/{a~f}/{session,response,score,result}` | 검사 API |
| `app/api/hero/tih/route.ts` | TIH 저장 (createAdminClient) |

---

## 인트라 관리 경로

| 경로 | 역할 | 상태 |
|------|------|------|
| `/intra/hero` | 대시보드 | ✅ |
| `/intra/hero/talent` | 인재 풀 (회원 관리) | ✅ |
| `/intra/hero/hit` | HIT 검사 현황 (이용자 관점) | ✅ 조회 |
| `/intra/hero/hit/structure` | HIT 구조 (모듈 × 타입) | ✅ 조회 |
| `/intra/hero/hit/questions` | 질문 목록 | ✅ 조회 (편집 X) |
| `/intra/hero/hit/answers` | 응답 분포 | ✅ 조회 |
| `/intra/hero/hit/report` | 리포트 조회 | ✅ |
| `/intra/hero/search-light` | TIH 기업 요청 관리 | ✅ (Section 0·2·6만) |
| `/intra/hero/ai-counseling` | AI 상담 세션 | ✅ |
| `/intra/hero/resume` | 이력서 이용자 | ✅ |
| `/intra/hero/career` | 커리어 | ✅ |
| **`/intra/hero/jd`** | **기업 JD 관리** | ❌ 신설 필요 |
| **`/intra/hero/jh`** | **개인 JH 응답** | ❌ 신설 필요 |
| **`/intra/hero/companies`** | **기업 풀** | ❌ 신설 필요 |
| **`/intra/hero/matching`** | **매칭 관리** | ❌ 신설 필요 |
| **`/intra/hero/hero-types`** | **64 영웅 유형 편집** | ❌ 신설 필요 |
| **`/intra/hero/report-modules`** | **324 리포트 모듈 편집** | ❌ 신설 필요 |
| **`/intra/hero/ai-prompts`** | **AI 프롬프트 SSOT 관리** | ❌ 신설 필요 |
| **`/intra/hero/funnel`** | **Funnel 전환율 · 비회원→회원→유료** | ❌ 신설 필요 |

---

## 개발 주의사항

### HIT 검사 보안

- ❌ 검사 도중 나가기 금지 (진행률 `localStorage` 저장)
- ✅ 세션 종료 시 자동 저장
- 완료 시에만 `hit_{a~f}_results` INSERT

### 결과 해석 · 재검사

- 결과 도출 후 **절대 수정 불가** (검사 무결성)
- 재검사 시 새 row 생성 (`hero_profiles`는 최신 결과로 갱신)

### Funnel 게이트

- **비회원 결과 조회 허용**: `/hero/hit/{type}/result/[id]` — 티저
- **회원 전용**: `/hero/hit/{type}/report/[id]` — 풀 리포트
- **유료 gate**: PDF 다운로드·AI 상담
- 게이트 누락 시 수익 전환 실패 → **각 페이지 접근 제어 필수**

### 비회원 → 회원 연결

- 비회원 세션은 `member_id=NULL` + `email`로만 저장
- 같은 이메일로 회원가입 시 `/api/hit/link-member`가 기존 세션·결과에 member_id 주입
- **현재 이 링크가 자동으로 안 되고 있을 가능성 있음** (hit_a_results 6건 전부 member_id NULL)

### TIH 저장 (기업 funnel)

- `/api/hero/tih` → `createAdminClient` 사용 (RLS 우회)
- `onConflict: "email"` upsert — 같은 담당자 재제출 시 덮어쓰기
- 현재 0건 → funnel 유입 추적 필요

### AI 코칭

- 프롬프트는 `hit_ai_prompts` 테이블이 SSOT (코드 하드코딩 금지)
- 사용자 프라이버시: 코칭 내용 암호화

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | UI/UX + 모델 정교화 (2026-04-23 세션 80) — UI/UX SSOT · HIT 모델 재정의 · 요금·탤런트 에이전시 신설 |
| **운영 중** | HIT A/B 검사 · 이력서 · 매칭 Tetrad · **신규**: /hero/pricing · /hero/talent-agent · /hero/talent-agent/apply |
| **세션 80 주요 결정** | ① UI/UX 색·클릭 SSOT 5 레이어 문서화 · ② HIT A에 인성·적성 포함(DB 실측) · ③ HIT B~F 생애주기별 심화로 재정의 · ④ 요금 4티어(무료/14,900/39,900/99,000) · ⑤ 프로=AI코칭/프리미엄=전문가1:1 · ⑥ BCDEF는 1인 1개만(동시 불가) |
| **신규 인프라 (세션 80)** | `hero_talent_applications` 테이블 + RLS · `POST /api/hero/talent-agent/apply` · HIT A 가상 더미 5건 재시드 |
| **사용자 측 완성 (세션 80 추가)** | `/hero/pricing` 4티어 + Talent Agent CTA + Search Light 구직자/구인기업 · `/hero/talent-agent` 랜딩 + Universe Stages 6 브랜드 · `/hero/talent-agent/apply` 폼 · 비회원 teaser 흐림 처리 · HitModelGuide 모달 완전 개편 |
| **이월 (다음 세션)** | **A**: 전 브랜드 /my 페이지 HitProfileBadge 일괄 삽입 (21개) · **B**: 탤런트 에이전시 신청 Action Hub 등록 + Intra 관리 페이지 · **C**: 실기기 E2E 검증 · **D**: 결제 PG 연동(Stripe/Toss) · **E**: Phase 5 질문 DB 단일화 |
| **보류 (사업 시작)** | 결제 PG · 유료 gate 활성화 · 환불 정책 확정 |
| **최근 결정 누적** | HIT Hero Type = Universe badge · 매칭 비공개 · 인성·적성 = HIT A · BCDEF = 1인 1개 · 빨강은 Action/Accent/State만 · 요금 4티어 |

---

## 참고 문서

- **매칭 설계 단일 진실 소스**: [docs/HeRo_Matching_Tetrad_v1.md](../../docs/HeRo_Matching_Tetrad_v1.md)
- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- Capability 모델: [CLAUDE.md § 1.3.1](../../CLAUDE.md#131-capability-기반-회원-모델-ssot-for-활동·역할)
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)

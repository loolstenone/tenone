# HeRo 브랜드 가이드

> **HeRo** — 인재·기업 매칭을 위한 심리/역량 진단 플랫폼. "당신의 영웅 유형을 알아보세요"

---

## 정체성

- **한 줄 소개**: HIT(**H**e**R**o **I**dentification **T**est) 심리·역량 진단 + Tetrad 매칭 엔진 + AI 커리어 상담
- **톤앤매너**: 따뜻함·희망적·전문적. 사용자의 성장을 응원하는 톤.
- **주 컬러**: `#E53935` (HeRo Red)
- **디자인 방향**: 검사 → 결과(티저) → 회원 전환 → 유료(PDF·AI) → 매칭

## 🧭 사업 방향 — 인공지능 시대, 인간의 성장을 돕는 탤런트 에이전시 (2026-10-14 사용자 결정)

> **지원자(개인) 중심.** 돈은 기업이 내지만, 사는 것은 '사람을 거르는 도구'가 아니라 '검증된 사람을 만나는 기회'다.

| 항목 | 결정 |
|---|---|
| 중심 | 개인. 개인이 HeRo를 믿고 기록을 맡기는 것이 유일한 경쟁력 (최상위 원칙 'HIT 결과는 본인의 것'과 같은 뿌리) |
| AI 시대의 차별점 | 자기소개서·포트폴리오·검사 답은 AI로 꾸밀 수 있다 → **실제로 해 본 기록**(유니버스 활동·과제·팀 진단·동료 평가, 본인 동의분만)과 성장 기록이 신호 |
| 작은 시장 | 마케팅·광고·기획 직군 신입~3년 차 주니어 × 30인 이하 대행사·브랜드사·스타트업 |
| 수입 | 지금: 기업 대상 팀 진단·신입 적응 진단(입사 후 관리) + 개인 코칭 / 다음: 연결된 사람이 입사하면 **성사 수수료** (유료직업소개사업 등록 후, 법정 요금 상한 확인) |
| 개인 | HIT·성장 기록은 계속 개인을 위해. 기업에 개인 결과를 넘기는 방식으로 돈을 벌지 않는다 |

- ❌ 대형 채용 플랫폼(마이다스·사람인·인크루트·휴노)과 같은 것 만들기 — 채용관리(ATS)·검사 건당 판매·지원자 점수 순위
- ⏸ **기업용 채용(인적성) 검사** — 2026-10-14 설계(기업 5화면·지원자 3화면)까지 했으나 기업이 지원자를 거르는 도구라 보류. 다시 꺼낼 때는 이 표와 최상위 원칙을 먼저 본다
- 미정: 유료직업소개사업 등록 시기 (출시 전 법률 검토 권고) · 신입 적응 진단 구성(시점 3회/1회, 사수 설문 포함 여부, 이름)

---

## ⛔ 최상위 원칙 — HIT 결과는 본인의 것 (2026-10-13 사용자 결정)

> **개인 HIT 결과는 개인만 본다. 자기 개발과 성장에 쓴다.**
> **기업에는 '기업이 원하는 성향의 사람이 어느 정도 있는가'만 보여 준다.**

| 대상 | 볼 수 있는 것 | 볼 수 없는 것 |
|---|---|---|
| 본인 | 자기 HIT 결과 전부 · 결과로 찾은 맞는 기업(성장 기록 채용 피드) · AI 상담 | — |
| 기업 | 조건에 맞는 인원(익명) · 희망 조건 묶음 통계 · **원하는 성향에 맞는 사람의 어림값(5명 단위)과 많고 적음** — 성향 통계에 **따로 동의**(`hero_offer_settings.share_traits`, 기본 off)한 사람만, 모집단 20명 이상(`TRAIT_FLOOR`)일 때만 | 개인 결과 · 성향 분포 전체 · HIT를 근거로 한 개인 추천 서술 · 제안에 응한 인재의 검사 결과 |

- 구현 SSOT: `lib/hero/group-stats.ts` `traitEstimate()` · 화면 `features/hero/report/TalentPoolReport.tsx` `TraitWishCard`
- ❌ 성향으로 제안 대상을 거르기 — 응한 사람의 성향이 드러난다 (성향은 인원 확인에만)
- ❌ 기업에 HIT 기반 매칭 추천·서술 보여 주기 — 큐레이션은 `for_talent`만 저장, 기업용 매칭 인박스(`side=company`)는 410
- ❌ 정확한 인원·비율·분포 그래프로 성향을 보여 주기 — 어림값과 '많은 편/보통/적은 편'만
- 검사 완료 **여부**(결과 아님)로 거르는 `require_hit_a`는 허용
- 새 기업용 기능을 만들 때 이 표를 먼저 확인한다. 어긋나면 사용자에게 먼저 묻는다
- **예외 ① 팀 진단** (사용자 결정) — 기업용 팀 빌딩 서비스. 팀장(기업 회원)이 신청 → 팀장·팀원이 동시에 팀 설문(`lib/hero/team-survey.ts`, 8영역 16문항 + 서술 2) + HIT 기본 성향 → 팀원 5명 이상이면 단합·문제점·팀장과의 인식 차이·이름 없는 서술(무작위), 검사 완료 5명 이상이면 케미(역할 분포). 참여는 본인 동의, 리포트는 팀장·참여 팀원이 함께 본다. ❌ 개인 응답·결과·이름
- **예외 ② 인트라 직원** (사용자 결정) — 운영 화면(HIT 현황·리포트 조회·인재 풀)은 지금처럼 개인 결과 열람 가능

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
| ~~① 비회원~~ | — | **폐지 (2026-10-12)** — HIT 전 검사 회원 전용 | — |
| **② 회원** | 이메일/SNS 가입 | HIT 풀 리포트 · 유형 badge · JH 작성 | funnel 중간 · Universe 진입 |
| **③ 유료** | 결제 (Stripe/Toss) | PDF 다운로드 · AI 상담 · HIT B/C/D/E/F 심화 | 수익화 · 매칭 대상 등록 |

### 기업 (기업 풀)

| 단계 | 접근 | 산출물 | 목적 |
|------|------|--------|------|
| **① 비회원** | 이메일 입력 | TIH 작성·접수 (씨치 라이트) | 기업 리드 |
| **② 기업 회원** | 기업 담당자 가입 | JD 등록·인재 큐레이션 요청 | funnel 중간 |
| **③ 유료 기업** | 건별 결제 | 면접·인터뷰 제안 발송 (써치 라이트) — HIT 기반 개인 추천은 주지 않음 (최상위 원칙) | 수익화 |

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
| **최근 변경 (2026-10-05 세션 158)** | HIT 검사 서버 전용 처리 — `app/api/hit/*`·`lib/supabase/hit.ts` 서비스 롤, 회원 식별은 세션만(body memberId 불신), 결과 공유 메타 서버 조회 · `sql/security-hit-lockdown.sql` 운영 적용(뷰 security_invoker, 본인+직원만) · `resumes`·`career_profiles` 회원 전체 조회 → 본인+직원 · `hero_matching_requests` 전체 개방 정책 제거 · `/api/hit/chat/stream` memberId 세션 식별 |
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
4. `<HitProfileBadge>` 카드는 **HeRo 마이페이지(`/hero/my`)에만** 둔다 — 다른 브랜드 마이페이지 22곳에서 삭제 (2026-10-16 사용자 지시). ❌ 다른 브랜드 마이페이지에 다시 넣기

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
<LinkedMadleagueCertificates />                // ← MADLeague 활동 경력 (서비스 연계 동의 시만, 2026-10-09)
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
| `hit_hero_types` | 64 영웅 유형 SSOT | 64개 v2 완료 (현대 직업 원형, "The + 역할") |
| `hero_daily_checkins` | Journey 일일 체크인 (에너지·한 줄) | 세션 81 |
| `hero_goals` | 목표 (Vrief × GPR 이중축) | 세션 81 |
| `hero_goal_checkins` | 목표 주간 체크인 | 세션 81 |
| `hit_report_modules` | 결과 해설 문안 (선택 규칙은 코드) | 사용 중 ~1,000 · 보관 48 (`archived:*`) |
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

> ❌ **검사·희망 직무 작성에는 UC를 주지 않는다** (2026-10-12 사용자 결정 — 본인을 위한 행동, 유니버스 기여 보상이 아님). `complete_hit_a~f`·`complete_jh`·`update_jh_quarterly` 규칙 운영 DB·시드에서 삭제

> ⚠️ **현재 DB에 HeRo UC 규칙이 하나도 시드되어 있지 않다. Phase 0에서 seed SQL 작성 필요.**

| action_key | 설명 | base_amount | monthly_cap | 일회성 타입 |
|-----------|------|-----|----|---------|
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
| `app/(HeRo)/hero/journey/page.tsx` | **Journey 워크스페이스 엔트리** (auth 분기) |
| `app/(HeRo)/hero/journey/_landing.tsx` | 비로그인 6단계 마케팅 |
| `features/hero/JourneyWorkspace.tsx` | 로그인 워크스페이스 쉘 + Today/Map/체크인 |
| `features/hero/GoalsTab.tsx` | 목표·성취 탭 (Vrief × GPR) |
| `features/hero/JobsTab.tsx` | 맞춤 채용 피드 탭 |
| `app/api/hero/journey/{status,checkin}/route.ts` | Journey 상태 + 일일 체크인 |
| `app/api/hero/goals/[id]/{checkin}/route.ts` | 목표 CRUD + 주간 체크인 |
| `app/api/hero/jobs/feed/route.ts` | JH 기반 채용 피드 |
| `features/hit/HitProfileBadge.tsx` | **Universe 전용 HIT badge 컴포넌트** |
| `features/hit/HitTestUI.tsx` | HIT A 검사 UI (하드코딩 import) |
| `features/hit/HitBTestUI.tsx` | HIT B 검사 UI |
| `lib/supabase/hero.ts` | DB 클라이언트 |
| `lib/hit/data/*.ts` | 질문 하드코딩 24파일 (Phase 4에서 제거 예정) |
| `app/api/hit/{a~f}/{session,response,score,result}` | 검사 API |
| `app/api/hero/tih/route.ts` | TIH 저장 (createAdminClient) |
| `app/(HeRo)/hero/programs/` | HeRo 프로그램 (코어 프로그램 모듈, brand_id='hero') — 목록·`[id]` 회차 방·`join/[code]`. 화면 = `features/programs/*` (테마 hero #E53935). **헤더 진입점 없음 (결정 대기)** |
| `app/(HeRo)/hero/certificate/` | 수료증·참여 확인서 발급·인쇄·진위 확인 (코드 `HERO26-`) |

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
| `/intra/hero/jd` | 기업 JD 관리 | ✅ |
| `/intra/hero/jh` | 개인 JH 응답 | ✅ |
| `/intra/hero/companies` | 기업 풀 | ✅ |
| `/intra/hero/matching` | 매칭 관리 | ✅ |
| `/intra/hero/hero-types` | 64 영웅 유형 편집 | ✅ |
| `/intra/hero/report-modules` | HIT 해설 모듈 편집 (id·분류·제목·내용, 보관 숨김) — 2026-10-13 복구 | ✅ |
| `/intra/hero/ai-prompts` | AI 프롬프트 SSOT 관리 | ✅ |
| `/intra/hero/funnel` | Funnel 전환율 · 비회원→회원→유료 | ✅ |
| `/intra/hero/talent-agent/applications` | 탤런트 에이전시 신청 심사 | ✅ |
| `/intra/hero/programs` | 프로그램 회차·참가 신청 선발 (코어 프로그램 모듈, 통합 `/intra/ums/programs`) | ✅ 세션 163 |

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

- **HIT 검사는 회원 전용** (2026-10-12 사용자 결정 "모든 조사는 회원만"): `/hero/hit/{a~f}/*` 폴더 layout이 `HitMemberGate`(LoginRequired)로 감싸고, `/api/hit/{a~f}/session`은 `requireMember`, `/api/hit/a/questions`는 `requireUser`. 결과 조회는 본인·직원만(`lib/hit/result-access.ts`, member_id 없는 옛 결과는 직원만). 비회원 티저·`/api/hit/link-member` 흐름은 사실상 폐지
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

### 인재 데이터 활용 원칙 (2026-10-05 · 사업 방향은 2026-10-14 확정 — 위 '사업 방향' 표)

> 구상: MADLeague·MADLeap·Badak·Domo 등에서 쌓인 활동 데이터 + HeRo 자체 HIT로 **기업 인재 매칭**, **취업 정보 제공**.
> 이 모델은 법적 요건이 핵심이다 (CLAUDE.md §0.1 법적 검토 · 데이터 계약 4조, 구글 Buzz 교훈).

| 쟁점 | 원칙 |
|------|------|
| 다른 브랜드 데이터 사용 | 동아리 활동 등 **원래 목적이 달라 목적 외 이용**(개인정보보호법 제18조) → 회원 본인의 **명시적 opt-in**("HeRo 인재풀 등록") 없이는 가져오지 않는다. 브랜드별로 어떤 항목을 가져올지 회원이 고른다 |
| 기업에 인재 정보 공개 | **제3자 제공**(제17조) → 공개 범위(익명 요약 / 실명 프로필), 제공받는 기업, 기간을 밝히고 별도 동의. 기본은 익명 요약 → 기업 제안 수락 시 실명 공개 |
| 사업 형태 | 구인·구직 연결은 직업안정법상 **직업소개사업**(유료는 등록, 무료는 신고) 해당 가능 → 매칭 출시 전 등록 요건 확인. 장부 보존 의무 확인 |
| 채용 서류 | 채용절차법: 기업이 받은 지원 서류의 반환·파기 요건 → 기업 측 화면·계약에 반영 |
| 취업 정보 발송 | 광고성 정보에 해당하면 정보통신망법 수신 동의 별도 |
| 학생 회원 | MADLeap 등 만 14세 미만 가능성 → 법정대리인 동의 확인 |
| 탈퇴 | 매칭·지원 이력은 익명화 후 영구 보관 (`docs/Data_Lifecycle.md` 3.1) |

**구조 방향**: 각 브랜드 데이터는 그 브랜드에 그대로 두고, 회원이 동의한 항목만 HeRo가 **조회**(복사 저장 최소화). 동의 기록 = 브랜드·항목·시각·버전, 철회 시 즉시 조회 중단.

## 현재 상태

- **2026-10-17 비공개 전환** (`ums_sites.is_open=false`) - 유니버스 오픈 순서(Planner's → MADLeague → …)에서 차례가 올 때까지 닫음. www.hero.ne.kr = '준비 중' 가림막 + noindex, 직원은 그대로 봄. 가입 회원 2명(직원 1)

- **2026-10-14 (세션 173) 사업 방향 확정 · 헤더·써치 라이트 문구**: ① **사업 방향** — 위 '사업 방향' 표 (탤런트 에이전시 · 지원자 중심 · 성사 수수료는 직업소개사업 등록 후 · 기업용 채용 검사 보류) ② **헤더** — 메뉴 왼쪽 정렬 한 줄, 남는 공간은 메뉴와 유틸리티 바 사이 ③ **써치 라이트** — '4방향' 표현 폐지 → '네 가지를 함께 봅니다'(기업이 쓰는 것 2 · 인재가 쓰는 것 2) · 기업 고민 설문 소개 = 실제 설문 제목 7묶음(합계 칸 삭제) · 버튼 희망 직무 설문 → 기업 고민 설문 순 · 제목 두 줄 고정 ④ **남은 것** — 기업 고민 설문 중복 문항(같은 축 3회·일하는 방식 2회·리더 2회) 정리 결정 · 다음 기업 서비스(새 팀장 전환·신입 적응 진단·퇴사 인터뷰) 선택 · 신입 적응 진단 구성 · tenone-ui 적용은 사용자가 되돌림(다시 하지 않음)
- **2026-10-13 (세션 171 후반) 써치 라이트 = 만나는 곳 · 기업 서비스 재편**: ① **헤더 3묶음** — 인재(HIT 검사·AI 상담·커리어 코칭·탤런트 에이전시) → 써치 라이트(`features/hero/SearchLightNav.tsx`, 원 하나만 좌우로 훑는 모션, 양옆 짧은 선) → 기업(**기업 회원** `/hero/company` · **팀 진단** `/hero/team`). 묶음 = `HeaderMenu.side`. **배치는 로고 옆 왼쪽 정렬 한 줄, 묶음 사이 간격 = 메뉴 간격** — 남는 공간은 메뉴와 우측 유틸리티 바(ABOUT·프로필) 사이로 (2026-10-14 사용자 지시: 써치 라이트를 가운데 두고 양쪽으로 벌리던 배치 폐지) ② **써치 라이트 슬로건** "기업은 좋은 사람을 찾고, 사람은 좋은 기업을 찾는다" · 기업 쪽 화면 = **좋은 사람 찾기** `/hero/search-light/people` (인재상 → 익명 인원 + **인재 풀 리포트 자동** `/api/hero/talent-pool` → 면접·인터뷰 제안). 옛 `/hero/company/[id]/talent`·`/api/hero/offers/count`·헤드헌팅·인재 풀 리포트 페이지·비즈니스 문의(`hero_business_inquiries`) 삭제 ③ **팀 진단 자동 리포트** — 기업이 만든 초대 링크 `/hero/team/join/[code]`로 팀원이 동의·참여 → HIT 기본 성향 검사 완료 5명 이상이면 `/hero/team/[id]` 리포트(역할 분포·빈자리·일하는 방식·흥미). 테이블 `hero_team_diagnoses`·`hero_team_participants` (`sql/hero-team-diagnosis-2026-10.sql`) ④ **❌ 개인 HIT 검사 내용은 기업에 주지 않는다** (사용자 결정) — 리포트는 비율·평균만, 전체 5명 미만이면 리포트 없음, 칸 5명 미만은 '5명 미만'(`lib/hero/group-stats.ts` `suppress`). 제안에 응한 인재도 이름·연락처·이력서만 ⑤ **인재 제안** — 기업 요청 → 운영자 검토·결제 확인 → 발송(스위치 `HERO_OFFERS_LIVE`, 유료직업소개사업 등록·통신판매업 신고 전제) → 인재가 동의하고 응하면 180일 열람 ⑥ **같은 날 후속** — 최상위 원칙 'HIT 결과는 본인의 것' 수립(위 섹션): 인재 풀 리포트 성향은 '원하는 성향의 사람이 어느 정도 있나'(어림값·많고 적음, 별도 동의 `share_traits`)만 · 큐레이션 for_company 저장 중단 · 기업용 매칭 인박스 410 · 팀 진단 = 팀장·팀원 동시 설문(예외 ①) · 처리방침 HeRo 일반/기업 회원 분리(개발 단계라 즉시 시행) ⑦ **매칭 인박스 → 받은 제안 통합** (사용자 결정) — `MatchingInbox`·`/api/hero/matching/inbox`·`[id]/report` 삭제, 마이페이지는 받은 제안 카드만, 성장 기록 탭 '매칭' → '받은 제안'(`OffersTab`, 상태 API `pendingOffers`), 성장 단계 함수 `hero_journey_stage`가 제안 받음/응함을 인정(`sql/hero-journey-stage-offers-2026-10.sql`). `hero_matches`는 인트라 매칭·채용 피드 '관심 있어요' 기록용으로 남김 ⑧ **남은 것** — Mindle(Whole See) 기업 정보(공공데이터) → 매칭 반영: Mindle 작업 때 함께 고민 (사용자 결정)
- **2026-10-13 (세션 171) HIT 단계별 고도화 · 한국어 우선 정비**: ① **용어 (사용자 결정 — 영어만으로는 이해 어려움)** — 검사 제목 `HIT_STAGES[k].code` = "기본 성향 검사 (Archetype)" 등, 문장 안은 `.ko`("기본 성향 검사를 먼저…"). ❌ 'HIT - Archetype' 표기(세션 169 규칙 폐지). TIH → 기업 고민 설문 · JH → 희망 직무 설문 · JD → 채용 공고 · Matching Tetrad → 4방향 매칭 · Journey → 나의 성장 기록 · 성장 단계 꿈꾸는 사람·도전자·연습생·데뷔·스타·레전드(화면 표기만, DB 키 Dreamer~Legend 그대로) · Push/Pull → 떠나고 싶은 이유/끌리는 이유. 코드·DB·주소의 TIH·JH·JD 이름은 그대로 ② **문구** — AI 투(무기·빛나다·진정한·시너지·여정·결·'자리')를 일상 표현으로 · 직무 전문 용어(인사이트·고객 여정 지도)는 유지 · 64유형 표제 '강점이 드러나는 일'·'주의할 점'(`lib/hit/hero-type.ts`가 옛 표제도 읽음) ③ **UI** — 첫 화면 `features/hero/PageHero.tsx`(한국어 라벨·제목·설명·빨간 주 버튼 1개, 흰 배경). 어두운 첫 화면은 홈·써치 라이트만 · 헤더 '소개'(`aboutLabel`) · 푸터 Talent Agency + **H**uman **e**nhancement & **R**ecruit **O**ptimization ④ **가격** — ❌ 가격·요금·'무료'·'유료' 문구를 화면에도 소스(hidden 섹션·데이터 배열)에도 두지 않는다 (통신판매업 신고 전, 복원은 git `fc68ff35` 이전) ⑤ **채점** — 응답 정규화 `lib/hit/normalize-responses.ts`(모듈·척도·역채점은 DB, 클라이언트 값만) · 역채점 방향은 하위 척도가 '욕구'인지 '상태'인지로 정한다(E 정체성·F 사회적 연결 결함) · '의향·걱정·희망' 문항을 능력 척도에 넣지 않는다 · 회귀 점검 `scripts/hit-{a~f,gap}-scoring-check.ts` ⑥ **남은 것** — 소개 연혁·예시 멘토·성장 단계 기간 등 실제처럼 보이는 예시 문구(공개 전 결정) · 학생 응시 후 `hit_reliability_alpha(30)`
- **2026-10-12~13 (세션 170) HIT 완성도·해설 커버리지**: ① **나올 수 있는 결과 = 준비된 해설** — 흥미 3조합 120 전부(`RIASEC-XYZ`) · 성품 해설 = DB `INTEGRITY/RELATION/EMOTIONAL/ETHICS/GROWTH-HIGH/MID/LOW`(`chModuleId`, 화면 `ScoreList meaningOf` — `CH_COPY`는 이름·설명·대체 문구만) · D 주요 동기(`hit_d_results.motivation_subs` 75+ 최대 2개 → CM-PUSH-GROWTH/CULTURE·CM-PULL-VALUES) · D 이직 준비도 CR-A~D(체크 시작 시) · E 차기 역할 9종(DROLE-LATERAL·PIVOT 추가, 가중치 초안) · 비마케팅 17트랙 TRK 306 ② **보관** — 연결 안 되는 옛 문안은 삭제하지 않고 category `archived:*`(COMP-*·cross_*·PERSONALITY-* 48) ③ **인트라 › 리포트 모듈 복구** — 옛 화면이 없는 컬럼(type_code 등)을 조회해 목록·저장 불가였음. 지금은 id·category·title·content, 보관 숨김 ④ **채점** — 성격 축은 극별 평균(문항 수 차이 편향 제거) · 결측 응답 제외 · 준비도 0 = 판정 제외 ⑤ **보안·흐름** — response/score는 본인 세션만(404) · 이어하기/다시 하기(옛 세션 abandoned) · 나의 HIT 결과 목록 · D~G 미끼 문항. ❌ 새 해설 모듈을 선택 규칙 연결 없이 넣기 · ❌ 모듈 id 필터를 `includes`로 (성품 GROWTH-*가 S-Power 칸에 섞일 뻔함)
- **2026-10-12 (세션 169) HIT 전면 재편**: ① **체계** — A·B 공통(전 회원) + C~F 생애주기(1개) + G 경력 공백(상황). SSOT `lib/hit/stages.ts` — 표기 `code` = **`HIT - Archetype · Bounce · Challenger · Departure · Elevate · Flourish · Gap`**, 부제 `name`(상황), 배지 `letter`. ❌ 화면에 'HIT A'·'GAP' 직접 쓰기 (키·주소·DB는 a~f·gap 유지) ② **접근** — 전 검사 회원 전용 + 무료(`HIT_LAYER_ONE` free, 결제 시작 전까지) ③ **결과 = 보고서 한 틀** — `features/hit/report/ReportKit`(표지·툴바·PDF 파일명 `useReportTitle`·나의 HIT `/api/hit/chain`·점수 읽는 법·ScoreRow) + `HitNextSteps`(본문과 분리된 다음 검사 띠). 검사별 `Hit{A,B,C}ResultView`·`StageResultView`가 `print` 모드로 보고서 겸용 ④ **점수 구간 75/50/25 하나** — 화면 칩·저장 등급·해설 선택 모두. 선호·방향 점수(흥미·이직 동기·리더십 유형·2막/복귀 방향)는 `ScoreRow plain`(강점 구간 표시 안 함) ⑤ **해설** — DB `hit_report_modules`가 문안(인트라 편집), 선택 규칙은 `lib/hit/report-assembler.ts`(A·B)·`lib/hit/stage-report-modules.ts`(C~G). A도 조회 때 다시 선택(저장본 modules_used는 기록). 신규: CORE-*(B 핵심역량 24) · TRK-*(마케팅 5트랙 90) · ONB-*/DEC-*(C 15) · RIASEC-TOP-*(A 흥미 6), DR-A~D 리더십 전환 문안 ⑥ **결함 교훈** — 화면 모듈명≠채점 모듈명이면 0점(B는 채점이 DB module로 재매핑) · MBTI 점수는 왼쪽 성향 %(S·T·J를 100에서 빼지 않는다) · S-Power 키는 `guard` · A는 같은 글자가 여러 모듈에 겹침(집계는 module까지) ⑦ **DISC** — `hit_a_results.disc_intensity`(강도 0~100) 막대 + 비중 보조 ⑧ **체크리스트 준비도 0 = 체크 전** — '준비 부족' 해설·표시 안 함 ⑨ **이력서** — 항목형 `features/hero/ResumeEditor.tsx`(content v2), 이름·연락처는 프로필에서 읽기만 ⑩ **남은 것** — Anthropic 키(401) · 더미 결과 정리 · 실데이터 `hit_reliability_alpha(30)` · 비마케팅 트랙 해설 · 처리방침 수집 항목
- **2026-10-12 (세션 168) 사이트 점검 조치**: ① **요금 안내 제거** — 헤더 메뉴·`/hero/pricing` 페이지 삭제(→ `/hero/hit` 307, next.config)·AI 상담 요금 섹션·HIT MembershipGate 링크 교체. 통신판매업 신고 전 가격표·'1회 결제'·환불 문구 노출 금지 (사업 시작 시 git 이력에서 복원) ② **운영 DB 테스트 데이터 삭제** — 'Ten:One E2E Test Corp'(2026-04-22) + 매칭 1건 (마이페이지·Journey에 가짜 매칭이 보이던 원인) ③ **직업소개 표현 교체** — '인재를 찾아 연결해 드립니다'·'매칭해 드립니다'·'기업과 조용히 연결' → 분석·현황 안내·무대 준비 (직업안정법, 10곳) ④ **타사 상호 제거** — 'SM · JYP처럼' → '연예 기획사처럼' ⑤ **페이지 제목** — 'use client' 페이지는 폴더 `layout.tsx`에 metadata(hit·coaching·coaching/ai·talent-agent·search-light·about·company·journey·my·resume·jh), 서버 페이지는 `export const metadata`. 하위 라우트가 있는 layout은 `title: { default, template: '%s | HeRo' }` (문자열만 쓰면 자식 제목에서 '| HeRo'가 빠짐). ❌ 새 페이지에 metadata 없이 두기 — 전부 'HeRo — Talent Agency'로 보인다
- **2026-10-12 (세션 168) 나의 저니 점검 조치**: ① **채용 피드 탭 오류** — `/api/hero/jobs/feed`가 `hero_companies.company_size`를 조회했으나 실제 컬럼은 `size_category` (탭 전체가 오류 화면). DB 함수 `hero_match_candidates_for_jh`도 같은 컬럼을 참조해 실행 자체가 실패 → 마이그레이션 `hero_match_candidates_for_jh_size_category` + `sql/hero-matching-engine-v2/v3.sql` 수정. ❌ 기업 규모 컬럼은 `size_category` 하나 — `company_size`로 쓰지 않는다 ② **탭 이동** — Journey 탭은 state라 `#matching` 해시 링크·`[data-tab]` 셀렉터로는 안 움직인다 → `goTab` 콜백 + `CardLink`(탭 키면 버튼, 아니면 Link). 카드에서 탭을 열 땐 이것만 쓴다 ③ 채용 카드 '자세히' = JD 상세 페이지가 없으므로 카드 안 펼침(접기) ④ **매칭 탭 문구** — '유료 서비스로 전달'·'매칭 의뢰하기'·'적합한 회사와 이어드립니다' → '직접 안내'·'상세 안내 신청'·'맞는 회사를 찾아 알려드립니다' (통신판매업·직업소개 신고 전, 사이트 점검 ③과 같은 기준). 후속 조치(같은 날): 오늘의 미션 UC 표기는 **실제 지급되는 것만** — HIT A·B·이력서·JH·매칭 확인은 `uc_earn_rules`에 규칙만 있고 `earnUC` 호출이 없다(지급 연결 시 `LIFE_ONCE_GLOBAL`에 넣어 재검사 중복 지급 막기) · '연속 체크인 N일'(방문 아님) · 매칭 인박스 `alert()` → 카드 안 문구 · 승급 메일 링크 `brandSiteUrl('hero', …)`
- **2026-10-12 (세션 168) 사용자 관점 QA 조치**: ① **희망 직무 작성 페이지 크래시** — 저장된 `practical_filters`가 `{}`면 `undefined.includes`로 흰 화면(이미 JH를 쓴 사람은 '수정'이 영영 불가였음) + 화면은 camelCase(`companySizeRanges`)로 저장·매칭 함수는 `company_size_ranges`를 읽어 조직 규모 선호가 항상 무시됨 → `lib/hero/jh-practical-filters.ts` `normalizePracticalFilters()`가 읽기·쓰기 SSOT (snake_case, 기본값 보장). ❌ practical_filters 키를 화면에서 따로 정의하지 않는다 ② **HIT A 문항 수 통일** — 실제 출제 = `/api/hit/a/questions`(hit_questions A: 성격 62·행동 40·성품 40·적성 30 = 172). 소개 '127'·안내 '620'을 172로. HIT B는 220. ❌ 문항 수를 화면에 손으로 적을 때 DB와 대조 없이 쓰지 않는다 ③ **이어서 하기** — `/hero/hit/a`가 `localStorage hit_a_last_session` 또는 `GET /api/hit/a/session`(회원 최근 in_progress)으로 진행 중 세션을 찾아 '이어서 하기 (n/172)' 우선 제안 ④ 검사 딥링크 빈 화면 → 안내 카드 ⑤ 마이페이지 JH 카드 '매칭 진행 중' → '작성 완료'(매칭 데이터 없는데 과장) ⑥ 문구: '인재를 이어드립니다'·'인재 찾기 의뢰'·'결제 시스템 연동 후'·'유료 플랜에서 확장' 제거 ⑦ MADLeague 표기 'Match, Active, Develop'. 미처리: GA4 중복 page_view(GTM Google 태그 send_page_view 아직 ON — GTM UI 작업, 부록 G.1) · ~~운영자 테스트 이력서 1건~~ 삭제(사용자 승인, resumes 25e7c9d5) · `/hero/hit` 안내의 '기저요인(UF)' 축은 실제 검사에 문항이 없음(제품 정의 확인 필요)
- **2026-10-10 (세션 167)**: `lib/brand-site-menus.ts` 등록 — 헤더(`siteHeaderNav`)·인트라 메뉴(`brandAdminChildren`, 사이트 메뉴명 그대로: HIT 검사·AI 상담·탤런트 에이전시·써치 라이트·기업 + 운영 화면 extra)·푸터 4열(개인 이메일 제거). About '준비 중' 숫자 섹션 제거(실제 숫자 생기면 DB 집계로) · HIT 버튼 로딩 문구 · 탤런트 에이전시 관리 = `/intra/hero/talent-agent/applications`. ❌ 인트라 HeRo 메뉴를 `lib/intra-nav.ts`에 손으로 추가 — 사이트 메뉴면 레지스트리, 운영 화면이면 extra
- **2026-10-09 (세션 166)**: 서비스 간 연계 첫 연결 — MADLeague 인증서 → HeRo /my "MADLeague 활동 경력" (`features/hero/LinkedMadleagueCertificates.tsx` · `/api/hero/linked/madleague-certificates`). 동의 전엔 동의 카드, API가 `hasServiceLink()` 재확인 · 생년월일·대학·전공 미노출. ❌ 다른 브랜드 데이터는 연계 동의(`lib/service-links.ts`) 없이 읽지 않는다 (데이터 계약 3·4조). HeRo는 비공개 유지
- **2026-10-08 (세션 165)**: 로그인 필요 화면 LoginRequired 표준(기업·JD·JH·마이·이력서 워크스페이스) · TIH 신청 Turnstile 필수 + INSERT만(중복 이메일 409, 덮어쓰기 차단) · talent-agent 브랜드 카드 CrossSiteLink · 매칭 inbox/journey API requireMember+assertSelf · HeRo 매칭 RLS(hero_matches·hero_companies·hero_company_members) 적용

| 항목 | 내용 |
|------|------|
| **Phase** | P3 완료 · 잔업 정리 진행 중 (2026-04-24 세션 83) |
| **포지셔닝** | **HeRo = Talent Agency** · Human enhancement & Recruit optimization · "플랫폼" 아닌 "인재 기획사" |
| **운영 중** | HIT 7종(기본 성향~경력 공백 복귀) · 이력서 · 4방향 매칭(Tetrad) · /hero/talent-agent (요금 안내는 2026-10-12 제거) · **/hero/journey 워크스페이스 (신규)** |
| **세션 81 주요 결정** | ① Journey가 HeRo의 리텐션 엔진 — 설명이 아닌 도구 · ② 탭은 액션 단위(verb) · ③ Vrief × GPR 이중축을 목표 관리 표준 · ④ 스트릭 + 주간 체크인 + 매칭 피드 3중 루프 · ⑤ 브랜드 컨셉 "Talent Agency"로 재정의 · ⑥ 64 영웅 유형 영화 IP 제거·현대 직업 원형으로 전면 리네이밍 |
| **신규 인프라 (세션 81)** | `hero_daily_checkins` · `hero_goals` · `hero_goal_checkins` 테이블 · `hero_journey_stage()` · `hero_streak()` 함수 · `uc_earn_rules` brand='hero' 8종 시드 · API 8개(status/checkin/goals/goals-checkin/jobs-feed) · `features/hero/JourneyWorkspace.tsx` · `GoalsTab.tsx` · `JobsTab.tsx` |
| **사용자 측 완성 (세션 81)** | `/hero/journey` auth 분기 (비로그인 마케팅 + 로그인 워크스페이스) · 탭 6개 · Today 위젯 5개 · 스트릭 배지 + UC 토스트 · 목표 CRUD + 주간 체크인 · 채용 피드 |
| **64 유형 SSOT 개편 (세션 81)** | character_name 64개 "The + 직업원형"으로 리네이밍 · character_label 구조 변경 · profile_overview 4문단 표준 · strengths/cautions/fit_direction JSONB 표준화 · 디자인 시스템 2문서 (`docs/hero-types-design-system.md` + `docs/hero-types-pilot-prompts.md`) |
| **헤더 변경 (세션 81)** | ABOUT · Journey · Profile · 공유 · 검색 순서 (UniverseUtilityBar workspace 위치 이동, 전 브랜드 공통 영향) |
| **이월** | 64캐릭터 일러스트 양산 · HIT 질문 DB 단일화 (24파일→hit_questions) · TIH SSOT(산업군/직무군) 교체 |
| **보류 (사업 시작)** | 결제 PG · 유료 gate 활성화 · 환불 정책 |
| **색 SSOT 확정 (세션 82)** | Action/Accent/State layer만 HeRo Red · `group-hover:text-[#E53935]` on `font-bold` titles = hover-only affordance = ACCEPTABLE · per-card outline red = ACCEPTABLE · semantic red = 항상 ACCEPTABLE |
| **세션 163 (2026-10-08)** | 코어 프로그램 모듈 연결 — `/hero/programs`·`/hero/certificate`·`/intra/hero/programs` · Action Hub `program_applications`(hero) · MADLeague 프로그램 화면에 HeRo 회차 노출 |
| **비공개 유지 (2026-10-10 사용자 결정)** | `ums_sites.is_open=false` 유지 — 가림막 + layout `robots noindex`(is_open=false일 때만, 인트라에서 열면 자동 해제). 공개 전 확인: 통신판매업 신고 전 결제 금지 · 처리방침 HeRo 항목 |
| **결정 대기 (세션 163)** | ② 헤더 "프로그램" 진입점 + `lib/brand-site-menus.ts` hero 등록(site:check ❌) ③ 유료 프로그램은 통신판매업 신고 전 결제 금지 · 처리방침 항목 |
| **최근 결정 누적** | HIT Hero Type = Universe badge · 매칭 비공개 (Tetrad) · 인성·적성 = HIT A · BCDEF = 1인 1개 · 빨강은 Action/Accent/State만 · 요금 4티어 · Journey 리텐션 엔진 · Talent Agency 포지셔닝 |

---

## 참고 문서

- **매칭 설계 단일 진실 소스**: [docs/HeRo_Matching_Tetrad_v1.md](../../docs/HeRo_Matching_Tetrad_v1.md)
- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- Capability 모델: [CLAUDE.md § 1.3.1](../../CLAUDE.md#131-capability-기반-회원-모델-ssot-for-활동·역할)
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)

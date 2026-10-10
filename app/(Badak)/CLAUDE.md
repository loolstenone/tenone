# Badak 브랜드 가이드

> **바닥(Badak)** — 네트워킹과 마케팅을 위한 커뮤니티. "직무와 산업군 기반 네트워킹"

---

## 정체성

- **한 줄 소개**: 직무·산업군 기반 B2B 네트워킹 커뮤니티 (구직자↔채용자)
- **톤앤매너**: 전문적이면서도 따뜻한. 화려한 UI보다 정보 명확성 중시.
- **주 컬러**: `#D32F2F` (빨강 — 에너지·연결감)
- **디자인 방향**: 그리드·필터·검색 중심. 구직자 프로필의 "매칭" 경험 최적화.

---

## 접근 모델

- **유형**: 오픈 + 멤버십 (온보딩 필수, 프로필 기반)
- **가입 경로**: 
  1. 회원가입 (이메일)
  2. Badak 온보딩 (5단계: 직무·산업·관심사 선택, 자기소개, 프로필 사진)
  3. `badak_profiles` 레코드 생성
  4. 커뮤니티 접근 가능
- **멤버 권한**: 
  - `member` — 기본 회원 (프로필 조회, 게시글 읽기)
  - `leader` — 모임 리더 (그룹 관리, 후기 작성)
  - `admin` — Badak 운영진 (기능 설정, 커뮤니티 중재)

---

## 프로필 특화

- **특화 테이블**: `badak_profiles` (각 회원의 구직자/채용자 정보)
- **고유 필드**: 
  - `job_function` — 직무군 (기획, 개발, 마케팅, 영업 등 30개)
  - `industry` — 산업군 (IT, 금융, 제조 등 20개)
  - `job_level` — 직급 (인턴, 사원, 팀장, 임원 등)
  - `is_recruiter` — 채용자 여부 (boolean)
- **universe-profile.ts 조회 함수**: `getBadakProfile(email: string)`

---

## 권한 체계

- **role 종류**: 
  - `member` — 기본 회원 (모든 개인)
  - `leader` — 모임 리더 (context: `brand:badak`)
  - `admin` — 운영진 (context: `brand:badak`)
- **context**: `brand:badak`
- **인트라 관리 권한**: `/intra/ums/badak/*` (9개 관리 패널)

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `join_group` — 모임 참여 (월 5회, 50 UC)
  - `write_story` — 성장 스토리 제출 (월 1회, 5000 UC) ⭐ 고가치
  - `write_review` — 모임 후기 작성 (월 1회, 2000 UC)
- **brand_id 지정**: `brand_id = 'badak'` (Badak 전용 코인)
- **채용자 특화**: 모임 개설 보상 별도 정책 검토 중

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(Badak)/layout.tsx` | generateMetadata (사이트 메타) |
| `app/(Badak)/badak/page.tsx` | 메인 랜딩 (hero + 모임 피드) |
| `app/(Badak)/badak/my/page.tsx` | 마이페이지 (MyProfileCard + 내 모임) |
| `app/(Badak)/badak/explore/page.tsx` | 멤버 검색·필터 (직무·산업·레벨 조합) |
| `app/(Badak)/badak/groups/page.tsx` | 모임 목록 (카테고리·인원·후기) |
| `app/(Badak)/badak/groups/[id]/page.tsx` | 모임 상세 (설명, 멤버, 후기, 참여이력) |
| `app/(Badak)/badak/groups/create/page.tsx` | 모임 생성 (리더 권한) |
| `app/(Badak)/badak/community/page.tsx` | 커뮤니티 피드 (게시글·댓글) |
| `app/(Badak)/badak/profile/[id]/page.tsx` | 멤버 공개 프로필 |
| `features/badak/BadakHeader.tsx` | 헤더 (로고, 검색, 알림) |
| `features/badak/BadakFooter.tsx` | 푸터 (contactus) |
| `features/badak/BadakOnboardingGate.tsx` | 온보딩 게이트 (미완료 시 차단) |
| `features/badak/NeedDetailSheet.tsx` | 구인·구직 상세 시트 |
| `lib/supabase/badak.ts` | DB 클라이언트 (모임, 프로필, 피드 CRUD) |
| `app/api/badak/*` | 44개 API 라우트 |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/ums/badak/members` | 멤버 관리·조회·필터 |
| `/intra/ums/badak/groups` | 모임 관리·승인 |
| `/intra/ums/badak/needs` | 구인·구직 공고 관리 |
| `/intra/ums/badak/applications` | 모임 신청 관리 |
| `/intra/ums/badak/posts` | 커뮤니티 게시글 관리 |
| `/intra/ums/badak/stories` | 성장 스토리 관리 |
| `/intra/ums/badak/cs` | CS 문의·인사말 관리 |
| (추가 2개 패널) | TBD |

---

## 개발 주의사항

### 온보딩 게이트 (절대 금지사항)

- ❌ BadakOnboardingGate 없이 `/badak/*` 접근 허용 금지
- ✅ 온보딩 미완료 시 → canNext=false 검증 → `/badak/onboard` redirect
- ⚠️ `badak_profiles` INSERT를 API 핸들러에서 반드시 검증 (중복 방지)

### 프로필 동기화

- 기본정보(이름·연락처·회사) 수정 → `members` 테이블에 반영 (공통 필드)
- 직무·산업·레벨 수정 → `badak_profiles` 테이블에만 반영 (특화 필드)
- **MyProfileCard 사용 필수** (`#D32F2F`, siteBadge="바닥 멤버")

### 모임 리더 권한

- 그룹 생성/수정/삭제: `member_roles.role='leader'` + `context='brand:badak'` 검증
- 후기 작성은 비리더도 가능하지만, 월 1회 UC 제한
- 모임 삭제는 운영진 승인 필요 (RLS로 방어)

### 커뮤니티 피드

- 게시글 작성: `write_post` UC 지급 (월 5회 한도, 500 UC)
- 댓글 작성: `write_comment` UC 지급 (월 10회, 200 UC)
- 스팸 방지: 1시간에 5개 이상 게시글 방지 (DB 트리거)

### API 폭증 주의

- 현재 44개 API 라우트로 매우 활발
- 새 기능 추가 시 먼저 필터·검색 개선이 우선 (새 엔드포인트 증설 최소화)

---

## 현재 상태

- **2026-10-10 (세션 167)**: `lib/brand-site-menus.ts` 등록 — 헤더·인트라 메뉴(모임·니즈 탐색·커뮤니티·스토리·바닥장 신청 + 멤버 관리·CS/신고) 레지스트리 렌더 · 푸터 4열(뉴스레터 슬롯 유지) · 모임 상세 MOCK 대체값 제거(없는 모임 = '모임을 찾을 수 없습니다') · 콘텐츠 없는 bacademy·contents·hero·shop → `/badak` redirect (열 때 실제 페이지로 교체) · `site:check badak` ❌ 0

| 항목 | 내용 |
|------|------|
| **최근 변경 (2026-10-05 세션 158)** | 모임·스타 상세 500 수정(DOMPurify 서버 렌더 제거, `lib/sanitize-html.ts`) · 커뮤니티 관리자 숨김·삭제 API 직원 확인 추가(누구나 삭제 가능했음) · `badak_community_*`·`badak_leader_applications`·`badak_meeting_requests` 전체 개방 정책 제거(`sql/security-brand-writes.sql`) · `badak/jobs` 게시판 운영진 작성 전용(직업안정법) · 문의는 `contact_submissions`(badak_inquiry) → 인트라 BrandInquiryInbox에서 상세·응대 기록 |
| **Phase** | Beta (2026-05-17 갱신) — 실DB 연동 완료, 프리미엄 멤버십 티어 설계 대기 |
| **개발 수준** | API 44개 모두 Supabase 연결 ✅. 니즈 클라우드(`lib/badak-cloud-data.ts`)만 DB 폴백용 Mock 잔재. |
| **이월 작업** | 1️⃣ **유료 티어 가격·기능 정책 결정** (현재 `wio_subscription_plans.badak/free` 시드만 존재, features=`[]`). 2️⃣ Pro/Business 티어 기능 게이트 후보 식별 — 후보: DM 무제한·고급 필터·구인 공고 게시·프리미엄 배지·응시자 통계. |
| **최근 결정** | (2026-05-17 세션 141) `wio_subscription_plans`에 `badak/free` 시드 INSERT. 유료 티어는 §1.10 정직 원칙에 따라 가격·기능 정책 결정 시점까지 보류. |

## 외부 서버 이전 계획 (2026-10-05 결정)

> 외부 서버(badak.biz, nginx) 회원 약 9,000명. **통째 이전하지 않는다 — 원하는 사람만 옮긴다** (CLAUDE.md §0.1 외부 서버 이전 원칙, 구글 Nest 방식).
> 기존 Badak 안에는 **Planner's Planner 사용자도 다수** → 서비스별로 분리 고지.

| 단계 | 내용 | 법적 근거·주의 |
|------|------|---------------|
| ① 전환 안내 발송 (9,000명 전체) | 서비스 개편·전환 안내 = **서비스 이용 관련 필수 고지**라 마케팅 동의 없이 발송 가능. Badak 이용자 / Planner's 이용자 **안내를 분리** | 광고 문구 섞지 않기 (섞이면 광고성 정보 → 수신 동의 필요) |
| ② 원하는 회원만 새로 가입 | 안내 메일의 링크 → Ten:One 계정 가입 + Badak 약관 동의 (`member_brand_joins.terms_version`) | 기존 활동 이력 연결은 본인 동의 시에만 |
| ③ "소식 받기" 별도 동의 | 안내 메일 안에 **Ten:One 소식 수신 동의** 버튼 → 동의자만 `newsletter_subscribers`(비회원 email 키)로 | 정보통신망법 제50조: 광고성 정보는 사전 수신 동의 필수. 기존 Badak 마케팅 동의는 동의 범위·**2년 재확인** 여부 확인 전까지 근거로 쓰지 않음 |
| ④ 전환 기간 (예: 3~6개월) | 기존 서버 유지, 미전환자 재안내 1~2회 | |
| ⑤ 종료 | 기존 서버 종료. 미전환·소식 미동의 회원 데이터는 파기 (보관 시 제21조 위반) | §0.1 서비스 종료 절차 ⑤~⑦ |

**핵심**: 9,000명 전체를 "소식 알림 대상"으로 계속 쓰는 것은 ③ 동의를 받은 사람으로 한정된다. 전환 안내(①)는 1회성 필수 고지로만 가능.

**확인 필요 (외부 서버)**: 최근 6개월·1년 활동 회원 수 · 마케팅 수신 동의 회원 수와 동의 일자 · 이메일 보유율 · 비밀번호 저장 방식 · Planner's 사용자 수

## 구독 인프라

- 플랜 SSOT: `wio_subscription_plans` (service='badak') · 현재 free 1개만 시드, `features='[]'::jsonb`
- 구독 행: `wio_subscriptions` (service='badak') · 현재 0건
- 관리 UI: `/intra/ums/commerce/subscriptions` (전 브랜드 공통)

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4 서비스 접근 모델 6종](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UC 정책 상세: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)
- UX 표준: [UX_GUIDE.md](../../UX_GUIDE.md)

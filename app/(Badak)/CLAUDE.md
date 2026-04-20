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

| 항목 | 내용 |
|------|------|
| **Phase** | Beta (2026-04-20) — 커뮤니티·그룹 기능 추가, UC 보상 확대 진행 중 |
| **개발 수준** | 대부분 완성. 기본 모임·검색·후기 기능 안정화. |
| **이월 작업** | 없음 — 세션 58에서 모든 태스크 검증 완료 |
| **최근 결정** | 모임 후기에 사진 첨부 지원 추가 예정, UC 브랜드별 정책 확정 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4 서비스 접근 모델 6종](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UC 정책 상세: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)
- UX 표준: [UX_GUIDE.md](../../UX_GUIDE.md)

# MADLeague 브랜드 가이드

> **MADLeague** — 전국 대학 동아리 연합. "대학생 네트워킹 & 경쟁을 통한 성장"

---

## 정체성

- **한 줄 소개**: 국내 주요 대학의 마케팅·기획 동아리 네트워크 + 경쟁 플랫폼
- **톤앤매너**: 대학생 에너지. 밝음·열정·포용. 커뮤니티 중심.
- **주 컬러**: 검정 + 악센트 (DAMbe 캐릭터 컬러)
- **디자인 방향**: 동아리 정보 + 대회 아카이브 + 멤버 포트폴리오. 대학가 활동 기록 누적.

---

## 접근 모델

- **유형**: 승인 멤버십 (지원서 → 운영진 심사 → 승인)
- **가입 경로**:
  1. 회원가입 (이메일)
  2. MADLeague 지원서 작성 (`mad_applications`)
     - 소속 대학 / 동아리 / 기수 / 활동연도 / 전공 / 부전공 / 관심 산업·직무 선택
  3. 운영진 승인 (→ `approved_member` role + `context: brand:madleague`)
  4. 커뮤니티·동아리 페이지 접근 가능
- **멤버 권한**:
  - `member` — 기본 회원 (조회만, MADLeague 미소속)
  - `approved_member` — 승인 멤버 (동아리 멤버, MADLeague 참여 권리)
  - `leader` — 동아리 리더 (동아리 정보 수정, 포트폴리오 관리)
  - `admin` — 운영진 (플랫폼 통제)

---

## 프로필 특화

- **특화 테이블**: `mad_applications` (지원서 + 멤버 정보)
- **고유 필드**:
  - `club_slug` — 동아리 ID (예: "luki-snu")
  - `cohort` — 기수 (1-50, 직접 입력)
  - `activity_year` — 활동연도 (2021-현재)
  - `university` — 대학 (드롭다운, 100+ 등록)
  - `major` — 전공
  - `sub_major` — 부전공
  - `interested_industry` — 관심 산업군 (배열)
  - `interested_job` — 관심 직무 (배열)
- **관련 테이블**: `mad_clubs` (동아리), `mad_competitions` (경쟁·대회)
- **universe-profile.ts 조회 함수**: `getMADLeagueProfile(email: string)`

---

## 권한 체계

- **role 종류**:
  - `member` — 미가입 (지원 전)
  - `approved_member` — 승인 멤버 (context: `brand:madleague`)
  - `leader` — 동아리 리더 (context: `brand:madleague`)
  - `admin` — 운영진 (context: `brand:madleague`)
- **context**: `brand:madleague`
- **인트라 관리 권한**: `/intra/ums/madleague` (1개 패널)

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `service_onboard` — MADLeague 첫 온보딩 (생애 1회, 500 UC)
  - `submit_story` — 성장 스토리 (월 1회, 5000 UC) ⭐ 최고 가치
  - `write_portfolio` — 포트폴리오 작성 (월 1회, 1000 UC)
- **brand_id 지정**: `brand_id = 'madleague'`

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(MADLeague)/layout.tsx` | generateMetadata |
| `app/(MADLeague)/madleague/page.tsx` | 메인 페이지 (hero + 소개 + 동아리 그리드) |
| `app/(MADLeague)/madleague/clubs/page.tsx` | 동아리 목록 (필터·검색) |
| `app/(MADLeague)/madleague/clubs/[slug]/page.tsx` | 동아리 상세 (소개, 멤버, 성과) |
| `app/(MADLeague)/madleague/programs/layout.tsx` | 프로그램 서브네비 (경쟁·대회·교육) |
| `app/(MADLeague)/madleague/programs/competition/page.tsx` | 경쟁·대회 아카이브 |
| `app/(MADLeague)/madleague/madzine/page.tsx` | MADzine (뉴스레터·콘텐츠) |
| `app/(MADLeague)/madleague/apply/page.tsx` | 지원서 작성 |
| `app/(MADLeague)/madleague/member/page.tsx` | 멤버 목록 |
| `app/(MADLeague)/madleague/member/[id]/page.tsx` | 멤버 공개 프로필 |
| `app/(MADLeague)/madleague/member/portfolio/page.tsx` | 본인 포트폴리오 |
| `app/(MADLeague)/madleague/my/page.tsx` | 마이페이지 (MyProfileCard + 내 정보) |
| `features/madleague/MadLeagueHeader.tsx` | 헤더 (로고·네비) |
| `features/madleague/MadLeagueFooter.tsx` | 푸터 |
| `lib/supabase/madleague.ts` | DB 클라이언트 |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/ums/madleague` | 지원서·멤버·동아리·대회 승인 관리 |

---

## 개발 주의사항

### 지원서 심사

- ❌ 미승인 상태에서 동아리 페이지 접근 금지 (SiteClosedOverlay 또는 게이트)
- ✅ 승인 → `member_roles` INSERT (role='approved_member', context='brand:madleague')
- 거부 시 재신청 가능 (3회 제한 검토 중)

### 동아리 로고

- **Storage**: `madleague-logos` 버킷에 저장 (36×36, PNG)
- **경로**: `mad_clubs.logo_url` (현재 7개 로고 대기 중 — WORK_STATUS.md M1-G)
- 로고 없을 시 → 동아리 이름의 첫 글자 배경색 뱃지

### 포트폴리오 공개

- 멤버는 본인 포트폴리오만 수정 가능
- 기수별·직무별 필터링은 인트라에서만 (개인정보 보호)
- 공개 포트폴리오는 회원 동의 필수 (checkbox)

### 기수 선택

- 드롭다운이 아니라 **직접 입력** (1~50, 숫자만)
- 미래 기수 가능 (예정자)

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | Beta (2026-04-22 업데이트) — UX 정비 완료. |
| **개발 수준** | 클럽 시스템·대회 기능·지원서 완성. 아레나 3섹션 라이브 (게시판·프로젝트·PT). |
| **이월 작업** | `/madleague/projects` 페이지 구현 / `/madleague/pt` 페이지 구현 / 동아리 로고 7종 (M1-G) / MADzine 실제 콘텐츠 이관 (ML-E) |
| **최근 결정** | 마이페이지 탭 UI 완전 제거 — 동아리 회장 패널·아레나 바로가기·로그아웃 직렬 배치 / 헤더 "매드리거" 항목 삭제 |

---

## 참고

- 서비스 접근 모델: [CLAUDE.md § 1.4](../../CLAUDE.md#14-서비스-접근-모델-6종)
- UC 정책: [docs/Universe_Coin_Policy.md](../../docs/Universe_Coin_Policy.md)
- UX 표준: [UX_GUIDE.md](../../UX_GUIDE.md)

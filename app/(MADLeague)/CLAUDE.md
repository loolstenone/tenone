# MADLeague 브랜드 가이드

> **MADLeague** — 전국 대학 동아리 연합. "대학생 네트워킹 & 경쟁을 통한 성장"
> Tier **집중** · 공식 주소 `www.madleague.net` (외부 서버 운영 중 → Vercel 버전은 비공개 스테이징 `madleague.tenone.biz`, is_open=false, noindex) · §0.1 "새로 제작, 이전 없음"

---

## 정체성

- **한 줄 소개**: 국내 주요 대학의 마케팅·기획 동아리 네트워크 + 경쟁 플랫폼
- **톤앤매너**: 대학생 에너지. 밝음·열정·포용. 커뮤니티 중심.
- **주 컬러**: 검정 + 레드 `#EC1D25` (HeRo 프로그램만 골드 `#FFC000`)
- **디자인 방향**: 동아리 정보 + 대회 아카이브 + 멤버 포트폴리오. MADzine은 검정 에디토리얼 매거진 (아래 디자인 규칙)

---

## 접근 모델

- **유형**: 승인 멤버십 (지원서 → 운영진 심사 → 승인)
- **가입 경로** (2026-10-06 정비):
  1. Ten:One ID 로그인 (비로그인 시 `/madleague/apply`에서 LoginModal)
  2. 지원서 작성 — 신청 유형 4종: 일반 매드리거 · 동아리 회장 · 멘토 · 기업 회원
     - Turnstile 캡차 + [필수] 개인정보 수집·이용 동의 (버전 `2026-10-06.2`, `mad_applications.consent`에 기록)
     - 지원서는 `members.id`로 연결 (`mad_applications.member_id`), 이메일은 계정 이메일만 사용
  3. 운영진 승인 → `member_capability_roles` 활동 역할 INSERT + `mad_members` 1행 생성(계정 정보 복사 없음)
  4. 매드리거 전용 공간(아레나·커뮤니티·PT·프로젝트) 입장
- **동의 문구 표시 범위**: 작성한 글·댓글·포트폴리오에 이름과 프로필 사진 공개 (2026-10-06 사용자 결정)

---

## 프로필 특화

- **`mad_applications`** (지원서): `member_id`(→members.id) · `consent` · club_id · applicant_role · cohort · activity_year · `year`(NOT NULL — activity_year 또는 현재 연도) · university(기업은 NULL) · major · minor · interested_industry · interested_job · motivation · portfolio_url · status(pending/accepted/rejected)
- **`mad_members`** (매드리거 1인 1행, `user_id` UNIQUE = auth uid): `member_id`(→members.id) · club_id · cohort_id · university · major · year_in_school · role · status · activity_years · bio · skill_tags · portfolio_public · source_application_id
  - ⚠️ **이름·이메일·전화·사진은 `members`가 SSOT** (데이터 계약 1). `mad_members.name·email·phone·avatar_url` 컬럼은 **삭제 완료** (2026-10-07 B단계 `madleague_members_drop_copied_columns`)
- **관련 테이블**: `mad_clubs`(7개, 2026-10-06 archive에서 복원·소개 문구 비움) · `mad_cohorts`(0 — archive 14건 근거 확인 전 미복원) · `mad_competitions` · `mad_articles`(MADzine) · `mad_posts`·`mad_comments`(커뮤니티) · `mad_certificates`
- **universe-profile.ts**: `getMadLeagueProfile(memberId)` — member_id 기준 (세션 160 수리)

---

## 권한 체계 (2026-10-06 capability 이관 완료)

| 구분 | 저장소 | 값 |
|------|--------|-----|
| 직원 (권한) | `member_roles` staff·manager·super_admin | 인트라·관리 API·전 공간 입장 |
| 브랜드 인트라 관리 | `member_roles(role='madleague', context='brand')` | `/intra/ums/madleague` |
| 일반 매드리거 | `member_capability_roles` (club, madleague, **현역**) | context `{club_id, year}` |
| 동아리 회장 | (club, madleague, **임원**) | context `{position:'회장', club_id, year}` + `mad_clubs.president_member_id` |
| 멘토 | (club, madleague, **멘토**) | `capabilities.club`에 '멘토' 추가 (사용자 결정) |
| 기업 회원 | (showcase, madleague, **host**) | context `{type:'corporate', company}` |

- ❌ `member_roles(context='brand:madleague')`에 활동 역할(approved_member·leader·mentor·corporate) 넣지 않는다 — 기존 1건은 이관 후 is_active=false
- **SSOT 헬퍼**: `lib/madleague-roles.ts` — `getMadAccess(memberId)`(isStaff·roles·canEnter·isMentor) · `grantMadCapabilityRole` · `capabilityRoleForApplicant` · `listActiveMadleaguers`
- 역할 변경은 UPDATE 금지 — valid_until 설정 + 새 행 INSERT (§1.6.1 레시피 2)

---

## UC 정책 특이사항

- **브랜드 전용 액션**:
  - `service_onboard` — MADLeague 첫 온보딩 (생애 1회, 500 UC)
  - `submit_story` — 성장 스토리 (월 1회, 5000 UC) ⭐ 최고 가치
  - `write_portfolio` — 포트폴리오 작성 (월 1회, 1000 UC)
- **brand_id 지정**: `brand_id = 'madleague'`

---

## Action Hub Entries

- `mad_applications` · status='pending' · `/intra/ums/madleague` · category=approval · priority=normal
- `mad_hero_applications` · status='pending' · `/intra/ums/madleague` · category=approval · priority=normal

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(MADLeague)/layout.tsx` | generateMetadata + MadLeagueHeader/Footer |
| `app/(MADLeague)/madleague/page.tsx` | 메인 |
| `app/(MADLeague)/madleague/clubs/` | 동아리 목록·상세·지원서 관리 — **열람: 직원·이 동아리 회장·이 동아리 담당 멘토**(`canViewClubApplications`, 멘토 context.club_id). 승인·반려: 일반 신청=회장·직원, 회장·멘토·기업 신청=직원만 |
| `app/(MADLeague)/madleague/contact/` | 문의하기 (Turnstile·동의 → /api/contact form_type `madleague_inquiry` → 인트라 고객 문의) — `features/madleague/MadContactForm.tsx` |
| `app/(MADLeague)/madleague/hero/` | HeRo 신청 — Turnstile + 수집·이용 동의(버전 `2026-10-07.1`, `mad_hero_applications.consent`) + service_role 저장 |
| `app/(MADLeague)/madleague/apply/` | 지원서 (로그인·캡차·동의) |
| `app/(MADLeague)/madleague/member/` | 매드리거 본인 화면 (profile·portfolio·certificate·projects) |
| `app/(MADLeague)/madleague/portfolio/[memberId]/` | 공개 포트폴리오 (`portfolio_public=true`만) |
| `app/(MADLeague)/madleague/my/page.tsx` | 마이페이지 (MyProfileCard + 매드리거 상태) |
| `app/(MADLeague)/madleague/arena·community·pt·projects/` | 매드리거 전용 공간 (`getMadAccess().canEnter`) |
| `app/(MADLeague)/madleague/madzine/` | MADzine 목록·기사·투고 (`layout.tsx` = 에디토리얼 서체) |
| `features/madleague/MadLeagueHeader.tsx` · `MadLeagueFooter.tsx` | 헤더(UniverseMobileMenu) · 푸터(UniverseFooter 래퍼) |
| `features/madleague/MadLoginButton.tsx` | `MadLoginButton`(버튼→LoginModal) · `MadLoginGate`(서버 페이지용 로그인 필요 화면) |
| `features/madleague/MadzineUI.tsx` | MADzine 공통 카드·라벨·서체 규칙 |
| `features/madleague/MadzineArticleBody.tsx` | 기사 본문 (HTML은 DOMPurify + YouTube embed만, 텍스트는 줄바꿈) |
| `lib/madleague-roles.ts` | 활동 역할·입장 판단 SSOT |
| `lib/madleague-people.ts` | 작성자·프로필 표시 = members (`withMadAuthors`·`getMadPeople`·`getMemberCoreByAuthId`) |
| `lib/madzine-categories.ts` | MADzine 카테고리 8종 SSOT (DB 제약과 동일) |
| `lib/supabase/madleague.ts` | DB 헬퍼 |
| `app/api/madleague/*` | apply · applications/[id]/approve·reject · member/* · posts · articles · portfolio · admin/* |
| `Scripts/madzine-import.mjs` | 기존 madleague.net(아임웹) MADzine 이전 스크립트 (멱등) |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/ums/madleague` | 지원서·멤버·동아리·대회·HeRo 신청 관리 |
| (공통) | **사이트 헤더 메뉴·인트라 메뉴·화면 제목 = `lib/brand-site-menus.ts`(madleague)** — `MadLeagueHeader`가 `siteHeaderNav`로 렌더, 인트라 이름은 사이트 표기 그대로 (CLAUDE.md §1.9.5) |
| `/intra/ums/madleague/articles` | MADzine 기사 검토·발행 |
| `/intra/ums/madleague/applications` | 지원하기 (홈 버튼, mad_applications) — `ApplicationsAdmin` |
| `/intra/ums/madleague/hero-applications` | HeRo 신청하기 (/madleague/hero, mad_hero_applications) |
| `/intra/ums/madleague/members` | 회원 = 활동 역할 보유자 (`/api/madleague/admin/members` — member_capability_roles는 본인 조회 RLS뿐이라 service_role API) · 역할 필터·종료 역할 보기 |
| `/intra/ums/madleague/cs` | 문의하기 (푸터 Contact, form_type `madleague_inquiry`) |

---

## 개발 주의사항

### RLS·데이터 (2026-10-06)

- `mad_members`·`mad_applications`: anon 권한 없음. 본인 행만 조회, 본인 수정은 프로필 컬럼만(`bio, skill_tags, portfolio_public, major, year_in_school, university, updated_at` 컬럼 GRANT — phone·avatar_url은 members로 이동). 쓰기는 service_role API만
- **다른 테이블 정책에서 `mad_members`를 서브쿼리로 읽지 않는다** → `public.mad_current_member_id()` (SECURITY DEFINER) 사용. 서브쿼리를 쓰면 anon 조회가 `permission denied for table mad_members`로 통째 실패한다 (2026-10-06 MADzine·수료증 회귀 사고)
- 공개 포트폴리오 API는 service_role + 공개 컬럼 화이트리스트 (email·phone 제외)
- 승격 트리거 `mad_promote_application_to_member`: status='accepted' 시 member_id 기준 1인 1행 (user_id UNIQUE)
- 직원 판단에 `.maybeSingle()` 금지 — 역할이 여러 개면 에러로 "직원 아님" 판정. `getMadAccess`(limit) 사용

### 로그인 (§1.2.1)

- 회원 전용 화면에서 `/login` 링크·리다이렉트 금지 → `MadLoginButton` / `MadLoginGate` (현재 페이지 위 LoginModal, 로그인 후 `router.refresh()`)

### MADzine

- 카테고리 8종: 커버 cover · 인터뷰 interview · 케이스 case · 리포트 report · 스토리 story · HeRo hero · 시리즈 series · 동아리 news — `lib/madzine-categories.ts`와 DB `mad_articles_category_check`를 함께 바꾼다
- 본문은 HTML(이전분) 또는 일반 텍스트(투고 에디터). HTML은 클라이언트에서 정화 후 렌더 → 서버 HTML에 본문 없음 (SEO 이월)
- 이전 글 slug = `mz-{아임웹 idx}`, 이미지 = Storage `mad-community/madzine/{idx}/`, 작성자 표기 "MAD League", 요약 = 본문 앞 160자
- ⚠️ 운영 DB는 배포 사이트와 로컬이 공유 — 데이터 작업은 배포된(옛) 코드에 즉시 노출된다. 렌더 방식이 바뀌는 데이터는 코드 배포와 함께

### 동아리 로고

- **Storage**: `madleague-logos` 버킷 (36×36, PNG) · `mad_clubs.logo_url` (7개 모두 없음)
- 로고 없을 시 → 동아리 이름 첫 글자 배경색 뱃지 (사각형)

### 포트폴리오 공개

- 멤버는 본인 포트폴리오만 수정 · 공개는 `portfolio_public` 동의 체크
- 기수별·직무별 필터링은 인트라에서만 (개인정보 보호)

### 기수 선택

- 드롭다운이 아니라 **직접 입력** (1~99, 숫자만) · 미래 기수 가능

### 디자인 규칙

- `rounded-*` 금지 (예외: `h-3` 이하 컬러 도트 `rounded-full`, 로딩 스피너)
- `<style>` 블록 금지 → `inputCls` Tailwind 상수
- `inputCls`: `'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]'`
- **MADzine 에디토리얼** (2026-10-06): 목록·기사 모두 검정 바탕 · 헤드라인 세리프(Playfair Display 이탤릭 로고 + Noto Serif KR, `madzine/layout.tsx`에서만 로드) · 자간 넓은 대문자 라벨(`MZ_KICKER`) · `border-white/15` 얇은 선 · 4:5 세로 카드 · 번호 아카이브. 새 MADzine 화면은 `MadzineUI.tsx` 상수·카드를 쓴다 (흰 배경 화면 만들지 않음)

---

## 현재 상태

| 항목 | 내용 |
|------|------|
| **Phase** | 새 사이트 제작 중 — 비공개 스테이징 (2026-10-07 세션 161 — ums_sites.is_open=false로 다시 닫음) |
| **세션 159 완료** | RLS 잠금 · 지원서 로그인/캡차/동의/member_id · 활동 역할 capability 이관 · 동아리 7개 복원 · 로그인 모달 표준화 · 계정 정보 members SSOT 전환(1단계) · MADzine 21건 이전 + 에디토리얼 레이아웃 · 배포 완료 |
| **세션 160 완료** | 복사 컬럼 삭제 A단계(옛 미연결 행 삭제 · `mad_link_member_to_user` 삭제 · `mad_eligible_certificates` members 기준·service_role 전용) · 이메일 매칭 계정 연결(`member/link`·`MemberLinkButton`) 폐기 · `acceptMadApplication()` 공통 승인(회장·인트라 모두 capability 부여, 상태 'accepted' 통일) · 회장 대기 지원서 API `/api/madleague/applications/president` · `getMadLeagueProfile(memberId)` 수리 · MADLeap 인트라 3페이지 admin API로 수리 |
| **세션 161 완료** | 복사 컬럼 DROP B단계 운영 적용 · **동아리 지원서 = A 소속 인증**(사용자 결정) → 열람을 해당 동아리 회장·담당 멘토·직원으로 제한 + 반려 권한 승인과 통일 · 인트라 회원 관리 capability 기준 · 문의하기 페이지 신설(푸터 개인 이메일 제거) · HeRo 신청 동의·캡차·서버 저장 · 미사용 ums_boards 6개·테스트 지원서 삭제 · 인트라 사이트 링크 스테이징 절대 주소(`brandSiteUrl`) |
| **이월 작업** | ① 로그인 실검증: 지원→마이페이지 "심사 중"→회장 대기 목록→승인→capability 행 · 인트라 회원 관리(멘토 1명 표시)·문의하기 제출 1건 ② **기존 멘토 1명(lools, context에 club_id 없음) 담당 동아리 지정** — 없으면 어느 동아리 지원서도 못 봄 ③ 배포 후 공개 INSERT 정책 제거(`sql/security-open-insert-lockdown-3.sql` B: `mad_hero_insert`) ④ HeRo 신청 동의 보관기간("상담 종료 후 1년") 사용자 확인 ⑤ 기수 14건(archive) 근거 확인 후 복원 여부 ⑥ MADzine 서버 렌더(SEO) — DNS 전환 전 ⑦ DNS 전환 시 구 URL `/59/?bmode=view&idx=…` → `/madleague/madzine/mz-…` 308 ⑧ 동아리 로고 7종 · 소개 문구 ⑨ `mad_articles.author_name` 바이라인 표시 방식 결정 |
| **최근 결정** | 멘토 = club/멘토 · 기업 = showcase/host · MADzine 카테고리 원본 8종 · 이미지 자체 Storage 복사 · 작성자 이름·사진 공개 · 동아리 7개만 복원(소개 비움) |

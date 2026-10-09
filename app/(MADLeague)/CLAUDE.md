# MADLeague 브랜드 가이드

> **MADLeague** — 전국 대학 동아리 연합. "대학생 네트워킹 & 경쟁을 통한 성장"
> Tier **집중** · 공식 주소 `www.madleague.net` (외부 서버 운영 중 → Vercel 버전은 비공개 스테이징 `madleague.tenone.biz`, is_open=false, noindex) · §0.1 "새로 제작, 이전 없음"

---

## 정체성

- **한 줄 소개**: 국내 주요 대학의 마케팅·기획 동아리 네트워크 + 경쟁 플랫폼
- **톤앤매너**: 대학생 에너지. 밝음·열정·포용. 커뮤니티 중심.
- **주 컬러**: 검정 + 레드 `#EC1D25` (HeRo 프로그램만 골드 `#FFC000`)
- **BI** (About): Red `#EC1D25` Passion(열정) · Black `#000000` Patience(끈기) · Gold `#FFC000` Witty(재치 발랄함) — "열정과 끈기 그리고 재치 발랄함 / 이 조합은 강인함을 만들어 낸다." · 마스코트 DAMbe(담비) — 고화질 `public/logos/madleague/dambe-trophy.webp`(트로피, 배경 투명) · `dambe-football.webp`(미식축구). 옛 `dambe.png`는 저화질 — 쓰지 않는다
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
- **관련 테이블**: `mad_clubs`(7개, 2026-10-06 archive에서 복원·소개 문구 비움) · `mad_cohorts`(0 — archive 14건 근거 확인 전 미복원) · `mad_articles`(MADzine) · `mad_posts`·`mad_comments`(커뮤니티)
- **경쟁 PT·인증서 = 코어 프로그램 모듈** (세션 163): `program_rounds`(brand_id='madleague', context `{club_id}`) · `program_teams`·`program_participants`·제출·Q&A·`program_applications` · `program_certificates`(코드 `MAD26-`). 옛 `mad_competitions` 계열·`mad_certificates`는 배포 확인 후 DROP 예정 — 새 코드에서 읽지 않는다. 설계 `docs/Program_Module.md`
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
- `program_applications` (brand madleague) · status='pending' · `/intra/ums/programs` · category=approval · priority=normal

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/(MADLeague)/layout.tsx` | generateMetadata + MadLeagueHeader/Footer |
| `app/(MADLeague)/madleague/page.tsx` | 메인 |
| `app/(MADLeague)/madleague/clubs/` | 동아리 목록·상세·지원서 관리 — **열람: 직원·이 동아리 회장·이 동아리 담당 멘토**(`canViewClubApplications`, 멘토 context.club_id). 승인·반려: 일반 신청=회장·직원, 회장·멘토·기업 신청=직원만 |
| `app/(MADLeague)/madleague/contact/` | 문의하기 (Turnstile·동의 → /api/contact form_type `madleague_inquiry` → 인트라 고객 문의) — `features/madleague/MadContactForm.tsx`. **`?type=` 유형 미리 선택**: corporate(기업 협업·과제 제안)·club-apply(공식 동아리 신청)·club·program·etc (`MAD_CONTACT_TOPICS`) — 버튼에서 넘길 때 유형을 붙인다 |
| `app/(MADLeague)/madleague/clubs/[slug]/room/` | **동아리 방 = 작은 네이버 카페** — 대문·게시판(`lib/madleague-club-cafe.ts` CAFE_BOARDS: 공지(운영진)·자유·질문·자료실·사진첩)·글·댓글·멤버·운영진 고정/삭제. 입장 = 그 동아리 현역·임원·멘토·직원 (`mad_can_access_club`·`mad_is_club_officer`, `sql/madleague-club-cafe.sql`). 동아리 목록 카드에서 입장 |
| `features/madleague/programs-list.ts` | **프로그램 SSOT** — 순서·이름·eyebrow·한 줄 요약·4그룹(도전·실전·훈련·연결)·한눈에 보기(누가·언제·어떻게·참가비·남는 것)·corporate·madleaguerOnly. 탭 줄·홈·전체 목록·About·검색·상세 템플릿이 전부 여기서 렌더 |
| `features/madleague/ProgramDetailPage.tsx` | **프로그램 상세 표준 템플릿** (2026-10-08): ① 히어로(대상·시기·참가비 칩) ② 한눈에 보기 ③ 진행 과정(steps) ④ 얻는 것(gets) ⑤ 자유 섹션(`ProgramSection`) ⑥ 참여 CTA ⑦ 이전·다음 프로그램. 각 page.tsx는 steps·gets·자유 섹션만 넘긴다 |
| `features/madleague/ProgramCTA.tsx` | 상세 하단 참여 CTA 통일 — 공개 신청서(forms.program=key) 있으면 그 버튼, 없으면 매드리거 등록 · 문의하기(`?type=program`) · corporate면 기업 참여 문의(`?type=corporate`) · `primary`로 페이지 안 폼 앵커 덮어쓰기(히어로) |
| `features/madleague/HeroRotatingTitle.tsx` | 홈 히어로 카피 3종 3초 교체 |
| `app/(MADLeague)/madleague/programs/hero·rookie·planners/` | **연계 프로그램** (`PartnerProgramPage`) — 옛 `/madleague/hero` → 308. MADLeague 자체 HeRo 신청 폼·`/api/madleague/hero` 삭제(2026-10-09) |
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
| `scripts/madzine-import.mjs` | 기존 madleague.net(아임웹) MADzine 이전 스크립트 (멱등) |
| `app/(MADLeague)/madleague/programs/` | 상세 10개 전부 `ProgramDetailPage` 템플릿. 순서 = programs-list (경쟁 PT · 크리에이지 · DAM 파티 · 아이디어 무브먼트 · 히어로 프로그램 · RooKie · Planner's · PJT · 마케톤 · 인사이트 투어링). 전체 페이지는 4그룹으로 묶어 표시. 경쟁 PT 옛 기록은 페이지 상수 `ARCHIVE`. IM 에센스는 `/im#essence` 섹션(옛 `/im/essence` → 308) |
| `lib/madleague-program-assets.ts` · `scripts/madleague-programs-import.mjs` | madleague.net 프로그램 이미지 44장 → Storage `board-assets/madleague/programs/{group}/{id}.webp` (멱등) |
| `app/(MADLeague)/madleague/forms/[slug]/` | 행사 참가 신청 (유니버스 공통 폼 `components/forms/FormRenderer.tsx`) |
| `app/(MADLeague)/madleague/pt/` | 경쟁 PT 목록 · `[id]` 회차 방 · `[id]/teams` 팀 구성(임원·직원) · `join/[code]` 초대 — 화면은 `features/programs/*` 얇은 래퍼 (테마 `ProgramTheme.ts` madleague) |
| `app/(MADLeague)/madleague/certificate/` | 인증서 발급·인쇄(`print/[code]`)·진위 확인(`verify/[code]`) — `features/programs/Certificate*` |
| `app/(MADLeague)/madleague/certificate/issue/` | **경쟁 PT 인증서 받기 = 로그인 유도** — 로그인 필수 → 이름+생년월일+대학(Turnstile)+[필수] 연결 동의 → `/api/madleague/certificates/find`(POST 연결·GET 내 인증서) → 디자인 배경(`public/madleague/certificates/bg-*.png`) 위에 캔버스로 그려 PNG·PDF (`features/madleague/certificate-render.ts`, 서체 `public/fonts/Pretendard-*.subset.woff2`, PDF는 자체 생성·라이브러리 없음) |
| `lib/programs/*` | 코어 프로그램 모듈 (access·brands(officerGroupIds·groupCandidates·brandActivityCerts)·consent·teams·certificates·paths) |

---

## 인트라 관리 경로

| 경로 | 역할 |
|------|------|
| `/intra/ums/madleague` | 지원서·멤버·동아리·대회·HeRo 신청 관리 |
| (공통) | **사이트 헤더 메뉴·인트라 메뉴·화면 제목 = `lib/brand-site-menus.ts`(madleague)** — `MadLeagueHeader`가 `siteHeaderNav`로 렌더, 인트라 이름은 사이트 표기 그대로 (CLAUDE.md §1.9.5) |
| `/intra/ums/madleague/articles` | MADzine 기사 검토·발행 |
| `/intra/ums/madleague/applications` | 지원하기 (홈 버튼, mad_applications) — `ApplicationsAdmin` |
| `/intra/ums/madleague/hero-applications` | 히어로 프로그램 신청서 (/madleague/programs/hero, mad_hero_applications) |
| `/intra/ums/madleague/members` | 회원 = 활동 역할 보유자 (`/api/madleague/admin/members` — member_capability_roles는 본인 조회 RLS뿐이라 service_role API) · 역할 필터·종료 역할 보기 |
| `/intra/ums/madleague/cs` | 문의하기 (푸터 Contact, form_type `madleague_inquiry`) |
| `/intra/ums/madleague/forms` | 참가 신청 — 이벤트마다 신청서 생성·복제·질문·기간·로그인·수정·1인 1회·정원·개인정보 고지·응답(상태·메모·첨부·CSV). 연결 프로그램 키 = `app/intra/ums/madleague/form-programs.ts` |
| `/intra/ums/madleague/competitions` · `/intra/ums/programs` | 경쟁 PT 회차·팀·제출·결과·참가 신청 선발 (브랜드별 / 통합) — `components/intra/programs/ProgramEditor` |
| `/intra/ums/madleague/certificates` · `/intra/ums/programs/certificates` | 인증서 관리 (구분·코드·발급일·비고·결과·폐기/복원·CSV) |

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

### 프로그램·경쟁 PT (2026-10-07)

- 경쟁 PT에는 **MAD Crown 표기를 쓰지 않는다** — 순위는 1·2·3위 (사용자 결정). About·수료증·포트폴리오의 MAD Crown은 별도 확인 대기
- 원본 이전 시 개인 입금 계좌·개인 전화번호·지난 모집 기간은 옮기지 않는다 — 회차별 안내는 신청서 설명에
- 신청서는 `forms` 공통 모듈 (데이터 계약: 회원 응답 = member_id, 비회원만 respondent_email). 행사 개인정보는 폼마다 목적·보관기간 고지 + 동의 버전 기록, 열기 전 서버가 확인

### 코어 프로그램 모듈 (2026-10-08 세션 163)

- 경쟁 PT 데이터는 `program_*` (brand_id='madleague'). 동아리는 `context.club_id` — 브랜드 전용 값은 컬럼 추가 대신 context
- 팀 구성 권한: 직원 · 자기 동아리 임원(club/임원 활성)만, 회차 status upcoming·ongoing일 때. 후보 = 그 해 현역·임원(context.year=회차 연도 또는 연도 없음)
- 참가자는 회차 방 첫 입장 때 MADLeague 참가 동의(`member_brand_joins` origin 'program', `program-2026-10-08`) — 동의 없이 브리프 안 보임
- 인증서 발급 가능: 회차 결과 공개(results_published_at) 또는 status=completed · 활동 인증서 = 연도별 현역 기록. 생년월일·대학·전공은 발급 시점 스냅샷 — 진위 확인 화면은 이름 마스킹만, 민감 필드를 select하지 않는다
- 동의 버전: 지원서(매드리거 등록) `2026-10-08.2`(하고 싶은 말 항목 추가) · 프로그램 참가 `program-2026-10-08`
- 지원서: '하고 싶은 말'(motivation, 전 유형) · 멘토는 소속 동아리 없음 허용

### 사이트 표기 (2026-10-08 세션 165)

- "지원하기" → **"매드리거 등록"** (사이트·인트라 메뉴명 모두). 헤더 메뉴: 매드리거 ▸ 매드리거 홈·동아리·매드리거 등록 / 프로그램 ▸ … RooKie·Planner's
- 경쟁 PT 페이지는 프로그램 탭 줄을 숨긴다(헤더 단독 메뉴) · 공개 페이지에 개인 이메일·카카오 링크 금지 → 문의하기 페이지로
- 푸터 4열: 참여(매드리거 등록·공식 동아리 신청·문의하기·마이페이지) · 채널(HeRo·RooK·Planner's — Planner's는 지금 MADLeague 프로그램 페이지로 연결, MyVerse로 보낼지 미결정)
- BI 세 원은 디자인 규칙(rounded 금지)의 예외 — BI 그림 자체

### 연계 프로그램 — 맛보기·정식·연계 (2026-10-09 사용자 결정)

- **텐원은 하나의 회사, 서비스만 다르다.** MADLeague는 HeRo·RooK·Planner's의 서비스를 대신 제공하지 않는다
  - ① **맛보기** — MADLeague 안에서 가볍게 (`partner.taste`)
  - ② **정식** — 같은 Ten:One ID로 그 서비스에 신청해 사용, 첫 이용 때 서비스 동의(`member_brand_joins`) (`partner.full`)
  - ③ **연계** — 서비스 간 경험·데이터는 서비스별 별도 동의로 이어져 풀 서비스·풀 데이터 (`partner.link`, 개인정보보호법 제18조)
- 연계 프로그램 = `programs-list.ts` `group: 'partner'` + `partner` 필드, 페이지는 `PartnerProgramPage`. 직접 운영 프로그램만 `glance`·`ProgramDetailPage`
- 실제 구현 (2026-10-09): 맛보기 = HIT 미니(`HitTaste`, 저장 없음) · 연계 = **서비스 간 연계 동의 코어**(`member_service_links` · `lib/service-links.ts` 레지스트리 · `ServiceLinkConsent` 카드 · `/api/universe/service-links`). 연계 페이지 "지금 연결하기"에 `partner.linkScopes` 카드 — live는 `madleague.certificates>hero.profile` 하나, 나머지는 "준비 중". 새 연계는 레지스트리에 추가 + 받는 서비스 API에서 `hasServiceLink()` 확인 후 원천 조회 (복사 금지)
- `mad_hero_applications` 테이블(0건)·인트라 `hero-applications` 화면·`/api/madleague/admin/hero`는 남아 있음 → DROP 승인 대기
- 직업소개 미신고 — "채용 연결·직접 매칭" 문구 금지 (직업안정법)

### 프로그램 상세 표준 (2026-10-08 세션 166)

- **새 프로그램·프로그램 수정은 `programs-list.ts` 한 곳** — 항목 추가 → 탭 줄·홈·전체 목록·About·검색·이전/다음에 자동 반영. `glance` 5개 키는 비우지 않는다 (사람들이 "누가·언제·얼마"를 못 찾는 게 가장 큰 이해 격차였다)
- 직접 운영 상세 page.tsx는 `ProgramDetailPage`에 steps·gets·자유 섹션만 넘긴다. 자체 히어로·자체 CTA를 만들지 않는다 (10개 중 6개가 스텁, CTA가 6가지였던 2026-10-08 이전 상태로 돌아가지 않기)
- 표기: 'DAM 파티'(댐 파티 ✗) · '히어로 프로그램'(히어로·HeRo 프로그램 ✗) · 'PJT'. 메뉴 레지스트리 라벨도 같게
- **히어로(상단)는 전부 programs-list에서** — eyebrow·제목·요약·`tagline`(한 줄, 강조색 굵게)·칩. 페이지별 히어로 카피·배경 사진 금지 (2026-10-09 통일 — 부제 스타일 4종·배경 사진이 섞여 있었다)
- 강조색: **레드 하나**. 예외는 히어로 프로그램 골드뿐(브랜드 가이드). 마케톤 골드·RooKie 그린·Planner's 틸은 폐지 (2026-10-09)
- 한눈에 보기 중 사실 확인 대기: 아이디어 무브먼트(연말 쇼케이스 운영 방식) · RooKie·Planner's(기수·비용 — 지금 "모집 공지 때 안내") · 경쟁 PT 회차 수(연 1~2회) · 인사이트 투어링 시기

### 경쟁 PT 인증서 규칙 (2026-10-09 사용자 결정 · 원본 = 구글 시트 "수료증 관리 대장")

- **참가 확인서(COA)**: 경쟁 PT에 참여한 모든 사람 · **수상 확인서(MCP)**: 본선에 오른 팀 중 수상 — 등수(1등·2등·3등·본선)별 리본 배경. 수상자는 참가 확인서도 함께
- 코드 = 대장 그대로 `{연도}-COA 000001` · `{연도}-MCP 000052` (연도별 일련번호, 가운데 공백 1칸) — `normalizeCertCode()`가 공백·대소문자 차이 흡수. 계정 발급분(`MAD26-XXXXXX`)과 공존
- 표기 날짜 = 대장 발급일 · 본문 = 대장 비고("리제로스 경쟁 PT") · 주최 = 비고에서 " 경쟁 PT" 뗀 이름 (샘플 이미지는 샘플일 뿐 — 대장이 SSOT)
- **인증서 받기는 로그인하게 하는 미끼** (2026-10-09 사용자 결정) — 비로그인은 가입·로그인 유도만. 본인 확인 통과 시 대장 인증서를 그 계정에 연결(`member_id` 설정, NULL인 것만 — 먼저 연결한 계정이 주인) + MADLeague 가입 기록(`member_brand_joins` origin `certificate`, 동의 `pt-cert-2026-10-09` — `features/madleague/pt-certificate-consent.ts`). 다음부터는 로그인만 하면 목록. 연결된 인증서는 HeRo 연계(`madleague.certificates>hero.profile`)에도 잡힌다
- **우선권 = 매드리거 등록 정보** (2026-10-09 사용자 결정): 등록 때 낸 이름+전화번호가 대장과 맞는 계정이 주인 — `lib/programs/ledger-match.ts` `linkLedgerByRegistration` (linked_by `registration`, 직접 확인 연결(manual)도 넘겨받음). 대장 전화번호는 원본 대신 `match_hash`(HMAC, env `CERT_MATCH_SECRET` — 바꾸면 해시 전부 재계산)만. 등록 정보를 인증서 찾기에 쓰는 건 목적 외라 화면에서 [필수] 동의 후 버튼(자동 연결 아님, 제18조)
- 등록 안 한 사람: 매드리거 등록 유도 + 직접 확인(이름+생년월일+대학, 먼저 연결한 계정, manual). 남이 먼저 연결했으면 안내 → 등록 정보로 찾기 또는 문의
- 보관·탈퇴: **`docs/Data_Lifecycle.md` §4 공통 정책을 따른다** (수료증 = 이름·발급일·인증코드만 보관, 식별 가능한 상태로 영구 보관 금지). 새 규칙을 따로 만들지 않는다 — 2026-10-09 기준을 안 보고 "생년월일까지 영구"로 정했다가 되돌림
- 화면 동의 문구에 "본인이 삭제를 요청하면…" 안내를 넣지 않는다 (2026-10-10 사용자 지시) — 삭제 요구 처리는 내부 기준(Data_Lifecycle)에만
- 본인 확인: 이름·생년월일 정확히 + 대학 느슨하게(공백·'대학교'/'대' 차이 흡수, 캠퍼스 표기 허용). 전공은 같은 사람도 표기가 달라 열쇠로 쓰지 않는다. 어느 항목이 틀렸는지 알려주지 않는다
- 새 회차: 대장에 행 추가 → 같은 방식으로 program_certificates INSERT (member_id NULL, cert_key `ledger:{코드}`, note '수료증 관리 대장'). 전화번호 제외
- 대장 데이터 확인 필요: 양우진·오희수 회차마다 생년월일 다름 (조회 시 그 회차 값과 맞아야 함) · 동아리 표기 혼재(ABC마케팅/ABC, 매드립/MADLeap) — 인증서에 그대로 찍힘

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
| **세션 162 완료** | madleague.net 프로그램 이전(경쟁 PT 명예의 전당·발표 장면·2026 1차 춤추는 고래·MAD Crown 표기 제거 · 크리에이지 신규 · 댐 파티+히스토리 · 아이디어 무브먼트·히어로 키비주얼 · 하위 메뉴 원본 이름) · 유니버스 공통 신청 폼(인트라 참가 신청·사이트 /forms·프로그램 자동 버튼) 코드 · 파비콘 |
| **세션 163 완료** | 신청 폼 DB 적용 · 매드리거 홈·자유 게시판·동아리 운영진(최대 5명·임기·위임) · 경쟁 PT 운영 전체(회차·팀·제출·회차 방·클라이언트·알림·결과→명예의 전당·포트폴리오) · **코어 프로그램 모듈 이전**(program_*) · 사이트 팀 구성·초대 링크·참가 동의 · 인증서 본인 발급·진위 확인·인트라 관리 · "함께하는 프로그램"(RooK·HeRo 회차 노출) |
| **세션 166 완료** | **프로그램 메뉴 정리** — 상세 표준 템플릿(`ProgramDetailPage` 7단)·CTA 통일(`ProgramCTA`)·SSOT 확장(`programs-list.ts` 4그룹·한눈에 보기)·전체 페이지 4그룹·홈 하드코딩 제거·탭 줄 SSOT·히어로 `/programs/hero`로 통일(옛 주소 308)·IM 에센스 흡수(`#essence`, 옛 주소 308)·DAM 파티 표기·개인 이메일·카카오 링크 삭제·`PracticeProgramPage`·`ProgramForms` 삭제 |
| **세션 165 완료** | 검색 복구 — 메뉴·MADzine·동아리·프로그램(programs-list)·경쟁 PT 회차 (`/api/search` SITE_SEARCHERS.madleague) · 보안 1단계(공개 프로필 이메일·포트폴리오 타 브랜드 이력 필터 등) · One ID SSO · 홈 히어로 카피·소개 · 매드리거 등록(이름·하고 싶은 말·멘토 무소속·로그인 모달 닫기) · 관심 산업/직무 선택지 수리 · 헤더 하위 메뉴(매드리거·프로그램) · 동아리 방(카페) · RooKie·Planner's 프로그램 · 홈 정비(공식 동아리·명예의 전당 삭제) · 푸터 4열 · 경쟁 PT 문구 · About 정비(아이콘·네 자리·프로그램·BI·담비) · 문의 유형 미리 선택 · 테스트 데이터: AD Zone 가상 회원 10명(`sql/test-data-madleague-adzone-demo.sql`, 사용자 "삭제" 시 정리 블록 실행) |
| **이월 작업** | ⓐ 배포 후 확인: 동아리 방 비직원 계정 입장·글쓰기 · 문의 유형 미리 선택 · About 담비 이미지 · ⓑ 테스트 가상 회원 10명 삭제(요청 시) · ⓒ 헬멧 엠블럼·담비 의상 5종 원본 파일 받으면 About에 · ⓓ 푸터 Planner's 연결처 결정 · ⓔ `ums_sites.is_open` 현재 true — 스테이징 비공개 의도면 false로 (site:check에서 확인, 세션 161 기록은 false) ·  ⓪ 배포 확인 → 옛 mad_competitions 계열·mad_certificates DROP(승인) · 처리방침에 신청·인증서 항목(10-14) · 비직원 계정 실검증(임원 팀 구성·초대 수락·참가자 회차 방) · 개인 모드 제출 · 데모 회차 삭제(요청 시) · DAM 폼 실제 제출 1건 · MAD Crown 남은 표기 결정 · 춤추는 고래 발표 사진 · ① 로그인 실검증: 지원→마이페이지 "심사 중"→회장 대기 목록→승인→capability 행 · 인트라 회원 관리(멘토 1명 표시)·문의하기 제출 1건 ② **기존 멘토 1명(lools, context에 club_id 없음) 담당 동아리 지정** — 없으면 어느 동아리 지원서도 못 봄 ③ 배포 후 공개 INSERT 정책 제거(`sql/security-open-insert-lockdown-3.sql` B: `mad_hero_insert`) ④ HeRo 신청 동의 보관기간("상담 종료 후 1년") 사용자 확인 ⑤ 기수 14건(archive) 근거 확인 후 복원 여부 ⑥ MADzine 서버 렌더(SEO) — DNS 전환 전 ⑦ DNS 전환 시 구 URL `/59/?bmode=view&idx=…` → `/madleague/madzine/mz-…` 308 ⑧ 동아리 로고 7종 · 소개 문구 ⑨ `mad_articles.author_name` 바이라인 표시 방식 결정 |
| **최근 결정** | 멘토 = club/멘토 · 기업 = showcase/host · MADzine 카테고리 원본 8종 · 이미지 자체 Storage 복사 · 작성자 이름·사진 공개 · 동아리 7개만 복원(소개 비움) |

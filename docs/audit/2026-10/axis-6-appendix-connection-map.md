# 축 6 부록 — 집중 브랜드 연결 지도 (TenOne · MADLeague · MADLeap · Badak · HeRo · RooK)

> 2026-10-08 · 축 6 감사자가 위임한 보조 조사(정적 grep, 읽기 전용)의 결과를 Opus가 정리·저장. 코드에서 확인한 사실만 적었다. 줄 번호는 커밋 1933d6e6 기준.
> 본문 [axis-6-cross-brand.md](axis-6-cross-brand.md)의 근거 자료. 새로 드러난 버그는 맨 아래 "부록에서 새로 나온 항목".

## 0. 도메인별 middleware 동작 (먼저 이해할 것)

- **브랜드 도메인** (hero.ne.kr · rook.co.kr · {madleague·madleap·badak}.tenone.biz): prefix로 시작하지 않는 경로는 `/{prefix}{경로}`로 rewrite (`middleware.ts:213-217, 271-279`). → 브랜드 사이트 안의 **상대경로 타 브랜드 링크**(예: hero.ne.kr의 `/badak`)는 `/hero/badak`이 되어 404.
- **rewrite 예외(skipPaths)**: `/login /signup /profile /privacy /terms /auth /api /intra` 등 (`middleware.ts:8, 267`).
- **www.tenone.biz `/{brand}/*`**: hero·rook(vercel) = 경로 유지 308 · madleague·madleap·badak(external) = 경로 버리고 공식 주소 **홈으로 302** (`middleware.ts:41-77`, `lib/domain-registry.ts:101-107`).
- 헬퍼 `brandSiteUrl`·`CANONICAL_HOSTS`는 브랜드 파일에서 쓰이지 않음 (인트라·middleware만).

## A. 브랜드 간 링크

### A-1. 브랜드 → 다른 집중 브랜드

| 파일:줄 | 출발 → 도착 | href | 형태 |
|---|---|---|---|
| `app/(HeRo)/hero/talent-agent/page.tsx:181·188·195` | HeRo → MADLeague·MADLeap·Badak | `/madleague` `/madleap` `/badak` | 상대 (브랜드 도메인에서 404) |
| `app/(Badak)/badak/about/page.tsx:258·259·261` | Badak → MADLeague·HeRo·TenOne | `https://madleague.net` `https://hero.ne.kr` `https://tenone.biz` | 절대 하드코딩 |
| `features/madleap/MadLeapFooter.tsx:24·25` | MADLeap → Badak·MADLeague | `https://badak.biz` `https://madleague.net` | 절대 하드코딩 |
| `features/hit/HitProfileBadge.tsx:108` 외 | HeRo 컴포넌트(전 브랜드 /my 삽입) | `/hero/hit` `/hero/hit/a·b` `/hero` `/hero/resume` `/hero/coaching` | 상대 |
| `features/hero/HeroBadgeOptIn.tsx:108` | HeRo 컴포넌트(TenOne /profile) | `/hero/hit/a` | 상대 |

- MADLeague·RooK → 다른 브랜드 링크 없음. `app/(MADLeague)/madleague/programs/hero/page.tsx:31,36`의 "HeRo 파트너 기업 우선 지원·매칭"은 **문구뿐 구현 없음**. `app/(Badak)/badak/hero/page.tsx`는 "준비 중" 플레이스홀더(들어오는 링크 없음).

### A-2. TenOne → 브랜드 (모두 상대 → www에서 external 브랜드는 홈 302로 경로 소실)

- `app/(TenOne)/universe/page.tsx:15/19/23/51` · `features/tenone/PublicFooter.tsx:15-21` · `lib/universe-map.ts:40-68`(about) · `lib/data.ts:47-151`(brands `websiteUrl`) · `components/UniverseProfile.tsx:216/222/1183/1203/1228`
- `lib/data.ts:469/473/493` about 연혁 = `http://badak.biz` 등 절대(http)

### A-3. 공용 헤더·푸터가 브랜드 사이트에 심는 링크

- `components/UniverseUtilityBar.tsx:14-35, 101-106, 246-249` WORK 드롭다운 = `user.affiliations` 기반 상대경로(`/badak/my` `/madleague/my` `/madleap/my` `/hero/journey` `/rook/my`). MADLeague만 `hideWorkspaces`. 나머지 브랜드 도메인에서 `/{prefix}/{other}/my`로 rewrite → 404
- `components/UniverseFooter.tsx:56-59` `/about /brands /universe` 상대 — 브랜드 도메인에서 `/about`은 브랜드 자기 about, **`/brands`·`/universe`는 5개 브랜드 모두 라우트 없음 → 404**

### A-4. TenOne 핵심 페이지로 가는 링크

- `components/MyProfileCard.tsx:91-93` 기본 `https://tenone.biz/profile[/@handle]` 절대 (6개 브랜드 모두 `universeProfileHref` 미전달) · `:118/122` 상대
- 로그인 `loginHref` 사용: MadLeagueHeader:106 · MadLeapHeader:105 · RooKHeader:98 · hero coaching/ai:312
- `/signup` 직접(헬퍼 없음): hero about:177 · hit/a/result/[id]:431,586 · journey/_landing:102(문구는 "로그인")
- **없는 경로**: 모바일 메뉴 "가입" → `/madleague/signup`(MadLeagueHeader:107) · `/madleap/signup`(MadLeapHeader:106) · `/rook/signup`(RooKHeader:99). signup 페이지는 `app/signup`·`app/(SmarComm)/smarcomm/signup`뿐. UtilityBar `signupPath` prop은 정의만 있고 미사용(:48,69)

## B. 브랜드 간 테이블·API 접근

### B-1. 다른 브랜드 전용 테이블

| 파일:줄 | 출발 | 테이블 | R/W |
|---|---|---|---|
| `lib/programs/brands.ts:16·90·91` | 코어 programs | mad_clubs · mad_applications | R (브랜드 훅 — 의도된 경유) |
| `lib/supabase/universe-profile.ts:74` | TenOne 프로필 | mad_applications(+mad_clubs) | R |
| `lib/supabase/universe-profile.ts:106·129` | TenOne 프로필 | badak_profiles · career_profiles (**`.eq('email')`**) | R |
| `features/hit/HitProfileBadge.tsx:61/81` | HeRo 컴포넌트 → 전 브랜드 /my | hit_a_results / hit_b_results | R |
| `features/hero/HeroBadgeOptIn.tsx:40,48,57` | HeRo 컴포넌트 → TenOne /profile | hero_profiles · hit_a_results · hit_hero_types | R |
| `lib/supabase/universe-profile.ts:174` | TenOne | `fetch('/api/badak/my/groups')` | R |

- 각 브랜드 파일 안에서 다른 브랜드 전용 테이블 직접 `.from()` 없음, `fetch('/api/<다른 브랜드>')` 없음. `/api/madleague/hero`는 `mad_hero_applications`(MADLeague 테이블)에 INSERT.

### B-2. 코어 테이블 접근 요약

- **MADLeague**: members R 다수 · W `api/madleague/member/profile:54` · member_roles R(admin/clubs) · member_capability_roles R/W(`lib/madleague-roles.ts`) · program_* R(pt·archive·clubs·madleaguer·portfolio·member/projects) · forms R · contact(`madleague_inquiry`)
- **MADLeap**: 코어 직접 접근 없음 (`madleap_portfolios`·`madleap_study_programs`만)
- **Badak**: members R 다수 · W `api/badak/member/onboard:17,76`·`member:19` (**affiliations에 'badak' 추가**) · contact_submissions R/W(`api/badak/inquiries`) · wio_talk_* R
- **HeRo**: members R(journey) · W `HeroBadgeOptIn:86`(privacy_settings) · uc_transactions R · coaching_waitlist W
- **RooK**: ums_boards/ums_posts R(`lib/supabase/rook.ts`) · contact(`rook_inquiry`·`rook_rookie`)
- **코어 programs**: member_brand_joins R/W(`lib/programs/consent.ts`) · member_capability_roles R · program_* · ums_sites · notifications

## C. 다른 브랜드 활동으로 상태·혜택을 판단하는 코드

| 파일:줄 | 판단 | 교차 여부 |
|---|---|---|
| `features/hit/HitProfileBadge.tsx:45-58,102` | `respectOptIn`이면 `privacy_settings.hero_badge_public !== true`일 때 숨김 | HeRo 결과를 다른 브랜드 /my에 (opt-in ✅) |
| `components/UniverseUtilityBar.tsx:101-106` | `user.affiliations`로 WORK 드롭다운 | 전 브랜드 소속을 각 헤더에 노출 |
| `app/api/badak/members/[id]/route.ts:41-44,82` | affiliations에 'badak' 없으면 404 · 응답에 **전체 affiliations 배열** | 다른 브랜드 소속까지 응답에 포함 (렌더 코드는 못 찾음) |
| `lib/programs/brands.ts` 훅 | 전부 `round.brand_id`(주인) 기준, 창구 기준 아님 | MADLeague 창구의 HeRo·RooK 회차는 MADLeague 임원 팀 구성 권한 없음 (`officerGroupIds` → `[]`) |
| `app/api/programs/rounds/[id]/apply/route.ts:55-78` | channel 기록, 동의는 주인 브랜드 | MADLeague 창구에서 HeRo 회차 신청 → `member_brand_joins(hero, origin=program)` ✅ |
| `lib/programs/access.ts:35-39` | 클라이언트 판정 showcase/host + context.round_id | brand_id 필터 없음 |

### C-2. `program_rounds.channels` 사용처

- `features/programs/ProgramBoard.tsx:31-35,58,69` channels ⊇ [site] + brands 필터 · `madleague/programs/page.tsx:90` brands=['rook','hero'] · hero/rook 화면은 자기 브랜드만
- `madleague/pt/page.tsx:167-182` · `lib/supabase/madleague.ts:112` channels ⊇ ['madleague'], brand 필터 없음
- `madleague/madleaguer/page.tsx:63-67` · `api/madleague/member/projects:29-36` 참가 이력 = channels.includes('madleague')
- **`madleague/member/portfolio/page.tsx:55-70` · `api/madleague/portfolio/[memberId]/route.ts:41-62` = `program_participants.member_id`만으로 팀·결과 조회 — brand_id·channels 필터 없음 → HeRo·RooK 참가 이력이 MADLeague 포트폴리오(공개 포함)에 섞임**. 인증서만 `.eq('brand_id','madleague')`
- `lib/programs/paths.ts:16-18` 회차 방 = 주인 브랜드 창구, `PROGRAM_ROOM_BASE` = madleague/rook/hero

## D. Universe 프로필과 각 브랜드 /my

### D-1. `lib/supabase/universe-profile.ts`

- `getAllServiceProfiles`(:150) 사용처 = `components/UniverseProfile.tsx:399` 하나. 공개 뷰에서도 publicData.email/id로 호출, 브라우저 클라이언트라 RLS에 의존
- `getBadakProfile`(:104)·`getHeroProfile`(:127) = **email 매칭** (축1 H-2)
- `getPublicProfile`·`joinService`·`leaveService`(:210/222/236) 사용처 없음
- UniverseProfile 사용처 = `app/(TenOne)/profile/page.tsx:28`, `profile/[handle]/page.tsx:116`

### D-2. UniverseProfile이 보여주는 다른 브랜드 정보

- `DEFAULT_PRIVACY`(:307-310) hero/badak/madleague/madleap/youinone = true → **opt-out**
- HeRo 섹션(:1162-1190) `career_profiles` 필드 + `/hero` 링크. **`heroType`(:657)은 `'영웅 유형'|'HIT 유형'` 키를 찾는데 getHeroProfile은 '희망 직무/희망 산업군/스킬'만 만듦 → 항상 null**
- Badak 경력(:1056-1059) `ps.badak !== false`면 공개 · Badak 활동(:1193)·Capability(:1252)·서비스 카드(:1322-1346) 소유자만
- `bannerChips`(:663-667) 계산만, 렌더 안 함
- `profile/[handle]` = `get_public_profile` RPC(:29,:50) — **publicData에 email·affiliations·privacy_settings 포함**(:82-98)
- HeRo 공개 설정 2벌: UniverseProfile `privacySettings.hero`(opt-out) ↔ `hero_badge_public`(opt-in, HeroBadgeOptIn:7-8,44,84). 배지 조회 경로도 2벌(hero_profiles 경유 vs hit_a_results.member_id 직접)

### D-3. 각 브랜드 /my

| 페이지 | MyProfileCard 색 | siteBadge | HitProfileBadge | CapabilitySection |
|---|---|---|---|---|
| TenOne `my/page.tsx:75` | #171717 | 없음 | respectOptIn, 카드 아래 | tenone (posts fetch에 author 필터 없음 :40) |
| MADLeague `my/page.tsx:121-150` | #EC1D25 | 역할 라벨(멘토/회장/기업/매드리거) | respectOptIn | 없음 |
| MADLeap `my/page.tsx:44` | #7C3AED (**LoginModal #00B8FF** :28) | "MADLeap OB" 고정 | respectOptIn | madleap (posts author 필터 없음 :24) |
| Badak `my/page.tsx:1556-1579` | #ffd93d | 바닥장일 때만 | respectOptIn | badak **#D32F2F** |
| HeRo `my/page.tsx:74` | #E53935 | 없음 | respectOptIn 없음(자기 브랜드라 항상) | hero + MatchingInbox |
| RooK `my/page.tsx:44` | #00d255 | 없음 | respectOptIn | rook |

- CapabilitySection은 자기 브랜드만 조회 (`components/CapabilitySection.tsx:42`)
- HitProfileBadge 링크는 상대 → 브랜드 도메인에서 `/{prefix}/hero/hit` 404

## 부록에서 새로 나온 항목 (README 작업 순서에 반영)

| # | 문제 | 근거 | 심각도 | 해결안 |
|---|---|---|---|---|
| A6-1 | 모바일 메뉴 "가입" 404 | MadLeagueHeader:107 · MadLeapHeader:106 · RooKHeader:99 | M | `loginHref(pathname, "signup")` (skipPaths `/signup`) |
| A6-2 | **MADLeague 포트폴리오에 타 브랜드 참가 이력 혼입(공개 포함)** — 동의 없는 교차 노출(데이터 계약 4조) | member/portfolio:55-70 · api/madleague/portfolio/[memberId]:41-62 | H | `program_rounds.brand_id='madleague'` 또는 `channels ⊇ ['madleague']` 필터 (madleaguer·member/projects와 같은 기준) |
| A6-3 | 유니버스 프로필 heroType 항상 null · HeRo 공개 설정 2벌(opt-out vs opt-in) | UniverseProfile:657 · universe-profile.ts:141-145 · HeroBadgeOptIn | M | 공개 설정을 `hero_badge_public`(opt-in) 하나로, heroType은 hit 결과에서 |
| A6-4 | `get_public_profile`이 email·affiliations 반환 | profile/[handle]/page.tsx:82-98 | H | RPC 반환 컬럼에서 email·affiliations·privacy_settings 제거 (축3 확인 필요 항목 확정) |
| A6-5 | UniverseFooter `/brands`·`/universe`, WORK 드롭다운, HitProfileBadge 상대 링크가 브랜드 도메인에서 404 | 위 A-3·D-3 | H | 축6 H-2 교차 링크 헬퍼로 한 번에 |
| A6-6 | /my 색·배지 불일치 (MADLeap LoginModal #00B8FF, Badak Capability #D32F2F) · TenOne·MADLeap /my posts에 author 필터 없음(남의 글 표시 가능) | D-3 표 | M | 브랜드 색 단일화(축2 H-4)와 함께 · author 필터 추가 |

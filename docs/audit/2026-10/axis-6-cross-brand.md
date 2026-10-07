# 축 6 — 브랜드 간 연결 점검 (2026-10-08, Fable)

> 범위: 루트 CLAUDE.md §0.1(원칙 1·3·4·7, 데이터 계약 3·4조)·§1.2·§1.3·§1.3.1·§1.9.2·§1.9.4 + `docs/Program_Module.md` 기준. 집중 브랜드(TenOne·MADLeague·MADLeap·Badak·HeRo·RooK) 코드(`app/(Brand)`·`features/{brand}`·`app/api/{brand}`·`lib/programs`·공통 컴포넌트·`middleware.ts`) grep + 운영 DB(`ziotlxkdctlhiwkgmmsh`) `member_capability_roles`·`member_brand_joins`·`brand_capabilities`·`program_*`·`ums_sites`·`sso_tokens` **집계만**(개인정보 값 미조회). 축 1~5에 있는 항목은 "축N X-n 참조"로만 적는다 — 이 축은 **연결 구조와 사용자 여정** 관점이다.

## 요약

- 브랜드 간 연결의 **코어 장치는 갖춰져 있다**: 프로그램 모듈(`channels` + 주인 브랜드 동의 `recordProgramConsent`), capability 모델, UC, 알림(`notifications`), HeRo→유니버스 배지 opt-in(`members.privacy_settings`). 이 중 프로그램 모듈과 배지 opt-in은 원칙(코어 경유·본인 동의)을 그대로 구현한 **좋은 예**다.
- 그러나 **실제로 연결된 여정은 거의 없다**: DB 기준 `program_rounds` 4건 전부 `channels=[madleague]`(창구 교차 0), `member_capability_roles` 활성 3행(madleague 멘토 1·jakka 2), `member_brand_joins` 10행 전부 `origin='admin'`(가입·프로그램 경로로 생긴 동의 0). MADLeague → MADLeap → HeRo → Badak 순환은 코드 어디에도 "다음 단계로 이어주는" 지점이 없다 — MADLeap은 `mad_*`·capability와 전혀 연결되지 않고, HeRo 프로그램 지원은 MADLeague 테이블(`mad_hero_applications`)에 갇혀 HeRo 사이트가 볼 수 없다.
- **이동이 끊긴다**: 독립 도메인(hero.ne.kr·rook.co.kr·madleague.net…)은 세션 쿠키가 호스트 전용이고, SSO는 `/login` 페이지에서만 발사되는데 그 흐름 자체가 `safeRedirect()`에 막혀 성립하지 않는다(브랜드 표준인 LoginModal은 SSO를 모른다). 공통 컴포넌트가 내보내는 **상대 경로 교차 링크**(워크스페이스 `/badak/my`, 알림 `/rook/projects/{id}`, 푸터 `/brands`·`/universe`, HeRo 오디션장 `/madleague`)는 독립 도메인에서 middleware prefix rewrite에 걸려 404가 된다.
- 원칙 7(유니버스 비강조)은 HeRo·MADLeap·Badak 본문에서 어긋나고, 반대로 일관돼야 할 브랜드 첫 진입 동의 게이트·브랜드별 탈퇴는 **어느 브랜드에도 없다**.
- **심각도별 개수**: Critical 0 · High 5 · Medium 7 · Low 5 (총 17)

## 연결 지도

> 방식: 링크 / 데이터 / 상태 판단 / 코어 모듈. 코어 경유 = members.id·공통 API·뷰·레지스트리로만 연결되는가(계약 3조). 동의 = 교차 노출·이용에 본인 동의가 있는가(계약 4조·원칙 7).

| # | 출발 → 도착 | 방식 (근거) | 코어 경유 | 동의 | 판정 |
|---|---|---|---|---|---|
| 1 | MADLeague → RooK·HeRo | 프로그램 창구: `app/(MADLeague)/madleague/programs/page.tsx:90` `<ProgramBoard brands={['rook','hero']}>` → `program_rounds.channels` (`features/programs/ProgramBoard.tsx:33`) · 신청 시 주인 브랜드 동의 `lib/programs/consent.ts:21-34` | ✅ 코어(`program_*`) | ✅ 주인 브랜드 `member_brand_joins` 기록 | **양호(설계)** — 단 DB `channels` 교차 회차 0건, `program_applications` 0건이라 미검증 |
| 2 | 모든 창구 → 회원 | 프로그램 알림 `notify(... link: programRoomPath(round))` (`app/api/intra/programs/rounds/[id]/route.ts:195,221,237`, `app/api/programs/{invite,notices,qna,teams,works,submission}`) → 유틸리티 바 🔔 `components/UniverseUtilityBar.tsx:312-314` `href={n.href}` 그대로 | ✅ 코어(`notifications`) | 본인 알림 | ❌ **H-2** — 주인 브랜드 상대 경로(`/rook/projects/{id}`)가 다른 독립 도메인에서 404 |
| 3 | MADLeague → HeRo | `/madleague/hero` 페이지 + `mad_hero_applications` (`app/api/madleague/hero/route.ts`) — HeRo 사이트·`program_applications`로 연결 안 됨, hero.ne.kr 링크 0건 | ❌ MADLeague 테이블이 HeRo 지원서 소유 | `mad_applications.consent` 자체 기록 | ❌ **H-3** (테이블 설계는 축1 H-3 참조) |
| 4 | MADLeague ↔ MADLeap | 코드·테이블 공유 0 — MADLeap은 `madleap_study_programs`·`madleap_portfolios`만(`app/api/madleap/*`) · `brand_capabilities(madleap, club)` 등록돼 있으나 쓰는 코드 0 · `app/(MADLeap)/madleap/my/page.tsx:44` `siteBadge="MADLeap OB"` 전원 하드코딩 | — | — | ❌ **H-3** 여정 단절 |
| 5 | HeRo → Badak / Badak → HeRo | 상태 판단·데이터·링크 0건(`grep from('hero_\|badak_')` 교차 0) | — | — | 단절(연결 없음) |
| 6 | HeRo → 유니버스(TenOne 프로필) | `features/hero/HeroBadgeOptIn.tsx:82-86` `members.privacy_settings` opt-in(기본 false) ← 소비 `app/(TenOne)/profile/page.tsx:37` | ✅ `members` | ✅ opt-in | **양호(모범)** — 단 HeRo 사이트 안에는 토글 없음(TenOne 프로필에서만) |
| 7 | 전 브랜드 → 유니버스 프로필 | `components/UniverseProfile.tsx:399,442` `getAllServiceProfiles(email)`·`getCapabilityAggregation` → 서비스 현황·capability 섹션 | ✅ | opt-out(`privacySettings`, 축1 M-6) | ⚠️ 축1 H-2(email 키라 Badak·HeRo 항상 null)·M-6 참조 |
| 8 | 전 브랜드 마이페이지 → TenOne | `components/MyProfileCard.tsx:90-93,160-171` "Universe Profile · tenone.biz/profile/@handle" 절대 링크 — 집중 5브랜드 모두 `universeProfileHref` 미지정 | ✅ | — | ⚠️ **M-4** 원칙 7 경계 |
| 9 | 전 브랜드 헤더 → 다른 브랜드 워크스페이스 | `UniverseUtilityBar.tsx:14-35` `WORKSPACE_REGISTRY` 상대 경로(`/badak/my`…) × `user.affiliations` (`:101-106`) | ⚠️ affiliations(축1 H-1) | — | ❌ **H-2** 독립 도메인에서 404 · RooK 설명 "독서 모임" 오기(축2 H-4) |
| 10 | 전 브랜드 푸터 → TenOne | `components/UniverseFooter.tsx:55-60` Universe 컬럼 `https://tenone.biz`·`/about`·`/brands`·`/universe` + `:116` 태그라인 링크(숨김 불가) | ✅ 레지스트리 | — | ❌ **H-2**(`/brands`·`/universe` 404) · 원칙 7 허용 범위 |
| 11 | Badak → MADLeague·HeRo·YouInOne·TenOne | `app/(Badak)/badak/about/page.tsx:255-265` 자체 "Footer" 섹션 절대 링크(`https://madleague.net`, `https://hero.ne.kr` — CANONICAL은 `www.`) | ❌ 손으로 적은 도메인 | — | ⚠️ **M-1** 원칙 4·7, 푸터 중복 |
| 12 | HeRo → MADLeague·MADLeap·Badak·Jakka·MoNTZ·ChangeUp | `app/(HeRo)/hero/talent-agent/page.tsx:163-239` "Universe Stages" 브랜드 카드 `/madleague`·`/badak`… 상대 링크 | ❌ | — | ❌ **H-2**(hero.ne.kr에서 `/hero/madleague` 404) · **M-2** 원칙 7 |
| 13 | MADLeap → Badak·MADLeague | `features/madleap/MadLeapFooter.tsx:22-26` 커스텀 "Universe" 컬럼(`https://badak.biz`, `https://madleague.net`) + 홈 Partners "Ten:One Universe — 인큐베이팅"(`app/(MADLeap)/madleap/page.tsx:47,238-253`) | ❌ 손으로 적은 도메인 | — | ⚠️ **M-1·M-2** |
| 14 | 브랜드 → UC(공통 지갑) | `earnUC` 호출 `app/api/badak/*`·`app/api/hero/*`, `uc_balances` brand_id NULL 공통 | ✅ 코어 | 정책상 공통 | 양호 |
| 15 | 독립 도메인 ↔ tenone.biz 세션 | `lib/domain-registry.ts:156-159` `getCookieDomain` → tenone 계열만 `.tenone.biz`, 외부 도메인은 host-only · SSO `app/api/sso/{initiate,exchange}` ← 발사 지점은 `app/login/page.tsx:407-417`뿐, `lib/sso.ts` import 0 · `sso_tokens` 5행 전부 `used=false` | ✅ 코어 | — | ❌ **H-1** |
| 16 | 가입 사이트 → 다른 브랜드 첫 진입 | DB 트리거 `fn_auto_member_brand_join`(members INSERT 시 `origin_site` 브랜드 1건만) · 브랜드 `/my`는 `LoginModal`/`AuthGate`만(동의 게이트 없음) · `member_brand_joins` 10행 전부 origin `admin` | — | ❌ 두 번째 브랜드부터 동의 없음 | ❌ **H-4** (기록 경로 부재는 축1 H-5 참조) |
| 17 | 브랜드 탈퇴·종료 → 다른 브랜드 | `member_brand_withdrawals` 쓰기 코드 0건(읽기: `lib/site-status.ts`, 인트라 2곳) · `withdrawn_at` 설정 코드 0 · `valid_until` 종료는 프로그램 클라이언트(`app/api/intra/programs/rounds/[id]/route.ts:242`)·YouInOne뿐 · 계정 탈퇴 버튼 `components/MyProfileCard.tsx:174-180`만 | — | — | ❌ **H-5** |

## 발견 사항

### [H-1] 독립 도메인 사이 로그인이 이어지지 않는다 — 쿠키 host-only + SSO는 `/login`에서만, 그마저 `safeRedirect`가 끊음
- 근거: `lib/domain-registry.ts:156-159` `getCookieDomain` = tenone 계열만 `.tenone.biz`(외부 도메인 `undefined`) · `lib/supabase/client.ts:17-19` 동일 · SSO 발사 지점은 `app/login/page.tsx:407-417`(`https://tenone.biz/api/sso/initiate` 하드코딩, 세션당 1회)뿐이고 `lib/sso.ts`는 import 0건 · 브랜드 표준 로그인 `components/LoginModal.tsx`·`lib/auth-context.tsx`(소셜 `redirectTo = ${origin}/auth/callback`)에는 sso 참조 0 · `app/api/sso/initiate/route.ts:52-57` 세션 없으면 `https://tenone.biz/login?redirect=<initiate 절대 URL>`로 보내는데 `app/login/page.tsx:19-26` `safeRedirect()`가 `https://`를 `/`로 치환 → 로그인 뒤 initiate로 돌아오지 못함 · DB `sso_tokens` 5행 전부 `used=false`(교환 완료 흔적 0) · `app/auth/session/route.ts:3-7` `[DEPRECATED] Direct Supabase OAuth per domain`.
- 영향: MADLeague(madleague.net)에서 로그인한 회원이 "함께하는 프로그램" 카드로 RooK·HeRo에 가면 **다시 로그인**해야 한다(원칙 1 "계정은 하나"의 체감이 깨짐). 반대로 "브랜드에서 tenone.biz로 튕기지 않는다"(§1.2.1)는 지켜지고 있다 — 콜백·`loginHref`·`auth_redirect` 전부 현재 호스트 기준(`app/auth/callback/page.tsx:38-51`). 즉 **복귀는 되지만 이동이 안 된다**.
- 해결안: 두 길 중 하나를 정한다. (A) **SSO 폐기 명시** — "독립 도메인은 각자 로그인(소셜 1클릭)"을 §1.2에 적고 `app/api/sso/*`·`lib/sso.ts`·`sso_tokens`·`app/login/page.tsx:395-422` 삭제(축3 H-5·M-8 open-redirect·평문 토큰도 같이 사라짐). (B) **SSO 복구** — LoginModal 열기 전에 `isExternalDomain()`이면 `auth.tenone.biz/api/sso/initiate`로 한 번 시도(실패 시 모달), initiate의 redirect를 `safeRedirect` 화이트리스트(`/api/sso/initiate` 상대 경로)로, exchange 후 토큰 DELETE. 어느 쪽이든 `https://tenone.biz` 하드코딩은 `INTERNAL_DOMAINS`(`auth.tenone.biz`) 파생으로.
- 작업량: S(A) / M(B) · 확신도: 높음(코드) — 실브라우저 미검증

### [H-2] 공통 컴포넌트가 내보내는 교차 브랜드 링크가 전부 상대 경로 — 독립 도메인에서 prefix rewrite에 걸려 404
- 근거: `middleware.ts:213-218,271-272` 독립 도메인은 `domainPrefixMap[host]` prefix로 시작하지 않는 경로를 `${prefix}${pathname}`으로 rewrite(skipPaths `:8` = intra·api·auth·login·signup·reset-password·profile·privacy·terms만 예외). 상대 교차 링크를 내는 곳: ① `UniverseUtilityBar.tsx:14-35` `WORKSPACE_REGISTRY` `/badak/my`·`/madleague/my`… ② `UniverseUtilityBar.tsx:312-314` 알림 `href={n.href}` ← `lib/programs/paths.ts:12-19` `programRoomPath` = 주인 브랜드 base(`/rook/projects/{id}`) ③ `UniverseFooter.tsx:57-59` `/about`·`/brands`·`/universe`(집중 5브랜드에 `brands`·`universe` 라우트 없음) ④ `app/(HeRo)/hero/talent-agent/page.tsx:181-216` `/madleague`·`/madleap`·`/badak`·`/jakka`·`/montz`·`/changeup`. 예: hero.ne.kr에서 Badak 워크스페이스 클릭 → `/hero/badak/my` 404; madleague.net 회원이 RooK 회차 알림 클릭 → `/madleague/rook/projects/{id}` 404. `brandSiteUrl()`(`lib/domain-registry.ts:115-121`)은 인트라(`components/intra/programs/ProgramEditor.tsx:112`)만 쓴다.
- 영향: 유니버스 연결의 **유일한 공용 통로**(워크스페이스·알림·푸터)가 www.tenone.biz와 localhost에서만 동작한다. 원칙 4("`tenone.biz/{brand}` 경로를 외부에 노출하지 않는다")를 지키려 공식 도메인으로 갈수록 연결이 끊긴다. HeRo는 공개 운영 중이라 지금 실제로 404.
- 해결안: 교차 브랜드 href를 만드는 함수를 하나로 — `lib/domain-registry.ts`에 `crossBrandHref(siteId, path, currentHost)`(같은 사이트면 상대, 아니면 `brandSiteUrl`; external 브랜드는 스테이징·비공개면 링크 숨김) 추가. 적용: `WORKSPACE_REGISTRY` 렌더, 알림은 **저장 시** `link`를 `{brand_id, path}`로 두고 렌더 때 변환(또는 `/api/notifications`가 변환), `UniverseFooter` Universe 컬럼은 `https://www.tenone.biz/{about,brands,universe}` 절대 경로, HeRo 오디션장 카드는 M-2와 함께 정리. `scripts/site-check.mjs`에 "브랜드 그룹 파일의 `href="/{다른 brand}/…"`" 검사 추가.
- 작업량: M · 확신도: 높음(middleware 정적 판단) — 실접속 미검증

### [H-3] 의도된 순환(MADLeague → MADLeap → HeRo → Badak)이 코드에 없다 — 브랜드 활동이 다음 브랜드로 이어지는 지점 0
- 근거(여정 단계별):
  - **MADLeague → MADLeap**: 공개 사이트 공유 코드·테이블 0. MADLeap은 `madleap_study_programs`·`madleap_portfolios`만 admin client로 읽고(`app/(MADLeap)/madleap/{study-room,portfolio}/page.tsx`, `app/api/madleap` 없음), `brand_capabilities(madleap, club)`은 등록돼 있으나 `member_capability_roles`에 madleap 행을 만드는 코드 0. `app/(MADLeap)/madleap/my/page.tsx:44` `siteBadge="MADLeap OB"` 하드코딩. 가입 입구 `/madleap/apply`는 `madleap/about/page.tsx:166`·`study-room/page.tsx:107`이 링크하지만 **페이지가 없다**. 반면 **인트라**는 MADLeap을 MADLeague 동아리 하나로 다룬다 — `app/intra/ums/madleap/{page,applications/page}.tsx:15-22` `/api/madleague/admin/applications?club=madleap`(`mad_applications` × `mad_clubs.slug='madleap'`). 즉 "독립 브랜드(사이트·CLAUDE.md·ums_sites focus)"와 "MADLeague 동아리(인트라·DB)" 두 정체성이 공존.
  - **MADLeague → HeRo**: HeRo 커리어 프로그램이 `app/(MADLeague)/madleague/hero/page.tsx`(hero.ne.kr 링크 0)와 `mad_hero_applications`(MADLeague 소유, 축1 H-3)에 있고, HeRo 쪽 `app/(HeRo)/hero/programs/page.tsx:22`는 `brands={["hero"]}` 코어 모듈만 본다 → 같은 프로그램이 두 체계. Program_Module §1은 "HeRo 프로그램 주인 hero · 창구 hero, madleague"로 설계했지만 DB 회차 0건.
  - **HeRo → Badak / Badak → HeRo**: 상태 판단·링크·데이터 0(`career_profiles`·`badak_profiles` 상호 조회 없음). HeRo 공개 노출은 `HeroBadgeOptIn`(TenOne 프로필) 1곳.
  - **집계 지점**: `member_capability_roles` 활성 3행 · `member_brand_joins` 10행 전부 `origin='admin'` · `program_applications` 0 · `program_certificates` 0 → 여정 데이터가 사실상 없다. 유니버스 프로필의 서비스 현황은 축1 H-2(email 키)로 Badak·HeRo가 항상 비어 보인다.
- 영향: "쓰다 보면 자연스럽게 알게 된다"(원칙 7)가 성립하려면 적어도 한 브랜드의 활동이 다른 브랜드 혜택·추천으로 이어져야 하는데, 현재는 **같은 ID로 로그인된다는 사실 외에 연결이 없다**. 반대로 연결을 급히 만들면 계약 4조(별도 동의) 위반이 생기기 쉬운 상태(동의 장치 H-4 부재).
- 해결안(동의가 먼저, 연결은 다음): ① HeRo 프로그램을 코어 `program_rounds(brand_id='hero', channels=['hero','madleague'])`로 옮기고 `/madleague/hero`를 `ProgramBoard brands={['hero']}`로 교체(`mad_hero_applications` 폐기) — Program_Module 설계를 그대로 실행. ② MADLeap: `club` capability 행을 실제로 쓰는 단일 지점(가입 승인 API)을 만들고 `siteBadge`를 역할에서 파생(MADLeague `roleLabel` 패턴 `app/(MADLeague)/madleague/my/page.tsx:121`). ③ 교차 혜택(예: MADLeague OB → HeRo 프로그램 우선 선발, Badak 모임 할인)은 **주인 브랜드 신청 시점**에 "MADLeague 활동 이력을 HeRo 선발에 활용" 동의 체크를 `member_brand_joins.consent`(jsonb)에 버전으로 기록한 뒤 `member_capability_roles`를 읽는다 — 읽는 쪽은 항상 코어 함수(`lib/supabase/capabilities.ts hasBrandCapability`)만.
- 작업량: M(①②) / L(③) · 확신도: 높음(현황) / 설계는 제안

### [H-4] 브랜드 "첫 진입 동의" 게이트가 어느 브랜드에도 없다 — 두 번째 브랜드부터 동의 없이 이용
- 근거: 원칙 1 "브랜드 첫 진입 시 해당 브랜드 약관 동의(`member_brand_joins`)". 실제 쓰기 경로: DB 트리거 `fn_auto_member_brand_join`(members INSERT 시 `origin_site` 1개 브랜드, `terms_version` 없음)·`fn_newsletter_auto_brand_join`·`lib/programs/consent.ts`(프로그램 신청 시)뿐. 집중 5브랜드 `/my`는 `LoginModal`(MADLeague·Badak·HeRo·RooK·MADLeap 전부)로 로그인만 확인하고 브랜드 가입·동의를 묻지 않는다(`components/AuthGate.tsx`도 동일). `components/ConsentGate.tsx`는 **계정** 동의(`members.consent`) 1회. DB `member_brand_joins` 10행 전부 `origin='admin'` — 사용자 행동으로 생긴 브랜드 동의 0.
- 영향: tenone.biz에서 가입한 회원이 hero.ne.kr에 로그인하면 HeRo 동의 없이 HIT·매칭을 쓴다(계약 4조). 탈퇴 "이 브랜드만"(H-5)·브랜드 회원 수(§1.9.5)·Badak 9,000명 재가입이 모두 이 기록을 전제로 한다. 기록 경로 부재 자체는 축1 H-5 참조 — 여기서는 **"어디서 받을지"가 정해지지 않은 것**을 짚는다.
- 해결안: `components/BrandJoinGate.tsx`(공통) — `useSite()`의 siteId로 `member_brand_joins(withdrawn_at null, terms_version 있음)` 확인, 없으면 현재 페이지 위에 브랜드 약관 동의 모달(`SignupConsent` 재사용, `brand_terms_version`은 `ums_sites`에 컬럼 추가) → `POST /api/brands/{brand}/join`(`recordProgramConsent`를 `lib/brand-consent.ts`로 승격, 축1 H-5 해결안과 동일 함수). 각 브랜드 `/my`·신청·결제 진입점에서 `AuthGate` 안에 끼운다. 트리거 `fn_auto_member_brand_join`은 `terms_version`을 `members.consent.terms_version`으로 채우도록 보강.
- 작업량: M · 확신도: 높음

### [H-5] "이 브랜드만 탈퇴"·브랜드 종료 시 다른 브랜드에 남는 연결을 정리하는 코드가 없다
- 근거: `member_brand_withdrawals`에 INSERT하는 코드 0건(읽기만: `lib/site-status.ts`, `app/intra/ums/rook/members/page.tsx`, 인트라 standard) · `member_brand_joins.withdrawn_at`을 설정하는 코드 0(`recordProgramConsent`가 재가입 시 `null`로 되돌리기만) · `member_capability_roles.valid_until` 종료는 운영진 교체(`lib/madleague-roles.ts:182`)·프로그램 클라이언트 해제(`app/api/intra/programs/rounds/[id]/route.ts:242`)·YouInOne 인트라뿐, `revokeCapabilityRole`(`lib/supabase/capabilities.ts:158-165`)·`leaveService`(`universe-profile.ts:236-245`, affiliations 제거)는 호출처 0 · UI는 계정 전체 탈퇴 버튼(`components/MyProfileCard.tsx:69-85,174-180`)만, 집중 6브랜드 `/my`에 "이 브랜드만 탈퇴" 0 · **계정 탈퇴 `app/api/account/delete/route.ts:19-33`** = `members` 익명화(name·email·phone·handle) + `auth.admin.deleteUser` — `member_brand_joins`·`member_brand_withdrawals`·`privacy_deletion_requests`·`member_capability_roles`·`program_participants`·`program_certificates`·브랜드 프로필·`ums_posts`·`notifications`·`uc_*` 어느 것도 건드리지 않으며, `docs/Data_Lifecycle.md:59`(requests 기록 → members 삭제 cascade, auth는 Dashboard에서 수동)·부록 A("auth.users DELETE 금지")와 정반대 · 브랜드 종료 시 교차 노출을 끄는 필터: `WORKSPACE_REGISTRY`·`UniverseFooter`·`ProgramBoard`·`UniverseProfile`·`middleware` 어느 곳도 `ums_sites.lifecycle/sunset_at`을 보지 않는다(`is_open`은 `SiteClosedOverlay`·검색·`UniverseProfile`만) · 약관 `app/(TenOne)/terms/page.tsx:80-83`·방침 `privacy/page.tsx:97`은 "이 서비스만 탈퇴"를 이미 사용자에게 약속 · `app/intra/ums/sites/status/page.tsx:17` 라벨 키 `sunset/closed` ↔ DB 제약 `sunsetting/archived`(`sql/service-lifecycle.sql:27`) 불일치.
- 영향: 원칙 1("탈퇴는 이 서비스만 / 계정 전체 구분")·계약 5조가 UI·API 어디에도 구현되지 않았고, 약관은 없는 기능을 약속한다. 계정 탈퇴는 `members`만 지우고 브랜드 활동·프로그램·인증서·UC가 고아로 남는다(인증서 snapshot은 익명화 대상 — Data_Lifecycle 3.2.2). 브랜드를 종료(§0.1 절차 ⑤)해도 워크스페이스 드롭다운·푸터·프로그램 창구에 그 브랜드가 계속 뜬다. 지금은 회원 5명·종료 브랜드 0이라 피해 없음.
- 해결안: ① `POST /api/brands/{brand}/withdraw`(`requireMember`) — `member_brand_withdrawals` INSERT(scope='brand') → `member_brand_joins.withdrawn_at` → 그 브랜드 `member_capability_roles.valid_until=now()` → `program_participants` 이후 회차 제외 → `members.affiliations`에서 제거 → 브랜드별 처리(`docs/Data_Lifecycle.md` 표)를 호출하는 **코어 함수 1개**(`lib/brand-withdraw.ts`); 계정 전체 탈퇴(`/api/account/delete`)는 같은 함수를 전 브랜드에 돌린 뒤 `privacy_deletion_requests` 기록 → 문서와 코드 중 하나로 통일(auth 삭제 주체 결정). UI는 `MyProfileCard`에 `siteId` prop을 받아 "이 브랜드만 탈퇴 / 계정 전체 탈퇴" 2버튼. ② 브랜드 종료 전파: `lib/use-site-tiers.ts`(이미 DB tier 읽음)를 `lifecycle`까지 읽게 확장해 `WORKSPACE_REGISTRY` 렌더·`UniverseFooter` Universe 컬럼·`ProgramBoard`(주인 브랜드 `is_open`·lifecycle)·`UniverseProfile` 서비스 현황의 공통 필터로. 라벨 키(`sunset/closed`)를 DB 값에 맞춤.
- 작업량: M · 확신도: 높음

### Medium

| ID | 내용 (근거 → 영향 → 해결) | 작업량 |
|---|---|---|
| M-1 | **브랜드가 손으로 적은 교차 도메인**: `app/(Badak)/badak/about/page.tsx:255-265`(`https://madleague.net`·`https://hero.ne.kr`·`https://youinone.com`·`https://tenone.biz` — CANONICAL은 `www.madleague.net`·`www.hero.ne.kr`, MADLeague·YouInOne은 external/보관이라 가면 옛 사이트) · `features/madleap/MadLeapFooter.tsx:22-26`(`https://badak.biz`·`https://madleague.net`) → 원칙 4 위반(공식 주소 아님) + §1.9.4 "자체 푸터 금지"(Badak about은 UniverseFooter 밖 두 번째 푸터). 둘 다 삭제하고 `UniverseFooter` 자동 Universe 컬럼(H-2 수정 후)에 맡긴다. 축2 H-4(브랜드 레지스트리 10곳) 참조 | S |
| M-2 | **원칙 7 위반 — 브랜드 본문의 유니버스 강조**: HeRo `app/(HeRo)/hero/talent-agent/page.tsx:163-239` "Universe Stages · HeRo의 유니버스가 만들고 있는 오디션장 · Ten:One 유니버스의 다양한 무대"(브랜드 카드 6개) · `hero/journey/_landing.tsx:49,62` "Universe의 자원이 당신의 무기" · `hero/about/page.tsx:41,148` 파트너 "Ten:One Universe (Parent)" · HIT 리포트 6종 푸터·워터마크 "Ten:One Universe"(`hero/hit/{a..f}/report/[id]/page.tsx`) · MADLeap `madleap/page.tsx:47,238-253` Partners "Ten:One Universe — 인큐베이팅" · Badak `badak/onboard/page.tsx:240` "tenone.biz/profile/@{handle} 로 공개돼요" → "운영사로만 드러난다"(§0.1)와 어긋남. HeRo 오디션장은 **"HeRo가 발굴한 인재가 설 무대"로 브랜드 관점에서 다시 쓰되 링크는 H-2 헬퍼로**, 리포트는 운영사 표기(`COMPANY_INFO`) 한 줄로, Badak 온보딩 문구는 핸들 공개 범위를 Badak 프로필 기준으로 | S |
| M-3 | **OG `siteName: 'Ten:One™ Universe'`** 집중 5브랜드 layout(`app/(MADLeague)/layout.tsx:17` 등) — CLAUDE.md §1.1 표준 패턴이 그렇게 지시하지만, 공유 카드에 브랜드 대신 유니버스가 뜬다(원칙 7과 §1.1이 충돌) → 사용자 결정: `siteName = db?.name ?? site.name`으로 바꾸고 §1.1 패턴 수정, 또는 현행 유지 명시 | S |
| M-4 | **MyProfileCard "Universe Profile" 카드가 전 브랜드 마이페이지 상단 고정**(`components/MyProfileCard.tsx:160-171`, `https://tenone.biz/profile/@handle` 절대 링크, 집중 5브랜드 모두 `universeProfileHref` 미지정) + 핸들 링크 `/profile/@handle`(`:117-125`)은 skipPaths라 브랜드 도메인에서 TenOne 프로필 페이지가 **브랜드 헤더 없이** 렌더 → 원칙 7 "프로필·여정은 일관되게"에는 맞지만 노출 강도가 높다. 카드 문구를 "프로필 · 전체 서비스"로 낮추고 링크는 `https://www.tenone.biz/profile/…`(canonical) 하나로, 브랜드 호스트의 `/profile`은 www로 308(middleware skipPaths에서 제외) | S |
| M-5 | **프로필·여정 표준의 브랜드별 편차**: `siteBadge` — MADLeague는 capability 파생(`madleague/my/page.tsx:121 roleLabel`), Badak은 `badak_members` 자체 컬럼(`:1556 isLeader`, 축1 C-2), MADLeap은 상수, HeRo·RooK·TenOne은 없음 · capability 라벨 2벌(축2 M-3) · `getCapabilityAggregation`은 TenOne 프로필만 쓰고 브랜드 `/my`는 자기 브랜드 역할도 capability로 안 보여줌(RooK·HeRo) → `siteBadge`를 `hasBrandCapability`/`member_capability_roles` 파생으로 통일하는 공통 훅 `useBrandRole(siteId)` 1개 | S |
| M-6 | **`features/programs/ProgramBoard.tsx` 창구 노출이 주인 브랜드 상태를 보지 않음**: `:31-37` `channels ∋ site AND status in (upcoming, ongoing)`만 — 주인 브랜드가 `is_open=false`(현재 hero·badak·madleap)·external 스테이징이어도 다른 창구에 노출되고 신청 가능(`app/api/programs/rounds/[id]/apply/route.ts:16`도 미확인) → 원칙 6(비공개 스테이징 브랜드를 공개 사이트에서 노출) 위반 가능. 회차 조회에 `ums_sites(slug=brand_id).is_open` 조인 또는 인트라 "사이트에서 신청 받기" 토글 시 경고 | S |
| M-7 | **알림이 유니버스 전체 공통 벨 하나**(`/api/notifications` member_id 기준, brand_id 필터 없음, `UniverseUtilityBar.tsx:177-201`) — 본인 알림이라 동의 문제는 없으나, Badak은 별도 `badak_notifications`(`app/api/badak/*` 14곳)를 쓰고 `UniverseUtilityBar`는 그것을 모른다(축2 M-6 알림 6종 참조) → 브랜드 알림은 코어 `notify()`로만 쓰고 벨은 `brand_id` 배지·현재 사이트 우선 정렬 | S |

### Low

| ID | 내용 | 작업량 |
|---|---|---|
| L-1 | `lib/programs/paths.ts:33-35` `PROGRAM_PUBLIC_PATHS`에 madleague만 — RooK·HeRo 회차 결과 발표 시 `/rook/projects`·`/hero/programs` revalidate 안 됨(ISR 캐시 동안 옛 목록) | S |
| L-2 | `WORKSPACE_REGISTRY` `hero → /hero/journey`·`smarcomm → /dashboard`(prefix 없음) 등 실존·분기 미확인(축4 L-8) · `rook` 설명 "독서 모임"(축2 H-4) | S |
| L-3 | `components/UniverseUtilityBar.tsx:430` 검색 오버레이 섹션 제목 "Ten:One Universe"가 전 브랜드 고정 — 원칙 7 경계. "다른 서비스"로 | S |
| L-4 | 공용 기능 중복 현황(집중 브랜드): 신청서 — MADLeague `mad_applications`(동아리 가입, 브랜드 고유 ✅ 유지)·`mad_hero_applications`(`app/api/madleague/hero/route.ts:50`) ↔ HeRo `hero_talent_applications`(`app/api/hero/talent-agent/apply/route.ts:18`) **같은 일을 두 브랜드가 두 번**(→ 코어 `program_applications`, H-3)·Badak `badak_leader_applications`(코어 후보 — "브랜드 역할 신청") · 문의 — MADLeague·RooK·TenOne `/api/contact` ✅, Badak은 테이블만 코어(`app/api/badak/inquiries/route.ts:36` 별도 API), HeRo·MADLeap은 폼 없이 mailto, `hero_business_inquiries` 코드 0(축5) · 게시판 — RooK·MADLeap·HeRo·TenOne `ums_posts` ✅, MADLeague `mad_posts/mad_articles`(자체 `CommentSection.tsx` — 코어와 동명)·Badak `badak_community_posts`(댓글·좋아요·조회 3종씩 중복, 축2 M-6) · 알림 — Badak `badak_notifications`(insert 10곳) ↔ 코어 `notifications`(M-7); MADLeague·HeRo·RooK 브랜드 API는 `notify` 0(프로그램 모듈만) · 인증서 — 집중 3브랜드 코어 `program_certificates` ✅, MADLeap 화면 없음(`LEAP` 접두어만) · 프로그램 — MADLeap `madleap_study_programs`는 `program_rounds(kind=course)` 흡수 후보 · 뉴스레터·폼·UC — 전부 코어 ✅(`forms`는 MADLeague만 사용, `earnUC`는 Badak·HeRo만 호출, MADLeague·RooK·MADLeap 0). **코어로 끌어올릴 것**: 역할 신청(`brand_membership_applications` 0행 활용 또는 `program_applications` 확장), 브랜드 알림, 브랜드 문의 폼 1개. **브랜드에 남길 것**: 동아리·모임·매칭·HIT 등 서비스 본체 | — |
| L-5 | `app/(MADLeap)/madleap/my/page.tsx:24` "내 게시글"이 `/api/board/posts?site=madleap` 전체(작성자 필터 없음) · `app/(TenOne)/my/page.tsx:40` 동일 — HeRo `hero/my/page.tsx:27`만 `author_id` 전달. 여정 일관성(마이페이지 표준) 편차 | S |

## 이상적 연결 구조 제안

```
                 ┌──────────── 코어 (Ten:One ID 한 벌) ────────────┐
                 │ members.id · member_brand_joins(브랜드 동의/탈퇴)  │
                 │ member_capability_roles(여정) · uc_* · notifications│
                 │ program_*(주인 brand_id + channels) · forms ·       │
                 │ contact_submissions · privacy_settings(교차 노출 동의)│
                 └──────┬───────────────┬───────────────┬────────────┘
      코어 API·훅만      │               │               │
  ┌────────────┐  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐
  │ MADLeague  │  │  MADLeap   │  │   HeRo     │  │   Badak    │ … RooK
  │ 동아리·PT   │  │ 학생 교육   │  │ 커리어·매칭 │  │ 기획자 모임 │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        └──── 창구(channels) ── 다른 브랜드 프로그램을 자기 화면에서 신청, 동의는 주인 브랜드 ───┘
  교차 노출(프로필·배지·혜택) = privacy_settings / member_brand_joins.consent 의 본인 동의 항목이 있을 때만
  이동 = crossBrandHref(공식 주소) · 세션 = 도메인별 로그인(또는 복구된 SSO) · 종료·탈퇴 = 코어 함수 1개가 전파
```

**지금과의 차이**: 코어 장치(프로그램 모듈·capability·배지 opt-in)는 있으나 ① 이동 통로가 상대 경로(H-2)·세션 단절(H-1), ② 브랜드 진입 동의·브랜드 탈퇴가 없어 "동의 있을 때만 노출"의 전제가 비어 있음(H-4·H-5), ③ MADLeap·HeRo 프로그램이 코어 밖(H-3).

**단계별 이행**
1. **통로 복구 (S~M, 이번 달)** — `crossBrandHref` 헬퍼 + 워크스페이스·알림·푸터·HeRo 카드 적용(H-2) · SSO 폐기 또는 복구 결정(H-1) · 손으로 적은 교차 도메인 삭제(M-1) · 원칙 7 문구 정리(M-2·M-3·M-4).
2. **동의·탈퇴 코어 (M, Badak·MADLeap 오픈 전)** — `lib/brand-consent.ts`(축1 H-5와 동일) + `BrandJoinGate`(H-4) · `lib/brand-withdraw.ts` + 마이페이지 2버튼(H-5) · 종료 브랜드 필터(H-5 ②) · `ProgramBoard` 주인 브랜드 공개 상태 확인(M-6).
3. **여정 연결 (M~L, 동의 장치 이후)** — HeRo 프로그램을 코어 회차로(H-3 ①) · MADLeap `club` 역할 실제 발급 + siteBadge 파생(H-3 ②·M-5) · 교차 혜택은 주인 브랜드 신청 시 동의 항목으로(H-3 ③) · 브랜드 알림·역할 신청 코어 흡수(M-7·L-4).

## 먼저 고칠 순서 (상위 5개)

1. **H-2 교차 링크 헬퍼** — HeRo(공개 운영)에서 지금 404가 나는 유일한 항목. 함수 1개 + 적용 4곳.
2. **H-1 SSO 결정** — 폐기면 축3 H-5·M-8 보안 항목까지 같이 사라지고(코드 삭제), 복구면 LoginModal에 1단계 추가. 어느 쪽이든 "독립 도메인 간 세션" 원칙을 §1.2에 명문화.
3. **H-4 BrandJoinGate** — 축1 H-5(기록 경로)와 한 세트. Badak 재가입·MADLeap 오픈·브랜드 회원 수·탈퇴 전부의 전제.
4. **H-5 브랜드 탈퇴 코어 함수 + 종료 필터** — 회원 5명·종료 0인 지금이 가장 싸다. Data_Lifecycle 표를 코드로.
5. **H-3 ① HeRo 프로그램 코어 이전** — Program_Module §1 설계대로 회차 1건 만들어 `channels=['hero','madleague']` 교차 창구를 실제로 검증(현재 0건이라 설계만 있음).

## 확인 필요

- SSO를 살릴 의도가 있는지(H-1) — `sso_tokens` 5행이 테스트 잔재인지, 축3 M-8 처리와 함께 결정.
- 독립 도메인에서 `/brands`·`/universe`·`/badak/my` 상대 링크가 실제 404인지 — middleware 정적 판단(`:272` rewrite). `preview_start`로 `hero.tenone.biz` 또는 호스트 헤더로 1회 확인 권고.
- OG `siteName` 유니버스 표기(M-3)와 MyProfileCard "Universe Profile" 카드(M-4)가 원칙 7의 의도된 예외인지.
- MADLeap의 여정 위치 — "MADLeague 현역의 교육 과정"인지 별도 학생 커뮤니티인지에 따라 H-3 ②(club 역할 공유 vs 독립)가 달라진다.
- HeRo 오디션장 카드(M-2)가 제거 대상인지 "HeRo 관점 문구"로 유지할지.
- `badak_notifications` 14곳을 코어 `notify()`로 바꿀지(M-7) — Badak 재설계(§0.1 새로 제작) 범위에 포함.

## 점검 범위·한계

- 집중 브랜드 6개의 그룹·features·api 디렉터리와 공통 컴포넌트(UtilityBar·Footer·MyProfileCard·LoginModal·UniverseProfile)·`lib/programs`·`middleware.ts`·`domain-registry`·`sso`만 읽었다. 실험·보관 브랜드의 교차 링크는 agent grep 목록(`features/*/Footer` `tenone.biz/contact` 등)만 집계.
- 교차 링크·테이블 접근은 문자열 grep(`href`·`from('…')`·도메인 문자열) 기준 — 동적 조립 경로·RPC는 누락 가능.
- DB는 집계(count·distinct)만 조회. 회원 행·프로필 값은 보지 않았다.
- 브라우저 실접속 0회 — 404·세션 단절·SSO 실패는 전부 코드·middleware 정적 판단.
- MADLeap 페이지 본문·HeRo 매칭 로직·Badak 커뮤니티 로직은 "다른 브랜드를 참조하는가"만 확인했고 기능 자체는 평가하지 않았다.
- 교차 브랜드 **법적** 판단(제18조 목적 외 이용)은 일반 원칙 수준 — H-3 ③ 혜택 연동은 출시 전 법률 검토 대상.

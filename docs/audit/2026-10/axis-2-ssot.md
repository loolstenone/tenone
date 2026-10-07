# 축 2 — SSOT 중복 점검 (2026-10-08, Fable)

> 범위: 루트 CLAUDE.md §1.1·§1.9.1~1.9.5·§1.10·§2.4~2.5 기준 "같은 사실이 두 곳 이상에 손으로 적힌 곳". 코드 grep + 운영 DB(`ziotlxkdctlhiwkgmmsh`) `ums_sites`·`brand_capabilities`·테이블 목록·행 수 조회(SELECT만, 개인정보 값 미조회). 축 1 보고서(`axis-1-data-contract.md`)에 있는 항목은 "축1 X-n 참조"로만 적는다.
> 집중 브랜드(TenOne·인트라·MADLeague·MADLeap·Badak·HeRo·RooK)와 코어 상세, 실험·보관은 개수 위주.

## 요약

- CLAUDE.md가 SSOT로 선언한 파일(`domain-registry`·`brand-site-menus`·`site-status`·`action-hub-registry`·`company-info`)은 **존재하고 잘 만들어져 있으나, 선언 이전에 만들어진 복제본이 그대로 살아 있다.** 도메인 맵 3벌, 브랜드 이름·컬러 레지스트리 10곳 이상, 산업군·직무군 목록 4벌+DB 2종, 사이트 메뉴는 집중 5브랜드 중 2곳만 레지스트리 사용.
- 가장 위험한 것은 **"있다고 믿는 테이블이 DB에 없는" 코드 경로**(`posts`·`badak_posts`·`subscriptions` — 공용 게시판 API 7개·검색·구독 화면이 항상 실패)와 **브랜드 식별자 자체가 두 벌**(`0gamja` ↔ `ogamja`)인 것. RooK 인트라 0건 사고(2026-10-07)와 같은 유형이 아직 남아 있다.
- 중복 테이블은 세대교체(옛 generic → 브랜드별 → 코어 모듈)가 끝나지 않아 알림 6종·인증서 3종·경쟁 3종·프로필 5종이 공존하며, 대부분 0행이라 지금 정리하면 비용이 가장 싸다.
- **심각도별 개수**: Critical 0 · High 7 · Medium 10 · Low 6 (총 23)

## 발견 사항

### [H-1] 도메인·사이트 매핑이 3벌 — `domain-registry` · `site-config.domainMap` · `site-context.pathSiteMap` 이 서로 다르다
- 원천이어야 할 곳: `lib/domain-registry.ts` (§1.1 "도메인 SSOT — middleware/server/callback/sso 전부 이 파일을 import").
- 중복된 곳: `lib/site-config.ts:599-637` `domainMap`(손으로 적은 38건) · `lib/site-context.tsx:28-47` `pathSiteMap`(18건) · `lib/site-context.tsx:52-55` 클라이언트 감지가 `domainMap`을 씀(registry 아님). `domain-registry.ts:4` 주석 "site-config.ts 양쪽에서 import"는 사실이 아니다(site-config는 registry를 import하지 않음 — grep 확인).
- 실제 불일치(확인분):

| 항목 | domain-registry (middleware) | site-config domainMap (클라이언트 useSite) | pathSiteMap (localhost) | DB ums_sites.domain |
|---|---|---|---|---|
| `planners.tenone.biz` | → `/myverse` · siteId **myverse** | → **planners** | `/planners` 없음 | planners.tenone.biz |
| `brandgravity.tenone.biz` | siteId **tenone** (prefix 때문, `SITE_DOMAIN_OVERRIDES`로 땜질) | **brandgravity** | 있음 | brandgravity.tenone.biz |
| `seoul360.net`, `domo.ne.kr`, `myverse.kr` | 있음 | **없음** (useSite → tenone) | — | seoul360.tenone.biz / domo.tenone.biz / myverse.tenone.biz |
| `hero/mindle/0gamja/fwn/wio/changeup/badak.tenone.biz` | 있음 | 없음(서브도메인 regex로 구제) | — | — |
| `dokdae/evschool/namingfactory.tenone.biz` | **없음** (middleware가 prefix 리라이트 못 함 → 서브도메인이 TenOne 루트 페이지를 그대로 서빙) | 있음 | 있음 | 있음 |
| `luki.tenone.biz`, `trendhunter.tenone.biz` | 없음 | 없음 | luki 없음 | **DB에만** 있음 (`luki` lifecycle=frozen, `trendhunter`는 코드 어디에도 없음) |
| 경로 분기 `/luki /seoul360 /fwn /montz /mullaesian /townity /naturebox /jakka /0gamja /planners` | — | — | **없음** (10개) — CLAUDE.md §1.1 표는 전부 있다고 적음 | — |

- 영향: 같은 URL에서 서버(middleware)와 클라이언트(`useSite`)가 다른 siteId를 본다 → 로그인 모달 accent·`origin_site` 동의 기록·검색 라벨·Analytics `brand_id`가 어긋난다. localhost에서 `/jakka`·`/townity` 등은 `useSite()`가 tenone으로 남아 브랜드 분기 코드가 동작하지 않는다(§1.1 "로그인 디버깅 반복 실수" 원인).
- 해결안: `domainMap`을 삭제하고 `export const domainMap = domainSiteMap`(registry 파생)으로 교체. `pathSiteMap`은 `prefixToSiteId`에서 파생(`Object.entries(prefixToSiteId)`), `/mlp` 같은 별칭만 예외 목록으로. `dokdae/evschool/namingfactory` registry 등록, `luki`·`trendhunter`는 DB row 처리 결정(보관 종료 절차 ⑤). 끝으로 CLAUDE.md §1.1 표를 registry에서 생성한 표로 교체.
- 작업량: S (코드) + S (문서)
- 확신도: 높음

### [H-2] 집중 브랜드 5곳 중 3곳(Badak·HeRo·MADLeap)이 `brand-site-menus` 미등록 — 헤더 nav·인트라 메뉴·`siteConfigs.nav` 3벌
- 원천이어야 할 곳: `lib/brand-site-menus.ts` (§1.9.5 "집중 브랜드는 반드시 등록", "사이트 헤더는 siteHeaderNav로 렌더").
- 중복된 곳: `features/badak/BadakHeader.tsx:15-22` · `features/hero/HeRoHeader.tsx:14-21` · `features/madleap/MadLeapHeader.tsx:13-18` 자체 `navItems` 하드코딩 · `lib/intra-nav.ts:230-300` Badak·HeRo·MADLeap 인트라 children 손으로 작성(사이트 메뉴명과 다름: 사이트 "모임 / 바닥장 신청 / 니즈 탐색" ↔ 인트라 "모임 관리 / 바닥장 심사 / 니즈 관리", 사이트 "HIT 검사 / 써치 라이트" ↔ 인트라 "HIT 현황 / TIH 요청") · `lib/site-config.ts` 19개 브랜드의 `nav: [...]` 배열 — **소비자 없음**(`site.nav` grep 0건, 죽은 복제본). DB `ums_sites.tier`: badak·hero·madleap·madleague·rook = focus(5곳) 중 레지스트리는 rook·madleague 2곳.
- 영향: `npm run site:check -- badak|hero|madleap`은 이미 ❌(집중 브랜드 미등록)로 떨어지고(HeRo CLAUDE.md:558에 "결정 대기"로 기록), 통합 관리 › 사이트 현황에 세 브랜드가 "메뉴 매핑 없음"으로 뜬다. 인트라 이름이 사이트와 달라 §1.9.5 "이름은 사이트 표기 그대로" 위반. `siteConfigs.nav`는 누군가 고쳐도 아무 데도 반영되지 않는 함정.
- 해결안: ① Badak·HeRo·MADLeap `BRAND_SITE_MENUS` 등록(헤더 navItems를 그대로 옮기고 adminHref 매핑) → 헤더는 `siteHeaderNav(siteId)`, intra-nav children은 `brandAdminChildren(siteId, extra)`로 교체(MADLeague·RooK 패턴). ② `SiteConfig.nav` 필드와 19개 배열 삭제. ③ `scripts/site-check.mjs`에 "헤더가 siteHeaderNav를 import하는지" 검사 추가.
- 작업량: M
- 확신도: 높음

### [H-3] 코드가 읽는 테이블이 DB에 없음 — `posts`(공용 게시판 API 7개) · `badak_posts`(검색) · `subscriptions`(회원 API·구독 화면)
- 원천이어야 할 곳: `ums_posts`/`ums_boards`(통합 게시판, DB 114행) · `wio_subscriptions`+`wio_subscription_plans`(§1.10 원칙 1).
- 중복된 곳: `lib/supabase/board.ts:175,234,525,548,578` `from('posts')` — `app/api/board/{posts,posts/[id],comments,like,bookmark,tags,configs}/route.ts` 7개가 이 모듈 사용 · `lib/supabase/townity.ts:16-62` + `app/intra/ums/townity/community/page.tsx:15` `posts` · `app/api/search/route.ts:45` `badak_posts` · `app/api/intra/members/route.ts:34`·`app/intra/ums/commerce/subscriptions/page.tsx:52` `subscriptions`. DB `information_schema.tables`에 `posts`·`badak_posts`·`subscriptions` **없음**(확인). 같은 `board.ts`가 `ums_boards`(84·103·126행)는 쓰면서 글은 `posts`를 본다.
- 영향: `/api/board/*` 호출·Townity 커뮤니티·검색의 Badak 글·통합 회원 목록의 구독 열·commerce 구독 화면이 항상 에러/빈 값. RooK 인트라 0건 사고(§1.9.5 ❌ 항목)와 동일 유형. `board.ts`의 컬럼(`site, board, guest_nickname, represent_image…`)은 외부 서버 옛 스키마로 보인다.
- 해결안: `board.ts`·`townity.ts`를 `ums_posts`(site_id·board_id FK) 기준으로 재작성하거나, 쓰는 곳이 없으면 7개 API와 함께 삭제. `api/search`는 `ums_posts` + `badak_community_posts`로. `subscriptions` 2곳은 `wio_subscriptions`로. 점검기: `scripts/`에 "코드 `.from('x')` 테이블명 ∩ DB 테이블 목록" 자동 대조 추가(이번 감사에서 수동으로 한 것).
- 작업량: M
- 확신도: 높음

### [H-4] 브랜드 이름·컬러·설명 레지스트리가 10곳 이상 — 같은 브랜드가 곳마다 다른 이름·색
- 원천이어야 할 곳: `lib/site-config.ts` `siteConfigs[id].name/colors` + DB `ums_sites.name` (§1.1 "인트라 저장 → ums_sites → getSiteConfigServer").
- 중복된 곳(확인): `components/UniverseUtilityBar.tsx:15-33` `WORKSPACE_REGISTRY` label/description · `components/UCBalanceCard.tsx:33-39` `BRAND_LABELS` · `lib/wio/people/PublicProfile.tsx:52-63` `DEFAULT_BRAND_LABELS` · `app/intra/ums/members/list/page.tsx:21-30` `BRAND_LABEL` · `lib/brand-meta.ts` `BRAND_META`(12개, 소비자 없음 — grep 0건) · `lib/data.ts:24` `brands[]` Mock(퍼블릭 `/about`·`/brands`·`/history`와 인트라 studio 8화면이 이걸 표시) · `app/(TenOne)/universe/page.tsx:40-60` 브랜드 카드 · `app/api/analytics/sync/route.ts:14` `BRAND_DIMENSION_VALUES`(존재하지 않는 `scribble`·`korea360` 포함) · DB `brands` 테이블 29행(`app/intra/studio/brands/page.tsx`·`lib/supabase/erp.ts`·`tenone.ts`가 읽음) · DB `bums_sites` 6행 · `wio_holding_brands` 0행 · 각 헤더 `accentColor="#…"` 하드코딩.
- 실제 어긋남: 이름 — seoul360 `Seoul/360°`(siteConfigs) / `Korea360`(ums_sites) / `Seoul360`(members list·WORKSPACE); myverse `Myverse` / `My Universe`(DB); ogamja `공감자` / `0gamja`; madleague `MAD League` / `MADLeague`(UC·members·brand-meta). 컬러 — MADLeague 헤더 `#EC1D25`(`MadLeagueHeader.tsx:73`) vs siteConfigs `#D32F2F`(`site-config.ts:135`) vs brand-meta `#6366F1`; Badak 헤더 `#1a1a2e` vs siteConfigs `#2563EB`; HeRo 헤더 `#E53935` vs siteConfigs `#F59E0B`. 설명 — `WORKSPACE_REGISTRY` rook "독서 모임"(실제 RooK = Works·Artist 크리에이티브), hero path `/hero/journey`.
- 영향: 인트라 사이트 목록 색 점(`sites/list/page.tsx:272` `site.colors.primary`)과 실제 사이트 색이 다르다. UC 거래 원장·공개 프로필·워크스페이스 드롭다운이 같은 브랜드를 다른 이름으로 부른다. 브랜드 개명·종료 시 10곳을 찾아 고쳐야 하고 하나는 반드시 빠진다.
- 해결안: ① 이름·컬러는 `siteConfigs`를 유일한 코드 원천으로 — `BRAND_LABELS`류는 `siteConfigs[id].name`으로 치환, 헤더 `accentColor={siteConfigs.xxx.colors.primary}`. ② `WORKSPACE_REGISTRY`는 `path·description`만 남기고 label은 siteConfigs에서. ③ `lib/brand-meta.ts`·DB `brands`(용도 없으면)·`bums_sites`·`wio_holding_brands` 정리 — `brands`는 `ums_sites`와 1:1이면 뷰로. ④ `lib/data.ts brands` Mock은 퍼블릭 페이지에서 `ums_sites`(ISR)로. ⑤ 인트라 저장 시 `ums_sites.name`이 바뀌면 siteConfigs도 따라오게 `getSiteConfigServer` 우선 사용 원칙을 유지하되 siteConfigs name을 "코드 기본값"으로 명시.
- 작업량: M
- 확신도: 높음 (DB `brands` 실제 용도는 확인 필요)

### [H-5] 산업군·직무군 목록이 코드 4벌 + DB 2종 — Badak 가입 화면은 유니버스 분류와 다른 값을 저장
- 원천이어야 할 곳: DB `taxonomies`(68행, kind=job_function·industry·job_level, 인트라 `/intra/ums/standard/taxonomies`에서 관리) → `lib/supabase/taxonomies.ts`. CLAUDE.md §1.3은 `lib/badak-constants.ts`를 원천이라 적음(문서도 둘).
- 중복된 곳: `lib/badak-constants.ts:3-45`(42·30개) ≡ `lib/supabase/taxonomies.ts:92-117` `*_FALLBACK`(글자까지 동일 복제) · `app/(Badak)/badak/my/page.tsx:98-110`·`app/(Badak)/badak/onboard/page.tsx:12-25` **다른 목록**(18·20개, 예 `광고/에이전시`·`AE/광고기획`·`CRM/그로스` — 유니버스 목록에 없는 값) · `app/(BrandGravity)/brandgravity/apply/page.tsx:14` `industries` · DB `hit_industries`(16)·`hit_job_functions`(21) HeRo HIT 전용.
- 영향: Badak 회원이 고른 `badak_profiles.industry/job_function` 값이 `taxonomies`와 불일치 → `UniverseProfile`·HeRo 매칭·인트라 세그먼트에서 같은 사람의 산업군이 다르게 집계. Badak 9,000명 재가입(§0.1) 전에 맞추지 않으면 데이터가 영구히 두 체계.
- 해결안: Badak my/onboard·BrandGravity apply를 `/api/taxonomies`(또는 `getTaxonomies()`)로 교체. `badak-constants.ts`는 `taxonomies.ts` FALLBACK을 re-export하는 한 줄로 축소(또는 삭제). `hit_*`는 HIT 검사 전용이면 `taxonomies`에 kind를 추가하거나 "HIT 전용 분류"로 문서화. CLAUDE.md §1.3 표의 원천을 `lib/supabase/taxonomies.ts`로 수정.
- 작업량: S
- 확신도: 높음

### [H-6] `app/sitemap.ts`·`public/robots.txt` 정적 하드코딩 — 공식 주소 원칙(§0.1 원칙 4)과 리다이렉트 테이블에 반함
- 원천이어야 할 곳: `lib/domain-registry.ts` CANONICAL_HOSTS + `ums_sites.is_open/hosting` + `brand-site-menus`.
- 중복된 곳: `app/sitemap.ts` 56개 URL을 `https://www.tenone.biz/{brand}/…`로 손으로 나열 — `next.config.ts` redirects가 이미 치운 `/madleague/program`·`/madleague/idea-movement`, middleware가 308하는 `/planners`, external 브랜드라 302로 홈으로 보내는 `/badak/*`·`/madleap`, `is_open=false` 사이트 전부 포함. `public/robots.txt` 단일 파일이 전 도메인(rook.co.kr·hero.ne.kr 포함)에서 `Sitemap: https://www.tenone.biz/sitemap.xml`을 가리킴.
- 영향: 검색엔진에 `tenone.biz/{brand}` 경로를 공식처럼 제출(원칙 4 "외부에 노출하지 않는다" 위반), rook.co.kr·hero.ne.kr은 자기 sitemap이 없음. 외부 서버 브랜드 경로는 302 → 소프트 404 누적.
- 해결안: `sitemap.ts`를 호스트별 동적 생성으로 — `headers().get('host')`로 siteId 판별 → `CANONICAL_HOSTS[siteId].host` 기준, `brand-site-menus`의 header 메뉴 path + `ums_sites.is_open=true`인 사이트만. `robots.ts`(동적)로 교체해 호스트별 Sitemap·external 스테이징 Disallow. site-check `--live`에 sitemap 200·호스트 일치 검사 추가.
- 작업량: M
- 확신도: 높음

### [H-7] 브랜드 식별자 두 벌 — DB `0gamja` vs 코드 `ogamja` (§1.10 원칙 7 위반)
- 원천이어야 할 곳: `SiteIdentifier`(`lib/site-config.ts:3`) = `ums_sites.slug` 1:1.
- 중복된 곳: DB `ums_sites.slug='0gamja'`, `brand_capabilities.brand_id='ogamja'`(ums_sites에 없는 유일한 값 — SQL 확인), `app/(0gamja)/layout.tsx` `getSiteConfigServer('ogamja')`, `lib/agent/index.ts:52` 양쪽 별칭, `members/list/page.tsx:27`·`analytics/sync:14`·`universe/page.tsx:56`·`lib/data.ts:117`는 `0gamja`.
- 영향: `getSiteConfigServer('ogamja')` → null → 인트라 SEO·파비콘·오픈 토글이 사이트에 반영 안 됨(§1.1 아키텍처 단절). `SiteClosedOverlay`·`computeSitesStatus`·site-check(`-- ogamja` → "DB row 없음")가 전부 어긋남. `brand_capabilities('ogamja')`는 고아 row, `ums_sites('0gamja')`는 capability 없음.
- 해결안: 식별자 하나로 통일(DB `0gamja` → 코드 `SiteIdentifier`는 숫자 시작 불가가 아니므로 `'0gamja'`로 바꾸거나, DB slug를 `ogamja`로). 영향 범위 작음(실험 브랜드, 회원 join 0건 — `member_brand_joins` distinct brand_id에 없음). `brand_capabilities` row 갱신. 재발 방지: `site-check`에 `SiteIdentifier` 집합 ↔ `ums_sites.slug` 집합 diff 추가(`trendhunter`·`luki`도 같이 드러남).
- 작업량: S
- 확신도: 높음

### Medium

| ID | 내용 (원천 / 중복 → 영향 → 해결) | 작업량 |
|---|---|---|
| M-1 | **Tier·공개 상태**: DB `ums_sites` hero = hosting vercel·**is_open=false**(site-check ❌ "Vercel 운영인데 가림막", HeRo CLAUDE.md:558 "결정 대기") ↔ CLAUDE.md §0.1 "HeRo Vercel 운영 중" · madleague = external·is_open=**true**(외부 서버 브랜드는 스테이징 비공개 원칙 6) → DB 두 값 결정 후 CLAUDE Tier 표와 맞추기. `next.config.ts:67` noindex 목록·`:78` Cache-Control 브랜드 목록은 CANONICAL과 별도 하드코딩(현재 일치, site-check가 noindex만 감시) → Cache-Control은 `/:brand/:path*` 일반 규칙으로 | S |
| M-2 | **CLAUDE.md §1.1 도메인 표**가 registry와 다름: hero/mindle/0gamja/fwn/wio/changeup `.tenone.biz` 서브도메인 누락, seoul360.net·domo.ne.kr 독립 도메인 누락, "29개"라 쓰고 28행, LUKI `/luki` 경로는 pathSiteMap에 없음 → H-1 해결 시 registry에서 표 생성(또는 인트라 `/intra/ums/standard/sites`가 이미 registry를 읽으므로 표를 지우고 링크) | S |
| M-3 | **capability 라벨·색 2벌**: `components/CapabilitySection.tsx:6-27` ↔ `components/UniverseProfile.tsx:1253-1258` 인라인 동일 객체. 둘 다 `밋업·클럽·코스`인데 CLAUDE.md §1.3.1 표·DB `capabilities.name_ko`는 `모임·동아리·강의`(§1.6.1 레시피 6은 "CAPABILITY_LABELS 상수 갱신"을 요구하나 그 상수는 없음) → `lib/capabilities.ts`에 `CAPABILITY_LABELS`·`CAPABILITY_COLORS` 하나 두거나 DB `name_ko`를 조회해 쓰기 | S |
| M-4 | **인트라 브랜드 대시보드 자체 집계**(§1.9.5 "computeSitesStatus만 쓴다"): `app/intra/hero/page.tsx:83-98`(members.affiliations — 축1 H-1 참조), `app/intra/ums/{badak,madleap,domo,townity,smarcomm,youinone,jakka,montz,mindle}/page.tsx`가 `count:'exact'` 직접 쿼리. `BrandSiteStatus` 사용은 rook·madleague 2곳 → H-2 등록 후 집중 브랜드 3곳부터 `BrandSiteStatus`로, 실험 브랜드는 대시보드 자체를 사이트 현황 링크로 축소 | M |
| M-5 | **Action Hub 밖 pending 집계 없음(양호)** — `ACTION_HUB_REGISTRY` 소비자는 `ActionHubPanel` 1곳. 단 `brand_membership_applications`(0행, 범용) entry와 브랜드별 `badak_leader_applications`·`jakka_seller_applications`·`montz_*`·`mad_applications`·`hero_talent_applications`·`program_applications`가 "신청서" 테이블 7종으로 병존 → 코어 `program_applications`(brand_id·channel)로 흡수 가능한 것(§0.1 "집중 2곳 이상 필요 시 코어로")을 분류. 축1 H-3 참조 | M |
| M-6 | **중복 테이블(목적 동일, 세대 혼재)** — 알림 6종 `notifications`(코어 `/api/notifications`·`lib/notify.ts`)·`badak_`·`jakka_`·`myverse_`·`wio_`·`comm_notifications` **전부 0행**; 인증서 3종 `certificates`·`mad_certificates`·`program_certificates` 전부 0행(코드: WIO `certificate.ts`가 `certificates`, 프로그램 모듈이 `program_certificates`); 경쟁 `competitions`(0)·`competition_teams` / `mad_competitions`(4)·`mad_competition_teams` / `program_rounds`(4)·`program_teams`(코드: WIO `competition.ts` ↔ 프로그램 모듈); 강의 `courses`(0)·`enrollments` / `wio_courses`(0)·`wio_enrollments` / `evolution_enrollments`; 프로필 `profiles`(0) / `hero_profiles`·`career_profiles`·`madleague_profiles`·`badak_profiles`·`smarcomm_profiles`·`evolution_profiles`; 문의 `contact_submissions`(코어, form_type 접두어) / `hero_business_inquiries`(0) / `montz_contact_requests`; 폼 `forms`·`form_responses`(4) / `surveys`·`survey_responses` / `program_questions`·`program_answers` → 0행 generic(`certificates`·`competitions`·`courses`·`profiles`·`notifications` 외 5종 알림·`hero_business_inquiries`·`brand_membership_applications`·`wio_holding_brands`)은 DROP + 코드 정리, `mad_competitions` → `program_rounds` 이관 여부 결정(세션 163 이후 둘 다 4행) | L |
| M-7 | **구독 테이블**(§1.10 원칙 1 "wio_subscription_plans 하나만"): `myverse_subscriptions`(0행, 코드 2곳)·`mail_subscriptions`(0행)·존재하지 않는 `subscriptions`(H-3) ↔ `wio_subscriptions`(3)+`wio_subscription_plans`(15) → MyVerse 재가동 시 `wio_subscriptions(brand_id='myverse')`로, `mail_subscriptions`는 뉴스레터 구독(`newsletter_subscribers`, 코드 28곳)과도 중복이라 용도 확인 후 하나로 | S |
| M-8 | **접근 모델 표 복제**: `app/intra/ums/members/list/page.tsx:45-53` `POTENTIAL/SERVICE/MEMBERSHIP/SUBSCRIBE/BELONGS_TO_BRANDS` Set 5개가 CLAUDE.md §1.4 표를 손으로 옮긴 것(Badak이 "구매"와 "소속" 둘 다, Planner's 잔존) ↔ DB `brand_capabilities`가 같은 사실의 원천 → `brand_capabilities`에서 파생(subscription 탑재=구독, membership=멤버십 …) | S |
| M-9 | **포맷 유틸 중복**: `formatPhone` 6벌(`MyProfileCard.tsx:11`·`UniverseProfile.tsx:23`·`DigitalCard.tsx:50`·Badak apply·onboard·MADLeague ApplyForm — CLAUDE.md §1.3은 MyProfileCard 것을 전 브랜드 표준이라 적음), `formatDate` 10벌(`UCBalanceCard`·`BoardWidget`·`CommentSection`·Badak groups 2·MyVerse 3·WIO·인트라), `formatCurrency` 등 → `lib/format.ts` 하나로(서버·클라이언트 공용), 한국 전화 포맷은 1곳 | S |
| M-10 | **LoginModal 우회**: `app/(WIO)/wio/login/page.tsx`(자체 `signInWithPassword` 페이지 — §1.2 "로그인 모달은 LoginModal로 통일, /login 페이지 아님"), `app/(Dokdae)/dokdae/page.tsx`(내부 서비스·예외 가능). `IntraLoginScreen`(인트라 게이트, 의도된 예외)·`UniverseProfile`(비밀번호 변경 재인증)은 위반 아님 → WIO 로그인 페이지를 `LoginModal` 또는 `AuthGate`로 | S |

### Low

| ID | 내용 | 작업량 |
|---|---|---|
| L-1 | `lib/domain-registry.ts:4` 주석("site-config.ts 양쪽에서 import")이 사실과 다름 — H-1 수정 시 함께 | S |
| L-2 | `brandgravity.co.kr` registry siteId `'tenone'` + `SITE_DOMAIN_OVERRIDES` 땜질(`domain-registry.ts:150-158`) — prefix와 siteId를 분리했으니 `siteId:'brandgravity'`로 고치고 오버라이드 삭제 | S |
| L-3 | `ums_sites.domain` 컬럼(단일) vs registry(복수) vs `siteConfigs.domain` — `getDomainsBySiteId()` 주석 "DB domains 컬럼 무관"으로 세 벌 공존. 인트라 `ums/layout.tsx:68`·`sites/list:282`는 `site.domain` 표시 → `ums_sites.domain`은 "공식 주소 표시용"으로만 쓰거나 CANONICAL에서 파생 | S |
| L-4 | `features/smarcomm/Header.tsx`·`Footer.tsx`(구버전, 공통 컴포넌트 미사용, 소비자 없음 — `app/(SmarComm)/CLAUDE.md`만 언급)·`features/myverse/MyverseAppHeader.tsx`(소비자 없음)·`lib/brand-meta.ts`(소비자 없음) — 죽은 복제본 삭제 | S |
| L-5 | `app/api/analytics/sync/route.ts:14` 브랜드 차원 값에 `scribble`·`korea360` 유령 값, `dokdae/evschool/namingfactory/brandgravity/jakka` 누락 → `siteConfigs` 키에서 생성 | S |
| L-6 | 공통 컴포넌트 채택 현황(양호): 전 브랜드 헤더 27개 중 `UniverseUtilityBar`·`UniverseMobileMenu` 미사용 0 (서브 헤더 `PageHeader`·`LaneHeader`·구버전 제외), 푸터 28개 중 `UniverseFooter` 미사용은 `smarcomm/Footer.tsx`(구버전) 1개, 마이페이지 `MyProfileCard` 미사용 0 — 단 §1.9.4 "브랜드 푸터 파일을 더 만들지 않는다"와 달리 `features/{brand}/{Brand}Footer.tsx` 28개가 `UniverseFooter`를 감싸는 래퍼로 남아 있음(링크 컬럼만 들고 있으면 각 layout에서 직접 `<UniverseFooter>` 호출로 축소 가능) | S |

## 먼저 고칠 순서 (상위 5개와 이유)

1. **H-3 존재하지 않는 테이블(`posts`·`badak_posts`·`subscriptions`)** — 지금 이 순간 공용 게시판 API 7개·검색·구독 화면이 에러. 삭제 또는 `ums_posts`·`wio_subscriptions`로 교체하면 끝. 같이 "코드 테이블명 ↔ DB" 자동 대조를 점검기에 넣어 재발 차단.
2. **H-1 도메인 맵 3벌 → registry 파생** — 서버·클라이언트 siteId 불일치는 로그인·동의 기록·분석에 조용히 번진다. 코드 수정 자체는 작다(`domainMap = domainSiteMap`, `pathSiteMap` 파생).
3. **H-2 Badak·HeRo·MADLeap `brand-site-menus` 등록 + `siteConfigs.nav` 삭제** — site-check ❌가 이미 떠 있고, 세 브랜드 모두 오픈 준비 중이라 지금 등록해야 인트라 메뉴·현황·제목이 자동으로 따라온다(§1.9.5 SSOT 사슬 완성).
4. **H-7 `0gamja/ogamja` 통일 + H-5 산업군·직무군 단일화** — 둘 다 S 작업이고, Badak 재가입 전에 끝내야 회원 데이터가 두 체계로 갈라지지 않는다.
5. **H-4 브랜드 이름·컬러 10곳 → siteConfigs/ums_sites** — 다음 브랜드 개명·종료(§0.1 절차 ⑤·⑦) 때 10곳을 손으로 찾는 일을 없앤다. `BRAND_LABELS` 치환은 기계적, DB `brands`·`bums_sites` 정리는 용도 확인 후.

H-6(sitemap·robots)은 SEO 영향이 커 보이나 외부 서버 브랜드 DNS 전환 전에 호스트별 동적 생성으로 한 번에 고치는 것이 효율적 — 전환 작업(§2.5)의 체크 항목으로 묶기를 권고.

## 확인 필요 (근거 부족·추정)

- DB `brands`(29행)·`bums_sites`(6행)의 실제 용도 — `lib/supabase/brands.ts`는 소비자가 없고 `studio/brands/page.tsx`·`erp.ts`·`tenone.ts`가 읽는다. `ums_sites`와 중복인지, WIO 테넌트용(`tenant_id` 컬럼 있음)인지 사용자 결정 필요.
- `trendhunter`(ums_sites에만) — 종료된 서비스면 §0.1 절차 ⑤~⑦(row 정리), 계획 중이면 코드 등록.
- HeRo `is_open=false`(2026-10-07 12:51 UTC 변경)가 의도인지 — HeRo CLAUDE.md:558에 "결정 대기"로 이미 기록됨. MADLeague external+is_open=true도 같이.
- `lib/supabase/board.ts`의 `posts` 스키마(`site, board, guest_nickname, represent_image…`)가 외부 서버 Badak 게시판 이관용 초안인지, 아니면 단순 잔재인지 — 이관 없음 원칙(§0.1)이면 삭제 대상.
- `mail_subscriptions` vs `newsletter_subscribers` 관계(둘 다 뉴스레터로 보이나 `mail_*`는 SmarComm 메일 모듈일 수 있음).
- `mad_competitions`(4행)와 `program_rounds`(4행)가 같은 4건을 두 번 들고 있는지(세션 163 "경쟁 PT를 program_* 테이블로 이전") — 행 내용은 조회하지 않음.

## 점검 범위·한계 (못 본 것)

- 코드 grep은 `.from('테이블')` 문자열·식별자 패턴 기준 — 동적 테이블명·RPC·SQL 파일(`sql/*.sql`) 내부 중복은 보지 않았다.
- 실험·보관 브랜드(Jakka·MoNTZ·MyVerse·SmarComm·WIO·BrandGravity 등)는 헤더·푸터·마이페이지 공통 컴포넌트 사용 여부와 테이블 개수만 집계, 페이지 로직은 읽지 않았다.
- DB는 `ums_sites`·`brand_capabilities`·`member_brand_joins`(brand_id distinct)·테이블 목록·행 수·`contact_submissions.form_type` distinct만 조회. 뷰(`site_configs` VIEW)·함수·RLS는 축 1에서 다룸.
- `WORKSPACE_REGISTRY` 경로(`/hero/journey`·`/dashboard`)의 실존 여부, `sitemap.ts` 56개 URL의 실존 여부는 라우트 파일로 대조하지 않았다(리다이렉트 테이블과의 충돌만 확인).
- 브랜드별 `app/(Brand)/CLAUDE.md` 28개와 루트 CLAUDE.md 간 문서 중복(같은 사실을 두 문서에 적은 곳)은 범위 밖 — HeRo·Badak·MADLeague 3개만 참조.
- 외부 서버(Badak·MADLeap 기존 사이트)·Vercel 프로젝트 설정·Supabase Auth Redirect URL 목록(도메인 레지스트리의 4번째 복제본일 수 있음)은 접근하지 않았다.

# 계정 관리 → account.tenone.biz 이전 계획

> 작성 2026-10-16 (세션 179) · 상태: **계획 — 코드 미착수**
> 결정: 사용자 승인 (2026-10-16) — 계정 관리는 `account.tenone.biz` 하나로, 사이트별 마이 페이지는 각 사이트 `/my`에 그대로

## 1. 이름과 자리 (Google 대응)

| Google | Ten:One | 누가 | 주소 |
|---|---|---|---|
| myaccount.google.com (Google 계정) | **계정 관리** — 이름·사진·소개·공개 설정·주소(핸들)·보안·탈퇴 | 회원 본인 | `account.tenone.biz` (지금 `/profile`) |
| admin.google.com (조직 관리 콘솔) | **인트라** | 직원 | `intra.tenone.biz` (이미 있음) |
| accounts.google.com (로그인) | 로그인 허브 | 누구나 | `auth.tenone.biz` (이미 있음) |
| 서비스 안의 내 화면 (유튜브 내 채널 등) | **마이 페이지** | 회원 본인 | 각 사이트 `/my` — 서브도메인으로 나누지 않음 |

- `admin.`을 회원 화면에 쓰지 않는다 — 직원 콘솔(인트라)과 이름이 섞이고 회원에게 "관리자 화면"으로 읽힌다
- `mypage.{브랜드 도메인}`은 만들지 않는다 — 독립 도메인마다 DNS·Vercel·Turnstile·Supabase 4곳 작업 + 세션이 도메인별이라 로그인 연결이 또 필요하다
- 공개 프로필(`tenone.biz/@핸들`, 브랜드 `/@핸들`)은 **옮기지 않는다** — 남이 보는 화면은 서비스 주소에, 본인 설정만 account로

## 2. 코드 변경 (Claude)

| # | 파일 | 할 일 |
|---|---|---|
| 1 | `lib/domain-registry.ts` | `'account.tenone.biz': { prefix: '/profile', siteId: 'tenone' }` 추가 · `INTERNAL_DOMAINS`에 추가 (도메인 목록·사이트맵 제외) |
| 2 | `middleware.ts` 0-CANONICAL | `www.tenone.biz/profile`(정확히 그 경로, 쿼리 유지) → `https://account.tenone.biz/` 308. `/profile/{핸들}` 공개 화면은 넘기지 않는다. 다른 도메인의 `/profile`도 account로 308 |
| 3 | `middleware.ts` account 호스트 | `account.tenone.biz/` → `/profile` rewrite. `/{핸들}` 같은 하위 경로가 공개 프로필(`/profile/[handle]`)로 새지 않게 account 호스트에서는 `/` 외 경로를 막는다(나중에 `/security` 등 하위 화면을 만들면 그때 열기). `/login`·`/auth`·`/api`는 기존 skipPaths대로 통과 |
| 4 | `lib/cross-site.ts` | `SHARED_PATHS`에서 `/profile` 제거 → `crossSiteHref('/profile')`가 `https://account.tenone.biz/`로. 독립 도메인에서 로그인 상태면 허브(SSO) 경유 — account는 `.tenone.biz` 쿠키라 허브 세션이 있으면 바로 열린다 |
| 5 | `components/AccountMenu.tsx` · `MyProfileCard.tsx` · `UniverseUtilityBar.tsx` | `/profile` 링크를 `CrossSiteLink`로 (지금은 같은 사이트 `Link`) |
| 6 | `app/(TenOne)/profile/page.tsx` | 비로그인 시 `/login?redirect=/profile` 대신 현재 페이지 위 `LoginRequired` (§1.2.1 — account 호스트에서 `/login` 경로 처리 불필요해짐) |
| 7 | 로컬 개발 | localhost는 지금처럼 `/profile` 경로 그대로 (registry 경로 분기) |
| 8 | 점검 | `scripts/site-check.mjs`에 account.tenone.biz 실접속(https·로그인 모달·308) 항목 · `lib/site-seo.ts`에서 account 호스트 robots 전체 Disallow (본인 전용 화면) |
| 9 | 문서 | CLAUDE.md §1.2·§1.9.2(계정 메뉴)·§1.3 화면 구성 갱신, 이 문서 상태 '완료' |

## 3. 사람이 할 외부 작업 (한 번에)

| 순서 | 어디서 | 할 일 |
|---|---|---|
| 1 | Vercel 사이드바 **Domains** | `account.tenone.biz` 추가 → **tenone 프로젝트에 연결** (Production) — Claude MCP는 조회 전용 |
| 2 | 가비아 DNS (tenone.biz) | CNAME `account` → Vercel 권장값 (적용 직전 Claude가 `get_domain_config`로 값 확인해 전달, 끝에 점) |
| 3 | Supabase › Auth › URL Configuration | Redirect URLs에 `https://account.tenone.biz/**` (기존 목록에 `*.tenone.biz` 와일드카드가 없으면 필수) |
| 4 | Cloudflare Turnstile | 추가 불필요 — tenone.biz 등록에 서브도메인 포함 (부록 G.2). 확인만 |
| 5 | GA4 | 추가 불필요 — 도메인 구성이 tenone.biz '포함' 일치 |

순서: 외부 1~3 완료 → Claude가 `get_project_domain`(verified)·`get_domain_config`(misconfigured=false) 확인 → 코드 배포 → `www.tenone.biz/profile` 308 · 로그인 모달 · 계정 메뉴 링크 실검증.
**코드를 먼저 배포하면 안 된다** — 도메인이 붙기 전에 308이 나가면 계정 관리 화면이 끊긴다.

## 4. 법적·보안 점검

- 새 개인정보 수집 없음 (화면 위치만 이동) — 처리방침 변경 불필요
- 계정 화면 전용 호스트라 검색 차단(robots Disallow·noindex)
- 쿠키 도메인 `.tenone.biz` 그대로 — 인트라·허브와 같은 범위, 새 공유 범위 없음
- 피싱 대비: 이메일·안내 문구에 계정 관리 주소를 쓸 때는 `account.tenone.biz` 하나만 쓴다

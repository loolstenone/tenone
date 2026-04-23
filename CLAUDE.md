# CLAUDE.md — Ten:One™ Universe 개발 가이드

> **이 문서는 유니버스 공통 가이드다.** 브랜드별 세부 규칙은 `app/(BrandName)/CLAUDE.md`에 있으며,
> 해당 브랜드 파일을 편집할 때 Claude Code가 자동으로 함께 로드한다.

## 문서 체계

```
CLAUDE.md                          # [지금 이 파일] 유니버스 공통 가이드
app/(BrandName)/CLAUDE.md          # 브랜드별 가이드 (26+ 개, 자동 로드)
ROADMAP.md                         # 전체 로드맵
WORK_STATUS.md                     # 현재 진행 상황
CHANGELOG.md                       # 날짜별 변경 이력
docs/Universe_Coin_Policy.md       # UC 정책 상세
docs/WIO_Master_Architecture.md    # WIO 설계 단일 진실 소스
UX_GUIDE.md                        # UX 디테일 표준
```

**작동 원리**: Claude Code는 편집하는 파일 경로의 **모든 상위 CLAUDE.md를 자동 로드**한다.
`app/(Badak)/badak/my/page.tsx` 편집 → 루트 `CLAUDE.md` + `app/(Badak)/CLAUDE.md` 둘 다 컨텍스트에 포함.

---

## 0. 프로젝트 개요

Ten:One™ Universe는 하나의 코드베이스·하나의 Supabase로 **26+ 개 브랜드 도메인**을 운영하는 풀스택 웹 애플리케이션이다. 퍼블릭 포털(브랜드 쇼케이스) + 인트라 오피스(내부 관리) + AI 에이전트 런타임으로 구성된다.

### 4대 제품 — Intra에서 통제·운영·관리

| 제품 | 역할 | Intra 연결점 |
|------|------|------------|
| **Mindle** | **트렌드 콘텐츠 브랜드** — Whole See의 정보를 가장 적극 활용해 독자에게 전달 | UMS > Mindle (사이트·회원·콘텐츠) |
| **SmarComm** | 마케팅 자동화 OS | Marketing 섹션 ↔ SmarComm WS |
| **WIO** | 업무 자동화 솔루션 | Universe > 구독 + WIO Orbi |
| **AI Agent** | 6개 에이전트 운영 엔진 | INTEL > Agent Hub |

### 정보 공급 엔진 — Whole See

Mindle·SmarComm·전 브랜드가 공통으로 쓰는 **정보 취합·분류·분석 인프라**.
INTEL 레이어에 속하며, 외부 정보를 유니버스에 들여오는 "눈" 역할.

| 구성 | 역할 |
|------|------|
| **Whole See** (INTEL) | RSS·웹·뉴스레터·소셜 크롤링 · AI 분류 · 트렌드 카드 생성 · 파이프라인 |
| **Mindle** (브랜드) | Whole See 원천에서 선별 · 큐레이션 · 뉴스레터 발행 · 독자 전달 |
| **기타 브랜드** | Whole See 원천을 부분 활용 (브랜드별 필요에 따라) |

> **원칙**: 크롤링·분석은 Whole See(INTEL) 공동 인프라, 각 브랜드는 UMS에서 자기 콘텐츠·회원·사이트만 관리.

### AI Agent Team — 3축 체계

| 축 | 도구 | 역할 | 상시 가동 |
|---|------|------|----------|
| 기획 | 열시일분 (Claude Chat) | 전략, 오케스트레이션 | ❌ |
| 실행 | **OpenClaw** (PC 상주) | 에이전트 런타임, 자율 실행, 메시징, 소셜 게시 | ✅ |
| 개발 | **Claude Code** | 코드/빌드/배포, OpenClaw 커스텀 스킬 개발 | ❌ |

> **OpenClaw** = Peter Steinberger 개발 오픈소스 AI 에이전트 프레임워크 (MIT). 텐원 PC에 상주.
> **Lobster**(YAML 워크플로우) + **ClawHub** 스킬 마켓 + 로컬 영구 메모리(`~/.openclaw/`)
> Claude Code 산출물: `C:\Users\텐원\TenOne\skills\` (커스텀 스킬), `~/.openclaw/workflows/` (Lobster YAML)

### 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS v4 + PostCSS
- **아이콘**: Lucide-React
- **빌드**: Standalone (Vercel 자동 배포)
- **DB/Auth**: Supabase 단일 프로젝트 `ziotlxkdctlhiwkgmmsh`

### 핵심 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
```

### 프로젝트 구조

```
app/
  (public)/        # 퍼블릭 페이지 (about, brands, contact, history, universe, profile)
  (BrandName)/     # 각 브랜드별 페이지 그룹 — 각 그룹 루트에 CLAUDE.md
  intra/           # 내부 오피스 대시보드
    erp/           # ERP (CRM, HR, 재무)
    marketing/     # 마케팅 (campaigns, leads, deals, content, analytics)
    studio/        # 스튜디오 (brands, schedule, assets, workflow)
    ums/           # 유니버스 멤버 관리 (members, sites, uc, per-brand)
    wiki/          # 내부 위키
  api/             # Route Handlers
  auth/            # 인증 콜백/확인

components/        # 재사용 컴포넌트
features/          # 브랜드별 feature 컴포넌트 (features/badak/, features/jakka/ 등)
lib/               # 핵심 로직 및 Context (auth, supabase, site-config, domain-registry)
types/             # TypeScript 타입 정의
public/            # 정적 파일
sql/               # SQL 마이그레이션 파일
docs/              # 설계 문서
```

---

# 1. 유니버스 공통 원칙

## 1.1 도메인 분기 시스템

> **Google처럼 하나의 코드베이스·하나의 Supabase로 수십 개 브랜드 도메인을 운영한다.**
> 이 구조를 모르면 로그인 디버깅, 사이트 분기, 인증 설정에서 반복 실수가 발생한다.

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `lib/site-config.ts` | 전체 브랜드 설정 + `domainMap` (도메인 → 사이트 ID 매핑) |
| `lib/site-context.tsx` | 클라이언트에서 `window.location.hostname`으로 사이트 감지 → `useSite()` 훅 제공 |
| `lib/domain-registry.ts` | 도메인 SSOT — middleware/server/callback/sso 전부 이 파일을 import |
| `lib/supabase/site-configs.ts` | DB CRUD (`getSiteConfigServer`/`upsertSiteConfig`/`toggleSiteOpen`) |
| `components/SiteClosedOverlay.tsx` | `is_open=false` 사이트 전체 차단. 마스터/Staff/Admin bypass |
| `components/UnderConstruction.tsx` | 전용 콘텐츠 없는 사이트의 브랜드 랜딩 페이지 |
| `components/LoginModal.tsx` | 전 브랜드 공통 로그인 모달 |
| `components/UniverseUtilityBar.tsx` | 전 브랜드 공통 헤더 우측 |

### 도메인 감지 3단계

**① 독립 도메인** (domainMap): `madleague.net` → `'madleague'`
**② 서브도메인 자동 감지** (`*.tenone.biz` regex): `domo.tenone.biz` → siteConfigs에 키 있으면 매칭
**③ 경로 분기** (pathSiteMap, localhost 개발용): `www.tenone.biz/madleague`

> ⚠️ 서브도메인은 `siteConfigs`에 키가 있으면 자동 감지. `domainMap`에 따로 추가 불필요.

### 현재 운영 도메인/경로 (29개)

| 브랜드 | 독립 도메인 | 서브도메인 | 경로 | siteId |
|--------|-----------|----------|------|--------|
| TenOne | tenone.biz | — | / | tenone |
| MADLeague | madleague.net | madleague.tenone.biz | /madleague | madleague |
| MADLeap | madleap.co.kr | madleap.tenone.biz | /madleap | madleap |
| Badak | badak.biz | badak.tenone.biz | /badak | badak |
| RooK | rook.co.kr | rook.tenone.biz | /rook | rook |
| YouInOne | youinone.com | youinone.tenone.biz | /youinone | youinone |
| SmarComm | smarcomm.biz | smarcomm.tenone.biz | /smarcomm | smarcomm |
| HeRo | hero.ne.kr | — | /hero | hero |
| 0gamja | 0gamja.com | — | /0gamja | ogamja |
| LUKI | — | — | /luki | luki |
| Seoul360 | — | — | /seoul360 | seoul360 |
| FWN | fwn.co.kr | — | /fwn | fwn |
| MoNTZ | — | montz.tenone.biz | /montz | montz |
| Mullaesian | — | mullaesian.tenone.biz | /mullaesian | mullaesian |
| Mindle | — | — | /mindle | mindle |
| Townity | — | townity.tenone.biz | /townity | townity |
| NatureBox | — | naturebox.tenone.biz | /naturebox | naturebox |
| Myverse | myverse.kr | myverse.tenone.biz | /myverse | myverse |
| Domo | — | domo.tenone.biz | /domo | domo |
| Jakka | — | jakka.tenone.biz | /jakka | jakka |
| ChangeUp | changeup.company | — | /changeup | changeup |
| Planner's | — | planners.tenone.biz | /planners | planners |
| WIO | — | — | /wio | wio |
| BrandGravity | — | brandgravity.tenone.biz | /brandgravity | brandgravity |
| Wiki | — | wiki.tenone.biz | /wiki | wiki |
| Dokdae | — | dokdae.tenone.biz | /dokdae | dokdae |
| EvoSchool | — | evschool.tenone.biz | /evschool | evschool |
| NamingFactory | — | namingfactory.tenone.biz | /namingfactory | namingfactory |

### 사이트 메타데이터 아키텍처

```
인트라 저장 → upsertSiteConfig() → ums_sites 테이블
                                        ↓
                                  site_configs VIEW
                                        ↓
                              getSiteConfigServer() (ISR 10분)
                                        ↓
                              각 사이트 generateMetadata()
```

**모든 브랜드 레이아웃 필수 패턴:**
```tsx
export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('siteId');
    const site = siteConfigs.siteId;
    return {
        title: { default: db?.meta_title ?? site.meta.title, template: `%s | ${db?.name ?? site.name}` },
        description: db?.meta_description ?? site.meta.description,
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? site.meta.title,
            description: db?.meta_description ?? site.meta.description,
            siteName: 'Ten:One™ Universe',
            type: 'website',
            ...((db?.meta_og_image ?? site.meta.ogImage) && { images: [db?.meta_og_image ?? site.meta.ogImage!] }),
        },
    };
}
```

**절대 하지 말 것:**
- ❌ 레이아웃에 `export const metadata` (정적) 사용 → 반드시 `generateMetadata()`
- ❌ 하드코딩 fallback 문자열 → `site.meta.title` 사용
- ❌ openGraph에서 ogImage 누락 → 반드시 조건부 images spread 포함
- ❌ 페이지에 "준비 중", "Coming Soon", "공사중" 텍스트 직접 표시
- ❌ 사이트 차단을 페이지 컴포넌트에서 처리 → `SiteClosedOverlay`가 전담

### 사이트 오픈/차단 시스템

| 상황 | 표시 내용 | 담당 |
|------|----------|------|
| `is_open=true` | 누구나 정상 표시 | 각 page.tsx |
| `is_open=false` + 마스터 | 가림막 bypass | `SiteClosedOverlay` |
| `is_open=false` + 그 외 | "준비 중입니다" 가림막 | `SiteClosedOverlay` |
| intra/login/auth 경로 | 항상 접근 가능 | `SiteClosedOverlay` |
| tenone 사이트 | 항상 접근 가능 | `SiteClosedOverlay` |

---

## 1.2 인증 SSOT

- **단일 Supabase** `ziotlxkdctlhiwkgmmsh` 하나로 전 도메인 통일
- 각 도메인의 Vercel 배포에 **동일한** `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` 필요
- 로그인 모달은 `LoginModal.tsx`로 통일 (`/login` 페이지가 아님)
- 소셜 로그인 redirect: `{origin}/auth/callback` — Supabase Allowed URLs `/**` 와일드카드 33개 등록됨
- 이메일 인증: OTP `{{ .TokenHash }}` 방식 (PKCE 아님) → `/auth/confirm` 라우트
- 이메일 발송: Resend SMTP (`Ten:One™ Universe <noreply@tenone.biz>`)
- 크로스도메인 쿠키: `lib/domain-registry.ts`의 `getCookieDomain()` 동적 감지
- **auth.users 테이블 UPDATE/DELETE 금지** — 비밀번호·계정 작업은 사용자가 Dashboard에서 직접

### 1.2.1 로그인/가입 복귀 원칙 (이탈 방지)

> **대원칙**: 브랜드 사이트에서 로그인/가입을 시작하면, 완료 후 **해당 브랜드 사이트의 원래 페이지**로 복귀한다.
> 절대 `tenone.biz`로 튕겨 나가지 않는다 — 방문자 이탈의 가장 큰 원인.

**세부 원칙 A: 브랜드 보호 페이지에서 로그인 요구 시 → `/login` 이동 금지, LoginModal 팝업**

> Badak 표준: 비로그인 상태로 브랜드 마이페이지(`/{brand}/my`) 접근 시 **현재 페이지 위에 LoginModal 팝업**을 띄운다.
> `router.push('/login')` 하지 않는다. 로그인 완료 → 모달 닫힘 → 그 자리에 머문다.

**세부 원칙 B: 외부 `/login` 링크 (네비·푸터·CTA 등)에서 `/login`으로 이동할 때는 `?redirect={현재경로}` 전달**

**구현 규약 (원칙별 매핑):**

| 상황 | 규칙 |
|------|------|
| 브랜드 마이페이지(`/{brand}/my`) 비인증 접근 | `<LoginModal isOpen={true} onClose={() => {}} accentColor="#..." />` 렌더 (Badak 패턴) |
| 공용 `<AuthGate>` 래퍼 선택 가능 | `components/AuthGate.tsx` 써서 `<AuthGate accentColor bgClassName>` 으로 감싸도 됨 |
| `/login`으로 이동하는 Link·버튼 (헤더, 푸터, CTA) | 반드시 `loginHref(pathname)` 사용 (`?redirect=` 전달) |
| `router.push('/login')` / `redirect('/login')` | 반드시 `loginHref(pathname)` 또는 `currentLoginHref()` 사용 |
| 소셜 로그인 클릭 | `auth-context`가 `auth_redirect` 쿠키로 자동 저장 (auto) |
| InstaLayout 계열(Jakka/MoNTZ) 등 모달 기반 헤더 | 모달이 현재 페이지 위에 열리므로 추가 조치 불필요 (auto) |

**표준 헬퍼** — `lib/login-href.ts` & `components/AuthGate.tsx`

```tsx
// (1) 외부 /login 링크 — Link·버튼·router.push
import { usePathname } from "next/navigation";
import { loginHref, signupHref } from "@/lib/login-href";

const pathname = usePathname();
<Link href={loginHref(pathname)}>로그인</Link>
<Link href={loginHref(pathname, "signup")}>회원가입</Link>
router.push(loginHref(pathname));

// (2) 브랜드 마이페이지 비인증 처리 — LoginModal 팝업 (Badak 표준)
import { LoginModal } from "@/components/LoginModal";

if (isLoading) return <SpinnerScreen />;
if (!isAuthenticated) return (
    <div className="min-h-screen bg-neutral-950">
        <LoginModal isOpen={true} onClose={() => {}} accentColor="#BRAND_COLOR" />
    </div>
);
// (선택) <AuthGate accentColor bgClassName> 래퍼 사용도 가능
```

**절대 하지 말 것:**
- ❌ 브랜드 마이페이지에서 `router.push('/login')` — 사용자가 보던 페이지에서 튕겨 나감. LoginModal 팝업이 표준.
- ❌ `<Link href="/login">` (파라미터 없음) — 로그인 후 브랜드 홈('/')으로만 감, 원래 페이지 상실
- ❌ `router.push("/login")` 하드코딩 — 동일 사유
- ❌ 브랜드 헤더에서 `window.location.href = 'https://tenone.biz/login'` — tenone 이탈
- ❌ signup ↔ login 상호 전환에서 redirect 파라미터 누락

**흐름 요약:**

```
jakka.tenone.biz/market 방문 (비로그인)
   ↓ 프로필 버튼 클릭
/login?redirect=%2Fmarket  (같은 hostname 유지)
   ↓ 로그인 성공
jakka.tenone.biz/market  (원래 페이지 복귀) ✅
```

---

## 1.3 프로필 3계층 체계

> **하나의 계정 → 하나의 프로필 → 모든 서비스에서 동기화**

### 3계층 구조

| Layer | 저장소 | 소유권 | 예시 필드 |
|-------|--------|--------|----------|
| **Layer 1: 기본 정보** | `auth.users` | Supabase Auth | email, password, provider |
| **Layer 2: 공통 프로필** | `members` 테이블 | 유니버스 전체 | name, phone, company, bio, avatar_url, affiliations |
| **Layer 3: 특화 프로필** | 서비스별 테이블 | 각 브랜드 | `mad_applications`, `badak_profiles`, `career_profiles` 등 |

### 양방향 동기화 흐름

```
유니버스 프로필 (/profile)     각 브랜드 마이페이지 (/[brand]/my)
        │                              │
        ├─ 공통 필드 수정 ──────────→ members UPDATE ←── 공통 필드 수정 ─┤
        │                              │                               │
        └─ 특화 필드 읽기 ←── 서비스별 테이블 SELECT ── 특화 필드 수정 ─┘
```

**동기화 규칙:**
- 공통 필드는 **어디서 수정하든** `members`에 반영
- 특화 필드는 **해당 서비스 테이블만** 수정
- 유니버스 프로필은 특화 필드를 **읽기만** 함
- `members.affiliations[]`로 이용 중인 서비스 목록 관리

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `lib/supabase/universe-profile.ts` | 양방향 동기화 모듈 |
| `lib/supabase/members.ts` | members 테이블 CRUD |
| `components/UniverseProfile.tsx` | `/profile` 전용 (프로필 수정 + 서비스 현황 + 직원 정보) |
| `components/MyProfileCard.tsx` | 전 브랜드 공통 프로필 카드 |
| `lib/auth-context.tsx` → `updateProfile()` | members + avatar_url 동기화 |

### 각 브랜드 마이페이지 표준 패턴

```tsx
import { MyProfileCard } from "@/components/MyProfileCard";

<MyProfileCard accentColor="#D32F2F" siteBadge="MAD Leaguer">
    {/* 브랜드별 특화 정보 (선택) */}
    <div className="grid grid-cols-2 gap-3">
        <InfoCell label="소속 동아리" value="MADA" />
        <InfoCell label="기수" value="3기" />
    </div>
</MyProfileCard>

{/* 그 아래에 브랜드 전용 콘텐츠 */}
<div>탭, 게시글, 북마크, 설정 ...</div>
```

**금지사항:**
- ❌ `UniverseProfile` 컴포넌트 직접 넣기
- ❌ 아바타/이름/이메일 직접 표시 (`MyProfileCard`가 전담)
- ❌ `UniverseMembership` (레거시 — 전 사이트 제거 완료)

### 프로필 이미지 (아바타)

- **Storage**: Supabase `avatars` 버킷 (public, 2MB, jpeg/png/webp/gif)
- **처리**: 업로드 전 클라이언트에서 256×256 리사이즈 + WebP 압축 (~50KB)
- **경로**: `avatars/{user.id}/{timestamp}.webp`
- **DB**: `members.avatar_url` → `auth-context` → `user.avatarUrl`
- **업로드**: UniverseProfile 배너 호버 시 카메라 아이콘

### 유니버스 공통 데이터

| 데이터 | 파일 | 용도 |
|--------|------|------|
| 산업군 (`INDUSTRIES`) | `lib/badak-constants.ts` | MADLeague, Badak, HeRo 등 |
| 직무군 (`JOB_FUNCTIONS`) | `lib/badak-constants.ts` | 동일 |
| 전화번호 포맷 (`formatPhone`) | `components/MyProfileCard.tsx` | 전 브랜드 |

---

## 1.3.1 Capability 기반 회원 모델 (SSOT for 활동·역할)

> **원칙**: 브랜드에서 **기능(capability)을 분리**한다. 브랜드는 capability를 "탑재"만 하고,
> 회원은 `capability × 브랜드` 조합으로 **역할 인스턴스를 누적**한다.
> 한 사람이 유니버스를 돌아다니며 MADLeague 현역 → Badak 바닥장 → Jakka 창작자로 성장하는 여정을 모두 포착한다.

### 왜 capability 분리인가

**기존 사고**: "Badak 회원", "MADLeague 현역" — 브랜드가 역할을 정의 → 브랜드마다 회원 개념이 따로 굴러감
**현재 사고**: "meetup 개설자 @ Badak", "club 현역 @ MADLeague 2024" — 기능이 역할을 정의, 브랜드는 기능을 탑재한 공간

한 개인이 성장해 여러 브랜드에서 다양한 역할을 쌓아가는 것을 시스템이 자연스럽게 받쳐준다.

### 3테이블 구조

| 테이블 | 역할 |
|--------|------|
| `capabilities` | 유니버스 공용 기능 모듈 레지스트리 (확장 가능) |
| `brand_capabilities` | 각 브랜드가 어떤 capability를 탑재했는지 |
| `member_capability_roles` | 회원의 capability×브랜드별 역할 인스턴스 누적 |

### Capability 목록 (9종, 확장 가능)

| key | name_ko | 내장 roles | 대표 브랜드 |
|-----|---------|-----------|------------|
| `community` | 커뮤니티 | member | **전 브랜드 기본 탑재** (게시글·문의·반응) |
| `meetup` | 모임 | owner, participant | Badak, Rook, Townity, Domo |
| `club` | 동아리 | 현역, 임원, OB | MADLeague, MADLeap |
| `portfolio` | 포트폴리오 | creator | MoNTZ, Jakka, HeRo |
| `membership` | 승인 멤버십 | applicant, approved | YouInOne, Domo |
| `course` | 강의 | instructor, taker | MADLeap, HeRo, Badak, EvoSchool 등 |
| `showcase` | 일시 이벤트 | host, visitor | Jakka, Seoul360, MoNTZ, Mullaesian |
| `subscription` | 정기 구독 | subscriber | SmarComm, WIO, Mindle, MyVerse, BrandGravity |
| `purchase` | 건별 구매 | buyer | Planner's, HeRo, NatureBox, ChangeUp 등 |

> 내부 서비스(TenOne·Wiki·Dokdae)는 capability 모델 대상 아님 — `member_roles`(staff/manager/super_admin)로 계속 관리.

### 한 사람의 Universe 여정 예시

```
(club,         madleague,  현역,      {year:2023, club:MADA})
(club,         madleague,  임원,      {year:2024, role:회장})
(course,       hero,       수강자,     {test:career01})
(club,         madleague,  OB,        {grad_year:2024})   ← 2025 자동 전환
(community,    badak,      member)
(portfolio,    jakka,      creator)
(meetup,       badak,      owner,     {meetup:'바닥장X'})  ← 2026 성장
(course,       badak,      instructor,{course:'...'})
(subscription, wio,        subscriber,{plan:pro})
```

모든 변화는 **행 추가**. 과거 이력 보존, 현재는 `valid_until IS NULL` 필터.

### 자라나는 브랜드 대응

Mindle·FWN처럼 처음엔 `community`만 있는 브랜드가 수익화하면:
- 정기 뉴스레터 구독 → `subscription` 탑재
- 개별 리포트 판매 → `purchase` 탑재
- 오프라인 모임 → `meetup` 탑재

brand_capabilities row 1개 추가로 확장 완료 — 데이터 모델 변경 불필요.

### 작업 규약

- **신규 브랜드 추가 시**: `brand_capabilities` 시드에 해당 브랜드 × capability 조합 INSERT
- **capability 추가 시**: `capabilities` 테이블에 row + 연결되는 브랜드의 `brand_capabilities` row 생성
- **회원 역할 변화**: 기존 row UPDATE 금지 → 새 row INSERT (valid_from·valid_until로 시간 관리)
- **OB 전환**: 현역 row의 `valid_until` 설정 + OB role row INSERT
- **Universe Profile 집계**: `member_capability_roles`를 capability별 그룹핑 → 섹션 렌더
- **스키마 파일**: `sql/capability-model.sql`

### 기존 모델과의 관계

- `member_roles`(staff/manager/super_admin) → **권한 체계** 그대로 유지 (1.6절)
- `members.affiliations[]` → **이용 중인 브랜드 목록** 계속 관리
- 특화 프로필 테이블(`mad_applications`, `badak_profiles` 등) → **프로필 데이터**는 유지하되, 역할/상태는 `member_capability_roles`로 이관 권장

---

## 1.4 서비스 접근 모델 6종

> **모든 브랜드는 6가지 접근 모델 중 하나에 속한다.** 가입 경로·권한·UC 지급이 여기서 파생된다.

| 접근 모델 | 가입 경로 | 멤버 권한 | 해당 브랜드 |
|-----------|----------|----------|-----------|
| **오픈** | 이메일만 있으면 즉시 이용 | member | 0gamja, FWN, Jakka, Mindle, MoNTZ, Mullaesian, Myverse, NamingFactory, RooK, Seoul360, Townity |
| **구독** | 플랜 선택 + 결제 | subscriber | BrandGravity, SmarComm, WIO |
| **구매** | 건별 결제 (상담·교육·제품·모임비) | purchaser | HeRo, Planner's, ChangeUp, NatureBox, Badak |
| **승인 멤버십** | 신청서 → 운영진 심사/승인 | approved_member, leader | MADLeague, MADLeap, YouInOne, Domo |
| **직원** | 입사 → tenone_staff_profiles 등록 | staff, manager, super_admin | TenOne, Wiki |
| **내부** | 외부 노출 없음 (기록 전용) | internal | Dokdae |

### 브랜드별 특화 프로필 테이블 매핑

| 브랜드 | 테이블 | 고유 필드 |
|--------|--------|----------|
| MADLeague | `mad_applications` | club_slug, cohort, activity_year, university, major |
| Badak | `badak_profiles` | job_function, industry, job_level |
| HeRo | `career_profiles` | desired_position, desired_industry, skills |
| Jakka | `jakka_profiles` | handle, category, bio |
| (기타) | 추가 시 `universe-profile.ts`에 조회 함수 추가 |

### 새 서비스 프로필 연동 체크리스트

- [ ] 서비스별 테이블에 `email` 컬럼 있는가? (members 조인 키)
- [ ] `lib/supabase/universe-profile.ts`에 `get{Service}Profile()` 함수 추가
- [ ] `getAllServiceProfiles()`에 새 함수 등록
- [ ] `UniverseProfile.tsx` → `SERVICE_META`에 아이콘·설명·접근모델 추가
- [ ] 해당 사이트 마이페이지에서 공통 필드 수정 시 `updateUniverseProfile()` 호출

---

## 1.5 유니버스 코인 (UC) 정책

> **1 UC = 1 KRW** | 탈퇴 시 소멸 | 재가입 시 0 재시작
> 상세: [docs/Universe_Coin_Policy.md](docs/Universe_Coin_Policy.md)

### 원칙

| 원칙 | 내용 |
|------|------|
| 가치 비례 | 유니버스 기여가 클수록 많이 지급 |
| 남용 방지 | 월별 횟수 상한 (monthly_cap) 전 액션 적용 |
| 서비스 연동 | 특정 서비스 전용은 해당 `brand_id` / 전 브랜드 공통은 `brand_id=NULL` |
| 일회성 구분 | 전체 1회(GLOBAL) vs 브랜드별 1회(PER_BRAND) |
| 사용 제한 | 결제 건별 **최대 10%** UC 차감 (현금 환급 불가) |

### 핵심 테이블/API

| 리소스 | 위치 |
|--------|------|
| 테이블 | `uc_balances`, `uc_transactions`, `uc_rules` (`sql/universe-coin-tables.sql`) |
| 클라이언트 | `lib/supabase/uc.ts` |
| API | `app/api/uc/{balance,earn,redeem,restore,transactions}/route.ts` |
| 관리 API | `app/api/uc/admin/{grant,transaction,backfill}/route.ts` |
| UI | `components/UCBalanceCard.tsx` |
| 인트라 관리 | `app/intra/ums/uc/`, `app/intra/ums/uc/transactions/` |

### 주요 액션 단가 (요약)

| 카테고리 | 예시 | 지급액 |
|---------|------|--------|
| 온보딩 | `signup_complete` / `profile_complete` / `profile_advanced` | 최대 6,500 UC (생애 1회) |
| 커뮤니티 | `write_post` / `write_comment` / `post_featured` | 월 최대 8,000 UC |
| 마케팅 기여 | `submit_story` / `submit_interview` / `submit_article` | 월 최대 16,000 UC |
| 리뷰 | `write_review` | 월 1회 2,000 UC |

---

## 1.6 권한 체계 — `member_roles` 기반

> **모든 권한은 `member_roles(user_id, role, context, is_active)`에서 파생된다.**
> `members` 테이블의 권한 컬럼은 제거됨 (0-B Phase 완료).

### role 분류

| role | 부여 조건 | 접근 범위 |
|------|----------|----------|
| `member` | 기본 회원 | 본인 데이터 |
| `subscriber` | 구독 결제 완료 | 구독 기능 활성 |
| `purchaser` | 건별 결제 완료 | 구매 항목 접근 |
| `approved_member` | 멤버십 심사 승인 | 해당 커뮤니티 참여 |
| `leader` | 그룹/모임 리더 | 해당 그룹 관리 (context 종속) |
| `staff` | TenOne 직원 | Intra 접근 |
| `manager` | 매니저급 직원 | 담당 브랜드 관리 |
| `super_admin` | 마스터 (lools@tenone.biz) | 전체 시스템 |

### context 규약

- `brand:[siteId]` — 특정 브랜드 한정 (예: `brand:badak`, `brand:madleague`)
- `global` — 유니버스 전체
- `staff` — 직원 영역

### 인증 흐름

```
auth.users → member_roles 조회 → role + context 집합 → User 객체 권한 필드
```

- `lib/auth-context.tsx`가 `member_roles(role,context,is_active)` + `staff_profile:tenone_staff_profiles(...)` JOIN
- 각 API 핸들러는 user에서 role/context 꺼내 권한 검증
- RLS 정책도 `member_roles`를 참조 (service_role은 bypass)

---

## 1.6.1 Capability 레시피 — 즉시 쓸 수 있는 패턴 모음

> 이 레시피를 그대로 복사·수정해서 쓰면 설명 없이 작업 가능하다.

### 📥 레시피 1. 회원이 새 역할을 획득했을 때 (INSERT)

**상황**: Badak에서 누군가 모임을 개설 → `meetup owner` 역할 획득

```typescript
// app/api/badak/meetups/create/route.ts 등에서
await supabaseAdmin.from('member_capability_roles').insert({
  member_id: member.id,
  brand_id: 'badak',
  capability_key: 'meetup',
  role: 'owner',
  context: { meetup_id: newMeetup.id, meetup_name: newMeetup.name },
  // valid_from은 now() 기본값, valid_until은 NULL(진행 중)
});
```

**상황**: MADLeague 현역 가입

```typescript
await supabaseAdmin.from('member_capability_roles').insert({
  member_id, brand_id: 'madleague', capability_key: 'club',
  role: '현역',
  context: { year: 2026, club: 'MADA', university: '홍익대' },
});
```

### 🔄 레시피 2. 역할 전환 (OB 전환, 강사 승격 등)

**원칙**: 기존 row UPDATE 금지. **valid_until 설정 + 새 row INSERT**.

```typescript
// MADA 2024 현역 → OB 전환
const today = new Date().toISOString();

// 1. 기존 현역 row 종료
await supabaseAdmin
  .from('member_capability_roles')
  .update({ valid_until: today })
  .eq('member_id', memberId)
  .eq('brand_id', 'madleague')
  .eq('capability_key', 'club')
  .eq('role', '현역')
  .is('valid_until', null);

// 2. OB 신규 row
await supabaseAdmin.from('member_capability_roles').insert({
  member_id: memberId,
  brand_id: 'madleague',
  capability_key: 'club',
  role: 'OB',
  context: { grad_year: 2024, club: 'MADA' },
});
```

### 📖 레시피 3. 현재 활성 역할만 조회

```typescript
const { data: activeRoles } = await supabase
  .from('member_capability_roles')
  .select('brand_id, capability_key, role, context')
  .eq('member_id', memberId)
  .is('valid_until', null);
```

### 🧮 레시피 4. Universe Profile 집계 (capability별 섹션)

```typescript
// lib/supabase/universe-profile.ts에 추가
export async function getCapabilityAggregation(memberId: string) {
  const { data } = await supabase
    .from('member_capability_roles')
    .select('capability_key, brand_id, role, context, valid_until')
    .eq('member_id', memberId);

  // capability별로 그룹핑 — 현재 진행 + 과거 이력 분리
  const grouped: Record<string, { active: any[]; history: any[] }> = {};
  for (const row of data ?? []) {
    grouped[row.capability_key] ??= { active: [], history: [] };
    (row.valid_until ? grouped[row.capability_key].history : grouped[row.capability_key].active).push(row);
  }
  return grouped;
}
```

**UI 렌더**:
```tsx
// components/UniverseProfile.tsx
{Object.entries(capabilities).map(([key, { active, history }]) => (
  <Section title={CAPABILITY_LABELS[key]}>
    {active.map(r => <RoleBadge key={r.id} label={`${r.brand_id} · ${r.role}`} />)}
    {history.length > 0 && <HistoryFold items={history} />}
  </Section>
))}
```

### 🆕 레시피 5. 새 브랜드가 기능 추가

```sql
-- Mindle이 오프라인 모임 시작
INSERT INTO brand_capabilities(brand_id, capability_key) VALUES ('mindle', 'meetup')
ON CONFLICT DO NOTHING;
```

파일도 갱신: `sql/capability-model.sql`의 시드 블록에 row 추가(재실행 대비).

### 🆕 레시피 6. 완전히 새 capability 추가 (예: `mentor`)

```sql
INSERT INTO capabilities(key, name_ko, description, built_in_roles) VALUES
('mentor', '멘토링', '1:1 또는 그룹 멘토링', ARRAY['mentor','mentee']);

INSERT INTO brand_capabilities(brand_id, capability_key) VALUES
('hero', 'mentor'), ('badak', 'mentor');
```

CLAUDE.md의 capability 표에도 추가. 코드에서 `CAPABILITY_LABELS['mentor'] = '멘토링'` 상수 갱신.

### ⚠️ 금지 패턴

- ❌ `member_capability_roles` row UPDATE로 role 변경 (→ 이력 유실)
- ❌ `valid_until`을 과거 시점으로 거꾸로 쓰기 (→ 정합성 깨짐)
- ❌ `brand_capabilities`에 없는 capability로 role INSERT (→ 무결성 위반, 앱 레벨 체크 필요)
- ❌ capability 키 이름 임의 변경 (→ `capabilities.key`는 불변 약속)

---

## 1.7 WIO 모듈 공유 원칙

> WIO는 Ten:One Universe의 **공유 IT 인프라**다. 각 브랜드는 WIO 모듈을 가져다 쓴다. 별도 백엔드를 만들지 않는다.
> **완전 설계서**: [docs/WIO_Master_Architecture.md](docs/WIO_Master_Architecture.md)

### WIO 모듈 사용 매핑

| WIO 모듈 | 사용 브랜드 | 용도 |
|----------|-----------|------|
| ERP (재무/HR/결재/GPR) | TenOne 인트라 | 기업 운영 |
| Project + People + Talk | MADLeague, MADLeap | 커뮤니티 멤버·프로젝트 관리 |
| Marketing + Campaign | SmarComm | 마케팅 커뮤니케이션 |
| Crawler + Content Pipeline | Mindle | 크롤링→트렌드 콘텐츠 |
| Sales + CRM | HeRo, Badak | 인재 매칭, 네트워킹 |
| Learn + Wiki | Evolution School, Planner's | 교육·지식 관리 |
| Timesheet + Finance | YouInOne | 크루 시수·정산 |

### 3대 자원 — 모든 모듈의 기준

| 자원 | 의미 | 모듈 역할 |
|------|------|----------|
| **사람** | 누가, 몇 명, 어떤 역할 | People, Team, Permission |
| **돈** | 얼마, 수익, 비용, 정산 | Finance, Budget, Billing |
| **시간** | 언제까지, 몇 시간, 일정 | Timesheet, Schedule, Deadline |

모든 WIO 모듈은 사람·돈·시간 중 최소 하나를 관리한다.

### WIO 2-Tier 모델

| Tier | 이름 | 설명 | DB 격리 |
|------|------|------|---------|
| **규격 서비스** | Subscription | 등급별 기능 제한, 셀프서비스 | `tenant_id` + feature flags |
| **맞춤 서비스** | Custom Installation | 클라이언트 최적화 용역 | `tenant_id` + custom config |

### WIO 가격

| Free | Starter | Pro | Business | Enterprise |
|------|---------|-----|----------|-----------|
| 0원/5명 | 4.9만/20명 | 14.9만/100명 | 39.9만/무제한 | 협의 |

### 기술 환류 원칙 (Tech Flywheel)

```
맞춤 서비스 개발 → 기술 진보 → WIO 코어 흡수 → 규격 서비스 업그레이드 → (반복)
```

| 구분 | 처리 |
|------|------|
| 일반화 가능 기능 | WIO 코어 흡수 → 규격 서비스 포함 |
| 특정 고객 데이터 | 고객 tenant에만 유지 |
| UI 커스텀 | 테마/config로 추상화 후 흡수 |
| 고객 전용 로직 | 맞춤 레이어 유지 |

### 새 모듈 체크리스트 (docs/WIO_Master_Architecture.md PART 10)

- [ ] 모든 테이블에 brand_id 컬럼?
- [ ] RLS 정책이 brand_id 기반?
- [ ] TenOne super_admin은 전체 접근?
- [ ] 모듈 간 연동은 API/이벤트로만 (직접 JOIN 금지)?
- [ ] API 응답 구조가 APIResponse<T> 형식?
- [ ] 외부 기업이 써도 작동?
- [ ] 7가지 입장(사용자·관리자·TenOne·외부·보안·확장·AI) 검증 완료?

---

## 1.8 테넌트 격리 아키텍처

```
tenant_id = 계약 단위 (TenOne, XXXX Corp, VVVV Inc...)
brand_id  = 유니버스 내부 브랜드 구분 (LUKI, Badak, MADLeague...)
```

- 내부 브랜드: `tenant_id='tenone'` + `brand_id`로 구분
- 외부 고객: 각자 `tenant_id` 보유
- Universe 분석 레이어 (Mindle/Whole See): 전체 tenant 크로스 분석 (PII 제거)

### DB 테이블 3분류

| 분류 | 접두사 | tenant_id | 외부 판매 |
|------|--------|-----------|----------|
| 제품 모듈 (판매용) | `wio_*` | 필수 | O |
| 내부 운영 (자사) | `wio_*` | tenone 고정 | X (코드는 WIO 소유) |
| Universe 운영 | `brand_id` 기반 | N/A | X |

---

## 1.9 인트라 통합 관리

> **인트라는 유니버스의 유일한 통합 관리 콘솔이다.**
> 4대 제품·26+ 브랜드·모든 멤버·모든 UC 거래가 여기서 제어된다.

### 주요 관리 영역

| 영역 | 경로 | 역할 |
|------|------|------|
| ERP | `/intra/erp` | CRM(people/segments), HR(staff/gpr), 재무 |
| Marketing | `/intra/marketing` | 캠페인, leads, deals, 콘텐츠, 분석 |
| Studio | `/intra/studio` | 브랜드, 일정, 에셋, workflow |
| UMS — Sites | `/intra/ums/sites/list` | 사이트 메타, 오픈/차단, 브랜딩, SEO |
| UMS — Members | `/intra/ums/members/list` | 전 멤버 검색/필터, 프로필, 권한 |
| UMS — Privacy | `/intra/ums/members/privacy` | 개인정보 로그, 탈퇴 처리 |
| UMS — UC | `/intra/ums/uc` | UC 정책/잔액/지급 관리 |
| UMS — UC 거래 | `/intra/ums/uc/transactions` | 모든 UC 거래 원장 |
| UMS — 브랜드별 | `/intra/ums/{brand}/*` | Badak·Jakka 등 브랜드 전용 관리 |
| Wiki | `/intra/wiki` | 내부 지식 베이스 |

### 권한 게이트

- Intra 접근: `role IN ('staff','manager','super_admin')`
- 브랜드별 관리 패널: `role='manager'` + `context='brand:{siteId}'` 또는 `super_admin`
- 마스터 전용: `super_admin` (lools@tenone.biz)

### 인트라 ↔ 사이트 반영 흐름

```
인트라 수정 → upsertSiteConfig() → ums_sites 테이블 → site_configs VIEW
                                                         ↓
                                    getSiteConfigServer() (ISR 10분)
                                                         ↓
                                         각 사이트 generateMetadata()
```

- 브랜딩 이미지: 드래그앤드롭 → Supabase Storage `site-branding` 버킷
- SEO 메타: 저장 → DB 반영 → ISR 10분 내 실사이트 반영
- AI 최적화: llms.txt, robots.txt AI 설정, JSON-LD 구조화 데이터
- 사이트 오픈/닫기: 토글 → `ums_sites.is_open` 즉시 반영

---

## 1.9.1 Action Hub Registry — 브랜드 액션 자동 집계 SSOT

> **원칙**: 각 브랜드의 "처리 대기 액션"(승인·CS·개인정보·결제 등)은 하나의 레지스트리에 등록하고,
> Dashboard Action Hub가 자동으로 pending count를 집계해 카드로 표시한다.

### SSOT 파일

`lib/action-hub-registry.ts` — 전 유니버스 공통 레지스트리

```typescript
export const ACTION_HUB_REGISTRY: ActionEntry[] = [
  {
    key: "jakka_seller_applications",
    label: "Jakka 판매자 심사",
    table: "jakka_seller_applications",
    filter: { column: "status", value: "pending" },
    href: "/intra/ums/jakka/sellers",
    brand_id: "jakka",
    category: "approval",
    priority: "high",
  },
  // ...
];
```

### 작동 원리

1. Dashboard 로드 시 레지스트리의 각 entry에 대해 `SELECT count(*) WHERE {filter}` 병렬 실행
2. count > 0인 항목만 카드로 렌더링 (category 그룹핑 + priority 정렬)
3. 클릭 시 `href`의 관리 페이지로 이동

### 카테고리 6종

| category | 의미 | 예시 |
|---|---|---|
| `approval` | 승인 대기 | 지원서, 심사 |
| `cs` | 고객 응대 | 문의, Q&A 미답변 |
| `privacy` | 개인정보 | 탈퇴 요청 |
| `moderation` | 콘텐츠 모더레이션 | 신고 처리 |
| `payment` | 결제 | 주문 확정 대기 |
| `agent` | 에이전트 | 지시 대기, 메시지 |

### Priority 3단계

`critical` (🚩 즉시) · `high` (↑ 24h 내) · `normal` (일반)

### 새 브랜드 추가 시 (§2.4 체크리스트 연동)

- [ ] 브랜드에 관리자 처리 필요 테이블이 있으면 `ACTION_HUB_REGISTRY`에 entry 추가
- [ ] 브랜드 CLAUDE.md `## Action Hub Entries` 섹션에 등록 내역 기록
- [ ] 테이블 스키마에 `status` 컬럼이 있고 `'pending'` 같은 대기 상태 값을 사용하는지 확인
- [ ] `href`가 실제 존재하는 관리 페이지인지 확인

### 금지 패턴

- ❌ Dashboard Action Hub에 브랜드별 쿼리 하드코딩 (레지스트리 통과 필수)
- ❌ 브랜드 사이트 자체 대시보드에 동일 count 재구현 (SSOT 위반)
- ❌ `status` 컬럼 없이 pending 의미를 다른 방식으로 표현 (예: boolean `is_reviewed`)

---

## 1.10 개발 규칙 — 모순 방지 8원칙

| # | 규칙 | 위반 시 문제 |
|---|------|------------|
| 1 | 구독 테이블은 `wio_subscription_plans` 하나만 쓴다 | 브랜드마다 구독 테이블 → 관리 불가 |
| 2 | Intra 전용 운영 테이블을 새로 만들지 않는다 (WIO 사용) | Intra·WIO 기능 이중 구현 |
| 3 | 브랜드 사이트는 Supabase만 바라본다 (Intra API 직접 호출 금지) | 브랜드 간 의존성 |
| 4 | SmarComm WS = WIO MKT-* 위의 어플리케이션 (이중 구현 금지) | 마케팅 기능 중복 |
| 5 | 에이전트는 사람과 같은 API를 쓴다 | 에이전트 전용 API → UI 동기화 깨짐 |
| 6 | 모든 테이블에 `brand_id` 또는 `tenant_id`가 있다 | RLS 격리 불가 |
| 7 | `site_configs.site_id`와 각 브랜드 layout 식별자가 일치해야 한다 | SEO·테마 연동 깨짐 |
| 8 | 맞춤 서비스 개발 기술은 WIO 코어에 환류한다 (Tech Flywheel) | 기술 자산 사장 |

### 새 테이블 생성 전 체크리스트

- [ ] WIO 기존 테이블로 해결 안 되는가?
- [ ] `brand_id` 또는 `tenant_id` 컬럼이 있는가?
- [ ] RLS 정책이 `brand_id`/`tenant_id` 기반인가?
- [ ] 외부 기업이 써도 작동하는가?
- [ ] 맞춤 서비스에서 나온 기능이라면, 규격 서비스로 환류 가능한가?

---

# 2. 브랜드별 가이드 규약

## 2.1 계층형 CLAUDE.md 체계

각 브랜드 그룹 루트(`app/(BrandName)/CLAUDE.md`)에 브랜드 전용 가이드를 둔다.
Claude Code는 해당 브랜드 파일을 편집할 때 **자동으로 함께 로드**한다. 수동 참조 불필요.

## 2.2 브랜드 CLAUDE.md 템플릿

```markdown
# [BrandName] 브랜드 가이드

## 정체성
- 한 줄 소개:
- 톤앤매너:
- 주 컬러: (hex)
- 디자인 방향:

## 접근 모델
- 유형: [오픈/구독/구매/멤버십/직원/내부]
- 가입 경로:
- 멤버 권한: [member/leader/...]

## 프로필 특화
- 특화 테이블: `[brand]_profiles` (또는 해당)
- 고유 필드:
- universe-profile.ts 조회 함수: `get{Brand}Profile()`

## 권한 체계
- role 종류: [member, leader, admin, ...]
- context: `brand:[siteId]`
- 인트라 관리 권한: `/intra/ums/[brand]/*`

## UC 정책 특이사항
- 브랜드 전용 액션: (있으면 action_key 나열)
- brand_id 지정 여부:

## Action Hub Entries
- (관리자 처리 필요 테이블이 있으면 나열)
- 예: `{brand}_applications` · status='pending' · /intra/ums/{brand}/applications · category=approval · priority=normal
- `lib/action-hub-registry.ts`에 등록된 항목과 일치해야 함

## 핵심 파일
- `app/(BrandName)/layout.tsx` — generateMetadata
- `app/(BrandName)/[brand]/page.tsx` — 랜딩
- `app/(BrandName)/[brand]/my/page.tsx` — 마이페이지 (MyProfileCard)
- `features/[brand]/` — 브랜드 전용 컴포넌트
- `lib/supabase/[brand].ts` — DB 클라이언트
- `app/api/[brand]/*` — 브랜드 전용 API

## 인트라 관리 경로
- `/intra/ums/[brand]/...`

## 개발 주의사항
- (브랜드 고유 제약/결정사항/피해야 할 패턴)

## 현재 상태
- Phase:
- 이월 작업:
```

## 2.3 브랜드 CLAUDE.md 자동 갱신 규칙

> **원칙**: 세션 중 `app/(BrandName)/` 하위 파일을 하나라도 편집했으면,
> "작업 종료" 프로토콜 1단계에서 **반드시** 해당 브랜드의 `app/(BrandName)/CLAUDE.md`도 함께 갱신한다.

### 트리거 감지 방법

작업 종료 시점에 다음 명령으로 이번 세션에 건드린 브랜드를 식별:

```bash
git diff --name-only origin/master...HEAD | grep -oP 'app/\(\K[^)]+' | sort -u
```

또는 스테이지된 변경에서:
```bash
git status --short | grep -oP 'app/\(\K[^)]+' | sort -u
```

→ 출력된 각 브랜드명에 대해 `app/(BrandName)/CLAUDE.md`를 갱신 대상에 포함.

### 갱신 대상 섹션 (템플릿 기준)

| 섹션 | 갱신 조건 |
|------|----------|
| **현재 상태 — Phase** | 마일스톤 완료·새 Phase 진입 시 |
| **현재 상태 — 이월 작업** | 작업 완료 / 신규 이월 발생 시 |
| **핵심 파일** | 새 파일 추가·주요 파일 삭제 시 |
| **개발 주의사항** | 사고·교훈·결정사항 발생 시 |
| **접근 모델 / 권한 체계** | 모델·권한 구조 변경 시 |
| **UC 정책 특이사항** | 브랜드 전용 action_key 추가·변경 시 |
| **프로필 특화** | 특화 테이블·필드 변경 시 |

### 갱신 양식 (간결하게)

```markdown
## 현재 상태
- Phase: M2 진행 중 (2026-04-20 업데이트)
- 이월 작업:
  - M2-C: /member/projects 참여 프로젝트 목록
  - M2-E: /member/portfolio + 퍼블릭 포트폴리오
- 최근 결정: ...
```

### Claude가 수행해야 할 절차

"작업 종료"를 받으면 다음을 순서대로 실행:

1. `git diff --name-only origin/master...HEAD`로 변경 파일 목록 확인
2. `app/(BrandName)/` 경로에서 브랜드명 추출 (중복 제거)
3. 각 브랜드의 `app/(BrandName)/CLAUDE.md`를 Read
4. 이번 세션 변경사항을 반영해 해당 브랜드 CLAUDE.md의 "현재 상태" 등을 Edit
5. 이후 기존 작업 종료 프로토콜(WORK_STATUS → CHANGELOG → ROADMAP → commit → push) 계속

> ⚠️ 브랜드 CLAUDE.md가 아직 존재하지 않는 브랜드(Step 3 전 단계)는 건너뛰고 이후 세션에서 일괄 생성.

---

## 2.4 새 브랜드 추가 체크리스트

- [ ] `lib/site-config.ts` → `siteConfigs`에 추가 + `SiteIdentifier` 타입에 추가
- [ ] `lib/site-config.ts` → `domainMap`에 도메인 매핑 추가 (독립 도메인일 경우)
- [ ] `lib/site-context.tsx` → `pathSiteMap`에 경로 매핑 추가
- [ ] `lib/domain-registry.ts` → 서브도메인/외부 도메인 등록 (해당 시)
- [ ] `lib/intra-nav.ts` → 사이드바 브랜드 목록에 추가 (알파벳순)
- [ ] DB: `ums_sites` 테이블에 INSERT
- [ ] DB: `brand_capabilities`에 최소 `community` row INSERT (+ 해당 브랜드가 쓰는 capability 전부)
  → 시드 파일 `sql/capability-model.sql`에도 같은 row 추가해 재실행 시 보존
- [ ] `app/(BrandName)/layout.tsx` → `generateMetadata()` + `getSiteConfigServer()` 필수
- [ ] `app/(BrandName)/CLAUDE.md` → 템플릿 기반 브랜드 가이드 생성
- [ ] `app/(BrandName)/brandname/page.tsx` → `UnderConstruction` 또는 전용 랜딩
- [ ] `app/(BrandName)/brandname/my/page.tsx` → `<MyProfileCard>` 적용
- [ ] Vercel 프로젝트에 도메인 연결 + env 동일하게 설정
- [ ] Supabase Auth > Allowed Redirect URLs에 `https://새도메인/**` 추가
- [ ] 특화 프로필 테이블 필요 시 `universe-profile.ts`에 조회 함수 추가
- [ ] `UniverseProfile.tsx` → `SERVICE_META`에 아이콘·설명·접근모델 등록
- [ ] **Action Hub**: 관리자 처리 필요 테이블이 있으면 `lib/action-hub-registry.ts`에 entry 추가 (승인·CS·개인정보·결제 유형별)
- [ ] 브랜드 CLAUDE.md에 `## Action Hub Entries` 섹션으로 등록 내역 기록

---

# 3. 동기화 필수 파일 (집↔사무실)

> **목적**: 집/사무실/새 Claude 세션 — 어디서든 "작업 시작"만 말하면 어제 상태 그대로 이어받아야 한다.
> 아래 파일들은 **반드시** 커밋·푸시되어야 다음 장소에서 이어갈 수 있다.

> **브랜치 정책**: master 단일 브랜치. 집/사무실 모두 master에서 작업.

## 3.1 push/pull 대상 (git 추적 필수)

| 분류 | 파일 | 역할 | 갱신 타이밍 |
|------|------|------|-----------|
| **지시** | `CLAUDE.md` | 유니버스 공통 가이드 (이 파일) | 원칙·프로토콜 변경 시 |
| **지시** | `app/(BrandName)/CLAUDE.md` | 브랜드별 가이드 | 브랜드 정책·구조 변경 시 |
| **상태** | `WORK_STATUS.md` | 현재 진행 상황 + 다음 할 일 | 작업 시작/종료 시 |
| **기록** | `CHANGELOG.md` | 날짜별 변경 이력 | 작업 종료 시 |
| **계획** | `ROADMAP.md` | 전체 로드맵 + 체크리스트 | 마일스톤 완료/추가 시 |
| **설계** | `docs/Universe_Coin_Policy.md` | UC 정책 상세 | 정책 변경 시 |
| **설계** | `docs/WIO_Master_Architecture.md` | WIO 단일 진실 소스 | WIO 설계 변경 시 |
| **설계** | `docs/Universe_OS_Plan.md` | UOS Phase 계획 | Phase 진행 시 |
| **UX** | `UX_GUIDE.md` | UX 디테일 표준 | 신규 UX 패턴 확정 시 |
| **스키마** | `sql/*.sql` | SQL 마이그레이션 | 새 테이블·정책 생성 시 |
| **코드** | `app/`, `components/`, `features/`, `lib/`, `types/` | 애플리케이션 코드 | 작업 진행 시 |

## 3.2 push/pull 대상이 아닌 것 (gitignore)

- `.env.local` — 환경변수 (Vercel에서 개별 관리)
- `node_modules/` — 의존성
- `.next/` — 빌드 산출물
- 로컬 스크래치 파일, 임시 메모

## 3.3 관리 파일 읽는 순서 (작업 시작 시)

1. `WORK_STATUS.md` — 어제 멈춘 지점 파악
2. `CHANGELOG.md` — 최근 변경 맥락
3. `ROADMAP.md` — 전체 방향성
4. (해당 브랜드 작업이면) `app/(BrandName)/CLAUDE.md` — 브랜드 컨텍스트

---

# 4. 작업 프로토콜

## 4.1 "작업 시작" 프로토콜

> **⛔ 이 6단계는 어떤 상황에서도 건너뛰기 금지. Plan Mode든, 권한 제한이든, 1번부터 순서대로 실행한다.**
> Plan Mode 활성 시 "pull부터 해야 합니다. Plan Mode를 해제합니다" 말하고 해제 후 실행.
> read-only 제한으로 실행 불가한 단계는 사용자에게 즉시 알리고 해결 후 진행.

```
1. git checkout master          ← 항상 master로 (어떤 브랜치에 있든)
2. git pull origin master       ← ⛔ 절대 생략 금지. 생략하면 충돌·중복 작업
3. 상황 파악                     ← WORK_STATUS.md → CHANGELOG.md → ROADMAP.md 순서
4. 개발 서버 실행 (필요 시)      ← 실제 화면을 눈으로 확인 (코드만 보고 판단 금지)
5. 브리핑 보고                   ← 아래 양식으로 사용자에게 보고
6. 사용자 확인 후 작업 시작
```

**브리핑 양식:**
```
📋 현황 브리핑
- 마지막 작업: [날짜] [장소]
- 완료된 것: [핵심만]
- 이어서 할 것: [바로 시작할 수 있게 구체적으로]
- 이슈/주의: [있으면]
```

**위반 사례 (반복 금지):**
- 2026-04-14: Plan Mode 핑계로 git pull 생략 → 원격 변경 모르고 작업 → push 시 충돌

## 4.2 "작업 종료" 프로토콜

> **⛔ 사용자가 "작업 종료"라고 말했을 때만 실행. Claude가 임의로 실행 금지.**

```
1. 변경 브랜드 식별
   git diff --name-only origin/master...HEAD | grep -oP 'app/\(\K[^)]+' | sort -u
2. 작업 기록 (아래 4개 파일 세트)
   - WORK_STATUS.md (오늘 한 것 + 다음 할 것)
   - CHANGELOG.md (날짜/장소/파일/결정사항)
   - ROADMAP.md (완료 체크 + 새 항목)
   - ⭐ 1단계에서 식별된 각 브랜드의 `app/(BrandName)/CLAUDE.md` 갱신
        → 현재 상태(Phase/이월), 핵심 파일, 주의사항 반영
        → 상세: [2.3 브랜드 CLAUDE.md 자동 갱신 규칙](#23-브랜드-claudemd-자동-갱신-규칙)
3. git add + commit ← 코드 + 관리 파일 + 브랜드 CLAUDE.md 모두
4. git push origin master ← ⛔ 이 순간에만 push. 세션 중 유일한 1회.
```

### "다음 할 일" 작성 원칙

- ❌ "스캔 페이지 개선" (막연함)
- ✅ "스캔 페이지 > 경쟁사 비교 섹션 > 레이더 차트 아래 상세 테이블 추가. Mock 데이터 3개, 컬럼은 항목/자사/경쟁사A/경쟁사B. `components/ScanPage.tsx` 350줄부터."

## 4.3 비용 관리 — 절대 엄수

> **위반 시 실제 금전적 손실 발생. 아래는 코딩 컨벤션이 아니라 운영 규칙.**

| 규칙 | 이유 | 위반 사례 |
|------|------|----------|
| **push는 "작업 종료" 또는 명시적 배포 요청 시 1회만** | push 1회 = Vercel 빌드 1회 = 크레딧 소진 | 2026-04-13: 세션 중 18회 push → $1.95 / 2026-04-15: "실서버 반영" 1회 요청에 이후 변경마다 계속 push |
| **`vercel deploy` / `npm run deploy:*` 직접 실행 금지** | 중복 빌드 발생 — git push가 유일한 배포 경로 | 2026-04-13: Claude가 직접 deploy 18회 |
| **commit은 로컬에서 자유** | 로컬 commit = $0 | — |
| **`npm run dev`로 로컬 확인** | 로컬 서버 = $0 | — |
| **On-Demand 상한 $100 설정됨** | 초과 과금 방어 | — |
| **서브에이전트는 Haiku로** | 토큰 비용 80% 절감 | — |
| **기본 모델은 Sonnet** | Opus는 복잡한 아키텍처/디버깅만 | — |

## 4.4 Context Rot 방지 + 토큰 최적화

### Compact 타이밍
- `/compact` — 마일스톤 사이에서만 (리서치→구현 전, 디버깅→다음 기능 전, 모듈 완료 후)
- `/clear` — 완전히 다른 작업 전환 시
- ❌ 구현 도중 compact (변수·경로 유실)
- ❌ auto-compaction 의존 (작업 중간 트리거 위험)

### 컨텍스트 윈도우 관리
- 루트 `CLAUDE.md`는 계속 성장하지만, 토큰 경고 시 상세는 브랜드 CLAUDE.md나 `docs/`로 분산
- 마지막 20%에서 대규모 리팩토링 금지 → 먼저 `/compact`
- `/cost` `/context`로 수시 확인

### MCP 서버 제한
- 프로젝트당 MCP 10개 이하, 활성 도구 80개 이하
- 미사용 MCP 비활성화

### 서브에이전트 활용
- 파일 탐색·읽기 많은 작업 → 서브에이전트 위임
- 메인 세션에서 파일 10개+ 금지
- 서브에이전트는 Haiku (비용 80% 절감)

### 토큰 경고 신호 — 즉시 `/compact` 또는 `/clear`
- 같은 실수 2~3번 반복
- 이전 규칙 까먹음
- 시키지 않은 파일 건드림
- 응답 품질 하락

## 4.5 QA Protocol

"QA해줘" 또는 "보안 점검" 시 아래 실행.

### 코드 리뷰 기준

**구조**: 파일 200~400줄 기본, 800줄 초과 시 분리 / early return (3단계+ 중첩 금지)
**불변성 (Critical)**: 객체·배열 mutation 금지, 함수 인자 직접 수정 금지
**에러 핸들링**: 빈 catch 금지 / UI는 친화적 메시지, 서버는 상세 로깅
**입력 검증**: 시스템 경계에서 스키마 검증, 외부 데이터 불신
**React/Next.js**: useEffect 의존성 완전성, 리스트 key에 index 금지

### TypeScript + 빌드

```bash
npx tsc --noEmit       # 타입 에러 0
npx eslint . --ext .ts,.tsx
npm run build          # 빌드 에러 0
npm audit --audit-level=high
```

### 보안 감사

**Phase 1 체크리스트**: 시크릿·권한·MCP·훅/인젝션·인프라·공급망·에이전트·런타임·출력·샌드박싱
**Phase 2 레드팀/블루팀**: 서브에이전트 2개로 레드/블루 역할 분담
**Phase 3 분류**: Critical/High/Medium/Low, Critical/High 즉시 보고

### 코드 메트릭 (분기 점검)

```bash
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -20
grep -r ': any' src --include='*.ts' --include='*.tsx' | wc -l
grep -r 'console.log' src --include='*.ts' --include='*.tsx' | wc -l
grep -rn 'TODO\|FIXME' src | wc -l
```

---

## 부록 A. 절대 하지 말 것 (통합)

### 배포·Git
- ❌ `vercel deploy` / `npm run deploy:*` 직접 실행
- ❌ 작업 중간 push (크레딧 소진)
- ❌ master 외 브랜치에서 작업
- ❌ pull 없이 로컬 파일만 보고 시작
- ❌ 화면 안 보고 코드만 보고 판단
- ❌ push 빼먹기 (다음 장소에서 못 이어감)

### 인증·DB
- ❌ `auth.users` 테이블 UPDATE/DELETE (Supabase Dashboard에서 사용자가 직접)
- ❌ RLS disabled 테이블 생성
- ❌ `tenant_id` / `brand_id` 없는 신규 테이블
- ❌ 프론트엔드에 `service_role` 키 노출

### 프로필·메타
- ❌ `UniverseMembership` 사용 (레거시)
- ❌ 각 브랜드 마이페이지에서 아바타/이름/이메일 직접 표시 (MyProfileCard 전담)
- ❌ 레이아웃에 `export const metadata` (정적)
- ❌ 페이지에 "준비 중" / "Coming Soon" 텍스트 직접 표시

### 커뮤니케이션
- ❌ 실제 안 한 작업을 완료로 기록
- ❌ "다음 할 일"을 막연하게 작성
- ❌ "작업 종료할까요?" 등 자발적 묻기 — 사용자가 말할 때까지 계속 진행
- ❌ 각 서비스의 톤앤매너 무시

---

## 부록 B. 코딩 컨벤션

- 한국어 UI/주석 사용
- 컴포넌트: PascalCase 파일명
- 타입 정의는 반드시 `types/` 디렉토리에
- Context 패턴: `lib/{feature}-context.tsx` + `lib/{feature}-data.ts`
- 스타일: Tailwind 유틸리티 클래스 사용, 커스텀 CSS 최소화
- 경로 별칭: `@/*` → 프로젝트 루트

---

## 부록 C. 상태 관리 아키텍처

- **상태**: React Context (auth, crm, staff, gpr, marketing, workflow 각각 별도)
- **데이터**: `lib/*-data.ts` (Mock) + `lib/*-context.tsx` (상태 로직)
- **타입**: `types/` 디렉토리에 모든 인터페이스
- **라우팅**: Next.js App Router, `(public)` / `(BrandName)` 그룹으로 레이아웃 분리

---

## 부록 D. Supabase SQL 직접 실행

> **Claude가 SQL을 직접 실행한다. 사용자가 Dashboard에서 수동으로 실행할 필요 없다.**

- **PAT**: `.env.local`의 `SUPABASE_ACCESS_TOKEN`
- **실행 스크립트**: `scripts/run-sql.js` — `queries` 배열에 SQL 추가 후 `node scripts/run-sql.js`
- **API**: `POST https://api.supabase.com/v1/projects/ziotlxkdctlhiwkgmmsh/database/query`
  - DDL 성공 응답: HTTP 201, body `[]`
  - SELECT 성공 응답: HTTP 201, body `[{...rows}]`

**새 테이블 워크플로우:**
1. `sql/` 폴더에 SQL 파일 작성 (CREATE TABLE + INDEX + RLS + 시드)
2. `scripts/run-sql.js`에 추가 또는 직접 실행
3. Dashboard 접속 요청 불필요

---

## 부록 E. Universe Operating System (UOS)

> 이것은 일반적인 웹앱이 아니다. AI 에이전트가 Universe를 운영하는 시스템이다.

### 핵심 원칙

1. 모든 API = 두 소비자: 프론트엔드 UI + AI 에이전트
2. `agent_profiles` = 심장 (System Prompt, 지식, 도구)
3. `agent_messages` = 추적 (모든 에이전트 행위 로그)
4. 모듈 = Tool (WIO 모듈 완성 시 자동으로 해당 에이전트의 Tool)
5. 기존 프론트 143p는 건드리지 않는다 — 백엔드 API만 만들고 연결

### 개발 단계

- Phase 0: 인프라 기초 (진행 중 — tenant_id 일괄 추가, 중복 테이블 정리)
- Phase 1: 에이전트 코어 (agent_profiles + Agent Hub + Claude API)
- Phase 2: 바닥쇠 실전 (첫 독립 에이전트)
- Phase 3: tenone.biz 모듈 (프론트↔백엔드 연결)
- Phase 4: 에이전트 확장 (브랜드 에이전트 추가)

상세: [docs/Universe_OS_Plan.md](docs/Universe_OS_Plan.md)

---

## 부록 F. 현재 상태

- Intra 143p: UI + DB 대부분 완성
- 4대 제품 통제 레이어: 구축 중 (Phase 1)
- 구독 인프라: 미구현 (Phase 2)
- 에이전트: Agent Hub 코드 완성, Prod DB 실행 필요
- 상세 로드맵: [ROADMAP.md](ROADMAP.md)
- 작업 현황: [WORK_STATUS.md](WORK_STATUS.md)
- 변경 이력: [CHANGELOG.md](CHANGELOG.md)
- 아키텍처: `TenOne_Universe_Architecture_v1.md` (G드라이브)
- 4대 제품: `TenOne_4Products.md` (G드라이브)

---

## 부록 G. 외부 리소스 운영 절차

> **외부 리소스 = 코드베이스 밖에서 설정하는 SaaS/플랫폼.**
> UI로 직접 조작해야 하며, Claude Code가 브라우저를 통해 작업한다.
> 보안 자격증명이 아닌 절차 지식은 여기에 정리한다.

---

### G.1 Google Tag Manager (GTM)

#### 기본 정보

| 항목 | 값 |
|------|-----|
| 컨테이너 ID | `GTM-564KNJ9S` |
| 환경변수 | `NEXT_PUBLIC_GTM_ID` (`.env.local`) |
| 계정/컨테이너 | accounts/6349483070/containers/249197853 |
| GA4 측정 ID | `G-6N89DJMB7C` |
| 연동 방식 | `components/Analytics.tsx` → dataLayer push → GTM → GA4 |

#### SPA 트래킹 구조

Next.js SPA는 페이지 이동 시 HTML 새로고침이 없으므로 GTM의 "All Pages" 트리거가 초기 로드만 잡는다.
해결책: `Analytics.tsx`가 pathname 변경마다 dataLayer에 커스텀 이벤트를 push, GTM 맞춤 이벤트 트리거로 감지.

```
pathname 변경
  → Analytics.tsx: window.dataLayer.push({ event: "page_view", page_path, brand_id: siteId })
  → GTM: CE - page_view 트리거 감지
  → TenOne_Tag: GA4 이벤트 전송 (매개변수: brand_id)
  → GA4: 전체 브랜드 페이지뷰 집계
```

#### 구축된 구성 요소

| 이름 | 유형 | 설명 |
|------|------|------|
| `Google 태그` | 태그 | GA4 기본 연결 태그 |
| `TenOne_Tag` | GA4 이벤트 태그 | 이벤트명 `page_view`, 매개변수 `brand_id: {{DLV - brand_id}}` |
| `DLV - brand_id` | 데이터 영역 변수 | dataLayer에서 `brand_id` 값 읽음 |
| `CE - page_view` | 맞춤 이벤트 트리거 | `event: "page_view"` 감지 |

#### GTM UI 조작 절차

**태그 편집 (트리거 교체 등)**
1. GTM 좌측 메뉴 "태그" 클릭
2. 편집할 태그 행 클릭 → 상세 화면 진입
3. 우측 상단 **연필(✏️) 아이콘** 클릭 → 편집 모드 진입
   - ⚠️ 편집 모드 진입 전에는 트리거 클릭해도 피커가 열리지 않음
4. 트리거 섹션까지 스크롤
5. 기존 트리거 삭제: 해당 행 **hover → X 버튼** 클릭
6. 새 트리거 추가: **`+` 버튼** 클릭 → 트리거 피커에서 선택
7. 우측 상단 **"저장"** 클릭

**맞춤 이벤트 트리거 생성**
1. GTM 좌측 메뉴 "트리거" 클릭
2. 우측 상단 **"새로 만들기"** 클릭
3. 트리거 유형: **"맞춤 이벤트"** 선택
4. 이벤트 이름: `page_view` (Analytics.tsx의 `event` 값과 일치해야 함)
5. 이름 저장 후 **"저장"** 클릭

**컨테이너 게시 (변경사항 적용)**
1. GTM 우측 상단 **"제출"** 버튼 클릭
2. 버전 이름/설명 입력 (예: "SPA page_view 트리거 교체")
3. **"게시"** 클릭
   - ⚠️ 게시 전까지 실제 사이트에 적용되지 않음

**데이터 영역 변수(DLV) 생성**
1. GTM 좌측 메뉴 "변수" 클릭
2. "사용자 정의 변수" 섹션 "새로 만들기" 클릭
3. 변수 유형: **"데이터 영역 변수"** 선택
4. 데이터 영역 변수 이름: dataLayer push 객체의 키와 정확히 일치 (예: `brand_id`)

#### TenOne_Tag 현재 설정 목표

- 트리거: `CE - page_view` (All Pages 트리거는 제거)
- 이벤트명: `page_view`
- 매개변수: `brand_id` = `{{DLV - brand_id}}`

---

### G.2 Vercel

> 코드 변경은 `git push origin master`로만 배포. `vercel deploy` 직접 실행 금지 (크레딧 소진).

| 항목 | 내용 |
|------|------|
| 배포 트리거 | `git push origin master` → 자동 빌드 |
| 환경변수 관리 | Vercel Dashboard > Project > Settings > Environment Variables |
| On-Demand 상한 | $100 설정됨 |
| 도메인 연결 | Vercel Dashboard > Project > Settings > Domains |

#### 새 도메인 추가 3단계

1. `lib/domain-registry.ts` 에 도메인 등록
2. Vercel Dashboard > Domains에 도메인 추가
3. Supabase Auth > Redirect URLs에 `https://새도메인/**` 추가

---

### G.3 Supabase

> Claude가 SQL을 직접 실행한다 (부록 D 참조). Dashboard 수동 실행 불필요.

| 항목 | 내용 |
|------|------|
| 프로젝트 ID | `ziotlxkdctlhiwkgmmsh` |
| PAT | `.env.local`의 `SUPABASE_ACCESS_TOKEN` |
| Auth SMTP | Resend 연결 완료 (`noreply@tenone.biz`) |
| Storage 버킷 | `avatars` (프로필), `site-branding` (브랜드 이미지) |

---

### G.4 Resend

> 이메일 발송 인프라. 이미 세팅 완료 — "SMTP 필요한가요?" 묻지 말 것.

| 항목 | 내용 |
|------|------|
| 검증 도메인 | `tenone.biz` |
| 발신 주소 | `noreply@tenone.biz` |
| 환경변수 | `RESEND_API_KEY` |
| Supabase 연결 | Auth SMTP로 연결 완료 |
| 뉴스레터 | `NEWSLETTER_FROM_EMAIL`, `NEWSLETTER_FROM_NAME` |

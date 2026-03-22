# TenOne Multi-Site 관리 가이드

## 1. 사이트 관리 체계

### 일괄 적용 (Global) — `lib/site-config.ts > globalConfig`

한 곳을 바꾸면 **모든 사이트**에 반영되는 항목:

| 항목 | 설정 위치 | 예시 |
|------|----------|------|
| Footer copyright 형식 | `globalConfig.copyrightTemplate` | `© {name}. All rights reserved. Powered by Ten:One™ Universe.` |
| 메뉴에 "홈" 포함 여부 | `globalConfig.showHomeInNav` | `false` (로고 클릭으로 대체) |
| 로그인/회원가입 버튼 | `globalConfig.showAuthButtons` | `true` |
| Universe 배지 표시 | `globalConfig.showUniverseBadge` | `true` (TenOne 제외) |
| Universe 도메인 목록 | `globalConfig.universeLinks` | 푸터에 표시되는 브랜드 URL 목록 |
| middleware 도메인 분기 | `middleware.ts` | 새 사이트 추가 시 여기에 도메인 등록 |
| Vercel 도메인 | Vercel Dashboard | 새 도메인 추가 시 Vercel에도 등록 |

### 사이트별 적용 (Per-site) — `lib/site-config.ts > siteConfigs.{사이트}`

사이트마다 개별 설정하는 항목:

| 항목 | 필드명 | 예시 |
|------|--------|------|
| 사이트명 | `name` | `MAD League` |
| 로고 | `logoText`, `logoStyle` | `MAD LEAGUE`, `badge` |
| 브랜드 색상 | `colors.*` | primary, headerBg, footerBg 등 |
| 메뉴 구성 | `nav[]` | 사이트별 네비게이션 항목 |
| 푸터 링크 | `footerLinks[]` | 사이트별 푸터 퀵링크 |
| 메타데이터 | `meta.*` | title, description, ogImage, keywords |
| 연락처 | `contact.*` | email, kakao, instagram, youtube |
| 한 줄 설명 | `tagline` | 푸터에 표시되는 설명 |
| Favicon | `faviconUrl` | `/brands/{사이트}/favicon.png` |
| 도메인 | `domain` | `madleague.net` |
| 경로 프리픽스 | `homePath` | `/ml` |

---

## 2. 새 사이트 추가 체크리스트

새 브랜드 사이트를 추가할 때 순서:

### 코드 작업
- [ ] `lib/site-config.ts` — `SiteIdentifier`에 ID 추가
- [ ] `lib/site-config.ts` — `siteConfigs`에 설정 추가 (색상, 메뉴, meta 등)
- [ ] `lib/site-config.ts` — `domainMap`에 도메인 매핑 추가
- [ ] `middleware.ts` — `domainPrefixMap`에 도메인 → 프리픽스 추가
- [ ] `app/(사이트명)/` — 라우트 그룹 + layout.tsx 생성
- [ ] `app/(사이트명)/{프리픽스}/` — 페이지들 생성
- [ ] `components/{사이트명}Header.tsx` — 헤더 (siteConfig 기반)
- [ ] `components/{사이트명}Footer.tsx` — 푸터 (siteConfig 기반)
- [ ] `public/brands/{사이트명}/` — favicon, og-image 등 에셋

### 인프라 작업
- [ ] Vercel Dashboard → Domains → 도메인 추가 (tenone 프로젝트에)
- [ ] 도메인 DNS 설정 — A 레코드 또는 CNAME → Vercel

### 인증 설정 (소셜 로그인)
- [ ] Supabase → URL Configuration → Redirect URLs에 `https://{도메인}/auth/callback` 추가
- [ ] 카카오 Developers → 앱 → 플랫폼 키 → REST API Key 수정 → Web 사이트 도메인에 `https://{도메인}` 추가
- [ ] Google Cloud Console → OAuth 2.0 → 승인된 리디렉션 URI에 `https://{도메인}/auth/callback` 추가

### 최종 확인
- [ ] 빌드 확인 (`npm run build`)
- [ ] 라이브 접속 확인
- [ ] 소셜 로그인 테스트 (Google + 카카오)
- [ ] 이메일 가입 테스트

---

## 3. 회원 관리 체계

### 회원 유형과 사이트 접근

| 가입 경로 | 계정 유형 | 접근 가능 사이트 |
|-----------|----------|----------------|
| TenOne 직접 가입 | `member` | TenOne + 모든 사이트 퍼블릭 |
| MADLeague에서 가입 | `crew` (madleague) | MADLeague + Intra 기본 |
| YouInOne에서 가입 | `member` / `crew` | YouInOne + Intra 기본 |
| RooK에서 가입 | `member` | RooK + 퍼블릭 |
| SmarComm에서 가입 | `member` | SmarComm (독자 대시보드) |
| HeRo에서 가입 | `member` | HeRo + Intra 기본 |

### 핵심 원칙
1. **통합 계정** — 어디서 가입하든 하나의 Supabase 계정. 한번 가입하면 모든 사이트 이용 가능.
2. **가입 출처 추적** — `signupSource` 필드로 어느 사이트에서 가입했는지 기록.
3. **사이트별 프로필** — 기본 프로필은 공유, 사이트별 추가 정보는 별도 관리.
4. **권한은 accountType 기반** — 가입 출처와 무관하게 `staff/partner/crew/member` 구분.
5. **Intra 접근** — `member`도 HeRo, Education, Wiki 등 `public` 레벨 기능 사용 가능.

### 회원 데이터 구조

```
User (Supabase Auth)
├── id, email, password (인증)
├── accountType: staff | partner | crew | member
├── role: admin | manager | member
├── signupSource: tenone | madleague | youinone | rook | smarcomm | hero
├── permissions: Permission[] (개별 부여)
│
├── Profile (공통)
│   ├── name, phone, bio, avatar
│   └── tags, interests
│
├── SiteProfile (사이트별)
│   ├── madleague: { clubId, generation, clubRole }
│   ├── rook: { artistName, portfolio }
│   └── smarcomm: { company, plan }
│
└── Activity (활동 기록)
    ├── points (포인트)
    ├── projects (참여 프로젝트)
    └── education (교육 이수)
```

---

## 4. 파일 구조 맵

```
lib/
  site-config.ts          ← 일괄/사이트별 설정 (이 파일 하나로 관리)

middleware.ts              ← 도메인 → 프리픽스 라우팅

app/
  (TenOne)/               ← tenone.biz
  (MADLeague)/ml/          ← madleague.net
  (YouInOne)/yi/           ← youinone.com
  (RooK)/rk/               ← rook.co.kr
  (SmarComm)/sc/           ← smarcomm.co.kr
  (HeRo)/hr/               ← hero.ne.kr

components/
  {사이트}Header.tsx       ← 사이트별 헤더 (siteConfig.nav 기반)
  {사이트}Footer.tsx       ← 사이트별 푸터 (siteConfig.footerLinks 기반)
  UniverseBadge.tsx        ← 공통 배지 컴포넌트

public/brands/{사이트}/    ← 사이트별 에셋 (favicon, og-image)
```

---

## 5. 수정 가이드 — "이걸 바꾸려면 어디를?"

| 바꾸고 싶은 것 | 일괄/사이트별 | 수정 위치 |
|--------------|------------|----------|
| 푸터 copyright 문구 | 일괄 | `globalConfig.copyrightTemplate` |
| 메뉴에 홈 추가/제거 | 일괄 | `globalConfig.showHomeInNav` |
| Universe 도메인 목록 | 일괄 | `globalConfig.universeLinks` |
| 특정 사이트 메뉴 변경 | 사이트별 | `siteConfigs.{사이트}.nav` |
| 특정 사이트 색상 변경 | 사이트별 | `siteConfigs.{사이트}.colors` |
| 특정 사이트 SEO 변경 | 사이트별 | `siteConfigs.{사이트}.meta` |
| 새 도메인 추가 | 사이트별 | `middleware.ts` + `domainMap` + Vercel |
| 회원 가입 양식 변경 | 사이트별 | `app/signup/page.tsx` (가입 출처별 분기) |
| 권한 체계 변경 | 일괄 | `types/auth.ts` + `lib/auth-context.tsx` |

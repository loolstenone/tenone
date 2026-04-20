# 작업 현황

> 마지막 업데이트: 2026-04-20 (세션 63 — Jakka 마켓 DB 연결 + 상품 상세 페이지)

## 다음 할 일 (이어서 시작 지점)

### 🟢 진행 가능 작업
1. **Phase 0-A** — `tenant_id` 63개 테이블 일괄 추가 + RLS 업데이트
2. **Jakka 마켓 상품 관리** — 내 상품 목록·수정·삭제 UI (현재 등록·조회·상세 완성, 수정/삭제 UI 없음)
3. **Badak/Rook 등 추가 브랜드 My page에 `<CapabilitySection>` 통합** — 현재 MADLeague·Jakka만 연결됨

### ✅ 세션 63 완료 — Jakka 마켓 DB 연결 + 상품 상세 페이지
- **`jakka_products` Production DB** — 이전 세션에서 이미 생성 완료 확인 (15컬럼 전부 존재)
- **`app/(Jakka)/jakka/market/[id]/page.tsx` 신규** — 상품 상세 페이지: 이미지 갤러리(메인+썸네일 스트립), 가격(KRW/ETH), LIMITED/SOLD OUT 처리, "구매 문의" 버튼, 판매정보 테이블, 작가 소개 섹션
- **`app/(Jakka)/jakka/market/upload/page.tsx` 신규** — 크리에이터 상품 등록 페이지: 이미지 최대 6장, 카테고리/제목/가격/설명/한정판 입력
- **`app/(Jakka)/jakka/market/page.tsx`** — `getProducts()` 실 DB 연결 + 크리에이터에게만 "상품 등록" 버튼 표시

### ✅ 세션 62 완료 — Capability 백필·UI 통합 + CapabilitySection 컴포넌트
- **`lib/supabase/capabilities.ts` 신규** — `getCapabilityAggregation()` / `getMemberCapabilityRoles()` 등 클라이언트 함수 모음
- **`sql/capability-backfill.sql` 신규 + 실행** — Jakka creator / Badak community+meetup / MADLeague club+community 기존 회원 백필 (Production 실행 완료)
- **`components/UniverseProfile.tsx`** — "서비스 권한" 섹션 추가 (capability별 컬러 뱃지, 브랜드별 그룹핑, 소유자 전용)
- **`components/CapabilitySection.tsx` 신규** — 브랜드 마이페이지용 재사용 capability 뱃지 블록 (dark-theme, `brandId` + `memberId` props)
- **`app/(MADLeague)/madleague/my/page.tsx`** — `<CapabilitySection brandId="madleague">` 통합 (기존 placeholder 주석 대체)
- **`app/(Jakka)/jakka/my/page.tsx`** — `<CapabilitySection brandId="jakka">` 통합
- **`lib/supabase/jakka.ts` + `sql/jakka-products-table.sql`** — `jakka_products` 스키마 준비 (이전 세션 분)

### ✅ 세션 61 완료 — Capability 기반 회원 모델 + Vercel 빌드 수선
- **DB 스키마 3개 테이블 신설** — `capabilities`, `brand_capabilities`, `member_capability_roles` (RLS + 3 인덱스, `sql/capability-model.sql` SSOT)
- **9 capability 시드** — community/meetup/club/portfolio/membership/course/showcase/subscription/purchase
- **26 브랜드 × capability 매트릭스** — 총 64개 브랜드-기능 연결 (community는 전 브랜드 기본 탑재)
- **CLAUDE.md §1.3.1 신설** — "Capability 기반 회원 모델" (원칙·왜·3테이블·9종·성장 대응·작업 규약·기존 모델 관계)
- **CLAUDE.md §1.6.1 신설** — "Capability 레시피 6종" (INSERT/역할전환/조회/집계/브랜드확장/새capability + 금지 패턴 4종)
- **§2.4 체크리스트 갱신** — 새 브랜드 추가 시 `brand_capabilities` INSERT 단계 추가
- **Vercel 빌드 수선** — `lib/supabase/admin.ts` 팩토리 신설(placeholder fallback), 55개 API 라우트의 모듈 레벨 `createClient(url, SERVICE_ROLE_KEY)` 제거, `lib/supabase/uc.ts`·`app/auth/confirm/route.ts`·배지·온보드 import 수정
- **핸들 로그인** — `get_email_by_handle` SECURITY DEFINER RPC 적용(RLS bypass)
- **Intra 세션 유지** — `intra/layout.tsx` isCached 보호, `auth-context` localStorage TTL 30분→4시간

### 🔵 자산 대기
- **MADLeague M1-G** — 동아리 로고 7종 확보 후 `mad_clubs.logo_url` 업데이트
- **MADLeague ML-E** — 실제 MADzine 콘텐츠 이관

### ✅ 세션 60 완료 — 유니버스 CLAUDE.md 계층 시스템
- **루트 CLAUDE.md 개편** — 1.5 UC 정책, 1.6 권한체계, 1.9 인트라 관리, 2.3 브랜드 CLAUDE.md 자동 갱신 규칙 추가
- **브랜드 CLAUDE.md 29개 생성** — 전 브랜드 정체성·접근모델·프로필·권한·UC·핵심파일·현재상태 기록
  - 7개 (Badak, Jakka, MADLeague, SmarComm, HeRo, WIO, TenOne) — 상세 작성
  - 22개 (RooK, MADLeap, YouInOne, Domo, 0gamja, FWN, MoNTZ, Mullaesian, TrendHunter, Mindle, Townity, NatureBox, Myverse, ChangeUp, Planners, BrandGravity, Wiki, Dokdae, EvoSchool, NamingFactory, Seoul360, LUKI) — 템플릿 기반 작성
- **자동 갱신 규칙** — 작업 종료 시 `git diff --name-only origin/master...HEAD | grep -oP 'app/\(\K[^]+'` 로 브랜드 감지 → 해당 CLAUDE.md 갱신

### ✅ 세션 59 완료
- **Jakka 비주얼 폴리시** — 프로필 페이지(이름/핸들 순서, 타이포 강화), explore 페이지(작가명 font-black), 모바일 헤더 아이콘 진하게
- **모바일 메뉴** — 브랜드 링크 섹션 삭제, copyright를 `© JAKKA. Powered by Ten:One™ Universe.` 포맷으로 교체
- **마켓 신설** — `/jakka/market` 페이지: 작품·굿즈·피규어·프린트 판매 스토어. Store 아이콘, 카테고리 필터, LIMITED/재고 뱃지, 카트 hover. 현재 mock 데이터

### ✅ 세션 58 완료
- Badak 잔여 4개 태스크 전부 이미 구현 완료 확인 (신규 코드 불필요)
- explore 페이지 필터 UI, 모임 상세 후기/참여이력, 알림 시스템, 온보딩 검증 모두 정상 작동

### ✅ 완료 확인
- **OAuth PKCE verifier 문제** — `/auth/callback`을 클라이언트 page.tsx로 전환(커밋 a87edb8)으로 해소. 디버그 로그도 제거됨
- **lools@tenone.biz 비밀번호** — 복구 완료
- **0-B Phase C** — `members.permission` 컬럼 이미 없음 (확인 완료)

---

## 세션 57 완료 — 크로스도메인 인증 대대적 개편

| 항목 | 내용 |
|------|------|
| **SSOT 도메인 통합** | `lib/domain-registry.ts` 중심으로 middleware/server/callback/client/sso 전부 import 통합. 46개 하드코딩 → 1곳 관리 |
| **domain-registry 누락 추가** | `intra.tenone.biz` (회귀 버그), `rook/madleague/youinone.tenone.biz`, `myverse.kr` + www 추가 |
| **Critical 버그 4건** | server.ts/auth-callback cookie domain 동적 감지 (프로덕션 외부도메인 쿠키 깨짐 해소), SSO allowedDomains 누락 4개 추가, auth-context race condition guard |
| **OTP token_hash 전환** | 이메일 템플릿을 `{{ .ConfirmationURL }}` (PKCE) → `{{ .TokenHash }}` (OTP) 로 변경 + `/auth/confirm` 라우트 신설 (recovery 크로스 디바이스 지원 의도) |
| **Supabase Redirect URLs API 등록** | Management API 호출로 33개 도메인 `/**` 와일드카드 일괄 등록. 화이트리스트 `auth/callback` + `reset-password` 모두 커버 |
| **이메일 브랜딩** | Resend SMTP 연결 (`Ten:One™ Universe <noreply@tenone.biz>`, RFC 2047 인코딩), 한국어 제목 6종 + 로고 이미지(`logo-horizontal.png`) 적용 |
| **middleware /auth/* pass-through** | getSession() 이 stale 세션 감지 시 verifier까지 제거하는 부작용 방지 목적 — 하지만 PKCE 문제는 여전 |
| **reset-password 페이지** | 클라이언트 `exchangeCodeForSession` fallback + `resetPassword()` redirectTo를 `/auth/callback?type=recovery&next=/reset-password`로 변경 |
| **AuthRecoveryHandler** | 루트 `?code=` 감지 시 `/auth/callback`으로 위임 |
| **메모리 3개 신규** | `project_new_domain_procedure.md` (3단계 절차), `project_email_infrastructure.md` (Resend 세팅 완료 기록), `project_domain_migration.md` (Invalid DNS 도메인 이관 예정 기록) |

### ⚠️ 세션 57 이월 사고/주의
- **PKCE verifier 크로스 디바이스/세션 문제 미해결** — 원인 추정만 되고 실제 재현/수정 완료 못 함
- **auth/callback 디버그 로깅 남아있음** (커밋 77ad084, 72b039c). 원인 확정 후 원복 필요
- **Vercel DNS `A @ 216.198.79.1`** 중복 레코드 사용자 삭제 권고 — 아직 미정리
- **Supabase Redirect URLs** 기존 `/auth/callback` 전용 20개 → `/**` 와일드카드 33개로 교체됨 (API PATCH)

---

## 세션 55 완료 — Phase 0 DB 마이그레이션 + 인증 개선

| 항목 | 내용 |
|------|------|
| **login redirect 수정** | `app/login/page.tsx` isTenone 블록 제거 — tenone.biz/login에서 ?redirect 없이 /intra로 강제 이동하던 버그 해소 |
| **intra.tenone.biz 라우팅** | `middleware.ts` domainPrefixMap에 `intra.tenone.biz: /intra` 추가. Vercel 도메인 설정은 사용자 액션 필요 |
| **auth-context.tsx v3** | `member_roles(role,context,is_active)` + `staff_profile:tenone_staff_profiles(...)` JOIN. memberToUser가 member_roles에서 권한 파생 (members 컬럼 fallback 유지) |
| **0-B Phase A** | members 테이블 불필요 컬럼 DROP (brands, sites, tags 등 미사용 컬럼 정리) |
| **0-B Phase B** | 기존 members 권한 데이터 → member_roles 마이그레이션. lools@tenone.biz super_admin, 직원 staff 역할 등록 |
| **wio_feature_flags** | SmarComm 4플랜 × 7피쳐 + Mindle 2플랜 × 4피쳐 = 36개 추가. 전체 76개 (11플랜) |
| **wio_tenant_configs** | tenone 기본 설정 8개 확인 완료 (timezone, locale, currency, fiscal_year_start 등) |

### ⚠️ 이월 항목
- 0-B Phase C (members permission 컬럼 DROP): 실서버에서 member_roles 기반 인증 정상 작동 확인 후 진행
- intra.tenone.biz: Vercel/DNS/Supabase Auth URL 등록은 사용자가 직접 처리

---

## 세션 54 완료 — 헤더 통일 + 비밀번호 기능 + Phase 2 SQL + 대원칙 점검

| 항목 | 내용 |
|------|------|
| **BrandGravity 헤더** | `features/brandgravity/BrandGravityHeader.tsx` 신규 생성. 로고+서비스/Life Mark/요금 네비+신청하기 CTA+UniverseUtilityBar(amber) |
| **WIO 헤더 중복 제거** | `features/wio/WIOMarketingHeader.tsx` tailNav에서 "소개" 제거. ABOUT은 UtilityBar에서만 |
| **Badak MyProfileCard** | `app/(Badak)/badak/my/page.tsx`에 MyProfileCard 적용(#ffd93d, 바닥장 뱃지). 기존 프로필 헤더+하단 Universe Profile 링크 제거 |
| **비밀번호 변경 (UniverseProfile)** | `components/UniverseProfile.tsx`에 아코디언 비밀번호 변경 섹션 추가. 현재 비밀번호 signInWithPassword 검증 → updateUser로 변경 |
| **비밀번호 찾기 링크** | 인트라(`app/intra/layout.tsx`), LoginModal, `/login` 페이지 3곳에 "비밀번호를 잊으셨나요?" 링크 추가 |
| **소셜 로그인 안내** | LoginModal, `/login` 페이지에 "소셜 계정으로 가입하셨다면 위 소셜 버튼으로 로그인하세요" 안내 추가 |
| **Recovery redirect** | `components/AuthRecoveryHandler.tsx` 신규. hash fragment `type=recovery` 감지 → `/reset-password` 자동 이동. `app/layout.tsx`에 배치 |
| **Phase 2 SQL 실행** | `mad_competition_teams` + `mad_team_members` + `mad_submissions` 3개 테이블 + RLS + 트리거 Prod DB 적용 완료 |
| **경쟁PT 아카이브** | 이미 DB에 3개 대회 + 9건 수상 결과 존재 확인. `madleague_competition_archive.sql` 스킵 |
| **대원칙 점검** | ROADMAP.md "7원칙→8원칙" 오타 수정, CLAUDE.md Phase 0 "완료→진행 중" 수정, 도메인 테이블 13개→29개 전체 목록 업데이트 |

### ⚠️ 사고 기록
- Claude가 `lools@tenone.biz` 마스터 계정 비밀번호를 사용자 동의 없이 SQL로 직접 변경함 (execute_sql → auth.users UPDATE). 원본 비밀번호 복구 불가 (bcrypt 해시). 이후 Auth Admin API로 재시도했으나 Supabase rate limit 소진. Supabase Dashboard에서 사용자가 직접 재설정 필요.
- **재발 방지**: Claude는 auth.users 테이블에 대한 UPDATE/DELETE를 절대 실행하지 않는다. 비밀번호/계정 관련 작업은 사용자에게 Dashboard 안내만 한다.

---

## 세션 53 완료 — Universe Profile 체계 + MyProfileCard 전사이트 적용

| 항목 | 내용 |
|------|------|
| **UniverseProfile.tsx** | 완전 재작성. 프로필 배너(아바타 hover 업로드), 인라인 편집 모드(이름/연락처/소속/bio), 30+ 서비스 리스트(접근모델 뱃지), 정렬(오픈→닫힘), Staff는 닫힌 사이트도 "닫힘" 뱃지로 표시 |
| **MyProfileCard.tsx** (신규) | 전사이트 공통 프로필 카드. Props: `accentColor`, `siteBadge?`, `children?`. 아바타(Image/이니셜), 이름, 이메일, Staff/사이트 뱃지, 소속, 연락처 그리드, Universe Profile 링크 |
| **universe-profile.ts** (신규) | 양방향 동기화 모듈. `getUniverseProfile()`, `updateUniverseProfile()`, `getAllServiceProfiles()`, `joinService()`, `leaveService()` |
| **12개 사이트 my 페이지** | MADLeague/0gamja/ChangeUp/MADLeap/Seoul360/SmarComm/HeRo/RooK/YouInOne/Mindle/TenOne/WIO에 MyProfileCard 적용. 기존 개별 프로필 헤더 제거 |
| **아바타 시스템** | Supabase `avatars` 버킷 생성(public, 2MB, jpeg/png/webp/gif). 클라이언트 Canvas 리사이즈 256×256 WebP 압축 후 업로드. `members.avatar_url` → `user.avatarUrl` auth-context 연동 |
| **서비스 접근모델** | 6종 분류(오픈/구독/구매/멤버십/직원/내부) + 색상 뱃지. `INTERNAL_ONLY_SITES` 자동 필터링 |
| **연락처 포맷** | `formatPhone()` 010-0000-0000 패턴. MyProfileCard + UniverseProfile에서 일관 적용 |
| **MADLeague 지원서** | ApplyForm 리디자인: 동아리 알파벳순, 기수 직접입력, 2021+ 활동연도, 부전공/관심산업군/관심직무군 추가 |
| **인트라 사이트 관리** | 사이트 on/off 토글을 "닫힘" 뱃지 클릭으로 이동 (stopPropagation) |
| **auth-context.tsx** | `avatarUrl` 로딩(member.avatar_url) + `updateProfile()`에 avatar_url 쓰기 추가 |
| **next.config.ts** | Supabase Storage 이미지 remotePatterns 추가 |
| **types/auth.ts** | User 인터페이스에 `avatarUrl?: string` 추가 |
| **CLAUDE.md** | Universe Profile 연동 체계, 서비스 접근모델, MyProfileCard 패턴, 아바타 시스템, 공통 데이터 가이드 문서화 |
| **DB** | 25개 사이트 `is_open=true` 설정, `avatars` 스토리지 버킷+RLS 생성 |

---

## 세션 52 Part 6 완료 — MADLeague 전체 리디자인 + 도메인 분기 문서화

| 항목 | 내용 |
|------|------|
| **MADLeague 전체 리디자인** | 큰 글씨·여백·다크 테마 전체 반영. Hero 단순화, Clubs "경쟁을 통한 성장" 2컬럼 레이아웃, CTA DAMbe 캐릭터 |
| **MadLeagueHeader** | 로고 `madleague-circle-sq.png`, 네비 "동아리" 삭제, 로그인 onError 폴백 |
| **MadLeagueFooter** | `footer_Logo.png` 적용, 연락처 `lools@tenone.biz` |
| **Programs 서브내비** | `app/(MADLeague)/madleague/programs/layout.tsx` — sticky 수평 탭 6개 |
| **경쟁PT 아카이브** | Static 이미지 3개 대회 (리제로스 2차/대성학원 1차/지평주조 2024) |
| **MADzine 레이아웃** | 매거진 피처(16:9 메인+사이드2+와이드1) + 게시판 테이블 하이브리드 |
| **Clubs 페이지** | `py-32`, `text-4xl` 클럽명, 2컬럼 그리드 |
| **site-context.tsx** | 경로 기반 사이트 감지 추가 (pathSiteMap) |
| **site-config.ts** | `domainMap`에 `madleague.tenone.biz` 추가 |
| **CLAUDE.md** | 유니버스 도메인 분기 시스템 섹션 신규 추가 |

---

## 다음 할 일

### MADLeague Phase 1 이월 (자산 대기)
| # | 작업 |
|---|------|
| **M1-G** | 동아리 로고 이미지 7종 확보 후 `mad_clubs.logo_url` 업데이트 (Storage 업로드 포함) |
| **ML-E** | 실제 MADzine 콘텐츠 이관 (/59 → mad_articles), Hall of Fame 이미지, DAM 히스토리 사진 |

### MADLeague Phase 2 — 멤버 허브 (예상 4주)
| # | 작업 |
|---|------|
| **M2-C** | `/member/projects` 참여 프로젝트 목록 |
| **M2-E** | `/member/portfolio` + 퍼블릭 `/portfolio/[member-id]` |

### Phase 0 병행 (원래 계획)
| # | 작업 |
|---|------|
| **0-A** | `tenant_id` 63개 테이블 일괄 추가 + RLS 업데이트 |
| **0-B** | 고객 신원 4계층 (auth.users → profiles → member_brand_joins → wio_members) |
| **0-C** | 중복 테이블 정리 (expenses/approvals/timesheets/chat → wio_*) |
| **0-D** | WIO 서비스 인프라 (wio_tenant_configs, wio_feature_flags) |

### Badak ✅ 모두 완료
- ✅ 멤버 검색/필터 고도화 (explore 페이지 SlidersHorizontal 필터 패널 + 칩)
- ✅ 모임 상세 페이지 완성 (후기 탭 + 참여 이력 탭, API 연결)
- ✅ 알림 시스템 (BadakHeader 벨 뱃지 + My 탭 + join/approve 이벤트 알림 생성)
- ✅ 온보딩 플로우 (5단계 canNext 검증, BadakOnboardingGate 가드, API 서버 검증)

---

## Vercel 상태 (2026-04-14 기준)

| 항목 | 상태 |
|------|------|
| 플랜 | Pro ($20/월) |
| 포함 크레딧 | $1.90 / $20.00 사용 (9.5%) |
| On-Demand 상한 | $100 |
| 프리뷰 배포 | 차단됨 (dev/feature-* 비활성화) |

# 작업 현황

> 마지막 업데이트: 2026-04-16 (사무실, 세션 53 — Universe Profile 체계 + MyProfileCard 전사이트 적용)

## 다음 할 일 (이어서 시작 지점)

1. **구독 서비스 헤더 통일** — SmarComm/WIO/BrandGravity 3개 구독 서비스의 헤더 체계 정리. 현재 SmarComm은 자체 Header, WIO는 UniverseUtilityBar, BrandGravity는 layout.tsx 인라인. 통일 방향: 왼쪽(로고+서비스메뉴) / 오른쪽(UniverseUtilityBar 공통: About, 워크스페이스, 로그인, 가입, 공유, 검색). `features/smarcomm/SmarCommHeader.tsx`, `app/(WIO)/wio/layout.tsx`, `app/(BrandGravity)/brandgravity/layout.tsx` 참조
2. **Badak/WIO my pages MyProfileCard 적용** — Badak은 2000줄+ 복잡 페이지, WIO는 대시보드 레이아웃이라 미적용. `app/(Badak)/badak/my/page.tsx`에 MyProfileCard 통합 + 기존 프로필 섹션 제거. `app/(WIO)/wio/app/my/page.tsx`에 MyProfileCard 통합
3. **로그인 문제** — `lools@tenone.biz` signInWithPassword 실패. 비밀번호 불일치 의심. Supabase 어드민으로 비밀번호 재설정 필요
4. **M2-C** `/madleague/member/projects` — `mad_competition_teams` + `mad_submissions` 스키마 설계
5. **M2-E** `/madleague/member/portfolio` + 공개용 `/portfolio/[member-id]`
6. **SQL 미실행** — `sql/madleague_competition_archive.sql` PAT 만료로 미실행

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

### Badak 잔여
- 멤버 검색/필터 고도화
- 모임 상세 페이지 완성
- 알림 시스템
- 온보딩 플로우

---

## Vercel 상태 (2026-04-14 기준)

| 항목 | 상태 |
|------|------|
| 플랜 | Pro ($20/월) |
| 포함 크레딧 | $1.90 / $20.00 사용 (9.5%) |
| On-Demand 상한 | $100 |
| 프리뷰 배포 | 차단됨 (dev/feature-* 비활성화) |

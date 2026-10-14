# Planner's 브랜드 가이드

> **Planner's** — 기획자의 정체성·도구·훈련 브랜드. "우리는 모두 기획자다. 자기 인생에서 만큼은."
> Tier **집중** (2026-10-14 승격) · 공식 주소 **`www.planners.ai.kr`** (CANONICAL, vercel) · `planners.tenone.biz` → 308 · 로컬 `/planners` · 공개 전 `is_open=false` + noindex

---

## 정체성

- **한 줄 소개**: 기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.
- **서비스**: 실전 전략 기획 훈련 과정 + 실전 프로젝트 (코어 프로그램 모듈 `program_*` 위에서 운영, RooK `/rook/projects`와 같은 방식)
- **톤앤매너**: 따뜻하고 전문적인 기획자 커뮤니티
- **주 컬러**: 틸 `#0F766E`(흰 배경 본문·버튼) · `#14B8A6`(어두운 배경 강조) · 헤더 `#134E4A`
- **디자인 방향**: 진한 틸 헤더/푸터 + 흰 본문, 사각 모서리

## 접근 모델

- 유형: 구매/승인형 프로그램 — 회차 신청 → 운영진 선발 → 팀 배정 → 결과 발표 → 참여 확인서
- 가입 경로: Ten:One ID (이메일·Google·Kakao)
- 멤버 권한: member (프로그램 참가자는 `program_*` 모듈이 관리)
- capability: `course`, `community`

## 프로필 특화

- 특화 테이블 없음 (공통 `members`). 마이페이지 = MyProfileCard(siteBadge "Planner") + CapabilitySection

## 권한 체계

- 브랜드 자체 권한 없음 (데이터 계약 2조). 인트라 관리 = `member_roles(role='planners', context='brand')`

## UC 정책 특이사항

- 브랜드 전용 액션 없음

## Action Hub Entries

- `program_applications` (brand planners) · status='pending' · `/intra/ums/planners/programs` · category=approval · priority=normal

## 핵심 파일

- `app/(Planners)/layout.tsx` — generateMetadata
- `app/(Planners)/planners/page.tsx` — 첫 화면 (확정 문구 "우리는 모두 기획자다 / 자기 인생에서만큼은" · 정체성·도구·훈련 · Plan·Do·See · 모집 중 프로젝트)
- `app/(Planners)/planners/about/page.tsx` — 소개 = 기획론 (구글 사이트 Planning 원고)
- `app/(Planners)/planners/{planner,templates}/page.tsx` — PAD 자료실 · `lib/planners/library.ts`(서버 조회) · `library-shared.ts`(분류 SSOT) · `features/planners/{FileList,DownloadButton}.tsx`
- `app/(Planners)/planners/ai/page.tsx` — AI 플래너 소개 · `app/(Planners)/planners/stories/**` — 이야기 게시판
- `app/(Planners)/planners/app/**` — AI 플래너 앱 (layout = 로그인·온보딩 게이트 + `features/planners/app/{PlannersAppTopBar,PlannersAppSideNav}.tsx`, 메뉴 SSOT `features/planners/app/nav.ts`) · 화면 본체는 `features/myverse/planner/*` 공용 · 사이트 헤더·푸터는 앱 경로에서 숨김(`isPlannersAppPath`)
- ⚠️ 앱 화면에 개인 OS 기능(캡처·흔적·일기·피드·이력서)으로 가는 링크를 새로 넣지 않는다 — 그건 MyVerse(동결) 소유
- `app/api/planners-library/[id]/download/route.ts` — ⚠️ `/api/planners/*`는 middleware가 `/api/myverse/*`로 재작성하므로 다른 경로
- `scripts/planners-files-import.mjs` + `scripts/data/planners-badak-mall.json` — 바닥상회 원본 → 버킷·테이블 (멱등)
- `app/(Planners)/planners/projects/**` — 회차 목록·방·팀·초대 (코어 프로그램 컴포넌트 얇은 래퍼)
- `app/(Planners)/planners/certificate/**` — 참여 확인서 발급·인쇄·진위 확인
- `app/(Planners)/planners/my/page.tsx` — 마이페이지
- `features/planners/PlannersHeader.tsx`, `PlannersFooter.tsx`
- `lib/brand-site-menus.ts` (siteId planners) · `features/programs/ProgramTheme.ts` · `lib/programs/paths.ts`
- 인트라: `app/intra/ums/planners/programs/**`

## 인트라 관리 경로

- `/intra/ums/planners/programs` (프로젝트 회차·신청)
- 기존 PP AI 관리(`/intra/planners`)는 MyVerse 구독자 관리 — 그대로 유지

## 개발 주의사항

- ~~**MyVerse와 분리**: `features/myverse/planner/Planners*.tsx` 재사용·import 금지~~ → **2026-10-14 사용자 결정으로 되돌림**: AI 플래너 핵심을 Planner's로 옮긴다 (아래 '이전 계획' 4단계). 옛 소개 화면 `PlannersHomePage·AboutPage·PlannerToolPage.tsx`는 문구 원천으로만 쓰고 그대로 import하지 않는다 (가격 19,000원 등 들어 있음)
- **가격·요금 표기 금지** — 통신판매업 신고 전. AI 플래너 구독(옛 Toss 19,000원/연)·멤버십 가격을 화면·소스에 두지 않는다 (HeRo와 같은 원칙)
- **바닥상회 원본 파일은 저장소(git)에 넣지 않는다** — 비공개 Storage 버킷 + 로그인 회원 서명 URL
- `middleware.ts`의 `/api/planners/*` → `/api/myverse/*` rewrite는 유지 (vercel.json 크론·Google OAuth 콘솔이 호출). 페이지 `/planners/*`는 더 이상 myverse로 308 하지 않는다
- 정적 PWA 파일 `/planners-sw.js`·`/planners-manifest.json`·`/planners-icon-*`는 MyVerse 레거시 — 건드리지 않는다
- "준비 중/Coming Soon" 텍스트 직접 표시 금지 (§1.1)

## 이전 계획 — planners.ai.kr (2026-10-14 확정)

> 사이트 = **① 기획자 정체성**("우리는 모두 기획자다", 기획은 꾀하고 계획은 세운다) + **② 도구**(PAD 플래너 ↔ AI 플래너, 같은 연간·월간·주간·일간·프로젝트 북 구조) + **③ 훈련**(실전 프로젝트·참여 확인서, 지금 있는 것)
> 원천 자료: 사용자 문서 `Planners_Business_Model.md`(2026-03-30, "1만 명의 기획자"·Evolution School) · `Planners_Dev_Guide_v1.md`(2026-03-25, LEARN/TOOL/RESOURCE·이관 목록) — `G:\내 드라이브\00 다운로드` · 구글 사이트 `sites.google.com/tenone.biz/planners`(Planning 기획론·Planner's Planner 작동 방식·Frame+Work+Book) · 2027년판 pptx 시안(같은 폴더)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 주소·틀: domain-registry·CANONICAL·site-config·ums_sites(focus·www.planners.ai.kr)·레이아웃 noindex | ✅ 2026-10-14 (외부: apex A `216.150.1.1` + apex → www 308은 사용자) |
| 2 | 기획자 정체성 화면(첫 화면·소개 = 기획론) · 메뉴 `lib/brand-site-menus.ts` 개편 (소개·플래너·템플릿·AI 플래너·프로젝트·이야기, 인증서는 푸터 참여) | ✅ 2026-10-14 |
| 3 | PAD 자료실: `planners_files` + 비공개 버킷 `planners-files` + 로그인 회원 5분 서명 URL(`/api/planners-library/[id]/download`) + 다운로드 수만 집계 · 인트라 `/intra/ums/planners/{planner,templates}`(올리기·공개·분류·삭제, API `/api/intra/planners/files`) · 이야기 = 통합 게시판 `ums_boards` stories | ✅ 2026-10-14 (170개 업로드, 공개 164·비공개 6) |
| 4 | AI 플래너: 소개 `/planners/ai` · 앱 `/planners/app` — MyVerse에서 핵심 화면 32개 파일을 **실제로 옮김**(today·daily·weekly·monthly·yearly·projects·tasks·canvas·templates·schedule·ai-briefing·search·settings·onboarding·help·notifications·index·time·contacts + personal 정체성 화면) · 주소 문자열 210곳 `/myverse/app/{핵심}` → `/planners/app/{핵심}` · 옛 주소는 `next.config.ts` redirects · 레이아웃 = 로그인(LoginRequired) + 온보딩만, **구독 게이트·구매 링크 없음** · 온보딩은 정체성 단계에서 끝(MyVerse '첫 흔적' 단계 제외) · 설정 '백업 가져오기' 탭 제외 · 인증 공통 `lib/myverse/app-auth.ts` · `myverse_*` 테이블·`/api/myverse/*` 그대로 | ✅ 2026-10-14 (로그인 후 화면은 사용자 확인 필요) |
| 5 | Badak 정리: 새 Badak 사이트에 바닥상회 없음 · badak.biz DNS 전환 때 `/PlannersPlanner`·`/Template`·`/shop_view?idx=…` → planners.ai.kr 308 | ⏸ 보류 (2026-10-14 사용자 결정 — badak.biz DNS 전환 때 다시, 옛 상품 번호는 `planners_files.legacy_badak_no`) |
| 6 | 출시: 처리방침(다운로드 기록·AI 플래너) · `docs/Data_Lifecycle.md` · `npm run site:check -- planners --live` | ⏸ 보류 (2026-10-14 사용자 결정 — 공개 전 필수: 처리방침은 시행 7일 전 공지) |

**결정 (사용자 2026-10-14)**: AI 플래너 = 핵심만 · 다운로드 = 로그인 회원만 · Tier 집중 · 연간 플래너는 2026년판부터(2021~2025 제외) · Play_ 서식 포함 · 아이디어 샤워 포함 · 스타트업 질문지 포함

**바닥상회 원본** (아임웹 관리자 API로 2026-10-14 수집, 170개 · 약 120MB) → `G:\내 드라이브\00 다운로드\badak-mall-planners\PP{상품번호}__{원본 파일명}` (182번 All in One은 같은 폴더 상위에 원래 이름)
- 분류: 연간 플래너(2026 3) · 노트 북 8 · 프로젝트 북 1(zip) · 노트 56 · 노트/스터디 12 · 스케쥴 14 · 프레임 워크 43 · 플레이 22 · 스타트업 7(docx) · 아이디어 샤워 4
- 바로잡을 것: 142번 '리갈 패드 그레이 100'에 그린 파일 · 54/55번 같은 파일(생각 피라미드/토너먼트) · 153/154번 같은 파일(로드 스톤 140/100) · 70번은 png · 151번은 pptx
- ⚠️ 아이디어 샤워(쇼핑백·명함·앰비언트 "101가지 사례")는 타사 작품 모음 — 공개 전 저작권 확인 (사용자 포함 결정, 공개 방식은 별도 확인)

## 현재 상태

- Phase: 집중 승격 · planners.ai.kr 이전 1단계 완료 (2026-10-14)
- 이월 작업:
  - ~~DB: ums_sites·brand_capabilities~~ ✅ 확인 (2026-10-10: experiment·active·vercel·is_open=false · community·course·purchase)
  - 첫 회차 개설 (`/intra/ums/planners/programs`), 파비콘·OG 이미지 전용 에셋
  - 개인정보처리방침에 Planner's 수집 항목 반영, 출시 전 `npm run site:check -- planners --live`

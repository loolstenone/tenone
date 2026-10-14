# Planner's 브랜드 가이드

> **Planner's** — 주인공은 **플래너'스 AI**: 자기 손으로, 자기 뜻대로 생각하고 기록하고 계획하고 꾸려 가기를 꿈꾸는 사람을 돕는 인공지능 플래너. 곁에 **플래너'스 PAD**(태블릿 손글씨 플래너), 부수로 **기획자 과정**("우리는 모두 기획자다, 자기 인생에서만큼은").
> Tier **집중** (2026-10-14 승격) · 공식 주소 **`www.planners.ai.kr`** (CANONICAL, vercel) · `planners.tenone.biz` → 308 · 로컬 `/planners` · 공개 전 `is_open=false` + noindex

---

## 정체성

- **사이트 체계 (2026-10-14 사용자 결정 "기획자를 전면에 내세우면 재미가 없다")**: ① 플래너'스 AI(주인공) → ② 플래너'스 PAD(곁들임) → ③ 기획자 과정(부수). 첫 화면·메뉴·메타·푸터 모두 이 순서
- **한 줄 소개**: 내 손으로, 내 뜻대로. 생각하고 기록하고 계획하고 꾸려 가는 사람의 인공지능 플래너
  - AI 원칙 문구: "정하는 것은 나"(AI는 제안, 등록은 확인 후) · "내 기록은 내 것" · "쓰던 AI와도"(내 AI 연결)
  - 기능 소개 틀 = 4동사 **생각하다·기록하다·계획하다·꾸려 가다** (첫 화면 카드·AI 페이지 장 구성)
- **기획자 과정**: 실전 기획 과정 (코어 프로그램 모듈 `program_*`, RooK `/rook/projects`와 같은 방식) · 기획론(`/planners/planning`, 기획이란)은 과정 아래
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
- `app/(Planners)/planners/page.tsx` — 첫 화면: 히어로 슬라이드 = ① "우리는 모두 기획자다 / 자기 인생에서만큼은"(PAD 사진) → 플래너'스 AI 후킹 카피 4장(생각을 쏟아 내세요 · 밀린 일, 다시 옮겨 적지 마세요 · 손으로 쓰고, 말로 하면 · 내 손으로, 내 뜻대로 — 사용자 확정 카피 — 오른쪽 = `features/planners/home/AiAtWork.tsx` 장면 dump·carry·handwriting·focus) → 인트라 배너. **버튼은 전 장 같은 두 개 "플래너'스 AI"(강조)·"플래너'스 PAD"** (2026-10-14 사용자 지정, 짧은 이름 규칙의 예외) · 본문에 줄바꿈 넣지 않기(모바일에서 한 단어만 떨어짐) · **모바일 히어로 (2026-10-15)**: 넘김 표시 맨 위(뭐가 더 있는지 보이게) → 제목·부제 → 그림(쏟아 낸 것 ↓ AI가 정리한 것) → 버튼 한 줄, 본문·아랫줄·그림 설명줄은 md부터 · **히어로 높이 = 화면 꽉 차게** (`100svh - 헤더 64/84px`, 내용은 세로 가운데, 2026-10-15 사용자) — 슬라이드 넘겨도 높이 같음 · 데스크톱은 왼쪽 글·오른쪽 그림, 넘김 표시 아래 → AI 4동사 카드 → PAD(소개·진열대·분류) → 기획자 과정 띠("우리는 모두 기획자다 / 자기 인생에서만큼은") → 모집 중인 과정
- `app/(Planners)/planners/about/page.tsx` — **About = "플래너를 다시 만들다"** (2026-10-15 사용자 "어바웃은 기획이란으로 가면 안 된다, 플래너를 만들게 된 스토리부터") · 원문 = 구글 사이트 `planners-planner` 페이지(90년대 초 하드보드지·한지 다이어리 → 아웃룩·구글·앱 정착 못함 → 손으로 정리하는 미련 → 태블릿용 제작·공유) · 연표 숫자 = 바닥상회 출시 공지(2022 All in One 1,200여 명·개별 포함 2,000여 명, 2023 4종, 템플릿 160종 이상) · Plan·Do·See · 맺음 "생각한 대로 행동하라". ❌ 지어낸 사실·숫자 넣지 않기 · 마지막 문단(플래너'스 AI를 만든 이유)은 사용자 비전 문구로 Claude가 쓴 초안
- `app/(Planners)/planners/planning/page.tsx` — 기획이란 = 기획론 (구글 사이트 Planning 원고, 2026-10-15 `/planners/about`에서 옮김)
- **메뉴 (2026-10-14 AI 중심 개편)**: 플래너'스 AI(`/planners/ai`) · 플래너'스 PAD(`/planners/pad`) · 이야기 · 기획자 과정(`/planners/projects`, 아래에 참여 확인서) · **About = 유틸리티바 → 플래너를 다시 만들다(`/planners/about`)** (2026-10-15 — 처음부터 `hideAbout`이던 것을 켬) · 기획이란(`/planners/planning`)은 기획자 과정 아래 · 메뉴 이름이 길어져 헤더 펼침 기준 **xl(1280px)** — 그보다 좁으면 햄버거 (1024px에서 메뉴·바가 6px까지 붙음) · 메타 제목 "플래너'스 AI · 내 손으로, 내 뜻대로" (DB ums_sites + site-config)
- `app/(Planners)/planners/pad/page.tsx` — 플래너'스 PAD 몰 (분류 탭 `?c=` · 정렬 `?sort=popular|new|name` · 썸네일 그리드) · `pad/[id]/page.tsx` — 상품 상세 (갤러리·파일 정보·받기·상세 이미지·같은 분류) · 옛 `/planners/planner`·`/planners/templates`는 308
- `lib/planners/library.ts`(서버 조회 `listPlannersFiles`·`getPlannersFile`) · `library-shared.ts`(분류 `PAD_CATEGORIES`·설명·배지 NEW/BEST·정렬) · `features/planners/pad/{ProductCard,Gallery}.tsx` · `features/planners/DownloadButton.tsx`
- 상품 사진·상세 이미지·설명 = `planners_files.images`·`detail_images`·`description` (`scripts/planners-files-media.mjs` + `scripts/data/planners-badak-mall-media.json`) — 사진 366장은 공개 버킷 `planners-media/badak/`로 옮김 (2026-10-14 사용자 승인, 18MB) · 아임웹 주소 0건 — badak.biz가 닫혀도 그대로 나온다
- **사이트 공통 틀 `features/planners/PageHero.tsx`** (2026-10-14 사용자 지적 "레이아웃 일관성·공간이 좁다") — 참조 **logrog.co.kr** (사용자 지정 "여백과 여유"): 폭 `PLANNERS_CONTAINER`(**1590px** · 좌우 px-6 md:px-16, 헤더도 같은 여백·높이 84px) · 구간 여백 `PLANNERS_SPACE`(py-20 md:py-[150px]) · 하위 페이지 머리 `PlannersPageHero`(가운데 정렬 · 60px 제목 · 위아래 170px) · 구간 제목 `PlannersSectionTitle`(가운데 48px + 부제 + 전체 보기) · 첫 화면 큰 사진 높이 800px — 사용자 "여유 있는 구성이 인간적, 더 넓혀" (2026-10-14). ❌ 좁히지 않는다 · 상품 카드 테두리 없이 큰 사진·3열(`ProductGrid`). ❌ 페이지마다 980px·max-w-5xl·검은 배경 등 따로 정하기 · 게시판은 `BoardPage containerClassName="" hideTitle` · 참여 확인서는 `CertificateManager light`
- **첫 화면 관리** (아임웹 키비주얼·기획전 자리): 배너 `planners_banners` · 진열대 `planners_showcases` (`sql/planners-home-2026-10.sql`, 공개 기간·공개 여부로 자동 노출) · 인트라 `/intra/ums/planners/{banners,showcases}` · API `/api/intra/planners/home?type=` · 조회 `lib/planners/home.ts` · 첫 슬라이드는 고정 문구, 배너는 그 뒤에
- **새 후기 알림**: 회원 새 후기 → `notify(brandManagerIds("planners"))` (고친 후기는 알리지 않음)
- **바닥상회 '플래너'스 플래너 사용자' 게시판 운영사 글 8건 → 이야기 '공지'** (2026-10-14, `scripts/planners-notices-import.mjs` + `scripts/data/planners-badak-notices.json`, 멱등 키 `extra_fields.legacy_badak_idx`) · 사진 19장 `planners-media/badak/notices/` · 옛 상품 링크는 같은 시리즈 2026년판으로 · 회원 댓글 6건(2023·2024 출시 글)은 옮기지 않음 (§0.1)
- ❌ 첫 화면·PAD를 긴 글 위주(블로그형)로 되돌리지 않는다 — 사용자 지적 "너무 블로그 같다" (2026-10-14). 상품 사진·진열대 중심
- `app/(Planners)/planners/ai/page.tsx` — 플래너'스 AI 소개 · `app/(Planners)/planners/stories/**` — 이야기 게시판
- `app/(Planners)/planners/app/**` — AI 플래너 앱 (layout = 로그인·온보딩 게이트 + `features/planners/app/{PlannersAppTopBar,PlannersAppSideNav}.tsx`, 메뉴 SSOT `features/planners/app/nav.ts`) · 화면 본체는 `features/myverse/planner/*` 공용 · 사이트 헤더·푸터는 앱 경로에서 숨김(`isPlannersAppPath`)
- **명명 체계 (2026-10-14 사용자 결정)**: 브랜드 Planner's(로고)·플래너'스(한글) + 짧은 제품명 **AI · PAD**. 앱 상단만 짧은 이름(로고 + AI), **헤더 메뉴·구간·카드 라벨·이동 경로·첫 화면 버튼·페이지 제목은 전체 이름 "플래너'스 AI"·"플래너'스 PAD"** (2026-10-14 사용자 지정), 문장 속은 전체 이름(플래너'스 AI는 …) — 맨 "AI"는 일반 인공지능과 헷갈림. 사이트 밖(WORK 드롭다운·유니버스 맵·검색)은 전체 이름. 우측 서비스 입구 이름은 **"내 플래너"** (유틸리티바 `serviceEntry`, §1.9.2)
- **앱 진입 = 유틸리티바 서비스 입구 '내 플래너'** (`serviceEntry`, 2026-10-14 표준 — 비로그인에게도 보이고, 처음 쓰는 회원은 브랜드 동의 후 앱). 앱 상단 바도 계정 메뉴(아바타) + 로그아웃. ❌ 소개 페이지·첫 화면에 '플래너'스 AI 열기' 버튼을 다시 두지 않는다 — 사용자 "중복으로 또 묻는 느낌" (2026-10-14). 사이트 안의 링크는 소개(`/planners/ai`, "알아보기")로
- **앱 화면 틀 통일 (2026-10-14 "레이아웃이 왔다갔다")**: 모든 화면 `max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12` · 화면별 강제 글꼴(Inter) 제거 · 일간/주간/월간/연간 전환 버튼 줄도 같은 폭 · **강조색 = CSS 변수 `--pp-accent`** (공용 화면 `features/myverse/planner·app` 900여 곳 `[#6366F1]`→`[var(--pp-accent)]`, 기본 MyVerse 인디고, Planner's 앱 레이아웃이 `:root`에서 틸로 — 모달까지) · 남은 하드코딩 색(`#6366F1` 문자열 ~70·indigo-*)은 이월
- **MyVerse로 새는 길 차단**: `/` 단축키 → 오늘 작성창 · 정체성 '이력서' 탭 숨김 · 일정 뒤로 가기(흔적) 제거 · 설정 › 기술의 스마트폰 하단 메뉴 제거 · **시간 기록 메뉴 제거**(MyVerse 9 도메인 개인 기록 — `/planners/app/time` → 오늘)
- **인공지능 기능 = 유료 회원 전용 (2026-10-14 사용자 결정)** — SSOT `lib/myverse/ai-access.ts` `requireAiAccess`(유료 구독 활성·직원·서버 내부 호출만, 그 외 402 `ai_paid_only`) · AI를 부르는 `/api/myverse/*` 18개 라우트 전부 적용(그전엔 2개만 확인 → 로그인 회원 누구나 크레딧 소모 가능했음) · 사용 기록 `myverse_ai_usage(kind)` → 충전 시점 판단 · 화면 안내 `features/planners/app/AiPaidOnlyNotice.tsx`(402를 앱 쉘에서 한 번 안내, 가격·결제 링크 없음) · 유료 회원 = `myverse_users.subscription_status='active'`+만료일, 결제 시작 전엔 직원 수동 활성화(인트라 PP AI 관리)만. Anthropic 크레딧은 운영사가 필요할 때 충전. ⚠️ 2026-10-14 로컬 `ANTHROPIC_API_KEY` = invalid x-api-key → 새 키 필요
- **플래너'스 AI 비전 (2026-10-14 사용자)**: "기록은 아날로그처럼 자유롭게, 관리는 비서처럼 똑똑하게, 회고는 코치처럼 따뜻하게" — 아날로그 사용자의 이탈 원인(밀린 일 다시 쓰기·과거 검색 한계·알림 부재) 해소
  - **1단계 ✅** ① 생각 쏟아내기 `features/planners/app/BrainDump.tsx` + `/api/myverse/ai/parse-input`(register_items 한 번에 배열, 확인 후 등록, 공용 등록기 `features/myverse/planner/ai-actions.ts`) ② 못 끝낸 일 자동 재배치 `AutoCarry.tsx`(하루 한 번, 14일, `/api/myverse/daily/carry-over` schedule — 일정 피해 빈 시간 09~21시, AI 아님·무료) ③ 아침 Top 3·저녁 회고 `DayCoach.tsx` + `/api/myverse/daily/focus` (`myverse_daily.focus`·`reflection`, 만든 결과 재사용)
  - **2단계 ✅** ① 목표 자동 분해 `features/myverse/planner/ProjectBreakdown.tsx` + `/api/myverse/projects/[id]/breakdown`(시간 추정·평일 날짜 제안·마감 초과 경고, task `estimate_min`) ② 주간 회고 `features/planners/app/WeeklyReview.tsx` + `/api/myverse/weekly-review`(숫자 무료·한 주 읽기 유료, `myverse_weekly_reports` sources.kind=planner_review) ③ 일상어로 찾기 `/api/myverse/smart-search` + SearchView 'AI로 찾기'(임베딩 없이 질문→기간+낱말→후보→AI 선택)
  - **3단계 ✅** 손글씨 → 디지털 `/api/myverse/handwriting` (Sonnet 4.6 — Haiku는 글자 오독) · 불렛 저널 기호 •×><○−★·취소선 → 상태 · 페이지 날짜 인식 · ① 생각 쏟아내기 '사진으로'(브라우저에서 1600px로 줄여 한 번 보내고 **저장 안 함**) ② 손글씨 노트 '글자로 바꾸기'(획 → 이미지 `renderStrokes`, 이벤트 `planner-read-image`로 BrainDump가 받음) · 메모는 그날 Cornell 노트로(`saveMemoNote`, 저장 후 화면 새로 열기 — DailyView 노트 목록 덮어쓰기 방지) · 취소선 항목은 기본 해제
  - **내 AI에 연결 (MCP) ✅ 2026-10-14** — 사용자가 자기 Claude·ChatGPT에 Planner's를 연결 (AI 비용은 사용자 부담, 연결은 무료). 범위 = **읽기 + 할 일 추가** (사용자 결정, 지우기·고치기 없음)
    - 연결 서버 `app/api/planners-mcp/route.ts` (mcp-handler + zod, 주소 `https://www.planners.ai.kr/api/planners-mcp`) · 도구 get_day·list_tasks·search_records·weekly_summary·list_projects·add_task · 데이터 `lib/planners/mcp-data.ts` (본인 기록만) · 주간 숫자 공용 `lib/planners/weekly-stats.ts`
    - 로그인 승인 = **Supabase OAuth 2.1 서버**(자동 클라이언트 등록·PKCE) · 보호 자원 메타데이터 `/.well-known/oauth-protected-resource`(next.config rewrite → `app/api/oauth-protected-resource`) · 승인 화면 `app/oauth/consent/page.tsx`(middleware skipPaths `/oauth`) · 연결 목록·끊기 = 앱 설정 › 연동 `features/planners/app/ConnectedAi.tsx`(listGrants/revokeGrant)
    - 사용 기록 `myverse_ai_usage` kind `mcp_*` · 도구는 Anthropic을 부르지 않는다
    - ⚠️ 켜려면 Supabase 대시보드 Authentication › OAuth Server: 사용 켜기 · Authorization Path `/oauth/consent` · Dynamic Client Registration 켜기 (사람)
    - ⚠️ 처리방침: '사용자가 연결을 승인한 AI 서비스로 사용자가 요청한 기록 제공, 연결 해제 시 중단' 명시
  - 이월: 반복 일정을 빈 시간 계산에 반영 · 일상어 찾기의 관련 기록 묶음 보강 · '글자로 바꾸기' 실제 펜슬 손글씨로 시험 · **공개 전 처리방침: AI 처리 위탁·국외 이전(Anthropic, 미국), 사진 비저장 명시**
  - 🐛 수정: AI 일정 저장 필드 `entry_date`→`start_date` (예전부터 AI 일정이 저장되지 않았음)
- ❌ AI 라우트를 새로 만들 때 `requireAiAccess` 없이 두기 · 라우트마다 무료 한도 예외 만들기
- **화면 문장 규칙 (2026-10-14 사용자)**: 긴 줄표(—) 쓰지 않는다. 문장은 쉼표, 짧은 라벨은 가운뎃점(·), 날짜 범위는 물결(~), 빈 값은 하이픈(-) · AI가 만든 문장도 저장 전 `lib/planners/text.ts` `noDash` · 영문 대문자 눈썹 라벨(PROJECTS·TASKS 등) 대신 한글
- **앱 반응형 기준 1024px** (`features/planners/app/PlannersMain.tsx`): 미만이면 사이드 메뉴·월 막대 숨김 → 상단 ☰ / 오늘 화면 3단은 lg부터 (패드 세로에서 1단)
- **앱 메뉴 정리 (2026-10-14)**: 'AI 브리핑' 메뉴 뺌(오늘 화면 Top 3·저녁 회고와 겹침, `/ai-briefing` → 오늘 — 사용자 결정) · '일정' 메뉴 뺌(월간·오늘·주간에서 같은 편집기로 보고 넣음, `/schedule` → 월간) · '시간 기록' 뺌 · 설정 탭 '기술' → **'연동'**(내 AI 연결 + 외부 서비스, 따로 있던 `settings/integrations` → 연동 탭) · 설정 '사생활'은 Planner's 기준으로 다시 씀(MyVerse 공개 페이지·자동 수집 동의 제거) · '퍼스널' → '정체성'
- **QA 2차 (2026-10-14)**: 화면 제목 고딕 통일(세리프 제거) · 알림 틀 통일·영문 라벨 제거 · 템플릿 세부 분류 한글 표시(`SUBCATEGORY_KO`, DB 값은 그대로) · **도움말을 지금 기능 기준으로 다시 씀**(시간 트래커·AI 브리핑·가격 '연 19,000원' 삭제, 생각 쏟아내기·손글씨·내 AI 연결 추가, 문의는 이야기 › 질문으로) · 내보내기 안내 Planner's 기준 · 설정 차단·가져오기(MyVerse 소셜) → 설정으로 · 오늘 할 일 줄: 할 일 상자 빈칸(·) 통일, 데스크톱에서 끌기·시각·프로젝트·이동·지우기는 마우스 올릴 때만(오른쪽 끝), 터치 화면은 늘 보임(전엔 '날짜 이동'이 터치에서 안 보였음) · DB 문구 줄표: 진열대 설명·상품 설명 4건 정리
- 🐛 수정: Google 캘린더 연결이 로그인해도 401 (세션 쿠키 이름 `tenone-auth` 누락, 같은 문제 4개 라우트) · Google 로그인 복귀 주소가 myverse.kr 고정 → 시작한 도메인으로 (⚠️ Google Cloud 콘솔 '승인된 리디렉션 URI'에 `https://www.planners.ai.kr/api/myverse/integrations/google/callback` 등록 필요)
- ⚠️ 앱 화면에 개인 OS 기능(캡처·흔적·일기·피드·이력서)으로 가는 링크를 새로 넣지 않는다 — 그건 MyVerse(동결) 소유
- `app/api/planners-library/[id]/download/route.ts` — ⚠️ `/api/planners/*`는 middleware가 `/api/myverse/*`로 재작성하므로 다른 경로
- `scripts/planners-files-import.mjs` + `scripts/data/planners-badak-mall.json` — 바닥상회 원본 → 버킷·테이블 (멱등)
- `app/(Planners)/planners/projects/**` — 회차 목록·방·팀·초대 (코어 프로그램 컴포넌트 얇은 래퍼)
- `app/(Planners)/planners/certificate/**` — 참여 확인서 발급·인쇄·진위 확인
- `app/(Planners)/planners/my/page.tsx` — 마이페이지
- `features/planners/PlannersHeader.tsx`, `PlannersFooter.tsx` · 로고·파비콘 `public/brands/planners/` (favicon 64 · apple-touch-icon 180 · icon-512 · logo-white/black — 2026-10-14 사용자 제공 원본, 어두운 헤더·앱 상단은 logo-white) · DB `ums_sites.favicon_url`·`logo_url`도 같은 경로
- `lib/brand-site-menus.ts` (siteId planners) · `features/programs/ProgramTheme.ts` · `lib/programs/paths.ts`
- 인트라: `app/intra/ums/planners/programs/**`

## 인트라 관리 경로

- **플래너'스 PAD — 아임웹 쇼핑 관리 화면 기준 (2026-10-14)**
  - `/intra/ums/planners/pad` 상품 = 아임웹 '상품' (전체·공개·비공개 탭 · 분류·검색(상품명·파일명·옛 바닥상회 번호) · 썸네일 목록 · 바로 공개 전환 · 상품 등록)
  - `/intra/ums/planners/pad/[id]` (`new` = 등록) 상품 편집 = 상품 사진(올리기·순서·빼기, 첫 장 썸네일) · 디지털 파일(교체 시 옛 파일 삭제) · 상품명·분류·연도·설명 · 상세 이미지 · 공개 · 삭제
  - `/intra/ums/planners/pad/downloads` 받기 현황 = 아임웹 '주문' 자리 — 분류·상품별 다운로드 수만 (누가 받았는지 저장 안 함)
  - `/intra/ums/planners/reviews` 후기 = 아임웹 '구매평' (전체·답글 대기·숨김 · 검색 · 운영자 답글 · 숨기기) · API `/api/intra/planners/reviews` · 사이트 상품 상세 후기 영역 `features/planners/pad/Reviews.tsx` · 회원 쓰기 `/api/planners-library/[id]/reviews` (상품당 1개) · 조회 `lib/planners/reviews.ts` (서버만 — `planners_reviews`는 브라우저 직접 읽기 없음, member_id 비노출, 이름은 읽을 때 가림)
  - **바닥상회 구매평 75건 이전 = §0.1 '회원 데이터 이전 없음'의 사용자 승인 예외 (2026-10-14, 후기만)** — 이름 '첫 글자+**'로 가림 · 회원 코드·주문 번호 미수집 · 운영자 답글 15건 포함 · 옛 연도 판 후기는 2026년판에 `edition`(원래 판 이름)으로 연결 · 원본 JSON은 저장소 밖(`scripts/planners-reviews-import.mjs`) · 문의(1:1·상품 Q&A)는 옮기지 않음
  - 아임웹 '문의' 자리 = 사이트 '이야기' 게시판(질문) · 결제·배송·정기구독은 해당 없음
  - ⚠️ 사이트 회원 후기(member_id+글)는 새 수집 항목 — 공개 전 처리방침 반영 (6단계)
  - 2026 연간(가로형) PDF: 제목 2025→2026 **교체 완료** (2026-10-14 사용자 원본) · ⚠️ **9월·10월 월 이름이 서로 바뀐 채** (Oct 줄=9월 내용, Sep 줄=10월 내용) — 원본 수정 후 다시 교체 · All in One 인덱스 이동 방식 문의 미답변
  - API `/api/intra/planners/files` (직원) · 업로드 헬퍼 `features/planners/admin/upload.ts` (파일 = 비공개 `planners-files`, 사진 = 공개 `planners-media`) · 사진을 목록에서 빼도 Storage 파일은 남는다
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
- 아이디어 샤워 4종 **전부 숨김** (2026-10-14 사용자 결정 — 쇼핑백·명함·앰비언트 '101가지 사례'는 타사 작품 모음이라 저작권 확인 전이기도 함) · 168 가계부는 '스터디' → '노트' (`CATEGORY_FIX`)

## 현재 상태

- **2026-10-14 사이트 AI 중심 개편**: 메뉴·첫 화면·AI 소개(4동사 장 + 세 가지 약속 + 베타 안내)·PAD 머리말·과정 이름(프로젝트 → 기획자 과정)·푸터·마이페이지(내 플래너 카드)·메타
- Phase: 집중 · 플래너'스 AI 1~3단계·내 AI 연결 완료, QA 2차 (세션 174, 2026-10-14) · **사이트 공개 (2026-10-14 사용자 결정, is_open=true·색인 허용)** · 앱 화면(`/planners/app/*`)은 noindex · 처리방침 Planner's 항목·AI 위탁 반영 (10-14 공지 · **10-21 시행**, 시행 후 공지 줄 삭제·LEGAL_DOCUMENTS.privacy 버전 갱신)
- **유료화 순서 (2026-10-14 사용자 결정)**: 베타 테스트 기간 → 유료화. 베타 테스터 = 인트라에서 `myverse_users.subscription_status` 활성 + `subscription_expires_at` = 베타 종료일 (결제 없음, `lib/myverse/ai-access.ts` 그대로 통과). 유료 판매는 통신판매업 신고·약관·자동갱신 고지 후
- 앱 기본 강조색 = 틸 (`MyverseThemeProvider defaultTheme="teal"`, 테마 'Teal' 값이 인디고였던 것 정정 2026-10-14)
- 이월 작업:
  - ~~DB: ums_sites·brand_capabilities~~ ✅ 확인 (2026-10-10: experiment·active·vercel·is_open=false · community·course·purchase)
  - 첫 회차 개설 (`/intra/ums/planners/programs`), 파비콘·OG 이미지 전용 에셋
  - ~~개인정보처리방침에 Planner's 수집 항목 반영~~ ✅ 10-14 · `npm run site:check -- planners --live`

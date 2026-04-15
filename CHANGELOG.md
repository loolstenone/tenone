# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-04-16 (사무실, 세션 52 Part 3) — Intra 관리 + Phase 2 기반

### MI-A: Intra MADLeague 관리 대시보드
- **`/intra/ums/madleague/page.tsx`** 전체 재작성 — Mock 데이터 → 실DB 연동
  - 4탭: 개요 / 지원서 / HeRo / MADzine
  - 5개 StatCard (공식 동아리·대기 지원서·HeRo 신청·발행 아티클·MAD Crown)
  - 지원서 승인/반려 인라인 처리
  - HeRo 상태 전환 (pending → contacted → matched → closed)
  - MADzine 발행/추천 토글
- **Admin API 3종** — `app/api/madleague/admin/*`
  - `_auth.ts` — `requireIntraAdmin` 가드 (Bearer token + members 테이블 존재 확인 + service_role 클라이언트)
  - `applications/route.ts` — GET(status 필터) / PATCH(accept·reject·reviewing)
  - `hero/route.ts` — GET / PATCH(status 업데이트)
  - `articles/route.ts` — GET / PATCH(is_published·is_featured)
- 전 API 401 가드 확인

### M2-A: mad_members 테이블 + 가입 플로우 기반
- **`sql/madleague_phase2_members.sql`** — Prod 적용 완료
  - `mad_members` 테이블 (auth.users FK, club_id/cohort_id FK, role, status, activity_years[], skill_tags[], portfolio_public)
  - RLS: 본인 read/update, portfolio_public=true는 anon 읽기
  - `mad_set_updated_at()` 트리거
  - **`mad_promote_application_to_member()` 트리거** — `mad_applications.status='accepted'` 시 자동으로 mad_members 생성 + cohort member_count +1
  - `mad_link_member_to_user()` 함수 (이메일 기반 user_id 연결)
- **`/api/madleague/member/link`** POST — 로그인한 사용자 이메일로 mad_members 매칭·연결
- **`/madleague/member/page.tsx`** — 3-state 게이트:
  - 미로그인 → 로그인/지원 CTA
  - 로그인 + 멤버 없음 → "내 기록 연동 시도" 버튼 + 지원 안내
  - 로그인 + 멤버 있음 → 대시보드 (이름/동아리/cohort/활동연도/상태 + Phase 2 예정 섹션)
- **`MemberLinkButton.tsx`** 클라이언트 연동 버튼
- 트리거 검증: `test@test.com` 지원서 승인 → mad_members 1건 자동 생성 확인

---

## 2026-04-16 (사무실, 세션 52) — MADLeague 사이트 Phase 1 완료

### Phase 1 전체 페이지 완성 (M1-A ~ M1-J)

#### 시드 확장 (`scripts/seed-madleague-results.js`)
- `mad_competition_results` 9건 (2024 지평주조·2025 대성학원·2025 리제로스 × 1·2·3위, CROWN 3개)
- `mad_archive` 6건, `mad_articles` 6건
- `mad_cohorts.member_count` 86명 총집계

#### 신규 페이지 (Phase 1 완성)
- **`/programs/competition`** 재작성 — DB 드리븐 Hall of Fame, 연도/동아리/과제기업 필터, Process 설명
- **`/madzine`** 재작성 — 카테고리·연도 필터 (라이트 테마) + **`/madzine/[slug]`** 아티클 상세
- **`/archive`** + **`/archive/[id]`** — 연도/유형/동아리/수상 4축 필터
- **`/apply`** + **`/api/madleague/apply`** — 동아리 자동선택(`?club=`), 이메일 검증
- **`/hero`** + **`/api/madleague/hero`** — 관심분야 복수선택 + 로그인 시 user_id 자동 연동
- **`/about`** 리디자인 — Mission(MAD 3글자)/Members/Programs/BI/DAMbe/Contact
- **`/programs/{project, markethon, insight-touring, dam}`** 4개 개별 페이지

#### 수정
- **`features/madleague/MadLeagueFooter.tsx`** — "5개 권역" → "7개 권역"

#### 의사결정
- **M1-G (로고 자산) 보류** — 실제 7개 동아리 로고 이미지 확보 전까지 임시 컬러 원 유지
- **M1-J `/programs/im`** — 기존 363줄 legacy 콘텐츠 유지, 다크 레이아웃으로 래핑만

#### 검증
- 라우트 16종 전부 200 OK (curl 일괄 확인)
- `POST /api/madleague/apply` `{"ok":true}` 응답
- 필터 쿼리스트링 (archive/madzine) 정상 작동
- 브라우저 렌더: Hall of Fame 수상팀(팀명·동아리 컬러점·수상명·CROWN) 전부 정상
- `npx tsc --noEmit` 관련 에러 0

---

## 2026-04-16 (사무실, 세션 52) — MADLeague 사이트 Phase 1 착수

### DB 스키마 + Home 랜딩 + Clubs + 라우트 리팩토링

#### 스펙 문서
- **`docs/MADLeague_Site_Plan_v2.md`** 신규 — MADLeague 사이트 v2 기획서 (사이트맵, 8개 Phase 1 테이블, 디자인 시스템, 인증서 자동화, 3 Phase 로드맵)

#### DB (Prod `ziotlxkdctlhiwkgmmsh`)
- **`sql/madleague_phase1.sql`** 신규 — 8개 테이블 생성 + RLS + 시드
  - `mad_clubs` (7개 동아리: MADLeap, PAM, ADlle, ABC, SUZAK, P:ad, AD Zone)
  - `mad_cohorts` (14개: 7동아리 × 2024/2025)
  - `mad_competitions` (3개: 2024 지평주조, 2025 대성학원, 2025 리제로스)
  - `mad_competition_results`, `mad_archive`, `mad_articles`, `mad_applications`, `mad_hero_applications`
  - 전 테이블 `tenant_id TEXT DEFAULT 'tenone'` (8원칙 #6 선반영)
- **`scripts/reseed-madleague.js`** 신규 — Korean UTF-8 인코딩 복구 (최초 bash+curl 경로에서 Windows CP949 변환으로 한글 깨짐 → Node fetch로 재시드)
- **`scripts/run-sql.js`** 패치 — `SUPABASE_ACCESS_TOKEN` 우선, `SUPABASE_SERVICE_ROLE_KEY_PROD`는 fallback

#### 코드 변경 (UI)
- **`lib/supabase/madleague.ts`** 신규 — `fetchMadClubs`, `fetchMadClubBySlug`, `fetchMadCompetitions`, `fetchMadHallOfFame`, `fetchMadArticles`, `fetchMadStats`
- **`app/(MADLeague)/layout.tsx`** — 라이트(`bg-white`) → 다크(`bg-[--mad-black]`). CSS 변수 5개(`--mad-red #EC1D25`, `--mad-black`, `--mad-gold #FFC000`, `--mad-white`, `--mad-gray`) 주입
- **`features/madleague/MadLeagueHeader.tsx`**
  - 로고: 초록 `MAD` 블록 → 빨간 점(●) + "MAD League" 워드마크
  - 액센트: `#0F5132` → `#EC1D25`
  - navItems: 소개/동아리/프로그램/MADzine/아카이브/지원하기 (모두 `/madleague/*` 절대경로)
- **`features/madleague/MadLeagueFooter.tsx`** — 동일한 로고/링크 업데이트
- **`app/(MADLeague)/madleague/page.tsx`** — UnderConstruction stub → 풀 랜딩 (Hero+Numbers+Programs+Clubs+HallOfFame+MADzine+CTA, DB 실시간)
- **`app/(MADLeague)/madleague/clubs/page.tsx`** 신규 — 7 동아리 리스트
- **`app/(MADLeague)/madleague/clubs/[slug]/page.tsx`** 신규 — 동아리 상세(히어로, 활동연도, 수상, 갤러리, 지원 CTA)
- **`app/(MADLeague)/madleague/programs/page.tsx`** 신규 — 프로그램 인덱스(6 카드)

#### 라우트 리팩토링 (구→신)
- **이동:** `/madleague/pt` → `/madleague/programs/competition`
- **이동:** `/madleague/idea-movement` → `/madleague/programs/im` (essence 서브도 함께)
- **삭제:** `/madleague/program` (새 `/madleague/programs`로 대체)
- **`next.config.ts`** — 301(308) redirects 추가: `/program→/programs`, `/pt→/programs/competition`, `/idea-movement→/programs/im`, `/leaguer→/member`

#### 의사결정
- 동아리 7개 전부 active 확정 (P:ad 강원, AD Zone 충청 포함)
- 인증 아키텍처: tenone.biz 통합 Supabase Auth 재사용 (별도 서브프로젝트 없음)
- `mad_competition_results.team_id`는 Phase 1에서 FK 없이 UUID. Phase 2에 `mad_competition_teams` 생성 시 FK 추가
- 동아리 컬러 7종(#EC1D25/#0066CC/#FF6B35/#00A86B/#FFC000/#4A90E2/#9B59B6) 임시 지정 — 실제 동아리 로고/브랜딩 들어오면 교체

#### 검증
- `curl /madleague/*` 라우트 9종 전부 정상 (200 또는 308 리다이렉트)
- 브라우저 렌더: 한글 정상, Hero/Numbers/Programs/Clubs/HallOfFame 섹션 모두 DB 데이터로 표시
- `npx tsc --noEmit` madleague 관련 에러 0

---

## 2026-04-16 (사무실, 세션 51)

### Badak 이월 항목 일괄 처리 + Phase 0 로드맵 확인

#### 코드 변경
- **`app/intra/ums/badak/needs-queue/page.tsx`** — 관리자 인증 헤더 추가. `createClient().auth.getSession()` → Bearer 토큰. `authError` 상태 처리 추가
- **`app/api/badak/talks/route.ts`** — `unreadTotal` 집계 추가. `wio_talk_messages.read_by` 배열 기반 `.not('read_by', 'cs', '{userId}')` 쿼리로 읽지 않은 메시지 수 계산
- **`app/(Badak)/badak/my/page.tsx`** — `setUnreadTalkCount(0)` → `setUnreadTalkCount(talksData.unreadTotal ?? 0)` 실값 사용

#### 의사결정
- Phase 0 (테넌트 격리) → Phase 1 (제품 활성화) 순서로 다음 작업 진행 확정
- Badak 잔여 항목(검색/알림/온보딩)은 Phase 0 병행으로 처리

---

## 2026-04-16 (사무실, 세션 50)

### E 시리즈 정리 작업 완료 (E-1 ~ E-4)

#### 코드 변경
- **`app/api/badak/member/route.ts`** (E-1) — `SupabaseClient` 타입 명시적 import. `data as { affiliations: string[] | null }` 캐스트로 TS 에러 해소
- **`app/api/badak/member/onboard/route.ts`** (E-1) — 동일 패턴 적용
- **`app/api/badak/needs/review/route.ts`** (E-2, 신규) — `requireAdmin()` 헬퍼: JWT 검증 + `badak_members.role` 체크. GET/PATCH 모두 admin/super_admin만 허용
- **`app/api/cron/badak-expire-wants/route.ts`** (E-4, 신규) — `CRON_SECRET` Bearer 검증 후 `supabase.rpc('expire_badak_wants')` 호출
- **`app/intra/ums/badak/needs-queue/page.tsx`** (신규) — 관리자용 니즈 승인 큐 UI. pending_review 목록 + 승인/거절 버튼

#### DB 변경 (E-3, E-4)
- `sync_community_post_likes` 트리거: `badak_community_likes` AFTER INSERT OR DELETE → `badak_community_posts.likes_count` 업데이트
- `sync_community_post_comments` 트리거: `badak_community_comments` AFTER INSERT OR DELETE → `badak_community_posts.comments_count` 업데이트
- `expire_badak_wants()` PL/pgSQL 함수: `status = 'candidate'` + `expires_at < now()` → `status = 'expired'`로 일괄 업데이트

#### 의사결정
- Vercel Cron 라우트는 `CRON_SECRET` 환경 변수 설정 후 vercel.json에 `"0 0 * * *"` 등록 필요
- E-3 트리거는 Supabase Management API로 직접 적용 완료 (Dashboard 불필요)

---

## 2026-04-16 (사무실, 세션 49)

### WIO Talk + Connections 마이페이지 탭 완성 (Phase C-2)

#### 코드 변경
- **`app/(Badak)/badak/my/page.tsx`** — 관심·대화 탭 실DB 연동 완성
  - state: `connections`, `pendingIncomingCount`, `threads`, `unreadTalkCount`, `activeThreadId`, `messages`, `messageText`, `sendingMessage`, `connectionsLoading`, `talksLoading`
  - useEffect: `/api/badak/connections` + `/api/badak/talks` 병렬 fetch
  - 폴링 useEffect: `activeThreadId` 변경 시 5초마다 `/api/badak/talks/[id]` GET
  - `handleConnectionRespond`: PATCH + 수락 시 talks 탭 자동 이동 + 스레드 오픈
  - `handleSendMessage`: POST + optimistic append + Enter key
  - 관심 탭 UI: 받은 제안(수락/거절/대화 보기) + 보낸 제안 목록
  - 대화 탭 UI: 스레드 사이드바 + 메시지 영역(말풍선) + 입력창. 모바일 목록↔메시지 전환

#### 의사결정
- `unreadTalkCount`: 실시간 추적은 추후 구현, 현재 0으로 초기화 (read_by 배열 기반 집계 필요)
- 폴링 5초 간격: Supabase Realtime 대신 단순 HTTP polling (WIO Talk 설계 원칙)

---

## 2026-04-15 (사무실, 세션 48)

### Badak UX 버그 수정 + 마이페이지 프로필 강화

#### 코드 변경
- **`features/badak/BadakHeader.tsx`** — navItems에서 "바닥이란" 제거 (UniverseUtilityBar ABOUT과 중복)
- **`features/badak/cloud/FeedHighlights.tsx`** — PC 마우스 드래그 스크롤 추가 (`isDragging/hasDragged/startX/scrollLeft` ref 패턴). 인라인 CardWrapper 컴포넌트 안티패턴 제거 → 직접 조건부 Link/div 렌더링
- **`lib/badak-cloud-data.ts`** — FEED_ITEMS 3개(g5/g1/g8)에 `imageUrl` Unsplash URL 추가
- **`app/(Badak)/badak/groups/[id]/page.tsx`** — 전면 단순화: 게시판/신청 기능 제거(~600줄 삭제). 바닥장 영역 버튼으로 변경 → `MemberProfileSheet` 열기
- **`app/(Badak)/badak/my/page.tsx`** — `CareerEntry` 인터페이스 추가. `avatarUrl/career` state 추가. ProfileBoostCard: 프로필 사진 업로드(FileReader, 1MB), 이력 CRUD(추가/수정/삭제, 연월 select, isCurrent 체크박스), 미리보기 버튼+모달(아바타+이름+연차+소개+이력). 프로필 헤더에 avatarUrl 반영. call site에 신규 props 전달
- **`app/api/badak/member/route.ts`** — PUT에 `avatar_url`, `career` 저장 추가. career 컬럼 미존재 시 graceful fallback (career 제외 재시도)

#### 미완 (DB 마이그레이션 필요)
- `badak_members.career JSONB` 컬럼: `ALTER TABLE badak_members ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '[]';` — Supabase Dashboard SQL Editor에서 수동 실행 필요

---

## 2026-04-15 (사무실, 세션 47)

### Badak 유니버스 통합 (Sprint 1-1, 1-4) + 니즈 클라우드 100개

#### 신규 파일
- `app/api/analytics/event/route.ts` — 이벤트 로깅 POST + intra용 집계 GET (MAU/평균 체류/주간 방문)
- `features/badak/useAnalytics.ts` — 페이지뷰 + `sendBeacon` 언로드 세션 종료 훅
- `features/badak/BadakAnalytics.tsx` — 서버 컴포넌트 레이아웃 삽입용 클라이언트 래퍼
- `sql/badak-affiliations-sync.sql` — 기존 badak_members → members.affiliations 싱크 스크립트

#### DB 변경 (Prod)
- `wio_analytics_events` 테이블 신설 — `event_type`, `brand_id`, `tenant_id`, `user_id`, `session_id`, `page_path`, `properties jsonb`, `duration_sec`. 2개 인덱스(brand+created, user+created). RLS: service insert 허용, 인증 유저 select
- `badak_needs` 70 → 100행 (30개 추가)
- `members.affiliations` 싱크 — is_active 기존 badak_members 1명 → `['badak']` 추가

#### 코드 변경
- **`api/badak/feed/route.ts`** — 피드 응답에 `leaderId: g.leader.id` 포함. 지금까지 없어서 FeedCard → MemberProfileSheet 연결이 항상 Fallback "상세 프로필은 멤버 가입 후 확인" 메시지로 표시됐음
- **`api/badak/member/route.ts`** (POST) — `badak_members` 생성 후 `members.affiliations`에 `'badak'` 자동 추가 (`addBadakAffiliation` 헬퍼 추가)
- **`api/badak/member/onboard/route.ts`** (PATCH) — 온보딩 완료 시 `members.affiliations` 동기화
- **`api/badak/members/[id]/route.ts`** — `members` 테이블 JOIN으로 이름/아바타 최신값 반영. `affiliations`에 `'badak'` 없으면 404 응답
- **`api/badak/cloud/route.ts`** — 3버그 수정: status 필터 `'active' → 'gathering'` 포함, limit 60→100, 존재하지 않는 `category` 컬럼 제거
- **`app/(Badak)/badak/page.tsx`** — 클라우드 단어 제한 모바일 50→60 / 데스크탑 80→100
- **`app/(Badak)/layout.tsx`** — `BadakAnalytics` 컴포넌트 추가 (페이지뷰 자동 기록)
- **`app/intra/ums/badak/page.tsx`** — 성장 지표 전면 교체
  - 이번달 신규: 실DB count (지난달 수치도 sub로 표시)
  - 월간 성장률: 이번달-지난달 / 지난달 * 100 (색상 양수/음수 구분)
  - MAU/체류시간/방문횟수: 이벤트 수집 데이터 기반, 없으면 "수집 중" 표시
  - 데이터 출처 하단 안내 문구

#### 의사결정
- **Sprint 1-2, 1-3 스킵**: 오픈채팅방 페이지(`/badak/rooms`), DAM Party 페이지(`/badak/dam-party`)는 만들지 않기로 결정 (사용자 지시)
- **로컬 dev 이슈 인식**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` (JWT, `_PROD` 아님) 없음 → 모든 Badak API가 로컬에서 "supabaseKey is required" 실패 → Cloud API는 try/catch로 Mock 폴백, 나머지는 500. Prod 배포 시 Vercel env로 정상 작동

---

## 2026-04-15 (사무실, 세션 46 — 후반)

### Badak UX 전면 개선 + 유니버스 관점 QA

#### 신규 파일
- `features/badak/MemberProfileSheet.tsx` — 개설자/멤버 공개 프로필 바텀 시트 (아바타/이름/역할/직무/Bio/개설모임/태그)
- `app/api/badak/members/[id]/route.ts` — 공개 프로필 API (인증 불필요, 활성 모임 5개 포함)
- `app/api/badak/groups/[id]/route.ts` — 모임 PATCH (join_type 등 바닥장 전용 필드 변경)
- `features/badak/cloud/ParticipationBanner.tsx` — 피드 중간 참여 독려 문구 13종 (i=1,6,12 위치 삽입)
- `features/badak/cloud/QuoteBanner.tsx` — 피드 중간 격언 배너 (i=3,9 위치)

#### NeedDetailSheet 전면 재작성
- **관련 니즈 클릭 가능** (`span` → `button`) + 정렬 방식 `sin 해시` → `members 수 내림차순(인기순)`
- **카운트 통일** — 상단 `word.members`와 하단 `interestCount` 불일치 해결 (`Math.max`로 통합)
- **슬라이딩 애니메이션 제거** — `appeared` 상태로 첫 마운트에만 `badak-fadeUp` 적용 (리렌더링마다 재실행 차단)
- **불꽃(🔥) 버튼 제거** — 목적 불명확, 관심 버튼만 유지
- **관심 버튼 낙관적 UI** — `needId` 없는 Mock 데이터도 즉시 +1 반응
- **텍스트박스 + 버튼 시각적 분리** — 배경색 `rgba(255,255,255,0.04)` vs `rgba(0,0,0,0.25)` 대비
- **"관심이에요" → "관심있어요"** 어감 수정
- **15명 로직 변경** — 방 개설 버튼 항상 표시, 15명 달성 = "바닥 공식 런칭"
- **방 개설 버튼 작동 수정** — `onClose()`/`router.push()` 순서 반전 (router 먼저 → 언마운트 안전), `type="button"` 명시

#### FeedCard 리더 표시 개선
- "바닥장 김도현" 통합 텍스트 → "김도현" 이름 중심 + `바닥장` 소형 뱃지 분리
- 아바타 이니셜: "바" → 실제 이름 첫 글자 "김"
- **리더 영역 클릭 → `MemberProfileSheet` 공개 프로필** (이름/아바타 클릭 가능)

#### 니즈 클라우드 찌그러짐 수정
- 모바일 sphere radius 120 → 130~170 (화면 폭 42%, 170px 상한)
- 단어 수 제한 — 모바일 50개 / 데스크탑 80개 (인기순 정렬)
- `CloudBubble` 반응형 폰트 — 작은 구 9~13px (기존 11~16)
- 긴 텍스트 자르기 — 모바일 10자+, 데스크탑 14자+ `…`
- 뒷면 숨김 강화 — `depth<0.15` → `depth<0.2`
- 컨테이너 비율 `radius*2.8` → `radius*2.4`

#### API 보강
- `/api/badak/needs` POST — 신규 니즈 생성은 인증 유저만 허용 (스팸 방지). 기존 count++는 누구나 가능
- `/api/badak/groups/[id]/join` POST — **양방향 알림**: 바닥장(승인제만) + 신청자(선착순 "확정", 승인제 "접수")
- `PATCH /api/badak/groups/[id]` — 바닥장만 join_type 변경 가능

#### 개선사항 리스트업 (문서)
- 유니버스 관점 전문가 QA 수행 — 4개 역할(관리자/바닥장/회원/일반유저) 교차 검증
- Ten:One Universe 8대 원칙 중 5건 위반 식별
- `/intra/ums/badak` 가이드 분석 — 기존 코어(채팅방 48개, DAM Party 47회차) 연결 누락 발견
- WIO 역방향 환류 후보 10개 추출 (BottomSheet, withLoginGate HOC, 낙관적 리액션 훅 등)

### 주요 결정사항
- **`badak_members` 별도 테이블 폐기 방향** — 기존 `members.affiliations=['badak']` 활용
- **`/badak/admin` 페이지 개발하지 않음** — `/intra/ums/badak`에 통합
- **HeRo Time** 프로필 섹션 신설 필요 (크로스 브랜드 커리어 이력)

---

## 2026-04-15 (사무실, 세션 46 — 전반)

### Badak 사이트 정밀 검토 + 12개 이슈 일괄 수정

#### 신규 파일
- `app/api/badak/notifications/route.ts` — 알림 API (GET 목록/PUT 읽음 처리)

#### 수정 파일 (보안)
- 14개 Badak API 파일 — `SUPABASE_SERVICE_ROLE_KEY` 폴백 제거, 명시적 에러 처리

#### 수정 파일 (API 신규 엔드포인트)
- `app/api/badak/groups/[id]/join/route.ts` — GET (참여 상태 조회) + 참여 신청 시 바닥장 알림 생성
- `app/api/badak/member/route.ts` — PUT (프로필 수정)
- `app/api/badak/community/[postId]/route.ts` — PUT (글 수정) + DELETE (글 삭제) + 조회수 직접 증가
- `app/api/badak/community/[postId]/comments/route.ts` — GET (댓글 목록) + DELETE (댓글 삭제)
- `app/api/badak/groups/[id]/posts/route.ts` — PUT (게시글 수정) + DELETE (게시글 삭제) + 페이지네이션 + N+1 해결
- `app/api/badak/posts/[postId]/comments/route.ts` — DELETE (댓글 삭제) + 페이지네이션
- `app/api/badak/groups/route.ts` — PUT (모임 수정) + DELETE (모임 삭제)
- `app/api/badak/cloud/route.ts` — Phase 1 실DB 전환 (badak_needs 우선, Mock 폴백)

#### 수정 파일 (프론트엔드)
- `app/(Badak)/badak/community/page.tsx` — 전면 개편: 글 상세 + 좋아요 + 댓글 + 수정/삭제 + 검색/필터
- `app/(Badak)/badak/groups/[id]/page.tsx` — 참여 상태 서버 조회 + CTA 4분기 (leader/approved/applied/none)
- `app/(Badak)/badak/my/page.tsx` — 내 글 실DB 전환 + 프로필 실DB + 메시지탭→알림탭 + 프로필 수정 API 연결
- `app/api/badak/community/[postId]/like/route.ts` — broken RPC 제거, COUNT 직접 사용
- `app/api/badak/feed/route.ts` — 타입 캐스팅 수정

#### DB 마이그레이션
- `badak_notifications` 테이블 생성 (type, title, body, link, read, metadata) + RLS

#### 결정 사항
- 모임 참여 상태는 서버에서 관리 (leader/approved/applied/none)
- 참여자 있는 모임은 삭제 대신 closed 처리
- 서비스 키 없으면 에러 throw (anon_key 폴백 절대 금지)
- 커뮤니티에 글 상세 화면 추가 (좋아요/댓글/수정/삭제 완비)
- 마이페이지 메시지 탭 폐기 → 알림 탭으로 전환 (실DB)

---

## 2026-04-14 (집, 세션 45)

### Badak Next Stage — 다크 테마 통일 + 클라우드 개선 + 바닥장 시스템

#### 신규 파일
- `app/(Badak)/badak/apply/page.tsx` — 바닥장 신청 페이지 (이름/산업군/경력/분야/동기/계획/연락처, 직접 입력 분야는 승인 시 전체 카테고리 반영)

#### 수정 파일 (다크 테마 통일 — #1a1a2e)
- `app/(Badak)/badak/page.tsx` — skyBg, 슬로건, 서브카피 8종 랜덤, 스파크 amber, 입력영역 다크
- `features/badak/cloud/CloudBubble.tsx` — amber/gray 색상 + CSS transition(0.08s) + willChange
- `features/badak/cloud/NeedsInput.tsx` — 입력창/버튼 다크 스타일
- `features/badak/cloud/FeedCard.tsx` — 카드/뱃지/프로그레스바 다크
- `features/badak/cloud/FeedHighlights.tsx` — 하이라이트 카드 다크
- `features/badak/cloud/FeedSection.tsx` — 컨테이너/탭 다크
- `lib/badak-cloud-data.ts` — `getTimeBasedSky()` 6시간대 전부 다크 그라디언트
- `features/badak/BadakHeader.tsx` — 메뉴 정리 (모임, 커뮤니티, 스토리, 탐색, 모임 개설, 바닥장 신청, 바닥이란)

#### 수정 파일 (기능)
- `app/(Badak)/badak/groups/create/page.tsx` — 커스텀 니즈 드롭다운(검색+제목 기반 추천+미개설만), 바닥장 분기(비바닥장: 1회만+유도 배너), 운영방식 7종, 태그 ','구분, groupCategory
- `app/(Badak)/badak/about/page.tsx` — 다크 테마 리라이트 (약한 연결 고리 철학 + 4단계 흐름 + 서비스 링크 + CTA)

#### 결정 사항
- 메인 페이지 전체 #1a1a2e 다크 테마 확정
- 바닥장 = 트레바리 클럽장 모델. 관리자 승인제, 승인 시 role='badakjang'
- 비바닥장은 1회 단발 모임만 개설 가능, 바닥장 신청 유도
- 직접 입력 분야가 승인되면 바닥 전체 카테고리에 반영
- 운영방식: 네트워킹, 스터디, 사이드 프로젝트, 강의, 토론, 멘토링/코칭, 워크숍/세미나
- 클라우드 애니메이션: dt 보간 + CSS transition + FRICTION 0.985

---

## 2026-04-14 (집, 세션 44)

### Vercel 비용 관리 + 배포 정책 수립

#### 수정 파일
- `vercel.json` — `git.deploymentEnabled` 추가: dev/feature-* 프리뷰 배포 차단
- `CLAUDE.md` — "작업 종료 프로토콜"에 Vercel 비용 관리 규칙 블록 추가, "절대 하지 말 것"에 중간 push 금지 항목 추가

#### 결정 사항
- Vercel Pro 전환 ($20/월). 동일 커밋 20+회 반복 배포가 Free 리밋 소진 원인
- **push는 작업 종료 시 1회만** — 작업 중 push 금지 (매 push → 자동 배포 → 크레딧 소진)
- 로컬 `npm run dev`로 확인, Vercel 배포는 최소화
- On-Demand 상한 $100 설정 완료

---

## 2026-04-13 (집, 세션 41)

### Intra Phase C — ERP 입력 폼 + Wiki DB 연동

#### 수정 파일
- `app/intra/erp/finance/billing/page.tsx` — 청구서 발행 모달 추가 (InvoiceModal 컴포넌트, createInvoice 연동)
- `app/intra/erp/finance/card/page.tsx` — 하드코딩 mockCards 제거, card_usage에서 카드별 집계 동적 생성
- `app/intra/wiki/library/page.tsx` — DB items 실제 로드 (기존 TODO 해결), displayItems = DB || mock
- `app/intra/wiki/faq/page.tsx` — FAQ 등록 모달 추가 (AddFaqModal), wiki_faq 테이블 저장 + 로컬 fallback

---

## 2026-04-12 (집, 세션 40)

### Brand Gravity 컨설팅 서비스 — P0 전체 완료

#### 신규 파일
- `app/api/gravity/prescan/run/route.ts` — Quick Probe API (시장 사전 진단, 유형 A/A'/B/C 자동 판정)
- `app/api/gravity/social/run/route.ts` — Naver 소셜 언급 · SOV · 감정분석 API
- `app/api/gravity/brand-value/run/route.ts` — 브랜드 4대 가치 (인지도/호감도/추천도/만족도) 산출
- `lib/gravity/notify.ts` — agent_messages 기반 그래비티 에이전트 메신저 알림 유틸
- `components/gravity/PrescanCard.tsx` — 시장 유형 뱃지 + 여정 히트맵 + 4대 가치 바 카드
- `app/intra/gravity/[productId]/intake/page.tsx` — 클라이언트 사전 질문서 A~E 5섹션
- `docs/BrandGravity_Service_Design.md` — 1주 컨설팅 프로세스 설계서

#### 수정 파일
- `app/api/gravity/gap/run/route.ts` — Gravity Score 공식 수정 (Mention40 + Context25 + Rank20 + Coverage15)
- `app/api/gravity/scan/run/route.ts` — 5단계 → 8단계 파이프라인 (source/voice/brand-value 추가) + 메신저 훅
- `app/api/gravity/apply/route.ts` — 신청 시 그래비티 에이전트 알림 추가
- `app/intra/gravity/page.tsx` — 대시보드 "오늘의 할 일" + "에이전트 메시지" 섹션 추가
- `app/intra/gravity/[productId]/page.tsx` — PrescanCard 삽입
- `app/intra/gravity/[productId]/report/page.tsx` — 섹션 11(4대가치) + 섹션 12(세일즈액션) + 배점 수정
- `scripts/reset-and-reseed-dancingwhale.js` — 춤추는고래 여성위생용품으로 전면 재작성

#### DB 변경
- 신규 테이블: bg_prescan_results, bg_brand_values, bg_intake_responses
- bg_products: market_type 컬럼 추가
- agent_profiles: gravity(그래비티) 에이전트 INSERT (layer=1, can_invoke: 1001/smarcomm/mindle)

#### 파이프라인 검증
- 춤추는고래 8단계 전체 실행 완료: Gravity Score 6/100, Brand Values 종합 20/100 (정상)

---

## 2026-04-10 (집, 세션 38)

### Brand Gravity 보고서 시스템 구축

#### 신규 파일
- `app/intra/gravity/[productId]/report/page.tsx` — 클라이언트 전달용 보고서 페이지

#### DB 마이그레이션
- bg_gravity_scores: `context_score` 컬럼 추가
- bg_products: `site_url`, `specs` 컬럼 추가
- bg_ai_probe_results: 6개 컬럼 추가

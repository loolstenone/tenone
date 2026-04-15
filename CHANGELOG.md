# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

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

# 작업 현황

> 마지막 업데이트: 2026-04-16 (사무실, 세션 50)

---

## 세션 50 완료 항목 — E 시리즈 정리 작업 (E-1 ~ E-4)

| 항목 | 내용 |
|------|------|
| **E-1**: TS 에러 수정 | `api/badak/member/route.ts` + `onboard/route.ts` — `SupabaseClient` 타입 import, `affiliations` 명시적 캐스트 |
| **E-2**: 니즈 승인 API 보안 강화 | `/api/badak/needs/review` — `requireAdmin()` 헬퍼 추가. `badak_members.role` 검증 (`admin`/`super_admin`만) |
| **E-3**: 커뮤니티 카운터 트리거 | DB: `sync_community_post_likes` + `sync_community_post_comments` AFTER INSERT/DELETE 트리거 적용 |
| **E-4**: 바닥 만료 배치 | DB: `expire_badak_wants()` 함수 + `/api/cron/badak-expire-wants` Vercel Cron 라우트 |
| **needs-queue 페이지** | `/intra/ums/badak/needs-queue` — 관리자용 니즈 승인 큐 UI |

## 다음 할 일

### 즉시 처리 필요
- **vercel.json Cron 등록**: `/api/cron/badak-expire-wants` 를 `"0 0 * * *"` 스케줄로 추가
- **`CRON_SECRET` 환경 변수**: Vercel Dashboard > 프로젝트 > Settings > Environment Variables에 추가
- **`career` JSONB 컬럼 마이그레이션**: Supabase 대시보드 SQL Editor에서 실행 필요
  ```sql
  ALTER TABLE badak_members ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '[]';
  ```

### Sprint 2 — HeRo Time + 관리자
1. `MemberProfileSheet`에 **HeRo Time** 섹션 추가 (크로스 브랜드 커리어 이력)
2. `/intra/ums/badak/needs-queue` 완성도 높이기 (현재 기본 CRUD)

### Sprint 3 — WIO 역방향 환류
3. `wio_ui_components.BottomSheet` 추출
4. `wio_auth.withLoginGate` HOC 추출
5. `wio_hooks.useOptimisticReaction` 추출

### 이월
- 마이페이지 북마크/내 모임 실DB 전환 (`badak_bookmarks`, `badak_group_members`)
- 커뮤니티 조회수 중복 방지
- `unreadTalkCount` read_by 배열 기반 실집계 구현

---

## 세션 49 완료 항목 — WIO Talk + Connections 탭 완성 (C-2)

| 항목 | 내용 |
|------|------|
| **관심 탭 (connections)** | `/api/badak/connections` GET 연동. 받은 제안 목록(수락/거절 버튼), 보낸 제안 목록. 수락 시 대화 탭으로 자동 이동 + 스레드 오픈 |
| **대화 탭 (talks)** | `/api/badak/talks` GET 연동. 스레드 목록 + 1:1 메시지 뷰. 5초 폴링. Enter 전송. 모바일: 목록↔메시지 전환 |
| **state 선언** | `connections`, `pendingIncomingCount`, `threads`, `unreadTalkCount`, `activeThreadId`, `messages`, `messageText`, `sendingMessage`, `connectionsLoading`, `talksLoading` |
| **핸들러** | `handleConnectionRespond` (PATCH /api/badak/connections), `handleSendMessage` (POST /api/badak/talks/[id]), 폴링 useEffect |

## 다음 할 일

### 즉시 처리 필요
- **`career` JSONB 컬럼 마이그레이션**: Supabase 대시보드 SQL Editor에서 실행 필요
  ```sql
  ALTER TABLE badak_members ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '[]';
  ```

### E 시리즈 — 정리 작업
- **E-1**: `api/badak/member*` TS 에러 — `affiliations` 타입 (`members` 테이블 타입 생성 필요)
- **E-2**: `/api/badak/needs/review` RLS — admin-only 체크
- **E-3**: `badak_community_posts` 카운터 동기화 DB 트리거
- **E-4**: `badak_wants` 자동 만료 배치

---

## 세션 48 완료 항목 — Badak UX 버그 수정 + 마이페이지 프로필 강화

| 항목 | 내용 |
|------|------|
| **FeedHighlights PC 드래그 스크롤** | `isDragging/hasDragged/startX/scrollLeft` ref 패턴. 5px 임계값으로 드래그 vs 클릭 분리. `cursor: grabbing` 상태 반영 |
| **FeedCard 이미지 표시** | `FEED_ITEMS` Mock 3개(g5/g1/g8)에 `imageUrl` Unsplash URL 추가 |
| **FeedHighlights 카드 클릭 수정** | 인라인 CardWrapper 컴포넌트 안티패턴 제거 → 직접 조건부 Link/div 렌더링으로 교체 |
| **모임 상세 페이지 단순화** | 게시판 기능 전체 제거 (~600줄 삭제). 신청/참여 기능 제거. 바닥장 버튼 클릭 → `MemberProfileSheet` 열기 |
| **BadakHeader 중복 ABOUT 제거** | navItems에서 "바닥이란" 항목 제거 (UniverseUtilityBar의 ABOUT과 중복) |
| **마이페이지 프로필 사진 업로드** | ProfileBoostCard에 `<input type="file">` + FileReader base64 변환. 1MB 제한. 프로필 헤더에 avatarUrl 반영 |
| **마이페이지 이력 추가** | `CareerEntry` 인터페이스 (startYear/startMonth/endYear/endMonth/isCurrent/company/title/description). ProfileBoostCard 내 이력 CRUD (추가/수정/삭제 폼, 연월 select) |
| **마이페이지 미리보기 버튼** | "미리보기" 버튼 → 바텀시트 모달. 아바타+이름+경력연차+한줄소개+이력 목록 표시 |
| **API route 업데이트** | `/api/badak/member` PUT에 `avatarUrl → avatar_url`, `career → career` 저장. career 컬럼 미존재 시 graceful fallback |

## 다음 할 일

### 즉시 처리 필요
- **`career` JSONB 컬럼 마이그레이션**: Supabase 대시보드 SQL Editor에서 실행 필요
  ```sql
  ALTER TABLE badak_members ADD COLUMN IF NOT EXISTS career JSONB DEFAULT '[]';
  ```
  (SUPABASE_SERVICE_ROLE_KEY 미설정으로 자동 실행 불가)
- **`SUPABASE_SERVICE_ROLE_KEY` .env.local 추가** — 로컬 dev에서 Badak API 정상 작동을 위해 필요
  - Supabase Dashboard > 프로젝트 `dwdoxzksvzjnsgupjzob` > Settings > API > service_role key

### Sprint 2 — HeRo Time + 관리자
1. `MemberProfileSheet`에 **HeRo Time** 섹션 추가 (크로스 브랜드 커리어 이력)
2. `/intra/ums/badak/needs-queue` — pending_review 니즈 승인 큐

### Sprint 3 — WIO 역방향 환류
3. `wio_ui_components.BottomSheet` 추출
4. `wio_auth.withLoginGate` HOC 추출
5. `wio_hooks.useOptimisticReaction` 추출
6. `wio_people.PublicProfile` 컴포넌트 확정

### 이월
- 마이페이지 북마크/내 모임 실DB 전환 (`badak_bookmarks`, `badak_group_members`)
- 커뮤니티 조회수 중복 방지
- `RESEND_API_KEY` .env.local 추가

---

## 이전 세션 (세션 47) 완료 항목 — Badak 유니버스 통합 + 니즈 클라우드 확장

| 항목 | 내용 |
|------|------|
| **Sprint 1-1 완료**: `members.affiliations` 소스 오브 트루스화 | POST/onboard에서 `members.affiliations`에 `'badak'` 자동 추가. 기존 badak_members 행 DB 싱크 완료 |
| Feed API `leaderId` 누락 수정 | 피드 응답에 `leaderId` 포함 → FeedCard → MemberProfileSheet 실제 연결 복구 |
| `/api/badak/members/[id]` 개선 | `members` 테이블 JOIN → 이름/아바타 최신값 반영. `affiliations`에 `'badak'` 없으면 404 |
| **Sprint 1-4 완료**: `/intra/ums/badak` 실데이터 연동 | 월간 신규/성장률 DB 실측. MAU/체류시간/방문횟수는 "수집 중" 상태 |
| `wio_analytics_events` 테이블 신설 | `event_type`, `brand_id`, `session_id`, `duration_sec` 등 |
| `/api/analytics/event` POST/GET | 이벤트 로깅 + intra용 집계 |
| `features/badak/useAnalytics.ts` 훅 | 페이지뷰 + `sendBeacon` 세션 종료 이벤트 |
| **니즈 클라우드 키워드 100개** | DB `badak_needs` 70 → 100 |
| Cloud API 버그 3건 수정 | status 필터, limit, category 컬럼 |
| 클라우드 단어 제한 상향 | 데스크탑 80→100, 모바일 50→60 |

---

## Vercel 상태 (2026-04-14 기준)

| 항목 | 상태 |
|------|------|
| 플랜 | Pro ($20/월) |
| 포함 크레딧 | $1.90 / $20.00 사용 (9.5%) |
| On-Demand 상한 | $100 |
| 프리뷰 배포 | 차단됨 (dev/feature-* 비활성화) |

---

## 인트라 현황 진단 (세션 43 기준)

| 모듈 | 총 페이지 | 실DB | 구현율 |
|------|----------|------|--------|
| MARKETING | 17 | 16 | 94% |
| INTEL | 61 | 37 | 61% |
| UNIVERSE | 46 | 27 | 59% |
| ERP | 56 | 28 | 50% |
| MY | 24 | 4 | 17% |
| **합계** | **204** | **112** | **55%** |

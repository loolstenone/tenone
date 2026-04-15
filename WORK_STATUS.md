# 작업 현황

> 마지막 업데이트: 2026-04-16 (사무실, 세션 52 — Phase 1 완료)

---

## 세션 52 완료 항목 — MADLeague 사이트 Phase 1 완료

### 파트 1 — 기반
| 항목 | 내용 |
|------|------|
| 기획서 | `docs/MADLeague_Site_Plan_v2.md` |
| DB | `sql/madleague_phase1.sql` 8 테이블 + RLS + 시드 (7 동아리, 14 cohorts, 3 경쟁PT) |
| 확장 시드 | `scripts/seed-madleague-results.js` — 9 results, 6 archive, 6 articles |
| 인코딩 복구 | `scripts/reseed-madleague.js` (Node fetch) |
| run-sql.js | `SUPABASE_ACCESS_TOKEN` 우선 fallback |
| DB 헬퍼 | `lib/supabase/madleague.ts` |
| Layout/Header/Footer | 다크 모드, #EC1D25 액센트, 로고 교체, "7개 권역" |

### 파트 2 — 페이지 (M1-A ~ M1-J)
| 페이지 | 경로 | 핵심 |
|-------|------|------|
| Home | `/madleague` | Hero+Numbers+Programs+Clubs+HallOfFame+MADzine+CTA |
| About | `/madleague/about` | MAD Mission/Members/Programs/BI/DAMbe/Contact |
| Clubs | `/clubs`, `/clubs/[slug]` | 동아리 목록 + 상세(활동연도/수상/갤러리) |
| Programs 인덱스 | `/programs` | 6 카드 |
| 경쟁PT | `/programs/competition` | **DB 드리븐 Hall of Fame + 필터** |
| 개별 프로그램 | `/programs/{project, markethon, insight-touring, im, dam}` | 5개 상세 |
| MADzine | `/madzine`, `/madzine/[slug]` | 카테고리·연도 필터 + 아티클 상세 |
| Archive | `/archive`, `/archive/[id]` | 4축 필터(연도/유형/동아리/수상) |
| Apply | `/apply` + `/api/madleague/apply` | 폼 + API |
| HeRo | `/hero` + `/api/madleague/hero` | 폼 + API |

### 라우트 리팩토링 (301 redirects)
`/program → /programs`, `/pt → /programs/competition`, `/idea-movement → /programs/im`, `/leaguer → /member`

## 다음 할 일

### MADLeague Phase 1 이월 (자산 대기)
| # | 작업 |
|---|------|
| **M1-G** | 동아리 로고 이미지 7종 확보 후 `mad_clubs.logo_url` 업데이트 (Storage 업로드 포함) |
| **ML-E** | 실제 MADzine 콘텐츠 이관 (/59 → mad_articles), Hall of Fame 이미지, DAM 히스토리 사진 |

### MADLeague Phase 2 — 멤버 허브 (예상 4주)
| # | 작업 |
|---|------|
| **M2-A** | `mad_members` 테이블 추가 + tenone.biz auth 연동 + 매드리거 가입 플로우 |
| **M2-B** | `/member` 대시보드 (내 동아리/기수/프로젝트/포트폴리오 완성도) |
| **M2-C** | `/member/profile` 기본 정보 + 활동 이력 자동 집계 + 스킬 태그 |
| **M2-D** | `/member/projects` 참여 프로젝트 목록 |
| **M2-E** | `/member/portfolio` + 퍼블릭 `/portfolio/[member-id]` |
| **M2-F** | ⭐ `/member/certificate` 인증서 4종 자동 발급 (PDF + QR + 고유코드) |
| **M2-G** | `/certificate/verify/[code]` 퍼블릭 검증 |
| **M2-H** | `/competition` 경쟁PT 워크스페이스 + `mad_competition_teams`, `mad_submissions` 테이블 |
| **M2-I** | `/community` 피드/동아리별/핀보드/공지 + `mad_posts`, `mad_comments` |

### MADLeague Phase 3 — Universe 연계 (예상 3주)
| # | 작업 |
|---|------|
| **M3-A** | `/growth/career` HeRo 연계 |
| **M3-B** | `/growth/network` Badak 연계 (아무때나 가입) |
| **M3-C** | `/growth/crew` YouInOne 연계 |
| **M3-D** | `/programs/dam` 참가신청 학생/현업/기업 탭 통합 |

### Intra 연동
| # | 작업 |
|---|------|
| **MI-A** | Intra에 MADLeague 관리 메뉴 (멤버/동아리/경쟁PT/프로그램/인증서/지원서/MADzine/아카이브 CRUD) |

### 런칭 준비
| # | 작업 |
|---|------|
| **ML-A** | DNS: madleague.net → tenone.biz 연결 |
| **ML-B** | madleague.tenone.biz 스테이징 |
| **ML-C** | 구 imweb → 신 사이트 301 전환 |

### Phase 0 병행 (원래 계획)
| # | 작업 |
|---|------|
| **0-A** | `tenant_id` 63개 테이블 일괄 추가 + RLS 업데이트 (mad_* 테이블은 이미 선반영됨) |
| **0-B** | 고객 신원 4계층 (auth.users → profiles → member_brand_joins → wio_members) |
| **0-C** | 중복 테이블 정리 (expenses/approvals/timesheets/chat → wio_*) |
| **0-D** | WIO 서비스 인프라 (wio_tenant_configs, wio_feature_flags) |

### Badak 잔여
- 멤버 검색/필터 고도화
- 모임 상세 페이지 완성
- 알림 시스템
- 온보딩 플로우

---

## 세션 51 완료 항목 — Badak 마무리 정리 (이월 항목 일괄 처리)

| 항목 | 내용 |
|------|------|
| **vercel.json Cron 확인** | `badak-expire-wants` `"0 0 * * *"` 등록 확인 완료 |
| **needs-queue 인증** | 관리자 페이지에 Bearer 토큰 인증 헤더 추가. authError 상태 처리 |
| **unreadTalkCount 실집계** | `/api/badak/talks` 응답에 `unreadTotal` 포함. `wio_talk_messages.read_by` 배열 기반 집계. 마이페이지에서 실값 사용 |
| **ROADMAP Phase 0 검토** | 다음 우선순위 확인: tenant_id 일괄 추가(0-A), 고객 신원 아키텍처(0-B), 중복 테이블 정리(0-C), WIO 서비스 인프라(0-D) |

## 다음 할 일

### Phase 0 — 테넌트 격리 인프라 (즉시 처리)

| # | 작업 | 세부 내용 |
|---|------|-----------|
| **0-A** | `tenant_id` 일괄 추가 | 63개 테이블 `ALTER TABLE ADD COLUMN tenant_id TEXT DEFAULT 'tenone'` + RLS 업데이트 |
| **0-B** | 고객 신원 아키텍처 | 4계층: auth.users → profiles → member_brand_joins → wio_members |
| **0-C** | 중복 테이블 정리 | expenses→wio_expenses, approvals→wio_approvals, timesheets→wio_timesheets, chat→wio_chat |
| **0-D** | WIO 서비스 인프라 | `wio_tenant_configs`, `wio_feature_flags` 테이블 신설 |

### Phase 1 — 제품 활성화 (4월 3~4주)

| # | 작업 |
|---|------|
| **1-A** | Mindle 관리 (구독자 DB, 트렌드 카드) |
| **1-B** | SmarComm Coming Soon 해제 |
| **1-C** | WIO 테넌트 관리 (구독 DB 연결) |
| **1-D** | Agent Hub 활성화 (badaksoe 엔드포인트, 10:01 프로토콜) |

### Badak 잔여 (Phase 0 병행)
- 멤버 검색/필터 고도화
- 모임 상세 페이지 완성
- 알림 시스템
- 온보딩 플로우

---

## 세션 50 완료 항목 — E 시리즈 정리 작업 (E-1 ~ E-4)

| 항목 | 내용 |
|------|------|
| **E-1**: TS 에러 수정 | `api/badak/member/route.ts` + `onboard/route.ts` — `SupabaseClient` 타입 import, `affiliations` 명시적 캐스트 |
| **E-2**: 니즈 승인 API 보안 강화 | `/api/badak/needs/review` — `requireAdmin()` 헬퍼 추가. `badak_members.role` 검증 (`admin`/`super_admin`만) |
| **E-3**: 커뮤니티 카운터 트리거 | DB: `sync_community_post_likes` + `sync_community_post_comments` AFTER INSERT/DELETE 트리거 적용 |
| **E-4**: 바닥 만료 배치 | DB: `expire_badak_wants()` 함수 + `/api/cron/badak-expire-wants` Vercel Cron 라우트 |
| **needs-queue 페이지** | `/intra/ums/badak/needs-queue` — 관리자용 니즈 승인 큐 UI |

## 다음 할 일 (세션 50 기준 — 세션 51에서 일부 완료)

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

# 작업 현황

> 마지막 업데이트: 2026-04-15 (사무실, 세션 46)

---

## 이번 세션 (세션 46) 완료 항목

| 항목 | 내용 |
|------|------|
| Badak 사이트 정밀 검토 | 26개 페이지/13개 API 전수 조사. 데이터 흐름, Mock/실DB 현황, 미완성 기능, 누락 기능 식별 |
| 모임 참여 상태 서버 조회 | `groups/[id]/join` GET 엔드포인트 추가. 페이지 로드 시 참여 상태 확인 + CTA 4분기 (leader/approved/applied/none) |
| 카운터 원자적 처리 통일 | broken RPC 호출 제거, COUNT 쿼리 직접 사용으로 통일 (좋아요/댓글 카운트) |
| 서비스 키 폴백 제거 | 14개 API 파일에서 `anon_key` 폴백 제거 → `throw Error` 명시적 실패 |
| 프로필 수정 API | `/api/badak/member` PUT 추가 + 마이페이지 TODO → 실제 API 호출 |
| 글/댓글 수정·삭제 | 커뮤니티 `PUT/DELETE` + 모임 게시판 `PUT/DELETE` + 댓글 `DELETE` (6개 엔드포인트) |
| 커뮤니티 전면 개편 | 글 상세 화면 + 좋아요 + 댓글 + 수정/삭제 + 검색 바 + 태그/내용 필터 |
| 모임 게시글/댓글 페이지네이션 | `limit/offset` + 총 카운트 반환 + N+1 쿼리 해결 (배치 카운트) |
| 니즈 클라우드 실DB 전환 | Phase 1: `badak_needs` 테이블 우선 조회, Mock 폴백 |
| 마이페이지 실DB 전환 | 내 글 → 커뮤니티 API에서 `user_id` 필터. 프로필 → `/api/badak/member` GET |
| 알림 시스템 신규 | `badak_notifications` 테이블 + RLS + GET/PUT API + 모임 참여 신청 시 바닥장 알림 생성 |
| 모임 수정/삭제 API | `/api/badak/groups` PUT/DELETE (리더만, 참여자 있으면 closed 처리) |
| 마이페이지 메시지→알림 | Mock 메시지 탭 제거 → 실DB 알림 탭 ("모두 읽음" + 읽음/안읽음 스타일) |

## 다음 할 일

- 마이페이지 북마크 탭 실DB 전환 (현재 MOCK_BOOKMARKS) — `badak_bookmarks` 테이블 생성 필요
- 마이페이지 내 모임 탭 실DB 전환 (현재 MOCK_MY_GROUPS) — `badak_group_members` + `badak_groups` JOIN 쿼리
- 모임 상세 페이지에서 본인 글 수정/삭제 UI 추가 (API는 완성됨)
- firstcome 자동 승인 로직 — join API에서 `joinType='firstcome'`이면 status='approved'로 즉시 처리
- `badak_members`에 `phone`, `interests`, `role` 컬럼 존재 여부 확인 (프로필 수정 API에서 사용)
- 커뮤니티 글 상세에서 조회수 증가가 정상 작동하는지 확인 (현재 +1 방식, 동일 사용자 중복 증가 방지 없음)
- `RESEND_API_KEY` .env.local에 추가

## 이전 세션 (세션 45) 완료 항목

| 항목 | 내용 |
|------|------|
| 메인 페이지 다크 테마 통일 | skyBg, CloudBubble(amber/gray), NeedsInput, FeedCard, FeedHighlights, FeedSection 전체 #1a1a2e 통일 |
| 클라우드 애니메이션 개선 | 시간 기반 dt 보간 + CSS transition(0.08s) + FRICTION 0.985로 부드러운 관성 |
| 바닥장 신청 페이지 신규 | `/badak/apply` — 지원서(이름/산업군/경력/분야/동기/계획/연락처), 직접 입력 분야는 승인 시 전체 카테고리 반영 |
| 모임 개설 바닥장 분기 | 비바닥장: 1회 단발만 가능 + 바닥장 신청 유도 배너. 바닥장: 연속/정기/비정기 모두 가능 |
| 모임 개설 운영방식 추가 | 7종: 네트워킹, 스터디, 사이드 프로젝트, 강의, 토론, 멘토링/코칭, 워크숍/세미나 |
| 연결 니즈 커스텀 드롭다운 | 네이티브 select → 검색 가능 커스텀 UI + 제목 기반 추천순 + 모임 미개설 니즈만 표시 + 15명+ 우선 |
| 태그 입력 개선 | `,`로 구분 입력, 붙여넣기 자동 분리 |
| 바닥이란 소개 리라이트 | 다크 테마 + 철학(약한 연결 고리) + 4단계 흐름 + 서비스 기능 링크 + CTA |
| 탐색 페이지 전면 개편 | 프로필 탐색 → 니즈 기반 탐색. 통계 + 검색 + 카테고리 필터 + 추천/Hot 슬라이드 |
| 스토리 페이지 다크 테마 | 5개 Mock 스토리 + before→after 전환 뱃지 + 응원/북마크 |
| 모임 목록 페이지 신규 | `/badak/groups` — 추천/Hot/최신 슬라이드 + 검색 + 전체 리스트 |
| 이메일 인증 연동 | `/api/badak/member/verify` — Resend API + badak_verify_codes 테이블 |
| 랜덤 서브 카피 | 8종 카피 랜덤 노출 (성장/사수/경력/연결 등) |
| 메뉴 정리 | 모임, 커뮤니티, 스토리, 탐색, 모임 개설, 바닥장 신청, 바닥이란 |

## 다음 할 일

- 바닥장 신청 API 연결: `/api/badak/apply` POST → `badak_leader_applications` 테이블 생성 + 관리자 알림
- 바닥장 권한 체크: `badak_members` 테이블에 `role` 컬럼 추가 (member/badakjang/admin), 모임 개설 시 실제 DB 조회
- 모임 상세 페이지(`/badak/groups/[id]`) 다크 테마 확인 및 통일
- 마이페이지 다크 테마 확인 (5탭 전체)
- 커뮤니티 페이지 실제 DB 연동 (현재 Mock)
- `RESEND_API_KEY` .env.local에 추가 (현재 Vercel env에만 존재)
- groups/create API: meetingType, joinType, seriesDates, recurringSchedule, groupCategory 필드 처리

## 이전 세션 (세션 44) 완료 항목

| 항목 | 내용 |
|------|------|
| Vercel Pro 전환 대응 | 반복 배포로 크레딧 급속 소진 원인 분석. 동일 커밋 20+회 배포 확인 |
| 프리뷰 배포 차단 | `vercel.json`에 `git.deploymentEnabled` 설정 — dev/feature-* 브랜치 배포 비활성화 |
| 작업 가이드 업데이트 | CLAUDE.md에 Vercel 비용 관리 규칙 추가 (작업 중 push 금지, 작업 종료 시 1회만) |

## 이전 세션 (세션 43) 완료 항목

| 항목 | 내용 |
|------|------|
| 인트라 메뉴 구조 감사 | 204개 페이지 전수 조사. 5모듈별 DB 구현율 산출 (MARKETING 94%, INTEL 61%, UNIVERSE 59%, ERP 50%, MY 17%) |
| nav 정비 (5건) | ① Mindle "뉴스레터" 항목 추가 ② WIO redirect 오류 수정 ③ Planner's 미구현 badge:"soon" ④ SubItem badge 렌더링 ⑤ UNIVERSE 브랜드별 알파벳 순 정렬 |
| GPR cascade DB 연동 | `erp/gpr/cascade/page.tsx` — hardcoded mock 제거 → members + gpr_goals 테이블에서 department별 동적 계층 생성 |
| Studio Brands 실구현 | `studio/brands/page.tsx` — 정적 플레이스홀더 → DB 로드(fallback: static) + 검색/필터 + 통계 + 브랜드 등록 모달. 22개 브랜드 표시 |
| Mindle 트렌드 정합성 | ① 메뉴명 "트렌드 현황"→"트렌드 카드" 통일 ② Mock fallback 완전 제거(DB 전용) ③ pipeline status hack 제거 ④ **"검토 후 발행" 워크플로우 확정** |

## 이전 세션 (세션 42) 완료 항목

| 항목 | 내용 |
|------|------|
| Mindle 뉴스레터 관리 페이지 | `ums/mindle/newsletter/page.tsx` — newsletter_subscribers + mindle_trends 실데이터 로드. 3탭(개요/구독자/트렌드이슈) |
| Mindle 트렌드 수동 등록 | `ums/mindle/pipeline/page.tsx` — '트렌드 등록' 버튼 + 모달. mindle_trends INSERT |

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

---

## 다음 스텝 (우선순위순)

### 즉시 (Phase B — Mock 정리)
1. **ERP biz/* 9개 + settings/* 8개** — 형식적 Mock → "준비 중" 전환
2. **Agent 대시보드** — mock → agent_profiles 실DB 연동
3. **MY workspace mock 정리** — 핵심 기능만 DB, 나머지 "준비 중" 배너

### 이후 (P1)
4. **Phase 1-B: SmarComm Intra 연결** — `/intra/marketing` WIO MKT-* 실데이터
5. **Phase 1-C: WIO 구독 관리** — DB 연동
6. **Phase 1-D: 바닥쇠 에이전트** — `/api/agent/badaksoe`
7. **Phase C-4: UNIVERSE 브랜드 셀렉터** — 실 필터링
8. **Naver API 연결** — Brand Gravity 인지도/호감도 실측

---

## QA 이력 (미처리)

- **N-03** 뉴스레터 구독 폼 3곳 중복 — 통일 방향 결정 필요
- **SmarComm DB 연결** — 전체 Mock 상태 (5월 예정)
- **MADLeague DB 연결** — 전체 Mock (5월 예정)

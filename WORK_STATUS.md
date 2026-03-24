# 작업 현황

> 마지막 업데이트: 2026-03-25 (집)

## 오늘 한 작업

### 1. Ten:One™ 통합 게시판 Phase 2 — 공용 UI 컴포넌트 완성
- `components/board/` 디렉토리 신규 생성 (6개 파일)
  - `BoardPage.tsx` — 사이트별 게시판 래퍼 (설정 로드, 목록↔상세 전환)
  - `BoardList.tsx` — 목록 (카드/리스트 뷰 전환, 카테고리 탭, 검색, 정렬/기간 필터, 페이지네이션)
  - `PostCard.tsx` — 카드형 아이템 (대표이미지, 카테고리 뱃지, NEW/공지, 통계)
  - `PostListItem.tsx` — 리스트형 아이템 (전통 게시판 스타일)
  - `PostDetail.tsx` — 상세 (본문, 첨부파일 다운로드, 태그, 좋아요/북마크/공유, 이전/다음글)
  - `CommentSection.tsx` — 댓글 (대댓글 1depth, 비회원 닉네임+비밀번호, 좋아요, 삭제 메뉴)
  - `index.ts` — barrel export
- RooK 게시판 페이지(`app/(RooK)/rk/board/page.tsx`) → 새 BoardPage 컴포넌트로 교체
- 기존 하드코딩 Mock 데이터 제거, `/api/board/*` API 연결

### 2. 아키텍처 결정
- BUMS(복잡한 CMS) 버리고 board-system(심플)으로 통일
- 기존 `types/board.ts` + `lib/supabase/board.ts` + `app/api/board/*` 재사용 (Phase 1 이미 80% 완료 상태)
- BUMS 잔재(28개 파일)는 이후 정리
- 게시판 철학: "각 사이트는 자기 행성에서 완결된다. 우주는 뒤에서 돌아간다."

### 3. Ten:One 유니버스 세계관 정립
- "우주는 누구도 한 눈에 볼 수 없다" — 소비자는 자기 서비스만 알면 됨, 나중에 전체를 발견
- MCU 모델: 각 사이트가 독립적 가치 → 연결은 발견의 놀라움

## 현재 이슈 ⚠️
- Supabase에 `board-system.sql` 테이블 아직 미적용 → API 호출 시 에러 (빈 목록 표시)
- BUMS 잔재 28개 파일 아직 남아있음 (동작에 영향 없음)
- 게시물 수정 후 사이트 페이지로 리다이렉트됨 (게시판 관리로 돌아가야 함)
- ERP 53개 페이지 DB 연결 미완

## 다음에 할 일
- [ ] Supabase에 `board-system.sql` 테이블 적용 (posts, comments, attachments, likes, bookmarks, board_configs). `supabase/board-system.sql` 파일에 SQL 있음
- [ ] Phase 3: 글쓰기 에디터 컴포넌트 (`components/board/PostEditor.tsx`). Tiptap 에디터 이미 있음, 제목/본문/카테고리/태그/대표이미지/첨부파일/비회원정보 필드
- [ ] Phase 4: 좋아요/북마크 + 검색/필터 + 카테고리/태그 (UI는 Phase 2에서 뼈대 완성, API 연결만 하면 됨)
- [ ] 나머지 사이트들에 BoardPage 연결 (MADLeague, Badak, TenOne 등). 한 줄이면 됨: `<BoardPage site="madleague" board="news" accentColor="#D32F2F" />`
- [ ] AI 에이전트 구축 — 관리자 API(`POST /api/board/posts`)로 자동 게시
- [ ] BUMS 잔재 정리 (lib/bums-*.ts, types/bums.ts, app/intra/bums/, components/bums/, app/api/bums/)

## Supabase CRUD 레이어
- `lib/supabase/board.ts` — 통합 게시판 (posts/comments/likes/bookmarks/attachments/configs)
- `lib/supabase/bums.ts` — (레거시, 제거 예정)
- `lib/supabase/members.ts` — 회원 관리
- `lib/supabase/townity.ts` — 게시판/댓글/일정
- `lib/supabase/projects.ts` — 프로젝트/Job/투입인력/타임시트
- `lib/supabase/education.ts` — 과정/수강
- `lib/supabase/hero.ts` — HIT/커리어/이력서
- `lib/supabase/wiki.ts` — 라이브러리/북마크
- `lib/supabase/erp.ts` — 결재/포인트/알림

## 주요 파일 위치
- 게시판 컴포넌트: `components/board/` (6개)
- 게시판 타입: `types/board.ts`
- 게시판 API: `app/api/board/{posts,comments,like,bookmark,configs,tags}/route.ts`
- 게시판 DB함수: `lib/supabase/board.ts`
- DB 스키마: `supabase/board-system.sql`

## Vercel 배포 정보
- Hobby (무료) 플랜
- 자동 배포: git push origin master → 빌드+배포
- 현재 도메인 ~20개

## 주의사항
- Tailwind CSS v4, Next.js 16 + React 19
- Supabase: members + bums_* + hero_* 테이블
- 멀티 사이트 19개 (middleware 도메인 분기)
- Vridge = GPR & Vrief 통합 (경영전략)
- 테마: 기본 다크, 토글로 라이트 전환

# 작업 현황

> 마지막 업데이트: 2026-03-25 (사무실)

## 오늘 한 작업

### 1. 통합 게시판 Phase 3-4 완성
- PostEditor 글쓰기 컴포넌트 (Tiptap + 이미지 붙여넣기/드래그 + 태그 + 대표이미지)
- BoardPage 4모드 전환 (목록/상세/글쓰기/수정) + 좋아요/북마크 API 연결
- 6개 사이트 게시판 BoardPage 교체 (Badak, MADLeague, MADLeap, ChangeUp, TenOne Works+Newsroom)

### 2. 퍼블릭 페이지 useBums() 완전 제거
- 홈페이지, Works, Works/[id], Newsroom, Newsroom/[id] → /api/board/posts 직접 호출
- MADLeague 홈/PT, YouInOne 홈 → fetch API 교체
- app/layout.tsx에서 BumsProvider 제거

### 3. BUMS 레거시 완전 삭제
- lib/bums-context.tsx, bums-data.ts, bums-permissions.ts, types/bums.ts, lib/supabase/bums.ts 삭제
- components/bums/ 디렉토리 삭제, app/api/bums/ 삭제
- BUMS 인트라 19개 파일 useBums → static/stub 교체
- 인트라 comm 공지/자유게시판 → BoardPage 통합

### 4. 감사 리포트 긴급 수정
- 홈/About 플레이스홀더 텍스트 제거
- robots.txt + sitemap.ts 생성
- JSON-LD 구조화 데이터 (Organization + Person)
- SEO 메타 강화 (title 키워드, description, OG, Twitter Card)
- 이메일 평문 전체 제거 (PublicFooter + 12개 브랜드 푸터 + 8개 페이지)

### 5. 다크모드 완전 대응
- CSS 변수: text-sub #bbb→#ccc, text-muted #777→#999, footer #666→#888
- 게시판 6개 컴포넌트 다크모드 (PostCard, PostListItem, PostDetail, CommentSection, BoardList, BoardPage)
- About/Works/Newsroom 상세 bg-neutral-100 → tn-bg-alt

### 6. DB 실데이터 투입
- board_configs 8개 (tenone works/newsroom/notice/free, badak, madleague, madleap, changeup)
- posts 32개 (Works 13 + Newsroom 7 + Badak 4 + MADLeague 4 + YouInOne 4)
- projects 8개 (진행 3 + 기획 2 + 완료 3)
- HeRo 테이블 3개 생성 (hit_results, career_profiles, resumes)
- RLS 정책 추가 (projects_read, board tables)

### 7. Supabase board-system.sql 적용
- 6개 테이블: posts, comments, attachments, likes, bookmarks, board_configs
- 3개 함수: increment_post_view, sync_comment_count, sync_like_count, sync_bookmark_count
- 기존 Townity posts 테이블 DROP → 새 스키마로 재생성

## 현재 이슈 ⚠️
- Preview hook이 사무실에서 계속 차단 (localhost 접속 불가) → settings.local.json에 disableAllHooks 설정했지만 세션 재시작 필요
- ERP 55개 페이지 DB 연결 미완 (Mock 유지)
- 브랜드 사이트 게시판 라이브 테스트 미완

## 다음에 할 일
- [ ] 브랜드 사이트 게시판 라이브 테스트 (badak.biz, madleague.net 등)
- [ ] 홈페이지에서 Works/News DB 데이터 표시 확인
- [ ] 각 브랜드 사이트 헤더/푸터 다크모드 (TenOne 외)
- [ ] ERP 핵심 페이지 DB 연결 (결재, HR, 재무)
- [ ] AI 에이전트 API 키 연결
- [ ] Supabase Storage 이미지 업로드 연결
- [ ] CrewInvite 지원 → 심사 → 역할 전환 흐름

## Supabase DB 현황
- posts: 32건 (6개 게시판)
- board_configs: 8건
- projects: 8건
- members: 1건
- hit_results: 0 (테이블 생성됨)
- career_profiles: 0 (테이블 생성됨)
- resumes: 0 (테이블 생성됨)

## Supabase CRUD 레이어
- `lib/supabase/board.ts` — 통합 게시판
- `lib/supabase/members.ts` — 회원 관리
- `lib/supabase/projects.ts` — 프로젝트
- `lib/supabase/education.ts` — 교육 과정
- `lib/supabase/hero.ts` — HIT/커리어/이력서
- `lib/supabase/wiki.ts` — 라이브러리
- `lib/supabase/erp.ts` — 결재/포인트

## 주요 파일 위치
- 게시판 컴포넌트: `components/board/` (7개 - BoardPage, BoardList, PostCard, PostListItem, PostDetail, CommentSection, PostEditor)
- 게시판 타입: `types/board.ts`
- 게시판 API: `app/api/board/`
- AI 에이전트: `lib/agent/`

## Vercel 배포 정보
- Hobby (무료) 플랜
- 자동 배포: git push origin master
- 현재 도메인 ~20개

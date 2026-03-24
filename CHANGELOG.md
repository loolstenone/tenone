# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-03-25 (집)

### 완료
- Ten:One™ 통합 게시판 Phase 2: 공용 UI 컴포넌트 6개 생성 (`components/board/`)
  - BoardPage, BoardList, PostCard, PostListItem, PostDetail, CommentSection
- RooK 게시판 페이지를 새 컴포넌트로 교체 (Mock → API 연결)
- 아키텍처 결정: BUMS 버리고 board-system으로 통일
- 유니버스 세계관 정립: "각 사이트는 자기 행성에서 완결, 우주는 뒤에서 돌아간다"

### 생성된 파일
- `components/board/BoardPage.tsx` — 사이트별 게시판 래퍼 (설정 로드, 목록↔상세 전환)
- `components/board/BoardList.tsx` — 목록 (카드/리스트 뷰, 카테고리 탭, 검색, 정렬, 페이지네이션)
- `components/board/PostCard.tsx` — 카드형 아이템
- `components/board/PostListItem.tsx` — 리스트형 아이템
- `components/board/PostDetail.tsx` — 상세 (좋아요/북마크/공유, 첨부, 태그, 이전/다음글, 댓글)
- `components/board/CommentSection.tsx` — 댓글 (대댓글, 비회원, 좋아요)
- `components/board/index.ts` — barrel export

### 수정된 파일
- `app/(RooK)/rk/board/page.tsx` — Mock 하드코딩 → BoardPage 컴포넌트

### 결정 사항
- BUMS(복잡한 CMS) 폐기, board-system(심플) 통일
- 기존 Phase 1(DB+타입+API) 80% 재사용
- 사용법: `<BoardPage site="madleague" board="news" accentColor="#D32F2F" />` 한 줄
- 유니버스 철학: 소비자는 자기 서비스만 알면 됨 → 나중에 전체 발견

---

## 2026-03-24 (사무실)

### 완료
- 전체 모듈 DB 연결 Phase 0~9 (BUMS, 회원, Myverse, Townity, Project, Evolution, HeRo, Wiki, ERP, Vridge)
- Supabase CRUD 레이어 8개 생성 (bums, members, townity, projects, education, hero, wiki, erp)
- 회원 체계 v2: alliance/madleaguer 추가, junior-partner 삭제, roles[]/module_access[] 도입
- members 테이블 v2 마이그레이션 (primary_type, roles, affiliations, intra_access, module_access)
- HeRo DB 테이블 신규: hit_results, career_profiles, resumes
- ARCHITECTURE.md + ROADMAP_IMPLEMENTATION.md 작성
- Vridge 명칭 확정, ERP 모듈화 (erp-hr/people/finance/sales)
- TenOne Works: Google Sites history → DB 13개 게시글
- BUMS: 내용보기 모달, 체크박스 벌크삭제, 페이지네이션, 수정/삭제 분리
- 에디터: 이미지 붙여넣기/드래그앤드롭, 태그/대표이미지 위치 개선, SEO 접기
- 다크모드: PublicHeader + Works/Contact/About/Newsroom 전면 CSS 변수 전환
- 빌드 에러 수정 (SmarComm import, report-data)
- BUMS 404 해결 (6개 placeholder 페이지)
- BUMS 디자인 모던화
- 홈페이지 Mock 제거 → DB only

### 결정 사항
- Vridge = GPR & Vrief 통합 명칭
- ERP 모듈: erp-hr, erp-people, erp-finance, erp-sales
- 회원 유형: staff/partner/alliance/madleaguer/crew/member (junior-partner 삭제)
- 모든 모듈: DB 우선 + Mock fallback 전략

### 이슈
- 게시물 수정 후 사이트로 리다이렉트 (관리 페이지로 돌아가야 함)
- 게시물 관리 vs 콘텐츠 관리 역할 혼란

---

## 2026-03-23 (사무실)

### 완료
- 신규 사이트 대량 생성: 0gamja(WP반영), FWN, Seoul/360°, 문래지앙, MoNTZ, Badak, HeRo, Domo, JAKKA, Trend Hunter, My Universe, 타우니티, 자연함 등 → 총 19개 사이트
- 전용 인증 도메인 auth.tenone.biz 구현 (AES-256-GCM 토큰 암호화, Vercel+DNS+Supabase 설정)
- CMS → BUMS 전체 리네임 (DB+코드+UI)
- BUMS Tier 1: Tiptap 에디터, 게시글 CRUD, 사이트 브랜딩 관리, 위젯 관리, 콘텐츠 API, 권한 모델
- BUMS 목차 완성: 14개 메뉴 (대시보드~라이브러리), 고객관리 4탭, 게시판관리 3탭
- Supabase bums_* 테이블 6개 + ENUM 10개 + RLS 생성
- 인트라 디자인 통일 (max-w, shadow제거, bg-white)
- 일일 격언 365개 시스템
- TenOne 퍼블릭 다크/라이트 모드 (기본 블랙, 랜덤 전환 효과)
- 3D 포탈 아이콘 + 입체 아바타/토글
- 팅커벨 포탈 효과 (StarfieldPortal)
- 헤더 UI: 아바타 드롭다운+포탈+토글 / 인트라 TEN:ONE™ 로고

### 생성된 파일 (주요)
- `lib/auth-transfer.ts`, `lib/theme-context.tsx`, `lib/bums-permissions.ts`, `lib/daily-quotes.ts`
- `app/auth-hub/login/route.ts`, `app/auth-hub/callback/route.ts`, `app/auth/session/route.ts`
- `app/api/bums/posts/route.ts`, `app/api/bums/post/[postId]/route.ts`, `app/api/bums/boards/route.ts`
- `components/bums/RichEditor.tsx`, `components/bums/ImageUploader.tsx`
- `components/ThemeToggle.tsx`, `components/TenOneThemeWrapper.tsx`, `components/StarfieldPortal.tsx`
- `components/icons/PortalIcon.tsx`
- `app/intra/bums/` 전체 (boards, customers, content, dashboard, settings, widgets)
- `supabase/bums-tables.sql`
- 19개 사이트 폴더 + 헤더/푸터 컴포넌트

### 결정 사항
- CMS → BUMS (Business Unit Management System)
- TenOne 퍼블릭 기본 테마: 블랙
- 인트라 로고: TEN:ONE™
- 포탈 아이콘: 3D 큐브 + 화살표 (enter/exit)
- 인트라 진출입: 아바타 드롭다운(Logout 포함) + 포탈 아이콘

---

## 2026-03-23 (집, 2차)

### 완료
- SmarComm 대시보드 모바일 반응형 (아이콘 사이드바 56px + 오버레이 확장)
- 반응형 브레이크포인트 md→lg(1024px) 변경
- 우측 패널(RightPanel) 신규 — TODO, 블로그, 가이드, 팀 채팅
- 스캔 페이지 반응형 (URL입력/게이지/비교/테이블)
- LineChart clipPath overflow 수정
- 요금제 5단계 (Free ₩0 ~ Ultra ₩990,000) + 연간할인 + 비교표
- 메인→워크스페이스 스캔 연결 (로그인 유저 자동 전환)
- 워크스페이스 로고 드래그앤드롭 업로드
- 사이드바 상단 회사명 표시 개선

### 생성된 파일
- `components/smarcomm/RightPanel.tsx`

### 수정된 파일
- `app/(SmarComm)/sc/dashboard/layout.tsx` — 우측 패널, 반응형
- `app/(SmarComm)/sc/dashboard/profile/page.tsx` — 로고 업로드
- `app/(SmarComm)/sc/dashboard/scan/page.tsx` — 반응형, pending scan
- `app/(SmarComm)/sc/page.tsx` — 워크스페이스 연결
- `app/(SmarComm)/sc/pricing/page.tsx` — 5단계 요금제
- `components/SmarCommSidebar.tsx` — 모바일 아이콘 모드
- `components/smarcomm/charts/LineChart.tsx` — clipPath

---

## 2026-03-23 (집)

### 완료
- RooK 사이트 신규 생성 (6개 페이지 + 헤더/푸터)
- YouInOne WordPress 콘텐츠 반영 (XML에서 실제 콘텐츠 추출)
- 도메인 연결: tenone.biz, youinone.com
- Footer copyright 통일 + UniverseBadge 중복 제거
- 헤더 메뉴 "홈" 일괄 제거
- globalConfig + authMethods (사이트별 소셜 로그인 제어)
- SITE_GUIDE.md 멀티사이트 관리 가이드
- Supabase Auth: Google + Kakao OAuth 연동
- members 테이블 생성 + 마스터 계정
- 로그인/가입 한국어 통일 + 소셜 버튼
- middleware 이중 리라이트 방지

### 생성된 파일
- `app/(RooK)/` — RooK 사이트 전체 (layout + 6페이지)
- `components/RooKHeader.tsx`, `components/RooKFooter.tsx`
- `app/auth/callback/route.ts` — OAuth 콜백
- `SITE_GUIDE.md` — 멀티사이트 관리 가이드

### 수정된 파일
- `lib/auth-context.tsx` — 소셜 로그인, code exchange, fallback 처리
- `lib/site-config.ts` — globalConfig, authMethods, RooK 색상
- `middleware.ts` — RooK 분기, 이중 리라이트 방지
- `app/login/page.tsx` — 한국어 통일, 소셜 버튼, authMethods 조건부
- `app/signup/page.tsx` — 소셜 버튼, authMethods 조건부
- `components/PublicHeader.tsx` — 로그인/회원가입 한국어
- `components/*Footer.tsx` — copyright 통일, UniverseBadge 제거
- `components/*Header.tsx` — "홈" 메뉴 제거
- `app/(YouInOne)/yi/*` — WordPress 콘텐츠 반영 (6페이지)

### 미해결
- 소셜 로그인 후 로그인 상태 전환 안 됨 (SIGNED_IN 후 members 조회 문제)

### 결정 사항
- SmarComm은 이메일만 가입 (B2B 서비스)
- 사이트별 인증 방식은 siteConfig.authMethods로 관리
- 푸터: "© 서비스명. Powered by Ten:One™ Universe." (tenone.biz 링크)
- 새 사이트 추가 시 SITE_GUIDE.md 체크리스트 따를 것

---

## 2026-03-20 (사무실)

### 완료
- ERP를 C-Level 역할 기반으로 재구조화 (CHO/CFO)

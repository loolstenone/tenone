# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-03-30 (사무실)

### WIO Glossary v1 → 7계층 체계 정렬
- types/wio.ts: WIO_SERVICES 16개, WIOPreset 타입
- lib/wio-modules.ts: SERVICE_CATALOG, 모듈별 service 필드, 프리셋, 헬퍼
- layout.tsx: 사이드바 Track→모듈 → 서비스→모듈 전면 교체
- settings: 서비스 모드 탭 (프리셋 선택 + 서비스 토글)

### COM-AI → Agent Hub 실연결
- comm/ai/page.tsx: Mock → POST /api/agent/hub (Claude API)

### SYS-USR 사용자 관리 실DB
- system/users/page.tsx: wio_members CRUD (역할 변경, 초대, 활성/비활성)

### 프로젝트 타임라인 피드
- project/[id]/page.tsx: SNS형 피드 탭 (글쓰기, 좋아요, 댓글, 시스템 알림)

### COM-WCL + MY-HR 실DB
- work-calendar: wio_jobs 연동
- my/hr: wio_members 프로필 연동

### TenOne 게시판 수정 기능
- api/board/posts/[id]: PATCH 핸들러 추가
- PostDetail: 수정 버튼 (로그인 사용자)
- BoardPage: onEdit 전달

### TenOne 뉴스룸 재설계
- newsroom/page.tsx: 유니버스 콘텐츠 허브 (BoardPage → Aggregator)
- NewsTicker: LIVE 티커 바 (브랜드별 제목 스크롤)
- NewsroomFeed: 카드 그리드 (브랜드 필터 + 최신/인기)
- api/newsroom/feed: 전 사이트 게시글 조회 API
- brand-meta.ts: SiteCode → 브랜드 메타 매핑
- page.tsx(홈): "새로운 소식" 뉴스룸 API 통일

### Contact 관리자 + 정리
- inquiry/page.tsx: Coming Soon → 풀 CRUD
- contact/page.tsx: 회원가입 탭 제거

### MyVerse 랜딩 페이지
- myverse/page.tsx: 기획서 v2 기반 전면 재작성 (7섹션)
- docs: Myverse 기획서 3개 저장

### 변경 파일 (27개)
- 수정 20개 + 신규 7개 (newsroom API/컴포넌트, brand-meta, docs 4개)
- +1,834줄 / -741줄

---

## 2026-03-29~30 (집)

### WIO EUS v2.0
- docs/WIO_EUS_v2.md 전체 반영 (Part VIII 고도화 10섹션)
- 모듈 카탈로그 ~120개 확장, 카테고리 9→EUS 7트랙 기반
- 3계층 워크플로우 (전사/부서/개인 도구)

### WIO Orbi 모듈 대규모 확장
- 124+ 페이지 (Sprint 1~6: MY5 + RBAC4 + 영업7 + HR5 + BI4 + 지주사3)
- 46/120 모듈 Supabase 실DB 연동
- DB 39개 신규 테이블 (총 90+)

### 핵심 엔진
- lib/rbac.ts (6단계 권한 + 사이드바 미들웨어)
- lib/workflow-engine.ts (실행/SLA/인스턴스)
- lib/culture-engine.ts (가치정합/건강도)

### 설정 페이지 재구성
- 4탭: 세팅(3모드) | 권한 | 테마 | 시스템
- OrgTreeBuilder 컴포넌트 (1,252줄, Supabase CRUD)

### 조직도 + 인력 배치
- DB 6테이블 + docs/WIO_OrgDesign_v1.md
- HR-ORG 4탭 (조직도3뷰 + 정원 + 발령 + 이력)

### Part VIII 신규 페이지
- AI매트릭스, E2E흐름도, SaaS과금, 업종프리셋, 마이그레이션

### COM-WCL 업무 캘린더
- 4뷰×4범위 + ★상향 집계

### 브랜드 사이트 (12개 브랜드 고도화)
- MADLeap(5p), MADLeague(5p), Badak(모임+커뮤니티), Planners(전면)
- HeRo, RooK, ChangeUp, 0gamja, Mindle, domo, FWN, YouInOne

### 인프라
- 인트라 로그인 근본 해결 (sessionStorage + 타임아웃)
- Agent Hub + 7 에이전트 (Claude 실응답)
- 인트라 유니버스 대시보드 실DB (8p)
- 외부 API (Google Calendar + Kakao + Slack)
- 모바일 + SEO + sitemap
- board_configs 25개 (6사이트)
- Myverse 7탭 Supabase 연동
- Vercel 배포 10+회

---

## 2026-03-28 (집)

### About 페이지
- PublicHeader + 7개 브랜드 헤더에서 About 네비 중복 제거
- Brands 탭 → 역할 기반 7그룹 구조 + Synergy Flows 교체

### 홈페이지
- Universe 브랜드 쇼케이스 + Latest fallback 추가
- Works 위젯 represent_image → representImage 필드명 수정

### WIO 게시판 모듈 (대규모)
- 대표 이미지 자동 추출 (extractFirstImage)
- 에디터 이미지 paste/drop → Storage 업로드 (base64 제거)
- /api/board/migrate-images 마이그레이션 API
- 좋아요/북마크 userId 전송 + 비로그인 토스트
- 게시글 고유 URL (?postId=)
- 5개 board 컴포넌트 tn-* 테마 변수 적용
- PostDetail 본문 레이아웃 개선 (prose + 대표이미지)
- docs/WIO_Board_Guide.md 작성

### Works 게시물
- Google Sites History → 20개 게시물 (본문+이미지+날짜)
- 18개 대표 이미지 (Supabase Storage + OG 이미지)

### SmarComm 랜딩
- 소셜 프루프 + 신뢰 지표(Trust) 섹션 추가

### 프로필
- 비밀번호 확인 제거, 뉴스레터 숨김, 북마크 목록 UI

### DB
- posts UPDATE RLS 정책 완화

### 변경 파일 (주요)
- app/page.tsx, app/(TenOne)/about/page.tsx
- components/board/*.tsx (5개 전부)
- components/PublicHeader.tsx + 7개 브랜드 Header
- components/UniverseUtilityBar.tsx
- lib/supabase/board.ts
- app/api/board/migrate-images/route.ts (신규)
- app/(SmarComm)/smarcomm/page.tsx
- app/(TenOne)/profile/page.tsx
- docs/WIO_Board_Guide.md (신규)

---

## 2026-03-27 (사무실)

### DB
- Supabase SQL Editor에서 001_brands_and_profiles.sql 실행 (brands 23개 + profiles + RLS)
- Supabase SQL Editor에서 002_talk_comments_likes.sql 실행 (wio_comments/likes/bookmarks + RLS)

### 파일 변경
- `app/(TenOne)/universe/page.tsx` — 통계 섹션, 12개 브랜드, Coming Soon, WIO CTA
- `app/(Mindle)/mindle/my/page.tsx` — 활동 통계 카드 4개
- `app/(Mindle)/mindle/trends/[id]/page.tsx` — 태그, 반응 바
- `lib/data.ts` — 브랜드 10→22개 확장
- `types/brand.ts` — 카테고리 타입 6개 추가
- `app/(TenOne)/brands/page.tsx` — 카테고리 필터 업데이트
- `app/(WIO)/wio/app/layout.tsx` — 모바일 반응형 사이드바 (햄버거 토글, 오버레이)
- `app/(BrandGravity)/brandgravity/page.tsx` — 신규 생성
- `app/(NamingFactory)/namingfactory/page.tsx` — 신규 생성
- `app/(EvoSchool)/evschool/page.tsx` — 신규 생성
- `app/(WIO)/wio/page.tsx` — Getting Started + 자체 도구 섹션 추가
- `app/login/page.tsx` — "MAD League" → "Ten:One™ Universe" 수정
- TypeScript 에러 72개 → 0개 수정 (20+ 파일)

### 결정사항
- 풀링포레스트(pooolingforest.com) 디자인 참고 → WIO/SmarComm 랜딩에 반영
- 프로세스 단계에 고객/WIO 역할 구분 스타일 채택
- 자체 도구 소개 섹션 (W-Board, W-Insight, W-Shield) 추가

---

## 2026-03-27 (집) — WIO 전 모듈 고도화 + 인프라 대수술

### 문서
- WIO_Master_Architecture.md (19 PART 완전 설계서, 단일 진실 소스)
- 기존 WIO 문서 6개 통합 삭제
- REVENUE_MODEL.md (10개 서비스 독립 수익 모델)
- 가격 확정: Free→Starter(4.9만)→Pro(14.9만)→Business(39.9만)→Enterprise

### 인프라
- window.location.reload() 11개 파일 제거 → router.push
- /reset-password 비밀번호 재설정 플로우
- 크로스탭 세션 동기화 (storage event)
- 헤더 isLoading 타이밍 수정
- Supabase brands 테이블 + profiles + RLS + 23개 브랜드
- middleware Supabase 세션 갱신 (Google 로그인 유지 해결)
- LoginModal createPortal(document.body) — stacking context 탈출

### WIO 모듈 (11개)
- Home: 스켈레톤, Principle, 빠른 액션, 데모 모드
- Talk: 상세+댓글2depth+좋아요+북마크+검색, DB 마이그레이션(002)
- People: 상세 프로필, 역할 필터, 초대
- Project: Job 추가/토글
- GPR: 신규 모듈 (Goal→Plan→Result)
- Learn: 카테고리 필터, 검색, 통계
- Finance: 스켈레톤, 빈 상태
- Insight: 드릴다운, 스택바 차트
- Sales/Wiki/Content: 빈 상태 가이드 통일

### UI 통일
- UniverseUtilityBar 23개 헤더 전체 적용 (WIO, SmarComm, TenOne 포함)
- 푸터 통일 (언더라인 제거, 중복 정리)
- 통합 로그인 페이지 (SmarComm→TenOne Universe)
- WIO 데모 모드 (비로그인 체험)

### 파일 변경 (주요)
- components/UniverseUtilityBar.tsx — loginPath, isLoading 제거
- components/LoginModal.tsx — createPortal, SSR guard
- components/PublicHeader.tsx — UniverseUtilityBar 적용
- components/SmarCommHeader.tsx — UniverseUtilityBar 적용
- components/WIOMarketingHeader.tsx — UniverseUtilityBar 적용
- middleware.ts — Supabase 세션 갱신
- app/login/page.tsx — TenOne Universe 브랜딩 + redirect
- app/reset-password/page.tsx — 신규
- app/(WIO)/wio/app/gpr/page.tsx — 신규
- app/(WIO)/wio/app/talk/[id]/page.tsx — 신규
- app/(WIO)/wio/app/people/[id]/page.tsx — 신규
- lib/auth-context.tsx — resetPassword, updatePassword, 크로스탭
- lib/supabase/brands.ts — 신규
- supabase/migrations/001_brands_and_profiles.sql — 신규
- supabase/migrations/002_talk_comments_likes.sql — 신규
- docs/WIO_Master_Architecture.md — 신규 (단일 진실 소스)

---

## 2026-03-26 (집) — 대규모 고도화

### Mindle 고도화
- vercel.json cron 자동화 (매시간 RSS 크롤러)
- RSS 피드 Indie Hackers→Ars Technica, Morning Brew→Wired 교체
- Newsletter 페이지 (/mindle/newsletter) + 헤더 1줄 정리
- Admin: 검색/필터 + Run Crawl Now + Run AI Analysis 버튼
- 콘텐츠 파이프라인 API (/api/trendhunter/analyze) — rule-based 분석, 3종 초안 자동생성
- Collect API 배치 모드 (items[] 배열)

### 크롤러 확장 3종
- bots/discord/ — discord.js 봇 (채널별 토픽, 배치 전송)
- bots/web-crawler/ — Puppeteer (네이버 블로그/카페)
- bots/badaksoe/ — 메신저봇R (카카오 오픈채팅)

### WIO 고도화
- 사이드바 기본 모듈 3개→10개 확장 (timesheet 포함)
- /wio/contact 상담 신청 페이지 생성
- 마케팅 3페이지 CTA /contact→/wio/contact 수정
- /wio/app/project/[id] 프로젝트 상세 페이지 (개요/업무/인원 탭)

### 인증 세션 끊김 수정
- Supabase 클라이언트 싱글톤화 (lib/supabase/client.ts)
- 세션 만료 시 stale localStorage 정리
- TOKEN_REFRESHED 이벤트 처리
- syncUserFromSession() 공통 함수

### 인트라 Marketing DB 연결
- supabase/marketing-tables.sql (4테이블 + RLS + 인덱스)
- lib/supabase/marketing.ts (Campaign/Lead/Content CRUD)
- marketing-context.tsx DB우선 + Mock fallback 패턴

### TenOne 퍼블릭 고도화
- /universe 인터랙티브 구조도 (Hub→OS→사업 포트폴리오 + 시너지 체인)
- 한/영 UI 통일 (Logout→로그아웃, Login→로그인, →]→Intra)
- /privacy 개인정보처리방침 + /terms 이용약관 생성
- 푸터 Privacy/Terms 링크 활성화
- /brands 다크 테마 적용
- About > Universe Structure 독립 링크
- 홈 히어로 이미지 fallback + API fetch 에러 핸들링

### 문서화
- SITE_ANALYSIS.md 전체 사이트 종합 분석 (5개 사이트, CRITICAL 8건)
- CLAUDE.md 규칙 추가 (작업종료 묻지않기, 톤앤매너 준수)

### 결정 사항
- 개발 우선순위: TenOne(허브) → WIO+YIO(OS) → 수익사업 → 나머지
- TenOne 다크 테마 CSS 변수 (`--tn-*`) 모든 페이지 통일
- 크롤러 확장: RSS(완료) → Discord → Web → 바닥쇠 순서
- WIO Settings CRUD는 다음 세션 (Supabase UPDATE 필요)

---

## 2026-03-26 (사무실 #2) — 약 15커밋

### Mindle(민들레) 사이트 완성
- TrendHunter → Mindle 리브랜딩 + 전 페이지 영문 전환 (8페이지)
- 2단 헤더: 상단 유틸리티(ABOUT/LOGIN/Share/Search) + 하단 네비
- 신문 레이아웃: Featured Article + TODAY'S PICKS + Hot Keywords + 30개 랜덤 카피
- Trends: 리스트/그리드 뷰 전환 + 카테고리 필터 + Featured
- Reports: 주간 타임라인 + LATEST/PREMIUM 뱃지
- Data: 키워드 랭킹 테이블 + 기간 필터(24H/7D/30D/90D) + 수집 소스 + Biggest Movers
- References: Editor's Picks + 12개 소스 + 태그
- Admin: Supabase 실데이터 연결 + 이메일 기반 관리자 권한

### Mindle DB + RSS 크롤러
- Supabase 9개 테이블 생성 + RLS 정책 설정
- RSS 자동 수집 크롤러: /api/trendhunter/rss (8개 피드, 첫 실행 30건 수집 성공)
- crawler_status 4건 + collected_data 시드 데이터

### 인증 최종 해결
- Supabase에 `https://*.tenone.biz/auth/callback` 와일드카드 등록 → 전 서브도메인 소셜 로그인 해결
- isSubdomain race condition fix (useState null 초기값)

### WIO Timesheet 모듈
- 주간 시수 그리드 + AI Auto-Fill 버튼 + Submit/Approve 워크플로우 → 8대 모듈 완성

### 서브도메인 인프라
- 가비아 CNAME 8개 + Vercel 도메인 9개 (mindle 포함)
- middleware: mindle.tenone.biz, wio.tenone.biz, seoul360.tenone.biz 매핑

### 결정 사항
- Mindle = 영문 사이트 (크롬 번역으로 한국어 대응)
- 크롤러 우선순위: RSS(무료) → 디스코드(무료) → 웹(월$10) → 바닥쇠(공기계)
- 서브도메인 SSO: .tenone.biz 쿠키 공유 가능 (Google 방식)

---

## 2026-03-26 (사무실) — 8커밋

### TrendHunter 사이트 구축
- 14개 페이지 생성 (홈/About/Reports/Insights/Services/My/Weekly/Signals/References/Opportunities/Dashboard)
- 로고 PDF 반영 (T빨강/r노랑/e연두/n하늘/d초록 + Hunter흰색)
- DB 스키마 9개 테이블 (supabase/trendhunter-tables.sql)
- API 3개 (/collect, /respond, /stats)
- 기술설계서 + WIO 계획서 docs/ 복사

### 인증 시스템 전면 개편
- SmarComm sessionStorage Mock 제거 → useAuth() 단일 경로 통일 (13개 파일)
- auth-hub 크로스도메인 토큰 전송 폐기 → 도메인별 직접 Supabase OAuth
- searchParams 크래시 버그 수정, 로그아웃 쿠키 강제 제거
- SmarComm 리다이렉트 루프 수정, 서브도메인 리다이렉트 수정

### LoginModal 팝업 로그인
- LoginModal 공통 컴포넌트 + 전 브랜드 20개 헤더 적용

### 서브도메인 인프라
- 가비아 DNS 8개 + mindle CNAME 등록
- Vercel 프로젝트 도메인 9개 등록
- Supabase Redirect URL 19개 등록

### 결정 사항
- 인증: 도메인별 독립 로그인 (Option A). 쿠키는 도메인 격리, SSO는 나중에
- 로그인 UX: 페이지 이동 → 팝업 모달로 전환
- TrendHunter → Mindle(민들레) 리브랜딩 결정 (도메인: mindle.tenone.biz)
- 참고사이트: trendhunter.com, some.co.kr, careet.net, trendmonitor.co.kr

---

## 2026-03-26 (집) — 31커밋

### SmarComm
- 로그인/가입 도메인 분기, 리다이렉트 루프, 직접 OAuth, 세션 유지
- 다중 페이지 크롤링, 36가지 브랜드 유형, 퍼포먼스 UI
- **미해결**: 소셜 로그인 텐원 넘어감, 리프레시 세션 유실

### Badak MVP
- DB 4개 + CRUD + 6개 페이지 전체 구축
- badak.biz는 기존 서버 운영 중, 개발만

### WIO 솔루션 (Sprint 1~5 전체)
- 마케팅 사이트 5페이지 (랜덤 카피 5종)
- **24개 DB 테이블** Supabase 생성
- **10개 모듈** 앱 UI: Home, Project, Talk, Finance, People, Sales, Learn, Content, Wiki, Insight
- 파일: app/(WIO)/, types/wio.ts, lib/supabase/wio.ts, lib/wio-app-data.ts

### TenOne Universe
- About 페이지 탭 4개: Philosophy/Universe/Brands/History
- Brands 탭에 7카테고리 33개 브랜드 디렉토리 추가
- docs/TenOne_Universe_Directory.html 원본 보관

### 결정 사항
- WIO는 텐원 회원 시스템 공유, 솔루션 DB는 별도 (wio_ 프리픽스)
- 멀티도메인 로그인: 도메인별 직접 OAuth 방식 채택 (auth-hub 경유 제거)
- Universe=세계관설명, Brands=브랜드디렉토리로 분리

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

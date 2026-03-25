# 작업 현황

> 마지막 업데이트: 2026-03-25 (사무실, 최종)

## 오늘 한 작업

### 1. BUMS 레거시 → 새 게시판 시스템 전환
- boards/content 페이지 → /api/board/posts API 연결
- useBumsFilter 유지, Mock 제거

### 2. 테스트 계정 추가
- 김사라 (sarah@tenone.biz) Staff 이사
- 김준호 (junho@tenone.biz) Staff 매니저
- 박기혁 (gihyuk@tenone.biz) Crew MADLeague

### 3. ERP 현실화
- 6개 DB 테이블 생성 (approvals, expenses, gpr_goals, attendance, payroll, biz_plans)
- CRUD 레이어 (lib/supabase/erp.ts)
- 5개 핵심 페이지 DB 연결
- Seed: 결재 4, 경비 5, GPR 5, 근태 5, 사업계획 3

### 4. Works/Newsroom API 500 에러 수정
- board.ts: createBrowserClient → createClient (서버 호환)
- select에서 author_name, is_recommended 컬럼 제거 (posts 테이블에 없음)
- API 정상 작동 확인 (13개 Works + 7개 Newsroom)

### 5. SmarComm 도메인 + 인증
- smarcomm.biz 도메인 Vercel 연결
- 소셜 로그인 (Google/Kakao) 추가 — returnPath=/dashboard 고정
- 공사중 페이지 + 프리뷰 모드 (tenone1001)
- /sc/ 프리픽스 전체 제거 (32개 파일, 에이전트)
- middleware: /auth를 skipPaths에 추가
- 루트 /login에서 smarcomm 도메인 감지 → SmarComm 로그인 UI 인라인 렌더링
- 대시보드 layout: useAuth → Supabase 직접 getSession() 체크
- Header: Supabase 세션도 체크하도록 수정

### 6. SmarComm 별도 프로젝트 동기화
- C:\Projects\SmarComm → C:\Projects\tenone으로 파일 동기화 (50개 파일)
- import 경로 일괄 수정 (@/components/ → @/components/smarcomm/ 등)
- auth export명 통일 (getSCUser→getUser, scLogout→logout)
- workflow-data, chart-palette import 경로 수정
- DashboardSidebar 중복 import 제거
- 빌드 성공 확인 후 배포

### 7. 메신저 완성 버전
- 모바일 슬라이드 모드 (list/chat/profile)
- DB 연결 (chat_threads, chat_messages, Supabase Realtime)
- PC 레이아웃 조정 (대화창 max-w-2xl, 정보패널 확대)

### 8. 인트라 디자인 통일
- IntraUI 컴포넌트 적용 (Myverse 6개 + ERP 5개)
- 모바일 반응형 (대시보드 grid-cols 2/3/6 분기)
- 프로필 카드 모바일 세로 배치

### 9. 포탈 아이콘 + 기타
- →] (입장) / ←] (퇴장) 적용 (PublicHeader + IntraSidebar)
- 다크모드 카테고리 탭 가시성 수정 (CSS 변수)
- About 플레이스홀더 제거 확인

### 10. DB 실데이터 투입
- MADLeague MADzine 4개, Badak community 4개, YouInOne notice/portfolio 4개
- Townity notice 5개, free 2개
- board_configs RLS 정책 추가

## 현재 이슈 ⚠️

### SmarComm 긴급
- **로그인 흐름**: smarcomm.biz/login → 루트 /login이 렌더링됨 (middleware rewrite 무시)
  - 현재 대응: 루트 /login에서 smarcomm 도메인 감지 → SmarComm UI 인라인 렌더링
  - 하지만 Supabase 세션이 남아있으면 자동으로 /dashboard로 넘어감
  - 텐원 UI가 순간 보이는 문제 (깜빡임)
- **무료 가입 안 됨**: /signup도 루트 signup이 렌더링됨 → 같은 문제
- **대시보드 빈 화면**: Supabase Auth Lock 충돌 간헐적 발생
- **헤더 로그인/로그아웃 표시**: getUser() + Supabase getSession() 둘 다 체크하도록 수정했으나 배포 확인 필요
- **스캔 리포트**: 콘텐츠 갭/액션 플랜 텍스트 안 보임, PDF 다운로드 오류
- **사이드바**: 별도 프로젝트에서 동기화했으나 개발완료/개발중 구분 미적용

### 기타
- 브랜드 사이트 게시판 라이브 테스트 미완
- ERP 50+ 페이지 DB 미연결 (Mock 유지)

## 다음에 할 일 (집에서)

### 긴급 (SmarComm)
- [ ] 루트 /login, /signup에서 smarcomm 도메인 완벽 분기 (깜빡임 제거)
- [ ] SmarComm 회원가입 페이지 작동 확인
- [ ] 대시보드 빈 화면 근본 해결 (Auth Lock 충돌)
- [ ] 헤더 로그인/로그아웃 상태 표시 확인
- [ ] 스캔 리포트 텍스트/차트 수정
- [ ] 사이드바 개발완료/개발중 구분 적용

### 높음 (TenOne)
- [ ] 브랜드 사이트 게시판 라이브 테스트 (badak.biz, madleague.net)
- [ ] 인트라 나머지 모듈 DB 연결 (Evolution School, Wiki, Marketing, Studio)
- [ ] AI 에이전트 API 키 연결 (Anthropic/OpenAI)
- [ ] Supabase Storage 이미지 업로드 연결

### 중간
- [ ] ERP 나머지 50+ 페이지 DB 연결
- [ ] CrewInvite 지원 → 심사 → 역할 전환 흐름
- [ ] 각 사이트 로고 이미지 적용 (public/brands/)
- [ ] 포탈 트리거 시스템 (10:01, Welcome Back 등)

### 구조적 고민
- [ ] SmarComm 인증 근본 해결: 독립 인증 vs Supabase Auth 통합
- [ ] middleware rewrite vs 파일시스템 라우팅 충돌 → 근본 해결 방안
- [ ] 멀티 도메인 로그인/가입 통합 전략

## Supabase DB 현황
- members: 4건 (마스터 + 테스트 3)
- posts: 39건 (6개 게시판)
- board_configs: 8건
- projects: 8건
- approvals: 4건, expenses: 5건, gpr_goals: 5건
- attendance: 5건, biz_plans: 3건
- chat_threads: 0, chat_messages: 0
- hit_results: 0, career_profiles: 0, resumes: 0
- courses: 0, enrollments: 0
- contact_submissions: 0, newsletter_subscribers: 0

## Vercel 배포 정보
- Hobby (무료) 플랜
- 자동 배포: git push origin master
- 도메인: tenone.biz, smarcomm.biz, youinone.com, madleague.net, rook.co.kr, hero.ne.kr, badak.biz, 0gamja.com, seoul360.net, fwn.co.kr, auth.tenone.biz + 서브도메인

## 참고: SmarComm 별도 프로젝트
- 위치: C:\Projects\SmarComm (사무실)
- TenOne으로 동기화 완료 (2026-03-25)
- import 경로: @/components/smarcomm/, @/lib/smarcomm/
- auth 함수: getUser(), logout() (getSCUser/scLogout 아님)

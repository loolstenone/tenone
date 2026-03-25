# 작업 현황

> 마지막 업데이트: 2026-03-25 (사무실, 2차)

## 오늘 한 작업

### 1. 통합 게시판 Phase 3-4 + DB 실데이터
- PostEditor, BoardPage 4모드, 6개 사이트 BoardPage 교체
- 퍼블릭 useBums() 완전 제거, BUMS 레거시 삭제
- board-system.sql 적용 (posts, comments, attachments, likes, bookmarks, board_configs)
- Works 13개 + Newsroom 7개 + Badak/MADLeague/YouInOne 12개 게시글 seed

### 2. 감사 리포트 긴급 수정
- 홈/About 플레이스홀더 제거, robots.txt + sitemap.ts
- JSON-LD (Organization + Person), SEO 메타 강화
- 이메일 평문 전체 제거 (20+ 파일)

### 3. 다크모드 완전 대응
- CSS 변수 조정, 게시판 6개 컴포넌트 다크모드
- About/Works/Newsroom bg-neutral-100 → tn-bg-alt

### 4. 회원 체계 v2 구현
- members 테이블: primary_type, roles, affiliations, intra_access, module_access 추가
- 등급 체계: Staff > Partner > Alliance > Crew > MADLeaguer > Member
- 가입 origin_site별 초기 역할 자동 설정
- 사이드바 moduleAccess 기반 메뉴 필터링

### 5. 각 사이트 /my 마이페이지 + 헤더 로그인
- 12개 사이트 /my 마이페이지 생성
- 18개 헤더에 로그인/마이페이지 분기 추가

### 6. ERP 현실화
- 6개 DB 테이블 생성 (approvals, expenses, gpr_goals, attendance, payroll, biz_plans)
- CRUD 레이어 (lib/supabase/erp.ts)
- 5개 핵심 페이지 DB 연결
- Seed 데이터: 결재 4, 경비 5, GPR 5, 근태 5, 사업계획 3

### 7. BUMS 레거시 → 새 시스템 전환
- boards/content 페이지 → /api/board/posts API 연결
- bums_* 테이블/코드 정리

### 8. 메신저 완성 버전
- 모바일 슬라이드 모드 (list/chat/profile)
- DB 연결 (chat_threads, chat_messages, Supabase Realtime)
- PC 레이아웃 조정 (대화창 max-w-2xl)

### 9. SmarComm 도메인 + 인증
- smarcomm.biz 도메인 연결
- 소셜 로그인 (Google/Kakao) 추가
- 공사중 페이지 + 프리뷰 모드 (tenone1001)
- /sc/ 프리픽스 전체 제거 (32개 파일)
- 대시보드 auth 수정 (useAuth → 직접 세션 체크)

### 10. 인트라 디자인 통일
- IntraUI 컴포넌트 (PageHeader, Card, Badge, StatCard, Spinner)
- Myverse 6개 + ERP 5개 페이지 적용
- 모바일 반응형 (대시보드 grid-cols 조정)

### 11. 테스트 계정 + 기타
- Staff 2명 (김사라, 김준호) + Crew 1명 (박기혁) 추가
- 포탈 아이콘 →] / ←]
- Works/Newsroom API 500 에러 수정 (author_name, is_recommended 컬럼)

## 현재 이슈 ⚠️
- SmarComm 로그인: 간헐적 빈 화면 (Supabase Auth Lock 충돌)
- SmarComm 스캔 리포트: 콘텐츠 갭/액션 플랜 텍스트 안 보임
- SmarComm 사이드바: 집에서 작업한 버전 미반영 (푸시 안 됨)
- 브랜드 사이트 게시판 라이브 테스트 미완
- ERP 50+ 페이지 DB 미연결 (Mock 유지)

## 다음에 할 일
- [ ] 집에서 SmarComm 사이드바 변경 푸시 확인
- [ ] SmarComm 스캔 리포트 텍스트/차트 수정
- [ ] SmarComm PDF 다운로드 수정
- [ ] 브랜드 사이트 게시판 라이브 테스트
- [ ] 인트라 나머지 모듈 DB 연결 (Evolution School, Wiki, Marketing)
- [ ] AI 에이전트 API 키 연결
- [ ] Supabase Storage 이미지 업로드
- [ ] CrewInvite 지원 → 심사 → 역할 전환 흐름

## Supabase DB 현황
- members: 4건 (마스터 + 테스트 3)
- posts: 39건 (6개 게시판)
- board_configs: 8건
- projects: 8건
- approvals: 4건
- expenses: 5건
- gpr_goals: 5건
- attendance: 5건
- biz_plans: 3건
- chat_threads: 0 / chat_messages: 0
- 나머지 테이블: 0건 (테이블 생성됨)

## Vercel 배포 정보
- Hobby (무료) 플랜 — 상업 서비스 시 Pro($20/월) 전환 필요
- 도메인: tenone.biz, smarcomm.biz, youinone.com, madleague.net, rook.co.kr, hero.ne.kr, badak.biz, 0gamja.com, seoul360.net, fwn.co.kr, auth.tenone.biz + 서브도메인

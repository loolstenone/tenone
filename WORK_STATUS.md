# 작업 현황

> 마지막 업데이트: 2026-03-26 (집) — 최종 종료

## 오늘 한 작업 (3/26 집)

### SmarComm (7커밋)
- 로그인/가입 도메인 분기, 리다이렉트 루프, 직접 OAuth, 세션 유지
- 다중 페이지 크롤링, 36가지 브랜드 유형, 퍼포먼스 UI

### Badak MVP (3커밋)
- DB 4개 + CRUD + 6개 페이지 전체 구축

### WIO 솔루션 (13커밋)
- 마케팅 사이트 5페이지 (랜덤 카피 5종)
- 24개 DB 테이블 Supabase 생성 (Sprint 1~4)
- 10개 모듈 앱 UI: Home, Project, Talk, Finance, People, Sales, Learn, Content, Wiki, Insight
- WIO 전용 로그인/가입 페이지 (/wio/login, 이메일만)
- 솔루션 페이지 개발 상태 배지 제거

### TenOne Universe + 구조 개선 (8커밋)
- About 페이지 탭 4개: Philosophy / Universe / Brands / History
- Brands 탭: 7카테고리 33개 브랜드 디렉토리
- **URL 약어→풀네임 전체 변경 (20개 브랜드)**
  - /sc→/smarcomm, /bk→/badak, /ml→/madleague, /yi→/youinone 등
- **Footer 저작권 통일 (21개 브랜드)**
  - © 브랜드명. Powered by Ten:One™ Universe. (링크: /about?tab=universe)
- 소셜 로그인 후 원래 페이지 복귀 (auth_redirect 쿠키)

## 현재 이슈 ⚠️

### 로그인 문제 (사무실에서 계속)
- SmarComm 소셜 로그인: 구글/카카오 로그인 시 텐원으로 넘어가는 문제 잔존
- SmarComm 리프레시 시 로그아웃: 대시보드에서 F5 하면 세션 유실
- WIO 앱 접속 시 스피너: 로그인 안 된 상태에서 /wio/login으로 리다이렉트 되나 확인 필요

### 기타
- Badak: badak.biz는 기존 서버 운영 중, 개발만 진행
- WIO: 도메인 미확보 (/wio 프리픽스), Vercel custom domain 추가 필요

## 다음에 할 일 (사무실)

### 🔴 긴급: 로그인 전면 재검토
- [ ] SmarComm 소셜 로그인 텐원 넘어감 → auth callback에서 origin 도메인 확인
- [ ] 리프레시 시 세션 유실 → Supabase SSR 쿠키 설정 점검
- [ ] WIO 로그인 라이브 테스트 (이메일 가입→로그인→앱 진입)
- [ ] Supabase redirect URL 일괄 등록

### WIO 도메인 + 연결
- [ ] wio.co.kr 도메인 Vercel custom domain 등록
- [ ] WIO 미들웨어 도메인 분기 추가

### TenOne 기타
- [ ] 인트라 나머지 모듈 DB 연결
- [ ] AI 에이전트 API 키 연결
- [ ] Supabase Storage 이미지 업로드

## Supabase DB 현황 (총 32+ 테이블)

### 기존
members(4), posts(39), board_configs(8), projects(8), approvals(4), expenses(5), gpr_goals(5), attendance(5), biz_plans(3), chat_threads(0)

### Badak (4개)
badak_profiles, badak_connections, badak_feedbacks, badak_stars

### WIO (24개)
Sprint 1: wio_tenants(1 시드), wio_members, wio_projects, wio_jobs, wio_timesheets, wio_project_members
Sprint 2: wio_posts, wio_events, wio_todos, wio_notifications, wio_chat_threads, wio_chat_messages, wio_approvals, wio_expenses, wio_settlements
Sprint 3: wio_points, wio_hit_results, wio_opportunities, wio_leads, wio_gpr
Sprint 4: wio_courses, wio_enrollments, wio_contents, wio_documents

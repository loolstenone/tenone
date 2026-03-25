# 작업 현황

> 마지막 업데이트: 2026-03-26 (집) — 작업 종료

## 오늘 한 작업

### SmarComm (7커밋)
- 로그인/가입 도메인 분기 — 깜빡임 제거 (전용 컴포넌트 분리)
- 리다이렉트 루프 해결
- 소셜 로그인 직접 OAuth (auth-hub 경유 제거, Supabase redirect URL 등록)
- 세션 유지 (getSession→getUser 서버 검증)
- 콘텐츠 갭/액션 플랜 JSON → 파싱 UI
- 다중 페이지 크롤링 (최대 5개 서브페이지)
- 36가지 브랜드 유형 (16→36 확장)
- 퍼포먼스 점수 산출 근거 UI

### Badak MVP (3커밋)
- 4개 DB 테이블 (badak_profiles, connections, feedbacks, stars + RLS)
- CRUD 20+ 함수 + ProfileCard 컴포넌트
- 6개 페이지: 랜딩, 온보딩, 탐색, 프로필, 스타, 스타 상세

### WIO 솔루션 (Sprint 1~5 전체 완료, 11커밋)
- **마케팅 사이트**: 랜딩(랜덤 카피 5종), 솔루션, 프레임워크, 가격, 소개
- **Sprint 1**: 6개 DB (tenants, members, projects, jobs, timesheets, project_members)
- **Sprint 2**: 9개 DB (posts, events, todos, notifications, chat_threads, chat_messages, approvals, expenses, settlements)
- **Sprint 3**: 5개 DB (points, hit_results, opportunities, leads, gpr)
- **Sprint 4**: 4개 DB (courses, enrollments, contents, documents)
- **Sprint 5**: Insight BI 대시보드 + Settings 페이지 + Home 강화
- **총 24개 WIO 테이블 Supabase 생성 완료**
- **10개 모듈 앱 UI 전체 구축**: Home, Project, Talk, Finance, People, Sales, Learn, Content, Wiki, Insight

### TenOne Universe (5커밋)
- /about 페이지 탭 4개: Philosophy / Universe / Brands / History
- Brands 탭: 7카테고리 33개 브랜드 디렉토리 (인라인)
- Universe 탭: 기존 세계관 설명글 유지
- 헤더 드롭다운 메뉴 일치
- docs/TenOne_Universe_Directory.html 원본 보관

## 현재 이슈 ⚠️

### 로그인 문제 (미해결 — 사무실에서 계속)
- **SmarComm 소셜 로그인**: 구글/카카오 로그인 시 텐원으로 넘어가는 문제 잔존
- **SmarComm 리프레시 시 로그아웃**: 대시보드에서 F5 하면 세션 유실
- **근본 원인**: 멀티도메인 OAuth redirect URI + 세션 쿠키 도메인 격리
- **해결 방향**: Gemini 분석 참고 — state 파라미터 + 중앙 인증 or 도메인별 직접 OAuth
- **Supabase에 등록 필요**: badak.biz, madleague.net 등 나머지 도메인 redirect URL

### 기타
- Badak: badak.biz는 기존 서버 운영 중, 개발만 진행
- WIO: 도메인 미확보 (/wio 프리픽스), 로그인 연결 필요

## 다음에 할 일 (사무실)

### 🔴 긴급: 로그인 전면 재검토
- [ ] SmarComm 소셜 로그인 텐원 넘어감 → auth callback에서 origin 도메인 확인 후 리다이렉트
- [ ] 리프레시 시 세션 유실 → Supabase SSR 쿠키 설정 점검 (SameSite, Domain)
- [ ] WIO 로그인 연결 — /wio/login 페이지 + auth callback
- [ ] Supabase redirect URL 일괄 등록 (badak.biz, madleague.net, wio.co.kr 등)

### WIO 도메인 + 연결
- [ ] wio.co.kr 또는 wio.work 도메인 연결 (Vercel custom domain)
- [ ] WIO 미들웨어 도메인 분기 추가
- [ ] WIO 로그인/가입 페이지 구축

### TenOne 기타
- [ ] 인트라 나머지 모듈 DB 연결
- [ ] AI 에이전트 API 키 연결 (Anthropic/OpenAI)
- [ ] Supabase Storage 이미지 업로드

## Supabase DB 현황 (총 32+ 테이블)

### 기존
members(4), posts(39), board_configs(8), projects(8), approvals(4), expenses(5), gpr_goals(5), attendance(5), biz_plans(3), chat_threads(0)

### Badak (4개)
badak_profiles, badak_connections, badak_feedbacks, badak_stars

### WIO (24개)
- Sprint 1: wio_tenants(1 시드), wio_members, wio_projects, wio_jobs, wio_timesheets, wio_project_members
- Sprint 2: wio_posts, wio_events, wio_todos, wio_notifications, wio_chat_threads, wio_chat_messages, wio_approvals, wio_expenses, wio_settlements
- Sprint 3: wio_points, wio_hit_results, wio_opportunities, wio_leads, wio_gpr
- Sprint 4: wio_courses, wio_enrollments, wio_contents, wio_documents

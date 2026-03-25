# 작업 현황

> 마지막 업데이트: 2026-03-26 (집)

## 오늘 한 작업

### SmarComm 긴급 (7커밋)
- 로그인/가입 도메인 분기 — 깜빡임 제거 (SmarComm 전용 컴포넌트 분리)
- 회원가입 페이지 SmarComm 전용 UI 추가
- 대시보드 빈 화면 → 로딩 스피너 + auth 안정화
- 리다이렉트 루프 해결 (대시보드와 동일한 인증 체크)
- 소셜 로그인 직접 OAuth (auth-hub 경유 제거, Supabase redirect URL 등록)
- 세션 유지 (getSession→getUser 서버 검증)
- 콘텐츠 갭/액션 플랜 JSON 원문 → 파싱 UI
- /scan 404 수정, PDF print CSS, 레이더 차트 확대
- 사이드바 DEV 배지, Workspace 네이밍, 홈 링크
- 다중 페이지 크롤링 (내부 링크 최대 5개 서브페이지)
- 36가지 브랜드 유형 (16→36 확장)
- 퍼포먼스 점수 산출 근거 UI 명시

### Badak MVP (3커밋)
- 4개 DB 테이블 생성 (badak_profiles, connections, feedbacks, stars + RLS)
- types/badak.ts + lib/badak-constants.ts + lib/supabase/badak.ts (CRUD 20+ 함수)
- components/badak/ProfileCard.tsx (3 variant) + TagPicker.tsx
- 6개 페이지: 랜딩, /join(온보딩 4단계), /explore(필터+그리드), /profile/[id](연결요청), /stars, /stars/[slug]
- BadakHeader 네비 업데이트 + 내부 링크 /bk 프리픽스 통일

### WIO (3커밋)
- 마케팅 사이트 5페이지: 랜딩, /solutions(9카테고리 50+기능), /framework(6방법론 25상품), /pricing(4단계), /about
- 솔루션 Sprint 1: 6개 DB 테이블 (wio_tenants, members, projects, jobs, timesheets, project_members)
- types/wio.ts + lib/supabase/wio.ts (CRUD 20+ 함수)
- WIO App: 레이아웃(테넌트 컨텍스트+모듈 사이드바), 대시보드, 프로젝트 목록/생성

## 현재 이슈 ⚠️
- SmarComm 카카오 로그인: 직접 OAuth로 변경했으나 라이브 테스트 필요
- Badak: badak.biz 도메인은 기존 서버에서 운영 중, 개발만 진행
- WIO: wio.work 도메인 미확보, /wio 프리픽스로 개발

## 다음에 할 일

### WIO 솔루션 (Sprint 2)
- [ ] wio_posts, wio_events 테이블 + Talk 모듈 UI
- [ ] wio_approvals, wio_expenses 테이블 + Finance 모듈 UI
- [ ] wio_todos 테이블 + Home Todo 연동
- [ ] 메신저 (wio_chat_threads + Realtime)
- [ ] 알림 센터 기본

### SmarComm
- [ ] 카카오 로그인 라이브 테스트
- [ ] 스캔 리포트 서브페이지 분석 결과 확인
- [ ] /scan 페이지 라이브 테스트

### TenOne 높음
- [ ] 인트라 나머지 모듈 DB 연결 (50+ 페이지)
- [ ] AI 에이전트 API 키 연결
- [ ] Supabase Storage 이미지 업로드

## Supabase DB 현황
- 기존 테이블: members(4), posts(39), board_configs(8), projects(8), approvals(4), expenses(5), gpr_goals(5), attendance(5), biz_plans(3), chat_threads(0)
- Badak 신규: badak_profiles, badak_connections, badak_feedbacks, badak_stars
- WIO 신규: wio_tenants(1 시드), wio_members, wio_projects, wio_jobs, wio_timesheets, wio_project_members

## 배포 커밋 (13건)
1. 7fbb3d5 — SmarComm 도메인 분기 근본 해결
2. 97537bb — 리다이렉트 루프 해결
3. 3ddf63d — 스캔/로그인/리포트 다수 수정
4. f8c148e — 다중 페이지 크롤링 + 36유형 + 퍼포먼스
5. acbec82 — 소셜 로그인 직접 OAuth
6. bf2d358 — 세션 유지 + Workspace 네이밍
7. b0330a8 — Workspace 클릭 홈 이동
8. 2c6873f — 레이더 차트 크기 확대
9. 83bb217 — Badak MVP 전체 구축
10. dfcd838 — Badak 내부 링크 /bk 프리픽스
11. 53d72e4 — WIO 기본 구조 생성
12. 2e95c49 — WIO 4개 메뉴 페이지
13. 76aaeef — WIO Sprint 1 멀티테넌트+프로젝트

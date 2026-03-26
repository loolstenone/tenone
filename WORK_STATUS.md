# 작업 현황

> 마지막 업데이트: 2026-03-26 (사무실) — 작업 종료

## 오늘 한 작업 (3/26 사무실) — 8커밋

### TrendHunter 사이트 구축 (→ Mindle 리브랜딩 예정)
- **14개 페이지** 생성: 홈/About/Reports/Insights/Services/My/Weekly/Signals/References/Opportunities/Dashboard
- **로고 반영**: PDF에서 추출 — T빨강/r노랑/e연두/n하늘/d초록 + Hunter흰색, TrendHunterLogo.tsx 컴포넌트
- **DB 스키마** 9개 테이블: collected_data, digests, bot_responses, th_opportunities, url_archive, daily_stats, th_insights, content_drafts, crawler_status (supabase/trendhunter-tables.sql)
- **API 3개**: /api/trendhunter/collect (PII 마스킹+URL추출), /respond (바닥쇠 AI 14개 주제별 프롬프트), /stats (대시보드 통계)
- **기술설계서** docs/ 복사: TrendHunter_크롤러_기술설계서_v1.md
- **네비게이션**: site-config nav/footer → Weekly/Signals/References/Opportunities

### 인증 시스템 전면 개편 ✅
- **SmarComm sessionStorage Mock 제거** → useAuth() 단일 경로 통일 (13개 파일 전환)
- **auth-hub 크로스도메인 토큰 전송 폐기** → 도메인별 직접 Supabase OAuth
- **searchParams 크래시 버그 수정** (SmarCommLoginForm)
- **로그아웃 시 Supabase 쿠키 강제 제거** (sb- 쿠키 만료 처리)
- **SmarComm 리다이렉트 루프 수정** (middleware skipPaths 통일)
- **서브도메인 로그인 후 텐원 이동 수정** (isSubdomain 감지 → / 리다이렉트)
- **스캔 데이터 유틸리티 분리** (lib/smarcomm/scan-data.ts)
- auth-transfer.ts 삭제, auth-hub 3개 라우트 폐기(리다이렉트)

### LoginModal 팝업 로그인 ✅
- **LoginModal 공통 컴포넌트** 생성 (Google/카카오 + 이메일, 브랜드별 accentColor)
- **전 브랜드 20개 헤더** 적용 완료 (TrendHunter, Badak, HeRo, RooK, SmarComm 등)
- 페이지 이동 없이 현재 사이트에서 바로 로그인

### 서브도메인 인프라 ✅
- **가비아 DNS**: 8개 서브도메인 CNAME → cname.vercel-dns.com (trendhunter, wio, seoul360, montz, jakka, townity, planners, mullaesian)
- **Vercel 프로젝트 도메인**: 8개 + mindle 등록 (자동 배포 반영)
- **Supabase Redirect URL**: 19개 도메인 등록 완료
- **middleware**: wio.tenone.biz, seoul360.tenone.biz 매핑 추가

### 문서 보관
- TrendHunter_크롤러_기술설계서_v1.md → docs/
- WIO_AI_개발계획서_v1.md → docs/

## 현재 이슈 ⚠️

### 로그인 — 대부분 해결, 잔여 이슈
- [x] SmarComm 소셜 로그인 텐원 넘어감 → 직접 OAuth로 해결
- [x] SmarComm 리프레시 시 로그아웃 → useAuth(localStorage) 통일로 해결
- [x] Supabase redirect URL 일괄 등록 → 19개 완료
- [ ] Supabase에 `https://*.tenone.biz/auth/callback` 와일드카드 URL 추가 필요 (서브도메인 소셜 로그인용)
- [ ] 카카오 OAuth Provider가 Supabase에 설정되어 있는지 확인 필요

### 서브도메인
- [x] 8개 DNS + Vercel 등록
- [x] mindle.tenone.biz DNS + Vercel 등록
- [ ] mindle.tenone.biz middleware 매핑 추가 필요

## 다음에 할 일 (집 또는 사무실)

### 🔴 최우선: Mindle(민들레) — TrendHunter 대변혁
- [ ] TrendHunter → Mindle 리브랜딩: 이름/로고/컬러/도메인(mindle.tenone.biz)
- [ ] 민들레 홀씨 컨셉 디자인 (현재 다크+네온그린 톤 유지, 폰트 유지)
- [ ] 참고사이트 기반 페이지 재설계:
  - Careet 스타일: 트렌드 카드 + 상태 배지(유행중/예감) + 하이라이트 기능
  - Sometrend 스타일: 키워드 분석 대시보드 + 실시간 차트
  - TrendHunter 스타일: AI 리포트 자동 생성 + 카드 그리드
  - TrendMonitor 스타일: 설문 기반 인사이트 + 카테고리별 리포트
- [ ] 관리자 대시보드 구축 (WIO Crawling 모듈 연동)
  - 크롤러 상태 관리 (바닥쇠/웹크롤러/디스코드/RSS)
  - 수집 데이터 뷰어 + 검색
  - AI 분석 결과 관리
  - 콘텐츠 초안 관리 (생성→검수→발행 워크플로우)
  - 기회 감지 관리 (신규→검토→대응 파이프라인)
- [ ] TrendHunter 크롤러 DB 연결 (collected_data, digests, insights, content_drafts)
- [ ] middleware에 mindle.tenone.biz → /mindle 매핑

### WIO 도메인 연결
- [ ] wio.tenone.biz 라이브 테스트
- [ ] WIO 로그인 → 앱 진입 플로우 확인

### TenOne 기타
- [ ] 인트라 나머지 모듈 DB 연결
- [ ] AI 에이전트 API 키 연결
- [ ] Supabase Storage 이미지 업로드

## Supabase DB 현황 (총 41+ 테이블)

### 기존 (10개)
members(4), posts(39), board_configs(8), projects(8), approvals(4), expenses(5), gpr_goals(5), attendance(5), biz_plans(3), chat_threads(0)

### Badak (4개)
badak_profiles, badak_connections, badak_feedbacks, badak_stars

### WIO (24개)
Sprint 1: wio_tenants(1 시드), wio_members, wio_projects, wio_jobs, wio_timesheets, wio_project_members
Sprint 2: wio_posts, wio_events, wio_todos, wio_notifications, wio_chat_threads, wio_chat_messages, wio_approvals, wio_expenses, wio_settlements
Sprint 3: wio_points, wio_hit_results, wio_opportunities, wio_leads, wio_gpr
Sprint 4: wio_courses, wio_enrollments, wio_contents, wio_documents

### TrendHunter/Mindle (9개) — SQL 작성 완료, 미생성
collected_data, digests, bot_responses, th_opportunities, url_archive, daily_stats, th_insights, content_drafts, crawler_status

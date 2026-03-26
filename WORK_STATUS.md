# 작업 현황

> 마지막 업데이트: 2026-03-26 (사무실) — 작업 종료 #2

## 오늘 한 작업 (3/26 사무실) — 약 15커밋

### 1. Mindle(민들레) 사이트 구축 ✅
- TrendHunter → **Mindle** 리브랜딩 완료
- 도메인: `mindle.tenone.biz` (DNS + Vercel + middleware)
- **전 페이지 영문 전환**: 홈/Trends/Reports/Data/References/About/My/Admin
- **2단 헤더**: 상단 유틸리티(ABOUT/LOGIN/Share/Search) + 하단 네비(TRENDS/REPORTS/DATA/REFERENCES)
- **홈**: 신문 레이아웃 + 30개 영문 랜덤 카피 + Hot Keywords + Featured Article + TODAY'S PICKS
- **Trends**: Featured 기사 + 리스트/그리드 뷰 전환 + 카테고리 필터 + 인라인 검색
- **Reports**: 주간 타임라인 + LATEST/PREMIUM 뱃지 + 키워드 태그
- **Data**: 키워드 랭킹 테이블(15개) + 기간 필터(24H/7D/30D/90D) + 수집 소스 현황 + Biggest Movers
- **References**: Editor's Picks + 카테고리 필터 + 12개 소스 + 태그
- **Admin**: Supabase 실데이터 연결 + 이메일 기반 관리자 권한

### 2. Mindle DB + 크롤러 ✅
- Supabase에 **9개 테이블 생성 완료** (collected_data, digests, bot_responses, th_opportunities, url_archive, daily_stats, th_insights, content_drafts, crawler_status)
- **RLS 정책** 설정 (authenticated read, anon/auth insert, auth update)
- **RSS 자동 수집 크롤러** 구축: `/api/trendhunter/rss` (GET/POST)
  - 8개 피드: TechCrunch, Hacker News, Product Hunt, The Verge, Indie Hackers, Morning Brew, Google News KR Tech/Business
  - 중복 체크(24시간) + RSS 2.0/Atom 파싱 + crawler_status 자동 업데이트
  - **첫 실행으로 30건 수집 성공** (6개 피드 정상, 2개 404)
- 테스트 데이터: crawler_status 4건 + collected_data 3건 수동 입력

### 3. 인증 시스템 최종 해결 ✅
- **Supabase Redirect URL**: `https://*.tenone.biz/auth/callback` 와일드카드 등록 → 전 서브도메인 소셜 로그인 해결
- **LoginModal** 22개 헤더 전체 적용 확인
- **서브도메인 로그인 후 텐원 이동 문제** 해결 (isSubdomain race condition fix)

### 4. 서브도메인 인프라 ✅
- 가비아 DNS: CNAME 8개 (trendhunter, wio, seoul360, montz, jakka, townity, planners, mullaesian)
- Vercel: 9개 도메인 등록 (위 8개 + mindle)
- middleware: mindle.tenone.biz, wio.tenone.biz, seoul360.tenone.biz 매핑

### 5. WIO 8대 모듈 완성 ✅
- **Timesheet 모듈 추가**: 주간 시수 그리드 + 프로젝트별 시간/비용 계산 + AI Auto-Fill 버튼 + Submit/Approve 워크플로우
- 8대 모듈: Project, People, Finance, Sales, Timesheet(NEW), Content, Wiki, Insight

## 현재 이슈 ⚠️

### 해결 완료
- [x] 서브도메인 소셜 로그인 → 와일드카드 URL로 해결
- [x] Mindle DB 테이블 생성
- [x] Mindle Admin 컬럼명 매칭 (collected_at, crawler_name 등)
- [x] Mindle Admin 관리자 권한 (이메일 화이트리스트)

### 잔여 이슈
- [ ] RSS 크롤러 2개 피드 404 (Indie Hackers, Morning Brew) — URL 교체 필요
- [ ] 카카오 OAuth Provider Supabase 설정 확인 필요
- [ ] newsletter 페이지 404 (/mindle/newsletter 미생성)

## 다음에 할 일 (집)

### 🔴 최우선: Mindle 고도화
- [ ] RSS 크롤러 cron 자동화 (Vercel Cron 또는 Cloud Scheduler로 1시간마다 자동 실행)
  - vercel.json에 `crons: [{ path: "/api/trendhunter/rss", schedule: "0 * * * *" }]` 추가
- [ ] RSS 피드 404 수정: Indie Hackers, Morning Brew URL 교체
- [ ] Mindle Admin 고도화: 수집 데이터 검색/필터, AI 분석 트리거 버튼
- [ ] Mindle newsletter 페이지 생성 (/mindle/newsletter)
- [ ] 콘텐츠 파이프라인: 수집 데이터 → AI 분석 → 콘텐츠 초안 자동 생성

### 크롤러 확장
- [ ] 디스코드 봇 크롤러 (discord.js → /api/trendhunter/collect)
- [ ] 웹 크롤러 (Puppeteer) — 네이버 카페/블로그
- [ ] 바닥쇠 (카카오 오픈채팅) — 안드로이드 공기계 + 메신저봇R

### WIO
- [ ] wio.tenone.biz 라이브 테스트
- [ ] WIO 로그인 → 앱 진입 플로우 확인
- [ ] Timesheet이 사이드바에 표시되는지 확인 (tenant.modules에 'timesheet' 포함 필요)

### TenOne 기타
- [ ] 인트라 나머지 모듈 DB 연결
- [ ] AI 에이전트 API 키 연결

## Supabase DB 현황 (총 50+ 테이블)

### 기존 (10개)
members(4), posts(39), board_configs(8), projects(8), approvals(4), expenses(5), gpr_goals(5), attendance(5), biz_plans(3), chat_threads(0)

### Badak (4개)
badak_profiles, badak_connections, badak_feedbacks, badak_stars

### WIO (24개)
Sprint 1~4 동일

### Mindle/TrendHunter (9개) — ✅ 생성 완료 + RLS 설정
collected_data(37+), digests(0), bot_responses(0), th_opportunities(0), url_archive(0), daily_stats(0), th_insights(0), content_drafts(0), crawler_status(4)

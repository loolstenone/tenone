# 작업 현황

> 마지막 업데이트: 2026-03-26 (집) — 작업 종료

## 오늘 한 작업 (3/26 집)

### 1. Mindle 고도화 ✅
- RSS 크롤러 cron 자동화 (vercel.json — 매시간)
- RSS 피드 404 수정 (Indie Hackers→Ars Technica, Morning Brew→Wired)
- Newsletter 페이지 생성 (/mindle/newsletter)
- 헤더 2줄→1줄 정리 (Logo+Nav 왼쪽, Utility 오른쪽)
- Admin 고도화 (검색/필터/Run Crawl Now/Run AI Analysis)
- 콘텐츠 파이프라인 API (/api/trendhunter/analyze)
  - Rule-based 키워드 추출 + 트렌드 요약
  - newsletter/report/article 3종 초안 자동 생성
  - content_drafts + th_insights DB 저장
- Collect API 배치 모드 추가 (items[] 배열)

### 2. 크롤러 확장 3종 ✅
- **디스코드 봇** (bots/discord/) — discord.js, 배치 전송, 채널별 토픽 매핑
- **웹 크롤러** (bots/web-crawler/) — Puppeteer, 네이버 블로그/카페
- **바닥쇠** (bots/badaksoe/) — 메신저봇R, 카카오 오픈채팅 내부/외부 방

### 3. WIO 점검 + 수정 ✅
- wio.tenone.biz 라이브 테스트 — 마케팅홈/로그인/앱 모두 정상
- 사이드바 기본 모듈 ['home','project','talk'] → 10개 전체로 확장
- /contact 페이지 생성 (상담 신청 폼, 인디고 테마)
- 마케팅 3페이지 CTA 링크 /contact → /wio/contact 수정
- 프로젝트 상세 페이지 생성 (/wio/app/project/[id])

### 4. 인증 세션 끊김 수정 ✅
- Supabase 클라이언트 싱글톤 (매번 새 인스턴스 → 싱글톤)
- 세션 만료 시 stale localStorage 정리
- TOKEN_REFRESHED 이벤트 처리 추가
- syncUserFromSession() 공통 함수 추출

### 5. 인트라 DB 연결 ✅
- Marketing 모듈 Supabase 연결 (SQL스키마 + DB레이어 + Context DB우선/Mock fallback)
- supabase/marketing-tables.sql (4테이블: campaigns, leads, content, deals)
- lib/supabase/marketing.ts (CRUD 전체)

### 6. TenOne 고도화 ✅
- Universe 페이지 인터랙티브 구조도 (리다이렉트 → 실제 콘텐츠)
  - Ten:One Hub → WIO/YIO 양대 OS → 9개 사업 포트폴리오 (WIO·YIO 적용 방식)
  - 수평 시너지 체인 3개 (인재/트렌드-비즈니스/교육)
  - TenOne 다크 테마 + CSS 변수 통일
- 한/영 UI 통일 (Logout→로그아웃, Login→로그인, Joinup→회원가입, →]→Intra)
- Privacy Policy 페이지 생성 (개인정보처리방침 7조)
- Terms of Service 페이지 생성 (이용약관 9조)
- 푸터 Privacy/Terms 링크 활성화
- Brands 페이지 다크 테마 적용 (CSS 변수 기반)
- About > Universe 서브메뉴 → /universe 독립 링크
- 홈 히어로 이미지 fallback (에러 시 10:01 UNIVERSE 텍스트)
- Works/Newsroom fetch 에러 핸들링 개선

### 7. 전체 분석 + 문서화 ✅
- SITE_ANALYSIS.md 전체 사이트 종합 분석 보고서
  - TenOne 7/10, WIO 6.5/10, SmarComm 6.5/10, Mindle 8.5/10
  - CRITICAL 8건, HIGH 12건 식별
  - Sprint 1~4 액션 플랜 23개 항목
- CLAUDE.md 규칙 추가 (작업종료 묻지않기 + 톤앤매너 준수)

## 현재 이슈 ⚠️

### 해결 완료
- [x] 인증 세션 끊김 → 싱글톤 + 세션만료정리 + TOKEN_REFRESHED
- [x] Mindle newsletter 404 → 페이지 생성
- [x] WIO /contact 404 → 페이지 생성
- [x] TenOne Universe 빈 페이지 → 인터랙티브 구조도
- [x] TenOne 한/영 혼용 → 한국어 통일
- [x] 푸터 Privacy/Terms 비활성 → 페이지 생성 + 링크 연결

### 잔여 이슈
- [ ] RSS 크롤러 404 피드 2개 → Ars Technica/Wired로 교체 완료, Vercel 배포 후 확인
- [ ] 카카오 OAuth Provider Supabase 설정 확인 필요
- [ ] WIO Settings CRUD 미구현 (다음 세션)
- [ ] SmarComm "개발중" 15+ 페이지 네비 노출 → 피처플래그 필요

## 다음에 할 일 (사무실)

### 🔴 최우선: WIO 고도화 계속
- [ ] WIO Settings CRUD (조직 편집/멤버 초대·삭제/모듈 토글/브랜딩 수정)
  - `app/(WIO)/wio/app/settings/page.tsx` 현재 읽기전용 → 각 탭에 편집 폼 추가
  - Supabase `wio_tenants` UPDATE, `wio_tenant_members` INSERT/DELETE
- [ ] WIO 모듈 접근 제어 (tenant.plan → activeModules 필터링)
  - `app/(WIO)/wio/app/layout.tsx` line 86 기본값을 plan 기반으로 변경
- [ ] WIO 이메일 인증 + 비밀번호 재설정 플로우
- [ ] WIO Timesheet Mock → Supabase 연결

### SmarComm 고도화
- [ ] "개발중" 페이지 네비에서 숨김 (피처플래그 또는 리스트 분리)
- [ ] TierGate localStorage → 서버 인증 전환
- [ ] /api/scan 엔드포인트 실제 구현 (현재 프론트만)

### 인트라 모듈
- [ ] Studio 모듈 DB 연결 (schedule, assets)
- [ ] BUMS 모듈 DB 연결

### AI
- [ ] Claude API 키 연결 → Mindle AI 분석 rule-based→Claude 전환
- [ ] AI 에이전트 API 연동

## Supabase DB 현황 (총 55+ 테이블)

### 기존 (10개)
members(4), posts(39), board_configs(8), projects(8), approvals(4), expenses(5), gpr_goals(5), attendance(5), biz_plans(3), chat_threads(0)

### Badak (4개)
badak_profiles, badak_connections, badak_feedbacks, badak_stars

### WIO (24개)
Sprint 1~4 동일

### Mindle/TrendHunter (9개)
collected_data(37+), digests(0), bot_responses(0), th_opportunities(0), url_archive(0), daily_stats(0), th_insights(0), content_drafts(0), crawler_status(4)

### Marketing (4개) — ✅ 신규
marketing_campaigns, marketing_leads, marketing_content, marketing_deals

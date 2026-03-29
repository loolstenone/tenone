# TenOne Universe — 프로젝트 현황 보고서

> 기준일: 2026-03-30
> 프로젝트: C:\Projects\TenOne
> 배포: https://tenone.biz (Vercel)
> 기술 스택: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase

---

## 1. 전체 규모

| 항목 | 수치 |
|------|------|
| 총 페이지 수 | **499** |
| Git 커밋 수 | **324** |
| Supabase DB 테이블 | **90+** |
| SQL 마이그레이션 파일 | **21** |
| WIO Orbi 모듈 페이지 | **125** |
| Orbi 실DB 연동 모듈 | **56** (45%) |
| AI 에이전트 | **7** (Claude 실응답) |
| 브랜드 사이트 | **15+** |
| 게시판 등록 | **25** (6개 사이트) |

---

## 2. 서비스별 현황

### 2.1 TenOne (기업 소개)
- URL: tenone.biz
- 페이지: 홈, Works(20개 게시물), Newsroom, Contact, About(Universe/Brands/History), Profile
- 상태: ✅ 완성. 로그인/가입 숨김 (기업 소개용)
- 게시판: Works, Newsroom (Supabase 실연동)

### 2.2 TenOne Intra (직원 전용)
- URL: tenone.biz/intra
- 접근: 직원 로그인 전용 (sessionStorage 캐시, auth-context 독립)
- 모듈: ERP, BUMS, Marketing, Studio, Wiki, Agent, Universe(8페이지)
- Universe 대시보드: 회원/구독/교육/예약/매출/게스트/개인정보 실DB 연동

### 2.3 WIO (Enterprise Unified System)
- URL: tenone.biz/wio

**소개 페이지 (마케팅):**
| 페이지 | URL | 상태 |
|--------|-----|------|
| 랜딩 | /wio | ✅ 6트랙, 3대자원, 가격표 |
| Framework | /wio/framework | ✅ 17파트 |
| Solutions | /wio/solutions | ✅ ~110 모듈 카탈로그 |
| Setup | /wio/setup | ✅ 5단계 |
| Evaluation | /wio/evaluation | ✅ |
| CRM | /wio/crm | ✅ 3층 Golden Record |
| Marketing | /wio/marketing | ✅ |
| Data | /wio/data | ✅ CDO Office |
| Pricing | /wio/pricing | ✅ 4단 (Starter~Custom) |
| AI Matrix | /wio/ai-matrix | ✅ 20모듈×6 AI유형 |
| E2E Flows | /wio/e2e-flows | ✅ 4개 흐름도 |
| Presets | /wio/presets | ✅ 업종별 4종 |
| Migration | /wio/migration | ✅ 순차 전환 6단계 |

**Orbi APP (실제 사용):**
| 카테고리 | 모듈 수 | 실DB |
|---------|---------|------|
| Track 6 공통 | 19 | 12 |
| Track 1 운영·관리 | 22 | 15 |
| Track 2 사업 | 28 | 10 |
| Track 3 생산 | 9 | 5 |
| Track 4 지원 | 8 | 1 |
| Track 5 파트너 | 4 | 1 |
| Track 7 시스템 | 14 | 8 |
| 개인 (MY) | 5 | 4 |
| 지주사 (HLD) | 3 | 3 |
| 기타 (설문/투표) | 2 | 0 |
| **합계** | **125** | **56 (45%)** |

**핵심 엔진:**
| 엔진 | 파일 | 상태 |
|------|------|------|
| RBAC | lib/rbac.ts | ✅ 사이드바 미들웨어 적용 |
| 워크플로우 | lib/workflow-engine.ts | ✅ 결재 연동 실작동 |
| Culture Engine | lib/culture-engine.ts | ✅ 시스템 Culture 페이지 연동 |

**설정 페이지:**
| 탭 | 내용 | 상태 |
|---|------|------|
| 세팅 (조직 모드) | OrgTreeBuilder — 조직 트리 CRUD + 인력 배치 | ✅ Supabase |
| 세팅 (모듈 모드) | 레고 블록 팔레트 + 끼워넣기 | ✅ Mock |
| 세팅 (워크플로우 모드) | 노드 플로우 빌더 + 7 결재 템플릿 | ✅ Mock |
| 권한 | 5 역할 템플릿 + 모듈 접근 매트릭스 | ✅ Mock |
| 테마 | 5 프리셋 + 커스텀 컬러 | ✅ |
| 시스템 | 조직정보 + 멤버 관리 | ✅ |

### 2.4 Myverse (개인 앱)
- URL: tenone.biz/myverse/app
- 7탭: ME, LOG, PLAN, DREAM, WORK, AI, VERSE
- 상태: ✅ 전탭 Supabase 연동 (myverse_* 8테이블)

### 2.5 브랜드 사이트

| 브랜드 | URL | 페이지 수 | 고도화 | 게시판 |
|--------|-----|----------|--------|--------|
| MADLeap | /madleap | 6 | ✅ 전면 | 5개 (free/qna/review/recruit/community) |
| MADLeague | /madleague | 11 | ✅ 전면 | 4개 (notice/competition/madzine/gallery) |
| Badak | /badak | 14 | ✅ 전면 | 5개 (industry/free/jobs/mentoring/community) |
| SmarComm | /smarcomm | 46 | ✅ 랜딩+대시보드 | 3개 (cases/blog/faq) |
| HeRo | /hero | 8 | ✅ 홈 | - |
| Planner's | /planners | 1 | ✅ 전면 리라이트 | - |
| RooK | /rook | 7 | ✅ 홈 | 3개 (works/challenge/feedback) |
| Mindle | /mindle | 10 | ✅ 홈 | - |
| ChangeUp | /changeup | 7 | ✅ 홈 | 1개 (community) |
| 0gamja | /0gamja | 5 | ✅ 홈 | - |
| YouInOne | /youinone | 8 | ✅ 홈 | - |
| domo | /domo | 6 | ✅ 홈 | - |
| FWN | /fwn | 5 | ✅ 홈 | - |
| Badak Stars | /badak/stars | 2 | ✅ | - |

---

## 3. 인프라 현황

### 3.1 Supabase DB
- 프로젝트: ziotlxkdctlhiwkgmmsh
- 테이블: 90+ (RLS 전체 적용)
- 주요 그룹: members, posts, board_configs, wio_*, myverse_*, agent_*, guests, subscriptions, bookings, revenue, enrollments

### 3.2 인증
- Supabase Auth (이메일/비밀번호 + 카카오 OAuth)
- 인트라: 독립 인증 (auth-context 비의존, sessionStorage 캐시)
- WIO Orbi: 3모드 (데모/SaaS/마스터)

### 3.3 Agent Hub
- 7 에이전트: Compass, MADLeague, Badak, SmarComm, HeRo, Mindle, WIO
- Claude API 실응답 (ANTHROPIC_API_KEY 설정됨)
- agent_profiles + agent_messages 테이블

### 3.4 외부 연동 (코드 준비, 키 미설정)
- Google Calendar: lib/integrations/google-calendar.ts + API routes
- Kakao: lib/integrations/kakao.ts + API routes
- Slack: lib/integrations/slack.ts + API routes

### 3.5 배포
- Vercel 프로덕션: tenone.biz
- 도메인: youinone.com (alias)
- 빌드: Next.js 16 Turbopack, ~500 페이지 정적 생성

---

## 4. 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| CLAUDE.md | 프로젝트 루트 | 프로젝트 가이드 + UOS + 동기화 규칙 |
| WIO EUS v2.0 | docs/WIO_EUS_v2.md | WIO 통합 기획서 (1,514줄, 27챕터) |
| 조직도 설계 | docs/WIO_OrgDesign_v1.md | 조직도 + 인력 배치 상세 설계 |
| Universe OS | docs/Universe_OS_Plan.md | AI 에이전트 시스템 계획 |
| 게시판 가이드 | docs/WIO_Board_Guide.md | WIO 게시판 모듈 가이드 |
| WORK_STATUS.md | 프로젝트 루트 | 작업 현황 (최신: 3/30) |
| CHANGELOG.md | 프로젝트 루트 | 변경 이력 |
| ROADMAP.md | 프로젝트 루트 | 로드맵 |

---

## 5. 완성도 요약

```
페이지 UI        ████████████████████ 100%  (499페이지)
WIO 모듈 UI      ████████████████████ 100%  (125페이지)
실DB 연동         █████████░░░░░░░░░░░  45%  (56/125 Orbi)
핵심 엔진         ████████████████████ 100%  (RBAC+워크플로우+Culture)
브랜드 고도화     ████████████████████ 100%  (15개 브랜드)
인증              ████████████████░░░░  80%  (인트라 해결, 크로스탭 이슈 잔존)
Agent             ████████████████████ 100%  (7개 에이전트 실응답)
SEO               ████████████████████ 100%  (메타데이터 + sitemap)
모바일            ████████████████░░░░  80%  (주요 페이지 수정 완료)
외부 API          ████░░░░░░░░░░░░░░░░  20%  (코드 준비, 키 미설정)
```

---

## 6. 남은 작업

| # | 작업 | 우선순위 |
|---|------|---------|
| 1 | 나머지 69개 모듈 실DB 연동 | 🟡 |
| 2 | 외부 API 키 설정 (고객 도입 시) | 🟢 |
| 3 | 바당쇠 KakaoTalk 봇 | 🟢 |
| 4 | 모바일 앱 (Myverse React Native) | 🟢 |
| 5 | B2B SaaS 얼리어답터 모집 | 🟢 |
| 6 | 성능 최적화 (이미지 WebP, 번들) | 🟢 |

---

*Generated: 2026-03-30*
*TenOne Universe — Powered by Claude Code*

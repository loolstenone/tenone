# Ten:One Universe — 개발 현황 리포트

> 날짜: 2026-03-30
> 총 코드: 156,269줄 (TSX/TS)
> 총 페이지: 383개 | DB 테이블: 142개 | API: 58개 | 컴포넌트: 75개

---

## 1. 전체 요약

| 지표 | 수치 |
|------|------|
| 브랜드 사이트 | 26개 |
| 전체 페이지 | 383개 |
| API 엔드포인트 | 58개 |
| Supabase 테이블 | 142개 |
| 타입 정의 파일 | 21개 |
| 컴포넌트 | 75개 |
| Lib 모듈 | 49개 (root 30 + supabase 19) |
| 문서 | 25개 |

---

## 2. 브랜드별 개발 현황

### Tier 1 — 풀 시스템 (Supabase 실연동)

| 브랜드 | 페이지 | DB 테이블 | Supabase | 상태 |
|--------|--------|-----------|----------|------|
| **WIO (Orbi)** | 141 | 90+ | O | 서비스 계층 도입, 120+ 모듈, RBAC/워크플로우/Culture 엔진 |
| **MyVerse** | 14 | 8 | O | 7탭 앱 (AI/Dream/Log/Plan/Verse/Work), 개인 블랙박스 |

### Tier 2 — 대규모 사이트 (Mock 기반)

| 브랜드 | 페이지 | 레이아웃 | 상태 |
|--------|--------|----------|------|
| **SmarComm** | 46 | O | 대시보드/캠페인/리드/분석/스캔 + 16개 lib 모듈 |
| **TenOne 포탈** | 14 | O | 퍼블릭(Works/Newsroom/About/Universe) + 인트라 |
| **Badak** | 14 | O | 커뮤니티/탐색/모임 + DB 4테이블 |
| **MADLeague** | 11 | O | 홈/소개/프로그램/경쟁PT + 헤더/푸터 |
| **TrendHunter** | 11 | O | 크롤러/트렌드분석 + DB 9테이블 |
| **Mindle** | 10 | O | AI 콘텐츠 큐레이션 |

### Tier 3 — 중규모 사이트

| 브랜드 | 페이지 | 상태 |
|--------|--------|------|
| **HeRo** | 8 | HIT 통합검사 + 이력서 + 커리어 매칭 |
| **YouInOne** | 8 | 프로젝트 그룹 + 시수 관리 |
| **ChangeUp** | 7 | 창업 교육 프로그램 |
| **RooK** | 7 | AI 크리에이터 플랫폼 |
| **Seoul/360** | 6 | 서울 지하철 관광 가이드 |
| **MADLeap** | 6 | 대학생 포트폴리오/스터디 |
| **Domo** | 6 | 시니어 비즈맨 네트워킹 |
| **0gamja** | 5 | AI 콘텐츠 플랫폼 |
| **FWN** | 4 | 패션 브랜드 |

### Tier 4 — 소규모/랜딩

| 브랜드 | 페이지 | 상태 |
|--------|--------|------|
| Jakka | 3 | 작가 플랫폼 |
| MoNTZ | 2 | 포토그래피 |
| Planners | 1 | Vrief/GPR 기반 기획 |
| EvoSchool | 1 | 교육 플랫폼 |
| BrandGravity | 1 | 브랜딩 컨설팅 |
| NamingFactory | 1 | 네이밍 서비스 |
| NatureBox | 1 | 자연함 브랜드 |
| Mullaesian | 1 | 문래동 브랜드 |
| Townity | 1 | 커뮤니티 |

---

## 3. WIO (Orbi) 상세 현황

### 서비스 계층 (Glossary v1 기준)

| 서비스 | 모듈 수 | DB 연동 | 상태 |
|--------|---------|---------|------|
| Talk | 11 | 부분(게시판) | 메신저/캘린더/문서/알림/위키/설문/투표 |
| Project | 1 | O | 프로젝트 CRUD + 타임라인 피드 |
| Task | 1 | O | 업무관리 (wio_jobs) |
| Approval | 1 | O | 전자결재 |
| Workflow | 1 | 부분 | 비주얼 빌더 |
| People | 7 | 부분 | 인재/채용/근태/조직/교육/인정/피드백 |
| Goal | 7 | 부분 | 경영기획/KPI/GPR/평가/보상/인센티브 |
| Finance | 12 | 부분 | 재무/원장/매입/매출/예산/세무/자산/급여 |
| Timesheet | 1 | O | 시수 기록 (wio_timesheets) |
| Marketing | 18 | 1/18 | campaign만 실DB, 나머지 Mock |
| CRM | 13 | X | 전체 Mock |
| AI | 1 | O | Agent Hub 실연결 (Claude API) |
| 생산 | 9 | X | Mock |
| 지원 | 15 | X | Mock |
| 파트너 | 4 | X | Mock |
| 시스템 | 13 | 부분 | 사용자 CRUD 실DB |

### 핵심 엔진

| 엔진 | 파일 | 상태 |
|------|------|------|
| RBAC | lib/rbac.ts | 실작동 (6단계 권한) |
| Workflow Engine | lib/workflow-engine.ts | 실작동 |
| Culture Engine | lib/culture-engine.ts | 실작동 |
| Agent Hub | lib/agent/claude.ts | 실작동 (Claude API) |
| Rule Engine | - | 설계 완료, 구현 대기 |
| Event Bus | - | 설계 완료, 구현 대기 |

---

## 4. 인프라 현황

### Supabase

| 항목 | 수치 |
|------|------|
| SQL 마이그레이션 파일 | 21개 |
| 총 테이블 | 142개 |
| WIO 전용 테이블 | 90+ |
| 브랜드 전용 테이블 | Badak 4, TrendHunter 9, MyVerse 8, HeRo 3 |
| 게시판 테이블 | 6개 (posts, comments, likes, bookmarks, files, board_configs) |
| 마케팅 테이블 | 4개 (campaigns, leads, content, stats) |
| 에이전트 테이블 | 2개 (agent_profiles, agent_messages) |

### API 라우트

| 모듈 | 엔드포인트 |
|------|-----------|
| Board 시스템 | 9개 (게시판 CRUD + 업로드 + 좋아요/북마크) |
| Agent 시스템 | 5개 (hub/messages/profiles) |
| 외부 연동 | 6개 (Google Calendar, Slack, Kakao) |
| 마케팅 | campaigns, leads, content |
| 경연/네트워킹/수료증 | 각 3~4개 |
| 기타 | points, approvals, members, projects 등 |

### 외부 연동

| 서비스 | 파일 | 상태 |
|--------|------|------|
| Google Calendar | lib/integrations/google-calendar.ts | 구현 완료 |
| Slack | lib/integrations/slack.ts | 구현 완료 |
| Kakao | lib/integrations/kakao.ts | 구현 완료 |
| Claude AI | lib/agent/claude.ts | 실작동 |

---

## 5. 컴포넌트 현황

| 분류 | 수량 |
|------|------|
| 브랜드 헤더/푸터 | 26쌍 |
| 게시판 컴포넌트 | 9개 (BoardPage, PostEditor, PostDetail, PostCard 등) |
| SmarComm 전용 | 15개 |
| 워크플로우 | 6개 |
| 앱 셸/네비게이션 | 6개 (IntraHeader, IntraSidebar, MarketingSidebar 등) |
| 공통 UI | 13개 (BrandCard, LoginModal, Logo 등) |

---

## 6. 오늘 작업 (2026-03-30 사무실)

| 작업 | 상태 |
|------|------|
| COM-AI → Agent Hub 실연결 | 완료 |
| WIO Glossary v1 → 7계층 정렬 (사이드바 + 설정) | 완료 |
| SYS-USR 사용자 관리 실DB | 완료 |
| 프로젝트 타임라인 피드 | 완료 |
| COM-WCL 업무 캘린더 실DB | 완료 |
| MY-HR 내 인사 실DB | 완료 |
| 마케팅 campaign 실DB | 완료 |

### 변경 파일 요약
- `types/wio.ts` — WIO_SERVICES 타입 추가
- `lib/wio-modules.ts` — SERVICE_CATALOG 16개, 모듈별 service 필드
- `app/(WIO)/wio/app/layout.tsx` — 사이드바 서비스 기반 재구성
- `app/(WIO)/wio/app/settings/page.tsx` — 서비스 모드 탭 추가
- `app/(WIO)/wio/app/comm/ai/page.tsx` — Agent Hub 실연결
- `app/(WIO)/wio/app/system/users/page.tsx` — wio_members CRUD
- `app/(WIO)/wio/app/project/[id]/page.tsx` — 타임라인 피드 탭
- `app/(WIO)/wio/app/comm/work-calendar/page.tsx` — wio_jobs 실DB
- `app/(WIO)/wio/app/my/hr/page.tsx` — wio_members 프로필 연동
- `app/(WIO)/wio/app/marketing/campaign/page.tsx` — fetchCampaigns 연결
- `docs/WIO_Glossary_v1.md` — 용어 사전

---

## 7. 다음 우선순위

### 즉시
1. 마케팅/CRM DB 테이블 생성 + 나머지 모듈 실DB
2. 설정 서비스/모듈 → Supabase 저장 (localStorage → DB)

### 단기
3. 화상회의 딥링크 (Zoom/Meet)
4. 외부 게스트 초대 플로우
5. AI 프로젝트 설계 (자동 기획서)

### 중기
6. Myverse ↔ Orbi 통합 인증
7. 브랜드 사이트 Supabase 연동 확대
8. Rule Engine + Event Bus 구현
9. SmarComm 독립 배포 (Vercel + Supabase)

---

*Ten:One Universe Development Status Report v1.0*
*Generated: 2026-03-30 by Claude Code*

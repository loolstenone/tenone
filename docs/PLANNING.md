# Ten:One™ 플랫폼 기획 문서

> 최종 업데이트: 2026-03-21
> 버전: MVP Phase A (프론트엔드 Mock 데이터 기반)

---

## 1. 프로젝트 개요

### 1-1. 서비스명
**Ten:One™** — 멀티 브랜드 생태계를 위한 통합 비즈니스 플랫폼

### 1-2. 기술 스택
| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + React 19 |
| 언어 | TypeScript (strict mode) |
| 스타일링 | Tailwind CSS v4 + PostCSS |
| 아이콘 | Lucide-React |
| 배포 | Google Cloud Run (Standalone) |
| 데이터 | Mock 데이터 (Context + localStorage) |

### 1-3. 핵심 목표
1. 퍼블릭 포털: 브랜드 쇼케이스 + 뉴스룸 + 뉴스레터 + Crew 모집
2. 인트라 오피스: 9개 모듈 통합 업무 플랫폼
3. 역할 기반 접근 제어: 5단계 People 유형별 권한

---

## 2. People 시스템 (사용자 유형)

### 2-1. 계정 유형 (AccountType)

| 유형 | 설명 | Intra 접근 | 가입 경로 |
|------|------|-----------|----------|
| **Staff** | 정직원 | 전체 | ERP 등록 |
| **Partner** | 외부 파트너 | 제한적 | 초대 |
| **Junior Partner** | 주니어 파트너 | 더 제한적 | 초대 |
| **Crew** | MADLeague/YouInOne 멤버 | 최소 | Crew 초대 (/CrewInvite → /invite) |
| **Member** | 일반 가입자 | 불가 (퍼블릭만) | 회원가입 (/signup) |

### 2-2. 모듈 접근 매트릭스

| 모듈 | Staff | Partner | Jr.Partner | Crew | Member |
|------|-------|---------|------------|------|--------|
| Myverse (Full) | ✅ | — | — | — | — |
| Myverse (Basic) | — | ✅ | ✅ | ✅ | — |
| Townity (Full) | ✅ | — | — | — | — |
| Townity (Basic) | — | ✅ | ✅ | — | — |
| Project | ✅ | ✅ | ✅ | ✅ | — |
| HeRo | ✅ | ✅ | ✅ | ✅ | — |
| Evolution School | ✅ | ✅ | ✅ | ✅ | — |
| Wiki (Full) | ✅ | — | — | — | — |
| Wiki (Basic) | — | ✅ | ✅ | ✅ | — |
| ERP | ✅ | — | — | — | — |
| CMS | ✅ | — | — | — | — |

### 2-3. 시스템 권한 (SystemAccess) — Staff 세부 제어
- `project`: 프로젝트 관리, 스튜디오, 워크플로우
- `erp-hr`: 인력관리, 목표/성과, 근태, 급여
- `erp-finance`: 경비, 법인카드, 청구/지급
- `erp-admin`: 시스템 설정, 권한 관리
- `marketing`: 캠페인, 리드, 딜, 콘텐츠 마케팅
- `wiki`: 사내 위키 편집

---

## 3. Information Architecture (IA)

### 3-1. 전체 구조

```
tenone.biz
│
├── 퍼블릭 (Public)
│   ├── / .......................... 메인 페이지
│   ├── /works .................... 포트폴리오
│   │   └── /works/[id]
│   ├── /contact .................. 문의
│   ├── /newsroom ................. 뉴스룸
│   │   └── /newsroom/[id]
│   ├── /newsletter ............... 뉴스레터 구독 (비회원 가능)
│   ├── /about .................... 회사 소개
│   ├── /brands ................... 브랜드 쇼케이스
│   ├── /universe ................. Universe 시각화
│   ├── /history .................. 연혁
│   ├── /profile .................. 내 프로필 (로그인 필수)
│   ├── /login .................... 로그인
│   ├── /signup ................... 회원가입 (Member)
│   ├── /CrewInvite ............... Crew 지원
│   └── /invite ................... 초대 기반 가입 (이메일 인증)
│
└── 인트라 (Intra) — /intra
    ├── 1. Myverse ................ 개인 포털
    ├── 2. Townity ................ 사내 커뮤니케이션
    ├── 3. Project ................ 프로젝트 관리
    ├── 4. HeRo ................... 인재·커리어 개발
    ├── 5. Evolution School ....... 교육
    ├── 6. SmarComm. .............. 스튜디오 + 마케팅
    ├── 7. Wiki ................... 지식 베이스
    ├── 8. ERP .................... 전사 자원 관리
    └── 9. CMS .................... 콘텐츠 관리
```

### 3-2. 모듈별 상세 IA

#### ① Myverse `/intra/myverse`
```
Myverse
├── Dashboard .................. 종합 대시보드 (Staff/Crew 분기)
├── 메신저 ..................... 1:1 · 그룹 · 브로드캐스트
├── Todo ....................... 일반/프로젝트/기타 통합
├── 타임시트 입력 .............. 주간 그리드 (월~일), 마감→PM 승인
├── 결재 ...................... [Staff] 결재라인 스텝퍼, 요인별 분류
├── GPR ....................... [Staff] 개인 GPR 현황
├── 근태 ...................... [Staff] 출퇴근, 잔여 연차
├── 급여 ...................... [Staff] 급여 명세
├── 경비 ...................... [Staff] 경비 처리 내역
└── Library ................... 개인 자료 + 위키 즐겨찾기
```

#### ② Townity `/intra/comm`
```
Townity
├── 공지사항
├── 자유게시판
└── 전체 일정
```

#### ③ Project `/intra/project`
```
Project
├── 프로젝트 관리
│   ├── 프로젝트 목록/등록
│   ├── [code] 상세 (개요 · Job 관리 · 손익 · 인력 · 파일)
│   ├── 신규 등록
│   ├── 입찰관리
│   └── 협력사
├── Job 관리 .................. 코드 체계: PRJ-YYYY-NNNN-{Type}-{Detail}{Seq}
└── 타임시트 .................. 프로젝트별 집계 뷰
```

#### ④ HeRo `/intra/hero`
```
HeRo
├── HIT 검사 .................. 인재 역량 평가
│   └── 리포트
├── 이력서 .................... 이력서 관리
│   └── 컨설팅
├── 커리어 개발
│   ├── 로드맵
│   └── 멘토 매칭
└── 퍼스널 브랜딩
```

#### ⑤ Evolution School `/intra/evolution-school`
```
Evolution School
└── 전체 과정 ................. 20개 코스 (필수 7 · 전문 7 · 심화 6)
    └── 퀴즈 시스템 (10문항, 80점 이상 이수)
```

#### ⑥ SmarComm. `/intra/studio`
```
SmarComm.
├── STUDIO
│   ├── Workflow
│   │   ├── Pipeline
│   │   ├── Kanban
│   │   └── Automation
│   ├── Schedule
│   ├── Assets
│   ├── Brands
│   │   └── [id]
│   └── Universe
│
└── MARKETING
    ├── Campaigns
    ├── Leads
    ├── Deals
    ├── Activities
    ├── Contacts
    └── Analytics
```

#### ⑦ Wiki `/intra/wiki`
```
Wiki
├── 문화 · 안내
│   ├── Culture ................ 비전, Principle 10
│   ├── Onboarding ............. 온보딩 체크리스트
│   ├── Handbook ............... 근무/휴가/경비/보안 정책
│   └── FAQ .................... FAQ + 업무 가이드 통합 (카테고리 필터)
│
└── 지식 공유
    └── Library ................ 통합 지식 관리
        (전략·기획 / 템플릿·양식 / 레퍼런스·벤치마크 /
         브랜드·디자인 / 마케팅·콘텐츠 / 커뮤니티·교육 /
         인사·재무 / 기술·도구 / 계약·법무 / 기타)
```

#### ⑧ ERP `/intra/erp`
```
ERP
├── 전자결재
│   ├── 결재함
│   │   ├── 결재 대기
│   │   ├── 결재 진행
│   │   └── 결재 완료
│   └── 기안하기
│       ├── 기안 (기안 유형)
│       ├── 품의
│       └── 보고
│
├── GPR
│   ├── 전사 현황
│   ├── 목표 캐스케이드
│   ├── 평가
│   └── 인센티브
│
├── HR
│   ├── People
│   │   ├── 전체 구성원
│   │   ├── 직원 관리
│   │   │   ├── 목록
│   │   │   ├── [id] 상세
│   │   │   └── 등록
│   │   ├── 조직도
│   │   ├── MADLeague 동아리
│   │   └── 권한위임
│   ├── 근태관리
│   ├── 급여관리
│   ├── 교육관리
│   ├── 제증명서
│   ├── 가족관리
│   └── 인재관리
│       ├── Talent Pool
│       ├── Pipeline
│       └── Programs
│
├── PROJECT
│   ├── 프로젝트 손익
│   ├── 입찰관리
│   ├── 협력사
│   └── 투입인원단가
│
├── 경영관리
│   ├── 경영 계획 (연간/부문별)
│   ├── 경영 관리 (월별추정/실적확정/Gap분석)
│   └── 경영 분석 (손익현황/부문별이익률/프로젝트수익성/비용분석)
│
├── FINANCE
│   ├── 경비관리 (경비처리/경비품의서)
│   ├── 법인카드
│   ├── 경리리포트
│   └── 청구/지급 (청구관리/지급관리)
│
└── 운영설정
    ├── 결재라인 설정 (기안 유형 × 요인별)
    ├── 권한 설정
    ├── HR 설정 (직급직책/부서/근무형태)
    └── Finance 설정 (계정과목/예산/결산)
```

#### ⑨ CMS `/intra/cms`
```
CMS
├── 콘텐츠 관리 ............... Works/Newsroom 발행
├── 뉴스레터 관리 ............. 발송 · 구독자 관리 (회원/비회원 구분)
├── 전체 일정 관리 ............ 공개 일정 → 퍼블릭 노출
└── 라이브러리 관리 ........... CMS 자료 · 권한 설정
```

---

## 4. 핵심 기능 명세

### 4-1. 프로젝트 · Job 체계

**프로젝트 코드**: `PRJ-YYYY-NNNN`
**Job 코드**: `PRJ-YYYY-NNNN-{Type}-{Detail}{Seq}`

| Job Type | 코드 | 설명 |
|----------|------|------|
| 제작 | PR | Production |
| Media | ME | 미디어 |
| PT | PT | 프레젠테이션 |

| Job Detail | 코드 | 설명 |
|------------|------|------|
| 기획 | PL | Planning |
| 실행 | DO | Do/Execute |
| Report | RE | 보고서 |

**P&L 구조**: Billing → Ex-Cost = Revenue → In-Cost = Profit

### 4-2. 결재 워크플로우

**기안 유형**: 기안 / 품의 / 보고
**결재 요인**: 일반 / 프로젝트 / 타임시트 / 경비 / 구매 / 인사 / 계약
**결재 상태**: 대기 → 진행중 → 완료 | 반려
**결재라인**: 기안자 → 관리자 → 최종 결정자 (요인별 자동 라우팅)

### 4-3. GPR (Goal · Plan · Result)

**3단계 레벨**:
- GPR I: 기업/사업부 (Yearly/Quarterly)
- GPR II: 팀 (Monthly/Weekly)
- GPR III: 개인/프로젝트 (Weekly/수시)

**3차원 평가**: What(결과) + How(과정) + Attitude(태도)

### 4-4. 타임시트

**Myverse 입력**: 주간 그리드 (월~일), 공휴일/휴가 표시
**마감 워크플로우**: 작성 중 → 마감 신청 → PM 승인 (수정 잠금)
**Project 집계**: PM 뷰, 프로젝트별/Job별 시수 합산

### 4-5. Library 시스템

**3개 Library**: Myverse(개인) / Wiki(지식관리) / CMS(콘텐츠)
**공통 카테고리** (10개):
전략·기획 / 템플릿·양식 / 레퍼런스·벤치마크 / 브랜드·디자인 / 마케팅·콘텐츠 / 커뮤니티·교육 / 인사·재무 / 기술·도구 / 계약·법무 / 기타

**보기 권한**: 전체 / Staff Only / Partner 이상 / Admin Only
**즐겨찾기**: Wiki 자료를 Myverse Library에서 바로 확인

### 4-6. 뉴스레터 구독

| 경로 | 대상 | 방식 |
|------|------|------|
| 메인 페이지 (`/`) | 비회원 | 이메일 + 개인정보 동의 |
| 뉴스레터 페이지 (`/newsletter`) | 비회원 | 이름(선택) + 이메일 + 동의 |
| 뉴스레터 페이지 | 로그인 회원 | 원클릭 구독 |
| 회원가입 (`/signup`) | 신규 가입자 | 체크박스 (기본 ON) |
| 프로필 (`/profile`) | 회원 | 구독 상태 표시 / 신청·해지 |
| CMS 관리 | 관리자 | 회원/비회원 구분 필터 + 검색 |

### 4-7. 프로필 보안

- 프로필 수정 시 비밀번호 확인 모달 (모든 회원 유형 공통)
- 비밀번호 입력 → 검증 성공 → 저장

---

## 5. 데이터 아키텍처

### 5-1. 타입 정의 파일 (15개)

| 파일 | 주요 인터페이스 |
|------|----------------|
| auth.ts | User, AccountType, SystemAccess, IntraModule |
| project.ts | Project, Job, TimesheetEntry, ProjectFinancials, ProjectFile |
| people.ts | Person, MadLeagueClub, PeopleCategory |
| staff.ts | StaffMember, Division, StaffRole |
| marketing.ts | Campaign, Lead, ContentPost |
| crm.ts | Person, Organization, Deal, Activity |
| gpr.ts | GprGoal, GoalLevel, EvaluationRating |
| library.ts | LibraryItem, LibraryBookmark, LibraryCategory |
| workflow.ts | WorkflowTask, PipelineItem, AutomationRule |
| brand.ts | Brand, BrandCategory, HistoryEvent |
| asset.ts | Asset, AssetType |
| cms.ts | CmsPost, CmsChannel, CmsStatus |
| contact.ts | Contact, ContactRole |
| event.ts | UniverseEvent, EventType |
| universe.ts | UniverseNode, UniverseLink, UniverseTimelineItem |

### 5-2. Context Provider (8개)

| Context | 역할 |
|---------|------|
| AuthProvider | 인증, 권한, 로그인/로그아웃 |
| LibraryProvider | Library CRUD, 즐겨찾기 |
| MarketingProvider | 캠페인, 리드, 콘텐츠 |
| CrmProvider | 연락처, 조직, 딜, 활동 |
| StaffProvider | 직원 관리 |
| GprProvider | GPR 목표/평가 |
| WorkflowProvider | 태스크, 파이프라인, 자동화 |
| CmsProvider | 콘텐츠 발행 |

### 5-3. Mock 데이터 규모

| 데이터 | 건수 |
|--------|------|
| 직원 (Staff) | 50명 (4개 부문, 12개 부서) |
| People | 32명 (staff + crew + general) |
| MADLeague 동아리 | 7개 (MADLeap, PAM, ADlle, ABC, SUZAK, LAP, BLING) |
| 프로젝트 | 9개 (5 active + 4 completed) |
| Wiki Library | 27개 아이템 |
| CMS Library | 3개 |
| Myverse Library | 3개 |
| Evolution School 코스 | 20개 (필수 7 + 전문 7 + 심화 6) |
| 뉴스레터 구독자 | 11명 (회원 5 + 비회원 6) |

---

## 6. 컴포넌트 구조

### 6-1. 레이아웃 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| PublicHeader / PublicFooter | 퍼블릭 페이지 공통 |
| IntraSidebar | 인트라 좌측 네비게이션 (240px, 9개 모듈) |
| IntraHeader | 인트라 상단 바 (즐겨찾기, 프로필) |
| AppShell | 기본 레이아웃 셸 |

### 6-2. 도메인 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| BrandCard | 브랜드 카드 뷰 |
| ContactImportModal | Excel/CSV 연락처 임포트 |
| RelationshipMap | 브랜드 관계 시각화 |
| TimelineView | 타임라인 뷰 |
| KanbanBoard | 칸반 보드 |
| TaskCard / TaskModal | 태스크 카드/모달 |
| AutomationBuilder / AutomationCard | 자동화 규칙 |
| PersonModal | CRM 연락처 모달 |

---

## 7. 전체 페이지 수

| 영역 | 페이지 수 |
|------|----------|
| 퍼블릭 | 14 |
| 인증 | 3 |
| Myverse | 10 |
| Townity | 3 |
| Project | 9 |
| HeRo | 8 |
| Evolution School | 1 |
| SmarComm. (Studio) | 13 |
| Marketing | 14 |
| Wiki | 6 |
| ERP | 46 |
| CMS | 4 |
| **총 페이지** | **~131** |

---

## 8. 디자인 시스템

### 8-1. 색상
- 모노톤 Neutral 기반 (bg-white, neutral-50~900)
- 상태 색상: green(완료), blue(진행), amber(대기), red(반려/에러)
- 요인별 색상: violet(프로젝트), blue(타임시트), amber(경비), green(구매), pink(인사), slate(계약)

### 8-2. 타이포
- h1: text-xl font-bold
- 서브텍스트: text-xs text-neutral-400
- 본문: text-sm
- 뱃지/캡션: text-[10px]~text-xs

### 8-3. 컴포넌트 패턴
- 카드: `border border-neutral-200 bg-white p-4`
- 버튼: `px-4 py-2 text-sm bg-neutral-900 text-white rounded`
- 입력: `border border-neutral-200 px-3 py-2 text-sm rounded`
- 뱃지: `px-1.5 py-0.5 text-xs rounded`
- 모달: `fixed inset-0 bg-black/30 + bg-white rounded max-w-md p-5`

---

## 9. 향후 로드맵

### Phase B: 백엔드 연동
- [ ] API 서버 구축 (NestJS or Next.js API Routes)
- [ ] PostgreSQL + Prisma ORM
- [ ] 실제 인증 (NextAuth.js + OAuth)
- [ ] 파일 업로드 (GCS)

### Phase C: 고도화
- [ ] 실시간 메신저 (WebSocket)
- [ ] 이메일 발송 (SendGrid/Resend)
- [ ] 대시보드 차트 (Recharts)
- [ ] 모바일 반응형
- [ ] PWA 지원

---

*이 문서는 현재 구축된 MVP Phase A 기준으로 작성되었으며, 실제 백엔드 연동 시 업데이트됩니다.*

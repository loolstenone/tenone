# WIO 사이트 개발 가이드

> 이 문서는 TenOne/WIO 사이트 개발의 마스터 가이드다.
> 전체 그림, 실행 순서, 참조 문서, 의사결정 기준이 모두 여기에 있다.
> Claude Code는 이 문서를 먼저 읽고 개발을 시작한다.

---

## 0. 한 줄 요약

**프로젝트 중심으로 사람·일·돈·지식이 하나의 DB에서 돌아가는 통합 운영 플랫폼을 만든다.**
GPR로 목표를 관리하고, Vrief로 기획하고, 프로젝트가 끝나면 정산·포인트·아카이브가 동시에 자동 업데이트된다.

---

## 1. 프로젝트 전체 구조

### 1.1 이 사이트가 하는 일

```
TenOne 내부 운영 (자사 사용)
  + WIO라는 브랜드로 외부 판매 (SaaS + 화이트라벨 + 컨설팅)
  = 하나의 코드베이스, 멀티 테넌트
```

### 1.2 기술 스택

| 기술 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | SSR/SSG, 풀스택 |
| UI | React 19 + TypeScript (strict) | 타입 안전 |
| 스타일 | Tailwind CSS v4 | 빠른 개발 |
| 아이콘 | Lucide React | 일관성 |
| DB + Auth + Storage | Supabase | PostgreSQL + RLS + 실시간 |
| 호스팅 | Google Cloud Run | 컨테이너 기반, 자동 스케일 |
| AI | Claude API | 콘텐츠 생성, 크롤링 분석 |
| 결제 | 포트원 (Phase 3) | 국내 PG 통합 |

### 1.3 참조 문서 위치

```
docs/
├── 01_SYSTEM_ARCHITECTURE_v3.md  — DB 스키마, 모듈 스펙, 라우팅
├── 02_FULL_AUDIT_PROMPT.md       — 종합 감사 프롬프트 (현황 파악용)
├── 03_POST_AUDIT_PROCESS.md      — 감사→분석→평가→계획→실행→검증 순환
├── 04_DEV_METHODOLOGY.md         — Claude Code 사용법, 프롬프트 작성법, Git 전략
├── 05_MODULE_BLUEPRINT.md        — GPR×Vrief×모듈 연결 설계
├── 06_SERVICE_PLAN.md            — (구버전, 07로 대체)
├── 07_WIO_SERVICE_PLAN.md        — WIO 외부 판매 전략, 상품 구조, 요금
├── CONVENTIONS.md                — 코딩 컨벤션 (매 세션 시작 시 읽기)
├── CURRENT_STATUS.md             — 현재 개발 상태 (매 스프린트 갱신)
├── AUDIT.md                      — 종합 감사 결과 (감사 실행 후 생성)
└── CHANGELOG.md                  — 변경 이력
```

---

## 2. 모듈 구조

### 2.1 자사 모듈명 ↔ WIO 외부명

| 라우팅 (코드) | 표시명 | 역할 |
|--------------|--------|------|
| **/home** | Home | 개인 대시보드, Todo, 알림, GPR, 타임시트 |
| **/project** | Project | 프로젝트 관리, Job, 크루, 손익 |
| **/talk** | Talk | 커뮤니티, 공지, 일정, 게시판 |
| **/auth** | Auth | 회원 관리, 권한 제어 |
| **/people** | People | 인재 DB, 포인트, 역량, 매칭 |
| **/finance** | Finance | 정산, 결재, 경비, 수익분배 |
| **/sales** | Sales | 영업, AI 크롤링, 리드, 캠페인 |
| **/learn** | Learn | LMS, 교육, 퀴즈 |
| **/content** | Content | 콘텐츠, AI 생성, 뉴스레터 |
| **/wiki** | Wiki | 지식관리, 아카이브 |
| **/shop** (신규) | Shop | 상품 판매, 결제 |
| **/insight** (신규) | Insight | 경영 대시보드, 분석 |
| **/partner** | Partner | 외부 프리랜서/협력사 |

**규칙**: 라우팅과 표시명은 WIO 외부 판매명에서 "WIO"를 뺀 이름으로 통일. 자사 사용이든 외부 판매든 같은 경로.

### 2.2 모듈 라우팅 구조

```
app/
├── (public)/                    # 퍼블릭 사이트
│   ├── page.tsx                 # 홈
│   ├── about/                   # Ten:One 소개
│   ├── brands/                  # 브랜드별 페이지 (11개+)
│   ├── portfolio/               # 포트폴리오
│   ├── contact/                 # 문의
│   ├── wio/                     # WIO 상품 페이지 (외부 판매)
│   └── blog/                    # 블로그
│
├── intra/                       # 인트라 오피스 (로그인 필요)
│   ├── home/                    # Home — 개인 포털
│   │   ├── dashboard/
│   │   ├── messenger/
│   │   ├── todo/
│   │   ├── timesheet/
│   │   ├── approval/
│   │   ├── gpr/
│   │   └── notifications/
│   ├── talk/                    # Talk — 커뮤니티
│   │   ├── notice/
│   │   ├── free/
│   │   ├── calendar/
│   │   ├── qna/
│   │   └── groups/
│   ├── project/                 # Project — 프로젝트 관리
│   │   ├── list/
│   │   ├── [id]/
│   │   ├── new/
│   │   └── partners/
│   ├── people/                  # People — 인재 관리
│   │   ├── hit/
│   │   ├── resume/
│   │   ├── career/
│   │   ├── branding/
│   │   ├── search/
│   │   └── points/
│   ├── finance/                 # Finance — 재무/정산
│   │   ├── approval/
│   │   ├── hr/
│   │   ├── accounting/
│   │   ├── project-pnl/
│   │   └── gpr/
│   ├── sales/                   # Sales — 영업/마케팅
│   │   ├── studio/
│   │   ├── marketing/
│   │   ├── leads/
│   │   └── opportunity/
│   ├── learn/                   # Learn — 교육
│   │   ├── courses/
│   │   └── my-learning/
│   ├── content/                 # Content — 콘텐츠 관리
│   │   ├── works/
│   │   ├── newsroom/
│   │   └── newsletter/
│   ├── wiki/                    # Wiki — 지식관리
│   │   ├── culture/
│   │   └── library/
│   ├── shop/                    # Shop — 커머스 (Phase 3)
│   ├── insight/                 # Insight — BI 대시보드
│   └── partner/                 # Partner — 외부 협력사
│
├── api/                         # API Routes
│   ├── auth/
│   ├── members/
│   ├── projects/
│   ├── posts/
│   ├── opportunities/
│   ├── points/
│   ├── gpr/
│   ├── contents/
│   ├── ai/
│   └── admin/
│
└── admin/                       # 슈퍼 어드민 (Phase 3, 멀티테넌트)
```

---

## 3. 개발 실행 순서

### 3.1 Phase 1: 기반 (Week 1~8)

**목표**: Mock을 버리고 실제로 작동하는 시스템 만들기.

```
Sprint 1 (Week 1-2): Auth + Members DB
├── Supabase 프로젝트 셋업
├── 인증 (회원가입/로그인/로그아웃)
├── members 테이블 + RLS
├── 5단계 AccountType 권한 제어
├── 미들웨어 (인증 체크, 권한 체크)
└── 완료 기준: 실제 가입 → 로그인 → 권한별 메뉴 분기

Sprint 2 (Week 3-4): Townity DB 연동
├── posts 테이블 (게시판 통합)
├── 공지사항/자유게시판 CRUD
├── 공개대상 필터링 (visibility + AccountType)
├── 일정 CRUD + 캘린더
└── 완료 기준: 게시글 작성 → 새로고침 → 유지

Sprint 3 (Week 5-6): Project + ERP 코어
├── projects 테이블 + 관련 테이블
├── 프로젝트 등록/수정/목록
├── Job 관리 CRUD
├── 타임시트 DB 연동
├── 전자결재 DB 연동
├── 프로젝트 손익 자동 계산
└── 완료 기준: 프로젝트 생성→Job등록→타임시트→손익 확인

Sprint 4 (Week 7-8): 나머지 모듈 기본 DB
├── HeRo (HIT, 이력서, 커리어) DB 연동
├── SmarComm (Leads, 캠페인) DB 연동
├── Evolution School (과정, 퀴즈, 이수) DB 연동
├── CMS (Works, Newsroom) DB 연동
├── Wiki (Culture, Library) DB 연동
├── 알림 센터 기본 구현
└── 완료 기준: 전 모듈 기본 CRUD가 DB에서 작동

Phase 1 감사: 전체 미니 감사 실행, 점수 측정
```

### 3.2 Phase 2: 연결 (Week 8~16)

**목표**: 모듈을 연결하고, TenOne만의 차별 기능을 만들기.

```
Sprint 5 (Week 9-10): GPR 시스템
├── gpr 테이블 (개인/프로젝트/사업 3계층)
├── 개인 GPR (Myverse)
├── 프로젝트 GPR (Project 상세 탭)
├── 사업 GPR (ERP)
├── GPR 캐스케이드 (개인→프로젝트→사업 연결)
├── GPR 라인스톱 (중간 리뷰)
└── 완료 기준: GPR 설정→진행→리뷰→결과 기록 전체 흐름

Sprint 6 (Week 11-12): 포인트 + HeRo 강화
├── point_logs 테이블
├── 활동별 포인트 자동 부여 로직
├── 등급 산정 (Bronze~Diamond)
├── 인재 검색/매칭 (Project에서 호출)
├── 멘토 매칭
└── 완료 기준: 프로젝트 참여→포인트 축적→등급→검색 가능

Sprint 7 (Week 13-14): Opportunity + AI
├── opportunities 테이블
├── AI 크롤링 엔진 (나라장터, bizinfo, 공모전)
├── AI 관련성 스코어링 (Claude API)
├── Vrief 템플릿 시스템 (프로젝트 시작 시 자동 제공)
├── 기회→프로젝트 1클릭 전환
└── 완료 기준: AI 수집→분석→평가→프로젝트 전환

Sprint 8 (Week 15-16): 트리거 체인 + BI
├── 프로젝트 완료 자동 트리거
│   ├── → ERP 정산 기안 자동 생성
│   ├── → HeRo 포인트 자동 부여
│   ├── → CMS/Wiki 아카이브 자동 등록
│   ├── → BI 데이터 갱신
│   └── → 알림 발송
├── Partner Pool (외부 프리랜서/협력사)
├── BI Dashboard 기본 (전체/사업별/프로젝트별)
└── 완료 기준: 프로젝트 완료 버튼 → 5개 모듈 동시 업데이트

Phase 2 감사: 전체 재감사, Phase 1 대비 점수 변화 측정
```

### 3.3 Phase 3: 확장 (Week 16~24)

```
Sprint 9-10: Commerce + 멀티테넌트
├── WIO Shop (상품, 결제, 주문)
├── PG 연동 (포트원)
├── 멀티 테넌트 구조 (tenant_id + RLS)
├── 테넌트별 모듈 on/off
├── 테넌트별 브랜딩 (로고, 색상, 도메인)
└── 화이트라벨 엔진

Sprint 11-12: AI 강화 + 고도화
├── AI 콘텐츠 생성 (CMS)
├── AI 인재 추천 (HeRo)
├── AI 교육 추천 (Evolution School)
├── GPR/Vrief 템플릿 산업별 커스텀
├── 과금 시스템 (Stripe/토스)
├── 슈퍼 어드민
└── Production 배포

Phase 3 감사: 전체 재감사, 런칭 준비 체크
```

---

## 4. 핵심 데이터 모델

### 4.1 5대 핵심 엔티티

이 5개가 모든 모듈을 관통하는 공유 엔티티다.

```sql
-- 1. Members (사람)
-- 모든 활동의 주체. 모든 모듈에서 참조.
members (
  id, name, email, account_type, origin_site,
  total_points, point_grade, skills[], ...
)

-- 2. Projects (프로젝트)
-- 모든 가치 창출의 단위.
projects (
  id, title, type, status, pm_id → members,
  budget, revenue, started_at, completed_at, ...
)

-- 3. Point Logs (포인트)
-- 모든 활동의 측정.
point_logs (
  id, member_id → members, points, activity_type,
  reference_id, reference_type, ...
)

-- 4. Opportunities (기회)
-- 사업의 입구.
opportunities (
  id, title, source, status, relevance_score,
  converted_project_id → projects, ...
)

-- 5. Contents (콘텐츠)
-- 성과의 출력.
contents (
  id, title, type, brand, status,
  project_id → projects, author_id → members, ...
)
```

### 4.2 모듈별 연결 테이블

```
project_members (member_id, project_id, role, hours, rate)
project_gpr (project_id, goal, plan, result, status, cycle)
personal_gpr (member_id, goal, plan, result, period)
business_gpr (brand, goal, plan, result, period)
mentor_matches (mentor_id, mentee_id, project_id)
partner_settlements (partner_id, project_id, amount, status)
```

상세 스키마: `01_SYSTEM_ARCHITECTURE_v3.md` 참조.

---

## 5. 프로젝트 사이클 — 시스템이 작동하는 순서

이것이 WIO의 핵심. 5단계 사이클의 각 단계에서 어떤 모듈이 무엇을 하는지.

```
1. 발견 (Find)
   └── SmarComm Opportunity: AI 크롤링 → Vrief 분석 → Go/No-Go
   └── DB: opportunities 테이블

2. 조직 (Form)
   └── Project: 프로젝트 생성 + Vrief 템플릿
   └── HeRo: 인재 검색 → 크루 배정
   └── Partner: 외부 프리랜서 배정
   └── Project GPR: Goal/Plan 설정
   └── Myverse: 프로젝트 채팅방 자동 생성
   └── DB: projects + project_members + project_gpr

3. 실행 (Fire)
   └── Project: Job 관리, 타임시트
   └── Myverse: 메신저, Todo, 결재
   └── CMS: AI 콘텐츠 제작
   └── GPR: 중간 리뷰 (라인스톱)
   └── DB: jobs, timesheets, approvals, chat_messages

4. 성과 (Fruit)
   └── Project: 완료 버튼 → 트리거 체인 발동
   └── ERP: 크루/파트너 정산 자동
   └── HeRo: 포인트 자동 부여 + 이력 추가
   └── CMS/Wiki: 성과물 자동 아카이브
   └── GPR: Result 기록
   └── DB: settlements, point_logs, contents, project_gpr

5. 축적 (Feed)
   └── HeRo: 포인트 등급 갱신, 포트폴리오 갱신
   └── BI: 전체 현황 대시보드 자동 갱신
   └── Evolution School: 약점 기반 교육 추천
   └── 개인 GPR: 다음 사이클 Goal 설정
   └── DB: members (points, grade), 집계 쿼리
```

상세 설계: `05_MODULE_BLUEPRINT.md` 참조.

---

## 6. 방법론 시스템 내장

### 6.1 GPR (Goal → Plan → Result)

WIO 시스템에서 GPR이 작동하는 위치:

| 레벨 | 위치 | 주기 | 설정자 |
|------|------|------|--------|
| 조직 GPR | ERP → BI Insight | 연간/분기 | 대표 |
| 사업 GPR | BI Insight (브랜드별) | 분기 | 사업 책임자 |
| 프로젝트 GPR | Project 상세 → GPR 탭 | 프로젝트 기간 | PM |
| 개인 GPR | Myverse → GPR | 분기/월 | 본인 |

캐스케이드: 조직 Goal → 사업 Goal → 프로젝트 Goal → 개인 Goal 연결.
BI에서 조직 Goal 달성률 = 하위 GPR들의 집계.

### 6.2 Vrief (조사분석 → 가설검증 → 전략수립)

시스템에서 Vrief가 활성화되는 시점:

| 시점 | 위치 | 템플릿 |
|------|------|--------|
| 프로젝트 신규 생성 | Project → 새 프로젝트 | Step 1~3 탭 자동 표시 |
| 기회 분석 | SmarComm → Opportunity 상세 | Step 1 (조사분석) 간소화 |
| 콘텐츠 기획 | CMS → 새 콘텐츠 | Step 1~2 간소화 |

Vrief 산출물은 Wiki에 자동 저장 → 조직 지식 축적.

---

## 7. 외부 판매 (WIO) 관련 개발

Phase 3에서 구현할 멀티 테넌트 요구사항:

### 7.1 테넌트별 설정

```typescript
interface TenantConfig {
  id: string;
  name: string;                    // "Agency A"
  slug: string;                    // "agency-a"
  domain?: string;                 // "agency-a.wio.work" or custom
  
  branding: {
    logo: string;
    primaryColor: string;
    serviceName: string;           // "WIO" or "A Studio OS"
    poweredBy: boolean;            // "Powered by WIO" 표시 여부
  };
  
  modules: {
    myverse: boolean;              // 코어 (항상 true)
    project: boolean;              // 코어 (항상 true)
    townity: boolean;              // 코어 (항상 true)
    hero: boolean;
    erp: boolean;
    smarcomm: boolean;
    evolution: boolean;
    cms: boolean;
    wiki: boolean;
    commerce: boolean;
    bi: boolean;
    partner: boolean;
  };
  
  accountTypes: string[];          // 커스텀 권한 타입
  gprTemplates: GPRTemplate[];     // 산업별 GPR 템플릿
  vriefTemplates: VriefTemplate[]; // 용도별 Vrief 템플릿
  pointRules: PointRule[];         // 활동별 포인트 배점
  
  plan: 'starter' | 'growth' | 'pro' | 'enterprise';
  maxMembers: number;
  storageGB: number;
  aiCredits: number;               // 월 AI 사용량
}
```

### 7.2 타겟별 기본 패키지

```
Agency: modules = [코어 + hero + erp + smarcomm + cms + partner + bi]
Campus: modules = [코어 + hero + evolution + cms]
Network: modules = [코어 + hero + commerce + cms + partner]
Business: modules = [코어 + erp + smarcomm + bi + partner]
```

상세: `07_WIO_SERVICE_PLAN.md` 참조.

---

## 8. 개발 규칙 요약

### 8.1 세 가지 황금률

```
1. 한 번에 하나만 시킨다
2. 시키기 전에 맥락을 준다 (CONVENTIONS.md + 현재 상태)
3. 시킨 후에 반드시 검증한다
```

### 8.2 절대 하지 말 것

- Mock 데이터 신규 생성 금지 (기존 것만 점진적 전환)
- any 타입 사용 금지
- console.log 커밋 금지
- 하드코딩된 URL/API 키 금지
- 프론트만 만들고 백엔드 안 붙이기 금지
- 동시에 5개 이상 파일 수정 금지

### 8.3 한 기능 완전체 원칙

```
절대 이렇게 하지 마:
  Sprint 1: 프론트 전체 → Sprint 2: 백엔드 전체

반드시 이렇게:
  Sprint 1: 인증 (프론트+백엔드+DB)
  Sprint 2: Townity (프론트 수정+API+DB)
  Sprint 3: Project (프론트 수정+API+DB)
```

### 8.4 세션 시작 프로토콜

```
Claude Code 새 세션 시작 시 반드시:
1. docs/CONVENTIONS.md 읽기
2. docs/CURRENT_STATUS.md 읽기
3. 오늘 작업할 티켓 확인
```

상세: `04_DEV_METHODOLOGY.md` 참조.

---

## 9. 감사 및 품질 관리

### 9.1 감사 실행 시점

| 시점 | 종류 | 프롬프트 |
|------|------|----------|
| Phase 시작 전 | 전체 감사 | `02_FULL_AUDIT_PROMPT.md` |
| 스프린트 종료 | 미니 감사 | 해당 모듈만 |
| Phase 종료 | 전체 재감사 | `02_FULL_AUDIT_PROMPT.md` |

### 9.2 감사 후 프로세스

```
감사(As-Is) → 분석(Gap) → 평가(Priority) → 계획(Sprint) → 실행(Code) → 검증(Verify)
```

상세: `03_POST_AUDIT_PROCESS.md` 참조.

### 9.3 종료 조건

이 순환은 다음이 모두 충족되면 종료:
1. AUDIT 종합 80점 이상 (전 영역)
2. Critical 항목 0개
3. 핵심 모듈 전체 DB 연동 완료
4. 실제 회원가입/로그인/활동 가능
5. tenone.biz 라이브 배포 완료

---

## 10. 문서 세트 전체 맵

```
┌─────────────────────────────────────────────────┐
│            SITE_DEV_GUIDE (이 문서)              │
│            = 마스터 가이드, 전체 통합             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 01 SYSTEM   │  │ 05 MODULE BLUEPRINT     │  │
│  │ ARCHITECTURE│  │ GPR×Vrief×모듈 연결      │  │
│  │ 기술 설계    │  │ 프로젝트 사이클 매핑      │  │
│  └─────────────┘  └─────────────────────────┘  │
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 02 AUDIT    │  │ 03 POST-AUDIT PROCESS   │  │
│  │ PROMPT      │  │ 감사→분석→실행→검증 순환  │  │
│  │ 현황 측정    │  │                         │  │
│  └─────────────┘  └─────────────────────────┘  │
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 04 DEV      │  │ 07 WIO SERVICE PLAN     │  │
│  │ METHODOLOGY │  │ 외부 판매 전략/상품/가격  │  │
│  │ Claude Code │  │ + WIO Method 방법론 라인업│  │
│  └─────────────┘  └─────────────────────────┘  │
│                                                 │
│  + CONVENTIONS.md (코딩 규칙)                    │
│  + CURRENT_STATUS.md (현재 상태)                 │
│  + SPRINT_N_PLAN.md (스프린트별 계획)             │
│  + CHANGELOG.md (변경 이력)                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 11. 즉시 실행 체크리스트

```
□ 1. docs/ 폴더에 이 문서들 전부 복사
□ 2. CONVENTIONS.md 작성 (04번 문서 내 코딩 컨벤션 섹션 추출)
□ 3. CURRENT_STATUS.md 최신화 (현재 코드 상태 기록)
□ 4. Claude Code에 02_FULL_AUDIT_PROMPT.md 투입 → AUDIT.md 생성
□ 5. AUDIT.md를 Claude Chat(여기)으로 가져오기
□ 6. Phase 1 분석 → Sprint 1 계획 수립
□ 7. Sprint 1 시작: Auth + Members DB
```

---

> 이 가이드는 살아있는 문서다.
> 새로운 결정이 생기면 업데이트한다.
> 모든 개발은 이 가이드가 가리키는 방향으로 진행한다.
>
> "하나에서 일하세요." — WIO

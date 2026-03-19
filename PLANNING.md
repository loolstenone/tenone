# TenOne 사이트 기획서 (심층 분석)

> 작성일: 2026-03-19 | 분석 기준: 현재 코드 + 실행 사이트

---

## 1. 프로젝트 개요

### 1-1. 서비스 정의
**Ten:One Universe**는 멀티 브랜드 생태계 "텐원 유니버스"의 통합 관리 플랫폼이다.

- **퍼블릭 포털**: 브랜드 쇼케이스, 세계관 소개, 멤버/파트너 모집
- **인트라 오피스**: ERP(CRM/HR), 마케팅, 스튜디오, 위키 통합 관리

### 1-2. 핵심 철학
- **Synchronicity (공시성)**: "반복되는 우연은 계획된 우연"
- **Core Value**: 본질(Essence) · 속도(Speed) · 이행(Carry Out)
- **Mission**: 기획하고, 연결하고, 확장한다 (Plan. Connect. Expand.)
- **Vision**: 10,000명의 기획자를 발굴하고 연결한다

### 1-3. 기술 스택
| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router) + React 19.2.3 |
| 언어 | TypeScript (strict mode) |
| 스타일 | Tailwind CSS v4 + PostCSS |
| 아이콘 | Lucide-React |
| 빌드 | Standalone (Google Cloud Run 타겟) |
| 상태관리 | React Context (6개 도메인별 분리) |
| 데이터 | Mock Data (백엔드/DB 미연동) |

---

## 2. 사이트맵

```
Ten:One™
├── 퍼블릭 (Public)
│   ├── / (랜딩 페이지)
│   ├── /about (소개 · 철학 · 타임라인)
│   ├── /universe (브랜드 관계도 · Wheel · Vision House)
│   ├── /brands (브랜드 포트폴리오)
│   ├── /history (유니버스 연대기)
│   ├── /contact (멤버 신청 · 프로젝트 의뢰)
│   └── /profile (내 정보 관리)
│
├── 인증 (Auth)
│   ├── /login
│   └── /signup (개인 · 기업)
│
└── 인트라 (Intra) — 로그인 필수
    ├── /intra (대시보드)
    ├── ERP
    │   ├── CRM
    │   │   ├── /people (연락처 관리)
    │   │   ├── /segments (세그먼트 분류)
    │   │   └── /import (엑셀 대량 가져오기)
    │   └── HR
    │       ├── /staff (직원 관리)
    │       └── /gpr (목표-계획-결과 관리)
    ├── Marketing
    │   ├── /campaigns (캠페인 관리)
    │   ├── /leads (리드 퍼널 — 칸반)
    │   ├── /deals (영업 파이프라인 — 칸반)
    │   ├── /content (콘텐츠 발행 관리)
    │   ├── /analytics (마케팅 성과 분석)
    │   ├── /activities (활동 기록)
    │   └── /organizations (조직/파트너 관리)
    ├── Studio
    │   ├── /brands (브랜드 & IP 관리)
    │   ├── /contacts (CRM 연락처)
    │   ├── /schedule (통합 캘린더)
    │   ├── /assets (에셋 라이브러리)
    │   ├── /universe (유니버스 시각화)
    │   ├── /workflow (워크플로우 대시보드)
    │   │   ├── /kanban (칸반 보드)
    │   │   ├── /pipeline (콘텐츠 파이프라인)
    │   │   ├── /projects (브랜드 프로젝트)
    │   │   └── /automation (자동화 규칙)
    │   └── /settings (설정)
    └── Wiki
        ├── /culture (기업 컬처 · Principle 10)
        ├── /onboarding (Coming Soon)
        ├── /education (Coming Soon)
        ├── /handbook (Coming Soon)
        └── /faq (Coming Soon)
```

---

## 3. 퍼블릭 페이지 상세

### 3-1. 랜딩 페이지 (/)

| 섹션 | 내용 | 상태 |
|------|------|------|
| Hero | "Ten:One™ Universe" + 슬로건 + CTA 2개 | ✅ 완성 |
| Universe | 브랜드 그리드 (2열→4열) + 외부 링크 | ✅ 완성 |
| Core Value | 본질·속도·이행 3개 카드 | ✅ 완성 |
| Latest | 최근 업데이트 4건 (LUKI, RooK, MADzine, MAD League) | ✅ 완성 |
| CTA | "Are you ready to build the Next Universe?" | ✅ 완성 |

**이슈**: Latest 섹션이 하드코딩. DB 연동 시 동적으로 변경 필요.

### 3-2. About (/about)

| 섹션 | 내용 |
|------|------|
| Hero | "10:01 synchronicity" 스토리텔링 |
| Welcome | 멀티 유니버스 소개 |
| Realization | 창업 스토리 (PC통신 lools → Ten:One) |
| Universe Manual | BigBang → Brand Universe → Flywheel 3단계 |
| Value Connector | 약한 연결 고리 → 강력한 기회 |
| Our Journey | 20개 타임라인 항목 (2020~2025) |
| CTA | "너, 나의 동료가 되라" + 연락처 |

**이슈**: 타임라인이 data.ts에 하드코딩. 관리 페이지에서 편집 가능해야 함.

### 3-3. Universe (/universe)

| 섹션 | 내용 |
|------|------|
| Hero | 멀티 유니버스 안내서 |
| Relationship Map | SVG 인터랙티브 그래프 (10개 노드, 7개 링크) |
| Wheel | 7단계 순환 플라이휠 |
| Vision House | Declaration → Philosophy → Mission → Vision → Strategy |

**이슈**: SVG 좌표가 하드코딩. 브랜드 추가 시 자동 레이아웃 필요.

### 3-4. Brands (/brands)

- 카테고리 필터: 9개 (All, Corporate, Community, Project Group 등)
- 브랜드 카드: 이름, 카테고리, 상태 배지, 설명, 태그, 외부 링크
- **10개 브랜드**: tenone, hero, badak, madleap, madleague, youinone, fwn, 0gamja, luki, rook

### 3-5. History (/history)

- 연도 필터 (All + 연도별)
- 세로 타임라인: 20개 이벤트 (2019~2025)
- 브랜드 연관 배지

### 3-6. Contact (/contact)

| 탭 | 폼 필드 | 상태 |
|----|---------|------|
| 멤버 신청 | 이름, 이메일, 지원분야(6개), 포트폴리오URL, 자기소개 | UI만 완성 (제출 미작동) |
| 프로젝트 의뢰 | 담당자, 회사, 이메일, 연락처, 의뢰분야(5개), 내용 | UI만 완성 (제출 미작동) |

**좌측 사이드바**: 대표 프로필 카드 + 오피스 위치 + 카카오/메일 링크

### 3-7. Profile (/profile)

- 로그인 필수 (미인증 시 로그인 리다이렉트)
- 3개 섹션: 기본정보 / 직원정보(Staff만) / 기업정보(Business만)
- localStorage에 저장 (DB 미연동)

---

## 4. 인증 시스템

### 4-1. 로그인 (/login)
- 이메일 + 비밀번호 인증
- 비밀번호 표시/숨김 토글
- 에러 메시지 표시
- 로그인 후 이전 페이지로 리다이렉트

### 4-2. 회원가입 (/signup)
- 개인/기업 계정 선택
- 비밀번호 강도 검증 (영문+숫자+특수문자 8자 이상)
- 기업 계정: 회사명 추가 필드

### 4-3. 현재 계정 체계

| 계정 | 이메일 | 역할 | 접근 권한 |
|------|--------|------|----------|
| 전천일 | lools@tenone.biz | Admin | 전체 |
| Sarah Kim | sarah@tenone.biz | Manager | office, erp-crm |
| 김준호 | junho@tenone.biz | Editor | office |

**이슈**: 비밀번호가 코드에 하드코딩. 실제 인증 서비스 필수.

---

## 5. 인트라 오피스 상세

### 5-1. 대시보드 (/intra)

| 섹션 | 내용 |
|------|------|
| 인사말 | "안녕하세요, {이름}님" |
| Quick Stats | Active Staff(3), Campaigns(3), Leads(4), GPR Goals(9) |
| Quick Links | Studio, ERP, Marketing, Wiki 4개 카드 |
| 공지사항 | 5개 샘플 (중요/교육/공지/일정/HR 배지) |
| 일정 | 5개 샘플 이벤트 |

**이슈**: 통계와 공지사항 모두 하드코딩.

### 5-2. ERP — CRM

#### People
- **15명** Mock 데이터 (학생 5, 현업자 5, 멘토 3, 파트너/클라이언트 2)
- 테이블: 이름, 타입, 회사, 소스, 상태, 최근 연락
- 검색 + 타입/상태 필터
- 추가/수정 모달 (PersonModal)

#### Segments
- 6개 정적 세그먼트 (MADLeague 학생, Badak 현업자, YouInOne 멘토, 활성/리드/비활성)
- 각 세그먼트별 인원 수 자동 카운트

#### Import
- 드래그앤드롭 파일 업로드 UI
- CSV/XLSX 지원 (최대 10,000건)
- **이슈**: UI만 존재. 실제 파싱/저장 미구현.

### 5-3. ERP — HR

#### Staff Management
- **3명** Mock 직원
- 테이블: 사번, 이름, 부서, 직위, 권한, 부문, 소속 브랜드, 상태
- 4개 부문: 경영, 사업, 제작, 지원
- 역할별 권한: Admin > Manager > Editor > Viewer

#### GPR (목표-계획-결과)
- **9개** Mock 목표 (직원당 2~5개)
- 목표 레벨: GPR-I (실행) / GPR-II (전략) / GPR-III (비전)
- 워크플로우: Draft → 승인요청 → 합의 → 진행 → 자기평가 → 상사평가 → 완료
- 평가 등급: 1(기대이하) ~ 5(탁월)

### 5-4. Marketing

#### Campaigns
- **6개** Mock 캠페인
- 카드 레이아웃: 이름, 타입, 상태, 기간, 예산/집행, 채널
- 요약 통계: 활성 캠페인 수, 총 예산, 총 집행

#### Leads (칸반)
- **6개** Mock 리드
- 7단계 칸반: New → Contacted → Qualified → Proposal → Negotiation → Won → Lost
- 드래그앤드롭 이동
- 카드: 이름, 회사, 소스, 금액

#### Deals (칸반)
- **6개** Mock 딜
- 6단계 칸반: Lead → Contacted → Proposal → Negotiation → Won → Lost
- 드래그앤드롭 이동
- 단계별 총액 표시

#### Content
- **6개** Mock 콘텐츠
- 테이블: 제목, 타입, 채널, 상태, 발행일, 인게이지먼트
- 채널별 요약 통계

#### Analytics
- KPI 4개: 총 마케팅비, Won 리드, 발행 콘텐츠, 활성 캠페인
- 리드 퍼널 차트 (가로 막대)
- 채널별 퍼포먼스

#### Activities
- **10개** Mock 활동
- 타입별 아이콘: Call, Email, Meeting, Note, Event
- 관련 인물/조직 연결

#### Organizations
- **8개** Mock 조직
- 카드: 이름, 타입, 업종, 연락처 수, 웹사이트, 브랜드 연관

### 5-5. Studio

#### Brands & IPs
- 브랜드 카드 그리드 (4열)
- 상태 배지 (Active/Development/Hiatus)

#### Contacts (CRM)
- 테이블 + 검색/역할 필터
- Excel Import 버튼 (UI만)

#### Schedule
- 캘린더 뷰 + 리스트 뷰 전환
- 이벤트 필 표시 (날짜별 브랜드+제목)

#### Assets Library
- 그리드 레이아웃 (5열)
- 타입 필터: Image, Video, Document, Prompt
- 브랜드 필터

#### Workflow Dashboard
- 4개 모듈 카드: Pipeline, Kanban, Projects, Automation
- 최근 태스크 목록

#### Kanban Board
- **8개** Mock 태스크
- 5단계: Backlog → Todo → In Progress → Review → Done
- 드래그앤드롭 + 브랜드/우선순위 필터
- 태스크 추가/수정/삭제 모달

#### Content Pipeline
- **6개** Mock 파이프라인 아이템
- 6단계: Idea → Scripting → Production → Review → Scheduled → Published
- AI 생성 표시 (Sparkles 아이콘)
- 드래그앤드롭

#### Brand Projects
- **5개** Mock 프로젝트
- 프로젝트 카드: 이름, 브랜드, 상태, 5단계 진행률
- 필터: 브랜드, 상태

#### Automation
- **4개** Mock 자동화 규칙
- 트리거 → 조건 → 액션 시각화
- 활성화/비활성화 토글
- 빌더 모달 (AutomationBuilder)

### 5-6. Wiki

| 페이지 | 내용 | 상태 |
|--------|------|------|
| Home | 5개 섹션 카드 (Culture, Onboarding, Education, Handbook, FAQ) | ✅ |
| Culture | Core Value 3개 + Principle 10 (10개 원칙) | ✅ 완성 |
| Onboarding | "콘텐츠 준비 중입니다." | ❌ Coming Soon |
| Education | "콘텐츠 준비 중입니다." | ❌ Coming Soon |
| Handbook | "콘텐츠 준비 중입니다." | ❌ Coming Soon |
| FAQ | "콘텐츠 준비 중입니다." | ❌ Coming Soon |

---

## 6. 데이터 모델

### 6-1. 핵심 엔티티 관계도

```
Brand ─────────────────────────────────────────────
  │  ├── Asset (brandId)
  │  ├── Event (brandId)
  │  ├── Campaign (brandId)
  │  ├── ContentPost (brandId)
  │  ├── WorkflowTask (brandId)
  │  ├── PipelineItem (brandId)
  │  ├── BrandProject (brandId)
  │  ├── Deal (brandId)
  │  ├── Person (brandAssociation[])
  │  ├── Organization (brandAssociation[])
  │  └── StaffMember (brandAssociation[])
  │
StaffMember ───────────────────────────────────────
  │  └── GprGoal (staffId, agreedBy, supervisorId)
  │
Person ────────────────────────────────────────────
  │  ├── Deal (contactId)
  │  ├── Activity (personId)
  │  └── Organization (contactIds[])
  │
Organization ──────────────────────────────────────
  │  ├── Deal (organizationId)
  │  └── Activity (organizationId)
```

### 6-2. 데이터 규모 (Mock)

| 엔티티 | 건수 | 비고 |
|--------|------|------|
| Brand | 10 | 핵심 마스터 |
| Person (CRM) | 15 | 학생5, 현업5, 멘토3, 기타2 |
| Organization | 8 | 파트너, 클라이언트, 스폰서 |
| Deal | 6 | 1M~20M KRW |
| Activity | 10 | Meeting, Call, Email, Note, Event |
| StaffMember | 3 | Admin1, Manager1, Editor1 |
| GprGoal | 9 | 직원당 2~5개 |
| Campaign | 6 | 1M~20M 예산 |
| Lead | 6 | 500K~15M 가치 |
| ContentPost | 6 | Article, Video, SNS, Shorts |
| WorkflowTask | 8 | Backlog~Done |
| PipelineItem | 6 | Idea~Published |
| BrandProject | 5 | 15~80% 진행률 |
| AutomationRule | 4 | 3개 활성 |
| HistoryEvent | 20 | 2019~2025 |
| Asset | 5 | Image, Video, Document, Prompt |
| UniverseEvent | 5 | 캘린더 이벤트 |

---

## 7. 디자인 시스템

### 7-1. 컬러 팔레트

| 용도 | 색상 |
|------|------|
| Primary | indigo-600 (hover: indigo-500) |
| Background | black, zinc-900, zinc-950 |
| Border | zinc-800 |
| Text Primary | white |
| Text Secondary | zinc-400, zinc-500 |
| Success | emerald-400 (bg: emerald-500/10) |
| Warning | amber-400 (bg: amber-500/10) |
| Info | blue-400 (bg: blue-500/10) |
| Error | red-400 (bg: red-500/10) |
| Neutral | zinc-400 (bg: zinc-800) |

### 7-2. 컴포넌트 패턴

| 패턴 | 사용처 |
|------|--------|
| 카드 (rounded-xl border bg-zinc-900/30) | 브랜드, 캠페인, 프로젝트 |
| 테이블 | People, Staff, Content |
| 칸반 보드 (드래그앤드롭) | Leads, Deals, Tasks, Pipeline |
| 모달 (backdrop-blur) | PersonModal, TaskModal, AutomationBuilder |
| 배지 (rounded-full) | 상태, 타입, 우선순위 |
| 타임라인 (세로) | History, About |
| 탭 | Contact (멤버/의뢰) |

### 7-3. 레이아웃

- 최대 너비: max-w-7xl (약 1280px)
- 그리드: 2열, 3열, 4열, 5열 반응형
- 사이드바: 좌측 고정 (인트라 각 모듈별 전용)
- 헤더: 상단 고정 (PublicHeader)

---

## 8. 기능 완성도 매트릭스

| 기능 | UI | 데이터 | CRUD | API | DB | 배점 |
|------|:--:|:------:|:----:|:---:|:--:|:----:|
| 퍼블릭 페이지 | ✅ | ✅ | - | ❌ | ❌ | 40% |
| 로그인/회원가입 | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| CRM People | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| CRM Segments | ✅ | Mock | 읽기 | ❌ | ❌ | 20% |
| CRM Import | ✅ | - | ❌ | ❌ | ❌ | 10% |
| HR Staff | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| HR GPR | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Campaigns | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Leads/Deals | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Content | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Analytics | ✅ | Mock | 읽기 | ❌ | ❌ | 20% |
| Kanban/Pipeline | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Projects | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Automation | ✅ | Mock | ✅ | ❌ | ❌ | 30% |
| Assets | ✅ | Mock | 읽기 | ❌ | ❌ | 15% |
| Schedule | ✅ | Mock | 읽기 | ❌ | ❌ | 15% |
| Wiki | 일부 | 일부 | ❌ | ❌ | ❌ | 10% |
| **전체 평균** | | | | | | **~25%** |

---

## 9. 핵심 이슈 및 리스크

### 9-1. 즉시 해결 필요
1. **데이터 영속성 0%** — 새로고침 시 모든 데이터 리셋
2. **인증 보안 없음** — 비밀번호 평문 하드코딩
3. **폼 제출 미작동** — Contact, Import 등 모든 폼이 작동 안 함
4. **.env 파일 없음** — 환경 변수 관리 체계 없음

### 9-2. 구조적 개선 필요
5. **Context 과부하** — 6개 Context가 모든 데이터를 메모리에 보유
6. **타임라인/브랜드 하드코딩** — lib/data.ts에 직접 작성
7. **SVG 관계도 고정** — 브랜드 추가 시 수동 좌표 조정 필요
8. **CRM/Studio 연락처 이중화** — 같은 데이터를 다른 뷰로 표시

### 9-3. 미구현 영역
9. **API 라우트 0개** — app/api/ 디렉토리 자체가 없음
10. **테스트 0개** — 테스트 프레임워크 미설치
11. **배포 파이프라인 없음** — deploy 스크립트가 참조하는 파일 없음
12. **Wiki 4개 페이지** — Coming Soon 상태

---

## 10. 권장 구현 순서

### Phase 1: 기반 인프라 (1~2주)
`.env` → DB(Supabase/PostgreSQL) → Prisma ORM → Auth.js → API 기본 구조

### Phase 2: 데이터 영속화 (2~3주)
Brand → User/Auth → CRM(People, Org, Deal) → Staff/GPR → Marketing → Workflow

### Phase 3: 프론트엔드 연동 (1~2주)
Context → API 전환 → 폼 제출 연동 → 데이터 패칭(SWR/React Query)

### Phase 4: 기능 보완 (2~3주)
Wiki 콘텐츠 → 실제 Analytics → 파일 업로드 → Excel Import → 알림

### Phase 5: 배포 (1주)
Dockerfile → docker-compose → GCP Cloud Run → CI/CD → 도메인/SSL

### Phase 6: 품질 관리 (병행)
Vitest 단위 테스트 → Playwright E2E → ESLint/Prettier 강화

---

*이 문서는 현재 코드 기준 분석 결과이며, ROADMAP.md의 작업 체크리스트와 연동됩니다.*

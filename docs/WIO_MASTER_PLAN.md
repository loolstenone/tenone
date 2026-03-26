# WIO Master Plan — 이상적인 완성 모델

> Work In One: 세상에 필요한 모든 기능을 모듈로 만든다.
> 필요에 따라 끼워 넣으면 된다.

---

## WIO는 두 가지 얼굴을 갖는다

```
┌─────────────────────────────────────────────────┐
│                    WIO                           │
│                                                  │
│   내부: Ten:One Universe의 IT 인프라             │
│   외부: 기업에게 파는 솔루션 + 컨설팅            │
│                                                  │
│   같은 코드, 같은 모듈, 다른 패키징              │
└─────────────────────────────────────────────────┘
```

**내부 = 도그푸딩(Dogfooding)**
- 우리가 먼저 쓴다. 우리가 불편하면 고객도 불편하다.
- Ten:One 23개 브랜드가 실전 테스트베드.

**외부 = 제품화**
- 우리가 검증한 것만 판다.
- "우리가 이걸로 23개 브랜드를 운영합니다"가 최고의 세일즈.

---

## 1. 모듈 체계 — 3대 자원 기반

모든 모듈은 **사람·돈·시간** 중 최소 하나를 관리한다.

### Core Modules (기본)

| 모듈 | 사람 | 돈 | 시간 | 한 줄 설명 |
|------|------|---|------|-----------|
| **Home** | ○ | ○ | ○ | 대시보드. 오늘 할 일, 알림, KPI |
| **Project** | ● | ● | ● | 프로젝트 중심 운영. Job, 투입, 마감, 손익 |
| **Talk** | ● | | ● | 소통. 공지, 게시판, Q&A, 일정 |

### Growth Modules (성장)

| 모듈 | 사람 | 돈 | 시간 | 한 줄 설명 |
|------|------|---|------|-----------|
| **People** | ● | | | 인재 DB. 역량 진단, 포인트, 매칭 |
| **Sales** | ● | ● | ● | CRM. 리드→기회→제안→수주 파이프라인 |
| **Finance** | | ● | ● | 결재, 경비, 청구/지급 |
| **Timesheet** | ● | ● | ● | 시수 기록. 프로젝트별 시간·비용 계산 |

### Pro Modules (전문)

| 모듈 | 사람 | 돈 | 시간 | 한 줄 설명 |
|------|------|---|------|-----------|
| **Content** | ● | | ● | 콘텐츠 관리. 블로그, SNS, 뉴스레터 |
| **Learn** | ● | | ● | LMS. 교육 과정, 퀴즈, 수료 |
| **Wiki** | ● | | | 지식 관리. 사내 문서, 매뉴얼, 아카이브 |
| **Insight** | ● | ● | ● | BI 대시보드. 전사 성과 분석 |

### Enterprise Modules (엔터프라이즈)

| 모듈 | 사람 | 돈 | 시간 | 한 줄 설명 |
|------|------|---|------|-----------|
| **Shop** | ● | ● | | 커머스. 상품, 주문, 정산 |
| **Approval** | ● | ● | ● | 전자결재. 다단계 승인 체인 |
| **HR** | ● | ● | ● | 인사관리. 근태, 급여, 조직도 |
| **GPR** | ● | | ● | 목표관리. Goal→Plan→Result 캐스케이드 |

### AI Modules (미래)

| 모듈 | 설명 |
|------|------|
| **AI Assistant** | Claude 기반 업무 비서. 회의록, 요약, 추천 |
| **AI Crawler** | Mindle 크롤러 인프라. 트렌드 자동 수집 |
| **AI Creative** | RooK 크리에이티브 엔진. 콘텐츠 자동 생성 |
| **AI Matching** | HeRo 매칭 알고리즘. 인재-프로젝트 자동 연결 |

---

## 2. 내부 적용 — Ten:One Universe

### 브랜드별 모듈 구성

| 브랜드 | 역할 | 사용 모듈 | 비고 |
|--------|------|----------|------|
| **TenOne** | 지주사 | Home, Project, Talk, Finance, HR, GPR, Approval, Wiki, Insight | ERP 전체 |
| **MADLeague** | 대학생 커뮤니티 | Home, Project, Talk, People, Learn, Content | 경연 PT, 멤버 관리 |
| **SmarComm** | 마케팅 대행 | Home, Project, Sales, Finance, Timesheet, Content, AI Creative | 캠페인+크루 |
| **Mindle** | 트렌드 플랫폼 | Home, Content, AI Crawler, Insight | 크롤링+분석 |
| **HeRo** | 인재 에이전시 | Home, People, Sales, AI Matching, Learn | 매칭+교육 |
| **Badak** | 네트워킹 | Home, People, Talk, Content | 프로필+커뮤니티 |
| **YouInOne** | 프로젝트 그룹 | Home, Project, People, Timesheet, Finance | 크루 운영 |
| **Planner's** | 기획 도구 | Home, GPR, Learn, Wiki | Vrief+GPR 도구 |
| **Evolution School** | 교육 | Home, Learn, People, Content | LMS |
| **RooK** | AI 크리에이티브 | Home, Content, AI Creative | 콘텐츠 제작 |

### 적용 원칙
1. 각 브랜드는 **WIO 테넌트**로 운영
2. 모듈은 **플랜(plan)**으로 제어하되, 내부 브랜드는 **Enterprise** 기본
3. 데이터는 테넌트별 격리 (멀티테넌시)
4. 공통 회원은 Universe members 테이블에서 관리

---

## 3. 외부 판매 — 솔루션 + 컨설팅

### 타겟 고객

| 세그먼트 | 규모 | 니즈 | 추천 패키지 |
|----------|------|------|-----------|
| **에이전시** | 10~50명 | 프로젝트 수익 관리, 크루 배정, 타임시트 | Agency Pack |
| **대학/교육기관** | 50~500명 | 학생 관리, 동아리, 교육 과정, 성과 | Campus Pack |
| **커뮤니티/네트워크** | 100~10,000명 | 멤버 관리, 이벤트, 콘텐츠, 커머스 | Network Pack |
| **일반 기업** | 20~200명 | ERP, 프로젝트, 인사, 재무 | Business Pack |
| **스타트업** | 5~20명 | 린하게 시작, 성장에 따라 확장 | Starter → Growth |

### 패키지 구성

```
┌─────────────────────────────────────────────┐
│           WIO for Agency                     │
│  Project + People + Sales + Finance          │
│  + Timesheet + Content                       │
│                                              │
│  "프로젝트마다 수익이 보이는 에이전시 운영"   │
│  월 149만원~ / 커스텀 컨설팅 별도             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           WIO for Campus                     │
│  Project + People + Learn + Content          │
│  + Talk + GPR                                │
│                                              │
│  "학생이 성장하는 캠퍼스 운영 시스템"          │
│  월 49만원~ / 교육 컨설팅 별도               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           WIO for Network                    │
│  People + Talk + Content + Shop              │
│  + Insight                                   │
│                                              │
│  "멤버가 자산이 되는 커뮤니티 운영"           │
│  월 99만원~ / 커뮤니티 설계 컨설팅 별도       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           WIO for Business                   │
│  Project + Finance + HR + Approval           │
│  + GPR + Insight                             │
│                                              │
│  "사람·돈·시간이 한눈에 보이는 경영 시스템"   │
│  월 299만원~ / ERP 구축 컨설팅 별도           │
└─────────────────────────────────────────────┘
```

### 가격 체계

> 상세: `docs/REVENUE_MODEL.md` 참조

| 플랜 | 월 가격 | 포함 모듈 | 인원 | 스토리지 |
|------|--------|----------|------|---------|
| **Free** | 0원 | Core 5개 | 10명 | 1GB |
| **Starter** | 3.9만원 | Core + Project + Learn | 50명 | 5GB |
| **Pro** | 9.9만원 | + Sales·Finance·Timesheet·GPR·Wiki | 200명 | 20GB |
| **Business** | 29.9만원 | + AI 모듈 + 특화 모듈 | 무제한 | 100GB |
| **Enterprise** | 별도 협의 | 전체 + 화이트라벨 + API | 무제한 | 무제한 |

### 컨설팅 서비스

| 서비스 | 내용 | 기간 | 가격대 |
|--------|------|------|--------|
| **Quick Start** | 초기 설정 + 데이터 마이그레이션 + 교육 | 2주 | 300~500만원 |
| **Process Design** | 업무 프로세스 분석 + WIO 모듈 매핑 + 커스텀 | 4주 | 800~1,500만원 |
| **Full Transform** | 전사 디지털 전환 + WIO 구축 + 교육 + 정착 | 8~12주 | 3,000~5,000만원 |
| **Ongoing Support** | 월간 운영 지원 + 기능 개선 + 교육 | 월간 | 월 100~300만원 |

### 컨설팅 프로세스 (5F 사이클)

```
Find → Form → Fire → Fruit → Feed

1. Find (발견)
   - 고객 현황 진단
   - 업무 프로세스 매핑
   - Pain Point 도출

2. Form (설계)
   - WIO 모듈 구성 설계
   - 권한 체계 설계
   - 데이터 마이그레이션 계획

3. Fire (실행)
   - WIO 테넌트 생성
   - 모듈 설정 + 커스텀
   - 데이터 이관
   - 사용자 교육

4. Fruit (성과)
   - KPI 대시보드 설정
   - 1개월 운영 모니터링
   - 성과 리포트

5. Feed (피드백)
   - 사용자 피드백 수집
   - 개선 사항 반영
   - 다음 단계 제안
```

---

## 4. 기술 아키텍처

### 현재

```
Next.js App (Monolith)
├── app/(WIO)/wio/       ← 마케팅 사이트
├── app/(WIO)/wio/app/   ← WIO 앱 (10개 모듈)
├── lib/supabase/wio.ts  ← DB 레이어
├── types/wio.ts         ← 타입 정의
└── Supabase             ← DB + Auth + Storage
```

### 목표

```
WIO Platform
├── wio.work (또는 wio.tenone.biz)  ← 마케팅 + 가입
├── app.wio.work                     ← 앱 (모듈)
│   ├── {tenant}.app.wio.work        ← 테넌트별 서브도메인
│   └── custom-domain.com            ← 화이트라벨
├── api.wio.work                     ← REST API
│   ├── /v1/projects
│   ├── /v1/members
│   ├── /v1/timesheets
│   └── /v1/...
├── admin.wio.work                   ← 플랫폼 관리
└── docs.wio.work                    ← API 문서 + 가이드
```

### 멀티테넌시

```
Supabase
├── wio_tenants (조직)
│   ├── id, name, slug, domain
│   ├── plan (starter/growth/pro/enterprise)
│   ├── modules[] (활성 모듈 목록)
│   └── settings (JSON — 브랜딩, 기능 토글)
│
├── wio_members (테넌트-유저 매핑)
│   ├── tenant_id, user_id
│   ├── role (owner/admin/manager/member/guest)
│   └── permissions (JSON — 세부 권한)
│
├── wio_projects (테넌트 격리)
│   └── WHERE tenant_id = ?
├── wio_jobs
├── wio_timesheets
├── wio_sales_opportunities
├── wio_expenses
└── ... (모든 데이터 테이블에 tenant_id)
```

---

## 5. 차별화 — 왜 WIO인가

### 기존 솔루션의 문제

| 솔루션 | 문제 |
|--------|------|
| Notion | 자유도 높지만 구조가 없다. 프로젝트 수익이 안 보인다 |
| Slack | 소통만. 프로젝트·재무·인재가 따로 |
| Monday | 프로젝트 관리만. ERP가 없다 |
| ERP (SAP 등) | 무겁고 비싸고 커스텀 어렵다 |
| Asana + Salesforce + ... | 5개 도구 따로 써야 한다 |

### WIO의 답

> **"5개 앱 열어서 한 줄 보고하는 거 이상하지 않아?"**

1. **모듈형** — 필요한 것만 켜서 쓴다 (Starter 3개 → Enterprise 14개+)
2. **사람·돈·시간** — 모든 모듈이 3대 자원으로 연결된다
3. **프로젝트 중심** — 프로젝트에 사람·돈·시간이 모인다
4. **AI 내장** — 크롤링, 콘텐츠 생성, 매칭이 모듈 안에 있다
5. **컨설팅 동반** — 도구만 파는 게 아니라 일하는 방식을 바꿔준다

### 경쟁 우위

```
"우리는 이 시스템으로 23개 브랜드를 운영합니다."
"직접 쓰면서 만든 시스템입니다."
"도구가 아니라 일의 방식입니다."
```

---

## 6. 로드맵

### Phase 1: 내부 완성 (현재~Q2 2026)
- [ ] WIO 10개 모듈 Supabase 완전 연결
- [ ] 멀티테넌시 안정화
- [ ] 권한 체계 서버 사이드 구현
- [ ] Ten:One 인트라 → WIO 모듈 통합
- [ ] MADLeague, HeRo, Badak WIO 연결

### Phase 2: 외부 MVP (Q3 2026)
- [ ] 마케팅 사이트 고도화 (사례, 데모)
- [ ] 셀프서비스 가입 → 온보딩 플로우
- [ ] Starter/Growth 플랜 결제 연동
- [ ] Quick Start 컨설팅 패키지 출시
- [ ] 첫 외부 고객 3곳 확보

### Phase 3: 성장 (Q4 2026~)
- [ ] Pro/Enterprise 플랜 + 화이트라벨
- [ ] API 공개 + 외부 연동
- [ ] AI 모듈 (Assistant, Crawler, Creative, Matching)
- [ ] Process Design 컨설팅 체계화
- [ ] 파트너 에이전시 프로그램

### Phase 4: 플랫폼 (2027~)
- [ ] 마켓플레이스 (커스텀 모듈, 템플릿)
- [ ] WIO Academy (교육 플랫폼)
- [ ] 글로벌 확장 (영문화, 다국어)
- [ ] WIO Certified Consultant 프로그램

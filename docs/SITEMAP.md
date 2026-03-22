# Ten:One™ 사이트맵 & 정보 흐름

> 최종 업데이트: 2026-03-21

---

## 1. 전체 사이트 구조

```
tenone.biz
├── 대소비자 홈페이지 (Public)
│   ├── /                    홈 (히어로 + Crew 모집 + 뉴스레터)
│   ├── /works               Works
│   ├── /contact             Contact
│   ├── /newsroom            Newsroom
│   ├── /newsletter          Newsletter (구독 + 지난 발행물)
│   ├── /about               About (Philosophy / Universe / History)
│   ├── /login               로그인
│   ├── /signup              회원가입 (개인/기업)
│   ├── /CrewInvite          Crew 지원 신청
│   └── /invite?code=XXX     초대장 가입 (코드별)
│
└── Intra (내부 시스템)
    ├── /intra/myverse           Myverse (개인 허브)
    ├── /intra/comm              Communication
    ├── /intra/project           Project
    ├── /intra/hero              HeRo
    ├── /intra/evolution-school  Evolution School
    ├── /intra/studio            SmarComm. (Studio)
    ├── /intra/marketing         SmarComm. (Marketing)
    ├── /intra/wiki              Wiki
    ├── /intra/erp               ERP
    └── /intra/cms               CMS
```

---

## 2. Intra 메뉴 구조 (사이드바)

### Myverse — 개인 업무 공간
```
/intra/myverse                Dashboard (개인 + 직원은 전체현황 포함)
/intra/myverse/messenger      메신저 (1:1, 그룹, 일괄, Crew 포함)
/intra/myverse/todo           Todo (일반/프로젝트/기타)
/intra/myverse/projects       Job 관리 (참여 프로젝트 + Job 등록)
/intra/myverse/approval       내 결재 ★
/intra/myverse/gpr            내 GPR (3차원 평가) ★
/intra/myverse/attendance     내 근태 ★
/intra/myverse/payroll        내 급여 ★
/intra/myverse/expenses       내 경비 ★
```
★ = 직원(Staff) 전용

### Communication — 소통
```
/intra/comm/notice             공지사항
/intra/comm/free               자유게시판
/intra/comm/calendar           전체 일정 (캘린더/리스트, 필터, 범례)
```

### Project — 프로젝트 관리
```
/intra/project/management      프로젝트 관리 (목록 + 등록)
/intra/project/management/new  프로젝트 등록
/intra/project/management/[code]  프로젝트 상세 (개요/Job/손익/인력)
/intra/project/timesheet       타임시트 (주간 시수 입력)
```

### HeRo — 인재 개발
```
/intra/hero/hit                HIT 검사 (2단계 통합검사)
/intra/hero/hit/report         HIT 결과 리포트
/intra/hero/resume             이력서 작성 (광고바닥 7섹션)
/intra/hero/resume/consulting  이력서 AI 컨설팅
/intra/hero/career             역량 진단
/intra/hero/career/roadmap     성장 로드맵 (C-Level 4트랙)
/intra/hero/career/mentor      멘토 매칭
/intra/hero/branding           퍼스널 브랜딩
```

### Evolution School — 교육
```
/intra/evolution-school        전체 과정 (20개) + 수료현황 + 퀴즈
```

### SmarComm. — 콘텐츠 제작 & 마케팅
```
Studio:
/intra/studio/workflow         Workflow (Pipeline/Kanban/Automation)
/intra/studio/schedule         Schedule
/intra/studio/assets           Assets
/intra/studio/brands           Brands
/intra/studio/universe         Universe

Marketing:
/intra/marketing/campaigns     Campaigns ★
/intra/marketing/leads         Leads ★
/intra/marketing/deals         Deals ★
/intra/marketing/activities    Activities
/intra/marketing/crm/people    Contacts ★
/intra/marketing/analytics     Analytics ★
```

### Wiki — 지식 베이스
```
/intra/wiki                    Wiki 홈 (최근 업데이트 + 카드 네비)
/intra/wiki/culture            Culture (Vision House, Principle 10, Flywheel)
/intra/wiki/onboarding         Onboarding (D1/W1/M1 체크리스트 + 퀴즈)
/intra/wiki/handbook           Handbook (근무/휴가/경비/보안)
/intra/wiki/faq                FAQ (7개 아코디언)
/intra/wiki/guides             업무 가이드 (부서별)
/intra/wiki/templates          템플릿 (10개 양식)
/intra/wiki/references         레퍼런스 (태그/북마크/좋아요)
/intra/wiki/education          교육 콘텐츠 (VRIEF/GPR 상세)
```

### ERP — 기업 관리
```
전자결재:
/intra/erp/approval            결재 대기/진행/완료
/intra/erp/approval/draft      기안/품의/보고

GPR:
/intra/erp/gpr                 전사 GPR 현황
/intra/erp/gpr/cascade         목표 캐스케이드
/intra/erp/gpr/evaluation      평가
/intra/erp/gpr/incentive       인센티브

HR:
/intra/erp/hr/people           People (내부/Crew/일반 통합관리)
/intra/erp/hr/people/org       조직도
/intra/erp/hr/people/clubs     MADLeague 동아리 관리
/intra/erp/hr/staff            직원 관리
/intra/erp/hr/staff/register   구성원 등록
/intra/erp/hr/attendance       근태관리 (출퇴근/휴가관리/휴가신청)
/intra/erp/hr/payroll          급여관리
/intra/erp/hr/education        교육관리
/intra/erp/hr/certificates     제증명서
/intra/erp/hr/family           가족관리
/intra/erp/hr/talent           인재관리 (Talent Pool/Pipeline/Programs)

PROJECT:
/intra/erp/project/rates       투입인원단가 (표준/실제)
/intra/project/financials      프로젝트 손익
/intra/project/management/bidding  입찰관리
/intra/project/management/vendors  협력사

경영관리:
/intra/erp/biz/plan            연간 경영계획
/intra/erp/biz/plan/division   부문별 계획
/intra/erp/biz/manage          월별 추정
/intra/erp/biz/manage/actual   실적 확정
/intra/erp/biz/manage/gap      Gap 분석
/intra/erp/biz/analysis        손익 현황
/intra/erp/biz/analysis/division  부문별 이익률
/intra/erp/biz/analysis/project   프로젝트 수익성
/intra/erp/biz/analysis/cost   비용 분석

FINANCE:
/intra/erp/finance/expenses    경비관리
/intra/erp/finance/card        법인카드
/intra/erp/finance/reports     경리리포트
/intra/erp/finance/billing     청구/지급

운영설정:
/intra/erp/settings/approval-line  결재라인 설정
/intra/erp/settings/permissions    권한 설정
/intra/erp/settings/hr             HR 설정 (직급/부서/근무형태)
/intra/erp/settings/finance        Finance 설정 (계정/예산/결산)
```

### CMS — 콘텐츠 관리
```
/intra/cms                     콘텐츠 관리
/intra/cms/newsletter          Newsletter 관리
/intra/cms/schedule            회사 일정
```

---

## 3. 사용자 유형별 접근 권한

```
                    Staff   Partner  Jr.Partner  Crew    일반
─────────────────────────────────────────────────────────────
Intra 접속           ✅       ✅        ✅        ✅      ❌
Myverse (전체)       ✅       —         —         —       —
Myverse (기본)       —        ✅        ✅        ✅      —
Communication        ✅       ✅        ✅        —       —
Project              ✅       ✅        ✅        ✅      —
HeRo                 ✅       ✅        ✅        ✅      —
Evolution School     ✅       ✅        ✅        ✅      —
SmarComm.            ✅       ✅        ✅        ✅      —
Wiki (전체)          ✅       —         —         —       —
Wiki (기본)          —        ✅        ✅        ✅      —
ERP                  ✅       —         —         —       —
CMS                  ✅       —         —         —       —
```

---

## 4. 정보 흐름 (Data Flow)

### A. 인재 생태계 파이프라인

```
[외부]                    [가입]                     [Intra]
홈페이지 방문       →    /signup (일반 가입)    →    일반 회원 (Intra ❌)
                    →    /CrewInvite (지원)     →    관리자 검토
                         /invite (초대)         →    이메일 인증 → Crew/Partner

[MADLeague 학생]    →    /CrewInvite            →    Crew 가입
                         동아리/기수/역할 선택        → HIT 검사 → Education
                                                     → 프로젝트 참여 → 성장
```

### B. 프로젝트 생명주기

```
프로젝트 등록 → 승인 → Job 등록 → 타임시트 → 손익 확정
     │                    │           │            │
     ▼                    ▼           ▼            ▼
 경영계획 연동      인력 배치     시수 집계    ERP 손익 반영
 예상 취급/매총     표준단가 적용  실제단가 적용  Gap 분석
```

```
프로젝트 코드: PRJ-YYYY-NNNN
Job 코드:      PRJ-YYYY-NNNN-{유형}-{세부}{순번}
  유형: PR(제작) | ME(Media) | PT
  세부: PL(기획) | DO(실행) | RE(Report)
```

### C. 손익 데이터 흐름

```
경영계획 (연간, Q별)
    ↓
월별 추정 (N차)          ←  프로젝트 예상 손익
    ↓
실적 확정 (월별)         ←  프로젝트 실제 손익 (청구/지급)
    ↓
Gap 분석                    계획 vs 추정 vs 실적
    ↓
손익 현황 / 부문별 / 프로젝트별 / 비용 분석
```

```
프로젝트 손익 구조:
Billing (취급액)
  - Ex-Cost (외부비: 제작외주, 매체비)
  = Revenue (매출총이익)
  - In-Cost (내부비: 인건비[시수×단가], 공통비, 제경비)
  = Profit (영업이익)
```

### D. GPR 생명주기

```
CEO 전사목표 → 부문 목표 → 팀 목표 → 개인 목표 (캐스케이드)
                                          │
                                     G (원대한 꿈)
                                     P (가설/실험)
                                     R (학습/결과)
                                          │
                              분기별 리뷰 (라인스톱 가능)
                                          │
                              자기평가 (What/How/Attitude)
                              상사평가 (What/How/Attitude)
                                          │
                              최종 등급 → 인센티브
```

### E. 전자결재 흐름

```
기안자 작성 (기안/품의/보고)
    ↓
결재라인 (기안자 → 팀장 → 부서장 [→ CFO/CEO])
    ↓
승인 / 반려
    ↓
완료 → Finance 연동 (품의 시)
```

### F. 휴가 → 일정 연동

```
Myverse 근태 → 휴가 신청
    ↓
ERP HR 근태관리 → 관리자 승인
    ↓
Communication 전체 일정 → 자동 등록 (🟢 휴가)
```

### G. Education (Evolution School) 흐름

```
온보딩 (Wiki) → 필수 과정 이수 → 퀴즈 80점 통과 → 이수 완료
                     │
              Evolution School 20개 과정
              필수(7) + 전문(7) + 심화(6)
                     │
              Myverse 대시보드에 이수 현황 표시
```

---

## 5. 외부 서비스 연동 (현재 도메인)

| 브랜드 | 도메인 | 역할 |
|--------|--------|------|
| Ten:One™ | tenone.biz | 유니버스 허브 (이 사이트) |
| HeRo | hero.ne.kr | 인재 에이전시 (추후 독립) |
| Badak | Badak.biz | 업계 네트워킹 |
| MADLeap | MADLeap.co.kr | 서울경기 대학생 동아리 |
| MADLeague | MADLeague.net | 전국 동아리 연합 |
| YouInOne | YouInOne.com | 프로젝트 그룹 |
| FWN | FWN.co.kr | 패션위크 네트워크 |
| 0gamja | 0gamja.com | 감성 콘텐츠 |
| RooK | RooK.co.kr | AI 크리에이터 |

---

## 6. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + React 19 |
| 언어 | TypeScript (strict) |
| 스타일링 | Tailwind CSS v4 |
| 아이콘 | Lucide-React |
| 데이터 | Mock (Context + localStorage) |
| 배포 | GCP Cloud Run (예정) |

---

## 7. 계정 정보

| 유형 | 이메일 | 비밀번호 | 권한 |
|------|--------|----------|------|
| Master (CEO) | lools@tenone.biz | ilove2ne1** | 전체 |
| Staff (Manager) | manager@tenone.com | tenone1234 | Staff |
| Staff (Editor) | official@madleap.co.kr | 12345678 | Staff |
| Crew | crew@madleap.co.kr | Crew2026! | Crew |
| 개인 회원 | cheonil.jeon@gmail.com | 12345678 | 일반 (Intra ❌) |
| 기업 회원 | lools@kakao.com | 12345678 | 일반 (Intra ❌) |

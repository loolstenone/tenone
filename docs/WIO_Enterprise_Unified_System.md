# WIO — Enterprise Unified System (EUS)

> **프로젝트명**: Enterprise Unified System (EUS)
> **WIO 버전**: v1.0
> **원본**: EUS v2.0 통합본 + 보강 3-2
> **날짜**: 2026-03-29
> **핵심 철학**: 인간(Human) · 시간(Time) · 돈(Money) — 기업의 3대 자원을 하나의 플랫폼에서 관리

---

## 목차

**Part I. 시스템 기반**
1. 시스템 개요
2. 3대 자원 관리 체계
3. 기업 철학·가치·일하는 방식의 시스템 내재화

**Part II. 조직·인력·권한**
4. 트랙 및 조직 구조
5. 시스템 세팅 플로우
6. 권한 상세 설계

**Part III. 모듈 카탈로그**
7. 전체 모듈 카탈로그 (~100개)

**Part IV. 워크플로우·평가·보상**
8. 워크플로우 엔진
9. 조직 및 구성원 평가·보상 체계

**Part V. 고객·마케팅·매체**
10. 통합 CRM — 지주사·사업회사·소비자 3층 구조
11. 대외 마케팅 커뮤니케이션 · 매체 관리 · 반응 데이터

**Part VI. 데이터·분석·AI**
12. 통합 데이터·콘텐츠 관리 및 전략 분석 조직

**Part VII. 기술·보안·UI·로드맵**
13. 기술 아키텍처
14. 보안 설계
15. UI/UX 설계 원칙
16. 개발 로드맵
17. 핵심 성공 지표

---

# Part I. 시스템 기반

---

## 1. 시스템 개요

### 1.1 목적

거대 기업의 모든 부서가 하나의 플랫폼 위에서 업무를 수행하되, 각 조직은 자기 업무에 최적화된 모듈만 사용하는 **모듈러 ERP 시스템**. 기존 ERP가 "기능 중심"으로 설계되었다면, 이 시스템은 **"조직 중심 + 모듈 조합"** 방식으로 설계한다.

### 1.2 설계 원칙

1. **조직이 먼저, 기능은 그 다음**: 트랙 → 조직 → 인력 → 권한 → 모듈 순서로 세팅
2. **3대 자원 중심**: 모든 모듈은 결국 인간/시간/돈 중 하나 이상을 입출력으로 가진다
3. **모듈 독립성**: 각 모듈은 독립 배포·업데이트 가능 (마이크로서비스 아키텍처)
4. **조직 간 워크플로우**: 부서를 넘나드는 업무 프로세스를 시각적으로 설계
5. **권한 계층화**: 시스템 관리자 → 트랙 관리자 → 조직 관리자 → 일반 사용자
6. **확장 가능성**: 모듈 카탈로그에 신규 모듈을 플러그인처럼 추가
7. **문화 내재화**: 기업의 철학·가치가 양식·프로세스·평가에 구조적으로 반영
8. **데이터 중심 경영**: 내외부 모든 데이터를 수집·통합·분석하여 의사결정에 반영

### 1.3 WIO 원칙 적용

| WIO 원칙 | EUS 적용 |
|----------|---------|
| 입력을 없앤다 | 매체 API 자동 수집, 근태 자동 기록, 전표 자동 생성, AI 문서 초안 |
| AI가 80% 채운다 | 감성 분석, 어트리뷰션 자동 계산, 문서 초안, 가치 정합성 체크 |
| 사람은 20%의 판단 | 전략 방향 결정, 최종 승인, 크리에이티브 메시지, 핵심 가치 판단 |

---

## 2. 3대 자원 관리 체계

모든 모듈이 공유하는 코어 데이터 레이어.

### 2.1 인간 (Human Resource Core)

| 데이터 항목 | 설명 |
|---|---|
| 인사 마스터 | 사원번호, 성명, 부서, 직급, 직책, 입사일, 계약유형 |
| 조직 소속 | 트랙 → 부서 → 팀 → 파트 (다중 소속 허용) |
| 역량 프로필 | 스킬셋, 자격증, 교육이력, 프로젝트 경험 |
| 근태 기록 | 출퇴근, 휴가, 초과근무, 재택근무 |
| 성과 기록 | KPI, 평가 결과, 피드백 이력 |
| 권한 프로필 | 시스템 접근 권한, 모듈별 RBAC |

### 2.2 시간 (Time Resource Core)

| 데이터 항목 | 설명 |
|---|---|
| 근무 시간 | 개인별 근무시간 집계, 초과근무 자동 계산 |
| 프로젝트 타임라인 | 프로젝트별 시작/종료/마일스톤 |
| 업무 일정 | 개인/팀/부서 캘린더, 회의, 데드라인 |
| SLA/납기 | 고객 약속 납기, 내부 SLA 추적 |
| 워크플로우 리드타임 | 결재·프로세스별 소요시간 분석 |

### 2.3 돈 (Financial Resource Core)

| 데이터 항목 | 설명 |
|---|---|
| 회계 원장 (GL) | 계정과목, 분개, 전표, 재무제표 |
| 예산 | 부서별/프로젝트별 예산 편성·집행·잔액 |
| 매출/매입 | 매출 파이프라인, 매입 관리, 세금계산서 |
| 급여 | 급여 계산, 4대보험, 원천징수, 지급 |
| 비용 | 경비 청구, 법인카드, 출장비, 복리후생 |
| 자산 | 유무형 자산 등록, 감가상각, 재고 평가 |

---

## 3. 기업 철학·가치·일하는 방식의 시스템 내재화

### 3.1 왜 시스템에 녹여야 하는가

기업 문화는 포스터나 슬로건으로 전파되지 않는다. **일상 업무의 양식, 프로세스, 결재 흐름, 피드백 구조 안에 녹아 있어야** 구성원이 자연스럽게 체화한다. 시스템은 "이렇게 일해라"라고 말하는 게 아니라, "이렇게 일할 수밖에 없는 구조"를 만드는 것이다.

### 3.2 Culture Engine — 기업 철학 관리 시스템

```
CorporateCulture {
  id: UUID
  tenant_id: FK → Tenant
  mission: text
  vision: text
  core_values: CoreValue[]
  work_principles: WorkPrinciple[]
  communication_guidelines: CommunicationGuide[]
  version: int
  effective_date: date
  status: enum [draft, active, archived]
}

CoreValue {
  id: UUID
  name: string              // "고객 중심", "도전", "협업"
  description: text
  behavioral_indicators: string[]  // 관찰 가능한 행동 지표
  anti_patterns: string[]          // "이건 이 가치가 아닙니다"
  sort_order: int
}

WorkPrinciple {
  id: UUID
  name: string               // "결론 먼저, 근거는 뒤에"
  applies_to: enum [all, report, proposal, meeting, feedback]
  template_enforcement: boolean
}

CommunicationGuide {
  id: UUID
  context: enum [report_up, report_down, cross_dept, external, meeting]
  guidelines: text
  tone: string
  required_elements: string[]
}
```

### 3.3 양식(Template) 시스템 — 철학이 녹은 문서

| 양식 유형 | 코드 | 철학 반영 방식 |
|---|---|---|
| 기안서 | TPL-DRAFT | "어떤 핵심가치에 기여하는가" 필수. 기대효과를 3대 자원 관점에서 기술 |
| 보고서 | TPL-REPORT | "결론→근거→제안→리스크" 순서 고정. 보고 대상별 상세도 자동 조절 |
| 제안서 | TPL-PROPOSAL | "고객 가치·기술적 실현가능성·재무 임팩트" 3축 평가 내장 |
| 회의록 | TPL-MEETING | 회의 유형별 구조 분리. "결정사항+후속조치+담당자+기한" 필수 |
| 주간보고 | TPL-WEEKLY | 핵심 성과→이슈/리스크→다음주 계획. 핵심가치 태그 |
| 프로젝트 킥오프 | TPL-KICKOFF | 프로젝트 목적↔기업 미션 연결 항목. 행동지표 포함 |
| 피드백 | TPL-FEEDBACK | 핵심가치 기반 피드백 구조 |
| 경비 청구 | TPL-EXPENSE | 지출 목적↔기업 가치 연결성 자동 검증 |

```
DocumentTemplate {
  id: UUID
  code: string
  name: string
  category: enum [draft, report, proposal, meeting, feedback, expense, ...]
  sections: TemplateSection[]
  required_fields: string[]
  culture_links: CultureLink[]
  work_principle_id: FK → WorkPrinciple
  audience_variants: AudienceVariant[]
  ai_review_enabled: boolean
  ai_review_criteria: jsonb
  version: int
  status: enum [active, deprecated]
}

TemplateSection {
  id: UUID
  template_id: FK → DocumentTemplate
  name: string
  order: int
  is_required: boolean
  field_type: enum [text, rich_text, select, multi_select, number, date, file, value_tag, resource_impact]
  placeholder: text
}

CultureLink {
  template_id: FK → DocumentTemplate
  core_value_id: FK → CoreValue
  link_type: enum [mandatory_tag, optional_tag, structural_enforcement, ai_review_point]
}

AudienceVariant {
  template_id: FK → DocumentTemplate
  audience_level: enum [c_level, division_head, team_lead, peer, external]
  visible_sections: UUID[]
  max_pages: int
  summary_required: boolean
}
```

### 3.4 프로세스에 녹이는 방법

**A. 결재 프로세스 내 가치 체크포인트**

```
[기안자 작성] → [팀장 검토: 실무 타당성] → [가치 정합성 체크: AI 자동 스코어] → [본부장 승인]
```

**B. 회의 시스템**

| 회의 유형 | 시스템 강제 사항 |
|---|---|
| 의사결정 회의 | 안건별 찬반 투표, 결정→태스크 전환 필수 |
| 브레인스토밍 | 비판 금지 플래그, 투표→우선순위화 |
| 공유/싱크 | 시간 제한 타이머, 참석자별 발언 시간 트래킹 |
| 1:1 | 피드백 기록, 개발 목표 연결, 이전 1:1 자동 로드 |
| 스탠드업 | 3문장 강제(어제/오늘/블로커), 15분 타이머 |

**C. 온보딩 과정에서 문화 학습**

```
Day 1: 환영 → 미션/비전 소개 (인터랙티브)
Day 2: 핵심가치 학습 → 실제 사례 (사내 베스트 프랙티스)
Day 3: 일하는 원칙 → 양식 작성 튜토리얼 (AI 코칭)
Week 1: 첫 기안서 → AI 가치 기반 피드백
Week 2: 동료 피드백 → 핵심가치 기반 피드백 경험
Month 1: 문화 퀴즈 & 체크인 → 인사팀 알림
```

**D. AI 코칭 — 문서 작성 시 실시간 가이드**

```
AI: "핵심 요약이 3줄 초과. 원칙: '결론 먼저, 한 줄로'."
AI: "고객 가치가 불명확. '고객에게 어떤 변화를 만드는가?' 관점에서 보완하세요."
AI: "비용 대비 효과 분석 누락. 투자 대비 기대 수익을 추가하세요."
```

### 3.5 Culture Dashboard — 문화 건강도 측정

| 지표 | 측정 방법 |
|---|---|
| 가치 언급 빈도 | 기안서/보고서에서 핵심가치 태그 사용 빈도 |
| 양식 준수율 | 양식 구조 준수 비율 (AI 자동 판정) |
| 회의 효율성 | 의사결정 회의의 결정 전환율, 평균 소요시간 |
| 피드백 활성도 | 동료 간 피드백 교환 빈도, 가치 기반 피드백 비율 |
| 온보딩 완주율 | 문화 학습 프로그램 완료율 |
| 가치 정합 스코어 | AI 분석 의사결정 가치 정합도 평균 |

---

# Part II. 조직·인력·권한

---

## 4. 트랙 및 조직 구조

### 4.1 6개 트랙

```
[시스템 관리자]
    │
    ├── Track 1: 운영·관리 (Operations)
    │     ├── 인사(HR): 채용/교육/인사관리/노무
    │     ├── 재무(Finance): 자금관리/투자관리/IR
    │     ├── 회계(Accounting): 재무회계/관리회계/세무
    │     ├── 법무(Legal)
    │     ├── 감사(Audit)
    │     └── 총무(General Affairs)
    │
    ├── Track 2: 사업 (Business)
    │     ├── 마케팅본부: 전략/브랜드/퍼포먼스/콘텐츠·소셜/CRM마케팅/데이터/운영
    │     ├── 영업본부: 국내/해외/기술영업
    │     ├── 사업개발(BD)
    │     └── 고객관리(CRM): 고객지원(CS)/고객성공(CX)
    │
    ├── Track 3: 지원 (Support)
    │     ├── 연구소(R&D): 기초연구/응용연구/특허관리
    │     ├── 개발(Dev): 프론트/백엔드/인프라·DevOps/QA
    │     ├── 제작(Production): 생산관리/품질관리/설비관리
    │     ├── 디자인(Design): UI·UX/BX·CI/영상·그래픽
    │     └── 유통(Distribution): 물류/입출고/배송
    │
    ├── Track 4: 파트너 (Partners)
    │     ├── 내부 파트너 (계열사, 자회사)
    │     ├── 외부 파트너 (협력사, 벤더)
    │     ├── 컨설팅/어드바이저
    │     └── 프리랜서 풀
    │
    ├── Track 5: 공통 (Common Platform)
    │     ├── 이메일/메신저·채팅/게시판·사내 커뮤니티
    │     ├── 전산·IT 인프라/협업 도구/인공지능
    │     └── 전자결재
    │
    └── Track 6: 시스템 관리 (System Administration)
          ├── 사용자·권한/조직 구조/모듈/워크플로우 관리
          ├── 시스템 모니터링/보안 정책/감사 로그
          └── Culture Engine (기업 철학·가치 관리)
```

### 4.2 지주사 수준 추가 조직

```
[지주사 (Holding)]
    ├── 통합 마케팅 인텔리전스 센터
    │     ├── 통합 미디어 전략팀
    │     ├── 통합 데이터/분석팀
    │     ├── 통합 브랜드/커뮤니케이션팀
    │     ├── 통합 고객 인사이트팀
    │     └── 마케팅 거버넌스팀
    │
    ├── 데이터전략실 (CDO Office)
    │     ├── 데이터 거버넌스팀
    │     ├── 데이터 엔지니어링팀
    │     ├── 분석팀 (Analytics)
    │     ├── AI/ML팀
    │     └── 전략 인사이트팀
    │
    └── [각 사업회사 (BU-A, BU-B, BU-C, ...)]
          └── (각 사업회사는 6개 트랙 구조를 자체 보유)
```

### 4.3 조직 데이터 모델

```
Organization {
  id: UUID
  name: string
  code: string                   // "MKT-BRD"
  track_id: FK → Track
  parent_org_id: FK → Organization (nullable)
  level: enum [본부, 팀, 파트, 셀]
  head_user_id: FK → User
  status: enum [active, inactive, archived]
  metadata: jsonb
}

Track {
  id: UUID
  name: string
  code: string                   // "T1-OPS"
  sort_order: int
  description: text
  admin_user_ids: FK[] → User
}
```

---

## 5. 시스템 세팅 플로우

### Step 1 — 트랙별 조직 설정

6개 트랙 생성 → 각 트랙 하위 조직 트리(본부→팀→파트→셀) → 조직별 코드/조직장 지정

### Step 2 — 조직별 인력 배치

```
UserAssignment {
  id: UUID
  user_id: FK → User
  org_id: FK → Organization
  assignment_type: enum [primary, concurrent, temporary, project]
  role_title: string
  position_grade: string
  start_date: date
  end_date: date (nullable)
  is_org_head: boolean
  status: enum [active, on_leave, resigned]
}
```

### Step 3 — 인력별 권한 설정

RBAC + ABAC 하이브리드. Role 템플릿으로 자동 적용.

```
RoleTemplate {
  id: UUID
  name: string                   // "마케팅팀 매니저"
  track_id: FK → Track
  module_permissions: jsonb
  data_scope: enum [self, team, department, division, company]
  approval_limit: decimal
  report_access: string[]
}
```

### Step 4 — 조직의 업무에 맞는 모듈 세팅

```
OrgModuleAssignment {
  id: UUID
  org_id: FK → Organization
  module_id: FK → Module
  assigned_by: FK → User
  config: jsonb
  activated_at: timestamp
  status: enum [active, suspended]
}
```

### Step 5 — 조직 간 업무 프로세스 설계

비주얼 워크플로우 엔진에서 크로스-트랙 프로세스 설계.

---

## 6. 권한 상세 설계

### 6.1 권한 계층

```
Level 0: Super Admin (시스템 전체)
Level 1: Track Admin (트랙 내 전체)
Level 2: Org Admin (소속 조직 내 전체)
Level 3: Team Lead (팀 내 관리 + 하위 열람)
Level 4: Member (자기 업무 + 팀 공유 데이터)
Level 5: Viewer (읽기 전용)
Level 6: External (파트너, 제한적 접근)
```

### 6.2 4층 권한 모델

| Layer | 범위 | 설명 |
|---|---|---|
| Layer 1 | 시스템 권한 | 시스템 관리 메뉴, 전역 설정 변경 |
| Layer 2 | 모듈 권한 | 특정 모듈의 CRUD |
| Layer 3 | 데이터 권한 | 볼 수 있는 데이터 범위 (자기/팀/부서/전사) |
| Layer 4 | 기능 권한 | 모듈 내 세부 기능 접근 |

### 6.3 권한 상속 및 위임

```
PermissionDelegation {
  id: UUID
  delegator_id: FK → User
  delegatee_id: FK → User
  permission_scope: jsonb
  start_date: timestamp
  end_date: timestamp
  reason: string
  status: enum [active, expired, revoked]
}
```

---

# Part III. 모듈 카탈로그

---

## 7. 전체 모듈 카탈로그 (~100개)

### 7.1 Track 1: 운영·관리 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| HR-REC | 채용관리 | 공고, 지원자 추적, 면접, 오퍼 | 인간 |
| HR-ATT | 근태관리 | 출퇴근, 휴가, 초과근무 | 인간+시간 |
| HR-PAY | 급여관리 | 급여 계산, 4대보험, 원천징수 | 인간+돈 |
| HR-EVL+ | 통합평가 | 성과+역량+다면평가+상시피드백 종합 | 인간+시간 |
| HR-EDU | 교육관리 | 교육과정, 수강, 이수, 자격증 | 인간+시간 |
| HR-ORG | 조직관리 | 조직도, 인사발령, 전보 | 인간 |
| HR-REW | 보상관리 | 연봉, 인센티브, 포인트, 승진 기준 | 인간+돈 |
| FIN-GL | 총계정원장 | 계정과목, 분개, 전표, 시산표 | 돈 |
| FIN-AP | 매입관리 | 구매요청, 발주, 입고, 대금지급 | 돈+시간 |
| FIN-AR | 매출관리 | 매출인식, 청구, 수금, 채권 | 돈+시간 |
| FIN-BUD | 예산관리 | 예산편성, 배정, 집행, 이월 | 돈+시간 |
| FIN-TAX | 세무관리 | 부가세, 법인세, 세금계산서 | 돈 |
| FIN-AST | 자산관리 | 자산등록, 감가상각, 실사 | 돈 |
| AUD-INT | 내부감사 | 감사계획, 수행, 보고, 후속관리 | 인간+시간+돈 |
| LEG-CON | 계약관리 | 계약서 작성, 검토, 체결, 만료 | 인간+시간+돈 |
| LEG-COM | 법규준수 | 컴플라이언스 체크리스트, 규제 추적 | 인간 |
| CRM-PVY | 개인정보관리 | 동의 관리, 열람/삭제 청구, 컴플라이언스 | 인간 |

### 7.2 Track 2: 사업 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| MKT-STR | 마케팅전략 | 연간/분기 전략, 예산 배분, 타겟, KPI | 돈+시간 |
| MKT-CMP | 캠페인관리 | 캠페인 기획, 집행, 성과분석 | 돈+시간 |
| MKT-MDI | 매체관리 | 매체 마스터, 매체 플랜, 바잉, 정산 | 돈 |
| MKT-PFM | 퍼포먼스마케팅 | 검색/디스플레이/소셜 광고, 최적화, 실시간 | 돈+시간 |
| MKT-CNT | 콘텐츠관리 | 콘텐츠 제작, 배포, 버전관리 | 시간 |
| MKT-SOC | 소셜미디어관리 | SNS 운영, 콘텐츠 발행, 참여 관리 | 시간 |
| MKT-INF | 인플루언서관리 | 인플루언서 DB, 매칭, 캠페인, 정산 | 돈+시간 |
| MKT-CRT | 크리에이티브관리 | 소재 제작 요청, 버전관리, 심의, A/B테스트 | 시간 |
| MKT-AUT | 마케팅자동화 | 여정 빌더, 트리거 메시지, 세그먼트 자동 발송 | 시간 |
| MKT-DTA | 매체데이터허브 | 전 매체 데이터 자동 수집, 정규화, 통합 리포팅 | — |
| MKT-ATR | 어트리뷰션 | 전환 경로, 다중 어트리뷰션 모델, 기여도 | 돈 |
| MKT-MMM | 미디어믹스모델 | 채널별 기여도, 예산 최적화 시뮬레이션 | 돈 |
| MKT-ABT | A/B테스트 | 실험 설계, 실행, 통계적 유의성, 아카이브 | 시간 |
| MKT-SEN | 감성분석 | 소셜/리뷰/뉴스 감성 수집, NLP, 알림 | — |
| MKT-OPS | 마케팅운영 | 대행사/벤더 관리, 매체비 정산, 예산 집행 | 돈 |
| MKT-INT | 마케팅연동허브 | 외부 API 연동, 동기화, 모니터링, 매핑 | — |
| MKT-ANL | 마케팅분석 | 채널별 ROI, 퍼널분석, Attribution | 돈+시간 |
| MKT-BRD | 브랜드관리 | 브랜드 가이드, 자산, 모니터링 | 돈 |
| SAL-PIP | 영업파이프라인 | 리드→기회→제안→수주 추적 | 돈+시간 |
| SAL-QOT | 견적관리 | 견적 작성, 승인, 발송, 추적 | 돈 |
| SAL-ORD | 수주관리 | 주문 접수, 확인, 이행, 정산 | 돈+시간 |
| CRM-UNI | 통합고객관리 | Golden Record, Identity Resolution, 통합 프로필 | 인간 |
| CRM-CST | 고객관리 | 고객 DB, 세그먼트, 이력, 등급 | 인간 |
| CRM-SVC | 고객지원 | 티켓, SLA, FAQ, 챗봇 | 인간+시간 |
| CRM-CX | 고객경험 | NPS, VOC, 만족도, 여정맵 | 인간+시간 |
| CRM-MBR | 멤버십 | 통합 등급, 포인트, 크로스 혜택 | 인간+돈 |
| CRM-CDP | 고객데이터플랫폼 | 접점 통합, 세그먼테이션, 행동 분석 | 인간 |
| BD-PRJ | 신사업기획 | 사업계획, 타당성분석, ROI 추정 | 돈+시간 |

### 7.3 Track 3: 지원 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| RND-PRJ | 연구프로젝트 | 연구과제, 진척률, 산출물 | 시간+돈 |
| RND-PAT | 특허관리 | 출원, 등록, 갱신, 라이선싱 | 돈+시간 |
| DEV-TSK | 개발관리 | 이슈 트래커, 스프린트, 코드리뷰 | 시간 |
| DEV-REL | 배포관리 | CI/CD, 릴리즈, 롤백, 환경관리 | 시간 |
| PRD-PLN | 생산계획 | MPS, MRP, 작업지시 | 시간+돈 |
| PRD-MES | 공정관리 | 공정 모니터링, 실적, 불량관리 | 시간 |
| PRD-QC | 품질관리 | 수입검사, 공정검사, 출하검사 | 시간 |
| PRD-EQP | 설비관리 | 설비대장, 예방보전, 고장관리 | 돈+시간 |
| DSG-PRJ | 디자인프로젝트 | 디자인 요청, 리뷰, 승인, 산출물 | 시간 |
| DSG-AST | 디자인자산 | 로고, 템플릿, 가이드라인 라이브러리 | — |
| LOG-WMS | 창고관리 | 입출고, 재고, 로케이션, 피킹 | 돈+시간 |
| LOG-TMS | 운송관리 | 배차, 배송추적, 운임정산 | 돈+시간 |
| LOG-SCM | 공급망관리 | 발주, 납품, 공급업체 평가 | 돈+시간 |
| DAT-PLT | 데이터플랫폼 | 수집, 파이프라인, 데이터레이크, 웨어하우스 | — |
| CNT-DAM | 디지털자산관리 | 미디어 파일, 브랜드 자산, 라이선스 | — |

### 7.4 Track 4: 파트너 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| PTN-MGT | 파트너관리 | 파트너 등록, 등급, 계약, 평가 | 인간+돈 |
| PTN-PRT | 파트너포털 | 외부 파트너 전용 접근, 문서공유 | 인간 |
| PTN-SRM | 공급업체관리 | 벤더 평가, 입찰, 선정, 성과관리 | 돈 |
| PTN-FRE | 프리랜서관리 | 인력풀, 매칭, 계약, 정산 | 인간+돈+시간 |

### 7.5 Track 5: 공통 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| COM-MAL | 메일 | 내부/외부 이메일, 그룹메일 | — |
| COM-MSG | 메신저 | 1:1, 그룹채팅, 채널, 검색 | — |
| COM-BRD | 게시판 | 공지, 자유, 부서별 | — |
| COM-DOC | 문서관리 | 문서 작성, 공유, 버전, 검색 | — |
| COM-CAL | 캘린더 | 개인/팀/회의실 일정 | 시간 |
| COM-PRJ | 프로젝트협업 | 태스크, 칸반, 간트, 타임라인 | 시간 |
| COM-APR | 전자결재 | 기안, 결재, 합의, 전결, 후결 | 인간+돈+시간 |
| COM-AI | AI어시스턴트 | 문서요약, 번역, 분석, 자동화 | — |
| COM-NTF | 알림센터 | 통합 알림, 구독, 알림 규칙 | — |
| COM-RPT | 리포트센터 | 대시보드, BI, 보고서 생성 | 돈+시간 |
| COM-STR | 전산관리 | 계정, 장비, 라이선스, 네트워크 | 돈 |
| HR-FBK | 피드백 | 상시 피드백 교환, 넛지, 평가 연계 | 인간 |
| HR-RCG | 인정/포상 | Spot Award, MVP, 포인트 적립/사용 | 인간+돈 |
| DAT-BI | BI 대시보드 | 계층별 대시보드, 셀프서비스, 시각화 | 돈+시간 |
| DAT-AI | AI 분석엔진 | 자동 인사이트, 이상탐지, 예측, 추천 | — |
| CNT-HUB | 콘텐츠허브 | 통합 콘텐츠, 자동 태깅, 검색, 버전 | — |
| DAT-ANL | 전략분석 | 기술/진단/예측/처방 분석, 인사이트 보고서 | 돈+시간 |

### 7.6 Track 6: 시스템 관리 모듈

| 코드 | 모듈명 | 핵심 기능 |
|---|---|---|
| SYS-USR | 사용자관리 | 계정 생성/수정/비활성화, SSO |
| SYS-ROL | 역할/권한관리 | 역할 템플릿, 권한 매트릭스, 감사 |
| SYS-ORG | 조직관리 | 트랙/조직 CRUD, 조직도, 인사발령 |
| SYS-MOD | 모듈관리 | 모듈 활성화/비활성화, 조직별 할당 |
| SYS-WFL | 워크플로우관리 | 프로세스 설계, 자동화, 모니터링 |
| SYS-MON | 시스템모니터링 | 서버, 성능, 에러, 사용량 |
| SYS-SEC | 보안관리 | 접근 정책, IP제한, 2FA, 암호화 |
| SYS-LOG | 감사로그 | 모든 변경 이력, 접근 기록, 추출 |
| SYS-CFG | 시스템설정 | 전역 설정, 메타데이터, 코드관리 |
| SYS-INT | 외부연동 | API 게이트웨이, 웹훅, 서드파티 |
| SYS-CUL | Culture Engine | 기업 철학, 가치, 원칙 관리 |
| SYS-TPL | 양식관리 | 문서 양식 생성·배포·버전, 가치 연결 |
| DAT-GOV | 데이터거버넌스 | 카탈로그, 품질, 리니지, 접근정책 |

### 7.7 Holding: 지주사 전용 모듈

| 코드 | 모듈명 | 핵심 기능 |
|---|---|---|
| HLD-MKI | 그룹마케팅인텔리전스 | 전 BU 마케팅 데이터 통합, 크로스 BU 분석 |
| HLD-MDB | 그룹미디어바잉 | 그룹 볼륨 딜, 통합 매체 계약, 단가 관리 |
| HLD-MBH | 그룹브랜드건강도 | 전 BU 브랜드 인지도/감성/SOV 통합 추적 |

**전체 모듈 수: ~100개**

---

# Part IV. 워크플로우·평가·보상

---

## 8. 워크플로우 엔진

### 8.1 구성요소

| 요소 | 설명 |
|---|---|
| 트리거 | 문서 작성, 상태 변경, 일정 도래, 외부 웹훅 |
| 스텝 | 입력, 승인, 알림, 데이터 변환 |
| 담당자 규칙 | 고정/조직장 자동/라운드로빈 |
| 조건 분기 | 금액, 유형, 등급에 따라 다른 경로 |
| 병렬 처리 | 동시에 여러 조직에서 병렬 작업 |
| 타임아웃 | 미처리 시 에스컬레이션 |
| 후속 액션 | 데이터 업데이트, 다음 워크플로우, API 호출 |

### 8.2 데이터 모델

```
WorkflowTemplate {
  id: UUID
  name: string
  trigger_type: enum [manual, event, schedule, webhook]
  trigger_config: jsonb
  steps: WorkflowStep[]
  cross_track: boolean
  involved_tracks: UUID[]
  sla_hours: int
  version: int
  status: enum [draft, active, archived]
}

WorkflowStep {
  id: UUID
  template_id: FK → WorkflowTemplate
  order: int
  name: string
  type: enum [task, approval, notification, condition, parallel_gate, timer, api_call, auto_action]
  assignee_rule: jsonb
  form_schema: jsonb
  timeout_hours: int
  escalation_to: FK → User
  next_steps: UUID[]
}

WorkflowInstance {
  id: UUID
  template_id: FK → WorkflowTemplate
  current_step_id: FK → WorkflowStep
  status: enum [in_progress, completed, cancelled, error, timeout]
  started_by: FK → User
  context_data: jsonb
  step_history: jsonb[]
}
```

### 8.3 크로스-트랙 워크플로우 예시

**신제품 출시:**
```
[사업부 기획안] → [임원 승인] → (병렬) [R&D 프로토타입] + [디자인 패키지] + [재무 예산]
→ [생산 양산계획] → [물류 유통준비] → [마케팅 런칭] → [영업 판매개시]
```

**대규모 구매:**
```
[구매요청] → [3사 견적비교] → 조건 분기:
  1억 미만: [팀장승인] → [발주]
  1~5억: [본부장승인] → [재무검토] → [발주]
  5억 이상: [CFO승인] → [법무검토] → [이사회보고] → [발주]
→ [입고확인] → [회계전표] → [대금지급]
```

**직원 온보딩:**
```
[HR 입사확정] → (자동 병렬) [총무 좌석/장비] + [전산 계정생성] + [HR 교육등록] + [팀장 멘토지정]
→ [HR 온보딩 완료확인] → [전사 알림]
```

---

## 9. 조직 및 구성원 평가·보상 체계

### 9.1 설계 원칙

1. **성과(What) + 가치(How)** 동등 평가
2. **다면 평가**: 상향/하향/동료/자기 결합
3. **상시 피드백**: 일상적 피드백 → 평가로 연결
4. **투명한 기준**: 평가·보상 체계를 구성원이 명확히 이해
5. **성장 연결**: 평가 → 성장 계획으로 연결 (처벌 아님)

### 9.2 평가 주기

```
[상시]  피드백 교환 (핵심가치 기반)
    ▼ 누적
[분기]  분기 체크인 (목표 진척 + 가치 리뷰 + 성장 논의)
    ▼ 4분기 누적
[연간]  종합 평가 (성과 + 역량 + 다면 종합)
    ▼
[보상]  연봉 조정 / 인센티브 / 승진 / 포상
    ▼
[성장]  개인 개발 계획 (IDP) 수립
```

### 9.3 성과 평가 (What) — 목표 캐스케이딩

```
[기업 미션/비전] → [전사 목표] → [트랙 목표] → [부서 목표] → [팀 목표] → [개인 목표]
※ 각 단계에서 정렬도(Alignment Score)를 시스템이 자동 분석
```

```
PerformanceGoal {
  id: UUID
  user_id: FK → User
  period: string
  goal_type: enum [okr_objective, kpi, project_milestone, team_goal]
  title: string
  metric_type: enum [quantitative, qualitative, binary]
  target_value: decimal
  actual_value: decimal
  weight: decimal
  core_value_alignment: FK → CoreValue
  resource_impact: enum [human, time, money][]
  achievement_rate: decimal
  parent_goal_id: FK → PerformanceGoal
  status: enum [draft, agreed, in_progress, completed, cancelled]
}
```

### 9.4 역량 평가 (How) — 핵심가치 기반 행동 평가

```
CompetencyEvaluation {
  evaluatee_id: FK → User
  evaluator_id: FK → User
  evaluation_type: enum [self, manager, peer, subordinate]
  items: CompetencyItem[]
  overall_score: decimal
}

CompetencyItem {
  core_value_id: FK → CoreValue
  behavioral_indicator: string
  score: enum [1_needs_improvement, 2_developing, 3_meets, 4_exceeds, 5_exceptional]
  evidence: text
  feedback_references: UUID[]
}
```

### 9.5 다면 평가 (360도)

| 유형 | 평가자 | 비중 | 항목 |
|---|---|---|---|
| 자기 평가 | 본인 | 참고용 | 성과+역량 전체 |
| 상향 평가 | 직속 상사 | 40% | 성과, 역량, 잠재력 |
| 동료 평가 | 협업 동료 3~5명 | 30% | 협업, 소통, 가치 실천 |
| 하향 평가 | 직속 팀원 | 20% | 리더십, 코칭 (관리자만) |
| 외부 평가 | 고객/파트너 | 10% | 전문성, 응대, 신뢰 (해당 직군) |

### 9.6 상시 피드백

```
FeedbackEntry {
  giver_id: FK → User
  receiver_id: FK → User
  type: enum [praise, constructive, request, thanks]
  core_value_id: FK → CoreValue (nullable)
  observation: text
  impact: text
  suggestion: text (nullable)
  visibility: enum [private, shared_with_manager, public_praise]
}
```

**피드백 넛지 시스템:**

| 트리거 | 넛지 |
|---|---|
| 프로젝트 완료 | "함께한 동료에게 피드백을 남겨보세요" |
| 1:1 미팅 전 | "지난 1:1 이후 관찰한 점을 기록해 보세요" |
| 분기말 2주 전 | "이번 분기 동료 3명에게 피드백을 남겨주세요" |
| 월요일 아침 | "지난 주 인상 깊었던 동료를 칭찬해 보세요" |

### 9.7 보상 체계

```
고정: 기본급 + 직책수당 + 역량수당
변동: 성과 보너스 (개인 60% + 팀 25% + 전사 15%) × 등급 배수
비금전: 인정 포인트, 복지몰, 기부 전환, 추가 휴가

등급 배수: S=2.0, A=1.5, B=1.0, C=0.5, D=0.0
핵심가치 실천 우수자: 추가 가산 보너스
```

| 프로그램 | 주기 | 내용 |
|---|---|---|
| Spot Award | 수시 | 동료/상사 즉시 포인트. 핵심가치 태그 필수 |
| Monthly MVP | 월간 | 부서별 우수자 (동료 투표 + 관리자 추천) |
| Value Champion | 분기 | 핵심가치 실천 우수자 (AI 추천) |
| Innovation Award | 연간 | 혁신 제안/프로젝트 시상 |
| Long Service | 연간 | 장기 근속 포상 (5/10/15/20년) |

**승진 기준:**
```
PromotionCriteria {
  min_tenure_months: int
  min_performance_avg: decimal
  min_competency_avg: decimal
  required_certifications: string[]
  required_training_hours: int
  peer_feedback_threshold: decimal
  leadership_assessment: boolean     // 리더 승진 시
  team_performance_min: decimal      // 리더 승진 시
}
```

# Part V. 고객·마케팅·매체

---

## 10. 통합 CRM — 지주사·사업회사·소비자 3층 구조

### 10.1 핵심 개념

구글 계정 하나로 Gmail, YouTube, Maps를 쓰는 것처럼, **소비자는 하나의 통합 ID로 그룹사의 모든 서비스에 접속**한다.

### 10.2 Layer 1: 통합 고객 (Golden Record) — 지주사 관리

```
UnifiedCustomer {
  id: UUID
  unified_id: string                  // "G-00001234"
  name: string
  email: string (unique)
  phone: string

  membership_tier: enum [basic, silver, gold, platinum, vip]
  total_lifetime_value: decimal
  unified_points: int

  consents: ConsentRecord[]
  business_profiles: BusinessCustomerProfile[]
  segments: UUID[]
  ai_persona: jsonb

  status: enum [active, dormant, churned, blacklisted]
}

ConsentRecord {
  consent_type: enum [marketing_email, marketing_sms, marketing_push,
                      data_sharing_internal, data_sharing_partner, profiling, cross_selling]
  business_unit_id: FK → BusinessUnit (nullable)
  granted: boolean
  consent_source: enum [online_signup, offline_form, app, call_center]
  version: string
}
```

### 10.3 Layer 2: 사업회사별 고객 프로필

```
BusinessCustomerProfile {
  unified_customer_id: FK → UnifiedCustomer
  business_unit_id: FK → BusinessUnit

  local_customer_id: string
  customer_grade: string
  local_ltv: decimal
  total_purchase_amount: decimal

  preferred_channel: enum [online_web, online_app, offline_store, call_center]
  engagement_score: decimal
  churn_risk_score: decimal
}
```

### 10.4 Layer 3: 고객 접점 (Touchpoint) 데이터

```
CustomerTouchpoint {
  unified_customer_id: FK → UnifiedCustomer
  business_unit_id: FK → BusinessUnit

  channel: enum [web, mobile_app, offline_store, call_center,
                 email, sms, push, chatbot, social_media, kiosk, partner]
  touchpoint_type: enum [visit, purchase, inquiry, complaint,
                         campaign_response, event_attendance, review, referral]

  timestamp: timestamptz
  details: jsonb
  amount: decimal (nullable)
  sentiment: enum [positive, neutral, negative] (nullable)
  campaign_id: UUID (nullable)
}
```

### 10.5 온오프라인 ID 통합 (Identity Resolution)

```
IdentityGraph {
  unified_customer_id: FK → UnifiedCustomer

  identifiers: [
    { type: "email", value: "...", confidence: 1.0 },
    { type: "phone", value: "...", confidence: 1.0 },
    { type: "device_id", value: "...", confidence: 0.9 },
    { type: "membership_card", value: "...", confidence: 1.0 },
    { type: "pos_card", value: "...", confidence: 0.8 },
    { type: "social_kakao", value: "...", confidence: 0.95 }
  ]

  match_method: enum [deterministic, probabilistic, declared]
}
```

### 10.6 지주사 vs 사업회사 역할 분담

| 기능 | 지주사 | 사업회사 |
|---|---|---|
| 고객 ID | 통합 ID 발급, Identity Resolution | 로컬 ID 매핑 |
| 데이터 수집 | 표준·정책 수립 | 실제 접점에서 수집 |
| 세그먼트 | 전사 세그먼트 (VIP, 이탈위험) | 사업 특화 세그먼트 |
| 캠페인 | 크로스셀링, 통합 멤버십 | 개별 서비스 프로모션 |
| 분석 | 전사 고객 인사이트 | 서비스별 퍼널/전환율 |
| 개인정보 | 통합 동의 관리 | 동의 범위 내 활용 |
| 멤버십 | 통합 등급/포인트 | 서비스별 혜택 운영 |

### 10.7 통합 멤버십

```
MembershipTier {
  name: string                        // "Platinum"
  min_annual_spend: decimal
  benefits: jsonb
}

CrossBenefit {
  source_business_id: FK → BusinessUnit
  target_business_id: FK → BusinessUnit
  benefit_type: enum [discount, free_upgrade, priority_access, gift]
}
```

### 10.8 소비자 경험 (Consumer-Facing)

```
[소비자 통합 앱/포털]
  ├── 통합 로그인 (SSO) — 카카오/구글/애플/이메일
  ├── 내 정보 — 프로필, 개인정보 동의, 통합 포인트, 멤버십
  ├── 서비스 허브 — 각 사업회사 서비스 딥링크
  ├── 내 이용 내역 — 전 계열사 통합 타임라인
  ├── 혜택/이벤트 — 통합 프로모션 + 개인화 추천
  └── 고객센터 — 통합 문의, AI 챗봇
```

### 10.9 개인정보보호 프레임워크

- 수집 목적 외 사용 금지, 필요 최소한만 수집, 보관 기한 설정 필수
- 동의: 목적별 + 사업회사별 세분화, 실시간 철회 가능
- 데이터 주체 권리: 열람/정정/삭제/이동 청구 자동화
- 기술적 조치: AES-256 암호화, 가명처리, 모든 조회 기록

---

## 11. 대외 마케팅 커뮤니케이션 · 매체 관리 · 반응 데이터

### 11.1 매체 분류 체계

**Paid Media (유료 매체)**

| 유형 | 채널 | 데이터 취득 | 수집 데이터 |
|---|---|---|---|
| 디지털 검색 | 네이버 SA, 구글 Ads, 카카오 키워드 | API (실시간) | 노출, 클릭, CPC, 전환, 키워드 성과 |
| 디지털 디스플레이 | GDN, 네이버 DA, 프로그래매틱(DV360, TTD) | API + 픽셀 | 노출, 클릭, 뷰스루, 도달, 빈도, 오디언스 |
| 디지털 소셜 | 메타(FB/IG), 틱톡, X, 링크드인 | 플랫폼 API | 노출, 참여, 클릭, 전환, 오디언스 인사이트 |
| 디지털 동영상 | 유튜브, 네이버 TV, OTT(CTV) | API + 픽셀 | 조회수, 시청 완료율, 참여율, 전환 |
| 디지털 커머스 | 쿠팡/네이버쇼핑 광고 | API | 노출, 클릭, ROAS, 구매전환 |
| 디지털 네이티브 | 데이블, 타불라, 스폰서드 | API + UTM | 노출, 클릭, 체류시간, 스크롤깊이 |
| TV | 지상파, 케이블, IPTV | 닐슨/TNMS | GRP, 도달률, 시청률, CPRP |
| 라디오 | 지상파, 인터넷 라디오 | 닐슨 | 청취율, 도달, 빈도 |
| 옥외(OOH) | 빌보드, 지하철, DOOH | 위치+모바일 | 통행량, 추정도달 |
| 인쇄 | 신문, 잡지, 전단지 | 발행부수+QR | 발행부수, QR스캔 |
| 인플루언서 | 유튜버, 인스타그래머 | API+트래킹 | 조회수, 참여율, 전환 |

**Owned Media**: 웹사이트, 앱, 이메일, SMS, 푸시, 카카오톡 채널, 블로그, SNS 공식계정

**Earned Media**: 언론 보도, 소셜 버즈, 리뷰/평점, 바이럴/UGC, 검색 트렌드

### 11.2 매체 마스터 데이터

```
MediaChannel {
  id: UUID
  ownership: enum [paid, owned, earned]
  category: string                    // "digital_search", "tv", "ooh"
  platform: string                    // "naver", "google", "meta"
  channel_name: string
  api_type: enum [rest, graphql, sdk, file_upload, manual, webhook]
  api_endpoint: string
  api_credentials_ref: string         // 암호화된 자격증명
  data_sync_frequency: enum [realtime, hourly, daily, weekly, manual]
  billing_model: enum [cpc, cpm, cpv, cpa, cps, flat_fee, grp_based, hybrid]
  currency: string
  available_metrics: string[]
  attribution_support: boolean
  audience_data_available: boolean
  vendor_id: FK → Partner
  contract_id: FK → Contract (nullable)
  status: enum [active, paused, archived]
}
```

### 11.3 캠페인 라이프사이클 — 10단계

```
전략 수립 → 기획 → 제작 → 검수/승인 → 집행 → 모니터링 → 최적화 → 종료/정산 → 분석/보고 → 학습/아카이브
```

```
Campaign {
  id: UUID
  business_unit_id: FK → BusinessUnit
  name: string
  code: string                        // "BU-A-2026-Q1-SPRING"
  campaign_type: enum [brand_awareness, performance, product_launch,
                       seasonal, retention, reactivation, event,
                       content_marketing, pr, integrated]

  // 전략
  objective: text
  target_audience: AudienceDefinition
  key_message: text
  value_proposition: text

  // KPI
  primary_kpi: KPIDefinition
  secondary_kpis: KPIDefinition[]

  // 예산
  total_budget: decimal
  budget_allocation: BudgetAllocation[]

  // 일정
  planning_start: date
  execution_start: date
  execution_end: date
  review_deadline: date

  // 매체·크리에이티브
  media_plan: MediaPlanEntry[]
  creatives: Creative[]
  landing_pages: LandingPage[]

  // 실적
  actual_spend: decimal
  performance_snapshot: jsonb

  // 관리
  owner_user_id: FK → User
  agency_id: FK → Partner (nullable)
  approval_status: enum [draft, pending_review, approved, rejected, live, completed]
  holding_campaign_group_id: UUID (nullable)
}

AudienceDefinition {
  name: string                        // "25-34세 수도권 여성 직장인"
  age_range: int[]
  gender: enum [all, male, female]
  location: string[]
  interests: string[]
  purchase_behavior: string[]
  media_consumption: string[]
  crm_segment_ids: UUID[]
  lookalike_source: UUID (nullable)
  estimated_reach: bigint
}

MediaPlanEntry {
  campaign_id: FK → Campaign
  media_channel_id: FK → MediaChannel
  planned_budget: decimal
  planned_period: daterange
  planned_impressions: bigint
  planned_clicks: bigint
  planned_conversions: int
  actual_spend: decimal
  actual_impressions: bigint
  actual_clicks: bigint
  actual_conversions: int
  // 효율 (자동 계산)
  cpm: decimal
  cpc: decimal
  cpa: decimal
  ctr: decimal
  cvr: decimal
  roas: decimal
  creative_ids: UUID[]
  targeting_config: jsonb
  bidding_strategy: jsonb
  status: enum [planned, setting_up, live, paused, completed]
}

Creative {
  campaign_id: FK → Campaign
  creative_type: enum [image, video, carousel, text, html5, native, audio]
  format: string                      // "1080x1080", "16:9 30s"
  title: string
  cta_text: string
  asset_id: FK → ContentAsset
  variant_group: string (nullable)    // A/B 그룹
  variant_label: string (nullable)    // "A — 감성 소구"
  legal_review_status: enum [pending, approved, rejected, revision_needed]
  brand_review_status: enum [pending, approved, rejected]
  performance: jsonb
}
```

### 11.4 반응 데이터 3개 레이어

**Layer 1: 매체 반응 데이터 (Media Response)**

```
MediaResponseData {
  campaign_id: FK → Campaign
  media_plan_id: FK → MediaPlanEntry
  media_channel_id: FK → MediaChannel
  date: date
  hour: int (nullable)

  impressions: bigint
  reach: bigint
  frequency: decimal
  clicks: bigint
  video_views: bigint (nullable)
  video_completion_rate: decimal (nullable)
  engagements: bigint (nullable)
  shares: bigint (nullable)
  comments: bigint (nullable)
  likes: bigint (nullable)
  saves: bigint (nullable)
  spend: decimal

  // 효율 (자동 계산)
  cpm: decimal
  cpc: decimal
  ctr: decimal
  cpv: decimal (nullable)
  cost_per_engagement: decimal (nullable)

  audience_breakdown: jsonb
  creative_id: FK → Creative (nullable)
  raw_data: jsonb
  data_source: string                 // "meta_api_v18", "naver_api_v5"
}
```

**Layer 2: 전환 반응 데이터 (Conversion Response)**

```
ConversionEvent {
  campaign_id: FK → Campaign
  media_channel_id: FK → MediaChannel
  creative_id: FK → Creative (nullable)

  tracking_id: string                 // gclid, fbclid, utm
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string (nullable)
  utm_term: string (nullable)

  conversion_type: enum [page_view, signup, lead, add_to_cart, purchase,
                         app_install, app_event, call, form_submit,
                         download, subscription, booking, store_visit]
  conversion_value: decimal (nullable)
  product_ids: string[] (nullable)

  anonymous_id: string
  unified_customer_id: FK → UnifiedCustomer (nullable)
  device_type: enum [desktop, mobile, tablet, ctv, other]

  click_timestamp: timestamp
  conversion_timestamp: timestamp
  time_to_conversion: interval

  attribution_model: enum [last_click, first_click, linear, time_decay, position_based, data_driven]
  attribution_credit: decimal         // 0.0~1.0
  conversion_path: jsonb
}
```

**Layer 3: 감성/인식 데이터 (Sentiment & Perception)**

```
SentimentData {
  campaign_id: FK → Campaign (nullable)
  business_unit_id: FK → BusinessUnit
  brand_id: string

  source_type: enum [social_mention, review, news_article, forum_post,
                     blog_post, comment, survey_response, call_transcript]
  source_platform: string
  source_url: string (nullable)
  original_text: text
  language: string

  // AI 분석
  sentiment_score: decimal            // -1.0 ~ +1.0
  sentiment_label: enum [very_negative, negative, neutral, positive, very_positive]
  emotion: enum [joy, trust, surprise, anticipation, anger, disgust, sadness, fear]
  topics: string[]
  entities: jsonb
  intent: enum [praise, complaint, question, suggestion, comparison, neutral]

  author_follower_count: bigint (nullable)
  estimated_reach: bigint (nullable)

  requires_response: boolean
  response_status: enum [not_needed, pending, responded, escalated]
}
```

### 11.5 매체 용어 통합 매핑

| 통합 지표 | 네이버 | 구글 | 메타 | 유튜브 | 카카오 |
|---|---|---|---|---|---|
| impressions | 노출수 | Impressions | Impressions | Impressions | 노출수 |
| unique_reach | 도달 | Users | Reach | Unique viewers | 도달수 |
| clicks | 클릭수 | Clicks | Link clicks | Clicks | 클릭수 |
| video_views | 재생수 | Views | ThruPlays | Views | 재생수 |
| conversions | 전환수 | Conversions | Results | Conversions | 전환수 |
| spend | 비용 | Cost | Amount spent | Cost | 비용 |
| engagement | 반응수 | Interactions | Engagement | Engagement | 반응수 |

### 11.6 어트리뷰션 체계

```
AttributionModel {
  type: enum [rule_based, algorithmic]
  rule_type: enum [last_click, first_click, linear, time_decay, position_based, custom]
  ml_model_id: string (nullable)      // Shapley, Markov chain
  lookback_window_days: int           // 보통 30일
  cross_device: boolean
  view_through_enabled: boolean
  view_through_window_hours: int
}

ConversionPath {
  unified_customer_id: FK → UnifiedCustomer (nullable)
  anonymous_id: string
  touchpoints: jsonb[]                // 터치포인트 시퀀스
  path_length: int
  time_to_conversion: interval
  attribution_results: {
    "last_click": { "direct": 1.0 },
    "first_click": { "naver_search": 1.0 },
    "linear": { "naver_search": 0.33, "instagram_ad": 0.33, "youtube_ad": 0.33 },
    "data_driven": { "naver_search": 0.45, "instagram_ad": 0.15, "youtube_ad": 0.40 }
  }
}

MediaMixModel {
  business_unit_id: FK → BusinessUnit
  dependent_variable: string          // "weekly_revenue"
  channel_contributions: {
    "tv": { contribution_pct: 0.25, roi: 1.8, saturation_point: 500_grp },
    "digital_search": { contribution_pct: 0.30, roi: 4.2, saturation_point: 50M },
    "digital_social": { contribution_pct: 0.15, roi: 2.1, saturation_point: 30M },
    "ooh": { contribution_pct: 0.05, roi: 0.9, saturation_point: 200M },
    "base_demand": { contribution_pct: 0.25 }
  }
  optimal_budget_allocation: jsonb
  scenario_simulations: jsonb[]
  model_accuracy: decimal
}
```

### 11.7 데이터 수집 파이프라인

```
Data Sources (매체API/웹앱SDK/소셜리스닝/미디어모니터링)
    ↓
수집 레이어 (Ingestion): API Connector(스케줄풀링, Rate limit, 재시도) + Event Stream(웹훅, SDK, 실시간큐)
    ↓
정규화 레이어 (Normalize): 매체별 다른 용어/포맷 → 통합 스키마 변환
    ↓
적재 레이어 (Load): Raw Zone → Staging → Mart
```

### 11.8 BU 마케팅 하위 조직

```
[마케팅본부]
  ├── 마케팅 전략팀 (기획, 시장분석, 고객 인사이트)
  ├── 브랜드 마케팅팀 (ATL, PR, 이벤트)
  ├── 퍼포먼스 마케팅팀 (SEM, 디스플레이, 소셜, 리타겟팅)
  ├── 콘텐츠/소셜팀 (콘텐츠 제작, SNS 운영, 인플루언서)
  ├── CRM 마케팅팀 (이메일/SMS/푸시, 세그먼트, 리텐션)
  ├── 마케팅 데이터팀 (매체 데이터, 어트리뷰션, A/B테스트)
  └── 마케팅 운영팀 (대행사 관리, 매체비 정산, 심의)
```

| 팀 | 주 사용 모듈 | 보조 모듈 |
|---|---|---|
| 마케팅 전략 | MKT-STR, MKT-ANL, DAT-BI | FIN-BUD |
| 브랜드 마케팅 | MKT-CMP, MKT-BRD, MKT-MDI | MKT-CRT, COM-APR |
| 퍼포먼스 마케팅 | MKT-PFM, MKT-MDI, MKT-ATR | MKT-ABT |
| 콘텐츠/소셜 | MKT-CNT, MKT-SOC, MKT-INF | CNT-DAM |
| CRM 마케팅 | CRM-CDP, MKT-AUT, COM-MAL | CRM-UNI |
| 마케팅 데이터 | MKT-DTA, MKT-ATR, DAT-ANL | DAT-PLT |
| 마케팅 운영 | MKT-OPS, PTN-MGT, FIN-AP | LEG-COM |

### 11.9 지주사 통합 마케팅 인텔리전스 센터

```
[그룹 CMO]
  ├── 통합 미디어 전략 (볼륨딜, 단가협상, 가이드라인, 신규 매체 리서치)
  ├── 통합 데이터/분석 (크로스BU 성과비교, MMM, ROI)
  ├── 통합 브랜드 (그룹브랜드, 통합캠페인, 위기관리)
  ├── 통합 고객 인사이트 (크로스BU 분석, CAC, 시너지)
  └── 마케팅 거버넌스 (데이터표준, 컴플라이언스, 역량지원)
```

**지주사 데이터 도메인 7개:**
1. 매체 성과 통합: BU별×매체별 성과 → 그룹 매체비/ROAS
2. 캠페인 메타 통합: BU별 캠페인 유형/결과 → 벤치마크
3. 크리에이티브 성과 통합: 소재 유형/메시지별 → 베스트 프랙티스
4. 고객 획득 통합: BU별×채널별 CAC → 그룹 획득 효율
5. 브랜드 건강도 통합: 인지도/감성/SOV → 브랜드 자산 추적
6. 매체사/대행사 통합: 거래조건/수수료 → 그룹 바잉 파워
7. 크로스 BU 시너지: 고객 이동/크로스셀링 → 시너지 정량화

**지주사 통합 대시보드:**

| 대시보드 | 주요 지표 | 주기 |
|---|---|---|
| 그룹 마케팅 총괄 | 총 매체비, ROAS, BU별 비중, ROI 비교 | 일간 |
| 매체 효율 비교 | 매체별 CPA/ROAS, BU간 성과 비교 | 일간 |
| 고객 획득 | BU별 신규 고객, CAC, 채널별 비중 | 주간 |
| 캠페인 현황 | 진행 중 캠페인, 예산 소진율, Top/Bottom | 실시간 |
| 브랜드 건강도 | 인지도, 감성 점수, SOV, 검색 트렌드 | 주간 |
| 크로스셀링 | BU 간 고객 이동률, 통합 캠페인 전환율 | 월간 |
| 벤더 관리 | 대행사별 성과, 매체사별 단가 추이 | 월간 |

### 11.10 마케팅 데이터 표준 (지주사 강제)

- **캠페인 네이밍**: `[BU코드]-[연도]-[분기]-[유형]-[이름]` (예: BUA-2026-Q1-PERF-SPRING_SALE)
- **UTM 규칙**: source=[platform], medium=[billing_model], campaign=[코드], content=[소재코드], term=[키워드]
- **KPI 정의 표준**: impression/reach/click/conversion/roas/cac 통합 정의
- **리포팅 주기**: Daily(매체raw, 소진율) / Weekly(캠페인종합, 경쟁) / Monthly(ROI, 획득분석, 브랜드트래킹) / Quarterly(MMM, 전략리뷰, 벤더평가)
- **데이터 품질 SLA**: 완전성 98%↑, T+1 오전 10시, 매체 리포트 대비 오차 5% 이내

### 11.11 외부 API 연동 허브

```
APIIntegration {
  platform_name: string
  api_version: string
  base_url: string
  auth_type: enum [oauth2, api_key, jwt, basic]
  credentials: encrypted_jsonb
  sync_direction: enum [inbound, outbound, bidirectional]
  sync_frequency: enum [realtime, every_15min, hourly, daily, weekly, manual]
  field_mappings: FieldMapping[]
  last_sync_status: enum [success, partial, failed]
  error_count_24h: int
  api_call_count_monthly: int
  api_cost_monthly: decimal
  rate_limit: int
  status: enum [active, paused, error, archived]
}
```

**연동 대상:**
- 광고 플랫폼: Google Ads, Meta, 네이버 SA, 카카오모먼트, TikTok, DV360, TTD, Criteo
- 분석/측정: GA4, Adobe Analytics, Amplitude, Mixpanel
- 모바일 어트리뷰션: AppsFlyer, Adjust, Branch
- 마케팅 자동화: Braze, Salesforce MC, HubSpot
- 소셜/리스닝: Brandwatch, Sprout Social, 와이즈트래커
- 미디어 모니터링: 키워스프레스, 닐슨코리아
- 서베이: 오픈서베이, SurveyMonkey
- CDP: 내부 CDP, Treasure Data

### 11.12 핵심 분석 시나리오

**BU 수준:**

| 시나리오 | 질문 | 분석 방법 |
|---|---|---|
| 채널 최적화 | 어떤 채널에 예산 집중? | 채널별 CPA·ROAS + 한계효율 |
| 크리에이티브 진단 | 어떤 소재가 왜 작동? | 유형·메시지·비주얼별 성과 비교 |
| 고객 획득 효율 | 1명 확보에 얼마? | CAC = 마케팅비÷신규고객 (채널별) |
| 이탈 방지 | 이탈 위험 고객에게 어떤 메시지? | 예측 모델 + A/B 테스트 |
| 캠페인 ROI | 실질 ROI는? | 증분 분석 (incrementality test) |

**지주사 수준:**

| 시나리오 | 질문 | 분석 방법 |
|---|---|---|
| BU 간 시너지 | BU-A 고객→BU-B 이용? | 크로스 BU 전환 경로, 공통 타겟 |
| 그룹 매체 효율 | 동일 매체에서 어떤 BU 최고? | BU 간 CPA/ROAS 벤치마크 |
| 바잉 파워 | 통합 바잉으로 절감액? | 개별 vs 통합 단가 시뮬레이션 |
| 브랜드 헬스 | 그룹사 브랜드 전체 건강? | 인지도·선호도·감성 통합 |
| 고객 가치 | 가장 가치 있는 고객? | 전 BU 합산 LTV, 이용 패턴 |
| 예산 최적 배분 | 그룹 예산 어떻게? | 그룹 MMM + 최적화 시뮬레이션 |

---

# Part VI. 데이터·분석·AI

---

## 12. 통합 데이터·콘텐츠 관리 및 전략 분석 조직

### 12.1 데이터 계층

```
Level 1: 원천 데이터 (Raw) — 트랜잭션, 로그, 센서, 외부 API
Level 2: 정제 데이터 (Cleansed) — 정규화, 중복 제거, 품질 검증
Level 3: 통합 데이터 (Integrated) — 크로스 도메인 조인, Golden Record
Level 4: 분석 데이터 (Analytical) — 집계, 파생 지표, 세그먼트
Level 5: 인사이트 (Insight) — AI 분석 결과, 예측, 추천
Level 6: 의사결정 (Decision) — 경영 대시보드, 자동화 액션
```

### 12.2 데이터 유형별 관리

| 유형 | 원천 | 관리 시스템 | 활용 |
|---|---|---|---|
| 트랜잭션 | ERP, POS, CRM | PostgreSQL | 매출분석, 재고 |
| 행동 데이터 | 웹/앱 로그 | Kafka → ClickHouse | 고객여정, UX |
| 문서 콘텐츠 | 기안서, 보고서 | Document DB + 검색 | 지식관리 |
| 미디어 | 이미지, 영상 | Object Storage + DAM | 마케팅, 브랜드 |
| 소셜/VOC | SNS, 리뷰, 상담 | NLP 파이프라인 | 감성분석, 트렌드 |
| IoT/센서 | 설비, 물류, 매장 | InfluxDB | 예지보전 |
| 외부 데이터 | 시장조사, 경쟁사 | Data Lake | 전략기획 |

### 12.3 통합 데이터 플랫폼

```
Data Sources → Ingestion (Batch/Streaming) → Data Lake (S3)
→ Processing (dbt+Spark) → Data Warehouse (ClickHouse)
  ├── 고객 Mart
  ├── 재무 Mart
  ├── 운영 Mart
  └── 상품 Mart
→ Intelligence Layer (ML, AI, Recommendation)
→ Serving (BI Dashboard, Self-service Query, API, AI Assistant)
```

### 12.4 콘텐츠 통합 관리 (Enterprise Content Hub)

```
ContentAsset {
  content_type: enum [document, image, video, audio, presentation, ...]
  owner_org_id: FK → Organization

  // AI 자동 추출
  ai_summary: text
  ai_keywords: string[]
  ai_entities: jsonb
  ai_classification: string[]
  embedding_vector: float[]           // 시맨틱 검색용

  access_level: enum [public, internal, department, confidential, top_secret]
  retention_policy: string
  version: int
}
```

### 12.5 전략 분석 조직 (CDO Office)

```
[CDO]
  ├── 데이터 거버넌스 (품질, 메타데이터, 개인정보, 표준)
  ├── 데이터 엔지니어링 (파이프라인, 인프라, 실시간)
  ├── 분석 (BA, 데이터 사이언티스트, BI)
  ├── AI/ML (모델 개발, NLP, 추천)
  └── 전략 인사이트 (시장분석, 고객인사이트, 경영대시보드)
```

### 12.6 전략 분석 프로세스

```
수집/정제 → 탐색적 분석 → 가설 수립 → 심층 분석:
  ├── 기술 분석: "무엇이 일어났는가"
  ├── 진단 분석: "왜 일어났는가"
  ├── 예측 분석: "앞으로 무엇이 일어날까"
  └── 처방 분석: "무엇을 해야 하는가"
→ 인사이트 보고서 → 경영진 대시보드 → 실행 → 효과 측정 (피드백 루프)
```

### 12.7 핵심 분석 도메인

| 도메인 | 핵심 질문 | 경영 반영 |
|---|---|---|
| 고객 | 핵심 고객? 왜 떠나는가? | 마케팅, CRM, 서비스 개선 |
| 재무 | 어디서 돈을 버는가? | 예산, 투자, 원가 |
| 운영 | 프로세스 효율적인가? | 프로세스 개선, 자동화 |
| 시장 | 어떻게 변하는가? | 신사업, 포지셔닝 |
| 인력 | 인재 충분? 이직 위험? | 채용, 조직, 보상 |
| 상품 | 어떤 상품이 잘 팔리는가? | 포트폴리오, 신제품 |
| 리스크 | 재무/운영/규제 리스크? | 리스크 관리, 컴플라이언스 |

### 12.8 경영 대시보드 계층

| 레벨 | 대상 | 주기 | 내용 |
|---|---|---|---|
| L1 | CEO/이사회 | 실시간+주간 | 전사 KPI, 재무, 고객, 리스크 |
| L2 | CxO/본부장 | 일간+주간 | 트랙별 핵심 지표, 이슈 |
| L3 | 부서장/팀장 | 실시간+일간 | 부서 운영, 프로젝트 |
| L4 | 구성원 | 실시간 | 내 업무, 목표 진척 |

### 12.9 AI 통합

| 기능 | 설명 |
|---|---|
| 문서 자동 요약 | 보고서, 회의록 자동 요약 |
| 스마트 검색 | 자연어 질의로 사내 문서/데이터 검색 |
| 워크플로우 추천 | 적합한 워크플로우 자동 제안 |
| 이상 탐지 | 비정상 결재, 예산 초과 조기 경보 |
| 예측 분석 | 매출, 이직, 재고 수요 예측 |
| 자연어 리포트 | "지난 분기 마케팅 ROI" → 자동 생성 |
| 자동 인사이트 | 데이터 변동 감지, 원인 분석, 권고안 |

AI 접근 데이터 범위 = **해당 사용자의 권한과 동일**하게 적용.

### 12.10 데이터 거버넌스

| 영역 | 정책 |
|---|---|
| 품질 | 완전성·정확성·일관성·적시성 SLA. 자동 스코어링 |
| 카탈로그 | 모든 데이터 자산 등록, 메타데이터, 리니지 추적 |
| 접근 | 역할 기반. 민감 데이터 별도 승인 |
| 보관 | 유형별 보관 기한. 자동 삭제/아카이빙 |
| 마스터 데이터 | 고객/상품/조직의 Single Source of Truth |

---

# Part VII. 기술·보안·UI·로드맵

---

## 13. 기술 아키텍처

### 13.1 시스템 구성도

```
[Client] Web (React/Next.js) · Mobile (RN/Flutter) · Partner Portal
    │
[API Gateway] — Auth (OAuth 2.0 + SAML SSO), Rate Limiting
    │
[Application Layer — Microservices]
    ├── Core: Auth, User, Permission, Notification
    ├── Resource: HR Core, Time Core, Finance Core
    ├── Track Modules: Operations / Business / Support / Partner / Common
    ├── Platform: Workflow Engine, Report/BI, Search (ES), AI/ML, File Storage
    └── Integration: External API, Webhook, ETL
    │
[Message Queue] — Kafka / RabbitMQ
    │
[Data Layer]
    ├── Primary DB: PostgreSQL
    ├── Document DB: MongoDB
    ├── Cache: Redis
    ├── Search: Elasticsearch
    ├── File: S3-compatible
    └── Analytics: ClickHouse / BigQuery
```

### 13.2 모듈 통신

| 유형 | 방식 | 시점 |
|---|---|---|
| 동기 | gRPC / REST | 권한 확인, 데이터 조회 |
| 비동기 | Kafka Topic | 상태 변경 전파 |
| 워크플로우 | 워크플로우 엔진 | 크로스-트랙 오케스트레이션 |
| 배치 | Airflow | 급여, 마감, 보고서 |

### 13.3 멀티테넌시

```
Tenant {
  id: UUID
  name: string              // "○○그룹"
  subdomain: string         // "xxgroup.eus.com"
  plan: enum [standard, enterprise]
}
```

모든 테이블에 `tenant_id` + RLS(Row Level Security) 적용.

### 13.4 통합 감사 로그

```
AuditLog {
  timestamp: timestamptz
  user_id: FK → User
  org_id: FK → Organization
  module_code: string
  action: enum [create, read, update, delete, approve, reject, login, export]
  entity_type: string
  entity_id: UUID
  before_state: jsonb
  after_state: jsonb
  ip_address: inet
}
```

---

## 14. 보안 설계

### 14.1 인증

| 항목 | 방식 |
|---|---|
| SSO | SAML 2.0 / OpenID Connect |
| MFA | TOTP, SMS, 하드웨어 키 |
| 세션 | JWT + Refresh Token (Rolling) |
| 비밀번호 | 최소 12자, 복잡도, 90일 변경 |
| IP 제한 | 관리자 페이지 화이트리스트 |

### 14.2 데이터 보호

| 항목 | 방식 |
|---|---|
| 전송 암호화 | TLS 1.3 |
| 저장 암호화 | AES-256 |
| 개인정보 | 마스킹, 비식별화, 접근 로그 |
| 백업 | 일일 자동, 30일 보관, 지역 분산 |
| 재해 복구 | RPO 1시간, RTO 4시간 |

---

## 15. UI/UX 설계 원칙

### 15.1 화면 구성

```
┌──────────────────────────────────────────┐
│  GNB: [로고] [검색] [알림] [AI] [프로필]  │
├──────┬───────────────────────────────────┤
│ LNB  │  Main Content Area                │
│      │  (조직별 대시보드 / 모듈 / 워크플로우) │
│ 트랙  │                                   │
│ 모듈  │                                   │
│ 즐찾  │                                   │
├──────┴───────────────────────────────────┤
│  Status Bar / Quick Actions              │
└──────────────────────────────────────────┘
```

### 15.2 핵심 원칙

1. **역할 기반 홈**: 자기 역할에 맞는 대시보드가 첫 화면
2. **모듈 내비게이션**: 자기 조직에 할당된 모듈만 LNB에 노출
3. **통합 검색**: 사람/문서/결재/데이터를 한 번에
4. **알림 센터**: 결재, 워크플로우, 멘션, 마감 통합
5. **AI 어시스턴트**: 플로팅 위젯으로 어디서든 접근

---

## 16. 개발 로드맵

| Phase | 기간 | 내용 |
|---|---|---|
| **0: 기반** | 3개월 | 아키텍처, 인증/인가, 사용자/조직, 모듈 프레임워크, DB, CI/CD |
| **1: 코어** | 4개월 | 3대 자원 서비스, 전자결재, 워크플로우(단일트랙), 공통 모듈, Culture Engine |
| **2: 운영** | 3개월 | HR 클러스터, Finance 클러스터, 감사/법무, 평가/보상, 크로스-트랙 워크플로우 |
| **3: 사업** | 4개월 | 마케팅 전체(매체, 퍼포먼스, 콘텐츠, 어트리뷰션), 영업, CRM, 통합고객 |
| **4: 지원** | 3개월 | R&D/개발, 생산(MES, QC), 디자인, 물류(WMS, TMS, SCM) |
| **5: 확장** | 3개월 | 파트너 트랙, AI 통합, BI/리포트, 모바일, 외부 API, 데이터 플랫폼 |
| **6: 지주사** | 3개월 | 통합 CRM(Golden Record, 멤버십), 마케팅 인텔리전스, MMM, 브랜드 건강도 |
| **7: 안정화** | 지속 | 성능 튜닝, 보안 감사, 사용성 테스트, 피드백 기반 개선 |

**예상 총 기간: ~23개월 (Phase 0~6) + 지속 안정화**

---

## 17. 핵심 성공 지표

| 지표 | 목표 |
|---|---|
| 시스템 가용성 | 99.9% uptime |
| 페이지 로딩 | 2초 이내 |
| 워크플로우 처리 시간 | 기존 대비 50% 단축 |
| 모듈 활성화 시간 | 새 조직에 30분 이내 배포 |
| 사용자 만족도 | NPS 40+ |
| 크로스-트랙 자동화율 | 70% 이상 |
| 매체 데이터 수집 완전성 | 98% 이상 |
| Identity Resolution 정확도 | 95% 이상 |
| 크로스 BU 시너지 매출 | 전체 매출 대비 10%+ |
| 문화 건강도 | 양식 준수율 90%+, 피드백 월 평균 3건+ |

---

*WIO — Enterprise Unified System*
*총 모듈: ~100개 | 17개 챕터 | 7개 Part*
*원본: EUS v2.0 통합본 + 보강 3-2 → WIO 아키텍처 재구조화*

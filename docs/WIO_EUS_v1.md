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

### 1.4 핵심 개념 정의

이 시스템을 구성하는 핵심 개념 8가지와 그 관계.

#### 개념 정의

| 개념 | 정의 | 비유 | 예시 |
|------|------|------|------|
| **트랙 (Track)** | 기업의 대분류 업무 영역. 7개 트랙이 회사 전체를 포괄한다 | 건물의 **층** | 운영관리, 사업, 생산, 지원, 파트너, 공통, 시스템관리 |
| **조직 (Organization)** | 트랙 안의 실제 부서·팀·파트. 사람이 소속되는 단위 | 건물 층 안의 **방** | 마케팅본부 → 브랜드팀 → 디자인파트 |
| **모듈 (Module)** | 특정 업무를 수행하는 독립된 기능 단위. 카탈로그에서 골라 조직에 배정 | 방에 들여놓는 **가구** | 채용관리, 캠페인관리, 생산계획, 전자결재 |
| **워크플로우 (Workflow)** | 업무가 흘러가는 순서·규칙·조건. 전사 표준 또는 부서 자체 설계 | 건물의 **동선/복도** | 결재 프로세스, 채용 프로세스, 캠페인 실행 프로세스 |
| **도구 (Tool)** | 일상 업무를 수행하기 위한 생산성·협업 소프트웨어. 부서가 선택하거나 개인이 사용 | 방 안의 **문구/장비** | 게시판, 메신저, 캘린더, AI어시스턴트 |
| **권한 (Permission)** | 누가 어떤 모듈·데이터·기능에 접근할 수 있는지 결정하는 규칙 | 건물의 **출입 카드** | Super Admin, Track Admin, Member, Viewer |
| **양식 (Template)** | 기업 철학이 구조적으로 반영된 공식 문서 서식. Culture Engine과 연결 | 건물의 **표준 서류함** | 기안서, 보고서, 제안서, 회의록 |
| **대시보드 (Dashboard)** | 데이터를 시각화하여 현황을 한눈에 보여주는 화면. 역할별·계층별 다름 | 건물의 **안내 전광판** | 경영 대시보드, 부서 KPI, 개인 업무 현황 |

#### 개념 간 관계

```
트랙(Track)
  └── 조직(Organization)이 소속된다
        └── 모듈(Module)이 배정된다
              └── 양식(Template)이 적용된다
              └── 도구(Tool)가 활성화된다
        └── 워크플로우(Workflow)가 설계된다
  └── 권한(Permission)이 계층별로 적용된다
  └── 대시보드(Dashboard)가 역할별로 제공된다
```

#### 계층 관계 — 누가 세팅하고 누가 사용하는가

```
                        세팅 주체          사용자           성격
                        ──────────        ──────           ────
시스템 전체 ─┬─ 트랙     시스템관리자        -               구조
             ├─ 조직     시스템관리자/HR     -               구조
             ├─ 권한     시스템관리자        -               정책
             └─ 양식     경영기획/인사       전 직원          강제

전사 ────────── 워크플로우  경영기획          전 부서          강제 (표준 프로세스)

부서 ─────┬── 워크플로우  부서장/팀장        부서원           자율 (부서 특화)
          ├── 모듈      부서장             부서원           선택 (카탈로그에서)
          └── 도구      부서장             부서원           선택 (생산성 도구)

개인 ─────── 도구       자동 제공          본인             자유 (개인 포털)
             대시보드    자동 제공          본인             자유 (MY-HOME)
```

#### 핵심 흐름 — 세팅 순서

```
Step 1. 트랙 생성 (7개)
    ↓
Step 2. 조직 배치 (본부→팀→파트)
    ↓
Step 3. 인력 배치 (사용자를 조직에)
    ↓
Step 4. 권한 설정 (역할 템플릿 적용)
    ↓
Step 5. 모듈 배정 (조직에 필요한 모듈 활성화)
    ↓
Step 6. 전사 워크플로우 세팅 (결재, 채용, 온보딩 등 표준 프로세스)
    ↓
Step 7. 부서별 워크플로우 세팅 (부서장이 자체 프로세스 설계)
    ↓
Step 8. 도구 활성화 (부서 공통 도구 선택)
    ↓
Step 9. 개인 도구 자동 제공 (전 직원 MY Dashboard)
```

#### 실제 예시 — 마케팅팀 김대리의 하루

```
아침 09:00
  Track 6 개인 도구 → MY-HOME(내 대시보드)에서 오늘 할 일 확인
  AI 비서: "오늘 캠페인 리뷰 회의 14시, 크리에이티브 검수 기한 17시입니다"

오전 10:00
  Track 2 부서 모듈 → MKT-PFM(퍼포먼스마케팅)에서 광고 성과 확인
  Track 2 부서 도구 → COM-PRJ(프로젝트협업)에서 태스크 상태 업데이트

오후 14:00
  Track 2 부서 워크플로우 → 캠페인 리뷰 회의 (회의록 자동 생성)
  
오후 15:00
  전사 워크플로우 → COM-APR(전자결재)에서 매체비 기안 올림
  → Track 1 재무팀으로 결재 흐름

오후 17:00
  Track 2 부서 모듈 → MKT-CRT(크리에이티브관리)에서 소재 검수·승인
  Track 6 개인 도구 → HR-FBK(피드백)에서 협업한 디자이너에게 피드백

퇴근 18:00
  Track 6 개인 도구 → MY-WRK(내 업무)에서 오늘 진행 사항 자동 기록
```

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

### 4.1 7개 트랙

> **Track 1~5**: 담당 전문 부서가 운영한다. 해당 부서 소속 직원이 주로 사용.
> **Track 6**: 전 직원 대상. 모든 구성원이 사용하는 개인 업무 포털.
> **Track 7**: 시스템 관리 담당 부서(IT/전산)가 운영한다.

```
[시스템 관리자]
    │
    ├── Track 1: 운영·관리 (Operations) ─── 담당 부서 운영
    │     ├── 경영기획(Strategy): 전사 목표관리/전략 수립/사업 조정/경영 분석
    │     ├── 인사(HR): 채용/교육/인사관리/노무/업무 배정/평가 관리
    │     ├── 재무(Finance): 자금관리/투자관리/IR
    │     ├── 회계(Accounting): 재무회계/관리회계/세무
    │     ├── 법무(Legal)
    │     ├── 감사(Audit)
    │     └── 총무(General Affairs)
    │
    ├── Track 2: 사업 (Business) ─── 담당 부서 운영
    │     ├── 마케팅본부: 전략/브랜드/퍼포먼스/콘텐츠·소셜/CRM마케팅/데이터/운영
    │     ├── 영업본부: 국내/해외/기술영업
    │     ├── 사업개발(BD)
    │     └── 고객관리(CRM): 고객지원(CS)/고객성공(CX)
    │
    ├── Track 3: 생산 (Production) ─── 담당 부서 운영
    │     ├── 생산관리: 생산계획(MPS/MRP)/작업지시/생산실적
    │     ├── 공정관리(MES): 공정 모니터링/실적/불량관리
    │     ├── 품질관리(QC): 수입검사/공정검사/출하검사
    │     ├── 설비관리: 설비대장/예방보전/고장관리
    │     ├── 구매·조달: 구매요청/발주/입고/공급업체관리
    │     └── 물류·유통: 창고(WMS)/운송(TMS)/공급망(SCM)
    │
    ├── Track 4: 지원 (Support) ─── 담당 부서 운영
    │     ├── 연구소(R&D): 기초연구/응용연구/특허관리
    │     ├── 개발(Dev): 프론트/백엔드/인프라·DevOps/QA
    │     ├── 디자인(Design): UI·UX/BX·CI/영상·그래픽
    │     └── 데이터(Data): 데이터 엔지니어링/분석/AI·ML
    │
    ├── Track 5: 파트너 (Partners) ─── 담당 부서 운영
    │     ├── 내부 파트너 (계열사, 자회사)
    │     ├── 외부 파트너 (협력사, 벤더)
    │     ├── 컨설팅/어드바이저
    │     └── 프리랜서 풀
    │
    ├── Track 6: 공통 (Common) ─── 전 직원 대상
    │     ├── My Dashboard: 내 인사 기록/평가 기록/업무 현황/기안 상태
    │     ├── 소통: 이메일/메신저·채팅/게시판·사내 커뮤니티
    │     ├── 협업: 캘린더/프로젝트협업/전자결재
    │     ├── 피드백·인정: 상시 피드백/Spot Award/MVP
    │     └── AI 어시스턴트: 문서요약/번역/분석/자동화
    │
    └── Track 7: 시스템 관리 (System Admin) ─── IT/전산 부서 운영
          ├── 사용자·권한/조직 구조/모듈/워크플로우 관리
          ├── 전산·IT 인프라/장비/라이선스/네트워크
          ├── 시스템 모니터링/보안 정책/감사 로그
          └── Culture Engine (기업 철학·가치 관리)
```

### 4.2 트랙 운영 원칙

| 구분 | 트랙 | 사용자 | 관리 주체 | 성격 |
|------|------|--------|----------|------|
| 전문 트랙 | Track 1~5 | 해당 부서 직원 | 부서장 | 부서 업무 시스템 |
| 공통 트랙 | Track 6 | **전 직원** | 인사/총무 | 개인 업무 포털 |
| 관리 트랙 | Track 7 | IT/전산 직원 | CIO/IT팀장 | 시스템 인프라 |

**Track 6 — 전 직원이 매일 쓰는 화면:**

```
[내 대시보드]
    ├── 내 인사 정보 — 소속, 직급, 근속, 잔여 휴가
    ├── 내 평가 — 현재 목표 진척, 피드백 이력, 역량 점수
    ├── 내 업무 — 참여 프로젝트, 배정된 태스크, 진행 상태
    ├── 내 기안 — 올린 기안 상태(승인/반려/진행중), 결재 대기 건
    ├── 내 일정 — 캘린더, 회의, 마감
    ├── 소통 — 메일, 메신저, 알림
    └── AI 비서 — "이번 주 내 업무 요약해줘"
```

**핵심**: 각 전문 트랙(1~5)에서 관리되는 데이터가 Track 6 대시보드에 개인 기준으로 집계되어 보인다. 인사팀이 평가를 관리하지만(Track 1), 직원 본인은 자기 평가를 Track 6에서 확인한다.

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
          └── (각 사업회사는 7개 트랙 구조를 자체 보유)
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

7개 트랙 생성 → 각 트랙 하위 조직 트리(본부→팀→파트→셀) → 조직별 코드/조직장 지정

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
| STR-PLN | 경영기획 | 전사 비전/미션 관리, 중장기 전략, 연간 사업계획, 사업 포트폴리오 | 시간+돈 |
| STR-KPI | 전사목표관리 | 전사→본부→팀 목표 캐스케이딩, KPI 설정, 분기 리뷰, BSC | 시간 |
| STR-ADJ | 사업조정 | BU 간 자원 배분, 투자 우선순위, 사업 구조조정, 시너지 관리 | 돈+시간 |
| HR-REC | 채용관리 | 공고, 지원자 추적, 면접, 오퍼 | 인간 |
| HR-ATT | 근태관리 | 출퇴근, 휴가, 초과근무, 재택근무 | 인간+시간 |
| HR-WRK | 업무관리 | 업무 배정, R&R 정의, 업무 이력, 업무량 분석 → 평가 기초 데이터 | 인간+시간 |
| HR-EVL+ | 통합평가 | 성과+역량+다면평가+상시피드백 종합 (HR-WRK 데이터 기반) | 인간+시간 |
| HR-PAY | 급여관리 | 월급여 계산, 4대보험, 원천징수, 급여 명세서 | 인간+돈 |
| HR-EDU | 교육관리 | 교육과정, 수강, 이수, 자격증 | 인간+시간 |
| HR-ORG | 조직관리 | 조직도, 인사발령, 전보, 정원관리 | 인간 |
| HR-REW | 보상관리 | 연봉 테이블, 연봉 협상·조정, 호봉/직급별 기준, 승진 기준 | 인간+돈 |
| HR-INC | 인센티브·성과급 | 인센티브 정책 설계, 성과급 산정(개인/팀/전사), 분기·반기·연간 지급, 특별 보너스 | 인간+돈 |
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

> **HR 업무→평가→보상 흐름**: HR-WRK(업무 배정·이력) → 데이터 축적 → HR-EVL+(평가) → HR-REW(연봉 조정) + HR-INC(인센티브·성과급 산정) → HR-PAY(급여 지급)
> **경영기획→목표 흐름**: STR-PLN(전략) → STR-KPI(전사 목표) → 각 트랙/부서 목표로 캐스케이딩 → HR-EVL+(개인 평가와 정렬)

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

### 7.3 Track 3: 생산 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| PRD-PLN | 생산계획 | MPS, MRP, 작업지시, 생산 스케줄링 | 시간+돈 |
| PRD-MES | 공정관리 | 공정 모니터링, 실적, 불량관리, 라인 밸런싱 | 시간 |
| PRD-QC | 품질관리 | 수입검사, 공정검사, 출하검사, SPC | 시간 |
| PRD-EQP | 설비관리 | 설비대장, 예방보전, 고장관리, 예지정비(AI) | 돈+시간 |
| PRD-PRC | 구매·조달 | 구매요청, 발주, 입고, 단가관리, 공급업체 평가 | 돈+시간 |
| PRD-INV | 재고관리 | 안전재고, 재고실사, ABC분석, 자동발주 | 돈 |
| LOG-WMS | 창고관리 | 입출고, 로케이션, 피킹, 패킹 | 돈+시간 |
| LOG-TMS | 운송관리 | 배차, 배송추적, 운임정산, 라스트마일 | 돈+시간 |
| LOG-SCM | 공급망관리 | 발주, 납품, 리드타임 추적, 공급 리스크 관리 | 돈+시간 |

### 7.4 Track 4: 지원 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| RND-PRJ | 연구프로젝트 | 연구과제, 진척률, 산출물 | 시간+돈 |
| RND-PAT | 특허관리 | 출원, 등록, 갱신, 라이선싱 | 돈+시간 |
| DEV-TSK | 개발관리 | 이슈 트래커, 스프린트, 코드리뷰 | 시간 |
| DEV-REL | 배포관리 | CI/CD, 릴리즈, 롤백, 환경관리 | 시간 |
| DSG-PRJ | 디자인프로젝트 | 디자인 요청, 리뷰, 승인, 산출물 | 시간 |
| DSG-AST | 디자인자산 | 로고, 템플릿, 가이드라인 라이브러리 | — |
| DAT-PLT | 데이터플랫폼 | 수집, 파이프라인, 데이터레이크, 웨어하우스 | — |
| CNT-DAM | 디지털자산관리 | 미디어 파일, 브랜드 자산, 라이선스 | — |

### 7.5 Track 5: 파트너 모듈

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| PTN-MGT | 파트너관리 | 파트너 등록, 등급, 계약, 평가 | 인간+돈 |
| PTN-PRT | 파트너포털 | 외부 파트너 전용 접근, 문서공유 | 인간 |
| PTN-SRM | 공급업체관리 | 벤더 평가, 입찰, 선정, 성과관리 | 돈 |
| PTN-FRE | 프리랜서관리 | 인력풀, 매칭, 계약, 정산 | 인간+돈+시간 |

### 7.6 Track 6: 공통 모듈 (전 직원 대상)

> 모든 구성원이 매일 사용하는 개인 업무 포털. Track 1~5에서 관리되는 데이터가 개인 기준으로 집계되어 보인다.

**My Dashboard — 내 업무 현황**

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| MY-HOME | 내 대시보드 | 내 인사정보, 참여 프로젝트, 배정 태스크, 기안 상태, 오늘 일정 통합 뷰 | 인간+시간 |
| MY-HR | 내 인사 기록 | 소속/직급/근속, 잔여 휴가, 근태 이력, 교육 이수 현황 (HR 데이터 열람) | 인간 |
| MY-EVL | 내 평가 | 내 목표 진척, 받은 피드백, 역량 점수, 평가 이력 (HR-EVL+ 개인 뷰) | 인간 |
| MY-WRK | 내 업무 | 내가 참여 중인 프로젝트/태스크 진행 상태, 업무 이력 (HR-WRK 개인 뷰) | 인간+시간 |
| MY-APR | 내 기안 | 내가 올린 기안 상태(승인/반려/진행중), 결재 대기 건, 결재 이력 | 인간+돈 |

**소통·협업 — 전 직원 사용**

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

**피드백·인정 — 전 직원 참여**

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| HR-FBK | 피드백 | 상시 피드백 교환, 넛지, 평가 연계 | 인간 |
| HR-RCG | 인정/포상 | Spot Award, MVP, 포인트 적립/사용 | 인간+돈 |

**분석·인사이트 — 권한별 접근**

| 코드 | 모듈명 | 핵심 기능 | 자원 |
|---|---|---|---|
| COM-RPT | 리포트센터 | 대시보드, BI, 보고서 생성 | 돈+시간 |
| DAT-BI | BI 대시보드 | 계층별 대시보드, 셀프서비스, 시각화 | 돈+시간 |
| DAT-AI | AI 분석엔진 | 자동 인사이트, 이상탐지, 예측, 추천 | — |
| CNT-HUB | 콘텐츠허브 | 통합 콘텐츠, 자동 태깅, 검색, 버전 | — |
| DAT-ANL | 전략분석 | 기술/진단/예측/처방 분석, 인사이트 보고서 | 돈+시간 |

### 7.7 Track 7: 시스템 관리 모듈 (IT/전산 부서)

| 코드 | 모듈명 | 핵심 기능 |
|---|---|---|
| SYS-USR | 사용자관리 | 계정 생성/수정/비활성화, SSO |
| SYS-ROL | 역할/권한관리 | 역할 템플릿, 권한 매트릭스, 감사 |
| SYS-ORG | 조직관리 | 트랙/조직 CRUD, 조직도, 인사발령 |
| SYS-MOD | 모듈관리 | 모듈 활성화/비활성화, 조직별 할당 |
| SYS-WFL | 워크플로우관리 | 프로세스 설계, 자동화, 모니터링 |
| SYS-STR | 전산관리 | 계정, 장비, 라이선스, 네트워크 |
| SYS-MON | 시스템모니터링 | 서버, 성능, 에러, 사용량 |
| SYS-SEC | 보안관리 | 접근 정책, IP제한, 2FA, 암호화 |
| SYS-LOG | 감사로그 | 모든 변경 이력, 접근 기록, 추출 |
| SYS-CFG | 시스템설정 | 전역 설정, 메타데이터, 코드관리 |
| SYS-INT | 외부연동 | API 게이트웨이, 웹훅, 서드파티 |
| SYS-CUL | Culture Engine | 기업 철학, 가치, 원칙 관리 |
| SYS-TPL | 양식관리 | 문서 양식 생성·배포·버전, 가치 연결 |
| DAT-GOV | 데이터거버넌스 | 카탈로그, 품질, 리니지, 접근정책 |

### 7.8 Holding: 지주사 전용 모듈

| 코드 | 모듈명 | 핵심 기능 |
|---|---|---|
| HLD-MKI | 그룹마케팅인텔리전스 | 전 BU 마케팅 데이터 통합, 크로스 BU 분석 |
| HLD-MDB | 그룹미디어바잉 | 그룹 볼륨 딜, 통합 매체 계약, 단가 관리 |
| HLD-MBH | 그룹브랜드건강도 | 전 BU 브랜드 인지도/감성/SOV 통합 추적 |

**전체 모듈 수: ~100개**

---

# Part IV. 워크플로우·평가·보상

---

## 8. 워크플로우 엔진 · 업무 도구 체계

### 8.1 3계층 구조

```
Layer 1: 전사 워크플로우 ─── 경영기획/시스템관리자가 세팅
    │    회사 전체에 적용되는 표준 프로세스
    │    (결재, 채용, 온보딩, 구매, 신제품 출시 등)
    │
Layer 2: 부서별 워크플로우 ─── 부서장/팀장이 세팅
    │    각 부서 업무에 맞는 자체 프로세스
    │    (마케팅 캠페인 플로우, 개발 스프린트, 생산 공정 등)
    │
Layer 3: 업무 도구 ─── 부서 공통 도구 + 개인 도구
         부서가 선택하는 생산성·효율성 툴
         개인이 사용하는 업무 관리 툴
```

| 계층 | 세팅 주체 | 범위 | 성격 |
|------|----------|------|------|
| 전사 워크플로우 | 경영기획/시스템관리자 | 전 부서 공통 적용 | 강제 — 반드시 이 프로세스를 따름 |
| 부서별 워크플로우 | 부서장/팀장 | 해당 부서 내 적용 | 자율 — 부서 업무에 맞게 설계 |
| 부서 공통 도구 | 부서장이 선택 | 부서원 전원 사용 | 선택 — 모듈 카탈로그에서 골라 활성화 |
| 개인 업무 도구 | 개인 | 본인만 사용 | 자유 — 개인 생산성 향상 |

---

### 8.2 전사 워크플로우 — 회사가 세팅하는 표준 프로세스

경영기획 또는 시스템관리자가 설계. 모든 부서가 동일하게 따르는 프로세스.

**전사 워크플로우 목록:**

| 워크플로우 | 트리거 | 핵심 흐름 | 관련 트랙 |
|----------|--------|----------|----------|
| **전자결재** | 기안서 작성 | 기안→팀장→본부장→(금액별 분기)→CFO/CEO | 전 트랙 |
| **채용** | 채용 요청 | 부서요청→HR검토→공고→면접→오퍼→입사확정 | T1+해당부서 |
| **온보딩** | 입사확정 | (병렬) 좌석+장비+계정+교육+멘토 → 완료확인 | T1+T6+T7 |
| **퇴직** | 퇴직 신청 | 인수인계→장비반납→계정해지→정산→퇴직처리 | T1+T7 |
| **구매** | 구매요청 | 견적비교→(금액별 승인)→발주→입고→정산 | T1+T3 |
| **예산** | 연간/분기 | 부서요청→재무검토→경영진승인→배정→집행 | T1 |
| **평가** | 분기/연간 | 목표설정→중간체크인→자기평가→다면평가→보정→확정 | T1+전 트랙 |
| **보상** | 평가확정 | 평가→연봉조정안→성과급산정→경영진승인→통보→지급 | T1 |
| **신제품 출시** | 기획안 승인 | 기획→R&D→디자인→생산→물류→마케팅→영업 | T2+T3+T4 |
| **컴플라이언스** | 규제변경/정기 | 규제확인→영향분석→조치계획→실행→감사 | T1 |

**전사 워크플로우 데이터 모델:**

```
WorkflowTemplate {
  id: UUID
  name: string
  scope: enum [company, department, personal]  // ★ 범위 구분
  trigger_type: enum [manual, event, schedule, webhook]
  trigger_config: jsonb
  steps: WorkflowStep[]
  cross_track: boolean
  involved_tracks: UUID[]
  sla_hours: int
  version: int
  owner_org_id: FK → Organization   // 전사=경영기획, 부서=해당부서
  status: enum [draft, active, archived]
}

WorkflowStep {
  id: UUID
  template_id: FK → WorkflowTemplate
  order: int
  name: string
  type: enum [task, approval, notification, condition, parallel_gate, 
              timer, api_call, auto_action]
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

---

### 8.3 부서별 워크플로우 — 부서가 세팅하는 자체 프로세스

부서장/팀장이 자기 부서 업무에 맞게 설계. 전사 워크플로우 위에 부서 특화 프로세스를 얹는 구조.

**부서별 워크플로우 예시:**

| 부서 | 워크플로우 | 흐름 |
|------|----------|------|
| **마케팅** | 캠페인 실행 | 전략수립→기획→제작→검수/승인→집행→모니터링→최적화→정산→보고 |
| **마케팅** | 콘텐츠 발행 | 주제선정→초안→리뷰→수정→최종승인→발행→성과측정 |
| **영업** | 딜 프로세스 | 리드등록→자격심사→미팅→제안서→협상→계약→온보딩 |
| **개발** | 스프린트 | 백로그→스프린트계획→개발→코드리뷰→QA→배포→회고 |
| **개발** | 장애 대응 | 감지→등급분류→담당배정→대응→해결→포스트모템→재발방지 |
| **디자인** | 디자인 요청 | 요청접수→브리프확인→시안→피드백→수정→최종→납품 |
| **생산** | 생산 실행 | 작업지시→자재확인→공정투입→품질검사→완료→입고 |
| **생산** | 불량 처리 | 불량감지→원인분석→조치계획→실행→재검사→이력등록 |
| **인사** | 교육 운영 | 과정기획→강사섭외→수강모집→실행→평가→수료→이력등록 |
| **재무** | 월 마감 | 전표마감→계정조정→감가상각→세금계산→재무제표→보고 |

**부서 워크플로우 세팅 화면:**

```
[부서장 워크플로우 설정]
    ├── 템플릿 라이브러리에서 선택 (마케팅 추천 5개, 개발 추천 4개...)
    ├── 커스텀 설계 (드래그 앤 드롭 플로우 빌더)
    ├── 전사 워크플로우에 부서 단계 추가 (전사 결재 + 부서 내부 검토 단계 삽입)
    └── 활성/비활성 관리
```

---

### 8.4 부서용 공통 생산성·효율성 도구

부서장이 모듈 카탈로그에서 골라 부서에 활성화하는 업무 도구. 모든 부서가 쓸 수 있지만, 부서별로 필요한 것만 선택.

**도구 카탈로그:**

| 카테고리 | 도구 | 코드 | 설명 |
|---------|------|------|------|
| **소통** | 게시판 | COM-BRD | 부서 공지, Q&A, 자료 공유 |
| **소통** | 메신저·채팅 | COM-MSG | 부서 채널, 프로젝트 채팅 |
| **협업** | 프로젝트 관리 | COM-PRJ | 칸반, 간트, 태스크 배정, 마일스톤 |
| **협업** | 문서 공동편집 | COM-DOC | 실시간 공동 작성, 버전 관리, 댓글 |
| **협업** | 캘린더 | COM-CAL | 팀 일정, 회의실 예약, 마감 관리 |
| **업무** | **업무 캘린더** | **COM-WCL** | **주간·월간·분기·연간 업무 계획. 팀→부문→전사 상향 집계** |
| **결재** | 전자결재 | COM-APR | 기안, 승인, 합의 (전사 워크플로우 연동) |
| **지식** | 위키 | — | 부서 매뉴얼, SOP, FAQ, 온보딩 문서 |
| **분석** | 리포트 | COM-RPT | 부서 KPI 대시보드, 주간/월간 보고서 |
| **AI** | AI 어시스턴트 | COM-AI | 문서 요약, 번역, 회의록 자동 작성 |
| **교육** | LMS | — | 부서 내부 교육, 스킬 학습 |

---

**업무 캘린더 (COM-WCL) — 상세 설계**

> 팀의 주간 업무가 모이면 부문이 되고, 부문이 모이면 전사가 된다.
> 아래에서 위로 자동 집계되고, 결재자가 선택한 주요 업무만 상향 노출된다.

**4개 주기 × 3개 계층:**

| | 팀 (Team) | 부문 (Division) | 전사 (Company) |
|---|---|---|---|
| **주간** | 팀원 주간 업무 취합 | 팀 주간 → 부문 주간 자동 집계 | 부문 주간 → 전사 주간 자동 집계 |
| **월간** | 팀 월간 목표·업무 계획 | 팀 월간 → 부문 월간 집계 | 부문 월간 → 전사 월간 집계 |
| **분기** | 팀 분기 목표·핵심 과제 | 팀 분기 → 부문 분기 집계 | 부문 분기 → 전사 분기 집계 |
| **연간** | 팀 연간 계획·마일스톤 | 팀 연간 → 부문 연간 집계 | 부문 연간 → 전사 연간 집계 |

**상향 집계 원리:**

```
[팀원 A] 주간 업무 5건 ─┐
[팀원 B] 주간 업무 4건 ─┤
[팀원 C] 주간 업무 3건 ─┘
         │
         ▼
[팀 주간 캘린더] ── 12건 전체 + 팀장이 ★표시한 주요 3건
         │
         │ ★표시된 주요 업무만 상향
         ▼
[부문 주간 캘린더] ── 산하 5개 팀의 ★주요 업무 집계 (15건)
         │            + 본부장이 ★★표시한 핵심 5건
         │
         │ ★★표시된 핵심 업무만 상향
         ▼
[전사 주간 캘린더] ── 전 부문 ★★핵심 업무 집계 (20건)
                      경영진이 전사 차원에서 조망
```

**상향 선택 규칙:**

| 레벨 | 선택 권한자 | 선택 기준 | 결과 |
|------|-----------|----------|------|
| 팀 → 부문 | **팀장** | 팀 업무 중 부문 차원에서 알아야 할 것 ★표시 | 부문 캘린더에 노출 |
| 부문 → 전사 | **본부장** | 부문 업무 중 전사 차원에서 알아야 할 것 ★★표시 | 전사 캘린더에 노출 |
| 자동 상향 | 시스템 | 예산 초과, SLA 위반, 마감 지연 등 이상 이벤트 | 자동으로 상위에 알림 |

**업무 캘린더 화면 구성:**

```
┌──────────────────────────────────────────────────────────────┐
│  업무 캘린더                         [주간▼] [팀▼] [필터▼]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ 주간 뷰 ───────────────────────────────────────────────┐│
│  │                                                         ││
│  │  월    화    수    목    금                               ││
│  │  ───  ───  ───  ───  ───                               ││
│  │  □ 캠페인  □ 시안   □ 미팅   □ 리뷰   □ 보고서           ││
│  │    리뷰     최종     (외부)   (팀)     제출              ││
│  │  □ 데이터  □ 콘텐츠         ★ 예산    □ 주간             ││
│  │    분석     발행              기안      회고              ││
│  │                                                         ││
│  │  ★ = 상향 노출 대상 (팀장이 선택)                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ 주요 업무 요약 ────────────────────────────────────────┐│
│  │  이번 주 전체: 12건 | 완료: 3 | 진행: 7 | 지연: 2        ││
│  │  ★ 상향 보고: 3건 (예산 기안, 캠페인 리뷰, 파트너 미팅)   ││
│  │  ⚠ 지연 알림: 콘텐츠 발행 (D+2), 데이터 분석 (D+1)       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [뷰 전환] 주간 | 월간 | 분기 | 연간                         │
│  [계층 전환] 내 업무 | 팀 | 부문 | 전사  ← 권한에 따라 노출    │
└──────────────────────────────────────────────────────────────┘
```

**주기별 활용:**

| 주기 | 등록 시점 | 포함 내용 | 리뷰 시점 |
|------|----------|----------|----------|
| **주간** | 매주 월요일 (또는 금요일 차주 계획) | 이번 주 핵심 업무, 미팅, 마감, 결재 | 금요일 주간 회고 |
| **월간** | 매월 첫째 주 | 이번 달 목표, 주요 마일스톤, 예산 집행 계획 | 월말 월간 리뷰 |
| **분기** | 분기 시작 전 2주 | 분기 핵심 과제, KPI 타겟, 프로젝트 로드맵 | 분기말 평가 (HR-EVL+ 연동) |
| **연간** | 연초 (전사 목표 확정 후) | 연간 전략 과제, 연간 예산, 대형 프로젝트 | 반기/연말 경영 리뷰 |

**다른 모듈과의 연동:**

| 연동 대상 | 흐름 |
|----------|------|
| COM-CAL (일정 캘린더) | 회의·일정은 COM-CAL, 업무 계획은 COM-WCL. 하나의 뷰에서 통합 표시 |
| COM-PRJ (프로젝트) | 프로젝트 마일스톤·태스크 마감이 업무 캘린더에 자동 반영 |
| HR-WRK (업무관리) | 업무 배정 → 업무 캘린더에 자동 등록 |
| HR-EVL+ (평가) | 분기 업무 캘린더 실적 → 평가 시 자동 참조 |
| STR-KPI (전사목표) | 전사 목표 마일스톤이 전사 업무 캘린더에 자동 표시 |
| COM-APR (전자결재) | 기안 마감이 업무 캘린더에 표시. 결재 완료 시 상태 자동 갱신 |

**데이터 모델:**

```
WorkCalendarEntry {
  id: UUID
  
  // 소속
  owner_user_id: FK → User           // 등록자
  org_id: FK → Organization           // 소속 팀
  
  // 업무 내용
  title: string                       // "Q2 캠페인 기획안 제출"
  description: text
  period: enum [weekly, monthly, quarterly, annual]
  start_date: date
  end_date: date
  status: enum [planned, in_progress, completed, delayed, cancelled]
  
  // 상향 노출
  is_promoted: boolean                // ★ 팀장이 상향 선택
  promoted_by: FK → User (nullable)   // 누가 선택했는가
  promoted_at: timestamp (nullable)
  promotion_level: enum [team, division, company]  // 어디까지 올라갔는가
  
  // 연동
  project_id: FK → Project (nullable)
  task_id: FK → Task (nullable)
  approval_id: FK → Approval (nullable)
  kpi_id: FK → PerformanceGoal (nullable)
  
  // 자동 집계
  child_entries: UUID[]               // 하위 팀 업무 (부문/전사 뷰에서)
  completion_rate: decimal            // 자동 계산
  
  priority: enum [low, medium, high, critical]
  tags: string[]
}
```

**부서별 도구 조합 예시:**

| 부서 | 필수 도구 | 추가 선택 |
|------|----------|----------|
| 마케팅 | 게시판 + 메신저 + 프로젝트 + 캘린더 + 결재 | AI + 리포트 + 콘텐츠허브 |
| 영업 | 메신저 + CRM + 캘린더 + 결재 | AI + 리포트 |
| 개발 | 메신저 + 프로젝트 + 문서 + 위키 | AI |
| 생산 | 게시판 + 캘린더 + 결재 | 리포트 |
| 인사 | 게시판 + 메신저 + 캘린더 + 결재 + 문서 | AI + 리포트 |

**활성화 방식:**

```
OrgToolActivation {
  org_id: FK → Organization
  module_id: FK → Module
  activated_by: FK → User          // 부서장
  config: jsonb                     // 부서 맞춤 설정
  is_mandatory: boolean             // 필수 vs 선택
  activated_at: timestamp
  status: enum [active, suspended]
}
```

---

### 8.5 개인 업무 도구

전 직원이 Track 6(공통)에서 개인적으로 사용하는 도구. 부서와 무관하게 모든 직원에게 제공.

**개인 도구 구성:**

| 도구 | 코드 | 설명 |
|------|------|------|
| **내 대시보드** | MY-HOME | 내 인사·업무·기안·일정 통합 뷰 |
| **내 인사 기록** | MY-HR | 소속, 휴가, 근태, 교육 이력 열람 |
| **내 평가** | MY-EVL | 목표 진척, 피드백, 역량 점수 확인 |
| **내 업무** | MY-WRK | 참여 프로젝트, 배정 태스크, 진행 상태 |
| **내 기안** | MY-APR | 기안 상태 추적, 결재 대기 건 |
| **내 캘린더** | COM-CAL | 개인 일정, 회의, 마감 |
| **내 메일** | COM-MAL | 이메일 수신/발송 |
| **내 메신저** | COM-MSG | DM, 참여 채널 |
| **내 알림** | COM-NTF | 통합 알림 센터 |
| **AI 비서** | COM-AI | "이번 주 내 업무 요약해줘", 문서 작성 보조 |
| **피드백** | HR-FBK | 동료에게 피드백 주기/받기 |
| **포상** | HR-RCG | Spot Award, MVP 투표, 포인트 사용 |

**개인 도구 특징:**

```
- 부서와 무관하게 전 직원에게 자동 제공 (별도 활성화 불필요)
- 다른 트랙의 데이터를 "내 기준"으로 집계해서 보여줌
- 개인 설정 가능: 위젯 배치, 알림 규칙, 방해 금지 시간대
- AI 비서가 개인 맥락을 이해하고 응답 (내 프로젝트, 내 일정, 내 평가 기반)
```

---

### 8.6 3계층 관계도

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: 전사 워크플로우 (경영기획/시스템관리자 세팅)       │
│  결재·채용·온보딩·구매·예산·평가·보상·신제품출시·컴플라이언스  │
│  → 전 부서가 반드시 따르는 표준 프로세스                    │
├─────────────────────────────────────────────────────────┤
│  Layer 2: 부서별 워크플로우 (부서장 세팅)                   │
│  마케팅: 캠페인·콘텐츠    개발: 스프린트·장애대응            │
│  영업: 딜 프로세스        생산: 생산실행·불량처리             │
│  → 전사 워크플로우 위에 부서 특화 프로세스를 얹음             │
├──────────────────────┬──────────────────────────────────┤
│  부서 공통 도구        │  개인 업무 도구                   │
│  (부서장이 선택 활성화)  │  (전 직원 자동 제공)              │
│                      │                                  │
│  게시판·메신저·프로젝트  │  내 대시보드·내 업무·내 평가       │
│  문서·캘린더·결재       │  내 기안·내 캘린더·내 메일         │
│  위키·리포트·AI        │  알림·AI비서·피드백·포상           │
│                      │                                  │
│  부서마다 조합이 다름    │  모든 직원 동일                   │
└──────────────────────┴──────────────────────────────────┘
```

---

### 8.7 크로스-트랙 워크플로우 예시

**신제품 출시 (전사 + 부서 혼합):**
```
[사업부 기획안] → [임원 승인]                    ← 전사 결재 워크플로우
→ (병렬) [R&D 프로토타입] + [디자인 패키지]       ← 부서별 워크플로우
         + [재무 예산]                           ← 전사 예산 워크플로우
→ [생산 양산계획]                                ← 부서별 워크플로우
→ [물류 유통준비]                                ← 부서별 워크플로우
→ [마케팅 런칭]                                  ← 부서별 캠페인 워크플로우
→ [영업 판매개시]                                ← 부서별 딜 워크플로우
```

**대규모 구매 (전사 워크플로우):**
```
[구매요청] → [3사 견적비교] → 조건 분기:
  1억 미만: [팀장승인] → [발주]
  1~5억: [본부장승인] → [재무검토] → [발주]
  5억 이상: [CFO승인] → [법무검토] → [이사회보고] → [발주]
→ [입고확인] → [회계전표] → [대금지급]
```

**직원 온보딩 (전사 워크플로우):**
```
[HR 입사확정] → (자동 병렬) [총무 좌석/장비] + [전산 계정생성] + [HR 교육등록] + [팀장 멘토지정]
→ [HR 온보딩 완료확인] → [전사 알림]
```

### 8.8 워크플로우 모니터링 대시보드

| 지표 | 설명 |
|------|------|
| 진행 중 건수 | 현재 실행 중인 워크플로우 수 |
| 병목 스텝 | 평균 대기시간이 가장 긴 스텝 |
| SLA 위반 건수 | 기한 초과한 워크플로우 |
| 부서별 처리 시간 | 각 조직의 평균 스텝 처리 시간 |
| 자동화율 | 자동 처리된 스텝 비율 |

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
    ├── Track Modules: Operations / Business / Production / Support / Partner / Common
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

## 15. 통합 업무 플랫폼 — 구조와 사용자 경험

### 15.1 개념 정립 — "회사 포털"이 아니다

| 용어 | 의미 | 이 시스템과의 차이 |
|------|------|------------------|
| 회사 포털 (Portal) | 정보를 모아 보여주는 게시판형 인트라넷 | 정보 열람 중심. 업무는 다른 도구에서 |
| 그룹웨어 (Groupware) | 결재·메일·게시판 중심 협업 도구 | 소통 중심. 업무 프로세스 관리 약함 |
| ERP | 재무·인사·생산 등 기간 업무 시스템 | 기능 중심. 사용자 경험 약함 |
| **통합 업무 플랫폼 (Enterprise Work Platform)** | **정보 + 소통 + 프로세스 + 도구가 하나의 플랫폼에서 작동** | **← 이 시스템** |

> **EUS는 "회사 포털"이 아니라 "통합 업무 플랫폼"이다.**
> 직원이 이 플랫폼 하나로 출근부터 퇴근까지 모든 업무를 수행한다.
> 정보를 보는 곳이 아니라 **일하는 곳**이다.

**포털과의 핵심 차이:**

```
포털: 로그인 → 공지 확인 → 결재 올림 → 나머지는 다른 시스템에서 작업
EUS: 로그인 → 내 업무 전체가 여기 있음 → 소통·결재·프로젝트·분석 전부 여기서
```

---

### 15.2 직원이 보는 화면 — 4계층 구조

직원이 로그인하면 자기 역할에 맞는 화면을 본다. 동일한 플랫폼이지만 **보이는 것이 다르다.**

```
┌─────────────────────────────────────────────────────────────┐
│                    EUS 통합 업무 플랫폼                        │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Level 1: 전사 (Company)                               │  │
│  │  CEO/이사회/경영기획이 보는 화면                          │  │
│  │  전사 KPI · 전 부문 현황 · 재무 총괄 · 전략 진척          │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Level 2: 부문/본부 (Division)                          │  │
│  │  본부장/CxO가 보는 화면                                 │  │
│  │  소관 부서 현황 · 부문 KPI · 프로젝트 포트폴리오          │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Level 3: 부서/팀 (Department/Team)                     │  │
│  │  부서장/팀장이 보는 화면                                 │  │
│  │  팀 업무 현황 · 팀원 업무 배분 · 부서 워크플로우 · 부서 도구 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  Level 4: 개인 (Individual)                             │  │
│  │  모든 직원이 보는 화면                                   │  │
│  │  내 업무 · 내 일정 · 내 기안 · 내 평가 · 소통 · AI 비서    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**같은 사람이 여러 레벨을 동시에 볼 수 있다.** 본부장은 Level 2(소관 부서 현황)와 Level 4(자기 업무)를 모두 사용한다. 팀장은 Level 3(팀 관리)와 Level 4(개인 업무)를 오간다.

---

### 15.3 계층별 대시보드 상세

#### Level 1: 전사 대시보드 — CEO/이사회/경영기획

```
[전사 대시보드]
    │
    ├── 경영 현황
    │     ├── 매출/이익 실시간 (FIN 연동)
    │     ├── 전사 KPI 진척률 (STR-KPI 연동)
    │     ├── 부문별 성과 비교
    │     └── 리스크 알림 (이상치 자동 감지)
    │
    ├── 인력 현황
    │     ├── 전사 인원 · 충원율 · 이직률 (HR 연동)
    │     ├── 부문별 인력 배분
    │     └── 핵심 인재 리텐션 지표
    │
    ├── 고객 현황
    │     ├── 신규 고객 · CAC · LTV (CRM 연동)
    │     ├── 고객 만족도 · NPS
    │     └── 크로스 BU 시너지 (지주사)
    │
    ├── 전략 진척
    │     ├── 연간 전략 과제 진행률 (STR-PLN 연동)
    │     ├── 신사업/투자 파이프라인
    │     └── 경쟁 동향 요약
    │
    └── AI 인사이트
          ├── "이번 주 가장 주목할 변화"
          ├── 자동 이상 탐지 보고
          └── 자연어 질의 ("마케팅 ROI 보여줘")
```

#### Level 2: 부문/본부 대시보드 — 본부장/CxO

```
[부문 대시보드]
    │
    ├── 소관 부서 현황
    │     ├── 부서별 KPI 달성률
    │     ├── 진행 중 프로젝트 · 예산 소진율
    │     ├── 부서별 인원 · 업무량 · 병목
    │     └── 부서 간 워크플로우 상태
    │
    ├── 부문 성과
    │     ├── 매출/비용/이익 (부문 단위)
    │     ├── 전사 목표 대비 정렬도
    │     └── 전 분기 대비 추이
    │
    ├── 결재/승인 대기
    │     ├── 내 결재 대기 건
    │     ├── 금액별 분류
    │     └── SLA 위반 임박 건 알림
    │
    └── 부문 리포트
          ├── 주간/월간 자동 생성 보고서
          └── 경영진 보고용 요약 (AI 생성)
```

#### Level 3: 부서/팀 대시보드 — 부서장/팀장

```
[부서 대시보드]
    │
    ├── 팀 업무 현황
    │     ├── 팀원별 업무 배분 (HR-WRK 연동)
    │     ├── 프로젝트별 진행률 · 마감 임박 태스크
    │     ├── 업무량 히트맵 (과부하/여유 시각화)
    │     └── 이번 주 완료 · 지연 · 신규 건수
    │
    ├── 부서 워크플로우
    │     ├── 진행 중 워크플로우 상태
    │     ├── 병목 스텝 표시
    │     └── 자동화율 · 평균 처리시간
    │
    ├── 부서 도구 (부서장이 선택한 활성 도구)
    │     ├── 게시판 · 메신저 · 프로젝트관리
    │     ├── 캘린더 · 문서 · 결재
    │     └── 부서 전용 모듈 (예: 마케팅→MKT-PFM)
    │
    ├── 팀원 관리
    │     ├── 출근/휴가/재택 현황
    │     ├── 피드백 교환 현황
    │     ├── 교육 이수 현황
    │     └── 평가 진행 상태
    │
    └── 부서 KPI
          ├── 부서 목표 진척률
          ├── 주요 지표 추이 그래프
          └── 전사 목표와의 정렬도
```

#### Level 4: 개인 화면 — 전 직원 (MY-HOME)

개인 화면은 두 영역으로 나뉜다. **권한 기반 영역**(나만 보이는 것)과 **공통 영역**(전 직원 누구나 접근).

##### A. 권한 기반 영역 — 내 권한에 따라 보이는 것이 다르다

```
┌──────────────────────────────────────────────────────────────────┐
│  내 업무 공간 (권한 기반 — 나만 보임)                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📋 내 담당업무 (MY-WRK)                                    ││
│  │                                                             ││
│  │  내가 배정받은 업무 목록                                       ││
│  │  ├── 업무명 · 담당역할(주담당/참여) · 상태 · 마감일            ││
│  │  ├── 업무별 진행률 바                                        ││
│  │  ├── 이번 주 완료 3건 · 진행 중 5건 · 지연 1건               ││
│  │  └── 업무 이력 (과거 완료 건 아카이브)                         ││
│  │                                                             ││
│  │  → 권한: 나에게 배정된 업무만 보임                             ││
│  │  → 팀장은 팀원 업무도 볼 수 있음 (Level 3 전환)               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📁 투입된 프로젝트 (MY-PRJ)                                 ││
│  │                                                             ││
│  │  내가 참여 중인 프로젝트 카드                                  ││
│  │  ├── 프로젝트명 · 내 역할(PM/멤버/리뷰어) · 진행률           ││
│  │  ├── 내 태스크 (칸반: To Do / In Progress / Done)            ││
│  │  ├── 프로젝트 타임라인 (내 마일스톤 강조)                      ││
│  │  ├── 프로젝트 팀원 목록 · 최근 활동                           ││
│  │  └── 시수 자동 집계 (이번 주 투입 시간)                        ││
│  │                                                             ││
│  │  → 권한: 내가 투입된 프로젝트만 보임                           ││
│  │  → 다른 부서 프로젝트에 참여해도 여기에 통합 표시               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📝 내 기안·결재 (MY-APR)                                    ││
│  │                                                             ││
│  │  [내가 올린 기안]                                             ││
│  │  ├── 기안명 · 유형 · 상태(진행중/승인/반려) · 현재 결재자      ││
│  │  ├── 결재 진행 단계 시각화 (●―●―○―○)                        ││
│  │  └── 반려 사유 · 재기안 버튼                                  ││
│  │                                                             ││
│  │  [내가 결재해야 할 건] ← 결재 권한이 있는 직급만 노출           ││
│  │  ├── 대기 건수 배지                                          ││
│  │  ├── 기안명 · 기안자 · 금액 · 긴급 여부                       ││
│  │  └── 즉시 승인/반려/보류 버튼                                  ││
│  │                                                             ││
│  │  → 권한: 일반 직원은 "올린 기안"만, 팀장 이상은 "결재 대기"도   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  👤 내 인사 정보 (MY-HR)                                     ││
│  │                                                             ││
│  │  소속: 마케팅본부 > 브랜드팀 > 디자인파트                       ││
│  │  직급: 대리 · 입사일: 2023.03.02 · 근속: 3년 27일             ││
│  │  잔여 휴가: 연차 8일 / 보상휴가 2일                            ││
│  │  근태: 이번 달 지각 0회 · 재택 4일 · 초과근무 12시간            ││
│  │  교육: 이수 3건 / 필수 미이수 1건(마감 D-14)                   ││
│  │  역량 태그: #브랜딩 #디자인시스템 #Figma                       ││
│  │                                                             ││
│  │  → 권한: 본인 정보만 열람. 수정은 HR 통해서만                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📊 내 평가 (MY-EVL)                                        ││
│  │                                                             ││
│  │  [이번 기 목표]                                               ││
│  │  ├── 목표 1: 브랜드 리뉴얼 완료 ──── 진척 75% ████████░░     ││
│  │  ├── 목표 2: 디자인 가이드라인 v2 ── 진척 40% ████░░░░░░     ││
│  │  └── 목표 3: 후배 멘토링 3명 ─────── 진척 67% ██████░░░░     ││
│  │                                                             ││
│  │  [받은 피드백] 이번 분기 7건 (칭찬 5 · 개선 2)                 ││
│  │  [역량 점수] 전문성 4.2 · 협업 4.5 · 리더십 3.8              ││
│  │  [성장 계획] IDP 2건 진행 중                                   ││
│  │                                                             ││
│  │  → 권한: 본인 평가만 열람. 팀장은 팀원 평가도 열람(Level 3)     ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

##### B. 공통 영역 — 전 직원 누구나 접근

```
┌──────────────────────────────────────────────────────────────────┐
│  공통 공간 (전 직원 동일 접근)                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📢 사내 게시판 (COM-BRD)                                    ││
│  │                                                             ││
│  │  [전사 공지] CEO 메시지, 인사발령, 정책 변경 ← 전 직원 열람    ││
│  │  [자유게시판] 사내 소통, 동호회, 장터 ← 전 직원 작성/열람       ││
│  │  [부서 게시판] 부서별 공지·자료 ← 해당 부서원만 (권한 기반)     ││
│  │  [Q&A] 업무 질문·답변 ← 전 직원 참여                         ││
│  │  [아이디어] 제안·개선 ← 전 직원 작성, 투표                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  💬 메신저 (COM-MSG)                                         ││
│  │                                                             ││
│  │  [DM] 1:1 대화 ← 전 직원 간 자유                             ││
│  │  [팀 채널] 소속 팀 채널 ← 자동 참여                            ││
│  │  [프로젝트 채널] 투입된 프로젝트별 ← 참여자만                   ││
│  │  [전사 채널] 공지·잡담·축하 ← 전 직원                         ││
│  │  [부서 채널] 부서 소통 ← 해당 부서원                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📅 일정 (COM-CAL)                                           ││
│  │                                                             ││
│  │  [내 일정] 개인 일정 ← 본인만                                  ││
│  │  [팀 일정] 팀원들 일정 겹침 뷰 ← 같은 팀                      ││
│  │  [회의실] 회의실 예약 현황 ← 전 직원                           ││
│  │  [전사 일정] 창립기념일, 워크숍, 공휴일 ← 전 직원 열람          ││
│  │  [부서 일정] 부서 행사·마감 ← 해당 부서원                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  🔔 알림 센터 (COM-NTF)                                      ││
│  │                                                             ││
│  │  결재 알림: 승인됨/반려됨/결재요청                              ││
│  │  업무 알림: 태스크 배정/마감 임박/상태 변경                      ││
│  │  멘션 알림: 게시판·메신저에서 @나                               ││
│  │  공지 알림: 전사·부서 공지 신규                                 ││
│  │  피드백 알림: 새 피드백 도착                                    ││
│  │  시스템 알림: 비밀번호 만료, 교육 미이수                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  🤝 피드백·인정 (HR-FBK + HR-RCG)                            ││
│  │                                                             ││
│  │  [피드백 보내기] 동료 선택 → 핵심가치 태그 → 내용 작성          ││
│  │  [받은 피드백] 칭찬 · 개선 · 감사 분류                         ││
│  │  [Spot Award] 동료에게 즉시 포인트 부여 ← 전 직원 참여          ││
│  │  [MVP 투표] 월간 우수자 투표 ← 전 직원 참여                    ││
│  │  [내 포인트] 적립 · 사용 · 복지몰                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📚 공통 자원                                                ││
│  │                                                             ││
│  │  [조직도] 전사 조직 트리 · 인물 검색 ← 전 직원                 ││
│  │  [사내 위키] 공개 매뉴얼 · SOP · FAQ ← 전 직원 열람            ││
│  │  [교육 센터] 수강 가능 과정 · 내 이수 현황 ← 전 직원            ││
│  │  [복지 정보] 복리후생 안내 · 제휴 혜택 ← 전 직원                ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

##### C. 권한에 따라 달라지는 것 정리

| 화면 요소 | 일반 직원 | 팀장 | 본부장 |
|----------|----------|------|--------|
| 내 담당업무 | 내 업무만 | 내 업무 + 팀원 업무(L3) | 내 업무 + 부문 전체(L2) |
| 투입 프로젝트 | 내가 참여한 것만 | + 팀 프로젝트 전체 | + 부문 프로젝트 전체 |
| 기안·결재 | 올린 기안만 | + 팀원 기안 결재 | + 부문 기안 결재 |
| 인사 정보 | 본인만 | + 팀원 출근/휴가 열람 | + 부문 인력 현황 |
| 평가 | 본인 평가만 | + 팀원 평가 관리 | + 부문 평가 총괄 |
| 게시판 | 전사+소속부서 | 동일 | + 부문 전체 부서 |
| 메신저 채널 | 참여 채널만 | + 팀 전체 채널 | + 부문 전체 채널 |
| 일정 | 내 일정+팀일정+공개일정 | + 팀원 상세 일정 | + 부문 일정 전체 |
| 부서 모듈 | 소속 부서 활성 모듈 | + 모듈 설정 권한 | + 부문 전체 모듈 열람 |
| 보고서/BI | 개인 리포트 | + 팀 리포트 | + 부문 리포트 |

---

### 15.4 개인 화면 레이아웃 — 실제 배치

```
┌──────────────────────────────────────────────────────────────────┐
│  GNB: [로고] [🔍통합검색] [🔔알림 3] [🤖AI] [↔전환] [👤김대리]    │
├────────┬─────────────────────────────────────────────────────────┤
│  LNB   │                                                        │
│        │  ┌─── 권한 기반 영역 ──────────────────────────────┐   │
│ ★ HOME │  │                                                │   │
│ ────── │  │  [AI 아침 브리핑]        [오늘 일정 3건]         │   │
│ 내 업무  │  │  "오늘 집중할 3가지:     09:00 팀 스탠드업       │   │
│ 내 프로젝트│  │   1. 브랜드 시안 최종    14:00 캠페인 리뷰       │   │
│ 내 기안  │  │   2. 기안 결재 2건      17:00 크리에이티브 마감   │   │
│ 내 인사  │  │   3. 피드백 1건 확인"                           │   │
│ 내 평가  │  │                                                │   │
│ ────── │  │  [마감 임박]                                    │   │
│ 소통    │  │  🔴 D-1 브랜드 시안 v3 최종                     │   │
│  메일   │  │  🟡 D-3 캠페인 보고서                           │   │
│  메신저  │  │                                                │   │
│  게시판  │  │  [내 프로젝트 요약]                              │   │
│ ────── │  │  브랜드 리뉴얼 ████████░░ 75%  태스크 3/8       │   │
│ 부서모듈  │  │  Q2 캠페인   ████░░░░░░ 40%  태스크 2/12      │   │
│  캠페인  │  │                                                │   │
│  퍼포먼스 │  │  [내 기안 상태]                                 │   │
│  크리에이티브│  │  ✅ 출장비 청구 — 승인 완료                     │   │
│ ────── │  │  ⏳ 매체비 기안 — 본부장 결재 대기                 │   │
│ 공통도구  │  │  ❌ 인력충원 — 반려 (사유 보기)                   │   │
│  캘린더  │  │                                                │   │
│  문서    │  └────────────────────────────────────────────────┘   │
│  결재    │                                                        │
│ ────── │  ┌─── 공통 영역 ──────────────────────────────────┐   │
│ 피드백   │  │                                                │   │
│ 조직도   │  │  [새 알림]              [새 메시지]             │   │
│ 위키    │  │  📢 전사공지: 4월 워크숍  💬 김팀장: 시안 확인 요청│   │
│ 교육    │  │  🤝 피드백 도착 1건      💬 프로젝트채널: 3건     │   │
│ ────── │  │                                                │   │
│ ⭐ 즐찾  │  │  [전사 게시판 최신]      [피드백·인정]           │   │
│        │  │  · 4월 복지 안내         받은 피드백 7건          │   │
│        │  │  · 사내 동호회 모집       내 포인트 1,200P        │   │
│        │  │  · Q1 경영 현황 공유     MVP 투표 진행 중         │   │
│        │  │                                                │   │
│        │  └────────────────────────────────────────────────┘   │
├────────┴─────────────────────────────────────────────────────────┤
│  Quick: [✏️기안] [➕태스크] [📅회의] [💬DM] [🤖AI에게 질문]        │
└──────────────────────────────────────────────────────────────────┘
```

**LNB 구성 원칙:**

| 섹션 | 내용 | 권한 |
|------|------|------|
| **HOME** | 통합 대시보드 (위 레이아웃) | 전 직원 |
| **내 업무** | 담당업무, 프로젝트, 기안, 인사, 평가 | 본인 데이터 (권한 기반) |
| **소통** | 메일, 메신저, 게시판 | 전 직원 (게시판 일부는 부서별) |
| **부서 모듈** | 부서에 활성화된 전용 모듈 | 소속 부서원만 |
| **공통 도구** | 캘린더, 문서, 결재 | 전 직원 |
| **공통 자원** | 피드백, 조직도, 위키, 교육 | 전 직원 |
| **즐겨찾기** | 개인이 핀한 자주 쓰는 메뉴 | 개인 설정 |

**메인 콘텐츠 영역 구성:**
- **상단**: AI 브리핑 + 오늘 일정 (시간순)
- **중단 좌**: 마감 임박 태스크 (긴급도순) + 프로젝트 요약 + 기안 상태
- **중단 우**: 부서 모듈 퀵 액세스 (활성 모듈 바로가기)
- **하단**: 알림 + 메시지 + 게시판 최신 + 피드백·인정

**위젯 커스터마이징**: 직원이 위젯 배치·크기·표시 여부를 개인 설정 가능. 자주 안 쓰는 위젯은 숨기고, 중요한 위젯은 크게.

```
출근 ──→ 로그인
          │
          ▼
     [내 대시보드] ← 첫 화면. 오늘 할 일이 한눈에.
          │
          ├─ 소통이 필요하면 ──→ 메신저 · 메일 · 게시판
          │
          ├─ 업무를 하면 ──→ 부서 모듈 (마케팅→캠페인, 개발→스프린트, 생산→공정)
          │                    │
          │                    └─ 업무 진행이 자동으로 기록됨 (HR-WRK)
          │
          ├─ 결재가 필요하면 ──→ 전자결재 (전사 워크플로우 자동 적용)
          │                       │
          │                       └─ 상위 조직으로 흐름 (팀장→본부장→CFO)
          │
          ├─ 협업이 필요하면 ──→ 프로젝트 도구 · 문서 공동편집 · 캘린더
          │
          ├─ 보고가 필요하면 ──→ AI가 초안 생성 → 양식 자동 적용 → 결재
          │
          ├─ 동료에게 피드백 ──→ 피드백 · Spot Award (Track 6)
          │
          └─ 퇴근 시 ──→ AI가 오늘 업무 자동 요약 · 내일 할 일 정리
```

---

### 15.5 부서별로 다르게 보이는 화면

같은 플랫폼이지만, 부서에 따라 **활성화된 모듈과 도구가 다르다.**

| 부서 | 메인 업무 화면 | 부서 전용 모듈 | 공통 도구 |
|------|-------------|-------------|----------|
| **마케팅** | 캠페인 현황 · 매체 성과 · 크리에이티브 검수 | MKT-PFM, MKT-CMP, MKT-ATR, MKT-SEN | 게시판+메신저+프로젝트+결재+AI |
| **영업** | 파이프라인 · 딜 현황 · 고객 미팅 | SAL-PIP, SAL-QOT, CRM-CST | 메신저+캘린더+결재+CRM |
| **개발** | 스프린트 보드 · 이슈 트래커 · 배포 현황 | DEV-TSK, DEV-REL | 메신저+프로젝트+문서+위키 |
| **생산** | 생산 실적 · 공정 모니터링 · 품질 현황 | PRD-PLN, PRD-MES, PRD-QC, PRD-EQP | 게시판+캘린더+결재 |
| **인사** | 채용 파이프라인 · 평가 진행 · 교육 현황 | HR-REC, HR-EVL+, HR-EDU, HR-INC | 게시판+메신저+결재+문서 |
| **재무** | 예산 집행 현황 · 전표 처리 · 마감 체크 | FIN-GL, FIN-BUD, FIN-AP, FIN-AR | 결재+문서+리포트 |
| **경영기획** | 전사 KPI · 전략 과제 · 사업 조정 | STR-PLN, STR-KPI, STR-ADJ | 결재+문서+리포트+AI |

### 15.6 핵심 설계 원칙

1. **역할 기반 홈**: 로그인하면 자기 역할에 맞는 대시보드가 첫 화면
2. **보이는 것만 보인다**: 자기 조직에 할당된 모듈·도구만 LNB에 노출. 권한 밖은 존재 자체를 모름
3. **권한 기반 + 공통 분리**: 내 업무(권한)와 소통·게시판·일정(공통)이 명확히 구분되되 하나의 화면에 공존
4. **한 곳에서 전부**: 정보 확인 → 업무 수행 → 결재 → 소통 → 보고가 플랫폼을 벗어나지 않음
5. **자동 기록**: 업무를 하면 이력이 자동으로 쌓임. 별도 보고·입력 최소화
6. **AI가 먼저 말한다**: 아침 브리핑, 마감 알림, 이상치 감지, 보고서 초안을 AI가 선제적으로 제공
7. **위젯 커스터마이징**: 직원이 대시보드 위젯 배치·크기·표시 여부를 개인 설정
8. **모바일 완전 대응**: 결재·메신저·알림·태스크 확인은 모바일에서도 완벽히 작동

---

### 15.7 시스템 관리 설정 화면 (Track 7 — IT/전산 부서)

> 일반 직원은 이 화면에 접근할 수 없다. 시스템 관리자(Super Admin) 또는 Track 7 소속 IT/전산 담당자만 접근.

#### 관리자 콘솔 전체 구조

```
┌──────────────────────────────────────────────────────────────────┐
│  GNB: [로고] [🔍검색] [🔔시스템알림] [👤관리자]                     │
├──────────┬───────────────────────────────────────────────────────┤
│ Admin LNB│                                                      │
│          │   Admin Main Content                                 │
│ ⚡ 대시보드│                                                      │
│ ────────│                                                      │
│ 조직 관리 │   시스템 관리자가 세팅·모니터링·운영하는 화면              │
│ 사용자 관리│                                                      │
│ 권한 관리 │                                                      │
│ ────────│                                                      │
│ 모듈 관리 │                                                      │
│ 워크플로우 │                                                      │
│ 양식 관리 │                                                      │
│ ────────│                                                      │
│ Culture  │                                                      │
│ ────────│                                                      │
│ 전산·장비 │                                                      │
│ 외부 연동 │                                                      │
│ ────────│                                                      │
│ 모니터링  │                                                      │
│ 보안     │                                                      │
│ 감사 로그 │                                                      │
│ 데이터 거버│                                                      │
│ ────────│                                                      │
│ 시스템 설정│                                                      │
└──────────┴───────────────────────────────────────────────────────┘
```

---

#### 세팅 메인 화면 — 트랙 × 모듈 비주얼 설계

> 시스템 관리의 핵심 화면. **좌측에 트랙(조직), 우측에 모듈 팔레트.**
> 트랙 안에 조직을 세팅하고, 직원을 배치하고, 모듈을 레고처럼 끼워 넣고, 워크플로우를 선으로 연결한다.

**전체 레이아웃:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  세팅 화면       [조직 모드] [모듈 모드] [워크플로우 모드] [미리보기]            │
├─────────────────────────────────────────────────┬────────────────────────────┤
│                                                 │  📦 모듈 팔레트             │
│  ┌─── Track 1: 운영·관리 ────────────────────┐ │                            │
│  │                                           │ │  ┌──────────┐              │
│  │  ┌─ 경영기획실 ─────────────────────────┐ │ │  │ HR-REC   │ 드래그해서   │
│  │  │  실장: 홍길동                        │ │ │  │ 채용관리  │ 트랙에 붙임  │
│  │  │  ├── 전략기획파트 (3명)              │ │ │  └──────────┘              │
│  │  │  └── 사업조정파트 (2명)              │ │ │  ┌──────────┐              │
│  │  └──────────────────────────────────────┘ │ │  │ HR-ATT   │              │
│  │                                           │ │  │ 근태관리  │              │
│  │  ┌─ 인사팀 ─────────────────────────────┐ │ │  └──────────┘              │
│  │  │  팀장: 김인사                        │ │ │  ┌──────────┐              │
│  │  │  ├── 채용파트 (2명)                  │ │ │  │ MKT-CMP  │              │
│  │  │  ├── 교육파트 (2명)                  │ │ │  │ 캠페인관리│              │
│  │  │  └── 노무파트 (1명)                  │ │ │  └──────────┘              │
│  │  │                                      │ │ │         ⋮                   │
│  │  │  [배정 모듈]                          │ │ │                            │
│  │  │  ┌────┐┌────┐┌────┐┌────┐┌────┐    │ │ │  필터: [전체▼]              │
│  │  │  │REC ││ATT ││WRK ││EVL+││PAY │    │ │ │  · 운영관리 (21)            │
│  │  │  └────┘└────┘└────┘└────┘└────┘    │ │ │  · 사업 (28)               │
│  │  └──────────────────────────────────────┘ │ │  · 생산 (9)                │
│  │                                           │ │  · 지원 (8)                │
│  │  ┌─ 재무팀 ──── ┐  ┌─ 회계팀 ────── ┐   │ │  · 공통 (22)               │
│  │  │  [GL][BUD]   │  │  [GL][TAX]     │   │ │  · 시스템 (14)              │
│  │  └──────────────┘  └────────────────┘   │ │                            │
│  └───────────────────────────────────────────┘ │                            │
│                                                 │                            │
│  ▶ Track 2: 사업 (접힘/펼침)                     │                            │
│  ▶ Track 3: 생산                                │                            │
│  ▶ Track 4: 지원                                │                            │
│  ⋮                                              │                            │
├─────────────────────────────────────────────────┴────────────────────────────┤
│  [저장] [되돌리기] [변경 이력] [내보내기]                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

**3가지 모드 — 탭으로 전환:**

##### 모드 1: 조직 모드 — 트랙 안에 조직·라인을 세팅한다

```
트랙 선택 → 조직 생성 → 라인 구성(부서장─파트장─담당자) → 직원 배치 → 권한 자동 적용

라인 구성 예시 (인사팀):
─────────────────────────────────────────────
  팀장: 김인사 ──────┬── 채용파트장: 이채용
                    │   ├── 박지원 (대리)
                    │   └── 최수연 (사원)
                    │
                    ├── 교육파트장: 정교육
                    │   ├── 한민수 (대리)
                    │   └── 오세진 (사원)
                    │
                    └── 노무담당: 강노무

직원 배치 시 자동 적용:
  · 팀장 → Team Lead 역할 + 팀 전체 데이터 접근
  · 파트장 → Sub-Lead 역할 + 파트 데이터 접근
  · 사원 → Member 역할 + 본인 데이터만
  · 수동 조정 가능
```

##### 모드 2: 모듈 모드 — 레고처럼 끼워 넣는다

```
우측 팔레트에서 모듈 블록을 드래그 → 좌측 조직에 드롭 → 끼워짐

블록 색상:
  ■ 파란색 = 운영관리    ■ 초록색 = 사업
  ■ 주황색 = 생산        ■ 보라색 = 지원
  ■ 회색 = 공통 (자동 제공)

인사팀에 모듈 끼운 결과:
  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐
  │REC ││ATT ││WRK ││EVL+││PAY ││EDU ││REW ││INC │
  │채용 ││근태 ││업무 ││평가 ││급여 ││교육 ││보상 ││성과급│
  └────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘

블록 클릭 → 상세 설정:
  접근 권한: 팀장(CRUD) / 파트장(CRU) / 사원(R)
  데이터 범위: 팀 내부만
  알림 규칙 / 커스텀 필드

블록 떼기: 드래그해서 팔레트로 되돌리면 해제
```

##### 모드 3: 워크플로우 모드 — 선으로 연결한다

```
캔버스에 노드를 놓고, 노드 사이를 선으로 연결해서 업무 흐름을 그린다.

노드 유형:
  ○ 시작/종료     □ 작업(입력/검토/실행)
  ◇ 조건 분기     ▮ 승인(결재)
  ═ 병렬 게이트   ⏱ 타이머
  ⚡ 자동 액션    🔔 알림

예시 — 일반 기안 결재:

  ○ 시작
   │
  □ 기안 작성 (직원)
   │
  ▮ 팀장 검토
   │
  ◇─── 금액 분기 ───┐
  │                  │
  < 1억             ≥ 1억
  │                  │
  ▮ 팀장 승인       ◇── ≥ 5억? ──┐
  │                  │            │
  │                 ▮ 본부장     ▮ CFO
  │                  │            │
  └────────┬─────────┴────────────┘
           │
          ⚡ 자동: 재무팀 전표 생성
           │
          🔔 기안자에게 승인 알림
           │
          ○ 종료

노드 클릭 → 속성 편집:
  담당자 규칙 / 타임아웃 / 에스컬레이션 / 알림
  
선 클릭 → 조건 편집:
  금액 / 유형 / 등급 / 커스텀 조건
```

**전사 결재 워크플로우 — 주요 템플릿:**

| 템플릿 | 흐름 | 분기 조건 |
|--------|------|----------|
| 일반 기안 | 기안→팀장→(금액)→본부장→CFO | 1억/5억 |
| 경비 청구 | 청구→팀장→(10만↑)재무 | 10만원 |
| 휴가 신청 | 신청→팀장→(3일↑)본부장 | 3일 |
| 구매 요청 | 요청→견적→팀장→(금액)→본부장→CFO→법무 | 1억/5억 |
| 인력 충원 | 요청→본부장→HR→경영기획→CEO | — |
| 출장 신청 | 신청→팀장→(해외)본부장→총무 | 국내/해외 |
| 계약 체결 | 초안→법무→(금액)→본부장→CFO | 1억/5억 |

---

**세팅 순서 — 관리자가 하는 일:**

```
Step 1. [조직 모드] 트랙 안에 조직·라인을 만든다
Step 2. [조직 모드] 직원을 배치한다 → 권한 자동 부여
Step 3. [모듈 모드] 모듈을 드래그해서 끼운다
Step 4. [워크플로우 모드] 선으로 업무 흐름을 그린다
Step 5. [미리보기] 특정 직원 관점에서 결과를 확인한다
```

---

#### ① 관리자 대시보드 (SYS-HOME)

시스템 전체 건강 상태를 한눈에 보는 화면.

```
[시스템 관리자 대시보드]
    │
    ├── 시스템 현황
    │     ├── 서버 상태: CPU / 메모리 / 디스크 / 네트워크
    │     ├── 응답 시간: 평균 / P95 / P99
    │     ├── 에러율: 24시간 추이 그래프
    │     ├── 동시 접속자 수 (실시간)
    │     └── 가용성: 이번 달 99.9X%
    │
    ├── 사용 현황
    │     ├── 전체 사용자 수 / 활성 사용자 (DAU/MAU)
    │     ├── 트랙별 사용자 분포
    │     ├── 모듈별 사용량 랭킹
    │     ├── 워크플로우 처리 건수 / 평균 처리 시간
    │     └── 저장소 사용량 / 잔여 용량
    │
    ├── 알림/이슈
    │     ├── 🔴 긴급: 서버 이상, 보안 위협, 데이터 오류
    │     ├── 🟡 주의: 용량 임계, 인증서 만료 임박, SLA 위반
    │     └── 🔵 정보: 신규 사용자 가입, 모듈 업데이트 완료
    │
    └── 최근 작업 로그
          ├── 관리자 최근 설정 변경 이력
          └── 예약된 작업 (배치, 백업, 마감)
```

---

#### ② 조직 관리 (SYS-ORG)

```
[조직 관리]
    │
    ├── 조직도 편집기
    │     ├── 트리뷰 기반 드래그&드롭 조직도
    │     ├── 7개 트랙 → 본부 → 팀 → 파트 → 셀 계층
    │     ├── 조직 생성 / 이름 변경 / 이동 / 비활성화
    │     ├── 조직장 지정 / 변경
    │     └── 조직 코드 자동 부여 규칙 설정
    │
    ├── 인사발령
    │     ├── 발령 유형: 전보 / 승진 / 겸직 / 파견
    │     ├── 발령 일자 / 대상자 선택 / 이동 전·후 조직
    │     ├── 일괄 발령 (Excel 업로드)
    │     └── 발령 이력 조회 / 통계
    │
    └── 정원 관리
          ├── 조직별 정원 / 현원 / 충원율
          ├── 정원 증감 요청 → 결재 연동
          └── 정원 대비 인력 배분 시각화
```

---

#### ③ 사용자 관리 (SYS-USR)

```
[사용자 관리]
    │
    ├── 사용자 목록
    │     ├── 검색/필터: 이름, 부서, 직급, 상태, 가입일
    │     ├── 계정 상태: 활성 / 휴직 / 퇴직 / 잠금
    │     └── 사용자 상세: 프로필 / 소속 / 권한 / 접속 이력
    │
    ├── 계정 생성
    │     ├── 개별 생성 (폼)
    │     ├── 일괄 생성 (Excel/CSV 업로드)
    │     └── SSO 연동 자동 생성 (SAML/OIDC)
    │
    ├── 계정 관리
    │     ├── 비밀번호 초기화
    │     ├── 계정 잠금 / 해제
    │     ├── 비활성화 / 삭제
    │     ├── 다중 소속 설정 (주 소속 + 겸직)
    │     └── 대리 권한 위임 설정
    │
    └── 접속 현황
          ├── 현재 로그인 세션 목록
          ├── 비정상 접속 감지 (이상 IP, 다중 디바이스)
          └── 장기 미접속 사용자 목록
```

---

#### ④ 권한 관리 (SYS-ROL)

```
[권한 관리]
    │
    ├── 역할 템플릿
    │     ├── 기본 제공: Super Admin / Track Admin / Org Admin / Team Lead / Member / Viewer / External
    │     ├── 커스텀 역할 생성
    │     ├── 역할별 모듈 접근 매트릭스 (CRUD 체크박스)
    │     ├── 역할별 데이터 범위 설정 (자기/팀/부서/본부/전사)
    │     └── 역할별 결재 권한 (금액 한도, 결재 유형)
    │
    ├── 사용자↔역할 매핑
    │     ├── 사용자에게 역할 배정 (다중 역할 가능)
    │     ├── 조직 배치 시 자동 역할 적용 규칙
    │     └── 일괄 역할 변경
    │
    ├── 권한 시뮬레이터
    │     ├── "이 사용자가 이 화면에서 무엇을 볼 수 있는가?" 미리보기
    │     └── 권한 충돌 감지 (겸직 시 역할 간 충돌 체크)
    │
    └── 권한 감사
          ├── 권한 변경 이력
          ├── 과도한 권한 보유자 알림
          └── 미사용 권한 정리 추천 (AI)
```

---

#### ⑤ 모듈 관리 (SYS-MOD)

```
[모듈 관리]
    │
    ├── 모듈 카탈로그
    │     ├── 전체 ~100개 모듈 목록
    │     ├── 모듈별 상태: 활성 / 비활성 / 점검 중 / 업데이트 대기
    │     ├── 모듈 상세: 기능 설명, 의존성, 버전, 변경 이력
    │     └── 신규 모듈 추가 (플러그인)
    │
    ├── 조직별 모듈 배정
    │     ├── 매트릭스 뷰: 조직(행) × 모듈(열) 체크박스
    │     ├── 트랙별 권장 모듈 세트 (추천 조합)
    │     ├── 일괄 배정 / 해제
    │     └── 모듈별 커스텀 설정 (조직마다 다른 옵션)
    │
    ├── 모듈 사용 통계
    │     ├── 모듈별 DAU / 기능별 사용 빈도
    │     ├── 미사용 모듈 감지 (활성화됐지만 안 쓰는 것)
    │     └── 모듈 간 연동 현황 (어떤 모듈이 어떤 모듈과 데이터 교환)
    │
    └── 모듈 업데이트
          ├── 업데이트 대기 목록
          ├── 변경 사항 미리보기
          ├── 롤백 옵션
          └── 업데이트 스케줄링 (업무 시간 외 자동 적용)
```

---

#### ⑥ 워크플로우 관리 (SYS-WFL)

```
[워크플로우 관리]
    │
    ├── 전사 워크플로우 설계
    │     ├── 비주얼 플로우 빌더 (드래그&드롭)
    │     │     ├── 스텝 추가: 입력/승인/알림/조건분기/병렬/타이머/API호출
    │     │     ├── 담당자 규칙: 고정/조직장 자동/라운드로빈
    │     │     ├── 조건 분기: 금액별/유형별/등급별
    │     │     ├── SLA 설정: 스텝별 처리 기한
    │     │     └── 테스트 실행 (시뮬레이션)
    │     │
    │     ├── 전사 워크플로우 템플릿 라이브러리
    │     │     ├── 결재 / 채용 / 온보딩 / 구매 / 예산 / 평가 / 보상 등
    │     │     └── 템플릿 복제 → 커스텀 수정
    │     │
    │     └── 버전 관리: 수정 이력 / 이전 버전 복원
    │
    ├── 부서 워크플로우 관리
    │     ├── 부서별 등록된 워크플로우 목록
    │     ├── 부서장이 만든 워크플로우 승인/반려
    │     └── 전사 워크플로우와 충돌 체크
    │
    ├── 워크플로우 모니터링
    │     ├── 진행 중 인스턴스 목록 (실시간)
    │     ├── 병목 스텝 하이라이트
    │     ├── SLA 위반 건 알림
    │     ├── 부서별/유형별 평균 처리 시간
    │     └── 자동화율 추이 그래프
    │
    └── 자동화 규칙
          ├── 자동 에스컬레이션 (N시간 미처리 시 상위자)
          ├── 자동 알림 (마감 D-1, D-3)
          └── 자동 후속 액션 (완료 시 다음 워크플로우 트리거)
```

---

#### ⑦ 양식·Culture Engine 관리 (SYS-TPL + SYS-CUL)

```
[양식·Culture 관리]
    │
    ├── Culture Engine 설정
    │     ├── 미션·비전 등록/수정
    │     ├── 핵심가치 관리 (3~7개)
    │     │     ├── 가치명 · 설명 · 행동 지표 · 반례
    │     │     └── 가치 아이콘 · 정렬 순서
    │     ├── 일하는 원칙 관리
    │     │     ├── 원칙명 · 적용 대상 (보고서/회의/전체)
    │     │     └── 양식 자동 적용 여부
    │     ├── 커뮤니케이션 가이드라인
    │     └── 문화 건강도 대시보드 (가치 언급 빈도, 양식 준수율, 피드백 활성도)
    │
    ├── 양식 관리
    │     ├── 양식 목록: 기안서/보고서/제안서/회의록/주간보고/피드백/경비 등
    │     ├── 양식 편집기
    │     │     ├── 섹션 추가/삭제/순서 변경
    │     │     ├── 필드 유형: 텍스트/선택/숫자/날짜/파일/핵심가치태그
    │     │     ├── 필수/선택 설정
    │     │     ├── 핵심가치 연결 설정 (어떤 필드에 가치 태그 강제)
    │     │     └── 대상별 변형 (C-Level용/팀장용/동료용 다른 구성)
    │     ├── AI 리뷰 설정
    │     │     ├── AI 검토 활성화 여부
    │     │     ├── 검토 기준 (결론 먼저, 고객 가치 명시, 수치 포함 등)
    │     │     └── 코칭 메시지 커스터마이징
    │     └── 양식 버전 관리 / 폐기
    │
    └── 온보딩 프로그램 설정
          ├── Day 1~Month 1 과정 편집
          ├── 문화 퀴즈 관리
          └── 완주율 모니터링
```

---

#### ⑧ 전산·장비·외부 연동 (SYS-STR + SYS-INT)

```
[전산·장비 관리]
    ├── 장비 대장: 노트북/모니터/폰 → 사용자 매핑 → 반납 관리
    ├── 소프트웨어 라이선스: 수량/만료일/사용자 배정
    ├── 네트워크: VPN 계정/IP 할당/Wi-Fi 설정
    └── IT 헬프데스크: 장애 신고 접수/처리/이력

[외부 연동 관리]
    ├── 연동 현황: 플랫폼별 상태(정상/오류/중지)
    ├── API 설정: 엔드포인트/인증정보/동기화 주기
    ├── 필드 매핑: 외부 데이터 ↔ 내부 스키마 매핑 규칙
    ├── 동기화 로그: 성공/실패/부분 처리 이력
    ├── API 사용량: 월간 호출수/비용/Rate Limit 현황
    └── 신규 연동 추가 위저드
```

---

#### ⑨ 모니터링·보안·감사 (SYS-MON + SYS-SEC + SYS-LOG)

```
[시스템 모니터링]
    ├── 서버 대시보드: CPU/메모리/디스크/네트워크 실시간
    ├── 애플리케이션: 응답시간/에러율/처리량 추이
    ├── DB: 쿼리 성능/커넥션 풀/슬로우 쿼리 알림
    ├── 알림 규칙: 임계값 설정 → Slack/이메일/SMS 발송
    └── 인시던트 이력: 장애 발생·대응·해결·포스트모템

[보안 관리]
    ├── 접근 정책: IP 화이트리스트/블랙리스트
    ├── MFA 설정: 전사 강제/선택, 방식(TOTP/SMS/하드웨어키)
    ├── 비밀번호 정책: 최소 길이/복잡도/변경 주기/이전 비밀번호 재사용 금지
    ├── 세션 정책: 타임아웃/동시 세션 수/디바이스 제한
    ├── 데이터 암호화: 전송(TLS)/저장(AES-256) 설정
    ├── 개인정보 관리: 마스킹 규칙/비식별화/접근 제한
    └── 보안 스캔: 취약점 자동 점검/결과/조치

[감사 로그]
    ├── 전체 로그 검색: 사용자/모듈/액션/기간별 필터
    ├── 주요 이벤트: 로그인/권한변경/데이터삭제/외부공유/대량다운로드
    ├── 이상 행위 감지: 비정상 시간 접속, 대량 조회, 권한 밖 시도 (AI)
    ├── 감사 보고서: 기간별 자동 생성
    └── 로그 보관: 3년 보관, 암호화 아카이브

[데이터 거버넌스]
    ├── 데이터 카탈로그: 전체 테이블/필드 메타데이터
    ├── 데이터 품질: 완전성/정확성/일관성 자동 스코어링
    ├── 데이터 리니지: 원천→가공→분석 흐름 시각화
    ├── 접근 정책: 민감 데이터 별도 승인 워크플로우
    └── 보관 정책: 유형별 보관 기한, 자동 삭제/아카이빙
```

---

#### ⑩ 시스템 전역 설정 (SYS-CFG)

```
[시스템 설정]
    │
    ├── 기본 설정
    │     ├── 회사명 · 로고 · 파비콘
    │     ├── 기본 언어 · 타임존 · 통화
    │     ├── 도메인 · 서브도메인
    │     └── 이메일 발신 설정 (SMTP/발신자명)
    │
    ├── 코드 관리
    │     ├── 공통 코드: 직급/직책/부서유형/계약유형 등
    │     ├── 코드 추가/수정/비활성화
    │     └── 코드 사용처 추적
    │
    ├── 알림 전역 설정
    │     ├── 알림 채널: 인앱/이메일/SMS/푸시 활성화
    │     ├── 방해 금지 시간대 (전사 기본값)
    │     └── 알림 유형별 채널 매핑
    │
    ├── 백업·복구
    │     ├── 자동 백업 스케줄 (일일/주간)
    │     ├── 백업 이력 · 용량
    │     ├── 복구 테스트 이력
    │     └── 재해 복구 설정 (RPO/RTO)
    │
    └── 라이선스·플랜
          ├── 현재 플랜 · 사용자 수 · 모듈 수
          ├── 사용량 대비 한도
          └── 플랜 변경 · 결제 관리
```

---

#### 관리자 화면 접근 권한 요약

| 화면 | Super Admin | Track Admin | Org Admin | 일반 직원 |
|------|:-----------:|:-----------:|:---------:|:---------:|
| 관리자 대시보드 | ✅ | ✅ (소관 트랙) | ❌ | ❌ |
| 조직 관리 | ✅ 전체 | ✅ 소관 트랙 | ❌ | ❌ |
| 사용자 관리 | ✅ 전체 | ✅ 소관 트랙 | ✅ 소속 조직 | ❌ |
| 권한 관리 | ✅ | ❌ | ❌ | ❌ |
| 모듈 관리 | ✅ 전체 | ✅ 소관 트랙 | ✅ 소속 조직 | ❌ |
| 워크플로우 (전사) | ✅ | ❌ | ❌ | ❌ |
| 워크플로우 (부서) | ✅ | ✅ 소관 트랙 | ✅ 소속 조직 | ❌ |
| 양식·Culture | ✅ | ❌ | ❌ | ❌ |
| 전산·장비 | ✅ | ❌ | ❌ | ❌ |
| 외부 연동 | ✅ | ❌ | ❌ | ❌ |
| 모니터링 | ✅ | ❌ | ❌ | ❌ |
| 보안 | ✅ | ❌ | ❌ | ❌ |
| 감사 로그 | ✅ | ✅ 소관 트랙 | ❌ | ❌ |
| 시스템 설정 | ✅ | ❌ | ❌ | ❌ |

---

## 16. 개발 로드맵

| Phase | 기간 | 내용 |
|---|---|---|
| **0: 기반** | 3개월 | 아키텍처, 인증/인가, 사용자/조직, 모듈 프레임워크, DB, CI/CD |
| **1: 코어** | 4개월 | 3대 자원 서비스, 전자결재, 워크플로우(단일트랙), 공통 모듈, Culture Engine |
| **2: 운영** | 3개월 | HR 클러스터, Finance 클러스터, 감사/법무, 평가/보상, 크로스-트랙 워크플로우 |
| **3: 사업** | 4개월 | 마케팅 전체(매체, 퍼포먼스, 콘텐츠, 어트리뷰션), 영업, CRM, 통합고객 |
| **4: 생산** | 3개월 | 생산계획(MPS/MRP), 공정관리(MES), 품질(QC), 설비, 구매·조달, 재고 |
| **5: 지원+물류** | 3개월 | R&D/개발, 디자인, 창고(WMS), 운송(TMS), 공급망(SCM) |
| **6: 확장** | 3개월 | 파트너 트랙, AI 통합, BI/리포트, 모바일, 외부 API, 데이터 플랫폼 |
| **7: 지주사** | 3개월 | 통합 CRM(Golden Record, 멤버십), 마케팅 인텔리전스, MMM, 브랜드 건강도 |
| **8: 안정화** | 지속 | 성능 튜닝, 보안 감사, 사용성 테스트, 피드백 기반 개선 |

**예상 총 기간: ~26개월 (Phase 0~7) + 지속 안정화**

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
*총 모듈: ~100개 | 17개 챕터 | 7개 Part | 7개 트랙*
*원본: EUS v2.0 통합본 + 보강 3-2 → WIO 아키텍처 재구조화*

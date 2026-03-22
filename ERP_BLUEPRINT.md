# Ten:One™ ERP 구축 블루프린트

> 작성일: 2026-03-20
> 목적: TenOne의 현재 단계에 맞는 ERP 구축 전략 수립

---

## 1. 현실 진단

### TenOne은 지금 어디에 있는가

| 항목 | 현실 |
|------|------|
| 조직 규모 | 실질 1인 (텐원) + YouInOne 멤버 5명 내외 |
| 수익 구조 | 아직 없음. 포트폴리오 축적 단계 |
| 운영 중인 것 | MADLeague(7개 동아리), MADLeap(5기), Badak(카톡 600명) |
| 구상/개발 중 | HeRo, YouInOne Alliance, Evolution School |
| 법인 상태 | 미확인 (개인사업자 or 법인 설립 전) |
| 본업 | HSAD BX 디렉터 (병행) |

### 핵심 질문: 지금 ERP가 필요한가?

**솔직한 답: 지금 당장은 "운영"보다 "설계"가 필요하다.**

일반적으로 ERP는 이미 돌아가는 사업의 효율을 높이기 위한 도구다.
TenOne은 아직 사업이 본격 가동되기 전이다.

그런데 — 이걸 역으로 활용할 수 있다.

**지금 ERP를 만드는 것의 진짜 가치:**
1. **사업 설계 자체를 강제한다** — 조직도, 권한, 업무 프로세스를 미리 정의하면 사업 구조가 명확해진다
2. **포트폴리오가 된다** — "우리 회사는 이런 시스템으로 운영됩니다"를 보여줄 수 있다
3. **첫 직원이 올 때 바로 쓸 수 있다** — 온보딩, 업무 프로세스가 이미 정의되어 있다
4. **대학모레 프로젝트의 데모가 된다** — 투자자/파트너에게 보여줄 실체

---

## 2. ERP 구축 전략: 3단계 접근

### Phase A: 쇼케이스 ERP (현재 ~ 2026 Q2)
> "이렇게 운영할 겁니다"를 보여주는 단계

**목적**: Mock 데이터 기반 UI 완성. 실제 운영보다 설계/시연용.

**범위**:
- ✅ 조직도, 직원 프로필 (Myverse)
- ✅ GPR 목표 관리 (캐스케이드, 평가)
- ✅ 전자결재 (기안/품의/보고)
- ✅ HR 설정 (직급/부서/근무형태)
- ✅ Finance 설정 (계정과목/예산)
- ✅ 권한 매트릭스
- 🔲 Wiki 콘텐츠 (Culture, Vrief, GPR 교육자료)

**핵심 산출물**:
- tenone.biz에서 시연 가능한 전체 UI
- 투자자/파트너 데모용

**이 단계에서 하지 않을 것**:
- 실제 DB 연동 (Mock으로 충분)
- 결제/정산 기능 (아직 거래가 없으므로)
- 복잡한 재고/물류 (제조업이 아니므로)

---

### Phase B: 실운영 ERP (2026 Q3 ~ Q4)
> "실제로 쓰기 시작하는" 단계

**전제조건**:
- TenOne 법인 설립 또는 사업자 등록
- 최소 2~3명의 실제 팀원 합류
- 첫 유료 프로젝트 수주

**범위**:
- 🔲 실제 인증 시스템 (소셜 로그인 + 이메일)
- 🔲 DB 연동 (Supabase or PostgreSQL)
- 🔲 실제 전자결재 플로우
- 🔲 CRM 실데이터 (가입 고객 + Badak 네트워크)
- 🔲 프로젝트 관리 실데이터 (MADLeague 시즌, 리제로스 등)
- 🔲 기본 회계 (경비 처리, 법인카드, 청구/지급)

**이 단계에서 중요한 것**:
- Ecount ERP 참고: 거래처 등록 → 전표 입력 → 출력물 체계
- CSO24 참고: EDI 연동, 처리일지 자동화
- 전자결재-ERP 연동 (Ecount 그룹웨어 참고)

---

### Phase C: 확장 ERP (2027~)
> "사업이 돌아가면서 필요한 것을 붙이는" 단계

**범위**:
- 🔲 HeRo 인재 매칭 시스템 연동
- 🔲 급여/원천징수 (Ecount 급여관리 참고)
- 🔲 계약 관리 (CSO24 견적→발주 플로우)
- 🔲 Analytics 대시보드 (실데이터 기반)
- 🔲 API 공개 (외부 서비스 연동)

---

## 3. TenOne ERP가 일반 ERP와 다른 점

### 일반 기업 ERP
- 제조/물류/재고 중심
- 복식부기 회계 필수
- 대량 데이터 처리

### TenOne ERP (서비스/크리에이티브 기업)
- **프로젝트 중심** — 제조가 아니라 기획/콘텐츠/이벤트
- **인재 중심** — 재고 대신 사람이 핵심 자산
- **네트워크 중심** — 거래처가 아니라 커뮤니티
- **브랜드 중심** — 여러 브랜드를 하나의 세계관으로 관리

### 따라서 TenOne ERP의 핵심 모듈은:

| 우선순위 | 모듈 | TenOne 맥락 |
|---------|------|-------------|
| ★★★ | **Project** | MADLeague 시즌, 리제로스, 콘텐츠 제작 — 일감의 단위 |
| ★★★ | **People (HR+CRM)** | 직원 + MADLeague 학생 + Badak 현업자 = 인재풀 |
| ★★★ | **GPR** | 텐원의 고유 목표관리. 다른 ERP에 없는 것 |
| ★★☆ | **Finance** | 경비, 예산, 프로젝트 정산 (간소화) |
| ★★☆ | **전자결재** | 품의/보고 — 조직이 커지면 필수 |
| ★★☆ | **Wiki** | Vrief, GPR, Culture 교육 — 온보딩의 핵심 |
| ★☆☆ | **Marketing** | 대외 마케팅/영업 — 수익 모델 가동 시 |
| ★☆☆ | **계약/정산** | 실제 거래 발생 시 |

---

## 4. 데이터 설계 (Phase B 대비)

### 핵심 엔티티

```
User (사용자)
├── Staff (직원) → employeeId, department, position, accessLevel
├── Member (개인회원) → interests, joinDate
└── Company (기업회원) → industry, size

Project (프로젝트)
├── type: MADLeague시즌 | 리제로스 | 콘텐츠 | 클라이언트 | 내부
├── team: Staff[] + Member[]
├── timeline: start, end, milestones
├── budget: planned, actual
└── deliverables: []

GPR (목표관리)
├── level: company | division | team | individual
├── goal: description, metric, target
├── plan: actions[], timeline
└── result: achievement, grade

Approval (전자결재)
├── type: 기안 | 품의 | 보고
├── drafter: User
├── approvalLine: [{approver, status, date}]
├── attachments: []
└── linkedProject?: Project

Finance
├── Expense: {requester, amount, category, approval}
├── Budget: {department, period, planned, actual}
└── Invoice: {project, client, amount, status}

Content (CRM/Marketing)
├── Contact: {name, email, source, tags}
├── Campaign: {name, channel, period, metrics}
└── Lead: {contact, stage, value}
```

---

## 5. 기술 스택 결정 (Phase B)

### 현재
- Next.js 16 + React 19 + Tailwind CSS v4
- Mock 데이터 (Context + localStorage)

### Phase B 권장

| 영역 | 선택 | 이유 |
|------|------|------|
| DB | **Supabase** (PostgreSQL) | 무료 티어 충분, Auth 내장, 실시간 기능 |
| ORM | **Prisma** | TypeScript 타입 안전, 마이그레이션 관리 |
| Auth | **Supabase Auth** | 소셜 로그인, 이메일 인증 내장 |
| Storage | **Supabase Storage** | 파일 업로드 (프로필 사진, 첨부파일) |
| 배포 | **Vercel** or **GCP Cloud Run** | 현재 GCP 스크립트 존재 |
| API | **Next.js API Routes** | 별도 백엔드 불필요 |

---

## 6. 당장 다음에 할 일 (Phase A 완성)

### 이번 주 목표
1. [x] Wiki 콘텐츠 작성 — Culture, Vrief/GPR 교육, 온보딩, 핸드북, FAQ (5페이지 완성)
2. [x] 전자결재 UI 점검 — 14개 페이지 전수 QA 완료, 에러 0
3. [x] Myverse 결재 섹션 — 핵심지표 + 결재 대기/진행/내기안 + 최근 리스트
4. [x] 조직도 디자인 — 소프트 톤 + 좌우 분할 + 클릭 상세보기

### 다음 주 목표
1. [ ] 모바일 반응형 점검
2. [ ] 전체 페이지 네비게이션 QA
3. [ ] Favicon/로고/브랜딩 최종 점검
4. [ ] GitHub 최신 push

### Phase A 완료 기준
- tenone.biz의 모든 메뉴가 클릭 가능하고 페이지가 존재한다
- 직원 로그인 → Intra → 각 모듈 탐색이 자연스럽다
- 데모 시연 시 "이게 우리 시스템입니다"라고 말할 수 있다

---

## 7. 빠진 것은 없나?

### 현재 ERP에 없지만 TenOne에 필요할 수 있는 것

| 기능 | 필요 시점 | 설명 |
|------|----------|------|
| **DAM (Draft Assembly Meeting)** | HeRo 가동 시 | 프로스포츠 드래프트식 인재 매칭 — HeRo의 핵심 |
| **콘텐츠 파이프라인** | Studio 가동 시 | 웹서치→초안→편집→배포 자동화 (5채널) |
| **커뮤니티 관리** | Badak 활성화 시 | 오픈채팅방 넘어서 자체 플랫폼 |
| **교육 LMS** | Evolution School 시 | 수강 이력, 이수 관리, 인증 |
| **계약 전자서명** | 실거래 시 | 프로젝트 계약, NDA 등 |

이것들은 Phase C에서 필요할 때 붙이면 된다. 지금 만들면 과잉 설계.

---

## 결론

TenOne ERP는 **크리에이티브/서비스 기업을 위한 완전한 ERP 플랫폼**이다.
텐원이 첫 번째 고객이고, 검증이 끝나면 다른 기업에도 제공한다.

이 ERP의 경쟁력:
1. **GPR + Vrief가 내장된 유일한 ERP** — 목표관리와 일하는 방식이 시스템에 녹아있다
2. **프로젝트·인재·네트워크 중심** — 제조업이 아닌 서비스/크리에이티브 기업에 최적화
3. **세계관 확장 가능** — MADLeague, HeRo, Badak 등 생태계 전체와 연동
4. **SaaS 판매 가능** — 완성도가 높으면 다른 기업에 판매하는 제품이 된다

한계를 두지 않는다. 완벽하게 만든다.

# Ten:One™ Universe 시스템 아키텍처

> 이 문서는 전체 시스템의 뼈대입니다. 코딩 전에 여기서 확정하고 들어갑니다.
> 마지막 업데이트: 2026-03-24

---

## 1. 핵심 컨셉

Ten:One™은 **내부 운영 도구이자 사업화 후보 플랫폼**의 집합체.
모든 모듈을 내부에서 실험하고, 검증된 것을 외부 서비스로 전환한다.

```
Ten:One™ Universe
├── 19개 퍼블릭 사이트 (브랜드별)
├── 인트라 오피스 (내부 운영)
└── 각 모듈 = 잠재적 독립 SaaS
```

---

## 2. 회원 체계

### 2.1 내부 회원 (Internal)

| 유형 | 코드 | 설명 | 가입 방식 |
|------|------|------|----------|
| **직원** | `staff` | 정규/계약 직원 | 관리자 직접 등록 |

- 회사의 모든 기능에 접근 가능 (SystemAccess로 세부 제어)
- ERP, GPR, 결재, 급여, 근태 등 내부 운영 기능 사용
- department, employee_id, system_access 필드 활성

### 2.2 외부 회원 (External)

| 유형 | 코드 | 설명 | 가입 경로 |
|------|------|------|----------|
| **파트너** | `partner` | 비즈니스 파트너, 협력사 | 관리자 초대 / 제안 |
| **얼라이언스** | `alliance` | 전략적 제휴 파트너 | 관리자 초대 |
| **MADLeaguer** | `madleaguer` | MAD League 정식 멤버 | MAD League 선발 |
| **크루** | `crew` | 프로젝트 참여 희망자 | CrewInvite 지원 |
| **일반회원** | `member` | 퍼블릭 사이트 가입자 | 자유 가입 |

### 2.3 가입 경로별 origin

```
tenone.biz     → member (기본)
madleague.net  → madleaguer 후보 → 선발 후 madleaguer
badak.biz      → member (커뮤니티)
smarcomm.co.kr → member (마케팅 도구 사용자)
hero.ne.kr     → member (커리어 서비스 사용자)
CrewInvite     → crew 후보 → 심사 후 crew
```

### 2.4 전환 경로

```
member → crew (프로젝트 지원 → 심사)
crew → madleaguer (MAD League 선발)
crew → partner (프로젝트 성과 → 파트너 제안)
partner → alliance (전략적 제휴)
외부 → staff (채용)
```

### 2.5 멀티 역할

한 사람이 여러 역할을 동시에 가질 수 있음:
- MADLeaguer이면서 크루
- 파트너이면서 MADLeaguer
- **primary_type**: 주 역할 (권한 판단 기준)
- **roles[]**: 보유한 모든 역할 배열

---

## 3. 권한 매트릭스

### 3.1 모듈별 접근 권한

| 모듈 | staff | partner | alliance | madleaguer | crew | member |
|------|-------|---------|----------|------------|------|--------|
| **Myverse** | Full | Basic | Basic | Basic | Basic | - |
| **Townity** | Full | Full | Read | Full | Full | Read |
| **Project (내부)** | Full | - | - | - | - | - |
| **Project (외부)** | - | Participate | View | Participate | Participate | - |
| **HeRo** | Full | HIT+Career | HIT | HIT+Career | HIT+Career | HIT만 |
| **Evolution School** | Full | 공개과정 | 공개과정 | 전체과정 | 공개+지정 | 공개과정 |
| **SmarComm** | Admin | 자사 대시보드 | - | - | - | Free 플랜 |
| **Wiki** | Full | 공개문서 | 공개문서 | 교육자료 | 교육자료 | - |
| **ERP** | SystemAccess | - | - | - | - | - |
| **Vridge** | Full | - | - | - | - | - |
| **BUMS** | Admin | - | - | - | - | - |

### 3.2 Myverse 세부 권한

| 기능 | staff | partner~crew |
|------|-------|-------------|
| 대시보드 | Full (출근, 결재, GPR, 급여 등) | Basic (Todo, 알림, 활동) |
| 메신저 | 전체 | 참여 중인 채널만 |
| Todo | 전체 | 본인 것만 |
| 타임시트 | O | - |
| 결재 | O | - |
| GPR | O | - |
| 근태/급여/경비 | O | - |
| 포인트 | O | O |

### 3.3 ERP 세부 권한 (staff 내부)

| 하위 모듈 | 필요 SystemAccess |
|----------|-----------------|
| HR (내부 인력관리) | `erp-hr` |
| People (외부 인적자원 → HeRo 연계) | `erp-people` |
| Finance (손익, 청구/지급, Project 연계) | `erp-finance` |
| 기안품의결재 | 모든 staff |
| 영업 솔루션 (파이프라인, 계약) | `erp-sales` |

---

## 4. 모듈 상세

### 4.1 Myverse — 개인 허브
- 개인화된 대시보드
- Ten:One Universe 내 모든 개인 활동의 접점
- 메신저, Todo, 알림, 포인트, 프로필
- staff: 출근/결재/GPR/급여/경비 추가

### 4.2 Townity — 소통
- 내외부 회원 간 커뮤니케이션
- 게시판 (공지, 자유, Q&A)
- 전체 일정
- 실시간 소통 (채팅/댓글)

### 4.3 Project — 프로젝트 관리
- **내부**: 실무 진척 관리, 손익 연계, Job별 관리, 시수/비용
- **외부**: 파트너/크루 참여 프로젝트 (직접 손익 연관 없으나 가능성 있음)
- 프로젝트 개요, 투입 인력, 손익, Job 단위 관리
- 일반적 협업 툴 기능 (칸반, 타임라인, 파일 공유)

### 4.4 HeRo — 인재 개발
- **H**uman enhancement, **R**ecruit optimization, Talent Agency
- HIT (인성적성 + 역량 통합 평가)
- 이력서 컨설팅, 커리어 개발
- 퍼스널 브랜딩 관리
- → 잠재적 SaaS: 기업용 인재 평가/매칭 플랫폼

### 4.5 Evolution School — 교육
- 내외부 대상 교육 플랫폼
- 공개 범위 및 권한 설정 (필수/전문/심화)
- 강의 신청, 이수/미이수/진행중 관리
- 교육 이력 → 회원 프로필에 적용
- → 잠재적 SaaS: 기업 교육 LMS

### 4.6 SmarComm — 마케팅 커뮤니케이션
- Ten:One + BU들의 마케팅 통합 관리
- AI 적용: 진단 → 기획 → 제작 → 실행 → 분석
- CRM: 클라이언트 + 회원 대상
- 워크스페이스 기반 (멀티 브랜드)
- → 잠재적 SaaS: 마케팅 자동화 플랫폼

### 4.7 Wiki — 지식경영
- 기업 컬처, 온보딩, 핸드북, FAQ
- 라이브러리 (지식 아카이빙)
- 문서 버전 관리
- 권한별 접근 제어

### 4.8 Vridge — 경영 전략
- 브랜딩, 비전 관리
- 경영 전략, 관리, 평가
- GPR (Goal, Performance, Review)
- Principle (원칙/가이드라인)
- staff 전용 (경영진/관리자)

### 4.9 ERP — 전사 자원 관리
- **HR**: 내부 인력 관리 (근태, 급여, 평가)
- **People**: 외부 파트너/크루 → HeRo의 인적 자원화
- **Finance**: 손익, Project 연계 지급/청구
- **일반 업무**: 기안품의결재
- **영업 솔루션**: 파이프라인, 계약 관리
- 모듈화 → 필요한 것만 활성화

### 4.10 BUMS — 사업부문 관리
- BU(사이트) 통합 관리
- 퍼블릭 사이트의 게시판/콘텐츠 관리
- 소비자 회원 정보 통합 관리
- SEO, 위젯, 사이트 설정

---

## 5. 데이터 흐름

### 5.1 회원 → 모듈 연결

```
members 테이블 (통합)
  ├── primary_type: 주 역할
  ├── roles[]: 모든 역할
  ├── origin_site: 가입 경로
  ├── affiliations[]: 소속 (MADLeague, Badak 등)
  │
  ├── Myverse: 모든 인트라 접근 회원
  ├── Townity: posts, events, comments
  ├── Project: project_members (투입 인력)
  ├── HeRo: hit_results, career_profiles
  ├── Evolution: enrollments (수강 이력)
  ├── SmarComm: workspaces (마케팅 워크스페이스)
  ├── Wiki: library_items, library_bookmarks
  ├── ERP: timesheets, approvals, payroll
  └── BUMS: bums_member_access (CMS 권한)
```

### 5.2 Project ↔ ERP Finance 연결

```
projects.billing/revenue → ERP Finance 매출
project_members.rate × hours → ERP Finance 인건비
jobs.estimated_amount → ERP Finance 외주비
```

### 5.3 HeRo ↔ ERP People 연결

```
HeRo HIT 결과 → People 프로필 강화
HeRo 커리어 개발 → People 역량 평가
People 외부 인력 → Project 투입 후보
```

---

## 6. members 테이블 v2 (재설계안)

```sql
-- 현재 account_type ENUM 확장
ALTER TYPE account_type ADD VALUE 'alliance';
ALTER TYPE account_type ADD VALUE 'madleaguer';

-- members 테이블에 추가할 컬럼
ALTER TABLE members ADD COLUMN IF NOT EXISTS
    primary_type account_type;  -- 주 역할 (기존 account_type 대체)

ALTER TABLE members ADD COLUMN IF NOT EXISTS
    roles TEXT[] DEFAULT '{}';  -- 보유한 모든 역할 ['crew', 'madleaguer']

ALTER TABLE members ADD COLUMN IF NOT EXISTS
    affiliations TEXT[] DEFAULT '{}';  -- 소속 ['madleague', 'badak']

ALTER TABLE members ADD COLUMN IF NOT EXISTS
    intra_access BOOLEAN DEFAULT false;  -- 인트라 접근 가능 여부

ALTER TABLE members ADD COLUMN IF NOT EXISTS
    module_access TEXT[] DEFAULT '{}';  -- 접근 가능 모듈 ['myverse', 'townity', 'hero']
```

---

## 7. 사업화 로드맵

각 모듈의 사업화 가능성과 우선순위:

| 모듈 | 잠재 SaaS 형태 | 사업화 우선순위 |
|------|--------------|--------------|
| SmarComm | 마케팅 자동화 | 높음 (이미 독립 사이트) |
| HeRo | 인재 평가/매칭 | 높음 |
| Evolution School | 기업 교육 LMS | 중간 |
| BUMS | 멀티사이트 CMS | 중간 |
| Project | 프로젝트 관리 | 낮음 (경쟁 치열) |
| Townity | 커뮤니티 | 낮음 |

---

## 8. 구현 우선순위

### Phase A: 회원 체계 확정 (현재)
- [ ] members 테이블 v2 마이그레이션
- [ ] 권한 체크 로직 통합 (auth-context + middleware)
- [ ] 가입 흐름: origin_site별 초기 역할 자동 설정

### Phase B: 핵심 모듈 DB 연결
- [ ] Myverse 대시보드 → 실제 데이터
- [ ] Townity 게시판/일정 → DB
- [ ] Project → DB (내부 프로젝트 관리)

### Phase C: 외부 회원 기능
- [ ] HeRo HIT → DB
- [ ] Evolution School → DB
- [ ] 퍼블릭 게시판 회원 글쓰기

### Phase D: ERP 연결
- [ ] HR: 근태/급여
- [ ] Finance: 프로젝트 손익
- [ ] 결재 시스템

### Phase E: SmarComm 독립
- [ ] 워크스페이스 기반 멀티 테넌트
- [ ] AI 파이프라인
- [ ] 구독 결제

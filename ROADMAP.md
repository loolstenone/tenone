# TenOne 프로젝트 로드맵

> 마지막 업데이트: 2026-03-19

## 현재 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| 퍼블릭 페이지 (About, Brands, History 등) | ✅ 완성 | 실제 콘텐츠 |
| 인증 (Login/Signup) | ⚠️ Mock | localStorage 기반 |
| ERP-CRM (People, Deals, Activities) | ⚠️ Mock UI | 데이터 리셋됨 |
| ERP-HR (Staff, GPR) | ⚠️ Mock UI | 데이터 리셋됨 |
| Marketing (Campaigns, Leads) | ⚠️ Mock UI | 드래그앤드롭 작동 |
| Studio (Workflow, Kanban) | ⚠️ Mock UI | 드래그앤드롭 작동 |
| Wiki | ✅ 완성 | 실제 콘텐츠 작성 완료 |
| Backend API | ❌ 없음 | API 라우트 0개 |
| Database | ❌ 없음 | ORM/스키마 없음 |
| 배포 | ❌ 미완성 | 스크립트만 존재 |
| 테스트 | ❌ 없음 | 테스트 파일 0개 |
| 환경 설정 | ❌ 없음 | .env 파일 없음 |

---

## Phase 1: 기반 인프라 (우선순위: 최고)

> 다른 모든 작업의 전제 조건

- [ ] **1-1. 환경 설정 파일 구성**
  - .env.local, .env.example 생성
  - DATABASE_URL, NEXTAUTH_SECRET 등 변수 정의

- [ ] **1-2. 데이터베이스 설정**
  - PostgreSQL 또는 Supabase 선택 및 연결
  - Prisma ORM 설치 및 스키마 설계
  - 핵심 테이블: User, Brand, Person, Organization, Staff

- [ ] **1-3. 인증 시스템 구현**
  - NextAuth.js (Auth.js) 도입
  - Credentials Provider (이메일/비밀번호)
  - 세션 관리 및 미들웨어 보호
  - 기존 mock auth 대체

- [ ] **1-4. API 라우트 기본 구조**
  - app/api/ 디렉토리 구성
  - CRUD 패턴 정의 (GET, POST, PUT, DELETE)
  - 에러 핸들링 공통 유틸

---

## Phase 2: 핵심 데이터 영속화 (우선순위: 높음)

> Mock 데이터를 실제 DB로 전환

- [ ] **2-1. Brand 데이터 DB 전환**
  - Brand 테이블 생성
  - seed 스크립트로 기존 mock 데이터 마이그레이션
  - API: GET /api/brands, POST /api/brands

- [ ] **2-2. CRM 데이터 DB 전환**
  - Person, Organization, Deal, Activity 테이블
  - 관계 설정 (Person ↔ Organization, Deal ↔ Activity)
  - API: /api/crm/people, /api/crm/organizations, /api/crm/deals

- [ ] **2-3. Staff/HR 데이터 DB 전환**
  - Staff, Goal, Evaluation 테이블
  - 역할 기반 접근 제어 적용
  - API: /api/hr/staff, /api/hr/goals

- [ ] **2-4. Marketing 데이터 DB 전환**
  - Campaign, Lead, Content 테이블
  - 리드 파이프라인 상태 관리
  - API: /api/marketing/campaigns, /api/marketing/leads

- [ ] **2-5. Workflow 데이터 DB 전환**
  - Task, Pipeline, Project, Automation 테이블
  - 칸반 보드 상태 저장
  - API: /api/workflow/tasks, /api/workflow/projects

---

## Phase 3: 프론트엔드 연동 (우선순위: 높음)

> Context → API 호출로 전환

- [ ] **3-1. API 클라이언트 유틸 작성**
  - fetch 래퍼 (에러 핸들링, 토큰 첨부)
  - SWR 또는 React Query 도입

- [ ] **3-2. 각 Context를 API 연동으로 리팩토링**
  - crm-context → API 호출
  - marketing-context → API 호출
  - workflow-context → API 호출
  - staff-context → API 호출
  - gpr-context → API 호출

- [ ] **3-3. 폼 제출 연동**
  - Contact 페이지 폼 → API 전송
  - Excel Import → 실제 파싱 및 DB 저장
  - 프로필 수정 → DB 저장

---

## Phase 4: 기능 보완 (우선순위: 중간)

- [x] **4-1. Wiki 콘텐츠 작성**
  - Culture, Onboarding, Education, Handbook, FAQ 실제 내용

- [ ] **4-2. 대시보드 실제 통계**
  - Marketing Analytics → 실제 데이터 기반 차트
  - CRM 통계 대시보드

- [ ] **4-3. 파일 업로드/에셋 관리**
  - 이미지/파일 저장소 (GCS 또는 S3)
  - Studio Assets 실제 파일 관리

- [ ] **4-4. 알림 시스템**
  - 인앱 알림
  - 이메일 알림 (선택)

---

## Phase 5: 배포 및 운영 (우선순위: 중간)

- [ ] **5-1. Docker 설정**
  - Dockerfile 작성
  - docker-compose.yml (로컬 개발용)

- [ ] **5-2. GCP Cloud Run 배포**
  - cloudbuild.yaml 작성
  - 환경별 배포 스크립트 수정
  - CI/CD 파이프라인

- [ ] **5-3. 도메인 및 SSL**
  - 커스텀 도메인 연결
  - SSL 인증서

---

## Phase 6: 품질 관리 (우선순위: 낮음, 병행 권장)

- [ ] **6-1. 테스트 환경 구성**
  - Vitest 설치 및 설정
  - 핵심 유틸 단위 테스트

- [ ] **6-2. E2E 테스트**
  - Playwright 설정
  - 로그인 → CRM → 작업 흐름 시나리오

- [ ] **6-3. 린트/포맷 강화**
  - ESLint 규칙 정비
  - Prettier 설정

---

## 작업 진행 규칙

1. 각 작업 완료 시 이 파일의 체크박스를 `[x]`로 변경
2. "사무실 작업 종료" / "집 작업 종료" 시 WORK_STATUS.md에 현황 기록
3. 작업 시작 전 `git pull`로 최신 상태 동기화

# Ten:One™ Universe 구축 로드맵

> 각 모듈을 실제 작동하는 서비스로 만들어가는 단계별 계획
> 마지막 업데이트: 2026-03-24

---

## 원칙

1. **한 번에 하나씩** — 모듈 하나를 끝까지 완성하고 다음으로
2. **DB 먼저** — UI만 있는 건 0%. 데이터가 흘러야 1%
3. **내부 사용 → 검증 → 사업화** — 텐원 직원이 실제로 쓸 수 있어야 다음 단계
4. **의존성 순서** — 회원 → 기반 모듈 → 업무 모듈 → 관리 모듈

---

## Phase 0: 기반 (완료)

| 항목 | 상태 |
|------|------|
| 멀티 사이트 19개 UI | ✅ |
| 인증 (Google 소셜 로그인) | ✅ |
| members 테이블 v2 (roles, module_access) | ✅ |
| BUMS 게시글 → DB 저장 | ✅ |
| TenOne 퍼블릭 DB 데이터 표시 | ✅ |
| 사이드바 권한 체크 | ✅ |
| 가입 시 origin_site 자동 설정 | ✅ |

---

## Phase 1: 회원 체계 완성 (1주)

**목표: 모든 모듈의 기초가 되는 회원 관리를 확정**

### 1-1. 회원 관리 UI (ERP > People)
- [ ] 전체 회원 목록 → DB (members 테이블 조회)
- [ ] 회원 상세 보기/편집 (프로필, 역할, 모듈 권한)
- [ ] 회원 유형 변경 (member → crew → partner 등)
- [ ] 역할 추가/제거 (멀티 역할)
- [ ] 소속(affiliations) 관리

### 1-2. 직원 등록 (ERP > HR)
- [ ] 관리자가 직접 staff 계정 생성
- [ ] department, employee_id, system_access 설정
- [ ] 조직도 표시 (실제 members 데이터 기반)

### 1-3. 회원 가입 흐름 고도화
- [ ] 퍼블릭 사이트별 가입 폼 차별화 (TenOne vs MADLeague vs Badak)
- [ ] CrewInvite 지원 → 심사 → crew 전환
- [ ] MADLeague 지원 → 선발 → madleaguer 전환
- [ ] 가입 후 프로필 완성 유도 페이지

### 완료 기준
- 관리자가 회원 목록에서 역할/권한을 변경하면 해당 회원의 사이드바가 즉시 바뀜
- 외부 회원이 crew 지원 → 관리자 승인 → 인트라 접근 가능

---

## Phase 2: Myverse — 개인 허브 (1주)

**목표: 로그인하면 보이는 첫 화면이 실제 데이터로 동작**

### 2-1. 대시보드 실데이터 연결
- [ ] 공지사항 위젯 → Townity posts DB
- [ ] 오늘 일정 위젯 → events DB
- [ ] 내 프로젝트 위젯 → project_members DB
- [ ] 포인트/등급 → members.total_points DB

### 2-2. Todo
- [ ] todos 테이블 생성 (member_id, title, status, due_date, project_id)
- [ ] CRUD → DB
- [ ] 프로젝트 연결 (어떤 프로젝트의 할일인지)

### 2-3. 메신저 (기본)
- [ ] Supabase Realtime 기반 채팅
- [ ] 1:1 / 그룹 채널
- [ ] 또는 Phase 후반으로 미루고, 간단한 알림 시스템 먼저

### 완료 기준
- staff 로그인 → 실제 공지/일정/프로젝트/Todo 표시
- 외부 회원 로그인 → Basic 대시보드 (Todo, 알림만)

---

## Phase 3: Townity — 소통 (1주)

**목표: 내외부 회원이 실제로 글을 쓰고 소통**

### 3-1. 게시판 완성
- [x] 공지사항 → DB 연결 (완료)
- [ ] 자유게시판 → DB 연결 (같은 패턴)
- [ ] 댓글 → DB 연결
- [ ] 글쓰기 권한 체크 (visibility 기반)

### 3-2. 일정 관리
- [ ] 캘린더 페이지 → events DB 연결
- [ ] 일정 생성/수정/삭제
- [ ] 권한별 일정 노출 (staff만, 전체 등)

### 완료 기준
- 공지사항/자유게시판에 글 쓰기 → DB 저장 → 다른 사용자에게 표시
- 캘린더에 일정 등록 → Myverse 대시보드에도 표시

---

## Phase 4: Project — 프로젝트 관리 (2주)

**목표: 실제 프로젝트를 등록하고 진행 관리**

### 4-1. 프로젝트 CRUD
- [ ] 프로젝트 목록/상세 → DB (projects 테이블, 이미 스키마 있음)
- [ ] 프로젝트 생성: 이름, 타입, 브랜드, PM, 일정, 예산
- [ ] 상태 관리 (draft → approved → in-progress → completed)

### 4-2. Job 관리
- [ ] 프로젝트 하위 Job 목록 → DB (jobs 테이블)
- [ ] Job 생성/수정: PR/ME/PT × PL/DO/RE
- [ ] 예상 시수/비용 입력

### 4-3. 인력 투입
- [ ] 프로젝트별 투입 인원 → DB (project_members 테이블)
- [ ] 역할, 계획 시수, 실제 시수, 단가
- [ ] 내부(staff) + 외부(partner/crew) 투입

### 4-4. 타임시트
- [ ] 주간 타임시트 → DB (timesheets 테이블)
- [ ] 프로젝트/Job별 시수 입력
- [ ] 제출 → 승인 흐름

### 4-5. 손익 연계
- [ ] 프로젝트 매출/비용/이익 자동 계산
- [ ] ERP Finance와 데이터 공유

### 완료 기준
- 실제 프로젝트(LUKI 2nd Single 등) 등록 → Job 분배 → 타임시트 입력 → 손익 확인

---

## Phase 5: Evolution School — 교육 (1주)

**목표: 실제 교육 과정을 등록하고 수강 관리**

### 5-1. 과정 관리
- [ ] 과정 목록/상세 → DB (courses 테이블, 이미 스키마 있음)
- [ ] 과정 생성: 제목, 카테고리, 설명, 콘텐츠(JSONB), 퀴즈
- [ ] 공개 범위 설정 (전체/staff/madleaguer 등)

### 5-2. 수강 관리
- [ ] 수강 신청 → DB (enrollments 테이블)
- [ ] 진행 상태: not-started → in-progress → quiz → completed
- [ ] 퀴즈 채점 → 합격/불합격
- [ ] 이수 시 포인트 지급

### 5-3. 회원 프로필 반영
- [ ] 이수 과목 → 회원 상세에 표시
- [ ] 필수 교육 미이수 → Myverse 대시보드에 넛지

### 완료 기준
- "Mind Set: 본질·속도·이행" 과정 등록 → 수강 → 퀴즈 → 이수 → 포인트 적립

---

## Phase 6: HeRo — 인재 개발 (2주)

**목표: HIT 검사와 커리어 관리 실제 동작**

### 6-1. HIT 통합 검사
- [ ] hit_tests 테이블 (질문, 유형, 점수 체계)
- [ ] hit_results 테이블 (member_id, 결과, 날짜)
- [ ] 검사 실시 UI → DB 저장
- [ ] 결과 리포트 생성

### 6-2. 이력서 / 커리어
- [ ] career_profiles 테이블 (경력, 스킬, 희망 직종)
- [ ] 이력서 작성 UI → DB
- [ ] AI 컨설팅 (Claude API 연동 — 미래)

### 6-3. 퍼스널 브랜딩
- [ ] 포트폴리오 페이지 생성
- [ ] 멤버 공개 프로필

### 완료 기준
- crew 가입 → HIT 검사 실시 → 결과 리포트 → 커리어 프로필 작성

---

## Phase 7: Wiki — 지식경영 (1주)

### 7-1. 문서 관리
- [ ] wiki_pages 테이블 (title, body, category, visibility)
- [ ] Culture, Onboarding, Handbook, FAQ → DB
- [ ] 마크다운 에디터

### 7-2. 라이브러리
- [ ] library_items → DB 연결 (이미 스키마 있음)
- [ ] 파일 업로드 → Supabase Storage
- [ ] 북마크 → DB

### 완료 기준
- 온보딩 문서를 Wiki에서 읽고 북마크

---

## Phase 8: ERP — 전사 자원 관리 (3주)

### 8-1. 결재
- [ ] approvals → DB 연결 (이미 스키마 있음)
- [ ] 기안 작성 → 결재 라인 → 승인/반려
- [ ] 결재 알림 → Myverse

### 8-2. HR
- [ ] 근태 관리 → DB
- [ ] 급여 관리 → DB
- [ ] 포인트 관리 → DB (point_logs)

### 8-3. Finance
- [ ] 프로젝트 손익 → projects 테이블 연계
- [ ] 경비 정산 → DB
- [ ] 청구/지급 관리

### 8-4. People (외부 인적자원)
- [ ] HeRo 데이터 연계
- [ ] 외부 인력 Pool → Project 투입 후보

### 8-5. Sales
- [ ] 영업 파이프라인 → DB
- [ ] 계약 관리

---

## Phase 9: Vridge — 경영 전략 (1주)

### 9-1. GPR
- [ ] 전사 목표 → 부서 목표 → 개인 목표 캐스케이드
- [ ] 분기별 평가/리뷰

### 9-2. Principle
- [ ] 경영 원칙/가이드라인 문서 관리
- [ ] 브랜딩/비전 관리

---

## Phase 10: SmarComm — 마케팅 (장기)

**별도 사업화 후보이므로 독립적 로드맵 필요**

### 10-1. 워크스페이스
- [ ] 멀티 테넌트 구조 (Ten:One + BU별)
- [ ] 대시보드 → 실제 마케팅 데이터

### 10-2. AI 파이프라인
- [ ] Claude API 연동
- [ ] 진단 → 기획 → 제작 → 실행 → 분석

### 10-3. CRM
- [ ] 클라이언트/회원 관리 → DB

---

## Phase 11: BUMS 고도화 (지속)

- [ ] 나머지 18개 사이트 DB 연결 (TenOne 패턴 복제)
- [ ] 퍼블릭 게시판 회원 글쓰기
- [ ] 위젯 시스템 실제 동작
- [ ] SEO 동적 관리
- [ ] Gmail → CMS 수집 파이프라인
- [ ] SNS 자동 배포 큐

---

## 타임라인 요약

| Phase | 기간 | 핵심 |
|-------|------|------|
| 0 기반 | ✅ 완료 | 인증, DB 연결, BUMS |
| 1 회원 | 1주 | 회원 관리 UI, 역할 전환 |
| 2 Myverse | 1주 | 개인 대시보드 실데이터 |
| 3 Townity | 1주 | 게시판/일정 완성 |
| 4 Project | 2주 | 프로젝트/Job/타임시트/손익 |
| 5 Evolution | 1주 | 교육 과정/수강/이수 |
| 6 HeRo | 2주 | HIT 검사/커리어/브랜딩 |
| 7 Wiki | 1주 | 문서/라이브러리 |
| 8 ERP | 3주 | 결재/HR/Finance/People/Sales |
| 9 Vridge | 1주 | GPR/Principle |
| 10 SmarComm | 장기 | 별도 사업화 |
| 11 BUMS | 지속 | 멀티사이트 고도화 |

**핵심 경로: Phase 1(회원) → 2(Myverse) → 3(Townity) → 4(Project)**
이 4개가 끝나면 내부 직원이 실제로 업무에 쓸 수 있는 상태가 됩니다.

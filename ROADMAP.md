# TenOne 프로젝트 로드맵

> 마지막 업데이트: 2026-03-22
> 아키텍처 v3.0 기반 재정비

## 현재 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| 퍼블릭 사이트 (11페이지) | ✅ 완성 | 홈/Works/Newsroom/About/Universe 등 |
| 인트라 9개 모듈 (143페이지) | ✅ UI 완성 | 전부 Mock 데이터 |
| 사용자 체계 (5단계) | ✅ 구현 | staff/partner/jp/crew/member |
| 결재 시스템 | ✅ 구현 | Myverse + ERP 결재라인 |
| 프로젝트/Job 관리 | ✅ 구현 | 등록/상세/손익/인력/파일 |
| 라이브러리 (Wiki/Myverse/CMS) | ✅ 구현 | 권한별 노출, 즐겨찾기 연동 |
| Townity 공개 대상 | ✅ 구현 | 공지/자유/일정 공개범위 선택 |
| Backend API | ❌ 없음 | Mock 데이터만 |
| Database | ❌ 없음 | 스키마 설계 완료 (v3 문서) |
| 배포 | ⚠️ 스크립트만 | Cloud Run 미배포 |

---

## Phase 0: 프론트엔드 마무리 (즉시)

> 백엔드 전환 전 UI/UX 완성도 높이기

### 완료
- [x] 0-1. ERP C-Level 구조 개편
- [x] 0-2. GPR 독립 모듈화
- [x] 0-3. Myverse 개인 포털
- [x] 0-4. ERP 관리자 뷰 전환
- [x] 0-5. SystemAccess 정리
- [x] 0-6. Intra 헤더
- [x] 0-7. 교육 필수 이수과정
- [x] 0-8. Crew/Partner Intra 리다이렉트 수정
- [x] 0-9. Townity 공개 대상 추가 (공지/자유/일정)
- [x] 0-10. Wiki Library 페이징 + 즐겨찾기 연동
- [x] 0-11. 프로필 수정 비밀번호 확인
- [x] 0-12. 뉴스레터 구독 (가입 시 + 프로필)
- [x] 0-13. 프로젝트 등록 (코드자동, PM자동, 임시저장, 결재요청)

### 미완료
- [ ] 0-14. 모바일 반응형 점검 (사이드바 토글, 테이블 스크롤)
- [ ] 0-15. 텍스트/버튼 일관성 최종 점검
- [ ] 0-16. 빌드 에러 0개 확인 (npm run build)

---

## Phase 1: 백엔드 기반 (1~8주)

> Mock → 실제 DB. 사람이 가입하고 데이터가 저장되는 상태.

### 1-1. Supabase 셋업 (주 1~2)
- [ ] Supabase 프로젝트 생성
- [ ] .env.local 환경변수 설정
- [ ] DB 스키마 생성 (v3 아키텍처 기반)
  - members, point_logs
  - projects, jobs, project_members
  - posts, events
  - approvals
  - courses, enrollments
  - contents
  - notifications
  - chat_rooms, chat_messages, chat_room_members
- [ ] Supabase Auth 설정 (이메일 + 카카오 로그인)
- [ ] Supabase Storage 버킷 설정 (avatars, files, content-images)

### 1-2. 인증 전환 (주 1~2)
- [ ] localStorage Mock → Supabase Auth
- [ ] 5단계 accountType 유지 (members 테이블 연동)
- [ ] 로그인/회원가입/로그아웃 API
- [ ] 미들웨어 보호 (인트라 접근 제어)
- [ ] 카카오 소셜 로그인

### 1-3. API Routes + 데이터 마이그레이션 (주 3~4)
- [ ] API 공통 유틸 (에러 핸들링, 인증 체크)
- [ ] Members API (CRUD + 프로필 수정)
- [ ] Projects API (CRUD + Job + 투입인원)
- [ ] Posts API (공지/자유/QnA)
- [ ] Events API (일정)
- [ ] Approvals API (결재 + 결재라인 처리)
- [ ] 기존 Mock 데이터 → seed 스크립트

### 1-4. 모듈 전환 1차 (주 5~6)
- [ ] Myverse: Context → API (Dashboard, Todo, 타임시트, 결재)
- [ ] Townity: Context → API (공지, 자유, 일정)
- [ ] Project: Context → API (프로젝트, Job, 손익)
- [ ] CMS: Context → API (콘텐츠, 뉴스레터)

### 1-5. 모듈 전환 2차 (주 7~8)
- [ ] ERP: Context → API (전자결재, HR, Finance, 경영관리)
- [ ] Wiki: Context → API (Library)
- [ ] HeRo: Context → API (HIT, 이력서, 커리어)
- [ ] Evolution School: Context → API (과정, 수강)
- [ ] Contact 폼 → opportunities 테이블 자동 등록

### Phase 1 완료 기준
- 실제 회원가입/로그인 작동
- 프로젝트 생성이 DB에 저장
- 커뮤니티 글쓰기가 새로고침 후에도 유지
- 결재 승인/반려가 실제 작동

---

## Phase 2: 신규 모듈 + 고도화 (8~16주)

> 기회 수집 → 프로젝트 전환 파이프라인 가동

### 2-1. Opportunity 모듈 (주 8~10)
- [ ] opportunities 테이블 + UI (파이프라인 뷰)
- [ ] AI 크롤링 엔진 (나라장터, bizinfo, 공모전)
- [ ] Cloud Run Jobs + cron 스케줄
- [ ] Claude API 관련성 분석 (relevance_score)
- [ ] 기회 → 프로젝트 전환 기능
- [ ] 마감 임박/고관련성 알림

### 2-2. Partner Pool 모듈 (주 8~10)
- [ ] partners 테이블 + UI
- [ ] 파트너 등록 (회사/프리랜서)
- [ ] 역량 기반 검색/필터
- [ ] Project에서 파트너 투입
- [ ] 프로젝트 완료 후 평가

### 2-3. 포인트 시스템 (주 10~12)
- [ ] point_logs 테이블 + 자동 부여 로직
- [ ] 등급 시스템 (Bronze~Diamond)
- [ ] Myverse 포인트 현황 표시
- [ ] 프로젝트 완료 시 크루 포인트 자동 부여
- [ ] 교육 이수 시 포인트 자동 부여

### 2-4. BI Dashboard (주 12~14)
- [ ] 전체 사업 현황 (코어/확장/곁가지)
- [ ] 멤버 현황 (가입 추이, 그룹별, 활성/이탈)
- [ ] 프로젝트 현황 (진행중/완료, 성공률, 이익률)
- [ ] Opportunity 파이프라인 (상태별 금액, 전환율)

### 2-5. 고도화 (주 14~16)
- [ ] 메신저 실시간 (Supabase Realtime)
- [ ] 알림 센터 (notifications + Realtime)
- [ ] 크루 정산 + 외부 정산 (ERP 확장)
- [ ] AI 콘텐츠 생성 (CMS + Claude API)
- [ ] Badak.biz 9천명 마이그레이션

---

## Phase 3: 커머스 + 사업 확장 (16~24주)

- [ ] Commerce 모듈 (상품관리, 포트원 결제, 주문관리)
- [ ] Evolution School 유료 과정 (Commerce 연동)
- [ ] 수료증 PDF 자동 발급
- [ ] HeRo 기업 매칭 대시보드
- [ ] BI 재무 상세 + 브랜드별 성과
- [ ] SNS 연동 콘텐츠 배포

---

## Phase 4: 생태계 완성 (24주~)

- [ ] 모바일 앱 (PWA → 네이티브 검토)
- [ ] 데이터 기반 AI 추천 (인재/프로젝트/기회)
- [ ] 오픈 API (외부 시스템 연동)
- [ ] 솔루션 외부 라이선스 (Vrief/GPR 디지털 툴)
- [ ] 기존 사이트 완전 통합 (madleague.net, madleap.co.kr 등)

---

## 성공 지표

| Phase | 핵심 지표 | 목표 |
|-------|---------|------|
| 0 | UI 완성 / 빌드 에러 | 143페이지 / 0개 |
| 1 (8주) | 실제 가입 / DB 모듈 | 50명+ / 9개 전환 |
| 2 (16주) | 크롤링 기회 / 활성 멤버 | 월 50건+ / 100명+ |
| 3 (24주) | 커머스 매출 / 통합 회원 | 매출 발생 / 5,000명+ |
| 4 (24주~) | 전체 활성 / 라이선스 | 500명+ / 1건+ |

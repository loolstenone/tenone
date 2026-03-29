# 작업 현황

> 마지막 업데이트: 2026-03-30 (집)

## 오늘 한 작업 (3/29~3/30 집)

### 1. WIO EUS v2.0 전체 반영 ✅
- docs/WIO_EUS_v2.md (1,514줄) 저장
- Part VIII 고도화 설계 10개 섹션 반영
- 7대 폭발 클러스터 + 8대 설계 원칙 반영
- 모듈 카탈로그 ~120개로 확장

### 2. WIO Orbi 100+ 모듈 페이지 ✅
- Sprint 1~6: 28개 신규 모듈 페이지 (MY 5 + RBAC 4 + 영업 7 + HR 5 + BI 4 + 지주사 3)
- 기존 96 + 신규 28 = 124+ 페이지
- 전 모듈 isDemo 패턴 통일 + Supabase 연동 (46/120 실쿼리)

### 3. 핵심 엔진 3종 ✅
- lib/rbac.ts: 6단계 권한 (super_admin→guest), 사이드바 RBAC 미들웨어
- lib/workflow-engine.ts: 워크플로우 실행/스텝진행/SLA체크
- lib/culture-engine.ts: 가치정합성체크/문화건강도

### 4. 설정 페이지 EUS 기준 재구성 ✅
- 4탭: 세팅(3모드) | 권한 | 테마 | 시스템
- 조직 모드: 트리빌더 + 인력배치 + 정원
- 모듈 모드: 레고 블록 팔레트
- 워크플로우 모드: 노드 플로우 빌더

### 5. 조직도 + 인력 배치 ✅
- DB 6테이블: wio_headcount, wio_personnel_orders, wio_org_change_history, wio_org_simulations, wio_handover_checklists, wio_user_assignments
- OrgTreeBuilder 컴포넌트 (1,252줄, Supabase CRUD)
- HR-ORG 4탭 고도화 (조직도3뷰 + 정원 + 발령 + 이력)
- docs/WIO_OrgDesign_v1.md 설계 문서

### 6. Part VIII 신규 5페이지 ✅
- AI×모듈 매트릭스, E2E 데이터 흐름도, SaaS 과금 v2.0, 업종별 프리셋 4종, 마이그레이션 전략

### 7. COM-WCL 업무 캘린더 ✅
- 4뷰(주간/월간/분기/연간) × 4범위(내업무/팀/부문/전사)
- ★상향 집계 + ⚠자동 에스컬레이션

### 8. 브랜드 사이트 전면 고도화 ✅
- MADLeap: 5페이지 (홈/소개/포트폴리오/스터디룸/커뮤니티)
- MADLeague: 5페이지 (홈/소개/프로그램/경쟁PT/헤더)
- Badak: 모임 + 커뮤니티4탭 + 헤더
- Planners: Vrief/GPR 중심 전면 리라이트
- HeRo/RooK/ChangeUp/0gamja: 홈 고도화
- Mindle/domo/FWN/YouInOne: 홈 고도화

### 9. 인프라 ✅
- 인트라 로그인 근본 해결 (auth-context 의존 제거, sessionStorage 캐시)
- Agent Hub + 7 에이전트 (Claude 실응답)
- 인트라 유니버스 대시보드 실DB 연동 (8페이지)
- 외부 API 연동 (Google Calendar + Kakao + Slack)
- 모바일 반응형 수정 + SEO 메타데이터 + sitemap
- board_configs 25개 등록 (6개 사이트)
- Myverse 7탭 Supabase 연동
- DB 33+6=39개 신규 테이블 (총 90+ 테이블)
- Vercel 프로덕션 배포 10+ 회

---

## 다음 할 일 (사무실에서 이어서)

### 즉시 — Orbi 개선 (docs/Orbi_Improvement_Plan.md 참조)
1. COM-AI → Agent Hub 연동 (Claude API 실연결)
2. 설정 모듈/워크플로우/권한 모드 실DB 전환 (localStorage → Supabase)
3. SYS-USR 사용자 관리 실DB (wio_members CRUD)

### 단기 — TenOne 고도화
4. TenOne 게시판 고도화 (Works/Newsroom 리치에디터 + 이미지)
5. 읽음 확인 (COM-MSG)
6. 프로젝트 내 SNS형 타임라인 피드
7. COM-WCL 업무 캘린더 실DB
8. MY-HR 내 인사 실DB

### 중기 — WIO for Agency
9. 마케팅 14개 모듈 실DB (SmarComm 연계)
10. CRM 6개 모듈 실DB
11. 화상회의 (Zoom/Meet 딥링크)
12. 외부 게스트 초대 플로우
13. AI 프로젝트 설계

---

## 참고
- WIO EUS 문서: docs/WIO_EUS_v2.md (단일 진실 소스)
- 조직도 설계: docs/WIO_OrgDesign_v1.md
- Universe OS 계획: docs/Universe_OS_Plan.md

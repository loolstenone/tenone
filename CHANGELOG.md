# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-03-20 (사무실)

### 완료
- ERP를 C-Level 역할 기반으로 재구조화 (CHO/CFO)
- GPR을 HR·CHO 하위에서 분리 → ERP 최상위 독립 섹션으로 승격
  - GPR Dashboard: 전사 달성률, 부서별 GPR 현황 테이블
  - 목표 캐스케이드: CEO 전사목표 → 사업부 → 팀 → 개인 트리 구조 + 승인/반려
  - 평가: 자기평가 → 매니저평가 → 최종 등급 확정 플로우
  - 인센티브: 등급별 지급률(S:200% ~ D:0%), 인센티브 산정 테이블
- "내 프로필" → "Myverse"로 리브랜딩 (개인 포털 대시보드)
  - 인사정보, GPR, 급여, 경비, 프로젝트, 교육, 근태, 시스템 접근 권한
  - 빠른 실행 섹션 (GPR 목표설정, 근태신청, 경비청구 등)
- ERP 페이지를 관리자 뷰로 전환
  - 근태: 전체 구성원 출퇴근/휴가신청 승인/초과근무 관리
  - 급여: 전체 급여대장 + 퇴직연금 현황 관리
  - 교육: 전체 구성원 이수현황 + 필수과정 미이수 인원 관리
- 교육에 텐원 필수 이수과정 추가 (VRIEF, GPR, Mind Set, Universe 입문, 정보보안, 괴롭힘 예방)
- SystemAccess 정리: `erp-crm` 제거, `studio` → `project`, 권한별 label+description 추가
- Intra 헤더 추가 (Myverse 바로가기, 조직도, 날짜, 검색, 알림, 프로필 드롭다운)
- 커뮤니케이션 "지식경영" → "Wiki" 라벨 변경

### 생성된 파일
- `components/IntraHeader.tsx` — Intra 상단 헤더 바
- `app/intra/erp/gpr/page.tsx` — GPR Dashboard
- `app/intra/erp/gpr/cascade/page.tsx` — 목표 캐스케이드
- `app/intra/erp/gpr/evaluation/page.tsx` — GPR 평가
- `app/intra/erp/gpr/incentive/page.tsx` — 인센티브 관리
- `components/IntraSidebar.tsx` — 사이드바 재구조화

### 수정된 주요 파일
- `types/auth.ts` — SystemAccess 타입 정리, SystemAccessInfo 추가
- `lib/auth-data.ts` — Mock 사용자 권한 업데이트
- `types/staff.ts` — SystemAccess 동기화
- `lib/staff-data.ts` — accessOptions 업데이트
- `app/intra/layout.tsx` — IntraHeader 추가, studio→project 전환
- `app/intra/studio/layout.tsx` — studio→project 전환
- `app/intra/profile/page.tsx` — Myverse 개인 대시보드로 전면 재작성
- `app/intra/erp/hr/attendance/page.tsx` — 관리자 뷰로 전환
- `app/intra/erp/hr/payroll/page.tsx` — 관리자 뷰로 전환
- `app/intra/erp/hr/education/page.tsx` — 관리자 뷰로 전환

### 결정 사항
- Myverse = 개인 → 회사 (개인화 뷰), ERP = 회사 관리 목적 (관리자 뷰)
- GPR은 ERP 독립 섹션으로 확정 (HR 하위 아님)
- CBO(사업관리) → Project 모듈로 이동
- SystemAccess에서 CRM 제거 (ERP에서 제거됨)

---

## 2026-03-20 (집)

### 완료
- 4개 독립 프로젝트 → 단일 프로젝트 루트로 통합
- `/intra` 하위 라우팅 통합 (Studio/ERP/Marketing/Wiki/CMS)
- Intra 홈 페이지 구현 (공지사항, 일정, 통계 카드)
- 퀵링크 카드 제거 (네비 중복)
- 100개 기업 격언 작성 및 랜덤 표시 적용
- `.next/` git 추적 제거
- `.git/` 용량 최적화 (305MB → 92MB)
- GitHub 저장소 생성 및 push (loolstenone/tenone)

### 생성된 파일
- `lib/quotes-data.ts` — 100개 기업 격언

### 수정된 주요 파일
- `app/intra/page.tsx` — Intra 홈 (퀵링크 제거, 격언 추가)
- `.gitignore` — .next/ 확인
- 프로젝트 루트 구조 전면 정리

### 결정 사항
- 프로젝트 루트(`C:\Projects\TenOne\`)가 곧 Next.js 프로젝트
- 별도 하위 폴더(web/, erp/ 등) 사용하지 않음
- 모든 내부 시스템은 `/intra` 하위 경로
- 96번 격언 삭제 (브랜드 슬로건은 격언에 부적합)
- 대소비자 홈페이지에 Office/ERP 메뉴 노출 안 함 → 직원 로그인 시 Intra 표시

---

## 2026-03-19 (사무실) — 2차 세션

### 완료
- 퍼블릭 페이지 전면 리디자인 (모노톤 화이트, BCG 레퍼런스)
- 랜딩 페이지: Hero 메시지 + 배너 이미지 + Core Value 섹션
- 네비게이션 구조 변경: About / Works / Newsroom / Contact
- Works 페이지 신규 (기존 Brands 대체)
- Newsroom 페이지 신규
- About 페이지 통합 (About + Universe + History → 탭 구조)
- Contact 페이지 리디자인
- Intra 전체 바디 모노톤 화이트 테마 적용 (40+ 파일)
- 사이드바 하단 프로필 제거 → 우측 상단 통일
- CRM을 ERP → Marketing 하위로 이동
- CMS 메뉴 신규 추가
- PLANNING.md 기획서 작성

### 생성된 파일
- `app/(public)/works/page.tsx` — Works 페이지
- `app/(public)/newsroom/page.tsx` — Newsroom 페이지
- `app/intra/cms/page.tsx` — CMS 대시보드
- `app/intra/marketing/crm/` — CRM 페이지 (Marketing 하위)
- `PLANNING.md` — 사이트 기획서

### 수정된 주요 파일
- `app/page.tsx` — 랜딩 페이지 전면 리디자인
- `app/(public)/about/page.tsx` — 탭 구조 통합
- `app/(public)/contact/page.tsx` — 모노톤 리디자인
- `components/PublicHeader.tsx` — 네비 구조 변경, Intra 프로필 통일
- `components/ErpSidebar.tsx` — CRM 제거
- `components/MarketingSidebar.tsx` — CRM 추가
- `components/*Sidebar.tsx` (5개) — 하단 프로필 제거
- `app/intra/**/*.tsx` (40+ 파일) — 다크→모노톤 변환

### 결정 사항
- 디자인 방향: 흑백 모노톤, BCG 레퍼런스, 신뢰감 있는 기업 이미지
- 네비 구조: 5개 → 4개 (Universe/History 삭제, About에 통합)
- CRM은 Marketing 소속으로 확정
- CMS는 Intra 독립 메뉴로 확정
- 서버/DB 작업은 후순위, 프론트엔드 완성도 우선

---

## 2026-03-19 (사무실) — 1차 세션

### 완료
- 사무실 컴퓨터에 프로젝트 clone 완료
- 개발 서버 정상 실행 확인 (localhost:3000)
- 프로젝트 전체 현황 분석 완료

### 생성된 파일
- `CLAUDE.md` - 프로젝트 가이드 (클로드 자동 참조)
- `ROADMAP.md` - 6단계 개발 로드맵
- `WORK_STATUS.md` - 작업 현황 동기화 파일
- `CHANGELOG.md` - 변경 이력 (이 파일)

### 분석 결과 요약
- 프론트엔드 UI: 90% 완성 (퍼블릭 + Intra 대시보드)
- 백엔드/DB: 0% (API 라우트, DB, ORM 전무)
- 모든 데이터: Mock 기반 (새로고침 시 리셋)
- 다음 단계: Phase 1 기반 인프라 구축 시작

### 결정 사항
- 작업 동기화 규칙 확정: "사무실/집 작업 종료" 명령어 사용
- 로드맵 6단계 확정 (Phase 1~6)

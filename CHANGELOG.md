# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

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

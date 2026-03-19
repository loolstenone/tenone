# 작업 현황

> 마지막 업데이트: 2026-03-19 (사무실) — 2차 세션

## 오늘 한 작업 (2차 세션)

### 퍼블릭 페이지 리디자인
- BCG 레퍼런스 기반 모노톤 화이트 디자인으로 전면 리디자인
- 랜딩 페이지: Hero 메시지 변경 ("가치로 연결된 거대한 세계관을 만들기로 했다" + 하위 메시지 "인재를 발굴하고, 연결하고, 기업과 사회의 문제를 해결합니다")
- Hero 배너 이미지 적용 (브랜드 네트워크 시각화)
- Core Value 섹션 모노톤 리디자인 (본질/속도/이행)
- 네비게이션 구조 변경: About / Works / Newsroom / Contact (5개 → 4개)
- Works 페이지 신규 생성 (기존 Brands 대체)
- Newsroom 페이지 신규 생성
- About 페이지 통합 (기존 About + Universe + History를 탭 구조로)
- Contact 페이지 모노톤 리디자인

### Intra 페이지 리디자인
- 전체 Intra 바디 영역 모노톤 화이트 테마 적용 (40+ 파일)
- 사이드바 다크 유지 + 바디 라이트 모노톤 조합
- 사이드바 하단 프로필 제거 → 우측 상단 프로필로 통일
- "Office" → "Intra" 명칭 변경
- CMS 메뉴 신규 추가 (Intra 독립 항목)

### 구조 변경
- CRM을 ERP → Marketing 하위로 이동
- Marketing 사이드바에 CRM 그룹 추가 (Contacts, Organizations, Segments, Import)
- ERP는 HR 전용으로 축소

### 기획/문서
- PLANNING.md 사이트 기획서 작성 (전체 현황 심층 분석)
- 집/사무실 동기화 워크플로우 확립

## 현재 진행 중
- 퍼블릭 페이지 리디자인 거의 완료
- Intra 서브 페이지 일부 컴포넌트(모달, BrandCard 등)에 다크 테마 잔존 가능

## 다음에 할 일
- Intra 모달/컴포넌트 파일(components/ 폴더)의 다크 테마 잔여 정리
- PublicHeader Logo 중첩 `<a>` 하이드레이션 경고 수정
- CRM 페이지들의 라우트 정리 (/intra/erp/crm → /intra/marketing/crm 완전 이전)
- 각 페이지별 실제 콘텐츠 보강
- 모바일 반응형 점검
- 이미지 에셋 제작/배치

## 주의사항
- Tailwind CSS v4 사용 중 (v3과 문법 차이: @import "tailwindcss")
- Next.js 16 + React 19 (최신 버전)
- 모든 데이터는 Mock → 페이지 새로고침 시 리셋됨
- CRM 페이지 파일이 /intra/erp/crm과 /intra/marketing/crm 양쪽에 존재 (추후 erp쪽 정리 필요)

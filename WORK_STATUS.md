# 작업 현황

> 마지막 업데이트: 2026-03-19 (집) — 3차 세션

## 오늘 한 작업 (3차 세션)

### 다크 테마 잔여 정리 (20개 컴포넌트)
- 모달: TaskModal, PersonModal, ContactImportModal, AutomationBuilder → 흰 배경 + 중립 테마
- 카드: BrandCard, TaskCard, ProjectCard, AutomationCard → 라이트 스타일
- 기타: KanbanBoard, TimelineView, RelationshipMap → 모노톤 화이트
- 사이드바/푸터는 의도적으로 다크 유지

### 버그 수정
- PublicHeader Logo 중첩 `<a>` 하이드레이션 경고 수정 (Logo 컴포넌트 자체에 Link가 있으므로 PublicHeader에서 중복 Link 제거)

### CRM 라우트 정리
- `/intra/erp/crm/` 디렉토리 삭제 (7개 파일)
- ERP 대시보드의 CRM 링크를 `/intra/marketing/crm/`으로 변경
- CRM은 Marketing 소속으로 완전 통일

### Wiki 콘텐츠 작성
- Onboarding: 30일 체크리스트 (Day1/Week1-4), 사용 도구, 팁
- Education: 13개 교육 코스 (4개 카테고리, 필수/권장/선택 레벨)
- Handbook: 5개 섹션 아코디언 (근무, 프로세스, 평가, 커뮤니케이션, 보안)
- FAQ: 4개 카테고리 15개 Q&A + 검색 기능

### 모바일 반응형 개선
- KanbanBoard: `grid-cols-5` → 가로 스크롤 (`flex + overflow-x-auto + min-w-[220px]`)
- 모달 폼: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- Profile 페이지: 모든 그리드 반응형 처리
- Contact 페이지: 기본 `grid-cols-1` 추가

### 기타
- `.next` 캐시 디렉토리를 git 추적에서 제거 (이전에 커밋되어 있었음)

## 현재 진행 중
- 프론트엔드 UI 완성도 거의 마무리 단계

## 다음에 할 일
- 이미지 에셋 제작/배치 (히어로 배너, 브랜드 로고 등)
- Phase 1 기반 인프라 시작 (DB, 인증, API)
  - 환경 설정 파일 (.env)
  - PostgreSQL/Supabase + Prisma ORM
  - NextAuth.js 인증
  - API 라우트 기본 구조
- 대시보드 실제 통계 차트

## 주의사항
- Tailwind CSS v4 사용 중 (v3과 문법 차이: @import "tailwindcss")
- Next.js 16 + React 19 (최신 버전)
- 모든 데이터는 Mock → 페이지 새로고침 시 리셋됨
- 사이드바는 다크 유지, 바디/모달/카드만 라이트 모노톤

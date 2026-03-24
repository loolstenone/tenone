# 작업 현황

> 마지막 업데이트: 2026-03-24 (사무실)

## 오늘 한 작업

### 1. 전체 모듈 DB 연결 (Phase 0~9)
- Phase 1: 회원 관리 UI → Supabase members 직접 조회, 역할 변경
- Phase 2: Myverse 대시보드 → 공지/일정 DB
- Phase 3: Townity → 공지사항/자유게시판/캘린더 DB
- Phase 4: Project → 프로젝트/Job/타임시트 DB
- Phase 5: Evolution School → 과정/수강 DB
- Phase 6: HeRo → HIT/커리어/이력서 DB (테이블 신규 생성)
- Phase 7: Wiki → 라이브러리/북마크 DB
- Phase 8: ERP → 결재/기안/GPR DB
- Phase 9: Vridge → GPR/BI Dashboard DB 통계

### 2. 회원 체계 v2
- AccountType: staff/partner/alliance/madleaguer/crew/member
- junior-partner 삭제
- members 테이블: primary_type, roles[], affiliations[], intra_access, module_access[] 추가
- types/auth.ts + auth-context.tsx 동기화
- 사이드바 moduleAccess 권한 체크 (v2 모듈명 매핑)
- 가입 흐름: origin_site 자동 설정

### 3. 설계 문서
- ARCHITECTURE.md: 전체 시스템 아키텍처
- ROADMAP_IMPLEMENTATION.md: Phase별 구축 로드맵
- Vridge (GPR & Vrief 통합 명칭 확정)
- ERP 모듈화: erp-hr, erp-people, erp-finance, erp-sales

### 4. TenOne Works 실데이터
- Google Sites history → DB 13개 게시글 INSERT
- tenone.biz/works 실제 DB 데이터 표시 확인
- 날짜 포맷: 2025년 08월
- 카테고리 필터: AI/브랜딩/프로젝트/네트워크/교육/콘텐츠

### 5. BUMS 게시글 관리 개선
- 제목 클릭 → 내용 보기 모달
- 체크박스 + 일괄 삭제
- 페이지네이션 (20개씩)
- 관리 헤더: 수정/삭제 텍스트 분리

### 6. 에디터 개선
- RichEditor: 이미지 클립보드 붙여넣기 + 드래그앤드롭
- 레이아웃: 태그/대표이미지 에디터 아래로, SEO 접기, 모던 디자인

### 7. 다크모드 전면 수정
- PublicHeader: 전체 CSS 변수 전환
- Works/Contact/About/Newsroom: 하드코딩 색상 제거
- 빌드 에러 수정 (SmarComm import, report-data)

### 8. 기타
- BUMS 미구현 페이지 6개 생성 (404 해결)
- BUMS 디자인 모던화 (pill 탭, rounded-xl, shadow-sm)
- 홈페이지 Works/News Mock 제거 → DB only

## 현재 이슈 ⚠️
- 게시물 수정 후 사이트 페이지로 리다이렉트됨 (게시판 관리로 돌아가야 함)
- 게시물 관리 vs 콘텐츠 관리 역할 혼란 → 정리 필요
- 다크모드: 일부 하위 페이지 아직 하드코딩 남아있을 수 있음
- ERP 53개 페이지 DB 연결 미완 (핵심 3개만 완료)

## 다음에 할 일
- [ ] 게시물 수정 후 리다이렉트 → 게시판 관리 페이지로
- [ ] 게시물 관리 / 콘텐츠 관리 역할 정리 (BUMS 메뉴 구조)
- [ ] 나머지 ERP 페이지 DB 연결
- [ ] 퍼블릭 게시판 회원 글쓰기
- [ ] 이미지 관리 (Supabase Storage bums-assets 버킷)
- [ ] CrewInvite 지원 → 심사 → 역할 전환 흐름
- [ ] 각 브랜드 사이트 DB 데이터 연결 (TenOne 패턴 복제)

## Supabase CRUD 레이어 (8개)
- `lib/supabase/bums.ts` — 사이트/게시판/게시글/위젯
- `lib/supabase/members.ts` — 회원 관리
- `lib/supabase/townity.ts` — 게시판/댓글/일정
- `lib/supabase/projects.ts` — 프로젝트/Job/투입인력/타임시트
- `lib/supabase/education.ts` — 과정/수강
- `lib/supabase/hero.ts` — HIT/커리어/이력서
- `lib/supabase/wiki.ts` — 라이브러리/북마크
- `lib/supabase/erp.ts` — 결재/포인트/알림

## Vercel 배포 정보
- Hobby (무료) 플랜
- 자동 배포: git push origin master → 빌드+배포
- 현재 도메인 ~20개

## 주의사항
- Tailwind CSS v4, Next.js 16 + React 19
- Supabase: members + bums_* + hero_* 테이블
- 멀티 사이트 19개 (middleware 도메인 분기)
- BUMS = Business Unit Management System
- Vridge = GPR & Vrief 통합 (경영전략)
- 테마: 기본 다크, 토글로 라이트 전환

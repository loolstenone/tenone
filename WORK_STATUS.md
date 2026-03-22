# 작업 현황

> 마지막 업데이트: 2026-03-22 (집)

## 오늘 한 작업

### Townity 공개 대상 추가
- 공지사항, 자유게시판, 전체 일정 등록 모달에 공개 대상 선택 필드 추가
- 옵션: 전체 / Staff / Partner 이상 / Crew 이상 / Admin Only
- 수정 파일: comm/notice/page.tsx, comm/free/page.tsx, comm/calendar/page.tsx

### Crew/Partner/JP Intra 리다이렉트 수정
- login/page.tsx: staff만 /intra로 보내던 로직 → member 제외 전부 /intra로
- useEffect + handleSubmit 양쪽 모두 수정
- user 객체를 useAuth에서 추가 가져오기

### 전체 현황 점검
- 결재 시스템: 이미 구현됨 (Myverse + ERP 결재라인)
- 프로젝트 등록: 이미 구현됨 (코드자동, PM자동, 투입인원, 임시저장, 결재요청)
- 프로젝트 상세: 이미 구현됨 (개요/Job/손익/인력/파일 5탭)
- Wiki Library: 이미 페이징 구현됨 (20개씩 + 건수 선택)
- 즐겨찾기 연동: 정상 작동 확인 (Wiki → Myverse)
- 라이브러리 권한: 정상 작동 확인 (canViewItem)
- 프로필 비밀번호: 이미 구현됨

### 프로젝트 정리
- site-packages 삭제 (258MB → 2.1MB)

### 로드맵 재정비
- ROADMAP.md를 아키텍처 v3.0 기반으로 전면 재작성
- Phase 0(프론트엔드 마무리) ~ Phase 4(생태계 완성)
- SmarComm 프로젝트 초기화 (C:\Projects\SmarComm)

### Claude Chat용 문서 생성
- docs/CURRENT_STATUS.md 생성 (현황 + v3 아키텍처 통합)

## 현재 진행 중
- Phase 2-1 Opportunity 완료. Phase 2-2 Partner Pool 다음.

## 완료된 Phase 1 (백엔드 기반)
- **1-1. Supabase 셋업**: DB 15개 테이블, RLS, 인덱스, 패키지, 환경변수
- **1-2. 인증 전환**: Supabase Auth + Mock fallback 하이브리드 (auth-context.tsx)
- **1-3. API Routes**: 13개 엔드포인트 (members, projects, jobs, posts, events, approvals, contents, library, notifications, timesheets)
- **1-4. API 클라이언트**: lib/api.ts 모듈별 타입드 함수
- 모바일 반응형 (사이드바 토글, 본문 전체너비)
- npm run build 에러 0개

## 다음에 할 일
- [x] Phase 2-1: Opportunity 모듈 (파이프라인 뷰, 리스트 뷰, API, 사이드바)
- [ ] Phase 2-2: Partner Pool 모듈 (협력사/프리랜서)
- [ ] Phase 2-3: 포인트 시스템 (Bronze~Diamond)
- [ ] Phase 2-4: BI Dashboard (전체 사업 현황)
- [ ] 각 페이지 Mock Context → API 호출 점진적 전환
- [ ] tenone.biz 도메인 연결 (운영 준비 완료 후)
- [ ] SmarComm Phase 1 MVP 개발

## Vercel 배포 정보
- URL: https://tenone.vercel.app (비공개, 도메인 미연결)
- 자동 배포: git push origin master → 자동 빌드+배포
- 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 설정됨

## 주의사항
- Tailwind CSS v4 사용 중
- Next.js 16 + React 19
- 모든 데이터는 Mock (새로고침 시 리셋)
- 브랜드 가이드: 문장 내 Ten:One™ 사용 필수
- 프로젝트 루트가 곧 Next.js 프로젝트
- SmarComm은 별도 프로젝트 (C:\Projects\SmarComm)

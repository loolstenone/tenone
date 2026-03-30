# 작업 현황

> 마지막 업데이트: 2026-03-30 (사무실)

## 오늘 한 작업 (3/30 사무실)

### 1. COM-AI → Agent Hub 실연결 ✅
- `app/(WIO)/wio/app/comm/ai/page.tsx` 전면 교체
- Mock 제거 → `POST /api/agent/hub` 실호출 (Claude API)
- 대화 생성/삭제/전환, 로딩 스피너, 에러 배너, 에이전트명/신뢰도 배지

### 2. WIO Glossary v1 → 7계층 체계 정렬 ✅
- `docs/WIO_Glossary_v1.md` 저장 (L1~L7, 12서비스, 16모듈 매핑)
- `types/wio.ts` — WIO_SERVICES, WIOService, WIOPreset 타입
- `lib/wio-modules.ts` — SERVICE_CATALOG 16개, 모듈 80개에 service 필드, 프리셋/헬퍼
- `app/(WIO)/wio/app/layout.tsx` — 사이드바 Track→모듈 → 서비스→모듈 구조 전면 교체
- `app/(WIO)/wio/app/settings/page.tsx` — 서비스 모드 탭 추가 (프리셋 + 서비스 토글)

### 3. SYS-USR 사용자 관리 실DB ✅
- `app/(WIO)/wio/app/system/users/page.tsx` — Mock → Supabase wio_members CRUD
- 역할 변경, 활성/비활성 토글, 사용자 초대 (inviteMember)

### 4. 프로젝트 타임라인 피드 ✅
- `app/(WIO)/wio/app/project/[id]/page.tsx` — 4탭(개요/타임라인/업무/인원)
- SNS형 피드: 글쓰기, 좋아요, 댓글 스레드, 시스템 알림

### 5. COM-WCL 업무 캘린더 실DB ✅
- `app/(WIO)/wio/app/comm/work-calendar/page.tsx` — wio_jobs 테이블 연동
- isDemo Mock 폴백 유지

### 6. MY-HR 내 인사 실DB ✅
- `app/(WIO)/wio/app/my/hr/page.tsx` — wio_members 프로필 연동
- 근속기간 자동 계산, 이름/부서/직급 실데이터

### 7. 마케팅 campaign 실DB ✅
- `app/(WIO)/wio/app/marketing/campaign/page.tsx` — fetchCampaigns 연결

### 8. TenOne 게시판 수정 기능 ✅
- `app/api/board/posts/[id]/route.ts` — PATCH 핸들러 추가
- `components/board/PostDetail.tsx` — 수정 버튼 (로그인 사용자에게 표시)
- `components/board/BoardPage.tsx` — onEdit 전달

### 9. TenOne 뉴스룸 재설계 ✅
- `app/(TenOne)/newsroom/page.tsx` — 유니버스 콘텐츠 허브로 전면 교체
- `components/newsroom/NewsTicker.tsx` — LIVE 티커 바 (브랜드별 컬러 배지 + 제목 스크롤)
- `components/newsroom/NewsroomFeed.tsx` — 카드 그리드 (브랜드 필터 + 최신/인기 정렬)
- `app/api/newsroom/feed/route.ts` — 유니버스 전체 게시글 조회 API
- `lib/brand-meta.ts` — SiteCode → 브랜드 메타 매핑
- `app/page.tsx` — 홈 "새로운 소식"도 뉴스룸 피드 API 통일

### 10. Contact 관리자 + 정리 ✅
- `app/intra/bums/inquiry/page.tsx` — "Coming Soon" → 풀 CRUD (테이블 + 상세 패널 + 상태 관리)
- `app/(TenOne)/contact/page.tsx` — 회원가입 탭 제거

### 11. MyVerse 랜딩 페이지 ✅
- `app/(MyVerse)/myverse/page.tsx` — 기획서 v2 기반 전면 재작성
- 7섹션: Hero/Problem/Flow/AppPreview/AI/Pricing/CTA
- `docs/Myverse_*.md` 3개 기획서 저장
- myverse.tenone.biz CNAME 설정 확인

---

## 다음 할 일 (집에서 이어서)

### 즉시
1. Vercel 배포 + 프로덕션 확인 (수정 버튼, 뉴스룸 티커, MyVerse 랜딩)
2. CRM DB 테이블 생성 + 모듈 실DB 연결
3. 마케팅 나머지 13개 모듈 DB 테이블 생성

### 단기
4. MyVerse 앱 프로젝트 초기화 (Expo + React Native)
5. 설정 서비스/모듈 → Supabase 저장 (localStorage → DB)
6. 뉴스룸 상세 페이지 — 타 브랜드 게시물 외부 링크 처리

### 중기
7. Rule Engine + Event Bus 구현
8. SmarComm 독립 배포 (Vercel + Supabase)
9. 화상회의 딥링크 (Zoom/Meet)

---

## 참고
- WIO Glossary: docs/WIO_Glossary_v1.md (7계층 체계 단일 진실 소스)
- WIO EUS: docs/WIO_EUS_v2.md
- MyVerse 기획서: docs/Myverse_Dev_Guide_v2.md (개발 가이드)
- 개발 현황: docs/PROJECT_STATUS.md

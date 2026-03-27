# 작업 현황

> 마지막 업데이트: 2026-03-28 (집) — 작업 중

## 오늘 한 작업 (3/28 집)

### 1. About 페이지 개선 ✅
- PublicHeader + 7개 브랜드 헤더에서 About 네비 중복 제거 (UniverseUtilityBar에만 유지)
- About > Brands 탭 → 역할 기반 7그룹 구조로 교체 (tenone_role_relationship.html 반영)
- Synergy Flows 섹션 추가 (인재 파이프라인, 트렌드-비즈니스, 인프라 흐름)

### 2. 홈페이지 콘텐츠 보강 ✅
- Universe 브랜드 쇼케이스 섹션 추가 (10개 브랜드 그리드)
- Latest 정적 fallback 뉴스 추가 (LUKI, RooK, MADzine 등 6개)
- Google Sites 콘텐츠 전체 반영

### 3. WIO 게시판 모듈 대규모 업그레이드 ✅
- 대표 이미지 자동 추출 (본문 첫 이미지 → 아임웹 스타일)
- 에디터 이미지 paste/drop → Supabase Storage 업로드 (base64 → URL)
- base64 → Storage 마이그레이션 API 생성 (/api/board/migrate-images)
- 좋아요/북마크 userId 전송 + 비로그인 안내 토스트
- 게시글 고유 URL (?postId= 파라미터, 직접 링크 가능)
- 게시판 5개 컴포넌트 테마 가독성 개선 (tn-* CSS 변수 적용)
- PostDetail 본문 이미지+텍스트 레이아웃 개선 (모바일 대응)
- WIO 게시판 가이드 문서 작성 (docs/WIO_Board_Guide.md)

### 4. Works 게시물 20개 완성 ✅
- Google Sites History 전체 콘텐츠 → Works 게시판 반영
- 7개 신규 게시물 추가 (DAM Be, 지평주조, Badak, domo, DAM Party S3, 유인원 인수, 전국 네트워크)
- 기존 13개 본문 텍스트 보강
- 전체 20개 날짜 원본 매칭 (2021~2025)
- 18개 대표 이미지 설정 (Supabase Storage + OG 이미지)

### 5. SmarComm 랜딩 고도화 ✅
- 소셜 프루프 섹션 추가 (500+ 진단, 93% 개선, 30초, ₩0)
- 신뢰 지표(Trust) 섹션 추가 (데이터 기반, 주간 리포트, 성과 보장)

### 6. 프로필 페이지 개선 ✅
- 비밀번호 확인 모달 제거 → 직접 저장
- 뉴스레터 섹션 숨김
- 북마크 목록 UI 추가

### 7. RLS 정책 수정 ✅
- posts UPDATE 정책 완화 (서버사이드 API 업데이트 허용)

---

## 다음 할 일

### 즉시 (이어서)
- 모바일 반응형 점검 결과 반영 (에이전트 실행 중)
- 게시판 관리자 기능 — BUMS 게시판 관리 페이지 API 연동 (Mock → Supabase)
  - app/intra/bums/sites/[siteId]/boards/[boardId]/page.tsx 에서 /api/board/posts 연동
  - 일괄 삭제/상태 변경/이동 기능

### 단기
- 회원등급별 권한 / 비밀글
- 이미지 리사이즈/WebP 변환 (업로드 시 자동)
- 아코디언(FAQ) 게시판 레이아웃
- 배포 (Vercel/GCP)

### 중기 (Phase 2)
- Competition 모듈 (MADLeague 경연)
- Networking 모듈 (Badak)
- Certificate 모듈
- Universe Dashboard (TenOne 크로스 브랜드 관리)
- WIO Settings CRUD (모듈 ON/OFF, 테마, 멤버 관리)

### 장기 (Phase 3~4)
- AI Assistant (Claude API)
- AI Crawler (TrendHunter 통합)
- 외부 연동 (Google Calendar, Slack, 바로빌)
- B2B SaaS 얼리어답터 모집

---

## 참고 사이트
- 풀링포레스트 (https://www.pooolingforest.com/) — WIO/SmarComm 랜딩 디자인 참고
- 아임웹 게시판 가이드 — WIO 게시판 모듈 기능 기준

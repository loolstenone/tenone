# 변경 이력 (Changelog)

> 집/사무실 어디서든 클로드가 이전 작업 맥락을 파악할 수 있도록 기록합니다.

---

## 2026-03-23 (집, 2차)

### 완료
- SmarComm 대시보드 모바일 반응형 (아이콘 사이드바 56px + 오버레이 확장)
- 반응형 브레이크포인트 md→lg(1024px) 변경
- 우측 패널(RightPanel) 신규 — TODO, 블로그, 가이드, 팀 채팅
- 스캔 페이지 반응형 (URL입력/게이지/비교/테이블)
- LineChart clipPath overflow 수정
- 요금제 5단계 (Free ₩0 ~ Ultra ₩990,000) + 연간할인 + 비교표
- 메인→워크스페이스 스캔 연결 (로그인 유저 자동 전환)
- 워크스페이스 로고 드래그앤드롭 업로드
- 사이드바 상단 회사명 표시 개선

### 생성된 파일
- `components/smarcomm/RightPanel.tsx`

### 수정된 파일
- `app/(SmarComm)/sc/dashboard/layout.tsx` — 우측 패널, 반응형
- `app/(SmarComm)/sc/dashboard/profile/page.tsx` — 로고 업로드
- `app/(SmarComm)/sc/dashboard/scan/page.tsx` — 반응형, pending scan
- `app/(SmarComm)/sc/page.tsx` — 워크스페이스 연결
- `app/(SmarComm)/sc/pricing/page.tsx` — 5단계 요금제
- `components/SmarCommSidebar.tsx` — 모바일 아이콘 모드
- `components/smarcomm/charts/LineChart.tsx` — clipPath

---

## 2026-03-23 (집)

### 완료
- RooK 사이트 신규 생성 (6개 페이지 + 헤더/푸터)
- YouInOne WordPress 콘텐츠 반영 (XML에서 실제 콘텐츠 추출)
- 도메인 연결: tenone.biz, youinone.com
- Footer copyright 통일 + UniverseBadge 중복 제거
- 헤더 메뉴 "홈" 일괄 제거
- globalConfig + authMethods (사이트별 소셜 로그인 제어)
- SITE_GUIDE.md 멀티사이트 관리 가이드
- Supabase Auth: Google + Kakao OAuth 연동
- members 테이블 생성 + 마스터 계정
- 로그인/가입 한국어 통일 + 소셜 버튼
- middleware 이중 리라이트 방지

### 생성된 파일
- `app/(RooK)/` — RooK 사이트 전체 (layout + 6페이지)
- `components/RooKHeader.tsx`, `components/RooKFooter.tsx`
- `app/auth/callback/route.ts` — OAuth 콜백
- `SITE_GUIDE.md` — 멀티사이트 관리 가이드

### 수정된 파일
- `lib/auth-context.tsx` — 소셜 로그인, code exchange, fallback 처리
- `lib/site-config.ts` — globalConfig, authMethods, RooK 색상
- `middleware.ts` — RooK 분기, 이중 리라이트 방지
- `app/login/page.tsx` — 한국어 통일, 소셜 버튼, authMethods 조건부
- `app/signup/page.tsx` — 소셜 버튼, authMethods 조건부
- `components/PublicHeader.tsx` — 로그인/회원가입 한국어
- `components/*Footer.tsx` — copyright 통일, UniverseBadge 제거
- `components/*Header.tsx` — "홈" 메뉴 제거
- `app/(YouInOne)/yi/*` — WordPress 콘텐츠 반영 (6페이지)

### 미해결
- 소셜 로그인 후 로그인 상태 전환 안 됨 (SIGNED_IN 후 members 조회 문제)

### 결정 사항
- SmarComm은 이메일만 가입 (B2B 서비스)
- 사이트별 인증 방식은 siteConfig.authMethods로 관리
- 푸터: "© 서비스명. Powered by Ten:One™ Universe." (tenone.biz 링크)
- 새 사이트 추가 시 SITE_GUIDE.md 체크리스트 따를 것

---

## 2026-03-20 (사무실)

### 완료
- ERP를 C-Level 역할 기반으로 재구조화 (CHO/CFO)

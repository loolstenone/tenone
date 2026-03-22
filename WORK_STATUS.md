# 작업 현황

> 마지막 업데이트: 2026-03-23 (집)

## 오늘 한 작업

### 멀티 사이트 확장
- RooK 사이트 신규 생성 (HOME/WORKS/ARTIST/FREE BOARD/ROOKIE/ABOUT)
  - 다크 테마(#282828), 녹색 액센트(#00d255), 기존 rook.co.kr 구조 그대로
  - RooKHeader, RooKFooter 컴포넌트, middleware 도메인 분기
- YouInOne WordPress 콘텐츠 반영 (About/What We Do/Portfolio/People/Contact/Alliance)
  - WordPress XML에서 실제 콘텐츠 추출하여 적용
  - 4개 실제 포트폴리오 (Seoul Street Runway, Promise Booth, 모나미, D.A.M)
- 도메인 연결: tenone.biz, youinone.com (Vercel)

### 브랜드 아이덴티티 체계
- Footer copyright 통일: "© 서비스명. Powered by Ten:One™ Universe." (tenone.biz 링크)
- UniverseBadge 중복 제거
- 헤더 메뉴에서 "홈" 일괄 제거
- globalConfig 도입 (일괄 설정 vs 사이트별 설정 분리)
- SITE_GUIDE.md 관리 가이드 문서 작성
- siteConfig에 authMethods 추가 (사이트별 소셜 로그인 제어)
  - SmarComm: 이메일만 / 나머지: 이메일+Google+카카오

### 인증 시스템
- Supabase Auth 소셜 로그인 연동 (Google OAuth + Kakao OAuth)
  - auth-context에 loginWithGoogle/loginWithKakao 추가
  - /auth/callback OAuth 콜백 라우트 생성
  - PKCE flow: ?code= 파라미터 클라이언트에서 exchangeCodeForSession 처리
- Supabase members 테이블 생성 + RLS 정책 + 마스터 계정
- 소셜 로그인 시 자동 프로필 생성 (members 미존재 시 auto insert)
- members 조회 실패 시 fallback 로그인 처리 (try-catch)
- 로그인/가입 용어 한국어 통일 (Sign In → 로그인, Email → 이메일)
- 가입 페이지에 Google/카카오 소셜 버튼 추가
- Supabase URL Configuration 설정 (Site URL, Redirect URLs 4개)

### 카카오 Developers 설정
- Ten:One™ 앱 생성 (비즈 앱 전환, 사업자등록)
- 동의항목: 닉네임(필수), 프로필사진(필수), 이메일(필수)
- 플랫폼 키: REST API Key + Client Secret
- 리다이렉트 URI: Supabase 콜백 등록

### middleware 개선
- 이중 리라이트 방지 (프리픽스 경로 스킵)
- RooK 도메인 분기 추가
- 전체 리팩터링 (domainPrefixMap 기반 통합)

## 현재 이슈 ⚠️
- **소셜 로그인 후 로그인 상태 전환 안 됨**: SIGNED_IN 이벤트는 발생하지만,
  members 테이블 조회 후 setUser → 페이지 전환이 안 되는 문제.
  try-catch + fallback 처리 추가했으나 아직 라이브 확인 필요.
  가능한 원인: Vercel 배포 반영 지연 또는 RLS 정책 문제.

## 다음에 할 일
- [ ] 소셜 로그인 문제 해결 (라이브에서 최신 배포 확인)
- [ ] 소셜 가입 후 프로필 완성 페이지 유도
- [ ] 인력 구분 · 권한 체계 재설계
- [ ] HeRo 사이트 생성
- [ ] SmarComm 점검 (API 연동, SEO 진단)
- [ ] CMS 게시판 설정 (Imweb 수준)
- [ ] 브랜드 아이덴티티 체계 마무리 (SiteConfig nav/footerLinks)
- [ ] 디버그 로그 제거 (문제 해결 후)

## Vercel 배포 정보
- URL: https://tenone.vercel.app → tenone.biz (연결됨)
- 추가 도메인: youinone.com (연결됨)
- 자동 배포: git push origin master → 자동 빌드+배포
- 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

## 주의사항
- Tailwind CSS v4, Next.js 16 + React 19
- Mock 데이터 기반 (Supabase 연동 시작 단계)
- 멀티 사이트: TenOne/MADLeague/YouInOne/RooK/SmarComm/HeRo (middleware 도메인 분기)
- 새 사이트 추가 시 SITE_GUIDE.md 체크리스트 참조

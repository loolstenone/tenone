# 작업 현황

> 마지막 업데이트: 2026-03-23 (사무실)

## 오늘 한 작업 (사무실)

### 1. 신규 사이트 대량 생성 (19개 사이트 완성)
- 0gamja (공감자): WP XML 콘텐츠 반영, 실제 포스트 6개
- FWN (Fashion Week Network): 홈+About+카테고리+네트워크 등록
- Seoul/360°, 문래지앙, MoNTZ, Badak, HeRo, Domo, JAKKA, Trend Hunter, My Universe, 타우니티, 자연함 등

### 2. 전용 인증 도메인 (auth.tenone.biz) 구현
- auth-hub/login, auth-hub/callback, auth/session 서버 라우트
- AES-256-GCM 토큰 암호화 (lib/auth-transfer.ts)
- auth-context.tsx OAuth를 auth.tenone.biz 경유로 변경
- Vercel 도메인 + 환경변수 + Supabase Redirect URL + DNS A레코드 설정 완료

### 3. CMS → BUMS (Business Unit Management System) 리네임
- DB 테이블: cms_* DROP → bums_* 재생성 (Supabase 실행 완료)
- 코드 전체: 28개 파일 import/타입/변수명 일괄 치환
- 사이드바 라벨 CMS → BUMS

### 4. BUMS Tier 1 핵심 기능 구현
- Tiptap WYSIWYG 리치 에디터 (components/bums/RichEditor.tsx)
- 이미지 업로더 (components/bums/ImageUploader.tsx)
- 게시글 CRUD: 작성/수정(postId 쿼리)/삭제/벌크 관리
- 사이트 브랜딩 관리: 로고/파비콘/OG 업로드, 색상 피커, SEO 메타
- 위젯 관리: CRUD + 실시간 미리보기
- 콘텐츠 API: /api/bums/posts, /api/bums/post/[id], /api/bums/boards
- CMS 권한 모델: admin/editor/contributor + site_access (lib/bums-permissions.ts)
- Supabase CMS 테이블 6개 + ENUM 10개 + 인덱스 + RLS

### 5. BUMS 목차 구조 완성 (PPTX 기준)
- 대시보드, 통계, 고객 관리(4탭), 고객문의, 쇼핑 관리, 예약 관리
- 프로모션, 마케팅 관리
- 사이트 관리(PPTX 레이아웃: 좌측 목록 + 우측 상세), 게시판 관리(3탭), 콘텐츠 관리
- 뉴스레터 관리, 전체 일정 관리, 라이브러리 관리
- 전 페이지 우측 상단 BU(사이트) 선택 드롭다운

### 6. 인트라 디자인 통일
- 본문 max-w-[1200px] 통일
- shadow 제거, rounded-xl → rounded-lg CSS 오버라이드
- 배경 bg-white 통일

### 7. 일일 격언 시스템 (365개)
- lib/daily-quotes.ts: 텐원/마케팅/인생/비즈니스/자기개발/안빈낙도 365개
- 멤버ID + 연도+월+일 djb2 해싱 → 매일 다른 격언, 같은 날 같은 격언

### 8. TenOne 퍼블릭 다크/라이트 모드
- ThemeProvider + ThemeToggle (수직/가로/대각선 랜덤 전환 효과)
- 기본 테마: 블랙(다크)
- CSS 변수 기반 (--tn-bg, --tn-text, --tn-accent 등)
- 홈페이지 + 하위 페이지 + 헤더 + 푸터 테마 적용

### 9. 포탈 아이콘 + 헤더 UI
- 3D 큐브 포탈 아이콘 (PortalIcon.tsx): enter/exit + darkBg 대응
- 3D 입체 아바타 (radial-gradient 구체)
- 3D 입체 토글 (gradient 트랙 + 구체 dot)
- 퍼블릭: CJ(아바타 드롭다운) + ←□(인트라 진입) + ◐(테마)
- 인트라: CJ(아바타 드롭다운+Logout) + □→(퍼블릭 탈출)
- 인트라 사이드바 로고: TEN:ONE™ INTRA

### 10. 팅커벨 포탈 효과 (StarfieldPortal)
- 금빛/은빛 파티클 → 소용돌이 → 포탈 홀 → 클릭 → 인트라 이동
- 멤버 전용 (isAuthenticated)
- Badak 사이트에 예시 적용

## 현재 이슈 ⚠️
- 소셜 로그인: auth.tenone.biz 인프라 완성, DNS 전파 후 라이브 테스트 필요
- 다크모드: 하위 페이지(Contact, Newsletter 등) 일부 하드코딩 색상 남아있음
- 포탈 효과: 트리거 조건 미구현 (10:01 시각, Welcome Back 등)

## 다음에 할 일
- [ ] 다크모드 하위 페이지 색상 완전 적용 (About, Brands, Works, Newsroom 등)
- [ ] 컨텐츠 간 여백 여유 있게 조정
- [ ] 소셜 로그인 라이브 테스트 (auth.tenone.biz DNS 전파 확인)
- [ ] BUMS Tier 2: SEO 동적 관리, 콘텐츠 API ISR 연결, 메뉴 관리
- [ ] BUMS Tier 3: Gmail→CMS 수집 파이프라인, SNS 자동 배포 큐
- [ ] 포탈 트리거 시스템 (10:01, Welcome Back, 포인트, 교육 넛지)
- [ ] 멤버 권한 확정 후 전 사이트 포탈 적용
- [ ] 사이트 로고 이미지 적용 (public/brands/ 폴더에 파일 필요)

## Vercel 배포 정보
- URL: https://tenone.vercel.app → tenone.biz
- 도메인: tenone.biz, youinone.com, madleague.net, rook.co.kr, smarcomm.co.kr, hero.ne.kr, 0gamja.com, seoul360.net, badak.biz, fwn.co.kr, auth.tenone.biz + 서브도메인 8개
- 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_AUTH_DOMAIN, AUTH_TOKEN_ENCRYPTION_KEY

## 주의사항
- Tailwind CSS v4, Next.js 16 + React 19
- Supabase: members + bums_* 테이블 (cms_* 삭제됨)
- 멀티 사이트 19개 (middleware 도메인 분기)
- BUMS = Business Unit Management System (구 CMS)
- 테마: 기본 다크, 토글로 라이트 전환 가능

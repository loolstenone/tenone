import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone', // Vercel에서는 불필요 (Cloud Run용)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ziotlxkdctlhiwkgmmsh.supabase.co', pathname: '/storage/v1/object/public/**' },
      // OAuth 프로필 이미지
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },   // Google
      { protocol: 'https', hostname: 'k.kakaocdn.net' },              // Kakao
      { protocol: 'https', hostname: 'phinf.pstatic.net' },          // Naver
      { protocol: 'https', hostname: 'images.unsplash.com' },        // Unsplash (Mock 데이터)
    ],
  },
  serverExternalPackages: ['@anthropic-ai/sdk'],
  async rewrites() {
    return [
      // tenone.biz/@handle → /profile/@handle (유니버스 프로필 단축 URL)
      { source: '/@:handle', destination: '/profile/@:handle' },
      // 플래너'스 AI 연결(MCP) — OAuth 보호 자원 메타데이터 (RFC 9728). 연결 서버 /api/planners-mcp 가 어느 로그인 서버를 쓰는지 알려 준다
      { source: '/.well-known/oauth-protected-resource', destination: '/api/oauth-protected-resource' },
      { source: '/.well-known/oauth-protected-resource/:path*', destination: '/api/oauth-protected-resource' },
    ];
  },

  async redirects() {
    return [
      // AI 플래너 핵심 화면 MyVerse → Planner's 이전 (2026-10-14, app/(Planners)/CLAUDE.md '이전 계획' 4단계)
      // 개인 OS 화면(캡처·흔적·일기·피드·이력서 등)은 /myverse/app 에 그대로 남는다
      {
        source: '/myverse/app/:page(today|daily|weekly|monthly|yearly|projects|tasks|canvas|templates|schedule|ai-briefing|search|settings|onboarding|help|notifications|index|time|contacts)/:rest*',
        destination: '/planners/app/:page/:rest*',
        permanent: false,
      },
      { source: '/myverse/app/personal', destination: '/planners/app/personal', permanent: false },
      // 옛 구글 사이트(planners.tenone.biz/planners-planner/…) 주소 - PAD PDF 도움말 링크가 아직 가리킨다 (2026-10-18)
      // P.I 도움말 → PAD 들어오는 길(P.I), 그 밖의 옛 페이지 → 플래너를 다시 만들다(About)
      { source: '/planners-planner/%ED%8D%BC%EC%8A%A4%EB%84%90-%EC%95%84%EC%9D%B4%EB%8D%B4%ED%8B%B0%ED%8B%B0', destination: '/planners/ai/from/pi', permanent: true }, // 퍼스널-아이덴티티 (주소는 인코딩된 그대로 비교)
      { source: '/planners-planner/:path*', destination: '/planners/about', permanent: true },
      // 삭제된 페이지 — 301 리다이렉트
      { source: '/goods', destination: '/', permanent: true },
      { source: '/goods/:path*', destination: '/', permanent: true },
      // 쓰지 않던 TenOne 옛 화면 삭제 (2026-10-18) - 지원 폼(저장 안 됨)·초대 코드 가입·옛 첫 설정. tenone.biz에서만 홈으로
      // (브랜드 도메인은 middleware가 /{brand}/apply 등으로 rewrite하므로 host로 한정 - madleague.net/apply를 막지 않게)
      ...['/apply', '/invite', '/onboarding'].map(source => ({
        source,
        has: [{ type: 'host' as const, value: '(www\\.)?tenone\\.biz|localhost' }],
        destination: '/',
        permanent: true,
      })),
      // 뉴스룸 폐지 (2026-10-05)
      { source: '/newsroom', destination: '/', permanent: true },
      { source: '/newsroom/:path*', destination: '/', permanent: true },
      // URL 컨벤션 통일 (PascalCase → kebab-case)
      { source: '/CrewInvite', destination: '/crew-invite', permanent: true },
      // MADLeague: 구 라우트 → 신 사이트맵 (2026-04-16 v2)
      { source: '/madleague/program', destination: '/madleague/programs', permanent: true },
      // /madleague/pt — 워크스페이스 페이지로 전환 (리디렉트 제거됨)
      { source: '/madleague/idea-movement', destination: '/madleague/programs/im', permanent: true },
      { source: '/madleague/idea-movement/:path*', destination: '/madleague/programs/im/:path*', permanent: true },
      { source: '/madleague/leaguer', destination: '/madleague/member', permanent: true },
      // 프로그램 주소 체계 통일 (2026-10-08) — 히어로 프로그램은 /programs/ 아래로, IM 에센스는 IM 페이지 섹션으로 흡수
      { source: '/madleague/hero', destination: '/madleague/programs/hero', permanent: true },
      { source: '/madleague/programs/im/essence', destination: '/madleague/programs/im#essence', permanent: true },
      // HeRo 요금 안내 제거 (2026-10-12) — 통신판매업 신고 전 가격표·결제 문구 노출 금지. 사업 시작 시 복원
      { source: '/hero/pricing', destination: '/hero/hit', permanent: false },
      // 동아리 방(비공개 카페) 폐지 — 2026-10-11. 옛 주소는 동아리 소개 페이지로
      { source: '/madleague/clubs/:slug/room', destination: '/madleague/clubs/:slug', permanent: true },
      { source: '/madleague/clubs/:slug/room/:path*', destination: '/madleague/clubs/:slug', permanent: true },
      // Wiki 강제 이동 — 모든 /intra/wiki/* → wiki.tenone.biz (SSOT)
      { source: '/intra/wiki', destination: 'https://wiki.tenone.biz', permanent: true },
      { source: '/intra/wiki/:path*', destination: 'https://wiki.tenone.biz/:path*', permanent: true },
    ];
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    return [
      // 보안 헤더 — 전체 경로
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // 외부 서버 운영 브랜드의 이전 준비용 스테이징 — 검색 노출 차단 (CLAUDE.md §0.1 원칙 6)
      ...['badak', 'madleague', 'madleap'].map(brand => ({
        source: '/:path*',
        has: [{ type: 'host' as const, value: `${brand}.tenone.biz` }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
      // 마케팅/랜딩 페이지 — 1시간 캐시 (ISR 대체)
      {
        source: '/(about|brands|history|universe|works)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      {
        source: '/wio/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      {
        source: '/(badak|hero|rook|madleague|madleap|changeup|youinone|mindle)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=1800, stale-while-revalidate=86400' }],
      },
      // 인트라/마이버스 — SSR (캐시 없음)
      {
        source: '/intra/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      // API — 캐시 없음
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
};

export default nextConfig;

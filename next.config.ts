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
    ];
  },

  async redirects() {
    return [
      // 삭제된 페이지 — 301 리다이렉트
      { source: '/goods', destination: '/', permanent: true },
      { source: '/goods/:path*', destination: '/', permanent: true },
      // URL 컨벤션 통일 (PascalCase → kebab-case)
      { source: '/CrewInvite', destination: '/crew-invite', permanent: true },
      // MADLeague: 구 라우트 → 신 사이트맵 (2026-04-16 v2)
      { source: '/madleague/program', destination: '/madleague/programs', permanent: true },
      // /madleague/pt — 워크스페이스 페이지로 전환 (리디렉트 제거됨)
      { source: '/madleague/idea-movement', destination: '/madleague/programs/im', permanent: true },
      { source: '/madleague/idea-movement/:path*', destination: '/madleague/programs/im/:path*', permanent: true },
      { source: '/madleague/leaguer', destination: '/madleague/member', permanent: true },
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

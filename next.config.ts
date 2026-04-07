import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone', // Vercel에서는 불필요 (Cloud Run용)
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@anthropic-ai/sdk'],
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  async redirects() {
    return [
      // 삭제된 페이지 — 301 리다이렉트
      { source: '/goods', destination: '/', permanent: true },
      { source: '/goods/:path*', destination: '/', permanent: true },
    ];
  },

  async headers() {
    return [
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

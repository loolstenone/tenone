import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone', // Vercel에서는 불필요 (Cloud Run용)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

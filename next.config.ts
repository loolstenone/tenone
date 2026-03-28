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
};

export default nextConfig;

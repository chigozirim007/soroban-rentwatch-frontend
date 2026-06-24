import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow Freighter to be imported dynamically without build errors
  transpilePackages: ["@stellar/freighter-api"],
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
};

export default nextConfig;

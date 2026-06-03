import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray parent lockfile exists).
  turbopack: { root: __dirname },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/content.ts reads content/*.yaml from disk. Pages are rendered at build time,
  // but if one ever renders on a server, its function needs the files too.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
};

export default nextConfig;

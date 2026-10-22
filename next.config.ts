import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/content.ts reads content/*.yaml from disk. Pages are rendered at build time,
  // but if one ever renders on a server, its function needs the files too.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  // /ft7: FT7's download page, a Vercel project of its own (ft7-site). Only these paths go there; nothing else
  // on this site changes.
  async rewrites() {
    return [
      { source: "/ft7", destination: "https://ft7-site.vercel.app/ft7" },
      { source: "/ft7/:path*", destination: "https://ft7-site.vercel.app/ft7/:path*" },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright must run server-side only — exclude from client bundle
  serverExternalPackages: ["playwright", "playwright-core"],

  // Disable x-powered-by header
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

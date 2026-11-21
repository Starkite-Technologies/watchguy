import type { NextConfig } from "next";
// Set by `npm run cf:build`. Cloudflare Workers cannot load native sharp; image
// re-encoding there uses the Cloudflare Images binding (src/lib/image-processing.ts).
const cloudflare = process.env.BUILD_TARGET === "cloudflare";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: cloudflare
    ? ["@prisma/client", ".prisma/client", "@prisma/adapter-pg"]
    : ["@prisma/client", "@prisma/adapter-pg", "sharp"],
  webpack(webpackConfig, { isServer }) {
    if (cloudflare && isServer) {
      webpackConfig.resolve ??= {};
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias as Record<string, unknown>),
        sharp: false,
      };
    }
    return webpackConfig;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;

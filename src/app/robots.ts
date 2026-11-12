import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.APP_ORIGIN || "http://localhost:3002";
  return {
    rules: {
      userAgent: "*",
      allow: process.env.DEMO_MODE === "true" ? undefined : "/",
      disallow: process.env.DEMO_MODE === "true" ? "/" : ["/admin", "/api/"],
    },
    sitemap: origin + "/sitemap.xml",
  };
}

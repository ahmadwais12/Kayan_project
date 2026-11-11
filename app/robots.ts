import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  const base = (seo.canonicalBase || process.env.APP_URL || "http://localhost:3333").replace(/\/$/, "");
  const policy = (seo.robotsPolicy || "").toLowerCase();
  const blocked = policy.includes("noindex") || policy.includes("none");

  if (blocked) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${base}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

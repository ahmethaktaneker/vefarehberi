import type { MetadataRoute } from "next";
import { SITE_URL, YAYINDA } from "@/lib/marka";

export default function robots(): MetadataRoute.Robots {
  if (!YAYINDA) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/legal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/tableau-de-bord", "/admin", "/paiement", "/auth", "/connexion-votant", "/nouveau-mot-de-passe"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

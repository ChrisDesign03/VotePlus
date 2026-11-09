import type { MetadataRoute } from "next";
import { getOpenContests } from "@/lib/public-data";
import { SITE_URL } from "@/lib/legal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "/aide", "/conditions", "/confidentialite", "/reglement", "/remboursement", "/mentions-legales", "/contrat-organisateur"];
  const contests = await getOpenContests().catch(() => []);
  return [
    ...fixed.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.3 })),
    ...contests.map((c) => ({ url: `${SITE_URL}/concours/${c.slug}`, changeFrequency: "hourly" as const, priority: 0.8 })),
  ];
}

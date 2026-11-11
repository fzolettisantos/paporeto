import type { MetadataRoute } from "next";
import faces from "@/generated/character-faces.json";
import illustrations from "@/generated/ranking-illustrations.json";
import { PERSONAGENS } from "@/config/personagens";
import { absoluteUrl } from "@/config/site";
import { RANKING_SLUGS } from "@/types";

const FACES = faces as Record<string, string[]>;
const ILLUSTRATIONS = illustrations as Record<string, { src: string } | undefined>;

/** Sitemap com as páginas principais, as abas e a página de cada integrante (com imagens). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    ...RANKING_SLUGS.map((slug) => ({
      url: absoluteUrl(`/${slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.9,
      images: ILLUSTRATIONS[slug] ? [absoluteUrl(ILLUSTRATIONS[slug]!.src)] : undefined,
    })),
    {
      url: absoluteUrl("/bancada"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      images: PERSONAGENS.flatMap((p) => (FACES[p.slug]?.[0] ? [absoluteUrl(FACES[p.slug]![0]!)] : [])),
    },
    ...PERSONAGENS.map((p) => ({
      url: absoluteUrl(`/bancada/${p.pageSlug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: FACES[p.slug]?.[0] ? [absoluteUrl(FACES[p.slug]![0]!)] : undefined,
    })),
    { url: absoluteUrl("/charges"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { TAB_SLUGS } from "@/types";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    ...TAB_SLUGS.map((slug) => ({ url: absoluteUrl(`/${slug}`), changeFrequency: "hourly" as const, priority: 0.8 })),
  ];
}

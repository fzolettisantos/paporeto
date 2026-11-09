import { PERSONAGENS_COPY } from "@/config/personagens";
import { CHARGES_COPY, RANKINGS } from "@/config/rankings";
import { renderOgImage, OG_SIZE } from "@/lib/og";
import { isRankingSlug } from "@/lib/validation";
import { TAB_SLUGS } from "@/types";

export const alt = "Papo Reto Ranking";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return TAB_SLUGS.map((tab) => ({ tab }));
}

export default async function Image({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (isRankingSlug(tab)) {
    const copy = RANKINGS[tab];
    return renderOgImage({
      eyebrow:
        copy.mode === "static"
          ? "Ranking do programa · quem tá na mira?"
          : copy.kind === "positive"
            ? "Ranking positivo · vote agora"
            : "Ranking da vergonha · vote agora",
      title: copy.title,
      subtitle: copy.subtitle,
      accent: copy.kind === "positive" ? "#32D583" : "#F04438",
    });
  }
  if (tab === "personagens") {
    return renderOgImage({ eyebrow: "Elenco · fichas da resenha", title: "Os personagens do Papo Reto", subtitle: PERSONAGENS_COPY.subtitle, accent: "#FFD23F" });
  }
  return renderOgImage({ eyebrow: "Galeria", title: CHARGES_COPY.title, subtitle: CHARGES_COPY.subtitle, accent: "#FFD23F" });
}

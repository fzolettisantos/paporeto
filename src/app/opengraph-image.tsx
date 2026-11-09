import { renderOgImage, OG_SIZE } from "@/lib/og";

export const alt = "Papo Reto Ranking — A resenha é deles. A corneta é sua.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Vote nos rankings da resenha",
    title: "Quem merece o topo — ou a vergonha?",
    subtitle: "Falou Mais Merda · O Mais Sábio · Bala do Véio",
    accent: "#FFD23F",
  });
}

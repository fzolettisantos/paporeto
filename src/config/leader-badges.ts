import type { RankingSlug } from "@/types";

/**
 * Selo holográfico do 1º colocado de cada ranking (coluna direita do card).
 * Imagens em /public/rankings, já recortadas e reduzidas (máx. 192px, ~20–40 KB).
 */
export type LeaderBadge = {
  src: string;
  /** Texto alternativo descritivo (acessibilidade e Google Imagens). */
  alt: string;
  width: number;
  height: number;
};

export const LEADER_BADGES: Partial<Record<RankingSlug, LeaderBadge>> = {
  "falou-merda": {
    src: "/rankings/falou-merda-badge-holo.webp",
    alt: "Selo holográfico do Troféu Falou Merda com taça dourada, prêmio do 1º colocado no ranking do Papo Reto",
    width: 192,
    height: 192,
  },
  sabio: {
    src: "/rankings/sabio-badge-holo.webp",
    alt: "Selo holográfico d'O Sábio da Resenha com busto dourado, prêmio do 1º colocado no ranking do Papo Reto",
    width: 185,
    height: 192,
  },
  "bala-do-veio": {
    src: "/rankings/bala-do-veio-badge-holo.webp",
    alt: "Selo holográfico do Bala do Véio com arma de berinjela, marca do 1º colocado na mira do Véio",
    width: 192,
    height: 191,
  },
};

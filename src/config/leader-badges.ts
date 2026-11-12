import type { RankingSlug } from "@/types";

/**
 * Taça/selo do 1º colocado de cada ranking (ícone no canto do card).
 * Imagens em /public/rankings, já recortadas e reduzidas (máx. 192px, ~20–40 KB).
 */
export type LeaderBadge = {
  src: string;
  /** Texto alternativo descritivo (acessibilidade e Google Imagens). */
  alt: string;
  width: number;
  height: number;
  /** Posição/tamanho no card; sem valor usa o canto superior direito padrão. */
  className?: string;
};

export const LEADER_BADGES: Partial<Record<RankingSlug, LeaderBadge>> = {
  "falou-merda": {
    src: "/rankings/falou-merda-trophy-icon.webp",
    alt: "Taça dourada do Troféu Falou Merda, prêmio do 1º colocado no ranking do Papo Reto",
    width: 154,
    height: 192,
  },
  sabio: {
    src: "/rankings/sabio-badge-holo.webp",
    alt: "Selo holográfico d'O Sábio da Resenha com busto dourado, prêmio do 1º colocado no ranking do Papo Reto",
    width: 185,
    height: 192,
    className: "-top-6 right-2 h-14 sm:-top-7 sm:right-3 sm:h-16",
  },
  // Canto superior direito, acima do botão de compartilhar (centralizado na linha).
  "bala-do-veio": {
    src: "/rankings/bala-do-veio-badge-holo.webp",
    alt: "Selo holográfico do Bala do Véio com arma de berinjela, marca do 1º colocado na mira do Véio",
    width: 192,
    height: 191,
    className: "-top-6 right-2 h-14 sm:-top-7 sm:right-3 sm:h-16",
  },
};

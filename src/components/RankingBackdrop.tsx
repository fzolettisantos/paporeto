"use client";

import { AnimatePresence, motion } from "motion/react";
import type { TabSlug } from "@/types";

/**
 * Arte de fundo das laterais de cada ranking (Falou Merda, Sábio e Bala do Véio), fixa nas bordas da tela.
 * Só aparece em telas largas (≥ 1280px), onde sobra espaço ao lado do conteúdo — no celular, nada é carregado.
 */
interface Side {
  src: string;
  /** Tamanho do arquivo, para calcular a largura máxima na altura da tela. */
  width: number;
  height: number;
  /** Quanto pode avançar por baixo do conteúdo (ex.: "14rem" no lado dos cards, que têm fundo sólido). */
  overlap?: string;
  /** Posição horizontal da arte quando não cabe inteira (ex.: "50%"); padrão: presa na borda da tela. */
  focus?: string;
}

interface Backdrop {
  left: Side;
  right: Side;
}

const BACKDROPS: Partial<Record<TabSlug, Backdrop>> = {
  "falou-merda": {
    left: { src: "/rankings/falou-merda-bg-left.webp", width: 440, height: 849 },
    right: { src: "/rankings/falou-merda-bg-right.webp", width: 440, height: 849 },
  },
  "bala-do-veio": {
    // Arte mais larga e voltada para o centro: à esquerda (lado do título) fica centralizada no caixote e nos
    // balões; à direita avança por baixo dos cards (fundo sólido) e fica presa na arma e nos balões.
    left: { src: "/rankings/bala-do-veio-bg-left.webp", width: 570, height: 849, focus: "55%" },
    right: { src: "/rankings/bala-do-veio-bg-right.webp", width: 752, height: 849, overlap: "14rem", focus: "0%" },
  },
  sabio: {
    left: { src: "/rankings/sabio-bg-left.webp", width: 440, height: 849 },
    right: { src: "/rankings/sabio-bg-right.webp", width: 540, height: 849 },
  },
};

// Espaço livre ao lado do conteúdo (64rem): a arte nunca passa por trás do texto.
const GAP = "calc((100vw - 64rem) / 2 + 0.5rem)";

/**
 * As duas laterais usam sempre a altura completa da tela (mesma escala dos dois lados, já que os arquivos
 * têm a mesma altura). A largura é limitada ao espaço livre: em telas menores aparece só a parte de fora.
 */
function SideArt({ side, align }: { side: Side; align: "left" | "right" }) {
  return (
    <div
      className={`absolute inset-y-0 ${align === "left" ? "left-0" : "right-0"}`}
      style={{
        width: `min(calc(${GAP} + ${side.overlap ?? "0rem"}), calc(100vh * ${side.width} / ${side.height}))`,
        backgroundImage: `url(${side.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto 100%",
        backgroundPosition: `${side.focus ?? align} center`,
        // Some em direção ao conteúdo.
        maskImage: `linear-gradient(to ${align === "left" ? "right" : "left"}, #000 80%, transparent)`,
      }}
    />
  );
}

export function RankingBackdrop({ tab }: { tab: TabSlug }) {
  const art = BACKDROPS[tab];
  return (
    <AnimatePresence>
      {art ? (
        <motion.div
          key={tab}
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 hidden xl:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <SideArt side={art.left} align="left" />
          <SideArt side={art.right} align="right" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

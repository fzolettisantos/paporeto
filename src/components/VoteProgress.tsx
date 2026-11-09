"use client";

import { motion } from "motion/react";
import { formatPercent } from "@/lib/ranking";
import { AnimatedNumber } from "./AnimatedNumber";

/** Barra de votos. O texto ao lado comunica os números; a barra é decorativa. */
export function VoteProgress({ votes, percent, color }: { votes: number; percent: number; color: string }) {
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-bold tabular">
          <AnimatedNumber value={votes} /> {votes === 1 ? "voto" : "votos"}
        </span>
        <span className="font-display text-lg leading-none tabular">{formatPercent(percent)}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <motion.div
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ scaleX: Math.max(percent, 0.5) / 100 }}
          transition={{ type: "spring", stiffness: 140, damping: 24 }}
        />
      </div>
    </div>
  );
}

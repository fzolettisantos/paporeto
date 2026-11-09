"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { RANKINGS } from "@/config/rankings";
import { placeholderMood, resolveCharacterImage } from "@/lib/characters";
import { resolveExpressionState } from "@/lib/ranking";
import type { AvatarPaths, ExpressionState, RankingSlug } from "@/types";
import { PlaceholderFace } from "./PlaceholderFace";

const SIZES = {
  sm: { box: "size-12", px: 48 },
  md: { box: "size-16", px: 64 },
  lg: { box: "size-[84px] sm:size-24", px: 96 },
} as const;

export interface CharacterAvatarProps {
  /** Slug do participante (pasta em public/characters). */
  characterId: string;
  rankingType: RankingSlug;
  position: number;
  totalParticipants: number;
  /** Estado calculado pelo ranking (considera empates). Sem ele, usa posição/total. */
  expression?: ExpressionState;
  size?: keyof typeof SIZES;
  name: string;
  /** Caricaturas cadastradas no banco (têm prioridade sobre public/characters). */
  sources?: AvatarPaths;
  /** Carregar imediatamente (primeiros cards visíveis). */
  eager?: boolean;
  className?: string;
}

/**
 * Caricatura com a expressão certa para o participante, o ranking e a posição.
 * Sem o arquivo exato, mostra o placeholder ilustrado da mesma expressão — nunca outra expressão.
 */
export function CharacterAvatar({
  characterId,
  rankingType,
  position,
  totalParticipants,
  expression,
  size = "md",
  name,
  sources,
  eager = false,
  className = "",
}: CharacterAvatarProps) {
  const state = expression ?? resolveExpressionState(position, totalParticipants);
  const src = resolveCharacterImage(characterId, rankingType, state, sources);
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = src !== null && failed !== src;
  const description = RANKINGS[rankingType].expressions[state];
  const label = showImage ? `Caricatura de ${name}: ${description}` : `Ilustração provisória de ${name}: ${description}`;
  const { box, px } = SIZES[size];

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative shrink-0 overflow-hidden rounded-full ${box} ${
        // Caricatura real: fundo "papel de jornal" para destacar o rosto. Placeholder: fundo escuro tracejado.
        showImage ? "bg-[#EDE3CC]" : "bg-surface-2 outline-1 outline-dashed outline-line -outline-offset-1"
      } ${className}`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={`${state}:${showImage ? src : "placeholder"}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          {showImage ? (
            <Image
              src={src}
              alt=""
              fill
              sizes={`${px}px`}
              loading={eager ? "eager" : "lazy"}
              className="object-cover"
              onError={() => setFailed(src)}
            />
          ) : (
            <PlaceholderFace mood={placeholderMood(rankingType, state)} className="size-full" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

"use client";

import { Share2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { withBase } from "@/config/site";
import { pickPhrase, RANKINGS } from "@/config/rankings";
import type { BalaShot, RankedEntry, RankingSlug } from "@/types";
import { CharacterAvatar } from "./CharacterAvatar";
import { ShotsTable } from "./ShotsTable";
import { RankingPosition, type Move } from "./RankingPosition";
import { VoteButton, type VoteButtonState } from "./VoteButton";
import { VoteProgress } from "./VoteProgress";

const LEADER_TROPHIES: Partial<Record<RankingSlug, { src: string; alt: string; width: number; height: number; className?: string }>> = {
  "falou-merda": {
    src: "/rankings/falou-merda-trophy-icon.webp",
    alt: "Taça do Troféu Falou Merda: 1º lugar",
    width: 206,
    height: 256,
  },
  sabio: {
    src: "/rankings/sabio-trophy-icon.webp",
    alt: "Taça d'O Sábio da Resenha: 1º lugar",
    width: 197,
    height: 256,
  },
  // Selo largo: fica acima do botão de compartilhar, sem invadir o texto.
  "bala-do-veio": {
    src: "/rankings/bala-do-veio-badge-icon.webp",
    alt: "Selo do Bala do Véio: 1º lugar",
    width: 256,
    height: 167,
    className: "-top-7 right-2 h-14 sm:-top-8 sm:right-3 sm:h-16",
  },
};

export function RankingCard({
  slug,
  entry,
  totalParticipants,
  voteState,
  move,
  eager,
  index,
  shots,
  onVote,
  onShare,
}: {
  slug: RankingSlug;
  entry: RankedEntry;
  totalParticipants: number;
  voteState: VoteButtonState;
  move?: Move;
  eager?: boolean;
  /** Ordem do card na lista (varia as frases mesmo entre empatados). */
  index: number;
  /** Bala do Véio: tiros do participante (tabela no box). */
  shots?: BalaShot[];
  onVote: () => void;
  onShare: () => void;
}) {
  const copy = RANKINGS[slug];
  const leader = entry.state === "top";
  const badge = entry.state === "top" ? copy.badges.top : entry.state === "bottom" ? copy.badges.bottom : null;
  const barColor = leader ? "#FFD23F" : copy.kind === "positive" ? "#32D583" : "#F04438";
  const { participant } = entry;
  const isStatic = copy.mode === "static";
  /** Taça em ícone no canto do 1º colocado (rankings com troféu). */
  const trophy = LEADER_TROPHIES[slug];
  const showTrophy = Boolean(trophy) && leader && entry.position === 1;
  const shareButton = (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-white transition-colors hover:border-yellow"
      aria-label={`Compartilhar card de ${participant.name}`}
    >
      <Share2 aria-hidden className="size-5" />
    </button>
  );

  return (
    <motion.li
      layout="position"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="list-none"
    >
      <article
        aria-label={`${entry.position}º lugar${entry.tied ? " (empatado)" : ""}: ${participant.name}`}
        className={`relative rounded-2xl border p-3 sm:p-4 ${
          leader ? "border-yellow bg-gradient-to-br from-yellow/12 to-surface" : "border-line bg-surface"
        } ${move ? "animate-flash" : ""}`}
      >
        {showTrophy && trophy ? (
          <Image
            src={withBase(trophy.src)}
            alt={trophy.alt}
            width={trophy.width}
            height={trophy.height}
            className={`pointer-events-none absolute w-auto drop-shadow-[0_4px_10px_rgba(255,210,63,0.45)] ${
              trophy.className ?? "-top-5 right-2 h-16 sm:-top-6 sm:right-3 sm:h-20"
            }`}
          />
        ) : null}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <RankingPosition position={entry.position} tied={entry.tied} leader={leader} move={move} />
          <CharacterAvatar
            characterId={participant.slug}
            rankingType={slug}
            position={entry.position}
            totalParticipants={totalParticipants}
            expression={entry.state}
            size={leader ? "lg" : "md"}
            name={participant.name}
            sources={participant.avatarPaths}
            eager={eager}
          />
          <div className={`min-w-0 flex-1 ${showTrophy && !trophy?.className ? "pr-12 sm:pr-16" : ""}`}>
            {badge ? (
              <p
                className={`mb-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  leader ? "bg-yellow text-ink" : "bg-surface-2 text-muted"
                }`}
              >
                {badge}
              </p>
            ) : null}
            <h2 className="line-clamp-2 break-words font-display text-[22px] uppercase leading-[1.05] sm:text-2xl">{participant.name}</h2>
            {participant.nickname ? (
              <p className="-mt-0.5 truncate text-xs font-semibold text-muted">{participant.nickname}</p>
            ) : null}
            <p className="text-[14px] leading-snug text-muted">“{pickPhrase(slug, entry.state, participant.slug, index + 1)}”</p>
          </div>
          {/* Ranking estático: sem votos nem botão de voto, só compartilhar. */}
          {isStatic ? shareButton : null}
        </div>

        {isStatic && shots ? <ShotsTable shots={shots} name={participant.name} /> : null}

        {isStatic ? null : (
          <>
            <VoteProgress votes={entry.votes} percent={entry.percent} color={barColor} />
            <div className="mt-3 flex gap-2">
              <div className="flex-1">
                <VoteButton state={voteState} label={copy.cta ?? "Votar"} participantName={participant.name} onVote={onVote} />
              </div>
              {shareButton}
            </div>
          </>
        )}
      </article>
    </motion.li>
  );
}

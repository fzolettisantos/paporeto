"use client";

import { Crown } from "lucide-react";
import { motion } from "motion/react";
import { RANKINGS } from "@/config/rankings";
import { formatNumber } from "@/lib/ranking";
import type { PeriodChampion, RankingSlug, RankingView } from "@/types";
import { CharacterAvatar } from "./CharacterAvatar";

const LABEL: Record<RankingView, string> = { week: "Semana passada", month: "Mês passado", season: "Temporada passada" };

/** Últimos campeões (semana, mês e temporada já encerrados). O do filtro atual fica em destaque. */
export function ChampionsStrip({ slug, champions, view }: { slug: RankingSlug; champions: PeriodChampion[]; view: RankingView }) {
  const copy = RANKINGS[slug];
  return (
    <section aria-labelledby={`champions-${slug}`} className="mb-4 rounded-2xl border border-yellow/40 bg-gradient-to-br from-yellow/10 to-surface p-3 sm:p-4">
      <h3 id={`champions-${slug}`} className="flex items-center gap-2 font-display text-xl uppercase leading-none text-yellow">
        <Crown aria-hidden className="size-5" /> Últimos campeões
      </h3>
      <p className="mt-1 text-[12px] font-semibold text-muted">{copy.badges.top} de cada período encerrado.</p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {champions.map((c) => {
          const active = c.view === view;
          const winner = c.winners[0];
          return (
            <motion.li
              key={c.view}
              layout
              className={`flex min-w-0 flex-col items-center rounded-xl border p-2 text-center ${
                active ? "border-yellow bg-yellow/10" : "border-line bg-bg/50"
              }`}
              aria-current={active ? "true" : undefined}
            >
              <span className="text-[10px] font-extrabold uppercase leading-tight tracking-wide text-muted">{LABEL[c.view]}</span>
              <span className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-muted/80">{c.period.label}</span>
              {winner ? (
                <>
                  <span className="relative mt-1.5">
                    <CharacterAvatar
                      characterId={winner.participant.slug}
                      rankingType={slug}
                      position={1}
                      totalParticipants={2}
                      expression="top"
                      size="sm"
                      name={winner.participant.name}
                      sources={winner.participant.avatarPaths}
                    />
                    <Crown aria-hidden className="absolute -right-1.5 -top-2 size-5 rotate-12 fill-yellow text-yellow" />
                  </span>
                  <span className="mt-1 w-full break-words text-[12px] font-extrabold uppercase leading-tight">
                    {c.winners.map((w) => w.participant.name).join(" e ")}
                  </span>
                  <span className="text-[11px] font-semibold tabular text-muted">
                    {formatNumber(winner.votes)} {winner.votes === 1 ? "voto" : "votos"}
                    {c.winners.length > 1 ? " · empate" : ""}
                  </span>
                </>
              ) : (
                <span className="mt-3 text-[12px] font-semibold text-muted">Sem votos</span>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

"use client";

import { VIEW_LABEL } from "@/lib/period";
import { RANKING_VIEWS, type RankingView } from "@/types";

/** Seletor Semana · Mês · Temporada (botões com aria-pressed, 44px de toque). */
export function PeriodSwitcher({ value, onChange, compact }: { value: RankingView; onChange: (view: RankingView) => void; compact?: boolean }) {
  return (
    <div role="group" aria-label="Período do ranking" className={`${compact ? "mt-2" : "mt-4"} grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1`}>
      {RANKING_VIEWS.map((view) => {
        const active = view === value;
        return (
          <button
            key={view}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(view)}
            className={`min-h-11 rounded-lg text-[14px] font-extrabold uppercase tracking-wide transition-colors ${
              active ? "bg-yellow text-ink" : "text-muted hover:text-white"
            }`}
          >
            {VIEW_LABEL[view]}
          </button>
        );
      })}
    </div>
  );
}

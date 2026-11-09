import { ArrowDown, ArrowUp } from "lucide-react";

export type Move = "up" | "down";

/** Numeração da posição, com indicação textual de empate e de subida/descida (não só por cor). */
export function RankingPosition({ position, tied, leader, move }: { position: number; tied: boolean; leader: boolean; move?: Move }) {
  return (
    <div className="flex w-11 shrink-0 flex-col items-center sm:w-14">
      <span
        className={`font-display leading-none tabular ${leader ? "text-[44px] text-yellow sm:text-6xl" : "text-[30px] text-white sm:text-4xl"}`}
      >
        {position}º
      </span>
      {tied ? <span className="mt-1 rounded bg-surface-2 px-1 text-[10px] font-extrabold uppercase tracking-wide text-muted">Empate</span> : null}
      {move ? (
        <span
          className={`mt-1 inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase ${move === "up" ? "text-yellow" : "text-muted"}`}
        >
          {move === "up" ? <ArrowUp aria-hidden className="size-3" /> : <ArrowDown aria-hidden className="size-3" />}
          {move === "up" ? "Subiu" : "Caiu"}
        </span>
      ) : null}
    </div>
  );
}

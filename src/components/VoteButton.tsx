"use client";

import { Check, Loader2, Lock } from "lucide-react";

export type VoteButtonState = "idle" | "loading" | "voted" | "locked" | "closed";

export function VoteButton({
  state,
  label,
  participantName,
  onVote,
}: {
  state: VoteButtonState;
  label: string;
  participantName: string;
  onVote: () => void;
}) {
  const base =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-extrabold uppercase tracking-wide transition-[transform,background-color] active:scale-[0.98]";

  if (state === "voted") {
    return (
      <p className={`${base} border-2 border-green bg-green/10 text-green`} role="status">
        <Check aria-hidden className="size-5" /> Seu voto da semana
        <span className="sr-only"> foi para {participantName}</span>
      </p>
    );
  }
  if (state === "locked" || state === "closed") {
    return (
      <button type="button" disabled className={`${base} cursor-not-allowed bg-surface-2 text-muted`}>
        <Lock aria-hidden className="size-4" />
        {state === "closed" ? "Votação pausada" : "Já votou esta semana"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onVote}
      disabled={state === "loading"}
      aria-busy={state === "loading"}
      aria-label={`${label}: ${participantName}`}
      className={`${base} bg-yellow text-ink hover:bg-[#ffdc66] disabled:opacity-80`}
    >
      {state === "loading" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : null}
      {state === "loading" ? "Votando…" : label}
    </button>
  );
}

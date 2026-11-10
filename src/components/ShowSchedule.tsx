"use client";

import { motion } from "motion/react";
import { CalendarDays, Clock, Tv } from "lucide-react";
import { useSyncExternalStore } from "react";
import { site } from "@/config/site";
import { formatCountdown, getShowStatus, nextShowLabel, SHOW_SCHEDULE, WEEKDAYS_SHORT, type ShowStatus } from "@/lib/schedule";

// Relógio compartilhado: atualiza a cada segundo só enquanto há alguém mostrando.
let snapshot: ShowStatus | null = null;
const listeners = new Set<() => void>();
let timer: number | undefined;
function tick() {
  snapshot = getShowStatus();
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = window.setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Card "No ar": ao vivo agora ou contagem para o próximo programa (horário de Brasília). */
export function ShowSchedule() {
  // No servidor (HTML em cache) não sabemos a hora: mostra só o horário fixo.
  const status = useSyncExternalStore(subscribe, () => (snapshot ??= getShowStatus()), () => null);

  return (
    <section aria-labelledby="schedule-title" className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-red/15 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id="schedule-title" className="max-w-2xl font-display text-[24px] uppercase leading-[1.05] sm:text-[32px]">
            Joneta, Joneta... abre a jauleta... <span className="text-yellow">o Papo Reto vai começar...</span>
          </h2>
          {status?.live ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide text-white" role="status">
              <motion.span
                aria-hidden
                className="size-2.5 rounded-full bg-white"
                animate={{ opacity: [1, 0.25, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Ao vivo agora
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm font-bold text-muted">
              <span aria-hidden className="size-2.5 rounded-full bg-muted/60" /> Fora do ar
            </span>
          )}
        </div>

        <p className="mt-3 flex items-center gap-2 text-lg font-bold">
          <CalendarDays aria-hidden className="size-5 text-yellow" /> {SHOW_SCHEDULE.label}
        </p>
        <p className="text-sm text-muted">Horário de Brasília · no YouTube do Canal do Benja</p>

        <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Dias da semana">
          {WEEKDAYS_SHORT.map((day, i) => {
            const showDay = (SHOW_SCHEDULE.days as readonly number[]).includes(i);
            const today = status?.weekday === i;
            return (
              <li
                key={day}
                aria-current={today ? "date" : undefined}
                className={`flex flex-col items-center rounded-xl border py-2 text-center ${
                  today && status?.live
                    ? "border-red bg-red text-white"
                    : today
                      ? "border-yellow bg-yellow/15 text-white"
                      : showDay
                        ? "border-line bg-bg text-white"
                        : "border-transparent bg-bg/40 text-muted/60"
                }`}
              >
                <span className="text-[12px] font-extrabold uppercase">{day}</span>
                <span className="mt-0.5 text-[10px] font-semibold leading-tight">{showDay ? "12h–14h" : "folga"}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[15px] font-semibold" aria-live="polite">
            <Clock aria-hidden className="size-5 shrink-0 text-yellow" />
            {!status ? (
              "Toda segunda a sexta, ao meio-dia."
            ) : status.live ? (
              <span>
                Rolando agora! Termina em <span className="tabular text-yellow">{formatCountdown(status.secondsToEnd)}</span>.
              </span>
            ) : (
              <span>
                Próximo programa: <strong>{nextShowLabel(status)}</strong> · faltam{" "}
                <span className="tabular text-yellow">{formatCountdown(status.secondsToStart)}</span>
              </span>
            )}
          </p>
          <a
            href={site.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 font-extrabold uppercase tracking-wide ${
              status?.live ? "bg-red text-white" : "bg-yellow text-ink"
            }`}
          >
            <Tv aria-hidden className="size-5" /> {status?.live ? "Assistir ao vivo" : "Ir para o canal"}
            <span className="sr-only"> no YouTube (abre em nova aba)</span>
          </a>
        </div>
      </div>
    </section>
  );
}

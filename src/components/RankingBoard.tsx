"use client";

import Image from "next/image";
import { AlertTriangle, CalendarClock, ChartNoAxesColumn, Crosshair, Megaphone, RefreshCw, Trophy, Users } from "lucide-react";
import illustrations from "@/generated/ranking-illustrations.json";
import { LayoutGroup } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RANKINGS } from "@/config/rankings";
import { computeMoves, formatNumber, mergeLiveNumbers, sameStanding } from "@/lib/ranking";
import { BALA_SOURCE } from "@/config/bala-do-veio";
import { daysUntil } from "@/lib/period";
import type { RankedEntry, RankingResults, RankingSlug, RankingView } from "@/types";
import { ChampionsStrip } from "./ChampionsStrip";
import { PeriodSwitcher } from "./PeriodSwitcher";
import { shotsLabel } from "./ShotsTable";
import type { Move } from "./RankingPosition";
import { RankingCard } from "./RankingCard";
import type { VoteButtonState } from "./VoteButton";

const CYCLE_MS = 8_000;
const IDLE_MS = 5_000;

export function RankingBoard({
  slug,
  view,
  onViewChange,
  results,
  error,
  pendingVote,
  onVote,
  onShareParticipant,
  onRetry,
}: {
  slug: RankingSlug;
  view: RankingView;
  onViewChange: (view: RankingView) => void;
  results: RankingResults | null;
  error: boolean;
  pendingVote: string | null;
  onVote: (participantId: string) => Promise<boolean>;
  onShareParticipant: (entry: RankedEntry) => void;
  onRetry: () => void;
}) {
  const copy = RANKINGS[slug];
  const live = results?.entries ?? null;

  // Classificação exibida: só muda de ordem após o voto ou em ciclos, com a pessoa ociosa.
  const [shown, setShown] = useState<RankedEntry[] | null>(live);
  const [moves, setMoves] = useState<Record<string, Move>>({});
  const lastInteraction = useRef(0);
  const applyOnNextData = useRef(false);
  const liveRef = useRef(live);
  const shownRef = useRef(shown);
  useEffect(() => {
    liveRef.current = live;
    shownRef.current = shown;
  });

  const applyStanding = useCallback((showMoves = true) => {
    const next = liveRef.current;
    const current = shownRef.current;
    if (!next) return;
    if (current && sameStanding(current, next)) return;
    setMoves(current && showMoves ? computeMoves(current, next) : {});
    setShown(next);
  }, []);

  // Dados novos: aplica a nova ordem na hora se veio do próprio voto ou se a lista mudou de composição.
  const displayed = shown && live ? mergeLiveNumbers(shown, live) : null;
  const needsImmediate = Boolean(live && (!shown || !displayed));
  useEffect(() => {
    // Sem interação ainda (ex.: primeira resposta da API após o HTML em cache), aplica direto.
    if (applyOnNextData.current) {
      applyOnNextData.current = false;
      applyStanding(true);
    } else if (needsImmediate || lastInteraction.current === 0) {
      // Ajuste silencioso: o visitante não viu a ordem antiga, então não há "subiu/caiu" a mostrar.
      applyStanding(false);
    }
  }, [live, needsImmediate, applyStanding]);

  // Ciclo de reorganização controlada.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() - lastInteraction.current > IDLE_MS) applyStanding();
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [applyStanding]);

  // Os indicadores de subida/descida somem depois de alguns segundos.
  useEffect(() => {
    if (Object.keys(moves).length === 0) return;
    const id = window.setTimeout(() => setMoves({}), 3_500);
    return () => window.clearTimeout(id);
  }, [moves]);

  const markInteraction = useCallback(() => {
    lastInteraction.current = Date.now();
  }, []);

  const handleVote = async (participantId: string) => {
    markInteraction();
    applyOnNextData.current = true;
    const ok = await onVote(participantId);
    if (!ok) applyOnNextData.current = false;
  };

  const entries = displayed ?? live ?? [];
  const pendingReorder = Boolean(live && shown && !sameStanding(shown, live));
  const accent = copy.kind === "positive" ? "text-green" : "text-red";
  const isStatic = copy.mode === "static";
  const illustration = (illustrations as Partial<Record<RankingSlug, { src: string; width: number; height: number }>>)[slug];
  const wideIllustration = illustration ? illustration.width > illustration.height * 1.2 : false;
  const kicker = isStatic
    ? "Ranking do programa · sem votação do público"
    : copy.kind === "positive"
      ? "Ranking positivo · topo é moral"
      : "Ranking negativo · topo é vergonha";

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
      <header className="mb-4 lg:sticky lg:top-24 lg:self-start">
        <div>
          <div>
            <p className={`text-xs font-extrabold uppercase tracking-[0.18em] ${accent}`}>
              {kicker}
            </p>
            <h2 id={`title-${slug}`} className="mt-1 font-display text-[34px] uppercase leading-none sm:text-5xl lg:text-6xl">
              {copy.title}
            </h2>
            <p className="mt-1.5 text-lg font-bold leading-snug text-yellow">{copy.subtitle}</p>
          </div>
        </div>
        <p className="mt-1.5 max-w-2xl text-[15px] leading-snug text-muted">{copy.description}</p>
        {results && isStatic ? (
          <>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <Megaphone aria-hidden className="size-4" /> Quem define é o programa
            </span>
            {results.standingsUpdatedAt ? (
              <>
                <span aria-hidden>·</span>
                <span>
                  Atualizado em{" "}
                  {new Date(results.standingsUpdatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" })}
                </span>
              </>
            ) : null}
            {results.isDemo ? (
              <span className="rounded bg-yellow px-1.5 py-0.5 text-[11px] font-extrabold uppercase text-ink">Ordem simulada</span>
            ) : null}
          </p>
          </>
        ) : null}
        {!isStatic ? (
          <>
            <p className="mt-4 rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-[13px] leading-snug text-muted">
              <strong className="text-white">Vote todo dia!</strong> Cada pessoa tem <strong className="text-white">1 voto por dia</strong>{" "}
              neste ranking, e ele soma na semana, no mês e na temporada. Toque em{" "}
              <strong className="text-yellow">Semana</strong>, <strong className="text-yellow">Mês</strong> ou{" "}
              <strong className="text-yellow">Temporada</strong> para ver quem está liderando em cada período.
            </p>
            <PeriodSwitcher value={view} onChange={onViewChange} />
          </>
        ) : null}
        {!isStatic && results ? (
          <div className="mt-3 space-y-1.5 text-[13px] font-semibold text-muted">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1 text-white">
                {view === "season" ? <Trophy aria-hidden className="size-4 text-yellow" /> : <CalendarClock aria-hidden className="size-4" />}
                {results.period.label}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden className="size-4" />
                <span className="tabular text-white">{formatNumber(results.totalVotes)}</span> votos
              </span>
              {results.isDemo ? (
                <span className="rounded bg-yellow px-1.5 py-0.5 text-[11px] font-extrabold uppercase text-ink">Dados simulados</span>
              ) : null}
            </p>
            {results.period.endsOn ? <PeriodEnd view={view} endsOn={results.period.endsOn} /> : null}
          </div>
        ) : null}
        {results && !results.active && !isStatic ? (
          <p className="mt-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold" role="note">
            A votação deste ranking está pausada. Os resultados continuam visíveis.
          </p>
        ) : null}
        {illustration ? (
          // Ilustração grande do ranking (troféu). No desktop ocupa a coluna fixa ao lado da lista.
          // Respeita o formato do arquivo: quadradas em selo arredondado; horizontais inteiras, sem corte.
          <Image
            src={illustration.src}
            alt={copy.illustrationAlt ?? ""}
            width={illustration.width}
            height={illustration.height}
            sizes={wideIllustration ? "(min-width: 1024px) 420px, (min-width: 640px) 480px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 300px, 240px"}
            loading="eager"
            className={
              wideIllustration
                ? "mx-auto mt-5 h-auto w-full max-w-[480px] rounded-3xl lg:mx-0 lg:max-w-none"
                : "mx-auto mt-5 h-auto w-full max-w-[240px] rounded-3xl sm:max-w-[300px] lg:mx-0 lg:max-w-[380px]"
            }
          />
        ) : null}
      </header>

      <div>
      {error && !results ? (
        <div className="rounded-2xl border border-red/50 bg-surface p-5 text-center" role="alert">
          <AlertTriangle aria-hidden className="mx-auto size-8 text-red" />
          <p className="mt-2 font-bold">Deu ruim ao carregar o ranking.</p>
          <p className="text-sm text-muted">O VAR está analisando. Tente de novo.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-yellow px-5 font-extrabold uppercase text-ink"
          >
            <RefreshCw aria-hidden className="size-4" /> Tentar de novo
          </button>
        </div>
      ) : !results ? (
        <ul className="space-y-3" aria-busy="true" aria-label="Carregando ranking">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[168px] animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </ul>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <p className="font-bold">{isStatic ? "O Véio ainda está escolhendo o alvo." : "Ainda não tem ninguém escalado neste ranking."}</p>
          <p className="text-sm text-muted">
            {isStatic ? "A ordem aparece aqui assim que o programa definir." : "Os participantes aparecem aqui assim que forem cadastrados."}
          </p>
        </div>
      ) : (
        <>
          {pendingReorder ? (
            <button
              type="button"
              onClick={() => applyStanding(true)}
              className="mb-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-yellow/60 bg-yellow/10 px-4 text-sm font-bold text-yellow"
            >
              <RefreshCw aria-hidden className="size-4" /> O ranking mudou — atualizar posições
            </button>
          ) : null}
          {!isStatic && results.champions?.length ? <ChampionsStrip slug={slug} champions={results.champions} view={view} /> : null}
          {isStatic ? (
            // Fonte dos dados do Bala do Véio, em destaque acima do ranking.
            <p className="mb-3 flex items-center gap-2 font-display text-2xl uppercase leading-none tracking-wide text-yellow sm:text-[28px]">
              <ChartNoAxesColumn aria-hidden className="size-7 shrink-0" /> {BALA_SOURCE}
            </p>
          ) : null}
          {isStatic && results.totalShots !== undefined ? (
            // Total de tiros somando todos os participantes, acima dos boxes.
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-red/60 bg-gradient-to-r from-red/20 to-surface p-3 sm:p-4" role="status" aria-live="polite">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-red/25 text-red">
                <Crosshair aria-hidden className="size-7" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">Total de tiros do Véio</p>
                <p className="font-display text-[34px] uppercase leading-none tabular">{shotsLabel(results.totalShots)}</p>
                <p className="text-[12px] font-semibold text-muted">somando todos os participantes</p>
              </div>
            </div>
          ) : null}
          <LayoutGroup id={slug}>
            <ol
              className="space-y-3"
              aria-labelledby={`title-${slug}`}
              onPointerDown={markInteraction}
              onFocusCapture={markInteraction}
              onTouchStart={markInteraction}
            >
              {entries.map((entry, index) => {
                const id = entry.participant.id;
                let voteState: VoteButtonState = "idle";
                if (!results.active) voteState = "closed";
                else if (pendingVote === id) voteState = "loading";
                else if (results.myVote === id) voteState = "voted";
                else if (results.myVote || pendingVote) voteState = "locked";
                return (
                  <RankingCard
                    key={id}
                    slug={slug}
                    entry={entry}
                    totalParticipants={entries.length}
                    voteState={voteState}
                    move={moves[id]}
                    eager={index < 2}
                    index={index}
                    shots={results.shots ? results.shots[id] ?? [] : undefined}
                    onVote={() => handleVote(id)}
                    onShare={() => onShareParticipant(entry)}
                  />
                );
              })}
            </ol>
          </LayoutGroup>
          <p className="mt-3 text-xs text-muted">
            {isStatic
              ? "Brincadeira interna do programa: a ordem é definida pelo Papo Reto, não por votação."
              : "Você vota uma vez por dia em cada ranking, e o voto soma na semana, no mês e na temporada. Use Semana, Mês e Temporada para ver quem lidera em cada período."}
          </p>
        </>
      )}
      </div>
    </div>
  );
}

const noopSubscribe = () => () => {};
const fmtDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Quanto falta para o fim do período. Na temporada, o fim do ano define o campeão. */
function PeriodEnd({ view, endsOn }: { view: RankingView; endsOn: string }) {
  // Calculado só no navegador (o HTML em cache não sabe a data de hoje).
  const days = useSyncExternalStore(
    noopSubscribe,
    () => daysUntil(endsOn),
    () => null,
  );
  const left = days === null ? "" : days === 0 ? " · último dia!" : ` · faltam ${days} ${days === 1 ? "dia" : "dias"}`;
  return (
    <p className={view === "season" ? "text-yellow" : undefined}>
      {view === "season"
        ? `Fim da temporada em ${fmtDay(endsOn)}/${endsOn.slice(0, 4)}: quem estiver no topo leva o título do ano${left}.`
        : `Fecha em ${fmtDay(endsOn)}${left}.`}
    </p>
  );
}

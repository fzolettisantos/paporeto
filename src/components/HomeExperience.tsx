"use client";

import { MotionConfig, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CHARGES_COPY, RANKINGS, tabCopy } from "@/config/rankings";
import { isRankingSlug } from "@/lib/validation";
import { PersonagensGallery } from "./PersonagensGallery";
import { site, VOTING_OPEN, VOTING_SOON_MESSAGE, withBase } from "@/config/site";
import { shareCardImage } from "@/lib/client/share";
import { hasResult, participantHeadline, rankingShareText } from "@/lib/share";
import { VIEW_PARAM, parseViewParam } from "@/lib/period";
import { absoluteUrl } from "@/config/site";
import { useLiveRanking } from "@/hooks/useLiveRanking";
import type { Charge, RankedEntry, RankingResults, RankingSlug, RankingView, TabSlug, VoteStatus } from "@/types";
import { ChargeGallery } from "./ChargeGallery";
import { RankingBoard } from "./RankingBoard";
import { PANEL_ID, RankingTabs, tabId } from "./RankingTabs";
import { RankingBackdrop } from "./RankingBackdrop";
import { ShareRanking } from "./ShareRanking";
import { Toast } from "./Toast";

/** Resultados por ranking e recorte: "falou-merda:week", "sabio:season"… (estáticos: "bala-do-veio:static"). */
const noopSubscribe = () => () => {};

type ResultsMap = Partial<Record<string, RankingResults>>;
const resultKey = (slug: RankingSlug, view: RankingView) =>
  RANKINGS[slug].mode === "static" ? `${slug}:static` : `${slug}:${view}`;

/** Endereço da aba, com o recorte quando não for a semana (?periodo=mes | temporada). */
const tabPath = (tab: TabSlug, view: RankingView) =>
  isRankingSlug(tab) && RANKINGS[tab].mode === "vote" && view !== "week" ? `/${tab}?periodo=${VIEW_PARAM[view]}` : `/${tab}`;

export function HomeExperience({
  initialTab,
  initialResults,
  initialError,
  charges,
  chargesError,
}: {
  initialTab: TabSlug;
  initialResults: RankingResults[];
  initialError: boolean;
  charges: Charge[];
  chargesError: boolean;
}) {
  const [tab, setTab] = useState<TabSlug>(initialTab);
  // Recorte: o escolhido pela pessoa ou, até ela escolher, o do link (?periodo=mes | temporada).
  const urlSearch = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "");
  const [chosenView, setView] = useState<RankingView | null>(null);
  const view = chosenView ?? parseViewParam(new URLSearchParams(urlSearch).get("periodo"));
  const [results, setResults] = useState<ResultsMap>(() =>
    Object.fromEntries(initialResults.map((r) => [resultKey(r.slug, r.view), r])),
  );
  /** Em quem a pessoa votou na semana atual, por ranking (vale para os três recortes). */
  const [myVotes, setMyVotes] = useState<Partial<Record<RankingSlug, { week: string; id: string | null }>>>({});
  const [errors, setErrors] = useState<Partial<Record<RankingSlug, boolean>>>(() =>
    initialError ? { "falou-merda": true, sabio: true, "bala-do-veio": true } : {},
  );
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string | null; id: number }>({ message: null, id: 0 });
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast((t) => ({ message, id: t.id + 1 }));
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, message: null })), 4_000);
  }, []);

  const rankingSlug = isRankingSlug(tab) ? tab : null;

  const storeResults = useCallback((next: RankingResults) => {
    setResults((current) => ({ ...current, [resultKey(next.slug, next.view)]: next }));
    // Respostas sem cookie (SSR/ISR) não sabem em quem a pessoa votou: preserva o que já sabemos.
    if (next.myVote !== undefined && next.votingPeriod) {
      const week = next.votingPeriod.key;
      setMyVotes((current) => ({ ...current, [next.slug]: { week, id: next.myVote ?? null } }));
    }
    setErrors((current) => (current[next.slug] ? { ...current, [next.slug]: false } : current));
  }, []);

  const markError = useCallback((slug: RankingSlug) => setErrors((current) => ({ ...current, [slug]: true })), []);
  const refresh = useLiveRanking(rankingSlug, view, storeResults, markError);

  const changeTab = (next: TabSlug) => {
    setTab(next);
    window.history.replaceState(window.history.state, "", withBase(tabPath(next, view)));
  };

  const changeView = (next: RankingView) => {
    setView(next);
    window.history.replaceState(window.history.state, "", withBase(tabPath(tab, next)));
  };

  useEffect(() => {
    const copy = tabCopy(tab);
    document.title = `${copy.title} | ${site.name}`;
  }, [tab]);

  const vote = async (slug: RankingSlug, participantId: string): Promise<boolean> => {
    // Votação ainda não liberada: só avisa, sem chamar o servidor.
    if (!VOTING_OPEN) {
      notify(VOTING_SOON_MESSAGE);
      return false;
    }
    setPendingVote(participantId);
    try {
      const response = await fetch(withBase("/api/vote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ranking: slug, participantId, view }),
      });
      const data = (await response.json().catch(() => ({}))) as { status?: VoteStatus; message?: string; results?: RankingResults | null };
      if (data.results) storeResults(data.results);
      if (data.status === "ok") {
        const name = data.results?.entries.find((e) => e.participant.id === participantId)?.participant.name;
        notify(`Voto registrado${name ? ` em ${name}` : ""}! Agora manda pro grupo. 📣`);
        return true;
      }
      // Falha do servidor (ex.: configuração incompleta): mensagem amigável no lugar do erro técnico.
      notify(data.status === "error" || !data.status ? VOTING_SOON_MESSAGE : (data.message ?? VOTING_SOON_MESSAGE));
      return false;
    } catch {
      notify("Sem conexão. Confira a internet e tente de novo.");
      return false;
    } finally {
      setPendingVote(null);
    }
  };

  const shareParticipant = async (slug: RankingSlug, entry: RankedEntry) => {
    const current = results[resultKey(slug, view)];
    if (!current) return;
    notify("Gerando o card…");
    const outcome = await shareCardImage({
      ranking: slug,
      participantId: entry.participant.id,
      view: current.mode === "vote" ? view : "week",
      text: participantHeadline(slug, entry, current),
      url: absoluteUrl(tabPath(slug, view)),
    });
    if (outcome === "downloaded") notify("Card baixado! Agora é só postar.");
    else if (outcome === "failed") notify("Não foi possível gerar o card agora.");
    else if (outcome === "shared") notify("Card compartilhado!");
    else setToast((t) => ({ ...t, message: null }));
  };

  const stored = rankingSlug ? results[resultKey(rankingSlug, view)] ?? null : null;
  const mine = rankingSlug ? myVotes[rankingSlug] : undefined;
  const activeResults: RankingResults | null =
    stored && mine && stored.votingPeriod?.key === mine.week ? { ...stored, myVote: mine.id } : stored;
  const shareText = rankingSlug
    ? rankingShareText(rankingSlug, activeResults)
    : tab === "bancada"
      ? "Conheça as figuras do Papo Reto e as fichas criminais da resenha!"
      : "As charges do Oberdan no Papo Reto Ranking. Se virou charge, virou história!";
  const shareTitle = rankingSlug ? RANKINGS[rankingSlug].title : tab === "bancada" ? "A Bancada do Papo Reto" : CHARGES_COPY.title;
  const leader = activeResults?.entries[0];

  return (
    <MotionConfig reducedMotion="user">
      <RankingBackdrop tab={tab} />
      <div id="rankings" className="scroll-mt-0">
        <RankingTabs active={tab} onChange={changeTab} />
        <div className="mx-auto max-w-5xl px-4 pt-5 lg:pt-8">
          <motion.section
            key={tab}
            id={PANEL_ID}
            role="tabpanel"
            aria-labelledby={tabId(tab)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {rankingSlug ? (
              <RankingBoard
                key={resultKey(rankingSlug, view)}
                slug={rankingSlug}
                view={view}
                onViewChange={changeView}
                results={activeResults}
                error={Boolean(errors[rankingSlug])}
                pendingVote={pendingVote}
                onVote={(id) => vote(rankingSlug, id)}
                onShareParticipant={(entry) => shareParticipant(rankingSlug, entry)}
                onRetry={() => void refresh()}
              />
            ) : tab === "bancada" ? (
              <PersonagensGallery />
            ) : (
              <ChargeGallery charges={charges} error={chargesError} notify={notify} />
            )}
          </motion.section>

          <ShareRanking
            path={tabPath(tab, view)}
            title={shareTitle}
            text={shareText}
            canShareCard={Boolean(rankingSlug && leader && activeResults && hasResult(activeResults))}
            variant={rankingSlug && RANKINGS[rankingSlug].mode === "static" ? "static" : "vote"}
            onShareCard={() => rankingSlug && leader && shareParticipant(rankingSlug, leader)}
            notify={notify}
          />
        </div>
      </div>
      <Toast message={toast.message} id={toast.id} />
    </MotionConfig>
  );
}

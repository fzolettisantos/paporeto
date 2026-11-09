"use client";

import { useCallback, useEffect, useRef } from "react";
import { withBase } from "@/config/site";
import { VIEW_PARAM } from "@/lib/period";
import type { RankingResults, RankingSlug, RankingView } from "@/types";

const POLL_MS = 20_000;
const POLL_WITH_REALTIME_MS = 60_000;

/**
 * Mantém os números do ranking ativo atualizados: busca ao abrir a aba, quando a página volta a
 * ficar visível, em intervalos e — se o Supabase Realtime estiver configurado — a cada mudança no placar.
 */
export function useLiveRanking(
  slug: RankingSlug | null,
  view: RankingView,
  onResults: (results: RankingResults) => void,
  onError: (slug: RankingSlug) => void,
) {
  const handlers = useRef({ onResults, onError });
  useEffect(() => {
    handlers.current = { onResults, onError };
  });

  const refresh = useCallback(async () => {
    if (!slug) return;
    try {
      const response = await fetch(withBase(`/api/rankings/${slug}?periodo=${VIEW_PARAM[view]}`), { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      handlers.current.onResults((await response.json()) as RankingResults);
    } catch {
      handlers.current.onError(slug);
    }
  }, [slug, view]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    let channelCleanup: (() => void) | null = null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const realtime = Boolean(url && anonKey);

    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, realtime ? POLL_WITH_REALTIME_MS : POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);

    if (realtime) {
      // Carregado sob demanda para não pesar no JavaScript inicial.
      void import("@supabase/supabase-js").then(({ createClient }) => {
        if (cancelled) return;
        const client = createClient(url!, anonKey!, { auth: { persistSession: false } });
        let timer: number | undefined;
        const channel = client
          .channel(`vote_totals:${slug}:${view}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "vote_totals" }, () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => void refresh(), 1_500);
          })
          .subscribe();
        channelCleanup = () => {
          window.clearTimeout(timer);
          void client.removeChannel(channel);
        };
      });
    }

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      channelCleanup?.();
    };
  }, [slug, view, refresh]);

  return refresh;
}

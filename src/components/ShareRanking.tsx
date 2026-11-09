"use client";

import { Copy, ImageDown, MessageCircle, Share2 } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { copyText, shareLink, type ShareOutcome } from "@/lib/client/share";
import { whatsappUrl } from "@/lib/share";

const button =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-extrabold uppercase tracking-wide transition-transform active:scale-[0.98]";

export function ShareRanking({
  path,
  title,
  text,
  canShareCard,
  onShareCard,
  notify,
  variant = "vote",
}: {
  path: string;
  title: string;
  text: string;
  canShareCard: boolean;
  onShareCard: () => void;
  notify: (message: string) => void;
  /** Ranking sem votação: o texto não fala em "voz do povo". */
  variant?: "vote" | "static";
}) {
  const url = absoluteUrl(path);

  const report = (outcome: ShareOutcome) => {
    if (outcome === "copied") notify("Link copiado! Agora é só colar no grupo.");
    if (outcome === "failed") notify("Não deu para compartilhar. Copie o endereço da página.");
  };

  return (
    <section aria-labelledby="share-title" className="mt-8 rounded-2xl border border-line bg-surface p-4 sm:p-6">
      <h2 id="share-title" className="font-display text-[26px] uppercase leading-tight sm:text-3xl">
        {variant === "static" ? (
          <>
            A mira é do Véio. <span className="text-yellow">A zoeira é de todo mundo.</span>
          </>
        ) : (
          <>
            A voz do povo. <span className="text-yellow">A vergonha dos participantes.</span>
          </>
        )}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-snug text-muted">
        {variant === "static"
          ? "Esse ranking quem define é o programa. Agora manda pros amigos e vê quem vai reclamar no próximo episódio."
          : "Os votos estão aí. Agora queremos ver quem vai ter coragem de assumir o resultado no próximo programa."}
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href={whatsappUrl(text, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${button} bg-[#25D366] text-ink sm:order-2`}
        >
          <MessageCircle aria-hidden className="size-5" /> Mandar no WhatsApp
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
        <button type="button" onClick={async () => report(await shareLink({ title, text, url }))} className={`${button} bg-yellow text-ink sm:order-1`}>
          <Share2 aria-hidden className="size-5" /> Compartilhar ranking
        </button>
        <button
          type="button"
          onClick={async () => notify((await copyText(url)) ? "Link copiado!" : "Não foi possível copiar o link.")}
          className={`${button} border border-line bg-surface-2 text-white sm:order-3`}
        >
          <Copy aria-hidden className="size-5" /> Copiar link
        </button>
        {canShareCard ? (
          <button type="button" onClick={onShareCard} className={`${button} border border-line bg-surface-2 text-white sm:order-4`}>
            <ImageDown aria-hidden className="size-5" /> Card do líder
          </button>
        ) : null}
      </div>
    </section>
  );
}

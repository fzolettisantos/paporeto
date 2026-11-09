"use client";

import Image from "next/image";
import { AlertTriangle, PenTool, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CHARGES_COPY } from "@/config/rankings";
import { absoluteUrl } from "@/config/site";
import { shareLink } from "@/lib/client/share";
import type { Charge } from "@/types";
import { ChargeCard, formatChargeDate } from "./ChargeCard";

export function ChargeGallery({ charges, error, notify }: { charges: Charge[]; error: boolean; notify: (m: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = charges.find((c) => c.id === openId) ?? null;

  // <dialog> nativo: foco preso no modal e fechamento com Esc.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const show = (id: string) => {
    opener.current = document.activeElement as HTMLElement | null;
    setOpenId(id);
  };
  const close = () => {
    setOpenId(null);
    opener.current?.focus();
  };
  const share = async (charge: Charge) => {
    const outcome = await shareLink({
      title: charge.title,
      text: `${charge.title} — charge de ${charge.credits} no Papo Reto Ranking`,
      url: absoluteUrl(`/charges#charge-${charge.id}`),
    });
    if (outcome === "copied") notify("Link da charge copiado!");
  };

  return (
    <div>
      <header className="mb-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">Galeria</p>
        <h2 id="title-charges" className="mt-1 font-display text-[34px] uppercase leading-none sm:text-5xl">
          {CHARGES_COPY.title}
        </h2>
        <p className="mt-1.5 text-lg font-bold leading-snug text-yellow">{CHARGES_COPY.subtitle}</p>
        <p className="mt-1.5 max-w-2xl text-[15px] leading-snug text-muted">{CHARGES_COPY.description}</p>
        {charges.length > 0 ? (
          <a href="#charges-grid" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-yellow px-5 font-extrabold uppercase text-ink">
            {CHARGES_COPY.cta}
          </a>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-2xl border border-red/50 bg-surface p-5 text-center" role="alert">
          <AlertTriangle aria-hidden className="mx-auto size-8 text-red" />
          <p className="mt-2 font-bold">Não foi possível carregar as charges agora.</p>
          <p className="text-sm text-muted">Recarregue a página em instantes.</p>
        </div>
      ) : charges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
          <PenTool aria-hidden className="mx-auto size-9 text-yellow" />
          <p className="mt-2 font-display text-2xl uppercase">O Oberdan está afiando o lápis</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            As charges aparecem aqui assim que forem publicadas. Volte depois do próximo programa.
          </p>
        </div>
      ) : (
        <ul id="charges-grid" className="grid scroll-mt-20 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {charges.map((charge, index) => (
            <ChargeCard key={charge.id} charge={charge} eager={index < 2} onOpen={() => show(charge.id)} onShare={() => share(charge)} />
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => event.target === dialogRef.current && close()}
        aria-labelledby="charge-dialog-title"
        className="m-auto max-h-[100dvh] w-full max-w-4xl bg-transparent p-3 text-white backdrop:bg-black/90"
      >
        {open ? (
          <figure className="overflow-hidden rounded-2xl bg-surface">
            <div className="flex items-start justify-between gap-3 p-3">
              <figcaption>
                <h3 id="charge-dialog-title" className="font-display text-xl uppercase leading-tight">{open.title}</h3>
                <p className="text-sm text-muted">
                  {formatChargeDate(open.publishedOn)} · {open.credits}
                </p>
              </figcaption>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-2"
                aria-label="Fechar"
                autoFocus
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="relative h-[70dvh] w-full bg-bg">
              <Image src={open.imageUrl} alt={open.description || open.title} fill sizes="100vw" className="object-contain" />
            </div>
            {open.description ? <p className="p-3 text-[15px]">{open.description}</p> : null}
          </figure>
        ) : null}
      </dialog>
    </div>
  );
}

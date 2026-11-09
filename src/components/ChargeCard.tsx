"use client";

import Image from "next/image";
import { Maximize2, Share2 } from "lucide-react";
import type { Charge } from "@/types";

export function formatChargeDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function ChargeCard({ charge, eager, onOpen, onShare }: { charge: Charge; eager?: boolean; onOpen: () => void; onShare: () => void }) {
  return (
    <li id={`charge-${charge.id}`} className="list-none overflow-hidden rounded-2xl border border-line bg-surface">
      <button type="button" onClick={onOpen} className="group relative block aspect-[4/3] w-full bg-surface-2" aria-label={`Ampliar charge: ${charge.title}`}>
        <Image
          src={charge.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-2 right-2 inline-flex size-10 items-center justify-center rounded-full bg-bg/80 text-white">
          <Maximize2 aria-hidden className="size-4" />
        </span>
      </button>
      <div className="p-3">
        <h3 className="font-display text-xl uppercase leading-tight">{charge.title}</h3>
        <p className="mt-0.5 text-sm text-muted">
          <time dateTime={charge.publishedOn}>{formatChargeDate(charge.publishedOn)}</time> · {charge.credits}
        </p>
        {charge.description ? <p className="mt-1.5 line-clamp-2 text-[15px] leading-snug">{charge.description}</p> : null}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-yellow px-3 text-sm font-extrabold uppercase text-ink"
          >
            <Maximize2 aria-hidden className="size-4" /> Ampliar
          </button>
          <button
            type="button"
            onClick={onShare}
            aria-label={`Compartilhar charge: ${charge.title}`}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2"
          >
            <Share2 aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
}

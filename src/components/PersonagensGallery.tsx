"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Flame, RefreshCw, ShieldAlert, Stethoscope, Target, Zap } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import faces from "@/generated/character-faces.json";
import { PERSONAGENS, PERSONAGENS_COPY, RISCO_LABEL, type Personagem } from "@/config/personagens";
import { InstagramIcon } from "./InstagramIcon";
import { PlaceholderFace } from "./PlaceholderFace";

const FACES = faces as Record<string, string[]>;

/** Avatar que troca de expressão a cada toque (todas as caricaturas diferentes do personagem). */
function FaceSwitcher({ personagem, big }: { personagem: Personagem; big: boolean }) {
  const list = FACES[personagem.slug] ?? [];
  const [index, setIndex] = useState(0);
  const src = list[index % Math.max(list.length, 1)];
  const size = big ? "size-36 sm:size-40" : "size-28 sm:size-32";

  if (!src) {
    return (
      <div className={`${size} overflow-hidden rounded-full bg-surface-2`} role="img" aria-label={`Ilustração provisória de ${personagem.name}`}>
        <PlaceholderFace mood="neutral" className="size-full" />
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => setIndex((i) => (i + 1) % list.length)}
      whileHover={{ scale: 1.04, rotate: -2 }}
      whileTap={{ scale: 0.92, rotate: 4 }}
      className={`group relative ${size} shrink-0 rounded-full bg-[#EDE3CC] shadow-[0_0_0_4px_var(--ring),0_12px_30px_-8px_rgb(0_0_0/0.7)]`}
      style={{ ["--ring" as string]: personagem.accent }}
      aria-label={`Trocar a cara de ${personagem.name} (expressão ${index + 1} de ${list.length})`}
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.3, rotate: 15 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
          >
            <Image src={src} alt="" fill sizes="160px" className="object-cover" />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="absolute -bottom-1 -right-1 inline-flex size-9 items-center justify-center rounded-full border-2 border-bg bg-yellow text-ink transition-transform group-hover:rotate-180">
        <RefreshCw aria-hidden className="size-4" />
      </span>
    </motion.button>
  );
}

/** Medidor de "risco de falar merda". 6 = incalculável: estoura e treme. */
function RiskMeter({ personagem, open }: { personagem: Personagem; open: boolean }) {
  const level = personagem.risco;
  const overflow = level > 5;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Risco de falar merda</p>
        <motion.p
          className={`font-display text-lg uppercase leading-none ${overflow ? "text-red" : level >= 4 ? "text-yellow" : "text-white"}`}
          animate={overflow && open ? { x: [0, -2, 2, -2, 2, 0] } : {}}
          transition={{ duration: 0.5, repeat: overflow ? Infinity : 0, repeatDelay: 1.2 }}
        >
          {RISCO_LABEL[level]}
          {overflow ? " ∞" : ""}
        </motion.p>
      </div>
      <div className="mt-1.5 grid grid-cols-5 gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.span
            key={n}
            className={`h-3 rounded-sm ${n <= level ? (overflow || n >= 4 ? "bg-red" : n === 3 ? "bg-yellow" : "bg-green") : "bg-surface-2"}`}
            initial={{ scaleY: 0.2, opacity: 0.3 }}
            animate={open ? { scaleY: 1, opacity: 1 } : { scaleY: 0.2, opacity: 0.3 }}
            transition={{ delay: open ? 0.15 + n * 0.08 : 0, type: "spring", stiffness: 500, damping: 18 }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[14px] leading-snug text-muted">{personagem.riscoTexto}</p>
    </div>
  );
}

const FIELDS = [
  { key: "especialidade", label: "Especialidade", Icon: Target },
  { key: "superpoder", label: "Superpoder", Icon: Zap },
  { key: "pontoFraco", label: "Ponto fraco", Icon: ShieldAlert },
] as const;

/** Personagem indicado no endereço (ex.: /bancada#benja), atualizado quando o # muda. */
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
function useHashSlug() {
  return useSyncExternalStore(subscribeHash, () => decodeURIComponent(window.location.hash.slice(1)), () => "");
}

function PersonagemCard({ personagem, index, linked }: { personagem: Personagem; index: number; linked: boolean }) {
  // Aberta pelo link (/bancada#slug) até a pessoa abrir/fechar manualmente.
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? linked;
  const setOpen = (next: (v: boolean) => boolean) => setOverride(next(open));
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!linked) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Espera a ficha abrir e a grade se reorganizar (no desktop ela passa a ocupar a linha toda) antes de rolar.
    const id = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 550);
    return () => window.clearTimeout(id);
  }, [linked]);
  const detailsId = useId();

  return (
    <motion.li
      ref={ref}
      id={personagem.slug}
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.07, type: "spring", stiffness: 260, damping: 26 }}
      className={`min-w-0 scroll-mt-20 list-none ${open ? "sm:col-span-2 lg:col-span-3" : ""}`}
    >
      <article
        className="relative h-full overflow-hidden rounded-2xl border border-line bg-surface"
        style={{ borderTopColor: personagem.accent, borderTopWidth: 4 }}
        aria-labelledby={`${detailsId}-name`}
      >
        <div className={`flex gap-4 p-4 sm:p-5 ${open ? "flex-col items-center text-center sm:flex-row sm:items-start sm:text-left" : "flex-col items-center text-center"}`}>
          <motion.div layout="position">
            <FaceSwitcher personagem={personagem} big={open} />
          </motion.div>
          <motion.div layout="position" className="min-w-0 flex-1">
            <h2 id={`${detailsId}-name`} className="font-display text-[28px] uppercase leading-none">
              {personagem.name}
            </h2>
            <p className="mt-1 font-display text-lg uppercase leading-tight text-yellow">{personagem.nickname}</p>
            <p className="mt-1.5 text-[13px] font-semibold leading-snug text-muted">
              {personagem.realName} • {personagem.role}
            </p>
            {personagem.instagram ? (
              <a
                href={`https://www.instagram.com/${personagem.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 text-[13px] font-bold text-white transition-colors hover:border-yellow hover:text-yellow"
              >
                <InstagramIcon className="size-4" />@{personagem.instagram}
                <span className="sr-only"> no Instagram (abre em nova aba)</span>
              </a>
            ) : null}
            <a
              href={`/bancada/${personagem.pageSlug}`}
              className="ml-2 mt-2 inline-flex min-h-9 items-center text-[13px] font-bold text-yellow underline-offset-4 hover:underline"
            >
              Página de {personagem.name}
            </a>
            <blockquote className="relative mt-3 rounded-xl bg-bg/60 px-3 py-2.5 text-[15px] font-semibold italic leading-snug">
              <span aria-hidden className="absolute -top-3 left-2 font-display text-4xl not-italic leading-none text-yellow">
                “
              </span>
              {personagem.quote}
            </blockquote>
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={detailsId}
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="border-t border-line px-4 pb-4 pt-4 sm:px-5">
                <p className="text-[15px] leading-relaxed text-white/90">{personagem.bio}</p>

                <div className="relative mt-5 rounded-xl border border-dashed border-line bg-bg/50 p-4">
                  <motion.span
                    aria-hidden
                    className="absolute -top-3 right-3 rounded border-2 border-red bg-bg px-2 py-0.5 font-display text-sm uppercase tracking-widest text-red"
                    initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
                    animate={{ scale: 1, opacity: 1, rotate: -8 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 500, damping: 14 }}
                  >
                    Fichado
                  </motion.span>
                  <h3 className="font-display text-xl uppercase leading-none">Ficha criminal da resenha</h3>

                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    {FIELDS.map(({ key, label, Icon }, i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="min-w-0 rounded-lg bg-surface p-3"
                      >
                        <dt className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow">
                          <Icon aria-hidden className="size-4" /> {label}
                        </dt>
                        <dd className="mt-1 text-[14px] leading-snug [overflow-wrap:anywhere]">{personagem[key]}</dd>
                      </motion.div>
                    ))}
                  </dl>

                  <div className="mt-4">
                    <RiskMeter personagem={personagem} open={open} />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="mt-4 rounded-lg border-l-4 border-red bg-red/10 p-3"
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff7a6e]">
                      <Stethoscope aria-hidden className="size-4" /> Diagnóstico
                    </p>
                    <p className="mt-1 text-[15px] font-semibold leading-snug">{personagem.diagnostico}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="px-4 pb-4 sm:px-5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailsId}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-extrabold uppercase tracking-wide transition-colors ${
              open ? "border border-line bg-surface-2 text-white" : "bg-yellow text-ink"
            }`}
          >
            {open ? "Fechar ficha" : (
              <>
                <Flame aria-hidden className="size-5" /> Abrir ficha criminal
              </>
            )}
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <ChevronDown aria-hidden className="size-5" />
            </motion.span>
          </button>
        </div>
      </article>
    </motion.li>
  );
}

export function PersonagensGallery() {
  const hashSlug = useHashSlug();
  return (
    <div>
      <header className="mb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">Elenco · fichas da resenha</p>
        <h1 id="title-bancada" className="mt-1 font-display text-[40px] uppercase leading-none sm:text-6xl">
          {PERSONAGENS_COPY.tabLabel}
        </h1>
        <p className="mt-2 text-lg font-bold leading-snug text-yellow">{PERSONAGENS_COPY.title}</p>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-white">{PERSONAGENS_COPY.subtitle}</p>
        <p className="mt-1.5 max-w-3xl text-[15px] leading-snug text-muted">{PERSONAGENS_COPY.description}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          <RefreshCw aria-hidden className="size-4 text-yellow" /> Toque na caricatura para mudar a cara.
        </p>
      </header>
      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAGENS.map((personagem, index) => (
          <PersonagemCard key={personagem.slug} personagem={personagem} index={index} linked={hashSlug === personagem.slug} />
        ))}
      </motion.ul>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brain, Megaphone, PenTool, Target, Users } from "lucide-react";
import faces from "@/generated/character-faces.json";
import illustrations from "@/generated/ranking-illustrations.json";
import { PERSONAGENS } from "@/config/personagens";
import { RANKINGS } from "@/config/rankings";
import { site, withBase } from "@/config/site";
import type { RankingSlug } from "@/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HomeFaq, FAQ } from "./HomeFaq";
import { JsonLd } from "./JsonLd";
import { ShowSchedule } from "./ShowSchedule";
import { HOME_SEO } from "@/config/seo";
import { absoluteUrl } from "@/config/site";
import { graph, personLd, publisherLd, showLd, websiteLd, WEBSITE_ID } from "@/lib/structured-data";

const ILLUSTRATIONS = illustrations as Partial<Record<RankingSlug, { src: string; width: number; height: number }>>;
const FACES = faces as Record<string, string[]>;
/** Cor da borda de cada arte: a caixa usa a mesma, para a imagem centralizada não "aparecer" como um retângulo. */
const ART_BG: Record<RankingSlug, string> = { "falou-merda": "#09090b", sabio: "#0a0c10", "bala-do-veio": "#0a0c10" };
const RANK_ICONS = { "falou-merda": Megaphone, sabio: Brain, "bala-do-veio": Target } as const;

/** Página inicial: horário do programa, atalhos para os rankings, personagens e charges. */
export function IndexPage() {
  const ld = graph(
    websiteLd(),
    publisherLd(),
    showLd(),
    ...PERSONAGENS.map(personLd),
    {
      "@type": "WebPage",
      "@id": absoluteUrl("/#pagina"),
      url: absoluteUrl("/"),
      name: HOME_SEO.title,
      description: HOME_SEO.description,
      inLanguage: "pt-BR",
      isPartOf: { "@id": WEBSITE_ID },
    },
    {
      "@type": "FAQPage",
      "@id": absoluteUrl("/#perguntas"),
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  );

  return (
    <>
      <JsonLd data={ld} />
      <Header />
      <main id="conteudo">
        <section className="bg-stands">
          <div className="mx-auto max-w-5xl px-4 pb-6 pt-7 sm:pb-10 sm:pt-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow">Papo Reto Ranking</p>
            <h1 className="mt-2 font-display text-[36px] uppercase leading-[1.02] sm:text-6xl">
              Aqui a resenha entra em campo. <span className="text-yellow">E o bom senso fica no banco.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] leading-snug text-muted sm:text-lg">
              Futebol raiz, corneta sem VAR, opiniões duvidosas e muita resenha. Agora é sua vez de decidir quem
              merece o topo — ou a vergonha.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={withBase("/falou-merda")}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-yellow px-5 font-extrabold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
              >
                Ver os rankings <ArrowRight aria-hidden className="size-5" />
              </Link>
              <Link
                href={withBase("/bancada")}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface px-5 font-extrabold uppercase tracking-wide text-white transition-colors hover:border-yellow"
              >
                <Users aria-hidden className="size-5" /> Conheça a bancada
              </Link>
            </div>
            <p className="mt-4 font-display text-lg uppercase tracking-wide text-yellow sm:text-2xl">{site.tagline}</p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl space-y-10 px-4 pt-6 sm:pt-8">
          <section aria-labelledby="rankings-title">
            <h2 id="rankings-title" className="font-display text-[28px] uppercase leading-none sm:text-4xl">
              Os rankings da resenha
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {(Object.keys(RANKINGS) as RankingSlug[]).map((slug, index) => {
                const copy = RANKINGS[slug];
                const art = ILLUSTRATIONS[slug];
                const Icon = RANK_ICONS[slug];
                return (
                  <li key={slug}>
                    <Link
                      href={withBase(`/${slug}`)}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,border-color] hover:-translate-y-1 hover:border-yellow"
                    >
                      {art ? (
                        // A arte inteira: troféus (quadrados) centralizados; a do Véio (3:2) encostada embaixo, junto do texto.
                        <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: ART_BG[slug] }}>
                          <Image
                            src={art.src}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 33vw, 100vw"
                            // A primeira arte é o maior elemento da primeira tela (LCP): carrega com prioridade.
                            preload={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            className={`object-contain transition-transform ${art.width > art.height ? "object-bottom" : "object-center"} duration-500 group-hover:scale-105`}
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col p-4">
                        <p className={`flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] ${copy.kind === "positive" ? "text-green" : "text-[#ff7a6e]"}`}>
                          <Icon aria-hidden className="size-4" />
                          {copy.mode === "static" ? "Ranking do programa" : "Vote todo dia"}
                        </p>
                        <h3 className="mt-1 font-display text-2xl uppercase leading-tight">{copy.title}</h3>
                        <p className="mt-1 text-[15px] leading-snug text-muted">{copy.subtitle}</p>
                        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-extrabold uppercase text-yellow">
                          {copy.mode === "static" ? "Ver quem tá na mira" : "Ver e votar"}
                          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <ShowSchedule />


          <section aria-labelledby="bancada-title" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="bancada-title" className="font-display text-[28px] uppercase leading-none sm:text-4xl">
                  A bancada
                </h2>
                <p className="mt-1 text-muted">Sete figuras, um hospício esportivo. Abra a ficha criminal de cada um.</p>
              </div>
              <Link
                href={withBase("/bancada")}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-extrabold uppercase text-yellow"
              >
                Ver fichas <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
            <ul className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-7">
              {PERSONAGENS.map((p) => {
                const face = FACES[p.slug]?.[0];
                return (
                  <li key={p.slug}>
                    <Link href={withBase(`/bancada#${p.slug}`)} className="group flex flex-col items-center gap-1.5 text-center" aria-label={`Abrir a ficha de ${p.name}`}>
                      <span
                        className="relative size-16 overflow-hidden rounded-full bg-[#EDE3CC] shadow-[0_0_0_3px_var(--ring)] transition-transform group-hover:-translate-y-1 group-hover:rotate-3 sm:size-20"
                        style={{ ["--ring" as string]: p.accent }}
                      >
                        {face ? <Image src={face} alt="" fill sizes="80px" className="object-cover" /> : null}
                      </span>
                      <span className="text-[12px] font-bold leading-tight">{p.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="sobre-title" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
            <h2 id="sobre-title" className="font-display text-[28px] uppercase leading-none sm:text-4xl">O que é o Papo Reto?</h2>
            <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-white/90">
              O <strong>Papo Reto</strong> é o programa de resenha de futebol do <strong>Canal do Benja</strong>, apresentado por{" "}
              <strong>Benjamin Back</strong> e transmitido ao vivo no YouTube de segunda a sexta, das 12h às 14h. Na bancada,{" "}
              {PERSONAGENS.filter((p) => p.slug !== "benja").map((p, i, all) => (
                <span key={p.slug}>
                  <Link href={withBase(`/bancada/${p.pageSlug}`)} className="font-bold text-yellow hover:underline">{p.name}</Link>
                  {i < all.length - 2 ? ", " : i === all.length - 2 ? " e " : ""}
                </span>
              ))}{" "}
              transformam qualquer discussão sobre futebol em um verdadeiro hospício esportivo.
            </p>
            <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">
              No Papo Reto Ranking, o público vota todo dia em quem mais falou besteira (Troféu Falou Merda) e em quem foi o
              mais sensato (O Sábio da Resenha), acompanha quem vai levar Bala do Véio e conhece a ficha de cada integrante.
            </p>
          </section>

          <HomeFaq />

          <section aria-labelledby="charges-title">
            <Link
              href={withBase("/charges")}
              className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-yellow sm:p-7"
            >
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-yellow/15 text-yellow">
                <PenTool aria-hidden className="size-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span id="charges-title" className="block font-display text-2xl uppercase leading-tight">As Charges do Oberdan</span>
                <span className="block text-muted">Se virou charge, virou história.</span>
              </span>
              <ArrowRight aria-hidden className="size-6 shrink-0 text-yellow transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        </div>
      </main>
      <Footer showCaricatureCredit />
    </>
  );
}

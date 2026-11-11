import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, ShieldAlert, Stethoscope, Target, Zap } from "lucide-react";
import faces from "@/generated/character-faces.json";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InstagramIcon } from "@/components/InstagramIcon";
import { JsonLd } from "@/components/JsonLd";
import { findPersonagemByPage, PERSONAGENS, RISCO_LABEL } from "@/config/personagens";
import { SEO_KEYWORDS_BASE } from "@/config/seo";
import { withBase } from "@/config/site";
import { breadcrumbLd, graph, personLd, showLd } from "@/lib/structured-data";

/** Página de cada integrante: /bancada/<personagem>. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PERSONAGENS.map((p) => ({ tab: "bancada", slug: p.pageSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tab: string; slug: string }> }): Promise<Metadata> {
  const { tab, slug } = await params;
  const p = tab === "bancada" ? findPersonagemByPage(slug) : null;
  if (!p) return {};
  const full = `${p.name} — ${p.nickname} | A Bancada do Papo Reto`;
  const title = full.length <= 60 ? full : `${p.name}: ${p.nickname} | Papo Reto`;
  const who = p.fullName !== p.name ? `${p.name} (${p.fullName})` : p.name;
  const longDescription = `Conheça ${who}, “${p.nickname}”, do Papo Reto do Canal do Benja: bio, Instagram e a ficha criminal da resenha.`;
  const description = longDescription.length <= 160 ? longDescription : `Conheça ${p.name}, do Papo Reto do Canal do Benja: bio, Instagram e a ficha criminal da resenha.`;
  const path = withBase(`/bancada/${p.pageSlug}`);
  return {
    title: { absolute: title },
    description,
    keywords: [...SEO_KEYWORDS_BASE, p.name, p.fullName, p.nickname, `${p.name} Papo Reto`, `${p.fullName} Papo Reto`],
    alternates: { canonical: path },
    openGraph: { type: "profile", title, description, url: path },
    twitter: { title, description },
  };
}

const FACES = faces as Record<string, string[]>;

export default async function PersonagemPage({ params }: { params: Promise<{ tab: string; slug: string }> }) {
  const { tab, slug } = await params;
  const p = tab === "bancada" ? findPersonagemByPage(slug) : null;
  if (!p) notFound();
  const face = FACES[p.slug]?.[0];
  const others = PERSONAGENS.filter((o) => o.slug !== p.slug);
  const fields = [
    { label: "Especialidade", value: p.especialidade, Icon: Target },
    { label: "Superpoder", value: p.superpoder, Icon: Zap },
    { label: "Ponto fraco", value: p.pontoFraco, Icon: ShieldAlert },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          { ...personLd(p), memberOf: { "@id": showLd()["@id"] } },
          breadcrumbLd([
            { name: "Início", path: "/" },
            { name: "A Bancada", path: "/bancada" },
            { name: p.name, path: `/bancada/${p.pageSlug}` },
          ]),
        )}
      />
      <Header />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 pb-6 pt-5">
        <nav aria-label="Você está em" className="text-[13px] font-semibold text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href={withBase("/")} className="hover:text-yellow">Início</Link></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li><Link href={withBase("/bancada")} className="hover:text-yellow">A Bancada</Link></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li aria-current="page" className="text-white">{p.name}</li>
          </ol>
        </nav>

        <article className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface" style={{ borderTopColor: p.accent, borderTopWidth: 5 }}>
          <header className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:items-start sm:p-7 sm:text-left">
            {face ? (
              <span className="relative size-36 shrink-0 overflow-hidden rounded-full bg-[#EDE3CC] shadow-[0_0_0_5px_var(--ring)] sm:size-44" style={{ ["--ring" as string]: p.accent }}>
                <Image src={face} alt={`Caricatura de ${p.name}, ${p.nickname}, do Papo Reto`} fill sizes="176px" className="object-cover" preload />
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-yellow">A Bancada do Papo Reto</p>
              <h1 className="mt-1 font-display text-[40px] uppercase leading-none sm:text-6xl">{p.name}</h1>
              <p className="mt-1 font-display text-xl uppercase leading-tight text-yellow sm:text-2xl">{p.nickname}</p>
              <p className="mt-2 text-[14px] font-semibold text-muted">
                {p.fullName !== p.name ? `${p.fullName} • ` : ""}{p.role}
              </p>
              {p.instagram ? (
                <a
                  href={`https://www.instagram.com/${p.instagram}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 text-[14px] font-bold hover:border-yellow hover:text-yellow"
                >
                  <InstagramIcon className="size-4" />@{p.instagram}
                  <span className="sr-only"> no Instagram (abre em nova aba)</span>
                </a>
              ) : null}
            </div>
          </header>

          <div className="space-y-5 border-t border-line p-5 sm:p-7">
            <blockquote className="rounded-xl bg-bg/60 px-4 py-3 text-lg font-semibold italic leading-snug">“{p.quote}”</blockquote>
            <p className="text-[16px] leading-relaxed text-white/90">{p.bio}</p>

            <section aria-labelledby="ficha" className="rounded-2xl border border-dashed border-line bg-bg/50 p-4 sm:p-5">
              <h2 id="ficha" className="font-display text-2xl uppercase leading-none">Ficha criminal da resenha</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {fields.map(({ label, value, Icon }) => (
                  <div key={label} className="min-w-0 rounded-lg bg-surface p-3">
                    <dt className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow">
                      <Icon aria-hidden className="size-4" /> {label}
                    </dt>
                    <dd className="mt-1 text-[15px] leading-snug [overflow-wrap:anywhere]">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-lg bg-surface p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Risco de falar merda</p>
                <p className="mt-1 font-display text-xl uppercase text-yellow">{RISCO_LABEL[p.risco]}</p>
                <p className="text-[15px] leading-snug text-muted">{p.riscoTexto}</p>
              </div>
              <div className="mt-4 rounded-lg border-l-4 border-red bg-red/10 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff7a6e]">
                  <Stethoscope aria-hidden className="size-4" /> Diagnóstico
                </p>
                <p className="mt-1 text-[16px] font-semibold leading-snug">{p.diagnostico}</p>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link href={withBase("/falou-merda")} className="inline-flex min-h-12 items-center rounded-xl bg-yellow px-5 font-extrabold uppercase text-ink">
                Votar no Falou Merda
              </Link>
              <Link href={withBase("/sabio")} className="inline-flex min-h-12 items-center rounded-xl border border-line bg-surface-2 px-5 font-extrabold uppercase">
                Votar no Sábio
              </Link>
            </div>
          </div>
        </article>

        <section aria-labelledby="outros" className="mt-8">
          <h2 id="outros" className="font-display text-2xl uppercase">Os outros integrantes do Papo Reto</h2>
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={withBase(`/bancada/${o.pageSlug}`)} className="group flex flex-col items-center gap-1.5 text-center">
                  <span className="relative size-16 overflow-hidden rounded-full bg-[#EDE3CC] shadow-[0_0_0_3px_var(--ring)] transition-transform group-hover:-translate-y-1" style={{ ["--ring" as string]: o.accent }}>
                    {FACES[o.slug]?.[0] ? <Image src={FACES[o.slug]![0]!} alt="" fill sizes="64px" className="object-cover" /> : null}
                  </span>
                  <span className="text-[12px] font-bold leading-tight">{o.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={withBase("/bancada")} className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold uppercase text-yellow">
            <ArrowLeft aria-hidden className="size-4" /> Ver toda a bancada
          </Link>
        </section>
      </main>
      <Footer showCaricatureCredit />
    </>
  );
}

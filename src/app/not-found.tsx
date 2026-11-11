import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { withBase } from "@/config/site";

export const metadata: Metadata = { title: "Lance anulado (página não encontrada)", robots: { index: false, follow: true } };

/** 404 com atalhos para as páginas principais. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo" className="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
        <p className="font-display text-7xl text-yellow">404</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">Lance anulado pelo VAR</h1>
        <p className="mt-3 text-muted">Essa página não existe. Ou o Joneta mutou ela.</p>
        <nav aria-label="Páginas principais" className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={withBase("/")} className="inline-flex min-h-12 items-center rounded-xl bg-yellow px-5 font-extrabold uppercase text-ink">Início</Link>
          <Link href={withBase("/falou-merda")} className="inline-flex min-h-12 items-center rounded-xl border border-line bg-surface px-5 font-extrabold uppercase">Falou Merda</Link>
          <Link href={withBase("/sabio")} className="inline-flex min-h-12 items-center rounded-xl border border-line bg-surface px-5 font-extrabold uppercase">O Mais Sábio</Link>
          <Link href={withBase("/bancada")} className="inline-flex min-h-12 items-center rounded-xl border border-line bg-surface px-5 font-extrabold uppercase">A Bancada</Link>
        </nav>
      </main>
      <Footer showCaricatureCredit={false} />
    </>
  );
}

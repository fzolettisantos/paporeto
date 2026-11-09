import Image from "next/image";
import { site } from "@/config/site";

export function Footer({ showCaricatureCredit }: { showCaricatureCredit: boolean }) {
  return (
    <footer className="mt-10 border-t border-line bg-surface pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-8">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-display text-2xl uppercase leading-tight sm:text-3xl">
          Aqui ninguém é imparcial. <span className="text-yellow">Nem você.</span>
        </p>
        <p className="mt-3 max-w-xl text-muted">
          Site independente criado por fãs para quem acompanha o Papo Reto e não perde uma boa resenha.
        </p>
        <p className="mt-1 text-sm font-semibold text-white">Projeto sem vínculo oficial com o Canal do Benja.</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href={site.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-line bg-bg px-3 py-2 font-semibold transition-colors hover:border-yellow"
          >
            <Image src="/brand/canal-do-benja.png" alt="" width={66} height={65} className="size-9" />
            <span>
              Canal oficial no YouTube
              <span className="sr-only"> (abre em nova aba)</span>
            </span>
          </a>
        </div>

        <ul className="mt-6 space-y-1 text-sm text-muted">
          {showCaricatureCredit ? <li>{site.caricatureCredit}. Uso autorizado pelos titulares.</li> : null}
          <li>Papo Reto e Canal do Benja são marcas de seus respectivos titulares.</li>
          <li>Rankings de humor: os votos expressam a opinião do público, sem qualquer valor oficial.</li>
        </ul>
      </div>
    </footer>
  );
}

import { ArrowDown } from "lucide-react";
import { site } from "@/config/site";

/** Hero compacto: no celular, a navegação e o começo do ranking aparecem na primeira tela. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-stands">
      <div className="mx-auto max-w-5xl px-4 pb-4 pt-5 sm:pb-8 sm:pt-10">
        <h1 id="hero-title" className="font-display text-[30px] uppercase leading-[1.04] sm:text-5xl lg:max-w-3xl lg:text-6xl">
          Aqui a resenha entra em campo. <span className="text-yellow">E o bom senso fica no banco.</span>
        </h1>
        <p className="mt-2.5 max-w-2xl text-[15px] leading-snug text-muted sm:mt-4 sm:text-lg">
          Futebol raiz, corneta sem VAR, opiniões duvidosas e muita resenha.
          <span className="hidden sm:inline">
            {" "}No Papo Reto, ninguém tem medo de falar besteira. O problema é quando alguém acredita no que falou.
            Agora é sua vez de decidir quem merece o topo — ou a vergonha.
          </span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-5">
          <p className="font-display text-lg uppercase tracking-wide text-yellow sm:text-2xl">{site.tagline}</p>
          <a
            href="#rankings"
            className="hidden min-h-11 items-center gap-2 rounded-xl bg-yellow px-5 font-extrabold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Confira os rankings <ArrowDown aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

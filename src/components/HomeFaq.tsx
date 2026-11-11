import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PERSONAGENS } from "@/config/personagens";
import { site, withBase } from "@/config/site";

/** Perguntas frequentes (visíveis e no JSON-LD FAQPage). Texto simples, para o Google ler. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Que horas passa o Papo Reto?",
    a: "O Papo Reto vai ao ar de segunda a sexta, das 12h às 14h (horário de Brasília), ao vivo no YouTube do Canal do Benja.",
  },
  {
    q: "Quem são os integrantes do Papo Reto?",
    a: `A bancada tem ${PERSONAGENS.map((p) => (p.fullName !== p.name ? `${p.name} (${p.fullName})` : p.name)).join(", ").replace(/, ([^,]*)$/, " e $1")}.`,
  },
  {
    q: "Quem apresenta o Papo Reto?",
    a: "O Papo Reto é apresentado por Benjamin Back, o Benja, no Canal do Benja.",
  },
  {
    q: "Como funciona a votação do Papo Reto Ranking?",
    a: "No Troféu Falou Merda e no Sábio da Resenha, cada pessoa tem 1 voto por dia em cada ranking. O voto soma na semana, no mês e na temporada, e os últimos campeões de cada período ficam em destaque.",
  },
  {
    q: "O que é a Bala do Véio?",
    a: "É o ranking de tiros do Véio Fanático Tricolor: uma brincadeira interna do programa, sem votação do público, com o total de tiros, o local, a localidade e a evidência (episódio e tempo) de cada um.",
  },
  {
    q: "Este site é oficial do Canal do Benja?",
    a: `Não. ${site.disclaimer} É feito por fãs para quem acompanha o Papo Reto.`,
  },
];

export function HomeFaq() {
  return (
    <section aria-labelledby="faq-title" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <h2 id="faq-title" className="font-display text-[28px] uppercase leading-none sm:text-4xl">
        Perguntas sobre o Papo Reto
      </h2>
      <div className="mt-4 divide-y divide-line">
        {FAQ.map((item, i) => (
          <details key={item.q} className="group py-3" open={i === 0}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-bold [&::-webkit-details-marker]:hidden">
              <h3>{item.q}</h3>
              <ChevronDown aria-hidden className="size-5 shrink-0 text-yellow transition-transform group-open:rotate-180" />
            </summary>
            <p className="pt-1 text-[15px] leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        Veja também{" "}
        <Link href={withBase("/bancada")} className="font-bold text-yellow hover:underline">a ficha de cada integrante</Link> e{" "}
        <Link href={withBase("/falou-merda")} className="font-bold text-yellow hover:underline">os rankings da semana</Link>.
      </p>
    </section>
  );
}

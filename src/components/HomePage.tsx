import { getPublishedCharges, getRankingResults } from "@/lib/server/data";
import manifest from "@/generated/character-manifest.json";
import type { Charge, RankingResults, TabSlug } from "@/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HomeExperience } from "./HomeExperience";
import { JsonLd } from "./JsonLd";
import { PERSONAGENS, PERSONAGENS_COPY } from "@/config/personagens";
import { CHARGES_COPY, RANKINGS } from "@/config/rankings";
import { absoluteUrl } from "@/config/site";
import { TAB_SEO } from "@/config/seo";
import { isRankingSlug } from "@/lib/validation";
import { breadcrumbLd, graph, personLd, WEBSITE_ID } from "@/lib/structured-data";

/** Home: header, hero compacto, abas + ranking, compartilhamento e rodapé. */
export async function HomePage({ initialTab }: { initialTab: TabSlug }) {
  let results: RankingResults[] = [];
  let charges: Charge[] = [];
  let resultsError = false;
  let chargesError = false;
  await Promise.all([
    getRankingResults()
      .then((r) => (results = r))
      .catch((error) => {
        console.error("[home] rankings:", error);
        resultsError = true;
      }),
    getPublishedCharges()
      .then((c) => (charges = c))
      .catch((error) => {
        console.error("[home] charges:", error);
        chargesError = true;
      }),
  ]);

  const isDemo = results.some((r) => r.isDemo);
  const hasCaricatures =
    Object.keys(manifest).length > 0 ||
    results.some((r) => r.entries.some((e) => Object.keys(e.participant.avatarPaths).length > 0));

  // Dados estruturados da aba: página, trilha e a lista (classificação, integrantes ou charges).
  const tabName = isRankingSlug(initialTab) ? RANKINGS[initialTab].title : initialTab === "bancada" ? PERSONAGENS_COPY.tabLabel : CHARGES_COPY.title;
  const ranking = isRankingSlug(initialTab) ? results.find((r) => r.slug === initialTab) : undefined;
  const list =
    initialTab === "bancada"
      ? { "@type": "ItemList", name: "Integrantes do Papo Reto", itemListElement: PERSONAGENS.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: personLd(p) })) }
      : ranking && !ranking.isDemo && ranking.entries.length
        ? {
            "@type": "ItemList",
            name: `${tabName} — ${ranking.period.label}`,
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            itemListElement: ranking.entries.slice(0, 10).map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.participant.name })),
          }
        : null;
  const ld = graph(
    {
      "@type": initialTab === "charges" ? "CollectionPage" : "WebPage",
      "@id": absoluteUrl(`/${initialTab}#pagina`),
      url: absoluteUrl(`/${initialTab}`),
      name: TAB_SEO[initialTab].title,
      description: TAB_SEO[initialTab].description,
      inLanguage: "pt-BR",
      isPartOf: { "@id": WEBSITE_ID },
      ...(list ? { mainEntity: list } : {}),
    },
    breadcrumbLd([
      { name: "Início", path: "/" },
      { name: tabName, path: `/${initialTab}` },
    ]),
  );

  return (
    <>
      <JsonLd data={ld} />
      <Header />
      {isDemo ? (
        <p className="demo-stripes px-4 py-1.5 text-center text-[13px] font-bold leading-tight text-ink" role="note">
          MODO DEMONSTRAÇÃO · números simulados — não são votos reais.
        </p>
      ) : null}
      <main id="conteudo">
        <HomeExperience
          initialTab={initialTab}
          initialResults={results}
          initialError={resultsError}
          charges={charges}
          chargesError={chargesError}
        />
      </main>
      <Footer showCaricatureCredit={hasCaricatures} />
    </>
  );
}

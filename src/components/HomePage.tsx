import { getPublishedCharges, getRankingResults } from "@/lib/server/data";
import manifest from "@/generated/character-manifest.json";
import type { Charge, RankingResults, TabSlug } from "@/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { HomeExperience } from "./HomeExperience";

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

  return (
    <>
      <Header />
      {isDemo ? (
        <p className="demo-stripes px-4 py-1.5 text-center text-[13px] font-bold leading-tight text-ink" role="note">
          MODO DEMONSTRAÇÃO · números simulados — não são votos reais.
        </p>
      ) : null}
      <main>
        <Hero />
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

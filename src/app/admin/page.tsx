import { RANKINGS } from "@/config/rankings";
import { formatNumber, formatPercent } from "@/lib/ranking";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getRankingResults, mapParticipant } from "@/lib/server/data";
import { isSupabaseConfigured } from "@/lib/server/env";
import { getServiceClient } from "@/lib/server/supabase";
import { EXPRESSION_STATES, inRanking, RANKING_SLUGS, type RankingSlug } from "@/types";
import {
  createCharge, createInstagramCharge, createParticipant, deleteCharge, logout, removeCaricature,
  addShot, deleteShot, setChargePublished, updateParticipant, updateRanking, uploadCaricature,
} from "./actions";

export const dynamic = "force-dynamic";

const input = "min-h-11 rounded-lg border border-line bg-bg px-3 text-white";
const button = "min-h-11 rounded-lg bg-yellow px-4 text-sm font-extrabold uppercase text-ink";
const ghost = "min-h-11 rounded-lg border border-line px-4 text-sm font-bold";
const card = "rounded-2xl border border-line bg-surface p-4";
const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  await requireAdmin();
  const { ok, erro } = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <main>
        <h1 className="font-display text-3xl uppercase">Administração</h1>
        <p className={`${card} mt-4`}>O Supabase não está configurado — o site está em modo demonstração. Veja o README.</p>
      </main>
    );
  }

  const sb = getServiceClient();
  const [participantsRes, rankingsRes, chargesRes, results] = await Promise.all([
    sb.from("participants").select("id, slug, name, nickname, sort_order, avatar_paths, active, rankings").order("sort_order"),
    sb.from("rankings").select("id, slug, status, period_kind, week_starts_on, mode"),
    sb.from("charges").select("id, title, published, published_on, credits, instagram_url").order("published_on", { ascending: false }),
    Promise.all((["week", "month", "season"] as const).map((view) => getRankingResults(undefined, { view }))).then((all) => all.flat()),
  ]);
  const { data: shotRows } = await sb
    .from("static_shots")
    .select("id, ranking_id, participant_id, quantity, location, place, weapon, note, episode, episode_time, video_url")
    .order("created_at");
  const shots = shotRows ?? [];
  const staticRankings = (rankingsRes.data ?? []).filter((r) => r.mode === "static");
  const participants = (participantsRes.data ?? []).map((row) => ({ ...mapParticipant(row), active: row.active as boolean }));
  const rankings = rankingsRes.data ?? [];
  const charges = chargesRes.data ?? [];

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase">Administração</h1>
        <form action={logout}><button className={ghost}>Sair</button></form>
      </div>
      {ok ? <p role="status" className="rounded-lg bg-green/15 p-3 font-semibold text-green">{ok}</p> : null}
      {erro ? <p role="alert" className="rounded-lg bg-red/15 p-3 font-semibold text-red">{erro}</p> : null}

      <section aria-labelledby="h-results">
        <h2 id="h-results" className="font-display text-2xl uppercase">Resultados do período</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {results.filter((r, i, all) => r.mode === "vote" || all.findIndex((x) => x.slug === r.slug) === i).map((r) => (
            <div key={`${r.slug}:${r.view}`} className={card}>
              <h3 className="font-bold">{RANKINGS[r.slug].title}</h3>
              <p className="text-xs text-muted">
                {r.mode === "static" ? "Definido pelo programa" : `${r.period.label} · ${formatNumber(r.totalVotes)} votos`}
                {r.active ? "" : " · PAUSADO"}
              </p>
              <ol className="mt-2 space-y-1 text-sm">
                {r.entries.map((e) => (
                  <li key={e.participant.id} className="flex justify-between gap-2">
                    <span>{e.position}º {e.participant.name}</span>
                    {r.mode === "static" ? null : (
                      <span className="tabular text-muted">{formatNumber(e.votes)} · {formatPercent(e.percent)}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {staticRankings.map((ranking) => (
        <section key={ranking.id} aria-labelledby={`h-static-${ranking.slug}`}>
          <h2 id={`h-static-${ranking.slug}`} className="font-display text-2xl uppercase">
            {isRankingSlugKnown(ranking.slug) ? RANKINGS[ranking.slug].title : ranking.slug} — tiros
          </h2>
          <p className="mt-2 text-sm text-muted">Sem votação do público. A ordem segue o total de tiros de cada um (iguais empatam).</p>

          <h3 className="mt-5 font-bold">Tiros</h3>
          <p className="text-sm text-muted">Quantidade obrigatória. Local do tiro = onde acerta no corpo; localidade = onde o Véio vai dar os tiros; evidência = episódio e tempo.</p>
          <div className="mt-2 space-y-3">
            {participants.filter((p) => p.active && inRanking(p, ranking.slug as RankingSlug)).map((p) => {
              const mine = shots.filter((s) => s.ranking_id === ranking.id && s.participant_id === p.id);
              const total = mine.reduce((t, s) => t + s.quantity, 0);
              return (
                <div key={p.id} className={card}>
                  <p className="font-bold">{p.name} <span className="text-sm font-normal text-muted">· {total} {total === 1 ? "tiro" : "tiros"}</span></p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {mine.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <span><strong className="tabular">{s.quantity}</strong> · {s.location || "—"} · {s.place || "—"} · {s.weapon || "—"}{s.episode ? ` · EP ${s.episode}` : ""}{s.episode_time ? ` ${s.episode_time}` : ""}{s.video_url ? " · 🎬 vídeo" : ""}{s.note ? ` · ${s.note}` : ""}</span>
                        <form action={deleteShot}>
                          <input type="hidden" name="id" value={s.id} />
                          <button className="text-red underline">remover</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                  <form action={addShot} className="mt-2 grid gap-2 sm:grid-cols-[90px_1fr_1fr_1fr]">
                    <input type="hidden" name="id" value={ranking.id} />
                    <input type="hidden" name="participant_id" value={p.id} />
                    <input name="quantity" type="number" min={1} max={9999} required placeholder="Tiros" className={input} aria-label={`Quantidade de tiros em ${p.name}`} />
                    <input name="location" maxLength={60} placeholder="Local do tiro, no corpo (opcional)" className={input} aria-label={`Local do tiro em ${p.name}`} />
                    <input name="place" maxLength={60} placeholder="Localidade, onde vai dar os tiros (opcional)" className={input} aria-label={`Localidade dos tiros em ${p.name}`} />
                    <input name="weapon" maxLength={60} placeholder="Tipo de arma (opcional)" className={input} aria-label={`Tipo de arma em ${p.name}`} />
                    <input name="episode" type="number" min={1} max={99999} placeholder="Episódio (ex.: 629)" className={input} aria-label={`Episódio da evidência em ${p.name}`} />
                    <input name="episode_time" maxLength={8} pattern="\\d{1,2}(:\\d{2}){1,2}" placeholder="Tempo (ex.: 1:08:12)" className={input} aria-label={`Tempo da evidência em ${p.name}`} />
                    <input name="video_url" type="url" maxLength={300} placeholder="Link do vídeo no YouTube (opcional)" className={`${input} sm:col-span-2`} aria-label={`Link do vídeo da evidência em ${p.name}`} />
                    <input name="note" maxLength={200} placeholder="Motivo / observação (opcional)" className={`${input} sm:col-span-2`} aria-label={`Motivo dos tiros em ${p.name}`} />
                    <button className={button}>Adicionar</button>
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section aria-labelledby="h-rankings">
        <h2 id="h-rankings" className="font-display text-2xl uppercase">Rankings e períodos</h2>
        <div className="mt-3 space-y-3">
          {rankings.filter((r) => r.mode !== "static").map((r) => (
            <form key={r.id} action={updateRanking} className={`${card} flex flex-wrap items-end gap-3`}>
              <input type="hidden" name="id" value={r.id} />
              <p className="w-full font-bold">{isRankingSlugKnown(r.slug) ? RANKINGS[r.slug].title : r.slug}</p>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={r.status === "active"} className="size-5" /> Ativo</label>
              <input type="hidden" name="period_kind" value="weekly" />
              <label className="text-sm">Semana começa
                <br />
                <select name="week_starts_on" defaultValue={r.week_starts_on ?? 1} className={input}>
                  {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </label>
              <button className={button}>Salvar</button>
            </form>
          ))}
          <p className="text-xs text-muted">Voto diário: cada pessoa vota uma vez por dia, e o voto soma na semana, no mês e na temporada (ano, termina em 31/12). O dia de início da semana define o recorte “Semana”.</p>
        </div>
      </section>

      <section aria-labelledby="h-participants">
        <h2 id="h-participants" className="font-display text-2xl uppercase">Participantes e caricaturas</h2>
        <form action={createParticipant} className={`${card} mt-3 grid gap-2 sm:grid-cols-5`}>
          <input name="name" placeholder="Nome" required className={input} aria-label="Nome" />
          <input name="slug" placeholder="slug (ex.: benja)" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={input} aria-label="Slug" />
          <input name="nickname" placeholder="Apelido" className={input} aria-label="Apelido" />
          <input name="sort_order" type="number" placeholder="Ordem" className={input} aria-label="Ordem" />
          <button className={button}>Cadastrar</button>
        </form>
        <div className="mt-3 space-y-3">
          {participants.map((p) => (
            <details key={p.id} className={card}>
              <summary className="cursor-pointer font-bold">
                {p.name} <span className="text-sm font-normal text-muted">/{p.slug} {p.active ? "" : "· inativo"}</span>
              </summary>
              <form action={updateParticipant} className="mt-3 grid gap-2 sm:grid-cols-5">
                <input type="hidden" name="id" value={p.id} />
                <input name="name" defaultValue={p.name} className={input} aria-label="Nome" />
                <input name="nickname" defaultValue={p.nickname ?? ""} className={input} aria-label="Apelido" />
                <input name="sort_order" type="number" defaultValue={p.sortOrder} className={input} aria-label="Ordem" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={p.active} className="size-5" /> Ativo</label>
                <button className={button}>Salvar</button>
                <fieldset className="flex flex-wrap gap-3 text-sm sm:col-span-5">
                  <legend className="mb-1 text-muted">Aparece nos rankings (nenhum marcado = todos):</legend>
                  {RANKING_SLUGS.map((slug) => (
                    <label key={slug} className="flex items-center gap-2">
                      <input type="checkbox" name="rankings" value={slug} defaultChecked={p.rankings?.includes(slug) ?? false} className="size-5" />
                      {RANKINGS[slug].tabLabel}
                    </label>
                  ))}
                </fieldset>
              </form>
              <table className="mt-4 w-full text-left text-sm">
                <thead><tr><th className="py-1">Ranking</th>{EXPRESSION_STATES.map((s) => <th key={s} className="py-1">{s}</th>)}</tr></thead>
                <tbody>
                  {RANKING_SLUGS.map((slug) => (
                    <tr key={slug} className="border-t border-line">
                      <td className="py-1 pr-2">{RANKINGS[slug].tabLabel}</td>
                      {EXPRESSION_STATES.map((state) => (
                        <td key={state} className="py-1">
                          {p.avatarPaths[slug]?.[state] ? (
                            <form action={removeCaricature}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="ranking" value={slug} />
                              <input type="hidden" name="state" value={state} />
                              <button className="text-green underline" title="Remover">✓ remover</button>
                            </form>
                          ) : <span className="text-muted">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <form action={uploadCaricature} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={p.id} />
                <select name="ranking" className={input} aria-label="Ranking">
                  {RANKING_SLUGS.map((s) => <option key={s} value={s}>{RANKINGS[s].tabLabel}</option>)}
                </select>
                <select name="state" className={input} aria-label="Expressão">
                  {EXPRESSION_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="file" name="file" accept="image/webp,image/avif,image/png" required className="text-sm" aria-label="Arquivo" />
                <button className={button}>Enviar caricatura</button>
              </form>
              <p className="mt-1 text-xs text-muted">WebP/AVIF/PNG, quadrado, fundo transparente, até 2 MB. Envie só arquivos autorizados.</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-charges">
        <h2 id="h-charges" className="font-display text-2xl uppercase">Charges</h2>
        <form action={createInstagramCharge} className={`${card} mt-3 grid gap-2 sm:grid-cols-2`}>
          <p className="font-bold sm:col-span-2">Adicionar post do Instagram</p>
          <p className="text-sm text-muted sm:col-span-2">
            No Instagram, abra o post e use “Copiar link”. Aparece no site com o embed oficial (crédito e link do Oberdan).
          </p>
          <input name="instagram_url" type="url" required placeholder="https://www.instagram.com/p/…" className={`${input} sm:col-span-2`} aria-label="Link do post" />
          <input name="title" placeholder="Título (opcional)" className={input} aria-label="Título" />
          <input name="published_on" type="date" className={input} aria-label="Data (opcional)" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked className="size-5" /> Publicar agora</label>
          <button className={button}>Adicionar post</button>
        </form>
        <form action={createCharge} className={`${card} mt-3 grid gap-2 sm:grid-cols-2`}>
          <p className="font-bold sm:col-span-2">Ou enviar uma imagem</p>
          <input name="title" placeholder="Título" required className={input} aria-label="Título" />
          <input name="published_on" type="date" required className={input} aria-label="Data" />
          <input name="credits" placeholder="Créditos (padrão: Oberdan)" className={input} aria-label="Créditos" />
          <input type="file" name="file" accept="image/webp,image/avif,image/png,image/jpeg" required className="text-sm" aria-label="Imagem" />
          <textarea name="description" placeholder="Descrição (também usada como texto alternativo)" className={`${input} py-2 sm:col-span-2`} aria-label="Descrição" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" className="size-5" /> Publicar agora</label>
          <button className={button}>Cadastrar charge</button>
        </form>
        <ul className="mt-3 space-y-2">
          {charges.map((c) => (
            <li key={c.id} className={`${card} flex flex-wrap items-center justify-between gap-2`}>
              <span><strong>{c.title}</strong> <span className="text-sm text-muted">{c.published_on} · {c.credits} · {c.instagram_url ? "Instagram · " : ""}{c.published ? "publicada" : "rascunho"}</span></span>
              <span className="flex gap-2">
                <form action={setChargePublished}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="published" value={String(!c.published)} />
                  <button className={ghost}>{c.published ? "Despublicar" : "Publicar"}</button>
                </form>
                <form action={deleteCharge}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className={`${ghost} text-red`}>Excluir</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function isRankingSlugKnown(slug: string): slug is keyof typeof RANKINGS {
  return slug in RANKINGS;
}

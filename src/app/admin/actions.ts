"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { withBase } from "@/config/site";
import { isPeriodKind } from "@/lib/period";
import { isRankingSlug, SLUG_PATTERN } from "@/lib/validation";
import { ADMIN_COOKIE, requireAdmin } from "@/lib/server/admin-auth";
import { getServiceClient } from "@/lib/server/supabase";
import { EXPRESSION_STATES, type AvatarPaths, type ExpressionState } from "@/types";

const IMAGE_TYPES: Record<string, string> = { "image/webp": "webp", "image/png": "png", "image/avif": "avif", "image/jpeg": "jpg" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const id = (form: FormData) => {
  const value = text(form, "id", 36);
  if (!UUID.test(value)) done("ID inválido.", true);
  return value;
};

function done(message: string, error = false): never {
  revalidatePath(withBase("/"), "layout");
  redirect(`${withBase("/admin")}?${error ? "erro" : "ok"}=${encodeURIComponent(message)}`);
}

function imageFrom(form: FormData, key: string, maxBytes: number, allowJpeg: boolean) {
  const file = form.get(key);
  if (!(file instanceof File) || file.size === 0) done("Selecione um arquivo de imagem.", true);
  const ext = IMAGE_TYPES[file.type];
  if (!ext || (!allowJpeg && ext === "jpg")) done("Formato não aceito. Use WebP, AVIF ou PNG.", true);
  if (file.size > maxBytes) done(`Arquivo grande demais (máx. ${Math.round(maxBytes / 1024 / 1024)} MB).`, true);
  return { file, ext };
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: withBase("/admin") });
  redirect(withBase("/admin/login"));
}

export async function createParticipant(form: FormData) {
  await requireAdmin();
  const name = text(form, "name", 60);
  const slug = text(form, "slug", 40).toLowerCase();
  if (!name || !SLUG_PATTERN.test(slug)) done("Informe nome e slug (letras minúsculas, números e hífens).", true);
  const { error } = await getServiceClient().from("participants").insert({
    name,
    slug,
    nickname: text(form, "nickname", 80) || null,
    sort_order: Number(text(form, "sort_order", 4)) || 0,
  });
  if (error) done(`Erro ao cadastrar: ${error.message}`, true);
  done(`${name} cadastrado.`);
}

export async function updateParticipant(form: FormData) {
  await requireAdmin();
  const name = text(form, "name", 60);
  if (!name) done("O nome é obrigatório.", true);
  const { error } = await getServiceClient()
    .from("participants")
    .update({
      name,
      nickname: text(form, "nickname", 80) || null,
      sort_order: Number(text(form, "sort_order", 4)) || 0,
      active: form.get("active") === "on",
      // Nenhum ranking marcado = aparece em todos.
      rankings: (() => {
        const picked = form.getAll("rankings").filter((r): r is string => typeof r === "string" && isRankingSlug(r));
        return picked.length ? picked : null;
      })(),
    })
    .eq("id", id(form));
  if (error) done(`Erro ao salvar: ${error.message}`, true);
  done("Participante atualizado.");
}

export async function uploadCaricature(form: FormData) {
  await requireAdmin();
  const participantId = id(form);
  const ranking = text(form, "ranking", 20);
  const state = text(form, "state", 10) as ExpressionState;
  if (!isRankingSlug(ranking) || !EXPRESSION_STATES.includes(state)) done("Ranking ou expressão inválidos.", true);
  const { file, ext } = imageFrom(form, "file", 2 * 1024 * 1024, false);

  const sb = getServiceClient();
  const { data: row, error: readError } = await sb.from("participants").select("slug, avatar_paths").eq("id", participantId).single();
  if (readError || !row) done("Participante não encontrado.", true);
  const path = `${row.slug}/${ranking}/${state}.${ext}`;
  const upload = await sb.storage.from("characters").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "86400" });
  if (upload.error) done(`Erro no upload: ${upload.error.message}`, true);
  const url = `${sb.storage.from("characters").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;

  const paths = { ...(row.avatar_paths as AvatarPaths | null) };
  paths[ranking] = { ...paths[ranking], [state]: url };
  const { error } = await sb.from("participants").update({ avatar_paths: paths }).eq("id", participantId);
  if (error) done(`Erro ao salvar caricatura: ${error.message}`, true);
  done("Caricatura enviada.");
}

export async function removeCaricature(form: FormData) {
  await requireAdmin();
  const participantId = id(form);
  const ranking = text(form, "ranking", 20);
  const state = text(form, "state", 10) as ExpressionState;
  if (!isRankingSlug(ranking)) done("Ranking inválido.", true);
  const sb = getServiceClient();
  const { data: row } = await sb.from("participants").select("avatar_paths").eq("id", participantId).single();
  const paths = { ...((row?.avatar_paths as AvatarPaths | null) ?? {}) };
  if (paths[ranking]) {
    const next = { ...paths[ranking] };
    delete next[state];
    paths[ranking] = next;
  }
  await sb.from("participants").update({ avatar_paths: paths }).eq("id", participantId);
  done("Caricatura removida (o placeholder volta a aparecer).");
}

export async function updateRanking(form: FormData) {
  await requireAdmin();
  const periodKind = text(form, "period_kind", 10);
  const weekStartsOn = Number(text(form, "week_starts_on", 1));
  if (!isPeriodKind(periodKind) || !(weekStartsOn >= 0 && weekStartsOn <= 6)) done("Período inválido.", true);
  const { error } = await getServiceClient()
    .from("rankings")
    .update({ status: form.get("active") === "on" ? "active" : "inactive", period_kind: periodKind, week_starts_on: weekStartsOn })
    .eq("id", id(form));
  if (error) done(`Erro ao salvar ranking: ${error.message}`, true);
  done("Ranking atualizado.");
}

/** Ranking estático (ex.: Bala do Véio): o programa define a ordem. Campo vazio = fora do ranking. */
export async function saveStaticStandings(form: FormData) {
  await requireAdmin();
  const rankingId = id(form);
  const sb = getServiceClient();
  const { data: ranking } = await sb.from("rankings").select("mode").eq("id", rankingId).single();
  if (ranking?.mode !== "static") done("Esse ranking é de votação.", true);

  const rows: { ranking_id: string; participant_id: string; position: number }[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("pos_") || typeof value !== "string" || value.trim() === "") continue;
    const participantId = key.slice(4);
    const position = Number(value);
    if (!UUID.test(participantId) || !Number.isInteger(position) || position < 1 || position > 99) {
      done("Posições devem ser números inteiros de 1 a 99.", true);
    }
    rows.push({ ranking_id: rankingId, participant_id: participantId, position });
  }

  const removed = await sb.from("static_standings").delete().eq("ranking_id", rankingId);
  if (removed.error) done(`Erro ao salvar: ${removed.error.message}`, true);
  if (rows.length > 0) {
    const { error } = await sb.from("static_standings").insert(rows);
    if (error) done(`Erro ao salvar: ${error.message}`, true);
  }
  done("Ordem do ranking atualizada.");
}

/** Bala do Véio: registra tiros (quantidade, local, tipo de arma) para um participante. */
export async function addShot(form: FormData) {
  await requireAdmin();
  const rankingId = id(form);
  const participantId = text(form, "participant_id", 36);
  const quantity = Number(text(form, "quantity", 4));
  const location = text(form, "location", 60) || null;
  const weapon = text(form, "weapon", 60) || null;
  const place = text(form, "place", 60) || null;
  const note = text(form, "note", 200) || null;
  if (!UUID.test(participantId)) done("Participante inválido.", true);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) done("Quantidade de tiros: número de 1 a 9999.", true);
  const sb = getServiceClient();
  const { data: ranking } = await sb.from("rankings").select("mode").eq("id", rankingId).single();
  if (ranking?.mode !== "static") done("Esse ranking não tem tiros.", true);
  const { error } = await sb.from("static_shots").insert({ ranking_id: rankingId, participant_id: participantId, quantity, location, place, weapon, note });
  if (error) done(`Erro ao salvar tiros: ${error.message}`, true);
  done("Tiros registrados.");
}

export async function deleteShot(form: FormData) {
  await requireAdmin();
  const { error } = await getServiceClient().from("static_shots").delete().eq("id", id(form));
  if (error) done(`Erro ao remover: ${error.message}`, true);
  done("Registro de tiros removido.");
}

export async function createCharge(form: FormData) {
  await requireAdmin();
  const title = text(form, "title", 120);
  const date = text(form, "published_on", 10);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) done("Informe título e data.", true);
  const { file, ext } = imageFrom(form, "file", 4 * 1024 * 1024, true);
  const sb = getServiceClient();
  const path = `${date}-${crypto.randomUUID()}.${ext}`;
  const upload = await sb.storage.from("charges").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (upload.error) done(`Erro no upload: ${upload.error.message}`, true);
  const { error } = await sb.from("charges").insert({
    title,
    image_url: sb.storage.from("charges").getPublicUrl(path).data.publicUrl,
    storage_path: path,
    description: text(form, "description", 500) || null,
    credits: text(form, "credits", 80) || "Oberdan",
    published_on: date,
    published: form.get("published") === "on",
  });
  if (error) done(`Erro ao salvar charge: ${error.message}`, true);
  done("Charge cadastrada.");
}

export async function setChargePublished(form: FormData) {
  await requireAdmin();
  const { error } = await getServiceClient().from("charges").update({ published: form.get("published") === "true" }).eq("id", id(form));
  if (error) done(`Erro: ${error.message}`, true);
  done("Charge atualizada.");
}

export async function deleteCharge(form: FormData) {
  await requireAdmin();
  const sb = getServiceClient();
  const chargeId = id(form);
  const { data } = await sb.from("charges").select("storage_path").eq("id", chargeId).single();
  if (data?.storage_path) await sb.storage.from("charges").remove([data.storage_path]);
  const { error } = await sb.from("charges").delete().eq("id", chargeId);
  if (error) done(`Erro: ${error.message}`, true);
  done("Charge excluída.");
}

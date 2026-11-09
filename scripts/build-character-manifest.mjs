// Gera src/generated/*.json com as caricaturas (public/characters) e as ilustrações dos rankings (public/rankings).
// Assim o site sabe, sem requisições extras, quais expressões já foram fornecidas e quais
// precisam do placeholder neutro. Roda sozinho antes de `dev` e `build`.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CHAR_DIR = join(ROOT, "public", "characters");
const OUT = join(ROOT, "src", "generated", "character-manifest.json");
const RANKINGS = ["falou-merda", "sabio", "bala-do-veio"];
const STATES = ["top", "middle", "bottom", "neutral"];
const EXTENSIONS = ["avif", "webp", "png"];

const manifest = {};
if (existsSync(CHAR_DIR)) {
  for (const character of (await readdir(CHAR_DIR, { withFileTypes: true })).filter((d) => d.isDirectory())) {
    for (const ranking of RANKINGS) {
      const dir = join(CHAR_DIR, character.name, ranking);
      if (!existsSync(dir)) continue;
      const files = await readdir(dir);
      for (const state of STATES) {
        const ext = EXTENSIONS.find((e) => files.includes(`${state}.${e}`));
        if (!ext) continue;
        manifest[character.name] ??= {};
        manifest[character.name][ranking] ??= {};
        manifest[character.name][ranking][state] = `/characters/${character.name}/${ranking}/${state}.${ext}`;
      }
    }
  }
}

/** Largura e altura lidas do cabeçalho do arquivo (PNG, WebP ou AVIF), sem dependências. */
function imageSize(buf) {
  if (buf.toString("ascii", 1, 4) === "PNG") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  const ispe = buf.indexOf("ispe");
  if (ispe > 0) return { width: buf.readUInt32BE(ispe + 8), height: buf.readUInt32BE(ispe + 12) };
  return { width: 800, height: 800 };
}

// Rostos diferentes de cada personagem (para a aba Personagens). Arquivos iguais em rankings diferentes contam uma vez.
// Ordem: primeiro a expressão "de apresentação" (1º do Sábio), depois as demais.
const FACE_ORDER = [
  ["sabio", "top"], ["falou-merda", "bottom"], ["sabio", "middle"], ["falou-merda", "top"],
  ["falou-merda", "middle"], ["sabio", "bottom"], ["bala-do-veio", "top"], ["bala-do-veio", "middle"],
  ["bala-do-veio", "bottom"], ["falou-merda", "neutral"],
];
const faces = {};
for (const [character, rankings] of Object.entries(manifest)) {
  const seen = new Set();
  for (const [ranking, state] of FACE_ORDER) {
    const src = rankings[ranking]?.[state];
    if (!src) continue;
    const hash = createHash("sha1").update(await readFile(join(ROOT, "public", src))).digest("hex");
    if (seen.has(hash)) continue;
    seen.add(hash);
    (faces[character] ??= []).push(src);
  }
}

// Ilustrações dos rankings (abaixo do título): public/rankings/<ranking>.<ext>
const RANKING_DIR = join(ROOT, "public", "rankings");
const illustrations = {};
if (existsSync(RANKING_DIR)) {
  const files = await readdir(RANKING_DIR);
  for (const ranking of RANKINGS) {
    const ext = EXTENSIONS.find((e) => files.includes(`${ranking}.${e}`));
    if (!ext) continue;
    const size = imageSize(await readFile(join(RANKING_DIR, `${ranking}.${ext}`)));
    illustrations[ranking] = { src: `/rankings/${ranking}.${ext}`, ...size };
  }
}
await writeFile(
  join(ROOT, "src", "generated", "ranking-illustrations.json"),
  JSON.stringify(illustrations, null, 2) + "\n",
);

await mkdir(join(ROOT, "src", "generated"), { recursive: true });
await writeFile(OUT, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(join(ROOT, "src", "generated", "character-faces.json"), JSON.stringify(faces, null, 2) + "\n");
const count = Object.values(manifest).flatMap((r) => Object.values(r).flatMap((s) => Object.keys(s))).length;
console.log(`[characters] ${count} caricatura(s) encontrada(s) em public/characters.`);

import type { PlaceholderMood } from "./characters";

/**
 * Rosto genérico (placeholder) desenhado em SVG — não retrata nenhum participante.
 * Serve para o site funcionar e mostrar a troca de expressões enquanto as caricaturas
 * autorizadas não forem enviadas. Usado no site e nos cards compartilháveis.
 */
const INK = "#111318";
const SKIN = "#EDE3CC";
const WHITE = "#FFFFFF";

const eyeWhite = (cx: number, cy: number, r = 9) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${WHITE}" stroke="${INK}" stroke-width="2.5"/>`;
const pupil = (cx: number, cy: number, r = 3.5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>`;
const stroke = (d: string, w = 3.5) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const fill = (d: string, color = INK) => `<path d="${d}" fill="${color}"/>`;
const sweat = `<path d="M97 34 q-6 9 0 12 q6 -3 0 -12z" fill="#7CC4FF" stroke="${INK}" stroke-width="1.5"/>`;
const cheeks = `<ellipse cx="38" cy="78" rx="6" ry="3.5" fill="#F4A28C" opacity=".8"/><ellipse cx="82" cy="78" rx="6" ry="3.5" fill="#F4A28C" opacity=".8"/>`;

const FEATURES: Record<PlaceholderMood, string> = {
  neutral: [pupil(46, 62, 4), pupil(74, 62, 4), stroke("M39 50 L53 50"), stroke("M67 50 L81 50"), stroke("M49 88 L71 88")].join(""),
  scared: [
    eyeWhite(46, 62, 10), eyeWhite(74, 62, 10), pupil(46, 62, 3), pupil(74, 62, 3),
    stroke("M36 44 Q46 36 55 44"), stroke("M65 44 Q74 36 84 44"),
    `<ellipse cx="60" cy="92" rx="8" ry="11" fill="${INK}"/>`, sweat,
  ].join(""),
  terrified: [
    eyeWhite(46, 61, 11), eyeWhite(74, 61, 11), pupil(46, 61, 2.5), pupil(74, 61, 2.5),
    stroke("M35 46 L54 40"), stroke("M66 40 L85 46"),
    `<rect x="47" y="82" width="26" height="20" rx="9" fill="${INK}"/>`,
    stroke("M50 88 L70 88", 2), sweat,
    stroke("M14 52 q-5 6 0 12 q5 6 0 12", 2.5), stroke("M106 52 q5 6 0 12 q-5 6 0 12", 2.5),
  ].join(""),
  lookingUp: [
    eyeWhite(46, 62), eyeWhite(74, 62), pupil(47, 57), pupil(75, 57),
    stroke("M37 48 Q46 44 54 49"), stroke("M66 49 Q74 44 83 48"),
    stroke("M50 90 q5 -3 10 0 q5 3 10 0"),
  ].join(""),
  worried: [
    eyeWhite(46, 62), eyeWhite(74, 62), pupil(47, 57), pupil(75, 57),
    stroke("M37 51 L54 45"), stroke("M66 45 L83 51"),
    stroke("M48 93 Q60 84 72 93"), sweat,
  ].join(""),
  smiling: [
    stroke("M38 63 Q46 55 54 63"), stroke("M66 63 Q74 55 82 63"),
    stroke("M37 50 Q46 46 54 49"), stroke("M66 49 Q74 46 83 50"),
    fill("M42 81 Q60 104 78 81 Z"), cheeks,
  ].join(""),
  relieved: [
    stroke("M38 62 Q46 56 54 62"), stroke("M66 62 Q74 56 82 62"),
    fill("M40 79 Q60 112 80 79 Z"), fill("M51 94 Q60 101 69 94 Q60 90 51 94Z", "#E9645A"), cheeks,
    stroke("M92 86 l9 -3", 2.5), stroke("M93 94 l9 1", 2.5),
  ].join(""),
  proud: [
    eyeWhite(46, 63, 8), eyeWhite(74, 63, 8), pupil(46, 65), pupil(74, 65),
    fill("M37 63 A9 9 0 0 1 55 63 Z", SKIN), fill("M65 63 A9 9 0 0 1 83 63 Z", SKIN),
    stroke("M37 63 L55 63", 3), stroke("M65 63 L83 63", 3),
    stroke("M37 50 L54 50"), stroke("M66 46 Q75 40 84 46"),
    stroke("M47 88 Q62 96 76 83"),
    fill("M98 26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z", "#FFD23F"),
  ].join(""),
  thinking: [
    eyeWhite(46, 62), eyeWhite(74, 62), pupil(50, 58), pupil(78, 58),
    stroke("M37 49 L54 47"), stroke("M66 45 Q75 41 83 46"),
    stroke("M53 89 L70 86"),
    `<circle cx="94" cy="34" r="3" fill="${WHITE}" stroke="${INK}" stroke-width="2"/>`,
    `<circle cx="102" cy="24" r="4.5" fill="${WHITE}" stroke="${INK}" stroke-width="2"/>`,
    `<circle cx="110" cy="11" r="6.5" fill="${WHITE}" stroke="${INK}" stroke-width="2"/>`,
  ].join(""),
  confused: [
    eyeWhite(46, 62, 10), eyeWhite(74, 63, 6), pupil(48, 63), pupil(74, 63, 2.5),
    stroke("M36 46 Q46 40 55 47"), stroke("M66 54 L82 52"),
    stroke("M47 90 q4 -4 8 0 q4 4 8 0 q4 -4 8 0"),
    stroke("M96 22 q0 -8 8 -8 q8 0 8 8 q0 6 -8 8 v6", 3.5),
    `<circle cx="104" cy="44" r="2.5" fill="${INK}"/>`,
  ].join(""),
};

export const FACE_VIEWBOX = "0 0 120 120";

export function faceSvgInner(mood: PlaceholderMood): string {
  const head = [
    `<ellipse cx="18" cy="68" rx="7" ry="10" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>`,
    `<ellipse cx="102" cy="68" rx="7" ry="10" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>`,
    `<ellipse cx="60" cy="66" rx="42" ry="46" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>`,
    `<path d="M24 50 Q28 18 60 18 Q92 18 96 50 Q84 34 60 32 Q36 34 24 50Z" fill="#3A3F4B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
    stroke("M58 70 Q55 78 61 79", 2.5),
  ].join("");
  return head + FEATURES[mood];
}

export function faceSvgDataUri(mood: PlaceholderMood): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FACE_VIEWBOX}" width="480" height="480">${faceSvgInner(mood)}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

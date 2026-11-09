import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const OG_SIZE = { width: 1200, height: 630 };

/** Imagem Open Graph estática por aba (sem números, para nunca ficar desatualizada). */
export async function renderOgImage({ eyebrow, title, subtitle, accent }: { eyebrow: string; title: string; subtitle: string; accent: string }) {
  const [anton, barlow] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/anton-400.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/barlow-700.woff")),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#111318", color: "#fff", padding: 64, fontFamily: "Barlow" }}>
        <div style={{ display: "flex", fontFamily: "Anton", fontSize: 40 }}>
          <span style={{ color: "#FFD23F" }}>PAPO RETO</span>
          <span style={{ marginLeft: 12 }}>RANKING</span>
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 30, color: accent, textTransform: "uppercase", letterSpacing: 2 }}>{eyebrow}</div>
        <div style={{ display: "flex", fontFamily: "Anton", fontSize: 104, lineHeight: 1, marginTop: 12, textTransform: "uppercase" }}>{title}</div>
        <div style={{ display: "flex", fontSize: 40, color: "#C9CED8", marginTop: 24 }}>{subtitle}</div>
        <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", fontSize: 26, color: "#9AA3B2" }}>
          <span style={{ color: "#FFD23F" }}>{site.tagline}</span>
          <span>Projeto independente de fãs</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Barlow", data: barlow, weight: 700, style: "normal" },
      ],
    },
  );
}

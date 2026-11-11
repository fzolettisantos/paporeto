import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { findPersonagemByPage, PERSONAGENS } from "@/config/personagens";
import { site } from "@/config/site";

export const alt = "Integrante do Papo Reto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PERSONAGENS.map((p) => ({ tab: "bancada", slug: p.pageSlug }));
}

export default async function Image({ params }: { params: Promise<{ tab: string; slug: string }> }) {
  const { slug } = await params;
  const p = findPersonagemByPage(slug)!;
  const [anton, barlow, face] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/anton-400.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/barlow-700.woff")),
    readFile(join(process.cwd(), "public/characters", p.slug, "sabio/top.png")).catch(() => null),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#111318", color: "#fff", padding: 60, fontFamily: "Barlow", alignItems: "center", gap: 56 }}>
        {face ? (
          <img src={`data:image/png;base64,${face.toString("base64")}`} width={400} height={400} alt="" style={{ borderRadius: 200, background: "#EDE3CC", border: `10px solid ${p.accent}` }} />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#FFD23F", letterSpacing: 2, textTransform: "uppercase" }}>A Bancada do Papo Reto</div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 92, lineHeight: 1, marginTop: 12, textTransform: "uppercase" }}>{p.name}</div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 44, color: "#FFD23F", marginTop: 10, textTransform: "uppercase" }}>{p.nickname}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#C9CED8", marginTop: 26, lineHeight: 1.3 }}>{`“${p.quote}”`}</div>
          <div style={{ display: "flex", fontSize: 24, color: "#9AA3B2", marginTop: "auto", paddingTop: 30 }}>{site.disclaimer}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Barlow", data: barlow, weight: 700, style: "normal" },
      ],
    },
  );
}

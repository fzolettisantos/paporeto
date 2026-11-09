"use client";

import { InstagramIcon } from "./InstagramIcon";
import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT_SRC = "https://www.instagram.com/embed.js";

/** Carrega o script oficial do Instagram uma vez e transforma os blocos em posts. */
function processEmbeds() {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
    return;
  }
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.onload = () => window.instgrm?.Embeds.process();
  document.body.appendChild(script);
}

/**
 * Post do Instagram com o embed oficial (mostra a imagem, o crédito e o link do autor).
 * Enquanto carrega — ou se o navegador bloquear o Instagram — aparece um link para o post.
 */
export function InstagramEmbed({ url, title }: { url: string; title: string }) {
  useEffect(() => {
    processEmbeds();
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={`${url}?utm_source=ig_embed`}
      data-instgrm-version="14"
      style={{ background: "#fff", border: 0, borderRadius: 12, margin: 0, maxWidth: 540, minWidth: 280, width: "100%" }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[320px] flex-col items-center justify-center gap-2 p-6 text-center font-bold text-[#111318]"
      >
        <InstagramIcon className="size-8" />
        {title}
        <span className="text-sm font-semibold text-[#5b6170]">Ver no Instagram (abre em nova aba)</span>
      </a>
    </blockquote>
  );
}

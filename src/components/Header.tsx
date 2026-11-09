import Image from "next/image";
import Link from "next/link";
import { Tv } from "lucide-react";
import { site, withBase } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href={withBase("/")} className="flex items-center gap-2.5" aria-label={`${site.name} — início`}>
          <Image src="/brand/papo-reto.png" alt="" width={98} height={52} className="h-8 w-auto" preload />
          <span className="font-display text-[22px] leading-none tracking-wide text-white">RANKING</span>
        </Link>
        <a
          href={site.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-semibold text-muted transition-colors hover:border-yellow hover:text-white"
        >
          <Tv aria-hidden className="size-4" />
          <span>Assistir</span>
          <span className="sr-only">ao Papo Reto no YouTube (abre em nova aba)</span>
        </a>
      </div>
    </header>
  );
}

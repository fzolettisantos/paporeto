import Image from "next/image";
import Link from "next/link";
import { Tv } from "lucide-react";
import { site, withBase } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <a href={site.youtubeUrl} target="_blank" rel="noopener noreferrer" className="-my-1 shrink-0">
            <Image
              src="/brand/canal-do-benja-header.webp"
              alt="Canal do Benja"
              width={281}
              height={286}
              className="h-12 w-auto drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)]"
              preload
            />
            <span className="sr-only"> no YouTube (abre em nova aba)</span>
          </a>
          <span aria-hidden className="h-7 w-px shrink-0 bg-line" />
          <Link href={withBase("/")} className="flex min-w-0 items-center gap-2" aria-label={`${site.name} — início`}>
            <Image src="/brand/papo-reto.png" alt="" width={98} height={52} className="h-8 w-auto shrink-0" preload />
          </Link>
        </div>
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

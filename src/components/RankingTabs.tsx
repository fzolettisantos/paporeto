"use client";

import { Brain, Megaphone, PenTool, Target, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { tabLabel } from "@/config/rankings";
import { TAB_SLUGS, type TabSlug } from "@/types";

const ICONS: Record<TabSlug, LucideIcon> = {
  "falou-merda": Megaphone,
  sabio: Brain,
  "bala-do-veio": Target,
  charges: PenTool,
};

export const tabId = (slug: TabSlug) => `tab-${slug}`;
export const PANEL_ID = "ranking-panel";

/** Abas acessíveis (setas, Home/End) com rolagem horizontal no celular, mantendo a ativa visível. */
export function RankingTabs({ active, onChange }: { active: TabSlug; onChange: (slug: TabSlug) => void }) {
  const refs = useRef<Partial<Record<TabSlug, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    refs.current[active]?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = TAB_SLUGS.indexOf(active);
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % TAB_SLUGS.length;
    if (event.key === "ArrowLeft") next = (index - 1 + TAB_SLUGS.length) % TAB_SLUGS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TAB_SLUGS.length - 1;
    if (next === null) return;
    event.preventDefault();
    const slug = TAB_SLUGS[next]!;
    onChange(slug);
    refs.current[slug]?.focus();
  };

  return (
    <nav aria-label="Rankings" className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
      <div
        role="tablist"
        aria-label="Escolha o ranking"
        onKeyDown={onKeyDown}
        className="no-scrollbar mx-auto flex max-w-5xl snap-x gap-2 overflow-x-auto scroll-px-4 px-4 py-2.5"
      >
        {TAB_SLUGS.map((slug) => {
          const Icon = ICONS[slug];
          const selected = slug === active;
          return (
            <button
              key={slug}
              ref={(node) => {
                refs.current[slug] = node;
              }}
              id={tabId(slug)}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(slug)}
              className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[14px] font-extrabold uppercase tracking-wide transition-colors ${
                selected
                  ? "border-yellow bg-yellow text-ink"
                  : "border-line bg-surface text-white hover:border-yellow/70"
              }`}
            >
              <Icon aria-hidden className="size-4" />
              {tabLabel(slug)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

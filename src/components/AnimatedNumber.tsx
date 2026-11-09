"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/ranking";

/** Número que "rola" até o novo valor. O texto final está sempre no DOM (SSR e leitores de tela). */
export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    const from = previous.current;
    previous.current = value;
    if (!node || from === value || reduce) {
      if (node) node.textContent = formatNumber(value);
      return;
    }
    const controls = animate(from, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => (node.textContent = formatNumber(Math.round(v))),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span ref={ref}>{formatNumber(value)}</span>;
}

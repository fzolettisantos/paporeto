"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { LOGO_LETTERS, LOGO_TRANSFORM, LOGO_VIEWBOX } from "@/config/logo-paths";

export const LOADING_PHRASES = [
  "Espera aí, seu morfético!",
  "Oooooh, Benjamin!",
  "Aguarde, seja sábio igual o Mano.",
  "Eu tô com a garganta roxa de tanto esperar.",
  "Espera!!! Seu id!#t4!",
  "Calma, ou vou te dar 10 tombo na sua cara.",
  "Vou falar com o terceiro mercado, pera aí.",
];

/**
 * Carregamento do site: logo do Papo Reto com as letras pulando uma a uma
 * e frases da resenha trocando embaixo. Respeita "reduzir movimento".
 */
export function PapoLoader({ size = "lg", label = "Carregando" }: { size?: "md" | "lg"; label?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Começa numa frase aleatória e troca a cada 2,4 s.
    const start = Math.floor(Math.random() * LOADING_PHRASES.length);
    const first = window.setTimeout(() => setIndex(start), 0);
    const id = window.setInterval(() => setIndex((i) => (i + 1) % LOADING_PHRASES.length), 2400);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const width = size === "lg" ? "w-44 sm:w-52" : "w-32";

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-5 text-center">
      <span className="sr-only">{label}…</span>
      <motion.div
        aria-hidden
        className={`relative ${width}`}
        animate={reduce ? undefined : { rotate: [0, -2, 2, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox={LOGO_VIEWBOX} className="block h-auto w-full overflow-visible drop-shadow-[0_6px_18px_rgb(249_174_15/0.35)]">
          <g transform={LOGO_TRANSFORM} fill="#F9AE0F">
            {LOGO_LETTERS.map((l, i) => (
              <motion.path
                key={i}
                d={l.d}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                animate={
                  reduce
                    ? { opacity: [1, 0.55, 1] }
                    : { y: [0, 1100, 0, 0], scaleY: [1, 1.12, 0.86, 1], opacity: [1, 1, 1, 1] }
                }
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  delay: i * 0.12,
                  ease: "easeInOut",
                  times: reduce ? undefined : [0, 0.3, 0.55, 1],
                }}
              />
            ))}
          </g>
        </svg>
        {/* Barra de "corneta" carregando embaixo do logo. */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full w-1/3 rounded-full bg-yellow"
            animate={reduce ? { opacity: [0.4, 1, 0.4] } : { x: ["-100%", "300%"] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <div className="flex min-h-[3.5rem] max-w-xs items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className={`font-display uppercase leading-tight text-white ${size === "lg" ? "text-xl sm:text-2xl" : "text-lg"}`}
            initial={{ opacity: 0, y: 10, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            “{LOADING_PHRASES[index]}”
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

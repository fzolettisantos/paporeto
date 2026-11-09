"use client";

import { AnimatePresence, motion } from "motion/react";

/** Feedback imediato. Fica acima da safe area e não cobre os botões de forma permanente. */
export function Toast({ message, id }: { message: string | null; id: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <AnimatePresence>
        {message ? (
          <motion.p
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="max-w-md rounded-xl border border-yellow/40 bg-surface-2 px-4 py-3 text-center text-[15px] font-bold shadow-2xl shadow-black/50"
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

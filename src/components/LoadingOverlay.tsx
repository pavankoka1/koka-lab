"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  visible: boolean;
  progress: number;
};

export function LoadingOverlay({ visible, progress }: Props) {
  const pct = Math.round(Math.min(100, Math.max(0, progress)));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-deep)]"
          initial={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mb-10 h-px w-[min(280px,70vw)] overflow-hidden bg-[var(--bg-tertiary)]">
            <motion.div
              className="h-full bg-gradient-to-r from-white/10 via-white/60 to-white/30"
              initial={{ width: "0%" }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="font-mono text-xs tracking-[0.35em] text-[var(--text-muted)]">
            LOADING EXPERIENCE
          </p>
          <p className="mt-3 font-mono text-[10px] text-[var(--text-dim)]">
            {pct}%
          </p>
          <motion.div
            className="mt-12 h-1 w-1 rounded-full bg-white/40"
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

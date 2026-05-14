"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useState } from "react";

/**
 * Cycling H1 lines — each is a self-contained one-liner.
 *
 * Add or reorder freely. They share a tone (real-time, render-aware,
 * confident, declarative) so the cycle reads as one voice.
 */
const HEROES = [
  "One frame at a time.",
  "Engineered to feel.",
  "Performance is the spec.",
  "Code that keeps time.",
] as const;

const HERO_INTERVAL_MS = 4500;

/**
 * Per-word stagger choreography.
 *
 * Enter — left to right, default `staggerChildren`. Words arrive in
 * reading order: settle from below as opacity rises.
 *
 * Exit  — right to left, `staggerDirection: -1`. The line dissolves
 * from the end backward, like a wave receding, then the next line
 * builds back up.
 *
 * Easing — `[0.22, 1, 0.36, 1]` is an "expo out" curve — sharp depart,
 * long, soft landing. The right feel for a hero typeset.
 *
 * Performance — only `opacity` and `transform` are animated. Both are
 * compositor properties (no layout, no paint, no filter pass), so the
 * whole sequence runs on the GPU. No `will-change` is set — that hint
 * promotes layers permanently and was leaking GPU memory while idle.
 */
const PARENT_VARIANTS = {
  enter: {
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
  exit: {
    transition: { staggerChildren: 0.035, staggerDirection: -1 },
  },
} as const;

const WORD_VARIANTS = {
  enter: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 18,
  },
} as const;

const WORD_TRANSITION = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function CyclingHeadline() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % HEROES.length);
    }, HERO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const text = HEROES[idx];
  const words = text.split(" ");

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        initial="exit"
        animate="enter"
        exit="exit"
        variants={PARENT_VARIANTS}
        className="block"
      >
        {words.map((word, i) => (
          <Fragment key={`${text}-${i}`}>
            {i > 0 && " "}
            <motion.span
              variants={WORD_VARIANTS}
              transition={WORD_TRANSITION}
              className="inline-block"
            >
              {word}
            </motion.span>
          </Fragment>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

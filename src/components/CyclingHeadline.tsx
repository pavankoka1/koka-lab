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
 * Per-word stagger choreography — Slow Bloom pattern.
 *
 * Enter — left to right, slow stagger. Words bloom in from blur,
 * arriving in reading order with a gentle opacity fade.
 *
 * Exit  — right to left, `staggerDirection: -1`. The line dissolves
 * from the end backward into blur, like a wave receding, then the
 * next line blooms back up.
 *
 * Easing — `[0.16, 1, 0.3, 1]` is a soft expo-out curve suited for
 * the longer 1.8 s bloom duration.
 *
 * Performance — `opacity` and `filter: blur` are animated. Blur is a
 * paint property (not a transform), so it triggers a composited layer
 * per element. For short hero text this is acceptable; avoid applying
 * to long lists or rapidly updating text.
 */
const PARENT_VARIANTS = {
  enter: {
    transition: { staggerChildren: 0.42, delayChildren: 0.08 },
  },
  exit: {
    transition: { staggerChildren: 0.18, staggerDirection: -1 },
  },
} as const;

const WORD_VARIANTS = {
  enter: {
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
  },
} as const;

const WORD_TRANSITION = {
  duration: 1.8,
  ease: [0.16, 1, 0.3, 1] as const,
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

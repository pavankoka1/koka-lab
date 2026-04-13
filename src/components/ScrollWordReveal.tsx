"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

type Props = {
  text: string;
  className?: string;
};

/**
 * Words stay dim; as the block scrolls through the viewport, each word steps toward full brightness.
 */
export function ScrollWordReveal({ text, className = "" }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.trim().split(/\s+/);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.88", "end 0.28"],
  });

  const head = useTransform(scrollYProgress, [0, 1], [0, words.length]);

  return (
    <p ref={ref} className={`flex flex-wrap gap-x-2 gap-y-3 ${className}`}>
      {words.map((word, i) => (
        <LitWord key={`${i}-${word}`} word={word} index={i} head={head} />
      ))}
    </p>
  );
}

function LitWord({
  word,
  index,
  head,
}: {
  word: string;
  index: number;
  head: MotionValue<number>;
}) {
  const color = useTransform(head, (h) => {
    const t = h - index;
    if (t >= 0.85) return "var(--text-primary)";
    if (t >= 0.35) return "var(--text-muted)";
    return "var(--text-dim)";
  });

  return (
    <motion.span
      style={{ color }}
      className="inline-block font-medium tracking-tight"
    >
      {word}
    </motion.span>
  );
}

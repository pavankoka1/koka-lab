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
        <BloomWord key={`${i}-${word}`} word={word} index={i} head={head} />
      ))}
    </p>
  );
}

function BloomWord({
  word,
  index,
  head,
}: {
  word: string;
  index: number;
  head: MotionValue<number>;
}) {
  const opacity = useTransform(head, [index - 0.5, index + 0.5], [0, 1]);
  const blurPx = useTransform(head, [index - 0.5, index + 0.5], [8, 0]);
  const filter = useTransform(blurPx, (b) => `blur(${b.toFixed(2)}px)`);

  return (
    <motion.span
      style={{ opacity, filter }}
      className="inline-block tracking-tight text-[var(--text-primary)]"
    >
      {word}
    </motion.span>
  );
}

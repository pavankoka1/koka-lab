"use client";

import {
  education,
  timeline,
  TIMELINE_ACTIVATION_SCROLL,
  type TimelineEntry,
} from "@/lib/timeline";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const GAP = "1.5rem"; /* gap-6 */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

/** Fallback before layout measure (3 dots ≈ thirds of rail). */
function defaultFractions(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0.5];
  return Array.from({ length: n }, (_, i) => i / (n - 1));
}

/**
 * Uses measured dot centers as fractions of rail height (0 = top, 1 = bottom).
 * [0 → th₁]: tip moves from rail top (0) to dot 1 (2nd card at th₁).
 * [th₁ → th₂]: tip moves from dot 1 to dot 2 (3rd card at th₂).
 * After th₂: tip moves from dot 2 to rail bottom (1).
 */
function lineScaleFromSectionProgress(
  p: number,
  th: readonly number[],
  fr: readonly number[]
): number {
  const n = fr.length;
  if (n <= 0) return 0;
  if (n === 1) return clamp01(p);

  p = clamp01(p);
  const th0 = th[0] ?? 0;
  const th1 = th[1] ?? 0.25;
  const th2 = th[2] ?? 0.4;

  if (p <= th1) {
    const span = th1 - th0;
    const u = span > 1e-9 ? (p - th0) / span : 1;
    return lerp(0, fr[1], u);
  }

  if (n >= 3 && p <= th2) {
    const span = th2 - th1;
    const u = span > 1e-9 ? (p - th1) / span : 1;
    return lerp(fr[1], fr[2], u);
  }

  const span = 1 - th2;
  const u = span > 1e-9 ? (p - th2) / span : 1;
  return lerp(fr[2], 1, u);
}

function isCardHit(
  index: number,
  thresholds: readonly number[],
  progress: number
) {
  const p = clamp01(progress);
  const t = thresholds[index] ?? 0;
  return p >= t;
}

function latestHitIndex(
  total: number,
  thresholds: readonly number[],
  progress: number
) {
  let last = -1;
  for (let i = 0; i < total; i++) {
    if (isCardHit(i, thresholds, progress)) last = i;
  }
  return last;
}

function measureDotFractions(
  rail: HTMLElement,
  dotElements: (HTMLElement | null | undefined)[]
): number[] {
  const railRect = rail.getBoundingClientRect();
  const h = railRect.height;
  if (h < 4) return defaultFractions(dotElements.length);

  return dotElements.map((el) => {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cy = r.top + r.height / 2;
    return clamp01((cy - railRect.top) / h);
  });
}

type Props = {
  scrollYProgress: MotionValue<number>;
};

export const Timeline = forwardRef<HTMLElement, Props>(function Timeline(
  { scrollYProgress },
  ref
) {
  const total = timeline.length;
  const thresholds = TIMELINE_ACTIVATION_SCROLL;

  const railRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dotFractions, setDotFractions] = useState<number[] | null>(null);

  const [sectionProgress, setSectionProgress] = useState(0);

  const fractions = useMemo(
    () => dotFractions ?? defaultFractions(total),
    [dotFractions, total]
  );

  const lineScale = useTransform(scrollYProgress, (p) =>
    lineScaleFromSectionProgress(p, thresholds, fractions)
  );

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const els = timeline.map((_, i) => dotRefs.current[i]);
    const next = measureDotFractions(rail, els);
    if (next.length === total && next.every((x) => Number.isFinite(x))) {
      setDotFractions((prev) => {
        if (
          prev &&
          prev.length === next.length &&
          prev.every((v, i) => Math.abs(v - next[i]) < 0.002)
        ) {
          return prev;
        }
        return next;
      });
    }
  }, [total]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(rail);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setSectionProgress(v);
  });

  useEffect(() => {
    setSectionProgress(scrollYProgress.get());
  }, [scrollYProgress]);

  const latestIdx = useMemo(
    () => latestHitIndex(total, thresholds, sectionProgress),
    [total, thresholds, sectionProgress]
  );

  const setDotRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      dotRefs.current[index] = el;
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-[220vh] px-6 py-28 sm:px-10"
      aria-labelledby="timeline-heading"
    >
      <div className="pointer-events-none sticky top-28 z-[5] mb-24 max-w-6xl sm:top-32">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
          Experience
        </p>
        <h2
          id="timeline-heading"
          className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
        >
          Scroll the timeline — the 3D scene follows. Details stay in the PDF.
        </h2>
      </div>

      <div
        className="relative mx-auto max-w-3xl pb-32 [--dot-col:2.25rem] sm:[--dot-col:2.5rem]"
        style={{ "--gap-x": GAP } as React.CSSProperties}
      >
        <div className="relative" ref={railRef}>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[var(--dot-col)]">
            <motion.div
              className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 bg-[var(--bg-tertiary)]"
              style={{ scaleY: lineScale }}
            />
          </div>

          <ul className="relative space-y-20 sm:space-y-28">
            {timeline.map((entry, i) => (
              <TimelineRow
                key={entry.id}
                entry={entry}
                dotRef={setDotRef(i)}
                isHit={isCardHit(i, thresholds, sectionProgress)}
                isLatestHit={total > 0 && i === latestIdx && latestIdx >= 0}
              />
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className="relative mt-24 border border-[var(--stroke)] bg-[var(--bg-secondary)]/40 p-8 backdrop-blur-sm sm:p-10"
          style={{
            marginLeft: "calc(var(--dot-col) + var(--gap-x))",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
            Education
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-lg text-[var(--text-primary)]">
            {education.school}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {education.degree}
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--text-dim)]">
            {education.years}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            {education.note}
          </p>
        </motion.div>
      </div>
    </section>
  );
});

function TimelineRow({
  entry,
  dotRef,
  isHit,
  isLatestHit,
}: {
  entry: TimelineEntry;
  dotRef: (el: HTMLDivElement | null) => void;
  isHit: boolean;
  isLatestHit: boolean;
}) {
  let dotClass: string;
  if (isHit) {
    dotClass =
      "border-violet-400 bg-violet-500/25 shadow-[0_0_22px_rgba(167,139,250,0.5)] ring-2 ring-violet-400/35";
  } else {
    dotClass = "border-[var(--stroke)] bg-[var(--bg-deep)] shadow-none";
  }

  return (
    <li
      className="relative flex gap-6 sm:gap-10"
      aria-current={isLatestHit ? "step" : undefined}
    >
      <div
        ref={dotRef}
        className="relative z-[1] flex shrink-0 items-center justify-center"
        style={{ width: "var(--dot-col)" }}
        aria-hidden
      >
        <motion.span
          className={`h-2.5 w-2.5 rounded-full border-2 ${dotClass}`}
          animate={{
            scale: isLatestHit ? 1.15 : isHit ? 1.08 : 1,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
        />
      </div>
      <article className="min-w-0 flex-1 pb-2">
        <p className="font-mono text-xs text-[var(--text-dim)]">
          {entry.from} — {entry.to}
        </p>
        <h3
          className={`mt-2 font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl ${
            isHit ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
          }`}
        >
          {entry.org}
        </h3>
        <p
          className={`mt-1 text-sm font-medium ${
            isHit ? "text-[var(--accent-hot)]" : "text-[var(--text-muted)]"
          }`}
        >
          {entry.role}
        </p>
        <p
          className={`mt-4 max-w-prose text-sm leading-relaxed ${
            isHit ? "text-[var(--text-muted)]" : "text-[var(--text-dim)]"
          }`}
        >
          {entry.focus}
        </p>
      </article>
    </li>
  );
}

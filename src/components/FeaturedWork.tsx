"use client";

import { site } from "@/lib/site";
import { easeInOutCubic, hostnameOf, lerp, parseHex } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * A Billion Dreams — featured narrative work. Immersive panel with a
 * canvas-rendered particle field that drifts between two abstract
 * silhouettes — a small homage to the project's central metaphor.
 */
export function FeaturedWork() {
  const featured = site.featured;

  return (
    <section
      className="relative overflow-hidden border-y border-[var(--stroke)]"
      aria-labelledby="featured-heading"
      style={{
        background:
          "linear-gradient(180deg, rgba(10,8,16,0.6) 0%, rgba(15,10,18,0.85) 50%, rgba(8,6,14,0.6) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 80% 30%, ${featured.accent}1f 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 12% 80%, rgba(0,180,255,0.06) 0%, transparent 65%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-28 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs uppercase tracking-[0.45em] text-[var(--text-muted)]"
          >
            <span style={{ color: featured.accent }}>●</span>{" "}
            {featured.eyebrow}
          </motion.p>

          <motion.h2
            id="featured-heading"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.2rem)] font-light leading-[1.02] tracking-tight text-[var(--text-primary)]"
          >
            {featured.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mt-4 max-w-md font-[family-name:var(--font-display)] text-lg italic text-[var(--text-muted)]"
          >
            {featured.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]"
          >
            {featured.description}
          </motion.p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {featured.notes.map((note, i) => (
              <motion.div
                key={note.label}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 }}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-4"
              >
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.35em]"
                  style={{ color: featured.accent }}
                >
                  {note.label}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--text-primary)]">
                  {note.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={featured.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono text-xs font-medium tracking-wide text-[var(--bg-deep)] transition-transform hover:-translate-y-0.5"
              style={{ background: featured.accent }}
            >
              View the experience
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]">
              {hostnameOf(featured.href)}
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap gap-1.5">
            {featured.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-deep)]/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-[var(--text-muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[420px] lg:min-h-[560px]">
          <FeaturedCanvas accent={featured.accent} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]"
          >
            <span>two lifetimes</span>
            <span>one portrait</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A particle field that gently morphs between two abstract silhouettes.
 * Reduced-motion: holds the second silhouette as a still constellation.
 */
function FeaturedCanvas({ accent }: { accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(280, rect.width);
      cssH = Math.max(420, rect.height);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    type P = {
      home: number;
      r: number;
      ax: number;
      ay: number;
      bx: number;
      by: number;
      jitter: number;
      seed: number;
      mix: number;
    };

    const N = 720;
    let particles: P[] = [];

    /** Two silhouette targets — abstract, deliberately non-figurative.
     * A: an upward arc (the rising swing). B: a poised constellation (the steady gaze). */
    const sampleA = (i: number): { x: number; y: number; mix: number } => {
      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      const t = (i / N) * Math.PI * 2;
      const r =
        Math.min(cssW, cssH) * 0.34 *
        (1 + 0.2 * Math.sin(t * 3) + 0.1 * Math.cos(t * 5));
      const x = cx + Math.cos(t) * r * 1.05;
      const y = cy + Math.sin(t) * r * 0.78 - cssH * 0.04;
      return { x, y, mix: (Math.cos(t) + 1) * 0.5 };
    };

    const sampleB = (i: number): { x: number; y: number; mix: number } => {
      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      /* Lissajous-driven figure — feels like a poised silhouette */
      const t = (i / N) * Math.PI * 2;
      const a = Math.min(cssW, cssH) * 0.36;
      const b = Math.min(cssW, cssH) * 0.24;
      const x = cx + Math.sin(3 * t + 0.4) * a;
      const y = cy + Math.sin(2 * t) * b - cssH * 0.05;
      return { x, y, mix: (Math.sin(3 * t) + 1) * 0.5 };
    };

    const seed = () => {
      particles = [];
      for (let i = 0; i < N; i++) {
        const a = sampleA(i);
        const b = sampleB(i);
        particles.push({
          home: (i / N) * Math.PI * 2,
          r: Math.min(cssW, cssH) * 0.3,
          ax: a.x,
          ay: a.y,
          bx: b.x,
          by: b.y,
          jitter: (Math.random() - 0.5) * 1.4,
          seed: Math.random() * Math.PI * 2,
          mix: (a.mix + b.mix) * 0.5,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();
    let raf = 0;
    let alive = true;
    const FRAME_MS = 1000 / 30;
    let lastDraw = 0;

    const accentRGB = parseHex(accent);
    const white = { r: 0, g: 255, b: 200 };

    const draw = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(draw);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      const elapsed = (now - t0) / 1000;

      ctx.clearRect(0, 0, cssW, cssH);

      /* Slow wash — one full A↔B cycle every ~14 seconds */
      let phase: number;
      if (reduced) {
        phase = 1; // hold on B
      } else {
        const cycle = (Math.sin(elapsed * 0.45) + 1) * 0.5;
        phase = easeInOutCubic(cycle);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const wob = reduced ? 0 : Math.sin(elapsed * 0.6 + p.seed) * 1.5;
        const drift = reduced ? 0 : Math.cos(elapsed * 0.4 + p.seed * 1.2) * 1.5;

        const x = lerp(p.ax, p.bx, phase) + p.jitter + wob;
        const y = lerp(p.ay, p.by, phase) + p.jitter * 0.8 + drift;

        /* Two-tone mix: white to accent */
        const m = p.mix * (0.5 + phase * 0.5);
        const r = Math.round(lerp(white.r, accentRGB.r, m));
        const g = Math.round(lerp(white.g, accentRGB.g, m));
        const b = Math.round(lerp(white.b, accentRGB.b, m));

        const alpha = 0.45 + 0.4 * Math.sin(elapsed * 0.5 + p.seed) * 0.3;
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.15, Math.min(0.85, alpha))})`;

        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [accent]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-deep)]/40">
      <canvas ref={ref} className="block h-full w-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)",
        }}
      />
    </div>
  );
}


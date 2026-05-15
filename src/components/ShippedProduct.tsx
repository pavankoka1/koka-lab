"use client";

import { site } from "@/lib/site";
import { easeInOutCubic, hostnameOf, lerp } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * PerfTrace — open-source product. Mirrored layout vs `FeaturedWork`
 * (canvas on the left, text on the right) so the two showcase sections
 * read as a deliberate diptych instead of a repeat.
 *
 * The visual is a tiny live performance recorder — three sparkline
 * tracks (FPS, CPU, Frame time) scrolling left, evoking the kind of
 * trace the tool itself produces.
 */
export function ShippedProduct() {
  const product = site.product;

  return (
    <section
      className="relative overflow-hidden border-y border-[var(--stroke)]"
      aria-labelledby="product-heading"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,6,14,0.6) 0%, rgba(13,10,20,0.85) 50%, rgba(10,8,16,0.6) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 18% 30%, ${product.accent}1f 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(34,211,238,0.10) 0%, transparent 65%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-28 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        {/* Canvas comes first in the source order; on lg it stays on the left,
            on mobile it falls below the text via order utilities. */}
        <div className="relative order-2 min-h-[420px] lg:order-1 lg:min-h-[560px]">
          <PerfTraceCanvas accent={product.accent} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]"
          >
            <span>self-hosted</span>
            <span>{product.platforms}</span>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs uppercase tracking-[0.45em] text-[var(--text-muted)]"
          >
            <span style={{ color: product.accent }}>●</span> {product.eyebrow}
          </motion.p>

          <motion.h2
            id="product-heading"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.2rem)] font-light leading-[1.02] tracking-tight text-[var(--text-primary)]"
          >
            {product.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mt-4 max-w-md font-[family-name:var(--font-display)] text-lg italic text-[var(--text-muted)]"
          >
            {product.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]"
          >
            {product.description}
          </motion.p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {product.capabilities.map((cap, i) => (
              <motion.li
                key={cap.label}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 }}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-4"
              >
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.35em]"
                  style={{ color: product.accent }}
                >
                  {cap.label}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--text-primary)]">
                  {cap.value}
                </p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono text-xs font-medium tracking-wide text-[var(--bg-deep)] transition-transform hover:-translate-y-0.5"
              style={{ background: product.accent }}
            >
              Try the demo
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]">
              {hostnameOf(product.href)}
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap gap-1.5">
            {product.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-deep)]/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-[var(--text-muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PerfTraceCanvas — particle field that gently morphs between two abstract
// silhouettes (waveform ↔ ring). Same animation pattern as `FeaturedCanvas`,
// just with shapes + palette tuned for "performance instrument".
// ---------------------------------------------------------------------------

function PerfTraceCanvas({ accent }: { accent: string }) {
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

    /** Two abstract silhouette targets — both feel "instrument-like".
     * A: a wide horizontal trace (suggests an FPS waveform).
     * B: a circular gauge ring. */
    const sampleA = (i: number): { x: number; y: number; mix: number } => {
      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      const t = (i / N) * Math.PI * 2;
      const x = cx + Math.cos(t) * cssW * 0.42;
      const y =
        cy +
        Math.sin(t * 3.2 + 0.3) * cssH * 0.18 +
        Math.sin(t * 1.1) * cssH * 0.04;
      return { x, y, mix: (Math.cos(t) + 1) * 0.5 };
    };

    const sampleB = (i: number): { x: number; y: number; mix: number } => {
      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      const t = (i / N) * Math.PI * 2;
      const r =
        Math.min(cssW, cssH) * 0.34 *
        (1 + 0.05 * Math.sin(t * 6) + 0.04 * Math.cos(t * 4));
      const x = cx + Math.cos(t) * r;
      const y = cy + Math.sin(t) * r * 0.92;
      return { x, y, mix: (Math.sin(t) + 1) * 0.5 };
    };

    const seed = () => {
      particles = [];
      for (let i = 0; i < N; i++) {
        const a = sampleA(i);
        const b = sampleB(i);
        particles.push({
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

    const teal = { r: 0, g: 255, b: 200 };
    const blue = { r: 0, g: 180, b: 255 };

    const FRAME_MS = 1000 / 30;
    let lastDraw = 0;

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

        /* Ocean teal→blue particle blend */
        const m = p.mix * (0.5 + phase * 0.5);
        const r = Math.round(lerp(teal.r, blue.r, m));
        const g = Math.round(lerp(teal.g, blue.g, m));
        const b = Math.round(lerp(teal.b, blue.b, m));

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


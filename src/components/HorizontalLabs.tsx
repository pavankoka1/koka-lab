"use client";

import { site, type Lab } from "@/lib/site";
import { hostnameOf } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function HorizontalLabs() {
  return (
    <section
      className="relative border-y border-[var(--stroke)] bg-[var(--bg-elevated)]/50 py-28 backdrop-blur-sm"
      aria-labelledby="labs-heading"
    >
      <div className="mx-auto mb-14 max-w-6xl px-6 sm:px-10">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
              Engineering studies
            </p>
            <h2
              id="labs-heading"
              className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[44px] sm:leading-[1.05]"
            >
              Focused experiments on the parts of the frontend users feel.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
              Each lab is a small, opinionated write-up paired with a live
              experiment — render performance, real-time correctness, and the
              architectural choices that decide whether an interface holds up
              under load.
            </p>
          </div>
          <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--text-dim)] sm:block">
            {String(site.labs.length).padStart(2, "0")} studies
          </p>
        </div>
      </div>

      <div
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 pt-2 sm:gap-8 sm:px-10"
        style={{ scrollbarGutter: "stable" }}
      >
        {site.labs.map((lab, i) => (
          <LabCard key={lab.slug} lab={lab} index={i} />
        ))}
        <div className="shrink-0 pr-2 sm:pr-6" aria-hidden />
      </div>
    </section>
  );
}

function LabCard({ lab, index }: { lab: Lab; index: number }) {
  return (
    <motion.a
      href={lab.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.05,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex min-h-[440px] w-[min(380px,86vw)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/80 p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-white/10"
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.025), 0 0 80px -36px ${lab.accent}33`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
        style={{ background: lab.accent }}
      />

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--text-dim)]">
          {String(index + 1).padStart(2, "0")} · {lab.category}
        </span>
        <CardSignature index={index} accent={lab.accent} />
      </div>

      <h3 className="relative mt-7 font-[family-name:var(--font-display)] text-[22px] font-semibold leading-[1.18] text-[var(--text-primary)]">
        {lab.title}
      </h3>
      <p className="relative mt-4 text-[14px] leading-relaxed text-[var(--text-muted)]">
        {lab.subtitle}
      </p>

      <div className="relative mt-6 flex flex-wrap gap-1.5">
        {lab.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-deep)]/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-[var(--text-muted)]"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="relative mt-auto pt-7">
        <div
          className="flex items-center gap-3 border-t pt-5"
          style={{ borderColor: `${lab.accent}22` }}
        >
          <span
            className="font-mono text-[9px] uppercase tracking-[0.4em]"
            style={{ color: lab.accent }}
          >
            Result
          </span>
          <span className="h-px flex-1" style={{ background: `${lab.accent}22` }} />
        </div>
        <p className="mt-3 text-[13px] leading-snug text-[var(--text-primary)]">
          {lab.metric}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 font-mono text-xs font-medium"
            style={{ color: lab.accent }}
          >
            Open lab
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--text-dim)]">
            {hostnameOf(lab.href)}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

/**
 * Per-card canvas glyph — a tiny, deterministic visual signature so each lab
 * card carries a distinct mark. Cheap, GPU-light, draws once on mount.
 */
function CardSignature({ index, accent }: { index: number; accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = 56;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = css * dpr;
    canvas.height = css * dpr;
    canvas.style.width = `${css}px`;
    canvas.style.height = `${css}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, css, css);

    const c = css / 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    /* Stroke ring — uniform across all cards */
    ctx.beginPath();
    ctx.arc(c, c, 22, 0, Math.PI * 2);
    ctx.strokeStyle = `${accent}40`;
    ctx.lineWidth = 1;
    ctx.stroke();

    /* Per-card glyph — one of seven distinct marks */
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 1.4;

    switch (index % 7) {
      case 0: {
        /* Concentric arcs — render architecture */
        for (let r = 6; r <= 18; r += 4) {
          ctx.beginPath();
          ctx.arc(c, c, r, -Math.PI * 0.85, Math.PI * 0.15);
          ctx.stroke();
        }
        break;
      }
      case 1: {
        /* Sine — frame loop */
        ctx.beginPath();
        for (let x = -16; x <= 16; x += 1) {
          const y = Math.sin((x / 16) * Math.PI * 1.4) * 8;
          if (x === -16) ctx.moveTo(c + x, c + y);
          else ctx.lineTo(c + x, c + y);
        }
        ctx.stroke();
        break;
      }
      case 2: {
        /* Two divergent lines — main vs worker */
        ctx.beginPath();
        ctx.moveTo(c - 14, c - 6);
        ctx.lineTo(c + 14, c - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c - 14, c + 6);
        ctx.lineTo(c + 4, c + 6);
        ctx.lineTo(c + 14, c - 1);
        ctx.stroke();
        break;
      }
      case 3: {
        /* Tree — render ownership */
        ctx.beginPath();
        ctx.moveTo(c, c - 12);
        ctx.lineTo(c, c + 12);
        ctx.moveTo(c, c - 4);
        ctx.lineTo(c - 12, c + 8);
        ctx.moveTo(c, c - 4);
        ctx.lineTo(c + 12, c + 8);
        ctx.stroke();
        for (const [px, py] of [
          [c, c - 12],
          [c - 12, c + 8],
          [c + 12, c + 8],
        ] as const) {
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 4: {
        /* Nested squares — composition */
        for (let s = 6; s <= 16; s += 5) {
          ctx.strokeRect(c - s, c - s, s * 2, s * 2);
        }
        break;
      }
      case 5: {
        /* Gantt-like read/write bars — layout thrash */
        for (let i = 0; i < 4; i++) {
          const y = c - 9 + i * 6;
          const x = c - 14 + (i % 2) * 4;
          const w = 18 - i * 3;
          ctx.fillRect(x, y, w, 2);
        }
        break;
      }
      case 6: {
        /* Bars climbing — GPU vs CPU */
        for (let i = 0; i < 4; i++) {
          const h = 4 + i * 4;
          const x = c - 12 + i * 7;
          ctx.fillRect(x, c + 10 - h, 4, h);
        }
        break;
      }
    }
  }, [accent, index]);

  return (
    <canvas
      ref={ref}
      width={56}
      height={56}
      aria-hidden
      className="rounded-full border border-[var(--stroke)] bg-[var(--bg-deep)]/50"
    />
  );
}

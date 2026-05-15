"use client";

import { easeInOutCubic, lerp } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * Particle field morphing between a waveform trace and a gauge ring.
 * Shapes and palette tuned to evoke "performance instrument".
 * Reduced-motion: holds the ring silhouette as a still constellation.
 */
export function PerfTraceCanvas({ accent: _accent }: { accent: string }) {
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

      let phase: number;
      if (reduced) {
        phase = 1;
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
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-deep)]/40">
      <canvas ref={ref} className="block h-full w-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)" }}
      />
    </div>
  );
}

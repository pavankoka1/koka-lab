"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Top-right "instrument" — a Lissajous phase portrait wrapped in an
 * orbital scroll-progress ring. Tied to scroll + pointer + time.
 *
 * Performance:
 *   - CSS variables are read ONCE at mount, not on every frame.
 *   - Throttled to ~30 FPS — looks identical, halves rAF body cost.
 *   - rAF is parked when the tab is hidden (`visibilitychange`).
 */
export function SiteBeacon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  useEffect(() => {
    scrollRef.current = scrollYProgress.get();
  }, [scrollYProgress]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current = {
        x: e.clientX / Math.max(1, window.innerWidth),
        y: e.clientY / Math.max(1, window.innerHeight),
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const css = 88;

    // Deep Ocean — azure + bioluminescent teal.
    const accent = "rgba(0,255,200,0.75)";
    const stroke = "rgba(0,180,255,0.09)";
    const gradStart = "rgba(0,180,255,0.65)";
    const gradMid = "rgba(0,255,200,0.45)";
    const gradEnd = "rgba(0,255,200,0.05)";

    let alive = true;
    let raf = 0;
    let docHidden = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = css * dpr;
      canvas.height = css * dpr;
      canvas.style.width = `${css}px`;
      canvas.style.height = `${css}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      docHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const t0 = performance.now();
    const FRAME_MS = 1000 / 30;
    let lastDraw = 0;

    const drawFrame = (now: number) => {
      const t = (now - t0) / 1000;
      const cx = css / 2;
      const cy = css / 2;
      const scroll = scrollRef.current;
      const { x: px, y: py } = pointerRef.current;

      ctx.clearRect(0, 0, css, css);

      /* Outer orbit — scroll progress */
      const rOuter = 38;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        rOuter,
        -Math.PI / 2,
        -Math.PI / 2 + scroll * Math.PI * 2,
      );
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* Lissajous trace — irrational ratio avoids closed loop repeat */
      const phase = scroll * Math.PI * 3 + t * 0.35;
      const wobble = (px - 0.5) * 0.4;
      const a = 22 + wobble * 6;
      const b = 18 - (py - 0.5) * 4;
      const n = 100;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const u = (i / n) * Math.PI * 2;
        const x = cx + a * Math.sin(3 * u + phase) * Math.cos(0.02 * t);
        const y = cy + b * Math.sin(2 * u + phase * 0.7 + t * 0.15);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const g = ctx.createLinearGradient(cx - a, cy - b, cx + a, cy + b);
      g.addColorStop(0, gradStart);
      g.addColorStop(0.5, gradMid);
      g.addColorStop(1, gradEnd);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.25;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      /* Core — breathing dot */
      const pulse = 0.85 + Math.sin(t * 2.2) * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    };

    const tick = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      if (docHidden) return;
      // Throttle: skip frames until at least FRAME_MS has elapsed.
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      drawFrame(now);
    };

    // Seed an initial paint so the beacon is present even before throttling.
    drawFrame(performance.now());
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="fixed right-5 top-5 z-[60] sm:right-8 sm:top-8" aria-hidden>
      <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/85 p-2.5 shadow-[0_0_48px_var(--glow)] backdrop-blur-md">
        <canvas ref={canvasRef} width={88} height={88} />
      </div>
      <p className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.35em] text-[var(--text-dim)]">
        phase
      </p>
    </div>
  );
}

"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Fixed “instrument” — Lissajous phase portrait + orbital scroll ring.
 * Distinct from cursor-following eyes; ties to page scroll and time.
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = 88;
    let animId = 0;
    const t0 = performance.now();

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

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const cx = css / 2;
      const cy = css / 2;
      const scroll = scrollRef.current;
      const { x: px, y: py } = pointerRef.current;

      ctx.clearRect(0, 0, css, css);

      const root = document.documentElement;
      const accent =
        getComputedStyle(root).getPropertyValue("--accent").trim() || "#a78bfa";
      const dim =
        getComputedStyle(root).getPropertyValue("--text-dim").trim() ||
        "#3a3a48";
      const stroke =
        getComputedStyle(root).getPropertyValue("--stroke").trim() ||
        "rgba(167,139,250,0.12)";

      /* Outer orbit — scroll progress */
      const rOuter = 38;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        rOuter,
        -Math.PI / 2,
        -Math.PI / 2 + scroll * Math.PI * 2
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
      const n = 140;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const u = (i / n) * Math.PI * 2;
        const x = cx + a * Math.sin(3 * u + phase) * Math.cos(0.02 * t);
        const y = cy + b * Math.sin(2 * u + phase * 0.7 + t * 0.15);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const g = ctx.createLinearGradient(cx - a, cy - b, cx + a, cy + b);
      g.addColorStop(0, `${accent}cc`);
      g.addColorStop(0.5, "rgba(196,181,253,0.55)");
      g.addColorStop(1, `${dim}99`);
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
      draw(now);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
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

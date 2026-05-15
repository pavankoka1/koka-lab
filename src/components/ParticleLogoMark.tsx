"use client";

import { site } from "@/lib/site";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Roles cycled in the subtitle below the wordmark — soft fade, one swap
 * every ~3.2 seconds. Cheap to render: a single state update per swap,
 * Framer Motion handles the cross-fade. Browsers throttle setInterval
 * to 1 Hz on hidden tabs, so no explicit visibility pause is needed.
 */
const ROLES = [
  "Frontend · SDE III",
  "Real-time · WebGL",
  "Render performance",
  "Six years shipping",
] as const;

const ROLE_INTERVAL_MS = 3200;

export function ParticleLogoMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIdx((i) => (i + 1) % ROLES.length);
    }, ROLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    const SIZE = 52;
    const TAU = Math.PI * 2;

    // K geometry inside a SIZE × SIZE box.
    const SPINE_X = SIZE * 0.34;
    const TOP_Y = SIZE * 0.20;
    const BOT_Y = SIZE * 0.80;
    const MID_Y = SIZE * 0.50;
    const ARM_X = SIZE * 0.72;

    // Monochrome — white opacity hierarchy, no accent reads needed.
    const ar = 255;
    const ag = 255;
    const ab = 255;
    const baseStroke = "rgba(255,255,255,0.22)";
    const innerRingStroke = "rgba(255,255,255,0.06)";
    const stroke = "rgba(255,255,255,0.06)";

    let alive = true;
    let raf = 0;
    let docHidden = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
      canvas.style.width = `${SIZE}px`;
      canvas.style.height = `${SIZE}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      docHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    /** Draw the K's three strokes with the supplied style. */
    const drawK = (style: string | CanvasGradient) => {
      ctx.strokeStyle = style;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(SPINE_X, TOP_Y);
      ctx.lineTo(SPINE_X, BOT_Y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(SPINE_X, MID_Y);
      ctx.lineTo(ARM_X, TOP_Y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(SPINE_X, MID_Y);
      ctx.lineTo(ARM_X, BOT_Y);
      ctx.stroke();
    };

    // ---- Throttled draw loop (~30 FPS) ------------------------------------
    const t0 = performance.now();
    const FRAME_MS = 1000 / 30;
    let lastDraw = 0;

    const drawFrame = (now: number) => {
      const t = (now - t0) / 1000;
      const c = SIZE / 2;

      ctx.clearRect(0, 0, SIZE, SIZE);

      /* Outer hairline ring — static, very subtle */
      ctx.beginPath();
      ctx.arc(c, c, c - 2, 0, TAU);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* Inner softer ring, dashed — adds technical texture */
      ctx.beginPath();
      ctx.arc(c, c, c - 6, 0, TAU);
      ctx.strokeStyle = innerRingStroke;
      ctx.setLineDash([1.4, 3.2]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      /* Base K — drawn dim so the strokes are always present */
      drawK(baseStroke);

      /* Scan band — vertical gradient that travels the canvas */
      const SCAN_PERIOD = 4.5;
      const cycle = reduced ? 0.5 : (t / SCAN_PERIOD) % 1;
      const scanY = -10 + cycle * (SIZE + 20);
      const BAND_HALF = 11;

      const grad = ctx.createLinearGradient(
        0,
        scanY - BAND_HALF,
        0,
        scanY + BAND_HALF,
      );
      grad.addColorStop(0, `rgba(${ar},${ag},${ab},0)`);
      grad.addColorStop(0.45, `rgba(${ar},${ag},${ab},0.55)`);
      grad.addColorStop(0.5, `rgba(${ar},${ag},${ab},1)`);
      grad.addColorStop(0.55, `rgba(${ar},${ag},${ab},0.55)`);
      grad.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);

      drawK(grad);

      /* Vertex pulse at the K's elbow — brightens when the scan passes through */
      const distFromScan = Math.abs(MID_Y - scanY);
      const proximity = Math.max(0, 1 - distFromScan / 14);
      const pulseR = 1.5 + proximity * 1.8;
      const pulseA = 0.35 + proximity * 0.55;

      ctx.beginPath();
      ctx.arc(SPINE_X, MID_Y, pulseR, 0, TAU);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${pulseA})`;
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

    // Seed an initial paint so the mark is present even before throttling.
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
    <div className="fixed left-5 top-5 z-[60] sm:left-8 sm:top-8" aria-hidden>
      <div className="flex items-center gap-3 rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/70 py-2 pl-2 pr-3.5 shadow-[0_0_30px_rgba(255,255,255,0.04)] backdrop-blur-md">
        <canvas ref={canvasRef} width={52} height={52} className="block" />
        <div className="min-w-[160px]">
          <p className="font-[family-name:var(--font-display)] text-[13px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
            <span className="bg-gradient-to-r from-[var(--text-primary)] via-white/60 to-[var(--text-primary)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:shimmerSlide_6s_linear_infinite]">
              {site.author}
            </span>
          </p>
          <div className="relative mt-1.5 h-[10px] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ROLES[roleIdx]}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 font-mono text-[9px] uppercase leading-none tracking-[0.32em] text-[var(--text-muted)]"
              >
                {ROLES[roleIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}


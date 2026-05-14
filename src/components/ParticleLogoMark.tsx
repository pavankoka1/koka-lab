"use client";

import { site } from "@/lib/site";
import { useEffect, useRef } from "react";

/**
 * Top-left identity tile.
 *
 * The mark is a clean K monogram. A vertical scan band travels top→bottom
 * on a slow loop, briefly brightening each part of the K it crosses.
 *
 * Performance:
 *   - CSS variables are read once at mount, not on every frame.
 *   - Throttled to ~30 FPS — the scan band reads identical at 30 vs 60 fps,
 *     and halving the rAF rate halves the CPU cost of the loop.
 *   - rAF is parked when the tab is hidden (`visibilitychange`).
 *   - `prefers-reduced-motion` parks the scan at the centre of the K.
 */
export function ParticleLogoMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // ---- CSS variables: read ONCE at mount ---------------------------------
    const root = document.documentElement;
    const accent =
      getComputedStyle(root).getPropertyValue("--accent").trim() || "#a78bfa";
    const stroke =
      getComputedStyle(root).getPropertyValue("--stroke").trim() ||
      "rgba(167,139,250,0.12)";
    const accentRGB = parseHex(accent);
    const ar = accentRGB.r;
    const ag = accentRGB.g;
    const ab = accentRGB.b;

    // Pre-build the static rgba strings we need every frame.
    const baseStroke = `rgba(${ar},${ag},${ab},0.32)`;
    const innerRingStroke = `rgba(${ar},${ag},${ab},0.10)`;

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
      <div className="flex items-center gap-3 rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/70 py-2 pl-2 pr-3.5 shadow-[0_0_30px_rgba(139,92,246,0.12)] backdrop-blur-md">
        <canvas ref={canvasRef} width={52} height={52} className="block" />
        <div>
          <p className="font-[family-name:var(--font-display)] text-[13px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
            {site.author}
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.32em] text-[var(--text-dim)]">
            Frontend · SDE III
          </p>
        </div>
      </div>
    </div>
  );
}

function parseHex(hex: string) {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(v.slice(0, 2), 16) || 167,
    g: parseInt(v.slice(2, 4), 16) || 139,
    b: parseInt(v.slice(4, 6), 16) || 250,
  };
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const WITTY_MESSAGES = [
  "Be careful — I'm watching your every move.",
  "I see everything. Always have.",
  "Nothing escapes these eyes. Nothing.",
  "You've been spotted. Proceed accordingly.",
  "Caught you looking. I was looking too.",
];

export function MouseEyes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const normalizedX = (e.clientX / w - 0.5) * 2;
    const normalizedY = (e.clientY / h - 0.5) * 2;
    targetRef.current = {
      x: Math.max(-1, Math.min(1, normalizedX)) * 6,
      y: Math.max(-1, Math.min(1, normalizedY)) * 6,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 64;
    const height = 48;
    canvas.width = size * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let raf = 0;

    const draw = () => {
      mouseRef.current.x = lerp(mouseRef.current.x, targetRef.current.x, 0.15);
      mouseRef.current.y = lerp(mouseRef.current.y, targetRef.current.y, 0.15);
      const px = mouseRef.current.x;
      const py = mouseRef.current.y;

      ctx.clearRect(0, 0, size, height);
      const eyeY = height / 2;
      const eyeSpacing = size / 4;
      const leftEyeX = size / 2 - eyeSpacing;
      const rightEyeX = size / 2 + eyeSpacing;
      const pupilRadius = 4;
      const socketRx = 14;
      const socketRy = 8;

      const root = document.documentElement;
      const bg =
        getComputedStyle(root).getPropertyValue("--bg-secondary").trim() ||
        "#12121a";
      const tertiary =
        getComputedStyle(root).getPropertyValue("--bg-tertiary").trim() ||
        "#1e1e2a";
      const primary =
        getComputedStyle(root).getPropertyValue("--text-primary").trim() ||
        "#f4f4f8";

      ctx.fillStyle = bg;
      ctx.strokeStyle = tertiary;
      ctx.lineWidth = 1;

      [leftEyeX, rightEyeX].forEach((cx) => {
        ctx.beginPath();
        ctx.ellipse(cx, eyeY, socketRx, socketRy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.fillStyle = primary;
      [leftEyeX, rightEyeX].forEach((cx) => {
        const px1 = cx + px;
        const py1 = eyeY + py;
        ctx.beginPath();
        ctx.ellipse(
          px1,
          py1,
          pupilRadius * 0.75,
          pupilRadius,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      [leftEyeX, rightEyeX].forEach((cx) => {
        const px1 = cx + px + 1;
        const py1 = eyeY + py - 1;
        ctx.beginPath();
        ctx.ellipse(px1, py1, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClick = useCallback(() => {
    const msg = WITTY_MESSAGES[messageIndex % WITTY_MESSAGES.length];
    setMessage(msg);
    setMessageIndex((i) => i + 1);
    setTimeout(() => setMessage(null), 3200);
  }, [messageIndex]);

  return (
    <>
      <motion.div
        className="fixed right-5 top-5 z-[60] cursor-pointer sm:right-8 sm:top-8"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Click for a surprise"
      >
        <div className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/90 p-2 shadow-[0_0_40px_var(--glow)] backdrop-blur-md transition-shadow hover:shadow-[0_0_56px_var(--glow)]">
          <canvas ref={canvasRef} width={64} height={48} />
        </div>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed right-5 top-24 z-[60] max-w-[min(280px,90vw)] rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)]/95 px-4 py-3 shadow-xl backdrop-blur-md sm:right-8"
          >
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

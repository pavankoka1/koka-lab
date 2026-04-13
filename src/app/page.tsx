"use client";

import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { HorizontalLabs } from "@/components/HorizontalLabs";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScrollWordReveal } from "@/components/ScrollWordReveal";
import { SiteBeacon } from "@/components/SiteBeacon";
import { Timeline } from "@/components/Timeline";
import { useDocumentScroll } from "@/hooks/useDocumentScroll";
import { site } from "@/lib/site";
import { motion, useScroll } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const Experience = dynamic(
  () => import("@/components/canvas/Experience").then((m) => m.Experience),
  { ssr: false }
);

const MIN_LOADER_MS = 1800;

export default function Home() {
  const scrollT = useDocumentScroll();
  const timelineRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.92", "end 0.08"],
  });

  const [loadProgress, setLoadProgress] = useState(0);
  const [assetsIdle, setAssetsIdle] = useState(false);
  const [minTimeOk, setMinTimeOk] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeOk(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (assetsIdle && minTimeOk) {
      const t = setTimeout(() => setShowLoader(false), 380);
      return () => clearTimeout(t);
    }
  }, [assetsIdle, minTimeOk]);

  const onAssetProgress = useCallback((progress: number, active: boolean) => {
    setLoadProgress(progress);
    if (!active) setAssetsIdle(true);
  }, []);

  return (
    <>
      <LoadingOverlay visible={showLoader} progress={loadProgress} />
      <AmbientBackdrop />
      <Experience scrollT={scrollT} onAssetProgress={onAssetProgress} />

      <SiteBeacon />
      <div className="grain" aria-hidden />

      <main className="relative z-10">
        <section className="relative flex min-h-[100svh] flex-col justify-end px-6 pb-24 pt-32 sm:px-10 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.45em] text-[var(--text-muted)]">
              {site.author} · portfolio
            </p>
            <h1 className="mt-6 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(2.5rem,7.5vw,5rem)] font-semibold leading-[0.95] tracking-tight text-[var(--text-primary)]">
              Frontend at speed — WebGL when it counts.
            </h1>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
              {site.summary}
            </p>
            <div className="mt-12 flex flex-wrap gap-4 font-mono text-xs">
              <a
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-primary)] transition-colors hover:border-violet-500/40 hover:text-[var(--accent-hot)]"
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-primary)] transition-colors hover:border-violet-500/40 hover:text-[var(--accent-hot)]"
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-muted)] transition-colors hover:border-violet-500/40"
                href={`mailto:${site.email}`}
              >
                Email
              </a>
            </div>
          </motion.div>
        </section>

        <Timeline ref={timelineRef} scrollYProgress={scrollYProgress} />

        <section className="px-6 py-28 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
              How I build
            </p>
            <ScrollWordReveal
              className="mt-10 text-2xl leading-snug sm:text-3xl sm:leading-tight"
              text="Respect the main thread: batch layout reads and writes, keep motion on the compositor when you can, and treat React renders as a budget — not free. The labs below are where those ideas become something you can click and feel."
            />
          </div>
        </section>

        <HorizontalLabs />

        <footer className="border-t border-[var(--stroke)] px-6 py-20 sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)]">
                {site.shortTitle}
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
                {site.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 font-mono text-xs text-[var(--text-muted)]">
              <a
                className="hover:text-[var(--text-primary)]"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
              <span className="text-[var(--text-dim)]">{site.phone}</span>
              <a
                className="hover:text-[var(--text-primary)]"
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="hover:text-[var(--text-primary)]"
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
            <p className="font-mono text-xs text-[var(--text-dim)] sm:text-right">
              © {new Date().getFullYear()} {site.author}
              <br />
              Next.js · Three.js · R3F
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

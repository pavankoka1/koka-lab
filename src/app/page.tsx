"use client";

import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { CyclingHeadline } from "@/components/CyclingHeadline";
import { FeaturedWork } from "@/components/FeaturedWork";
import { HorizontalLabs } from "@/components/HorizontalLabs";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ParticleLogoMark } from "@/components/ParticleLogoMark";
import { ScrollWordReveal } from "@/components/ScrollWordReveal";
import { ShippedProduct } from "@/components/ShippedProduct";
import { SiteBeacon } from "@/components/SiteBeacon";
import { Timeline } from "@/components/Timeline";
import { useDocumentScroll } from "@/hooks/useDocumentScroll";
import { site } from "@/lib/site";
import { motion, useScroll } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const Experience = dynamic(
  () => import("@/components/canvas/Experience").then((m) => m.Experience),
  { ssr: false },
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

      <ParticleLogoMark />
      <SiteBeacon />
      <div className="grain" aria-hidden />

      <main className="relative z-10">
        <section className="relative flex min-h-[100svh] flex-col justify-end px-6 pb-24 pt-44 sm:px-10 sm:pb-32 sm:pt-48">
          <motion.div
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.45em] text-[var(--text-muted)]">
              {site.author} · senior frontend engineer · sde iii
            </p>
            <h1 className="mt-6 max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(2.6rem,7.4vw,5rem)] font-light leading-[0.96] tracking-tight text-[var(--text-primary)]">
              <span
                className="relative block"
                style={{ minHeight: "1.95em" }}
              >
                <CyclingHeadline />
              </span>
            </h1>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
              {site.summary}
            </p>
            <ul className="mt-8 flex max-w-3xl flex-wrap gap-2 text-xs text-[var(--text-muted)] sm:text-sm">
              {site.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-3 py-1.5"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-wrap gap-4 font-mono text-xs">
              <a
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-primary)] transition-colors hover:border-[var(--accent-blue)]/30 hover:text-[var(--accent-cyan)]"
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-primary)] transition-colors hover:border-[var(--accent-blue)]/30 hover:text-[var(--accent-cyan)]"
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-muted)] transition-colors hover:border-[var(--accent-blue)]/30"
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
              Core stack
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                  Frontend
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-primary)]">
                  {site.stack.frontend.join(" · ")}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                  Realtime & graphics
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-primary)]">
                  {site.stack.realtimeAndGraphics.join(" · ")}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--text-dim)]">
                  Platform
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-primary)]">
                  {site.stack.platform.join(" · ")}
                </p>
              </div>
            </div>
            <p className="mt-14 font-mono text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
              How I build
            </p>
            <ScrollWordReveal
              className="mt-8 text-2xl leading-snug sm:text-3xl sm:leading-tight"
              text="Protect frame budget. Reduce rendering overhead. Treat real-time correctness as a contract, not a side-effect. The work below is the same craft applied to deliberately small, focused problems — each one a measurable answer to a question worth asking."
            />
          </div>
        </section>

        <FeaturedWork />

        <ShippedProduct />

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

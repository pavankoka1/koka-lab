"use client";

import { site } from "@/lib/site";
import { motion } from "framer-motion";

export function HorizontalLabs() {
  return (
    <section
      className="relative border-y border-[var(--stroke)] bg-[var(--bg-elevated)]/40 py-24 backdrop-blur-sm"
      aria-labelledby="labs-heading"
    >
      <div className="mx-auto mb-12 max-w-6xl px-6 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">
          Interactive labs
        </p>
        <h2
          id="labs-heading"
          className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
        >
          Scroll sideways. Open a lab. Break things on purpose.
        </h2>
      </div>

      <div
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 pt-2 sm:gap-8 sm:px-10"
        style={{ scrollbarGutter: "stable" }}
      >
        {site.labs.map((lab, i) => (
          <motion.a
            key={lab.slug}
            href={lab.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.06,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative min-h-[280px] w-[min(340px,85vw)] shrink-0 snap-center overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/80 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_-24px_rgba(139,92,246,0.35)]"
            style={{
              boxShadow: `0 0 80px -20px ${lab.accent}22`,
            }}
          >
            <span
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-50"
              style={{ background: lab.accent }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-[var(--text-primary)]">
              {lab.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              {lab.subtitle}
            </p>
            <span
              className="mt-10 inline-flex items-center gap-2 font-mono text-xs font-medium"
              style={{ color: lab.accent }}
            >
              Launch
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

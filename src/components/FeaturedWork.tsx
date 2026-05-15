"use client";

import { FeaturedCanvas } from "@/components/canvas/FeaturedCanvas";
import { site } from "@/lib/site";
import { hostnameOf } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * A Billion Dreams — featured narrative work. Immersive panel with a
 * canvas-rendered particle field that drifts between two abstract
 * silhouettes — a small homage to the project's central metaphor.
 */
export function FeaturedWork() {
  const featured = site.featured;

  return (
    <section
      className="relative overflow-hidden border-y border-[var(--stroke)]"
      aria-labelledby="featured-heading"
      style={{
        background:
          "linear-gradient(180deg, rgba(10,8,16,0.6) 0%, rgba(15,10,18,0.85) 50%, rgba(8,6,14,0.6) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 80% 30%, ${featured.accent}1f 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 12% 80%, rgba(0,180,255,0.06) 0%, transparent 65%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-28 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs uppercase tracking-[0.45em] text-[var(--text-muted)]"
          >
            <span style={{ color: featured.accent }}>●</span>{" "}
            {featured.eyebrow}
          </motion.p>

          <motion.h2
            id="featured-heading"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.2rem)] font-light leading-[1.02] tracking-tight text-[var(--text-primary)]"
          >
            {featured.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mt-4 max-w-md font-[family-name:var(--font-display)] text-lg italic text-[var(--text-muted)]"
          >
            {featured.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]"
          >
            {featured.description}
          </motion.p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {featured.notes.map((note, i) => (
              <motion.div
                key={note.label}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 }}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-4"
              >
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.35em]"
                  style={{ color: featured.accent }}
                >
                  {note.label}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--text-primary)]">
                  {note.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={featured.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono text-xs font-medium tracking-wide text-[var(--bg-deep)] transition-transform hover:-translate-y-0.5"
              style={{ background: featured.accent }}
            >
              View the experience
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]">
              {hostnameOf(featured.href)}
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap gap-1.5">
            {featured.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-deep)]/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-[var(--text-muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          className="relative min-h-[420px] lg:min-h-[560px]"
          initial={{ opacity: 0, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <FeaturedCanvas accent={featured.accent} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]"
          >
            <span>two lifetimes</span>
            <span>one portrait</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


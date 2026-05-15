"use client";

import { PerfTraceCanvas } from "@/components/canvas/PerfTraceCanvas";
import { site } from "@/lib/site";
import { hostnameOf } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * PerfTrace — open-source product. Mirrored layout vs `FeaturedWork`
 * (canvas on the left, text on the right) so the two showcase sections
 * read as a deliberate diptych instead of a repeat.
 *
 * The visual is a tiny live performance recorder — three sparkline
 * tracks (FPS, CPU, Frame time) scrolling left, evoking the kind of
 * trace the tool itself produces.
 */
export function ShippedProduct() {
  const product = site.product;

  return (
    <section
      className="relative overflow-hidden border-y border-[var(--stroke)]"
      aria-labelledby="product-heading"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,6,14,0.6) 0%, rgba(13,10,20,0.85) 50%, rgba(10,8,16,0.6) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 18% 30%, ${product.accent}1f 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(34,211,238,0.10) 0%, transparent 65%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-28 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        {/* Canvas comes first in the source order; on lg it stays on the left,
            on mobile it falls below the text via order utilities. */}
        <motion.div
          className="relative order-2 min-h-[420px] lg:order-1 lg:min-h-[560px]"
          initial={{ opacity: 0, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <PerfTraceCanvas accent={product.accent} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]"
          >
            <span>self-hosted</span>
            <span>{product.platforms}</span>
          </div>
        </motion.div>

        <div className="relative order-1 lg:order-2">
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs uppercase tracking-[0.45em] text-[var(--text-muted)]"
          >
            <span style={{ color: product.accent }}>●</span> {product.eyebrow}
          </motion.p>

          <motion.h2
            id="product-heading"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.2rem)] font-light leading-[1.02] tracking-tight text-[var(--text-primary)]"
          >
            {product.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mt-4 max-w-md font-[family-name:var(--font-display)] text-lg italic text-[var(--text-muted)]"
          >
            {product.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]"
          >
            {product.description}
          </motion.p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {product.capabilities.map((cap, i) => (
              <motion.li
                key={cap.label}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.12 }}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/50 p-4"
              >
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.35em]"
                  style={{ color: product.accent }}
                >
                  {cap.label}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--text-primary)]">
                  {cap.value}
                </p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono text-xs font-medium tracking-wide text-[var(--bg-deep)] transition-transform hover:-translate-y-0.5"
              style={{ background: product.accent }}
            >
              Try the demo
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-dim)]">
              {hostnameOf(product.href)}
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap gap-1.5">
            {product.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-[var(--stroke)] bg-[var(--bg-deep)]/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] text-[var(--text-muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}



/**
 * High-level career timeline — distilled from resume (no exhaustive detail on purpose).
 */
export type TimelineEntry = {
  id: string;
  from: string;
  to: string;
  role: string;
  org: string;
  /** One line — enough to scan */
  focus: string;
};

/**
 * Section scroll progress (0–1) when each card activates — keep length equal to `timeline.length`.
 * Line motion is interpolated so the tip reaches dot `i` when progress crosses `activationScroll[i]`.
 */
export const TIMELINE_ACTIVATION_SCROLL: readonly number[] = [0, 0.25, 0.4];

export const timeline: TimelineEntry[] = [
  {
    id: "pragmatic",
    from: "Jul 2025",
    to: "Present",
    role: "Senior Software Engineer (SDE III) · Frontend",
    org: "Pragmatic Play",
    focus:
      "Built real-time casino interfaces with WebGL/GLSL pipelines tuned for consistent 60fps delivery.",
  },
  {
    id: "cred",
    from: "Oct 2023",
    to: "Jul 2025",
    role: "Senior Software Engineer",
    org: "CRED (Prefr / CreditVidya)",
    focus:
      "Scaled Vue 3 lending experiences and frontend architecture while sustaining 92+ Lighthouse on key journeys.",
  },
  {
    id: "byjus",
    from: "Nov 2019",
    to: "Oct 2023",
    role: "Senior Software Engineer",
    org: "Byju’s · Toppr & Aakash",
    focus:
      "Led Next.js and socket-driven learning/testing experiences across SSR surfaces used by high-traffic cohorts.",
  },
];

export const education = {
  school: "IIIT Gwalior",
  degree: "M.Tech · Computer Science & Engineering",
  years: "2014 — 2019",
  note:
    "Coursework in core computer science with a focus on systems thinking and production-grade software engineering.",
} as const;

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
    focus: "WebGL, GLSL, live casino — 60fps real-time graphics",
  },
  {
    id: "cred",
    from: "Oct 2023",
    to: "Jul 2025",
    role: "Senior Software Engineer",
    org: "CRED (Prefr / CreditVidya)",
    focus: "Vue 3, performance — 92+ Lighthouse, animations at scale",
  },
  {
    id: "byjus",
    from: "Nov 2019",
    to: "Oct 2023",
    role: "Senior Software Engineer",
    org: "Byju’s · Toppr & Aakash",
    focus: "Next.js, sockets, SSR — edtech & test player at scale",
  },
];

export const education = {
  school: "IIIT Gwalior",
  degree: "M.Tech · Computer Science & Engineering",
  years: "2014 — 2019",
  note: "Core CS, festival web apps, sports (chess, TT, cricket)",
} as const;

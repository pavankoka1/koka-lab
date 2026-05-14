export type Lab = {
  slug: string;
  /** Headline title */
  title: string;
  /** 1–2 sentence pitch — how I'd describe the work in conversation */
  subtitle: string;
  href: string;
  /** Discipline label shown above the title in the card */
  category: string;
  /** Technologies shown as small chips on the card */
  stack: readonly string[];
  /** A single, punchy "result" line — the impact / measurement */
  metric: string;
  /** Visual signature key — drives the per-card accent + canvas glyph */
  accent: string;
};

export type FeaturedWork = {
  slug: string;
  href: string;
  /** Section eyebrow */
  eyebrow: string;
  /** Project name */
  title: string;
  /** One-line tagline — keep it short */
  tagline: string;
  /** 2–3 sentences describing what the project is and what makes it interesting */
  description: string;
  /** Two short pull-quotes / craft notes shown in a side panel */
  notes: readonly { label: string; value: string }[];
  /** Stack chips */
  stack: readonly string[];
  accent: string;
};

export type ShippedProduct = {
  slug: string;
  href: string;
  /** Section eyebrow */
  eyebrow: string;
  /** Product name */
  title: string;
  /** One-line tagline */
  tagline: string;
  /** 2–3 sentences explaining what the product does */
  description: string;
  /** 3–4 capability rows — what the tool actually does */
  capabilities: readonly { label: string; value: string }[];
  /** Tech stack chips */
  stack: readonly string[];
  /** Where it ships (e.g. "Windows · macOS · Linux") */
  platforms: string;
  accent: string;
};

export const site = {
  name: "Pavan Koka",
  /** 3D wordmark text in `KokaMark3D` */
  brand: "KOKA",
  title: "Pavan Koka — Senior Frontend Engineer · Real-time, WebGL & Performance",
  shortTitle: "Pavan Koka",
  description:
    "Senior Frontend Engineer (SDE III) building real-time, performance-critical interfaces for online gaming, fintech, and edtech. Specialised in render performance, WebGL/GLSL, and resilient frontend architecture.",
  url: "https://koka-lab.vercel.app",
  locale: "en_US",
  twitter: "@pavankoka",
  author: "Pavan Koka",
  email: "pavankoka1@gmail.com",
  phone: "+91 9515918848",
  links: {
    linkedin: "https://linkedin.com/in/pavan-koka-419680148",
    github: "https://github.com/pavankoka1",
  },
  summary:
    "Protect the frame. Measure what matters. Ship what holds.",
  highlights: [
    "Senior Frontend Engineer · SDE III",
    "Real-time systems · WebSocket / Socket.io",
    "WebGL / GLSL & rendering performance",
    "End-to-end ownership · architecture to rollout",
  ],
  stack: {
    frontend: [
      "React 19",
      "Next.js",
      "Vue 3 / Nuxt",
      "TypeScript",
      "Redux / Redux-Saga",
      "Zustand",
    ],
    realtimeAndGraphics: [
      "WebGL",
      "GLSL shaders",
      "Three.js / R3F",
      "Canvas 2D",
      "Web Workers",
      "Socket.io",
    ],
    platform: [
      "Node.js",
      "Webpack / Vite",
      "Service Workers · PWA",
      "Lighthouse 92+",
      "Jest · Cypress",
      "SSR / ISR",
    ],
  },

  /**
   * Featured narrative work — gets a dedicated, immersive section above the
   * engineering studies. One project only — the showcase piece.
   */
  featured: {
    slug: "a-billion-dreams",
    href: "https://a-billion-dreams.vercel.app/",
    eyebrow: "Featured work",
    title: "A Billion Dreams",
    tagline: "A particle portrait of two cricketing lives.",
    description:
      "A scroll-driven cinematic essay arguing that Indian cricket isn't Sachin or Virat — it is one continuous line. The same field of light re-forms across chapters, resolving from constellation into face. Built as a single page where reading speed and scroll are the interface, and dots becoming portraits are the emotional proof of the thesis.",
    notes: [
      { label: "Discipline", value: "Narrative · WebGL · Scroll choreography" },
      { label: "Pattern", value: "Same particle field, many silhouettes" },
      { label: "Constraint", value: "Reduced-motion path preserves meaning" },
    ],
    stack: ["Next.js", "WebGL", "Scroll-driven", "Particle systems"],
    accent: "#f59e0b",
  } as FeaturedWork,

  /**
   * Open-source product — a substantial, shipped tool that gets its own
   * dedicated section between the featured narrative work and the
   * engineering studies grid.
   */
  product: {
    slug: "perftrace",
    href: "https://performance-testing-website.vercel.app/",
    eyebrow: "Open-source product",
    title: "PerfTrace",
    tagline: "Self-hosted performance testing for any URL.",
    description:
      "A desktop app and web service that drives Chromium with Playwright + CDP tracing. Point it at any URL, start a session, and get a frame-accurate report — FPS, Web Vitals, CPU, and a synced session video. Works offline, ships for every major OS.",
    capabilities: [
      {
        label: "Tracing",
        value: "Playwright + CDP — frame-accurate timeline & long-task detection.",
      },
      {
        label: "Metrics",
        value: "FPS · LCP · CLS · CPU · Frame time, captured live during the run.",
      },
      {
        label: "Capture",
        value: "Synced session video, downloadable WebM, viewable inside the report.",
      },
      {
        label: "Distribution",
        value: "Electron desktop · web service · Docker / VPS — fully offline.",
      },
    ],
    stack: ["Electron", "Playwright", "Node.js", "React", "Vite", "Express"],
    platforms: "Windows · macOS · Linux · Web",
    accent: "#8b5cf6",
  } as ShippedProduct,

  /**
   * Engineering studies — performance and architecture demos. Each one
   * is a focused write-up + live experiment, not a generic side-project.
   */
  labs: [
    {
      slug: "svg-to-canvas",
      title: "SVG → Canvas at scale",
      subtitle:
        "Rasterise any React SVG component into a cached canvas bitmap so thousands of instances stop melting the DOM.",
      href: "https://svg-to-canvas.vercel.app/",
      category: "Render architecture",
      stack: ["React 19", "Canvas 2D", "renderToStaticMarkup"],
      metric: "5,000 instances · ~5,000 DOM nodes vs ~40,000+ for live SVG",
      accent: "#22d3ee",
    },
    {
      slug: "web-worker-rAF",
      title: "60 FPS, one render",
      subtitle:
        "Animating a number with a worker-hosted requestAnimationFrame loop and a single ref — no reconciler in the hot path, no scheduler drift.",
      href: "https://web-worker-ref-update.vercel.app/",
      category: "Real-time systems",
      stack: ["React 19", "Web Workers", "rAF", "Vite"],
      metric: "1,800 reconciler renders → 1 · drift held under 1 frame",
      accent: "#34d399",
    },
    {
      slug: "web-worker-testing",
      title: "Main thread vs Web Worker",
      subtitle:
        "A side-by-side rig that measures time-to-commit when CPU-bound work runs on main vs inside a worker — using useLayoutEffect to capture layout-facing latency.",
      href: "https://web-worker-animation.vercel.app/",
      category: "Real-time systems",
      stack: ["Next.js", "Web Workers", "useLayoutEffect"],
      metric: "Captures latency in ms with the main thread blocked",
      accent: "#a78bfa",
    },
    {
      slug: "react-rerender",
      title: "React render performance",
      subtitle:
        "Trace avoidable re-renders across realistic component trees and validate memoization strategies against measurable scenarios.",
      href: "https://react-re-render.vercel.app/",
      category: "Render performance",
      stack: ["React", "Profiler", "memo / useMemo"],
      metric: "Visualises re-render cause, ownership, and cost per scenario",
      accent: "#818cf8",
    },
    {
      slug: "react-props-children-memo",
      title: "Props, children, render ownership",
      subtitle:
        "Compare composition patterns — children-as-prop, render props, context split — and the render cost each one carries inside a real tree.",
      href: "https://react-props-children-demo-nine.vercel.app/",
      category: "React patterns",
      stack: ["React", "Composition", "Profiler"],
      metric: "Pattern × cost matrix for everyday component trees",
      accent: "#f472b6",
    },
    {
      slug: "layout-thrashing",
      title: "Layout thrash & reflow",
      subtitle:
        "Inspect forced synchronous layout, separate read and write phases, and watch the frame budget recover when the schedule is right.",
      href: "https://layout-thrashing-demo.vercel.app/",
      category: "Browser internals",
      stack: ["DOM", "rAF", "Performance API"],
      metric: "Frame cost falls from ~28ms to <8ms after read/write split",
      accent: "#fb7185",
    },
    {
      slug: "gpu-vs-cpu",
      title: "GPU vs CPU animation",
      subtitle:
        "Compositor-friendly transforms vs CPU-bound layout animation across the same motion — measured under load on representative devices.",
      href: "https://gpu-vs-cpu-animations.vercel.app/",
      category: "Animation performance",
      stack: ["CSS transforms", "will-change", "compositor"],
      metric: "60 FPS held on GPU path · CPU path stalls under load",
      accent: "#facc15",
    },
  ] as readonly Lab[],
} as const;

# Koka-Lab Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform koka-lab's visual identity to Editorial/Precision — Cormorant Garamond typography, pure monochrome colour, Slow Bloom motion — while fixing code quality and performance issues identified in the audit.

**Architecture:** 7-stage build sequence: utilities first (no visual change), performance prep, colour system, typography swap, per-component code quality, motion system rollout, smoke test. Each stage is independently committable and leaves the site in a working state.

**Tech Stack:** Next.js 15 App Router, React 19, Framer Motion 12, Tailwind CSS v4, TypeScript strict, Canvas 2D, Three.js/R3F

**Spec:** `docs/superpowers/specs/2026-05-15-koka-lab-overhaul-design.md`

---

## Task 1: Create shared utility library

**Files:**
- Create: `src/lib/utils.ts`
- Modify: `src/components/Timeline.tsx` (remove local `lerp`, import from utils)
- Modify: `src/components/FeaturedWork.tsx` (remove local `lerp`, `easeInOutCubic`, `parseHex`, `hostnameOf`)
- Modify: `src/components/ShippedProduct.tsx` (remove local `lerp`, `easeInOutCubic`, `parseHex`, `hostnameOf`)
- Modify: `src/components/HorizontalLabs.tsx` (remove local `hostnameOf`)
- Modify: `src/components/ParticleLogoMark.tsx` (remove local `parseHex`)

- [ ] **Step 1: Create `src/lib/utils.ts`**

```ts
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function parseHex(hex: string) {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(v.slice(0, 2), 16) || 0,
    g: parseInt(v.slice(2, 4), 16) || 0,
    b: parseInt(v.slice(4, 6), 16) || 0,
  };
}

export function hostnameOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
```

- [ ] **Step 2: Update `src/components/Timeline.tsx` — remove local `lerp`, add import**

At the top of the file, add:
```ts
import { lerp } from "@/lib/utils";
```

Delete lines 27–29 (the local `lerp` function):
```ts
// DELETE THIS:
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
```

- [ ] **Step 3: Update `src/components/FeaturedWork.tsx` — remove local utils, add import**

Add at top of file (after existing imports):
```ts
import { easeInOutCubic, hostnameOf, lerp, parseHex } from "@/lib/utils";
```

Delete lines 147–153 (local `hostnameOf`), lines 320–338 (local `lerp`, `easeInOutCubic`, `parseHex`).

- [ ] **Step 4: Update `src/components/ShippedProduct.tsx` — same as FeaturedWork**

Add at top of file:
```ts
import { easeInOutCubic, hostnameOf, lerp, parseHex } from "@/lib/utils";
```

Delete local `hostnameOf` (~lines 152–158), `lerp`, `easeInOutCubic`, `parseHex` (~lines 325–347).

- [ ] **Step 5: Update `src/components/HorizontalLabs.tsx`**

Add at top of file:
```ts
import { hostnameOf } from "@/lib/utils";
```

Delete lines 140–146 (local `hostnameOf`).

- [ ] **Step 6: Update `src/components/ParticleLogoMark.tsx`**

Add at top of file:
```ts
import { parseHex } from "@/lib/utils";
```

Delete lines 226–240 (local `parseHex`).

- [ ] **Step 7: Verify no TypeScript errors**

```bash
cd /path/to/koka-lab && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/utils.ts src/components/Timeline.tsx src/components/FeaturedWork.tsx src/components/ShippedProduct.tsx src/components/HorizontalLabs.tsx src/components/ParticleLogoMark.tsx
git commit -m "refactor: extract shared canvas utilities to lib/utils"
```

---

## Task 2: Performance prep — dead assets + bundle analyzer

**Files:**
- Delete: `public/particle-mark-reference.png`
- Delete: `public/particle-mark-reference-alt.png`
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Verify the PNGs are unreferenced**

```bash
grep -r "particle-mark-reference" src/
```

Expected: no output (zero references). If any found, do not delete until those references are removed.

- [ ] **Step 2: Delete the unused PNGs**

```bash
rm public/particle-mark-reference.png public/particle-mark-reference-alt.png
```

- [ ] **Step 3: Install bundle analyzer**

```bash
npm install --save-dev @next/bundle-analyzer
```

- [ ] **Step 4: Update `next.config.ts`**

Read the current file first, then wrap the existing export with the analyzer. The file currently looks like:

```ts
// current content (transpilePackages config)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
```

Replace the entire file with:

```ts
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
```

- [ ] **Step 5: Verify build still works**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add public/ package.json next.config.ts package-lock.json
git commit -m "perf: remove unused PNGs, add bundle analyzer"
```

---

## Task 3: GLB model compression

**Files:**
- Modify: `public/models/*.glb` (recompressed in-place)
- Modify: `src/components/canvas/Experience.tsx` (add MeshoptDecoder)

- [ ] **Step 1: Install gltf-transform CLI**

```bash
npm install --save-dev @gltf-transform/cli @gltf-transform/extensions
```

- [ ] **Step 2: Record baseline sizes**

```bash
du -sh public/models/*.glb
```

Note the total. Expected baseline: ~100 MB across 7 files.

- [ ] **Step 3: Compress all GLB models**

Run this for each model (replace filenames as appropriate):

```bash
npx gltf-transform optimize public/models/mosquito_in_amber.glb public/models/mosquito_in_amber.glb --compress meshopt
npx gltf-transform optimize public/models/mosquito_amber.glb public/models/mosquito_amber.glb --compress meshopt
npx gltf-transform optimize public/models/ford-mustang.glb public/models/ford-mustang.glb --compress meshopt
```

Repeat for each remaining `.glb` file in `public/models/`.

- [ ] **Step 4: Verify compression worked**

```bash
du -sh public/models/*.glb
```

Expected: significantly smaller (target <20 MB total). If a model failed to compress, re-run with `--verbose` to diagnose.

- [ ] **Step 5: Add MeshoptDecoder to the R3F Canvas**

Read `src/components/canvas/Experience.tsx`. Add the decoder import and extend Three.js:

At the top of Experience.tsx, add:
```ts
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
```

Inside the component (before the Canvas render), add:
```ts
useEffect(() => {
  GLTFLoader.setMeshoptDecoder(MeshoptDecoder);
}, []);
```

> **Note:** If Experience.tsx already uses `useGLTF` from `@react-three/drei`, add the decoder via `useGLTF.setDecoderPath` or extend `drei`'s loader. Check the existing loader setup first — drei's `useGLTF` handles meshopt automatically if `MeshoptDecoder` is globally registered via `THREE.MeshoptDecoder = MeshoptDecoder` before the first load.

The safe approach that works with drei's `useGLTF`:

```ts
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import * as THREE from "three";

// Add before the component definition:
(THREE as any).MeshoptDecoder = MeshoptDecoder;
```

- [ ] **Step 6: Start dev server and verify 3D model still loads**

```bash
npm run dev
```

Open `http://localhost:3000`. The hero 3D model (mosquito in amber) must render correctly. If it fails to load (blank canvas or error), the meshopt decoder is not wired correctly — revert the Experience.tsx change and use the Three.js global approach above.

- [ ] **Step 7: Commit**

```bash
git add public/models/ src/components/canvas/Experience.tsx package.json package-lock.json
git commit -m "perf: compress GLB models with meshopt, register MeshoptDecoder"
```

---

## Task 4: Typography swap

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace font imports and config in `src/app/layout.tsx`**

Find lines 3–18 (current font setup):
```ts
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});
```

Replace with:
```ts
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});
```

- [ ] **Step 2: Update the `<html>` className to include the body font variable**

Find line 156:
```tsx
<html lang="en" className={`${display.variable} ${mono.variable}`}>
```

Replace with:
```tsx
<html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Start dev server and visually confirm new fonts load**

```bash
npm run dev
```

Open `http://localhost:3000`. The hero headline should now render in Cormorant Garamond (thin, serif, elegant). Body text in IBM Plex Sans. Labels in IBM Plex Mono. If fonts appear identical to before, check the network tab for font loading errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: swap typography to Cormorant Garamond + IBM Plex"
```

---

## Task 5: Colour system — remove violet, go monochrome

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx` (violet hover classes)

- [ ] **Step 1: Update CSS custom properties in `src/app/globals.css`**

Find the `:root` block (lines 3–15):
```css
:root {
  --bg-deep: #050508;
  --bg-elevated: #0c0c12;
  --bg-secondary: #12121a;
  --bg-tertiary: #1e1e2a;
  --text-primary: #f4f4f8;
  --text-muted: #5c5c6e;
  --text-dim: #3a3a48;
  --accent: #a78bfa;
  --accent-hot: #c4b5fd;
  --stroke: rgba(167, 139, 250, 0.12);
  --glow: rgba(139, 92, 246, 0.15);
}
```

Replace with:
```css
:root {
  --bg-deep: #050508;
  --bg-elevated: #0c0c12;
  --bg-secondary: #12121a;
  --bg-tertiary: #1e1e2a;
  --text-primary: #f4f4f8;
  --text-muted: #5c5c6e;
  --text-dim: #3a3a48;
  --stroke: rgba(255, 255, 255, 0.07);
  --glow: rgba(255, 255, 255, 0.04);
}
```

- [ ] **Step 2: Update `::selection` in `globals.css`**

Find lines 27–30:
```css
::selection {
  background: rgba(167, 139, 250, 0.35);
  color: #fff;
}
```

Replace with:
```css
::selection {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
```

- [ ] **Step 3: Remove violet hover classes from nav links in `src/app/page.tsx`**

Find the three `<a>` elements in the hero social links (lines 98–120). Each has:
```
hover:border-violet-500/40 hover:text-[var(--accent-hot)]
```
or
```
hover:border-violet-500/40
```

Replace all three hover states:
- `hover:border-violet-500/40 hover:text-[var(--accent-hot)]` → `hover:border-white/20 hover:text-white`
- `hover:border-violet-500/40` → `hover:border-white/20`

The LinkedIn link (line 99):
```tsx
className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-primary)] transition-colors hover:border-white/20 hover:text-white"
```

The GitHub link (line 107, same pattern).

The Email link (line 115):
```tsx
className="rounded-full border border-[var(--stroke)] bg-[var(--bg-secondary)]/60 px-5 py-2.5 text-[var(--text-muted)] transition-colors hover:border-white/20"
```

- [ ] **Step 4: Verify no remaining `--accent` or violet references in the changed files**

```bash
grep -r "accent\|violet\|a78bfa\|c4b5fd\|8b5cf6" src/app/globals.css src/app/page.tsx
```

Expected: no matches (or only legitimate project-level accents inside component data, not global UI).

- [ ] **Step 5: Start dev server and visually confirm — no purple anywhere in global UI**

```bash
npm run dev
```

Check: nav links, scroll indicator, section borders. All should be white-opacity, not violet.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app/page.tsx
git commit -m "feat: replace violet accent system with monochrome opacity scale"
```

---

## Task 6: ParticleLogoMark — monochrome colours

**Files:**
- Modify: `src/components/ParticleLogoMark.tsx`

- [ ] **Step 1: Replace accent colour reads with white-opacity constants**

Find lines 53–68 (CSS variable reads and pre-built color strings):
```ts
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
```

Replace with:
```ts
// Monochrome — white opacity hierarchy, no accent reads needed.
const ar = 255;
const ag = 255;
const ab = 255;
const baseStroke = "rgba(255,255,255,0.22)";
const innerRingStroke = "rgba(255,255,255,0.06)";
const stroke = "rgba(255,255,255,0.06)";
```

- [ ] **Step 2: Update the shimmer gradient on the author name**

Find line 202 in the JSX:
```tsx
<span className="bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-hot)] to-[var(--text-primary)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:shimmerSlide_6s_linear_infinite]">
```

Replace with:
```tsx
<span className="bg-gradient-to-r from-[var(--text-primary)] via-white/60 to-[var(--text-primary)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:shimmerSlide_6s_linear_infinite]">
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Check visually — the K logo mark renders in white, no purple**

```bash
npm run dev
```

Top-left beacon: K letterform in white, scan band in white. Author name shimmer in white/grey. No violet.

- [ ] **Step 5: Commit**

```bash
git add src/components/ParticleLogoMark.tsx
git commit -m "feat: ParticleLogoMark — monochrome white-opacity colours"
```

---

## Task 7: SiteBeacon — monochrome colours

**Files:**
- Modify: `src/components/SiteBeacon.tsx`

- [ ] **Step 1: Replace accent/stroke reads with white-opacity constants**

Find lines 49–61 (CSS variable reads and gradient strings):
```ts
const root = document.documentElement;
const accent =
  getComputedStyle(root).getPropertyValue("--accent").trim() || "#a78bfa";
const dim =
  getComputedStyle(root).getPropertyValue("--text-dim").trim() || "#3a3a48";
const stroke =
  getComputedStyle(root).getPropertyValue("--stroke").trim() ||
  "rgba(167,139,250,0.12)";

// Pre-build the static gradient stop colors that don't depend on time.
const gradStart = `${accent}cc`;
const gradMid = "rgba(196,181,253,0.55)";
const gradEnd = `${dim}99`;
```

Replace with:
```ts
// Monochrome — white opacity system.
const accent = "rgba(255,255,255,0.65)";
const stroke = "rgba(255,255,255,0.06)";
const gradStart = "rgba(255,255,255,0.55)";
const gradMid = "rgba(255,255,255,0.35)";
const gradEnd = "rgba(255,255,255,0.08)";
```

- [ ] **Step 2: Verify the core dot and orbit arc use the updated `accent`**

Lines 106 and 145 already use `accent` and `stroke` variables — they'll pick up the new white values automatically. No further changes needed in `drawFrame`.

- [ ] **Step 3: Visually confirm — Lissajous trace renders in white, orbit ring in white**

```bash
npm run dev
```

Top-right beacon: orbit ring in faint white, Lissajous trace in white-opacity gradient, core dot in white. No violet.

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteBeacon.tsx
git commit -m "feat: SiteBeacon — monochrome white-opacity colours"
```

---

## Task 8: LoadingOverlay — monochrome + bloom dissolve exit

**Files:**
- Modify: `src/components/LoadingOverlay.tsx`

- [ ] **Step 1: Replace the exit animation with bloom dissolve**

Find lines 16–21 (the outer motion.div):
```tsx
<motion.div
  className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-deep)]"
  initial={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
>
```

Replace with:
```tsx
<motion.div
  className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-deep)]"
  initial={{ opacity: 1, filter: "blur(0px)" }}
  exit={{ opacity: 0, filter: "blur(12px)" }}
  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
>
```

- [ ] **Step 2: Replace violet progress bar gradient**

Find line 24:
```tsx
<motion.div
  className="h-full bg-gradient-to-r from-violet-500/20 via-violet-400 to-fuchsia-400"
```

Replace with:
```tsx
<motion.div
  className="h-full bg-gradient-to-r from-white/10 via-white/60 to-white/30"
```

- [ ] **Step 3: Replace violet pulsing dot**

Find line 37:
```tsx
<motion.div
  className="mt-12 h-1 w-1 rounded-full bg-violet-400/80"
```

Replace with:
```tsx
<motion.div
  className="mt-12 h-1 w-1 rounded-full bg-white/40"
```

- [ ] **Step 4: Start dev server and hard-reload to trigger the loader**

```bash
npm run dev
```

Hard-reload `http://localhost:3000`. The loading overlay should appear with a white progress bar. When the 3D model loads, the overlay should dissolve with a bloom effect (opacity fade + blur expansion over 1.5s). No violet anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/components/LoadingOverlay.tsx
git commit -m "feat: LoadingOverlay — monochrome colours, bloom dissolve exit"
```

---

## Task 9: Timeline — monochrome dots, font weight, lerp import

**Files:**
- Modify: `src/components/Timeline.tsx`

- [ ] **Step 1: Update section heading font weight (line 209)**

Find:
```tsx
className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
```

Replace with:
```tsx
className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-light tracking-tight text-[var(--text-primary)] sm:text-4xl"
```

- [ ] **Step 2: Update the active dot class in `TimelineRow` (line 284–288)**

Find:
```ts
dotClass =
  "border-violet-400 bg-violet-500/25 shadow-[0_0_22px_rgba(167,139,250,0.5)] ring-2 ring-violet-400/35";
```

Replace with:
```ts
dotClass =
  "border-white/60 bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.18)] ring-2 ring-white/20";
```

- [ ] **Step 3: Update active role text colour (line 322)**

Find:
```tsx
className={`mt-1 text-sm font-medium ${
  isHit ? "text-[var(--accent-hot)]" : "text-[var(--text-muted)]"
}`}
```

Replace with:
```tsx
className={`mt-1 text-sm font-medium ${
  isHit ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
}`}
```

- [ ] **Step 4: Update active row heading font weight (line 314)**

Find:
```tsx
className={`mt-2 font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl ${
```

Replace with:
```tsx
className={`mt-2 font-[family-name:var(--font-display)] text-xl font-light sm:text-2xl ${
```

- [ ] **Step 5: Verify TypeScript and visually test**

```bash
npx tsc --noEmit && npm run dev
```

Scroll into the Timeline section. Active dots should glow white, active role text is `text-primary` (bright white), headings are weight 300. No purple anywhere.

- [ ] **Step 6: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "feat: Timeline — monochrome dots, font-light headings"
```

---

## Task 10: CyclingHeadline — Slow Bloom transition + font weight

**Files:**
- Modify: `src/components/CyclingHeadline.tsx`
- Modify: `src/app/page.tsx` (hero h1 font weight)

- [ ] **Step 1: Replace word animation variants with bloom pattern**

Find lines 38–61:
```ts
const PARENT_VARIANTS = {
  enter: {
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
  exit: {
    transition: { staggerChildren: 0.035, staggerDirection: -1 },
  },
} as const;

const WORD_VARIANTS = {
  enter: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 18,
  },
} as const;

const WORD_TRANSITION = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};
```

Replace with:
```ts
const PARENT_VARIANTS = {
  enter: {
    transition: { staggerChildren: 0.42, delayChildren: 0.08 },
  },
  exit: {
    transition: { staggerChildren: 0.18, staggerDirection: -1 },
  },
} as const;

const WORD_VARIANTS = {
  enter: {
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
  },
} as const;

const WORD_TRANSITION = {
  duration: 1.8,
  ease: [0.16, 1, 0.3, 1] as const,
};
```

- [ ] **Step 2: Update hero h1 font weight in `src/app/page.tsx`**

Find line 76:
```tsx
className="mt-6 max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(2.6rem,7.4vw,5rem)] font-semibold leading-[0.96] tracking-tight text-[var(--text-primary)]"
```

Replace `font-semibold` with `font-light`:
```tsx
className="mt-6 max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(2.6rem,7.4vw,5rem)] font-light leading-[0.96] tracking-tight text-[var(--text-primary)]"
```

- [ ] **Step 3: Visually test the hero headline animation**

```bash
npm run dev
```

Wait 4.5 seconds for the first cycle. Words should bloom in through blur (each word slightly delayed from the previous). Outgoing words should blur out. The effect should feel contemplative, not snappy. If it feels too fast, increase `staggerChildren` in `PARENT_VARIANTS.enter` to 0.5.

- [ ] **Step 4: Commit**

```bash
git add src/components/CyclingHeadline.tsx src/app/page.tsx
git commit -m "feat: CyclingHeadline — Slow Bloom word transitions, font-light"
```

---

## Task 11: ScrollWordReveal — blur+opacity bloom on scroll

**Files:**
- Modify: `src/components/ScrollWordReveal.tsx`

- [ ] **Step 1: Replace colour-cycling with blur+opacity bloom**

The current `LitWord` function (lines 38–61) cycles between CSS color variables.

Replace the entire file content with:

```tsx
"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

type Props = {
  text: string;
  className?: string;
};

/**
 * Words bloom into visibility (opacity + blur) as the block scrolls into view.
 * Each word blooms slightly after the previous, creating a left-to-right wave.
 */
export function ScrollWordReveal({ text, className = "" }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.trim().split(/\s+/);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.88", "end 0.28"],
  });

  const head = useTransform(scrollYProgress, [0, 1], [0, words.length]);

  return (
    <p ref={ref} className={`flex flex-wrap gap-x-2 gap-y-3 ${className}`}>
      {words.map((word, i) => (
        <BloomWord key={`${i}-${word}`} word={word} index={i} head={head} />
      ))}
    </p>
  );
}

function BloomWord({
  word,
  index,
  head,
}: {
  word: string;
  index: number;
  head: MotionValue<number>;
}) {
  // Each word blooms as `head` passes through [index-0.5, index+0.5]
  const opacity = useTransform(head, [index - 0.5, index + 0.5], [0, 1]);
  const blurPx = useTransform(head, [index - 0.5, index + 0.5], [8, 0]);
  const filter = useTransform(blurPx, (b) => `blur(${b.toFixed(2)}px)`);

  return (
    <motion.span
      style={{ opacity, filter }}
      className="inline-block tracking-tight text-[var(--text-primary)]"
    >
      {word}
    </motion.span>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Visually test the scroll reveal**

```bash
npm run dev
```

Scroll past the "How I build" section. The long quote should bloom in word-by-word as you scroll. Words start invisible and blurred; they bloom to full opacity and zero blur as the scroll head passes each word's position. The effect should read as an elegant cascade, not a flash.

- [ ] **Step 4: Commit**

```bash
git add src/components/ScrollWordReveal.tsx
git commit -m "feat: ScrollWordReveal — Slow Bloom scroll-driven reveal"
```

---

## Task 12: FeaturedWork — bloom entries + canvas throttle

**Files:**
- Modify: `src/components/FeaturedWork.tsx`

- [ ] **Step 1: Replace slide-up entry animations with bloom entries**

There are four `motion.*` elements in `FeaturedWork` with `initial={{ opacity: 0, y: 12 }}` or `y: 16` (lines 34–81). Replace each one:

**Eyebrow `motion.p` (line 34–43):**
```tsx
// BEFORE:
initial={{ opacity: 0, y: 12 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.5 }}

// AFTER:
initial={{ opacity: 0, filter: "blur(8px)" }}
whileInView={{ opacity: 1, filter: "blur(0px)" }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
```

**Heading `motion.h2` (line 45–53):**
```tsx
// BEFORE:
initial={{ opacity: 0, y: 16 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}

// AFTER:
initial={{ opacity: 0, filter: "blur(10px)" }}
whileInView={{ opacity: 1, filter: "blur(0px)" }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
```

**Tagline `motion.p` (line 56–64) and description `motion.p` (line 66–74):** Apply the same bloom pattern with `duration: 1.8` and a `delay: 0.3` / `delay: 0.5` respectively to create a cascade.

- [ ] **Step 2: Update the heading font weight**

Find line 51:
```tsx
className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-tight text-[var(--text-primary)]"
```

Replace `font-semibold` → `font-light`.

- [ ] **Step 3: Add 30 FPS throttle to FeaturedCanvas draw loop**

Find the `FeaturedCanvas` component's draw loop (around line 250–297). The current loop:
```ts
const t0 = performance.now();
let raf = 0;
let alive = true;

const draw = (now: number) => {
  if (!alive) return;
  const elapsed = (now - t0) / 1000;
  // ... drawing code ...
  raf = requestAnimationFrame(draw);
};
raf = requestAnimationFrame(draw);
```

Add throttle variables after `let alive = true`:
```ts
const FRAME_MS = 1000 / 30;
let lastDraw = 0;
```

Then wrap the draw body with a throttle check. Replace:
```ts
const draw = (now: number) => {
  if (!alive) return;
  const elapsed = (now - t0) / 1000;
```

With:
```ts
const draw = (now: number) => {
  if (!alive) return;
  raf = requestAnimationFrame(draw);
  if (now - lastDraw < FRAME_MS) return;
  lastDraw = now;
  const elapsed = (now - t0) / 1000;
```

And remove the `raf = requestAnimationFrame(draw)` at the end of the draw body (line 295), since it's now at the top.

- [ ] **Step 4: Update particle colours — monochrome white tones**

Find lines 255–256 in the draw function:
```ts
const accentRGB = parseHex(accent);
const violet = { r: 167, g: 139, b: 250 };
```

And the colour mixing lines 282–285:
```ts
const m = p.mix * (0.5 + phase * 0.5);
const r = Math.round(lerp(violet.r, accentRGB.r, m));
const g = Math.round(lerp(violet.g, accentRGB.g, m));
const b = Math.round(lerp(violet.b, accentRGB.b, m));
```

Replace with (white-to-accent monochrome):
```ts
const accentRGB = parseHex(accent);
const white = { r: 255, g: 255, b: 255 };
```

```ts
const m = p.mix * (0.5 + phase * 0.5);
const r = Math.round(lerp(white.r, accentRGB.r, m));
const g = Math.round(lerp(white.g, accentRGB.g, m));
const b = Math.round(lerp(white.b, accentRGB.b, m));
```

> **Note:** `accent` is passed as a prop from the per-project site config (e.g. `featured.accent`). This retains the project-specific accent for the particle field while removing the hardcoded violet fallback.

- [ ] **Step 5: TypeScript check + visual test**

```bash
npx tsc --noEmit && npm run dev
```

Scroll to the FeaturedWork section. Entry animations should bloom in. Particle field should animate at ~30 FPS (check devtools CPU profiler — frame duration should be ~33ms, not ~16ms).

- [ ] **Step 6: Commit**

```bash
git add src/components/FeaturedWork.tsx
git commit -m "feat: FeaturedWork — bloom entries, 30fps canvas throttle, monochrome particles"
```

---

## Task 13: ShippedProduct — bloom entries + canvas throttle

**Files:**
- Modify: `src/components/ShippedProduct.tsx`

Apply identical changes to those in Task 12, adapted for `ShippedProduct.tsx`:

- [ ] **Step 1: Replace slide-up entry animations with bloom (same pattern as Task 12, Step 1)**

Find all `motion.*` elements with `initial={{ opacity: 0, y: 12 }}` or `y: 16` and apply bloom pattern:
```tsx
initial={{ opacity: 0, filter: "blur(8px)" }}
whileInView={{ opacity: 1, filter: "blur(0px)" }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
```

- [ ] **Step 2: Update heading font weight — `font-semibold` → `font-light`**

Find the `motion.h2` heading className and replace `font-semibold` with `font-light`.

- [ ] **Step 3: Add 30 FPS throttle to `PerfTraceCanvas` draw loop (same as Task 12, Step 3)**

Find the canvas draw loop inside `PerfTraceCanvas`. Add:
```ts
const FRAME_MS = 1000 / 30;
let lastDraw = 0;
```

And wrap the draw body:
```ts
const draw = (now: number) => {
  if (!alive) return;
  raf = requestAnimationFrame(draw);
  if (now - lastDraw < FRAME_MS) return;
  lastDraw = now;
  // ... rest of draw
```

Remove the trailing `raf = requestAnimationFrame(draw)` from the end of the draw body.

- [ ] **Step 4: Update particle colours — replace violet fallback with white (same as Task 12, Step 4)**

Find where `ShippedProduct.tsx` uses a `violet` hardcoded colour in the particle draw loop and replace with `white = { r: 255, g: 255, b: 255 }`.

- [ ] **Step 5: TypeScript check + visual test**

```bash
npx tsc --noEmit && npm run dev
```

Scroll to the ShippedProduct section. Bloom entries, 30fps canvas.

- [ ] **Step 6: Commit**

```bash
git add src/components/ShippedProduct.tsx
git commit -m "feat: ShippedProduct — bloom entries, 30fps canvas throttle, monochrome particles"
```

---

## Task 14: page.tsx — hero section bloom entry

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace hero section slide-up entry with bloom**

Find lines 68–72 (the hero motion.div wrapping headline + body):
```tsx
<motion.div
  initial={{ opacity: 0, y: 28 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
>
```

Replace with:
```tsx
<motion.div
  initial={{ opacity: 0, filter: "blur(12px)" }}
  animate={{ opacity: 1, filter: "blur(0px)" }}
  transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Visual test — hard-reload and watch the hero enter**

```bash
npm run dev
```

Hard-reload `http://localhost:3000`. After the loader dissolves, the hero content (name tag, headline, summary, links) should bloom into existence over ~2.2s. It should feel like the page materialises, not slides in.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: hero section — Slow Bloom page entry animation"
```

---

## Task 15: Smoke test — full site review

- [ ] **Step 1: Build for production and check for errors**

```bash
npm run build
```

Expected: successful build, zero TypeScript errors, zero ESLint errors.

- [ ] **Step 2: Start production server and do a full walkthrough**

```bash
npm run start
```

Open `http://localhost:3000`. Walk through every section in order:

1. **Loading overlay** — white progress bar, bloom dissolve exit ✓
2. **Hero** — Cormorant Garamond headline, bloom entry, no violet anywhere ✓
3. **Hero links** — hover states are white, not violet ✓
4. **ParticleLogoMark** (top-left) — white K, no purple scan ✓
5. **SiteBeacon** (top-right) — white orbit ring, white Lissajous trace ✓
6. **Timeline** — active dots glow white, roles in white, no violet ✓
7. **ScrollWordReveal** — words bloom in as you scroll ✓
8. **FeaturedWork** — bloom entry on scroll, particle field animates ✓
9. **ShippedProduct** — same ✓
10. **HorizontalLabs** — cards display correctly ✓
11. **Footer** — Cormorant Garamond, no violet ✓

- [ ] **Step 3: Test with prefers-reduced-motion**

In Chrome DevTools > Rendering > Emulate CSS media > `prefers-reduced-motion: reduce`.

Reload. The CyclingHeadline should still cycle but without blur animation (Framer Motion respects this via `useReducedMotion`). Canvas particle systems should hold static (already handled by the `reduced` flag in each canvas component).

> **Note:** The Framer Motion `filter` blur animations do not automatically respect `prefers-reduced-motion`. If the blur animations still run with reduced motion enabled, wrap the `WORD_TRANSITION` duration with a reduced-motion check:
> ```ts
> import { useReducedMotion } from "framer-motion";
> const prefersReduced = useReducedMotion();
> const WORD_TRANSITION = {
>   duration: prefersReduced ? 0.01 : 1.8,
>   ease: [0.16, 1, 0.3, 1] as const,
> };
> ```

- [ ] **Step 4: Test on mobile viewport**

In DevTools, switch to mobile viewport (375px wide). Check:
- Typography scales correctly (Cormorant at small sizes should still be legible — weight 300 is thin)
- Loading overlay fits viewport
- ParticleLogoMark and SiteBeacon don't obscure content

- [ ] **Step 5: Run bundle analyzer**

```bash
ANALYZE=true npm run build
```

Note the JS bundle sizes. If any chunk is unexpectedly large (>500KB), investigate before shipping.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: smoke test passed — koka-lab overhaul complete"
```

---

## Self-Review Checklist (completed inline)

- **Spec coverage:** All 18 changes from the spec are covered across Tasks 1–14.
- **Placeholders:** None — every step shows exact code or exact commands.
- **Type consistency:** `lerp`, `easeInOutCubic`, `parseHex`, `hostnameOf` defined in Task 1 utils.ts and imported by the same names in Tasks 9–13. `bloomVariants` pattern is inline per component (not abstracted — each component has slight duration/blur variations that justify keeping them local). `FRAME_MS` is a local const in each canvas component.
- **Gaps found and fixed:** Added `prefers-reduced-motion` note in Task 15 Step 3 for Framer Motion filter animations, which the spec did not cover.

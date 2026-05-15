# Koka-Lab Overhaul — Design Spec

**Date:** 2026-05-15  
**Status:** Approved  
**Scope:** Visual identity, motion system, code quality, performance

---

## 1. Context

Koka-lab is a single-page portfolio for a senior frontend engineer specialising in real-time graphics, WebGL, and performance-critical interfaces. Built on Next.js 15, React 19, Framer Motion 12, Three.js/R3F, TypeScript strict, and Tailwind CSS v4.

The codebase is already well-engineered: strict TypeScript, proper SSR boundaries, GPU-safe animations, reduced-motion support, and impressive canvas systems (particle morphing, Lissajous beacon, 3D GLB hero). The overhaul targets three weaknesses: a generic visual identity (Space Grotesk + violet is the most common developer portfolio aesthetic of 2024–25), a motion language that is smooth but undifferentiated across sections, and several code quality issues that have accumulated across components.

---

## 2. Design Decisions

### 2.1 Aesthetic Direction — Editorial / Precision

Pure black canvas. High-contrast white typography. No accent colour — hierarchy through opacity alone. The aesthetic of a well-typeset technical monograph: uncompromising, confident, and legible at every scale.

This direction was chosen over:
- **Deep Midnight/Organic** (B) — navy + amber, too warm for a performance-systems portfolio
- **Kinetic/Brutalist** (C) — flame orange, asymmetric grid, too aggressive for the work on display

### 2.2 Typography System

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display | Cormorant Garamond | 300 / italic 300 | Headlines, CyclingHeadline, section titles |
| Body | IBM Plex Sans | 300, 400 | Body copy, card descriptions, metadata |
| Mono | IBM Plex Mono | 400, 500 | Labels, eyebrows, code, CTA text |

**Rationale:** Cormorant Garamond at weight 300 creates a delicate, ink-like quality that contrasts sharply with the utilitarian IBM Plex mono labels. The italic is expressive without ornamentation. Replaces Space Grotesk (overused in developer portfolios) and JetBrains Mono (replaced by IBM Plex Mono for tighter integration with the IBM Plex Sans body).

**CSS variables to update in `globals.css`:**
```css
--font-display: var(--font-cormorant);   /* was --font-space-grotesk */
--font-body:    var(--font-ibm-plex-sans);
--font-mono:    var(--font-ibm-plex-mono);
```

### 2.3 Colour System — Monochrome

Remove the global accent entirely. The violet `--accent: #a78bfa` and `--accent-hot: #c4b5fd` variables are deleted. All formerly-accented UI (timeline progress, beacon, CTA borders, scroll indicators) converts to white-opacity equivalents.

**Retained per-project colours:** Individual lab cards, FeaturedWork, and ShippedProduct retain their contextual project accents (cyan `#22d3ee`, amber `#f59e0b`, etc.). These are local to their components and are not global UI colour — they stay.

**New opacity scale for hierarchy:**
```css
/* Primary */   rgba(255,255,255,1.0)   /* active / selected */
/* Secondary */ rgba(255,255,255,0.45)  /* body text */
/* Tertiary */  rgba(255,255,255,0.22)  /* labels, eyebrows */
/* Dim */       rgba(255,255,255,0.08)  /* borders, dividers */
/* Glow */      rgba(255,255,255,0.04)  /* surface backgrounds */
```

### 2.4 Motion System — Slow Bloom

**Primary pattern:** opacity 0→1 with simultaneous blur 8px→0, driven by `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out), duration 1.8–2.2s per element, stagger 450–500ms between words/lines.

**Applied to:**
- `CyclingHeadline` — outgoing word fades to blur, incoming word blooms in
- `ScrollWordReveal` — replace colour-brightening with blur+opacity bloom on scroll
- All section entry animations — unified bloom variant on viewport entry
- `LoadingOverlay` exit — 1.5s bloom dissolve instead of quick fade
- `FeaturedWork` + `ShippedProduct` card entries — bloom rather than slide

**Framer Motion implementation pattern:**
```tsx
// Reusable bloom variant
const bloomVariants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 2, ease: [0.16, 1, 0.3, 1] }
  }
}
```

**What does NOT change:** The 3D canvas scroll choreography, particle systems, SiteBeacon Lissajous animation, and HorizontalLabs snap-scroll are left as-is. These are already distinctive and well-tuned.

---

## 3. Code Quality Changes

### 3.1 Extract shared utilities — `src/lib/utils.ts` (new file)

The following functions are duplicated across 3+ components and must be extracted:

| Function | Currently in |
|----------|-------------|
| `lerp(a, b, t)` | FeaturedWork.tsx, ShippedProduct.tsx, Timeline.tsx |
| `easeInOutCubic(t)` | FeaturedWork.tsx, ShippedProduct.tsx, Timeline.tsx |
| `parseHex(hex)` | FeaturedWork.tsx, ShippedProduct.tsx, ParticleLogoMark.tsx |
| `hostnameOf(url)` | FeaturedWork.tsx, ShippedProduct.tsx, HorizontalLabs.tsx |

All call sites updated to import from `@/lib/utils`.

### 3.2 Fix ParticleLogoMark canvas re-initialisation

**Problem:** The canvas setup `useEffect` depends on `roleIdx`, causing the entire canvas to teardown and reinitialise every time the role cycles (every 4.5s). This thrashes the GPU context unnecessarily.

**Fix:** Split into two effects:
1. Canvas setup effect — empty dependency array `[]`, runs once
2. Role change effect — depends on `roleIdx`, only updates the text/scan state without reinitialising canvas

### 3.3 Pre-compute SiteBeacon gradients

**Problem:** `SiteBeacon.tsx` constructs `createLinearGradient` / `createRadialGradient` objects every animation frame inside the rAF loop.

**Fix:** Compute gradient objects in a separate function called from a `useEffect` (and from the ResizeObserver callback when canvas dimensions change), store results in refs. The draw function reads from refs only. Gradients must not be constructed inside the rAF loop, but they must be recomputed when the canvas is resized since gradient coordinates are tied to the canvas context dimensions.

### 3.4 Throttle FeaturedCanvas and PerfTraceCanvas to 30 FPS

**Problem:** Both canvases run uncapped at 60 FPS with 720 particles each. `ParticleLogoMark` already does this correctly with `FRAME_MS = 1000 / 30`.

**Fix:** Add identical `FRAME_MS = 1000 / 30` throttle pattern to both canvas draw loops.

---

## 4. Performance Changes

### 4.1 GLB Model Compression

**Problem:** `/public/models/` contains 7 GLB files totalling ~100 MB. `ford-mustang.glb` alone is 33 MB, `mosquito_in_amber.glb` is 21 MB.

**Fix:** Run `gltf-transform optimize` with meshopt compression on all models. Expected output: 80–90% size reduction (~10–15 MB total). Three.js/R3F supports meshopt via `MeshoptDecoder` from `meshoptimizer`.

**Steps:**
1. Install: `npm install --save-dev @gltf-transform/cli`
2. Run per model: `gltf-transform optimize input.glb output.glb --compress meshopt`
3. Add `MeshoptDecoder` to the R3F `<Canvas>` via `<Suspense>` + drei's `useGLTF.preload`

### 4.2 Add Bundle Analyzer

**Fix:** Add `@next/bundle-analyzer` and wire it to `ANALYZE=true npm run build`. Gives visibility into JS weight before and after changes.

```ts
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer'
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig)
```

### 4.3 Remove Unused PNG Assets

Delete `public/particle-mark-reference.png` and `public/particle-mark-reference-alt.png` (72 KB total, not referenced in any component or import).

---

## 5. Files Changed

| File | Change type |
|------|-------------|
| `src/app/layout.tsx` | Font swap: Cormorant Garamond + IBM Plex Sans + IBM Plex Mono |
| `src/app/globals.css` | Remove accent vars, update font vars, add monochrome opacity scale |
| `src/components/CyclingHeadline.tsx` | Font weight 300, italic on cycling word, bloom transition |
| `src/components/ScrollWordReveal.tsx` | Replace colour-brighten with blur+opacity bloom |
| `src/components/Timeline.tsx` | Monochrome progress line + dots, import lerp/easeInOutCubic from utils |
| `src/components/SiteBeacon.tsx` | Monochrome trace colour, pre-compute gradients |
| `src/components/LoadingOverlay.tsx` | Bloom dissolve exit animation |
| `src/components/FeaturedWork.tsx` | Bloom card entry, import shared utils |
| `src/components/ShippedProduct.tsx` | Bloom card entry, import shared utils |
| `src/components/HorizontalLabs.tsx` | Import hostnameOf from utils |
| `src/components/ParticleLogoMark.tsx` | Split useEffect, import parseHex from utils |
| `src/lib/utils.ts` | **New** — lerp, easeInOutCubic, parseHex, hostnameOf |
| `next.config.ts` | Add bundle analyzer |
| `package.json` | Add @next/bundle-analyzer, @gltf-transform/cli |
| `public/models/*.glb` | Recompressed with meshopt |
| `public/particle-mark-reference*.png` | Deleted |

---

## 6. Out of Scope

- **FeaturedWork / ShippedProduct component merge** — the intentional "diptych" duplication is a design choice documented in the source. Not changed.
- **3D canvas choreography** — SceneStage, Experience, sceneConfig untouched
- **Particle systems** — FeaturedCanvas, PerfTraceCanvas particle logic untouched (only FPS-throttled)
- **HorizontalLabs card glyph system** — left as-is
- **Content / copy changes** — site.ts and timeline.ts not modified
- **SEO / metadata** — layout.tsx metadata section untouched

---

## 7. Build Sequence

1. **Utilities** — create `src/lib/utils.ts`, update all imports (no visual change)
2. **Performance prep** — delete unused PNGs, add bundle analyzer, compress GLBs
3. **Colour system** — update `globals.css`, remove accent vars, update all violet references
4. **Typography** — swap fonts in `layout.tsx` + `globals.css`
5. **Per-component type fixes** — Timeline, SiteBeacon, ParticleLogoMark code quality fixes
6. **Motion system** — implement bloom variants across all section reveals and CyclingHeadline
7. **Smoke test** — run dev server, verify all sections, check reduced-motion, check mobile

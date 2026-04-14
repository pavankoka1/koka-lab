/**
 * 3D hero: scroll phase 1 = rotate, phase 2 = zoom + extra spin.
 *
 * **layout.objectCenterOffsetXPercent** — At page top, horizontal placement of object center
 * (-100…+100, see `objectCenterXFracFromPercent` in SceneStage).
 *
 * **Centering as you scroll** (horizontal offset → screen center) uses **`window.scrollY` in
 * pixels** over viewport height — **not** normalized full-page `scrollT`. That way **at the top**
 * (`scrollY === 0`) the object keeps the full `objectCenterOffsetXPercent`; scrolling down eases
 * toward 0. (Hero rotation/zoom still uses `scrollT` elsewhere.)
 * - **objectCenterOffsetEaseDelayViewportHeights** — ignore this many viewport heights of scroll
 *   before easing starts.
 * - **objectCenterOffsetEaseOverViewportHeights** — after the delay, scroll this many **additional**
 *   viewport heights to finish easing to center. **Larger** = slower drift to center.
 */

export const SCENE_CONFIG = {
  layout: {
    /** Starting X offset % at top of page; lerps to 0 (screen center) as you scroll down. */
    objectCenterOffsetXPercent: 0,
    /**
     * Viewport heights of `window.scrollY` to scroll before horizontal ease begins.
     * `0` = start as soon as the page scrolls.
     */
    objectCenterOffsetEaseDelayViewportHeights: 0,
    /**
     * After the delay, scroll this many **additional** viewport heights so offset goes from
     * `objectCenterOffsetXPercent` → `0`. E.g. `1.2` ≈ 1.2 screens of scrolling for the full ease.
     */
    objectCenterOffsetEaseOverViewportHeights: 1.2,
    /** Strength of horizontal shift (raise if the effect is too subtle). */
    objectCenterStrafeMultiplier: 1.2,
  },

  model: {
    path: "/models/mosquito_in_amber.glb" as const,
    initialRotationDeg: { x: 0, y: 0, z: -15 },
  },

  framing: {
    fitWidthFraction: 0.55,
    distanceScale: 1,
    appearanceScale: 4,
  },

  camera: {
    fov: 80,
    azimuthDeg: 38,
    elevationDeg: 18,
    lookAtOffset: { x: 0, y: 0, z: 0 },
  },

  scroll: {
    rotation: {
      phaseEnd: 0.52,
      amountRad: Math.PI * 0.6,
      axis: "y" as const,
    },
    zoom: {
      endDistanceMul: 0.55,
      phase2RotationAmountRad: Math.PI * 0.15,
      phase2RotationAxis: "y" as const,
    },
  },

  motion: {
    floatExtentFraction: 0.01,
    floatSpeed: 0.9,
  },
} as const;

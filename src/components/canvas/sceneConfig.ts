/**
 * Hero GLB: scrollT ∈ [0,1] (full page). Two segments split at `phaseEnd`.
 * Distance = `d0 * mul` (d0 from mesh framing). Smaller mul = closer.
 * Match `dist[0][1]` to `dist[1][0]` so distance is continuous at the split.
 */

export const SCENE_CONFIG = {
  layout: {
    objectCenterOffsetXPercent: 0,
    objectCenterOffsetEaseDelayViewportHeights: 0,
    objectCenterOffsetEaseOverViewportHeights: 1.2,
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
    /** First segment ends here; second runs to scrollT = 1. */
    phaseEnd: 0.52,
    /**
     * Per-segment [start, end] distance multipliers vs framed `d0`.
     * [0] = first segment; [1] = second. Add zoom in segment 1 by moving [0] toward smaller numbers.
     */
    dist: [
      [0.9, 0.65],
      [0.65, 0.45],
    ] as const,
    /** [rotation sweep in seg1, extra rotation in seg2] on `axis`, radians. */
    rot: [Math.PI * 0.6, Math.PI * 0.15] as const,
    axis: "y" as const,
  },

  motion: {
    floatExtentFraction: 0.01,
    floatSpeed: 0.9,
  },
} as const;

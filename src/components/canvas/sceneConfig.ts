/**
 * 3D hero: centered subject, scroll phase 1 = rotate, phase 2 = zoom + extra spin.
 * `appearanceScale` divides camera distance (live in SceneStage).
 */

export const SCENE_CONFIG = {
  model: {
    path: "/models/mosquito_in_amber.glb" as const,
    initialRotationDeg: { x: 0, y: 0, z: 0 },
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
      amountRad: Math.PI * 0.5,
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

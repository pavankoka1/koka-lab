"use client";

import { Center, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SCENE_CONFIG } from "./sceneConfig";

useGLTF.preload(SCENE_CONFIG.model.path);

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function orbitDirection(azimuthDeg: number, elevationDeg: number) {
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  return new THREE.Vector3(
    Math.cos(el) * Math.sin(az),
    Math.sin(el),
    Math.cos(el) * Math.cos(az)
  ).normalize();
}

function distanceForDiameterFraction(
  diameter: number,
  camera: THREE.PerspectiveCamera,
  fraction: number
) {
  const vFOV = (camera.fov * Math.PI) / 180;
  const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * camera.aspect);
  const denom = 2 * fraction * Math.tan(hFOV / 2);
  if (denom < 1e-6) return 20;
  return diameter / denom;
}

/**
 * Maps config percent to horizontal fraction of viewport width for the object center.
 * 0 → 0.5 (center), +100 → 1 (right), -100 → 0 (left), +50 → 0.75 (3/4 from left).
 */
function objectCenterXFracFromPercent(percent: number) {
  const p = THREE.MathUtils.clamp(percent, -100, 100);
  return 0.5 + (p / 100) * 0.5;
}

function computeBounds(root: THREE.Object3D): THREE.Box3 {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().makeEmpty();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    const g = mesh.geometry;
    if (!g) return;
    if (!g.boundingBox) g.computeBoundingBox();
    if (!g.boundingBox) return;
    const b = g.boundingBox.clone();
    b.applyMatrix4(mesh.matrixWorld);
    box.union(b);
  });
  if (box.isEmpty()) {
    return new THREE.Box3().setFromObject(root);
  }
  return box;
}

type Props = {
  scrollT: number;
};

export function SceneStage({ scrollT }: Props) {
  const scrollRef = useRef(scrollT);
  scrollRef.current = scrollT;

  const gltf = useGLTF(SCENE_CONFIG.model.path);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  /** Screen-X offset only (world space along camera right); camera stays on orbit + lookAt(lt). */
  const lateralGroup = useRef<THREE.Group>(null);
  const carGroup = useRef<THREE.Group>(null);
  const rawFramedDistance = useRef(14);
  const boundingRadius = useRef(1);
  const orbitDir = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const horizRight = useRef(new THREE.Vector3());
  /** Same basis as `Camera.lookAt`: +X is screen-right in world space at `basePos`. */
  const lookAligner = useRef(new THREE.Object3D());

  const { camera, size, invalidate } = useThree();

  const recomputeGeometryFit = () => {
    if (lateralGroup.current) lateralGroup.current.position.set(0, 0, 0);
    if (!carGroup.current) return;
    const cam = camera as THREE.PerspectiveCamera;
    const cfg = SCENE_CONFIG;
    cam.fov = cfg.camera.fov;
    cam.aspect = size.width / Math.max(1, size.height);
    cam.updateProjectionMatrix();

    const box = computeBounds(carGroup.current);
    if (box.isEmpty()) {
      rawFramedDistance.current = THREE.MathUtils.clamp(14, 2, 120);
      boundingRadius.current = 1;
      lookTarget.current.set(
        cfg.camera.lookAtOffset.x,
        cfg.camera.lookAtOffset.y,
        cfg.camera.lookAtOffset.z
      );
      invalidate();
      return;
    }

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    boundingRadius.current = Math.max(sphere.radius, 0.025);
    const diameter = Math.max(sphere.radius * 2, 0.05);

    lookTarget.current.copy(sphere.center);
    lookTarget.current.x += cfg.camera.lookAtOffset.x;
    lookTarget.current.y += cfg.camera.lookAtOffset.y;
    lookTarget.current.z += cfg.camera.lookAtOffset.z;

    const baseFrac = Math.max(0.02, cfg.framing.fitWidthFraction);
    rawFramedDistance.current =
      distanceForDiameterFraction(diameter, cam, baseFrac) *
      cfg.framing.distanceScale;

    rawFramedDistance.current = THREE.MathUtils.clamp(
      rawFramedDistance.current,
      0.5,
      400
    );
    invalidate();
  };

  const framingGeomKey = `${SCENE_CONFIG.framing.fitWidthFraction}-${SCENE_CONFIG.framing.distanceScale}-${SCENE_CONFIG.camera.fov}`;

  useLayoutEffect(() => {
    recomputeGeometryFit();
  }, [camera, size.width, size.height, scene, framingGeomKey]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => recomputeGeometryFit());
    });
    return () => cancelAnimationFrame(id);
  }, [scene, size.width, size.height, framingGeomKey]);

  const baseRotRad = useMemo(
    () =>
      [
        THREE.MathUtils.degToRad(SCENE_CONFIG.model.initialRotationDeg.x),
        THREE.MathUtils.degToRad(SCENE_CONFIG.model.initialRotationDeg.y),
        THREE.MathUtils.degToRad(SCENE_CONFIG.model.initialRotationDeg.z),
      ] as const,
    [
      SCENE_CONFIG.model.initialRotationDeg.x,
      SCENE_CONFIG.model.initialRotationDeg.y,
      SCENE_CONFIG.model.initialRotationDeg.z,
    ]
  );

  useFrame((state) => {
    const cfg = SCENE_CONFIG;

    orbitDir.current.copy(
      orbitDirection(cfg.camera.azimuthDeg, cfg.camera.elevationDeg)
    );

    const t = state.clock.elapsedTime;
    const scroll = Math.min(1, Math.max(0, scrollRef.current));

    const objectDiameter = Math.max(boundingRadius.current * 2, 1e-3);
    const bob =
      Math.sin(t * cfg.motion.floatSpeed) *
      objectDiameter *
      cfg.motion.floatExtentFraction;

    const rotEnd = cfg.scroll.phaseEnd;
    const rotAxis = cfg.scroll.axis as "x" | "y" | "z";
    const [rotSeg1, rotSeg2Extra] = cfg.scroll.rot;
    const [[d1a, d1b], [d2a, d2b]] = cfg.scroll.dist;
    let rx = 0;
    let ry = 0;
    let rz = 0;
    let zoomT = 0;
    let distMul = 1;

    if (scroll <= rotEnd) {
      const u = rotEnd > 0 ? scroll / rotEnd : 1;
      const e = easeInOutCubic(u);
      distMul = THREE.MathUtils.lerp(d1a, d1b, e);
      const angle = e * rotSeg1;
      if (rotAxis === "x") rx = angle;
      else if (rotAxis === "y") ry = angle;
      else rz = angle;
    } else {
      const end = rotSeg1;
      if (rotAxis === "x") rx = end;
      else if (rotAxis === "y") ry = end;
      else rz = end;

      const denom = 1 - rotEnd;
      const u = denom > 1e-9 ? (scroll - rotEnd) / denom : 1;
      zoomT = easeInOutCubic(u);
      distMul = THREE.MathUtils.lerp(d2a, d2b, zoomT);
      const p2 = zoomT * rotSeg2Extra;
      if (rotAxis === "x") rx += p2;
      else if (rotAxis === "y") ry += p2;
      else rz += p2;
    }

    if (carGroup.current) {
      carGroup.current.rotation.set(rx, ry, rz);
      carGroup.current.position.set(0, bob, 0);
    }

    const appearance = Math.max(0.05, cfg.framing.appearanceScale);
    let d0 = rawFramedDistance.current / appearance;
    const r = boundingRadius.current;
    d0 = Math.max(d0, r * 1.08);

    const dist = d0 * distMul;

    const lt = lookTarget.current;
    const basePos = lt
      .clone()
      .add(orbitDir.current.clone().multiplyScalar(dist));

    /**
     * Screen-right in world space = camera +X after lookAt (not view×up; matches Three.js).
     * Lateral offset is on `lateralGroup`, not the camera.
     */
    const align = lookAligner.current;
    align.position.copy(basePos);
    align.up.set(0, 1, 0);
    align.lookAt(lt);
    align.updateMatrixWorld(true);
    horizRight.current.setFromMatrixColumn(align.matrixWorld, 0);
    if (horizRight.current.lengthSq() < 1e-10) {
      horizRight.current.set(1, 0, 0);
    } else {
      horizRight.current.normalize();
    }

    /**
     * Horizontal ease uses `window.scrollY` (not normalized page `scrollT`) so at `scrollY === 0`
     * the full `objectCenterOffsetXPercent` applies; scrolling down moves toward center.
     */
    const layout = cfg.layout as {
      objectCenterOffsetEaseDelayViewportHeights?: number;
      objectCenterOffsetEaseOverViewportHeights?: number;
    };
    let offsetScrollT = 0;
    if (typeof globalThis.window !== "undefined") {
      const wy = globalThis.window.scrollY;
      const vh = Math.max(1, globalThis.window.innerHeight);
      const delayVh = Math.max(
        0,
        layout.objectCenterOffsetEaseDelayViewportHeights ?? 0
      );
      const easeVh = Math.max(
        0.05,
        layout.objectCenterOffsetEaseOverViewportHeights ?? 1
      );
      const scrollAfterDelay = Math.max(0, wy - delayVh * vh);
      offsetScrollT = Math.min(1, scrollAfterDelay / (easeVh * vh));
    }
    const offsetMix = easeInOutCubic(offsetScrollT);
    const initialPct = Number(cfg.layout.objectCenterOffsetXPercent);
    const pct = THREE.MathUtils.lerp(initialPct, 0, offsetMix);
    const centerXFrac = objectCenterXFracFromPercent(pct);
    const vw = Math.max(1, size.width);
    const targetCenterX = centerXFrac * vw;
    const viewportCenterX = vw * 0.5;
    const screenOffsetFromCenterPx = targetCenterX - viewportCenterX;

    const cam = camera as THREE.PerspectiveCamera;
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * cam.aspect);
    const visibleWorldWidth = 2 * dist * Math.tan(hfov / 2);
    const worldPerPixelX = visibleWorldWidth / vw;
    const mul = Number(
      (cfg.layout as { objectCenterStrafeMultiplier?: number })
        .objectCenterStrafeMultiplier ?? 1
    );
    /** World translation along camera right so the mesh shifts on screen (px → world at `dist`). */
    const lateralWorld = screenOffsetFromCenterPx * worldPerPixelX * mul;
    if (lateralGroup.current) {
      lateralGroup.current.position
        .copy(horizRight.current)
        .multiplyScalar(lateralWorld);
    }

    camera.position.copy(basePos);
    camera.lookAt(lt.x, lt.y, lt.z);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cfg.camera.fov;
      camera.aspect = size.width / Math.max(1, size.height);
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={lateralGroup}>
      <group ref={carGroup}>
        <group rotation={baseRotRad}>
          <Center position={[0, 0, 0]}>
            <primitive object={scene} />
          </Center>
        </group>
      </group>
    </group>
  );
}

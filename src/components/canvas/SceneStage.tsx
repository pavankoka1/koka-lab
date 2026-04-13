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

  const carGroup = useRef<THREE.Group>(null);
  const rawFramedDistance = useRef(14);
  const boundingRadius = useRef(1);
  const orbitDir = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  const { camera, size, invalidate } = useThree();

  const recomputeGeometryFit = () => {
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

    const rotEnd = cfg.scroll.rotation.phaseEnd;
    const rotAxis = cfg.scroll.rotation.axis as "x" | "y" | "z";
    const p2Axis = cfg.scroll.zoom.phase2RotationAxis as "x" | "y" | "z";
    let rx = 0;
    let ry = 0;
    let rz = 0;
    let zoomT = 0;

    if (scroll <= rotEnd) {
      const u = rotEnd > 0 ? scroll / rotEnd : 1;
      const angle = easeInOutCubic(u) * cfg.scroll.rotation.amountRad;
      if (rotAxis === "x") rx = angle;
      else if (rotAxis === "y") ry = angle;
      else rz = angle;
    } else {
      const end = cfg.scroll.rotation.amountRad;
      if (rotAxis === "x") rx = end;
      else if (rotAxis === "y") ry = end;
      else rz = end;

      const u = (scroll - rotEnd) / (1 - rotEnd);
      zoomT = easeInOutCubic(u);
      const p2 = zoomT * cfg.scroll.zoom.phase2RotationAmountRad;
      if (p2Axis === "x") rx += p2;
      else if (p2Axis === "y") ry += p2;
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

    const dist = THREE.MathUtils.lerp(
      d0,
      d0 * cfg.scroll.zoom.endDistanceMul,
      zoomT
    );

    const lt = lookTarget.current;
    const pos = lt.clone().add(orbitDir.current.clone().multiplyScalar(dist));

    camera.position.copy(pos);
    camera.lookAt(lt.x, lt.y, lt.z);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cfg.camera.fov;
      camera.aspect = size.width / Math.max(1, size.height);
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={carGroup}>
      <group rotation={baseRotRad}>
        <Center position={[0, 0, 0]}>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  );
}

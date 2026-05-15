"use client";

import { Environment, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { SceneStage } from "./SceneStage";
import { SCENE_CONFIG } from "./sceneConfig";

type Props = {
  scrollT: number;
  onAssetProgress: (progress: number, active: boolean) => void;
};

function ProgressReporter({
  onAssetProgress,
}: {
  onAssetProgress: (progress: number, active: boolean) => void;
}) {
  const { progress, active } = useProgress();
  const onAssetProgressRef = useRef(onAssetProgress);
  onAssetProgressRef.current = onAssetProgress;

  useEffect(() => {
    onAssetProgressRef.current(progress, active);
  }, [progress, active]);

  return null;
}

export function Experience({ scrollT, onAssetProgress }: Props) {
  const stableCb = useCallback(
    (p: number, a: boolean) => {
      onAssetProgress(p, a);
    },
    [onAssetProgress]
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        camera={{
          position: [0, 0.55, 16],
          fov: SCENE_CONFIG.camera.fov,
          near: 0.1,
          far: 500,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.fog = new THREE.FogExp2(0x050508, 0.012);
        }}
      >
        <ProgressReporter onAssetProgress={stableCb} />
        <color attach="background" args={["#050508"]} />
        <hemisphereLight
          color="#e8e4f0"
          groundColor="#0a0a10"
          intensity={0.55}
        />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.35}
          castShadow={false}
        />
        <directionalLight
          position={[-10, 8, -8]}
          intensity={0.55}
          color="#c4b5fd"
        />
        <spotLight
          position={[4, 12, 8]}
          angle={0.45}
          penumbra={0.85}
          intensity={0.85}
          color="#faf5ff"
        />
        <Suspense fallback={null}>
          <SceneStage scrollT={scrollT} />
          <Environment preset="night" environmentIntensity={0.35} />
        </Suspense>
      </Canvas>
    </div>
  );
}

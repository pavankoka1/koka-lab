"use client";

import { Line, Sparkles, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { site } from "@/lib/site";

/**
 * Top-right brand: 3D wordmark + sparks + jittered “lightning” polylines.
 * Keeps a small isolated Canvas (separate from the hero WebGL scene).
 */
function Bolts({
  color = "#67e8f9",
  segments = 6,
}: {
  color?: string;
  segments?: number;
}) {
  const g = useRef<THREE.Group>(null);
  const seed = useMemo(() => Math.random() * 1000, []);

  const lines = useMemo(() => {
    return Array.from({ length: 3 }, (_, b) => {
      const pts: THREE.Vector3[] = [];
      let x = -0.55 + b * 0.35;
      let y = 0.35;
      for (let i = 0; i < segments; i++) {
        pts.push(new THREE.Vector3(x, y, 0.02 + b * 0.01));
        x += 0.08 + Math.sin(seed + b + i) * 0.04;
        y -= 0.12 + Math.cos(seed * 0.7 + i) * 0.05;
      }
      return pts;
    });
  }, [seed, segments]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!g.current) return;
    g.current.children.forEach((child, i) => {
      child.visible = 0.55 + 0.45 * Math.sin(t * (14 + i * 3) + seed) > 0.35;
    });
  });

  return (
    <group ref={g}>
      {lines.map((pts, i) => (
        <Line
          // eslint-disable-next-line react/no-array-index-key -- static bolt layers
          key={i}
          points={pts}
          color={color}
          lineWidth={1.25}
          transparent
          opacity={0.75}
          dashed={false}
        />
      ))}
    </group>
  );
}

function WordmarkScene() {
  const group = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.35) * 0.06;
      group.current.rotation.x = Math.sin(t * 0.28) * 0.035;
    }
    if (keyLight.current) {
      keyLight.current.intensity =
        2.1 + Math.sin(t * 11) * 0.65 + Math.sin(t * 27) * 0.35;
    }
    if (rim.current) {
      rim.current.intensity = 0.85 + Math.sin(t * 18 + 1) * 0.4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight
        ref={keyLight}
        position={[0.6, 0.4, 2.2]}
        color="#c4b5fd"
        distance={6}
      />
      <pointLight
        ref={rim}
        position={[-1.2, -0.2, 0.8]}
        color="#22d3ee"
        distance={5}
      />

      <group ref={group} position={[0, -0.05, 0]}>
        <Bolts />
        <Sparkles
          count={64}
          scale={[2.8, 1.2, 0.8]}
          size={2.2}
          speed={0.65}
          opacity={0.85}
          color="#e9d5ff"
        />
        <Sparkles
          count={28}
          scale={[2.4, 1, 0.6]}
          size={1.2}
          speed={1.2}
          opacity={0.55}
          color="#67e8f9"
        />

        <Text
          fontSize={0.34}
          letterSpacing={0.06}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.018}
          outlineColor="#5b21b6"
          outlineOpacity={0.9}
          color="#f4f4f8"
        >
          {site.brand}
          <meshStandardMaterial
            metalness={0.45}
            roughness={0.28}
            emissive="#6d28d9"
            emissiveIntensity={0.85}
          />
        </Text>
      </group>
    </>
  );
}

export function KokaMark3D() {
  const reduced =
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ===
    true;

  if (reduced) {
    return (
      <div className="fixed right-5 top-5 z-[60] sm:right-8 sm:top-8">
        <a
          href="/"
          className="group flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/90 px-4 py-2.5 font-mono text-sm font-semibold tracking-[0.2em] text-[var(--text-primary)] shadow-[0_0_40px_var(--glow)] backdrop-blur-md transition-colors hover:border-violet-500/35"
          aria-label={`${site.name} — home`}
        >
          {site.brand}
        </a>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-[60] sm:right-8 sm:top-8">
      <a
        href="/"
        className="group block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-secondary)]/80 p-1 shadow-[0_0_48px_var(--glow)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-violet-500/35 hover:shadow-[0_0_64px_rgba(139,92,246,0.22)]"
        aria-label={`${site.name} — home`}
      >
        <div className="relative h-[52px] w-[min(42vw,200px)] overflow-hidden rounded-[14px] sm:h-[56px] sm:w-[220px]">
          <Canvas
            orthographic
            camera={{ position: [0, 0, 4], zoom: 95 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <Suspense fallback={null}>
              <WordmarkScene />
            </Suspense>
          </Canvas>
        </div>
      </a>
      <p className="mt-1.5 text-right font-mono text-[9px] uppercase tracking-[0.35em] text-[var(--text-dim)] opacity-90">
        live mark
      </p>
    </div>
  );
}

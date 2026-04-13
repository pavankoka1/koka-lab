"use client";

import { useEffect, useRef } from "react";

/** Normalized device coords -1..1 for pointer; smooth in R3F useFrame. */
export function usePointerNdc() {
  const ndc = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ndc.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return ndc;
}

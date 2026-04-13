"use client";

import { useEffect, useState } from "react";

/**
 * Normalized document scroll 0–1. Cheap listener with passive flag.
 */
export function useDocumentScroll() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const v = max <= 0 ? 0 : window.scrollY / max;
      setT(Math.max(0, Math.min(1, v)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return t;
}

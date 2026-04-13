"use client";

/**
 * Mesh gradients + vignette behind 3D — compositor-friendly, no layout thrash.
 */
export function AmbientBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-[8] overflow-hidden"
      aria-hidden
    >
      <div
        className="mesh-drift absolute -left-1/2 -top-1/2 h-[200%] w-[200%] opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 50% 45% at 28% 22%, rgba(139, 92, 246, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 40% 50% at 72% 78%, rgba(52, 211, 153, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 55% 40% at 50% 48%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(5, 5, 8, 0.75) 100%)",
        }}
      />
    </div>
  );
}

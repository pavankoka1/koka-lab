import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Matches `icon.svg`: dark tile + violet→cyan flame (Material/Lucide-inspired silhouette). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06050c",
          borderRadius: 52,
          border: "2px solid rgba(76, 29, 153, 0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 112,
            height: 124,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Outer flame body */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              width: 72,
              height: 98,
              borderRadius: "48% 48% 46% 46% / 64% 64% 36% 36%",
              background:
                "linear-gradient(175deg, #67e8f9 0%, #c4b5fd 38%, #7c3aed 72%, #4c1d95 100%)",
              boxShadow: "0 0 28px rgba(124, 58, 237, 0.45)",
            }}
          />
          {/* Side lobes */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 8,
              width: 34,
              height: 62,
              borderRadius: "50%",
              background: "linear-gradient(160deg, #a78bfa 0%, #5b21b6 100%)",
              opacity: 0.92,
              transform: "rotate(-12deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 8,
              width: 34,
              height: 62,
              borderRadius: "50%",
              background: "linear-gradient(200deg, #a78bfa 0%, #5b21b6 100%)",
              opacity: 0.92,
              transform: "rotate(12deg)",
            }}
          />
          {/* Inner glow */}
          <div
            style={{
              position: "absolute",
              bottom: 28,
              width: 38,
              height: 52,
              borderRadius: "50%",
              background:
                "linear-gradient(180deg, rgba(254, 240, 255, 0.55) 0%, rgba(244, 114, 182, 0.15) 100%)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}

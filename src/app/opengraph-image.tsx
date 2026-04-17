import { site } from "@/lib/site";
import { ImageResponse } from "next/og";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(155deg, #050508 0%, #1e1b4b 42%, #0f0a1a 100%)",
          color: "#f4f4f8",
          fontFamily:
            'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#a78bfa",
            marginBottom: 20,
          }}
        >
          Portfolio · Labs
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.35,
            color: "#c4c2d4",
            maxWidth: 820,
          }}
        >
          Frontend engineer · WebGL & performance — interactive labs & real-time web.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            fontSize: 20,
            color: "#6b6680",
          }}
        >
          {site.url.replace(/^https:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}

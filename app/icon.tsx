/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #05070d 0%, #111827 48%, #0f172a 100%)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #06b6d4 0%, #ec4899 52%, #facc15 100%)",
            color: "#05070d",
            fontSize: "30px",
            fontWeight: 900,
            letterSpacing: "-0.08em",
          }}
        >
          P
        </div>
      </div>
    ),
    size,
  );
}

/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  const baseUrl =
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const logoUrl = new URL("/logo%20header%20(2).png", baseUrl).href;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, rgb(255, 255, 255) 0%, #f7f8fa 100%)",
          border: "1px solid rgba(15, 15, 15, 0.12)",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <img
          src={logoUrl}
          alt="Prismarq Comunicacao Visual"
          style={{
            width: "54px",
            height: "32px",
            objectFit: "contain",
          }}
        />
      </div>
    ),
    size,
  );
}

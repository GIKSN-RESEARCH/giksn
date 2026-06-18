import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 120) ?? site.name;
  const subtitle =
    searchParams.get("subtitle")?.slice(0, 160) ?? site.tagline;
  const kind = searchParams.get("kind")?.slice(0, 40) ?? "Research";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #141414 55%, #1a1208 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#f97316",
          }}
        >
          {site.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#22d3ee",
            }}
          >
            {kind}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#a3a3a3",
              maxWidth: "920px",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#737373",
          }}
        >
          <span>giksn.com</span>
          <span>Open frontier research</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
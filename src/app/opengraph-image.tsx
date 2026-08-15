import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "GIKSN Research. An independent research lab exploring what comes next in intelligence, computing and systems.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const [logoData, blankaData] = await Promise.all([
    readFile(join(process.cwd(), "public/logo.png")),
    readFile(join(process.cwd(), "public/fonts/Blanka-Regular.woff")),
  ]);

  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#faf7f2",
          color: "#281e32",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Teal rule matching site masthead */}
        <div
          style={{
            height: 10,
            width: "100%",
            background: "#35a29f",
            display: "flex",
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              width={72}
              height={72}
              alt=""
              style={{ objectFit: "contain" }}
            />
            <div
              style={{
                fontFamily: "Blanka",
                fontSize: 28,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8b8390",
              }}
            >
              Independent research lab
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: 22,
                fontFamily: "Blanka",
                fontSize: 92,
                lineHeight: 0.95,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#281e32" }}>GIKSN</span>
              <span style={{ color: "#35a29f" }}>Research</span>
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "#5b5263",
                maxWidth: 980,
                fontStyle: "italic",
              }}
            >
              An independent research lab exploring what comes next in
              intelligence, computing and systems.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(40, 30, 50, 0.12)",
              paddingTop: 28,
              fontSize: 18,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8b8390",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <span>AI · Deeptech · Hardware · Distributed Systems</span>
            <span style={{ color: "#35a29f" }}>giksn.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Blanka",
          data: blankaData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}

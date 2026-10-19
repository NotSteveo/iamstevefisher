import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { asset } from "./assets";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const GREEN = "#40bf7f";
const INK = "#0c0407";

const fontFile = (weight: 400 | 600) =>
  readFile(
    join(process.cwd(), `node_modules/@fontsource/outfit/files/outfit-latin-${weight}-normal.woff`),
  );

/** A /public (or remote CDN, via the asset map) image as a small JPEG data URI Satori can draw. */
async function imageDataUri(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  const local = asset(url);
  if (!local.startsWith("/")) return undefined;
  try {
    const buf = await sharp(join(process.cwd(), "public", local))
      .resize({ width: 900, height: 700, fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

async function logoDataUri(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "public/images/logo.svg"), "utf8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export type OgInput = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Image URL as stored in content (CDN URL or /images/...). */
  image?: string;
};

export async function renderOg({ eyebrow, title, description, image }: OgInput) {
  const [regular, semibold, art, logo] = await Promise.all([
    fontFile(400),
    fontFile(600),
    imageDataUri(image),
    logoDataUri(),
  ]);

  const titleSize = title.length > 34 ? 60 : title.length > 20 ? 72 : 88;
  const textWidth = art ? 480 : 1000;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          backgroundImage: `radial-gradient(circle at 12% 0%, rgba(64,191,127,0.22), rgba(12,4,7,0) 55%)`,
          color: "#fff",
          fontFamily: "Outfit",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: textWidth, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={30} height={35} alt="" />
            <div style={{ fontSize: 28, fontWeight: 600 }}>I am Steve Fisher.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 26,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: GREEN,
                marginBottom: 22,
              }}
            >
              {eyebrow}
            </div>
            <div style={{ fontSize: titleSize, fontWeight: 600, lineHeight: 1.04, letterSpacing: -2 }}>
              {title}
            </div>
            {description ? (
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "#b3b3b3",
                  marginTop: 26,
                  maxWidth: art ? 470 : 900,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>

        {art ? (
          <div style={{ display: "flex", flex: 1, marginLeft: 48, alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={art}
              alt=""
              style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 28 }}
            />
          </div>
        ) : null}
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Outfit", data: regular, weight: 400, style: "normal" },
        { name: "Outfit", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}

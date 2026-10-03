/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { DATA } from "@/data/resume";

// Shared by the opengraph-image routes. Those files still need their own
// literal `runtime`/`size` exports since Next reads them statically.
export const OG_SIZE = { width: 1200, height: 630 };

async function loadFonts() {
  try {
    const [cabinetGrotesk, clashDisplay] = await Promise.all([
      fetch(
        new URL("../../public/fonts/CabinetGrotesk-Medium.ttf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
      fetch(
        new URL("../../public/fonts/ClashDisplay-Semibold.ttf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
    ]);
    return [
      { name: "Cabinet Grotesk", data: cabinetGrotesk, weight: 400, style: "normal" },
      { name: "Cabinet Grotesk", data: cabinetGrotesk, weight: 700, style: "normal" },
      { name: "Clash Display", data: clashDisplay, weight: 600, style: "normal" },
    ] as const;
  } catch (error) {
    console.error("Failed to load fonts:", error);
    return undefined;
  }
}

// Satori aborts the whole response mid-stream if an <img> can't be loaded, so
// fetch the avatar up front and just leave it out when that fails (e.g. the
// site URL isn't reachable yet).
async function loadAvatar() {
  if (!DATA.avatarUrl) return undefined;
  try {
    const res = await fetch(new URL(DATA.avatarUrl, DATA.url));
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return undefined;

    const bytes = new Uint8Array(await res.arrayBuffer());
    // The content-type comes from the file extension, so a JPEG saved as .png
    // would be mislabelled and silently dropped by satori. Check the bytes.
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:${isJpeg ? "image/jpeg" : type};base64,${btoa(binary)}`;
  } catch (error) {
    console.error("Failed to load avatar for OG image:", error);
    return undefined;
  }
}

const styles = {
  outerWrapper: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  middleWrapper: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    position: "relative",
    padding: "40px",
  },
  wrapper: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fafafa",
    position: "relative",
    padding: "40px",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
  },
  imageSection: {
    position: "absolute",
    top: "40px",
    left: "40px",
    display: "flex",
    alignItems: "center",
    zIndex: "2",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    height: "100%",
    width: "100%",
    position: "relative",
    zIndex: "1",
  },
  image: {
    width: "140px",
    height: "140px",
    borderRadius: "24px",
    border: "4px solid #e5e5e5",
    objectFit: "cover",
  },
  title: {
    fontFamily: "Clash Display",
    fontSize: "48px",
    fontWeight: "600",
    lineHeight: "1.1",
    textAlign: "left",
    color: "#000000",
    marginBottom: "16px",
    letterSpacing: "-0.02em",
    maxWidth: "900px",
  },
  description: {
    fontSize: "20px",
    fontWeight: "400",
    lineHeight: "1.5",
    textAlign: "left",
    maxWidth: "800px",
    color: "#404040",
    marginBottom: "32px",
    textWrap: "balance",
  },
  date: {
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.5",
    textAlign: "left",
    color: "#666666",
    marginBottom: "32px",
  },
} as const;

type OgImageOptions = {
  title: string;
  description?: string;
  /** Already formatted, shown under the description */
  date?: string;
  imageAlt?: string;
};

export async function renderOgImage({
  title,
  description,
  date,
  imageAlt = title,
}: OgImageOptions) {
  try {
    const [fonts, imageUrl] = await Promise.all([loadFonts(), loadAvatar()]);

    return new ImageResponse(
      (
        <div style={styles.outerWrapper}>
          <div style={styles.middleWrapper}>
            <div style={styles.wrapper}>
              {imageUrl && (
                <div style={styles.imageSection}>
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    width={140}
                    height={140}
                    style={styles.image}
                  />
                </div>
              )}
              <div style={styles.mainContainer}>
                <div style={styles.title}>{title}</div>
                {description && (
                  <div
                    style={{
                      ...styles.description,
                      // the date line carries the bottom spacing when present
                      marginBottom: date ? "16px" : styles.description.marginBottom,
                    }}
                  >
                    {description}
                  </div>
                )}
                {date && <div style={styles.date}>{date}</div>}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...OG_SIZE,
        fonts: fonts ? [...fonts] : undefined,
      }
    );
  } catch (error) {
    console.error("Error generating OpenGraph image:", error);
    return new Response(
      `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}

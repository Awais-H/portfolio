import { DATA } from "@/data/resume";
import { renderOgImage } from "@/lib/og";

export const runtime = "edge";

export const alt = "Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Blog",
    description: `Posts and write-ups by ${DATA.name}.`,
  });
}

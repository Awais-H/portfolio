import { allPosts } from "content-collections";
import { renderOgImage } from "@/lib/og";
import { formatDate } from "@/lib/utils";

export const runtime = "edge";

export const alt = "Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allPosts.find((p) => p._meta.path.replace(/\.mdx$/, "") === slug);

  if (!post) {
    return renderOgImage({ title: "Post Not Found", imageAlt: "Blog Post" });
  }

  return renderOgImage({
    title: post.title,
    description: post.summary,
    date: post.publishedAt ? formatDate(post.publishedAt) : undefined,
  });
}

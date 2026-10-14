import type { MetadataRoute } from "next";
import { DATA } from "@/data/resume";
import { getPostSlug, getSortedPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPosts().map((post) => ({
    url: `${DATA.url}/blog/${getPostSlug(post)}`,
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  return [
    { url: DATA.url, changeFrequency: "monthly", priority: 1 },
    // Only list the blog once there's something on it
    ...(posts.length > 0 ? [{ url: `${DATA.url}/blog` }, ...posts] : []),
  ];
}

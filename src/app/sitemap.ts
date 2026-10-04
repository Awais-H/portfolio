import type { MetadataRoute } from "next";
import { allPosts } from "content-collections";
import { DATA } from "@/data/resume";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = allPosts.map((post) => ({
    url: `${DATA.url}/blog/${post._meta.path.replace(/\.mdx$/, "")}`,
    lastModified: post.updatedAt ?? post.publishedAt,
  }));

  return [
    { url: DATA.url, changeFrequency: "monthly", priority: 1 },
    // Only list the blog once there's something on it
    ...(posts.length > 0 ? [{ url: `${DATA.url}/blog` }, ...posts] : []),
  ];
}

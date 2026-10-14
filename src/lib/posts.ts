import { allPosts } from "content-collections";

export type Post = (typeof allPosts)[number];

export function getPostSlug(post: Post) {
  return post._meta.path.replace(/\.mdx$/, "");
}

/** Newest first. */
export function getSortedPosts() {
  return [...allPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

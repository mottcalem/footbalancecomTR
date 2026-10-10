import { createServerFn } from "@tanstack/react-start";

export const getLegacyContent = createServerFn({ method: "GET" })
  .inputValidator((path: string) => path)
  .handler(async ({ data: path }) => {
    const { default: posts } = await import("@/data/blog-posts.json");
    const { default: pages } = await import("@/data/legacy-pages.json");
    const normalized = `/${path.replace(/^\/+|\/+$/g, "")}/`;
    const post = posts.find((p) => p.path === normalized);
    if (post) return { kind: "post" as const, post };
    const page = pages.find((p) => p.path === normalized);
    if (page) return { kind: "page" as const, page };
    return null;
  });

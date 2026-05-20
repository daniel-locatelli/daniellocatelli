import { defineMiddleware } from "astro:middleware";
import { resolveMarkdownTarget } from "@/lib/resolve-markdown-target";

export { resolveMarkdownTarget } from "@/lib/resolve-markdown-target";

export const onRequest = defineMiddleware(async (ctx, next) => {
  const target = resolveMarkdownTarget({
    pathname: ctx.url.pathname,
    accept: ctx.request.headers.get("accept"),
  });
  if (target) {
    return ctx.rewrite(target);
  }
  return next();
});

import { defineMiddleware } from "astro:middleware";
import { resolveMarkdownTarget } from "@/lib/resolve-markdown-target";

export { resolveMarkdownTarget } from "@/lib/resolve-markdown-target";

export const onRequest = defineMiddleware(async (ctx, next) => {
  // Force HTTPS on document routes (audit 2026-08-21, sec.tls.http-not-redirected).
  // The definitive fix is the Cloudflare zone toggle "Always Use HTTPS" —
  // static assets excluded via run_worker_first bypass this middleware.
  if (import.meta.env.PROD && ctx.url.protocol === "http:") {
    const httpsUrl = new URL(ctx.url);
    httpsUrl.protocol = "https:";
    return ctx.redirect(httpsUrl.toString(), 301);
  }

  const target = resolveMarkdownTarget({
    pathname: ctx.url.pathname,
    accept: ctx.request.headers.get("accept"),
  });
  if (target) {
    return ctx.rewrite(target);
  }
  return next();
});

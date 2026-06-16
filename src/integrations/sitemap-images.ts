import type { AstroIntegration } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";
import { siteConfig } from "../config/site";

/**
 * Adds <image:image> entries to the sitemap by reading each page's already
 * resolved og:image from the built HTML. See docs/sitemap-image-spec.md
 * (Strategy B): this reuses the post-build, content-hashed cover URL that the
 * page already advertises, instead of re-running Astro's image pipeline.
 *
 * MUST run after @astrojs/sitemap. Declare it AFTER sitemap() in the
 * integrations array; the disk check below fails fast if it does not.
 *
 * Cover-less pages fall back to siteConfig.defaultSocialImage for og:image; we
 * skip that so the sitemap only lists genuine per-page covers.
 */
export default function sitemapImages(): AstroIntegration {
  return {
    name: "sitemap-images",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);

        const sitemapFiles = (await fs.readdir(distDir)).filter(
          (f) => /^sitemap-\d+\.xml$/.test(f),
        );
        if (sitemapFiles.length === 0) {
          throw new Error(
            "[sitemap-images] No sitemap-<n>.xml found. This integration must " +
              "be declared AFTER @astrojs/sitemap in astro.config.mts.",
          );
        }

        const defaultSocialImage = new URL(
          siteConfig.defaultSocialImage,
          siteConfig.website,
        ).href;

        let totalImages = 0;
        for (const file of sitemapFiles) {
          const filePath = path.join(distDir, file);
          const xml = await fs.readFile(filePath, "utf-8");
          const { xml: next, count } = await annotateSitemap(
            xml,
            distDir,
            defaultSocialImage,
            logger,
          );
          if (count > 0) await fs.writeFile(filePath, next, "utf-8");
          totalImages += count;
        }
        logger.info(`Added ${totalImages} <image:image> entries to the sitemap.`);
      },
    },
  };
}

async function annotateSitemap(
  xml: string,
  distDir: string,
  defaultSocialImage: string,
  logger: { warn: (m: string) => void },
): Promise<{ xml: string; count: number }> {
  let count = 0;

  const next = await replaceAsync(
    xml,
    /<url>([\s\S]*?)<\/url>/g,
    async (block) => {
      if (block.includes("<image:image>")) return block; // idempotent
      const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
      if (!loc) return block;

      const htmlPath = locToHtmlPath(loc, distDir);
      let html: string;
      try {
        html = await fs.readFile(htmlPath, "utf-8");
      } catch {
        // Not every <loc> is a prerendered HTML file; skip quietly-ish.
        logger.warn(`No HTML for ${loc} (looked at ${htmlPath}); no image added.`);
        return block;
      }

      const ogImage = extractOgImage(html);
      if (!ogImage || ogImage === defaultSocialImage) return block;

      count++;
      const imageBlock = `\n    <image:image>\n      <image:loc>${escapeXml(
        ogImage,
      )}</image:loc>\n    </image:image>`;
      return block.replace("</url>", `${imageBlock}\n  </url>`);
    },
  );

  return { xml: next, count };
}

/** Map a sitemap <loc> URL to its prerendered HTML file on disk. */
export function locToHtmlPath(loc: string, distDir: string): string {
  let pathname: string;
  try {
    pathname = new URL(loc).pathname;
  } catch {
    pathname = loc;
  }
  // "/de/projects/x/" -> "de/projects/x", "/" -> ""
  const rel = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  return path.join(distDir, rel, "index.html");
}

function extractOgImage(html: string): string | null {
  const { document } = parseHTML(html);
  const meta = document.querySelector('meta[property="og:image"]');
  return meta?.getAttribute("content") ?? null;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/** String.replace with an async replacer, preserving match order. */
async function replaceAsync(
  str: string,
  regex: RegExp,
  replacer: (match: string, ...args: string[]) => Promise<string>,
): Promise<string> {
  const tasks: Promise<string>[] = [];
  str.replace(regex, (match, ...args) => {
    tasks.push(replacer(match, ...(args as string[])));
    return match;
  });
  const results = await Promise.all(tasks);
  return str.replace(regex, () => results.shift()!);
}

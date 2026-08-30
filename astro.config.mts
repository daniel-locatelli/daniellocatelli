import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import { CUSTOM_DOMAIN, BASE_PATH } from "./src/config/server";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { rehypeLazyImages } from "./src/lib/rehype-lazy-images";
import { rehypeFigure } from "./src/lib/rehype-figure";
import { rehypeFootnoteTooltips } from "./src/lib/rehype-footnote-tooltips";
import { remarkImageToAstroImage } from "./src/lib/remark-image-to-astro-image";
import { presentationSlides } from "./src/lib/vite-presentation-slides";
import linkMetadataCache from "./src/integrations/link-metadata-cache";
import { serializeLastmod } from "./src/lib/sitemap-lastmod";
import sitemapImages from "./src/integrations/sitemap-images";

const getSite = function () {
  if (CUSTOM_DOMAIN) {
    return new URL(BASE_PATH, `https://${CUSTOM_DOMAIN}`).toString();
  }
  if (process.env.CF_PAGES && process.env.CF_PAGES_BRANCH !== "main") {
    if (process.env.CF_PAGES_BRANCH !== "main") {
      return new URL(BASE_PATH, process.env.CF_PAGES_URL).toString();
    }

    // This one is only usefull if there's not a proper registered domain
    // It is when the site is only on CF pages
    return new URL(
      BASE_PATH,
      `https://${new URL(process.env.CF_PAGES_URL!).host.split(".").slice(1).join(".")}`,
    ).toString();
  }
  return new URL(BASE_PATH, "http://localhost:4321").toString();
};

// https://astro.build/config
export default defineConfig({
  site: getSite(),
  base: BASE_PATH,
  adapter: cloudflare({
    imageService: { build: "compile", runtime: "passthrough" },
    // Prerender in Node rather than in a local workerd preview server. The
    // default "workerd" mode proxies every page render over HTTP to a workerd
    // process; on Cloudflare's build machines that connection has dropped
    // mid-build with a bare "fetch failed" and no route or cause. Node mode
    // renders in-process, so failures surface as normal Astro build errors
    // with the failing route and stack trace. It also lets sharp generate the
    // inline blur placeholders on letterboxed covers (sharp is unavailable in
    // workerd, where those pages fell back to a 40px image variant).
    prerenderEnvironment: "node",
  }),
  server: {
    port: 4321,
    host: true,
  },
  integrations: [
    sitemap({
      // Keep non-content utility pages out of the sitemap: the CS50 "*-cover"
      // social-share pages and the "/deck/" slide viewers (full-screen
      // presentations with little crawlable text) are not meant to be indexed
      // or surfaced in search. (The 404 page is server-rendered, so it never
      // reaches the sitemap.)
      // The legal pages (impressum, privacy-policy, terms-and-conditions)
      // are deliberately noindexed, so they must not be listed either —
      // a noindex URL inside the sitemap is a contradictory signal
      // (audit 2026-08-21, seo.noindex.in-sitemap).
      filter: (page) =>
        !/-cover\/?$/.test(page) &&
        !/\/deck\/?$/.test(page) &&
        !/\/(impressum|privacy-policy|terms-and-conditions)\/?$/.test(page),
      // Stamp each URL with its source file's last git commit date. Best-effort:
      // falls back to no lastmod if git history is unavailable at build time.
      serialize: serializeLastmod,
    }),
    // Must come AFTER sitemap(): post-processes the written sitemap to add
    // <image:image> entries from each page's resolved og:image.
    sitemapImages(),
    icon(),
    react(),
    mdx(),
    linkMetadataCache(),
  ],
  prefetch: true,
  markdown: {
    // Astro 7 deprecated `markdown.remarkPlugins` / `rehypePlugins` /
    // `remarkRehype`; the pipeline is now configured through the `unified()`
    // processor. `mdx()` inherits these plugins from here (extendMarkdownConfig).
    processor: unified({
      remarkPlugins: [remarkImageToAstroImage],
      rehypePlugins: [rehypeFigure, rehypeLazyImages, rehypeFootnoteTooltips],
      remarkRehype: {
        clobberPrefix: "",
      },
    }),
  },
  vite: {
    plugins: [
      presentationSlides(),
      tailwindcss(),
      {
        name: "ssr-optimize-deps",
        apply: "serve",
        configEnvironment(name) {
          if (name === "client") {
            return {
              optimizeDeps: {
                include: ["mermaid"],
              },
            };
          }
          return {
            optimizeDeps: {
              include: [
                "astro-icon/components",
                "@iconify/utils",
                "@iconify/utils/lib/svg/build",
                "react",
                "react-dom",
                "react-dom/server",
                "react/jsx-runtime",
              ],
            },
          };
        },
      },
    ],
  },
  redirects: {
    "/strategies": "https://archcompute.com/en/strategies",
    "/pt/strategies": "https://archcompute.com/pt-br/strategies",
    "/computational-design-strategies/agent-based-modeling":
      "https://archcompute.com/en/strategies/form-finding/agent-based-modeling/",
    "/computational-design-strategies/attractors":
      "https://archcompute.com/en/strategies/parametric-systems/attractors/",
    "/computational-design-strategies/catenary-arches-and-shells":
      "https://archcompute.com/en/strategies/form-finding/catenary-arches-and-shells/",
    "/computational-design-strategies/cellular-automata":
      "https://archcompute.com/en/strategies/growth-systems/cellular-automata/",
    "/computational-design-strategies/circle-packing":
      "https://archcompute.com/en/strategies/parametric-systems/circle-packing/",
    "/computational-design-strategies/computational-engineering":
      "https://archcompute.com/en/strategies/engineering/",
    "/computational-design-strategies/differential-growth":
      "https://archcompute.com/en/strategies/growth-systems/differential-growth/",
    "/computational-design-strategies/diffusion-limited-aggregation":
      "https://archcompute.com/en/strategies/growth-systems/diffusion-limited-aggregation/",
    "/computational-design-strategies/dynamic-relaxation-particle-spring-system":
      "https://archcompute.com/en/strategies/form-finding/particle-spring-system/",
    "/computational-design-strategies/environmental-design":
      "https://archcompute.com/en/strategies/environmental-design/",
    "/computational-design-strategies/geodesic-dome":
      "https://archcompute.com/en/strategies/structural-systems/geodesic-dome/",
    "/computational-design-strategies/honeycomb":
      "https://archcompute.com/en/strategies/natural-patterns/honeycomb/",
    "/computational-design-strategies/inflatables":
      "https://archcompute.com/en/strategies/form-finding/inflatables/",
    "/computational-design-strategies/l-system":
      "https://archcompute.com/en/strategies/growth-systems/l-system/",
    "/computational-design-strategies/lattice-structures":
      "https://archcompute.com/en/strategies/structural-systems/lattice-structures/",
    "/computational-design-strategies/leaf-venation-shortest-walk":
      "https://archcompute.com/en/strategies/parametric-systems/network-optimization/",
    "/computational-design-strategies/metaball":
      "https://archcompute.com/en/strategies/parametric-systems/marching-cubes/",
    "/computational-design-strategies/minimal-surface-soap-film":
      "https://archcompute.com/en/strategies/form-finding/minimal-surface/",
    "/computational-design-strategies/network-optimization":
      "https://archcompute.com/en/strategies/parametric-systems/network-optimization/",
    "/computational-design-strategies/noise":
      "https://archcompute.com/en/strategies/natural-patterns/noise/",
    "/computational-design-strategies/origami":
      "https://archcompute.com/en/strategies/fabrication-systems/origami/",
    "/computational-design-strategies/phyllotaxis":
      "https://archcompute.com/en/strategies/natural-patterns/phylotaxis/",
    "/computational-design-strategies/reciprocal-frames-systems-":
      "https://archcompute.com/en/strategies/structural-systems/reciprocal-systems/",
    "/computational-design-strategies/skeletal-mesh-exoskeleton-skeleton-fattener":
      "https://archcompute.com/en/strategies/parametric-systems/marching-cubes/",
    "/computational-design-strategies/stress-lines-isostatic-line-principal-stress-vector-field":
      "https://archcompute.com/en/strategies/engineering/stress-lines/",
    "/computational-design-strategies/voronoi-diagram":
      "https://archcompute.com/en/strategies/natural-patterns/voronoi-diagram/",
    "/computational-design-strategies/waffle-structure":
      "https://archcompute.com/en/strategies/fabrication-systems/waffle-structure/",
    "/computational-design-strategies/weaving-pattern-knitting-pattern":
      "https://archcompute.com/en/strategies/fabrication-systems/weaving/",
    "/computational-design-strategies/zonohedral-dome-zome":
      "https://archcompute.com/en/strategies/structural-systems/zonohedral-dome/",
    "/pt/computational-design-strategies/agent-based-modeling":
      "https://archcompute.com/pt-br/strategies/form-finding/agent-based-modeling/",
    "/pt/computational-design-strategies/attractors":
      "https://archcompute.com/pt-br/strategies/parametric-systems/attractors/",
    "/pt/computational-design-strategies/catenary-arches-and-shells":
      "https://archcompute.com/pt-br/strategies/form-finding/catenary-arches-and-shells/",
    "/pt/computational-design-strategies/cellular-automata":
      "https://archcompute.com/pt-br/strategies/growth-systems/cellular-automata/",
    "/pt/computational-design-strategies/circle-packing":
      "https://archcompute.com/pt-br/strategies/parametric-systems/circle-packing/",
    "/pt/computational-design-strategies/computational-engineering":
      "https://archcompute.com/pt-br/strategies/engineering/",
    "/pt/computational-design-strategies/differential-growth":
      "https://archcompute.com/pt-br/strategies/growth-systems/differential-growth/",
    "/pt/computational-design-strategies/diffusion-limited-aggregation":
      "https://archcompute.com/pt-br/strategies/growth-systems/diffusion-limited-aggregation/",
    "/pt/computational-design-strategies/dynamic-relaxation-particle-spring-system":
      "https://archcompute.com/pt-br/strategies/form-finding/particle-spring-system/",
    "/pt/computational-design-strategies/environmental-design":
      "https://archcompute.com/pt-br/strategies/environmental-design/",
    "/pt/computational-design-strategies/geodesic-dome":
      "https://archcompute.com/pt-br/strategies/structural-systems/geodesic-dome/",
    "/pt/computational-design-strategies/honeycomb":
      "https://archcompute.com/pt-br/strategies/natural-patterns/honeycomb/",
    "/pt/computational-design-strategies/inflatables":
      "https://archcompute.com/pt-br/strategies/form-finding/inflatables/",
    "/pt/computational-design-strategies/l-system":
      "https://archcompute.com/pt-br/strategies/growth-systems/l-system/",
    "/pt/computational-design-strategies/lattice-structures":
      "https://archcompute.com/pt-br/strategies/structural-systems/lattice-structures/",
    "/pt/computational-design-strategies/leaf-venation-shortest-walk":
      "https://archcompute.com/pt-br/strategies/parametric-systems/network-optimization/",
    "/pt/computational-design-strategies/metaball":
      "https://archcompute.com/pt-br/strategies/parametric-systems/marching-cubes/",
    "/pt/computational-design-strategies/minimal-surface-soap-film":
      "https://archcompute.com/pt-br/strategies/form-finding/minimal-surface/",
    "/pt/computational-design-strategies/network-optimization":
      "https://archcompute.com/pt-br/strategies/parametric-systems/network-optimization/",
    "/pt/computational-design-strategies/noise":
      "https://archcompute.com/pt-br/strategies/natural-patterns/noise/",
    "/pt/computational-design-strategies/origami":
      "https://archcompute.com/pt-br/strategies/fabrication-systems/origami/",
    "/pt/computational-design-strategies/phyllotaxis":
      "https://archcompute.com/pt-br/strategies/natural-patterns/phylotaxis/",
    "/pt/computational-design-strategies/reciprocal-frames-systems-":
      "https://archcompute.com/pt-br/strategies/structural-systems/reciprocal-systems/",
    "/pt/computational-design-strategies/skeletal-mesh-exoskeleton-skeleton-fattener":
      "https://archcompute.com/pt-br/strategies/parametric-systems/marching-cubes/",
    "/pt/computational-design-strategies/stress-lines-isostatic-line-principal-stress-vector-field":
      "https://archcompute.com/pt-br/strategies/engineering/stress-lines/",
    "/pt/computational-design-strategies/voronoi-diagram":
      "https://archcompute.com/pt-br/strategies/natural-patterns/voronoi-diagram/",
    "/pt/computational-design-strategies/waffle-structure":
      "https://archcompute.com/pt-br/strategies/fabrication-systems/waffle-structure/",
    "/pt/computational-design-strategies/weaving-pattern-knitting-pattern":
      "https://archcompute.com/pt-br/strategies/fabrication-systems/weaving/",
    "/pt/computational-design-strategies/zonohedral-dome-zome":
      "https://archcompute.com/pt-br/strategies/structural-systems/zonohedral-dome/",
    "/projects/parada-coca-cola-by-atelier-marko-brajovic-for-coca-cola":
      "/projects/parada-coca-cola-by-atelier-marko-brajovic",
    "/pt/projects/parada-coca-cola-by-atelier-marko-brajovic-for-coca-cola":
      "/pt/projects/parada-coca-cola-by-atelier-marko-brajovic",
    "/de/projects/parada-coca-cola-by-atelier-marko-brajovic-for-coca-cola":
      "/de/projects/parada-coca-cola-by-atelier-marko-brajovic",
    "/research/dokwood-bsdd-data-dictionary":
      "/research/timber-buildup-data-model",
    "/pt/research/dokwood-bsdd-data-dictionary":
      "/pt/research/timber-buildup-data-model",
    "/de/research/dokwood-bsdd-data-dictionary":
      "/de/research/timber-buildup-data-model",
  },
});

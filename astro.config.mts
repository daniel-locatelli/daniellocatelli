import { defineConfig } from "astro/config";
import { CUSTOM_DOMAIN, BASE_PATH } from "./src/server-constants";
import AllFilesDownloader from "./src/integrations/all-files-downloader";
// import CustomIconDownloader from "./src/integrations/custom-icon-downloader";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import db from "@astrojs/db";
import tailwindcss from "@tailwindcss/vite";

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
  integrations: [db(), sitemap(), AllFilesDownloader(), icon()],
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
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
      "",
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
      "",
    "/pt/computational-design-strategies/voronoi-diagram":
      "https://archcompute.com/pt-br/strategies/natural-patterns/voronoi-diagram/",
    "/pt/computational-design-strategies/waffle-structure":
      "https://archcompute.com/pt-br/strategies/fabrication-systems/waffle-structure/",
    "/pt/computational-design-strategies/weaving-pattern-knitting-pattern":
      "https://archcompute.com/pt-br/strategies/fabrication-systems/weaving/",
    "/pt/computational-design-strategies/zonohedral-dome-zome":
      "https://archcompute.com/pt-br/strategies/structural-systems/zonohedral-dome/",
  },
});

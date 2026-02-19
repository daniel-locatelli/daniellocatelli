/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

declare module "@pagefind/default-ui" {
  declare class PagefindUI {
    constructor(arg: unknown);
  }
}

interface ImportMetaEnv {
  readonly WEBMENTION_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

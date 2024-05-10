import type { AstroIntegration } from "astro";
import type { Database, FileObject } from "../lib/notion-interfaces";
import { downloadImage, getAllDatabases } from "../lib/notion/client";

export default (): AstroIntegration => ({
  name: "custom-icon-downloader",
  hooks: {
    "astro:build:start": async () => {
      let databases: Array<Database>;
      databases = await getAllDatabases();
      const database = databases[0];

      if (!database.Icon || database.Icon.Type !== "file") {
        return Promise.resolve();
      }

      const icon = database.Icon as FileObject;

      let url!: URL;
      try {
        url = new URL(icon.Url);
      } catch (err) {
        console.log("Invalid Icon image URL");
        return Promise.resolve();
      }

      return downloadImage(url, "");
    },
  },
});

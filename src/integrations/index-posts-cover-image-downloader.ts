import type { AstroIntegration } from "astro";
import {
  downloadImage,
  downloadPublicImage,
  getAllDatabases,
} from "../lib/notion/client";
import type { Database } from "../lib/notion-interfaces";

export default (): AstroIntegration => ({
  name: "cover-image-downloader",
  hooks: {
    "astro:build:start": async () => {
      // console.log("\nStarting downloading cover image");
      let databases: Array<Database>;
      databases = await getAllDatabases();
      const database = databases[0];

      if (!database.Cover || database.Cover.Type !== "file") {
        console.log("\nNo cover found");
        return Promise.resolve();
      }

      let url!: URL;
      try {
        url = new URL(database.Cover.Url);
      } catch (err) {
        console.log("Invalid Cover image URL");
        return Promise.resolve();
      }

      // console.log("\nDownloading cover image");
      return (
        downloadImage(url, "database-cover"),
        downloadPublicImage(url, "database-cover")
      );
    },
  },
});

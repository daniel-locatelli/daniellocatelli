import type { AstroIntegration } from "astro";
import {
  getDatabasePages,
  downloadFile,
  downloadPublicImage,
  getAllBlocksByBlockId,
  getBlock,
  getAllDatabases,
} from "../lib/notion/client";
import { extractTargetBlocks } from "../lib/blog-helpers";
import type { DatabaseObject } from "../lib/notion/responses";
import type { Database } from "../lib/notion-interfaces";

export default (): AstroIntegration => ({
  name: "all-files-downloader",
  hooks: {
    "astro:build:start": async () => {
      let databases: Array<Database>;
      databases = await getAllDatabases();

      await Promise.all(
        databases.map(async (database) => {
          if (database.Title.length === 0) {
            return Promise.resolve();
          }
          // console.log(database.Title);
          const pages = database.Pages;

          // Download cover image of posts
          await Promise.all(
            pages.map((page) => {
              if (!page.Cover || !page.Cover.Url) {
                return Promise.resolve();
              }
              // console.dir(page);

              let url!: URL;
              try {
                url = new URL(page.Cover.Url);
              } catch (error) {
                console.log("Invalid cover image URL\n" + error);
                return Promise.resolve();
              }

              let slug!: string;
              try {
                slug = page.Slug;
              } catch (error) {
                console.log("Could not find post slug\n" + error);
                return Promise.resolve();
              }

              // return downloadPublicImage(url, slug);
              return downloadFile(url, slug);
              // return downloadFile(url, slug), downloadPublicImage(url, slug);
            })
          );
        })
      );

      // Download blocks content
      // await Promise.all(
      //   pages.map(async (page) => {
      //     let slug!: string;
      //     try {
      //       slug = page.Slug;
      //     } catch (error) {
      //       console.log("Could not find post slug\n" + error);
      //       return Promise.resolve();
      //     }

      //     const blocks = await getAllBlocksByBlockId(page.PageId);
      //     // console.log("\n===== Checking blocks =====");
      //     // console.dir(blocks);
      //     const fileAtacchedBlocks = extractTargetBlocks("image", blocks)
      //       .concat(extractTargetBlocks("file", blocks))
      //       .filter((block) => {
      //         // console.log("\n===== Checking fileAtacchedBlocks =====");
      //         // console.dir(block);
      //         if (!block) {
      //           return false;
      //         }
      //         const imageOrFile = block.Image || block.File;
      //         return imageOrFile && imageOrFile.File && imageOrFile.File.Url;
      //       });

      //     // console.log("\n===== Checking fileAtacchedBlocks =====");
      //     // console.dir(fileAtacchedBlocks);

      //     await Promise.all(
      //       fileAtacchedBlocks
      //         .map(async (block) => {
      //           const expiryTime = (block.Image || block.File)!.File!
      //             .ExpiryTime;
      //           if (Date.parse(expiryTime!) > Date.now()) {
      //             return Promise.resolve(block);
      //           }
      //           return getBlock(block.Id);
      //         })
      //         .map((promise) =>
      //           promise.then((block) => {
      //             let url!: URL;
      //             // console.log(
      //             //   "\n===== Checking files after expiryTime part ====="
      //             // );
      //             // console.dir(block);
      //             try {
      //               url = new URL((block.Image || block.File)!.File!.Url);
      //             } catch (err) {
      //               console.log("Invalid file URL");
      //               return Promise.reject();
      //             }
      //             return Promise.resolve({
      //               url,
      //               type: block.Image ? "image" : "file",
      //             });
      //           })
      //         )
      //         .map((promise) =>
      //           promise.then(({ url, type }) => {
      //             if (type === "image") {
      //               return downloadFile(url, slug);
      //             }
      //             // else {
      //             //   return downloadPublicImage(url, slug);
      //             // }
      //           })
      //         )
      //     );
      //   })
      // );
    },
  },
});

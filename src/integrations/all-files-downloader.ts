import type { AstroIntegration } from "astro";
import {
  downloadImage,
  downloadPublicImage,
  getAllBlocksByBlockId,
  getBlock,
  getAllDatabases,
  downloadVideo,
} from "../lib/notion/client";
import { extractTargetBlocks } from "../lib/blog-helpers";
import type { Database } from "../lib/notion-interfaces";

// https://developers.notion.com/reference/request-limits
const MAX_REQUESTS_PER_SECOND = 2;

const downloadQueue: any[] = [];

// Function to process the queue
const processQueue = async () => {
  while (downloadQueue.length > 0) {
    const startTime = Date.now();
    const tasks = [];

    while (
      Date.now() - startTime < 1000 &&
      downloadQueue.length > 0 &&
      tasks.length < MAX_REQUESTS_PER_SECOND
    ) {
      tasks.push(downloadQueue.shift()());
    }

    // Wait until 1 second has elapsed
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 - (Date.now() - startTime))
    );

    // Execute tasks concurrently
    await Promise.all(tasks);
  }
};

export default (): AstroIntegration => ({
  name: "all-files-downloader",
  hooks: {
    "astro:config:setup": async () => {
      let databases: Array<Database>;
      databases = await getAllDatabases();

      await Promise.all(
        databases.map(async (database) => {
          if (database.Title.length === 0) {
            return Promise.resolve();
          }

          const pages = database.Pages;

          pages.forEach((page) => {
            if (!page.Cover || !page.Cover.Url) {
              return;
            }

            let url, slug;

            try {
              url = new URL(page.Cover.Url);
              slug = page.Slug;
            } catch (error) {
              console.log("Invalid cover image URL or post slug:", error);
              return;
            }

            // Add the download task to the queue
            downloadQueue.push(async () => {
              await downloadImage(url, slug);
              await downloadPublicImage(url, slug);
            });
          });
        })
      );

      // Download blocks content
      await Promise.all(
        databases.map(async (database) => {
          if (database.Title.length === 0) {
            return Promise.resolve();
          }
          const pages = database.Pages;
          pages.map(async (page) => {
            let slug!: string;
            try {
              slug = page.Slug;
            } catch (error) {
              console.log("Could not find post slug\n" + error);
              return Promise.resolve();
            }

            const blocks = await getAllBlocksByBlockId(page.PageId);
            const fileAtacchedBlocks = extractTargetBlocks("image", blocks)
              .concat(extractTargetBlocks("file", blocks))
              .concat(extractTargetBlocks("video", blocks))
              .filter((block) => {
                if (!block) {
                  return false;
                }
                const imageFileOrVideo =
                  block.Image || block.File || block.Video;
                return (
                  imageFileOrVideo &&
                  imageFileOrVideo.File &&
                  imageFileOrVideo.File.Url
                );
              });

            await Promise.all(
              fileAtacchedBlocks
                .map(async (block) => {
                  const expiryTime = (block.Image || block.File || block.Video)!
                    .File!.ExpiryTime;
                  if (Date.parse(expiryTime!) > Date.now()) {
                    return Promise.resolve(block);
                  }
                  return getBlock(block.Id);
                })
                .map((promise) =>
                  promise.then((block) => {
                    let url!: URL;
                    let type!: string;
                    try {
                      url = new URL(
                        (block.Image || block.File || block.Video)!.File!.Url
                      );
                      if (block.Image) {
                        type = "image";
                      } else if (block.File) {
                        type = "file";
                      } else if (block.Video) {
                        type = "video";
                      }
                    } catch (error) {
                      console.log("Invalid file URL");
                      return Promise.reject();
                    }
                    return Promise.resolve({
                      url,
                      type,
                    });
                  })
                )
                .map((promise) =>
                  promise.then(async ({ url, type }) => {
                    if (type === "image") {
                      // Add the download task to the queue
                      downloadQueue.push(async () => {
                        await downloadImage(url, slug);
                      });
                    } else if (type === "file") {
                    } else if (type === "video") {
                      downloadQueue.push(async () => {
                        await downloadVideo(url, slug);
                      });
                    }
                  })
                )
            );
          });
        })
      );

      // Process any remaining tasks in the queue
      await processQueue();
    },
  },
});

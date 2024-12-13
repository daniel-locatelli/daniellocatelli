import type { AstroIntegration } from "astro";
import {
  downloadImage,
  downloadPublicImage,
  getAllBlocksByBlockId,
  getBlock,
  getAllDatabases,
  downloadVideo,
  downloadFile,
} from "../lib/notion/client";
import { extractTargetBlocks } from "../lib/blog-helpers";
import type { Database } from "../lib/notion-interfaces";
import pLimit from "p-limit";

export default (): AstroIntegration => ({
  name: "all-files-downloader",
  hooks: {
    "astro:build:start": async () => {
      let databases: Array<Database>;
      databases = await getAllDatabases();

      const downloadTasks: Array<Promise<void>> = [];

      // Process cover images
      databases.forEach((database) => {
        if (database.Title.length === 0) return;

        database.Pages.forEach((page) => {
          if (!page.Cover || !page.Cover.Url) return;

          try {
            const url = new URL(page.Cover.Url);

            // Wrap tasks with concurrency limit
            downloadTasks.push(downloadImage(url));
            downloadTasks.push(downloadPublicImage(url));
          } catch (error) {
            console.log("Invalid cover image URL:", error);
          }
        });
      });

      // Process block contents
      for (const database of databases) {
        if (database.Title.length === 0) continue;

        for (const page of database.Pages) {
          try {
            const blocks = await getAllBlocksByBlockId(page.PageId);
            const fileAttachedBlocks = extractTargetBlocks("image", blocks)
              .concat(extractTargetBlocks("file", blocks))
              .concat(extractTargetBlocks("video", blocks))
              .filter((block) => {
                if (!block) return false;
                const imageFileOrVideo =
                  block.Image || block.File || block.Video;
                return (
                  imageFileOrVideo &&
                  imageFileOrVideo.File &&
                  imageFileOrVideo.File.Url
                );
              });

            for (const block of fileAttachedBlocks) {
              const mediaFile = block.Image || block.File || block.Video;
              const expiryTime = mediaFile?.File?.ExpiryTime;

              // Refresh block if expired
              const resolvedBlock =
                expiryTime && Date.parse(expiryTime) <= Date.now()
                  ? await getBlock(block.Id)
                  : block;

              try {
                const url = new URL(
                  (resolvedBlock.Image ||
                    resolvedBlock.File ||
                    resolvedBlock.Video)!.File!.Url,
                );

                let downloadTask: Promise<void>;
                if (resolvedBlock.Image) {
                  downloadTask = downloadImage(url);
                } else if (resolvedBlock.File) {
                  downloadTask = downloadFile(url);
                } else if (resolvedBlock.Video) {
                  downloadTask = downloadVideo(url);
                } else {
                  continue;
                }

                downloadTasks.push(downloadTask);
              } catch (error) {
                console.log("Invalid file URL", error);
              }
            }
          } catch (error) {
            console.log("Error processing page blocks", error);
          }
        }
      }

      // Process any remaining tasks in the queue
      await Promise.all(downloadTasks);
    },
  },
});

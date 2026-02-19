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
            downloadTasks.push(downloadImage(url));
            downloadTasks.push(downloadPublicImage(url));
          } catch (error) {
            console.log("Invalid cover image URL:", error);
          }
        });
      });

      // Process block contents in parallel with controlled concurrency
      const CONCURRENCY_LIMIT = 5;
      const pagesToProcess = databases.flatMap((db) =>
        db.Title ? db.Pages : [],
      );

      for (let i = 0; i < pagesToProcess.length; i += CONCURRENCY_LIMIT) {
        const batch = pagesToProcess.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(
          batch.map(async (page) => {
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

                  if (resolvedBlock.Image) {
                    downloadTasks.push(downloadImage(url));
                  } else if (resolvedBlock.File) {
                    downloadTasks.push(downloadFile(url));
                  } else if (resolvedBlock.Video) {
                    downloadTasks.push(downloadVideo(url));
                  }
                } catch (error) {
                  console.log("Invalid file URL", error);
                }
              }
            } catch (error) {
              console.log("Error processing page blocks", error);
            }
          }),
        );
      }

      await Promise.all(downloadTasks);
    },
  },
});

import { BASE_PATH } from "../config/server";
import { pathJoin } from "./utils";
import sharp from "sharp";
import { readFile } from "node:fs/promises";

export const getNavLink = (nav: string) => {
  if ((!nav || nav === "/") && BASE_PATH) {
    return pathJoin(BASE_PATH, "") + "/";
  }

  return pathJoin(BASE_PATH, nav);
};

export const getPostLink = (slug: string) => {
  return pathJoin(BASE_PATH, `/posts/${slug}`);
};

export const getTagLink = (tag: string) => {
  return pathJoin(BASE_PATH, `/posts/tag/${encodeURIComponent(tag)}`);
};

export const getPageLink = (page: number, tag: string) => {
  if (page === 1) {
    return tag ? getTagLink(tag) : pathJoin(BASE_PATH, "/");
  }
  return tag
    ? pathJoin(
        BASE_PATH,
        `/posts/tag/${encodeURIComponent(tag)}/page/${page.toString()}`,
      )
    : pathJoin(BASE_PATH, `/posts/page/${page.toString()}`);
};

export const getDateStr = (date: string) => {
  const dt = new Date(date);

  if (date.indexOf("T") !== -1) {
    // Consider timezone
    const elements = date.split("T")[1].split(/([+-])/);
    if (elements.length > 1) {
      const diff = parseInt(`${elements[1]}${elements[2]}`, 10);
      dt.setHours(dt.getHours() + diff);
    }
  }

  const y = dt.getFullYear();
  const m = ("00" + (dt.getMonth() + 1)).slice(-2);
  const d = ("00" + dt.getDate()).slice(-2);
  return y + "-" + m + "-" + d;
};

export const isTweetURL = (url: URL): boolean => {
  if (
    url.hostname !== "twitter.com" &&
    url.hostname !== "www.twitter.com" &&
    url.hostname !== "x.com" &&
    url.hostname !== "www.x.com"
  ) {
    return false;
  }
  return /\/[^/]+\/status\/[\d]+/.test(url.pathname);
};

export const isTikTokURL = (url: URL): boolean => {
  if (url.hostname !== "tiktok.com" && url.hostname !== "www.tiktok.com") {
    return false;
  }
  return /\/[^/]+\/video\/[\d]+/.test(url.pathname);
};

export const isInstagramURL = (url: URL): boolean => {
  if (
    url.hostname !== "instagram.com" &&
    url.hostname !== "www.instagram.com"
  ) {
    return false;
  }
  return /\/p\/[^/]+/.test(url.pathname);
};

export const isPinterestURL = (url: URL): boolean => {
  if (
    url.hostname !== "pinterest.com" &&
    url.hostname !== "www.pinterest.com" &&
    url.hostname !== "pinterest.jp" &&
    url.hostname !== "www.pinterest.jp"
  ) {
    return false;
  }
  return /\/pin\/[\d]+/.test(url.pathname);
};

export const isCodePenURL = (url: URL): boolean => {
  if (url.hostname !== "codepen.io" && url.hostname !== "www.codepen.io") {
    return false;
  }
  return /\/[^/]+\/pen\/[^/]+/.test(url.pathname);
};

export const isShortAmazonURL = (url: URL): boolean => {
  if (url.hostname === "amzn.to" || url.hostname === "www.amzn.to") {
    return true;
  }
  return false;
};

export const isFullAmazonURL = (url: URL): boolean => {
  if (
    url.hostname === "amazon.com" ||
    url.hostname === "www.amazon.com" ||
    url.hostname === "amazon.de" ||
    url.hostname === "www.amazon.de"
  ) {
    return true;
  }
  return false;
};

export const isAmazonURL = (url: URL): boolean => {
  return isShortAmazonURL(url) || isFullAmazonURL(url);
};

export const isYouTubeURL = (url: URL): boolean => {
  if (["www.youtube.com", "youtube.com", "youtu.be"].includes(url.hostname)) {
    return true;
  }
  return false;
};

// Supported URL
//
// - https://youtu.be/0zM3nApSvMg
// - https://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index
// - https://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s
// - https://www.youtube.com/watch?v=0zM3nApSvMg
// - https://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0
// - https://www.youtube.com/embed/0zM3nApSvMg?rel=0
// - https://youtube.com/live/uOLwqWlpKbA
export const parseYouTubeVideoId = (url: URL): string => {
  if (!isYouTubeURL(url)) return "";
  if (url.hostname === "youtu.be") {
    return url.pathname.split("/")[1]!;
  } else if (url.pathname === "/watch") {
    return url.searchParams.get("v") || "";
  } else {
    const elements = url.pathname.split("/");

    if (elements.length < 2) return "";

    if (
      elements[1] === "v" ||
      elements[1] === "embed" ||
      elements[1] === "live"
    ) {
      return elements[2]!;
    }
  }

  return "";
};

export const importImage = async (
  page: any,
  images: any,
  field: string = "Cover",
) => {
  const data = page.data || page;
  const value = data[field];
  if (value) {
    let imagePath = "";
    if (typeof value === "string" && value.startsWith("/")) {
      // Local path from Content Collections
      imagePath = "/src" + value;
    } else if (
      typeof value === "object" &&
      value.Url &&
      !value.Url.startsWith("http")
    ) {
      // Local path from Content Collections (old object format)
      imagePath = "/src" + value.Url;
    }

    try {
      // Check if image exists in glob
      if (images[imagePath]) {
        const image = (await images[imagePath]()).default;
        return image;
      }
      return;
    } catch (error) {
      console.log("Error getting image: \n" + error);
      return;
    }
  } else {
    return;
  }
};

export const importCoverImage = async (page: any, images: any) => {
  return importImage(page, images, "Cover");
};

export function urlToFileName(url: URL) {
  let fileName = decodeURIComponent(url.pathname.split("/").slice(-1)[0]!);
  return fileName;
}

interface ModifyFileNameOptions {
  newBeginning?: string;
  newEnd?: string;
  newExtension?: string;
}

export function modifyFileName(
  fileName: string,
  options: ModifyFileNameOptions = {},
): string {
  const { newBeginning = "", newEnd = "", newExtension = "" } = options;

  let dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return newBeginning + fileName + newEnd;
  }

  let name = fileName.substring(0, dotIndex);
  let extension = fileName.substring(dotIndex);

  if (newExtension) {
    extension = "." + newExtension;
  }

  if (!name.includes(newBeginning) && newBeginning !== "/") {
    let newBeginningEdited = newBeginning;
    if (newBeginning.includes("/")) {
      newBeginningEdited = newBeginning.replace("/", "_");
    }
    return newBeginningEdited + name + newEnd + extension;
  }
  return name + newEnd + extension;
}

/**
 * Generate a tiny base64-encoded WebP data URL for use as a blur placeholder.
 * The result is inlined in the HTML so it paints instantly — no network request.
 */
export async function generateBlurDataUrl(imagePath: string): Promise<string> {
  const buffer = await readFile(imagePath);
  const webp = await sharp(buffer)
    .resize({ width: 20 })
    .webp({ quality: 20 })
    .toBuffer();
  return `data:image/webp;base64,${webp.toString("base64")}`;
}

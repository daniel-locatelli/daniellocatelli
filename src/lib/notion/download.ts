import fs, { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import ExifTransformer from "exif-be-gone";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { REQUEST_TIMEOUT_MS } from "../../config/server";
import { modifyFileName, urlToFileName } from "../blog-helpers";

const client = axios.create();
// Use type assertion to resolve the conflicting types
const http = rateLimit(client as any, {
  maxRequests: 3,
  perMilliseconds: 1000,
});

export async function downloadImage(url: URL) {
  const dir = "./src/assets/notion/" + url.pathname.split("/").slice(-2)[0];
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const fileName = decodeURIComponent(url.pathname.split("/").slice(-1)[0]);
  const fileNameWithSlug = modifyFileName(fileName, {});
  const filepath = `${dir}/${fileNameWithSlug}`;

  if (fs.existsSync(filepath)) {
    console.log(`File already exists:\n${filepath}`);
    return Promise.resolve();
  }

  try {
    const res = await http({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });

    if (!res || res.status != 200) {
      console.log(res);
      return Promise.resolve();
    }

    console.log("\n===== Starting Image Download =====");

    const writeStream = createWriteStream(filepath);
    const rotate = sharp().rotate();

    let stream = res.data;

    if (res.headers["content-type"] === "image/jpeg") {
      stream = stream.pipe(rotate);
    }

    try {
      console.log(`Downloading file:\n${filepath}`);
      await pipeline(stream, new ExifTransformer(), writeStream);
      return Promise.resolve();
    } catch (error) {
      console.log("\nError while downloading file\n" + error);
      writeStream.end();
      fs.unlink(filepath, () => {}); // Remove partial file
      return Promise.resolve();
    }
  } catch (error) {
    console.log("\nError requesting image\n" + error);
    return Promise.resolve();
  }
}

export async function downloadPublicImage(url: URL) {
  const dir = "./public/media/" + url.pathname.split("/").slice(-2)[0];
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Changing file extension
  const fileNameFromUrl = urlToFileName(url);
  const fileNameWithSlug = modifyFileName(fileNameFromUrl, {
    newExtension: "jpg",
  });
  const fileNameBgWithSlug = modifyFileName(fileNameFromUrl, {
    newEnd: "-bg",
    newExtension: "jpg",
  });

  // One of the places I add the slug to the image name
  const imagePath = `${dir}/${fileNameWithSlug}`;
  const imageBgPath = `${dir}/${fileNameBgWithSlug}`;

  if (fs.existsSync(imagePath) && fs.existsSync(imageBgPath)) {
    console.log(`Image already exists:\n${imagePath}`);
    console.log(`Image already exists:\n${imageBgPath}`);
    return Promise.resolve();
  }

  try {
    const res = await http({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });

    console.log("\n===== Starting Public Image Download =====");

    if (!res || res.status != 200) {
      console.log(res);
      return Promise.resolve();
    }

    const writeStream = createWriteStream(imagePath);
    const writeStreamBg = createWriteStream(imageBgPath);

    let stream = res.data;
    let streamBg = res.data;

    const isJpeg = res.headers["content-type"] === "image/jpeg";

    stream = stream.pipe(
      isJpeg
        ? sharp().resize({ width: 800 }).rotate()
        : sharp()
            .resize({ width: 800 })
            .jpeg()
            .flatten({ background: "#000000" }),
    );

    streamBg = streamBg.pipe(
      isJpeg
        ? sharp().resize({ width: 20 }).rotate()
        : sharp()
            .resize({ width: 20 })
            .jpeg()
            .flatten({ background: "#000000" }),
    );

    try {
      console.log(`Downloading files:\n${imagePath}\n${imageBgPath}`);

      // Use Promise.all to handle both pipelines concurrently
      await Promise.all([
        pipeline(stream, new ExifTransformer(), writeStream),
        pipeline(streamBg, new ExifTransformer(), writeStreamBg),
      ]);

      return Promise.resolve();
    } catch (error) {
      console.log("\nError while downloading files\n" + error);
      writeStream.end();
      writeStreamBg.end();

      // Remove partial files
      fs.unlink(imagePath, () => {});
      fs.unlink(imageBgPath, () => {});

      return Promise.resolve();
    }
  } catch (error) {
    console.log("\nError requesting image\n" + error);
    return Promise.resolve();
  }
}

export async function downloadVideo(url: URL) {
  const dir = "./public/media/" + url.pathname.split("/").slice(-2)[0];

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const fileName = decodeURIComponent(url.pathname.split("/").slice(-1)[0]);
  const fileNameWithSlug = modifyFileName(fileName);

  const filepath = `${dir}/${fileNameWithSlug}`;

  if (fs.existsSync(filepath)) {
    console.log(`File already exists:\n${filepath}`);
    return Promise.resolve();
  }

  try {
    const res = await http({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });

    console.log("\n===== Starting Video Download =====");

    if (!res || res.status !== 200) {
      console.log(res);
      return Promise.resolve();
    }

    const writeStream = createWriteStream(filepath);

    try {
      console.log(`Downloading video:\n${filepath}`);
      await pipeline(res.data, writeStream);
      return Promise.resolve();
    } catch (error) {
      console.log("\nError while downloading video\n" + error);
      writeStream.end();
      fs.unlink(filepath, () => {}); // Remove partial file
      return Promise.resolve();
    }
  } catch (error) {
    console.log("\nError requesting file\n" + error);
    return Promise.resolve();
  }
}

export async function downloadFile(url: URL) {
  const dir = "./public/media/" + url.pathname.split("/").slice(-2)[0];

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const fileName = decodeURIComponent(url.pathname.split("/").slice(-1)[0]);
  const filepath = `${dir}/${fileName}`;

  if (fs.existsSync(filepath)) {
    console.log(`File already exists:\n${filepath}`);
    return Promise.resolve();
  }

  let res;
  try {
    res = await http({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });

    console.log("\n===== Starting File Download =====");

    if (!res || res.status !== 200) {
      console.log(res);
      return Promise.resolve();
    }

    const writeStream = createWriteStream(filepath);

    try {
      console.log(`Downloading file:\n${filepath}`);
      await pipeline(res.data, writeStream);
      return Promise.resolve();
    } catch (error) {
      console.log("\nError while downloading file\n" + error);
      writeStream.end();
      fs.unlink(filepath, () => {}); // Remove partial file
      return Promise.resolve();
    }
  } catch (error) {
    console.log("\nError requesting file\n" + error);
    return Promise.resolve();
  }
}

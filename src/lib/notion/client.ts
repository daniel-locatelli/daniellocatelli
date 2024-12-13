import fs, { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import axios, { type AxiosResponse } from "axios";
import sharp from "sharp";
import retry from "async-retry";
import ExifTransformer from "exif-be-gone";
import { NOTION_API_SECRET, REQUEST_TIMEOUT_MS } from "../../server-constants";
import type * as responses from "./responses";
import type * as requestParams from "./request-params";
import type {
  Database,
  Page,
  Block,
  Paragraph,
  Heading1,
  Heading2,
  Heading3,
  BulletedListItem,
  NumberedListItem,
  ToDo,
  Image,
  Code,
  Quote,
  Equation,
  Callout,
  Embed,
  Video,
  File,
  Bookmark,
  LinkPreview,
  SyncedBlock,
  SyncedFrom,
  Table,
  TableRow,
  TableCell,
  Toggle,
  ColumnList,
  Column,
  TableOfContents,
  RichText,
  Text,
  Annotation,
  SelectProperty,
  Emoji,
  FileObject,
  LinkToPage,
  Mention,
  Reference,
} from "../notion-interfaces";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Client, APIResponseError } from "@notionhq/client";
import { modifyFileName, urlToFileName } from "../blog-helpers";
import type { DatabaseObject } from "./responses";
import type { SearchResponse } from "@notionhq/client/build/src/api-endpoints";
import { titleToSlug } from "../utils";

const notion = new Client({
  auth: NOTION_API_SECRET,
});

let databasesCache: Database[] | null = null;

const numberOfRetry = 3;

export async function getAllDatabases(): Promise<Database[]> {
  // console.log("\n===== Getting databases =====");
  if (databasesCache !== null) {
    return Promise.resolve(databasesCache);
  }

  const params: requestParams.SearchByTitle = {
    filter: {
      value: "database",
      property: "object",
    },
  };

  let response: SearchResponse;
  response = await notion.search(params);
  let databaseObjectArray: Array<DatabaseObject>;
  databaseObjectArray = response.results as Array<DatabaseObject>;

  try {
    databasesCache = await Promise.all(
      databaseObjectArray.map(
        async (databaseObject) => await _buildDatabase(databaseObject),
      ),
    );
    return databasesCache;
  } catch (error) {
    console.error("Error building databases: ", error);
    throw error;
  }
}

export async function getDatabaseByName(
  databaseName: string,
): Promise<Database> {
  let databases = await getAllDatabases();
  let database: Database;
  try {
    database = databases.find((database) => database.Title === databaseName)!;
    return database;
  } catch (error) {
    console.error("Error getting database by name: ", error);
    throw error;
  }
}

export async function getDatabasePages(
  databaseId: string,
  databaseTitle: string,
): Promise<Page[]> {
  // console.log("\n===== Getting all pages =====");
  const params: requestParams.QueryDatabase = {
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Status",
          status: {
            equals: "Live",
          },
        },
      ],
    },
    sorts: [
      {
        property: "Name",
        direction: "ascending",
      },
    ],
    page_size: 100,
  };

  // Check if the Date property exists in the database schema
  const databaseSchema = await notion.databases.retrieve({
    database_id: databaseId,
  });

  const datePropertyExists = databaseSchema.properties.hasOwnProperty("Date");

  if (datePropertyExists) {
    // If Date property exists, add sorting by Date
    params.sorts!.unshift({
      property: "Date",
      direction: "descending",
    });
  }

  let results: responses.PageObject[] = [];
  while (true) {
    const res = await retry(
      async (bail) => {
        try {
          return (await notion.databases.query(
            params as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          )) as responses.QueryDatabase;
        } catch (error: unknown) {
          if (error instanceof APIResponseError) {
            if (error.status && error.status >= 400 && error.status < 500) {
              bail(error);
            }
          }
          throw error;
        }
      },
      {
        retries: numberOfRetry,
      },
    );
    results = results.concat(res.results);
    // console.dir(results);

    if (!res.has_more) {
      break;
    }

    params["start_cursor"] = res.next_cursor as string;
  }

  return results
    .filter((pageObject) => _validPageObject(pageObject))
    .map((pageObject) => _buildPage(pageObject, databaseTitle));
}

export async function getPages(
  pageSize = 10,
  databaseId: string,
  databaseTitle: string,
): Promise<Page[]> {
  const allPosts = await getDatabasePages(databaseId, databaseTitle);
  return allPosts.slice(0, pageSize);
}

export async function getPageBySlug(
  slug: string,
  databaseId: string,
  databaseTitle: string,
): Promise<Page | null> {
  const allPosts = await getDatabasePages(databaseId, databaseTitle);
  return allPosts.find((post) => post.Slug === slug) || null;
}

// Continue here
export async function getPageById(pageId: string): Promise<Page | null> {
  const allDatabases = await getAllDatabases();
  let page: Page | undefined;
  page = allDatabases
    .map((database) =>
      database.Pages.find((page: Page) => page.PageId === pageId),
    )
    .find((page) => page !== undefined);
  return page !== undefined ? page : null;
}

export async function getPagesByTag(
  tagName: string,
  pageSize = 10,
  databaseId: string,
  databaseTitle: string,
): Promise<Page[]> {
  if (!tagName) return [];

  const allPosts = await getDatabasePages(databaseId, databaseTitle);
  return allPosts
    .filter((post) => post.Tags.find((tag) => tag.name === tagName))
    .slice(0, pageSize);
}

// This was used on the old version with just one blog
// page starts from 1 not 0
// export async function getPostsByPage(page: number): Promise<Page[]> {
//   if (page < 1) {
//     return [];
//   }

//   const allPosts = await getDatabasePages();

//   const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE;
//   const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;

//   return allPosts.slice(startIndex, endIndex);
// }

// page starts from 1 not 0
// export async function getPostsByTagAndPage(
//   tagName: string,
//   page: number
// ): Promise<Page[]> {
//   if (page < 1) {
//     return [];
//   }

//   const allPosts = await getDatabasePages();
//   const posts = allPosts.filter((post) =>
//     post.Tags.find((tag) => tag.name === tagName)
//   );

//   const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE;
//   const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;

//   return posts.slice(startIndex, endIndex);
// }

// export async function getNumberOfPages(): Promise<number> {
//   const allPosts = await getDatabasePages();
//   return (
//     Math.floor(allPosts.length / NUMBER_OF_POSTS_PER_PAGE) +
//     (allPosts.length % NUMBER_OF_POSTS_PER_PAGE > 0 ? 1 : 0)
//   );
// }

// export async function getNumberOfPagesByTag(tagName: string): Promise<number> {
//   const allPosts = await getDatabasePages();
//   const posts = allPosts.filter((post) =>
//     post.Tags.find((tag) => tag.name === tagName)
//   );
//   return (
//     Math.floor(posts.length / NUMBER_OF_POSTS_PER_PAGE) +
//     (posts.length % NUMBER_OF_POSTS_PER_PAGE > 0 ? 1 : 0)
//   );
// }

export async function getAllBlocksByBlockId(blockId: string): Promise<Block[]> {
  let results: responses.BlockObject[] = [];

  if (fs.existsSync(`tmp/${blockId}.json`)) {
    results = JSON.parse(fs.readFileSync(`tmp/${blockId}.json`, "utf-8"));
  } else {
    const params: requestParams.RetrieveBlockChildren = {
      block_id: blockId,
    };

    while (true) {
      const res = await retry(
        async (bail) => {
          try {
            return (await notion.blocks.children.list(
              params as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            )) as responses.RetrieveBlockChildrenResponse;
          } catch (error: unknown) {
            if (error instanceof APIResponseError) {
              if (error.status && error.status >= 400 && error.status < 500) {
                bail(error);
              }
            }
            throw error;
          }
        },
        {
          retries: numberOfRetry,
        },
      );

      results = results.concat(res.results);

      if (!res.has_more) {
        break;
      }

      params["start_cursor"] = res.next_cursor as string;
    }
  }

  const allBlocks = results.map((blockObject) => _buildBlock(blockObject));

  for (let i = 0; i < allBlocks.length; i++) {
    const block = allBlocks[i];

    if (block.Type === "table" && block.Table) {
      block.Table.Rows = await _getTableRows(block.Id);
    } else if (block.Type === "column_list" && block.ColumnList) {
      block.ColumnList.Columns = await _getColumns(block.Id);
    } else if (
      block.Type === "bulleted_list_item" &&
      block.BulletedListItem &&
      block.HasChildren
    ) {
      block.BulletedListItem.Children = await getAllBlocksByBlockId(block.Id);
    } else if (
      block.Type === "numbered_list_item" &&
      block.NumberedListItem &&
      block.HasChildren
    ) {
      block.NumberedListItem.Children = await getAllBlocksByBlockId(block.Id);
    } else if (block.Type === "to_do" && block.ToDo && block.HasChildren) {
      block.ToDo.Children = await getAllBlocksByBlockId(block.Id);
    } else if (block.Type === "synced_block" && block.SyncedBlock) {
      block.SyncedBlock.Children = await _getSyncedBlockChildren(block);
    } else if (block.Type === "toggle" && block.Toggle) {
      block.Toggle.Children = await getAllBlocksByBlockId(block.Id);
    } else if (
      block.Type === "paragraph" &&
      block.Paragraph &&
      block.HasChildren
    ) {
      block.Paragraph.Children = await getAllBlocksByBlockId(block.Id);
    } else if (
      block.Type === "heading_1" &&
      block.Heading1 &&
      block.HasChildren
    ) {
      block.Heading1.Children = await getAllBlocksByBlockId(block.Id);
    } else if (
      block.Type === "heading_2" &&
      block.Heading2 &&
      block.HasChildren
    ) {
      block.Heading2.Children = await getAllBlocksByBlockId(block.Id);
    } else if (
      block.Type === "heading_3" &&
      block.Heading3 &&
      block.HasChildren
    ) {
      block.Heading3.Children = await getAllBlocksByBlockId(block.Id);
    } else if (block.Type === "quote" && block.Quote && block.HasChildren) {
      block.Quote.Children = await getAllBlocksByBlockId(block.Id);
    } else if (block.Type === "callout" && block.Callout && block.HasChildren) {
      block.Callout.Children = await getAllBlocksByBlockId(block.Id);
    }
  }

  return allBlocks;
}

export async function getBlock(blockId: string): Promise<Block> {
  const params: requestParams.RetrieveBlock = {
    block_id: blockId,
  };

  const res = await retry(
    async (bail) => {
      try {
        return (await notion.blocks.retrieve(
          params as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        )) as responses.RetrieveBlockResponse;
      } catch (error: unknown) {
        if (error instanceof APIResponseError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            bail(error);
          }
        }
        throw error;
      }
    },
    {
      retries: numberOfRetry,
    },
  );

  return _buildBlock(res);
}

export async function getAllDatabaseTags(
  databaseId: string,
  databaseTitle: string,
): Promise<SelectProperty[]> {
  const allPosts = await getDatabasePages(databaseId, databaseTitle);

  const tagNames: string[] = [];
  return allPosts
    .flatMap((post) => post.Tags)
    .reduce((acc, tag) => {
      if (!tagNames.includes(tag.name)) {
        acc.push(tag);
        tagNames.push(tag.name);
      }
      return acc;
    }, [] as SelectProperty[])
    .sort((a: SelectProperty, b: SelectProperty) =>
      a.name.localeCompare(b.name),
    );
}

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
    const res = await axios({
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

    console.log(`Downloading file:\n${filepath}`);
    return pipeline(stream, new ExifTransformer(), writeStream);
  } catch (error) {
    console.log("\nError requesting image\n" + error);
    return Promise.resolve();
  }
}

export async function downloadPublicImage(url: URL) {
  let res!: AxiosResponse;
  try {
    res = await axios({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });
  } catch (error) {
    console.log("\nError requesting image\n" + error);
    return Promise.resolve();
  }
  console.log("\n===== Starting Public Image Download =====");

  if (!res || res.status != 200) {
    console.log(res);
    return Promise.resolve();
  }

  const dir = "./public/media/" + url.pathname.split("/").slice(-2)[0];
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
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
    return;
  }

  const writeStream = createWriteStream(imagePath);
  const writeStreamBg = createWriteStream(imageBgPath);

  let stream = res.data;
  let streamBg = res.data;

  if (res.headers["content-type"] === "image/jpeg") {
    stream = stream.pipe(sharp().resize({ width: 800 }).rotate());
    streamBg = streamBg.pipe(sharp().resize({ width: 20 }).rotate());
  } else {
    stream = stream.pipe(
      sharp().resize({ width: 800 }).jpeg().flatten({ background: "#000000" }),
    );
    streamBg = streamBg.pipe(
      sharp().resize({ width: 20 }).jpeg().flatten({ background: "#000000" }),
    );
  }
  try {
    console.log(`Downloading file:\n${imagePath}`);
    console.log(`Downloading file:\n${imageBgPath}`);
    return (
      pipeline(stream, new ExifTransformer(), writeStream),
      pipeline(streamBg, new ExifTransformer(), writeStreamBg)
    );
  } catch (error) {
    console.log("\nError while downloading file\n" + error);
    writeStream.end();
    writeStreamBg.end();
    return Promise.resolve();
  }
}

export async function downloadVideo(url: URL) {
  let res;
  try {
    res = await axios({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });
  } catch (error) {
    console.log("\nError requesting file\n" + error);
    return Promise.resolve();
  }
  console.log("\n===== Starting File Download =====");

  if (!res || res.status !== 200) {
    console.log(res);
    return Promise.resolve();
  }

  const dir = "./public/media/" + url.pathname.split("/").slice(-2)[0];

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const fileName = decodeURIComponent(url.pathname.split("/").slice(-1)[0]);
  const fileNameWithSlug = modifyFileName(fileName, {
    // newBeginning: slug.split("/").pop() + "_",
  });

  const filepath = `${dir}/${fileNameWithSlug}`;

  if (fs.existsSync(filepath)) {
    console.log(`File already exists:\n${filepath}`);
    return;
  }

  const writeStream = createWriteStream(filepath);

  try {
    console.log(`Downloading file:\n${filepath}`);
    return pipeline(res.data, writeStream);
  } catch (error) {
    console.log("\nError while downloading file\n" + error);
    writeStream.end();
    return Promise.resolve();
  }
}

export async function downloadFile(url: URL) {
  let res;
  try {
    res = await axios({
      method: "get",
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "stream",
    });
  } catch (error) {
    console.log("\nError requesting file\n" + error);
    return Promise.resolve();
  }
  console.log("\n===== Starting File Download =====");

  if (!res || res.status !== 200) {
    console.log(res);
    return Promise.resolve();
  }

  const dir = "./public/media/" + url.pathname.split("/").slice(-2)[0];

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  //// Check if this is working. Maybe it is creating repetitions
  //// computational-design-strategies-metaball_metaball-widescreen-bg.jpg
  //// metaball_metaball-widescreen-bg.jpg
  const fileName = decodeURIComponent(url.pathname.split("/").slice(-1)[0]);

  const filepath = `${dir}/${fileName}`;

  if (fs.existsSync(filepath)) {
    console.log(`File already exists:\n${filepath}`);
    return;
  }

  const writeStream = createWriteStream(filepath);

  try {
    console.log(`Downloading file:\n${filepath}`);
    return pipeline(res.data, writeStream);
  } catch (error) {
    console.log("\nError while downloading file\n" + error);
    writeStream.end();
    return Promise.resolve();
  }
}

// export async function getDatabase(): Promise<Database> {
//   if (databaseCache !== null) {
//     return Promise.resolve(databaseCache);
//   }

//   const params: requestParams.RetrieveDatabase = {
//     database_id: DATABASE_ID,
//   };

//   const res = await retry(
//     async (bail) => {
//       try {
//         return (await notion.databases.retrieve(
//           params as any // eslint-disable-line @typescript-eslint/no-explicit-any
//         )) as responses.RetrieveDatabaseResponse;
//       } catch (error: unknown) {
//         if (error instanceof APIResponseError) {
//           if (error.status && error.status >= 400 && error.status < 500) {
//             bail(error);
//           }
//         }
//         throw error;
//       }
//     },
//     {
//       retries: numberOfRetry,
//     }
//   );

//   let icon: FileObject | Emoji | null = null;
//   if (res.icon) {
//     if (res.icon.type === "emoji" && "emoji" in res.icon) {
//       icon = {
//         Type: res.icon.type,
//         Emoji: res.icon.emoji,
//       };
//     } else if (res.icon.type === "external" && "external" in res.icon) {
//       icon = {
//         Type: res.icon.type,
//         Url: res.icon.external?.url || "",
//       };
//     } else if (res.icon.type === "file" && "file" in res.icon) {
//       icon = {
//         Type: res.icon.type,
//         Url: res.icon.file?.url || "",
//       };
//     }
//   }

//   let cover: FileObject | null = null;
//   if (res.cover) {
//     cover = {
//       Type: res.cover.type,
//       Url: res.cover.external?.url || res.cover.file?.url || "",
//     };
//   }

//   const database: Database = {
//     Title: res.title.map((richText) => richText.plain_text).join(""),
//     Description: res.description
//       .map((richText) => richText.plain_text)
//       .join(""),
//     Icon: icon,
//     Cover: cover,
//   };

//   databaseCache = database;
//   return database;
// }

function _buildBlock(blockObject: responses.BlockObject): Block {
  const block: Block = {
    Id: blockObject.id,
    Type: blockObject.type,
    HasChildren: blockObject.has_children,
    ParentId: blockObject.parent.page_id,
  };

  switch (blockObject.type) {
    case "paragraph":
      if (blockObject.paragraph) {
        const paragraph: Paragraph = {
          RichTexts: blockObject.paragraph.rich_text.map(_buildRichText),
          Color: blockObject.paragraph.color,
        };
        block.Paragraph = paragraph;
      }
      break;
    case "heading_1":
      if (blockObject.heading_1) {
        const heading1: Heading1 = {
          RichTexts: blockObject.heading_1.rich_text.map(_buildRichText),
          Color: blockObject.heading_1.color,
          IsToggleable: blockObject.heading_1.is_toggleable,
        };
        block.Heading1 = heading1;
      }
      break;
    case "heading_2":
      if (blockObject.heading_2) {
        const heading2: Heading2 = {
          RichTexts: blockObject.heading_2.rich_text.map(_buildRichText),
          Color: blockObject.heading_2.color,
          IsToggleable: blockObject.heading_2.is_toggleable,
        };
        block.Heading2 = heading2;
      }
      break;
    case "heading_3":
      if (blockObject.heading_3) {
        const heading3: Heading3 = {
          RichTexts: blockObject.heading_3.rich_text.map(_buildRichText),
          Color: blockObject.heading_3.color,
          IsToggleable: blockObject.heading_3.is_toggleable,
        };
        block.Heading3 = heading3;
      }
      break;
    case "bulleted_list_item":
      if (blockObject.bulleted_list_item) {
        const bulletedListItem: BulletedListItem = {
          RichTexts:
            blockObject.bulleted_list_item.rich_text.map(_buildRichText),
          Color: blockObject.bulleted_list_item.color,
        };
        block.BulletedListItem = bulletedListItem;
      }
      break;
    case "numbered_list_item":
      if (blockObject.numbered_list_item) {
        const numberedListItem: NumberedListItem = {
          RichTexts:
            blockObject.numbered_list_item.rich_text.map(_buildRichText),
          Color: blockObject.numbered_list_item.color,
        };
        block.NumberedListItem = numberedListItem;
      }
      break;
    case "to_do":
      if (blockObject.to_do) {
        const toDo: ToDo = {
          RichTexts: blockObject.to_do.rich_text.map(_buildRichText),
          Checked: blockObject.to_do.checked,
          Color: blockObject.to_do.color,
        };
        block.ToDo = toDo;
      }
      break;
    case "video":
      if (blockObject.video) {
        const video: Video = {
          Caption: blockObject.video.caption?.map(_buildRichText) || [],
          Type: blockObject.video.type,
        };
        if (
          blockObject.video.type === "external" &&
          blockObject.video.external
        ) {
          video.External = { Url: blockObject.video.external.url };
        } else if (
          blockObject.video.type === "file" &&
          blockObject.video.file
        ) {
          video.File = {
            Type: blockObject.video.type,
            Url: blockObject.video.file.url,
            ExpiryTime: blockObject.video.file.expiry_time,
          };
        }
        block.Video = video;
      }
      break;
    case "image":
      // console.log("\n===== Image In =====");
      // console.dir(blockObject);
      if (blockObject.image) {
        const image: Image = {
          Caption: blockObject.image.caption?.map(_buildRichText) || [],
          Type: blockObject.image.type,
        };
        if (
          blockObject.image.type === "external" &&
          blockObject.image.external
        ) {
          image.External = { Url: blockObject.image.external.url };
        } else if (
          blockObject.image.type === "file" &&
          blockObject.image.file
        ) {
          image.File = {
            Type: blockObject.image.type,
            Url: blockObject.image.file.url,
            ExpiryTime: blockObject.image.file.expiry_time,
          };
        }
        block.Image = image;
        // console.log("\n===== Image Out =====");
        // console.dir(block.Image.Caption);
      }
      break;
    case "file":
      // console.log("\n===== File In =====");
      // console.dir(blockObject);
      if (blockObject.file) {
        const file: File = {
          Caption: blockObject.file.caption?.map(_buildRichText) || [],
          Type: blockObject.file.type,
        };
        if (blockObject.file.type === "external" && blockObject.file.external) {
          file.External = { Url: blockObject.file.external.url };
        } else if (blockObject.file.type === "file" && blockObject.file.file) {
          file.File = {
            Type: blockObject.file.type,
            Url: blockObject.file.file.url,
            ExpiryTime: blockObject.file.file.expiry_time,
          };
        }
        block.File = file;
        // console.log("\n===== File Out =====");
        // console.dir(block.File);
      }
      break;
    case "code":
      if (blockObject.code) {
        const code: Code = {
          Caption: blockObject.code.caption?.map(_buildRichText) || [],
          RichTexts: blockObject.code.rich_text.map(_buildRichText),
          Language: blockObject.code.language,
        };
        block.Code = code;
      }
      break;
    case "quote":
      if (blockObject.quote) {
        const quote: Quote = {
          RichTexts: blockObject.quote.rich_text.map(_buildRichText),
          Color: blockObject.quote.color,
        };
        block.Quote = quote;
      }
      break;
    case "equation":
      if (blockObject.equation) {
        const equation: Equation = {
          Expression: blockObject.equation.expression,
        };
        block.Equation = equation;
      }
      break;
    case "callout":
      if (blockObject.callout) {
        let icon: FileObject | Emoji | null = null;
        if (blockObject.callout.icon) {
          if (
            blockObject.callout.icon.type === "emoji" &&
            "emoji" in blockObject.callout.icon
          ) {
            icon = {
              Type: blockObject.callout.icon.type,
              Emoji: blockObject.callout.icon.emoji,
            };
          } else if (
            blockObject.callout.icon.type === "external" &&
            "external" in blockObject.callout.icon
          ) {
            icon = {
              Type: blockObject.callout.icon.type,
              Url: blockObject.callout.icon.external?.url || "",
            };
          }
        }

        const callout: Callout = {
          RichTexts: blockObject.callout.rich_text.map(_buildRichText),
          Icon: icon,
          Color: blockObject.callout.color,
        };
        block.Callout = callout;
      }
      break;
    case "synced_block":
      if (blockObject.synced_block) {
        let syncedFrom: SyncedFrom | null = null;
        if (
          blockObject.synced_block.synced_from &&
          blockObject.synced_block.synced_from.block_id
        ) {
          syncedFrom = {
            BlockId: blockObject.synced_block.synced_from.block_id,
          };
        }

        const syncedBlock: SyncedBlock = {
          SyncedFrom: syncedFrom,
        };
        block.SyncedBlock = syncedBlock;
      }
      break;
    case "toggle":
      if (blockObject.toggle) {
        const toggle: Toggle = {
          RichTexts: blockObject.toggle.rich_text.map(_buildRichText),
          Color: blockObject.toggle.color,
          Children: [],
        };
        block.Toggle = toggle;
      }
      break;
    case "embed":
      if (blockObject.embed) {
        const embed: Embed = {
          Url: blockObject.embed.url,
        };
        block.Embed = embed;
      }
      break;
    case "bookmark":
      if (blockObject.bookmark) {
        const bookmark: Bookmark = {
          Url: blockObject.bookmark.url,
        };
        block.Bookmark = bookmark;
      }
      break;
    case "link_preview":
      if (blockObject.link_preview) {
        const linkPreview: LinkPreview = {
          Url: blockObject.link_preview.url,
        };
        block.LinkPreview = linkPreview;
      }
      break;
    case "table":
      if (blockObject.table) {
        const table: Table = {
          TableWidth: blockObject.table.table_width,
          HasColumnHeader: blockObject.table.has_column_header,
          HasRowHeader: blockObject.table.has_row_header,
          Rows: [],
        };
        block.Table = table;
      }
      break;
    case "column_list":
      const columnList: ColumnList = {
        Columns: [],
      };
      block.ColumnList = columnList;
      break;
    case "table_of_contents":
      if (blockObject.table_of_contents) {
        const tableOfContents: TableOfContents = {
          Color: blockObject.table_of_contents.color,
        };
        block.TableOfContents = tableOfContents;
      }
      break;
    case "link_to_page":
      if (blockObject.link_to_page && blockObject.link_to_page.page_id) {
        const linkToPage: LinkToPage = {
          Type: blockObject.link_to_page.type,
          PageId: blockObject.link_to_page.page_id,
        };
        block.LinkToPage = linkToPage;
      }
      break;
    case "pdf":
      // console.dir(blockObject);
      // To do... copy from file
      // Download pdf to public folder in posts-files-downloader.ts

      // console.log("\n===== File In =====");
      // console.dir(blockObject);
      if (blockObject.pdf) {
        const file: File = {
          Caption: blockObject.pdf.caption?.map(_buildRichText) || [],
          Type: blockObject.pdf.type,
        };
        if (blockObject.pdf.type === "external" && blockObject.pdf.external) {
          file.External = { Url: blockObject.pdf.external.url };
        } else if (blockObject.pdf.type === "file" && blockObject.pdf.file) {
          file.File = {
            Type: blockObject.pdf.type,
            Url: blockObject.pdf.file.url,
            ExpiryTime: blockObject.pdf.file.expiry_time,
          };
        }
        block.File = file;
        // console.log("\n===== File Out =====");
        // console.dir(block);
      }
      break;
  }
  return block;
}

async function _getTableRows(blockId: string): Promise<TableRow[]> {
  let results: responses.BlockObject[] = [];

  if (fs.existsSync(`tmp/${blockId}.json`)) {
    results = JSON.parse(fs.readFileSync(`tmp/${blockId}.json`, "utf-8"));
  } else {
    const params: requestParams.RetrieveBlockChildren = {
      block_id: blockId,
    };

    while (true) {
      const res = await retry(
        async (bail) => {
          try {
            return (await notion.blocks.children.list(
              params as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            )) as responses.RetrieveBlockChildrenResponse;
          } catch (error: unknown) {
            if (error instanceof APIResponseError) {
              if (error.status && error.status >= 400 && error.status < 500) {
                bail(error);
              }
            }
            throw error;
          }
        },
        {
          retries: numberOfRetry,
        },
      );

      results = results.concat(res.results);

      if (!res.has_more) {
        break;
      }

      params["start_cursor"] = res.next_cursor as string;
    }
  }

  return results.map((blockObject) => {
    const tableRow: TableRow = {
      Id: blockObject.id,
      Type: blockObject.type,
      HasChildren: blockObject.has_children,
      Cells: [],
    };

    if (blockObject.type === "table_row" && blockObject.table_row) {
      const cells: TableCell[] = blockObject.table_row.cells.map((cell) => {
        const tableCell: TableCell = {
          RichTexts: cell.map(_buildRichText),
        };

        return tableCell;
      });

      tableRow.Cells = cells;
    }

    return tableRow;
  });
}

async function _getColumns(blockId: string): Promise<Column[]> {
  let results: responses.BlockObject[] = [];

  if (fs.existsSync(`tmp/${blockId}.json`)) {
    results = JSON.parse(fs.readFileSync(`tmp/${blockId}.json`, "utf-8"));
  } else {
    const params: requestParams.RetrieveBlockChildren = {
      block_id: blockId,
    };

    while (true) {
      const res = await retry(
        async (bail) => {
          try {
            return (await notion.blocks.children.list(
              params as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            )) as responses.RetrieveBlockChildrenResponse;
          } catch (error: unknown) {
            if (error instanceof APIResponseError) {
              if (error.status && error.status >= 400 && error.status < 500) {
                bail(error);
              }
            }
            throw error;
          }
        },
        {
          retries: numberOfRetry,
        },
      );

      results = results.concat(res.results);

      if (!res.has_more) {
        break;
      }

      params["start_cursor"] = res.next_cursor as string;
    }
  }

  return await Promise.all(
    results.map(async (blockObject) => {
      const children = await getAllBlocksByBlockId(blockObject.id);

      const column: Column = {
        Id: blockObject.id,
        Type: blockObject.type,
        HasChildren: blockObject.has_children,
        Children: children,
      };

      return column;
    }),
  );
}

async function _getSyncedBlockChildren(block: Block): Promise<Block[]> {
  let originalBlock: Block = block;
  if (
    block.SyncedBlock &&
    block.SyncedBlock.SyncedFrom &&
    block.SyncedBlock.SyncedFrom.BlockId
  ) {
    try {
      originalBlock = await getBlock(block.SyncedBlock.SyncedFrom.BlockId);
    } catch (err) {
      console.log(
        `Could not retrieve the original synced_block. error: ${err}`,
      );
      return [];
    }
  }

  const children = await getAllBlocksByBlockId(originalBlock.Id);
  return children;
}

function _validPageObject(pageObject: responses.PageObject): boolean {
  const prop = pageObject.properties;
  return !!prop.Name.title && prop.Name.title.length > 0;
}

async function _buildDatabase(
  databaseObject: DatabaseObject,
): Promise<Database> {
  let title: string;
  try {
    title = databaseObject.title
      ? databaseObject.title.map((richText) => richText.plain_text).join("")
      : "";
  } catch (error) {
    console.error("Error building a database: no title found", error);
    throw error;
  }
  let icon: FileObject | Emoji | null = null;
  if (databaseObject.icon) {
    if (
      databaseObject.icon.type === "emoji" &&
      "emoji" in databaseObject.icon
    ) {
      icon = {
        Type: databaseObject.icon.type,
        Emoji: databaseObject.icon.emoji,
      };
    } else if (
      databaseObject.icon.type === "external" &&
      "external" in databaseObject.icon
    ) {
      icon = {
        Type: databaseObject.icon.type,
        Url: databaseObject.icon.external?.url || "",
      };
    }
  }

  let cover: FileObject | null = null;
  if (databaseObject.cover) {
    cover = {
      Type: databaseObject.cover.type,
      Url:
        databaseObject.cover.external?.url ||
        databaseObject.cover.file?.url ||
        "",
    };
  }

  let description =
    databaseObject.description && databaseObject.description.length > 0
      ? databaseObject.description
          .map((richText) => richText.plain_text)
          .join("")
      : "";

  let databaseId = databaseObject.id;

  let pages: Page[] | [] = [];
  try {
    pages = await getDatabasePages(databaseId, title);
  } catch (error) {
    console.error("Error getting pages from a database:", error);
    throw error;
  }

  const database: Database = {
    Cover: cover,
    Description: description,
    Icon: icon,
    Title: title,
    Id: databaseId,
    Pages: pages,
  };

  return database;
}

function _buildPage(
  pageObject: responses.PageObject,
  databaseTitle: string,
): Page {
  const prop = pageObject.properties;
  if (
    !prop.hasOwnProperty("Name") ||
    !prop.hasOwnProperty("Name_en") ||
    !prop.hasOwnProperty("CoverAlt") ||
    !prop.hasOwnProperty("Description") ||
    !prop.hasOwnProperty("Tags")
  ) {
    throw new Error(
      "Database does not have one of the mandatory columns: Name(Aa), CoverAlt(text), Description(text), Tags(Multi-select)",
    );
  }

  let icon: FileObject | Emoji | null = null;
  if (pageObject.icon) {
    if (pageObject.icon.type === "emoji" && "emoji" in pageObject.icon) {
      icon = {
        Type: pageObject.icon.type,
        Emoji: pageObject.icon.emoji,
      };
    } else if (
      pageObject.icon.type === "external" &&
      "external" in pageObject.icon
    ) {
      icon = {
        Type: pageObject.icon.type,
        Url: pageObject.icon.external?.url || "",
      };
    }
  }

  let cover: FileObject | null = null;
  try {
    if (pageObject.cover) {
      cover = {
        Type: pageObject.cover.type,
        Url: pageObject.cover.external?.url || pageObject.cover.file?.url || "",
      };
    }
  } catch (error) {
    console.error("Error building a page while getting the cover", error);
    throw error;
  }

  let coverAlt: string | null = null;
  try {
    if (prop.CoverAlt) {
      coverAlt =
        prop.CoverAlt && prop.CoverAlt.rich_text
          ? prop.CoverAlt.rich_text
              .map((richText) => richText.plain_text)
              .join("")
          : "";
    }
  } catch (error) {
    console.error(
      "Error building a page while getting the cover alt text",
      error,
    );
    throw error;
  }

  let photo: FileObject | null = null;
  if (prop.Photo && prop.Photo.files && prop.Photo.files.length > 0) {
    if (prop.Photo.files[0].external) {
      photo = {
        Type: prop.Photo.type,
        Url: prop.Photo.files[0].external.url,
      };
    } else if (prop.Photo.files[0].file) {
      photo = {
        Type: prop.Photo.files[0].type,
        Url: prop.Photo.files[0].file.url,
        ExpiryTime: prop.Photo.files[0].file.expiry_time,
      };
    }
  }

  const name_en =
    prop.Name_en && prop.Name_en.rich_text && prop.Name_en.rich_text.length > 0
      ? prop.Name_en.rich_text.map((richText) => richText.plain_text).join("")
      : "";

  const slug = name_en === "Homepage" ? "/" : titleToSlug(name_en);

  const databaseTitleSlug = titleToSlug(databaseTitle);

  let ShortDescription: string | null = null;
  try {
    if (prop.ShortDescription) {
      ShortDescription =
        prop.ShortDescription && prop.ShortDescription.rich_text
          ? prop.ShortDescription.rich_text
              .map((richText) => richText.plain_text)
              .join("")
          : "";
    }
  } catch (error) {
    console.error("Error building a page while getting the full name", error);
    throw error;
  }

  const page: Page = {
    Cover: cover,
    CoverAlt: coverAlt,
    CoverAlt_de:
      prop.CoverAlt_de &&
      prop.CoverAlt_de.rich_text &&
      prop.CoverAlt_de.rich_text.length > 0
        ? prop.CoverAlt_de.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    CoverAlt_pt:
      prop.CoverAlt_pt &&
      prop.CoverAlt_pt.rich_text &&
      prop.CoverAlt_pt.rich_text.length > 0
        ? prop.CoverAlt_pt.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    Description:
      prop.Description.rich_text && prop.Description.rich_text.length > 0
        ? prop.Description.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    Description_de:
      prop.Description_de &&
      prop.Description_de.rich_text &&
      prop.Description_de.rich_text.length > 0
        ? prop.Description_de.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    Description_pt:
      prop.Description_pt &&
      prop.Description_pt.rich_text &&
      prop.Description_pt.rich_text.length > 0
        ? prop.Description_pt.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    Icon: icon,
    Name:
      prop.Name.title && prop.Name.title && prop.Name.title.length > 0
        ? prop.Name.title.map((richText) => richText.plain_text).join("")
        : "",
    PageId: pageObject.id,
    Slug: databaseTitleSlug !== "pages" ? `${databaseTitleSlug}/${slug}` : slug,
    Tags: prop.Tags.multi_select ? prop.Tags.multi_select : [],
    Active: prop.Active ? prop.Active.checkbox : undefined,
    Authors:
      prop.Authors && prop.Authors.multi_select
        ? prop.Authors.multi_select
        : [],
    Apps: prop.Apps && prop.Apps.multi_select ? prop.Apps.multi_select : [],
    Category:
      prop.Category && prop.Category.select && prop.Category.select.name
        ? prop.Category.select.name
        : "",
    City: prop.City && prop.City.multi_select ? prop.City.multi_select : [],
    Client:
      prop.Client && prop.Client.select && prop.Client.select.name
        ? prop.Client.select.name
        : "",
    Country:
      prop.Country && prop.Country.select && prop.Country.select.name
        ? prop.Country.select.name
        : "",
    DatabasesRef:
      prop.DatabasesRef && prop.DatabasesRef.multi_select
        ? prop.DatabasesRef.multi_select
        : [],
    DateStart: prop.Date && prop.Date.date ? prop.Date.date.start : "",
    DateEnd:
      prop.Date && prop.Date.date && prop.Date.date.end
        ? prop.Date.date.end
        : "",
    Development:
      prop.Development && prop.Development.multi_select
        ? prop.Development.multi_select
        : [],
    Director:
      prop.Director && prop.Director.multi_select
        ? prop.Director.multi_select
        : [],
    Disclosed: prop.Disclosed ? prop.Disclosed.checkbox : undefined,
    Event:
      prop.Event && prop.Event.select && prop.Event.select.name
        ? prop.Event.select.name
        : "",
    Format:
      prop.Format && prop.Format.select && prop.Format.select.name
        ? prop.Format.select.name
        : "",
    Instagram: prop.Instagram && prop.Instagram.url ? prop.Instagram.url : "",
    Language:
      prop.Language && prop.Language.multi_select
        ? prop.Language.multi_select
        : [],
    Locale:
      prop.Locale && prop.Locale.select && prop.Locale.select.name
        ? prop.Locale.select.name
        : "en",
    Level:
      prop.Level && prop.Level.select && prop.Level.select.name
        ? prop.Level.select.name
        : "",
    Link:
      prop.Link && prop.Link.rich_text && prop.Link.rich_text.length > 0
        ? prop.Link.rich_text.map(_buildRichText)
        : [],
    LinkedIn: prop.LinkedIn && prop.LinkedIn.url ? prop.LinkedIn.url : "",
    Manager:
      prop.Manager && prop.Manager.multi_select
        ? prop.Manager.multi_select
        : [],
    Name_en:
      prop.Name_en &&
      prop.Name_en.rich_text &&
      prop.Name_en.rich_text.length > 0
        ? prop.Name_en.rich_text.map((richText) => richText.plain_text).join("")
        : "",
    Name_de:
      prop.Name_de &&
      prop.Name_de.rich_text &&
      prop.Name_de.rich_text.length > 0
        ? prop.Name_de.rich_text.map((richText) => richText.plain_text).join("")
        : "",
    Name_pt:
      prop.Name_pt &&
      prop.Name_pt.rich_text &&
      prop.Name_pt.rich_text.length > 0
        ? prop.Name_pt.rich_text.map((richText) => richText.plain_text).join("")
        : "",
    Organization:
      prop.Organization &&
      prop.Organization.select &&
      prop.Organization.select.name
        ? prop.Organization.select.name
        : "",
    Photo: photo,
    Place:
      prop.Place && prop.Place.select && prop.Place.select.name
        ? prop.Place.select.name
        : "",
    References:
      prop.References &&
      prop.References.rich_text &&
      prop.References.rich_text.length > 0
        ? prop.References.rich_text.map(_buildRichText)
        : [],
    ShortDescription: ShortDescription,
    ShortDescription_de:
      prop.ShortDescription_de &&
      prop.ShortDescription_de.rich_text &&
      prop.ShortDescription_de.rich_text.length > 0
        ? prop.ShortDescription_de.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    ShortDescription_pt:
      prop.ShortDescription_pt &&
      prop.ShortDescription_pt.rich_text &&
      prop.ShortDescription_pt.rich_text.length > 0
        ? prop.ShortDescription_pt.rich_text
            .map((richText) => richText.plain_text)
            .join("")
        : "",
    Team: prop.Team && prop.Team.multi_select ? prop.Team.multi_select : [],
    Title:
      prop.Title && prop.Title.rich_text && prop.Title.rich_text.length > 0
        ? prop.Title.rich_text.map((richText) => richText.plain_text).join("")
        : "",
  };

  return page;
}

function _buildRichText(richTextObject: responses.RichTextObject): RichText {
  const annotation: Annotation = {
    Bold: richTextObject.annotations.bold,
    Italic: richTextObject.annotations.italic,
    Strikethrough: richTextObject.annotations.strikethrough,
    Underline: richTextObject.annotations.underline,
    Code: richTextObject.annotations.code,
    Color: richTextObject.annotations.color,
  };

  const richText: RichText = {
    Annotation: annotation,
    PlainText: richTextObject.plain_text,
    Href: richTextObject.href,
  };

  if (richTextObject.type === "text" && richTextObject.text) {
    const text: Text = {
      Content: richTextObject.text.content,
    };

    if (richTextObject.text.link) {
      text.Link = {
        Url: richTextObject.text.link.url,
      };
    }

    richText.Text = text;
  } else if (richTextObject.type === "equation" && richTextObject.equation) {
    const equation: Equation = {
      Expression: richTextObject.equation.expression,
    };
    richText.Equation = equation;
  } else if (richTextObject.type === "mention" && richTextObject.mention) {
    const mention: Mention = {
      Type: richTextObject.mention.type,
    };

    if (richTextObject.mention.type === "page" && richTextObject.mention.page) {
      const reference: Reference = {
        Id: richTextObject.mention.page.id,
      };
      mention.Page = reference;
    }

    richText.Mention = mention;
  }

  return richText;
}

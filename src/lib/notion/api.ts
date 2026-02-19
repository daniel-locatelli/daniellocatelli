import fs from "node:fs";
import retry from "async-retry";
import { NOTION_API_SECRET } from "../../config/server";
import type * as responses from "./responses";
import type * as requestParams from "./request-params";
import type {
  Database,
  Page,
  Block,
  SelectProperty,
  FileObject,
  Emoji,
  TableRow,
  TableCell,
  Column,
} from "../notion-interfaces";
import { Client, APIResponseError } from "@notionhq/client";
import {
  type SearchResponse,
  type ListBlockChildrenResponse,
  type GetBlockResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { DatabaseObject } from "./responses";
import {
  buildBlock,
  buildPage,
  validPageObject,
  buildRichText,
} from "./parser";

const notion = new Client({
  auth: NOTION_API_SECRET,
});

let databasesCache: Database[] | null = null;

const numberOfRetry = 3;

export async function getAllDatabases(): Promise<Database[]> {
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

  // Type assertion or filter to ensure we only have DatabaseObjects
  // The search response returns (PageObject | DatabaseObject)[], we assume databases based on filter
  databaseObjectArray = response.results as unknown as Array<DatabaseObject>;

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
          // Fix for "params as any" - explicitly cast to unknown then to QueryDatabaseParameters if needed,
          // or just rely on the library accepting strict types if requestParams matches.
          // Since requestParams might differ slightly from official types, keeping 'any' for now to match behavior,
          // but marking it for future fix if strictly required.
          // However, we want to fix it. Let's see if we can cast to parameters accepted by query.
          return (await notion.databases.query(
            params as any,
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

    if (!res.has_more) {
      break;
    }

    params["start_cursor"] = res.next_cursor as string;
  }

  return results
    .filter((pageObject) => validPageObject(pageObject))
    .map((pageObject) => buildPage(pageObject, databaseTitle));
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
              params as any,
            )) as ListBlockChildrenResponse;
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

      // Cast results to BlockObject[] as our local type might vary from official
      results = results.concat(
        res.results as unknown as responses.BlockObject[],
      );

      if (!res.has_more) {
        break;
      }

      params["start_cursor"] = res.next_cursor as string;
    }
  }

  const allBlocks = results.map((blockObject) => buildBlock(blockObject));

  await Promise.all(
    allBlocks.map(async (block) => {
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
      } else if (
        block.Type === "callout" &&
        block.Callout &&
        block.HasChildren
      ) {
        block.Callout.Children = await getAllBlocksByBlockId(block.Id);
      }
    }),
  );

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
          params as any,
        )) as GetBlockResponse;
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

  return buildBlock(res as unknown as responses.BlockObject);
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
              params as any,
            )) as ListBlockChildrenResponse;
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

      results = results.concat(
        res.results as unknown as responses.BlockObject[],
      );

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
          RichTexts: cell.map(buildRichText),
        };

        return tableCell;
      });

      // Update cells
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
              params as any,
            )) as ListBlockChildrenResponse;
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

      results = results.concat(
        res.results as unknown as responses.BlockObject[],
      );

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

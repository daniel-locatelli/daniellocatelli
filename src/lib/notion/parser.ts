import {
  type Block,
  type Paragraph,
  type Heading1,
  type Heading2,
  type Heading3,
  type BulletedListItem,
  type NumberedListItem,
  type ToDo,
  type Image,
  type Code,
  type Quote,
  type Equation,
  type Callout,
  type Embed,
  type Video,
  type File,
  type Bookmark,
  type LinkPreview,
  type SyncedBlock,
  type SyncedFrom,
  type Table,
  type TableRow,
  type TableCell,
  type Toggle,
  type ColumnList,
  type Column,
  type TableOfContents,
  type RichText,
  type Text,
  type Annotation,
  type SelectProperty,
  type Emoji,
  type FileObject,
  type LinkToPage,
  type Mention,
  type Reference,
  type Page,
} from "../notion-interfaces";
import type * as responses from "./responses";
import { titleToSlug } from "../utils";

export function buildRichText(
  richTextObject: responses.RichTextObject,
): RichText {
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

export function buildBlock(blockObject: responses.BlockObject): Block {
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
          RichTexts: blockObject.paragraph.rich_text.map(buildRichText),
          Color: blockObject.paragraph.color,
        };
        block.Paragraph = paragraph;
      }
      break;
    case "heading_1":
      if (blockObject.heading_1) {
        const heading1: Heading1 = {
          RichTexts: blockObject.heading_1.rich_text.map(buildRichText),
          Color: blockObject.heading_1.color,
          IsToggleable: blockObject.heading_1.is_toggleable,
        };
        block.Heading1 = heading1;
      }
      break;
    case "heading_2":
      if (blockObject.heading_2) {
        const heading2: Heading2 = {
          RichTexts: blockObject.heading_2.rich_text.map(buildRichText),
          Color: blockObject.heading_2.color,
          IsToggleable: blockObject.heading_2.is_toggleable,
        };
        block.Heading2 = heading2;
      }
      break;
    case "heading_3":
      if (blockObject.heading_3) {
        const heading3: Heading3 = {
          RichTexts: blockObject.heading_3.rich_text.map(buildRichText),
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
            blockObject.bulleted_list_item.rich_text.map(buildRichText),
          Color: blockObject.bulleted_list_item.color,
        };
        block.BulletedListItem = bulletedListItem;
      }
      break;
    case "numbered_list_item":
      if (blockObject.numbered_list_item) {
        const numberedListItem: NumberedListItem = {
          RichTexts:
            blockObject.numbered_list_item.rich_text.map(buildRichText),
          Color: blockObject.numbered_list_item.color,
        };
        block.NumberedListItem = numberedListItem;
      }
      break;
    case "to_do":
      if (blockObject.to_do) {
        const toDo: ToDo = {
          RichTexts: blockObject.to_do.rich_text.map(buildRichText),
          Checked: blockObject.to_do.checked,
          Color: blockObject.to_do.color,
        };
        block.ToDo = toDo;
      }
      break;
    case "video":
      if (blockObject.video) {
        const video: Video = {
          Caption: blockObject.video.caption?.map(buildRichText) || [],
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
      if (blockObject.image) {
        const image: Image = {
          Caption: blockObject.image.caption?.map(buildRichText) || [],
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
      }
      break;
    case "file":
      if (blockObject.file) {
        const file: File = {
          Caption: blockObject.file.caption?.map(buildRichText) || [],
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
      }
      break;
    case "code":
      if (blockObject.code) {
        const code: Code = {
          Caption: blockObject.code.caption?.map(buildRichText) || [],
          RichTexts: blockObject.code.rich_text.map(buildRichText),
          Language: blockObject.code.language,
        };
        block.Code = code;
      }
      break;
    case "quote":
      if (blockObject.quote) {
        const quote: Quote = {
          RichTexts: blockObject.quote.rich_text.map(buildRichText),
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
          RichTexts: blockObject.callout.rich_text.map(buildRichText),
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
          RichTexts: blockObject.toggle.rich_text.map(buildRichText),
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
      if (blockObject.pdf) {
        const file: File = {
          Caption: blockObject.pdf.caption?.map(buildRichText) || [],
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
      }
      break;
  }
  return block;
}

export function validPageObject(pageObject: responses.PageObject): boolean {
  const prop = pageObject.properties;
  return !!prop.Name.title && prop.Name.title.length > 0;
}

export function buildPage(
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
        ? prop.Link.rich_text.map(buildRichText)
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
        ? prop.References.rich_text.map(buildRichText)
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

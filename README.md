<h1 align="center">
  <img src="https://github.com/daniel-locatelli/daniellocatelli/blob/main/public/android-chrome-512x512.png" width="150px"/><br/>
  Daniel Locatelli
</h1>
<h3 align="center">
    Website built with Astro + Notion as CMS
</h3>

<p align="center"><a href="https://daniellocatelli.com"><img src="https://img.shields.io/badge/https://-daniellocatelli.com-white" alt="website"></a> <a href="https://www.linkedin.com/in/daniel-locatelli/"><img src="https://img.shields.io/badge/Connect-Daniel%20Locatelli-blue?logo=linkedin" alt="Connect with me on LinkedIn"></a></p>
<p align="center"></p>

# About
This website was developed using the [Astro](https://astro.build/) framework and [Notion](https://www.notion.so/) as a CMS.

## Credits
Special credit to [Hiroki Toyokawa](https://github.com/otoyo) for making the [astro-notion-blog](https://github.com/otoyo/astro-notion-blog) open source. <br/> Although our repos now diverged significantly, it all started there.

## Concept
I have been using Notion both professionally and on my personal stuff for a while. So, keeping it all organized on the same platform felt like a no-brainer. Also, this was a great opportunity to learn the Astro framework, Tailwind, and how to work with APIs.

## Workflow
- Notion as a CMS: I have an opinionated set of databases on Notion, where I create all the pages and subpages.
- A custom Astro integration queries these databases at the beginning of every build using [Notion API](https://developers.notion.com/). Then it automatically downloads the files, saves them at `src/assets/notion`, and saves a jpg version of the database cover at `public/notion` to be used as og-image. The download only happens if the file does not yet exist. And the requests follow [Notion API request limits](https://developers.notion.com/reference/request-limits).
- Astro builds the static website, taking full advantage of the image optimization features.
- The website is hosted on Cloudflare.

## Notion structure
Notion API already comes with some basic data, like page ID, page cover, and page icon. These were extended using an interface so I could have my own opinionated types.

### Pages as Notion databases
This database contains the pages' information. For example, the 'Projects' item refers to the page https://daniellocatelli.com/projects. The only exception is the "Homepage," which refers to the root https://daniellocatelli.com/

**Schema:**
|Name|CoverAlt|Local|Description_en|Description_de|Description_pt|Status|DatabaseRef|FullName|ShortDescription_en|Tags|
|----|--------|-----|--------------|--------------|--------------|------|-----------|--------|-------------------|----|
|string|string|string|string|string|string|status|SelectProperty[]|string|string|SelectProperty[]|

Pages: Homepage, Projects, Teaching, Strategies, Publications (In progress), Blog (Not started)

- [x] `Name`: The name of the page will be used to generate the slug for the page. Except for the homepage.
- [x] `CoverAlt`: This will be the alt text used for the cover image, both on OG (shareable links) and on the Homepage.
- [ ] `Local`: Is still not in use. The issue of internationalization isn't clear.
- [x] `Description_en`: this is the OG description of the page.
- [ ] `Description_de`: This is the German OG description of the page. The issue of internationalization isn't clear.
- [ ] `Description_pt`: this is the Portuguese OG description of the page. The issue of internationalization isn't clear.
- [x] `Status`: column defines whether the page is online (Live) or not (In progress / Not started).
- [x] `DatabaseRef`: The items listed here point to the subpage databases. They are used to create full-screen cards linking to the subpages.
- [x] `FullName`: This column was created to have a longer name for the page. It is used in the head and footer links.
- [x] `ShortDescription_en`: It was necessary to have a really short description for the Homepage. And because I wanted to keep the OG description, I created this new one.
- [ ] `Tags`: The idea for the tags is to recommend other similar content at the end of the pages. Not yet implemented.

The `SelectProperty` is a Notion type for tags with id: string; name: string; color: string;

### Subpages as Notion databases
One of the columns of the page's schema is the `DatabaseRef`. This is a connection to subpage databases.
For example, the page `Strategies` connects to the subpage database `Computational Design Strategies`.
This way, I can organize each category in their own databases with a unique schema. Something similar to what we would do with an SQL database.

#### Computational Design Strategies schema
|Apps|CoverAlt|Description_en|Description_de|Description_pt


<!--
## Notion as CMS
### Database structure
![Pages database](https://github.com/daniel-locatelli/daniellocatelli/assets/15069239/356f4c18-b62b-4616-a1f9-b06a8d9df5e1)
### Notion API

## Astro
### Astro Integration
### Astro Structure

## Homepage custom JavaScript

## Cloudflare
### Settings
### Connecting to Notion API
-->

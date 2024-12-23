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

## Tech stack
- [Astro](https://docs.astro.build/en/concepts/why-astro/) web framework
- [Tailwind](https://tailwindcss.com/) CSS framework
- [Notion](https://www.notion.so/) as a content management service
- [Cloudflare](https://www.cloudflare.com/) to deploy and host the website
- [Figma](https://www.figma.com/) to sketch layout ideas and prepare SVG files
- [Rhino](https://www.rhino3d.com/) to generate drawings

## Workflow
- Notion as a CMS: I have an opinionated set of [databases on Notion](#notion-structure), where I create all the pages and subpages.
- A custom Astro integration queries these databases at the beginning of every build using [Notion API](https://developers.notion.com/). Then it automatically downloads the files, saves them at `src/assets/notion`, and saves a jpg version of the database cover at `public/media` to be used as og-image. The download only happens if the file does not yet exist. And the requests follow [Notion API request limits](https://developers.notion.com/reference/request-limits).
- Astro builds the static website, taking full advantage of the image optimization features.
- The website is hosted on Cloudflare.

## Notion structure
Notion API already comes with some basic data, like page ID, page cover, and page icon. These were extended using an interface so I could have my own opinionated types.

### 1. Pages as Notion databases
This database contains the pages' information. For example, the 'Projects' item refers to the page https://daniellocatelli.com/projects. The only exception is the "Homepage," which refers to the root https://daniellocatelli.com/

#### 1.1. Pages Schema
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

The `SelectProperty` is a Notion type for tags with ``` id: string; name: string; color: string; ```

### 2. Subpages as Notion databases
As mentioned above, the `DatabaseRef` connects to subpage databases.
For example, the page 'Strategies' has in the `DatabaseRef` 'Computational Design Strategies,' while the page 'Research' has in the `DatabaseRef` 'Research' and 'Publications.'

This way, I can organize each category in their own databases with a unique schema. Something similar to what we would do with an SQL database.

Think of a notion database just as a SQL table.

#### 2.1. Computational Design Strategies schema
|Apps|CoverAlt|Description_en|Description_de|Description_pt|Name_de|Name_pt|References|Status|Tags|
|---|---|---|---|---|---|---|---|---|---|
|SelectProperty[]|string|string|string|string|string|string|string|status|SelectProperty[]|

- [x] `Name`: The name of the page will be used to generate the slug for the page.
- [x] `CoverAlt`: This will be the alt text used for the cover image of OG and on the page.
- [x] `Description_en`: this is the OG description of the page.
- [ ] `Description_de`: this is the German OG description of the page. The issue of internationalization isn't clear.
- [ ] `Description_pt`: this is the Portuguese OG description of the page. The issue of internationalization isn't clear.
- [ ] `Name_de`: this is the German OG title. The issue of internationalization isn't clear.
- [ ] `Name_pt`: this is the Portuguese OG title. The issue of internationalization isn't clear.
- [x] `Status`: column defines whether the page is online (Live) or not (In progress / Not started).
- [ ] `Tags`: The idea for the tags is to recommend other similar content at the end of the pages. Not yet implemented.

#### 2.2. Projects schema
|Category|City|CoverAlt|Date|Description_en|Description_de|Description_pt|Disclosed|Link|Client|Authors|Director|Manager|Development|Place|Status|Team|Files|Tags|
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
|string|SelectProperty[]|string|string|string|string|string|boolean|RichText[]|string|SelectProperty[]|SelectProperty[]|SelectProperty[]|SelectProperty[]|string|status|SelectProperty[]|file|SelectProperty[]|

- [ ] `Category`: same as tags, but to have a unique general category. It's still not implemented.
- [x] `City`: project metadata.
- [x] `CoverAlt`: This will be the alt text used for the cover image of OG and on the page.
- [x] `Date`: project metadata.
- [x] `Description_en`: this is the OG description of the page.
- [ ] `Description_de`: this is the German OG description of the page. The issue of internationalization isn't clear.
- [ ] `Description_pt`: this is the Portuguese OG description of the page. The issue of internationalization isn't clear.
- [ ] `Disclosed`: whether the project can display sensitive information. This way, I can also store undisclosed projects on the same database.
- [x] `Link`: project metadata, an official or relevant link to the project.
- [x] `Client`: project metadata.
- [x] `Authors`: project metadata.
- [x] `Director`: project metadata.
- [x] `Manager`: project metadata.
- [x] `Development`: project metadata, who was the developer.
- [x] `Place`: project metadata.
- [x] `Status`: column defines whether the page is online (Live) or not (In progress / Not started).
- [x] `Team`: project metadata.
- [ ] `Files`: the idea is to have some files in the project metadata at the beginning. Not yet implemented.
- [ ] `Tags`: The idea for the tags is to recommend other similar content at the end of the pages. Not yet implemented.

#### 2.3. Publications schema
|City|CoverAlt|Date|Description_en|Description_de|Description_pt|Link|Authors|Place|Status|Language|Tags|Name_de|Name_pt|
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
|SelectProperty[]|string|string|string|string|string|RichText[]|SelectProperty[]|string|status|SelectProperty[]|string|string|string|

- [x] `City`: publication metadata.
- [x] `CoverAlt`: This will be the alt text used for the cover image of OG and on the page.
- [x] `Date`: publication metadata.
- [x] `Description_en`: this is the OG description of the page.
- [ ] `Description_de`: this is the German OG description of the page. The issue of internationalization isn't clear.
- [ ] `Description_pt`: this is the Portuguese OG description of the page. The issue of internationalization isn't clear.
- [x] `Link`: publication metadata, an official or relevant link to the project.
- [x] `Authors`: publication metadata.
- [x] `Place`: publication metadata.
- [x] `Status`: column defines whether the page is online (Live) or not (In progress / Not started).
- [x] `Language`: publication metadata.
- [ ] `Tags`: The idea for the tags is to recommend other similar content at the end of the pages. Not yet implemented.
- [ ] `Name_de`: this is the German OG title. The issue of internationalization isn't clear.
- [ ] `Name_pt`: this is the Portuguese OG title. The issue of internationalization isn't clear.

#### 2.4. Research schema
|CoverAlt|Date|Description_en|Description_de|Description_pt|Link|Authors|Place|Status|Tags|
|--|--|--|--|--|--|--|--|--|--|
|string|string|string|string|string|RichText[]|SelectProperty[]|string|status|SelectProperty[]|

- [x] `CoverAlt`: This will be the alt text used for the cover image of OG and on the page.
- [x] `Date`: research metadata.
- [x] `Description_en`: this is the OG description of the page.
- [ ] `Description_de`: this is the German OG description of the page. The issue of internationalization isn't clear.
- [ ] `Description_pt`: this is the Portuguese OG description of the page. The issue of internationalization isn't clear.
- [x] `Link`: research metadata, an official or relevant link to the project.
- [x] `Authors`: research metadata.
- [x] `Place`: research metadata.
- [x] `Status`: column defines whether the page is online (Live) or not (In progress / Not started).
- [ ] `Tags`: The idea for the tags is to recommend other similar content at the end of the pages. Not yet implemented.

#### 2.5. Teaching schema
|CoverAlt|Date|Description_en|Description_de|Description_pt|Link|Team|Place|Status|Tags|City|Event|Format|Language|
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
|string|string|string|string|string|RichText[]|SelectProperty[]|string|status|SelectProperty[]|SelectProperty[]|string|string|SelectProperty[]|

- [x] `CoverAlt`: This will be the alt text used for the cover image of OG and on the page.
- [x] `Date`: teaching metadata.
- [x] `Description_en`: this is the OG description of the page.
- [ ] `Description_de`: this is the German OG description of the page. The issue of internationalization isn't clear.
- [ ] `Description_pt`: this is the Portuguese OG description of the page. The issue of internationalization isn't clear.
- [x] `Link`: teaching metadata, an official or relevant link to the project.
- [x] `Authors`: teaching metadata.
- [x] `Place`: teaching metadata.
- [x] `Status`: column defines whether the page is online (Live) or not (In progress / Not started).
- [ ] `Tags`: The idea for the tags is to recommend other similar content at the end of the pages. Not yet implemented.
- [x] `City`: teaching metadata.
- [ ] `Event`: teaching metadata.
- [ ] `Format`: teaching metadata.
- [x] `Language`: teaching metadata.

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

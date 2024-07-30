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
Notion API already comes with some basic data, like page ID, page cover, and page icon. Which were extended using an interface so I could have my own opinionated types.
### Pages database
This database contains the subpages' information. For example, the "Projects" item refers to the page https://daniellocatelli.com/projects. The only exception is the "Homepage," which refers to the root https://daniellocatelli.com/
|  Name  |CoverAlt|Local|Description_en|Description_de|Description_pt|Status|DatabaseRef|FullName |ShortDescription_en|Tags|
|--------|--------|-----|--------------|--------------|--------------|------|-----------|---------|-------------------|----|
|Homepage|alt text|en|english|german|portuguese|status|references|full name|placeholder|tags|
|Projects |alt text|en|english|german|portuguese|status|references|full name|placeholder|tags|
|Publications|alt text|en|english|german|portuguese|status|references|full name|placeholder|tags|
|Teaching|alt text|en|english|german|portuguese|status|references|full name|placeholder|tags|
|Strategies|alt text|en|english|german|portuguese|status|references|full name|placeholder|tags|
|Blog|alt text|en|english|german|portuguese|status|references|full name|placeholder|tags|


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

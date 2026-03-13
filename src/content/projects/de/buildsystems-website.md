---
{
  "Cover": "/assets/content/projects/buildsystems-website/multistory-timber-building.jpg",
  "CoverAlt": "Desktop-Screenshot der BuildSystems-Website",
  "Description": "Entwicklung der BuildSystems-Website mit dem Astro-Framework unter Nutzung der Notion-API als CMS.",
  "Name": "BuildSystems Website",
  "Slug": "projects/buildsystems-website",
  "Tags": [
    "Web Development",
    "Astro",
    "Notion API",
    "TypeScript"
  ],
  "Authors": [
    "BuildSystems GmbH"
  ],
  "Category": "Software",
  "City": [
    "München"
  ],
  "Client": "BuildSystems GmbH",
  "DateStart": "2023-08-01",
  "DateEnd": "2024-04-01",
  "Link": {
    "Text": "BuildSystems Website",
    "Href": "https://buildsystems.de"
  },
  "Place": "BuildSystems GmbH",
  "Director": ["Martin Bittmann"],
  "Manager": ["Julia Dorn"],
  "Team": ["Daniel Locatelli"]
}
---

Ich habe die Unternehmenswebsite für [BuildSystems](https://buildsystems.de) entworfen und entwickelt — eine Nachhaltigkeitsberatung, die die klimaneutrale Transformation im Bau- und Immobiliensektor vorantreibt. Die Website dient als digitale Präsenz des Unternehmens und zeigt Dienstleistungen, Projektportfolio, Team und Blog-Inhalte — alles verwaltet über Notion als Headless-CMS.

## Tech-Stack

- [**Astro 5**](https://astro.build/): Statischer Site-Generator mit TypeScript, gewählt wegen seines Performance-First-Ansatzes und der standardmäßig JavaScript-freien Philosophie.
- [**Tailwind CSS 4**](https://tailwindcss.com/): Utility-First-Styling mit benutzerdefinierten CSS-Variablen für responsive Typografie über vier Breakpoints.
- [**Notion API**](https://developers.notion.com/): Headless-CMS-Integration — das Team verwaltet alle Inhalte (Blogbeiträge, Teammitglieder, Partner, Portfolio) direkt über Notion.
- [**Cloudflare Pages**](https://pages.cloudflare.com/): Deployment mit Edge-Caching, automatischem HTTPS und DDoS-Schutz.
- [**Sharp**](https://sharp.pixelplumbing.com/): Bildverarbeitungs-Pipeline zur Erzeugung optimierter avif/webp-Formate.

## Warum Notion als CMS?

BuildSystems nutzte Notion bereits intensiv für interne Dokumentation und Projektmanagement. Anstatt ein separates CMS einzuführen, das das Team erst erlernen müsste, habe ich die Notion-API direkt in die Build-Pipeline integriert. So kann das Team Blogbeiträge schreiben und veröffentlichen, Teamprofile aktualisieren und Portfolio-Inhalte verwalten — alles in Notion, einem Tool, das sie bereits täglich nutzen.

Die Integration ruft Inhalte zur Build-Zeit aus mehreren Notion-Datenbanken ab (Blogbeiträge, Teammitglieder, Partner, Organisationen) und rendert sie mit über 30 benutzerdefinierten Notion-Block-Renderern für Überschriften, Absätze, Bilder, Codeblöcke, Tabellen, Embeds und mehr.

![Die Hero-Sektion der Homepage mit animiertem Cover und dem Leitbild des Unternehmens.](../../../assets/content/projects/buildsystems-website/homepage-hero.jpg)

## Hauptmerkmale

### CSS-First-Animationen
Eine bewusste Entscheidung war es, reine CSS-`@keyframes`-Animationen anstelle von JavaScript-Animationsbibliotheken zu verwenden. Das Homepage-Cover zeigt eine animierte Vollbild-Sequenz, und die „Drei Säulen"-Bereiche nutzen reine CSS-Animationen in horizontalem und vertikalem Layout. Das hält die Seite schlank und performant.

### Interaktive Orbit-Animation
Der Leistungsbereich verfügt über eine eigens entwickelte Orbit-Animation mit Federphysik in reinem JavaScript. Neun Dienstleistungsthemen umkreisen einen zentralen Punkt, mit Klick-zum-Einrasten, Hover-zum-Pausieren und responsivem Resize-Handling. Keine Animationsbibliothek wurde verwendet — nur Physikgleichungen und `requestAnimationFrame`.

![Der Über-uns-Bereich mit dem BuildSystems-Team und der Mission.](../../../assets/content/projects/buildsystems-website/homepage-orbit.jpg)

### Drag-to-Scroll-Karussell
Das Blogbeitrag-Karussell implementiert eine eigene Drag-to-Scroll-Interaktion mit Trägheitsphysik und sanftem Scroll-Snap. Nutzer können das Karussell mit Maus oder Touch ziehen, und es rastet beim Loslassen sanft an der nächsten Karte ein.

![Blogbeitrag-Karussell mit Drag-to-Scroll-Interaktion.](../../../assets/content/projects/buildsystems-website/homepage-blog-carousel.jpg)

### Blogbeiträge aus Notion
Jeder Blogbeitrag wird in Notion verfasst und zur Build-Zeit auf der Website gerendert. Der benutzerdefinierte Notion-Block-Renderer unterstützt reichhaltige Inhalte, einschließlich eingebetteter Medien (Instagram, TikTok, YouTube, CodePen), LaTeX-Gleichungen über KaTeX, Codeblöcke mit Prism.js-Syntaxhervorhebung und Link-Vorschauen über metascraper.

![Eine Blogbeitrag-Seite mit Inhalten, die aus Notion abgerufen und gerendert wurden.](../../../assets/content/projects/buildsystems-website/blog-post-notion.jpg)

### Portfolio und „Our Work"-Seite
Die Portfolioseite zeigt alle Projekte, Veranstaltungen, Tools und Nachrichtenartikel mit kategorisierten Karten. Jede Karte verlinkt auf einen detaillierten Notion-gerenderten Artikelseite mit Autorenprofilen, verwandten Beiträgen und Bildergalerien.

![Die Our-Work-Seite mit kategorisierten Projektkarten.](../../../assets/content/projects/buildsystems-website/ourwork-page.jpg)

## Architektur

Das Projekt folgt einem reinen Astro-Ansatz — ohne React oder andere JavaScript-Frameworks. Alle Interaktivität ist mit reinem TypeScript und CSS umgesetzt, was zu minimalem clientseitigem JavaScript führt. Die Codebasis umfasst 89 Astro-Komponenten, 22 TypeScript-Utility-Dateien und 4 Layout-Varianten.

Eine eigene Build-Pipeline übernimmt das Caching von Notion-Inhalten. Mit `npm run cache:fetch` werden alle Inhalte und Bilder aus Notion heruntergeladen, mit Sharp verarbeitet (EXIF-Daten entfernt und Formate optimiert) und lokal gespeichert. Das sorgt für schnelle Builds und verhindert unnötige API-Aufrufe während der Entwicklung.

## Responsives Design

Die Seite verwendet CSS Custom Properties für fließende Typografie, die über vier Breakpoints skaliert: Mobil, Tablet, Desktop und Ultra-Wide. Das dunkle Theme (`#222` Hintergrund mit `#d9d9d9` Text und `#24b54a` Markengrün) bietet einen professionellen und modernen Look, der zur Markenidentität von BuildSystems passt.

Selbst gehostete ABC-Diatype-Schriften werden vorgeladen, um Flash of Unstyled Text (FOUT) zu vermeiden, und die Seite verwendet SVG-Sprites für Icons, um HTTP-Anfragen zu minimieren.

![Mobile Ansicht der BuildSystems-Website.](../../../assets/content/projects/buildsystems-website/mobile-screenshot.jpg)

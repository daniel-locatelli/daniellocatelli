---
Cover: /assets/content/research/agent-skills/agent-skills-cover.svg
CoverAlt: "Ein leuchtend grünes Roboter-Symbol neben einem Puzzleteil-Symbol: ein Agent plus ein Skill."
CoverFit: contain
Description: "Eine lebende Liste der Agent Skills, auf die ich mich bei der Arbeit mit Claude Code verlasse: die von mir geschriebenen, Matt Pococks Engineering- und Produktivitäts-Skills und Community-Skills wie Diagram Design."
Name: Agent Skills
Tags:
  - Agent Skills
  - KI-Coding-Agenten
Authors:
  - Daniel Nunes Locatelli
DateStart: "2026-08-19"
Link:
  Text: daniel-locatelli/skills auf GitHub
  Href: https://github.com/daniel-locatelli/skills
OtherLinks:
  - Text: mattpocock/skills
    Href: https://github.com/mattpocock/skills
  - Text: cathrynlavery/diagram-design
    Href: https://github.com/cathrynlavery/diagram-design
---

Ein Agent Skill ist ein Ordner mit einer `SKILL.md`-Datei: ein kurzer, klar abgegrenzter Satz aus Anweisungen, Referenzen und Skripten, den ein Coding-Agent lädt, sobald eine Aufgabe zu seiner Beschreibung passt. Er ist die Einheit, in der Fachwissen zwischen Menschen und Agenten wandert. Das meiste, was ich 2026 über die Arbeit mit Claude Code gelernt habe, ist in Skills gelandet, eigenen oder fremden, deshalb hält diese Seite fest, welche sich einen festen Platz in meinem Setup verdient haben. Es ist eine lebende Liste: Ich ergänze sie, wenn sich Skills bewähren, und entferne die, die sich nicht mehr lohnen.

![Drei Spalten mit SKILL.md-Kacheln (meine eigenen, die von Matt Pocock, aus der Community), die einen einzigen Coding-Agenten speisen.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## Meine eigenen Skills

Sie liegen im öffentlichen Repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills) und lassen sich mit `/plugin marketplace add daniel-locatelli/skills` in Claude Code oder `npx skills@latest add daniel-locatelli/skills` in jedem anderen Agenten installieren. Der rote Faden: Die Trainingsdaten von LLMs veralten genau dort, wo sich AEC-APIs am schnellsten bewegen. Jeder Skill fixiert deshalb die versionskritischen Fakten und erzwingt einen verifizierten Build-, Deploy- und Testzyklus, statt Wissen abzuladen.

- **creating-revit-plugin**: Revit-Desktop-Add-ins in C#/.NET bauen, aufsetzen und debuggen, aktuell für Revit 2027 (.NET 10) und 2025/2026 (.NET 8). Transaktionen, die Regel des gültigen API-Kontexts, Ribbon-UI, `ExternalEvent` für nicht-modale Dialoge, Multi-Version-Targeting und ein kompilierbares Gerüst für Revit 2027.
- **creating-grasshopper-plugin**: kompilierte Grasshopper-Plugins (`.gha`) für Rhino 8 in C#, vom `Rhino.Templates`-Gerüst über Data Trees, lokales Deploy und Yak-Paketierung bis zur Diagnose von Ladefehlern.
- **using-cordyceps**: gibt dem Agenten ein laufendes Rhino, das er über den Cordyceps-MCP-Server steuert: Komponenten auf dem Canvas platzieren und verdrahten, Skriptkomponenten konfigurieren, Solver-Ausgaben lesen, Szenen baken und rendern.
- **optimizing-web-performance**: die Lighthouse-Schleife für eine veröffentlichte Website: Produktion auditieren, die zwei oder drei Dinge beheben, die den Score bewegen, mit einer vergleichbaren Messung verifizieren, ausliefern.
- **auditing-website-quality**: Hub für ein tiefgehendes Website-Audit, das den Sub-Skill jeder Dimension ausführt und die Befunde in einer datierten Scorecard zusammenführt, sortiert nach Schwere geteilt durch Aufwand.
- **auditing-agent-readiness**: Ist die Website für KI-Agenten auffindbar und nutzbar? Prüft `llms.txt`, Markdown-Varianten, KI-Regeln in robots, `.well-known`-Deskriptoren und einen Live-MCP-Handshake.

Diese Website liefert außerdem zwei eigene Skills unter `/.well-known/agent-skills/` aus: **portfolio-content** (die Website als reines Markdown lesen) und **portfolio-mcp** (sie über den schreibgeschützten MCP-Server abfragen). Beide sind auf der Seite zur [Portfolio-Website](/de/projects/portfolio-website) beschrieben.

Einige weitere Skills bleiben vorerst privat, weil sie persönlichen Arbeitsablauf statt wiederverwendbares Wissen abbilden: eine Promotionsassistenz, die zu Beginn und Ende jedes Arbeitstags eine adversariale Planungssitzung führt, ein `system`-Index aller Repositories, Skills und Standards, die ich pflege, ein Pre-PR-Ritual für Beiträge zu fremden Repositories und zwei Fachreferenzen zu BTLx-Holzfertigungsdateien und zur Bibliothek compas_ifc.

## Matt Pococks Skills

[mattpocock/skills](https://github.com/mattpocock/skills) (MIT, `npx skills@latest add mattpocock/skills`) ist der Satz, zu dem ich am häufigsten greife, wenn es ums Denken statt ums Tippen geht. Die, die ich installiert lasse:

- **grill-me**: ein unerbittliches Interview, das einen Plan oder Entwurf schärft, bis jeder Zweig des Entscheidungsbaums aufgelöst ist. Ich nutze es vor jeder nicht trivialen Arbeit, und die dahinterliegende `grilling`-Primitive ist die Grundlage meines eigenen Promotions-Skills.
- **grill-with-docs**: dasselbe Interview, das dabei aber `CONTEXT.md`, Glossar und ADRs des Projekts schreibt.
- **codebase-design** und **domain-modeling**: gemeinsames Vokabular für tiefe Module mit kleinen Schnittstellen und ein Verfahren, um die Domänensprache eines Projekts festzulegen und Architekturentscheidungen festzuhalten.
- **improve-codebase-architecture**: durchsucht eine Codebasis nach Vertiefungsmöglichkeiten, präsentiert sie als visuellen HTML-Bericht und interviewt dann zu der, die man auswählt.
- **handoff**: verdichtet die aktuelle Unterhaltung zu einem Dokument, das ein anderer Agent übernehmen kann; so bewege ich Arbeit zwischen Sitzungen und Rechnern.
- **teach**: vermittelt ein Konzept über mehrere Sitzungen hinweg mit einem Verzeichnis als Arbeitsbereich, inklusive Lernprotokoll und Glossar.

## Community-Skills

- **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** von Cathryn Lavery: Diagramme in redaktioneller Qualität als eigenständiges HTML mit Inline-SVG, 28 visuelle Typen, Marken-Onboarding von einer Website und ein Mermaid-Import, der neu zeichnet statt konvertiert. Er hat das Mermaid-Flussdiagramm auf der Seite zur [Portfolio-Website](/de/projects/portfolio-website) durch ein von Hand gesetztes Architekturdiagramm in der Palette der Website ersetzt, und ein gespeichertes Profil plus eine `.diagram-design`-Markierung im Repository sorgen dafür, dass jedes künftige Diagramm im selben Stil erscheint. Installation: `/plugin marketplace add cathrynlavery/diagram-design`, dann `/plugin install diagram-design@diagram-design`.
- **[Superpowers](https://github.com/obra/superpowers)** von Jesse Vincent: die Prozessschicht unter allem anderen: Brainstorming vor dem Bauen, testgetriebene Entwicklung, systematisches Debugging, Schreiben und Ausführen von Plänen und Verifikation, bevor etwas als fertig gilt.
- **frontend-design** aus dem offiziellen Claude-Plugin-Marketplace: Orientierung für unverwechselbares, bewusstes visuelles Design beim Bauen oder Umgestalten von Benutzeroberflächen.

## Wie ich entscheide, was bleibt

Ein Skill verdient seinen Platz, wenn er verändert, was der Agent bei einer Aufgabe tut, die ich tatsächlich habe, nicht weil er clever ist. Der Test ist derselbe, den Diagram Design an seine eigenen Diagramme anlegt: Würde ein gut geschriebener Absatz in der `CLAUDE.md` dieselbe Arbeit leisten? Wenn ja, fliegt der Skill raus. Wenn der Skill eine verifizierte Schleife ehrlich hält, Fakten fixiert, die das Modell falsch macht, oder die Fragen stellt, die ich zu stellen vergesse, bleibt er.

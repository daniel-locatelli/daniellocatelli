---
Cover: /assets/content/research/agent-skills/agent-skills-cover-wearing-cap.svg
CoverAlt: "Das grüne Claude-Code-Symbol mit Doktorhut: ein Agent mit einem Skill."
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

Ein Agent Skill ist ein Ordner mit einer `SKILL.md`: ein kurzer, klar abgegrenzter Satz aus Anweisungen, Referenzen und Skripten, den ein Coding-Agent lädt, wenn eine Aufgabe zu seiner Beschreibung passt. Es ist die Einheit, in der Expertise zwischen Menschen und Agenten wandert. Diese Seite ist eine lebende Liste der Skills, die sich einen festen Platz in meinem Claude-Code-Setup verdient haben.

![Drei Spalten mit SKILL.md-Kacheln (meine eigenen, Matt Pococks, Community) speisen einen einzigen Coding-Agenten.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## Meine eigenen Skills

Diese liegen im öffentlichen Repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills). Gemeinsam ist ihnen die Antwort auf dasselbe Problem: LLM-Trainingsdaten veralten genau dort, wo sich AEC-APIs am schnellsten bewegen. Statt Wissen abzuladen, fixiert jeder Skill deshalb die versionskritischen Fakten und hält den Agenten in einer verifizierten Build-, Deploy- und Test-Schleife.

| Skill | Was er tut |
| --- | --- |
| **creating-revit-plugin** | Baut native Add-ins für Revit 2025 bis 2027 |
| **creating-grasshopper-plugin** | Baut kompilierte Grasshopper-Plugins für Rhino 8 |
| **using-cordyceps** | Steuert Rhino und Grasshopper aus dem Agenten heraus |
| **optimizing-web-performance** | Auditiert eine Live-Site und behebt, was den Score bewegt |
| **auditing-website-quality** | Auditiert eine Site von Ende zu Ende in eine sortierte Scorecard |
| **auditing-agent-readiness** | Prüft, ob eine Website für KI-Agenten nutzbar ist |

Diese Website stellt unter `/.well-known/agent-skills/` auch **portfolio-content** und **portfolio-mcp** bereit, beschrieben auf der Seite [Portfolio-Website](/de/projects/portfolio-website). Einige weitere Skills bleiben privat, weil sie persönlichen Workflow kodieren: ein PhD-Assistent, ein `system`-Index von allem, was ich pflege, ein Pre-PR-Ritual und Referenzen für BTLx und compas_ifc.

## Matt Pococks Skills

Zu [mattpocock/skills](https://github.com/mattpocock/skills) greife ich, wenn die Aufgabe Denken statt Tippen ist.

| Skill | Was er tut |
| --- | --- |
| **grill-me** | Hinterfragt einen Plan, bis jeder Zweig aufgelöst ist |
| **grill-with-docs** | Dasselbe Interview, das nebenbei die Projektdokumentation schreibt |
| **codebase-design** | Entwirft tiefe Module mit kleinen Schnittstellen |
| **domain-modeling** | Legt die Domänensprache eines Projekts fest |
| **improve-codebase-architecture** | Findet Architekturverbesserungen und arbeitet sie durch |
| **handoff** | Übergibt eine Unterhaltung an einen anderen Agenten |
| **teach** | Vermittelt ein Konzept über mehrere Sitzungen |

## Community-Skills

| Skill | Was er tut |
| --- | --- |
| **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** | Diagramme in redaktioneller Qualität, etwa das Architekturdiagramm auf der Seite [Portfolio-Website](/de/projects/portfolio-website), von Cathryn Lavery |
| **[Superpowers](https://github.com/obra/superpowers)** | Die Prozessschicht unter allem anderen, vom Brainstorming bis zur Verifikation, von Jesse Vincent |
| **frontend-design** | Eigenständiges, bewusstes UI-Design |

## Wie ich entscheide, was bleibt

Würde ein gut geschriebener Absatz in `CLAUDE.md` dieselbe Arbeit leisten? Wenn ja, fliegt der Skill raus. Wenn er eine verifizierte Schleife ehrlich hält, Fakten fixiert, die das Modell falsch macht, oder die Fragen stellt, die ich vergesse, bleibt er.

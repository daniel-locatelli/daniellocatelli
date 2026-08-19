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

![Drei Kästen mit Skill-Kacheln speisen einen einzigen Coding-Agenten: meine eigenen, gruppiert in AEC, Qualität und Persönlich, stehen oben; Matt Pococks Skills und Community-Skills stehen darunter.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## Meine eigenen Skills

Diese liegen im öffentlichen Repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills). Gemeinsam ist ihnen die Antwort auf dasselbe Problem: LLM-Trainingsdaten veralten genau dort, wo sich APIs am schnellsten bewegen. Statt Wissen abzuladen, fixiert jeder Skill deshalb die versionskritischen Fakten und hält den Agenten in einer verifizierten Build-, Deploy- und Test-Schleife. Sie verteilen sich auf drei Felder.

### AEC

| Skill | Was er tut |
| --- | --- |
| **creating-revit-plugin** | Baut native Add-ins für Revit 2025 bis 2027 |
| **creating-grasshopper-plugin** | Baut kompilierte Grasshopper-Plugins für Rhino 8 |
| **using-cordyceps** | Steuert Rhino und Grasshopper aus dem Agenten heraus |
| **working-with-btlx** | Arbeitet mit BTLx, dem Austauschformat für Holz-CNC: Bearbeitungen, Referenzseiten, Schema-Versionen |

### Qualität

| Skill | Was er tut |
| --- | --- |
| **optimizing-web-performance** | Auditiert eine Live-Site und behebt, was den Score bewegt |
| **auditing-website-quality** | Auditiert eine Site von Ende zu Ende in eine sortierte Scorecard |
| **auditing-agent-readiness** | Prüft, ob eine Website für KI-Agenten nutzbar ist |
| **preparing-pull-request** | Zeichnet die Herkunft eines Defekts nach und durchsucht den Upstream-Tracker, bevor ein PR in einem fremden Repository eröffnet wird |

Diese Website stellt unter `/.well-known/agent-skills/` auch **portfolio-content** und **portfolio-mcp** bereit, beschrieben auf der Seite [Portfolio-Website](/de/projects/portfolio-website).

### Persönlich

Diese bleiben privat, weil sie kodieren, wie ich arbeite, und nicht, wie ein Werkzeug funktioniert. Am häufigsten nutze ich `system`, eine einzige verbindliche Landkarte: Sie sagt dem Agenten, welche Skills, Repositories, operativen Systeme und Lebensbereiche es gibt, wo jedes davon liegt, wie man es startet und welcher Standard gilt. Statt zu raten, wohin eine Datei oder eine Konvention gehört, fragt der Agent "wo liegt X" oder "was ist meine Regel für Y" und bekommt eine eindeutige Antwort. Es ist weniger ein Skill als ein persönlicher Assistent, an den die anderen Skills andocken. Direkt darunter sitzt ein Backup-Skill, der mein Speichermodell kodiert (auf welches Laufwerk eine Datei gehört, Tiering getrennt von Backup, und eine Zwei-Kopien-Regel für alles Unersetzliche) und die Drift-Prüfungen ausführt. Daneben stehen ein PhD-Assistent, der mich zur Dissertation ins Kreuzverhör nimmt, und ein Bibliotheks-Such-Skill, der eine persönliche Sammlung von Forschungsarbeiten abfragt, die in Markdown umgewandelt auf einem Mac mini liegen, der über Tailscale von jedem meiner Rechner erreichbar ist.

### Ausblick

Bisher dreht sich jeder öffentliche Skill hier um Software: Plugins bauen, Werkzeuge steuern, Websites auditieren, upstream beitragen. Dort sind Agenten heute am offensichtlichsten nützlich, aber dort endet weder meine Expertise noch die des Fachgebiets. Die nächsten Skills, die ich schreiben will, kommen aus dem Computational Design und aus der Praxis von Architektur, Ingenieurwesen und Bau selbst: wie man ein parametrisches Modell so aufsetzt, dass es Entwurfsänderungen übersteht, wie man eine statische oder fertigungstechnische Randbedingung aus einer Zeichnung abliest, was ein Holzdetail erfüllen muss, bevor es die Maschine erreicht, und welche Fragen ein Praktiker stellt, bevor er einem Ergebnis vertraut. Der Test bleibt derselbe wie bei den Software-Skills: Würde ein Absatz in der `CLAUDE.md` genügen, oder braucht der Agent eine verifizierte Schleife, festgehaltene Fakten und die Fragen, die das Modell nicht zu stellen weiß?

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

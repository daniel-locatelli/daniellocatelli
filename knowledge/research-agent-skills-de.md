URL: https://daniellocatelli.com/de/research/agent-skills

# Agent Skills

Description: Eine lebende Liste der Agent Skills, auf die ich mich bei der Arbeit mit Claude Code verlasse: die von mir geschriebenen, Matt Pococks Engineering- und Produktivitäts-Skills und Community-Skills wie Diagram Design.
Tags: Agent Skills, KI-Coding-Agenten
Authors: Daniel Nunes Locatelli
Date: August 2026
Link: https://github.com/daniel-locatelli/skills

Ein Agent Skill ist ein Ordner mit einer `SKILL.md`: ein kurzer, klar abgegrenzter Satz aus Anweisungen, Referenzen und Skripten, den ein Coding-Agent lädt, wenn eine Aufgabe zu seiner Beschreibung passt. Es ist die Einheit, in der Expertise zwischen Menschen und Agenten wandert. Diese Seite ist eine lebende Liste der Skills, die sich einen festen Platz in meinem Claude-Code-Setup verdient haben.

## Meine eigenen Skills

Diese liegen im öffentlichen Repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills). Gemeinsam ist ihnen die Antwort auf dasselbe Problem: LLM-Trainingsdaten veralten genau dort, wo sich APIs am schnellsten bewegen. Statt Wissen abzuladen, fixiert jeder Skill deshalb die versionskritischen Fakten und hält den Agenten in einer verifizierten Build-, Deploy- und Test-Schleife. Sie verteilen sich auf drei Felder.

### AEC

| Skill | Was er tut |
| --- | --- |
| **creating-revit-plugin** | Baut native Add-ins für Revit 2025 bis 2027 |
| **creating-grasshopper-plugin** | Baut kompilierte Grasshopper-Plugins für Rhino 8 |
| **using-cordyceps** | Steuert Rhino und Grasshopper aus dem Agenten heraus |
| **working-with-btlx** | Arbeitet mit BTLx, dem Austauschformat für Holz-CNC: Bearbeitungen, Referenzseiten, Schema-Versionen |

Daneben steht ein privater Referenz-Skill für compas_ifc, damit der Agent die Spezifikation prüft, bevor er eine Parameter- oder Versionsfrage beantwortet.

### Qualität

| Skill | Was er tut |
| --- | --- |
| **optimizing-web-performance** | Auditiert eine Live-Site und behebt, was den Score bewegt |
| **auditing-website-quality** | Auditiert eine Site von Ende zu Ende in eine sortierte Scorecard |
| **auditing-agent-readiness** | Prüft, ob eine Website für KI-Agenten nutzbar ist |

Diese Website stellt unter `/.well-known/agent-skills/` auch **portfolio-content** und **portfolio-mcp** bereit, beschrieben auf der Seite [Portfolio-Website](/de/projects/portfolio-website). Ein privates Pre-PR-Ritual gehört ebenfalls hierher: Bevor ich einen Pull Request in einem fremden Repository eröffne, zeichnet es die Geschichte des Defekts über Blame, frühere PRs und Issues nach und durchsucht den Upstream-Tracker nach doppelter oder bereits laufender Arbeit.

### Persönlich

Diese bleiben privat, weil sie kodieren, wie ich arbeite, und nicht, wie ein Werkzeug funktioniert. Am häufigsten nutze ich `system`, eine einzige verbindliche Landkarte: Sie sagt dem Agenten, welche Skills, Repositories, operativen Systeme und Lebensbereiche es gibt, wo jedes davon liegt, wie man es startet und welcher Standard gilt. Statt zu raten, wohin eine Datei oder eine Konvention gehört, fragt der Agent "wo liegt X" oder "was ist meine Regel für Y" und bekommt eine eindeutige Antwort. Es ist weniger ein Skill als ein persönlicher Assistent, an den die anderen Skills andocken. Direkt darunter sitzt ein Backup-Skill, der mein Speichermodell kodiert (auf welches Laufwerk eine Datei gehört, Tiering getrennt von Backup, und eine Zwei-Kopien-Regel für alles Unersetzliche) und die Drift-Prüfungen ausführt. Daneben stehen ein PhD-Assistent, der mich zur Dissertation ins Kreuzverhör nimmt, und ein Bibliotheks-Such-Skill, der eine persönliche Sammlung von Forschungsarbeiten abfragt, die in Markdown umgewandelt auf einem Mac mini liegen, der über Tailscale von jedem meiner Rechner erreichbar ist.

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

---
Cover: /assets/content/research/agent-skills/agent-skills-cover-wearing-cap.svg
CoverAlt: "Das grüne Claude-Code-Symbol mit Doktorhut: ein Agent mit einem Skill."
CoverFit: contain
Description: "Eine lebende Liste der Agent Skills, auf die ich mich bei der Arbeit mit Claude Code verlasse: die von mir geschriebenen, Matt Pococks Engineering- und Produktivitäts-Skills und Community-Skills wie Superpowers und Diagram Design."
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
  - Text: obra/superpowers
    Href: https://github.com/obra/superpowers
---

Ein Agent Skill ist ein Ordner mit einer `SKILL.md`: ein kurzer, klar abgegrenzter Satz aus Anweisungen, Referenzen und Skripten, den ein Coding-Agent lädt, wenn eine Aufgabe zu seiner Beschreibung passt. Es ist die Einheit, in der Expertise zwischen Menschen und Agenten wandert. Diese Seite ist eine lebende Liste der Skills, die sich einen festen Platz in meinem Claude-Code-Setup verdient haben.

![Drei Kästen mit Skill-Kacheln speisen einen einzigen Coding-Agenten: meine eigenen, gruppiert in AEC, Qualität und Persönlich, stehen oben; Matt Pococks Skills und Community-Skills stehen darunter.](/assets/content/research/agent-skills/agent-skills-diagram.svg "Meine Skills, Matt Pococks und Community-Skills speisen einen Agenten")

## Meine eigenen Skills

Die veröffentlichten liegen im öffentlichen Repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills), gruppiert nach dem Werkzeug oder der Domäne, der sie dienen (Revit, Grasshopper, Holz, Web, Git). Es sind die Skills, die ich einem Kollegen in die Hand geben würde: Jeder handelt davon, wie sich ein Werkzeug oder ein Format verhält, nicht von mir. Eine weitere Gruppe persönlicher Skills bleibt privat, weil sie mein eigenes Setup kodiert: wo die Dinge liegen, wie sie gesichert werden, wie die Promotion geführt wird. Beide Arten folgen derselben Form. Eine `SKILL.md` sagt, wann sie anspringt, fixiert die Fakten, die das Modell gern falsch macht, und benennt die Schleife, die der Agent schließen muss, bevor er die Arbeit als erledigt bezeichnen darf.

### AEC

Vier Skills für die Werkzeuge, mit denen ich täglich in Architektur, Ingenieurwesen und Bau arbeite. Die beiden Plugin-Skills antworten auf dasselbe Problem: LLM-Trainingsdaten veralten genau dort, wo sich die Revit- und Rhino-APIs am schnellsten bewegen. Statt Wissen abzuladen, fixiert jeder deshalb die versionskritischen Fakten (Ziel-Frameworks, API-Änderungen, Manifest- und Deploy-Pfade) und hält den Agenten in einer verifizierten Build-, Deploy- und Test-Schleife. Die anderen beiden greifen in die Werkzeuge selbst hinein. **using-cordyceps** steuert eine laufende Rhino- und Grasshopper-Sitzung über einen MCP-Server: Komponenten platzieren und verdrahten, Skript-Komponenten konfigurieren, Solver-Ausgaben lesen, die Szene rendern. **working-with-btlx** ist die Referenz, die der Agent lesen muss, bevor er irgendetwas zum BTLx-Format für Holz-CNC beantwortet, denn Parameterbereiche, Referenzseiten und Schema-Versionen sind genau die Details, die er sonst raten würde.

| Skill | Was er tut |
| --- | --- |
| **creating-revit-plugin** | Baut native Add-ins für Revit 2025 bis 2027 |
| **creating-grasshopper-plugin** | Baut kompilierte Grasshopper-Plugins für Rhino 8 |
| **using-cordyceps** | Steuert eine laufende Rhino- und Grasshopper-Sitzung aus dem Agenten heraus |
| **working-with-btlx** | Arbeitet mit BTLx, dem Austauschformat für Holz-CNC: Bearbeitungen, Referenzseiten, Schema-Versionen |

### Qualität

Drei davon auditieren eine veröffentlichte Website, und sie bauen aufeinander auf. **optimizing-web-performance** behebt die Core-Web-Vitals- und Barrierefreiheits-Befunde, die einen Lighthouse-Score bewegen. **auditing-agent-readiness** prüft die neuere Frage, ob ein KI-Agent die Site finden und nutzen kann: `llms.txt`, Markdown-Varianten, `.well-known`-Manifeste, ein MCP-Handshake. **auditing-website-quality** führt beide aus, ergänzt SEO, Sicherheits-Header sowie Inhalts- und i18n-Integrität und macht aus dem Ergebnis eine einzige sortierte Scorecard, die man einem Kunden übergeben kann. Der vierte, **preparing-pull-request**, betrifft die Qualität dessen, was ich in fremde Repositories schicke: Bevor ein PR oder ein Issue rausgeht, zeichnet er den Defekt durch Blame und Historie nach, durchsucht den Upstream-Tracker nach Duplikaten und laufender Arbeit und verifiziert jede Behauptung im PR-Text. Gemeinsam ist ihnen, dass keiner den Agenten ohne Belege "fertig" sagen lässt.

| Skill | Was er tut |
| --- | --- |
| **optimizing-web-performance** | Führt Lighthouse auf einer Live-Site aus und behebt, was den Score bewegt |
| **auditing-website-quality** | Auditiert eine Site von Ende zu Ende in eine sortierte Scorecard |
| **auditing-agent-readiness** | Prüft, ob eine Website für KI-Agenten auffindbar und nutzbar ist |
| **preparing-pull-request** | Zeichnet die Herkunft eines Defekts nach und durchsucht den Upstream-Tracker, bevor ein PR in einem fremden Repository eröffnet wird |

### Persönlich

Diese bleiben privat, weil sie kodieren, wie ich arbeite, und nicht, wie ein Werkzeug funktioniert. Im Zentrum steht **system**, eine einzige verbindliche Landkarte: Sie sagt dem Agenten, welche Skills, Repositories, operativen Systeme und Lebensbereiche es gibt, wo jedes davon liegt, wie man es startet und welche meiner schriftlichen Konventionen dafür gilt (wie Repositories auf der Platte angeordnet sind, wie Ordner benannt und archiviert werden, welchen Stack ein neues Projekt standardmäßig bekommt). Ein Beispiel: Mein Drive ist in Lebensbereiche aufgeteilt (Finanzen, Wohnen, Gesundheit, Beruf, Forschung, Lehre und so weiter), jeder mit seinem eigenen Regelwerk, und jede Datei hat darin genau einen Platz. Eine neue Versicherungspolice kommt unter `Finance/Insurance/` in einen Ordner namens `JJJJ-MM_Versicherer`, datiert nach dem Beginn der Police und nicht nach dem Tag, an dem ich sie abgelegt habe; wenn sie endet, wandert der Ordner in ein benachbartes `_Archive/`, damit die oberste Ebene nur das Aktuelle zeigt. Querschnittsthemen werden über Wikilinks verbunden statt über Kopien. Weil der Skill diese Regeln kennt, legt der Agent das Dokument selbst ab, und ich beantworte "wohin damit" nie zweimal.

| Skill | Was er tut |
| --- | --- |
| **system** | Ordnet jedem Skill, Repository, System und Lebensbereich seinen Ort und die geltende Konvention zu |
| **backup-system** | Meine Dateien liegen auf mehreren HDDs und SSDs verteilt, und diese Aufteilung wird mit der Zeit komplexer; dieser Skill hält alles systematisch geordnet |
| **phd** | Das ist mein PhD-Assistent: Er eröffnet und beschließt jeden Arbeitstag mit einer adversarialen Prüfung der Dissertation, ihrer These und ihrer Fristen |
| **searching-librarian** | Ich führe eine große persönliche Bibliothek von Forschungsarbeiten auf einem Heimserver; dieser Skill bringt dem Agenten bei, sie von jedem meiner Rechner aus abzufragen, nach Thema, Autor, DOI oder Id |

### Von dieser Website bereitgestellt

Zwei weitere Skills laufen in die andere Richtung: Sie sind nicht für meinen Agenten, sondern für Ihren. Diese Website veröffentlicht unter `/.well-known/agent-skills/` **portfolio-content** (jede Seite als reines Markdown lesen, in drei Sprachen) und **portfolio-mcp** (Projekte, Forschung, Lehre, Publikationen und CV über den schreibgeschützten MCP-Server der Site abfragen), damit ein Agent, der hier landet, die Site lesen kann, ohne sie zu scrapen. Wie sie gebaut sind, steht auf der Seite [Portfolio-Website](/de/projects/portfolio-website).

## Matt Pococks Skills

Zu [mattpocock/skills](https://github.com/mattpocock/skills) greife ich, wenn die Aufgabe Denken statt Tippen ist. Während meine eigenen Skills Fakten über ein Werkzeug fixieren, formen diese das Gespräch selbst. Die beiden Grill-Skills nutze ich am häufigsten: Vor jeder nicht trivialen Arbeit befragt mich der Agent so lange, bis jeder offene Zweig des Plans aufgelöst ist, und die Docs-Variante hinterlässt dabei eine Aufzeichnung der Entscheidungen (ADRs, ein Glossar). **codebase-design** und **domain-modeling** geben dem Agenten und mir ein gemeinsames Vokabular dafür, wie ein gutes Modul und eine gute Domänensprache aussehen, und **improve-codebase-architecture** wendet dieses Vokabular auf ein bestehendes Repository an und berichtet, wo es vertieft werden könnte. **handoff** gibt eine Unterhaltung an einen anderen Agenten weiter, ohne ihren Zustand zu verlieren, und **teach** macht den Agenten zu meinem Tutor: Er verwandelt den aktuellen Ordner in einen Lernarbeitsbereich mit einer Mission, kurzen in sich geschlossenen Lektionen, Referenzblättern und einem Protokoll dessen, was ich gelernt habe, sodass das Thema über mehrere Sitzungen statt in einem Durchgang gelernt wird.

| Skill | Was er tut |
| --- | --- |
| **grill-me** | Hinterfragt einen Plan, bis jeder Zweig aufgelöst ist |
| **grill-with-docs** | Dasselbe Interview, das nebenbei die Projektdokumentation schreibt |
| **codebase-design** | Entwirft tiefe Module mit kleinen Schnittstellen |
| **domain-modeling** | Legt die Domänensprache eines Projekts fest |
| **improve-codebase-architecture** | Findet Architekturverbesserungen und arbeitet sie durch |
| **handoff** | Übergibt eine Unterhaltung an einen anderen Agenten |
| **teach** | Bringt mir ein Thema über mehrere Sitzungen bei, aus einem Arbeitsbereich mit Lektionen, Referenzblättern und Lernprotokollen |

## Community-Skills

Skills von Leuten, die ich nicht kenne, über die Community gefunden und behalten, weil sie sich ihren Platz immer wieder verdient haben. Zwei davon sind strukturell: Superpowers ist die Prozessschicht unter jedem anderen Skill auf dieser Seite, und mit Diagram Design werden die Abbildungen dieser Website gezeichnet. Der dritte ist Anthropics eigener Design-Skill.

| Skill | Was er tut |
| --- | --- |
| **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** | Diagramme in redaktioneller Qualität, etwa das Architekturdiagramm auf der Seite [Portfolio-Website](/de/projects/portfolio-website), von Cathryn Lavery |
| **[Superpowers](https://github.com/obra/superpowers)** | Die Prozessschicht unter allem anderen, vom Brainstorming bis zur Verifikation, von Jesse Vincent |
| **frontend-design** | Eigenständiges, bewusstes UI-Design |

## Wie ich entscheide, was bleibt

Zwei Fragen. Erstens: Ist es spezifisch für ein Projekt? Dann gehört es in die `CLAUDE.md` dieses Repositories, die Anweisungsdatei, die der Agent in jeder Sitzung liest, und nicht in einen Skill: Ein Skill ist für Wissen, das zwischen Projekten wandert, und zwischen Menschen. Zweitens: Würde ein gut geschriebener Absatz in `CLAUDE.md` dieselbe Arbeit leisten? Wenn ja, fliegt der Skill raus. Wenn er eine verifizierte Schleife ehrlich hält, Fakten fixiert, die das Modell falsch macht, oder die Fragen stellt, die ich vergesse, bleibt er.

## Wohin sich Skills entwickeln

Fast jeder Skill, der heute im Umlauf ist, meine eingeschlossen, dreht sich um Software: Plugins bauen, Werkzeuge steuern, Websites auditieren, upstream beitragen. Dort sind Agenten im Moment am offensichtlichsten nützlich, aber dort endet das Format nicht. Eine `SKILL.md` ist eine Einheit von Expertise, und die meiste Expertise in Architektur, Ingenieurwesen und Bau ist kein Softwarewissen: wie man ein parametrisches Modell so aufsetzt, dass es Entwurfsänderungen übersteht, wie man eine statische oder fertigungstechnische Randbedingung aus einer Zeichnung abliest, was ein Holzdetail erfüllen muss, bevor es die Maschine erreicht, welche Fragen ein Praktiker stellt, bevor er einem Ergebnis vertraut. Dieses Wissen wird, so erwarte ich, die nächste Generation von Skills tragen, geschrieben von den Menschen, die es besitzen, und dort will ich als Nächstes beitragen: Skills aus dem Computational Design und aus der AEC-Praxis selbst.

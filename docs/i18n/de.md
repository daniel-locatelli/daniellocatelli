# German (de) style guide

How the site's German is written. Read it before writing or reviewing any
`de` text: `src/i18n/*/de.ts`, `src/content/**/de/**`, slide decks, and the
de strings in `src/scripts/generate-knowledge.ts`. The house rules in
`CLAUDE.md` (no em dashes, headings from h2) apply here too.

## Voice

- **Standard German spelling with ß** (große, maßgeschneidert), not the Swiss
  *ss*, even though Daniel lives in Zurich.
- **Sie** throughout, including the chat UI, its starter questions and the
  services: German academic and B2B readers expect it.
- **Write from the meaning.** The English sentence is a reference, never a
  template. Watch for nominal chains ("Durchführung von …", "Erstellung von
  …") where a verb or a plain noun phrase reads better, and for coordinated
  compounds that break ("Computational Design und Softwareentwicklungsprojekte").
- German quotation marks: „…“.
- Daniel reads German at B1, so wording calls rest on the reviewer; bring him
  the decisions about meaning, facts and register.

## Glossary

| English | German | Status |
| --- | --- | --- |
| form finding | Formfindung | confirmed |
| digital fabrication | digitale Fertigung | confirmed |
| computational design | Computational Design | confirmed |
| skills (CV section) | Kompetenzen | confirmed |
| supervisor / advisor (thesis) | Betreuer / Mitbetreuer | confirmed |
| engineered timber | Holzwerkstoffe | confirmed |
| vernacular (adj.) | vernakulär | confirmed |
| urban analysis | städtebauliche Analyse (not Stadtplanung) | confirmed |
| Life Cycle Assessment | Ökobilanz (LCA) | confirmed |
| cutting pattern (membranes) | Zuschnitt | confirmed |
| standards (norms) | Normen | confirmed |
| robotic clamping device (Building Across Scales) | robotisches Klemmgerät | confirmed |
| published paper titles, certificate and course product names | original language, unchanged | confirmed |

## Corrections

Decisions from reviews, newest first. An entry records what was wrong, so
"kept" decisions belong here too.

| Date | Where | Before | After | Why |
| --- | --- | --- | --- | --- |
| 2026-11-16 | CV, legal, portfolio website, O3 pavilion | strukturelle Probleme / Software-Ingenieur / einiges Graben / Präsentatorfenster / enge, breite Fragen / Explosionsperspektive / Kleinmodell / Schmiede / alle Werkzeuge erlernte / zufällige Schäden / straight quotes | Tragwerksaufgaben / Softwareingenieur / eine genauere Untersuchung / Referentenansicht / eng, weit gefasste Fragen / Explosionsdarstellung / Maßstabsmodell / Metallbauer / den Umgang mit allen Werkzeugen gelernt hatte / Nebenschäden / „…“ | Verification panel (Opus + Fable reviewers, a judge) on batch A: 44 fixes accepted, 7 rejected as taste or as against the site's consistent usage (e.g. „des Computational Design“). |
| 2026-11-16 | home chat, services | du (Frag, bietest du, deinen Tools) | Sie | Daniel: Sie everywhere (batch A, D1). |
| 2026-11-16 | experiences (ETH) | grosse Sprachmodelle | große Sprachmodelle | Daniel: keep ß (D2). |
| 2026-11-16 | certifications, courses | CS50's Einführung in die Informatik / Autodesk … Zertifizierte Fachprüfung / Einführung in die Informatik und Programmierung mit Python | the official English names | Daniel: official names stay in English (D3). pt still translates them. |
| 2026-11-16 | education (master's thesis) | Building Across Scales - Ein robotisches Holzfertigungssystem … | kept | Thesis titles stay translated, unlike published papers (D4). |
| 2026-11-16 | experiences, projects, services | Formsuche / digitale Fabrikation | Formfindung / digitale Fertigung | Glossary (D5): the majority terms on the site. |
| 2026-11-16 | CV summary | Hintergrund als … Expertise in der Verbindung von Design und Technik / technisches Holz / Dreisprachiger Fachmann, der sich … widmet | Zuvor … verbindet Entwurf und Ingenieurwesen / Holzwerkstoffe / Arbeitet dreisprachig … und löst | Fragments and calques; "Technik" is not engineering. |
| 2026-11-16 | Urban Scale Timber | Stadtplanung / Lebenszyklusanalyse | städtebauliche Analysen / Ökobilanz | Meaning drift: the en says urban analysis. |
| 2026-11-16 | Alfred Rein, ArtEngineering | Formsuche von Zugstrukturen / Einsatz / Schnittmuster / räumliche Strukturen / Strukturanalyse | Formfindung zugbeanspruchter Tragwerke / Entfaltung / Zuschnitt / Raumtragwerke / Tragwerksanalyse | Engineering terms. |
| 2026-11-16 | CV, subpages | Fähigkeiten / Berater | Kompetenzen / Mitbetreuer | "Berater" means consultant. |
| 2026-11-16 | education | Bachelor für Architektur und Stadtplanung / Architektur-Austauschstudent / Intensives Englischprogramm / Doctor of Sciences / Gymnasialabschluss | Bachelor in Architektur und Städtebau / Austauschstudium Architektur / Intensivkurs Englisch / Doktor der Wissenschaften (Dr. sc.) / Schulabschluss | Natural German degree names; ensino médio is not an Abitur. |
| 2026-11-16 | pages, services, legal | Kollaborationen / einen Planeten bauen / Cloudflare Datenschutzrichtlinie / „Website" / em dashes | Kooperationen / der Weg zu einem … Planeten / Datenschutzrichtlinie von Cloudflare / „Website“ / commas and parentheses | Batch A review, accepted by Daniel. |

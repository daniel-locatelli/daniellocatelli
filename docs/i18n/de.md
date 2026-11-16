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
| biomimicry / biomimetics | Biomimetik (not Biomimikry, not Bionik) | confirmed |
| mesh | das Mesh (Kugel-Mesh), not Netzfläche | confirmed |
| flatten (Voronoi panels) | planarisieren; flat plates = ebene Platten | confirmed |
| alveolar polycarbonate | Polycarbonat-Stegplatten | confirmed |
| plugin | Plugin (the site's spelling, 58 to 4) | confirmed |
| cable (tension member) | Seil | confirmed |
| brief (design brief) | Aufgabenstellung, not Briefing | confirmed |
| computational (adjective) | computergestützt, never rechnerisch | confirmed |
| high-tech / low-tech | Hightech / Lowtech | confirmed |
| mass customization | Mass Customization, not Massenfertigung | confirmed |
| project, where pt *projeto* means the design | Entwurf | confirmed |
| technical / site visit | Ortstermin | confirmed |
| apud | zit. nach | confirmed |
| urban solid waste | feste Siedlungsabfälle | confirmed |
| press gluing | Pressverleimung | confirmed |
| link text to a conference paper | „… auf der <Konferenz>“ | confirmed |

## Corrections

Decisions from reviews, newest first. An entry records what was wrong, so
"kept" decisions belong here too.

| Date | Where | Before | After | Why |
| --- | --- | --- | --- | --- |
| 2026-11-16 | High-Low (en, pt, de) | the mason … interleaved battens / o pedreiro … ripas intercaladas / Maurer … Latten; pieces of the base in the general floor plan | the foreman … lay rebars between them / mestre de obras … intercalar vergalhões / Polier … Bewehrungsstäbe; base pieces precisely marked on the plan | Checked against the published SIGraDi 2018 PDF (estante, mestre-de-obras, vergalhões intercalados, indicadas com precisão). |
| 2026-11-16 | High-Low (en, pt, de) | in Figure 7 / (Figure 6) | in the photo of the finished pavilion below / dropped | Daniel (D1): the site does not number its images. |
| 2026-11-16 | bobbin lace | Webtechnik / Webmethode / textiler Gewebe | textile Handwerkstechnik / textiler Geflechte | Daniel (D2): Klöppeln is not weaving; de only, en and pt keep the published wording. |
| 2026-11-16 | Life Lamp | sensibles Objekt | sinnlich erfahrbares Objekt | Daniel (D3): pt objeto sensível means perceptible; sensibel describes a touchy person. |
| 2026-11-16 | bobbin lace | Kabel / Kabelwiderstandsfähigkeit / Briefing / Netzfläche / Endalgorithmus / Biomimikry | Seil / Steifigkeit der Seile / Aufgabenstellung / Mesh / endgültiger Algorithmus / Biomimetik | Daniel (D4, D5, D6) and the batch B panel. |
| 2026-11-16 | High-Low | Alveoar-Polycarbonat / Hochtechnologie, Niedrigtechnologie / Fließfähigkeit der Form / abflachen / Projekt (design) / Massenfertigung mit CNC / Entwurfsvermittlung / Vor allem (en: recently) | Polycarbonat-Stegplatten / Hightech, Lowtech / fließender Charakter der Form / planarisieren / Entwurf / Mass Customization / Wandel des Mediums, in dem entworfen wird / In jüngerer Zeit | Portuguese words and false friends; meaning drift. Batch B panel. |
| 2026-11-16 | publications | Plugin → Plug-in (proposed) | kept Plugin | Panel rejected: the site writes Plugin 58 times against 4. |
| 2026-11-16 | publications | Opus rewrites of correct sentences (Querschnitt, Avantgarde von Zukünften, Bibliographie, …) | kept | Batch B panel (Opus + Fable reviewers, a judge): 107 edits accepted, 21 rejected as taste or as drifting from the en. |
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

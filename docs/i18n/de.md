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
| mesh vs net (thesis page) | Mesh for digital geometry (Vierecks-Mesh, Dreiecks-Mesh, des Meshes); Netz only for physical nets (Seilnetz, Spinnennetz, Klöppelnetz) | confirmed |
| form finding (in text) | Formfindung, not *form finding* | confirmed |
| carbon fibre | Kohlefaser, not Carbonfaser | confirmed |
| lightweight construction / self-forming / roof plan | Leichtbau / Selbstbildung / Dachaufsicht | confirmed |
| Grasshopper operations (Remesh, Remap, Relaxation, Mesh Machine) | tool names, unchanged | confirmed |
| soap film | Seifenfilm (the site's spelling) | confirmed |
| vertex (CAD) | Scheitelpunkt (pending Daniel: or Knotenpunkt) | proposed |
| material computation (Menges) | Material Computation (term of art, like Computational Design), not materielle Berechnung | proposed |
| tensegrity | Tensegrity, Tensegrity-Struktur (the site's spelling, 31 to 9), not Tensegrität | proposed |
| column (structural member) | Stütze; Säule only for classical or stone columns (Güell basalt columns) | proposed |
| funicular / hanging model | Hängemodell, not Seilmodell | proposed |
| earth (building material) | Lehm | proposed |
| Cluster of Excellence | Exzellenzcluster | proposed |
| fire resistance rating (building component) | Feuerwiderstandsklasse, not Brandschutzklasse | proposed |
| quantity takeoff | Mengenermittlung | proposed |
| accidental loads / actions | außergewöhnliche Lasten (Eurocode), not zufällige | proposed |
| user flow (UX) | User Flow, not Benutzerfluss / Nutzerfluss | proposed |
| pricing plan (SaaS) | Tarif, not Plan | proposed |
| research assistant (student job, project pages) | Wissenschaftliche Hilfskraft am ICD: <topic> (as on the research pages) | proposed |
| link text "X at <org>" | „X bei <org>“ | proposed |
| shipping container | Seecontainer | proposed |
| plasma cutter (CNC) | Plasmaschneidanlage (Plasmabrenner is the torch) | proposed |
| cutting pattern generation (membranes) | Zuschnittsermittlung (extends the Zuschnitt row) | proposed |
| Detailing (Category) | Detaillierung (spelling) | proposed |
| panel (prefabricated CLT piece) / paneling logic | Element (BSP-Element) / Elementierung, not Paneel | proposed |
| linear span (one-way spanning) | einachsige Lastabtragung | proposed |
| glue drying / dried (structural adhesives) | Aushärten / ausgehärtet | proposed |
| butt joint | Stumpfstoß | proposed |
| open time (adhesive) | offene Zeit | proposed |
| screw-press gluing | Schraubenpressklebung | proposed |
| mid-span / over the column (slab moments) | Feldmitte / über den Stützen | proposed |
| strength of a device (a force in N) | Kraft / Zugkraft (Festigkeit only for material properties) | proposed |
| bolt (through-bolt with nut, timber) | Bolzen | proposed |
| tower typology | Hochhaustypologie | proposed |
| citation (reference) | Quellenangabe, not Zitat | proposed |
| pin (facts, in agent skills) | festschreiben | proposed |
| pre-standard (prEN) | Normentwurf, not Vornorm | proposed |
| cohort (ITECH 2021) | Jahrgang, not Klasse | proposed |
| structural (engineering sense) | statisch / konstruktiv, not strukturell | proposed |

## Corrections

Decisions from reviews, newest first. An entry records what was wrong, so
"kept" decisions belong here too.

| Date | Where | Before | After | Why |
| --- | --- | --- | --- | --- |
| 2026-11-17 | Building Across Scales (en, pt, de) | Nagellaminierung (NLT) / getrocknet (en dried, pt secagem) / strength test (en) / zweite Abbildung 57 | zweilagige, verschraubte BSP-Platte / ausgehärtet (en cured, pt cura) / force test / Abbildung 59 | Daniel: the layers are screwed; glue cures; the device's strength is a force; duplicate figure number. |
| 2026-11-17 | projects | „unserer Sorgfaltspflicht entsprechen“ (KfW) / Gebäudehüllen (Urban Site Configurator) / KfW-Förderrechner (name) / ozone trioxide (en) | mit unseren mehrfach manuell geprüften Berechnungen übereinstimmen / Baukörper / KfW-Fördertool (BuildSystems' own German name) / ozone molecule | Daniel: the calculations were checked by hand; buildable volume; buildsystems.de calls it Fördertool. Seile for the Parada spheres confirmed (steel cables). |
| 2026-11-17 | teaching | Diatomeen / Behaviorologie / English quotes and membrane names in the deck notes, Frei Otto slide quote / links without /de/ | Radiolarien (all locales) / Behaviorology / German translations marked „aus dem Englischen übersetzt“ / /de/… and /pt/… links | Daniel: radiolarians per sources on Binet; the most common form; translate; unprefixed links led to the English pages. |
| Alfred Rein Engineers | Alfred Rein Ingenieure (site usage, 12 to 0 now) | proposed |
| short slide quotes (Fuller, Gaudí, Menges) | translated into German, like pt; long book quotes in speaker notes stay English, like pt | proposed |
| 2026-11-17 | teaching (22 pages, both decks) | materielle Berechnung / Tensegrität / Life-Leuchte / Bionik / Form Finding / computergestütztes Design / Schlosser / Säule (timber column) / Seilmodelle / Erde / Netzrelaxation / Parametrizismus / Geodäten / „tensionale Integrität“ / Eulenfalter / Hohlkreis / für euch / Diatomeen (Cyrtoidea plate) / English slide quotes and headings | Material Computation / Tensegrity / Life Lamp / Biomimetik / Formfindung / Computational Design / Metallbauer / Stütze / Hängemodelle / Lehm / Mesh-Relaxation / Parametrismus / geodätische Kuppeln / engl. *tensional integrity* / Bananenfalter / Ring / (no pronoun) / Radiolarien / German | Batch E panel (Opus and Fable reviewers, a judge): 270 edits accepted. |
| 2026-11-17 | teaching | Linsen der Architektur → Blickwinkel; Stahlblechbiegen; Draufsicht der → auf die; Aufbau → Entwicklung des Algorithmus; Ausführungszeichnungen → -pläne; Frei Otto quote back-translated; Argyris note translated; „soweit wir sie verstehen“ (proposed) | kept | Batch E panel rejected: the image shows literal lenses, standard terms, taste, or a quote that must not be back-translated. |
| 2026-11-17 | projects (all 37 de files) | rechnerische Strategie / en dashes as dashes / English captions and link texts (at, by, Lucas and the work-platform-lift) / Brandschutzklasse / zufällige Lasten / SOFiSTiK-Netz / Plasmabrenner / Schnittmuster / Massenermittlung / Detailierung / Benutzerfluss / ICD-Forschungsassistent / nationale Bank (KfW) / Kleinmodell / das Stück (artwork) | computergestützte Strategie / colons, commas, parentheses / German captions, „bei“ / Feuerwiderstandsklasse / „außergewöhnliche“ Lasten / SOFiSTiK-Mesh / Plasmaschneidanlage / Zuschnitt, Zuschnittsermittlung / Mengenermittlung / Detaillierung / User Flow / Wissenschaftliche Hilfskraft am ICD: … / staatliche Förderbank / Maßstabsmodell / das Werk | Batch D panel (Opus + Fable reviewers, a judge): 219 edits applied. |
| 2026-11-17 | Parada Coca-Cola | Kabel (suspension of the acrylic spheres) | Seil | Glossary: cable as tension member (pending Daniel, Q3). |
| 2026-11-17 | projects | schreibgeschützt (read-only portfolio, MCP server) / „unserer Sorgfaltspflicht entsprechen“ (KfW) / Rhinos nativen Befehl | kept | Panel suggestions not taken: standard IT usage, unclear en, taste. |
| 2026-11-17 | research, half 2 (4 pages) | Paneel / lineare Spannweiten / getrocknet / Ingenieurholz / rechnerisch / Holzfabrikation / Stoß-an-Stoß / Öffnungszeit / Mittelspannweite / Zugfestigkeitstest / Zitat / Vornormen / Substrat / Abbildung 02 – … / German-translated paper title (Leung et al.) | Element, Elementierung / einachsige Lastabtragung / ausgehärtet / Holzwerkstoffe / computergestützt / Holzfertigung / Stumpfstöße / offene Zeit / Feldmitte / Zugkrafttest / Quellenangabe / Normentwürfe / Grundlage / Abbildung 02: … / English title | Batch C half 2 panel (Opus + Fable reviewers, a judge): 257 edits applied. |
| 2026-11-17 | research, half 2 | M20-Bolzen → Schrauben, Ausrichtungskanal → Führungsnut, adversariale Prüfung → kritische Gegenprüfung, CPR-2024 → BauPVO in captions, eine DOI → ein DOI, renumbering the second Abbildung 57 | kept | Panel rejected: correct term (Bolzen), taste, Daniel's own term, figure labels, or needs all three locales. |
| 2026-11-17 | Building Across Scales | Building Across Scales: Ein robotisches Holzfabrikationssystem für das Verpressen von Klebeverbindungen vor Ort | … Ein robotisches Holzfertigungssystem für die Pressverleimung vor Ort | Glossary (Pressverleimung); now identical to the education and publication pages. |
| 2026-11-16 | research, half 1 (7 pages) | rechnerisch / computergestütztes Design / Massenanpassung / *form finding* / Quadratisches Netz / Carbonfaser / Abschreckungsmittel / Kuchenseeigel / Pavillonexploration / Designerin von 3,8 Milliarden Jahren / English video captions | computergestützt / Computational Design / Mass Customization / Formfindung / Vierecks-Mesh / Kohlefaser / hat mich abgeschreckt / Schildseeigel / Pavillonstudie / entwirft seit 3,8 Milliarden Jahren / German captions | Batch C panel (Opus + Fable reviewers, a judge): 277 edits accepted, applied by Daniel ("proceed with the fixes"). |
| 2026-11-16 | ICD, ITKE assistant pages | ICD-Wissenschaftliche Hilfskraft für Kernloses Filamentwickeln | Wissenschaftliche Hilfskraft am ICD: kernloses Filamentwickeln (same for ITKE) | Broken compound, wrong capital. |
| 2026-11-16 | thesis, Expo 1967 caption | Pole | Masten | The image shows the masts under the mesh. |
| 2026-11-16 | research, half 1 | Seifenhaut, fingerverzinkt → verzinkt, Masterstudiengang, Rahmen for Struktur, spaced hyphens in captions → colons (proposed) | kept | Batch C panel rejected: site usage, correct terms, or taste. |
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

URL: https://daniellocatelli.com/de/projects/circular-component-creator-by-buildsystems

# Circular Component Creator von BuildSystems

Description: Konzeptionelle Designstudie für eine Web-Applikation zum Durchsuchen, Filtern und Vergleichen zirkulärer Baukomponenten. Entwicklung von UI/UX-Mockups in Figma und Definition der Datenarchitektur.
Tags: UI/UX Design, Figma, Zirkuläres Bauen
Category: UI/UX Design
Director: Martin Bittmann
Team: Daniel Nunes Locatelli, Daniel Dieren
Organization: BuildSystems GmbH
Date: June 2023 - July 2023

Der Circular Component Creator (CCC) war eine konzeptionelle Designstudie bei [BuildSystems](https://buildsystems.de/) für eine Web-Applikation, die es Nutzern ermöglichen sollte, Baukomponenten für zirkuläres Bauen zu durchsuchen, zu filtern und zu vergleichen. Das Projekt erreichte das Stadium detaillierter Figma-Mockups und einer definierten Datenarchitektur, wurde jedoch nicht als funktionierende Anwendung umgesetzt.

Das Konzept entwickelte sich aus dem [BuildSystems-Plugin für Grasshopper](/projects/buildsystems-plugin-for-grasshopper), das Ökobilanz-Daten (LCA) innerhalb der Rhino/Grasshopper-Designumgebung bereitstellte. Der CCC zielte darauf ab, ähnliche Funktionen auf eine eigenständige Webplattform zu bringen und die Komponentenbibliothek einem breiteren Publikum über Grasshopper-Nutzer hinaus zugänglich zu machen.

## Datenarchitektur

Das zugrundeliegende Datenmodell folgt einer hierarchischen Struktur, die widerspiegelt, wie reale Baukomponenten zusammengesetzt werden. Eine Komponente besteht aus Baugruppen, die wiederum aus Schichten bestehen. Jede Schicht kann Unterschichten enthalten, unterteilt in tragende und dämmende Teile.

Diese Hierarchie wurde so konzipiert, dass die Anwendung aggregierte Eigenschaften (Gesamtdicke, U-Wert, Gewicht) berechnen und gleichzeitig eine granulare Kontrolle über individuelle Materialspezifikationen behalten könnte.

## UX-Designprozess

Der Designprozess begann mit handgezeichneten Wireframes, um den Nutzerfluss und die Bildschirmstruktur abzubilden. Diese Skizzen definierten sechs zentrale Ansichten: die Startseite, Komponentenübersicht, Filterung, Komponentenauswahl, Detailansicht und Ergebnisanalyse.

Dieser Ansatz ermöglichte dem Team, schnell über Layout- und Interaktionsmuster zu iterieren, bevor zu den Figma-Mockups übergegangen wurde.

## Figma-Mockups

### Startseite

Das Startseitenkonzept stellt die Anwendung mit einem isometrischen Schnitt einer Baukomponente vor, der die einzelnen Schichten eines Wand- oder Deckenaufbaus zeigt.

Darunter werden die fünf dynamischen Komponentenkategorien angezeigt: Außenwände, Innenwände, Trennwände, Decken und Bedachungen. Jede Kategorie wird durch ein isometrisches Icon dargestellt, das den Nutzern einen unmittelbaren Überblick über die verfügbaren Komponententypen bietet.

### Komponentenbibliothek

Das Bibliothekskonzept zeigt alle verfügbaren Komponenten in einem Rasterlayout. Nutzer würden bis zu drei Komponenten für einen direkten Vergleich auswählen können. Jede Komponentenkarte zeigt eine 3D-Darstellung, die Komponentenkennung und wesentliche Eigenschaften.

### Filtersystem

Ein Filterpanel würde es Nutzern ermöglichen, den Komponentenkatalog nach mehreren Kriterien einzugrenzen: Materialtyp (Massivholz, Nadelholz, Beton, Porenbeton, Kalksandstein), Abmessungen und Rahmenbauweise.

### Komponentenvorschau

Beim Überfahren einer Komponentenkarte mit der Maus würde eine detaillierte Vorschau mit den wichtigsten Eigenschaften angezeigt: Name, Material, U-Wert, Brandschutzklasse und weitere Angaben.

### Komponentendetailseite

Das Detailseitenkonzept bietet eine umfassende Ansicht einer einzelnen Komponente, gegliedert in drei Bereiche:

- **Eigenschaftstabelle**: Typ, Material, bauphysikalische Werte (U-Wert, R-Wert), Brandschutzklassifizierung und ob die Komponente vorgefertigt oder vor Ort gebaut wird.
- **Materialliste**: Eine nummerierte Aufschlüsselung jeder Schicht mit Materialbezeichnung und Dicke in Millimetern.
- **Analysegrafiken**: Vier Kreisdiagramme, die die Leistung der Komponente in verschiedenen Metriken darstellen.

Eine 3D-Schnittansicht auf der rechten Seite zeigt die exakte Schichtkomposition, passend zur nummerierten Materialliste.

Dies war das letzte Element des Designprozesses, bevor das Projekt auf Eis gelegt wurde. Die detaillierten Mockups boten eine klare Vorstellung davon, wie die Anwendung funktionieren und aussehen würde, und legten ein solides Fundament für eine mögliche zukünftige Entwicklung.

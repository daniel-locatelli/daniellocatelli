---
Cover: /assets/content/projects/circular-component-creator-by-buildsystems/homepage-screenshot-laptop.png
CoverAlt: "Startseite des Circular Component Creator auf einem Laptop, mit einem isometrischen Schnitt einer Baukomponente und dynamischen Komponentenkategorien."
Name: "Circular Component Creator von BuildSystems"
Description: "Konzeptionelle Designstudie für eine Web-Applikation, mit der sich zirkuläre Baukomponenten durchsuchen, filtern und vergleichen lassen. Dafür entwickelte ich UI/UX-Mockups in Figma und legte die zugrunde liegende Datenarchitektur fest."
Tags:
  - UI/UX Design
  - Figma
  - Zirkuläres Bauen
Organization: "BuildSystems GmbH"
Category: UI/UX Design
DateStart: "2023-06-01"
DateEnd: "2023-07-01"
Director:
  - Martin Bittmann
Manager:
  - Julia Dorn
Team:
  - Daniel Nunes Locatelli
  - Daniel Dieren
---

Der Circular Component Creator (CCC) war eine konzeptionelle Designstudie bei [BuildSystems](https://buildsystems.de/) für eine Web-Applikation, die es Nutzern ermöglichen sollte, Baukomponenten für zirkuläres Bauen zu durchsuchen, zu filtern und zu vergleichen. Das Projekt kam bis zu detaillierten Figma-Mockups und einer festgelegten Datenarchitektur, wurde aber nicht als lauffähige Anwendung umgesetzt.

Das Konzept entwickelte sich aus dem [BuildSystems-Plugin für Grasshopper](/projects/buildsystems-plugin-for-grasshopper), das Ökobilanz-Daten (LCA) innerhalb der Rhino/Grasshopper-Designumgebung bereitstellte. Der CCC zielte darauf ab, ähnliche Funktionen auf eine eigenständige Webplattform zu bringen und die Komponentenbibliothek einem breiteren Publikum über Grasshopper-Nutzer hinaus zugänglich zu machen.

## Datenarchitektur

Das zugrundeliegende Datenmodell folgt einer hierarchischen Struktur, die widerspiegelt, wie reale Baukomponenten zusammengesetzt werden. Eine Komponente besteht aus Baugruppen, die wiederum aus Schichten bestehen. Jede Schicht kann Unterschichten enthalten, unterteilt in tragende und dämmende Teile.

Diese Hierarchie wurde so konzipiert, dass die Anwendung aggregierte Eigenschaften (Gesamtdicke, U-Wert, Gewicht) berechnen könnte, während sich jede einzelne Materialangabe weiterhin im Detail steuern ließe.

![Diagramm der hierarchischen Datenstruktur: Komponente zu Baugruppe zu Schicht zu Unterschicht, mit tragenden und dämmenden Unterteilungen.](../../../assets/content/projects/circular-component-creator-by-buildsystems/data-hierarchy-diagram.png)

## UX-Designprozess

Der Designprozess begann mit handgezeichneten Wireframes, um den User Flow und den Aufbau der Bildschirme zu skizzieren. Diese Skizzen definierten sechs zentrale Ansichten: die Startseite, Komponentenübersicht, Filterung, Komponentenauswahl, Detailansicht und Ergebnisanalyse.

![Handgezeichnete Wireframe-Skizzen mit dem User Flow und dem Aufbau der Bildschirme des Circular Component Creator.](../../../assets/content/projects/circular-component-creator-by-buildsystems/circular-component-creator_ui-sketch.jpg)

So konnte das Team Layout und Interaktionsmuster in schnellen Iterationen verfeinern, bevor es zu den Figma-Mockups überging.

## Figma-Mockups

### Startseite

Das Startseitenkonzept stellt die Anwendung mit einem isometrischen Schnitt einer Baukomponente vor, der die einzelnen Schichten eines Wand- oder Deckenaufbaus zeigt.

Darunter werden die fünf dynamischen Komponentenkategorien angezeigt: Außenwände, Innenwände, Trennwände, Decken und Dächer. Jede Kategorie wird durch ein isometrisches Icon dargestellt, das den Nutzern einen unmittelbaren Überblick über die verfügbaren Komponententypen bietet.

![Figma-Mockup der Startseite mit einem isometrischen Schnitt einer Baukomponente und den fünf dynamischen Komponentenkategorien.](../../../assets/content/projects/circular-component-creator-by-buildsystems/landing-page-external-walls.png)

### Komponentenbibliothek

Das Bibliothekskonzept zeigt alle verfügbaren Komponenten in einem Rasterlayout. Nutzer sollten bis zu drei Komponenten auswählen können, um sie direkt nebeneinander zu vergleichen. Jede Komponentenkarte zeigt eine 3D-Darstellung, die Komponentenkennung und wesentliche Eigenschaften.

![Figma-Mockup der Komponentenbibliothek mit einem Raster von Baukomponenten zur Auswahl und zum Vergleich.](../../../assets/content/projects/circular-component-creator-by-buildsystems/component-library.png)

### Filtersystem

Über ein Filterpanel sollten Nutzer den Komponentenkatalog nach mehreren Kriterien eingrenzen können: Materialtyp (Massivholz, Nadelholz, Beton, Porenbeton, Kalksandstein), Abmessungen und Rahmenbauweise.

![Figma-Mockup des Filterpanels mit Material-, Abmessungs- und Rahmenoptionen zur Eingrenzung der Komponentenauswahl.](../../../assets/content/projects/circular-component-creator-by-buildsystems/component-library-filters.png)

### Komponentenvorschau

Beim Überfahren einer Komponentenkarte mit der Maus würde eine detaillierte Vorschau mit den wichtigsten Eigenschaften angezeigt: Name, Material, U-Wert, Feuerwiderstandsklasse und weitere Angaben.

![Figma-Mockup einer Komponentenkarte mit erweiterter Vorschau der Materialeigenschaften und Spezifikationen.](../../../assets/content/projects/circular-component-creator-by-buildsystems/component-card-preview.png)

### Komponentendetailseite

Das Detailseitenkonzept bietet eine umfassende Ansicht einer einzelnen Komponente, gegliedert in drei Bereiche:

- **Eigenschaftstabelle**: Typ, Material, bauphysikalische Werte (U-Wert, R-Wert), Feuerwiderstandsklasse und ob die Komponente vorgefertigt oder vor Ort gebaut wird.
- **Materialliste**: Eine nummerierte Aufschlüsselung jeder Schicht mit Materialbezeichnung und Dicke in Millimetern.
- **Analysegrafiken**: Vier Kreisdiagramme, die verschiedene Leistungskennwerte der Komponente darstellen.

Eine 3D-Schnittansicht auf der rechten Seite zeigt den genauen Schichtaufbau, passend zur nummerierten Materialliste.

![Figma-Mockup der Komponentendetailseite mit Eigenschaften, Materialschichten, einem 3D-Schnitt und Analyse-Kreisdiagrammen.](../../../assets/content/projects/circular-component-creator-by-buildsystems/component-detail-page.png)

Das war der letzte Schritt des Designprozesses, bevor das Projekt auf Eis gelegt wurde. Die detaillierten Mockups boten eine klare Vorstellung davon, wie die Anwendung funktionieren und aussehen würde, und legten ein solides Fundament für eine mögliche zukünftige Entwicklung.

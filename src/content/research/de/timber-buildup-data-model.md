---
Cover: /assets/content/research/timber-buildup-data-model/buildup-composition-cover.png
CoverAlt: "Ein Eichentablett mit der Lasergravur 'External wall awmohi02a-04', einem geprüften Aufbau aus dem dataholz-Katalog, in dem die acht Schichten dieser Wand aufrecht in nummerierten Fächern stehen: Lärchenschalung, Lattung, Fassadenbahn, Gipsfaserplatte, die Ständerebene, eine verleimte Massivholzplatte, die Installationsebene und die innere Beplankung. Ständerebene und Installationsebene sind keine einzelnen Platten: In jedem Fach stehen ein Holzquerschnitt, Mineralwolle und ein zweiter, identischer Querschnitt hintereinander bei gleicher Dicke, sodass die Schicht als eine Dicke aus wechselnden Materialien lesbar wird. Eine gedruckte Legende neben dem Tablett führt die acht Schichten nummeriert mit ihren Dicken auf."
Description: "Wie ein Holzbau-Aufbau maschinenlesbar wird: ein Datenmodell nach ISO 23387, das Schichten und Produkte in einem Aufbau verschachtelt, eine Datenvorlage zu einem Anforderungsblatt verschärft und sie mit einem Datenblatt erfüllt, veröffentlicht als versioniertes Wörterbuch hm/dokwood im bSDD und entworfen, um die Revit-, Cadwork- und MCP-Schnittstellen von DOKwood und einen künftigen digitalen Produktpass zu tragen."
Name: Ein Datenmodell für Holzbau-Aufbauten
Tags:
  - bSDD
  - ISO 23387
  - Datenvorlagen
  - Holzbau
Authors:
  - Daniel Nunes Locatelli
  - Fabian Scheurer
  - Sebastián Hernández-Maetschl
  - Joel Karolin
Organization: Hochschule München
City:
  - München
Country: Deutschland
Updated: "2026-08-23"
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: hm/dokwood im buildingSMART Data Dictionary
  Href: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13
OtherLinks:
  - Text: Projektseite DOKwood
    Href: https://daniellocatelli.com/de/projects/dokwood
  - Text: ISO 23387:2025 Datenvorlagen
    Href: https://www.iso.org/standard/85391.html
  - Text: ISO 23386:2020 Merkmale in Datenkatalogen
    Href: https://www.iso.org/standard/75401.html
  - Text: ISO 12006-3:2022 Rahmen für objektorientierte Informationen
    Href: https://www.iso.org/standard/74932.html
  - Text: EN 17549-2:2023 konfigurierbare Bauobjekte und Anforderungen
    Href: https://standards.iteh.ai/catalog/standards/cen/d1d7f084-fe17-4e3e-bc06-b17a936ae485/en-17549-2-2023
  - Text: Verordnung (EU) 2024/3110, Bauprodukteverordnung
    Href: https://eur-lex.europa.eu/eli/reg/2024/3110/oj/eng
  - Text: Verordnung (EU) 2024/1781, Ökodesign für nachhaltige Produkte (ESPR)
    Href: https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng
  - Text: CIRPASS-2 Pilotprojekte zum digitalen Produktpass
    Href: https://cirpass2.eu/
---

Die Plattform [DOKwood](/de/projects/dokwood) tauscht Aufbauten mit Revit, Cadwork und künftig mit KI-Assistenten und einem digitalen Produktpass aus. Jeder dieser Austausche ist nur so interoperabel wie das Vokabular darunter: Wenn "Feuerwiderstandsklasse" in der Plattform eines, in der Revit-Vorlage etwas anderes und im PDF des Partners ein Drittes bedeutet, ist nichts Nachgelagertes vertrauenswürdig. Das buildingSMART Data Dictionary (bSDD) ist die Antwort der Branche auf dieses Problem, ein öffentliches, versioniertes Register von Klassen und Merkmalen mit stabilen URIs, die jedes Werkzeug auflösen kann. Diese Seite handelt von dem Wörterbuch, das ich dort für DOKwood aufgebaut habe.

Das Wörterbuch ist unter dem Organisationscode der Hochschule München als `hm/dokwood` veröffentlicht und durchlief während meiner Zeit dort dreizehn Versionen, v0.1 bis v0.13. Jedes Werkzeug, das es nutzt, etwa das Revit-Add-in oder das Cadwork-Plugin, bekommt seine eigene Merkmalsgruppe, sodass ein Plugin genau das Bündel abfragen kann, das es braucht.

![Zwei Ebenen: oben das öffentliche bSDD-Wörterbuch mit Merkmalen und Klassen, unten die DOKwood-Plattform, in der jedes Unternehmen daraus eigene Datenvorlagen zusammenstellt, Projekte sie zu Anforderungsblättern verschärfen und Datenblätter ausfüllen, und das Datenblatt den digitalen Produktpass speist.](/assets/content/research/timber-buildup-data-model/iso-23387-two-plane.svg "Vom öffentlichen Wörterbuch zum digitalen Produktpass")

## Datenvorlagen nach ISO 23387

Die ISO 23387, die Norm für Datenvorlagen von Bauobjekten, ist das Substrat des gesamten Datenmodells: Unternehmenswörterbuch, Projektspeicher und letztlich der digitale Produktpass folgen ihr, während das öffentliche Wörterbuch auf ISO 12006-3 für das Wörterbuch-Rahmenwerk und ISO 23386 für kontrollierte Merkmale aufbaut. Eine Datenvorlage listet auf, welche Merkmale eine Art von Objekt beschreiben, ohne Werte. DOKwood nutzt zwei: ein System Data Template für einen Aufbau, weil ein Aufbau ein System aus Schichten ist, und ein Product Data Template für ein Produkt. Die Komposition ist verschachtelt: Ein Aufbau hat Schichten als Teile, und jede Schicht hat Produkte als Teile, beides ausgedrückt mit der HasPart-Beziehung der Norm. Ob eine Schicht eine eigene Vorlage braucht, um Dicke, Rolle oder Funktion zu tragen, ist eine offene Frage für die nächste Version.

![Links: Wall, Roof und Slab sind Arten von Buildup, einem System Data Template aus Schichten und Produkten, wobei jedes Produkt ein Product Data Template ist. Rechts: Eine Datenvorlage listet Merkmale, ein Anforderungsblatt verschärft sie zu geforderten Werten, und ein Datenblatt erfüllt sie mit deklarierten Werten.](/assets/content/research/timber-buildup-data-model/data-templates.svg "Komposition eines Aufbaus, und von der Vorlage zum Blatt")

Eine ganze Baugruppe als Datenvorlage zu modellieren ist noch selten; die meisten Wörterbücher hören bei einzelnen Produkten auf. Die Komposition zu kodieren ist der Schritt, den DOKwood weitergeht, und er ermöglicht die zweite Hälfte des Bildes. Das öffentliche Wörterbuch bietet die Merkmale und Klassen. Jedes Holzbauunternehmen stellt daraus eigene Datenvorlagen zusammen, etwa eine Schärholzbau-Außenwand, noch ohne Werte. In einem Projekt füllt ein Anforderungsblatt diese Vorlage mit den geforderten Werten (Rw mindestens 56 dB, REI 90) und ein Datenblatt mit den deklarierten oder gemessenen Werten (Rw = 59 dB). ISO 23387 selbst kennt nur die Datenvorlage und das Datenblatt und lässt ein Datenblatt sowohl eine Anforderung als auch ein Produkt darstellen; Anforderungsblatt ist DOKwoods Name für die erste Art, getrennt geführt, weil es ausgefüllt wird, bevor etwas gebaut ist. Eine einzige Schachtelungsregel hält die Kette zusammen: generisch enthält Anforderung enthält Wert. Das ausgefüllte Datenblatt eines gefertigten Aufbaus ist genau das, was ein digitaler Produktpass trägt.

![Drei Blätter mit denselben fünf Merkmalen: Die Datenvorlage lässt alle Werte leer, das Anforderungsblatt füllt sie mit geforderten Werten wie Rw mindestens 56 dB und REI 90, das Datenblatt mit deklarierten Werten wie Rw 59 dB; Pfeile mit tighten und satisfy verbinden sie.](/assets/content/research/timber-buildup-data-model/template-to-sheet.svg "Datenvorlage, Anforderungsblatt und Datenblatt")

## Wohin es geht

Das Ziel, das all das einrahmt, ist der digitale Produktpass, der unter der Bauprodukteverordnung von 2024 und der ESPR ab etwa 2028 für Bauprodukte verpflichtend wird. DOKwoods versionierte, bSDD-beschriebene Aufbauten sind die richtige Grundlage, und die Lückenanalyse, die ich hinterlassen habe, listet auf, was der Plattform noch fehlt: ein offenes Merkmalsmodell, in dem jeder Wert seine versionsgebundene bSDD-URI trägt, statt zweier fest verdrahteter physikalischer Größen; persistente Kennungen; ein schlanker JSON-LD-Export, wie ihn CIRPASS-2 empfiehlt; Lebenszyklusstufen von geplant bis gebaut; verifizierbare Zertifikate über die Klasse Document; und ein Datenträger am gefertigten Bauteil. Das meiste davon ist grundlegende Datenmodellarbeit, die sich unabhängig vom Pass auszahlt, denn es ist dieselbe Arbeit, die die Revit-, Cadwork- und MCP-Schnittstellen verlässlich macht.

![Ein ausgefülltes Datenblatt eines gefertigten Aufbaus mit Werten wie Rw 59 dB und REI 90 speist einen digitalen Produktpass, der diese Werte mit einer persistenten Kennung, versionsgebundenen bSDD-URIs an jedem Merkmal, einer Dokumentenspur aus Zertifikaten, Datenblättern und EPDs, einem Lebenszyklusstatus von geplant bis gebaut, einem Datenträger am Bauteil und einem JSON-LD-Export umhüllt.](/assets/content/research/timber-buildup-data-model/data-sheet-to-dpp.svg "Das Datenblatt speist den digitalen Produktpass")

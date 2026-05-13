URL: https://daniellocatelli.com/de/projects/radom-raisting-by-ar-ingenieure

# Radom Raisting von AR Ingenieure

Description: Simulation der Montagesequenz und Kollisionsvermeidung für ein aufblasbares Radom mit 48,8 m Durchmesser zum Schutz einer Parabolantenne an der Erdfunkstelle Raisting.
Tags: Computational Design, Structural Analysis, Logistics, Grasshopper3D
Category: Membrane
Director: Alexander Hub
Team: Daniel Nunes Locatelli, Grant Galloway
Client: ITF Technical Fabrics GmbH
Organization: AR Ingenieure
Location: Raisting
Date: March 2021 - May 2021
Link: https://www.ar-ingenieure.com/projects/radom-raisting

Die Erdfunkstelle Raisting in Bayern beherbergt mehrere große Parabolantennen für den Satellitenempfang. Eine davon benötigte eine Schutzhülle (ein Radom), um sie vor Wind, Regen und Schnee zu schützen. Der Auftraggeber, ITF Technical Fabrics, wandte sich mit der ingenieurtechnischen Herausforderung an AR Ingenieure: eine aufblasbare Membrankuppel zu entwerfen, die per Kran angeliefert und montiert werden kann, ohne mit der zu schützenden Antenne zu kollidieren.

## Die Herausforderung

Ein Radom dieser Größenordnung (48,8 Meter Durchmesser und 34 Meter Höhe) wird als pneumatisch vorgespannter Kugelmembranabschnitt konstruiert. Die Membran selbst wird aus mehreren zusammengenähten Bahnen gefertigt, gefaltet und zur Baustelle transportiert. Die entscheidende Frage war: Wie entfaltet man eine riesige Membran um eine empfindliche Antenne, ohne dass der Stoff an der Struktur hängen bleibt?

## Computational Design

Meine Aufgabe war es, die gesamte Montagesequenz mit Kangaroo Physics innerhalb der Rhino/Grasshopper-Umgebung zu simulieren. Die Simulation musste das Verhalten der Membran modellieren, während sie sich von einem kompakten Bündel in ihre endgültige Kugelform entfaltete, und dabei kontinuierlich Kollisionen mit der darunterliegenden Parabolantenne überprüfen.

Die Simulation wurde iterativ durchgeführt, wobei verschiedene Faltmuster und Montagegeschwindigkeiten getestet wurden, um eine Sequenz zu finden, die in jeder Phase einen Kontakt vermied. Die Echtzeit-Physik-Engine von Kangaroo war hierbei unverzichtbar: sie ermöglichte es mir, Parameter interaktiv anzupassen und die Auswirkungen auf das Membranverhalten sofort zu sehen.

## Montage vor Ort

Die eigentliche Montage war ein bemerkenswerter Vorgang. Die gefaltete Membran wurde vom Kran angehoben und über der Antenne aufgehängt. Beim Absenken entfalteten sich die Bahnen nacheinander, entsprechend dem Muster, das wir in der Simulation validiert hatten.

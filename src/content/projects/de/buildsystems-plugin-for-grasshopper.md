---
{
  "Cover": "/assets/content/projects/buildsystems-plugin-for-grasshopper/cover-cover.png",
  "CoverAlt": "Grasshopper-Plugin entwickelt für BuildSystems",
  "Description": "Plugin entwickelt für BuildSystems zur Erstellung von Baukomponenten auf Basis von Umweltproduktdeklarationen (EPDs). Die Idee war, Ökobilanz-Daten (LCA) bereits zu Beginn des Entwurfsprozesses bereitzustellen.",
  "Name": "BuildSystems-Plugin für Grasshopper",
  "Slug": "projects/buildsystems-plugin-for-grasshopper",
  "Tags": [
    "Software Development",
    "Grasshopper3D"
  ],
  "Authors": [
    "BuildSystems"
  ],
  "Category": "Software Development",
  "City": [],
  "DateStart": "2023-11-23",
  "Director": ["Martin Bittmann"],
  "Team": ["Daniel Locatelli", "Daniel Dieren"],
  "Link": [],
  "Place": "Online"
}
---

# C#-Plugin-Entwicklung
Es ist in der AEC-Branche allgemein bekannt, dass der Energieverbrauch über die gesamte Lebensdauer eines Gebäudes maßgeblich durch die Entscheidungen in den frühesten Entwurfsphasen beeinflusst wird. Aus diesem Grund wollte BuildSystems Umweltproduktdeklarationsdaten (EPD-Daten) direkt den Planern und Architekten über ihre bevorzugten Werkzeuge zur Verfügung stellen: Rhino und Grasshopper.
Das Plugin nutzt [Rhino.Inside](https://www.rhino3d.com/inside/), um Grasshopper-Komponenten in Revit einzubinden, wobei jede Komponente ein Bauelement mit den zugehörigen Ökobilanz-Daten aus einer EPD darstellt.
![Screenshot des Grasshopper-Plugins mit verschiedenen Baukomponenten.
BuildSystems-Plugin für Grasshopper.](../../../assets/content/projects/buildsystems-plugin-for-grasshopper/block-1f1bf53b-9ce3-80d3-b12f-e2eedb7a3eae.png)
# Technische Herausforderungen
Die größte Herausforderung bestand in der Einarbeitung in die C#-Entwicklungsumgebung in Visual Studio für die Grasshopper-Plugin-Entwicklung. Darüber hinaus führte der Übergang von .NET Framework zu .NET Core zu Kompatibilitätsproblemen, die einen Multi-Targeting-Ansatz erforderten.
Leider musste BuildSystems das Plugin-Projekt 2024 aufgrund der wirtschaftlichen Lage im deutschen Bausektor einstellen.

import type { I18nHome } from "./types";
import buildSystemsCalculator from "@/assets/homepage/iphone-pro-calculator-mockup-2.png";
import buildSystemsPluginCover from "@/assets/homepage/grasshopper-macbook.png";
import artEngineeringCommonSkies from "@/assets/homepage/common-sky-01.jpg";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Willkommen in meinem digitalen Büro. Hier finden Sie meine Arbeit, Forschung und Lehre zu Computational Design und Softwareentwicklung für die AEC-Branche.",
    coverAlt: "Daniel Locatelli.",
  },
  hero: {
    id: "hero",
    hi: "Hallo,",
    greeting: "Ich bin Daniel Locatelli",
    title: "Doktorand an der ETH Zürich",
    description:
      "Ich&nbsp;bin Doktorand bei Gramazio Kohler Research an der ETH Zürich und forsche zu Computational Design-to-Fabrication für Holzplatten-Bausysteme. Mein Hintergrund umfasst Plugins, Webanwendungen und Computational-Design-Lösungen für Architektur, Ingenieur- und Bauwesen (AEC).",
    requestQuote: "Angebot anfordern",
    sendEmail: "E-Mail senden",
    chat: {
      initialMessage:
        "Hallo! Frag mich alles über meine Arbeit, Erfahrung oder Projekte.\n\n*Bitte beachte: Die Antworten werden von KI (Anthropic Claude) generiert und können Ungenauigkeiten enthalten. Dieser Chat stellt keine professionelle, rechtliche oder technische Beratung dar. Bitte überprüfe alle Informationen eigenständig.*",
      inputPlaceholder: "Frag mich etwas...",
      headerTitle: "KI-Assistent",
      poweredBy: "Unterstützt von",
      errorMessage:
        "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuch es später noch einmal.",
    },
  },
  service: {
    id: "services",
    title: "Meine Dienstleistungen",
    list: [
      {
        title: "Plugin-Entwicklung",
        description:
          "Maßgeschneiderte Tools zur Automatisierung von Aufgaben, Integration spezialisierter Analysen oder Erweiterung von Softwarefunktionen. Experte in C# für Rhino/Grasshopper, Revit und AutoCAD.",
        icon: "ph:puzzle-piece",
      },
      {
        title: "Webanwendungen",
        description:
          "Webbasierte Lösungen für Projektmanagement, kollaborative Tools, Finanzsimulatoren und 3D-Visualisierung. Fokus auf React, Astro und PostgreSQL.",
        icon: "ph:cursor-click",
      },
      {
        title: "Computergestütztes Design",
        description:
          "Anwendung fortschrittlicher computergestützter Designstrategien zur Optimierung und Verbesserung von AEC-Prozessen, Steigerung der Effizienz in Planung, Analyse und Dokumentation.",
        icon: "ph:buildings",
      },
      {
        title: "Datenvisualisierung",
        description:
          "Erstellung von Dashboards zum besseren Verständnis, zur Interpretation und zum Handeln auf Basis komplexer Projektdaten. Von webnativen Dashboards bis hin zu Power BI-Frameworks für Unternehmen.",
        icon: "ph:chart-line-up",
      },
      {
        title: "Digitale Fabrikation",
        description:
          "Erstellung von Grasshopper-Skripten zur automatischen Extraktion von Fertigungsdaten aus komplexen, parametrischen 3D-Designs für die digitale Fabrikation.",
        icon: "ph:resize",
      },
    ],
  },
  about: {
    id: "about",
    title: "Architekt + Programmierer",
    background:
      "Mit einem Hintergrund in Architektur und einem Master of Science aus dem ITECH-Programm an der Universität Stuttgart, gepaart mit zehn Jahren Erfahrung in der computergestützten Planung in deutschen Ingenieurbüros, verfüge ich über ein tiefes Verständnis für AEC-Herausforderungen.",
    approach:
      "Ich schreibe nicht nur Code; ich entwerfe und baue Softwarelösungen, die auf die Bedürfnisse von Architekten, Ingenieuren und Baufachleuten zugeschnitten sind, weil ich Ihre Welt verstehe.",
  },
  projects: {
    id: "projects",
    title: "Portfolio-Highlights",
    list: [
      {
        title: "BuildSystems Förderrechner",
        context: "BuildSystems GmbH",
        contextLink: "https://buildsystems.de",
        description:
          "Webanwendung mit benutzerfreundlichen Formularen und interaktiven Diagrammen zur Simulation von Förderszenarien für den Wohnungsbau durch die KfW.",
        technologies:
          "TypeScript, Angular, ng2-charts, Supabase, PostgreSQL, HTML, CSS.",

        imageUrl: buildSystemsCalculator,
        internalLink: "/projects/kfw-funding-calculator-by-buildsystems",
      },
      {
        title: "BuildSystems Plugin für Grasshopper/Rhino3D",
        context: "BuildSystems GmbH",
        contextLink: "https://buildsystems.de",
        description:
          "Grasshopper-Plugin, das es Planern ermöglicht, kritische Machbarkeits- und Nachhaltigkeitsanalysen direkt in ihrer Entwurfsumgebung durchzuführen und so eine fundierte Entscheidungsfindung zu fördern.",
        technologies: "C#, RhinoCommon, Grasshopper API, JSON.",
        imageUrl: buildSystemsPluginCover,
        internalLink: "/projects/buildsystems-plugin-for-grasshopper",
      },
      {
        title: "Datenextraktion für die digitale Fertigung",
        context: "ArtEngineering GmbH",
        contextLink: "https://art-engineering.net",
        description:
          "Unterstützung bei der digitalen Fertigung von Common Sky unter Verwendung von Grasshopper und Sandbox Topology. Fokus auf Geometrieverarbeitung und Automatisierung von Fertigungsabläufen.",
        technologies: "Scripting in Grasshopper/Rhino3D.",
        imageUrl: artEngineeringCommonSkies,
        internalLink:
          "/projects/common-sky-by-artengineering-for-studio-other-spaces",
      },
    ],
    tech: "Technik:",
    viewFullArticle: "Vollständigen Artikel ansehen",
  },
  testimonials: {
    id: "testimonials",
    title: "Empfehlungen",
    list: [
      {
        text: "Herr Locatelli hat die ihm übertragenen Aufgaben stets zu unserer vollsten Zufriedenheit erledigt und unsere Erwartungen in vielerlei Hinsicht erfüllt und übertroffen.",
        author: "Martin Bittmann",
        context: "BuildSystems GmbH",
        position: "Gründer",
        contextLink: "https://buildsystems.de",
      },
      {
        text: "Herrn Locatellis professionelles Verhalten war vorbildlich. Er bewies stets eine Kombination aus technischer Brillanz, strategischem Denken und zwischenmenschlichem Geschick. Seine Fähigkeit, sich nahtlos in die Teamdynamik zu integrieren und dabei höchste Standards an professioneller Exzellenz aufrechtzuerhalten, machte ihn zu einem unschätzbaren Teammitglied.",
        author: "Herwig Bretis",
        context: "ArtEngineering GmbH",
        position: "Geschäftsführer und Inhaber",
        contextLink:
          "https://art-engineering.net/index.php/ge/cv_herwig_bretis",
      },
    ],
  },
  expertise: {
    id: "expertise",
    title: "Wissenskarte",
    description:
      "Ich lerne ständig die neuesten Tools, um sicherzustellen, dass ich für jede Aufgabe das richtige System baue.",
  },
  contact: {
    id: "contact",
    title: "Bereit, Ihre AEC-Projekte aufzuwerten?",
    description:
      "Lassen Sie uns besprechen, wie meine Expertise Ihre Herausforderungen in innovative Softwarelösungen verwandeln kann.",
    letsTalk: "Lassen Sie uns reden",
    sendEmail: "E-Mail senden",
  },
};

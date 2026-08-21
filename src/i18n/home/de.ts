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
    title: "Doktorand, ETH Zürich",
    description:
      "Ich&nbsp;bin Doktorand bei Gramazio Kohler Research an der ETH Zürich und forsche zu Computational Design-to-Fabrication für Holzplatten-Bausysteme und dazu, wie KI den Entwurfsprozess unterstützen kann. Mein Hintergrund umfasst Plugins, Webanwendungen und Computational-Design-Lösungen für Architektur, Ingenieur- und Bauwesen (AEC).",
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
        imageAlt:
          "Common-Sky-Installation von Studio Other Spaces: ein geodätisches Glas- und Spiegeldach über dem Atrium des Buffalo AKG Art Museum",
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
    tools: {
      autocad:
        "Das Standardwerkzeug von Autodesk für technisches Zeichnen in 2D/3D. Ich entwickle AutoCAD-Plugins (C#/.NET), die wiederkehrende Zeichenarbeit automatisieren.",
      civil3d:
        "AutoCAD mit parametrischen Werkzeugen für die Infrastrukturplanung. Ich entwickle Civil-3D-Plugins, die Geländemodellierung und Planerstellung automatisieren.",
      revit:
        "Das BIM-Werkzeug von Autodesk. Certified Professional seit 2014; ich entwickle Revit-Add-ins (C#/.NET) für Modellierungsautomatisierung und Datenaustausch, etwa den [DOKwood](/projects/dokwood)-Importer.",
      dynamo:
        "Visuelle Programmierung für Revit. Ich nutze es für Stapeländerungen, Parameter-Mapping und Modellprüfungen, die von Hand mühsam wären.",
      grasshopper:
        "Visuelle Programmierung für Rhino, meine wichtigste Entwurfsumgebung seit 2015. Ich baue Formfindungs-Workflows, Fertigungsdaten und [C#-Plugins](/projects/buildsystems-plugin-for-grasshopper) und [unterrichte das Werkzeug](/teaching/adaptive-grasshopper-workshop).",
      kangaroo:
        "Physik-Engine für Grasshopper. Ich nutze sie zur Formfindung von Membranen und Netzen, etwa bei [Canyon](/projects/canyon-by-artengineering-for-katharina-grosse) und [Radom Raisting](/projects/radom-raisting-by-ar-ingenieure).",
      galapagos:
        "In Grasshopper eingebauter evolutionärer Solver. Ich nutze ihn zur Optimierung, etwa für die kollisionsfreie Anordnung hängender Kugeln bei [Parada Coca-Cola](/projects/parada-coca-cola-by-atelier-marko-brajovic) und [Klöppelspitzenmuster](/publications/algorithmic-design-for-traditional-bobbin-lace-methods).",
      weaverbird:
        "Netzunterteilung und -glättung für Grasshopper. Ich nutze es für organische Geometrien, etwa bei [Models by Nature](/teaching/models-bynature-20) und in meiner [Biomimetik-Forschung](/research/architecture-biomimicry-algorithm).",
      ladybug:
        "Umweltanalysen (Sonne, Strahlung, Tageslicht) für Grasshopper. Ich nutze es für frühe Entwurfsstudien und in der [Lehre](/teaching/a-decade-after-unemat).",
      culebra:
        "Multiagenten-Verhalten für Grasshopper. Genutzt für die [Life Lamp](/projects/life-lamp-by-estudio-guto-requena-for-decimal), bei der Emotionen das Wachstum der Leuchte steuern.",
      karamba:
        "Parametrische Tragwerksanalyse für Grasshopper. Ich nutze es für schnelle Biege- und Knickprüfungen, etwa in [Building Across Scales](/research/building-across-scales).",
      python:
        "Meine Sprache für Skripte und Forschung. Grasshopper-Komponenten, COMPAS an der ETH, ein Cadwork-Plugin für [DOKwood](/projects/dokwood) und Datenpipelines.",
      csharp:
        "Meine Sprache für AEC-Plugins. Das [BuildSystems-Grasshopper-Plugin](/projects/buildsystems-plugin-for-grasshopper), das [DOKwood](/projects/dokwood)-Revit-Add-in und die Datenmodelle dahinter.",
      html: "Das Gerüst jeder Website, die ich ausliefere. Semantisch geschrieben, damit Seiten zugänglich und für Agenten lesbar bleiben, wie auf [dieser Website](/projects/portfolio-website).",
      css: "Tailwind für die meisten Layouts, handgeschriebenes CSS, wo es zählt. Typografie, Druckstile und die Animationen [dieser Website](/projects/portfolio-website).",
      typescript:
        "Meine tägliche Sprache für das Web. [Diese Website](/projects/portfolio-website), die [BuildSystems-Website](/projects/buildsystems-website) und der [Förderrechner](/projects/kfw-funding-calculator-by-buildsystems).",
      flask:
        "Leichtgewichtiges Python-Webframework. Ich nutze es für kleine APIs und Prototypen, die Forschungs- oder Grasshopper-Logik über HTTP bereitstellen.",
      tanstack:
        "Full-Stack-React-Framework (Start, Query, Router). Ich nutze es für Apps, die typsicheres Laden von Daten brauchen.",
      astro:
        "Content-orientiertes Webframework. [Dieses Portfolio](/projects/portfolio-website) und die [BuildSystems-Website](/projects/buildsystems-website), mit Notion als CMS.",
      react:
        "UI-Bibliothek für interaktive Oberflächen. Der KI-Chat auf [dieser Website](/projects/portfolio-website) und die Web-Apps, die ich für Kunden baue.",
      mongodb:
        "Dokumentendatenbank. Ich nutze sie für Prototypen und Werkzeuge mit flexiblen, verschachtelten Daten.",
      sqlite:
        "Eingebettete SQL-Datenbank. Ich nutze sie für lokale Werkzeuge, Tests und kleine Forschungsdatensätze.",
      postgresql:
        "Meine wichtigste relationale Datenbank. Supabase hinter dem [Förderrechner](/projects/kfw-funding-calculator-by-buildsystems) und dem Vektorspeicher des [KI-Chats dieser Website](/projects/portfolio-website).",
    },
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

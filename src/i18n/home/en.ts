import type { I18nHome } from "./types";
import buildSystemsCalculator from "@/assets/mockups/iphone-pro-calculator-mockup-2.png";
import buildSystemsPluginCover from "@/assets/mockups/grasshopper-macbook.png";
import artEngineeringCommonSkies from "@/assets/images/common-sky-01.jpg";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Welcome to my digital office. Here, you will find my work, research, and teachings on computational design, and software development for the AEC industry.",
    coverAlt: "Daniel Locatelli's profile photo.",
  },
  hero: {
    id: "hero",
    hi: "Hi,",
    greeting: "I'm Daniel Locatelli",
    title: "AEC Software Engineer",
    description:
      "I&nbsp;am a generalist. I develop plugins, web applications, and computational design solutions for architecture, engineering, and construction (AEC).",
    requestQuote: "Request a quote",
    sendEmail: "Send an Email",
    chat: {
      initialMessage:
        "Hi! Ask me anything related to my work, experience, or projects.",
      inputPlaceholder: "Ask me something...",
      headerTitle: "AI Assistant",
      poweredBy: "Powered by",
      errorMessage: "Sorry, I encountered an error. Please try again later.",
    },
  },
  service: {
    id: "services",
    title: "My Service Offerings",
    list: [
      {
        title: "Plugin Development",
        description:
          "Bespoke tools to automate tasks, integrate specialized analyses, or extend a software capability. Expert in C# for Rhino/Grasshopper, Revit and AutoCAD.",
        icon: "ph:puzzle-piece",
      },
      {
        title: "Web Applications",
        description:
          "Web-based solutions for project management, collaborative tools, financial simulators and 3D visualization. Focused in React, Astro and PostgreSQL.",
        icon: "ph:cursor-click",
      },
      {
        title: "Computational Design",
        description:
          "Applying advanced computational design strategies to streamline and enhance AEC processes, improving efficiency in design, analysis, and documentation.",
        icon: "ph:buildings",
      },
      {
        title: "Data Visualization",
        description:
          "Creating dashboards to better understand, interpret, and act upon complex project data. From web-native dashboards to enterprise Power BI frameworks. ",
        icon: "ph:chart-line-up",
      },
      {
        title: "Digital Fabrication",
        description:
          "Creating Grasshopper scripts to automatically extract manufacturing data from complex, parametric 3D designs for digital fabrication.",
        icon: "ph:resize",
      },
    ],
  },
  about: {
    id: "about",
    title: "Architect + Programmer",
    background:
      "With a background in architecture and a Master of Science from the ITECH program at the University of Stuttgart, coupled with ten years' experience that encompassed computational design at German engineering offices, I possess a deep understanding of AEC challenges.",
    approach:
      "I don't just write code; I design and build software solutions that are tailored to the needs of architects, engineers, and construction professionals because I understand your world.",
  },
  projects: {
    id: "projects",
    title: "Portfolio Highlights",
    list: [
      {
        title: "BuildSystems Funding Calculator",
        context: "BuildSystems GmbH",
        contextLink: "https://buildsystems.de",
        description:
          "Web application with user-friendly forms and interactive charts for simulating funding scenarios for housing through the national German bank KfW.",
        technologies:
          "TypeScript, Angular, ng2-charts, Supabase, PostgreSQL, HTML, CSS.",

        imageUrl: buildSystemsCalculator,
        internalLink: "/projects/kfw-funding-calculator-by-buildsystems",
      },
      {
        title: "BuildSystems Plugin for Grasshopper/Rhino3D",
        context: "BuildSystems GmbH",
        contextLink: "https://buildsystems.de",
        description:
          "Grasshopper plugin that enables designers to perform critical feasibility and sustainability analyses directly within their design environment, promoting informed decision-making.",
        technologies: "C#, RhinoCommon, Grasshopper API, JSON.",
        imageUrl: buildSystemsPluginCover,
        internalLink: "/projects/buildsystems-plugin-for-grasshopper",
      },
      {
        title: "Data Extraction for Digital Fabrication",
        context: "ArtEngineering GmbH",
        contextLink: "https://art-engineering.net",
        description:
          "Support on the digital fabrication of Common Sky using Grasshopper and Sandbox Topology. Focused on geometry processing and automation of fabrication workflows.",
        technologies: "Scripting in Grasshopper/Rhino3D.",
        imageUrl: artEngineeringCommonSkies,
        internalLink:
          "/projects/common-sky-by-artengineering-for-studio-other-spaces",
      },
    ],
    tech: "Tech:",
    viewFullArticle: "View the full article",
  },
  testimonials: {
    id: "testimonials",
    title: "Recommendations",
    list: [
      {
        text: "Mr. Locatelli has always performed the tasks assigned to him to our complete satisfaction, meeting and, in many respects, exceeding our expectations.",
        author: "Martin Bittmann",
        context: "BuildSystems GmbH",
        position: "Founder",
        contextLink: "https://buildsystems.de",
      },
      {
        text: "Mr. Locatelli's professional conduct was exemplary. He consistently displayed a combination of technical brilliance, strategic thinking, and interpersonal skill. His ability to integrate seamlessly into team dynamics while maintaining the highest standards of professional excellence made him an invaluable team member.",
        author: "Herwig Bretis",
        context: "ArtEngineering GmbH",
        position: "Managing director and proprietor",
        contextLink:
          "https://art-engineering.net/index.php/ge/cv_herwig_bretis",
      },
    ],
  },
  expertise: {
    id: "expertise",
    title: "Map of Knowledge",
    description:
      "I’m constantly learning the latest tools to ensure I’m building the right system for each task.",
  },
  contact: {
    id: "contact",
    title: "Ready to elevate your AEC projects?",
    description:
      "Let's discuss how my expertise can transform your challenges into innovative software solutions.",
    letsTalk: "Let's Talk",
    sendEmail: "Send an Email",
  },
};

import {
  db,
  Experience,
  ExperienceTask,
  SkillDatabases,
  SkillDesign,
  SkillFrameworks,
  SkillProgramming,
  SkillSpecialized,
  Summary,
} from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Summary).values([
    {
      text: "Software developer with a robust interdisciplinary background spanning architectural design, computational technologies, and software engineering. Proven track record of bridging creative and technical domains, with expertise in web development, algorithmic design, and data visualization. Multilingual professional fluent in English, intermediate German and native Portuguese, passionate about leveraging interdisciplinary skills to solve complex problems through technology.",
      locale: "en",
    },
    {
      text: "Desenvolvedor de software com sólida formação interdisciplinar abrangendo design arquitetônico, tecnologias computacionais e engenharia de software. Histórico comprovado de unir domínios criativos e técnicos, com expertise em desenvolvimento web, design algorítmico e visualização de dados. Profissional multilíngue fluente em inglês, alemão intermediário e português nativo, apaixonado por resolver problemas complexos por meio da tecnologia.",
      locale: "pt",
    },
  ]);

  await db.insert(SkillProgramming).values([
    { id: 1, name: "HTML", level: "Advanced", locale: "en" },
    { id: 2, name: "CSS", level: "Advanced", locale: "en" },
    { id: 3, name: "JavaScript", level: "Advanced", locale: "en" },
    { id: 4, name: "Python", level: "Intermediate", locale: "en" },
    { id: 5, name: "C#", level: "Intermediate", locale: "en" },
  ]);

  await db.insert(SkillFrameworks).values([
    { id: 1, name: "Astro", level: "Advanced", locale: "en" },
    { id: 2, name: "React", level: "Advanced", locale: "en" },
    { id: 3, name: "Angular", level: "Advanced", locale: "en" },
  ]);

  await db.insert(SkillDatabases).values([
    { id: 1, name: "SQLite", level: "Intermediate", locale: "en" },
    { id: 2, name: "PostgreSQL", level: "Intermediate", locale: "en" },
    { id: 3, name: "NoSQL", level: "Intermediate", locale: "en" },
  ]);

  await db.insert(SkillDesign).values([
    {
      id: 1,
      name: "Rhino",
      level: "Advanced",
      locale: "en",
    },
    {
      id: 2,
      name: "Grasshopper",
      level: "Advanced",
      locale: "en",
    },
    { id: 3, name: "Revit", level: "Advanced", locale: "en" },
    {
      id: 4,
      name: "Figma",
      level: "Intermediate",
      locale: "en",
    },
    { id: 5, name: "Adobe Creative Cloud", level: "Advanced", locale: "en" },
  ]);

  await db.insert(SkillSpecialized).values([
    { id: 1, name: "Web Development", locale: "en" },
    { id: 2, name: "Computational Design", locale: "en" },
    { id: 3, name: "UI/UX Design", locale: "en" },
  ]);

  await db.insert(Experience).values([
    {
      id: "BS",
      locale: "en",
      dateIn: new Date("2024-01"),
      dateOut: new Date("2024-12"),
      title: "Software Developer",
      company: "BuildSystems GmbH",
      companyNote: "Previously the startup Urban Scale Timber",
      location: "Munich, Germany",
    },
    {
      id: "UST",
      locale: "en",
      dateIn: new Date("2023-1"),
      dateOut: new Date("2023-12"),
      title: "Computational Architect",
      company: "Urban Scale Timber, Flügge Funding",
      companyNote: "The startup is now BuildSystems GmbH",
      location: "Munich, Germany",
    },
    {
      id: "AE",
      locale: "en",
      dateIn: new Date("2021-12"),
      dateOut: new Date("2022-12"),
      title: "Computational Architect",
      company: "ArtEngineering GmbH",
      location: "Schorndorf, Germany",
    },
    {
      id: "AR",
      locale: "en",
      dateIn: new Date("2020-10"),
      dateOut: new Date("2021-11"),
      title: "Computational Architect",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Stuttgart, Germany",
    },
    {
      id: "ICD/ITKE",
      locale: "en",
      dateIn: new Date("2019-12"),
      dateOut: new Date("2020-10"),
      title: "Research Assistant",
      company: "ICD/ITKE University of Stuttgart",
      location: "Stuttgart, Germany",
    },
    {
      id: "AMB",
      locale: "en",
      dateIn: new Date("2015-3"),
      dateOut: new Date("2019-7"),
      title: "Computational Architect",
      titleNote: "Intern until December 2016",
      company: "Atelier Marko Brajovic",
      location: "São Paulo, Brazil",
    },
    {
      id: "CSULB",
      locale: "en",
      dateIn: new Date("2014-6"),
      dateOut: new Date("2014-8"),
      title: "On-the-job Training",
      company: "California State University Long Beach",
      location: "Long Beach, USA",
    },
    {
      id: "ICBUSP",
      locale: "en",
      dateIn: new Date("2011-6"),
      dateOut: new Date("2013-8"),
      title: "Graphic Designer",
      company: "Biomedical Science Institute - University of São Paulo",
      location: "Brazil",
    },
  ]);
  await db.insert(ExperienceTask).values([
    {
      id: "BS1",
      experienceId: "BS",
      locale: "en",
      text: "Developed a Funding Calculator for new constructions and renovations in Germany. The web app was built with the Angular framework and PostgreSQL. It delivers a seamless UX and provide real-time financial modeling capabilities.",
    },
    {
      id: "BS2",
      experienceId: "BS",
      locale: "en",
      text: "Architected and implemented BuildSystems' website using Astro framework, leveraging Notion API to use Notion as a content management system (CMS).",
    },
    {
      id: "UST1",
      experienceId: "UST",
      locale: "en",
      text: "Developed a specialized toolbox in C# for Grasshopper in conjunction with an object model (schema) and ontology.",
    },
    {
      id: "UST2",
      experienceId: "UST",
      locale: "en",
      text: "UI/UX prototype for the web app Circular Component Creator.",
    },
    {
      id: "UST3",
      experienceId: "UST",
      locale: "en",
      text: "Created data visualizations using Power BI for decision-making.",
    },
    {
      id: "UST4",
      experienceId: "UST",
      locale: "en",
      text: "Development of a timber component configurator with EPD data.",
    },
    {
      id: "UST5",
      experienceId: "UST",
      locale: "en",
      text: "Development of a configurator to create building envelopes.",
    },
    {
      id: "UST6",
      experienceId: "UST",
      locale: "en",
      text: "Improvements on their early building configurator.",
    },
    {
      id: "AE1",
      experienceId: "AE",
      locale: "en",
      text: "Conducted algorithmic modeling and structural analysis of complex spatial structures and artworks.",
    },
    {
      id: "AE2",
      experienceId: "AE",
      locale: "en",
      text: "Developed design-to-production automated workflows.",
    },
    {
      id: "AE3",
      experienceId: "AE",
      locale: "en",
      text: "Aiding on structural analysis of complex spatial structures.",
    },
    {
      id: "AE4",
      experienceId: "AE",
      locale: "en",
      text: "Preparing meticulous technical documentation.",
    },
    {
      id: "AE5",
      experienceId: "AE",
      locale: "en",
      text: "Creating precise engineering drawings and production plans.",
    },
    {
      id: "AR1",
      experienceId: "AR",
      locale: "en",
      text: "Received honorable mention in the competition 'Witterungsschutz Römermauer' from the city of Wiesbaden.",
    },
    {
      id: "AR2",
      experienceId: "AR",
      locale: "en",
      text: "Specialized in computational form finding of tensile structures.",
    },
    {
      id: "AR3",
      experienceId: "AR",
      locale: "en",
      text: "Simulated the deployment of a innovative inflatable membrane structure.",
    },
    {
      id: "AR4",
      experienceId: "AR",
      locale: "en",
      text: "Development of an automatized cutting pattern workflow for membranes.",
    },
  ]);
}

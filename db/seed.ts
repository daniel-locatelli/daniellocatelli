import {
  db,
  Education,
  Experience,
  ExperienceItems,
  Person,
  PersonToPublications,
  Publications,
  Scholarships,
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

  await db.insert(ExperienceItems).values([
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
    {
      id: "ICD/ITKE1",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Conducted natural fiber structural tests with Marta Gil Pérez.",
    },
    {
      id: "ICD/ITKE2",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Carbon fiber winding research of Christoph Schlopschnat.",
    },
    {
      id: "ICD/ITKE3",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Contributed to the computational design of a self-curving timber tower with Dylan Wood (similar to Urbach Tower).",
    },
    {
      id: "ICD/ITKE4",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Assisted the ICD website migration with Tobias Schwinn.",
    },
    {
      id: "AMB1",
      experienceId: "AMB",
      locale: "en",
      text: "Executed CAD, BIM, and algorithmic modeling for diverse architectural projects.",
    },
    {
      id: "AMB2",
      experienceId: "AMB",
      locale: "en",
      text: "Managed project communications and supplier relationships.",
    },
    {
      id: "AMB3",
      experienceId: "AMB",
      locale: "en",
      text: "Developed conceptual designs and high-quality renderings.",
    },
    {
      id: "AMB4",
      experienceId: "AMB",
      locale: "en",
      text: "Led prototyping and digital fabrication initiatives.",
    },
    {
      id: "CSULB1",
      experienceId: "CSULB",
      locale: "en",
      text: "Gained hands-on experience in project management.",
    },
    {
      id: "CSULB2",
      experienceId: "CSULB",
      locale: "en",
      text: "Conducted construction site inspections.",
    },
    {
      id: "CSULB3",
      experienceId: "CSULB",
      locale: "en",
      text: "Gained BIM modeling skills.",
    },
    {
      id: "CSULB4",
      experienceId: "CSULB",
      locale: "en",
      text: "Completed Safety and Health Training.",
    },
    {
      id: "ICBUSP1",
      experienceId: "ICBUSP",
      locale: "en",
      text: "Created conceptual designs for scientific communications.",
    },
    {
      id: "ICBUSP2",
      experienceId: "ICBUSP",
      locale: "en",
      text: "Managed design project workflows.",
    },
    {
      id: "ICBUSP3",
      experienceId: "ICBUSP",
      locale: "en",
      text: "Organized and supported academic competition preparations.",
    },
  ]);

  await db.insert(Education).values([
    {
      id: "ITECH",
      locale: "en",
      dateIn: new Date("2019-10"),
      dateOut: new Date("2021-10"),
      title: "Master of Sciences",
      institution: "ITECH University of Stuttgart",
      location: "Stuttgart, Germany",
    },
    {
      id: "FAUUSP",
      locale: "en",
      dateIn: new Date("2010-01"),
      dateOut: new Date("2016-12"),
      title: "Bachelor of Architecture and Urbanism",
      institution: "FAUUSP",
      location: "São Paulo, Brazil",
    },
    {
      id: "AU/CADC",
      locale: "en",
      dateIn: new Date("2014-01"),
      dateOut: new Date("2014-12"),
      title: "Architecture Exchange Student",
      institution: "Auburn University – CADC",
      location: "Auburn, USA",
    },
    {
      id: "AU/IEP",
      locale: "en",
      dateIn: new Date("2013-08"),
      dateOut: new Date("2013-12"),
      title: "Intensive English Program",
      institution: "Auburn University",
      location: "Auburn, USA",
    },
  ]);

  await db.insert(ExperienceItems).values([
    {
      id: "ITECH1",
      experienceId: "ITECH",
      locale: "en",
      text: "Thesis: Building Across Scales: A Robotic Timber Fabrication System for On-Site Press Gluing",
    },
    {
      id: "ITECH2",
      experienceId: "ITECH",
      locale: "en",
      text: "Supervisors: Prof. Achim Menges, Prof. Jan Knippers",
    },
    {
      id: "FAUUSP1",
      experienceId: "FAUUSP",
      locale: "en",
      text: "Thesis: Architecture + Biomimetics + Algorithm",
    },
    {
      id: "FAUUSP2",
      experienceId: "FAUUSP",
      locale: "en",
      text: "Supervisor: Prof. Arthur Lara",
    },
  ]);

  await db.insert(Scholarships).values([
    {
      id: "IntCDC",
      locale: "en",
      dateIn: new Date("2021-03"),
      dateOut: new Date("2021-10"),
      title: "IntCDC Master’s Thesis Grant 2021",
      institution: "Cluster of Excellence – IntCDC",
      description:
        "The Grant encourages excellent master’s students to realize a first step toward a prospective academic career.",
    },
    {
      id: "CsF",
      locale: "en",
      dateIn: new Date("2013-08"),
      dateOut: new Date("2014-12"),
      title: "Science without Borders",
      institution: "Brazilian Federal Government",
      description:
        "Fully funded scholarships for the top Brazilian students. One year at Auburn University, USA.",
    },
  ]);

  await db.insert(Publications).values([
    {
      id: "ACJ2024",
      locale: "en",
      date: new Date("2024-09"),
      title:
        "Multi-scalar robotic fabrication system for on-site press gluing in multi-storey timber buildings",
      publisher: "Automation in Construction journal",
    },
    {
      id: "CDRF2023",
      locale: "en",
      date: new Date("2023-06"),
      title:
        "Feedback-Based Design Method for Spatially-Informed and Structurally-Performative Column Placement in Multi-Story Construction",
      publisher: "CDRF 2023",
      location: "Beijing, China",
    },
    {
      id: "ECAADE2020",
      locale: "en",
      date: new Date("2020-06"),
      title: "Life Lamp: Connecting Design and People Through Emotion",
      publisher: "ECAADE 2020 Anthropologic",
      location: "Berlin, Germany",
    },
    {
      id: "CDS",
      locale: "en",
      date: new Date("2020-02"),
      title: "Computational Design Strategies",
      publisher: "Self-published",
    },
    {
      id: "SiGradi2018",
      locale: "en",
      date: new Date("2018-11"),
      title: "Computational Design Strategies",
      publisher: "SiGradi 2018 Technopolitics",
      location: "São Carlos, Brazil",
    },
    {
      id: "IASS2017",
      locale: "en",
      date: new Date("2017-09"),
      title: "Algorithmic design for traditional bobbin lace methods",
      publisher: "IASS 2017",
      location: "Hamburg, Germany",
    },
  ]);

  await db
    .insert(Person)
    .values([
      { id: "Daniel Nunes Locatelli" },
      { id: "Nils Opgenorth" },
      { id: "Samuel Leder" },
      { id: "Hans Jakob Wagner" },
      { id: "Achim Menges" },
      { id: "Ekin Sila Sahin" },
      { id: "Luis Orozco" },
      { id: "Anna Krtschil" },
      { id: "Hans Jakob Wagner" },
      { id: "Jan Knippers" },
      { id: "Leonardo Prazeres" },
      { id: "Guilherme Giantini" },
      { id: "Vitor Curti" },
      { id: "Carlos Augusto Requena" },
      { id: "Arthur Hunold Lara" },
      { id: "Ruy Marcelo de Oliveira Pauletti" },
      { id: "Thiago H Omena" },
      { id: "Adalberto de Paula" },
    ]);

  await db.insert(PersonToPublications).values([
    { publication: "ACJ2024", author: "Nils Opgenorth", order: 1 },
    { publication: "ACJ2024", author: "Daniel Nunes Locatelli", order: 2 },
    { publication: "ACJ2024", author: "Samuel Leder", order: 3 },
    { publication: "ACJ2024", author: "Hans Jakob Wagner", order: 4 },
    { publication: "ACJ2024", author: "Achim Menges", order: 5 },
  ]);
}

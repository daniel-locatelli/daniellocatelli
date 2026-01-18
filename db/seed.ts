import {
  Certifications,
  CertificationsTranslations,
  CoursesAttended,
  db,
  Education,
  EducationItems,
  Experience,
  ExperienceTranslations,
  ExperienceItems,
  Person,
  PersonToPublications,
  Publications,
  Quote,
  Scholarships,
  SkillDatabases,
  SkillDatabasesTranslations,
  SkillDesign,
  SkillDesignTranslations,
  SkillFrameworks,
  SkillFrameworksTranslations,
  SkillProgramming,
  SkillProgrammingTranslations,
  SkillSpecialized,
  SkillSpecializedTranslations,
  Summary,
  TalksAndLectures,
  Tutoring,
  EducatonTranslations,
  ScholarshipsTranslations,
  PublicationsTranslations,
  TutoringTranslations,
  CoursesAttendedTranslations,
  TalksAndLecturesTranslations,
  Works,
  WorksTranslations,
} from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  
  await db.insert(Quote).values([
    {
      text: "Architecture is inherently transdisciplinary. Its future depends on using computational co-design with vernacular materials to create circular construction systems.",
      locale: "en",
    },
    {
      text: "A arquitetura é inerentemente transdisciplinar. Seu futuro depende da aplicação do co-design computacional a materiais vernaculares para criar sistemas construtivos circulares.",
      locale: "pt",
    },
  ]);

  await db.insert(Summary).values([
    {
      text: "Software engineer and computational design researcher specializing in timber construction. Expertise in bridging design and engineering through C#/.NET, Python. M.Sc. from ITECH (University of Stuttgart) with a focus on multi-scalar robotic systems for engineered timber. Trilingual professional (English, German, and Portuguese) dedicated to solving complex structural problems through scalable software and data-driven fabrication.",
      locale: "en",
    },
    {
      text: "Engenheiro de software e pesquisador de design computacional especializado em construção em madeira. Possui expertise em integrar design e engenharia através de C#/.NET e Python. Mestre pelo ITECH (Universidade de Stuttgart) com foco em sistemas robóticos multiescalares para madeira engenheirada. Profissional trilíngue (inglês, alemão e português) dedicado a solucionar problemas estruturais complexos através de software escalável e fabricação orientada por dados.",
      locale: "pt",
    },
  ]);

  await db
    .insert(SkillProgramming)
    .values([
      { id: "HTML" },
      { id: "CSS" },
      { id: "TypeScript" },
      { id: "Python" },
      { id: "C#" },
    ]);

  await db.insert(SkillProgrammingTranslations).values([
    { skillId: "HTML", locale: "pt", level: "Avançado" },
    { skillId: "HTML", locale: "en", level: "Advanced" },
    { skillId: "CSS", locale: "pt", level: "Avançado" },
    { skillId: "CSS", locale: "en", level: "Advanced" },
    { skillId: "TypeScript", locale: "pt", level: "Avançado" },
    { skillId: "TypeScript", locale: "en", level: "Advanced" },
    { skillId: "Python", locale: "pt", level: "Intermediário" },
    { skillId: "Python", locale: "en", level: "Intermediate" },
    { skillId: "C#", locale: "pt", level: "Intermediário" },
    { skillId: "C#", locale: "en", level: "Intermediate" },
  ]);

  await db
    .insert(SkillFrameworks)
    .values([
      { id: "Astro" },
      { id: "Tailwind" },
      { id: "React" },
      { id: "TanStack Start" },
      { id: "Flask" },
    ]);

  await db.insert(SkillFrameworksTranslations).values([
    { skillId: "Astro", level: "Avançado", locale: "pt" },
    { skillId: "Astro", level: "Advanced", locale: "en" },
    { skillId: "Tailwind", level: "Avançado", locale: "pt" },
    { skillId: "Tailwind", level: "Advanced", locale: "en" },
    { skillId: "React", level: "Avançado", locale: "pt" },
    { skillId: "React", level: "Advanced", locale: "en" },
    { skillId: "TanStack Start", level: "Intermediário", locale: "pt" },
    { skillId: "TanStack Start", level: "Intermediate", locale: "en" },
    { skillId: "Flask", level: "Intermediário", locale: "pt" },
    { skillId: "Flask", level: "Intermediate", locale: "en" },
  ]);

  await db
    .insert(SkillDatabases)
    .values([{ id: "PostgreSQL" }, { id: "MongoDB" }, { id: "SQLite" }]);

  await db.insert(SkillDatabasesTranslations).values([
    { skillId: "PostgreSQL", level: "Avançado", locale: "pt" },
    { skillId: "PostgreSQL", level: "Advanced", locale: "en" },
    { skillId: "MongoDB", level: "Intermediário", locale: "pt" },
    { skillId: "MongoDB", level: "Intermediate", locale: "en" },
    { skillId: "SQLite", level: "Intermediário", locale: "pt" },
    { skillId: "SQLite", level: "Intermediate", locale: "en" },
  ]);

  await db.insert(SkillDesign).values([
    {
      id: "Rhino",
    },
    {
      id: "Grasshopper",
    },
    { id: "Revit" },
    {
      id: "Figma",
    },
    { id: "Adobe Creative Cloud" },
  ]);

  await db.insert(SkillDesignTranslations).values([
    { skillId: "Rhino", level: "Avançado", locale: "pt" },
    { skillId: "Rhino", level: "Advanced", locale: "en" },
    { skillId: "Grasshopper", level: "Avançado", locale: "pt" },
    { skillId: "Grasshopper", level: "Advanced", locale: "en" },
    { skillId: "Revit", level: "Avançado", locale: "pt" },
    { skillId: "Revit", level: "Advanced", locale: "en" },
    { skillId: "Figma", level: "Intermediário", locale: "pt" },
    { skillId: "Figma", level: "Intermediate", locale: "en" },
    { skillId: "Adobe Creative Cloud", level: "Avançado", locale: "pt" },
    { skillId: "Adobe Creative Cloud", level: "Advanced", locale: "en" },
  ]);

  await db.insert(SkillSpecialized).values([
    { id: 1, title: "Web Development" },
    { id: 2, title: "Computational Design" },
    { id: 3, title: "UI/UX Design" },
  ]);

  await db.insert(SkillSpecializedTranslations).values([
    { skillId: 1, title: "Desenvolvimento Web", locale: "pt" },
    { skillId: 1, title: "Web Development", locale: "en" },
    { skillId: 2, title: "Design Computacional", locale: "pt" },
    { skillId: 2, title: "Computational Design", locale: "en" },
    { skillId: 3, title: "Design de UI/UX", locale: "pt" },
    { skillId: 3, title: "UI/UX Design", locale: "en" },
  ]);
  await db.insert(Experience).values([
    {
      id: "HM",
      startDate: new Date("2025-02"),
      link: "https://hm.edu/forschungsprojekte_de/forschungsprojekt_detail_9856.de.html",
    },
    {
      id: "BS",
      startDate: new Date("2024-01"),
      endDate: new Date("2024-12"),
      link: "https://buildsystems.de/",
    },
    {
      id: "UST",
      startDate: new Date("2023-1"),
      endDate: new Date("2023-12"),
      link: "https://urbanscaletimber.com/",
    },
    {
      id: "AE",
      startDate: new Date("2021-12"),
      endDate: new Date("2022-12"),
      link: "https://art-engineering.net/",
    },
    {
      id: "AR",
      startDate: new Date("2020-10"),
      endDate: new Date("2021-11"),
      link: "https://www.ar-ingenieure.com/",
    },
    {
      id: "ICD/ITKE",
      startDate: new Date("2019-12"),
      endDate: new Date("2020-10"),
      link: "https://www.icd.uni-stuttgart.de/",
    },
    {
      id: "AMB",
      startDate: new Date("2015-3"),
      endDate: new Date("2019-7"),
      link: "https://markobrajovic.com/en",
    },
    {
      id: "CSULB",
      startDate: new Date("2014-6"),
      endDate: new Date("2014-8"),
      link: "https://www.csulb.edu/college-of-engineering",
    },
    {
      id: "ICBUSP",
      startDate: new Date("2011-6"),
      endDate: new Date("2013-8"),
      link: "https://ww3.icb.usp.br/",
    },
  ]);

  await db.insert(ExperienceTranslations).values([
    // HM
    {
      experienceId: "HM",
      locale: "pt",
      title: "Pesquisador Associado",
      company: "Universidade de Ciências Aplicadas de Munique",
      location: "Munique, Alemanha",
    },
    {
      experienceId: "HM",
      locale: "en",
      title: "Research Associate",
      company: "Munich University of Applied Sciences",
      location: "Munich, Germany",
    },
    // BS
    {
      experienceId: "BS",
      locale: "pt",
      title: "Desenvolvedor de Software",
      company: "BuildSystems GmbH",
      companyNote: "Antigo Urban Scale Timber",
      location: "Munique, Alemanha",
    },
    {
      experienceId: "BS",
      locale: "en",
      title: "Software Developer",
      company: "BuildSystems GmbH",
      companyNote: "Previously the startup Urban Scale Timber",
      location: "Munich, Germany",
    },
    // UST
    {
      experienceId: "UST",
      locale: "pt",
      title: "Arquiteto Computacional",
      company: "Urban Scale Timber, Flügge Funding",
      companyNote: "A startup agora é BuildSystems GmbH",
      location: "Munique, Alemanha",
    },
    {
      experienceId: "UST",
      locale: "en",
      title: "Computational Architect",
      company: "Urban Scale Timber, Flügge Funding",
      companyNote: "The startup is now BuildSystems GmbH",
      location: "Munich, Germany",
    },
    // AE
    {
      experienceId: "AE",
      locale: "pt",
      title: "Arquiteto Computacional",
      company: "ArtEngineering GmbH",
      location: "Schorndorf, Alemanha",
    },
    {
      experienceId: "AE",
      locale: "en",
      title: "Computational Architect",
      company: "ArtEngineering GmbH",
      location: "Schorndorf, Germany",
    },
    // AR
    {
      experienceId: "AR",
      locale: "pt",
      title: "Arquiteto Computacional",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Stuttgart, Alemanha",
    },
    {
      experienceId: "AR",
      locale: "en",
      title: "Computational Architect",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Stuttgart, Germany",
    },
    // ICD/ITKE
    {
      experienceId: "ICD/ITKE",
      locale: "pt",
      title: "Assistente de Pesquisa",
      company: "ICD/ITKE Universidade de Stuttgart",
      location: "Stuttgart, Alemanha",
    },
    {
      experienceId: "ICD/ITKE",
      locale: "en",
      title: "Research Assistant",
      company: "ICD/ITKE University of Stuttgart",
      location: "Stuttgart, Germany",
    },
    // AMB
    {
      experienceId: "AMB",
      locale: "pt",
      title: "Arquiteto Computacional",
      titleNote: "Estagiário até dezembro de 2016",
      company: "Atelier Marko Brajovic",
      location: "São Paulo, Brasil",
    },
    {
      experienceId: "AMB",
      locale: "en",
      title: "Computational Architect",
      titleNote: "Intern until December 2016",
      company: "Atelier Marko Brajovic",
      location: "São Paulo, Brazil",
    },
    // CSULB
    {
      experienceId: "CSULB",
      locale: "pt",
      title: "Estágio Treinamento em Serviço",
      company: "California State University Long Beach",
      location: "Long Beach, EUA",
    },
    {
      experienceId: "CSULB",
      locale: "en",
      title: "On-the-job Training",
      company: "California State University Long Beach",
      location: "Long Beach, USA",
    },
    // ICBUSP
    {
      experienceId: "ICBUSP",
      locale: "pt",
      title: "Designer Gráfico",
      company: "Instituto de Ciências Biomédicas - Universidade de São Paulo",
      location: "Brasil",
    },
    {
      experienceId: "ICBUSP",
      locale: "en",
      title: "Graphic Designer",
      company: "Biomedical Science Institute - University of São Paulo",
      location: "Brazil",
    },
  ]);

  await db.insert(ExperienceItems).values([
    // HM
    {
      id: "HM3",
      experienceId: "HM",
      locale: "en",
      text: "Development of a Revit plugin (C#/.NET) to import buildups from DOKwood into Revit as System Families.",
    },
    {
      id: "HM3-pt",
      experienceId: "HM",
      locale: "pt",
      text: "Desenvolvimento de um plugin para Revit (C#/.NET) para importar elementos construtivos do app DOKwood para o Revit como famílias do sistema.",
    },
    {
      id: "HM2",
      experienceId: "HM",
      locale: "en",
      text: "Development of a bSDD (building Smart Data Dictionary) to consolidate a semantic data model for DOKwood.",
    },
    {
      id: "HM2-pt",
      experienceId: "HM",
      locale: "pt",
      text: "Desenvolvimento de um bSDD (building Smart Data Dictionary) para consolidar um modelo de dados semântico para o DOKwood.",
    },
    {
      id: "HM1",
      experienceId: "HM",
      locale: "en",
      text: "Research on standards, databases, CAD and BIM tools with focus on timber technology. Foundations to develop the app DOKwood.",
    },
    {
      id: "HM1-pt",
      experienceId: "HM",
      locale: "pt",
      text: "Pesquisa sobre normas técnicas, bancos de dados e ferramentas CAD e BIM com foco em tecnologia madeireira. Fundamentos para o desenvolvimento do aplicativo DOKwood.",
    },
    // BS
    {
      id: "BS1",
      experienceId: "BS",
      locale: "en",
      text: "Development of a Funding Calculator for new constructions and renovations in Germany. The web app was built with the Angular framework and PostgreSQL. It delivers a seamless UX and provide real-time financial modeling capabilities.",
    },
    {
      id: "BS1-pt",
      experienceId: "BS",
      locale: "pt",
      text: "Desenvolvimento de uma Calculadora de Financiamento para construções e reformas na Alemanha. O aplicativo web foi construído com o framework Angular e PostgreSQL. Proporciona uma experiência de usuário fluida e oferece capacidades de modelagem financeira em tempo real.",
    },
    {
      id: "BS2",
      experienceId: "BS",
      locale: "en",
      text: "Architected and implemented BuildSystems' website using Astro framework, leveraging Notion API to use Notion as a content management system (CMS).",
    },
    {
      id: "BS2-pt",
      experienceId: "BS",
      locale: "pt",
      text: "Desenvolvimento e implementação do website da BuildSystems utilizando o framework Astro, com integração da API do Notion para usar sua interface como sistema de gerenciamento de conteúdo (CMS).",
    },
    // UST
    {
      id: "UST1",
      experienceId: "UST",
      locale: "en",
      text: "Development of a Grasshopper plugin (C#/.NET) in conjunction with a semantic data model to calculate the Life Cycle Assessment of timber buildings.",
    },
    {
      id: "UST1-pt",
      experienceId: "UST",
      locale: "pt",
      text: "Desenvolvimento um plugin para Grasshopper (C#/.NET) em conjunto com um modelo de dados semântico para calcular a Avaliação do Ciclo de Vida (LCA) de edifícios de madeira.",
    },
    {
      id: "UST2",
      experienceId: "UST",
      locale: "en",
      text: "UI/UX prototype for the web app Circular Component Creator.",
    },
    {
      id: "UST2-pt",
      experienceId: "UST",
      locale: "pt",
      text: "Protótipo de UI/UX para o aplicativo web Circular Component Creator.",
    },
    {
      id: "UST3",
      experienceId: "UST",
      locale: "en",
      text: "Data visualizations using Power BI for decision-making.",
    },
    {
      id: "UST3-pt",
      experienceId: "UST",
      locale: "pt",
      text: "Visualização de dados usando Power BI para tomada de decisão.",
    },
    {
      id: "UST4",
      experienceId: "UST",
      locale: "en",
      text: "Development of a timber component configurator with EPD data.",
    },
    {
      id: "UST4-pt",
      experienceId: "UST",
      locale: "pt",
      text: "Desenvolvimento de um configurador de componentes de madeira com dados EPD.",
    },
    {
      id: "UST5",
      experienceId: "UST",
      locale: "en",
      text: "Development of a tool for urban analysis.",
    },
    {
      id: "UST5-pt",
      experienceId: "UST",
      locale: "pt",
      text: "Desenvolvimento de uma ferramenta para análise urbana.",
    },
    // AE
    {
      id: "AE1",
      experienceId: "AE",
      locale: "en",
      text: "Conducted algorithmic modeling and finite element analysis of complex spatial structures and artworks.",
    },
    {
      id: "AE1-pt",
      experienceId: "AE",
      locale: "pt",
      text: "Modelagem algorítmica e análise de elementos finitos de estruturas espaciais complexas e obras de arte.",
    },
    {
      id: "AE2",
      experienceId: "AE",
      locale: "en",
      text: "Developed design-to-production automated workflows.",
    },
    {
      id: "AE2-pt",
      experienceId: "AE",
      locale: "pt",
      text: "Desenvolvimento de fluxos de trabalho automatizados do design à produção.",
    },
    {
      id: "AE3",
      experienceId: "AE",
      locale: "en",
      text: "Aiding on structural analysis of complex spatial structures.",
    },
    {
      id: "AE3-pt",
      experienceId: "AE",
      locale: "pt",
      text: "Auxiliou na análise estrutural de estruturas espaciais complexas.",
    },
    {
      id: "AE4",
      experienceId: "AE",
      locale: "en",
      text: "Preparing meticulous technical documentation.",
    },
    {
      id: "AE4-pt",
      experienceId: "AE",
      locale: "pt",
      text: "Preparação de documentação técnica meticulosa.",
    },
    {
      id: "AE5",
      experienceId: "AE",
      locale: "en",
      text: "Creating precise engineering drawings and production plans.",
    },
    {
      id: "AE5-pt",
      experienceId: "AE",
      locale: "pt",
      text: "Criação de desenhos de engenharia precisos e planos de produção.",
    },
    // AR
    {
      id: "AR1",
      experienceId: "AR",
      locale: "en",
      text: "Received honorable mention in the competition 'Witterungsschutz Römermauer' from the city of Wiesbaden.",
    },
    {
      id: "AR1-pt",
      experienceId: "AR",
      locale: "pt",
      text: "Menção honrosa no concurso 'Witterungsschutz Römermauer' da cidade de Wiesbaden.",
    },
    {
      id: "AR2",
      experienceId: "AR",
      locale: "en",
      text: "Specialized in computational form finding of tensile structures.",
    },
    {
      id: "AR2-pt",
      experienceId: "AR",
      locale: "pt",
      text: "Especializado em form finding computacional de estruturas tensionadas.",
    },
    {
      id: "AR3",
      experienceId: "AR",
      locale: "en",
      text: "Simulated the deployment of an inflatable membrane structure.",
    },
    {
      id: "AR3-pt",
      experienceId: "AR",
      locale: "pt",
      text: "Simulação e implantação de uma estrutura de membrana inflável.",
    },
    {
      id: "AR4",
      experienceId: "AR",
      locale: "en",
      text: "Development of an automatized cutting pattern workflow for membranes.",
    },
    {
      id: "AR4-pt",
      experienceId: "AR",
      locale: "pt",
      text: "Desenvolvimento de um fluxo automatizado de padrões de corte para membranas.",
    },
    // ICD/ITKE
    {
      id: "ICD/ITKE1",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Conducted natural fiber structural tests with Marta Gil Pérez.",
    },
    {
      id: "ICD/ITKE1-pt",
      experienceId: "ICD/ITKE",
      locale: "pt",
      text: "Realização de testes estruturais com fibras naturais com Marta Gil Pérez.",
    },
    {
      id: "ICD/ITKE2",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Carbon fiber winding research with Christoph Schlopschnat.",
    },
    {
      id: "ICD/ITKE2-pt",
      experienceId: "ICD/ITKE",
      locale: "pt",
      text: "Pesquisa de bobinamento de fibra de carbono com Christoph Schlopschnat.",
    },
    {
      id: "ICD/ITKE3",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Computational design of a self-curving timber tower with Dylan Wood.",
    },
    {
      id: "ICD/ITKE3-pt",
      experienceId: "ICD/ITKE",
      locale: "pt",
      text: "Design computacional de uma torre de madeira auto-curvante com Dylan Wood.",
    },
    {
      id: "ICD/ITKE4",
      experienceId: "ICD/ITKE",
      locale: "en",
      text: "Assisted the ICD website migration with Tobias Schwinn.",
    },
    {
      id: "ICD/ITKE4-pt",
      experienceId: "ICD/ITKE",
      locale: "pt",
      text: "Auxílio na migração do site do ICD com Tobias Schwinn.",
    },
    // AMB
    {
      id: "AMB1",
      experienceId: "AMB",
      locale: "en",
      text: "Executed CAD, BIM, and computational modeling for architectural projects.",
    },
    {
      id: "AMB1-pt",
      experienceId: "AMB",
      locale: "pt",
      text: "Modelagem CAD, BIM e computacional para projetos arquitetônicos.",
    },
    {
      id: "AMB2",
      experienceId: "AMB",
      locale: "en",
      text: "Managed project communications and supplier relationships.",
    },
    {
      id: "AMB2-pt",
      experienceId: "AMB",
      locale: "pt",
      text: "Gerenciamento de projetos e relacionamento com fornecedores.",
    },
    {
      id: "AMB3",
      experienceId: "AMB",
      locale: "en",
      text: "Developed conceptual designs and high-quality renderings.",
    },
    {
      id: "AMB3-pt",
      experienceId: "AMB",
      locale: "pt",
      text: "Desenvolvimento de projetos conceituais e renderizações de alta qualidade.",
    },
    {
      id: "AMB4",
      experienceId: "AMB",
      locale: "en",
      text: "Led prototyping and digital fabrication initiatives.",
    },
    {
      id: "AMB4-pt",
      experienceId: "AMB",
      locale: "pt",
      text: "Liderança em iniciativas de prototipagem e fabricação digital.",
    },
    // CSULB
    {
      id: "CSULB1",
      experienceId: "CSULB",
      locale: "en",
      text: "Gained hands-on experience in project management.",
    },
    {
      id: "CSULB1-pt",
      experienceId: "CSULB",
      locale: "pt",
      text: "Experiência prática em gerenciamento de projetos.",
    },
    {
      id: "CSULB2",
      experienceId: "CSULB",
      locale: "en",
      text: "Conducted construction site inspections.",
    },
    {
      id: "CSULB2-pt",
      experienceId: "CSULB",
      locale: "pt",
      text: "Realização de inspeções em canteiros de obras.",
    },
    {
      id: "CSULB3",
      experienceId: "CSULB",
      locale: "en",
      text: "Gained BIM modeling skills.",
    },
    {
      id: "CSULB3-pt",
      experienceId: "CSULB",
      locale: "pt",
      text: "Desenvolvimento de habilidades em modelagem BIM.",
    },
    {
      id: "CSULB4",
      experienceId: "CSULB",
      locale: "en",
      text: "Completed Safety and Health Training.",
    },
    {
      id: "CSULB4-pt",
      experienceId: "CSULB",
      locale: "pt",
      text: "Treinamento em Segurança do trabalho e Saúde.",
    },
    // ICBUSP
    {
      id: "ICBUSP1",
      experienceId: "ICBUSP",
      locale: "en",
      text: "Created conceptual designs for scientific communications.",
    },
    {
      id: "ICBUSP1-pt",
      experienceId: "ICBUSP",
      locale: "pt",
      text: "Criação de projetos conceituais para comunicações científicas.",
    },
    {
      id: "ICBUSP2",
      experienceId: "ICBUSP",
      locale: "en",
      text: "Managed design project workflows.",
    },
    {
      id: "ICBUSP2-pt",
      experienceId: "ICBUSP",
      locale: "pt",
      text: "Gestão de fluxos de trabalho para projetos de design.",
    },
    {
      id: "ICBUSP3",
      experienceId: "ICBUSP",
      locale: "en",
      text: "Organized and supported academic competitions.",
    },
    {
      id: "ICBUSP3-pt",
      experienceId: "ICBUSP",
      locale: "pt",
      text: "Organização e apoio de competições acadêmicas.",
    },
  ]);

  await db.insert(Education).values([
    {
      id: "ITECH",
      startDate: new Date("2019-10"),
      endDate: new Date("2021-10"),
      link: "https://www.itech.uni-stuttgart.de/",
    },
    {
      id: "FAUUSP",
      startDate: new Date("2010-01"),
      endDate: new Date("2016-12"),
      link: "https://www.fau.usp.br/",
    },
    {
      id: "AU/CADC",
      startDate: new Date("2014-01"),
      endDate: new Date("2014-12"),
      link: "https://cadc.auburn.edu/",
    },
    {
      id: "AU/ESL",
      startDate: new Date("2013-08"),
      endDate: new Date("2013-12"),
      link: "https://global.auburn.edu/english/",
    },
  ]);

  await db.insert(EducatonTranslations).values([
    // ITECH
    {
      educationId: "ITECH",
      locale: "pt",
      title: "Mestrado em Ciências",
      institution: "ITECH Universidade de Stuttgart",
      location: "Stuttgart, Alemanha",
    },
    {
      educationId: "ITECH",
      locale: "en",
      title: "Master of Sciences",
      institution: "ITECH University of Stuttgart",
      location: "Stuttgart, Germany",
    },

    // FAUUSP
    {
      educationId: "FAUUSP",
      locale: "pt",
      title: "Bacharel em Arquitetura e Urbanismo",
      institution: "FAUUSP",
      location: "São Paulo, Brasil",
    },
    {
      educationId: "FAUUSP",
      locale: "en",
      title: "Bachelor of Architecture and Urbanism",
      institution: "FAUUSP",
      location: "São Paulo, Brazil",
    },
    // AU/CADC
    {
      educationId: "AU/CADC",
      locale: "pt",
      title: "Intercâmbio em Arquitetura",
      institution: "Auburn University – CADC",
      location: "Auburn, EUA",
    },
    {
      educationId: "AU/CADC",
      locale: "en",
      title: "Architecture Exchange Student",
      institution: "Auburn University – CADC",
      location: "Auburn, USA",
    },
    // AU/ESL
    {
      educationId: "AU/ESL",
      locale: "pt",
      title: "Programa Intensivo de Inglês",
      institution: "Auburn Global",
      location: "Auburn, EUA",
    },
    {
      educationId: "AU/ESL",
      locale: "en",
      title: "Intensive English Program",
      institution: "Auburn Global",
      location: "Auburn, USA",
    },
  ]);

  await db.insert(EducationItems).values([
    // ITECH
    {
      id: "ITECH1",
      educationId: "ITECH",
      locale: "en",
      text: "Thesis: Building Across Scales: A Robotic Timber Fabrication System for On-Site Press Gluing",
    },
    {
      id: "ITECH2",
      educationId: "ITECH",
      locale: "en",
      text: "Supervisors: Prof. Achim Menges, Prof. Jan Knippers",
    },
    {
      id: "ITECH3",
      educationId: "ITECH",
      locale: "en",
      text: "Advisors: Hans Jakob Wagner, Samuel Leder",
    },

    // FAUUSP
    {
      id: "FAUUSP1",
      educationId: "FAUUSP",
      locale: "en",
      text: "Thesis: Architecture + Biomimetics + Algorithm",
    },
    {
      id: "FAUUSP2",
      educationId: "FAUUSP",
      locale: "en",
      text: "Supervisor: Prof. Arthur Lara",
    },
  ]);

  await db.insert(Scholarships).values([
    {
      id: "IntCDC",
      startDate: new Date("2021-03"),
      endDate: new Date("2021-10"),
      link: "https://www.intcdc.uni-stuttgart.de/supporting-structures/early-career-and-education/grants-awards-overview/master-thesis-award-2021-1/",
    },
    {
      id: "CsF",
      startDate: new Date("2013-08"),
      endDate: new Date("2014-12"),
      link: "https://www.gov.br/cnpq/pt-br/acesso-a-informacao/acoes-e-programas/programas/ciencia-sem-fronteiras",
    },
  ]);

  await db.insert(ScholarshipsTranslations).values([
    {
      scholarshipId: "IntCDC",
      locale: "pt",
      title: "Bolsa de Mestrado IntCDC 2021",
      institution: "Cluster de Excelência – IntCDC",
      description:
        "A Bolsa incentiva alunos de mestrado excelentes a dar um primeiro passo em direção a uma carreira acadêmica.",
    },
    {
      scholarshipId: "IntCDC",
      locale: "en",
      title: "IntCDC Master’s Thesis Grant 2021",
      institution: "Cluster of Excellence – IntCDC",
      description:
        "The Grant encourages excellent master’s students to realize a first step toward a prospective academic career.",
    },
    {
      scholarshipId: "CsF",
      locale: "pt",
      title: "Ciência sem Fronteiras",
      institution: "Governo Federal Brasileiro",
      description:
        "Bolsa integral para os melhores alunos brasileiros. Um ano na Auburn University, EUA.",
    },
    {
      scholarshipId: "CsF",
      locale: "en",
      title: "Science without Borders",
      institution: "Brazilian Federal Government",
      description:
        "Fully funded scholarships for the top Brazilian students. One year at Auburn University, USA.",
    },
  ]);

  await db.insert(Publications).values([
    {
      id: "ACJ2024",
      date: new Date("2024-09"),
      link: "https://www.sciencedirect.com/science/article/pii/S0926580524005107",
    },
    {
      id: "CDRF2023",
      date: new Date("2023-06"),
      link: "https://link.springer.com/chapter/10.1007/978-981-99-8405-3_5",
    },
    {
      id: "ECAADE2020",
      date: new Date("2020-06"),
      link: "/projects/life-lamp-by-estudio-guto-requena-for-decimal/",
    },
    {
      id: "CDS",
      date: new Date("2020-02"),
      link: "/publications/computational-design-strategies/",
    },
    {
      id: "SiGradi2018",
      date: new Date("2018-11"),
      link: "/publications/high-low-as-expression-of-the-brazilian-digital-fabrication/",
    },
    {
      id: "IASS2017",
      date: new Date("2017-09"),
      link: "/publications/algorithmic-design-for-traditional-bobbin-lace-methods/",
    },
  ]);

  await db.insert(PublicationsTranslations).values([
    {
      publicationId: "ACJ2024",
      locale: "pt",
      title:
        "Sistema de fabricação robótica multiescalar para colagem a pressão no local em edifícios de madeira de vários andares",
      publisher: "Automation in Construction journal",
    },
    {
      publicationId: "ACJ2024",
      locale: "en",
      title:
        "Multi-scalar robotic fabrication system for on-site press gluing in multi-storey timber buildings",
      publisher: "Automation in Construction journal",
    },
    {
      publicationId: "CDRF2023",
      locale: "pt",
      title:
        "Método de Design Baseado em Feedback para Colocação de Colunas Informadas Espacialmente e Estruturalmente Performativas em Construção Multi-andares",
      publisher: "CDRF 2023",
      location: "Pequim, China",
    },
    {
      publicationId: "CDRF2023",
      locale: "en",
      title:
        "Feedback-Based Design Method for Spatially-Informed and Structurally-Performative Column Placement in Multi-Story Construction",
      publisher: "CDRF 2023",
      location: "Beijing, China",
    },
    {
      publicationId: "ECAADE2020",
      locale: "pt",
      title: "Life Lamp: Conectando Design e Pessoas Através da Emoção",
      publisher: "ECAADE 2020 Anthropologic",
      location: "Berlim, Alemanha",
    },
    {
      publicationId: "ECAADE2020",
      locale: "en",
      title: "Life Lamp: Connecting Design and People Through Emotion",
      publisher: "ECAADE 2020 Anthropologic",
      location: "Berlin, Germany",
    },
    {
      publicationId: "CDS",
      locale: "pt",
      title: "Estratégias de Design Computacional",
      publisher: "E-book autopublicado",
      location: "Online",
    },
    {
      publicationId: "CDS",
      locale: "en",
      title: "Computational Design Strategies",
      publisher: "Self-published e-book",
      location: "Online",
    },
    {
      publicationId: "SiGradi2018",
      locale: "pt",
      title: "High-Low como expressão da fabricação digital brasileira.",
      publisher: "SiGradi 2018 Technopolitics",
      location: "São Carlos, Brasil",
    },
    {
      publicationId: "SiGradi2018",
      locale: "en",
      title: "High-Low as expression of the Brazilian digital fabrication",
      publisher: "SiGradi 2018 Technopolitics",
      location: "São Carlos, Brazil",
    },
    {
      publicationId: "IASS2017",
      locale: "pt",
      title: "Design algorítmico para métodos tradicionais de renda de bilros.",
      publisher: "IASS 2017",
      location: "Hamburgo, Alemanha",
    },
    {
      publicationId: "IASS2017",
      locale: "en",
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
      { id: "Ruy M O Pauletti" },
      { id: "Thiago H Omena" },
      { id: "Adalberto de Paula" },
    ]);

  await db.insert(PersonToPublications).values([
    // ACJ2024 (already added in previous code)
    { publicationId: "ACJ2024", personId: "Nils Opgenorth", order: 1 },
    { publicationId: "ACJ2024", personId: "Daniel Nunes Locatelli", order: 2 },
    { publicationId: "ACJ2024", personId: "Samuel Leder", order: 3 },
    { publicationId: "ACJ2024", personId: "Hans Jakob Wagner", order: 4 },
    { publicationId: "ACJ2024", personId: "Achim Menges", order: 5 },

    // CDRF2023
    { publicationId: "CDRF2023", personId: "Ekin Sila Sahin", order: 1 },
    { publicationId: "CDRF2023", personId: "Daniel Nunes Locatelli", order: 2 },
    { publicationId: "CDRF2023", personId: "Luis Orozco", order: 3 },
    { publicationId: "CDRF2023", personId: "Anna Krtschil", order: 4 },
    { publicationId: "CDRF2023", personId: "Hans Jakob Wagner", order: 5 },
    { publicationId: "CDRF2023", personId: "Achim Menges", order: 6 },
    { publicationId: "CDRF2023", personId: "Jan Knippers", order: 7 },

    // CDS
    { publicationId: "CDS", personId: "Daniel Nunes Locatelli", order: 1 },

    // ECAADE2020
    {
      publicationId: "ECAADE2020",
      personId: "Daniel Nunes Locatelli",
      order: 1,
    },
    { publicationId: "ECAADE2020", personId: "Leonardo Prazeres", order: 2 },
    { publicationId: "ECAADE2020", personId: "Guilherme Giantini", order: 3 },
    { publicationId: "ECAADE2020", personId: "Vitor Curti", order: 4 },
    {
      publicationId: "ECAADE2020",
      personId: "Carlos Augusto Requena",
      order: 5,
    },

    // SiGradi2018
    {
      publicationId: "SiGradi2018",
      personId: "Daniel Nunes Locatelli",
      order: 1,
    },
    { publicationId: "SiGradi2018", personId: "Arthur Hunold Lara", order: 2 },
    {
      publicationId: "SiGradi2018",
      personId: "Ruy M O Pauletti",
      order: 3,
    },
    { publicationId: "SiGradi2018", personId: "Thiago H Omena", order: 4 },
    { publicationId: "SiGradi2018", personId: "Adalberto de Paula", order: 5 },

    // IASS2017
    { publicationId: "IASS2017", personId: "Daniel Nunes Locatelli", order: 1 },
    { publicationId: "IASS2017", personId: "Arthur Hunold Lara", order: 2 },
    {
      publicationId: "IASS2017",
      personId: "Ruy M O Pauletti",
      order: 3,
    },
    { publicationId: "IASS2017", personId: "Thiago H Omena", order: 4 },
  ]);

  await db.insert(Certifications).values([
    {
      id: "CS50SQL2024",
      date: new Date("2024-07"),
      link: "https://cs50.harvard.edu/certificates/581eaf67-0711-4c95-be9e-d4ec37eeeac1",
    },
    {
      id: "CS50CS2024",
      date: new Date("2024-07"),
      link: "https://cs50.harvard.edu/certificates/d05f22b7-5ebd-4433-9b12-ba626504cc2f",
    },
    {
      id: "MITX6001x2018",
      date: new Date("2018-08"),
      link: "https://courses.edx.org/certificates/f471f7bf0c46443cb32b66fd3988e0e3",
    },
    {
      id: "RevitArch2015-2016",
      date: new Date("2015-09"),
      link: "https://www.credly.com/badges/0fbad904-5c7b-4739-b679-3b4d33be0f07",
    },
    {
      id: "CALOSHASafety2013",
      date: new Date("2013-07"),
    },
  ]);

  await db.insert(CertificationsTranslations).values([
    {
      certificationId: "CS50SQL2024",
      locale: "pt",
      title: "Introdução a Banco de Dados com SQL",
      issuer: "Universidade Harvard & edX.org",
    },
    {
      certificationId: "CS50SQL2024",
      locale: "en",
      title: "CS50's Introduction to Databases with SQL",
      issuer: "Harvard University & edX.org",
    },
    {
      certificationId: "CS50CS2024",
      locale: "pt",
      title: "Introdução à Ciência da Computação",
      issuer: "Universidade Harvard & edX.org",
    },
    {
      certificationId: "CS50CS2024",
      locale: "en",
      title: "CS50's Introduction to Computer Science",
      issuer: "Harvard University & edX.org",
    },
    {
      certificationId: "MITX6001x2018",
      locale: "pt",
      title:
        "Introdução à Ciência da Computação e Programação Usando Python",
      issuer: "MITX & edX.org",
    },
    {
      certificationId: "MITX6001x2018",
      locale: "en",
      title: "Intro to Computer Science and Programming Using Python",
      issuer: "MITX & edX.org",
    },
    {
      certificationId: "RevitArch2015-2016",
      locale: "pt",
      title: "Exame de Certificação Profissional Autodesk Revit Architecture",
      issuer: "Autodesk University Brasil 2016",
    },
    {
      certificationId: "RevitArch2015-2016",
      locale: "en",
      title: "Autodesk Revit Architecture Certified Professional Exam",
      issuer: "Autodesk University Brazil 2016",
    },
    {
      certificationId: "CALOSHASafety2013",
      locale: "pt",
      title: "Treinamento de Segurança e Saúde - CAL/OSHA (10 horas)",
      issuer: "CAL/OSHA",
    },
    {
      certificationId: "CALOSHASafety2013",
      locale: "en",
      title: "Safety & Health Training - CAL/OSHA (10 hours)",
      issuer: "CAL/OSHA",
    },
  ]);

  await db.insert(Tutoring).values([
    {
      id: "ModelsByNature2019",
      startDate: new Date("2019-06"),
      endDate: new Date("2019-07"),
      link: "/teaching/models-bynature-10/",
    },
    {
      id: "TensegritySeminar2018",
      startDate: new Date("2018-12"),
      link: "https://markobrajovic.com/en/all/atelier-by-nature",
    },
    {
      id: "AdaptiveWorkshop2018",
      startDate: new Date("2018-06"),
      link: "/teaching/adaptive-grasshopper-workshop/",
    },
    {
      id: "KangarooWorkshop2017",
      startDate: new Date("2017-04"),
    },
    {
      id: "RevitLessons2017",
      startDate: new Date("2017-02"),
    },
  ]);

  await db.insert(TutoringTranslations).values([
    {
      tutoringId: "ModelsByNature2019",
      locale: "pt",
      title: "Models byNature 1.0 & 2.0",
      organization: "Daniel Locatelli",
      location: "São Paulo, Brasil",
      description:
        "Esse workshop conectou abordagens de design natural como computação de materiais e biomimética com design computacional.",
    },
    {
      tutoringId: "ModelsByNature2019",
      locale: "en",
      title: "Models byNature 1.0 & 2.0",
      organization: "Daniel Locatelli",
      location: "São Paulo, Brazil",
      description:
        "This workshop connected natural design approaches like material computation and biomimetics with computational design.",
    },
    {
      tutoringId: "TensegritySeminar2018",
      locale: "pt",
      title: "Workshop Tensegrity",
      organization: "Atelier Marko Brajovic",
      location: "Paraty, Brasil",
      description:
        "A equipe que formou o Atelier Marko Brajovic se reuniu para desenvolver um tensegrity coletivamente.",
    },
    {
      tutoringId: "TensegritySeminar2018",
      locale: "en",
      title: "Tensegrity Workshop",
      organization: "Atelier Marko Brajovic",
      location: "Paraty, Brazil",
      description:
        "The team that formed the Atelier Marko Brajovic got together to develop a tensegrity collectively.",
    },
    {
      tutoringId: "AdaptiveWorkshop2018",
      locale: "pt",
      title: "Workshop Adaptive Grasshopper",
      organization: "XIV SAU UNEMAT",
      location: "Barra do Bugres, Brasil",
      description:
        'Workshop sobre a estratégia de design computacional "Exoesqueleto."',
    },
    {
      tutoringId: "AdaptiveWorkshop2018",
      locale: "en",
      title: "Adaptive Grasshopper Workshop",
      organization: "XIV SAU UNEMAT",
      location: "Barra do Bugres, Brazil",
      description:
        'Workshop about the computational design strategy "Exoskeleton."',
    },
    {
      tutoringId: "KangarooWorkshop2017",
      locale: "pt",
      title: "Workshop Grasshopper & Kangaroo",
      organization: "Porto FabLab",
      location: "São Paulo, Brasil",
      description:
        "Workshop sobre sistemas de molas para simular o comportamento de tecidos.",
    },
    {
      tutoringId: "KangarooWorkshop2017",
      locale: "en",
      title: "Grasshopper & Kangaroo Workshop",
      organization: "Porto FabLab",
      location: "São Paulo, Brazil",
      description: "Workshop about spring systems to simulate cloth behavior.",
    },
    {
      tutoringId: "RevitLessons2017",
      locale: "pt",
      title: "Aulas particulares de Revit",
      organization: "Aulas particulares",
      location: "São Paulo, Brasil",
      description:
        "Aulas de Revit desde os princípios básicos até técnicas avançadas.",
    },
    {
      tutoringId: "RevitLessons2017",
      locale: "en",
      title: "Private Revit Lessons",
      organization: "Private Tutoring",
      location: "São Paulo, Brazil",
      description:
        "Revit lessons from the basic principles to advanced techniques.",
    },
  ]);

  await db.insert(TalksAndLectures).values([
    {
      id: "ForumHolzbau2024",
      date: new Date("2024-07"),
      link: "https://www.icd.uni-stuttgart.de/news/Multiskalares-Roboterfertigungssystem-fuer-Vor-Ort-Pressklebung-im-mehrgeschossigen-Holzbau/",
    },
    {
      id: "GraphisoftX2023",
      date: new Date("2023-12"),
      link: "https://www.youtube.com/watch?v=baVNIbWtMQo",
    },
    {
      id: "UFT2023",
      date: new Date("2023-11"),
      link: "https://sites.google.com/mail.uft.edu.br/semanau23/programa%C3%A7%C3%A3o/sexta-1011?authuser=0#h.rx3nv64mjv6q",
    },
    {
      id: "Siemens2023",
      date: new Date("2023-03"),
      link: "https://ecosystem.siemens.com/researchandinnovation/rie-munich-conference-digitalization-low-code-engineering-in-industry",
    },
    {
      id: "IFPR2023",
      date: new Date("2023-09"),
    },
    {
      id: "DigitalFUTURES2022",
      date: new Date("2022-03"),
    },
    {
      id: "UNIP2020",
      date: new Date("2020-11"),
    },
    {
      id: "PUCMinas2020",
      date: new Date("2020-10"),
      link: "https://youtu.be/J303rzg7y0U",
    },
    {
      id: "IFRO2019",
      date: new Date("2019-07"),
      link: "https://portal.ifro.edu.br/vilhena/noticias/8153-palestra-arquitetura-biomimetica-e-algoritmo-e-realizada-em-vilhena",
    },
    {
      id: "SEBRAE2019",
      date: new Date("2019-03"),
    },
    {
      id: "SemanaDesignRio2018",
      date: new Date("2018-09"),
      link: "https://revistacasaejardim.globo.com/Casa-e-Jardim/Eventos/Semana-Design-Rio/noticia/2018/09/semana-design-rio-chega-6-edicao-no-mam-entre-os-dias-13-e-1609.html",
    },
    {
      id: "Tatil2018",
      date: new Date("2018-08"),
    },
    {
      id: "SAU2018",
      date: new Date("2018-06"),
    },
    {
      id: "IED2017",
      date: new Date("2017-08"),
    },
    {
      id: "FAU/POLI2016",
      date: new Date("2016-12"),
    },
  ]);

  await db.insert(TalksAndLecturesTranslations).values([
    {
      talkId: "ForumHolzbau2024",
      locale: "pt",
      title:
        "Sistema de fabricação robótica multiescalar para colagem à pressão no canteiro em edifícios de madeira",
      organization: "Forum Holzbau",
      location: "Stuttgart, Alemanha",
    },
    {
      talkId: "ForumHolzbau2024",
      locale: "en",
      title:
        "Multi-scalar robotic fabrication system for on-site press gluing in multi-storey timber buildings",
      organization: "Forum Holzbau",
      location: "Stuttgart, Germany",
    },
    {
      talkId: "GraphisoftX2023",
      locale: "pt",
      title: "Visão Sustentabilidade",
      organization: "Graphisoft X",
      location: "Online",
    },
    {
      talkId: "GraphisoftX2023",
      locale: "en",
      title: "Vision Sustainability",
      organization: "Graphisoft X",
      location: "Online",
    },
    {
      talkId: "UFT2023",
      locale: "pt",
      title: "Arquitetura Computacional",
      organization: "Curso de Arquitetura e Urbanismo da UFT",
      location: "Online",
    },
    {
      talkId: "UFT2023",
      locale: "en",
      title: "Computational Architecture",
      organization: "Architecture and Urbanism course at UFT",
      location: "Online",
    },
    {
      talkId: "Siemens2023",
      locale: "pt",
      title: "Viabilidade da construção sustentável",
      organization: "Siemens RIE Munich Conference",
      location: "Munique, Alemanha",
    },
    {
      talkId: "Siemens2023",
      locale: "en",
      title: "Feasibility of sustainable construction",
      organization: "Siemens RIE Munich Conference",
      location: "Munich, Germany",
    },
    {
      talkId: "IFPR2023",
      locale: "pt",
      title:
        "Arquitetura Computacional na Alemanha: Estado da arte e desafios futuros",
      organization: "Curso de Arquitetura e Urbanismo do IFPR",
      location: "Online",
    },
    {
      talkId: "IFPR2023",
      locale: "en",
      title:
        "Computational Architecture in Germany: State of the art and future challenges",
      organization: "Architecture and Urbanism course at IFPR",
      location: "Online",
    },
    {
      talkId: "DigitalFUTURES2022",
      locale: "pt",
      title: "Building Across Scales",
      organization: "DigitalFUTURES",
      location: "Online",
    },
    {
      talkId: "DigitalFUTURES2022",
      locale: "en",
      title: "Building Across Scales",
      organization: "DigitalFUTURES",
      location: "Online",
    },
    {
      talkId: "UNIP2020",
      locale: "pt",
      title: "Design Computacional e suas Estratégias",
      organization: "UNIP Sorocaba",
      location: "Online",
    },
    {
      talkId: "UNIP2020",
      locale: "en",
      title: "Computational Design: Strategies",
      organization: "UNIP Sorocaba",
      location: "Online",
    },
    {
      talkId: "PUCMinas2020",
      locale: "pt",
      title: "Estratégias do Design Computacional",
      organization: "PUC Minas",
      location: "Online",
    },
    {
      talkId: "PUCMinas2020",
      locale: "en",
      title: "Computational Design Strategies",
      organization: "PUC Minas",
      location: "Online",
    },
    {
      talkId: "IFRO2019",
      locale: "pt",
      title: "Arquitetura + Biomimética + Algoritmo",
      organization: "Curso de Arquitetura e Urbanismo do IFRO",
      location: "Vilhena, Brasil",
    },
    {
      talkId: "IFRO2019",
      locale: "en",
      title: "Architecture + Biomimetics + Algorithm",
      organization: "Architecture and Urbanism Course at IFRO",
      location: "Vilhena, Brazil",
    },
    {
      talkId: "SEBRAE2019",
      locale: "pt",
      title: "Design Emocional e Tecnologia",
      organization: "SEBRAE Talks, MOVELPAR 2019",
      location: "Arapongas, Brasil",
    },
    {
      talkId: "SEBRAE2019",
      locale: "en",
      title: "Emotional Design and Technology",
      organization: "SEBRAE Talks, MOVELPAR 2019",
      location: "Arapongas, Brazil",
    },
    {
      talkId: "SemanaDesignRio2018",
      locale: "pt",
      title: "Design Paramétrico Inspirado pela Natureza",
      organization: "Semana Design Rio 2018",
      location: "Rio de Janeiro, Brasil",
    },
    {
      talkId: "SemanaDesignRio2018",
      locale: "en",
      title: "Parametric Design Inspired byNature",
      organization: "Semana Design Rio 2018",
      location: "Rio de Janeiro, Brazil",
    },
    {
      talkId: "Tatil2018",
      locale: "pt",
      title: "Geometrias Biomiméticas",
      organization: "Tátil",
      location: "Rio de Janeiro, Brasil",
    },
    {
      talkId: "Tatil2018",
      locale: "en",
      title: "Biomimetic Geometries",
      organization: "Tátil",
      location: "Rio de Janeiro, Brazil",
    },
    {
      talkId: "SAU2018",
      locale: "pt",
      title: "Arquitetura + Biomimética + Algoritmo",
      organization: "XIV SAU UNEMAT",
      location: "Barra do Bugres, Brasil",
    },
    {
      talkId: "SAU2018",
      locale: "en",
      title: "Architecture + Biomimetics + Algorithm",
      organization: "XIV SAU UNEMAT",
      location: "Barra do Bugres, Brazil",
    },
    {
      talkId: "IED2017",
      locale: "pt",
      title: "Arquitetura + Biomimética + Algoritmo",
      organization: "IED São Paulo",
      location: "São Paulo, Brasil",
    },
    {
      talkId: "IED2017",
      locale: "en",
      title: "Architecture + Biomimetics + Algorithm",
      organization: "IED São Paulo",
      location: "São Paulo, Brazil",
    },
    {
      talkId: "FAU/POLI2016",
      locale: "pt",
      title: "Form-finding com Grasshopper",
      organization: "II Encontro de Casca Estruturada",
      location: "FAU/POLI USP, São Paulo, Brasil",
    },
    {
      talkId: "FAU/POLI2016",
      locale: "en",
      title: "Form-finding with Grasshopper",
      organization: "II Structured Shell Meeting",
      location: "FAU/POLI USP, São Paulo, Brazil",
    },
  ]);

  await db.insert(CoursesAttended).values([
    {
      id: "CS50SQL2024",
      startDate: new Date("2024-06"),
      endDate: new Date("2024-07"),
      instructor: "Carter Zenke",
      link: "https://cs50.harvard.edu/sql/2024/",
    },
    {
      id: "CS50CS2023",
      startDate: new Date("2023-07"),
      endDate: new Date("2023-10"),
      instructor: "David J. Malan",
      link: "https://cs50.harvard.edu/x/2024/",
    },
    {
      id: "DigitalFuturesIntelligence2020",
      startDate: new Date("2020-06"),
      endDate: new Date("2020-07"),
      instructor:
        "Neil Leach, Antoine Picon, Sanford Kwinter, and Marrikka Trotter",
      link: "https://www.youtube.com/playlist?list=PLtuu5idZ57EVGDYgGdw72QxwXtPb_5bgq",
    },
    {
      id: "WikiHouseSIGraDi2018",
      startDate: new Date("2018-11"),
      instructor: "Gonçalo Castro Henriques, and Andrés Passaro",
      link: "http://sigradi2018.iau.usp.br/index.php/wiki-house-geracao-e-construcao-digital-material/index.html",
    },
    {
      id: "IASSOptimization2017",
      startDate: new Date("2017-09"),
      instructor: "Thomas Wortmann and Judyta Cichocka",
      link: "https://discourse.mcneel.com/t/thomas-wortmann-judyta-cichocka-and-adrian-krezlik-iass-2017-pre-symposium-master-class-september-22-24-hamburg-germany/45849",
    },
    {
      id: "FILEParametricDesign2017",
      startDate: new Date("2017-07"),
      instructor: "Henrique Stabile",
      link: "https://file.org.br/workshops/portugues-workshop-file-sao-paulo-2017/",
    },
    {
      id: "RhinoDayGalapagos2016",
      startDate: new Date("2016-09"),
      instructor: "Victor Calixto",
    },
    {
      id: "FILEDigitalTheremin2016",
      startDate: new Date("2016-07"),
      instructor: "Mauricio Jabur",
    },
    {
      id: "FILEDataDesign2016",
      startDate: new Date("2016-07"),
      instructor: "Dyego Digiandomenico, Gabriele Landim, Henrique Fischer",
    },
    {
      id: "FabLabWoodwork2016",
      startDate: new Date("2016-06"),
      instructor: "Lucas S. M. Coutinho",
    },
    {
      id: "FabLabArduinoLEDS2016",
      startDate: new Date("2016-06"),
      instructor: "Beatriz da Rocha",
    },
    {
      id: "RedBullElectronics2016",
      startDate: new Date("2016-06"),
      instructor: "Lina Lopes",
    },
    {
      id: "FabLabElectronicsBasic2016",
      startDate: new Date("2016-06"),
      instructor: "César A. G. de Alencar",
    },
    {
      id: "FabLabInteractivity2016",
      startDate: new Date("2016-05"),
      instructor: "Ruairi Glynn and grad Students from UCL London",
    },
    {
      id: "FAUProcessing2011",
      startDate: new Date("2011-08"),
      endDate: new Date("2011-12"),
      instructor: "Ricardo Nakamura",
    },
  ]);

  await db.insert(CoursesAttendedTranslations).values([
    {
      courseId: "CS50SQL2024",
      locale: "pt",
      title: "Introdução a Banco de Dados com SQL",
      organization: "Universidade Harvard",
      location: "Online",
    },
    {
      courseId: "CS50SQL2024",
      locale: "en",
      title: "CS50's Introduction to Databases with SQL",
      organization: "Harvard University",
      location: "Online",
    },
    {
      courseId: "CS50CS2023",
      locale: "pt",
      title: "Introdução à Ciência da Computação",
      organization: "Universidade Harvard",
      location: "Online",
    },
    {
      courseId: "CS50CS2023",
      locale: "en",
      title: "CS50's Introduction to Computer Science",
      organization: "Harvard University",
      location: "Online",
    },
    {
      courseId: "DigitalFuturesIntelligence2020",
      locale: "pt",
      title: "Inteligência",
      organization: "Digital Futures World 2020",
      location: "Online",
    },
    {
      courseId: "DigitalFuturesIntelligence2020",
      locale: "en",
      title: "Intelligence",
      organization: "Digital Futures World 2020",
      location: "Online",
    },
    {
      courseId: "WikiHouseSIGraDi2018",
      locale: "pt",
      title: "Wiki-House: Geração e Construção Digital-Material",
      organization: "SIGraDi 2018",
      location: "São Carlos, Brasil",
    },
    {
      courseId: "WikiHouseSIGraDi2018",
      locale: "en",
      title: "Wiki-House: Generation and Digital-Material Construction",
      organization: "SIGraDi 2018",
      location: "São Carlos, Brazil",
    },
    {
      courseId: "IASSOptimization2017",
      locale: "pt",
      title:
        "Interfacing Architecture, Engineering, and Mathematical Optimization",
      organization: "IASS 2017",
      location: "Hamburgo, Alemanha",
    },
    {
      courseId: "IASSOptimization2017",
      locale: "en",
      title:
        "Interfacing Architecture, Engineering, and Mathematical Optimization",
      organization: "IASS 2017",
      location: "Hamburg, Germany",
    },
    {
      courseId: "FILEParametricDesign2017",
      locale: "pt",
      title: "Design Paramétrico com Arduino e Grasshopper",
      organization: "FILE Festival",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FILEParametricDesign2017",
      locale: "en",
      title: "Parametric Design with Arduino and Grasshopper",
      organization: "FILE Festival",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "RhinoDayGalapagos2016",
      locale: "pt",
      title: "Workshop Grasshopper com Galapagos",
      organization: "Rhino Day",
      location: "FAU-Mackenzie, São Paulo, Brasil",
    },
    {
      courseId: "RhinoDayGalapagos2016",
      locale: "en",
      title: "Workshop Grasshopper with Galapagos",
      organization: "Rhino Day",
      location: "FAU-Mackenzie, São Paulo, Brazil",
    },
    {
      courseId: "FILEDigitalTheremin2016",
      locale: "pt",
      title: "Theremin Digital com Arduino",
      organization: "FILE Festival",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FILEDigitalTheremin2016",
      locale: "en",
      title: "Digital Theremin with Arduino",
      organization: "FILE Festival",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "FILEDataDesign2016",
      locale: "pt",
      title: "Dados no Processo de Design",
      organization: "FILE Festival",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FILEDataDesign2016",
      locale: "en",
      title: "Data in the Design Process",
      organization: "FILE Festival",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "FabLabWoodwork2016",
      locale: "pt",
      title: "Introdução ao Trabalho em Madeira",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FabLabWoodwork2016",
      locale: "en",
      title: "Introduction to Woodwork",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "FabLabArduinoLEDS2016",
      locale: "pt",
      title: "Arduino & LEDS",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FabLabArduinoLEDS2016",
      locale: "en",
      title: "Arduino & LEDS",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "RedBullElectronics2016",
      locale: "pt",
      title: "Electronics in the darkness",
      organization: "Red Bull Station",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "RedBullElectronics2016",
      locale: "en",
      title: "Electronics in the darkness",
      organization: "Red Bull Station",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "FabLabElectronicsBasic2016",
      locale: "pt",
      title: "Eletrônica Básica",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FabLabElectronicsBasic2016",
      locale: "en",
      title: "Electronics Basic",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "FabLabInteractivity2016",
      locale: "pt",
      title: "Interatividade: Arquitetura e Design Responsivo",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FabLabInteractivity2016",
      locale: "en",
      title: "Interactivity: Architecture and Responsive Design",
      organization: "Fab Lab Livre SP",
      location: "São Paulo, Brazil",
    },
    {
      courseId: "FAUProcessing2011",
      locale: "pt",
      title: "Fundamentos de Computação com Processing",
      organization: "FAU-USP",
      location: "São Paulo, Brasil",
    },
    {
      courseId: "FAUProcessing2011",
      locale: "en",
      title: "Fundamentals of Computation with Processing",
      organization: "FAU-USP",
      location: "São Paulo, Brazil",
    },
  ]);

  await db.insert(Works).values([
    {
      id: "life-lamp",
      startDate: new Date("2017-12"),
      endDate: new Date("2017-01"),
      link: "/projects/life-lamp-by-estudio-guto-requena-for-decimal/",
    },
    {
      id: "margarita-house",
      startDate: new Date("2017-06"),
      endDate: new Date("2017-08"),
    },
    {
      id: "burn",
      startDate: new Date("2016-06"),
      endDate: new Date("2016-11"),
    },
    {
      id: "le-sandwich",
      startDate: new Date("2016-06"),
      endDate: new Date("2016-07"),
    },
    {
      id: "bs-website",
      startDate: new Date("2023-08"),
      endDate: new Date("2024-04"),
      link: "https://buildsystems.de",
    },
    {
      id: "bs-kfw-funding-calculator",
      startDate: new Date("2023-07"),
      endDate: new Date("2023-08"),
      link: "https://app.buildsystems.de",
    },
    {
      id: "bs-circular-component-creator",
      startDate: new Date("2023-06"),
      endDate: new Date("2023-07"),
    },
    {
      id: "bs-ontology",
      startDate: new Date("2023-03"),
      endDate: new Date("2023-06"),
    },
    { id: "bs-gh-csharp-plugin", startDate: new Date("2023-03") },
    { id: "bs-powerbi", startDate: new Date("2023-02") },
    {
      id: "bs-timber-component-configurator",
      startDate: new Date("2023-01"),
      endDate: new Date("2023-02"),
    },
    { id: "bs-urban-site-configurator", startDate: new Date("2023-01") },
    { id: "ae-curious-desert", startDate: new Date("2021-10") },
    { id: "ae-aids", startDate: new Date("2022-09") },
    { id: "ae-dome-teshima", startDate: new Date("2022-08") },
    { id: "ae-harmonious-cycle", startDate: new Date("2022-07") },
    {
      id: "ae-common-sky",
      startDate: new Date("2021-12"),
      endDate: new Date("2022-06"),
    },
    { id: "ae-parapivot", startDate: new Date("2022-05") },
    {
      id: "ae-canyon",
      startDate: new Date("2022-01"),
      endDate: new Date("2022-02"),
    },
    { id: "ae-donum", startDate: new Date("2022-01") },
    { id: "ar-zero-tankstelle", startDate: new Date("2021-12") },
    {
      id: "ar-disney-wonder",
      startDate: new Date("2021-09"),
      endDate: new Date("2021-10"),
    },
    {
      id: "ar-seilnetz-muttenz",
      startDate: new Date("2021-09"),
      endDate: new Date("2021-10"),
    },
    { id: "ar-wood-research", startDate: new Date("2022-08") },
    { id: "ar-membranaustausch", startDate: new Date("2021-07") },
    { id: "ar-mvv-uber", startDate: new Date("2021-07") },
    {
      id: "ar-automatic-cutting-pattern",
      startDate: new Date("2021-02"),
      endDate: new Date("2021-06"),
    },
    {
      id: "ar-radom-raisting",
      startDate: new Date("2021-03"),
      endDate: new Date("2021-05"),
      link: "https://www.ar-ingenieure.com/projects/radom-raisting",
    },
    { id: "ar-neubau-parkhaus", startDate: new Date("2021-01") },
    { id: "ar-witterungsschutz-romermauer", startDate: new Date("2021-01") },
    { id: "ar-mechanical-bridge", startDate: new Date("2021-01") },
    {
      id: "icd-coreless-filament",
      startDate: new Date("2020-08"),
      endDate: new Date("2020-10"),
    },
    {
      id: "icd-website-migration",
      startDate: new Date("2019-12"),
      endDate: new Date("2020-10"),
    },
    { id: "icd-carbon-filament", startDate: new Date("2020-07") },
    {
      id: "icd-tower-selfcurving",
      startDate: new Date("2020-03"),
      endDate: new Date("2020-04"),
    },
    {
      id: "mb-blastu-2019",
      startDate: new Date("2019-01"),
      endDate: new Date("2019-08"),
    },
    { id: "mb-casa-jardim-award", startDate: new Date("2019-06") },
    { id: "mb-ita-house", startDate: new Date("2019-04") },
    {
      id: "mb-itau-rockinrio",
      startDate: new Date("2019-02"),
      endDate: new Date("2019-04"),
    },
    { id: "mb-embraer-pavilion", startDate: new Date("2019-01") },
    { id: "mb-camper-thailand", startDate: new Date("2018-12") },
    { id: "mb-the-first-blow", startDate: new Date("2018-11") },
    {
      id: "mb-animale-jewelry",
      startDate: new Date("2018-11"),
      endDate: new Date("2018-12"),
    },
    {
      id: "mb-hitchcock",
      startDate: new Date("2018-07"),
      endDate: new Date("2018-10"),
    },
    {
      id: "mb-bar-stage-heineken",
      startDate: new Date("2018-06"),
      endDate: new Date("2018-11"),
    },
    {
      id: "mb-nike-air-guitar",
      startDate: new Date("2018-03"),
      endDate: new Date("2018-04"),
    },
    { id: "mb-tidelli-wave", startDate: new Date("2017-08") },
    {
      id: "mb-homa-restaurant",
      startDate: new Date("2017-01"),
      endDate: new Date("2017-12"),
    },
    { id: "mb-insideout", startDate: new Date("2017-06") },
    {
      id: "mb-asha-house",
      startDate: new Date("2016-01"),
      endDate: new Date("2017-12"),
    },
    { id: "mb-o3-pavilion", startDate: new Date("2017-03") },
    { id: "mb-live-talks", startDate: new Date("2016-10") },
    { id: "mb-parada-coca-cola", startDate: new Date("2016-08") },
    { id: "mb-coca-cola-taste-fashion", startDate: new Date("2016-04") },
    {
      id: "mb-ekoa-park",
      startDate: new Date("2015-04"),
      endDate: new Date("2016-02"),
    },
  ]);

  await db.insert(WorksTranslations).values([
    {
      workId: "life-lamp",
      locale: "pt",
      title: "Life Lamp",
      company: "Freelance",
      location: "São Paulo, Brasil",
      category: "Computational Design",
      description:
        "Conceito do Estudio Guto Requena para Decimal. Designer computacional responsável pelo programa.",
    },
    {
      workId: "life-lamp",
      locale: "en",
      title: "Life Lamp",
      company: "Freelance",
      location: "São Paulo, Brazil",
      category: "Computational Design",
      description:
        "Concept by Estudio Guto Requena for Decimal. Computational designer responsible for the program.",
    },
    {
      workId: "margarita-house",
      locale: "pt",
      title: "Casa Margarita",
      company: "Freelance",
      location: "São Paulo, Brasil",
      category: "Arquitetura",
      description: "Reforma de uma casa de classe média.",
    },
    {
      workId: "margarita-house",
      locale: "en",
      title: "Margarita House",
      company: "Freelance",
      location: "São Paulo, Brazil",
      category: "Architectural Design",
      description: "Full middle class house renovation.",
    },
    {
      workId: "burn",
      locale: "pt",
      title: "Burn",
      company: "Freelance",
      location: "São Paulo, Brasil",
      category: "Ação de Marketing",
      description: "Renderização de instalações, bares e roupas.",
    },
    {
      workId: "burn",
      locale: "en",
      title: "Burn",
      company: "Freelance",
      location: "São Paulo, Brazil",
      category: "Marketing Action",
      description: "Rendering of installations, bars and clothing.",
    },
    {
      workId: "le-sandwich",
      locale: "pt",
      title: "Le Sandwich",
      company: "Freelance",
      location: "São Paulo, Brasil",
      category: "Arquitetura",
      description:
        "Conversão de uma agência bancária de dois andares em um restaurante.",
    },
    {
      workId: "le-sandwich",
      locale: "en",
      title: "Le Sandwich",
      company: "Freelance",
      location: "São Paulo, Brazil",
      category: "Architectural Design",
      description: "Converted a two-floors bank agency into a restaurant.",
    },
    {
      workId: "bs-website",
      locale: "pt",
      title: "BuildSystems Website",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Desenvolvimento Web",
      description:
        "Desenvolvimento do site da BuildSystems com o framework Astro, utilizando a API do Notion como CMS.",
      link: "https://buildsystems.de",
    },
    {
      workId: "bs-website",
      locale: "en",
      title: "BuildSystems Website",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Web development",
      description:
        "Developed BuildSystems website with the Astro framework, leveraging Notion API to use Notion as a CMS.",
      link: "https://buildsystems.de",
    },
    {
      workId: "bs-kfw-funding-calculator",
      locale: "en",
      title: "KfW Funding Calculator",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Web development",
      description:
        "Developed the web app KfW Funding Calculator, using Angular and PostgreSQL.",
      link: "https://app.buildsystems.de",
    },
    {
      workId: "bs-kfw-funding-calculator",
      locale: "pt",
      title: "Calculadora de Financiamento KfW",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Desenvolvimento Web",
      description:
        "Desenvolvimento do aplicativo web Calculadora de Financiamento KfW, usando Angular e PostgreSQL.",
      link: "https://app.buildsystems.de",
    },
    {
      workId: "bs-circular-component-creator",
      locale: "en",
      title: "Circular Component Creator",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "UI/UX design",
      description:
        "Developed the interface for a web app to create building components.",
    },
    {
      workId: "bs-circular-component-creator",
      locale: "pt",
      title: "Criador de Componentes Circulares",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "UI/UX design",
      description:
        "Desenvolvimento da interface para um aplicativo web de criação de componentes construtivos.",
    },
    {
      workId: "bs-ontology",
      locale: "en",
      title: "BuildSystems Ontology",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Ontology design",
      description: "Research about schemas, object models and databases.",
    },
    {
      workId: "bs-ontology",
      locale: "pt",
      title: "Ontologia BuildSystems",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Design de Ontologia",
      description:
        "Pesquisa sobre esquemas, modelos de objetos e bancos de dados.",
    },
    {
      workId: "bs-gh-csharp-plugin",
      locale: "en",
      title: "Grasshopper C# plugin",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Software development",
      description:
        "Developed a Grasshopper plugin with the functionality of previous configurators.",
    },
    {
      workId: "bs-gh-csharp-plugin",
      locale: "pt",
      title: "Plugin Grasshopper C#",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Desenvolvimento de Software",
      description:
        "Desenvolvimento de um plugin Grasshopper com funcionalidades dos configuradores anteriores.",
    },
    {
      workId: "bs-powerbi",
      locale: "en",
      title: "Data visualization with Power BI",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Data visualization",
      description:
        "Developed a workflow connecting Grasshopper data to Power BI.",
    },
    {
      workId: "bs-powerbi",
      locale: "pt",
      title: "Visualização de Dados com Power BI",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Visualização de Dados",
      description:
        "Desenvolvimento de um fluxo conectando dados do Grasshopper ao Power BI.",
    },
    {
      workId: "bs-timber-component-configurator",
      locale: "en",
      title: "Timber Component Configurator",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Computational design",
      description:
        "Development of a Grasshopper configurator for timber components using EPD data.",
    },
    {
      workId: "bs-timber-component-configurator",
      locale: "pt",
      title: "Configurador de Componentes de Madeira",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Design Computacional",
      description:
        "Desenvolvimento de um configurador Grasshopper para componentes de madeira usando dados EPD.",
    },
    {
      workId: "bs-urban-site-configurator",
      locale: "en",
      title: "Urban Site Configurator",
      company: "BuildSystems GmbH",
      location: "Munich, Germany",
      category: "Computational design",
      description:
        "Development of a Grasshopper configurator to create building envelopes.",
    },
    {
      workId: "bs-urban-site-configurator",
      locale: "pt",
      title: "Configurador de Sítio Urbano",
      company: "BuildSystems GmbH",
      location: "Munique, Alemanha",
      category: "Design Computacional",
      description:
        "Desenvolvimento de um configurador Grasshopper para criar envelopes de edifícios.",
    },
    {
      workId: "ae-curious-desert",
      locale: "en",
      title: "The curious desert",
      company: "ArtEngineering GmbH",
      location: "Qatar desert",
      category: "Art installations",
      description:
        "Art installations by Olafur Eliasson. Detailing of steel structure.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10162/5",
    },
    {
      workId: "ae-curious-desert",
      locale: "pt",
      title: "O deserto curioso",
      company: "ArtEngineering GmbH",
      location: "Deserto do Qatar",
      category: "Instalações de arte",
      description:
        "Instalações de arte de Olafur Eliasson. Detalhamento da estrutura de aço.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10162/5",
    },
    {
      workId: "ae-aids",
      locale: "en",
      title: "AIDS",
      company: "ArtEngineering GmbH",
      location: "In front of Stedelijk Museum Amsterdam",
      category: "Sculpture",
      description: "Technical and fabrication drawings.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10166/3",
    },
    {
      workId: "ae-aids",
      locale: "pt",
      title: "AIDS",
      company: "ArtEngineering GmbH",
      location: "Em frente ao Stedelijk Museum Amsterdam",
      category: "Escultura",
      description: "Desenhos técnicos e de fabricação.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10166/3",
    },
    {
      workId: "ae-dome-teshima",
      locale: "en",
      title: "Dome at Teshima Island",
      company: "ArtEngineering GmbH",
      location: "Teshima, Japan",
      category: "Installation",
      description: "Technical drawings, logistics for transportation.",
    },
    {
      workId: "ae-dome-teshima",
      locale: "pt",
      title: "Domo na Ilha de Teshima",
      company: "ArtEngineering GmbH",
      location: "Teshima, Japão",
      category: "Instalação",
      description: "Desenhos técnicos, logística para transporte.",
    },
    {
      workId: "ae-harmonious-cycle",
      locale: "en",
      title: "A harmonious cycle of interconnected nows",
      company: "ArtEngineering GmbH",
      location: "Azabudai Hills Gallery, Tokyo, Japan",
      category: "Sculpture",
      description:
        "Sculpture by Olafur Eliasson. Aiding the detailing and prototyping; logistics for transportation.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10169/0",
    },
    {
      workId: "ae-harmonious-cycle",
      locale: "pt",
      title: "Um ciclo harmonioso de agoras interconectados",
      company: "ArtEngineering GmbH",
      location: "Azabudai Hills Gallery, Tóquio, Japão",
      category: "Escultura",
      description:
        "Escultura de Olafur Eliasson. Apoio no detalhamento e prototipagem; logística para transporte.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10169/0",
    },
    {
      workId: "ae-common-sky",
      locale: "en",
      title: "Common Sky",
      company: "ArtEngineering GmbH",
      location: "Buffalo AKG Art Museum, Buffalo, USA",
      category: "Complex spatial architecture",
      description:
        "By Studio Other Spaces. Parametric detailing and automated digital fabrication workflow.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10165/4",
    },
    {
      workId: "ae-common-sky",
      locale: "pt",
      title: "Common Sky",
      company: "ArtEngineering GmbH",
      location: "Buffalo AKG Art Museum, Buffalo, EUA",
      category: "Arquitetura espacial complexa",
      description:
        "Por Studio Other Spaces. Detalhamento paramétrico e fluxo de fabricação digital automatizado.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10165/4",
    },
    {
      workId: "ae-parapivot",
      locale: "en",
      title: "ParaPivot",
      company: "ArtEngineering GmbH",
      location: "Archived",
      category: "Sculpture",
      description:
        "Five-meters, steel and stone sculpture by Studio Alicja Kwade. Detailing of the structural framing.",
    },
    {
      workId: "ae-parapivot",
      locale: "pt",
      title: "ParaPivot",
      company: "ArtEngineering GmbH",
      location: "Arquivado",
      category: "Escultura",
      description:
        "Escultura de cinco metros, aço e pedra, de Studio Alicja Kwade. Detalhamento da estrutura.",
    },
    {
      workId: "ae-canyon",
      locale: "en",
      title: "Canyon",
      company: "ArtEngineering GmbH",
      location: "Louis Vuitton, Paris, France",
      category: "Sculpture",
      description:
        "Seven-meters-tall steel sculpture by Katharina Grosse. Computational form-fitting using developable surfaces.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10160/8",
    },
    {
      workId: "ae-canyon",
      locale: "pt",
      title: "Canyon",
      company: "ArtEngineering GmbH",
      location: "Louis Vuitton, Paris, França",
      category: "Escultura",
      description:
        "Escultura de aço de sete metros de Katharina Grosse. Ajuste computacional de forma usando superfícies desenvolvíveis.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10160/8",
    },
    {
      workId: "ae-donum",
      locale: "en",
      title: "Donum",
      company: "ArtEngineering GmbH",
      location: "Donum Estate, Sonoma, USA",
      category: "Architectural Design",
      description:
        "Vertical Panorama Pavilion by Studio Other Spaces. Wine-tasting space. Aiding the detailing.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10160/8",
    },
    {
      workId: "ae-donum",
      locale: "pt",
      title: "Donum",
      company: "ArtEngineering GmbH",
      location: "Donum Estate, Sonoma, EUA",
      category: "Design Arquitetônico",
      description:
        "Vertical Panorama Pavilion por Studio Other Spaces. Espaço de degustação de vinhos. Apoio no detalhamento.",
      link: "https://www.art-engineering.net/index.php/project/project_detail_ger/10160/8",
    },
    {
      workId: "ar-zero-tankstelle",
      locale: "en",
      title: "ZERO Tankstelle",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Conceptual",
      category: "Steel and membrane structure",
      description: "Gas station typology. Rendering of the proposal.",
    },
    {
      workId: "ar-zero-tankstelle",
      locale: "pt",
      title: "ZERO Posto de Gasolina",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Conceitual",
      category: "Estrutura de aço e membrana",
      description: "Tipologia de posto de gasolina. Renderização da proposta.",
    },
    {
      workId: "ar-disney-wonder",
      locale: "en",
      title: "Disney Wonder",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Cruise",
      category: "Retractable membrane cover",
      description: "Production of drawings for membrane fabrication.",
    },
    {
      workId: "ar-disney-wonder",
      locale: "pt",
      title: "Disney Wonder",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Cruzeiro",
      category: "Cobertura de membrana retrátil",
      description: "Produção de desenhos para fabricação da membrana.",
    },
    {
      workId: "ar-seilnetz-muttenz",
      locale: "en",
      title: "Seilnetz Muttenz",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Muttenz, Switzerland",
      category: "Cablenet structure",
      description:
        "Form-finding of the cablenet structure and quantity takeoff.",
    },
    {
      workId: "ar-seilnetz-muttenz",
      locale: "pt",
      title: "Seilnetz Muttenz",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Muttenz, Suíça",
      category: "Estrutura de cabos",
      description:
        "Form-finding da estrutura de cabos e levantamento de quantidades.",
    },
    {
      workId: "ar-wood-research",
      locale: "en",
      title: "Wood research",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Internal",
      category: "Research",
      description: "Researching cutting-edge technology for wood construction.",
    },
    {
      workId: "ar-wood-research",
      locale: "pt",
      title: "Pesquisa em Madeira",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Interno",
      category: "Pesquisa",
      description:
        "Pesquisa de tecnologias de ponta para construção em madeira.",
    },
    {
      workId: "ar-membranaustausch",
      locale: "en",
      title: "Membranaustausch",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Schlosses Neuwildenstein, Österreich",
      category: "Water retention",
      description: "Mechanical drawings and rendering of the facade.",
    },
    {
      workId: "ar-membranaustausch",
      locale: "pt",
      title: "Membranaustausch",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Schlosses Neuwildenstein, Áustria",
      category: "Retenção de água",
      description: "Desenhos mecânicos e renderização da fachada.",
    },
    {
      workId: "ar-mvv-uber",
      locale: "en",
      title: "MVV Überdachung Vorplatz",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Mannheim, Germany",
      category: "Membrane cover",
      description: "Form-finding of membrane structures using Kangaroo 2.",
    },
    {
      workId: "ar-mvv-uber",
      locale: "pt",
      title: "MVV Überdachung Vorplatz",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Mannheim, Alemanha",
      category: "Cobertura de membrana",
      description: "Form-finding de estruturas de membrana usando Kangaroo 2.",
    },
    {
      workId: "ar-automatic-cutting-pattern",
      locale: "en",
      title: "Automatic cutting pattern",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Internal",
      category: "Research",
      description: "Development of automatized cutting patterns for membranes.",
    },
    {
      workId: "ar-automatic-cutting-pattern",
      locale: "pt",
      title: "Padrão de corte automatizado",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Interno",
      category: "Pesquisa",
      description:
        "Desenvolvimento de padrões de corte automatizados para membranas.",
    },
    {
      workId: "ar-radom-raisting",
      locale: "en",
      title: "Radom Raisting",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Raisting, Germany",
      category: "Inflatable dome",
      description: "Simulation of the deployment and collision avoidance.",
      link: "https://www.ar-ingenieure.com/projects/radom-raisting",
    },
    {
      workId: "ar-radom-raisting",
      locale: "pt",
      title: "Radom Raisting",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Raisting, Alemanha",
      category: "Domo inflável",
      description: "Simulação da implantação e prevenção de colisões.",
      link: "https://www.ar-ingenieure.com/projects/radom-raisting",
    },
    {
      workId: "ar-neubau-parkhaus",
      locale: "en",
      title: "Neubau Parkhaus Swissprintersarea",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Zofingen, Switzerland",
      category: "Facade detail",
      description: "Mechanical drawings and rendering of the facade.",
    },
    {
      workId: "ar-neubau-parkhaus",
      locale: "pt",
      title: "Neubau Parkhaus Swissprintersarea",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Zofingen, Suíça",
      category: "Detalhe de fachada",
      description: "Desenhos mecânicos e renderização da fachada.",
    },
    {
      workId: "ar-witterungsschutz-romermauer",
      locale: "en",
      title: "Witterungsschutz Römermauer",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Wiesbaden, Germany",
      category: "Competition",
      description:
        "Project coordination, membrane cover integrating the landscape.",
    },
    {
      workId: "ar-witterungsschutz-romermauer",
      locale: "pt",
      title: "Witterungsschutz Römermauer",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Wiesbaden, Alemanha",
      category: "Competição",
      description:
        "Coordenação do projeto, cobertura de membrana integrando a paisagem.",
    },
    {
      workId: "ar-mechanical-bridge",
      locale: "en",
      title: "Mechanical Bridge",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Archived",
      category: "Bridge study",
      description: "Simulation of the bridge opening and closing.",
    },
    {
      workId: "ar-mechanical-bridge",
      locale: "pt",
      title: "Ponte Mecânica",
      company: "Alfred Rein Ingenieure GmbH",
      location: "Arquivado",
      category: "Estudo de ponte",
      description: "Simulação da abertura e fechamento da ponte.",
    },
    {
      workId: "icd-coreless-filament",
      locale: "en",
      title: "Coreless Filament Winding",
      company: "ICD/ITKE University of Stuttgart",
      location: "ICD CCL, Stuttgart, Germany",
      category: "Structural Test",
      description:
        "Conducted natural fiber structural tests with Marta Gil Pérez for the livMatS pavilion.",
      link: "https://www.archdaily.com/966168/livmats-pavilion-icd-itke-university-of-stuttgart",
    },
    {
      workId: "icd-coreless-filament",
      locale: "pt",
      title: "Bobinamento sem núcleo",
      company: "ICD/ITKE Universidade de Stuttgart",
      location: "ICD CCL, Stuttgart, Alemanha",
      category: "Teste estrutural",
      description:
        "Testes estruturais com fibras naturais para o pavilhão livMatS.",
      link: "https://www.archdaily.com/966168/livmats-pavilion-icd-itke-university-of-stuttgart",
    },
    {
      workId: "icd-website-migration",
      locale: "en",
      title: "ICD Website Migration",
      company: "ICD/ITKE University of Stuttgart",
      location: "Online",
      category: "Web development",
      description: "Migration of ICD's website to the new template in OpenCMS.",
      link: "https://www.icd.uni-stuttgart.de/",
    },
    {
      workId: "icd-website-migration",
      locale: "pt",
      title: "Migração do site ICD",
      company: "ICD/ITKE Universidade de Stuttgart",
      location: "Online",
      category: "Desenvolvimento Web",
      description: "Migração do site do ICD para o novo template no OpenCMS.",
      link: "https://www.icd.uni-stuttgart.de/",
    },
    {
      workId: "icd-carbon-filament",
      locale: "en",
      title: "Carbon Filament Winding",
      company: "ICD/ITKE University of Stuttgart",
      location: "ICD, Stuttgart, Germany",
      category: "Photogrammetry",
      description:
        "Investigation of digital twins for small scale carbon fibre winding. Collaboration with Christoph Schlopschnat.",
      link: "https://www.icd.uni-stuttgart.de/research/research-projects/leichtbau-bw-innovation-challenge/",
    },
    {
      workId: "icd-carbon-filament",
      locale: "pt",
      title: "Bobinamento de filamento de carbono",
      company: "ICD/ITKE Universidade de Stuttgart",
      location: "ICD, Stuttgart, Alemanha",
      category: "Fotogrametria",
      description:
        "Investigação de gêmeos digitais para bobinamento de fibra de carbono em pequena escala.",
      link: "https://www.icd.uni-stuttgart.de/research/research-projects/leichtbau-bw-innovation-challenge/",
    },
    {
      workId: "icd-tower-selfcurving",
      locale: "en",
      title: "Tower using self-curving cross-laminated timber",
      company: "ICD/ITKE University of Stuttgart",
      location: "Germany",
      category: "Computational Design",
      description:
        "Computational designer for a project similar to the Urbach Tower.",
    },
    {
      workId: "icd-tower-selfcurving",
      locale: "pt",
      title: "Torre com madeira laminada auto-curvante",
      company: "ICD/ITKE Universidade de Stuttgart",
      location: "Alemanha",
      category: "Design Computacional",
      description:
        "Designer computacional para projeto semelhante à Urbach Tower.",
    },
    {
      workId: "mb-blastu-2019",
      locale: "en",
      title: "BlastU 2019",
      company: "Atelier Marko Brajovic",
      location: "Ibirapuera bienal pavilion, São Paulo, Brazil",
      category: "Parametric design",
      description: "Architect in charge of design and supervision.",
      link: "https://markobrajovic.com/pt-br/all/blastu-2019",
    },
    {
      workId: "mb-blastu-2019",
      locale: "pt",
      title: "BlastU 2019",
      company: "Atelier Marko Brajovic",
      location: "Pavilhão da Bienal do Ibirapuera, São Paulo, Brasil",
      category: "Design paramétrico",
      description: "Arquiteto responsável pelo projeto e supervisão.",
      link: "https://markobrajovic.com/pt-br/all/blastu-2019",
    },
    {
      workId: "mb-casa-jardim-award",
      locale: "en",
      title: "Casa e Jardim Award 2019",
      company: "Atelier Marko Brajovic",
      location: "Pinacoteca de São Paulo, São Paulo, Brazil",
      category: "Scenic design",
      description: "Architect in charge of the stage design and trophy.",
      link: "https://markobrajovic.com/pt-br/all/premio-casa-e-jardim-2019",
    },
    {
      workId: "mb-casa-jardim-award",
      locale: "pt",
      title: "Prêmio Casa e Jardim 2019",
      company: "Atelier Marko Brajovic",
      location: "Pinacoteca de São Paulo, São Paulo, Brasil",
      category: "Design cênico",
      description: "Arquiteto responsável pelo palco e troféu.",
      link: "https://markobrajovic.com/pt-br/all/premio-casa-e-jardim-2019",
    },
  ]);
}

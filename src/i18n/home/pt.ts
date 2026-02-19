import type { I18nHome } from "./types";
import buildSystemsCalculator from "@/assets/mockups/iphone-pro-calculator-mockup-2.png";
import buildSystemsPluginCover from "@/assets/mockups/grasshopper-macbook.png";
import artEngineeringCommonSkies from "@/assets/images/common-sky-01.jpg";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Bem-vindo ao meu escritório digital. Aqui, você encontra meu trabalho e pesquisa sobre design computacional e desenvolvimento de software para a indústria AEC.",
    coverAlt: "Foto de perfil do Daniel Locatelli",
  },
  hero: {
    id: "hero",
    hi: "Prazer,",
    greeting: "Daniel Locatelli",
    title: "Engenheiro de software",
    description:
      "Sou&nbsp;especialista no desenvolvimento de plugins, aplicações web e soluções de design computacional para arquitetura, engenharia e construção (AEC).",
    requestQuote: "Faça um orçamento",
    sendEmail: "Envie um Email",
    chat: {
      initialMessage:
        "Olá! Pergunte-me qualquer coisa sobre meu trabalho, experiência ou projetos.",
      inputPlaceholder: "Pergunte-me qualquer coisa...",
      headerTitle: "Assistente IA",
      poweredBy: "Desenvolvido com",
      errorMessage:
        "Desculpe, encontrei um erro. Por favor, tente novamente mais tarde.",
    },
  },
  service: {
    id: "serviços",
    title: "Minhas ofertas de serviços",
    list: [
      {
        title: "Plugins",
        description:
          "Ferramentas personalizadas para automatizar tarefas, integrar análises ou expandir as capacidades de um software. Especialista em C# para Rhino/Grasshopper, Revit e AutoCAD.",
        icon: "ph:puzzle-piece",
      },
      {
        title: "Aplicações Web",
        description:
          "Websites e aplicações web para gestão de projetos, ferramentas colaborativas, simuladores financeiros e visualização 3D. Foco em React, Astro e PostgreSQL.",
        icon: "ph:cursor-click",
      },
      {
        title: "Design Computacional",
        description:
          "Aplicação de estratégias avançadas de design computacional para otimizar e aprimorar processos AEC, aumentando a eficiência em projetos, análises e documentação.",
        icon: "ph:buildings",
      },
      {
        title: "Visualização de Dados",
        description:
          "Criação de dashboards para compreender, interpretar e agir com base em dados complexos de projetos. Desde dashboards online até frameworks corporativos no Power BI.",
        icon: "ph:chart-line-up",
      },
      {
        title: "Fabricação Digital",
        description:
          "Criação de scripts no Grasshopper para extrair dados a partir de modelos 3D paramétricos complexos para fabricação digital.",
        icon: "ph:resize",
      },
    ],
  },
  about: {
    id: "sobre",
    title: "Arquiteto + Programador",
    background:
      "Com formação em arquitetura e título de Mestre em Ciências pelo programa ITECH da Universidade de Stuttgart, aliado a dez anos de experiência que incluem design computacional em escritórios de engenharia na Alemanha, possuo um profundo entendimento dos desafios da indústria AEC.",
    approach:
      "Eu não apenas escrevo código; eu projeto e desenvolvo soluções de software sob medida para as necessidades de arquitetos, engenheiros e profissionais da construção, porque eu entendo o seu mundo.",
  },
  projects: {
    id: "projetos",
    title: "Destaques do Portfólio",
    list: [
      {
        title: "Calculadora de Financiamento da BuildSystems",
        context: "BuildSystems GmbH",
        contextLink: "https://buildsystems.de",
        description:
          "Aplicação web com formulários intuitivos e gráficos interativos para simular cenários de financiamento habitacional por meio do banco nacional alemão KfW.",
        technologies:
          "TypeScript, Angular, ng2-charts, Supabase, PostgreSQL, HTML, CSS.",
        imageUrl: buildSystemsCalculator,
        internalLink: "/projects/kfw-funding-calculator-by-buildsystems",
      },
      {
        title: "Plugin da BuildSystems para Grasshopper/Rhino3D",
        context: "BuildSystems GmbH",
        contextLink: "https://buildsystems.de",
        description:
          "Plugin para Grasshopper que permite aos projetistas realizar análises críticas de viabilidade e sustentabilidade diretamente no ambiente de projeto, promovendo tomadas de decisão mais informadas.",
        technologies: "C#, RhinoCommon, Grasshopper API, JSON.",
        imageUrl: buildSystemsPluginCover,
        internalLink: "/projects/buildsystems-plugin-for-grasshopper",
      },
      {
        title: "Extração de Dados para Fabricação Digital",
        context: "ArtEngineering GmbH",
        contextLink: "https://art-engineering.net",
        description:
          "Apoio à fabricação digital da instalação *Common Sky* usando Grasshopper e Sandbox Topology. Foco no processamento geométrico e automação dos fluxos de fabricação.",
        technologies: "Scripting em Grasshopper/Rhino3D.",
        imageUrl: artEngineeringCommonSkies,
        internalLink:
          "/projects/common-sky-by-artengineering-for-studio-other-spaces",
      },
    ],
    tech: "Tech:",
    viewFullArticle: "Veja o artigo completo",
  },
  testimonials: {
    id: "recomendações",
    title: "Recomendações",
    list: [
      {
        text: "O Sr. Locatelli sempre executou as tarefas que lhe foram atribuídas com total satisfação, atendendo e, em muitos aspectos, superando nossas expectativas.",
        author: "Martin Bittmann",
        context: "BuildSystems GmbH",
        position: "Fundador",
        contextLink: "https://buildsystems.de",
      },
      {
        text: "A conduta profissional do Sr. Locatelli foi exemplar. Ele demonstrou consistentemente uma combinação de brilhantismo técnico, pensamento estratégico e habilidade interpessoal. Sua capacidade de se integrar perfeitamente à dinâmica da equipe, mantendo um alto padrão de excelência profissional, fez dele um membro inestimável da equipe.",
        author: "Herwig Bretis",
        context: "ArtEngineering GmbH",
        position: "Diretor-gerente e proprietário",
        contextLink:
          "https://art-engineering.net/index.php/ge/cv_herwig_bretis",
      },
    ],
  },
  expertise: {
    id: "expertise",
    title: "Expertise",
    description:
      "Estou constantemente aprendendo as ferramentas mais recentes para garantir que estou desenvolvendo o sistema certo para cada tarefa.",
  },
  contact: {
    id: "contact",
    title: "Pronto para otimizar seus fluxos de trabalho?",
    description:
      "Vamos conversar sobre como minha experiência pode transformar seus desafios em soluções de software inovadoras.",
    letsTalk: "Vamos conversar",
    sendEmail: "Enviar Email",
  },
};

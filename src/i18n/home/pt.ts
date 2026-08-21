import type { I18nHome } from "./types";
import buildSystemsCalculator from "@/assets/homepage/iphone-pro-calculator-mockup-2.png";
import buildSystemsPluginCover from "@/assets/homepage/grasshopper-macbook.png";
import artEngineeringCommonSkies from "@/assets/homepage/common-sky-01.jpg";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Bem-vindo ao meu escritório digital. Aqui, você encontra meu trabalho e pesquisa sobre design computacional e desenvolvimento de software para a indústria AEC.",
    coverAlt: "Daniel Locatelli.",
  },
  hero: {
    id: "hero",
    hi: "Prazer,",
    greeting: "Daniel Locatelli",
    title: "Doutorando, ETH Zurique",
    description:
      "Sou&nbsp;doutorando no Gramazio Kohler Research, ETH Zurique, pesquisando do design computacional à fabricação de sistemas construtivos em placas de madeira e explorando como a IA pode apoiar o processo de projeto. Minha experiência inclui plugins, aplicações web e design computacional para arquitetura, engenharia e construção (AEC).",
    requestQuote: "Faça um orçamento",
    sendEmail: "Envie um Email",
    chat: {
      initialMessage:
        "Olá! Me pergunte alguma coisa sobre meu trabalho, experiência ou projetos.\n\n*Atenção: As respostas são geradas por IA (Anthropic Claude) e podem conter imprecisões. Este chat não constitui aconselhamento profissional, jurídico ou técnico. Por favor, verifique qualquer informação de forma independente.*",
      inputPlaceholder: "Me pergunte alguma coisa...",
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
        imageAlt:
          "Instalação Common Sky do Studio Other Spaces: uma cobertura geodésica de vidro e espelho sobre o átrio do Buffalo AKG Art Museum",
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
    tools: {
      autocad:
        "A ferramenta padrão da Autodesk para desenho técnico 2D/3D. Desenvolvo plugins para o AutoCAD (C#/.NET) que automatizam tarefas repetitivas de desenho.",
      civil3d:
        "O AutoCAD com ferramentas paramétricas para infraestrutura. Desenvolvo plugins para o Civil 3D que automatizam modelagem de terreno e produção de desenhos.",
      revit:
        "A ferramenta de modelagem BIM da Autodesk. Certified Professional desde 2014; desenvolvo add-ins para o Revit (C#/.NET) para automação de modelagem e troca de dados, como o importador do [DOKwood](/projects/dokwood).",
      dynamo:
        "Programação visual para o Revit. Uso para edições em lote, mapeamento de parâmetros e verificações de modelo que seriam tediosas à mão.",
      grasshopper:
        "Programação visual para o Rhino, meu principal ambiente de projeto desde 2015. Construo fluxos de form finding, dados de fabricação e [plugins em C#](/projects/buildsystems-plugin-for-grasshopper), e [ensino a ferramenta](/teaching/adaptive-grasshopper-workshop).",
      kangaroo:
        "Motor de física para o Grasshopper. Uso para form finding de membranas e malhas, como em [Canyon](/projects/canyon-by-artengineering-for-katharina-grosse) e [Radom Raisting](/projects/radom-raisting-by-ar-ingenieure).",
      galapagos:
        "Solver evolutivo integrado ao Grasshopper. Uso para otimização, como o posicionamento sem colisões das esferas suspensas da [Parada Coca-Cola](/projects/parada-coca-cola-by-atelier-marko-brajovic) e os [padrões de renda de bilro](/publications/algorithmic-design-for-traditional-bobbin-lace-methods).",
      weaverbird:
        "Subdivisão e suavização de malhas para o Grasshopper. Uso para geometrias orgânicas, como em [Models by Nature](/teaching/models-bynature-20) e na minha [pesquisa em biomimética](/research/architecture-biomimicry-algorithm).",
      ladybug:
        "Análise ambiental (sol, radiação, luz natural) para o Grasshopper. Uso em estudos iniciais de projeto e no [ensino](/teaching/a-decade-after-unemat).",
      culebra:
        "Comportamentos multiagente para o Grasshopper. Usei na [Life Lamp](/projects/life-lamp-by-estudio-guto-requena-for-decimal), em que emoções guiam o crescimento da luminária.",
      karamba:
        "Análise estrutural paramétrica para o Grasshopper. Uso para verificações rápidas de flexão e flambagem, como em [Building Across Scales](/research/building-across-scales).",
      python:
        "Minha linguagem de scripts e pesquisa. Componentes do Grasshopper, COMPAS na ETH, um plugin do Cadwork para o [DOKwood](/projects/dokwood) e pipelines de dados.",
      csharp:
        "Minha linguagem para plugins AEC. O [plugin da BuildSystems para o Grasshopper](/projects/buildsystems-plugin-for-grasshopper), o add-in do [DOKwood](/projects/dokwood) para o Revit e os modelos de dados por trás deles.",
      html: "A estrutura de todo site que entrego. Escrita de forma semântica para que as páginas continuem acessíveis e legíveis por agentes, como [neste site](/projects/portfolio-website).",
      css: "Tailwind na maioria dos layouts, CSS escrito à mão onde importa. Tipografia, estilos de impressão e as animações [deste site](/projects/portfolio-website).",
      typescript:
        "Minha linguagem do dia a dia para a web. [Este site](/projects/portfolio-website), o [site da BuildSystems](/projects/buildsystems-website) e a [Calculadora de Financiamento](/projects/kfw-funding-calculator-by-buildsystems).",
      flask:
        "Framework web leve em Python. Uso para APIs pequenas e protótipos que expõem lógica de pesquisa ou do Grasshopper via HTTP.",
      tanstack:
        "Framework React full-stack (Start, Query, Router). Uso em apps que precisam de carregamento de dados com tipagem segura.",
      astro:
        "Framework web focado em conteúdo. [Este portfólio](/projects/portfolio-website) e o [site da BuildSystems](/projects/buildsystems-website), com o Notion como CMS.",
      react:
        "Biblioteca de UI para interfaces interativas. O chat com IA [deste site](/projects/portfolio-website) e os web apps que construo para clientes.",
      mongodb:
        "Banco de dados de documentos. Uso em protótipos e ferramentas com dados flexíveis e aninhados.",
      sqlite:
        "Banco de dados SQL embutido. Uso em ferramentas locais, testes e pequenos conjuntos de dados de pesquisa.",
      postgresql:
        "Meu principal banco de dados relacional. Supabase por trás da [Calculadora de Financiamento](/projects/kfw-funding-calculator-by-buildsystems) e do vector store do [chat com IA deste site](/projects/portfolio-website).",
    },
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

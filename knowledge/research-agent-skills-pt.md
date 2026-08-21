URL: https://daniellocatelli.com/pt/research/agent-skills

# Agent skills

Description: Uma lista viva das skills de agente de que dependo ao trabalhar com o Claude Code: as que eu escrevi, as skills de engenharia e produtividade do Matt Pocock e skills da comunidade como a Superpowers e a Diagram Design.
Tags: Agent skills, Agentes de programação com IA
Authors: Daniel Nunes Locatelli
Date: August 2026
Link: https://github.com/daniel-locatelli/skills

Uma skill de agente é uma pasta com um `SKILL.md`: um conjunto curto e bem delimitado de instruções, referências e scripts que um agente de programação carrega quando uma tarefa corresponde à sua descrição. É a unidade em que a expertise viaja entre pessoas e agentes. Esta página é uma lista viva das skills que conquistaram um lugar permanente na minha configuração do Claude Code.

## Minhas skills

As publicadas ficam no repositório público [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills), agrupadas pela ferramenta ou domínio que servem (Revit, Grasshopper, madeira, web, git). São as skills que eu entregaria a um colega: cada uma trata de como uma ferramenta ou um formato se comporta, não de mim. Um conjunto adicional de skills pessoais permanece privado porque codifica a minha própria configuração: onde as coisas ficam, como são copiadas, como o doutorado é conduzido. Os dois tipos seguem a mesma forma. Um `SKILL.md` diz quando disparar, fixa os fatos que o modelo costuma errar e nomeia o ciclo que o agente precisa fechar antes de poder dar o trabalho por concluído.

### AEC

Quatro skills para as ferramentas com que trabalho diariamente em arquitetura, engenharia e construção. As duas skills de plugin respondem ao mesmo problema: os dados de treinamento dos LLMs envelhecem justamente onde as APIs do Revit e do Rhino mudam mais rápido, então, em vez de despejar conhecimento, cada uma fixa os fatos críticos de versão (frameworks alvo, mudanças de API, caminhos de manifesto e de deploy) e mantém o agente num ciclo verificado de build, deploy e teste. As outras duas entram nas próprias ferramentas. A **using-cordyceps** controla uma sessão ativa de Rhino e Grasshopper através de um servidor MCP: coloca e conecta componentes, configura componentes de script, lê a saída do solver, renderiza a cena. A **working-with-btlx** é a referência que o agente precisa ler antes de responder qualquer coisa sobre o formato BTLx de CNC para madeira, porque intervalos de parâmetros, faces de referência e versões do esquema são exatamente os detalhes que ele chutaria.

| Skill | O que faz |
| --- | --- |
| **creating-revit-plugin** | Cria add-ins nativos para Revit 2025 a 2027 |
| **creating-grasshopper-plugin** | Cria plugins compilados do Grasshopper para Rhino 8 |
| **using-cordyceps** | Controla uma sessão ativa de Rhino e Grasshopper a partir do agente |
| **working-with-btlx** | Trabalha com BTLx, o formato de intercâmbio para CNC de madeira: processamentos, faces de referência, versões do esquema |

### Qualidade

Três destas auditam um site em produção, e elas se encaixam. A **optimizing-web-performance** corrige os achados de Core Web Vitals e acessibilidade que movem a pontuação do Lighthouse. A **auditing-agent-readiness** verifica a pergunta mais recente: se um agente de IA consegue descobrir e usar o site (`llms.txt`, variantes em markdown, manifestos em `.well-known`, handshake MCP). A **auditing-website-quality** roda as duas, acrescenta SEO, cabeçalhos de segurança e integridade de conteúdo e i18n, e transforma o resultado num único scorecard ordenado, pronto para entregar a um cliente. A quarta, **preparing-pull-request**, trata da qualidade do que envio para repositórios de outras pessoas: antes de um PR ou issue sair, ela rastreia o defeito pelo blame e pelo histórico, varre o rastreador upstream em busca de duplicatas e trabalho em andamento, e verifica cada afirmação do texto do PR. O que têm em comum é que nenhuma deixa o agente dizer "pronto" sem evidência.

| Skill | O que faz |
| --- | --- |
| **optimizing-web-performance** | Roda o Lighthouse num site em produção e corrige o que move a pontuação |
| **auditing-website-quality** | Audita um site de ponta a ponta num scorecard ordenado |
| **auditing-agent-readiness** | Verifica se um site pode ser descoberto e utilizado por agentes de IA |
| **preparing-pull-request** | Rastreia a origem de um defeito e varre o rastreador upstream antes de abrir um PR no repositório de outra pessoa |

### Pessoal

Estas permanecem privadas porque codificam como eu trabalho, e não como uma ferramenta funciona. No centro está a **system**, um mapa único de referência: ela diz ao agente quais skills, repositórios, sistemas operacionais e domínios da vida existem, onde cada um fica, como iniciá-lo e qual das minhas convenções escritas o rege (como os repositórios são organizados no disco, como as pastas são nomeadas e arquivadas, qual stack um projeto novo usa por padrão). Um exemplo: meu Drive é dividido em domínios da vida (Finanças, Casa, Saúde, Profissional, Pesquisa, Ensino, e assim por diante), cada um com seu próprio livro de regras, e cada arquivo tem exatamente um lugar dentro deles. Uma nova apólice de seguro vai para `Finance/Insurance/`, numa pasta chamada `AAAA-MM_Seguradora`, datada pelo início da apólice e não por quando eu a guardei; quando termina, a pasta é movida para uma `_Archive/` irmã, para que o nível superior mostre apenas o que está vigente. Temas transversais são conectados por wikilinks em vez de cópias. Como a skill conhece essas regras, o agente arquiva o documento sozinho e eu nunca respondo "onde isso vai" duas vezes.

| Skill | O que faz |
| --- | --- |
| **system** | Mapeia cada skill, repositório, sistema e domínio da vida para onde fica e qual convenção o rege |
| **backup-system** | Meus arquivos estão espalhados por vários HDDs e SSDs, e essa organização fica mais complexa com o tempo; esta skill mantém tudo sistematicamente organizado |
| **phd** | Este é o meu assistente de doutorado: abre e fecha cada dia de trabalho com uma revisão adversarial da tese, da sua afirmação central e dos seus prazos |
| **searching-librarian** | Mantenho um grande acervo pessoal de artigos científicos num servidor doméstico; esta skill ensina o agente a consultá-lo, por tema, autor, DOI ou id, a partir de qualquer uma das minhas máquinas |

### Servidas por este site

Mais duas skills funcionam no sentido inverso: não são para o meu agente, mas para o seu. Este site publica **portfolio-content** (ler qualquer página como markdown simples, em três línguas) e **portfolio-mcp** (consultar projetos, pesquisa, ensino, publicações e CV através do servidor MCP somente leitura do site) em `/.well-known/agent-skills/`, para que um agente que chegue aqui saiba ler o site sem o raspar. Como são construídas está descrito na página do [site do portfólio](/pt/projects/portfolio-website).

## Skills do Matt Pocock

[mattpocock/skills](https://github.com/mattpocock/skills) é o que uso quando a tarefa é pensar, não digitar. Enquanto as minhas skills fixam fatos sobre uma ferramenta, estas moldam a própria conversa. As duas skills de "grill" são as que mais uso: antes de qualquer trabalho não trivial, o agente me entrevista até resolver cada ramo em aberto do plano, e a variante com docs deixa um registro das decisões (ADRs, um glossário). **codebase-design** e **domain-modeling** dão ao agente e a mim um vocabulário comum para o que são um bom módulo e uma boa linguagem de domínio, e **improve-codebase-architecture** aplica esse vocabulário a um repositório existente e relata onde ele poderia ser aprofundado. **handoff** passa uma conversa para outro agente sem perder o estado, e **teach** transforma o agente num tutor para mim: ele faz da pasta atual um espaço de aprendizado, com uma missão, lições curtas e autocontidas, fichas de referência e um registro do que aprendi, para que o tema seja aprendido ao longo de várias sessões em vez de numa só sentada.

| Skill | O que faz |
| --- | --- |
| **grill-me** | Interroga um plano até resolver cada ramo |
| **grill-with-docs** | A mesma entrevista, escrevendo a documentação do projeto pelo caminho |
| **codebase-design** | Projeta módulos profundos com interfaces pequenas |
| **domain-modeling** | Fixa a linguagem de domínio de um projeto |
| **improve-codebase-architecture** | Encontra e trabalha melhorias de arquitetura |
| **handoff** | Passa uma conversa para outro agente |
| **teach** | Ensina-me um tema ao longo de várias sessões, a partir de um espaço de lições, fichas de referência e registros de aprendizado |

## Skills da comunidade

Skills escritas por pessoas que não conheço, encontradas na comunidade e mantidas porque continuaram a merecer o lugar. Duas delas são estruturais: a Superpowers é a camada de processo sob todas as outras skills desta página, e a Diagram Design é como as figuras deste site são desenhadas. A terceira é a skill de design da própria Anthropic.

| Skill | O que faz |
| --- | --- |
| **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** | Diagramas de qualidade editorial, como o diagrama de arquitetura da página do [site do portfólio](/pt/projects/portfolio-website), de Cathryn Lavery |
| **[Superpowers](https://github.com/obra/superpowers)** | A camada de processo abaixo de tudo, do brainstorming à verificação, de Jesse Vincent |
| **frontend-design** | Design de UI distinto e intencional |

## Como decido o que fica

Duas perguntas. Primeira: é algo específico de um projeto? Então pertence ao `CLAUDE.md` daquele repositório, o arquivo de instruções que o agente lê em toda sessão, e não a uma skill: uma skill é para conhecimento que viaja entre projetos, e entre pessoas. Segunda: um parágrafo bem escrito no `CLAUDE.md` faria o mesmo trabalho? Se sim, a skill sai. Se ela mantém honesto um ciclo verificado, fixa fatos que o modelo erra ou faz as perguntas que eu esqueço de fazer, ela fica.

## Para onde as skills vão

Quase todas as skills em circulação hoje, as minhas incluídas, são sobre software: construir plugins, conduzir ferramentas, auditar sites, contribuir upstream. É onde os agentes são mais obviamente úteis agora, mas não é onde o formato termina. Um `SKILL.md` é uma unidade de conhecimento especializado, e a maior parte do conhecimento em arquitetura, engenharia e construção não é conhecimento de software: como montar um modelo paramétrico para que sobreviva a mudanças de projeto, como ler uma restrição estrutural ou de fabricação a partir de um desenho, o que um detalhe em madeira precisa de satisfazer antes de chegar à máquina, que perguntas um profissional faz antes de confiar num resultado. É esse o conhecimento que espero que a próxima geração de skills carregue, escrito pelas pessoas que o detêm, e é aí que pretendo contribuir a seguir: skills vindas do design computacional e da própria prática de AEC.

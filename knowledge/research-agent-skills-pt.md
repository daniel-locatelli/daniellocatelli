URL: https://daniellocatelli.com/pt/research/agent-skills

# Agent skills

Description: Uma lista viva das skills de agente de que dependo ao trabalhar com o Claude Code: as que eu escrevi, as skills de engenharia e produtividade do Matt Pocock e skills da comunidade como a Diagram Design.
Tags: Agent skills, Agentes de programação com IA
Authors: Daniel Nunes Locatelli
Date: August 2026
Link: https://github.com/daniel-locatelli/skills

Uma skill de agente é uma pasta com um `SKILL.md`: um conjunto curto e bem delimitado de instruções, referências e scripts que um agente de programação carrega quando uma tarefa corresponde à sua descrição. É a unidade em que a expertise viaja entre pessoas e agentes. Esta página é uma lista viva das skills que conquistaram um lugar permanente na minha configuração do Claude Code.

## Minhas skills

Estas ficam no repositório público [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills). O que têm em comum é uma resposta ao mesmo problema: os dados de treinamento dos LLMs envelhecem justamente onde as APIs mudam mais rápido, então, em vez de despejar conhecimento, cada skill fixa os fatos críticos de versão e mantém o agente num ciclo verificado de build, deploy e teste. Elas se dividem em três campos.

### AEC

| Skill | O que faz |
| --- | --- |
| **creating-revit-plugin** | Cria add-ins nativos para Revit 2025 a 2027 |
| **creating-grasshopper-plugin** | Cria plugins compilados do Grasshopper para Rhino 8 |
| **using-cordyceps** | Controla o Rhino e o Grasshopper a partir do agente |
| **working-with-btlx** | Trabalha com BTLx, o formato de intercâmbio para CNC de madeira: processamentos, faces de referência, versões do esquema |

### Qualidade

| Skill | O que faz |
| --- | --- |
| **optimizing-web-performance** | Audita um site em produção e corrige o que move a pontuação |
| **auditing-website-quality** | Audita um site de ponta a ponta num scorecard ordenado |
| **auditing-agent-readiness** | Verifica se um site é utilizável por agentes de IA |
| **preparing-pull-request** | Rastreia a origem de um defeito e varre o rastreador upstream antes de abrir um PR no repositório de outra pessoa |

### Pessoal

Estas permanecem privadas porque codificam como eu trabalho, e não como uma ferramenta funciona. A que mais uso é a `system`, um mapa único de referência: ela diz ao agente quais skills, repositórios, sistemas operacionais e domínios da vida existem, onde cada um fica, como iniciá-lo e qual padrão se aplica. Em vez de adivinhar onde um arquivo ou uma convenção pertence, o agente pergunta "onde fica X" ou "qual é a minha regra para Y" e recebe uma resposta definitiva. É menos uma skill do que um assistente pessoal ao qual as outras skills se conectam. Logo abaixo dela fica uma skill de backup que codifica meu modelo de armazenamento (em qual disco cada arquivo fica, separação entre camadas de armazenamento e backup, e a regra de duas cópias para tudo o que é insubstituível) e roda as verificações de desvio. Ao lado delas ficam um assistente de doutorado que me sabatina sobre a tese e uma skill de busca na biblioteca, que consulta um acervo pessoal de artigos científicos convertidos em markdown, hospedado num Mac mini acessível via Tailscale a partir de qualquer uma das minhas máquinas.

### Servidas por este site

Mais duas skills funcionam no sentido inverso: não são para o meu agente, mas para o seu. Este site publica **portfolio-content** (ler qualquer página como markdown simples, em três línguas) e **portfolio-mcp** (consultar projetos, pesquisa, ensino, publicações e CV através do servidor MCP somente leitura do site) em `/.well-known/agent-skills/`, para que um agente que chegue aqui saiba ler o site sem o raspar. Como são construídas está descrito na página do [site do portfólio](/pt/projects/portfolio-website).

## Skills do Matt Pocock

[mattpocock/skills](https://github.com/mattpocock/skills) é o que uso quando a tarefa é pensar, não digitar.

| Skill | O que faz |
| --- | --- |
| **grill-me** | Interroga um plano até resolver cada ramo |
| **grill-with-docs** | A mesma entrevista, escrevendo a documentação do projeto pelo caminho |
| **codebase-design** | Projeta módulos profundos com interfaces pequenas |
| **domain-modeling** | Fixa a linguagem de domínio de um projeto |
| **improve-codebase-architecture** | Encontra e trabalha melhorias de arquitetura |
| **handoff** | Passa uma conversa para outro agente |
| **teach** | Ensina um conceito ao longo de sessões |

## Skills da comunidade

| Skill | O que faz |
| --- | --- |
| **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** | Diagramas de qualidade editorial, como o diagrama de arquitetura da página do [site do portfólio](/pt/projects/portfolio-website), de Cathryn Lavery |
| **[Superpowers](https://github.com/obra/superpowers)** | A camada de processo abaixo de tudo, do brainstorming à verificação, de Jesse Vincent |
| **frontend-design** | Design de UI distinto e intencional |

## Como decido o que fica

Um parágrafo bem escrito no `CLAUDE.md` faria o mesmo trabalho? Se sim, a skill sai. Se ela mantém honesto um ciclo verificado, fixa fatos que o modelo erra ou faz as perguntas que eu esqueço de fazer, ela fica.

## Para onde as skills vão

Quase todas as skills em circulação hoje, as minhas incluídas, são sobre software: construir plugins, conduzir ferramentas, auditar sites, contribuir upstream. É onde os agentes são mais obviamente úteis agora, mas não é onde o formato termina. Um `SKILL.md` é uma unidade de conhecimento especializado, e a maior parte do conhecimento em arquitetura, engenharia e construção não é conhecimento de software: como montar um modelo paramétrico para que sobreviva a mudanças de projeto, como ler uma restrição estrutural ou de fabricação a partir de um desenho, o que um detalhe em madeira precisa de satisfazer antes de chegar à máquina, que perguntas um profissional faz antes de confiar num resultado. É esse o conhecimento que espero que a próxima geração de skills carregue, escrito pelas pessoas que o detêm, e é aí que pretendo contribuir a seguir: skills vindas do design computacional e da própria prática de AEC, sujeitas ao mesmo teste das de software. Um parágrafo no `CLAUDE.md` resolveria, ou o agente precisa de um ciclo verificado, factos fixados e das perguntas que o modelo não sabe fazer?

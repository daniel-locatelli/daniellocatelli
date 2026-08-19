---
Cover: /assets/content/research/agent-skills/agent-skills-cover-wearing-cap.svg
CoverAlt: "O ícone verde do Claude Code usando um capelo de formatura: um agente com uma skill."
CoverFit: contain
Description: "Uma lista viva das skills de agente de que dependo ao trabalhar com o Claude Code: as que eu escrevi, as skills de engenharia e produtividade do Matt Pocock e skills da comunidade como a Diagram Design."
Name: Agent skills
Tags:
  - Agent skills
  - Agentes de programação com IA
Authors:
  - Daniel Nunes Locatelli
DateStart: "2026-08-19"
Link:
  Text: daniel-locatelli/skills no GitHub
  Href: https://github.com/daniel-locatelli/skills
OtherLinks:
  - Text: mattpocock/skills
    Href: https://github.com/mattpocock/skills
  - Text: cathrynlavery/diagram-design
    Href: https://github.com/cathrynlavery/diagram-design
---

Uma skill de agente é uma pasta com um arquivo `SKILL.md`: um conjunto curto e bem delimitado de instruções, referências e scripts que um agente de programação carrega quando uma tarefa corresponde à sua descrição. É a unidade em que o conhecimento viaja entre pessoas e agentes. Quase tudo o que aprendi sobre trabalhar com o Claude Code em 2026 acabou virando skill, minha ou de outras pessoas, então esta página registra as que conquistaram um lugar permanente na minha configuração. É uma lista viva: acrescento à medida que as skills se provam e removo as que deixam de valer a pena.

![Três colunas de blocos SKILL.md (os meus, os do Matt Pocock, da comunidade) alimentando um único agente de programação.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## As minhas skills

Elas vivem no repositório público [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills) e instalam-se com `/plugin marketplace add daniel-locatelli/skills` no Claude Code ou `npx skills@latest add daniel-locatelli/skills` em qualquer outro agente. O fio condutor é que os dados de treinamento dos LLMs envelhecem exatamente onde as APIs de AEC mudam mais rápido, então cada skill fixa os fatos críticos de versão e impõe um ciclo verificado de build, deploy e teste em vez de despejar conhecimento.

- **creating-revit-plugin**: construir, estruturar e depurar add-ins de desktop do Revit em C#/.NET, atualizado para o Revit 2027 (.NET 10) e 2025/2026 (.NET 8). Transações, a regra do contexto válido de API, interface da ribbon, `ExternalEvent` para diálogos não modais, múltiplas versões alvo e um esqueleto compilável para o Revit 2027.
- **creating-grasshopper-plugin**: plugins compilados do Grasshopper (`.gha`) para o Rhino 8 em C#, do esqueleto com `Rhino.Templates` a data trees, deploy local, empacotamento Yak e diagnóstico de falhas de carregamento.
- **using-cordyceps**: dá ao agente um Rhino em execução que ele pode controlar pelo servidor MCP Cordyceps: posicionar e conectar componentes no canvas, configurar componentes de script, ler saídas do solver, fazer bake e renderizar cenas.
- **optimizing-web-performance**: o ciclo do Lighthouse para um site publicado: auditar a produção, corrigir as duas ou três coisas que movem a pontuação, verificar com uma medição comparável, publicar.
- **auditing-website-quality**: hub para uma auditoria aprofundada de site que roda a sub-skill de cada dimensão e agrega os achados em um scorecard datado, ordenado por severidade dividida por esforço.
- **auditing-agent-readiness**: o site é descobrível e utilizável por agentes de IA? Verifica `llms.txt`, variantes em markdown, regras de IA no robots, descritores `.well-known` e um handshake MCP ao vivo.

Este site também serve duas skills próprias em `/.well-known/agent-skills/`: **portfolio-content** (ler o site como markdown puro) e **portfolio-mcp** (consultá-lo pelo servidor MCP somente leitura). Elas estão descritas na página do [site portfólio](/pt/projects/portfolio-website).

Algumas outras skills ficam privadas por enquanto, porque codificam fluxo de trabalho pessoal e não conhecimento reutilizável: uma assistente de doutorado que conduz uma sessão adversarial de planejamento no início e no fim de cada dia de trabalho, um índice `system` de todos os repositórios, skills e padrões que mantenho, um ritual pré-PR para contribuir com repositórios que não são meus e duas referências de domínio sobre arquivos de fabricação em madeira BTLx e a biblioteca compas_ifc.

## As skills do Matt Pocock

[mattpocock/skills](https://github.com/mattpocock/skills) (MIT, `npx skills@latest add mattpocock/skills`) é o conjunto que mais uso quando a tarefa é pensar, e não digitar. As que mantenho instaladas:

- **grill-me**: uma entrevista implacável que afia um plano ou projeto até que cada ramo da árvore de decisão esteja resolvido. Uso antes de qualquer trabalho não trivial, e a primitiva `grilling` por trás dela é a base da minha própria skill de doutorado.
- **grill-with-docs**: a mesma entrevista, mas que escreve o `CONTEXT.md`, o glossário e os ADRs do projeto enquanto avança.
- **codebase-design** e **domain-modeling**: vocabulário compartilhado para módulos profundos com interfaces pequenas, e um procedimento para fixar a linguagem de domínio de um projeto e registrar decisões de arquitetura.
- **improve-codebase-architecture**: varre uma base de código em busca de oportunidades de aprofundamento, apresenta-as em um relatório HTML visual e faz a entrevista sobre a que você escolher.
- **handoff**: compacta a conversa atual em um documento que outro agente pode retomar, que é como movo trabalho entre sessões e máquinas.
- **teach**: ensina um conceito ao longo de várias sessões usando um diretório como espaço de trabalho, com registro de aprendizado e glossário.

## Skills da comunidade

- **[Diagram Design](https://github.com/cathrynlavery/diagram-design)**, de Cathryn Lavery: diagramas de qualidade editorial como HTML autocontido com SVG inline, 28 tipos visuais, onboarding de marca a partir de um site e uma importação de Mermaid que redesenha em vez de converter. Ela substituiu o fluxograma Mermaid da página do [site portfólio](/pt/projects/portfolio-website) por um diagrama de arquitetura desenhado à mão na paleta do próprio site, e um perfil salvo mais um marcador `.diagram-design` no repositório fazem todo diagrama futuro sair com o mesmo visual. Instalação: `/plugin marketplace add cathrynlavery/diagram-design` e depois `/plugin install diagram-design@diagram-design`.
- **[Superpowers](https://github.com/obra/superpowers)**, de Jesse Vincent: a camada de processo por baixo de todo o resto: brainstorming antes de construir, desenvolvimento orientado a testes, depuração sistemática, escrita e execução de planos e verificação antes de declarar algo concluído.
- **frontend-design**, do marketplace oficial de plugins do Claude: orientação para design visual distintivo e intencional ao construir ou remodelar interfaces.

## Como decido o que fica

Uma skill conquista seu lugar quando muda o que o agente faz em uma tarefa que eu realmente tenho, não por ser engenhosa. O teste é o mesmo que a Diagram Design aplica aos próprios diagramas: um parágrafo bem escrito no `CLAUDE.md` faria o mesmo trabalho? Se sim, a skill sai. Se a skill mantém um ciclo verificado honesto, fixa fatos que o modelo erra ou faz as perguntas que esqueço de fazer, ela fica.

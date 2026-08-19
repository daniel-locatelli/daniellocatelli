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

Uma skill de agente é uma pasta com um `SKILL.md`: um conjunto curto e bem delimitado de instruções, referências e scripts que um agente de programação carrega quando uma tarefa corresponde à sua descrição. É a unidade em que a expertise viaja entre pessoas e agentes. Esta página é uma lista viva das skills que conquistaram um lugar permanente na minha configuração do Claude Code.

![Blocos SKILL.md em três caixas (os meus, agrupados em AEC, web e pessoal; os do Matt Pocock; os da comunidade) alimentando um único agente de programação.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## Minhas skills

Estas ficam no repositório público [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills). O que têm em comum é uma resposta ao mesmo problema: os dados de treinamento dos LLMs envelhecem justamente onde as APIs mudam mais rápido, então, em vez de despejar conhecimento, cada skill fixa os fatos críticos de versão e mantém o agente num ciclo verificado de build, deploy e teste. Elas se dividem em três campos.

### AEC

| Skill | O que faz |
| --- | --- |
| **creating-revit-plugin** | Cria add-ins nativos para Revit 2025 a 2027 |
| **creating-grasshopper-plugin** | Cria plugins compilados do Grasshopper para Rhino 8 |
| **using-cordyceps** | Controla o Rhino e o Grasshopper a partir do agente |
| **working-with-btlx** | Trabalha com BTLx, o formato de intercâmbio para CNC de madeira: processamentos, faces de referência, versões do esquema |

Uma skill privada de referência para compas_ifc acompanha estas, para que o agente consulte a especificação antes de responder a uma pergunta sobre parâmetro ou versão.

### Web

| Skill | O que faz |
| --- | --- |
| **optimizing-web-performance** | Audita um site em produção e corrige o que move a pontuação |
| **auditing-website-quality** | Audita um site de ponta a ponta num scorecard ordenado |
| **auditing-agent-readiness** | Verifica se um site é utilizável por agentes de IA |

Este site também serve **portfolio-content** e **portfolio-mcp** em `/.well-known/agent-skills/`, descritas na página do [site do portfólio](/pt/projects/portfolio-website).

### Pessoal

Estas permanecem privadas porque codificam como eu trabalho, e não como uma ferramenta funciona. A que mais uso é a `system`, um mapa único de referência: ela diz ao agente quais skills, repositórios, sistemas operacionais e domínios da vida existem, onde cada um fica, como iniciá-lo e qual padrão se aplica. Em vez de adivinhar onde um arquivo ou uma convenção pertence, o agente pergunta "onde fica X" ou "qual é a minha regra para Y" e recebe uma resposta definitiva. É menos uma skill do que um assistente pessoal ao qual as outras skills se conectam. Ao lado dela ficam um assistente de doutorado que me sabatina sobre a tese; um ritual pré-PR que rastreia o histórico de um defeito antes de eu abrir um pull request no repositório de outra pessoa; uma skill de backup que codifica meu modelo de armazenamento (em qual disco cada arquivo fica, separação entre camadas de armazenamento e backup, e a regra de duas cópias para tudo o que é insubstituível) e roda as verificações de desvio; e uma skill de busca na biblioteca, que consulta um acervo pessoal de artigos científicos convertidos em markdown, hospedado num Mac mini acessível via Tailscale a partir de qualquer uma das minhas máquinas.

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

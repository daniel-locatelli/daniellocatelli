URL: https://daniellocatelli.com/pt/projects/buildsystems-website

# BuildSystems Website

Description: Desenvolvimento do site da BuildSystems com o framework Astro, utilizando a API do Notion como CMS.
Tags: Web Development, Astro, Notion API, TypeScript
Category: Software
Director: Martin Bittmann
Team: Daniel Nunes Locatelli
Client: BuildSystems GmbH
Place: Online
Date: August 2023 - April 2026
Link: https://buildsystems.de

Desenvolvi o site corporativo da [BuildSystems](https://buildsystems.de), uma consultoria de sustentabilidade que impulsiona a transformação climática neutra no setor de construção e imobiliário. O site funciona como a presença digital da empresa, apresentando seus serviços, portfólio de projetos, equipe e conteúdo de blog. Tudo gerenciado pelo Notion como CMS.

O design foi criado pela [HAND](https://www.hand.international/). Meu papel foi implementar o design e a funcionalidade usando uma stack tecnológica de ponta focada em performance, para garantir um ótimo SEO.

## Stack Tecnológica

- [**Astro**](https://astro.build/): Gerador de sites estáticos com TypeScript, escolhido por sua abordagem performance-first e filosofia de zero JavaScript por padrão.
- [**Tailwind CSS**](https://tailwindcss.com/): Estilização utility-first com variáveis CSS customizadas para tipografia responsiva em quatro breakpoints.
- [**API do Notion**](https://developers.notion.com/): Integração CMS headless. A equipe gerencia todo o conteúdo (posts do blog, membros da equipe, parceiros, portfólio) diretamente pelo Notion.
- [**Cloudflare Pages**](https://pages.cloudflare.com/): Deploy com cache de borda, HTTPS automático e proteção contra DDoS.

## Por que o Notion como CMS?

A BuildSystems já utilizava o Notion intensamente para documentação interna e gerenciamento de projetos. Em vez de introduzir um CMS separado que exigiria que a equipe aprendesse uma nova ferramenta, integrei a API do Notion diretamente no pipeline de build. Isso significa que a equipe pode escrever e publicar posts, atualizar perfis de membros e gerenciar conteúdo do portfólio inteiramente pelo Notion.

A integração busca conteúdo em tempo de build de múltiplos bancos de dados do Notion (posts, membros da equipe, parceiros, organizações) e renderiza usando mais de 30 componentes customizados de Notion que lidam com títulos, parágrafos, imagens, blocos de código, tabelas, embeds e mais.

A camada de CMS começou como um fork do [astro-notion-blog](https://github.com/otoyo/astro-notion-blog) de Hiroki Toyokawa (licenciado sob MIT), que forneceu a estrutura inicial para buscar conteúdo do Notion e renderizar blocos. A partir daí, estendi os renderizadores de blocos, adicionei bancos de dados para membros da equipe, parceiros e organizações, e reconstruí a UI para refletir a marca e o design system da BuildSystems.

## Principais Recursos

### Animações CSS-First
A agência de design havia entregue originalmente o cover da homepage e as seções dos "Três Pilares" com animações Lottie. Após a integração, os scores do Lighthouse caíram bruscamente porque as animações Lottie inflavam o DOM muito além do tamanho recomendado, prejudicando o desempenho de renderização. Reconstruí ambas as animações com `@keyframes` puro de CSS, com os "Três Pilares" adaptados para funcionar em layouts horizontal e vertical. Isso preservou a fidelidade visual e manteve a página leve e performática.

 

### Carrossel com Arraste
O carrossel de posts do blog implementa uma interação customizada de arrastar para rolar com física de inércia e scroll-snap suave. Os usuários podem arrastar o carrossel com mouse ou toque, e ele se ajusta suavemente ao card mais próximo quando solto.

### Posts do Blog via Notion
Cada post é escrito no Notion e renderizado no site em tempo de build. Suporta conteúdo rico, incluindo mídia incorporada (Instagram, TikTok, YouTube, CodePen), equações LaTeX via KaTeX, blocos de código com destaque de sintaxe Prism.js e previews de links via metascraper.

## Arquitetura

O projeto segue uma abordagem puramente Astro, sem React ou outros frameworks JavaScript. Toda a interatividade é construída com TypeScript puro e CSS, resultando em mínimo JavaScript no lado do cliente.

Um pipeline de build customizado cuida do cache de conteúdo do Notion. Executando `npm run cache:fetch`, todo o conteúdo e imagens são baixados do Notion, processados com Sharp (removendo dados EXIF e otimizando formatos) e armazenados localmente. Isso garante builds rápidos e evita chamadas desnecessárias à API durante o desenvolvimento.

## Design Responsivo

O site usa CSS Custom Properties para tipografia fluida que escala em quatro breakpoints: mobile, tablet, desktop e ultra-wide.

Fontes ABC Diatype auto-hospedadas são pré-carregadas para evitar Flash of Unstyled Text (FOUT), e o site usa SVG sprites para ícones, minimizando requisições HTTP.

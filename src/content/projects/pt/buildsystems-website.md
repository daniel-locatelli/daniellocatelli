---
Cover: /assets/content/projects/buildsystems-website/multistory-timber-building.jpg
CoverAlt: Captura de tela do site da BuildSystems na versão desktop
Description: "Desenvolvimento do site da BuildSystems com o framework Astro, utilizando a API do Notion como CMS."
Name: BuildSystems Website
Tags:
  - Web Development
  - Astro
  - Notion API
  - TypeScript
Authors:
  - BuildSystems GmbH
Category: Software
City:
  - Munique
Client: BuildSystems GmbH
DateStart: "2023-08-01"
DateEnd: "2024-04-01"
Link:
  Text: BuildSystems Website
  Href: "https://buildsystems.de"
Place: BuildSystems GmbH
Director:
  - Martin Bittmann
Manager:
  - Julia Dorn
Team:
  - Daniel Nunes Locatelli
---

Desenvolvi o site corporativo da [BuildSystems](https://buildsystems.de), uma consultoria de sustentabilidade que impulsiona a transformação climática neutra no setor de construção e imobiliário. O site funciona como a presença digital da empresa, apresentando seus serviços, portfólio de projetos, equipe e conteúdo de blog. Tudo gerenciado pelo Notion como CMS.

O design foi criado por uma agência externa. Meu papel foi implementar o design e a funcionalidade usando uma stack tecnológica de ponta focada em performance, para garantir um ótimo SEO.

## Stack Tecnológica

- [**Astro**](https://astro.build/): Gerador de sites estáticos com TypeScript, escolhido por sua abordagem performance-first e filosofia de zero JavaScript por padrão.
- [**Tailwind CSS**](https://tailwindcss.com/): Estilização utility-first com variáveis CSS customizadas para tipografia responsiva em quatro breakpoints.
- [**API do Notion**](https://developers.notion.com/): Integração CMS headless — a equipe gerencia todo o conteúdo (posts do blog, membros da equipe, parceiros, portfólio) diretamente pelo Notion.
- [**Cloudflare Pages**](https://pages.cloudflare.com/): Deploy com cache de borda, HTTPS automático e proteção contra DDoS.

## Por que o Notion como CMS?

A BuildSystems já utilizava o Notion intensamente para documentação interna e gerenciamento de projetos. Em vez de introduzir um CMS separado que exigiria que a equipe aprendesse uma nova ferramenta, integrei a API do Notion diretamente no pipeline de build. Isso significa que a equipe pode escrever e publicar posts, atualizar perfis de membros e gerenciar conteúdo do portfólio inteiramente pelo Notion.

A integração busca conteúdo em tempo de build de múltiplos bancos de dados do Notion (posts, membros da equipe, parceiros, organizações) e renderiza usando mais de 30 componentes customizados de Notion que lidam com títulos, parágrafos, imagens, blocos de código, tabelas, embeds e mais.

![A seção hero da homepage.](../../../assets/content/projects/buildsystems-website/homepage-hero.jpg)

## Principais Recursos

### Animações CSS-First
Uma decisão deliberada foi usar animações CSS puras com `@keyframes` em vez de animações Lottie, para evitar sobrecarregar a página com muito conteúdo, o que teria impactado a performance. O cover da homepage apresenta uma sequência animada em tela cheia, e as seções dos "Três Pilares" usam animações exclusivamente CSS em layouts horizontal e vertical. Isso mantém a página leve e performática.

<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
<video autoplay loop muted playsinline preload="metadata" style="height: 60svh; align-items: center; justify-content: center; border-radius: 0.5rem;">
  <source src="/media/projects/buildsystems-website/three-pillars-animation.mp4" type="video/mp4" />
</video>
<p style="font-size: 0.875rem; color: #a1a1aa; margin-top: 0.5rem;">Animação da homepage</p>
</div>

### Carrossel com Arraste
O carrossel de posts do blog implementa uma interação customizada de arrastar para rolar com física de inércia e scroll-snap suave. Os usuários podem arrastar o carrossel com mouse ou toque, e ele se ajusta suavemente ao card mais próximo quando solto.

<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
<video autoplay loop muted playsinline preload="metadata" style="height: 60svh; align-items: center; justify-content: center; border-radius: 0.5rem;">
  <source src="/media/projects/buildsystems-website/drag-to-scroll-carousel.mp4" type="video/mp4" />
</video>
<p style="font-size: 0.875rem; color: #a1a1aa; margin-top: 0.5rem;">Carrossel com arraste</p>
</div>

### Posts do Blog via Notion
Cada post é escrito no Notion e renderizado no site em tempo de build. Suporta conteúdo rico, incluindo mídia incorporada (Instagram, TikTok, YouTube, CodePen), equações LaTeX via KaTeX, blocos de código com destaque de sintaxe Prism.js e previews de links via metascraper.

![Uma página de post do blog mostrando conteúdo buscado e renderizado do Notion.](../../../assets/content/projects/buildsystems-website/blog-post-notion.jpg)

## Arquitetura

O projeto segue uma abordagem puramente Astro — sem React ou outros frameworks JavaScript. Toda a interatividade é construída com TypeScript puro e CSS, resultando em mínimo JavaScript no lado do cliente.

Um pipeline de build customizado cuida do cache de conteúdo do Notion. Executando `npm run cache:fetch`, todo o conteúdo e imagens são baixados do Notion, processados com Sharp (removendo dados EXIF e otimizando formatos) e armazenados localmente. Isso garante builds rápidos e evita chamadas desnecessárias à API durante o desenvolvimento.

## Design Responsivo

O site usa CSS Custom Properties para tipografia fluida que escala em quatro breakpoints: mobile, tablet, desktop e ultra-wide.

Fontes ABC Diatype auto-hospedadas são pré-carregadas para evitar Flash of Unstyled Text (FOUT), e o site usa SVG sprites para ícones, minimizando requisições HTTP.

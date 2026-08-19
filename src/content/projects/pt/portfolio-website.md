---
Cover: /assets/content/projects/portfolio-website/homepage-screenshot-laptop.png
CoverAlt: "A página inicial de daniellocatelli.com exibida em um laptop."
Name: Site Portfólio
Description: "Este site: um site em Astro cujo conteúdo vive em markdown puro para que o Claude Code possa atuar como CMS, com um chat baseado no Claude, uma esfera geodésica movida pelo scroll, apresentações de slides no navegador e uma superfície pronta para agentes na Cloudflare."
DateStart: "2024-04-27"
Organization: "Daniel Locatelli"
Category: Software
Tags:
  - Web Development
  - Astro
  - TypeScript
  - Claude
  - Three.js
  - Cloudflare
Link:
  Text: daniellocatelli.com
  Href: "https://daniellocatelli.com"
OtherLinks:
  - Text: Código-fonte no GitHub
    Href: "https://github.com/daniel-locatelli/daniellocatelli"
  - Text: Agent Readiness (Cloudflare Blog)
    Href: "https://blog.cloudflare.com/agent-readiness/"
  - Text: Is It Agent Ready?
    Href: "https://isitagentready.com/"
Place: Online
---

Este é o site que você está lendo agora. Ele começou em abril de 2024 como um pequeno site em Astro e, desde então, virou um campo de testes para o jeito como gosto de construir as coisas: páginas estáticas rápidas, conteúdo fácil de ler tanto para pessoas quanto para ferramentas de IA, e algumas peças interativas para apimentar as&nbsp;coisas.

## Stack Tecnológico

- [**Astro**](https://astro.build/) com TypeScript para o site em si, [**React**](https://react.dev/) para as poucas ilhas que precisam de interatividade e [**Tailwind CSS**](https://tailwindcss.com/) para os estilos.
- [**Astro Content Collections**](https://docs.astro.build/en/guides/content-collections/) para todo o conteúdo, escrito em markdown e MDX com frontmatter tipado e validado no momento do build.
- [**Claude**](https://www.anthropic.com/claude) (Anthropic) para o chat da página inicial, com o [**Supabase**](https://supabase.com/) como banco vetorial para a recuperação de contexto.
- [**Three.js**](https://threejs.org/) para a esfera geodésica.
- [**Cloudflare Workers**](https://workers.cloudflare.com/) com Static Assets para hospedagem, cache na borda e os endpoints voltados a agentes; as páginas pré-renderizadas são servidas direto da borda, e o Worker só roda para os endpoints de chat e MCP.

## Claude Code como sistema de gestão de conteúdo

Todo o conteúdo vive como arquivos de texto simples (escritos em [markdown](https://commonmark.org/help/)) no mesmo lugar que o código, o [repositório público no GitHub](https://github.com/daniel-locatelli/daniellocatelli): um arquivo pequeno por projeto, entrada de pesquisa, publicação, item de ensino ou seção do currículo, com um cabeçalho curto que guarda os fatos (título, datas, tags) acima do texto da página, e uma cópia em cada um dos três idiomas. Não há banco de dados nem sistema de conteúdo separado por trás das páginas.

![A pasta src/ do repositório: assets/ expandida até a imagem de capa desta página, content/ até o seu arquivo markdown, as demais pastas recolhidas.](/assets/content/projects/portfolio-website/src-tree-pt.svg)

O objetivo dessa configuração é tornar o conteúdo diretamente acessível a harnesses de IA como o [Claude Code](https://claude.com/claude-code). Como o conteúdo é apenas um conjunto de arquivos ao lado do código, o Claude Code consegue ler, editar, criar e cruzar entradas do mesmo jeito que trabalha com código-fonte. Na prática, isso significa que uso o Claude Code como sistema de gestão de conteúdo (CMS), a ferramenta em que normalmente se faria login para adicionar uma página ou corrigir um erro de digitação: descrevo um novo projeto ou uma correção em uma frase, e ele escreve ou atualiza os arquivos, mantém os cabeçalhos consistentes e confere as entradas relacionadas nos outros idiomas. Esta própria página foi escrita assim. Tudo neste site é cocriado, do código ao conteúdo.

Manter o conteúdo no repositório em texto puro tem um segundo ganho: é simples dividi-lo em trechos, gerar embeddings e alimentar um modelo de linguagem. É isso que torna possível o chat com IA na página inicial (mais sobre ele abaixo).

## Tradução feita pelo Claude Code

O site está disponível em inglês, português e alemão. Não há nenhum serviço de tradução no pipeline: quando um arquivo de conteúdo muda em um idioma, o Claude Code o traduz e atualiza os arquivos correspondentes nos outros dois. Campos estruturais como datas, links e lugares são mantidos em sincronia, enquanto campos traduzíveis como nomes de países e cidades são localizados. O mesmo vale para os textos da interface, que vivem como objetos tipados por idioma.

![Como uma mudança em um idioma chega aos outros dois: o Claude Code lê a regra do repositório e escreve os arquivos correspondentes, mantendo datas e links idênticos e traduzindo nomes e texto.](/assets/content/projects/portfolio-website/translation-pt.svg)

## Chat com IA na página inicial

A página inicial abre com um chat baseado no Claude. Os visitantes podem perguntar no que estou trabalhando, onde estudei, quais ferramentas uso ou qualquer outra coisa coberta pelo site, e recebem uma resposta baseada no conteúdo real, e não uma resposta genérica.

Por baixo dos panos, um pipeline de conhecimento transforma as coleções de conteúdo em pequenos trechos de texto por idioma (páginas individuais, entradas do currículo, uma linha do tempo cronológica e um conjunto de respostas de FAQ pré-escritas para as perguntas mais comuns dos visitantes), gera embeddings com a Voyage AI e armazena os vetores no Supabase. Quando chega uma pergunta, o endpoint da API recupera os trechos mais parecidos e os passa ao Claude como contexto. Sempre que o conteúdo muda, um único comando regenera os arquivos de conhecimento e envia embeddings novos, e um script de benchmark roda um conjunto fixo de perguntas comuns contra o chat para garantir que ele continua respondendo todas corretamente.

![Diagrama de arquitetura: no build, o conteúdo markdown do site é dividido em trechos de conhecimento, transformado em embeddings pela Voyage AI e armazenado no Supabase; em tempo de execução, a pergunta do visitante é embutida, os trechos mais próximos são recuperados e passados ao Claude, que transmite uma resposta fundamentada de volta à página.](/assets/content/projects/portfolio-website/chat-pipeline-pt.svg)

## A esfera geodésica

Abaixo do chat fica uma esfera geodésica renderizada com Three.js. Ela segue a construção que Buckminster Fuller tornou famosa: partir de um icosaedro, subdividir cada face, projetar os vértices sobre uma esfera e tomar o dual, de modo que os doze vértices originais viram pentágonos e todo o resto vira hexágonos. A esfera gira conforme você rola a página, ligando o movimento da página à geometria.

É também uma referência à minha própria trajetória: estruturas geodésicas e leves são um tema recorrente nos projetos e pesquisas deste site, do [Common Sky](/pt/projects/common-sky-by-artengineering-for-studio-other-spaces) ao meu doutorado sobre estruturas de madeira. O Three.js é carregado logo depois que a primeira tela é desenhada, em um momento ocioso, para nunca ficar no caminho crítico do carregamento inicial da página, mas já estar pronto quando você rolar até a esfera.

## Modo apresentação

Itens de conteúdo podem carregar uma apresentação de slides que vive junto do texto, na mesma pasta e no mesmo repositório. As apresentações são escritas em MDX com um pequeno atalho em YAML para os tipos de slide mais comuns (título, texto, imagem, fileira de imagens, vídeo, sobreposições) e são renderizadas no navegador com navegação por teclado, uma visão geral de todos os slides e uma janela do apresentador. Uso isso para aulas e palestras, de modo que uma aula e seus slides sejam publicados juntos, versionados juntos e traduzidos juntos.

## Pronto para agentes na Cloudflare

Como boa parte do tráfego de um site como este virá cada vez mais de agentes de IA em vez de navegadores, o site expõe seu conteúdo nos formatos que os agentes esperam:

- um índice `llms.txt` por idioma, gerado a partir das coleções de conteúdo no momento do build;
- uma versão em markdown de cada página de conteúdo (basta acrescentar `.md` à URL), além de negociação de conteúdo para que uma requisição com `Accept: text/markdown` receba markdown diretamente;
- um `robots.txt` que dá boas-vindas explícitas aos crawlers de IA, um sitemap com entradas de imagens e um catálogo de API em `/.well-known/`;
- um pequeno servidor [MCP](https://modelcontextprotocol.io/) somente leitura, para que agentes possam consultar o conteúdo do site como ferramentas;
- registros de descoberta [DNS-AID](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) (registros SVCB `_mcp._agents` e `_index._agents`, assinados com DNSSEC), para que agentes encontrem o endpoint MCP apenas a partir do nome de domínio;
- um índice de skills em `/.well-known/agent-skills/`, seguindo o [RFC de descoberta de Agent Skills](https://github.com/cloudflare/agent-skills-discovery-rfc) da Cloudflare, com dois arquivos `SKILL.md` no formato [Agent Skills](https://agentskills.io/specification) que ensinam um agente a consultar o site via MCP ou a lê-lo como markdown.

Fazer a negociação de conteúdo funcionar em páginas pré-renderizadas exigiu investigar como o pipeline de requisições da Cloudflare, o Workers Static Assets e o middleware de build do Astro interagem; a solução é um Snippet da Cloudflare no nível da zona que reescreve a URL antes de ela chegar ao Worker. No [isitagentready.com](https://isitagentready.com/), o verificador que acompanha o [guia de prontidão para agentes](https://blog.cloudflare.com/agent-readiness/) da Cloudflare, o site saiu de uma pontuação de 25% para 71/100, "Nível 5, Agent-Native", com nota máxima em descoberta, conteúdo e controle de acesso de bots. Os pontos restantes estão na categoria de API e autenticação e ficam deliberadamente em aberto: descoberta OAuth, metadados de recurso protegido e um `auth.md` só fazem sentido quando há algo em que fazer login, um agent card A2A descreve um agente que oferece serviços a outros agentes, e o WebMCP expõe ações dentro da página, como formulários ou checkouts. Um portfólio somente leitura não tem nada disso, então o verificador continua listando esses itens e o site continua dispensando-os.

![Resultado do Is It Agent Ready?: 71/100, Nível 5, Agent-Native](../../../assets/content/projects/portfolio-website/result-isitagentready.png)

## Desempenho e Lighthouse

O site é em grande parte HTML estático, o que já lhe dá uma vantagem inicial. Além disso, as imagens são servidas em tamanhos responsivos com larguras explícitas para que nada se desloque durante o carregamento, as imagens do corpo são carregadas sob demanda e pré-carregadas pouco antes de entrarem na área visível, as fontes são reduzidas ao subconjunto necessário e pré-carregadas, e scripts pesados são adiados até que sejam realmente necessários: o Three.js espera um momento ocioso e depois só redesenha a esfera enquanto ela está de fato em movimento, e a janela do chat (com seu renderizador de markdown e animações) só é baixada quando o visitante começa a digitar, de modo que o campo de entrada da abertura carrega apenas alguns kilobytes de JavaScript. Os logotipos do mapa de competências são servidos como arquivos de imagem separados, carregados sob demanda, em vez de embutidos na página, o que reduziu o HTML da página inicial de cerca de 350 KB para menos de 70 KB, de modo que a primeira pintura não espera mais por centenas de kilobytes de caminhos vetoriais. Juntas, essas mudanças levaram as pontuações do Lighthouse em desempenho, acessibilidade, boas práticas e SEO ao topo da escala.

![Resultado do Lighthouse: 100 em desempenho, acessibilidade, boas práticas e SEO](../../../assets/content/projects/portfolio-website/result-lighthouse.png)

## Detalhes menores

- **Prévias de links no build.** Links externos listados em uma página são exibidos como cartões de prévia. Títulos, descrições, imagens e favicons são buscados uma única vez e guardados em cache no repositório, de modo que o build é reprodutível e nenhuma requisição a terceiros acontece ao carregar a página.
- **Notas de rodapé com tooltip.** Notas de rodapé em markdown ganham um tooltip ao passar o mouse, mostrando a nota no próprio lugar, para que o leitor não precise pular até o fim da página.
- **Uma única fonte para todos os currículos.** O currículo resumido, o currículo completo e o currículo voltado ao doutorado são todos renderizados a partir das mesmas coleções de conteúdo, de modo que uma experiência ou publicação só precisa ser cadastrada uma vez.

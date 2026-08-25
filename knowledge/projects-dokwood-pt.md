URL: https://daniellocatelli.com/pt/projects/dokwood

# DOKwood

Description: O DOKwood é uma plataforma web para definir, verificar, versionar e trocar composições construtivas multicamadas em madeira. Como pesquisador associado na Hochschule München, trabalhei na sua base normativa, no seu dicionário de dados bSDD e nas suas interfaces com Revit, Cadwork e MCP.
Tags: Construção em madeira, Desenvolvimento de Software, BIM
Category: Software Development
Team: Daniel Nunes Locatelli, Fabian Scheurer, Parisa Shafiee, Edyta Augustynowicz, Ronny Standtke, Matias Penrroz, Louis Trümpler, Ian Law, Alexander Gumpp, Andreas Dengl, Sebastián Hernández-Maetschl, Franz Liebl, Michael Schär, Samuel Birrer, Boas Hänseler, Dominik Wicki, Joel Karolin
Organization: Universidade de Ciências Aplicadas de Munique,Universidade de Ciências Aplicadas de Berna,Gumpp & Maier,Schärholzbau
Location: Online
Date: February 2025 - June 2026
Link: https://hm.edu/forschungsprojekte_de/forschungsprojekt_detail_9856.de.html

O DOKwood é um projeto de pesquisa e uma plataforma de software para a documentação de composições construtivas multicamadas na construção pré-fabricada em madeira. Em um edifício de madeira, a composição de uma parede, de um piso ou de uma cobertura (a sequência ordenada de placas, montantes, isolamento e revestimento) é onde se encontram as decisões estruturais, de incêndio, acústicas, térmicas e de custo. Hoje essa informação vive em PDFs e planilhas que são redigitados a cada etapa, da licitação à oficina. O DOKwood dá uma casa às composições: uma plataforma web na qual uma empresa define as suas composições uma única vez, verifica-as contra requisitos, versiona-as como código e entrega-as às ferramentas a jusante sem reinserir dados.

O projeto é financiado pelo ZIM (Alemanha) e pela Innosuisse (Suíça) no âmbito do programa IraSME. O consórcio reúne uma universidade e uma construtora de madeira em cada país: a Hochschule München com a Gumpp & Maier, e a Berner Fachhochschule com a Schärholzbau. Participei do projeto como pesquisador associado na Hochschule München, de fevereiro de 2025 a junho de 2026. Meu trabalho se concentrou nas partes que tornam a plataforma interoperável: as normas em que ela se apoia, o dicionário de dados que dá um significado comum aos seus termos e as interfaces com as ferramentas que os construtores de madeira já usam.

## Revisão de normas

A primeira entrega foi uma revisão sistemática das normas que regem a especificação de materiais e composições na construção em madeira na Alemanha e na Suíça: ISO e GS1 no nível internacional, CEN e as normas EN harmonizadas na Europa, DIN, VDI e a Muster-Holzbau-Richtlinie na Alemanha, SIA, KBOB e VKF na Suíça. Ela cobre incêndio, acústica, física das construções, projeto estrutural, desenho técnico, BIM e o Passaporte Digital de Produto que chega com o Regulamento dos Produtos de Construção de 2024. O seu resultado prático foi um mapeamento da terminologia interna dos parceiros para termos normativos governados e a proposta de um vocabulário comum. Você pode ler mais sobre esse estudo na minha página dedicada às [normas para especificações em construção de madeira](/pt/research/timber-construction-standards).

## buildingSMART Data Dictionary (bSDD)

O vocabulário comum proposto na revisão de normas tornou-se um dicionário no buildingSMART Data Dictionary (bSDD), `hm/dokwood`, versionado de v0.1 a v0.13. Ele define as classes (Buildup, Wall, Roof, Slab, Product), 129 propriedades e os seus grupos, e segue os modelos de dados da ISO 23387: um System Data Template para uma composição, um Product Data Template para um produto e uma composição HasPart que os liga.

Vale explicar o papel desse dicionário na plataforma, porque é ele que transforma o DOKwood de uma ferramenta em um framework. Os dicionários de dados existem em dois níveis. O dicionário no bSDD é o público, genérico e de alto nível: um vocabulário comum para composições em madeira que qualquer pessoa pode ler e referenciar. Dentro do aplicativo, cada tenant (uma empresa de construção em madeira) tem o seu próprio dicionário de dados, que é privado: as suas classes, propriedades, modelos e requisitos, moldados pelos seus produtos, pelas normas do seu país e pelo seu fluxo de trabalho. Um novo tenant pode derivar o dicionário bSDD do DOKwood como base do seu dicionário privado e especializá-lo a partir daí, ou começar do zero e trazer o seu próprio vocabulário. O DOKwood, portanto, não impõe um único dicionário para todos; ele fornece o framework em que dicionários são definidos, versionados e usados, além de um ponto de partida público bem fundamentado. Como um dicionário de tenant pode referenciar o público, a mesma arquitetura permite também que um tenant abra o seu dicionário mais tarde e o interligue com os dicionários de outras empresas, de modo que dois parceiros troquem composições e produtos com base em um vocabulário compartilhado, e não em um mapeamento bilateral.

Todas as interfaces abaixo leem através dessa camada de dicionários, e é isso que as torna interoperáveis. O projeto, o pipeline de construção e o caminho até uma exportação pronta para o DPP estão na página [modelo de dados para composições construtivas em madeira](/pt/research/timber-buildup-data-model).

## Add-in para Revit

Para a Gumpp & Maier, desenvolvi um add-in para o Revit 2026 em C# e .NET 8 que importa uma composição do DOKwood como um System Family Type pronto para uso: ele escolhe a categoria hospedeira a partir da entidade IFC à qual a classe bSDD está mapeada, constrói a estrutura composta pela API do Revit e aplica função da camada, espessura, condutividade, cor e marcação de camada estrutural. O contexto importa: a estimativa de custos da Gumpp & Maier parte de um template Revit da empresa, passa por uma exportação GAEB e chega ao Nevaris, e são os nomes de material do template que a extração de quantidades usa como chave. O add-in precisa, portanto, alinhar-se aos materiais nomeados existentes em vez de injetar novos, e o principal item do roadmap que saiu dos workshops com o parceiro é uma sincronização bidirecional do banco de materiais do Revit com a plataforma à medida que o template evolui.

## Plugin para Cadwork

Para a Schärholzbau, desenvolvi a primeira funcionalidade de um plugin para o Cadwork 25 em Python sobre a API cwapi3d: login, seleção de tenant e de produtos, e importação de produtos do DOKwood com as suas propriedades bSDD como materiais do Cadwork, idempotente em reimportações. A descoberta decisiva das reuniões com o parceiro foi que a Schärholzbau não usa o módulo de camadas múltiplas do Cadwork; eles modelam as composições peça por peça. O plugin mudou então de rumo, de controlar aquele módulo para duas coisas que se encaixam no fluxo de trabalho deles: manter o catálogo de materiais sincronizado e etiquetar cada peça com os GUIDs de composição, camada e produto do DOKwood, de modo que o modelo de produção possa ser validado contra a especificação antes de ir para a serra. A arquitetura é estritamente em camadas, com apenas dois arquivos tocando a API do Cadwork, e 48 testes unitários cobrem o resto.

## Proposta de servidor MCP

A última peça é uma proposta, revisada mas ainda não construída, de um servidor Model Context Protocol na frente da plataforma: um adaptador fino e sem estado que traduz ferramentas, recursos e prompts MCP em chamadas GraphQL autenticadas, de modo que um assistente de IA possa buscar produtos, comparar composições ou verificar lacunas de certificados sob as mesmas regras de tenant que um usuário humano. Estrategicamente, ela substitui o plano original de um conector ERP sob medida por parceiro por uma única interface baseada em padrões que qualquer ferramenta compatível com MCP pode usar. A principal questão em aberto do revisor, se o acesso de escrita pertence ao MCP, molda o roadmap: começar somente leitura e tratar a escrita como uma decisão separada.

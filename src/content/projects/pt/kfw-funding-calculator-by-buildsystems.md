---
Cover: /assets/content/projects/kfw-funding-calculator-by-buildsystems/kfw-funding-calculator-by-buildsystems-cover.png
CoverAlt: Um homem usa a calculadora de financiamento em um iPad.
Description: "Esta calculadora simula empréstimos e subsídios bancários, tornando construções e reformas sustentáveis acessíveis a incorporadores imobiliários e proprietários de imóveis."
Name: Calculadora de financiamento imobiliário da BuildSystems
Tags:
  - Software Development
  - Web Development
Organization: "BuildSystems"
Category: Software Development
DateStart: "2023-11-20"
DateEnd: "2024-07-30"
Link:
  Text: "https://app.buildsystems.de"
  Href: "https://app.buildsystems.de/"
Director:
  - Martin Bittmann
Manager:
  - Julia Dorn
Team:
  - Daniel Nunes Locatelli
  - Daniel Dieren
OtherLinks:
  - Text: How to use Signals with Angular Forms
    Href: "https://zoaibkhan.com/blog/how-to-use-signals-with-angular-forms/"
    Description: Zoaib Khan
---




### Recursos
- **Estimativa de preço de um edifício**: O aplicativo estima o custo de uma construção ou reforma com base em dados disponíveis publicamente da [Arge e.V.](https://arge-ev.de/arge-ev/publikationen/studien/)
- **Simulação de empréstimo**: Simulação precisa de empréstimos com base na estimativa de preço e eficiência energética de um edifício.
- **Métricas de energia:** Influenciando as possibilidades de subsídio e empréstimo.
- **Segurança de dados**: Garantindo que todos os dados do usuário estejam seguros e sigam os regulamentos da União Europeia.
- **Design responsivo**: O aplicativo funciona perfeitamente em todos os dispositivos.
### Stack de tecnologia
- [**GitHub**](https://github.com/build-systems/toolbox): Para o repositório Git.
- [**Angular**](https://angular.dev/): Um framework JavaScript moderno apoiado pelo Google e usado para aplicações de grande escala.
- [**ng2-charts**](https://www.npmjs.com/package/ng2-charts): Wrapper Angular para a biblioteca Chart.js. É usado para criar gráficos responsivos e interativos.
- [**Cloudflare**](https://www.cloudflare.com/): Provedor de hospedagem para garantir confiabilidade e escalabilidade, nenhum investimento inicial é necessário.
## Por que desenvolvemos este app?
A Alemanha é conhecida por impulsionar tecnologias verdes, como painéis solares e turbinas eólicas, por meio de subsídios públicos. Mas você sabia que também existem muitos subsídios para construções energeticamente eficientes? Embora esses subsídios sejam atrativos, navegar pela burocracia pode ser incrivelmente desafiador.
Este aplicativo desenvolvido pela [BuildSystems](https://buildsystems.de/) facilita a simulação de um empréstimo do banco nacional [KfW](https://kfw.de/). Ele simplifica o processo ao oferecer uma interface amigável, permitindo que incorporadores imobiliários e proprietários de imóveis entendam suas opções financeiras de forma rápida e fácil.
## Processo de Desenvolvimento
O desenvolvimento do aplicativo aconteceu em três fases principais: Planejamento e Design, Desenvolvimento Frontend, e Testes e Garantia de Qualidade.
### Planejamento e Design
Para começar o projeto, toda a equipe definiu os requisitos e variáveis para a lógica do aplicativo. Uma vez que isso foi definido, esbocei a arquitetura do frontend e a UI/UX.
#### Lógica do aplicativo
Daniel Dieren desenvolveu a lógica do aplicativo no Excel. Minha função era revisá-la, fazer engenharia reversa das fórmulas para garantir que tudo estivesse correto e sugerir melhorias. Esta etapa se sobrepôs a todo o processo de desenvolvimento de software porque, conforme avançávamos, percebíamos que podíamos adicionar mais informações relevantes.
Criei uma documentação simples no Notion a partir do arquivo do Excel para entender cada fórmula completamente e facilitar a transferência para o TypeScript posteriormente.
#### Arquitetura do Frontend
Como a equipe já usa o [Figma](https://www.figma.com/), decidi permanecer dentro desse ecossistema. Então, usei o [FigJam](https://www.figma.com/figjam/) para esboçar um diagrama inicial de arquitetura de software, pensando em quais componentes seriam necessários e a relação entre eles.
![As rotas no topo se ramificam em cinco componentes Angular: as calculadoras Neubau e Sanierung, cada uma com formulários que alimentam um serviço que gera a saída (dashboard e gráficos) e uma ação de salvar; o Portfólio com uma lista Neubau e uma lista Sanierung; Perfil (alterar senha, excluir conta) e Configurações (alterar tema, alterar idioma). As duas ações de salvar gravam em um banco de dados compartilhado, do qual o Portfólio carrega os projetos salvos.](/assets/content/projects/kfw-funding-calculator-by-buildsystems/frontend-architecture.svg "Esboço da arquitetura do frontend: rotas, cinco componentes, banco de dados compartilhado")
#### Design de UI e UX
Conceitualmente, minha abordagem para o design foi criar um dashboard completo com todas as variáveis acessíveis pelo usuário, sem muita abstração. Em uma fase posterior, pretendemos ter outro fluxo de usuário onde os usuários tenham um passo a passo para simular os empréstimos.
Para criar protótipos, usei o Figma, que foi uma experiência de design bem agradável. Simular comportamentos de mouse over, mouse in, mouse out é possível. Além disso, o plano pago facilita a cópia de estilos CSS e SVGs com o Modo Dev. Mas mesmo com o plano gratuito, é muito fácil exportar SVGs.

![Captura de tela da versão desktop da calculadora de financiamento.
Versão desktop em Sanierung/Projekt.](../../../assets/content/projects/kfw-funding-calculator-by-buildsystems/screenshot-of-the-desktop-version-of-the-funding-calculator-desktop-version-at.png)

### Construindo a Interface do Usuário
Este projeto marcou minha metamorfose em um desenvolvedor de software completo. Isso exigiu que eu aprendesse [Angular](https://angular.dev/), um framework JavaScript, e sua estrutura altamente opinativa, que era perfeita para o meu caso.
#### Por que escolhemos o Angular?
Muitas pessoas acreditam que o Angular é um dos frameworks mais difíceis para desenvolvimento web. Se compararmos com React ou Vue, por exemplo, parece mais difícil no começo. Mas a verdade é que, como o Angular tem muitos recursos integrados (o que significa que é "opinativo"), ele elimina a necessidade de tomar muitas decisões mais tarde. Então, eu pude pular a parte mais dolorosa para quem aprende sozinho: a exaustão mental que pode vir de fazer muitas escolhas. E acredite, [fadiga de decisão](https://en.wikipedia.org/wiki/Decision_fatigue) é uma coisa real!
Além disso, o Angular usa uma linguagem de programação chamada [TypeScript](https://en.wikipedia.org/wiki/TypeScript). Pense nisso como JavaScript com um verificador de código que ajuda a detectar erros antes que eles se tornem problemas. Como eu era a única pessoa escrevendo o código, o TypeScript foi uma grande rede de segurança. Na verdade, eu só confiaria em mim mesmo para desenvolver este aplicativo com as proteções que o TypeScript cria. Lembre-se de que eu não tinha nenhum revisor de código; eu era uma equipe de um no lado do software.
Outro motivo para escolher o Angular é sua reputação de confiabilidade e facilidade de manutenção, especialmente em aplicações de grande escala. Ele é apoiado pelo Google, que já construiu mais de 2.600 soluções com ele, então está claro que ele pode lidar com projetos complexos e será mantido por um longo tempo.
Com minha formação em arquitetura e engenharia, entendo o quão rápido as coisas podem se tornar complexas neste campo também, e embora a Calculadora KfW pareça simples no início, ela inclui cerca de duas centenas de variáveis e mais de cem funções em sua primeira versão. Dado o objetivo da BuildSystems de criar um aplicativo escalável que evoluirá para uma ferramenta abrangente de planejamento inicial, os pontos fortes do Angular foram perfeitos para este projeto.
#### Ferramentas de IA como copiloto
Este aplicativo foi construído entre o final de 2023 e meados de 2024, quando os assistentes de IA para programação ainda eram uma novidade, e não uma parte padrão das ferramentas de qualquer desenvolvedor. Ainda assim, o ChatGPT desempenhou um papel crucial na conversão das fórmulas do Excel em código TypeScript. Para recursos de ponta, no entanto, essas ferramentas não davam boas respostas, porque os dados de treinamento simplesmente ainda não existiam.
#### Processo
Durante o processo de desenvolvimento, tentei criar um único componente que acomodasse tanto a calculadora de Nova Construção (Neubau) quanto a de Renovação (Sanierung), tornando o código menos repetitivo seguindo o princípio de [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) (don't repeat yourself).
Isso, no entanto, tornou o componente muito complexo porque havia muitas variáveis e requisitos exclusivos para cada calculadora. Então, no final, decidi dividi-lo em dois componentes. Embora haja algum código redundante, isso adicionou velocidade ao desenvolvimento.

![O componente Neubau abre dois formulários, Projekt e Darlehen, cada um com seu componente e seu serviço; ambos alimentam o serviço Neubau, que gera a saída Projekt (dashboard e gráficos Gesamtkosten, Gesamtkosten por m² e Einheitskosten), a saída Darlehen (dashboard e gráficos Annuitäten, Finanzierungskosten e Tilgung) e a opção de salvar.](/assets/content/projects/kfw-funding-calculator-by-buildsystems/neubau-component.svg "Dentro do componente Neubau: dois formulários, um serviço, duas saídas")
As estratégias usadas para implementar os recursos também variaram ao longo do desenvolvimento porque, à medida que eu progredia, aprendi maneiras novas e aprimoradas de atingir o mesmo resultado. Por exemplo, a implementação dos formulários já mudou duas vezes. Na primeira vez, decidi refatorar todo o código para garantir que tudo fosse homogêneo e tivesse um código mais claro.
Isso, no entanto, acabou sendo uma decisão ruim de gerenciamento de produto, porque os recursos já estavam funcionando e, embora o código fosse um pouco confuso, alterar os internos não afetaria o usuário final de forma alguma. Então, para a segunda mudança, que está acontecendo para a segunda versão do aplicativo, não refatorarei o resto do código.
Se você quiser saber mais sobre como estou implementando os formulários atualmente, confira [este artigo de Zoaib Khan](https://zoaibkhan.com/blog/how-to-use-signals-with-angular-forms/).

### Testes e Garantia de Qualidade
Eu também mergulhei fundo no tópico de [testes unitários](https://en.m.wikipedia.org/wiki/Unit_testing) usando a ferramenta padrão [Karma](http://karma-runner.github.io/6.4/intro/how-it-works.html).
Esse tipo de teste verifica pequenas partes (unidades) do software para garantir que cada uma funcione corretamente por si só. Infelizmente, porém, eu só consegui aprender isso em um estágio tardio, o que significou que tive que refatorar o código para permitir que os testes unitários funcionassem.
Além disso, se eu tivesse que começar de novo, eu concentraria minhas energias em [testes de ponta a ponta](https://en.m.wikipedia.org/w/index.php?title=System_testing&diffonly=true) (E2E) usando [Cypress](https://docs.cypress.io/guides/overview/why-cypress). Este teste verifica todo o sistema simulando a interação do usuário, garantindo que os inputs e outputs correspondam à nossa devida diligência.
## Implantação
Inicialmente, implantamos o aplicativo no Netlify porque eles têm uma experiência supersuave. O modelo de negócios deles é "pague conforme você escala", sem custos iniciais. Além disso, é uma solução de implantação sem código; você apenas conecta seu repositório GitHub e eles fazem o resto!
No entanto, alguns usuários do Netlify começaram a relatar como passaram do plano gratuito para serem cobrados dezenas de milhares de dólares, ou até mesmo [US$ 104 mil em um mês](https://www.reddit.com/r/webdev/comments/1b14bty/netlify_just_sent_me_a_104k_bill_for_a_simple/). Tudo por causa de um ataque DDOS que poderia acontecer com qualquer um. Como o Netlify não tinha um mecanismo de prevenção de ataques DDOS, decidimos mudar para o Cloudflare.
O Cloudflare é semelhante ao Netlify. Mesmo modelo de negócios e implantação automatizada usando o GitHub. No entanto, ele tem um sistema anti-bot mais robusto.
A implantação é automática e bem simples:
![Do VS Code, o app Angular é enviado ao GitHub: o branch main é publicado no Cloudflare Pages de produção em app.buildsystems.de, e o branch development é publicado no Cloudflare Pages de desenvolvimento em branchname.pages.dev.](/assets/content/projects/kfw-funding-calculator-by-buildsystems/deployment.svg "Deploy: push para o GitHub, um ambiente Cloudflare Pages por branch")
## Desenvolvimento do aplicativo: principais insights e estratégias
- **Segurança em primeiro lugar**: Priorize a segurança dos dados desde o início para evitar problemas de conformidade mais tarde.
- **Planejamento antecipado**: Invista tempo no planejamento e entenda os requisitos necessários antes de iniciar o desenvolvimento.
- **Ferramentas de IA**: Em 2023 recorrer à IA ainda não era o padrão que é hoje, mas a lição deste projeto é clara: use copilotos de código desde o primeiro dia e deixe a IA gerar um primeiro rascunho da interface para começar.
- **Flexibilidade**: Esteja ciente de que o aplicativo evoluirá, portanto, não siga estritamente o princípio [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).
- **Seleção de framework**: Escolha um framework que atenda às necessidades do seu projeto e continue com ele. Normalmente, o melhor framework é aquele que você já conhece.
- **Teste contínuo**: Aposte seus esforços de teste em testes de ponta a ponta.
Um dos principais desafios era tornar o aplicativo "snappy"; em outras palavras, enquanto o usuário move um controle deslizante, todos os valores e gráficos são atualizados em tempo real. Além disso, fomos cautelosos com os dados dos usuários por causa das regulamentações super restritivas da União Europeia.
A primeira decisão foi evitar cálculos no servidor completamente. O aplicativo inteiro funciona apenas do lado do cliente, o que significa que, uma vez carregado, ele não precisa enviar dados para lugar nenhum; o cálculo acontece diretamente no dispositivo. Isso significa que também não tivemos que nos preocupar com o armazenamento de dados para a primeira versão.
Projetar o aplicativo do zero foi uma experiência valiosa. Em 2023, as ferramentas de IA para design ainda estavam apenas começando a surgir, mas hoje eu começaria o design da interface com um assistente de IA. Ferramentas como [Galileo AI](https://www.usegalileo.ai/) ou [Rendition Create](https://www.renditioncreate.com/) podem produzir um primeiro rascunho agradável de interface a partir de prompts (Texto para UI). Começar com um rascunho de UI é sempre mais rápido, mesmo que o rascunho mude drasticamente.
## Backend com Supabase
Também lançamos a segunda versão do aplicativo, que trouxe outra calculadora junto com recursos como salvar um projeto e comparar dois projetos. A camada de dados foi construída no [Supabase](https://supabase.com/); o esquema abaixo mostra como projetos, usuários e histórico de edição são modelados.
![Esquema do Supabase: auth_users no topo; abaixo, as três tabelas de projetos neubau_projects, sanierung_projects e einzelmassnahmen_projects, cada uma com id, title, created_by, created_at, owned_by, last_edited_by, last_edited_at e valores do projeto, todas referenciando auth_users por created_by, owned_by e last_edited_by; uma tabela de junção user_*_projects (uma por calculadora) ligando usuários a seus projetos; e einzelmassnahmen_items e einzelmassnahmen_values pendurados em einzelmassnahmen_projects.](/assets/content/projects/kfw-funding-calculator-by-buildsystems/supabase-schema.svg "Esquema do Supabase: usuários, três tabelas de projetos, tabelas de junção, itens e valores de Einzelmassnahmen")

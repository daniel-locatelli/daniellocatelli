# Portuguese (pt) style guide

How the site's Portuguese is written. Read it before writing or reviewing any
`pt` text: `src/i18n/*/pt.ts`, `src/content/**/pt/**`, slide decks, and the
pt strings in `src/scripts/generate-knowledge.ts`. The house rules in
`CLAUDE.md` (no em dashes, headings from h2) apply here too.

## Voice

- **Brazilian Portuguese**, written by Daniel in the first person.
- **Você**, warm and professional: how a Brazilian researcher talks to a
  curious colleague, not how a manual or a legal form talks.
- **Write from the meaning.** Read the English, decide what it is saying, then
  write the sentence a Brazilian would write to say it. The English sentence
  structure is a reference, never a template. The test: a reader should not be
  able to tell the text was ever in English.

## Calques to watch for

A calque keeps the English structure with Portuguese words. Typical shapes:

- Literal verbs where Portuguese uses a different idea: "What did you build
  before?" is about past work, so it becomes a question about projects, not
  "construir".
- Possessives and pronouns English needs and Portuguese drops ("meu", "seu",
  "você" in every clause).
- Title Case in headings and labels ("Experiência Profissional"): Portuguese
  uses sentence case, "Experiência profissional".
- Noun stacks ("Assistente IA" for "AI Assistant"): Portuguese links nouns
  with "de", "Assistente de IA".
- Gerund chains ("estamos trabalhando desenvolvendo").

## Glossary

Fixed choices for recurring terms. **Confirmed** entries come from Daniel;
**proposed** ones are what the site uses today and are open to correction.

| English | Portuguese | Status |
| --- | --- | --- |
| education (CV) | formação | confirmed |
| supervisor / advisor | orientador / coorientador | confirmed |
| skills (CV section) | competências | confirmed |
| vernacular (adj.) | vernacular | confirmed |
| Terms and Conditions / Impressum | Termos de uso / Informações legais | confirmed |
| PhD | doutorado | proposed |
| doctoral researcher | doutorando | proposed |
| timber plate structures | estruturas em placas de madeira | confirmed |
| ETH Zurich | ETH Zurique | proposed |
| Gramazio Kohler Research | Gramazio Kohler Research (unchanged) | proposed |
| (agent) skills | skills (kept in English) | proposed |

## Corrections

Daniel's corrections, newest first. They are the strongest guidance in this
file: before writing pt text, read them and generalise from them. Agents add
an entry whenever Daniel corrects pt wording, in chat or by editing a file
(see the rule in `CLAUDE.md` and the `reviewing-translations` skill). An entry
records what was wrong, so "kept" decisions belong here too.

Manual edits harvested through commit: `ceb8c353`

| Date | Where | Before | After | Why |
| --- | --- | --- | --- | --- |
| 2026-11-14 | Heineken bar and stage (project) | superfícies dinâmicas de bambu / enquadramentos dinâmicos | contornos dinâmicos de bambu a partir das arestas da estrela | Daniel: the bamboo builds the edges of the star, not surfaces; and "enquadramento" suggests four sides, while the star has five tips and many edges. |
| 2026-11-14 | KfW calculator (project) | passaram do plano gratuito para serem cobrados dezenas de milhares de dólares | saíram do plano gratuito direto para cobranças de dezenas de milhares de dólares | Daniel rejected the proposed "contas": it means both bill and account. Use "cobrança" or "fatura" for a bill. |
| 2026-11-14 | Circular Component Creator (project) | mas não foi desenvolvido como aplicação funcional | mas o aplicativo não foi pra frente | Daniel's wording; the proposed "não virou um aplicativo funcional" sounded strange. |
| 2026-11-14 | BuildSystems website (project) | uma consultoria de sustentabilidade que impulsiona a transformação climática neutra | que ajuda a construção civil e o mercado imobiliário a chegar à neutralidade de carbono | Daniel: say carbon; "transformação climática neutra" garbles "climate-neutral". |
| 2026-11-14 | BuildSystems website (project) | renderiza usando mais de 30 componentes customizados | monta as páginas com mais de 30 componentes | Daniel: the components come from an open-source fork he modified heavily, so "que criei" would claim too much. |
| 2026-11-14 | BuildSystems website (project) | Suporta conteúdo rico / resultando em mínimo JavaScript no lado do cliente | Além de texto, os posts podem ter / então o navegador do visitante baixa pouquíssimo JavaScript | Daniel found "conteúdo rico" unclear and "no cliente" too technical for non-programmers: say what it means. |
| 2026-11-14 | Breathing Earth Sphere (project) | tive que "resolver" a cúpula como um quebra-cabeça 3D gigante: segmentando | desmontei a cúpula, como um quebra-cabeça 3D gigante, em peças modulares | Daniel did not want "resolver" in quotes; calque of "Isso significou que". |
| 2026-11-14 | Air Guitar (project) | pediu para mantê-la lá | pediu para deixar a instalação lá | Same rule as "converte-o": the enclitic reads archaic. |
| 2026-11-14 | portfolio website (project) | Name: Site Portfólio | Name: daniellocatelli.com | Daniel: the site is more than a portfolio; name it by its domain. |
| 2026-11-14 | KfW calculator (project) | Simular comportamentos de mouse over, mouse in, mouse out é possível. | Dá para simular o que acontece ao passar o mouse sobre um elemento (mouse over, mouse in e mouse out). | No settled pt terms; explain in plain words and keep the English terms in parentheses. |
| 2026-11-14 | projects (false friends) | esfera massiva / membrana massiva / Ainda suportado / suportando ambas as versões / Suporta conteúdo / aplicação / posição (job) / eventualmente / madeira mole / ferreiros / Modelo em pequena escala / tese (undergraduate) | cúpula enorme / membrana enorme / Ainda compatível / compilar para as duas versões / (open) / aplicativo / vaga / mais tarde / madeira de conífera / serralheiros / Maquete / TFG | False friends: massive, supported, application, position, eventually, softwood, small-scale model, thesis. |
| 2026-11-14 | projects (calques) | Durante meu tempo na / Principais conquistas incluíram / Isso significa que / Isso significou que / Em contraste / Você pode conferir ... aqui / Esteja ciente de que / desempenhou um papel crucial / navegar pela burocracia / contra o chat / devida diligência / dá uma casa às composições | Na / Entre os principais resultados / Assim, / Para isso, / Já / Para entender melhor, assista / (dropped) / foi essencial para / enfrentar a burocracia / faz ao chat / ao que esperamos / reúne as composições em um só lugar | English sentence frames copied word for word. |
| 2026-11-14 | projects (verbs over nouns) | Desenvolvimento do site ... / Desenvolvimento de mockups ... e definição da arquitetura / Desenvolvimento de um fluxo conectando | Desenvolvi o site ... / Desenvolvi os mockups ... e defini a arquitetura / Desenvolvi um fluxo de trabalho que conecta | Summaries read as first-person verbs, like the English "Developed". |
| 2026-11-14 | BuildSystems website (project) | com o framework Astro | com Astro | Daniel preferred "com Astro" over the proposed "com o Astro". |
| 2026-11-14 | BuildSystems website (project) | A agência de design havia entregue originalmente o cover da homepage | Originalmente, a agência de design desenvolveu a capa da página inicial | Daniel's wording: "desenvolveu" instead of the proposed "entregou"; "havia entregue" is wrong (ter/haver take "entregado"). |
| 2026-11-14 | Common Sky (project) | essa oferta veio na hora certa, como uma escolha óbvia | A oferta veio na hora certa, e aceitar foi uma decisão fácil. | Daniel's wording: "decisão fácil" instead of the proposed "decisão óbvia". |
| 2026-11-14 | Common Sky (project) | que coincidentemente foi meu tutor no mestrado do ITECH | que, por coincidência, tinha sido meu tutor no mestrado ITECH | Daniel kept "tutor" (reviewer proposed "professor"): in Germany a Professor is a senior post, a tutor is an assistant, PhD student or postdoc. Never translate a German academic title to "professor" unless the person holds a chair. |
| 2026-11-14 | ICD computational designer (project) | Renderização de uma torre ... com pessoas para escala | Render de uma torre ... com recortes de pessoas para dar escala | Daniel: the render has cutouts of people, not people. |
| 2026-11-14 | O3 Pavilion (project) | Eu tive que usar o plugin Kangaroo | Usei o plugin Kangaroo | Daniel kept "plugin" before Kangaroo (reviewer proposed dropping it): a reader who does not know Kangaroo needs to know what it is. |
| 2026-11-14 | Parada Coca-Cola (project) | as tags / remover as tags | as tags / tirar as tags | Daniel kept "tags" (reviewer proposed "etiquetas"): "tag" is everyday Brazilian Portuguese (tag de roupa, de preço). |
| 2026-11-14 | Radome Raisting (project) | uma cobertura protetora (um radomo) para protegê-la do vento | uma cobertura (um radomo) que a protegesse das intempéries | Daniel: the radome protects against all weather, not only wind; "intempéries" is the word. |
| 2026-11-14 | Radome Raisting (project) | implantação (sequência, velocidades, no local) | montagem / abertura | "Implantação" is the site layout in Brazilian architecture; a deployment on site is a "montagem". |
| 2026-11-14 | projects (Air Guitar, O3, Life Lamp quotes) | pt quotes that differed from en (one line each, no attribution) | the same quote as en, with *Atelier Marko Brajovic* / *Estúdio Guto Requena* | Fidelity: a quote says the same in every locale. Daniel also asked to add the extra pt Air Guitar story to en and de, rather than trim pt. |
| 2026-11-14 | drafts | Category: Cenografia / Instalação (Live Talks, The First Blow) | Category: Design computacional | Daniel: Category lists his role in the project, which was computational design. |
| 2026-11-14 | Breathing Earth Sphere (project) | comissionou a ArtEngineering para engenharia / ver o workflow do ArtEngineering / a Análise de Elementos Finitos (FEA) utilizando o SOFiSTiK, que é excelente quando se lida com / análise e documentação realmente aprofundada: vento, sísmica e até forças | contratou a ArtEngineering para a engenharia / acompanhar o fluxo de trabalho da ArtEngineering / a análise por elementos finitos (FEA) no SOFiSTiK, que é ótimo para / uma análise e uma documentação bem detalhadas: vento, sismo e até cargas | "Comissionar" calque; company is feminine (a ArtEngineering); capitals on a common noun; stiff "quando se lida com"; dangling adjective "sísmica"; loads are "cargas". |
| 2026-11-14 | Heineken bar and stage (project) | A instalação do bar apresentou uma estrutura paramétrica na qual ... capturou a identidade da marca em uma forma arquitetônica / O design paramétrico foi desenvolvido no Grasshopper para Rhino, permitindo a adaptação flexível | No bar, a rotação e o espaçamento de cada peça de bambu formavam um abrigo ... que traduzia a identidade da marca em arquitetura / Desenvolvemos o projeto paramétrico no Grasshopper (Rhino), o que permitiu adaptar | "Apresentou" calques "featured"; passive plus gerund nominalization. |
| 2026-11-14 | Air Guitar (project) | Exigiu cabos mais longos ..., os LEDs consomem / configuração Captador-Arduino-LED, ou seja oito | Precisei de cabos mais longos ..., porque os LEDs consomem / conjunto captador-Arduino-LED, ou seja, oito | Subjectless "Exigiu" and comma splice; "configuração" calques "setup". |
| 2026-11-12 | Air Guitar (project) | Phew! Alívio! | Phew! Alívio! (kept) | Daniel kept the English interjection; reviewer proposed "Ufa! Que alívio!". |
| 2026-11-12 | Air Guitar (project) | Cada captador de baixo envia um sinal analógico para seus respectivos Arduino Megas, que então mapeiam o valor e os convertem | Cada um dos quatro captadores envia um sinal analógico para o seu próprio Arduino Mega, que transforma esse valor em sinal digital | Agreement error ("o valor ... os convertem"), "respectivos" calque. Daniel found the enclitic "converte-o" archaic: avoid object pronouns after the verb (converte-o, mantê-lo) where a rephrase works. |
| 2026-11-12 | Air Guitar (project) | Apesar de eu ter aprendido muito, eu teria poupado alguns cabelos brancos se eu tivesse contratado | Aprendi muito, mas teria me poupado muita dor de cabeça se tivesse contratado | Needless "eu" ×3. Daniel rejected "cabelos brancos": he had no white hair at the time, so the idiom does not fit him. |
| 2026-11-12 | Air Guitar (project) | O Air Max Day foi sobre celebrar ... Essencialmente, era sobre interfaces | (kept) | Daniel disagreed with the proposed "A ideia do Air Max Day era celebrar ... No fundo, o tema eram interfaces". |
| 2026-11-12 | Air Guitar (project) | desenvolveu esta instalação específica do local | desenvolveu esta instalação | Daniel preferred plain "instalação" over the proposed "site-specific": the quote above already says it. |
| 2026-11-12 | Air Guitar (project) | trabalhei em estreita colaboração com Marko, trabalhando com o conceito / dando insights e apontando potenciais / costumava ser uma usina / fiquei muito ganancioso / me levou pra uma espiral estudando eletrônica, até que eu cheguei num beco sem saída / pediu para ficar lá por um mês inteiro. Um período que | cuidei do conceito e da coordenação / dando ideias e apontando onde eu via potencial / tinha sido uma usina / fui ambicioso demais / me fez mergulhar de cabeça na eletrônica, até eu empacar / pediu para mantê-la lá por um mês inteiro. Nesse período, | Repeated verb; calques of "insights", "used to be", "rabbit hole"; "ganancioso" means greedy for money; wrong subject and sentence fragment. |
| 2026-11-12 | Air Guitar (project) | ao invés de / Não haviam / claramento / esatava | em vez de / Não havia / claramente / estava | "Ao invés de" means "the opposite of"; impersonal "haver" does not inflect; typos. |
| 2026-11-12 | projects (captions, alt text) | © Video by / ## Concept / First test: ... / Lucas and the work-platform-lift / Installation view: ... South Jeolla, South Korea / Agent-based system controlled by ... | © Vídeo de / ## Conceito / Primeiro teste: ... / Lucas e a plataforma elevatória / Vista da instalação: ... Jeolla do Sul, Coreia do Sul / Sistema baseado em agentes controlado por ... | English left in pt pages. "Jeolla do Sul" is the Portuguese Wikipedia name of the province. |
| 2026-11-12 | projects (link labels) | Air Guitar at Atelier Marko Brajovic / Breathing earth sphere at ArtEnginnering / Design Boom Article / Urbach Tower at ICD University of Stuttgart | Air Guitar no Atelier Marko Brajovic / Breathing Earth Sphere na ArtEngineering / Artigo da Designboom / Torre Urbach no ICD da Universidade de Stuttgart | English labels; "no/na" agrees with the studio or company. ArtEngineering is one word. |
| 2026-11-12 | projects (Category) | Installation, Digital Fabrication, Software Development, Web development, Computational design, Product design, Computational architecture, Membrane, Design Computacional, Visualização de Dados | Instalação, Fabricação digital, Desenvolvimento de software, Desenvolvimento web, Design computacional, Design de produto, Arquitetura computacional, Membranas, Design computacional, Visualização de dados | Category is display text (full CV, chat profile): Portuguese, sentence case. |
| 2026-11-12 | projects (headings) | Desenhos Técnicos, ## **O Resultado**, Principais Recursos, Design Computacional, Arquitetura de Dados, Processo de Desenvolvimento, Stack Tecnológico / Stack de tecnologia | Desenhos técnicos, ## Resultado, Principais recursos, Design computacional, Arquitetura de dados, Processo de desenvolvimento, Stack tecnológica | Sentence case, no bold inside headings, no English article calque; one form of "stack tecnológica" (feminine). |
| 2026-11-11 | PhD title (CV) | Design Computacional para Fabricação de Sistemas Construtivos em Placas de Madeira | Sistemas construtivos em placas de madeira: do design computacional à fabricação | Daniel: "para fabricação" reads as using design to manufacture the systems; "design-to-fabrication" is a span, "do ... à". |
| 2026-11-11 | pt review batch 1 (home pages) | minha pesquisa, projetos e ensino / Meu trabalho e colaborações / Minhas palestras, workshops e aulas | minha pesquisa, meus projetos e minhas aulas / Meus trabalhos e colaborações / Minhas palestras, meus workshops e minhas aulas | One possessive cannot agree with nouns of different gender and number. |
| 2026-11-11 | pt review batch 1 (pages) | Exemplos de pesquisa e publicações sobre / indústria AEC: Arquitetura, Engenharia e Construção. | Pesquisas e publicações sobre / indústria AEC (arquitetura, engenharia e construção). | "Exemplos de" calques "Selected"; no capitals after a colon. |
| 2026-11-11 | pt review batch 1 (titles, labels) | Página Inicial, Política de Privacidade, Retenção de Dados, Engenheiro de Software AEC, Designer Computacional, Cursinho Pré-Vestibular, Linha do Tempo, Experiência Profissional | Página inicial, Política de privacidade, Retenção de dados, Engenheiro de software AEC, Designer computacional, Cursinho pré-vestibular, Linha do tempo, Experiência profissional | Sentence case in headings, labels and job titles; proper names (course titles, universities) keep their capitals. |
| 2026-11-11 | pt review batch 1 (legal) | Ao visitar este site, a Cloudflare processa | Quando você visita este site, a Cloudflare processa | Dangling subject: reads as if Cloudflare is the visitor. |
| 2026-11-11 | pt review batch 1 (legal) | coleta dados pessoais mínimos / o tratamento limitado de dados que ocorre / interesse legítimo na apresentação de trabalhos de projeto por meio de conteúdo em vídeo | coleta o mínimo de dados pessoais / os poucos casos em que há tratamento de dados / interesse legítimo em apresentar projetos em vídeo | English word order and nominalization stacks. |
| 2026-11-11 | pt review batch 1 (legal) | não define cookies até que você reproduza ativamente / reporta / a política ... se aplica / Âmbito / reserva-se | só define cookies quando você reproduz / envia / passa a valer a política ... / Abrangência / se reserva | Calques, "reportar" anglicism, European forms (enclisis, "Âmbito"). |
| 2026-11-11 | pt review batch 1 (legal) | chat alimentado por IA / Por favor, observe: / Você deve verificar independentemente ... através do chat | chat com IA / Observe que: / Confirme por conta própria ... no chat | "Alimentado por" calques "powered by"; "através de" calques "through". |
| 2026-11-11 | pt review batch 1 (impressum) | criados com o melhor do nosso conhecimento / Reivindicações legais obrigatórias permanecem inalteradas / não podemos aceitar qualquer responsabilidade / é irrazoável / sob a lei geral permanecem inalteradas | elaborados com todo o cuidado / Esta limitação não afeta direitos garantidos por lei. / não assumimos nenhuma responsabilidade / não é razoável / Isso não afeta as obrigações ... previstas na legislação geral | Word-for-word German/English legalese; "irrazoável" is not used. |
| 2026-11-11 | pt review batch 1 (legal) | Email: | E-mail: | Brazilian spelling. |
| 2026-11-11 | chat profile labels | Educação, Certificados, Cursos frequentados, Resumo & Habilidades, (mais recente primeiro), July 2026, Astro (Advanced), English FAQ text | Formação, Certificações, Cursos realizados, Resumo e competências, (do mais recente ao mais antigo), julho de 2026, Astro (avançado), Portuguese background text | The profile must use the CV's confirmed labels and no English. |
| 2026-11-11 | CV education | Bacharel em Arquitetura e Urbanismo / (trancado) / Tese: | Bacharelado em Arquitetura e Urbanismo / (não concluído) / TFG: | "Bacharel" is the graduate, the course is "bacharelado"; "trancado" means paused; an undergraduate final work is a TFG. |
| 2026-11-11 | CV bullets | Explorando como a IA ... / Auxiliou na análise / Fundamentos para o desenvolvimento do aplicativo DOKwood. | Pesquisa sobre como a IA ... / Apoio na análise / Essa pesquisa embasou o desenvolvimento do aplicativo DOKwood. | Bullets are noun phrases: no gerunds, no finite verbs, no verbless fragments. |
| 2026-11-11 | CV bullets | Automatização do padrões / workflow automatizados / apoio de competições / em Figma / de Grasshopper para Power BI para tomada de decisão | Automatização dos padrões / fluxos de trabalho automatizados / apoio a competições / no Figma / do Grasshopper no Power BI para apoiar a tomada de decisão | Agreement, regência, and tools take "no". |
| 2026-11-11 | CV bullets | tecnologia madeireira / famílias do sistema / bobinamento / auto-curvante / documentação meticulosa / comunicações científicas | tecnologia da madeira / famílias de sistema / enrolamento / autocurvante / documentação detalhada / divulgação científica | Wrong term or false friend; "madeireira" is the lumber trade. |
| 2026-11-11 | CV bullets | Avaliação do Ciclo de Vida de edifícios de madeira (LCA) | Avaliação do Ciclo de Vida (ACV) de edifícios de madeira | Brazilian acronym, next to the noun it abbreviates. |
| 2026-11-11 | CV entries | ICD/ITKE University of Stuttgart / grad Students from UCL London / Electronics in the darkness | ICD/ITKE, Universidade de Stuttgart / alunos de pós-graduação da UCL (Londres) / Eletrônica no escuro | English left in pt files. |
| 2026-11-11 | CV entries | Universidade de Harvard / Governo Federal Brasileiro / Workshop Grasshopper com Galapagos / Programação Usando Python / Introdução ao Trabalho em Madeira | Universidade Harvard / Governo Federal do Brasil / Workshop de Grasshopper com Galapagos / à Programação com Python / Introdução à Marcenaria | Official name form; noun stacks take "de"; "usando" calque; "woodwork" is "marcenaria". |
| 2026-11-11 | services | Aplicação de estratégias ... aumentando a eficiência / Desde dashboards online até frameworks / codificam conhecimento do domínio | Uso estratégias ... e tornar ... mais eficientes / De painéis na web a soluções corporativas / reúnem o conhecimento da área | False friend "aplicação", gerund, "desde ... até" fragment, "codificar conhecimento" calque. |
| 2026-11-11 | essay title | Código é barato, julgamento não | Código é barato, critério não | "Julgamento" suggests a trial; professional judgement is "critério". |
| 2026-11-11 | scholarship | A Bolsa incentiva alunos de mestrado excelentes a dar um primeiro passo em direção a | A bolsa incentiva excelentes alunos de mestrado a dar o primeiro passo rumo à | Capital mid-sentence; English word order. |
| 2026-11-11 | home meta description, chat placeholder | estruturas de placas ... a IA muda a forma como ... trabalham / Pergunte algo ao {model}... | estruturas em placas ... a IA está mudando o trabalho de ... / Pergunte ao {model} sobre meu trabalho... | Same wording as the bio; placeholder restores "about my work". |
| 2026-11-11 | home chat starter question | Quais skills de agentes de IA você já criou para arquitetura e engenharia? | Quais skills de agentes de IA você já criou? | Daniel dropped "para arquitetura e engenharia": the question is complete without it, and the long version wrapped to two lines in its pill. |
| 2026-11-11 | home chat starter question | Que skills de agentes de IA você criou para arquitetura? | Quais skills de agentes de IA você já criou para arquitetura e engenharia? | "Que ... você criou" reads abrupt; "Quais ... você já criou" is how the question is asked. Daniel also widened it to "arquitetura e engenharia". |
| 2026-11-11 | chat benchmark question (`scripts/benchmark-chat.ts`) | O que você construiu antes? | Você já participou de quais projetos? / Quais programas você já desenvolveu? / Com o que você trabalha? | Nobody asks "construiu" about a career; it is "What did you build" word for word. Ask about projects, software ("programas") or work instead. |
| 2026-11-11 | chat bottom bar, before the model name | Desenvolvido com | Respostas geradas pelo | "Desenvolvido" says the site was built with the model; the model only writes the answers. Translate what a label does, not the English idiom ("Powered by"). |
| 2026-11-11 | subpage next-entry label | Próximo | Próximo (kept) | Reviewer proposed "Seguinte" for gender neutrality; "Próximo/Anterior" is the standard Brazilian navigation pair. |
| 2026-11-11 | CV quote | materiais vernaculares | materiais vernaculares (kept) | "Vernacular" is a valid Portuguese adjective (Priberam: same as "vernáculo") and the usual term in architecture. |
| 2026-11-11 | CV quote | Seu futuro reside na aplicação | Seu futuro está na aplicação | "Reside" is a stiff calque of "lies in". |
| 2026-11-11 | CV summary | pesquisando do design computacional à fabricação de sistemas construtivos em placas de madeira e como a IA pode apoiar | com pesquisa sobre sistemas construtivos em placas de madeira, do design computacional à fabricação, e sobre como a IA pode apoiar | Gerund plus English word order. |
| 2026-11-11 | CV summary | especializado em construção em madeira, integrando design e engenharia através de C#/.NET e Python | voltado à construção em madeira, unindo projeto e engenharia com C#, Python e tecnologias web | "Através de" calques "through"; also restored "web technologies". |
| 2026-11-11 | CV summary | dedicado a solucionar problemas estruturais complexos através de software escalável | que resolve problemas estruturais complexos com software escalável | "Dedicado a" and "através de" are calques. |
| 2026-11-11 | CV meta descriptions | Este é meu CV simplificado, incluindo trabalho, educação, ... | Meu CV resumido, com a experiência profissional principal, formação, ... | "Este é meu", "incluindo", "educação" are calques. |
| 2026-11-11 | CV labels | Educação / Especializações / Cursos frequentados / Habilidades / Certificados / Ferramentas | Formação / Especialidades / Cursos realizados / Competências / Certificações / Ferramentas de design | False friends and CV conventions; "especialização" is a postgraduate course in Brazil. |
| 2026-11-11 | CV labels | Supervisores / Conselheiros | Orientadores / Coorientadores | Academic terms; "conselheiro" is a false friend. |
| 2026-11-11 | labels (CV, subpage) | Experiência Profissional, Experiência Docente, Lista de Projetos, Outros Links | Experiência profissional, Experiência docente, Lista de projetos, Outros links | Title Case is English; Portuguese uses sentence case. |
| 2026-11-11 | footer and legal titles | Termos e Condições / Impressum | Termos de uso / Informações legais | Usual Brazilian names. |
| 2026-11-11 | subpage | Assistir apresentação | Assistir à apresentação | Crase required. |
| 2026-11-11 | home chat | Desculpe, encontrei um erro. Por favor, tente novamente mais tarde. | Desculpe, algo deu errado. Tente novamente mais tarde. | Calque of "I encountered an error". |
| 2026-11-11 | home chat | Assistente IA / Envie um Email / Faça um orçamento | Assistente de IA / Envie um e-mail / Solicite um orçamento | Noun stack; "e-mail" spelling; "faça" means the visitor drafts the quote. |
| 2026-11-11 | home chat | Pergunte qualquer coisa sobre minha pesquisa, projetos ou ensino. | Pergunte o que quiser sobre minha pesquisa, meus projetos ou minhas aulas. | Possessive agreement; "ensino" sounds institutional. |
| 2026-11-11 | home chat greeting | sobre meu trabalho, experiência ou projetos | sobre meu trabalho, minha experiência ou meus projetos | One "meu" cannot agree with feminine and plural nouns. |
| 2026-11-11 | home chat starter question | Skills de agentes de IA para arquitetura? | Que skills de agentes de IA você criou para arquitetura? | English-style noun-stack fragment as a question. |
| 2026-11-11 | home bio | Pesquiso como estruturas de placas de madeira são projetadas e construídas | Pesquiso o projeto e a construção de estruturas de placas de madeira | Passive voice follows the English. |
| 2026-11-11 | home bio | Pesquiso o projeto e a construção de estruturas de placas de madeira, e como a IA está mudando a forma como arquitetos e engenheiros trabalham | Pesquiso como projetar e construir estruturas em placas de madeira e como a IA está mudando o trabalho de arquitetos e engenheiros | Nominalized "o projeto e a construção de" sounds stiff; verbs read naturally. "Em placas" matches "sistemas construtivos em placas de madeira". |
| 2026-11-11 | home meta description | Ensaios e pesquisa sobre | Ensaios e pesquisas sobre | Plural reads more naturally. |
| 2026-11-11 | home chat starter question | O que você construiu antes? | Em quais projetos você já trabalhou? | Literal translation of "What did you build before?"; the question is about past projects. |

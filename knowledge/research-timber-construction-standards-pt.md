URL: https://daniellocatelli.com/pt/research/timber-construction-standards

# Normas para especificações em construção de madeira

Description: Uma revisão sistemática das normas ISO, GS1, CEN, DIN, SIA e KBOB que regem a especificação de materiais e composições multicamadas na construção em madeira, do incêndio e da física das construções aos modelos de dados BIM e ao passaporte digital de produto. Pacote de trabalho 1.2 do projeto DOKwood.
Tags: Normas, Construção em madeira, Passaporte Digital de Produto
Authors: Daniel Nunes Locatelli
Organization: Universidade de Ciências Aplicadas de Munique
Location: Munique
Date: February 2025 - June 2026
Link: /pt/projects/dokwood

Antes que uma plataforma possa documentar composições de madeira de um modo que outras empresas e ferramentas entendam, alguém precisa responder a uma pergunta simples: quais normas definem as palavras, os valores e os ensaios? Este pacote de trabalho do projeto [DOKwood](/pt/projects/dokwood) respondeu a essa pergunta para a indústria da madeira alemã e suíça. O resultado é um relatório que mapeia o panorama desde os organismos internacionais até os regulamentos cantonais de incêndio, e um vocabulário interno proposto, ancorado em termos normativos governados.

## Método

O escopo veio dos parceiros industriais. A Gumpp & Maier e a Schärholzbau nomearam os organismos a que respondem na prática: ISO e CEN, DIN, VDI e DIBt na Alemanha, SNV, SIA, KBOB e VKF na Suíça. Um benchmark de plataformas comparáveis (Ubakus, Dataholz, Lignum Data) e uma revisão dos processos internos dos parceiros fixaram a granularidade dos dados e os domínios temáticos que valia a pena cobrir.

A identificação em si foi sistemática, não anedótica. A Classificação Internacional de Normas (ICS) da ISO agrupa cada norma em domínios hierárquicos; assim, em vez de ler documentos um a um, a revisão percorreu os grupos ICS relevantes (79 Tecnologia da madeira, 91 Materiais de construção e edificação, 13.220 Proteção contra incêndio, e assim por diante) e excluiu os que não tinham relação. As normas europeias e nacionais que a ISO não adota foram depois pesquisadas no Nautos, a plataforma de texto integral que a DIN disponibiliza à Hochschule München, filtradas pelos mesmos códigos ICS e por um conjunto consolidado de palavras-chave abrangendo termos de construção, materiais, meio ambiente e documentação. Os regulamentos regionais (códigos de obras, diretrizes de incêndio, recomendações de compras públicas) foram coletados separadamente, pois não são normas mas vinculam com a mesma força.

## Quem escreve as regras

O relatório dedica um capítulo às organizações, porque o seu alcance explica por que o mesmo tema pode ter documentos diferentes na Alemanha e na Suíça. No nível internacional, a ISO e a IEC produzem normas voluntárias que ganham peso legal quando regulamentos ou contratos as citam, enquanto a GS1 fornece a camada de identificação (GTIN, GLN, GS1 Digital Link) que liga um produto físico ao seu registro digital. Na Europa, o CEN desenvolve normas harmonizadas por mandato da Comissão Europeia; aplicar uma delas confere presunção de conformidade com o direito da UE, e os organismos nacionais devem publicá-la e retirar as normas nacionais conflitantes.

A Alemanha sobrepõe a DIN, as diretrizes VDI e o DIBt, cuja Muster-Holzbau-Richtlinie leva as regras de incêndio e estabilidade da madeira para os códigos de obras estaduais. A Suíça adota as normas EN por meio da SNV, mas delega a autoridade real às normas SIA, que misturam requisitos técnicos e contratuais, às recomendações da KBOB para clientes públicos e aos regulamentos de incêndio da VKF, que são juridicamente vinculantes.

## Normas por domínio

O núcleo do relatório agrupa as normas coletadas pelo que elas regem:

- **Materiais e produtos.** Propriedades intrínsecas (reação ao fogo, acústicas, térmicas, higrotérmicas) e as normas de produto para madeira e derivados, das classes de resistência da EN 338 à madeira lamelada colada da EN 14080 e à madeira lamelada cruzada da EN 16351.
- **Projeto estrutural e de incêndio.** Eurocódigo 5 (EN 1995) com os seus anexos nacionais, dimensionamento ao fogo por carbonização e as camadas nacionais obrigatórias, como a MHolzBauRL e as diretrizes da VKF.
- **Física das composições.** Resistência ao fogo, som aéreo e de impacto, transmitância térmica e umidade para o conjunto de camadas montado: DIN 4102, 4108 e 4109 na Alemanha, SIA 180 e 181 na Suíça, EN ISO 6946 para valores U.
- **Comunicação técnica.** Representação em desenho, cotagem e símbolos, e documentação de construção.
- **Digitalização e dados.** Gestão da informação ISO 19650, nível de necessidade de informação ISO 7817, IFC, IDS e a pilha de dicionário e modelos de dados que sustenta o software AEC interoperável: ISO 12006-3 para a estrutura do dicionário, ISO 23386 para definições de propriedades governadas, ISO 23387 para a montagem de propriedades em modelos de dados.
- **Sustentabilidade.** ACV segundo ISO 14040/14044, EPDs segundo EN 15804 e ISO 21930, e ISO 22057 para modelos de dados de EPD em BIM.

## O passaporte digital de produto

A descoberta de maior consequência diz respeito à regulamentação, não à técnica. O Regulamento dos Produtos de Construção de 2024 (UE 2024/3110) entrou em vigor em janeiro de 2025 e introduz gradualmente um Passaporte Digital de Produto para produtos de construção sob normas harmonizadas, o que coloca a construção entre os primeiros setores afetados. A arquitetura técnica do DPP está sendo escrita pelo CEN/CENELEC JTC 24 como uma série de pré-normas (prEN 18216 a 18246) que cobrem troca de dados, identificadores únicos, portadores de dados, persistência, APIs, interoperabilidade, direitos de acesso e integridade dos dados, com os identificadores GS1 como base técnica esperada.

Para elementos pré-fabricados de madeira, que combinam muitos produtos em um único componente entregue, o passaporte terá de sintetizar origem dos materiais, dados de ACV, classificações de incêndio e instruções de fim de vida entre disciplinas. O Digital Building Logbook estende a mesma ideia do produto ao edifício, com o estudo da Ecorys para a Comissão Europeia como referência e variantes nacionais como o Gebäuderessourcenpass da DGNB na Alemanha e um Gebäudepass baseado em GS1 na Suíça.

## O que isso significa para o DOKwood

Três conclusões seguiram para o restante do projeto. Primeira: o projeto estrutural está harmonizado nos Eurocódigos, mas incêndio, acústica, proteção térmica e ACV mantêm especificidade nacional substancial, de modo que uma ferramenta transfronteiriça precisa de uma arquitetura de dados capaz de armazenar e validar contra as regras alemãs e suíças ao mesmo tempo. Segunda: a terminologia interna dos parceiros divergia dos termos normativos de maneiras que minariam qualquer troca legível por máquina, e é por isso que o relatório termina com a proposta de um vocabulário comum ancorado nas ISO 12006-3, 23386 e 23387. Terceira: o DPP chegará quer uma empresa se prepare ou não, e um registro de composições alinhado às normas é o substrato certo para ele. Esse vocabulário é o que se tornou o [dicionário de dados bSDD do DOKwood](/pt/research/dokwood-bsdd-data-dictionary).

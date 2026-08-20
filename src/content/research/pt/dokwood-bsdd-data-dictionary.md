---
Cover: /assets/content/research/dokwood-bsdd-data-dictionary/iso-23387-two-plane.svg
CoverAlt: "Dois planos: o dicionário bSDD público com propriedades e classes acima, e a plataforma DOKwood com modelos de dados de empresa, folhas de requisitos, folhas de dados e o passaporte digital de produto abaixo."
CoverFit: contain
Description: "O buildingSMART Data Dictionary hm/dokwood: um vocabulário versionado e legível por máquina para composições e produtos de madeira, construído sobre os modelos de dados da ISO 23387, publicado no bSDD e projetado como espinha dorsal semântica das interfaces Revit, Cadwork e MCP do DOKwood e de um futuro passaporte digital de produto."
Name: Dicionário de dados bSDD do DOKwood
Tags:
  - bSDD
  - ISO 23387
  - Modelos de dados
  - Construção em madeira
Authors:
  - Daniel Nunes Locatelli
  - Fabian Scheurer
  - Sebastián Hernández-Maetschl
  - Joel Karolin
Organization: Universidade de Ciências Aplicadas de Munique
City:
  - Munique
Country: Alemanha
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: hm/dokwood no buildingSMART Data Dictionary
  Href: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13
OtherLinks:
  - Text: Página do projeto DOKwood
    Href: https://daniellocatelli.com/pt/projects/dokwood
---

A plataforma [DOKwood](/pt/projects/dokwood) troca composições construtivas com o Revit, o Cadwork e, futuramente, com assistentes de IA e um passaporte digital de produto. Cada uma dessas trocas é tão interoperável quanto o vocabulário que a sustenta: se "classe de resistência ao fogo" significa uma coisa na plataforma, outra no template do Revit e uma terceira no PDF do parceiro, nada a jusante merece confiança. O buildingSMART Data Dictionary (bSDD) é a resposta da indústria a esse problema, um registro público e versionado de classes e propriedades com URIs estáveis que qualquer ferramenta pode resolver. Esta página trata do dicionário que construí lá para o DOKwood.

## O dicionário hm/dokwood

O dicionário é publicado sob o código de organização da Hochschule München como `hm/dokwood` e passou por treze versões, de v0.1 a v0.13, durante o tempo em que trabalhei lá.

A v0.13, o conteúdo publicado atualmente, contém 32 classes (15 classes de objeto e 17 grupos de propriedades), 129 propriedades, 349 ligações classe-propriedade, 100 valores permitidos e 65 relações entre propriedades. Duas dessas versões foram impulsionadas pelas interfaces: a v0.12 fechou a superfície de propriedades de que o add-in do Revit precisa (função da camada, limite do núcleo, categoria hospedeira via entidade IFC, cor e hachura do material) e a v0.13 fechou a que o plugin do Cadwork precisa para a construção de elementos. Cada ferramenta tem o seu próprio grupo de propriedades, de modo que um plugin pode pedir exatamente o pacote que consome.

## Modelos de dados da ISO 23387

A ISO 23387, a norma de modelos de dados para objetos de construção, é o substrato de todo o modelo de dados: o dicionário da empresa, o repositório de projeto e, em última análise, o passaporte digital de produto seguem-na, enquanto o dicionário público assenta na ISO 12006-3 para a estrutura do dicionário e na ISO 23386 para propriedades governadas. Um modelo de dados lista quais propriedades descrevem um tipo de objeto, sem valores. O DOKwood usa dois: um System Data Template para uma composição, porque uma composição é um sistema de camadas, e um Product Data Template para um produto. Uma composição é formada por camadas e uma camada por produtos, codificado como a composição HasPart da norma. Se uma camada precisa de um modelo próprio, para carregar espessura, papel ou função, é uma questão em aberto deixada para a próxima versão.

![À esquerda: Wall, Roof e Slab são tipos de Buildup, um System Data Template composto de camadas e produtos, cada produto um Product Data Template. À direita: um modelo de dados lista propriedades, uma folha de requisitos os restringe a valores exigidos e uma folha de dados os satisfaz com valores declarados.](/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg)

Modelar um conjunto inteiro como modelo de dados ainda é raro; a maioria dos dicionários para em produtos isolados. Codificar a composição é onde o DOKwood vai um passo além, e é o que permite a segunda metade da imagem. O dicionário público oferece as propriedades e classes. Cada empresa de madeira compõe a partir delas os seus próprios modelos de dados (uma parede externa da Schärholzbau) e os restringe em modelos de requisitos (Rw de pelo menos 56 dB). Em um projeto eles se tornam folhas: uma folha de requisitos diz o que é exigido, uma folha de dados diz o que foi declarado ou medido, e uma única regra de aninhamento amarra a cadeia: o genérico contém o requisito, que contém o valor. A folha de dados preenchida de uma composição fabricada é precisamente o que um passaporte digital de produto carrega.

## Para onde vai

A próxima versão, v0.14, foi especificada até o fechamento mas ainda não construída quando saí. Os seus movimentos: colapsar as doze subclasses nomeadas de composição em uma classe por entidade IFC (Wall, Roof, Slab, mais um Buildup genérico); acrescentar um modelo de Ambiente com condições de contorno (ambiente aquecido, ar exterior, solo) para que um motor de cálculo possa derivar resistências superficiais e valores U segundo a EN ISO 6946 e a SIA 180; acrescentar a primeira cadeia de composição HasPart; e acrescentar as classes Document e Project, a primeira para anexar certificados, fichas técnicas e EPDs como trilha documental do passaporte. Em paralelo, a equipe decidiu passar de um único dicionário rígido para todos a um framework: um núcleo mínimo e extensível, com cada tenant dono do seu próprio catálogo que o referencia, já que as leis suíça e alemã e os fluxos de trabalho de cada empresa diferem. O dicionário de hoje torna-se o catálogo inicial que um novo tenant bifurca.

O objetivo que enquadra tudo isso é o Passaporte Digital de Produto, obrigatório para produtos de construção a partir de cerca de 2028 sob o Regulamento dos Produtos de Construção de 2024 e o ESPR. As composições versionadas e descritas em bSDD do DOKwood são a base certa, e a análise de lacunas que deixei lista o que ainda falta à plataforma: um modelo de propriedades aberto em que cada valor carrega o seu URI bSDD com versão fixada, em vez de duas grandezas físicas codificadas à mão; identificadores persistentes; uma exportação enxuta em JSON-LD, como recomenda o CIRPASS-2; estados de ciclo de vida do projetado ao construído; certificados verificáveis por meio da classe Document; e um portador de dados no item fabricado. A maior parte disso é trabalho fundamental de modelo de dados que compensa independentemente do passaporte, porque é o mesmo trabalho que torna confiáveis as interfaces Revit, Cadwork e MCP.

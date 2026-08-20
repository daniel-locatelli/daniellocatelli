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

O dicionário é publicado sob o código de organização da Hochschule München como `hm/dokwood` e passou por treze versões, de v0.1 a v0.13, durante o tempo em que trabalhei lá. Cada ferramenta que o consome, como o add-in do Revit ou o plugin do Cadwork, tem o seu próprio grupo de propriedades, de modo que um plugin pode pedir exatamente o pacote de que precisa.

## Modelos de dados da ISO 23387

A ISO 23387, a norma de modelos de dados para objetos de construção, é o substrato de todo o modelo de dados: o dicionário da empresa, o repositório de projeto e, em última análise, o passaporte digital de produto seguem-na, enquanto o dicionário público assenta na ISO 12006-3 para a estrutura do dicionário e na ISO 23386 para propriedades governadas. Um modelo de dados lista quais propriedades descrevem um tipo de objeto, sem valores. O DOKwood usa dois: um System Data Template para uma composição, porque uma composição é um sistema de camadas, e um Product Data Template para um produto. A composição é aninhada: uma composição construtiva tem camadas como partes, e cada camada tem produtos como partes, ambas expressas com a relação HasPart da norma. Se uma camada precisa de um modelo próprio, para carregar espessura, papel ou função, é uma questão em aberto deixada para a próxima versão.

![À esquerda: Wall, Roof e Slab são tipos de Buildup, um System Data Template composto de camadas e produtos, cada produto um Product Data Template. À direita: um modelo de dados lista propriedades, uma folha de requisitos os restringe a valores exigidos e uma folha de dados os satisfaz com valores declarados.](/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg "Composição de uma composição construtiva, e do modelo à folha")

Modelar um conjunto inteiro como modelo de dados ainda é raro; a maioria dos dicionários para em produtos isolados. Codificar a composição é onde o DOKwood vai um passo além, e é o que permite a segunda metade da imagem. O dicionário público oferece as propriedades e classes. Cada empresa de madeira compõe a partir delas os seus próprios modelos de dados, uma parede externa da Schärholzbau por exemplo, ainda sem valores. Em um projeto, uma folha de requisitos preenche esse modelo com os valores exigidos (Rw de pelo menos 56 dB, REI 90), e uma folha de dados com os valores declarados ou medidos (Rw = 59 dB). A própria ISO 23387 conhece apenas o modelo de dados e a folha de dados, e permite que uma folha de dados represente tanto um requisito quanto um produto; folha de requisitos é o nome que o DOKwood dá a esse primeiro tipo, mantido à parte porque é preenchido antes de qualquer coisa ser construída. Uma única regra de aninhamento amarra a cadeia: o genérico contém o requisito, que contém o valor. A folha de dados preenchida de uma composição fabricada é precisamente o que um passaporte digital de produto carrega.

![Três folhas com as mesmas cinco propriedades: o modelo de dados deixa todos os valores vazios, a folha de requisitos os preenche com valores exigidos como Rw de pelo menos 56 dB e REI 90, e a folha de dados com valores declarados como Rw 59 dB; setas rotuladas tighten e satisfy as ligam.](/assets/content/research/dokwood-bsdd-data-dictionary/template-to-sheet.svg "Modelo de dados, folha de requisitos e folha de dados")

## Para onde vai

A próxima versão, v0.14, foi especificada até o fechamento mas ainda não construída quando saí. Os seus movimentos: colapsar as doze subclasses nomeadas de composição em uma classe por entidade IFC (Wall, Roof, Slab, mais um Buildup genérico); acrescentar um modelo de Ambiente com condições de contorno (ambiente aquecido, ar exterior, solo) para que um motor de cálculo possa derivar resistências superficiais e valores U segundo a EN ISO 6946 e a SIA 180; acrescentar a primeira cadeia de composição HasPart; e acrescentar as classes Document e Project, a primeira para anexar certificados, fichas técnicas e EPDs como trilha documental do passaporte. Em paralelo, a equipe decidiu passar de um único dicionário rígido para todos a um framework: um núcleo mínimo e extensível, com cada tenant dono do seu próprio catálogo que o referencia, já que as leis suíça e alemã e os fluxos de trabalho de cada empresa diferem. O dicionário de hoje torna-se o catálogo inicial que um novo tenant bifurca.

O objetivo que enquadra tudo isso é o Passaporte Digital de Produto, obrigatório para produtos de construção a partir de cerca de 2028 sob o Regulamento dos Produtos de Construção de 2024 e o ESPR. As composições versionadas e descritas em bSDD do DOKwood são a base certa, e a análise de lacunas que deixei lista o que ainda falta à plataforma: um modelo de propriedades aberto em que cada valor carrega o seu URI bSDD com versão fixada, em vez de duas grandezas físicas codificadas à mão; identificadores persistentes; uma exportação enxuta em JSON-LD, como recomenda o CIRPASS-2; estados de ciclo de vida do projetado ao construído; certificados verificáveis por meio da classe Document; e um portador de dados no item fabricado. A maior parte disso é trabalho fundamental de modelo de dados que compensa independentemente do passaporte, porque é o mesmo trabalho que torna confiáveis as interfaces Revit, Cadwork e MCP.

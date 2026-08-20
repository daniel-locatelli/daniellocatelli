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
  - Text: ISO 23387:2025 modelos de dados
    Href: https://www.iso.org/standard/85391.html
  - Text: ISO 23386:2020 propriedades em dicionários de dados
    Href: https://www.iso.org/standard/75401.html
  - Text: ISO 12006-3:2022 estrutura para informação orientada a objetos
    Href: https://www.iso.org/standard/74932.html
  - Text: EN 17549-2:2023 objetos de construção configuráveis e requisitos
    Href: https://standards.iteh.ai/catalog/standards/cen/d1d7f084-fe17-4e3e-bc06-b17a936ae485/en-17549-2-2023
  - Text: Regulamento (UE) 2024/3110, Regulamento dos Produtos de Construção
    Href: https://eur-lex.europa.eu/eli/reg/2024/3110/oj/eng
  - Text: Regulamento (UE) 2024/1781, Conceção Ecológica de Produtos Sustentáveis (ESPR)
    Href: https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng
  - Text: CIRPASS-2 pilotos de passaporte digital de produto
    Href: https://cirpass2.eu/
---

A plataforma [DOKwood](/pt/projects/dokwood) troca composições construtivas com o Revit, o Cadwork e, futuramente, com assistentes de IA e um passaporte digital de produto. Cada uma dessas trocas é tão interoperável quanto o vocabulário que a sustenta: se "classe de resistência ao fogo" significa uma coisa na plataforma, outra no template do Revit e uma terceira no PDF do parceiro, nada a jusante merece confiança. O buildingSMART Data Dictionary (bSDD) é a resposta da indústria a esse problema, um registro público e versionado de classes e propriedades com URIs estáveis que qualquer ferramenta pode resolver. Esta página trata do dicionário que construí lá para o DOKwood.

O dicionário é publicado sob o código de organização da Hochschule München como `hm/dokwood` e passou por treze versões, de v0.1 a v0.13, durante o tempo em que trabalhei lá. Cada ferramenta que o consome, como o add-in do Revit ou o plugin do Cadwork, tem o seu próprio grupo de propriedades, de modo que um plugin pode pedir exatamente o pacote de que precisa.

## Modelos de dados da ISO 23387

A ISO 23387, a norma de modelos de dados para objetos de construção, é o substrato de todo o modelo de dados: o dicionário da empresa, o repositório de projeto e, em última análise, o passaporte digital de produto seguem-na, enquanto o dicionário público assenta na ISO 12006-3 para a estrutura do dicionário e na ISO 23386 para propriedades governadas. Um modelo de dados lista quais propriedades descrevem um tipo de objeto, sem valores. O DOKwood usa dois: um System Data Template para uma composição, porque uma composição é um sistema de camadas, e um Product Data Template para um produto. A composição é aninhada: uma composição construtiva tem camadas como partes, e cada camada tem produtos como partes, ambas expressas com a relação HasPart da norma. Se uma camada precisa de um modelo próprio, para carregar espessura, papel ou função, é uma questão em aberto deixada para a próxima versão.

![À esquerda: Wall, Roof e Slab são tipos de Buildup, um System Data Template composto de camadas e produtos, cada produto um Product Data Template. À direita: um modelo de dados lista propriedades, uma folha de requisitos os restringe a valores exigidos e uma folha de dados os satisfaz com valores declarados.](/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg "Composição de uma composição construtiva, e do modelo à folha")

Modelar um conjunto inteiro como modelo de dados ainda é raro; a maioria dos dicionários para em produtos isolados. Codificar a composição é onde o DOKwood vai um passo além, e é o que permite a segunda metade da imagem. O dicionário público oferece as propriedades e classes. Cada empresa de madeira compõe a partir delas os seus próprios modelos de dados, uma parede externa da Schärholzbau por exemplo, ainda sem valores. Em um projeto, uma folha de requisitos preenche esse modelo com os valores exigidos (Rw de pelo menos 56 dB, REI 90), e uma folha de dados com os valores declarados ou medidos (Rw = 59 dB). A própria ISO 23387 conhece apenas o modelo de dados e a folha de dados, e permite que uma folha de dados represente tanto um requisito quanto um produto; folha de requisitos é o nome que o DOKwood dá a esse primeiro tipo, mantido à parte porque é preenchido antes de qualquer coisa ser construída. Uma única regra de aninhamento amarra a cadeia: o genérico contém o requisito, que contém o valor. A folha de dados preenchida de uma composição fabricada é precisamente o que um passaporte digital de produto carrega.

![Três folhas com as mesmas cinco propriedades: o modelo de dados deixa todos os valores vazios, a folha de requisitos os preenche com valores exigidos como Rw de pelo menos 56 dB e REI 90, e a folha de dados com valores declarados como Rw 59 dB; setas rotuladas tighten e satisfy as ligam.](/assets/content/research/dokwood-bsdd-data-dictionary/template-to-sheet.svg "Modelo de dados, folha de requisitos e folha de dados")

## Para onde vai

O objetivo que enquadra tudo isso é o Passaporte Digital de Produto, obrigatório para produtos de construção a partir de cerca de 2028 sob o Regulamento dos Produtos de Construção de 2024 e o ESPR. As composições versionadas e descritas em bSDD do DOKwood são a base certa, e a análise de lacunas que deixei lista o que ainda falta à plataforma: um modelo de propriedades aberto em que cada valor carrega o seu URI bSDD com versão fixada, em vez de duas grandezas físicas codificadas à mão; identificadores persistentes; uma exportação enxuta em JSON-LD, como recomenda o CIRPASS-2; estados de ciclo de vida do projetado ao construído; certificados verificáveis por meio da classe Document; e um portador de dados no item fabricado. A maior parte disso é trabalho fundamental de modelo de dados que compensa independentemente do passaporte, porque é o mesmo trabalho que torna confiáveis as interfaces Revit, Cadwork e MCP.

![Uma folha de dados preenchida de uma composição fabricada, com valores como Rw 59 dB e REI 90, alimenta um passaporte digital de produto que envolve esses valores com um identificador persistente, URIs bSDD com versão fixada em cada propriedade, uma trilha documental de certificados, fichas técnicas e EPDs, um estado de ciclo de vida do projetado ao construído, um portador de dados no item e uma exportação JSON-LD.](/assets/content/research/dokwood-bsdd-data-dictionary/data-sheet-to-dpp.svg "A folha de dados alimenta o passaporte digital de produto")

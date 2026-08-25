URL: https://daniellocatelli.com/pt/research/timber-buildup-data-model

# Um modelo de dados para composições construtivas em madeira

Description: Como uma composição construtiva em madeira se torna legível por máquina: um modelo de dados ISO 23387 que aninha camadas e produtos dentro de uma composição, restringe um modelo de dados em folha de requisitos e a satisfaz com uma folha de dados, publicado como o dicionário versionado hm/dokwood no bSDD e projetado para sustentar as interfaces Revit, Cadwork e MCP do DOKwood e um futuro passaporte digital de produto.
Tags: bSDD, ISO 23387, Modelos de dados, Construção em madeira
Authors: Daniel Nunes Locatelli, Fabian Scheurer, Sebastián Hernández-Maetschl, Joel Karolin
Organization: Universidade de Ciências Aplicadas de Munique
Location: Munique
Date: February 2025 - June 2026
Link: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13

A plataforma [DOKwood](/pt/projects/dokwood) troca composições construtivas com o Revit, o Cadwork e, futuramente, com assistentes de IA e um passaporte digital de produto. Cada uma dessas trocas é tão interoperável quanto o vocabulário que a sustenta: se "classe de resistência ao fogo" significa uma coisa na plataforma, outra no template do Revit e uma terceira no PDF do parceiro, nada a jusante merece confiança. O buildingSMART Data Dictionary (bSDD) é a resposta da indústria a esse problema, um registro público e versionado de classes e propriedades com URIs estáveis que qualquer ferramenta pode resolver. Esta página trata do dicionário que construí lá para o DOKwood.

O dicionário é publicado sob o código de organização da Hochschule München como `hm/dokwood` e passou por treze versões, de v0.1 a v0.13, durante o tempo em que trabalhei lá. Cada ferramenta que o consome, como o add-in do Revit ou o plugin do Cadwork, tem o seu próprio grupo de propriedades, de modo que um plugin pode pedir exatamente o pacote de que precisa.

## Modelos de dados da ISO 23387

A ISO 23387, a norma de modelos de dados para objetos de construção, é o substrato de todo o modelo de dados: o dicionário da empresa, o repositório de projeto e, em última análise, o passaporte digital de produto seguem-na, enquanto o dicionário público assenta na ISO 12006-3 para a estrutura do dicionário e na ISO 23386 para propriedades governadas. Um modelo de dados lista quais propriedades descrevem um tipo de objeto, sem valores. O DOKwood usa dois: um System Data Template para uma composição, porque uma composição é um sistema de camadas, e um Product Data Template para um produto. A composição é aninhada: uma composição construtiva tem camadas como partes, e cada camada tem produtos como partes, ambas expressas com a relação HasPart da norma. Se uma camada precisa de um modelo próprio, para carregar espessura, papel ou função, é uma questão em aberto deixada para a próxima versão.

Modelar um conjunto inteiro como modelo de dados ainda é raro; a maioria dos dicionários para em produtos isolados. Codificar a composição é onde o DOKwood vai um passo além, e é o que permite a segunda metade da imagem. O dicionário público oferece as propriedades e classes. Cada empresa de madeira compõe a partir delas os seus próprios modelos de dados, uma parede externa da Schärholzbau por exemplo, ainda sem valores. Em um projeto, uma folha de requisitos preenche esse modelo com os valores exigidos (Rw de pelo menos 56 dB, REI 90), e uma folha de dados com os valores declarados ou medidos (Rw = 59 dB). A própria ISO 23387 conhece apenas o modelo de dados e a folha de dados, e permite que uma folha de dados represente tanto um requisito quanto um produto; folha de requisitos é o nome que o DOKwood dá a esse primeiro tipo, mantido à parte porque é preenchido antes de qualquer coisa ser construída. Uma única regra de aninhamento amarra a cadeia: o genérico contém o requisito, que contém o valor. A folha de dados preenchida de uma composição fabricada é precisamente o que um passaporte digital de produto carrega.

## Para onde vai

O objetivo que enquadra tudo isso é o Passaporte Digital de Produto, obrigatório para produtos de construção a partir de cerca de 2028 sob o Regulamento dos Produtos de Construção de 2024 e o ESPR. As composições versionadas e descritas em bSDD do DOKwood são a base certa, e a análise de lacunas que deixei lista o que ainda falta à plataforma: um modelo de propriedades aberto em que cada valor carrega o seu URI bSDD com versão fixada, em vez de duas grandezas físicas codificadas à mão; identificadores persistentes; uma exportação enxuta em JSON-LD, como recomenda o CIRPASS-2; estados de ciclo de vida do projetado ao construído; certificados verificáveis por meio da classe Document; e um portador de dados no item fabricado. A maior parte disso é trabalho fundamental de modelo de dados que compensa independentemente do passaporte, porque é o mesmo trabalho que torna confiáveis as interfaces Revit, Cadwork e MCP.

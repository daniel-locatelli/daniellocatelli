URL: https://daniellocatelli.com/pt/research/dokwood-bsdd-data-dictionary

# Dicionário de dados bSDD do DOKwood

Description: O buildingSMART Data Dictionary hm/dokwood: um vocabulário versionado e legível por máquina para composições e produtos de madeira, construído sobre os modelos de dados da ISO 23387, publicado no bSDD e projetado como espinha dorsal semântica das interfaces Revit, Cadwork e MCP do DOKwood e de um futuro passaporte digital de produto.
Tags: bSDD, ISO 23387, Modelos de dados, Construção em madeira
Authors: Daniel Nunes Locatelli
Organization: Universidade de Ciências Aplicadas de Munique
Location: Munique
Date: February 2025 - June 2026
Link: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13

A plataforma [DOKwood](/pt/projects/dokwood) troca composições construtivas com o Revit, o Cadwork e, futuramente, com assistentes de IA e um passaporte digital de produto. Cada uma dessas trocas é tão interoperável quanto o vocabulário que a sustenta: se "classe de resistência ao fogo" significa uma coisa na plataforma, outra no template do Revit e uma terceira no PDF do parceiro, nada a jusante merece confiança. O buildingSMART Data Dictionary (bSDD) é a resposta da indústria a esse problema, um registro público e versionado de classes e propriedades com URIs estáveis que qualquer ferramenta pode resolver. Esta página trata do dicionário que construí lá para o DOKwood.

## O dicionário hm/dokwood

O dicionário é publicado sob o código de organização da Hochschule München como `hm/dokwood` e passou por treze versões, de v0.1 a v0.13, durante o projeto. O conteúdo é redigido em Excel usando o template da buildingSMART, convertido para o modelo de importação JSON do bSDD pelo conversor da própria buildingSMART e enviado. A partir da v0.8, cada versão é produzida por um pequeno script de build em Python que modifica a planilha da versão anterior; assim, a docstring do script é o registro de mudanças canônico daquela versão e cada lançamento é reproduzível a partir do anterior.

A v0.13, o conteúdo publicado atualmente, contém 32 classes (15 classes de objeto e 17 grupos de propriedades), 129 propriedades, 349 ligações classe-propriedade, 100 valores permitidos e 65 relações entre propriedades. Duas dessas versões foram impulsionadas pelas interfaces: a v0.12 fechou a superfície de propriedades de que o add-in do Revit precisa (função da camada, limite do núcleo, categoria hospedeira via entidade IFC, cor e hachura do material) e a v0.13 fechou a que o plugin do Cadwork precisa para a construção de elementos. Cada ferramenta tem o seu próprio grupo de propriedades, de modo que um plugin pode pedir exatamente o pacote que consome.

## Modelos de dados da ISO 23387

A forma do dicionário segue a ISO 23387, a norma de modelos de dados para objetos de construção, sobre a ISO 12006-3 para a estrutura do dicionário e a ISO 23386 para propriedades governadas. Um modelo de dados lista quais propriedades descrevem um tipo de objeto, sem valores. O DOKwood usa dois: um System Data Template para uma composição, porque uma composição é um sistema de camadas, e um Product Data Template para um produto. Uma composição é formada por camadas e uma camada por produtos, codificado como a composição HasPart da norma. Se uma camada precisa de um modelo próprio, para carregar espessura, papel ou função, é uma questão em aberto deixada para a próxima versão.

Modelar um conjunto inteiro como modelo de dados ainda é raro; a maioria dos dicionários para em produtos isolados. Codificar a composição é onde o DOKwood vai um passo além, e é o que permite a segunda metade da imagem. O dicionário público guarda os modelos genéricos. Um tenant, uma empresa de madeira, os especializa nos seus próprios modelos (uma parede externa da Schärholzbau) e os restringe em modelos de requisitos (Rw de pelo menos 56 dB). Em um projeto eles se tornam folhas: uma folha de requisitos diz o que é exigido, uma folha de dados diz o que foi declarado ou medido, e uma única regra de aninhamento amarra a cadeia: o genérico contém o requisito, que contém o valor. A folha de dados preenchida de uma composição fabricada é precisamente o que um passaporte digital de produto carrega.

## Para onde vai

A próxima versão, v0.14, foi especificada até o fechamento mas ainda não construída quando saí. Os seus movimentos: colapsar as doze subclasses nomeadas de composição em uma classe por entidade IFC (Wall, Roof, Slab, mais um Buildup genérico); acrescentar um modelo de Ambiente com condições de contorno (ambiente aquecido, ar exterior, solo) para que um motor de cálculo possa derivar resistências superficiais e valores U segundo a EN ISO 6946 e a SIA 180; acrescentar a primeira cadeia de composição HasPart; e acrescentar as classes Document e Project, a primeira para anexar certificados, fichas técnicas e EPDs como trilha documental do passaporte. Em paralelo, a equipe decidiu passar de um único dicionário rígido para todos a um framework: um núcleo mínimo e extensível, com cada tenant dono do seu próprio catálogo que o referencia, já que as leis suíça e alemã e os fluxos de trabalho de cada empresa diferem. O dicionário de hoje torna-se o catálogo inicial que um novo tenant bifurca.

O objetivo que enquadra tudo isso é o Passaporte Digital de Produto, obrigatório para produtos de construção a partir de cerca de 2028 sob o Regulamento dos Produtos de Construção de 2024 e o ESPR. As composições versionadas e descritas em bSDD do DOKwood são a base certa, e a análise de lacunas que deixei lista o que ainda falta à plataforma: um modelo de propriedades aberto em que cada valor carrega o seu URI bSDD com versão fixada, em vez de duas grandezas físicas codificadas à mão; identificadores persistentes; uma exportação enxuta em JSON-LD, como recomenda o CIRPASS-2; estados de ciclo de vida do projetado ao construído; certificados verificáveis por meio da classe Document; e um portador de dados no item fabricado. A maior parte disso é trabalho fundamental de modelo de dados que compensa independentemente do passaporte, porque é o mesmo trabalho que torna confiáveis as interfaces Revit, Cadwork e MCP.

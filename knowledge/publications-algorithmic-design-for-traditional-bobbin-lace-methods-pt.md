URL: https://daniellocatelli.com/pt/publications/algorithmic-design-for-traditional-bobbin-lace-methods

# Processo algorítmico para reproduzir rendas de bobina digitalmente

Description: Este artigo investiga a potencial aplicação de ferramentas digitais no projeto e fabricação de tramas têxteis através do uso combinado de busca de forma (form finding) e da técnica tradicional de renda de bilro.
Tags: Conceptual design, Form finding, Optimization, Dynamic relaxation, Evolutionary algorithm, Computational design, Grasshopper3d
Authors: Daniel Nunes Locatelli, Arthur Hunold Lara, Thiago Henrique Omena, Ruy Marcelo de Oliveira Pauletti
Location: Hamburg
Place: IASS 2017
Date: September 2017
Link: https://www.ingentaconnect.com/content/iass/piass/2017/00002017/00000009/art00013
Language: English

## Resumo

Este artigo investiga a potencial aplicação de ferramentas digitais no projeto e fabricação de tramas têxteis através do uso combinado de busca de forma e da técnica tradicional de renda de bilro. O trabalho explora como um método artesanal tradicional poderia levar a uma nova abordagem em torno do design paramétrico e generativo em conjunto com tecnologias de fabricação digital. A investigação completa é fundamentada em diversos estudos de caso de arquitetos renomados que têm seus trabalhos inspirados na natureza, como Buckminster Fuller e Frei Otto. Esses estudos de caso buscaram realizar engenharia reversa de seus trabalhos usando uma linguagem de programação visual popular, acessível à maioria dos profissionais. Considerando a crescente importância dos processos digitais no design devido aos seus resultados rápidos e otimizados, é imperativo que os arquitetos se adaptem a esse novo fluxo de trabalho. Esta é uma tentativa de mostrar como o design computacional pode incorporar um tema tradicional e inesperado com grande controle espacial. É também uma introdução ao processo de relaxação dinâmica e uma possível aplicação de um algoritmo evolutivo em arquitetura e design. Por fim, o algoritmo desenvolvido foi utilizado para propor um protótipo de cadeira tipo rede.

## Introdução

Por muitas décadas, o desenvolvimento urbano tem utilizado recursos naturais de tal forma que não será possível continuar sustentando esses excessos por muito tempo (Fry [4]). Estima-se, por exemplo, que a construção civil no Brasil produz sozinha cerca de 50 a 70% de toda a massa de resíduos sólidos urbanos do país, segundo Fernandez [3].

Como observado por Kieran e Timberlake [5] em seu livro *Refabricating Architecture*, atualmente existe um modus operandi muito semelhante aos processos com os quais a arquitetura de períodos anteriores era desenvolvida. Isso se deve ao fato de que, segundo esses autores, a produção arquitetônica hoje ainda leva muitos anos para projetar e construir. Além disso, a construção ainda demanda uma quantidade massiva de materiais, o que pode levar ao esgotamento de recursos.

Esses autores afirmam que os arquitetos capazes de compreender esse contexto o comparam com os avanços no projeto e fabricação de automóveis, aviões e embarcações. Nesses campos existem enormes possibilidades de novos materiais e processos nos quais o desperdício, o custo e o tempo de fabricação diminuem com a melhoria da qualidade.

Arquitetura algorítmica é uma área em pleno desenvolvimento que tenta suprir essa carência de tecnologia na indústria de arquitetura, engenharia e construção (AEC). Tradicionalmente, a palavra algoritmo se refere ao processo de lidar com um problema seguindo um número finito de passos. Contudo, nos dias de hoje, um algoritmo pode ser entendido como o mediador entre a mente humana e o poder de processamento do computador (Terzidis [9]).

Neste artigo, propomos uma instalação na Faculdade de Arquitetura e Urbanismo da Universidade de São Paulo, utilizando métodos de design computacional. Para viabilizá-la, adotamos um programa de necessidades simples, de modo que permitisse criar e aprimorar diversos algoritmos ao longo da pesquisa.

A bibliografia foi selecionada de forma a permitir uma visão geral dos estudos mais recentes em tecnologia de design computacional. Após pesquisar precedentes, percebeu-se que a maioria dos projetos convergia com a biomimética. Consequentemente, o presente estudo desenvolveu a mesma abordagem, pois incorpora a mesma base filosófica e lógica de arquitetos renomados: Achim Menges, Buckminster Fuller, Frei Otto e Tomas Saraceno.

Buckminster Fuller e Frei Otto foram especialmente importantes para este estudo. Buckminster, com seus estudos de geometria sinergética, tentou explorar o potencial da otimização no design, resultando em invenções como a cúpula geodésica e a Transformação Jitterbug que "fazem o máximo com o mínimo" (Krausse e Lichtenstein [6]). Frei Otto, por outro lado, produziu seus famosos modelos de investigação de busca de forma que exploravam qualidades físicas como filme de espuma, borracha e estruturas tensionadas (Barthel [1]).

## Arquitetura e Biomimética

Segundo Benyus [2], a biomimética utiliza a natureza como principal diretriz de projeto e pode ser dividida em três níveis. O primeiro, mais superficial, é uma tentativa de simplesmente imitar formas e padrões da natureza, independentemente do método utilizado. O segundo nível explora os caminhos que a natureza percorre até atingir seu resultado final, o processo. E o terceiro e mais amplo nível é imitar ecossistemas naturais, compreendendo que todos os indivíduos e elementos compõem uma única biosfera sustentável, interconectada e interdependente.

Na natureza, estruturas que parecem simples como teias de aranha, colmeias de abelhas e cupinzeiros são determinadas pelo DNA do animal que as constrói, ou seja, pela sua informação genética. Entretanto, mesmo nos casos em que há uma identidade formal claramente definida, adaptações específicas ainda são necessárias para o ambiente imediato em que está sendo instalada: cada teia de aranha é criada ligeiramente diferente uma da outra, por exemplo (Kull [7]).

A arquitetura algorítmica funciona de maneira semelhante e também explora esses mecanismos naturais, mas em vez de partir da informação genética, o projeto é determinado por um algoritmo. Em resumo, um algoritmo completo teria todas as informações necessárias para a execução de uma construção, incluindo diversas alterações exigidas de acordo com cada programa de necessidades.

## O Programa de Necessidades

Na exploração dos espaços da FAU-USP, ficou evidente que faltavam espaços de convivência estudantil. Além disso, a pesquisa mostra que os estudantes têm o hábito de instalar redes pelo edifício para suprir essa necessidade. A ideia de subverter a maneira como as redes são projetadas apresentou um grande potencial no campo da busca de forma. Ao combinar design computacional com um método tradicional de tecelagem, a direção do projeto caminhou para um novo sistema de design.

Contudo, antes de iniciar o estudo, era importante determinar uma estratégia:

### Biomimética
Deve apresentar uma abordagem inspirada na natureza, enquadrando-se ao menos no segundo nível de biomimética (processos).

### Conforto
O resultado final deve ter um material confortável e permitir variações para que os usuários possam permanecer em diversas posições: sentado, recostado e deitado.

### Fabricabilidade
É essencial que o projeto utilize as máquinas e ferramentas existentes e disponíveis na FAU-USP.

### Identidade
O resultado final deve fazer referência ao logotipo da FAU-USP com a intenção de conectá-lo a outra forma de pensar além da visão modernista estabelecida.

### Localização
A área proposta consiste em um quadrado de 12 metros de lado (144 m²) coberto por gramado, localizado entre o edifício principal da FAU-USP e o Laboratório de Modelos e Ensaios (LAME).

### Otimização
A forma como é projetado deve considerar a otimização de forma e estrutura.

### Respeito ao Patrimônio Histórico
Esta instalação deve ser temporária, uma vez que a FAU-USP é um edifício tombado e, portanto, não permite nenhum tipo de intervenção permanente.

## Técnica

O principal software utilizado para desenvolver este estudo foi o Rhinoceros 3D e seu plug-in Grasshopper. Também foi crucial o uso de plug-ins para Grasshopper como Kangaroo Physics, Lunchbox, Starling e Weaverbird. O Galapagos, que é um algoritmo baseado na teoria da evolução proposta por Darwin, é amplamente utilizado, mas já vem integrado ao Grasshopper.

O algoritmo final desenvolvido visa manipular um padrão de malha predeterminado. Neste caso, para o estudo técnico, foram utilizados um quadro cúbico e uma malha em forma de esfera.

O algoritmo funciona em cinco etapas. A primeira consiste na criação de um quadro cúbico com dimensão de 1 metro de aresta e a divisão de todas as arestas em 116 pontos equidistantes.

A segunda etapa é a seleção de 1 a 40 vértices-âncora dentre os 116 vértices iniciais presentes no quadro cúbico. Esse processo de seleção é guiado pelo Galapagos e será descrito na última etapa.

Na terceira fase, uma esfera de 0,80 metros de diâmetro é criada e sua malha é aprimorada até chegar a um padrão predeterminado específico. Para cada vértice-âncora selecionado na etapa anterior, existem 16 possibilidades de conexão à malha da esfera através de cabos. Dessas 16 opções, o Galapagos escolhe apenas um único cabo para cada vértice-âncora.

Na quarta etapa, com a estrutura preparada, o simulador físico Kangaroo pode finalmente ser ativado. Desta forma, as linhas e a malha da esfera são convertidas em cabos elásticos. Com a resistência dos cabos ajustada, é possível tornar o sistema estável. Em seguida, são calculadas as distâncias vetoriais entre os vértices originais da esfera estática e os vértices com a esfera "relaxada".

A quinta etapa utiliza o Galapagos. Esse algoritmo começa gerando 50 possíveis resultados aleatórios, ou seja, 50 indivíduos baseados no pool genético, que neste caso são os 116 vértices encontrados ao longo da estrutura cúbica e os 190 vértices na malha da esfera. Com esses dados, ele é capaz de buscar entre os 50 indivíduos iniciais e determinar o melhor. Esse processo é chamado de função de aptidão (fitness function), e seleciona os indivíduos que têm seus vértices finais mais próximos dos vértices da forma esférica inicial.

A partir da geração inicial de pontos de dados, os indivíduos ótimos combinam seus marcadores genéticos para criar 50 novos pontos de dados como sua própria geração distinta. Isso se repete até que o resultado mais favorável seja alcançado. Neste exemplo, o algoritmo se estabilizou na centésima geração.

A partir daí, outros sete estudos foram desenvolvidos, mas apenas o padrão de malha inicial da esfera foi alterado, e seu comportamento foi analisado.

Com os resultados obtidos, concluiu-se que a melhor alternativa para desenvolver a proposta final foi a "malha hexagonal truncada", uma vez que apresenta o melhor controle sobre a forma final, além de ser razoável para fabricação.

## Detalhamento

Para atender a todos os itens listados no programa de necessidades, foi desenvolvida uma estrutura que faz referência direta a um dos módulos que compõem o logotipo da FAU-USP. A partir desse esqueleto metálico composto por 4 barras, um amplo espectro de 20 soluções foi gerado.

De maneira semelhante ao que acontece com a evolução na biologia, não resulta em uma "solução perfeita", mas cumpre seu objetivo final. Isso é especialmente importante no design, pois se torna um meio pelo qual humanos e computadores podem trabalhar juntos. Enquanto os humanos montam o algoritmo, os computadores o processam e acabam oferecendo um grande número de resultados, para que um humano possa então escolher aqueles que respeitam qualidades difíceis de especificar dentro do algoritmo, como estética ou conforto.

### Método Construtivo

Para produzir a malha hexagonal proposta, foi adotada a técnica tradicional de renda de bilro. A estrutura será composta por 4 tubos de aço de 5 centímetros de diâmetro e 2,5 metros de comprimento; utilizando quatro conexões de cotovelo pré-fabricadas com ângulos de 34 e 71,9 graus.

### Fabricação

A montagem aconteceria em 3 etapas: a produção da rede, a montagem do esqueleto estrutural e, por fim, a fixação da rede com cordas e sua tração. Todas as dimensões e pontos de fixação podem ser documentados usando o Grasshopper, evitando assim incompatibilidade de informações e acelerando o processo de montagem.

A técnica de renda de bilro consiste em uma produção manual de tecido que permite desenvolver padrões complexos com ferramentas rudimentares. A fabricação tradicional consiste no trançado e torção sucessivos de comprimentos de fio utilizando bastões de madeira (bilros) para manuseá-los, alfinetes para manter o padrão estável e uma almofada de suporte.

## Conclusão

Este estudo buscou explorar algumas possibilidades de incorporar uma técnica tradicional de tecelagem ao design computacional visando desenvolver um protótipo de cadeira tipo rede. O algoritmo também fornece algumas saídas inesperadas que mudam a forma como o projetista visualiza o projeto final. Em outras palavras, esse sistema permite que o algoritmo e o projetista trabalhem juntos como uma equipe.

Em última análise, o algoritmo final funciona como uma extensão criativa da mente humana, gerando um espectro de múltiplas soluções.

### Referências
[1] Barthel R. Natural Forms - Architectural Forms. In: FREI OTTO - *Lightweight Construction*, Natural Design, Birkhauser - Publishers for Architecture, 2005.
[2] Benyus J. M. *A Biomimicry Primer*. Biomimicry guide, 2009.
[3] Fernandes J. A. B. *Caderno de Diagnóstico, Resíduos da Construção Civil*. IPEA, 2011.
[4] Fry T., Design Futuring: Sustainable, Ethics and New Practice (Oxford: Berg, 2008), p.2
[5] Kieran S. e Timberlake J. *Refabricating Architecture: How manufacturing methodologies are poised to transform building construction*, McGraw-Hill, 2004.
[6] Krausse J. and Lichtenstein C., Your Private Sky: R. Buckminster Fuller: The Art of Design Science, Lars Müller Publishers, 1999.
[7] Kull U., Frei Otto and Biology, in Frei Otto - Lightweight Construction, Natural Design ([Basel, Switzerland]: Birkhauser - Publishers for Architecture, 2005), p.51
[8] Stabile H., *Entre o físico e o digital. Processos paramétricos, de interação e de fabricação digital aplicados ao design*, São Paulo, 2015.
[9] Terzidis K., *Algorithmic Architecture*, Architectural Press (Elsevier), 2006.

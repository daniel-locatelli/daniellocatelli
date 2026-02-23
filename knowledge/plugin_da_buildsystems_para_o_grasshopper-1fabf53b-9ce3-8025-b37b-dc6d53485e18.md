URL: https://daniellocatelli.com/pt/projects/buildsystems-plugin-for-grasshopper

# Plugin da BuildSystems para o Grasshopper

Description: Plugin desenvolvido para BuildSystems para criar componentes construtivos com base em Declarações Ambientais de Produtos (DAPs). A ideia foi oferecer dados de Análise de Ciclo de Vida (ACV) logo no início do processo de projeto.
Tags: Software Development, Grasshopper3D

Durante meu tempo na BuildSystems, liderei o desenvolvimento de um plugin para o Grasshopper com o objetivo de otimizar o processo de projeto arquitetônico. Esse conjunto de ferramentas foi criado para permitir que os usuários definissem e analisassem projetos de edifícios de forma paramétrica, oferecendo feedback em tempo real sobre o uso de materiais e o impacto ambiental por meio de uma Avaliação do Ciclo de Vida (ACV) integrada.
Principais conquistas desse desenvolvimento incluíram:
- **Detalhamento de componente construtivo**: Implementamos uma funcionalidade para definir e gerenciar componentes construtivos individuais com suas respectivas propriedades de material.
- **Análise de ACV integrada**: O plugin avalia rapidamente a pegada ambiental dos projetos com base em dados de materiais extraídos de Declarações Ambientais de Produto (DAPs).
- **Gerenciamento de dados via JSON**: Criamos um banco de dados estruturado em JSON para armazenar e recuperar dados de componentes construtivos. Essa estrutura também seria utilizada em um aplicativo web chamado *Circular Component Creator*, uma outra ideia que, infelizmente, não avançou.
- **Interface intuitiva**: O plugin apresentava uma interface amigável que aproveitava o paradigma de programação visual do Grasshopper, promovendo uma integração fluida aos fluxos de trabalho existentes.


Aba da BuildSystems no Grasshopper: componentes de ACV e Urbanismo

## Desafios
Existem duas linguagens principais para desenvolver plugins para o Grasshopper: Python e C#. Mas para conseguir aquele toque nativo,com maior desempenho, e como se o componente fizesse parte do Grasshopper, C# sai na frente. O motivo é que essa foi linguagem usada por David Rutten para criar o Grasshopper.
O principal desafio foi que, durante o desenvolvimento desse plugin, a  McNeel, desenvolvedora do Rhino e Grasshopper, estava mudando de versão do C#. migrando do *.NET Framework 4.8  *para .*NET Core*, que trouxe algumas complicações.
###  .NET Framework 4.8
- Pros
  - Ainda compatível com o Rhino 8  - Suporte às versões anteriores do Rhino/Grasshopper  - Compatível com o Rhino.Inside.Revit (que ainda utiliza essa versão do .NET)  - Mais materiais e tutoriais disponíveis online, facilitando o desenvolvimento e o debugging
- Cons
  - Está com os dias contados, o que obrigaria a migrar o plugin para a nova versão do C# em um futuro breve  - Essa versão não é multiplataforma, precisaria de versões separadas para Windows e macOS  - Performance inferior
### .NET Core
- Pros
  - Solução "à prova de futuro”, já que continuará a ser usada nas futuras versões do Rhino/Grasshopper  - Multiplataforma, o plugin funcionaria tanto no Windows quanto no macOS  - Melhor desempenho
- Cons
  - Incompatível com versões anteriores do Rhino/Grasshopper  - Incompatível com o Rhino.Inside.Revit atual  - Menor quantidade de materiais de apoio e exemplos disponíveis online

A McNeel recomenda uma abordagem chamada [multi-targeting](https://learn.microsoft.com/en-us/nuget/create-packages/multiple-target-frameworks-project-file), ou seja, desenvolver o plugin suportando ambas as versões do .NET. Isso adicionou uma camada extra de complexidade ao projeto.
## Futuro
As fases finais do projeto focaram no estabelecimento do BSoM (*BuildSystems Object Model*) para aprimorar ainda mais a extensibilidade e a manutenção do plugin.
Apesar de funcional, o projeto foi descontinuado devido a uma mudança de foco da então startup BuildSystems. Na época, a economia alemã enfrentava dificuldades e não havia projetos em andamento nos quais pudéssemos testar o plugin. Com isso, passamos a dedicar nosso tempo ao desenvolvimento de uma ferramenta de financiamento imobiliário voltada para habitações sustentáveis.

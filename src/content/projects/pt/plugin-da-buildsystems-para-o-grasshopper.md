---
{
  "Cover": "/assets/content/projects/plugin-da-buildsystems-para-o-grasshopper/cover-cover.png",
  "CoverAlt": "Laptop com o Grasshopper aberto e os componentes do plugin na tela.",
  "Description": "Plugin desenvolvido para BuildSystems para criar componentes construtivos com base em Declarações Ambientais de Produtos (DAPs). A ideia foi oferecer dados de Análise de Ciclo de Vida (ACV) logo no início do processo de projeto.",
  "Name": "Plugin da BuildSystems para o Grasshopper",
  "Slug": "projects/plugin-da-buildsystems-para-o-grasshopper",
  "Tags": [
    "Software Development",
    "Grasshopper3D"
  ],
  "Authors": [
    "BuildSystems"
  ],
  "Category": "Software Development",
  "City": [],
  "Client": "BuildSystems",
  "DateStart": "2023-11-23",
  "Link": [],
  "Place": "Online"
}
---

Durante meu tempo na BuildSystems, liderei o desenvolvimento de um plugin para o Grasshopper com o objetivo de otimizar o processo de projeto arquitetônico. Esse conjunto de ferramentas foi criado para permitir que os usuários definissem e analisassem projetos de edifícios de forma paramétrica, oferecendo feedback em tempo real sobre o uso de materiais e o impacto ambiental por meio de uma Avaliação do Ciclo de Vida (ACV) integrada.
Principais conquistas desse desenvolvimento incluíram:
- **Detalhamento de componente construtivo**: Implementamos uma funcionalidade para definir e gerenciar componentes construtivos individuais com suas respectivas propriedades de material.
- **Análise de ACV integrada**: O plugin avalia rapidamente a pegada ambiental dos projetos com base em dados de materiais extraídos de Declarações Ambientais de Produto (DAPs).
- **Gerenciamento de dados via JSON**: Criamos um banco de dados estruturado em JSON para armazenar e recuperar dados de componentes construtivos. Essa estrutura também seria utilizada em um aplicativo web chamado *Circular Component Creator*, uma outra ideia que, infelizmente, não avançou.
- **Interface intuitiva**: O plugin apresentava uma interface amigável que aproveitava o paradigma de programação visual do Grasshopper, promovendo uma integração fluida aos fluxos de trabalho existentes.

![](/assets/content/projects/plugin-da-buildsystems-para-o-grasshopper/block-1fabf53b-9ce3-8177-8578-e6cb97586cb4.png)
Aba da BuildSystems no Grasshopper: componentes de ACV e Urbanismo

## Desafios
Existem duas linguagens principais para desenvolver plugins para o Grasshopper: Python e C#. Mas para conseguir aquele toque nativo,com maior desempenho, e como se o componente fizesse parte do Grasshopper, C# sai na frente. O motivo é que essa foi linguagem usada por David Rutten para criar o Grasshopper.
O principal desafio foi que, durante o desenvolvimento desse plugin, a  McNeel, desenvolvedora do Rhino e Grasshopper, estava mudando de versão do C#. migrando do *.NET Framework 4.8  *para .*NET Core*, que trouxe algumas complicações.
###  .NET Framework 4.8
- Pros
- Cons
### .NET Core
- Pros
- Cons

A McNeel recomenda uma abordagem chamada [multi-targeting](https://learn.microsoft.com/en-us/nuget/create-packages/multiple-target-frameworks-project-file), ou seja, desenvolver o plugin suportando ambas as versões do .NET. Isso adicionou uma camada extra de complexidade ao projeto.
## Futuro
As fases finais do projeto focaram no estabelecimento do BSoM (*BuildSystems Object Model*) para aprimorar ainda mais a extensibilidade e a manutenção do plugin.
Apesar de funcional, o projeto foi descontinuado devido a uma mudança de foco da então startup BuildSystems. Na época, a economia alemã enfrentava dificuldades e não havia projetos em andamento nos quais pudéssemos testar o plugin. Com isso, passamos a dedicar nosso tempo ao desenvolvimento de uma ferramenta de financiamento imobiliário voltada para habitações sustentáveis.

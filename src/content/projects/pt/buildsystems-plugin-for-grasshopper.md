---
Cover: /assets/content/projects/buildsystems-plugin-for-grasshopper/buildsystems-plugin-for-grasshopper-cover.png
CoverAlt: Plugin para o Grasshopper desenvolvido para a BuildSystems
CoverFit: contain
Description: Plugin desenvolvido para BuildSystems para criar componentes construtivos com base em Declarações Ambientais de Produtos (DAPs). A ideia foi oferecer dados de Análise de Ciclo de Vida (ACV) logo no início do processo de projeto.
Name: Plugin da BuildSystems para o Grasshopper
Tags:
  - Software Development
  - Grasshopper3D
Organization: "BuildSystems"
Category: Software Development
DateStart: "2023-11-23"
Director:
  - Martin Bittmann
Team:
  - Daniel Nunes Locatelli
  - Daniel Dieren
---

Durante meu tempo na BuildSystems, liderei o desenvolvimento de um plugin para o Grasshopper com o objetivo de otimizar o processo de projeto arquitetônico. Esse conjunto de ferramentas foi criado para permitir que os usuários definissem e analisassem projetos de edifícios de forma paramétrica, oferecendo feedback em tempo real sobre o uso de materiais e o impacto ambiental por meio de uma Avaliação do Ciclo de Vida (ACV) integrada.

Principais conquistas desse desenvolvimento incluíram:
- **Detalhamento de componente construtivo**: Implementamos uma funcionalidade para definir e gerenciar componentes construtivos individuais com suas respectivas propriedades de material.
- **Análise de ACV integrada**: O plugin oferecia a capacidade de avaliar rapidamente a pegada ambiental dos projetos com base em dados de materiais extraídos de Declarações Ambientais de Produto (DAPs).
- **Gerenciamento de dados via JSON**: Criamos um banco de dados estruturado em JSON para armazenar e recuperar dados de componentes construtivos. Essa estrutura também seria utilizada em um aplicativo web chamado *Circular Component Creator*, uma ideia que, infelizmente, não avançou.
- **Interface intuitiva no Grasshopper**: O plugin apresentava uma interface amigável que aproveitava o paradigma de programação visual do Grasshopper, permitindo uma integração fluida com os fluxos de trabalho existentes.

![Aba da BuildSystems no Grasshopper: componentes de ACV e planejamento urbano](../../../assets/content/projects/buildsystems-plugin-for-grasshopper/block-1f1bf53b-9ce3-80d3-b12f-e2eedb7a3eae.png)

## Desafios
Existem duas linguagens principais para desenvolver plugins para o Grasshopper: Python e C#. No entanto, para uma aparência mais nativa, maior desempenho e integração mais profunda, C# é a opção preferida. Isso porque o próprio Grasshopper foi escrito em C# por David Rutten.
O principal desafio durante esse desenvolvimento foi que a McNeel, a empresa por trás do Rhino e do Grasshopper, estava no meio de uma transição do *.NET Framework 4.8* para o *.NET Core*.
### .NET Framework 4.8
- **Prós**
    - Ainda suportado no Rhino 8
    - Compatível com versões anteriores do Rhino/Grasshopper
    - Funciona com o Rhino.Inside Revit, que ainda depende do .NET Framework
    - Mais recursos de aprendizado disponíveis online, facilitando a depuração e o desenvolvimento
- **Contras**
    - Sendo descontinuado, o que exigiria migrar o plugin em um futuro próximo
    - Não é multiplataforma — seriam necessários plugins separados para Windows e macOS
    - Menor desempenho

### .NET Core
- **Prós**
    - À prova de futuro, pois é a base para as próximas versões do Rhino/Grasshopper
    - Suporte multiplataforma — um plugin funciona tanto no Windows quanto no macOS
    - Maior desempenho
- **Contras**
    - Não é compatível com versões mais antigas do Rhino/Grasshopper
    - Incompatível com a versão atual do Rhino.Inside Revit
    - Menos recursos e exemplos disponíveis online para desenvolvimento e depuração
A McNeel recomenda uma abordagem chamada [multi-targeting](https://learn.microsoft.com/en-us/nuget/create-packages/multiple-target-frameworks-project-file), ou seja, desenvolver o plugin suportando ambas as versões do .NET. Isso adicionou uma camada extra de complexidade ao projeto.

## Futuro
As fases finais do projeto focaram no estabelecimento do **BuildSystems Object Model (BSoM)** para aprimorar a extensibilidade e a manutenção do plugin.
Apesar de totalmente funcional, o projeto foi descontinuado devido a uma mudança de foco da então startup BuildSystems. Na época, a economia alemã enfrentava dificuldades e não havia projetos de construção em andamento nos quais pudéssemos testar o plugin adequadamente. Decidimos mudar o foco e investir nosso tempo no desenvolvimento de uma ferramenta simuladora de financiamento imobiliário sustentável.

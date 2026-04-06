URL: https://daniellocatelli.com/pt/projects/circular-component-creator-by-buildsystems

# Criador de Componentes Circulares

Description: Estudo conceitual de design para um aplicativo web para navegar, filtrar e comparar componentes construtivos circulares. Desenvolvimento de mockups UI/UX no Figma e definição da arquitetura de dados.
Tags: Design UI/UX, Figma, Construção Circular
Category: Design UI/UX
Director: Martin Bittmann
Team: Daniel Nunes Locatelli, Daniel Dieren
Organization: BuildSystems GmbH
Date: June 2023 - July 2023

O Circular Component Creator (CCC) foi um estudo conceitual de design na [BuildSystems](https://buildsystems.de/) para um aplicativo web que permitiria aos usuários navegar, filtrar e comparar componentes construtivos projetados para construção circular. O projeto alcançou o estágio de mockups detalhados no Figma e uma arquitetura de dados definida, mas não foi desenvolvido como aplicação funcional.

O conceito evoluiu a partir do [plugin BuildSystems para Grasshopper](/projects/buildsystems-plugin-for-grasshopper), que fornecia dados de Análise de Ciclo de Vida (ACV) dentro do ambiente de design Rhino/Grasshopper. O CCC tinha como objetivo trazer capacidades semelhantes para uma plataforma web independente, tornando a biblioteca de componentes acessível a um público mais amplo, além dos usuários do Grasshopper.

## Processo de Design UX

O processo de design começou com wireframes desenhados à mão para mapear o fluxo do usuário e a estrutura das telas. Esses esboços definiram seis telas principais: a página inicial, navegação de componentes, filtragem, seleção de componentes, visualização detalhada e análise de resultados.



Essa abordagem permitiu que a equipe iterasse rapidamente sobre os padrões de layout e interação antes de passar para os mockups no Figma.

## Mockups no Figma

### Página Inicial

O conceito da página inicial apresenta o aplicativo com um corte isométrico de um componente construtivo, mostrando as camadas individuais que compõem uma parede ou laje.

Abaixo, as cinco categorias de componentes dinâmicos são exibidas: paredes externas, paredes internas, paredes divisórias, lajes e coberturas. Cada categoria é representada por um ícone isométrico, oferecendo aos usuários uma visão geral imediata dos tipos de componentes disponíveis.



### Biblioteca de Componentes

O conceito da página da biblioteca apresenta todos os componentes disponíveis em um layout de grade. Os usuários poderiam selecionar até três componentes para comparação lado a lado. Cada cartão de componente mostra uma renderização 3D, o identificador do componente e propriedades principais.



### Sistema de Filtragem

Um painel de filtros permitiria aos usuários refinar o catálogo de componentes por múltiplos critérios: tipo de material (madeira maciça, madeira mole, concreto, concreto aerado, silicato de cálcio), dimensões e método de estruturação.



### Pré-visualização do Componente

Ao passar o mouse sobre um cartão de componente, uma pré-visualização detalhada seria exibida com as propriedades principais do componente: nome, material, valor U, classificação de resistência ao fogo e mais.



### Página de Detalhes do Componente

O conceito da página de detalhes oferece uma visão abrangente de um único componente, dividida em três áreas:

- **Tabela de propriedades**: Tipo, material, valores de física da construção (valor U, valor R), classificação de resistência ao fogo e se o componente é pré-fabricado ou construído no local.
- **Lista de materiais**: Uma descrição numerada de cada camada com o nome do material e espessura em milímetros.
- **Gráficos de análise**: Quatro gráficos de pizza exibindo o desempenho do componente em diferentes métricas.

Uma vista de corte 3D no lado direito mostra a composição exata das camadas, correspondendo à lista numerada de materiais.



## Arquitetura de Dados

O modelo de dados subjacente segue uma estrutura hierárquica que reflete como componentes construtivos reais são montados. Um Componente é composto por Montagens, que por sua vez consistem em Camadas. Cada camada pode conter Subcamadas, separadas em partes estruturais e de isolamento.

Essa hierarquia foi projetada para permitir que o aplicativo calculasse propriedades agregadas (espessura total, valor U, peso) mantendo controle granular sobre especificações individuais de materiais.

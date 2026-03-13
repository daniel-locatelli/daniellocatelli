URL: https://daniellocatelli.com/pt/projects/air-guitar-by-atelier-marko-brajovic-for-nike

# Air Guitar por Atelier Marko Brajovic para Nike

Description: O Atelier Marko Brajovic desenvolveu esta instalação para a celebração do Air Max Day. Neste projeto, trabalhei em estreita colaboração com Marko, trabalhando com o conceito, coordenação de projeto e na parte técnica com LEDs endereçáveis, Arduino e captadores de baixos.
Tags: Electronic, Arduino
Category: Installation
Authors: Atelier Marko Brajovic
Client: Nike
Location: São Paulo
Place: Red Bull Station
Date: March 2018 – April 2018
Link: https://markobrajovic.com/en/all/air-guitar-sp-on-air

# Concept
> Em homenagem à celebração do Air Max Day, o Atelier Marko Brajovic desenvolveu a instalação site-specific Air Guitar.

O Atelier Marko Brajovic desenvolveu esta instalação específica do local para celebrar o Air Max Day. Neste projeto, trabalhei em estreita colaboração com Marko, dando insights e apontando potenciais para uma instalação na [Red Bull Station](https://triptyque.com/en/project/redbull-station/). Este edifício recentemente reformado costumava ser uma usina de energia e se tornou principalmente um laboratório de música, mas também tinha espaço para outras explorações de arte e tecnologia.
O Air Max Day foi sobre celebrar os antigos e novos tênis Air Max, ao mesmo tempo em que conectava a Nike com a Red Bull. Essencialmente, era sobre interfaces, mais especificamente interfaces entre o antigo e o novo, design e música.
Marko desenvolveu dois conceitos, um envolvendo infláveis e o Air Guitar. O primeiro não era ruim, mas o Air Guitar era bom demais para deixar passar.
Durante a reunião com a agência de marketing, eles ficaram super animados com a instalação, mas acharam que faltava algo. Foi então que sugeri os LEDs endereçáveis.


# Desenvolvimento
Depois que o conceito foi aprovado, eu também fiquei responsável por coordenar todo o desenvolvimento do projeto, e talvez eu tenha ficado muito ganancioso porque decidi desenvolver a parte do LED sozinho.
Para a parte da guitarra, eu não fazia ideia de por onde começar, mas eu conhecia o cara certo: meu amigo Lucas Caracik, um luthier profissional da [Caracik Guitars](https://www.caracikguitars.com/).
Rafael Ohashi era o cara dos eventos; ele já trabalhava com muitos outros eventos, então ele nos guiava e conseguia os equipamentos e licenças necessários.
O sistema funcionava assim: a guitarra foi construída usando quatro cabos de aço e quatro captadores de baixo (sim, deveria ter se chamado Air Bass, mas Air Bass não soa tão sexy).
Eu também pensei em usar um microfone, mas a sugestão do Lucas de usar captadores estava em outro nível conceitual e funcional, e ele sabia tudo sobre essa tecnologia.
Inicialmente o conceito era ter os LEDs e os cabos de aço cobrindo toda a altura do pilar. Mas pra fazer isso nós precisaríamos de alguém com licença e equipamento de escalada, o que infelizmente não conseguimos encontrar a tempo, então ficamos limitados à altura que uma plataforma elevatória de trabalho poderia atingir.


## Interatividade
Cada captador de baixo envia um sinal analógico para seus respectivos Arduino Megas, que então mapeiam o valor e os convertem em um sinal digital, acendendo uma quantidade específica de LEDs.
Em teoria, é bem simples, mas na realidade, me levou pra uma espiral estudando eletrônica, até que eu cheguei num beco sem saída. Eu criei esse circuito, mas por algum motivo, ele não estava funcionando bem. O evento estava se aproximando, e a equipe estava ficando ansiosa.
Uma semana antes do evento, entrei em contato com outro cara, André Biagioni da [Fiozeira](https://fiozera.com.br/). Felizmente, ele concordou em participar. Ele disse que faltava um filtro no circuito e terminou o trabalho. Ele também fez um diagrama do circuito e ajudou na montagem.




## Depois do Air Max Day
O pessoal da Red Bull Station gostou tanto da instalação que pediu para ficar lá por um mês inteiro. Um período que eu tinha que ir lá regularmente para verificar se tudo estava funcionando como esperado. Durante esse tempo, alguns dos LEDs pararam de funcionar no topo da instalação, o que seria muito complicado de substituir. O visual não ficou bom porque perdeu aquela continuidade, parecia que a instalação estava banguela. Então, ao invés de substituir os LEDs, eu apenas desliguei os 10 LEDs de cima diretamente no código do Arduino.
## Aprendizados
Não haviam componentes soldados, um erro crasso. Todos os componentes ainda usavam os cabos e conexões de prototipagem do Arduino em breadboards.
O evento estava lotado, até mesmo com fila do lado de fora. Em algum momento durante o evento a guitarra simplesmente parou de funcionar. Eu tive um mini ataque cardíaco! Lembro claramento até hoje, eu estava na cobertura da Red Bull Station, já no meu terceiro drink, quando me contaram do problema. Fui correndo pelas escadas até chegar na parte posterior do pilar, onde esatava a caixa de controle. Desliguei tudo, liguei e… Phew! Alívio! A instalação começou a funcionar novamente.
Apesar de eu ter aprendido muito, eu teria poupado alguns cabelos brancos se eu tivesse contratado um especialista desde o começo, testado a instalação uma semana antes da entrega e soldado todas as conexões.
Outra coisa que não esqueço foram os cabos. Exigiu cabos mais longos e grossos do que eu esperava, os LEDs consomem muita energia e precisam de dois cabos para cada tira de LED. Eles precisam ser alimentados na parte inferior e também no meio, caso contrário, os LEDs ficariam mais fracos na metade superior.
A instalação também exigiu duas fontes de alimentação do tamanho de tijolos para cada configuração Captador-Arduino-LED, ou seja oito fontes de alimentação no total (veja foto acima).

© Primeira foto e video by [Eduardo Ohara](https://www.eduardoohara.com/)

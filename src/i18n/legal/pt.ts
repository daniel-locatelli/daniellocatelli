import type { I18nLegal } from "./type";

export const t: I18nLegal = {
  privacyPolicy: {
    title: "Política de privacidade",
    lastUpdated: "18 de agosto de 2026",
    sections: [
      {
        heading: "Responsável pelo tratamento de dados",
        content: `<p>Daniel Nunes Locatelli<br>
E-mail: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Website: <a href="/pt">daniellocatelli.com</a></p>`,
      },
      {
        heading: "Visão geral do tratamento de dados",
        content: `<p>Este website coleta o mínimo de dados pessoais. Não há cookies, carregamento de fontes de terceiros nem rastreadores de publicidade ou de impressão digital (fingerprinting). A única ferramenta de análise é o Cloudflare Web Analytics, um serviço sem cookies e focado em privacidade, descrito abaixo. As seções a seguir descrevem os poucos casos em que há tratamento de dados.</p>`,
      },
      {
        heading: "Hospedagem (Cloudflare)",
        content: `<p>Este website é hospedado no Cloudflare Workers (arquivos estáticos e um pequeno componente de servidor para o chat com IA) e entregue via CDN da Cloudflare. Quando você visita este site, a Cloudflare processa automaticamente:</p>
<ul>
<li>Seu endereço IP</li>
<li>Cabeçalhos de requisição HTTP (tipo de navegador, sistema operacional, URL de referência)</li>
<li>Data e hora do acesso</li>
</ul>
<p>Este processamento é necessário para a entrega do website (Art. 6(1)(f) RGPD, interesse legítimo). A Cloudflare Inc. está sediada nos Estados Unidos. As transferências de dados para os EUA são cobertas pelo Adendo de Processamento de Dados da Cloudflare e pelas Cláusulas Contratuais Padrão da UE.</p>
<p>O site também usa o Cloudflare Workers KV para armazenar dados operacionais (status de disponibilidade dos modelos de IA e contadores diários de uso). Esse armazenamento não contém dados pessoais.</p>
<p>Mais informações: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Política de privacidade da Cloudflare</a></p>`,
      },
      {
        heading: "Análise de tráfego (Cloudflare Web Analytics)",
        content: `<p>Este website usa o Cloudflare Web Analytics para entender o tráfego agregado e o desempenho do site. Um pequeno script (<code>beacon.min.js</code>, carregado de <code>static.cloudflareinsights.com</code>) é executado no seu navegador e envia:</p>
<ul>
<li>A URL da página e a URL de referência</li>
<li>Tipo de navegador e sistema operacional, tamanho da tela</li>
<li>País aproximado, derivado do seu endereço IP</li>
<li>Métricas de desempenho de carregamento da página (Core Web Vitals)</li>
</ul>
<p>Os dados são agregados. O Cloudflare Web Analytics não define cookies, não usa armazenamento local, não cria impressão digital do seu dispositivo e não rastreia você entre websites nem constrói perfis individuais.</p>
<p>Base legal: Art. 6(1)(f) RGPD, interesse legítimo em medir o uso e o desempenho deste website com uma ferramenta sem cookies que preserva a privacidade. As transferências de dados para os EUA são cobertas pelo Adendo de Processamento de Dados da Cloudflare e pelas Cláusulas Contratuais Padrão da UE.</p>
<p>Mais informações: <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">Cloudflare Web Analytics</a> · <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Política de privacidade da Cloudflare</a></p>`,
      },
      {
        heading: "Chat com IA (Anthropic)",
        content: `<p>Este site inclui um chat com IA opcional. Ao usar o chat:</p>
<ul>
<li>Sua pergunta é enviada à <strong>API Claude da Anthropic</strong>, junto com um resumo do conteúdo público deste site, para gerar uma resposta (processada, mas não armazenada a longo prazo pela Anthropic)</li>
</ul>
<p>A conversa fica guardada no armazenamento de sessão do seu navegador, nesta aba: ela continua lá se você recarregar a página e é apagada quando você fecha a aba ou começa um novo chat. Nenhum histórico de conversas é armazenado em servidor algum.</p>
<p>Base legal: Art. 6(1)(a) RGPD, consentimento (você escolhe ativamente usar o chat). A Anthropic tem sede nos EUA. As transferências de dados são cobertas pelas Cláusulas Contratuais Padrão da empresa.</p>
<p>Mais informações: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Política de privacidade da Anthropic</a></p>`,
      },
      {
        heading: "Vídeos incorporados (YouTube)",
        content: `<p>Algumas páginas deste website incorporam vídeos do YouTube (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlanda). Os vídeos são incorporados usando o modo de privacidade aprimorada do YouTube (<code>youtube-nocookie.com</code>), que só define cookies quando você reproduz um vídeo.</p>
<p>Quando você reproduz um vídeo incorporado, o YouTube pode coletar:</p>
<ul>
<li>Seu endereço IP</li>
<li>Informações do navegador e do dispositivo</li>
<li>Comportamento de visualização e dados de interação</li>
</ul>
<p>Se você estiver conectado à sua conta do Google, o YouTube pode associar sua atividade de visualização ao seu perfil.</p>
<p>Base legal: Art. 6(1)(f) RGPD, interesse legítimo em apresentar projetos em vídeo. A Google LLC está sediada nos Estados Unidos. As transferências de dados são cobertas pelas Cláusulas Contratuais Padrão do Google.</p>
<p>Mais informações: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de privacidade do Google</a></p>`,
      },
      {
        heading: "Fontes auto-hospedadas",
        content: `<p>Este website utiliza as fontes Montserrat e Poppins. Todos os arquivos de fontes são servidos diretamente deste domínio. Nenhuma requisição é feita ao Google Fonts ou a qualquer outro serviço de fontes de terceiros.</p>`,
      },
      {
        heading: "Sem cookies nem rastreamento",
        content: `<p>Este website não define cookies próprios. Não há redes de publicidade nem rastreamento que identifique visitantes individualmente. Análises agregadas e sem cookies são fornecidas pelo Cloudflare Web Analytics (veja acima). Observe que vídeos incorporados do YouTube (no modo de privacidade aprimorada) podem definir cookies quando você optar por reproduzi-los.</p>`,
      },
      {
        heading: "Links externos",
        content: `<p>Este website contém links para serviços externos, incluindo LinkedIn, GitHub, GitLab, Instagram, Bluesky e ORCID. Ao seguir esses links, você sai deste website e passa a valer a política de privacidade de cada serviço. O operador deste website não tem controle sobre as práticas de processamento de dados desses serviços de terceiros.</p>`,
      },
      {
        heading: "Retenção de dados",
        content: `<p>Este website não armazena permanentemente nenhum dado pessoal de usuários. Os logs do servidor e os dados de análise agregados mantidos pela Cloudflare estão sujeitos às próprias políticas de retenção da Cloudflare.</p>`,
      },
      {
        heading: "Alterações nesta política",
        content: `<p>Esta política de privacidade pode ser atualizada periodicamente. As alterações serão publicadas nesta página com uma data de revisão atualizada.</p>`,
      },
    ],
  },
  terms: {
    title: "Termos de uso",
    lastUpdated: "4 de agosto de 2026",
    sections: [
      {
        heading: "Abrangência",
        content: `<p>Estes termos regem o uso do website daniellocatelli.com (o "Website"), operado por Daniel Nunes Locatelli. Ao acessar este website, você concorda com estes termos.</p>`,
      },
      {
        heading: "Propriedade intelectual",
        content: `<p>Todo o conteúdo deste website (incluindo, mas não se limitando a, textos, imagens, gráficos, documentação de projetos, amostras de código e design) é propriedade intelectual de Daniel Nunes Locatelli, salvo indicação em contrário. É proibido reproduzir, distribuir ou usar este conteúdo sem permissão prévia por escrito.</p>`,
      },
      {
        heading: "Aviso sobre o chat com IA",
        content: `<p>Este website tem um chat com IA que fornece informações gerais sobre o trabalho e a trajetória de Daniel Locatelli. Observe que:</p>
<ul>
<li>As respostas são geradas por inteligência artificial (Anthropic Claude) e podem conter imprecisões</li>
<li>O chat não constitui aconselhamento profissional, jurídico ou técnico</li>
<li>Confirme por conta própria qualquer informação obtida no chat</li>
<li>O operador do website não é responsável por decisões tomadas com base nas respostas do chat</li>
</ul>`,
      },
      {
        heading: "Uso permitido",
        content: `<p>Você pode navegar neste website para fins pessoais e não comerciais. As seguintes atividades são proibidas:</p>
<ul>
<li>Scraping, crawling ou extração automatizada de dados</li>
<li>Reprodução ou redistribuição de conteúdo sem permissão</li>
<li>Qualquer uso que possa danificar, desativar ou prejudicar o website</li>
<li>Tentativa de obter acesso não autorizado a qualquer parte do website ou seus sistemas</li>
</ul>`,
      },
      {
        heading: "Limitação de responsabilidade",
        content: `<p>Este website é fornecido "como está", sem quaisquer garantias, expressas ou implícitas. Daniel Nunes Locatelli não garante que:</p>
<ul>
<li>O website estará disponível o tempo todo, sem interrupções</li>
<li>O conteúdo é livre de erros ou imprecisões</li>
<li>O website é livre de vírus ou outros componentes prejudiciais</li>
</ul>
<p>Na medida máxima permitida por lei, o operador não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso deste website.</p>`,
      },
      {
        heading: "Links externos",
        content: `<p>Este website contém links para websites de terceiros. O operador não tem controle sobre o conteúdo ou as práticas desses sites externos e não assume responsabilidade por eles. A inclusão de um link não implica endosso.</p>`,
      },
      {
        heading: "Lei aplicável",
        content: `<p>Estes termos são regidos pelas leis da Suíça. O foro competente é Zurique, Suíça, na medida permitida por lei.</p>`,
      },
      {
        heading: "Alterações nestes termos",
        content: `<p>O operador se reserva o direito de modificar estes termos a qualquer momento. As alterações serão publicadas nesta página com uma data de revisão atualizada. O uso continuado do website após as alterações constitui aceitação dos termos modificados.</p>`,
      },
    ],
  },
  impressum: {
    title: "Informações legais",
    lastUpdated: "4 de agosto de 2026",
    sections: [
      {
        heading: "Responsável pelo website",
        content: `<p>Daniel Nunes Locatelli<br>
        Schwandenacker 46<br>
        8052 Zurique, Suíça</p>`,
      },
      {
        heading: "Contato",
        content: `<p>E-mail: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
        Telefone: +49 178 324-0834</p>`,
      },
      {
        heading: "Responsável pelo conteúdo",
        content: `<p>Daniel Nunes Locatelli<br>
        Schwandenacker 46<br>
        8052 Zurique, Suíça</p>`,
      },
      {
        heading: "Resolução de disputas",
        content: `<p>Não estamos dispostos nem obrigados a participar de procedimentos de resolução de disputas perante um conselho de arbitragem do consumidor.</p>`,
      },
      {
        heading: "Responsabilidade pelo conteúdo",
        content: `<p>Como operador deste website, somos responsáveis pelo nosso próprio conteúdo nestas páginas de acordo com a legislação geral. No entanto, não somos obrigados a monitorar informações transmitidas ou armazenadas de terceiros ou a investigar circunstâncias que indiquem atividade ilegal.</p>
<p>Isso não afeta as obrigações de remover ou bloquear informações previstas na legislação geral. No entanto, a responsabilidade neste sentido só é possível a partir do momento do conhecimento de uma infração específica. Ao tomar conhecimento de tais violações, removeremos o conteúdo imediatamente.</p>
<p>Os conteúdos deste website foram cuidadosamente verificados e elaborados com todo o cuidado. No entanto, não se garante a completude, precisão, atualidade ou qualidade das informações fornecidas. Não nos responsabilizamos por danos decorrentes da confiança no conteúdo deste website ou do seu uso, salvo se causados por dolo ou negligência grave. Esta limitação não afeta direitos garantidos por lei.</p>`,
      },
      {
        heading: "Responsabilidade por links",
        content: `<p>Nosso website contém links para websites externos de terceiros sobre cujo conteúdo não temos influência. Portanto, não assumimos nenhuma responsabilidade por esse conteúdo de terceiros. O respectivo fornecedor ou operador das páginas vinculadas é sempre responsável pelo conteúdo das páginas vinculadas.</p>
<p>As páginas vinculadas foram verificadas quanto a possíveis violações legais no momento da vinculação. Conteúdo ilegal não era reconhecível no momento da vinculação. No entanto, o controle permanente do conteúdo das páginas vinculadas não é razoável sem indícios concretos de uma infração. Ao tomar conhecimento de violações legais, removeremos tais links imediatamente.</p>`,
      },
      {
        heading: "Propriedade intelectual de terceiros",
        content: `<p>Levamos muito a sério os direitos de propriedade intelectual de terceiros. Não publicamos conscientemente conteúdo infrator em nossas páginas, nem criamos links para tal conteúdo. No entanto, é possível que o conteúdo em páginas externas mude sem que possamos interferir ou acompanhar o tempo todo.</p>
<p>Caso descubra que um dos nossos links aponta para uma oferta que viola direitos, pedimos que nos informe. Analisaremos prontamente a questão e removeremos o link, se necessário.</p>`,
      },
    ],
  },
};

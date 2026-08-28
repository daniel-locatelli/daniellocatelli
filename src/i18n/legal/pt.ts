import type { I18nLegal } from "./type";

export const t: I18nLegal = {
  privacyPolicy: {
    title: "Política de Privacidade",
    lastUpdated: "18 de agosto de 2026",
    sections: [
      {
        heading: "Responsável pelo Tratamento de Dados",
        content: `<p>Daniel Nunes Locatelli<br>
Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Website: <a href="/pt">daniellocatelli.com</a></p>`,
      },
      {
        heading: "Visão Geral do Tratamento de Dados",
        content: `<p>Este website coleta dados pessoais mínimos. Não há cookies, carregamento de fontes de terceiros nem rastreadores de publicidade ou de impressão digital (fingerprinting). A única ferramenta de análise é o Cloudflare Web Analytics, um serviço sem cookies e focado em privacidade, descrito abaixo. As seções a seguir descrevem o tratamento limitado de dados que ocorre.</p>`,
      },
      {
        heading: "Hospedagem (Cloudflare)",
        content: `<p>Este website é hospedado no Cloudflare Workers (arquivos estáticos e um pequeno componente de servidor para o chat com IA) e entregue via CDN da Cloudflare. Ao visitar este site, a Cloudflare processa automaticamente:</p>
<ul>
<li>Seu endereço IP</li>
<li>Cabeçalhos de requisição HTTP (tipo de navegador, sistema operacional, URL de referência)</li>
<li>Data e hora do acesso</li>
</ul>
<p>Este processamento é necessário para a entrega do website (Art. 6(1)(f) RGPD — interesse legítimo). A Cloudflare Inc. está sediada nos Estados Unidos. As transferências de dados para os EUA são cobertas pelo Adendo de Processamento de Dados da Cloudflare e pelas Cláusulas Contratuais Padrão da UE.</p>
<p>O site também usa o Cloudflare Workers KV para armazenar dados operacionais (status de disponibilidade dos modelos de IA e contadores diários de uso). Esse armazenamento não contém dados pessoais.</p>
<p>Mais informações: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Política de Privacidade da Cloudflare</a></p>`,
      },
      {
        heading: "Análise de Tráfego (Cloudflare Web Analytics)",
        content: `<p>Este website usa o Cloudflare Web Analytics para entender o tráfego agregado e o desempenho do site. Um pequeno script (<code>beacon.min.js</code>, carregado de <code>static.cloudflareinsights.com</code>) é executado no seu navegador e reporta:</p>
<ul>
<li>A URL da página e a URL de referência</li>
<li>Tipo de navegador e sistema operacional, tamanho da tela</li>
<li>País aproximado, derivado do seu endereço IP</li>
<li>Métricas de desempenho de carregamento da página (Core Web Vitals)</li>
</ul>
<p>Os dados são agregados. O Cloudflare Web Analytics não define cookies, não usa armazenamento local, não cria impressão digital do seu dispositivo e não rastreia você entre websites nem constrói perfis individuais.</p>
<p>Base legal: Art. 6(1)(f) RGPD — interesse legítimo em medir o uso e o desempenho deste website com uma ferramenta sem cookies que preserva a privacidade. As transferências de dados para os EUA são cobertas pelo Adendo de Processamento de Dados da Cloudflare e pelas Cláusulas Contratuais Padrão da UE.</p>
<p>Mais informações: <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">Cloudflare Web Analytics</a> · <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Política de Privacidade da Cloudflare</a></p>`,
      },
      {
        heading: "Chat com IA (Anthropic, Supabase e Voyage AI)",
        content: `<p>Este website inclui um recurso opcional de chat com IA. Ao usar o chat:</p>
<ul>
<li>Sua pergunta é enviada ao <strong>Supabase</strong>, que a encaminha à <strong>Voyage AI</strong> para calcular uma representação numérica (embedding) usada na busca por similaridade vetorial (apenas consulta — sua entrada não é armazenada permanentemente por nenhum dos serviços)</li>
<li>Sua pergunta e o contexto recuperado são enviados à <strong>API Anthropic Claude</strong> para gerar uma resposta (processados, mas não armazenados a longo prazo pela Anthropic)</li>
</ul>
<p>As mensagens do chat existem apenas no estado da sessão do seu navegador e são perdidas quando você fecha ou atualiza a página. Nenhum histórico de conversas é armazenado em qualquer servidor.</p>
<p>Base legal: Art. 6(1)(a) RGPD — consentimento (você escolhe ativamente usar o chat). Anthropic, Supabase e Voyage AI estão sediadas nos EUA. As transferências de dados são cobertas por suas respectivas Cláusulas Contratuais Padrão.</p>
<p>Mais informações: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade da Anthropic</a> · <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade do Supabase</a> · <a href="https://www.voyageai.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade da Voyage AI</a></p>`,
      },
      {
        heading: "Vídeos Incorporados (YouTube)",
        content: `<p>Algumas páginas deste website incorporam vídeos do YouTube (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlanda). Os vídeos são incorporados usando o modo de privacidade aprimorada do YouTube (<code>youtube-nocookie.com</code>), que não define cookies até que você reproduza ativamente um vídeo.</p>
<p>Quando você reproduz um vídeo incorporado, o YouTube pode coletar:</p>
<ul>
<li>Seu endereço IP</li>
<li>Informações do navegador e do dispositivo</li>
<li>Comportamento de visualização e dados de interação</li>
</ul>
<p>Se você estiver conectado à sua conta do Google, o YouTube pode associar sua atividade de visualização ao seu perfil.</p>
<p>Base legal: Art. 6(1)(f) RGPD — interesse legítimo na apresentação de trabalhos de projeto por meio de conteúdo em vídeo. A Google LLC está sediada nos Estados Unidos. As transferências de dados são cobertas pelas Cláusulas Contratuais Padrão do Google.</p>
<p>Mais informações: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade do Google</a></p>`,
      },
      {
        heading: "Fontes Auto-Hospedadas",
        content: `<p>Este website utiliza as fontes Montserrat e Poppins. Todos os arquivos de fontes são servidos diretamente deste domínio. Nenhuma requisição é feita ao Google Fonts ou a qualquer outro serviço de fontes de terceiros.</p>`,
      },
      {
        heading: "Sem Cookies ou Rastreamento",
        content: `<p>Este website não define cookies próprios. Não há redes de publicidade nem rastreamento que identifique visitantes individualmente. Análises agregadas e sem cookies são fornecidas pelo Cloudflare Web Analytics (veja acima). Observe que vídeos incorporados do YouTube (no modo de privacidade aprimorada) podem definir cookies quando você optar por reproduzi-los.</p>`,
      },
      {
        heading: "Links Externos",
        content: `<p>Este website contém links para serviços externos, incluindo LinkedIn, GitHub, GitLab, Instagram, Bluesky e ORCID. Ao seguir esses links, você sai deste website e a política de privacidade do respectivo serviço se aplica. O operador deste website não tem controle sobre as práticas de processamento de dados desses serviços de terceiros.</p>`,
      },
      {
        heading: "Retenção de Dados",
        content: `<p>Este website não armazena permanentemente nenhum dado pessoal de usuários. Os logs do servidor e os dados de análise agregados mantidos pela Cloudflare estão sujeitos às próprias políticas de retenção da Cloudflare.</p>`,
      },
      {
        heading: "Alterações a Esta Política",
        content: `<p>Esta política de privacidade pode ser atualizada periodicamente. As alterações serão publicadas nesta página com uma data de revisão atualizada.</p>`,
      },
    ],
  },
  terms: {
    title: "Termos e Condições",
    lastUpdated: "4 de agosto de 2026",
    sections: [
      {
        heading: "Âmbito",
        content: `<p>Estes termos regem o uso do website daniellocatelli.com (o "Website"), operado por Daniel Nunes Locatelli. Ao acessar este website, você concorda com estes termos.</p>`,
      },
      {
        heading: "Propriedade Intelectual",
        content: `<p>Todo o conteúdo deste website — incluindo, mas não se limitando a textos, imagens, gráficos, documentação de projetos, amostras de código e design — é propriedade intelectual de Daniel Nunes Locatelli, salvo indicação em contrário. A reprodução, distribuição ou uso não autorizado deste conteúdo é proibido sem permissão prévia por escrito.</p>`,
      },
      {
        heading: "Aviso sobre o Chat com IA",
        content: `<p>Este website possui um chat alimentado por IA que fornece informações gerais sobre o trabalho e a trajetória de Daniel Locatelli. Por favor, observe:</p>
<ul>
<li>As respostas são geradas por inteligência artificial (Anthropic Claude) e podem conter imprecisões</li>
<li>O chat não constitui aconselhamento profissional, jurídico ou técnico</li>
<li>Você deve verificar independentemente qualquer informação obtida através do chat</li>
<li>O operador do website não é responsável por decisões tomadas com base nas respostas do chat</li>
</ul>`,
      },
      {
        heading: "Uso Permitido",
        content: `<p>Você pode navegar neste website para fins pessoais e não comerciais. As seguintes atividades são proibidas:</p>
<ul>
<li>Scraping, crawling ou extração automatizada de dados</li>
<li>Reprodução ou redistribuição de conteúdo sem permissão</li>
<li>Qualquer uso que possa danificar, desativar ou prejudicar o website</li>
<li>Tentativa de obter acesso não autorizado a qualquer parte do website ou seus sistemas</li>
</ul>`,
      },
      {
        heading: "Limitação de Responsabilidade",
        content: `<p>Este website é fornecido "como está", sem quaisquer garantias, expressas ou implícitas. Daniel Nunes Locatelli não garante que:</p>
<ul>
<li>O website estará disponível em todos os momentos sem interrupção</li>
<li>O conteúdo é livre de erros ou imprecisões</li>
<li>O website é livre de vírus ou outros componentes prejudiciais</li>
</ul>
<p>Na medida máxima permitida por lei, o operador não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso deste website.</p>`,
      },
      {
        heading: "Links Externos",
        content: `<p>Este website contém links para websites de terceiros. O operador não tem controle sobre o conteúdo ou as práticas desses sites externos e não assume responsabilidade por eles. A inclusão de um link não implica endosso.</p>`,
      },
      {
        heading: "Lei Aplicável",
        content: `<p>Estes termos são regidos pelas leis da Suíça. O foro competente é Zurique, Suíça, na medida permitida por lei.</p>`,
      },
      {
        heading: "Alterações a Estes Termos",
        content: `<p>O operador reserva-se o direito de modificar estes termos a qualquer momento. As alterações serão publicadas nesta página com uma data de revisão atualizada. O uso continuado do website após as alterações constitui aceitação dos termos modificados.</p>`,
      },
    ],
  },
  impressum: {
    title: "Impressum",
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
        content: `<p>Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
        Telefone: +49 178 324-0834</p>`,
      },
      {
        heading: "Responsável pelo conteúdo",
        content: `<p>Daniel Nunes Locatelli<br>
        Schwandenacker 46<br>
        8052 Zurique, Suíça</p>`,
      },
      {
        heading: "Resolução de Disputas",
        content: `<p>Não estamos dispostos nem obrigados a participar de procedimentos de resolução de disputas perante um conselho de arbitragem do consumidor.</p>`,
      },
      {
        heading: "Responsabilidade pelo Conteúdo",
        content: `<p>Como operador deste website, somos responsáveis pelo nosso próprio conteúdo nestas páginas de acordo com a legislação geral. No entanto, não somos obrigados a monitorar informações transmitidas ou armazenadas de terceiros ou a investigar circunstâncias que indiquem atividade ilegal.</p>
<p>As obrigações de remover ou bloquear o uso de informações sob a lei geral permanecem inalteradas. No entanto, a responsabilidade neste sentido só é possível a partir do momento do conhecimento de uma infração específica. Ao tomar conhecimento de tais violações, removeremos o conteúdo imediatamente.</p>
<p>Os conteúdos deste website foram cuidadosamente verificados e criados com o melhor do nosso conhecimento. No entanto, não se garante a completude, precisão, atualidade ou qualidade das informações fornecidas. Não nos responsabilizamos por danos decorrentes da confiança no conteúdo deste website ou do seu uso, salvo se causados por dolo ou negligência grave. Reivindicações legais obrigatórias permanecem inalteradas por esta limitação de responsabilidade.</p>`,
      },
      {
        heading: "Responsabilidade por Links",
        content: `<p>Nosso website contém links para websites externos de terceiros sobre cujo conteúdo não temos influência. Portanto, não podemos aceitar qualquer responsabilidade por esse conteúdo de terceiros. O respectivo fornecedor ou operador das páginas vinculadas é sempre responsável pelo conteúdo das páginas vinculadas.</p>
<p>As páginas vinculadas foram verificadas quanto a possíveis violações legais no momento da vinculação. Conteúdo ilegal não era reconhecível no momento da vinculação. No entanto, o controle permanente do conteúdo das páginas vinculadas é irrazoável sem evidências concretas de uma infração. Ao tomar conhecimento de violações legais, removeremos tais links imediatamente.</p>`,
      },
      {
        heading: "Propriedade Intelectual de Terceiros",
        content: `<p>Levamos muito a sério os direitos de propriedade intelectual de terceiros. Não publicamos conscientemente conteúdo infrator em nossas páginas, nem criamos links para tal conteúdo. No entanto, é possível que o conteúdo em páginas externas mude sem a nossa influência ou a nossa capacidade de monitoramento constante.</p>
<p>Caso descubra que um dos nossos links aponta para uma oferta que viola direitos, pedimos que nos informe. Analisaremos prontamente a questão e removeremos o link, se necessário.</p>`,
      },
    ],
  },
};

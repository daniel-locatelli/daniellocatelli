import type { I18nLegal } from "./type";

export const t: I18nLegal = {
  privacyPolicy: {
    title: "Política de Privacidade",
    lastUpdated: "22 de fevereiro de 2026",
    sections: [
      {
        heading: "Responsável pelo Tratamento de Dados",
        content: `<p>Daniel Nunes Locatelli<br>
Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Website: <a href="https://daniellocatelli.com">daniellocatelli.com</a></p>`,
      },
      {
        heading: "Visão Geral do Tratamento de Dados",
        content: `<p>Este website coleta dados pessoais mínimos. Não há cookies, análises, pixels de rastreamento ou carregamento de fontes de terceiros. As seções a seguir descrevem o tratamento limitado de dados que ocorre.</p>`,
      },
      {
        heading: "Hospedagem (Cloudflare)",
        content: `<p>Este website é hospedado no Cloudflare Pages e entregue via CDN da Cloudflare. Ao visitar este site, a Cloudflare processa automaticamente:</p>
<ul>
<li>Seu endereço IP</li>
<li>Cabeçalhos de requisição HTTP (tipo de navegador, sistema operacional, URL de referência)</li>
<li>Data e hora do acesso</li>
</ul>
<p>Este processamento é necessário para a entrega do website (Art. 6(1)(f) RGPD — interesse legítimo). A Cloudflare Inc. está sediada nos Estados Unidos. As transferências de dados para os EUA são cobertas pelo Adendo de Processamento de Dados da Cloudflare e pelas Cláusulas Contratuais Padrão da UE.</p>
<p>Mais informações: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Política de Privacidade da Cloudflare</a></p>`,
      },
      {
        heading: "Chat com IA (Anthropic e Supabase)",
        content: `<p>Este website inclui um recurso opcional de chat com IA. Ao usar o chat:</p>
<ul>
<li>Sua pergunta é enviada ao <strong>Supabase</strong> para busca por similaridade vetorial (apenas consulta — sua entrada não é armazenada permanentemente)</li>
<li>Sua pergunta e o contexto recuperado são enviados à <strong>API Anthropic Claude</strong> para gerar uma resposta (processados, mas não armazenados a longo prazo pela Anthropic)</li>
</ul>
<p>As mensagens do chat existem apenas no estado da sessão do seu navegador e são perdidas quando você fecha ou atualiza a página. Nenhum histórico de conversas é armazenado em qualquer servidor.</p>
<p>Base legal: Art. 6(1)(a) RGPD — consentimento (você escolhe ativamente usar o chat). Tanto a Anthropic quanto o Supabase estão sediados nos EUA. As transferências de dados são cobertas por suas respectivas Cláusulas Contratuais Padrão.</p>
<p>Mais informações: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade da Anthropic</a> · <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade do Supabase</a></p>`,
      },
      {
        heading: "Fontes Auto-Hospedadas",
        content: `<p>Este website utiliza as fontes Montserrat, Poppins e Poiret One. Todos os arquivos de fontes são servidos diretamente deste domínio. Nenhuma requisição é feita ao Google Fonts ou a qualquer outro serviço de fontes de terceiros.</p>`,
      },
      {
        heading: "Sem Cookies ou Rastreamento",
        content: `<p>Este website não define nenhum cookie. Não há ferramentas de análise, pixels de rastreamento ou redes de publicidade em uso.</p>`,
      },
      {
        heading: "Links Externos",
        content: `<p>Este website contém links para serviços externos, incluindo LinkedIn, GitHub, GitLab, Instagram e WhatsApp. Ao seguir esses links, você sai deste website e a política de privacidade do respectivo serviço se aplica. O operador deste website não tem controle sobre as práticas de processamento de dados desses serviços de terceiros.</p>`,
      },
      {
        heading: "Retenção de Dados",
        content: `<p>Este website não armazena permanentemente nenhum dado pessoal de usuários. Os logs do servidor mantidos pela Cloudflare estão sujeitos às próprias políticas de retenção da Cloudflare.</p>`,
      },
      {
        heading: "Alterações a Esta Política",
        content: `<p>Esta política de privacidade pode ser atualizada periodicamente. As alterações serão publicadas nesta página com uma data de revisão atualizada.</p>`,
      },
    ],
  },
  terms: {
    title: "Termos e Condições",
    lastUpdated: "22 de fevereiro de 2026",
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
        content: `<p>Estes termos são regidos pelas leis da República Federal da Alemanha. O foro competente é Munique, Alemanha, na medida permitida por lei.</p>`,
      },
      {
        heading: "Alterações a Estes Termos",
        content: `<p>O operador reserva-se o direito de modificar estes termos a qualquer momento. As alterações serão publicadas nesta página com uma data de revisão atualizada. O uso continuado do website após as alterações constitui aceitação dos termos modificados.</p>`,
      },
    ],
  },
  impressum: {
    title: "Impressum",
    lastUpdated: "22 de fevereiro de 2026",
    sections: [
      {
        heading: "Informações de acordo com § 5 TMG",
        content: `<p>Daniel Nunes Locatelli<br>
<!-- Substitua pelo seu endereço postal real --><br>
Munique, Alemanha</p>`,
      },
      {
        heading: "Contato",
        content: `<p>Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Telefone: +49 178 324-0834</p>`,
      },
      {
        heading: "Responsável pelo conteúdo de acordo com § 18 Abs. 2 MStV",
        content: `<p>Daniel Nunes Locatelli<br>
<!-- Substitua pelo seu endereço postal real --><br>
Munique, Alemanha</p>`,
      },
      {
        heading: "Resolução de Disputas da UE",
        content: `<p>Resolução alternativa de disputas nos termos do Art. 14(1) do Regulamento ODR e § 36 VSBG: A Comissão Europeia fornece uma plataforma para resolução de disputas online (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a></p>
<p>Nosso endereço de email pode ser encontrado acima. Não estamos dispostos nem obrigados a participar de procedimentos de resolução de disputas perante um conselho de arbitragem do consumidor.</p>`,
      },
      {
        heading: "Responsabilidade pelo Conteúdo",
        content: `<p>Como prestador de serviços, somos responsáveis pelo nosso próprio conteúdo nestas páginas de acordo com o § 7 (1) TMG (Lei Alemã de Telemídia). De acordo com os §§ 8 a 10 TMG, no entanto, não somos obrigados a monitorar informações transmitidas ou armazenadas de terceiros ou a investigar circunstâncias que indiquem atividade ilegal.</p>
<p>As obrigações de remover ou bloquear o uso de informações sob a lei geral permanecem inalteradas. No entanto, a responsabilidade neste sentido só é possível a partir do momento do conhecimento de uma infração específica. Ao tomar conhecimento de tais violações, removeremos o conteúdo imediatamente.</p>
<p>Os conteúdos deste website foram cuidadosamente verificados e criados com o melhor do nosso conhecimento. No entanto, não se garante a completude, precisão, atualidade ou qualidade das informações fornecidas. Não nos responsabilizamos por danos decorrentes da confiança no conteúdo deste website ou do seu uso, salvo se causados por dolo ou negligência grave. Reivindicações legais ao abrigo da Lei de Responsabilidade do Produto (Produkthaftungsgesetz) estão isentas desta limitação de responsabilidade.</p>`,
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

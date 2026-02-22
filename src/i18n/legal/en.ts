import type { I18nLegal } from "./type";

export const t: I18nLegal = {
  privacyPolicy: {
    title: "Privacy Policy",
    lastUpdated: "February 22, 2026",
    sections: [
      {
        heading: "Data Controller",
        content: `<p>Daniel Nunes Locatelli<br>
Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Website: <a href="https://daniellocatelli.com">daniellocatelli.com</a></p>`,
      },
      {
        heading: "Data Processing Overview",
        content: `<p>This website collects minimal personal data. There are no cookies, no analytics, no tracking pixels, and no third-party font loading. The following sections describe the limited data processing that occurs.</p>`,
      },
      {
        heading: "Hosting (Cloudflare)",
        content: `<p>This website is hosted on Cloudflare Pages and delivered via the Cloudflare CDN. When you visit this site, Cloudflare automatically processes:</p>
<ul>
<li>Your IP address</li>
<li>HTTP request headers (browser type, operating system, referrer URL)</li>
<li>Timestamp of access</li>
</ul>
<p>This processing is necessary for the delivery of the website (Art. 6(1)(f) GDPR — legitimate interest). Cloudflare Inc. is based in the United States. Data transfers to the US are covered by Cloudflare's Data Processing Addendum and EU Standard Contractual Clauses.</p>
<p>More information: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a></p>`,
      },
      {
        heading: "AI Chat Feature (Anthropic & Supabase)",
        content: `<p>This website includes an optional AI chat feature. When you use the chat:</p>
<ul>
<li>Your question is sent to <strong>Supabase</strong> for vector similarity search (query only — your input is not stored persistently)</li>
<li>Your question and the retrieved context are sent to the <strong>Anthropic Claude API</strong> for generating a response (processed but not stored long-term by Anthropic)</li>
</ul>
<p>Chat messages exist only in your browser session state and are lost when you close or refresh the page. No conversation history is stored on any server.</p>
<p>Legal basis: Art. 6(1)(a) GDPR — consent (you actively choose to use the chat). Both Anthropic and Supabase are US-based. Data transfers are covered by their respective Standard Contractual Clauses.</p>
<p>More information: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Anthropic Privacy Policy</a> · <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></p>`,
      },
      {
        heading: "Self-Hosted Fonts",
        content: `<p>This website uses the fonts Montserrat, Poppins, and Poiret One. All font files are served directly from this domain. No requests are made to Google Fonts or any other third-party font service.</p>`,
      },
      {
        heading: "No Cookies or Tracking",
        content: `<p>This website does not set any cookies. There are no analytics tools, no tracking pixels, and no advertising networks in use.</p>`,
      },
      {
        heading: "External Links",
        content: `<p>This website contains links to external services including LinkedIn, GitHub, GitLab, Instagram, and WhatsApp. When you follow these links, you leave this website and the respective service's privacy policy applies. The operator of this website has no control over the data processing practices of these third-party services.</p>`,
      },
      {
        heading: "Your Rights (GDPR Art. 15–21)",
        content: `<p>Under the General Data Protection Regulation, you have the right to:</p>
<ul>
<li><strong>Access</strong> — request information about your personal data being processed (Art. 15)</li>
<li><strong>Rectification</strong> — request correction of inaccurate data (Art. 16)</li>
<li><strong>Erasure</strong> — request deletion of your data (Art. 17)</li>
<li><strong>Restriction</strong> — request restriction of processing (Art. 18)</li>
<li><strong>Data portability</strong> — receive your data in a structured format (Art. 20)</li>
<li><strong>Objection</strong> — object to processing based on legitimate interest (Art. 21)</li>
</ul>
<p>To exercise these rights, contact: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a></p>
<p>You also have the right to lodge a complaint with a supervisory authority, in particular in the EU member state of your habitual residence, place of work, or place of the alleged infringement.</p>`,
      },
      {
        heading: "Data Retention",
        content: `<p>This website does not persistently store any personal user data. Server logs maintained by Cloudflare are subject to Cloudflare's own retention policies.</p>`,
      },
      {
        heading: "Changes to This Policy",
        content: `<p>This privacy policy may be updated from time to time. Changes will be posted on this page with an updated revision date.</p>`,
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "February 22, 2026",
    sections: [
      {
        heading: "Scope",
        content: `<p>These terms govern your use of the website daniellocatelli.com (the "Website"), operated by Daniel Nunes Locatelli. By accessing this website, you agree to these terms.</p>`,
      },
      {
        heading: "Intellectual Property",
        content: `<p>All content on this website — including but not limited to text, images, graphics, project documentation, code samples, and design — is the intellectual property of Daniel Nunes Locatelli unless otherwise stated. Unauthorized reproduction, distribution, or use of this content is prohibited without prior written permission.</p>`,
      },
      {
        heading: "AI Chat Disclaimer",
        content: `<p>This website features an AI-powered chat that provides general information about Daniel Locatelli's work and background. Please note:</p>
<ul>
<li>Responses are generated by artificial intelligence (Anthropic Claude) and may contain inaccuracies</li>
<li>The chat does not constitute professional, legal, or technical advice</li>
<li>You should independently verify any information obtained through the chat</li>
<li>The website operator is not liable for decisions made based on chat responses</li>
</ul>`,
      },
      {
        heading: "Permitted Use",
        content: `<p>You may browse this website for personal, non-commercial purposes. The following activities are prohibited:</p>
<ul>
<li>Scraping, crawling, or automated data extraction</li>
<li>Reproduction or redistribution of content without permission</li>
<li>Any use that could damage, disable, or impair the website</li>
<li>Attempting to gain unauthorized access to any part of the website or its systems</li>
</ul>`,
      },
      {
        heading: "Limitation of Liability",
        content: `<p>This website is provided "as is" without any warranties, express or implied. Daniel Nunes Locatelli does not warrant that:</p>
<ul>
<li>The website will be available at all times without interruption</li>
<li>The content is free from errors or inaccuracies</li>
<li>The website is free from viruses or other harmful components</li>
</ul>
<p>To the fullest extent permitted by law, the operator shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website.</p>`,
      },
      {
        heading: "External Links",
        content: `<p>This website contains links to third-party websites. The operator has no control over the content or practices of these external sites and assumes no responsibility for them. The inclusion of a link does not imply endorsement.</p>`,
      },
      {
        heading: "Governing Law",
        content: `<p>These terms are governed by the laws of the Federal Republic of Germany. The place of jurisdiction is Munich, Germany, to the extent permitted by law.</p>`,
      },
      {
        heading: "Changes to These Terms",
        content: `<p>The operator reserves the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the website after changes constitutes acceptance of the modified terms.</p>`,
      },
    ],
  },
  impressum: {
    title: "Impressum",
    lastUpdated: "February 22, 2026",
    sections: [
      {
        heading: "Information according to § 5 TMG",
        content: `<p>Daniel Nunes Locatelli<br>
<!-- Replace with your actual postal address --><br>
Munich, Germany</p>`,
      },
      {
        heading: "Contact",
        content: `<p>Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Phone: +49 178 324-0834</p>`,
      },
      {
        heading: "Responsible for content according to § 18 Abs. 2 MStV",
        content: `<p>Daniel Nunes Locatelli<br>
<!-- Replace with your actual postal address --><br>
Munich, Germany</p>`,
      },
      {
        heading: "EU Dispute Resolution",
        content: `<p>The European Commission provides a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a></p>
<p>Our email address can be found above. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>`,
      },
      {
        heading: "Liability for Content",
        content: `<p>As a service provider, we are responsible for our own content on these pages in accordance with § 7 (1) TMG (German Telemedia Act). According to §§ 8 to 10 TMG, however, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.</p>
<p>Obligations to remove or block the use of information under general law remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific infringement. Upon becoming aware of such violations, we will remove the content immediately.</p>`,
      },
      {
        heading: "Liability for Links",
        content: `<p>Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for the content of the linked pages.</p>
<p>The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognizable at the time of linking. However, permanent content control of the linked pages is unreasonable without concrete evidence of an infringement. Upon becoming aware of legal violations, we will remove such links immediately.</p>`,
      },
    ],
  },
};

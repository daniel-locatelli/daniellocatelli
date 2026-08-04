import type { I18nLegal } from "./type";

export const t: I18nLegal = {
  privacyPolicy: {
    title: "Privacy Policy",
    lastUpdated: "March 17, 2026",
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
        heading: "Embedded Videos (YouTube)",
        content: `<p>Some pages on this website embed videos from YouTube (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland). Videos are embedded using YouTube's privacy-enhanced mode (<code>youtube-nocookie.com</code>), which does not set cookies until you actively play a video.</p>
<p>When you play an embedded video, YouTube may collect:</p>
<ul>
<li>Your IP address</li>
<li>Browser and device information</li>
<li>Viewing behavior and interaction data</li>
</ul>
<p>If you are logged into your Google account, YouTube may associate your viewing activity with your profile.</p>
<p>Legal basis: Art. 6(1)(f) GDPR — legitimate interest in presenting project work through video content. Google LLC is based in the United States. Data transfers are covered by Google's Standard Contractual Clauses.</p>
<p>More information: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>`,
      },
      {
        heading: "Self-Hosted Fonts",
        content: `<p>This website uses the fonts Montserrat and Poppins. All font files are served directly from this domain. No requests are made to Google Fonts or any other third-party font service.</p>`,
      },
      {
        heading: "No Cookies or Tracking",
        content: `<p>This website does not set any first-party cookies. There are no analytics tools, no tracking pixels, and no advertising networks in use. Note that embedded YouTube videos (in privacy-enhanced mode) may set cookies when you choose to play them.</p>`,
      },
      {
        heading: "External Links",
        content: `<p>This website contains links to external services including LinkedIn, GitHub, GitLab, Instagram, Bluesky, ORCID, and WhatsApp. When you follow these links, you leave this website and the respective service's privacy policy applies. The operator of this website has no control over the data processing practices of these third-party services.</p>`,
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
    lastUpdated: "August 4, 2026",
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
        content: `<p>These terms are governed by Swiss law. The place of jurisdiction is Zurich, Switzerland, to the extent permitted by law.</p>`,
      },
      {
        heading: "Changes to These Terms",
        content: `<p>The operator reserves the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the website after changes constitutes acceptance of the modified terms.</p>`,
      },
    ],
  },
  impressum: {
    title: "Impressum",
    lastUpdated: "August 4, 2026",
    sections: [
      {
        heading: "Website Operator",
        content: `<p>Daniel Nunes Locatelli<br>
        Schwandenacker 46<br>
        8052 Zurich, Switzerland</p>`,
      },
      {
        heading: "Contact",
        content: `<p>Email: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
        Phone: +49 178 324-0834</p>`,
      },
      {
        heading: "Responsible for Content",
        content: `<p>Daniel Nunes Locatelli<br>
        Schwandenacker 46<br>
        8052 Zurich, Switzerland</p>`,
      },
      {
        heading: "Dispute Resolution",
        content: `<p>We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>`,
      },
      {
        heading: "Liability for Content",
        content: `<p>As the operator of this website, we are responsible for our own content on these pages in accordance with general legislation. We are, however, not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.</p>
<p>Obligations to remove or block the use of information under general law remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific infringement. Upon becoming aware of such violations, we will remove the content immediately.</p>
<p>The contents of this website have been carefully reviewed and created to the best of our knowledge. However, no claim is made regarding the completeness, accuracy, timeliness, or quality of the information provided. We shall not be liable for damages arising from reliance on the content of this website or its use, unless such damages were caused intentionally or through gross negligence. Mandatory statutory liability claims remain unaffected by this limitation of liability.</p>`,
      },
      {
        heading: "Liability for Links",
        content: `<p>Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for the content of the linked pages.</p>
<p>The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognizable at the time of linking. However, permanent content control of the linked pages is unreasonable without concrete evidence of an infringement. Upon becoming aware of legal violations, we will remove such links immediately.</p>`,
      },
      {
        heading: "Third-Party Intellectual Property",
        content: `<p>We take the intellectual property rights of third parties very seriously. We do not knowingly publish infringing content on our pages, nor do we link to such content. However, it is possible that content on external pages may change without our influence or our ability to constantly monitor it.</p>
<p>Should you discover that one of our links points to an infringing offer, we kindly ask you to notify us. We will promptly review the matter and remove the link if necessary.</p>`,
      },
    ],
  },
};

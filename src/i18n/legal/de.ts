import type { I18nLegal } from "./type";

export const t: I18nLegal = {
  privacyPolicy: {
    title: "Datenschutzerklärung",
    lastUpdated: "17. März 2026",
    sections: [
      {
        heading: "Verantwortlicher",
        content: `<p>Daniel Nunes Locatelli<br>
E-Mail: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
Website: <a href="https://daniellocatelli.com">daniellocatelli.com</a></p>`,
      },
      {
        heading: "Übersicht der Datenverarbeitung",
        content: `<p>Diese Website erhebt nur minimale personenbezogene Daten. Es werden keine Cookies gesetzt, keine Analysetools verwendet, keine Tracking-Pixel eingesetzt und keine Schriftarten von Drittanbietern geladen. Die folgenden Abschnitte beschreiben die begrenzte Datenverarbeitung, die stattfindet.</p>`,
      },
      {
        heading: "Hosting (Cloudflare)",
        content: `<p>Diese Website wird auf Cloudflare Pages gehostet und über das Cloudflare CDN ausgeliefert. Beim Besuch dieser Website verarbeitet Cloudflare automatisch:</p>
<ul>
<li>Ihre IP-Adresse</li>
<li>HTTP-Anfrage-Header (Browsertyp, Betriebssystem, Referrer-URL)</li>
<li>Zeitpunkt des Zugriffs</li>
</ul>
<p>Diese Verarbeitung ist für die Bereitstellung der Website erforderlich (Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse). Cloudflare Inc. hat seinen Sitz in den Vereinigten Staaten. Datenübermittlungen in die USA werden durch den Auftragsverarbeitungsvertrag von Cloudflare und die EU-Standardvertragsklauseln abgesichert.</p>
<p>Weitere Informationen: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Datenschutzrichtlinie</a></p>`,
      },
      {
        heading: "KI-Chat-Funktion (Anthropic & Supabase)",
        content: `<p>Diese Website enthält eine optionale KI-Chat-Funktion. Bei Nutzung des Chats:</p>
<ul>
<li>Ihre Frage wird an <strong>Supabase</strong> zur Vektorsimilaritätssuche gesendet (nur Abfrage — Ihre Eingabe wird nicht dauerhaft gespeichert)</li>
<li>Ihre Frage und der abgerufene Kontext werden an die <strong>Anthropic Claude API</strong> zur Generierung einer Antwort gesendet (verarbeitet, aber nicht langfristig von Anthropic gespeichert)</li>
</ul>
<p>Chat-Nachrichten existieren nur im Sitzungsstatus Ihres Browsers und gehen verloren, wenn Sie die Seite schließen oder aktualisieren. Es wird kein Gesprächsverlauf auf einem Server gespeichert.</p>
<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO — Einwilligung (Sie entscheiden sich aktiv für die Nutzung des Chats). Sowohl Anthropic als auch Supabase haben ihren Sitz in den USA. Datenübermittlungen werden durch die jeweiligen Standardvertragsklauseln abgesichert.</p>
<p>Weitere Informationen: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Anthropic Datenschutzrichtlinie</a> · <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Datenschutzrichtlinie</a></p>`,
      },
      {
        heading: "Eingebettete Videos (YouTube)",
        content: `<p>Einige Seiten dieser Website betten Videos von YouTube ein (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Videos werden im erweiterten Datenschutzmodus von YouTube (<code>youtube-nocookie.com</code>) eingebettet, der keine Cookies setzt, bis Sie ein Video aktiv abspielen.</p>
<p>Wenn Sie ein eingebettetes Video abspielen, kann YouTube Folgendes erfassen:</p>
<ul>
<li>Ihre IP-Adresse</li>
<li>Browser- und Geräteinformationen</li>
<li>Wiedergabeverhalten und Interaktionsdaten</li>
</ul>
<p>Wenn Sie in Ihrem Google-Konto angemeldet sind, kann YouTube Ihre Wiedergabeaktivität mit Ihrem Profil verknüpfen.</p>
<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse an der Darstellung von Projektarbeiten durch Videoinhalte. Google LLC hat seinen Sitz in den Vereinigten Staaten. Datenübermittlungen werden durch die Standardvertragsklauseln von Google abgesichert.</p>
<p>Weitere Informationen: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Datenschutzrichtlinie</a></p>`,
      },
      {
        heading: "Selbst gehostete Schriftarten",
        content: `<p>Diese Website verwendet die Schriftarten Montserrat, Poppins und Poiret One. Alle Schriftdateien werden direkt von dieser Domain ausgeliefert. Es werden keine Anfragen an Google Fonts oder andere Drittanbieter-Schriftdienste gestellt.</p>`,
      },
      {
        heading: "Keine Cookies oder Tracking",
        content: `<p>Diese Website setzt keine eigenen Cookies. Es werden keine Analysetools, Tracking-Pixel oder Werbenetzwerke verwendet. Beachten Sie, dass eingebettete YouTube-Videos (im erweiterten Datenschutzmodus) Cookies setzen können, wenn Sie diese abspielen.</p>`,
      },
      {
        heading: "Externe Links",
        content: `<p>Diese Website enthält Links zu externen Diensten wie LinkedIn, GitHub, GitLab, Instagram, Bluesky, ORCID und WhatsApp. Wenn Sie diesen Links folgen, verlassen Sie diese Website und die Datenschutzrichtlinie des jeweiligen Dienstes gilt. Der Betreiber dieser Website hat keinen Einfluss auf die Datenverarbeitungspraktiken dieser Drittanbieter.</p>`,
      },
      {
        heading: "Datenspeicherung",
        content: `<p>Diese Website speichert keine personenbezogenen Nutzerdaten dauerhaft. Serverprotokolle, die von Cloudflare verwaltet werden, unterliegen den eigenen Aufbewahrungsrichtlinien von Cloudflare.</p>`,
      },
      {
        heading: "Änderungen dieser Datenschutzerklärung",
        content: `<p>Diese Datenschutzerklärung kann von Zeit zu Zeit aktualisiert werden. Änderungen werden auf dieser Seite mit einem aktualisierten Überarbeitungsdatum veröffentlicht.</p>`,
      },
    ],
  },
  terms: {
    title: "Nutzungsbedingungen",
    lastUpdated: "17. März 2026",
    sections: [
      {
        heading: "Geltungsbereich",
        content: `<p>Diese Nutzungsbedingungen regeln die Nutzung der Website daniellocatelli.com (die „Website"), betrieben von Daniel Nunes Locatelli. Durch den Zugriff auf diese Website stimmen Sie diesen Bedingungen zu.</p>`,
      },
      {
        heading: "Geistiges Eigentum",
        content: `<p>Alle Inhalte dieser Website — einschließlich, aber nicht beschränkt auf Texte, Bilder, Grafiken, Projektdokumentation, Codebeispiele und Design — sind geistiges Eigentum von Daniel Nunes Locatelli, sofern nicht anders angegeben. Die unbefugte Vervielfältigung, Verbreitung oder Nutzung dieser Inhalte ist ohne vorherige schriftliche Genehmigung untersagt.</p>`,
      },
      {
        heading: "Haftungsausschluss für den KI-Chat",
        content: `<p>Diese Website verfügt über einen KI-gestützten Chat, der allgemeine Informationen über die Arbeit und den Hintergrund von Daniel Locatelli bereitstellt. Bitte beachten Sie:</p>
<ul>
<li>Antworten werden durch künstliche Intelligenz (Anthropic Claude) generiert und können Ungenauigkeiten enthalten</li>
<li>Der Chat stellt keine professionelle, rechtliche oder technische Beratung dar</li>
<li>Sie sollten alle über den Chat erhaltenen Informationen unabhängig überprüfen</li>
<li>Der Website-Betreiber haftet nicht für Entscheidungen, die auf Grundlage der Chat-Antworten getroffen werden</li>
</ul>`,
      },
      {
        heading: "Erlaubte Nutzung",
        content: `<p>Sie dürfen diese Website für persönliche, nicht-kommerzielle Zwecke nutzen. Folgende Aktivitäten sind untersagt:</p>
<ul>
<li>Scraping, Crawling oder automatisierte Datenextraktion</li>
<li>Vervielfältigung oder Weiterverbreitung von Inhalten ohne Genehmigung</li>
<li>Jede Nutzung, die die Website beschädigen, deaktivieren oder beeinträchtigen könnte</li>
<li>Versuche, unbefugten Zugang zu Teilen der Website oder ihrer Systeme zu erlangen</li>
</ul>`,
      },
      {
        heading: "Haftungsbeschränkung",
        content: `<p>Diese Website wird „wie besehen" ohne jegliche ausdrückliche oder stillschweigende Gewährleistung bereitgestellt. Daniel Nunes Locatelli übernimmt keine Gewähr dafür, dass:</p>
<ul>
<li>Die Website jederzeit unterbrechungsfrei verfügbar ist</li>
<li>Der Inhalt frei von Fehlern oder Ungenauigkeiten ist</li>
<li>Die Website frei von Viren oder anderen schädlichen Komponenten ist</li>
</ul>
<p>Im größtmöglichen gesetzlich zulässigen Umfang haftet der Betreiber nicht für direkte, indirekte, zufällige oder Folgeschäden, die sich aus der Nutzung dieser Website ergeben.</p>`,
      },
      {
        heading: "Externe Links",
        content: `<p>Diese Website enthält Links zu Websites Dritter. Der Betreiber hat keinen Einfluss auf den Inhalt oder die Praktiken dieser externen Seiten und übernimmt keine Verantwortung dafür. Die Aufnahme eines Links bedeutet keine Billigung.</p>`,
      },
      {
        heading: "Anwendbares Recht",
        content: `<p>Diese Bedingungen unterliegen dem Recht der Bundesrepublik Deutschland. Gerichtsstand ist München, Deutschland, soweit gesetzlich zulässig.</p>`,
      },
      {
        heading: "Änderungen dieser Bedingungen",
        content: `<p>Der Betreiber behält sich das Recht vor, diese Bedingungen jederzeit zu ändern. Änderungen werden auf dieser Seite mit einem aktualisierten Überarbeitungsdatum veröffentlicht. Die fortgesetzte Nutzung der Website nach Änderungen gilt als Annahme der geänderten Bedingungen.</p>`,
      },
    ],
  },
  impressum: {
    title: "Impressum",
    lastUpdated: "17. März 2026",
    sections: [
      {
        heading: "Angaben gemäß § 5 TMG",
        content: `<p>Daniel Nunes Locatelli<br>
        Klingsorstraße 3<br>
        81927 München, Deutschland</p>`,
      },
      {
        heading: "Kontakt",
        content: `<p>E-Mail: <a href="mailto:contact@daniellocatelli.com">contact@daniellocatelli.com</a><br>
        Telefon: +49 178 324-0834</p>`,
      },
      {
        heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
        content: `<p>Daniel Nunes Locatelli<br>
        Klingsorstraße 3<br>
        81927 München, Deutschland</p>`,
      },
      {
        heading: "Streitbeilegung",
        content: `<p>Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit (§ 36 VSBG).</p>`,
      },
      {
        heading: "Haftung für Inhalte",
        content: `<p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
<p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
<p>Die Inhalte dieser Website wurden sorgfältig geprüft und nach bestem Wissen erstellt. Dennoch wird für die hier dargebotenen Informationen kein Anspruch auf Vollständigkeit, Aktualität, Qualität und Richtigkeit erhoben. Für Schäden, die durch das Vertrauen auf die Inhalte dieser Website oder deren Gebrauch entstehen, haften wir nicht, es sei denn, sie wurden vorsätzlich oder grob fahrlässig verursacht. Gesetzliche Ansprüche aus dem Produkthaftungsgesetz sind von dieser Haftungsbeschränkung ausgenommen.</p>`,
      },
      {
        heading: "Haftung für Links",
        content: `<p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
<p>Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>`,
      },
      {
        heading: "Schutzrechte Dritter",
        content: `<p>Wir nehmen Schutzrechte Dritter sehr ernst. Selbstverständlich stellen wir bewusst weder rechtsverletzende Inhalte auf unseren Seiten ein, noch verlinken wir auf solche. Dennoch kann es sein, dass sich Inhalte auf externen Seiten verändern, ohne dass wir hierauf Einfluss hätten oder dies ständig überprüfen könnten.</p>
<p>Sollten Sie feststellen, dass einer unserer Links auf ein rechtswidriges Angebot verweist, bitten wir darum, uns dies mitzuteilen. Wir werden dies dann umgehend prüfen und den Link gegebenenfalls entfernen.</p>`,
      },
    ],
  },
};

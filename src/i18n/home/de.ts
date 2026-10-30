import type { I18nHome } from "./types";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Daniel Locatelli, Doktorand bei Gramazio Kohler Research, ETH Zürich. Essays und Forschung zu Holzplattentragwerken und dazu, wie KI die Arbeit von Architekten und Ingenieuren verändert.",
    coverAlt: "Daniel Locatelli.",
  },
  intro: {
    role: "Doktorand, Gramazio Kohler Research, ETH Zürich",
    bio: "Ich erforsche, wie Holzplattentragwerke entworfen und gebaut werden und wie KI die Arbeit von Architekten und Ingenieuren verändert.",
  },
  chat: {
    prompt: "Frag mich alles über meine Forschung, Projekte oder Lehre.",
    note: "Die Antworten werden von Claude generiert.",
    suggestions: [
      "Worum geht es in deiner Promotion?",
      "Skills oder Plugins?",
      "Was hast du vorher gebaut?",
    ],
    initialMessage:
      "Hallo! Frag mich alles über meine Arbeit, Erfahrung oder Projekte.\n\n*Bitte beachte: Die Antworten werden von KI (Anthropic Claude) generiert und können Ungenauigkeiten enthalten. Dieser Chat stellt keine professionelle, rechtliche oder technische Beratung dar. Bitte überprüfe alle Informationen eigenständig.*",
    inputPlaceholder: "Frag mich etwas...",
    headerTitle: "KI-Assistent",
    poweredBy: "Unterstützt von",
    errorMessage:
      "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuch es später noch einmal.",
    requestQuote: "Angebot anfordern",
    sendEmail: "E-Mail senden",
  },
  essays: {
    title: "Essays",
  },
};

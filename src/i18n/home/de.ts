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
    suggestions: [
      "Welche Dienstleistungen bietest du an?",
      "Worum geht es in deiner Promotion?",
      "KI-Agent-Skills für Architektur?",
      "Was hast du vorher gebaut?",
    ],
    initialMessage:
      "Hallo! Frag mich alles über meine Arbeit, Erfahrung oder Projekte.\n\n*Die Antworten werden von KI (Anthropic Claude) generiert und können Fehler enthalten. Bitte überprüfe Wichtiges selbst.*",
    headerTitle: "KI-Assistent",
    chatPlaceholder: "Frag {model} zu meiner Arbeit...",
    errorMessage:
      "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuch es später noch einmal.",
    requestQuote: "Angebot anfordern",
    sendEmail: "E-Mail senden",
    back: "Zurück",
    newChat: "Neuer Chat",
    resume: "Unterhaltung fortsetzen",
    jumpToLatest: "Zur neuesten Nachricht",
  },
  essays: {
    title: "Essays",
  },
};

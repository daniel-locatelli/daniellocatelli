import type { I18nHome } from "./types";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Daniel Locatelli, doutorando no Gramazio Kohler Research, ETH Zurique. Ensaios e pesquisas sobre estruturas de placas de madeira e sobre como a IA muda a forma como arquitetos e engenheiros trabalham.",
    coverAlt: "Daniel Locatelli.",
  },
  intro: {
    role: "Doutorando, Gramazio Kohler Research, ETH Zurique",
    bio: "Pesquiso o projeto e a construção de estruturas de placas de madeira, e como a IA está mudando a forma como arquitetos e engenheiros trabalham.",
  },
  chat: {
    suggestions: [
      "Quais serviços você oferece?",
      "Sobre o que é seu doutorado?",
      "Quais skills de agentes de IA você já criou?",
      "Em quais projetos você já trabalhou?",
    ],
    initialMessage:
      "Olá! Me pergunte qualquer coisa sobre meu trabalho, minha experiência ou meus projetos.\n\n*As respostas são geradas por IA (Anthropic Claude) e podem conter erros. Verifique o que for importante.*",
    headerTitle: "Assistente de IA",
    chatPlaceholder: "Pergunte algo ao {model}...",
    errorMessage: "Desculpe, algo deu errado. Tente novamente mais tarde.",
    requestQuote: "Solicite um orçamento",
    sendEmail: "Envie um e-mail",
    back: "Voltar",
    newChat: "Nova conversa",
    resume: "Continuar a conversa",
    jumpToLatest: "Ir para a mensagem mais recente",
  },
  essays: {
    title: "Ensaios",
  },
};

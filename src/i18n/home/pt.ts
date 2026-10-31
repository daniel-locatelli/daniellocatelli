import type { I18nHome } from "./types";

export const t: I18nHome = {
  meta: {
    title: "Daniel Locatelli",
    description:
      "Daniel Locatelli, doutorando no Gramazio Kohler Research, ETH Zurique. Ensaios e pesquisa sobre estruturas de placas de madeira e sobre como a IA muda a forma como arquitetos e engenheiros trabalham.",
    coverAlt: "Daniel Locatelli.",
  },
  intro: {
    role: "Doutorando, Gramazio Kohler Research, ETH Zurique",
    bio: "Pesquiso como estruturas de placas de madeira são projetadas e construídas, e como a IA muda a forma como arquitetos e engenheiros trabalham.",
  },
  chat: {
    prompt: "Pergunte qualquer coisa sobre minha pesquisa, projetos ou ensino.",
    note: "As respostas são geradas pelo Claude.",
    suggestions: [
      "Sobre o que é seu doutorado?",
      "Skills ou plugins?",
      "O que você construiu antes?",
    ],
    initialMessage:
      "Olá! Me pergunte alguma coisa sobre meu trabalho, experiência ou projetos.\n\n*Atenção: As respostas são geradas por IA (Anthropic Claude) e podem conter imprecisões. Este chat não constitui aconselhamento profissional, jurídico ou técnico. Por favor, verifique qualquer informação de forma independente.*",
    inputPlaceholder: "Me pergunte alguma coisa...",
    headerTitle: "Assistente IA",
    poweredBy: "Desenvolvido com",
    errorMessage:
      "Desculpe, encontrei um erro. Por favor, tente novamente mais tarde.",
    requestQuote: "Faça um orçamento",
    sendEmail: "Envie um Email",
  },
  essays: {
    title: "Ensaios",
  },
};

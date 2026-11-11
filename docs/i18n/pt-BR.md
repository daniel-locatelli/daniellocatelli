# Portuguese (pt) style guide

How the site's Portuguese is written. Read it before writing or reviewing any
`pt` text: `src/i18n/*/pt.ts`, `src/content/**/pt/**`, slide decks, and the
pt strings in `src/scripts/generate-knowledge.ts`. The house rules in
`CLAUDE.md` (no em dashes, headings from h2) apply here too.

## Voice

- **Brazilian Portuguese**, written by Daniel in the first person.
- **Você**, warm and professional: how a Brazilian researcher talks to a
  curious colleague, not how a manual or a legal form talks.
- **Write from the meaning.** Read the English, decide what it is saying, then
  write the sentence a Brazilian would write to say it. The English sentence
  structure is a reference, never a template. The test: a reader should not be
  able to tell the text was ever in English.

## Calques to watch for

A calque keeps the English structure with Portuguese words. Typical shapes:

- Literal verbs where Portuguese uses a different idea: "What did you build
  before?" is about past work, so it becomes a question about projects, not
  "construir".
- Possessives and pronouns English needs and Portuguese drops ("meu", "seu",
  "você" in every clause).
- Title Case in headings and labels ("Experiência Profissional"): Portuguese
  uses sentence case, "Experiência profissional".
- Noun stacks ("Assistente IA" for "AI Assistant"): Portuguese links nouns
  with "de", "Assistente de IA".
- Gerund chains ("estamos trabalhando desenvolvendo").

## Glossary

Fixed choices for recurring terms. **Confirmed** entries come from Daniel;
**proposed** ones are what the site uses today and are open to correction.

| English | Portuguese | Status |
| --- | --- | --- |
| education (CV) | formação | confirmed |
| supervisor / advisor | orientador / coorientador | confirmed |
| skills (CV section) | competências | confirmed |
| vernacular (adj.) | vernacular | confirmed |
| Terms and Conditions / Impressum | Termos de uso / Informações legais | confirmed |
| PhD | doutorado | proposed |
| doctoral researcher | doutorando | proposed |
| timber plate structures | estruturas de placas de madeira | proposed |
| ETH Zurich | ETH Zurique | proposed |
| Gramazio Kohler Research | Gramazio Kohler Research (unchanged) | proposed |
| (agent) skills | skills (kept in English) | proposed |

## Corrections

Daniel's corrections, newest first. They are the strongest guidance in this
file: before writing pt text, read them and generalise from them. Agents add
an entry whenever Daniel corrects pt wording, in chat or by editing a file
(see the rule in `CLAUDE.md` and the `reviewing-translations` skill). An entry
records what was wrong, so "kept" decisions belong here too.

Manual edits harvested through commit: `fa96de7f`

| Date | Where | Before | After | Why |
| --- | --- | --- | --- | --- |
| 2026-11-11 | home chat starter question | Que skills de agentes de IA você criou para arquitetura? | Quais skills de agentes de IA você já criou para arquitetura e engenharia? | "Que ... você criou" reads abrupt; "Quais ... você já criou" is how the question is asked. Daniel also widened it to "arquitetura e engenharia". |
| 2026-11-11 | chat benchmark question (`scripts/benchmark-chat.ts`) | O que você construiu antes? | Você já participou de quais projetos? / Quais programas você já desenvolveu? / Com o que você trabalha? | Nobody asks "construiu" about a career; it is "What did you build" word for word. Ask about projects, software ("programas") or work instead. |
| 2026-11-11 | chat bottom bar, before the model name | Desenvolvido com | Respostas geradas pelo | "Desenvolvido" says the site was built with the model; the model only writes the answers. Translate what a label does, not the English idiom ("Powered by"). |
| 2026-11-11 | subpage next-entry label | Próximo | Próximo (kept) | Reviewer proposed "Seguinte" for gender neutrality; "Próximo/Anterior" is the standard Brazilian navigation pair. |
| 2026-11-11 | CV quote | materiais vernaculares | materiais vernaculares (kept) | "Vernacular" is a valid Portuguese adjective (Priberam: same as "vernáculo") and the usual term in architecture. |
| 2026-11-11 | CV quote | Seu futuro reside na aplicação | Seu futuro está na aplicação | "Reside" is a stiff calque of "lies in". |
| 2026-11-11 | CV summary | pesquisando do design computacional à fabricação de sistemas construtivos em placas de madeira e como a IA pode apoiar | com pesquisa sobre sistemas construtivos em placas de madeira, do design computacional à fabricação, e sobre como a IA pode apoiar | Gerund plus English word order. |
| 2026-11-11 | CV summary | especializado em construção em madeira, integrando design e engenharia através de C#/.NET e Python | voltado à construção em madeira, unindo projeto e engenharia com C#, Python e tecnologias web | "Através de" calques "through"; also restored "web technologies". |
| 2026-11-11 | CV summary | dedicado a solucionar problemas estruturais complexos através de software escalável | que resolve problemas estruturais complexos com software escalável | "Dedicado a" and "através de" are calques. |
| 2026-11-11 | CV meta descriptions | Este é meu CV simplificado, incluindo trabalho, educação, ... | Meu CV resumido, com a experiência profissional principal, formação, ... | "Este é meu", "incluindo", "educação" are calques. |
| 2026-11-11 | CV labels | Educação / Especializações / Cursos frequentados / Habilidades / Certificados / Ferramentas | Formação / Especialidades / Cursos realizados / Competências / Certificações / Ferramentas de design | False friends and CV conventions; "especialização" is a postgraduate course in Brazil. |
| 2026-11-11 | CV labels | Supervisores / Conselheiros | Orientadores / Coorientadores | Academic terms; "conselheiro" is a false friend. |
| 2026-11-11 | labels (CV, subpage) | Experiência Profissional, Experiência Docente, Lista de Projetos, Outros Links | Experiência profissional, Experiência docente, Lista de projetos, Outros links | Title Case is English; Portuguese uses sentence case. |
| 2026-11-11 | footer and legal titles | Termos e Condições / Impressum | Termos de uso / Informações legais | Usual Brazilian names. |
| 2026-11-11 | subpage | Assistir apresentação | Assistir à apresentação | Crase required. |
| 2026-11-11 | home chat | Desculpe, encontrei um erro. Por favor, tente novamente mais tarde. | Desculpe, algo deu errado. Tente novamente mais tarde. | Calque of "I encountered an error". |
| 2026-11-11 | home chat | Assistente IA / Envie um Email / Faça um orçamento | Assistente de IA / Envie um e-mail / Solicite um orçamento | Noun stack; "e-mail" spelling; "faça" means the visitor drafts the quote. |
| 2026-11-11 | home chat | Pergunte qualquer coisa sobre minha pesquisa, projetos ou ensino. | Pergunte o que quiser sobre minha pesquisa, meus projetos ou minhas aulas. | Possessive agreement; "ensino" sounds institutional. |
| 2026-11-11 | home chat greeting | sobre meu trabalho, experiência ou projetos | sobre meu trabalho, minha experiência ou meus projetos | One "meu" cannot agree with feminine and plural nouns. |
| 2026-11-11 | home chat starter question | Skills de agentes de IA para arquitetura? | Que skills de agentes de IA você criou para arquitetura? | English-style noun-stack fragment as a question. |
| 2026-11-11 | home bio | Pesquiso como estruturas de placas de madeira são projetadas e construídas | Pesquiso o projeto e a construção de estruturas de placas de madeira | Passive voice follows the English. |
| 2026-11-11 | home meta description | Ensaios e pesquisa sobre | Ensaios e pesquisas sobre | Plural reads more naturally. |
| 2026-11-11 | home chat starter question | O que você construiu antes? | Em quais projetos você já trabalhou? | Literal translation of "What did you build before?"; the question is about past projects. |

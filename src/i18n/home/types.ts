export type I18nHome = {
  meta: {
    title: string;
    description: string;
    coverAlt: string;
  };
  intro: {
    /** Muted line under the name. */
    role: string;
    bio: string;
  };
  chat: {
    suggestions: string[];
    initialMessage: string;
    headerTitle: string;
    /** Input placeholder; {model} is the model's name. */
    chatPlaceholder: string;
    errorMessage: string;
    requestQuote: string;
    sendEmail: string;
    back: string;
    newChat: string;
    resume: string;
    jumpToLatest: string;
  };
  essays: {
    title: string;
  };
};

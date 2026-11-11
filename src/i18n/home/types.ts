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
    prompt: string;
    note: string;
    suggestions: string[];
    initialMessage: string;
    inputPlaceholder: string;
    headerTitle: string;
    poweredBy: string;
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

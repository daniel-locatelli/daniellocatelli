export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface LinkPreview {
  title: string;
  coverUrl: string;
  slug: string;
}

export interface HeroChatLabels {
  initialMessage: string;
  inputPlaceholder: string;
  headerTitle: string;
  poweredBy: string;
  errorMessage: string;
  requestQuote: string;
  sendEmail: string;
  /** Muted line above the starter questions. */
  prompt: string;
  /** Small print under the input. */
  note: string;
  /** Starter questions shown as chips; clicking one asks it. */
  suggestions: string[];
}

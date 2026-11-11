export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface LinkPreview {
  title: string;
  coverUrl: string;
  slug: string;
}

/** Preview cards keyed by the index of the assistant message that linked them. */
export type PreviewMap = Record<number, LinkPreview[]>;

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
  /** Leaves the conversation view, keeping the conversation. */
  back: string;
  /** Clears the conversation and returns to the homepage view. */
  newChat: string;
  /** Homepage link back into an ongoing conversation. */
  resume: string;
  /** Button that scrolls down when the end of the conversation is out of view. */
  jumpToLatest: string;
}

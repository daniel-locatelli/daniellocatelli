export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface LinkPreview {
  title: string;
  coverUrl: string;
  slug: string;
  /** Link to the page in the visitor's locale (older stored previews lack it). */
  href?: string;
  /** Cover size, so the large image reserves its space before it loads. */
  width?: number;
  height?: number;
}

/** Preview cards keyed by the index of the assistant message that linked them. */
export type PreviewMap = Record<number, LinkPreview[]>;

export interface HeroChatLabels {
  initialMessage: string;
  headerTitle: string;
  /** Input placeholder; {model} is the model's name. */
  chatPlaceholder: string;
  errorMessage: string;
  requestQuote: string;
  sendEmail: string;
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

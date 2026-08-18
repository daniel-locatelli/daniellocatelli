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
}

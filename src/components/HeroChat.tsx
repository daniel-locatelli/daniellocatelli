import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  lazy,
  Suspense,
} from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Mail,
  SquarePen,
} from "lucide-react";
import { siteConfig } from "../config/site";
import { formatUrlsAsMarkdown } from "../lib/chat-markdown";
import type {
  Message,
  LinkPreview,
  PreviewMap,
  HeroChatLabels,
} from "./hero-chat-types";

// The conversation view (Streamdown markdown renderer) is only loaded once the visitor
// shows intent to chat, keeping the initial bundle small.
const loadConversation = () => import("./HeroChatConversation");
const HeroChatConversation = lazy(loadConversation);

interface HeroChatProps {
  modelName: string;
  labels: HeroChatLabels;
}

type Mode = "home" | "chat";

/**
 * The page has two states, like claude.ai: "home" shows the intro, starter
 * questions and essays with the input in place; "chat" clears everything but
 * the conversation and docks the input to the bottom of the viewport. The
 * page-level parts (intro, essays, footer) are hidden by CSS keyed on this
 * attribute, see `src/pages/[...locale]/index.astro`.
 */
const CHAT_ATTR = "data-hero-chat";
/** Session copy of the conversation, so leaving via a link and coming back keeps it. Read pre-paint by index.astro. */
const STORAGE_KEY = "hero-chat:v1";
const MAX_STORED_MESSAGES = 100;

const COLLECTION_PREFIXES = [
  "projects",
  "research",
  "essays",
  "teaching",
  "publications",
];
const LOCALE_PREFIXES = ["en", "pt", "de"];
const SITE_DOMAIN = "daniellocatelli.com";

function extractInternalSlugs(markdown: string): string[] {
  const slugs: string[] = [];
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(markdown)) !== null) {
    const href = match[2];
    let path = "";

    try {
      const url = new URL(href, "https://daniellocatelli.com");
      if (
        url.hostname === SITE_DOMAIN ||
        url.hostname === `www.${SITE_DOMAIN}`
      ) {
        path = url.pathname;
      } else if (href.startsWith("/")) {
        path = href;
      } else {
        continue;
      }
    } catch {
      if (href.startsWith("/")) {
        path = href;
      } else {
        continue;
      }
    }

    path = path.replace(/^\//, "");
    const firstSegment = path.split("/")[0];
    if (LOCALE_PREFIXES.includes(firstSegment)) {
      path = path.slice(firstSegment.length + 1);
    }
    path = path.replace(/\/$/, "");

    const prefix = path.split("/")[0];
    if (COLLECTION_PREFIXES.includes(prefix) && path.includes("/")) {
      slugs.push(path);
    }
  }
  return [...new Set(slugs)];
}

interface Stored {
  messages: Message[];
  previews: PreviewMap;
  mode: Mode;
}

const isStr = (v: unknown): v is string => typeof v === "string";

/** Read the stored session defensively: it is user-controllable input. */
function loadStored(): Stored | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Stored>;
    if (!Array.isArray(data.messages)) return null;
    const messages = data.messages
      .filter(
        (m): m is Message =>
          !!m &&
          (m.role === "user" || m.role === "assistant") &&
          isStr(m.content),
      )
      .slice(-MAX_STORED_MESSAGES);
    if (messages.length < 2) return null;
    const previews: PreviewMap = {};
    if (data.previews && typeof data.previews === "object") {
      for (const [k, list] of Object.entries(data.previews)) {
        const idx = Number(k);
        if (!Number.isInteger(idx) || !Array.isArray(list)) continue;
        previews[idx] = list.filter(
          (p): p is LinkPreview =>
            !!p && isStr(p.title) && isStr(p.slug) && isStr(p.coverUrl),
        );
      }
    }
    return { messages, previews, mode: data.mode === "chat" ? "chat" : "home" };
  } catch {
    return null;
  }
}

function saveStored(data: Stored) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode or storage full: the chat still works, it just won't survive navigation.
  }
}

function clearStored() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollPageToBottom = (behavior: ScrollBehavior) =>
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior });

export default function HeroChat({ modelName, labels }: HeroChatProps) {
  const initialMessages: Message[] = [
    { role: "assistant", content: labels.initialMessage },
  ];
  const [mode, setMode] = useState<Mode>("home");
  const [conversationRequested, setConversationRequested] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [previews, setPreviews] = useState<PreviewMap>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  /** Index of the answer still streaming in, or -1. */
  const [streamingIndex, setStreamingIndex] = useState(-1);
  /** The reader is above the end of the conversation. */
  const [moreBelow, setMoreBelow] = useState(false);
  const [restored, setRestored] = useState(false);

  // Mirrors `messages` synchronously so async code can learn the index of
  // the message it appends.
  const messagesRef = useRef<Message[]>(initialMessages);
  const fetchedSlugsRef = useRef<Set<string>>(new Set());
  const dockRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  /** Input position before a mode switch, for the slide animation. */
  const flipFromRef = useRef<DOMRect | null>(null);

  const hasConversation = messages.length > 1;

  const replaceMessages = (next: Message[]) => {
    messagesRef.current = next;
    setMessages(next);
  };
  const appendMessage = (m: Message) => {
    replaceMessages([...messagesRef.current, m]);
    return messagesRef.current.length - 1;
  };
  const updateMessage = (idx: number, content: string) => {
    const next = messagesRef.current.slice();
    next[idx] = { ...next[idx], content };
    replaceMessages(next);
  };

  // Restore a conversation from this browser session.
  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      replaceMessages(stored.messages);
      setPreviews(stored.previews);
      Object.values(stored.previews)
        .flat()
        .forEach((p) => fetchedSlugsRef.current.add(p.slug));
      if (stored.mode === "chat") {
        setConversationRequested(true);
        setMode("chat");
      }
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) return;
    if (messages.length > 1) saveStored({ messages, previews, mode });
    else clearStored();
  }, [restored, messages, previews, mode]);

  // Page-level layout switch.
  useEffect(() => {
    document.documentElement.toggleAttribute(CHAT_ATTR, mode === "chat");
    return () => {
      document.documentElement.removeAttribute(CHAT_ATTR);
    };
  }, [mode]);

  // Slide the input between its two homes (FLIP), and land the page where
  // the reader expects: the latest message in chat, the top at home.
  useLayoutEffect(() => {
    if (mode === "chat") scrollPageToBottom("auto");
    else window.scrollTo({ top: 0, behavior: "auto" });

    const from = flipFromRef.current;
    flipFromRef.current = null;
    const dock = dockRef.current;
    if (!from || !dock || prefersReducedMotion()) return;
    const to = dock.getBoundingClientRect();
    const dy = from.top - to.top;
    if (Math.abs(dy) < 1) return;
    dock.animate(
      [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
      { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
    conversationRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      delay: 120,
      fill: "backwards",
    });
  }, [mode]);

  // Scrolling belongs to the reader. The page moves by itself only when the
  // conversation is (re)entered (above) and when a question is sent: the
  // latest exchange is at least a screen tall, so going to the bottom lands
  // the question at the top of the view and the answer streams in below it.
  const lastRole = messages[messages.length - 1]?.role;
  useEffect(() => {
    if (mode === "chat" && lastRole === "user") scrollPageToBottom("smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Show the "more below" button whenever the end is out of view, including
  // while an answer grows underneath a reader who stays put.
  useEffect(() => {
    if (mode !== "chat") {
      setMoreBelow(false);
      return;
    }
    const check = () => {
      const doc = document.documentElement;
      setMoreBelow(
        doc.scrollHeight - (window.innerHeight + window.scrollY) > 64,
      );
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    const observer = new ResizeObserver(check);
    if (conversationRef.current) observer.observe(conversationRef.current);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      observer.disconnect();
    };
  }, [mode, conversationRequested]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    flipFromRef.current = dockRef.current?.getBoundingClientRect() ?? null;
    if (next === "chat") setConversationRequested(true);
    setMode(next);
  };

  // Warm the conversation chunk as soon as the visitor shows intent to chat.
  const preload = () => {
    if (!conversationRequested) {
      setConversationRequested(true);
      void loadConversation();
    }
  };

  const fetchPreviews = async (text: string, messageIndex: number) => {
    const newSlugs = extractInternalSlugs(text).filter(
      (s) => !fetchedSlugsRef.current.has(s),
    );
    if (newSlugs.length === 0) return;
    newSlugs.forEach((s) => fetchedSlugsRef.current.add(s));

    const results = await Promise.all(
      newSlugs.map(async (slug) => {
        try {
          const res = await fetch(
            `/api/page-preview?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(document.documentElement.lang)}`,
          );
          if (!res.ok) return null;
          return (await res.json()) as LinkPreview;
        } catch {
          return null;
        }
      }),
    );
    const valid = results.filter(
      (r): r is LinkPreview => r !== null && !!r.title,
    );
    if (valid.length > 0) {
      setPreviews((prev) => ({ ...prev, [messageIndex]: valid }));
    }
  };

  const sendQuestion = async (question: string) => {
    const userMessage = question.trim();
    if (!userMessage || isLoading) return;

    switchMode("chat");
    setInput("");
    appendMessage({ role: "user", content: userMessage });
    setIsLoading(true);

    // The answer streams in as plain text and grows in place. A failure
    // before the first chunk is retried once; one after it keeps what
    // arrived and notes the interruption.
    let answerIdx = -1;
    let raw = "";
    const maxRetries = 1;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: userMessage,
            stream: true,
            locale: document.documentElement.lang,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch response: ${response.status}`);
        }
        const isJson = (response.headers.get("content-type") || "").includes(
          "application/json",
        );
        if (isJson || !response.body) {
          // Non-streaming reply (older server, or a mocked one in tests).
          const data = (await response.json()) as { answer: string };
          raw = data.answer;
          answerIdx = appendMessage({
            role: "assistant",
            content: formatUrlsAsMarkdown(raw),
          });
        } else {
          const reader = response.body
            .pipeThrough(new TextDecoderStream())
            .getReader();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;
            raw += value;
            const content = formatUrlsAsMarkdown(raw);
            if (answerIdx < 0) {
              answerIdx = appendMessage({ role: "assistant", content });
              setStreamingIndex(answerIdx);
            } else {
              updateMessage(answerIdx, content);
            }
          }
        }
        break;
      } catch (error) {
        console.error(
          `Chat error (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error,
        );
        if (answerIdx >= 0) {
          updateMessage(
            answerIdx,
            `${formatUrlsAsMarkdown(raw)}

*${labels.errorMessage}*`,
          );
          break;
        }
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          appendMessage({ role: "assistant", content: labels.errorMessage });
        }
      }
    }

    if (answerIdx >= 0 && raw) {
      void fetchPreviews(formatUrlsAsMarkdown(raw), answerIdx);
    }
    setStreamingIndex(-1);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  const startNewChat = () => {
    replaceMessages(initialMessages);
    setPreviews({});
    fetchedSlugsRef.current.clear();
    switchMode("home");
  };

  const isChat = mode === "chat";
  // The conversation view names the model in the input, not in a separate line.
  const placeholder = isChat
    ? labels.chatPlaceholder.replace("{model}", modelName)
    : labels.inputPlaceholder;
  const iconButton =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-green-400 disabled:opacity-50";

  return (
    <div className="w-full">
      {!isChat && (
        <>
          <div className="flex flex-wrap gap-2">
            {labels.suggestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void sendQuestion(question)}
                onMouseEnter={preload}
                onFocus={preload}
                disabled={isLoading}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm leading-none text-zinc-100 transition-colors hover:border-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </>
      )}

      {isChat && conversationRequested && (
        <div ref={conversationRef} className="pb-44">
          <Suspense fallback={null}>
            <HeroChatConversation
              messages={messages}
              previews={previews}
              isLoading={isLoading}
              streamingIndex={streamingIndex}
              onReady={() => scrollPageToBottom("auto")}
            />
          </Suspense>
        </div>
      )}

      {/* One element in both modes, so the input visibly travels between them. */}
      <div
        ref={dockRef}
        className={
          isChat
            ? "fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black from-75% to-transparent px-4 pt-8 pb-3 sm:px-6"
            : "mt-6"
        }
      >
        <div className={isChat ? "relative mx-auto w-full max-w-[640px]" : ""}>
          {isChat && (
            <button
              type="button"
              onClick={() => scrollPageToBottom("smooth")}
              aria-label={labels.jumpToLatest}
              tabIndex={moreBelow ? 0 : -1}
              className={`absolute bottom-full left-1/2 mb-3 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-zinc-700 bg-zinc-900/90 text-zinc-200 shadow-lg backdrop-blur transition-all duration-200 hover:border-green-500 hover:text-green-400 focus-visible:outline-2 focus-visible:outline-green-400 ${moreBelow ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
            >
              <ArrowDown size={16} aria-hidden="true" />
            </button>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-black py-1.5 pr-1.5 pl-4 transition-colors focus-within:border-green-400">
              <input
                type="text"
                id="hero-chat-input"
                name="hero-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={preload}
                placeholder={placeholder}
                aria-label={placeholder}
                autoComplete="off"
                maxLength={1000}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="grid size-10 flex-none place-items-center rounded-[9px] bg-green-500 text-green-950 transition-colors hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </form>

          {isChat ? (
            <div className="mt-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => switchMode("home")}
                className={iconButton}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                {labels.back}
              </button>
              <span className="flex-1" />
              <button
                type="button"
                onClick={startNewChat}
                disabled={isLoading}
                className={iconButton}
                aria-label={labels.newChat}
              >
                <SquarePen size={14} aria-hidden="true" />
                <span className="hidden sm:inline">{labels.newChat}</span>
              </button>
              <a
                href={`mailto:${siteConfig.email}`}
                className={iconButton}
                aria-label={labels.sendEmail}
              >
                <Mail size={14} aria-hidden="true" />
                <span className="hidden sm:inline">{labels.sendEmail}</span>
              </a>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <p className="text-[13px] text-zinc-400">{labels.note}</p>
              {hasConversation && (
                <button
                  type="button"
                  onClick={() => switchMode("chat")}
                  onMouseEnter={preload}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-green-400 hover:text-green-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
                >
                  {labels.resume}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

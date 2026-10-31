import React, { useState, useRef, lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import type { Message, LinkPreview, HeroChatLabels } from "./hero-chat-types";

// The modal (react-markdown + framer-motion) is only loaded once the visitor
// interacts with the hero input, keeping the initial bundle small.
const loadModal = () => import("./HeroChatModal");
const HeroChatModal = lazy(loadModal);

interface HeroChatProps {
  modelName: string;
  labels: HeroChatLabels;
}

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

    // Strip leading slash
    path = path.replace(/^\//, "");
    // Strip locale prefix
    const firstSegment = path.split("/")[0];
    if (LOCALE_PREFIXES.includes(firstSegment)) {
      path = path.slice(firstSegment.length + 1);
    }
    // Strip trailing slash
    path = path.replace(/\/$/, "");

    // Check if it starts with a known collection prefix
    const prefix = path.split("/")[0];
    if (COLLECTION_PREFIXES.includes(prefix) && path.includes("/")) {
      slugs.push(path);
    }
  }
  return [...new Set(slugs)];
}

export default function HeroChat({ modelName, labels }: HeroChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalRequested, setModalRequested] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: labels.initialMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([]);
  const fetchedSlugsRef = useRef<Set<string>>(new Set());

  // Warm the modal chunk as soon as the visitor shows intent to chat.
  const preloadModal = () => {
    if (!modalRequested) {
      setModalRequested(true);
      void loadModal();
    }
  };

  const fetchPreviews = async (text: string) => {
    const slugs = extractInternalSlugs(text);
    const newSlugs = slugs.filter((s) => !fetchedSlugsRef.current.has(s));
    if (newSlugs.length === 0) return;

    newSlugs.forEach((s) => fetchedSlugsRef.current.add(s));

    const results = await Promise.all(
      newSlugs.map(async (slug) => {
        try {
          const res = await fetch(
            `/api/page-preview?slug=${encodeURIComponent(slug)}`,
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
      setLinkPreviews((prev) => [...prev, ...valid]);
    }
  };

  const sendQuestion = async (question: string) => {
    const userMessage = question.trim();
    if (!userMessage || isLoading) return;

    preloadModal();
    setIsOpen(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setHasInteracted(true);

    const maxRetries = 1;
    let attempt = 0;
    let success = false;

    while (attempt <= maxRetries && !success) {
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch response: ${response.status}`);
        }

        const data = (await response.json()) as { answer: string };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
        fetchPreviews(data.answer);
        success = true;
      } catch (error) {
        console.error(
          `Chat error (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error,
        );
        attempt++;

        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: labels.errorMessage },
          ]);
        }
      }
    }

    setIsLoading(false);
  };

  const handleChatSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  return (
    <>
      <div className="w-full">
        <p className="text-base text-pretty text-zinc-400">{labels.prompt}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {labels.suggestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendQuestion(question)}
              onMouseEnter={preloadModal}
              disabled={isLoading}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm leading-none text-zinc-100 transition-colors hover:border-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="mt-6">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-700 py-1.5 pr-1.5 pl-4 transition-colors focus-within:border-green-400">
            <input
              type="text"
              id="hero-chat-input"
              name="hero-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={preloadModal}
              placeholder={labels.inputPlaceholder}
              aria-label={labels.inputPlaceholder}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="grid size-10 flex-none place-items-center rounded-[9px] bg-green-500 text-green-950 transition-colors hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Start chat"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>

        <p className="mt-3 text-[13px] text-zinc-400">{labels.note}</p>
      </div>

      {modalRequested && (
        <Suspense fallback={null}>
          <HeroChatModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            modelName={modelName}
            labels={labels}
            messages={messages}
            isLoading={isLoading}
            hasInteracted={hasInteracted}
            linkPreviews={linkPreviews}
            input={input}
            onInputChange={setInput}
            onSubmit={handleChatSubmit}
          />
        </Suspense>
      )}
    </>
  );
}

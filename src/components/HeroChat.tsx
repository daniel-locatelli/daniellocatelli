import React, { useState, useRef, lazy, Suspense } from "react";
import { Send, Sparkles } from "lucide-react";
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

  const handleInputSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    preloadModal();
    setIsOpen(true);
    // Don't clear input immediately, pass it to chat handler
    handleChatSubmit(e);
  };

  const handleChatSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
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
            {
              role: "assistant",
              content: labels.errorMessage,
            },
          ]);
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleInputSubmit} className="relative w-full max-w-3xl">
        <div className="relative flex items-center">
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
            className="w-full rounded-full border border-zinc-800 bg-black/50 px-6 py-3 pr-12 text-zinc-200 shadow-sm backdrop-blur-sm transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 rounded-full p-2 text-zinc-100 transition-colors hover:bg-zinc-800 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Start chat"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400">
          <Sparkles size={14} className="text-zinc-400" />
          <span>Powered by {modelName}</span>
        </div>
      </form>

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

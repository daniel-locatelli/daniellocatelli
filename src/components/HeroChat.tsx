import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Send, Loader2, Sparkles, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "../site.config";
import WhatsAppIcon from "@/assets/digital-glyph-white.svg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HeroChatProps {
  modelName: string;
  labels: {
    initialMessage: string;
    inputPlaceholder: string;
    headerTitle: string;
    poweredBy: string;
    errorMessage: string;
    requestQuote: string;
    sendEmail: string;
  };
}

function ChatBubble({
  message,
  isLast,
}: {
  message: Message;
  isLast: boolean;
}) {
  const [display, setDisplay] = useState(
    message.role === "user" ? message.content : "",
  );

  useEffect(() => {
    if (message.role === "user" || !isLast) {
      setDisplay(message.content);
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplay(message.content.slice(0, i + 1));
      i++;
      if (i > message.content.length) {
        clearInterval(intervalId);
      }
    }, 15); // Adjust speed here

    return () => clearInterval(intervalId);
  }, [message.content, message.role, isLast]);

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
          message.role === "user"
            ? "rounded-br-none bg-green-700 text-white"
            : "rounded-bl-none border border-zinc-800 bg-zinc-900 text-zinc-200"
        }`}
      >
        <div className="prose prose-sm max-w-none text-zinc-200">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-400 underline decoration-green-400/30 underline-offset-2 transition-colors hover:decoration-green-400"
                />
              ),
              p: ({ node, ...props }) => (
                <p
                  {...props}
                  className="mb-3 leading-relaxed text-zinc-200 last:mb-0"
                />
              ),
              h1: ({ node, ...props }) => (
                <h1
                  {...props}
                  className="mt-6 mb-4 text-xl font-bold text-zinc-100"
                />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="mt-5 mb-3 font-bold text-zinc-100" />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  {...props}
                  className="mt-4 mb-2 font-semibold text-zinc-100"
                />
              ),
              h4: ({ node, ...props }) => (
                <h4
                  {...props}
                  className="mt-4 mb-2 font-semibold text-zinc-100"
                />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  {...props}
                  className="mb-4 ml-4 list-disc space-y-2 text-zinc-200"
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  {...props}
                  className="mb-4 ml-4 list-decimal space-y-2 text-zinc-200"
                />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="pl-1 text-zinc-200" />
              ),
              strong: ({ node, ...props }) => (
                <strong {...props} className="font-bold text-zinc-100" />
              ),
              em: ({ node, ...props }) => (
                <em {...props} className="text-zinc-300 italic" />
              ),
              del: ({ node, ...props }) => (
                <del {...props} className="text-zinc-500 line-through" />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  {...props}
                  className="border-l-2 border-green-500/50 pl-4 text-zinc-400 italic"
                />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code
                    {...props}
                    className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-green-400"
                  />
                ) : (
                  <pre className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
                    <code {...props} />
                  </pre>
                ),
            }}
          >
            {display}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function HeroChat({ modelName, labels }: HeroChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: labels.initialMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleInputSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsOpen(true);
    // Don't clear input immediately, pass it to chat handler
    handleChatSubmit(e);
  };

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage }),
        });

        if (!response.ok) {
          // If it's a 500 or similar, we might want to retry.
          // If it's 4xx maybe not? But for "resilience" let's retry on any non-ok for now.
          throw new Error(`Failed to fetch response: ${response.status}`);
        }

        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
        success = true;
      } catch (error) {
        console.error(
          `Chat error (attempt ${attempt + 1}/${maxRetries + 1}):`,
          error,
        );
        attempt++;

        if (attempt <= maxRetries) {
          // Wait 1 second before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Final failure
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={labels.inputPlaceholder}
            className="w-full rounded-full border border-zinc-200 bg-white/5 px-6 py-3 pr-12 text-zinc-100 shadow-sm backdrop-blur-sm transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none dark:border-zinc-800 dark:bg-black/50 dark:text-zinc-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 rounded-full p-2 text-zinc-100 transition-colors hover:bg-zinc-100 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800"
            aria-label="Start chat"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
          <Sparkles size={14} className="text-zinc-400" />
          <span>Powered by {modelName}</span>
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="flex h-[650px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-2 animate-pulse rounded-full bg-green-400" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-100">
                      {labels.headerTitle}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {labels.poweredBy} {modelName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 flex-1 space-y-6 overflow-y-auto p-6">
                {messages.map((msg, idx) => (
                  <ChatBubble
                    key={idx}
                    message={msg}
                    isLast={idx === messages.length - 1}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-none border border-zinc-800 bg-zinc-900 px-5 py-4">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="size-2 rounded-full bg-zinc-500"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.2,
                          }}
                          className="size-2 rounded-full bg-zinc-500"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.4,
                          }}
                          className="size-2 rounded-full bg-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-zinc-800 bg-black p-4">
                <AnimatePresence>
                  {hasInteracted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="flex flex-col gap-3 sm:flex-row"
                    >
                      <a
                        href={siteConfig.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-green-400 hover:bg-zinc-900 hover:text-green-400"
                      >
                        <img
                          src={WhatsAppIcon.src}
                          alt="WhatsApp"
                          className="size-4"
                        />
                        {labels.requestQuote}
                      </a>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-green-400 hover:bg-zinc-900 hover:text-green-400"
                      >
                        <Mail size={16} />
                        {labels.sendEmail}
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form
                  onSubmit={handleChatSubmit}
                  className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-2 py-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex size-10 items-center justify-center rounded-full bg-green-700 text-white transition-all hover:bg-green-800 hover:shadow-lg hover:shadow-green-500/20 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

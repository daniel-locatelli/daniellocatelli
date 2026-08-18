import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { X, Send, Loader2, Sparkles, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "../config/site";
import type { Message, LinkPreview, HeroChatLabels } from "./hero-chat-types";
// WhatsApp link temporarily disabled (number cancelled). To restore: uncomment
// this import and the WhatsApp <a> block in the input area, then update
// siteConfig.whatsapp.
// import WhatsAppIcon from "@/assets/ui/digital-glyph-white.svg";

const SITE_DOMAIN = "daniellocatelli.com";

function isInternalHref(href: string): boolean {
  if (href.startsWith("/")) return true;
  try {
    const url = new URL(href);
    return (
      url.hostname === SITE_DOMAIN || url.hostname === `www.${SITE_DOMAIN}`
    );
  } catch {
    return false;
  }
}

function PreviewCard({ preview }: { preview: LinkPreview }) {
  return (
    <motion.a
      href={`/${preview.slug}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative block flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 md:aspect-square md:w-full"
    >
      {preview.coverUrl ? (
        <img
          src={preview.coverUrl}
          alt={preview.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
          <Sparkles size={24} className="text-zinc-600" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <span className="absolute right-0 bottom-0 left-0 p-3 text-xs leading-tight font-medium text-white">
        {preview.title.trim()}
      </span>
    </motion.a>
  );
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

    const words = message.content.split(/(\s+)/);
    let wordIndex = 0;
    const intervalId = setInterval(() => {
      if (wordIndex <= words.length) {
        setDisplay(words.slice(0, wordIndex).join(""));
        wordIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 30); // Adjust speed here

    return () => clearInterval(intervalId);
  }, [message.content, message.role, isLast]);

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed break-words shadow-sm ${
          message.role === "user"
            ? "rounded-br-none bg-green-700 text-white"
            : "rounded-bl-none border border-zinc-800 bg-zinc-900 text-zinc-200"
        }`}
      >
        <div className="prose prose-sm max-w-none text-zinc-200">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => {
                const href = props.href || "";
                const internal = isInternalHref(href);
                return (
                  <a
                    {...props}
                    {...(internal
                      ? {}
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    className="font-medium text-green-400 underline decoration-green-400/30 underline-offset-2 transition-colors hover:decoration-green-400"
                  />
                );
              },
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

export interface HeroChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  labels: HeroChatLabels;
  messages: Message[];
  isLoading: boolean;
  hasInteracted: boolean;
  linkPreviews: LinkPreview[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
}

export default function HeroChatModal({
  isOpen,
  onClose,
  modelName,
  labels,
  messages,
  isLoading,
  hasInteracted,
  linkPreviews,
  input,
  onInputChange,
  onSubmit,
}: HeroChatModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const originalOverflow = html.style.overflow;
    const originalPaddingRight = html.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      html.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      html.style.overflow = originalOverflow;
      html.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const hasPreviews = linkPreviews.length > 0;

  return (
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
            className={`flex h-[650px] w-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl transition-[max-width] duration-300 ${hasPreviews ? "max-w-5xl" : "max-w-3xl"}`}
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
                onClick={onClose}
                aria-label="Close chat"
                className="rounded-full p-2 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile preview strip */}
            <AnimatePresence>
              {hasPreviews && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-zinc-800 md:hidden"
                >
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 flex gap-3 overflow-x-auto p-3">
                    {linkPreviews.map((preview) => (
                      <div
                        key={preview.slug}
                        className="h-24 w-28 flex-shrink-0"
                      >
                        <PreviewCard preview={preview} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area: chat + desktop sidebar */}
            <div className="flex min-h-0 flex-1">
              {/* Chat column */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Messages */}
                <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 flex-1 space-y-6 overflow-y-auto overscroll-contain p-6">
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
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginBottom: 16,
                        }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="flex flex-col gap-3 sm:flex-row"
                      >
                        {/* WhatsApp link temporarily disabled (number
                            cancelled). Restore by updating
                            siteConfig.whatsapp and uncommenting this block
                            + the WhatsAppIcon import at the top of the file.
                        <a
                          href={siteConfig.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-green-400 hover:bg-zinc-900 hover:text-green-400"
                        >
                          <span
                            aria-hidden="true"
                            className="size-4 bg-current"
                            style={{
                              maskImage: `url(${WhatsAppIcon.src})`,
                              WebkitMaskImage: `url(${WhatsAppIcon.src})`,
                              maskSize: "contain",
                              WebkitMaskSize: "contain",
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                            }}
                          />
                          {labels.requestQuote}
                        </a>
                        */}
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
                    onSubmit={onSubmit}
                    className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-2 py-2"
                  >
                    <input
                      type="text"
                      id="hero-chat-modal-input"
                      name="hero-chat-modal-input"
                      value={input}
                      onChange={(e) => onInputChange(e.target.value)}
                      placeholder={labels.inputPlaceholder}
                      aria-label={labels.inputPlaceholder}
                      autoComplete="off"
                      className="flex-1 bg-transparent px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Send message"
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
              </div>

              {/* Desktop sidebar */}
              <AnimatePresence>
                {hasPreviews && (
                  <motion.aside
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 288 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 hidden flex-shrink-0 overflow-y-auto overscroll-contain border-l border-zinc-800 md:block"
                  >
                    <div className="flex flex-col gap-3 p-4">
                      {linkPreviews.map((preview) => (
                        <PreviewCard key={preview.slug} preview={preview} />
                      ))}
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

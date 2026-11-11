import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Streamdown, type Components } from "streamdown";
import "streamdown/styles.css";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Message, PreviewMap, LinkPreview } from "./hero-chat-types";

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

const markdown: Components = {
  a: ({ node, ...props }) => {
    const internal = isInternalHref(props.href || "");
    return (
      <a
        {...props}
        {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="font-medium text-green-400 underline decoration-green-400/30 underline-offset-2 transition-colors hover:decoration-green-400"
      />
    );
  },
  p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0" />,
  h1: ({ node, ...props }) => (
    <h3 {...props} className="mt-6 mb-3 text-lg font-semibold text-zinc-100" />
  ),
  h2: ({ node, ...props }) => (
    <h3 {...props} className="mt-6 mb-3 text-lg font-semibold text-zinc-100" />
  ),
  h3: ({ node, ...props }) => (
    <h4 {...props} className="mt-5 mb-2 font-semibold text-zinc-100" />
  ),
  h4: ({ node, ...props }) => (
    <h4 {...props} className="mt-5 mb-2 font-semibold text-zinc-100" />
  ),
  ul: ({ node, ...props }) => (
    <ul {...props} className="mb-4 ml-5 list-disc space-y-1.5" />
  ),
  ol: ({ node, ...props }) => (
    <ol {...props} className="mb-4 ml-5 list-decimal space-y-1.5" />
  ),
  li: ({ node, ...props }) => <li {...props} className="pl-1" />,
  strong: ({ node, ...props }) => (
    <strong {...props} className="font-semibold text-zinc-100" />
  ),
  em: ({ node, ...props }) => <em {...props} className="text-zinc-400" />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      {...props}
      className="border-l-2 border-green-500/50 pl-4 text-zinc-400 italic"
    />
  ),
  inlineCode: ({ node, ...props }) => (
    <code
      {...props}
      className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[0.85em] text-green-400"
    />
  ),
  pre: ({ node, ...props }) => (
    <pre
      {...props}
      className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 font-mono text-xs text-zinc-300"
    />
  ),
};

/** Reading pace while the reveal is caught up with the stream (characters per second). */
const BASE_CPS = 80;
/** The reveal speeds up so it never trails the stream by more than about this many seconds. */
const MAX_LAG_S = 8;
/** One whole word and the whitespace after it. */
const WORD = /\s*\S+(\s+|$)/y;

/**
 * Reveal a streamed answer at a steady reading pace, one whole word at a
 * time. Network chunks arrive in bursts and often end mid-word; revealing
 * only complete words keeps lines from reflowing as a word grows.
 */
function useSmoothText(target: string, streaming: boolean) {
  const [shown, setShown] = useState(() => (streaming ? "" : target));
  const [revealing, setRevealing] = useState(streaming);
  const targetRef = useRef(target);
  const streamingRef = useRef(streaming);
  targetRef.current = target;
  streamingRef.current = streaming;

  useEffect(() => {
    if (!revealing) return;
    let shownLen = 0;
    let budget = 0;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const t = targetRef.current;
      const dt = (now - last) / 1000;
      last = now;
      budget += Math.max(BASE_CPS, (t.length - shownLen) / MAX_LAG_S) * dt;
      for (;;) {
        WORD.lastIndex = shownLen;
        const m = WORD.exec(t);
        if (!m || m[0].length === 0) break;
        const end = shownLen + m[0].length;
        // A last word with nothing after it may still be growing.
        if (end === t.length && !m[1] && streamingRef.current) break;
        if (m[0].length > budget) break;
        budget -= m[0].length;
        shownLen = end;
      }
      setShown(t.slice(0, shownLen));
      if (!streamingRef.current && shownLen >= t.length) {
        setRevealing(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [revealing]);

  return { text: revealing ? shown : target, revealing };
}

function AssistantMessage({
  content,
  streaming,
}: {
  content: string;
  streaming: boolean;
}) {
  const { text, revealing } = useSmoothText(content, streaming);
  return (
    <div className="text-[15px] leading-relaxed break-words text-zinc-200">
      <Streamdown
        components={markdown}
        isAnimating={revealing}
        animated={{ animation: "fadeIn", duration: 400, easing: "ease-out" }}
        controls={false}
        linkSafety={{ enabled: false }}
      >
        {text}
      </Streamdown>
    </div>
  );
}

function PreviewCard({ preview }: { preview: LinkPreview }) {
  return (
    <a
      href={preview.href ?? `/${preview.slug}`}
      className="group relative block h-24 w-36 flex-none overflow-hidden rounded-lg border border-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
    >
      {preview.coverUrl ? (
        <img
          src={preview.coverUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-900">
          <Sparkles size={20} className="text-zinc-600" aria-hidden="true" />
        </div>
      )}
      {/* Title hidden until hover or keyboard focus; on touch screens, which
          cannot hover, it stays visible. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100" />
      <span className="absolute inset-x-0 bottom-0 p-2 text-xs leading-tight font-medium text-white transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
        {preview.title.trim()}
      </span>
    </a>
  );
}

export interface ImageLabels {
  enlarge: string;
  close: string;
  /** Carousel arrows over the link cards. */
  previous: string;
  next: string;
  /** Caption template per section; {title} becomes the page link. */
  coverOf: Record<string, string>;
}

/**
 * The link cards in one row. When they overflow, the row snaps card by card,
 * hides its scrollbar, and shows an arrow (plus an edge fade) on each side
 * that has more cards. Swipe and trackpad scrolling still work.
 */
function CardCarousel({
  list,
  labels,
}: {
  list: LinkPreview[];
  labels: ImageLabels;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () =>
      setEdges({
        start: row.scrollLeft > 1,
        end: row.scrollLeft + row.clientWidth < row.scrollWidth - 1,
      });
    update();
    row.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [list.length]);

  const page = (dir: 1 | -1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-zinc-200 shadow-lg transition-colors hover:border-green-500 hover:text-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400";

  return (
    <div className="relative mt-4">
      <div
        ref={rowRef}
        className="-mx-1 flex snap-x snap-mandatory scroll-px-1 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((p) => (
          <div key={p.slug} className="snap-start">
            <PreviewCard preview={p} />
          </div>
        ))}
      </div>
      {edges.start && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black to-transparent" />
          <button
            type="button"
            aria-label={labels.previous}
            onClick={() => page(-1)}
            className={`${arrow} -left-3`}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </>
      )}
      {edges.end && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
          <button
            type="button"
            aria-label={labels.next}
            onClick={() => page(1)}
            className={`${arrow} -right-3`}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

/**
 * The first linked page's cover, full width (capped in height on phones),
 * with its title as a caption underneath. The image opens full screen; the
 * caption links to the page.
 */
function FeaturedPreview({
  preview,
  labels,
}: {
  preview: LinkPreview;
  labels: ImageLabels;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const title = preview.title.trim();
  // "Cover of the project {title}", by the section the page lives in.
  const template = labels.coverOf[preview.slug.split("/")[0]] ?? "{title}";
  const [before, after = ""] = template.split("{title}");
  return (
    <figure className="mt-6">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`${labels.enlarge}: ${title}`}
        aria-haspopup="dialog"
        className="block w-full cursor-zoom-in overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
      >
        <img
          src={preview.coverUrl}
          alt=""
          width={preview.width}
          height={preview.height}
          loading="lazy"
          className="block h-auto max-h-[75svh] w-full object-cover"
        />
      </button>
      <figcaption className="mt-2 text-center text-sm text-zinc-400">
        {before}
        <a
          href={preview.href ?? `/${preview.slug}`}
          className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-green-400 hover:decoration-green-400 focus-visible:text-green-400"
        >
          {title}
        </a>
        {after}
      </figcaption>
      {/* Native modal: Escape closes it and focus returns to the button. */}
      <dialog
        ref={dialogRef}
        aria-label={title}
        onClick={() => dialogRef.current?.close()}
        className="m-0 h-full max-h-none w-full max-w-none cursor-zoom-out items-center justify-center bg-transparent p-0 backdrop:bg-black/90 backdrop:backdrop-blur-sm open:flex"
      >
        <button
          type="button"
          aria-label={labels.close}
          className="absolute top-4 right-4 z-10 cursor-pointer text-3xl text-white/70 transition hover:text-white"
        >
          &times;
        </button>
        <img
          src={preview.coverUrl}
          alt={title}
          className="max-h-[90vh] max-w-[90vw] rounded object-contain"
        />
      </dialog>
    </figure>
  );
}

function Previews({
  list,
  imageLabels,
}: {
  list: LinkPreview[];
  imageLabels: ImageLabels;
}) {
  const featured = list.find((p) => p.coverUrl);
  const rest = list.filter((p) => p !== featured);
  return (
    <>
      {featured && <FeaturedPreview preview={featured} labels={imageLabels} />}
      {rest.length ? <CardCarousel list={rest} labels={imageLabels} /> : null}
    </>
  );
}

export interface HeroChatConversationProps {
  messages: Message[];
  previews: PreviewMap;
  isLoading: boolean;
  /** Index of the answer still streaming in, or -1. */
  streamingIndex: number;
  /** Shown once, under the latest answer when it has finished. */
  disclaimer: string;
  imageLabels: ImageLabels;
  /** Called once the view has rendered, so the page can land on the latest message. */
  onReady: () => void;
}

export default function HeroChatConversation({
  messages,
  previews,
  isLoading,
  streamingIndex,
  disclaimer,
  imageLabels,
  onReady,
}: HeroChatConversationProps) {
  useLayoutEffect(() => {
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The thinking dots cover the wait before the first streamed chunk only.
  const awaitingFirstChunk =
    isLoading && messages[messages.length - 1]?.role === "user";

  const lastIdx = messages.length - 1;
  const showDisclaimer = !isLoading && messages[lastIdx]?.role === "assistant";

  const renderMessage = (msg: Message, idx: number) =>
    msg.role === "user" ? (
      <div key={idx} className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl bg-zinc-800/80 px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-zinc-100">
          {msg.content}
        </p>
      </div>
    ) : (
      <div key={idx}>
        <AssistantMessage
          content={msg.content}
          streaming={idx === streamingIndex}
        />
        {previews[idx]?.length ? <Previews list={previews[idx]} imageLabels={imageLabels} /> : null}
        {showDisclaimer && idx === lastIdx && (
          <p className="mt-6 text-xs leading-relaxed text-zinc-500">
            {disclaimer}
          </p>
        )}
      </div>
    );

  // The latest exchange gets at least a screen of room, so sending a
  // question scrolls it to the top of the view (like claude.ai) and the
  // answer fills in below it without moving the page.
  let lastUser = -1;
  messages.forEach((m, i) => {
    if (m.role === "user") lastUser = i;
  });
  // From the second question on (the first sits at the top already).
  const pinLastTurn = lastUser > 0;
  const earlier = pinLastTurn ? messages.slice(0, lastUser) : messages;
  const lastTurn = pinLastTurn ? messages.slice(lastUser) : [];

  const dots = awaitingFirstChunk && (
    <div className="flex gap-1.5 py-2" aria-label="Thinking">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="size-2 animate-pulse rounded-full bg-zinc-500"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8" aria-live="polite" aria-busy={isLoading}>
      {earlier.map((m, i) => renderMessage(m, i))}
      {pinLastTurn ? (
        <div className="min-h-[calc(100dvh-18rem)] space-y-8">
          {lastTurn.map((m, i) => renderMessage(m, lastUser + i))}
          {dots}
        </div>
      ) : (
        dots
      )}
    </div>
  );
}

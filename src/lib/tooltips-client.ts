/**
 * Shared hover/focus tooltips (shadcn-style), used by the Map of Knowledge
 * icons, the footer social links and markdown footnotes.
 *
 * Markup contract:
 *   <a data-tooltip="my-tip">trigger</a>
 *   <span id="my-tip" class="tooltip" role="tooltip" popover="manual">
 *     text <span class="tooltip-arrow"></span>
 *   </span>
 *
 * The tooltip is promoted into the browser top layer via the Popover API, so
 * it escapes any ancestor overflow clipping. This module positions it above
 * the trigger (flipping below when there is no room), clamps it to the
 * viewport and aligns the arrow with the trigger centre. Chrome (colours,
 * animation) lives in src/styles/global.css under `.tooltip`.
 */

const OPEN_DELAY = 80;
const CLOSE_DELAY = 100;
const MARGIN = 8;
const ARROW_INSET = 14;

let controller: AbortController | undefined;

function hideAll(except?: HTMLElement) {
  document
    .querySelectorAll<HTMLElement>(".tooltip:popover-open")
    .forEach((el) => {
      if (el !== except) {
        try {
          el.hidePopover();
        } catch {}
      }
    });
}

function position(trigger: HTMLElement, tooltip: HTMLElement) {
  const r = trigger.getBoundingClientRect();
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  const arrow = tooltip.querySelector<HTMLElement>(".tooltip-arrow");
  const arrowH = arrow ? arrow.offsetHeight / 2 : 0;
  const gap = MARGIN + arrowH;

  let left = r.left + r.width / 2 - tw / 2;
  left = Math.max(MARGIN, Math.min(left, window.innerWidth - tw - MARGIN));

  let top = r.top - th - gap;
  let side: "top" | "bottom" = "top";
  if (top < MARGIN) {
    top = r.bottom + gap;
    side = "bottom";
  }

  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
  tooltip.dataset.side = side;

  if (arrow) {
    const centre = r.left + r.width / 2 - left;
    const x = Math.max(ARROW_INSET, Math.min(centre, tw - ARROW_INSET));
    arrow.style.left = `${Math.round(x)}px`;
  }
}

function bind(trigger: HTMLElement, tooltip: HTMLElement, signal: AbortSignal) {
  // Defensive: ensure the popover attribute is present even if it was dropped
  // during HTML serialization. Without it showPopover() throws.
  tooltip.setAttribute("popover", "manual");

  let openTimer: number | undefined;
  let closeTimer: number | undefined;

  const clearTimers = () => {
    if (openTimer !== undefined) window.clearTimeout(openTimer);
    if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    openTimer = closeTimer = undefined;
  };

  const open = () => {
    clearTimers();
    hideAll(tooltip);
    try {
      if (!tooltip.matches(":popover-open")) tooltip.showPopover();
    } catch {
      return;
    }
    position(trigger, tooltip);
  };

  const queueOpen = () => {
    clearTimers();
    openTimer = window.setTimeout(open, OPEN_DELAY);
  };

  const queueClose = () => {
    clearTimers();
    closeTimer = window.setTimeout(() => {
      try {
        tooltip.hidePopover();
      } catch {}
    }, CLOSE_DELAY);
  };

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    queueOpen();
  };

  trigger.addEventListener("pointerenter", onPointerEnter, { signal });
  trigger.addEventListener("pointerleave", queueClose, { signal });
  trigger.addEventListener("focus", open, { signal });
  trigger.addEventListener("blur", queueClose, { signal });
  // Keep the tooltip open while the cursor is over it (footnotes contain links).
  tooltip.addEventListener("pointerenter", clearTimers, { signal });
  tooltip.addEventListener("pointerleave", queueClose, { signal });
}

export function setupTooltips() {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document
    .querySelectorAll<HTMLElement>("[data-tooltip]")
    .forEach((trigger) => {
      const id = trigger.dataset.tooltip;
      const tooltip = id ? document.getElementById(id) : null;
      if (!tooltip) return;
      bind(trigger, tooltip, signal);
    });

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") hideAll();
    },
    { signal },
  );
  // Positions are fixed-viewport coordinates; rather than tracking the
  // trigger while it moves, simply dismiss on scroll/resize.
  window.addEventListener("scroll", () => hideAll(), { signal, passive: true });
  window.addEventListener("resize", () => hideAll(), { signal, passive: true });
}

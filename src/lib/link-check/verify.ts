/**
 * The verification ladder.
 *
 * lychee only nominates suspects. Bot-protected hosts refuse CI runners even
 * when their pages are perfectly healthy: food4rhino.com answers 403 to a
 * default-UA HEAD on its own homepage. Reporting that as a dead link is a
 * false positive that erodes trust in the whole pipeline, and it is the
 * worst failure mode for this project: it sends a human off editing content
 * that was never broken.
 *
 * The first real run proved this out. Every 404 it found was a genuine dead
 * link, but every 403 and every 999 (LinkedIn's bot-block code) was a false
 * alarm: academic publishers (doi.org, Wiley, Science.org, ResearchGate,
 * MDPI, ETH Research Collection) and social networks like LinkedIn block
 * automated requests to deep pages while happily serving their homepage.
 * A live origin root beside a failing page is evidence the HOST is up, not
 * evidence the PAGE is gone.
 *
 * So `confirmed-broken` is reserved for the only two statuses that are
 * unambiguous "this resource no longer exists" signals: 404 and 410.
 * Everything else that fails (403, 999, 429, 401, 5xx, network errors, or
 * anything else non-2xx/3xx) becomes `unverifiable`, no matter what the
 * origin root does. The origin-root probe is kept only to make the reason
 * string more useful for a human doing the manual look, never to change the
 * verdict.
 */

export const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export type Verdict = "alive" | "confirmed-broken" | "unverifiable";

export interface ProbeResult {
  status: number | null;
  finalUrl: string | null;
  error?: string;
}

export type Probe = (
  url: string,
  method: "HEAD" | "GET",
) => Promise<ProbeResult>;

export interface Outcome {
  url: string;
  verdict: Verdict;
  status: number | null;
  finalUrl: string | null;
  reason: string;
}

/** Any 2xx or 3xx counts as reachable. */
function isSuccess(status: number | null): boolean {
  return status !== null && status >= 200 && status < 400;
}

function isGone(status: number | null): boolean {
  return status === 404 || status === 410;
}

export async function verifyUrl(url: string, probe: Probe): Promise<Outcome> {
  let origin: string;
  try {
    origin = new URL(url).origin + "/";
  } catch {
    return {
      url,
      verdict: "unverifiable",
      status: null,
      finalUrl: null,
      reason: "malformed URL",
    };
  }

  // Rung 1: HEAD with a browser user agent.
  const head = await probe(url, "HEAD");
  if (isSuccess(head.status)) {
    return {
      url,
      verdict: "alive",
      status: head.status,
      finalUrl: head.finalUrl,
      reason: "HEAD succeeded",
    };
  }

  // Rung 2: many hosts reject HEAD outright, so retry as GET.
  const get = await probe(url, "GET");
  if (isSuccess(get.status)) {
    return {
      url,
      verdict: "alive",
      status: get.status,
      finalUrl: get.finalUrl,
      reason: "GET succeeded after HEAD failed",
    };
  }

  if (isGone(get.status) || isGone(head.status)) {
    const status = isGone(get.status) ? get.status : head.status;
    return {
      url,
      verdict: "confirmed-broken",
      status,
      finalUrl: get.finalUrl,
      reason: `server returned ${status}`,
    };
  }

  // Neither rung produced a definitive gone signal. The status alone (403,
  // 999, 429, 401, 5xx, or a network error) cannot distinguish "dead page"
  // from "host is blocking us", so this can never be confirmed-broken.
  // Probe the origin root only to make the reason string more informative.
  const root = await probe(origin, "GET");
  const pageDetail = get.status ?? get.error ?? "no response";
  if (isSuccess(root.status)) {
    return {
      url,
      verdict: "unverifiable",
      status: get.status,
      finalUrl: get.finalUrl,
      reason: `page returned ${pageDetail} while origin root answered ${root.status}, the host is likely blocking automated requests`,
    };
  }

  const rootDetail = root.status ?? root.error ?? "unreachable";
  return {
    url,
    verdict: "unverifiable",
    status: get.status,
    finalUrl: get.finalUrl,
    reason: `page returned ${pageDetail} and origin root also failed (${rootDetail}), host is likely down or blocking`,
  };
}

/** The real network probe: browser UA, redirects followed, bounded timeout. */
export function createProbe(timeoutMs = 25_000): Probe {
  return async (url, method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": BROWSER_UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      return { status: response.status, finalUrl: response.url || url };
    } catch (error) {
      const message =
        error instanceof Error ? error.name + ": " + error.message : "unknown";
      return { status: null, finalUrl: null, error: message };
    } finally {
      clearTimeout(timer);
    }
  };
}

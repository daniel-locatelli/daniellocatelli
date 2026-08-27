/**
 * The verification ladder.
 *
 * lychee only nominates suspects. Bot-protected hosts refuse CI runners even
 * when their pages are perfectly healthy: food4rhino.com answers 403 to a
 * default-UA HEAD on its own homepage. Reporting that as a dead link is a
 * false positive that erodes trust in the whole pipeline.
 *
 * So each nominated URL is retested with a browser user agent, and when it
 * still fails we probe the origin root. A live root beside a dead page means
 * the page is genuinely gone; a dead root means the host is refusing us and
 * the result is unknowable from CI.
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

  // Rung 3: is the host refusing us, or is this page really gone?
  const root = await probe(origin, "GET");
  if (isSuccess(root.status)) {
    return {
      url,
      verdict: "confirmed-broken",
      status: get.status,
      finalUrl: get.finalUrl,
      reason: `page returned ${get.status ?? get.error ?? "no response"} while origin root answered ${root.status}`,
    };
  }

  const detail = get.error ?? root.error ?? "unreachable";
  return {
    url,
    verdict: "unverifiable",
    status: get.status,
    finalUrl: get.finalUrl,
    reason: `page returned ${get.status ?? detail} and origin root also failed (${root.status ?? detail}), host is likely bot-walled or down`,
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

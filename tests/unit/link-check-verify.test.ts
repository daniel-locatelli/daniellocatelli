import { test } from "node:test";
import assert from "node:assert/strict";
import {
  verifyUrl,
  type Probe,
  type ProbeResult,
} from "../../src/lib/link-check/verify";

/** Build a probe that answers from a lookup table keyed by "METHOD url". */
function fakeProbe(table: Record<string, ProbeResult>): Probe {
  return async (url, method) => {
    const hit = table[`${method} ${url}`];
    if (hit) return hit;
    return { status: null, finalUrl: null, error: "no stub" };
  };
}

const ok = (url: string): ProbeResult => ({ status: 200, finalUrl: url });

test("alive when HEAD succeeds", async () => {
  const probe = fakeProbe({
    "HEAD https://example.com/a": ok("https://example.com/a"),
  });
  const out = await verifyUrl("https://example.com/a", probe);
  assert.equal(out.verdict, "alive");
  assert.equal(out.status, 200);
});

test("doi.org shape: a 3xx from HEAD is already success, no GET needed", async () => {
  const url = "https://doi.org/10.1016/j.autcon.2021.103571";
  let getCalled = false;
  const probe: Probe = async (target, method) => {
    if (method === "GET") getCalled = true;
    return { status: 302, finalUrl: target };
  };
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "alive");
  assert.equal(out.status, 302);
  // The ladder must stop at rung 1 rather than spending a second request.
  assert.equal(getCalled, false);
});

test("a host that rejects HEAD but serves GET is alive", async () => {
  const url = "https://picky.example/page";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 405, finalUrl: url },
    [`GET ${url}`]: { status: 200, finalUrl: url },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "alive");
  assert.match(out.reason, /GET succeeded/);
});

test("nanotourism/achimmenges shape: page 404 with a live origin root is confirmed broken", async () => {
  const url = "https://www.achimmenges.net/?p=4866";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 404, finalUrl: url },
    [`GET ${url}`]: { status: 404, finalUrl: url },
    "GET https://www.achimmenges.net/": ok("https://www.achimmenges.net/"),
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
  assert.equal(out.status, 404);
});

test("a 410 is confirmed broken", async () => {
  const url = "https://example.com/removed";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 410, finalUrl: url },
    [`GET ${url}`]: { status: 410, finalUrl: url },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
});

test("REGRESSION: doi.org-to-Wiley shape, a 403 with a live origin root must be unverifiable, not confirmed-broken", async () => {
  const url = "https://doi.org/10.1002/ad.1950";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 403, finalUrl: url },
    [`GET ${url}`]: { status: 403, finalUrl: url },
    "GET https://doi.org/": ok("https://doi.org/"),
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
  assert.equal(out.status, 403);
  assert.match(out.reason, /origin root/);
});

test("LinkedIn shape: a 999 bot-block with a live origin root is unverifiable", async () => {
  const url = "https://www.linkedin.com/in/daniel-locatelli";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 999, finalUrl: url },
    [`GET ${url}`]: { status: 999, finalUrl: url },
    "GET https://www.linkedin.com/": ok("https://www.linkedin.com/"),
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
  assert.equal(out.status, 999);
  assert.match(out.reason, /origin root/);
});

test("bot-walled host: page 403 and root also failing (host down or blocking) is unverifiable", async () => {
  const url = "https://walled.example/page";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 403, finalUrl: url },
    [`GET ${url}`]: { status: 403, finalUrl: url },
    "GET https://walled.example/": { status: 403, finalUrl: null },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
  assert.match(out.reason, /host is likely down or blocking/);
});

test("404 is confirmed broken without probing the root", async () => {
  const url = "https://example.com/gone";
  let rootProbed = false;
  const probe: Probe = async (target, method) => {
    if (target === "https://example.com/") rootProbed = true;
    if (method === "HEAD") return { status: 404, finalUrl: target };
    return { status: 404, finalUrl: target };
  };
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
  assert.equal(rootProbed, false);
});

test("network error on both page and root is unverifiable, never throws", async () => {
  const url = "https://down.example/page";
  const probe: Probe = async () => ({
    status: null,
    finalUrl: null,
    error: "ENOTFOUND",
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
  assert.match(out.reason, /ENOTFOUND|unreachable/);
});

test("a malformed url is unverifiable rather than a crash", async () => {
  const probe = fakeProbe({});
  const out = await verifyUrl("not a url", probe);
  assert.equal(out.verdict, "unverifiable");
});

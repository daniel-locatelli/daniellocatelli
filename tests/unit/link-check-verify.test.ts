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

test("food4rhino shape: page 403 but origin root 200, so confirmed broken", async () => {
  const url = "https://www.food4rhino.com/en/app/dloft";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 403, finalUrl: url },
    [`GET ${url}`]: { status: 403, finalUrl: url },
    "GET https://www.food4rhino.com/": ok("https://www.food4rhino.com/en"),
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
  assert.equal(out.status, 403);
  assert.match(out.reason, /origin root/);
});

test("bot-walled host: page and root both refuse, so unverifiable", async () => {
  const url = "https://walled.example/page";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 403, finalUrl: url },
    [`GET ${url}`]: { status: 403, finalUrl: url },
    "GET https://walled.example/": { status: 403, finalUrl: null },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
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

test("410 is confirmed broken", async () => {
  const url = "https://example.com/removed";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 410, finalUrl: url },
    [`GET ${url}`]: { status: 410, finalUrl: url },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
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

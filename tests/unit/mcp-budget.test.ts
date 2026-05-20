import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAndIncrementBudget, todayKey, type KVNamespaceLike } from "../../src/lib/mcp/budget";

class FakeKV implements KVNamespaceLike {
  store = new Map<string, string>();
  reads = 0;
  writes = 0;
  async get(k: string) {
    this.reads++;
    return this.store.get(k) ?? null;
  }
  async put(k: string, v: string) {
    this.writes++;
    this.store.set(k, v);
  }
}

test("todayKey: yields mcp:budget:YYYY-MM-DD", () => {
  const key = todayKey(new Date("2026-05-20T12:34:56Z"));
  assert.equal(key, "mcp:budget:2026-05-20");
});

test("budget allows when counter is zero", async () => {
  const kv = new FakeKV();
  const r = await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.5 });
  assert.equal(r.allowed, true);
  assert.equal(r.remaining, 4999);
});

test("budget denies when counter reaches cap", async () => {
  const kv = new FakeKV();
  await kv.put(todayKey(new Date("2026-05-20T00:00:00Z")), "5000");
  const r = await checkAndIncrementBudget({
    kv,
    cap: 5000,
    now: new Date("2026-05-20T12:00:00Z"),
    random: () => 0.5,
  });
  assert.equal(r.allowed, false);
});

test("budget writes to KV with stochastic probability 1/N (writes when random < 1/N)", async () => {
  const kv = new FakeKV();
  await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.05, writeProbability: 0.1 });
  assert.equal(kv.writes, 1, "writes when random < probability");
});

test("budget skips writing when random >= probability", async () => {
  const kv = new FakeKV();
  await kv.put(todayKey(new Date()), "10");
  await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.5, writeProbability: 0.1 });
  assert.equal(kv.writes, 1, "only the seed write happened; no stochastic write");
});

test("budget always writes the first hit of the day to seed the key", async () => {
  const kv = new FakeKV();
  await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.99, writeProbability: 0.1 });
  assert.equal(kv.writes, 1, "first hit always seeds");
});

export interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export function todayKey(now: Date = new Date()): string {
  const iso = now.toISOString();
  return `mcp:budget:${iso.slice(0, 10)}`;
}

export interface BudgetInput {
  kv: KVNamespaceLike;
  cap: number;
  now?: Date;
  random?: () => number;
  /** Probability of writing the increment back to KV. Default 0.1 (≈ 1 write per 10 calls). */
  writeProbability?: number;
}

export interface BudgetResult {
  allowed: boolean;
  remaining: number;
}

export async function checkAndIncrementBudget(input: BudgetInput): Promise<BudgetResult> {
  const now = input.now ?? new Date();
  const random = input.random ?? Math.random;
  const writeProbability = input.writeProbability ?? 0.1;
  const key = todayKey(now);

  const raw = await input.kv.get(key);
  const current = raw == null ? null : Number(raw);
  const counter = Number.isFinite(current as number) ? (current as number) : 0;

  if (counter >= input.cap) {
    return { allowed: false, remaining: 0 };
  }

  const next = counter + 1;
  // Always seed the first hit; afterwards write only stochastically.
  const shouldWrite = raw == null || random() < writeProbability;
  if (shouldWrite) {
    // 36 h TTL ensures the key expires safely after the next UTC day rollover.
    await input.kv.put(key, String(next), { expirationTtl: 60 * 60 * 36 });
  }
  return { allowed: true, remaining: Math.max(0, input.cap - next) };
}

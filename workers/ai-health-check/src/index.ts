import { createMimeMessage } from "mimetext";
import { ProdModelAPIAlias, MODEL_FAMILY_PRIORITY } from "@/config/ai";

interface Env {
  ANTHROPIC_API_KEY: string;
  AI_HEALTH_KV: KVNamespace;
  SEND_EMAIL: SendEmail;
}

interface SendEmail {
  send(message: { rawSize: number; raw: ReadableStream }): Promise<void>;
}

interface AnthropicModel {
  id: string;
  display_name: string;
  created_at: string;
  type: string;
}

interface ModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id: string;
  last_id: string;
}

interface ModelOverride {
  models: string[];
  deprecated: string[];
  updatedAt: number;
}

interface HealthCheckResult {
  timestamp: string;
  allModelsAvailable: boolean;
  availableModels: string[];
  deprecatedModels: string[];
  resolvedReplacements: Record<string, string>;
  syntheticTestPassed: boolean;
  syntheticTestError?: string;
  overrideWritten: boolean;
  emailSent: boolean;
}

interface PreviousStatus {
  deprecatedModels: string[];
  syntheticTestPassed: boolean;
}

type ModelFamily = (typeof MODEL_FAMILY_PRIORITY)[number];

function getModelFamily(modelId: string): ModelFamily | null {
  for (const family of MODEL_FAMILY_PRIORITY) {
    if (modelId.includes(family)) {
      return family;
    }
  }
  return null;
}

async function fetchAllModels(apiKey: string): Promise<AnthropicModel[]> {
  const response = await fetch(
    "https://api.anthropic.com/v1/models?limit=1000",
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Anthropic API error: ${response.status} ${response.statusText}`,
    );
  }

  const data: ModelsResponse = await response.json();
  return data.data;
}

function resolveLatestByFamily(
  models: AnthropicModel[],
  family: ModelFamily,
): AnthropicModel | null {
  const familyModels = models
    .filter((m) => m.id.includes(family))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return familyModels[0] ?? null;
}

async function runSyntheticTest(): Promise<{
  passed: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("https://daniellocatelli.com/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is your name?" }),
    });

    if (!response.ok) {
      return {
        passed: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data: { answer?: string; error?: string } = await response.json();

    if (data.error) {
      return { passed: false, error: data.error };
    }

    if (!data.answer || data.answer.trim().length === 0) {
      return { passed: false, error: "Empty answer received" };
    }

    return { passed: true };
  } catch (err) {
    return {
      passed: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function buildEmailBody(result: HealthCheckResult): string {
  const lines: string[] = [
    "AI Chat Health Check Report",
    "=".repeat(40),
    "",
    `Timestamp: ${result.timestamp}`,
    `All models available: ${result.allModelsAvailable ? "YES" : "NO"}`,
    "",
  ];

  if (result.deprecatedModels.length > 0) {
    lines.push("DEPRECATED MODELS:");
    for (const model of result.deprecatedModels) {
      const replacement = result.resolvedReplacements[model];
      lines.push(`  - ${model} -> ${replacement ?? "NO REPLACEMENT FOUND"}`);
    }
    lines.push("");
  }

  if (result.availableModels.length > 0) {
    lines.push("AVAILABLE MODELS:");
    for (const model of result.availableModels) {
      lines.push(`  - ${model}`);
    }
    lines.push("");
  }

  lines.push(
    `Synthetic test: ${result.syntheticTestPassed ? "PASSED" : "FAILED"}`,
  );
  if (result.syntheticTestError) {
    lines.push(`  Error: ${result.syntheticTestError}`);
  }

  lines.push("");
  lines.push(`Override written to KV: ${result.overrideWritten ? "YES" : "NO"}`);

  return lines.join("\n");
}

async function sendNotificationEmail(
  env: Env,
  subject: string,
  body: string,
): Promise<boolean> {
  try {
    const msg = createMimeMessage();
    msg.setSender({ name: "AI Health Check", addr: "health@daniellocatelli.com" });
    msg.setRecipient("contact@daniellocatelli.com");
    msg.setSubject(subject);
    msg.addMessage({ contentType: "text/plain", data: body });

    const rawEmail = msg.asRaw();
    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(rawEmail);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(rawBytes);
        controller.close();
      },
    });

    await env.SEND_EMAIL.send({ rawSize: rawBytes.byteLength, raw: stream });
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

function shouldSendEmail(
  result: HealthCheckResult,
  previous: PreviousStatus | null,
): { send: boolean; subject: string } {
  // Always send if there are newly deprecated models
  if (result.deprecatedModels.length > 0) {
    const isNew =
      !previous ||
      result.deprecatedModels.some(
        (m) => !previous.deprecatedModels.includes(m),
      );

    if (isNew) {
      return {
        send: true,
        subject: "[Alert] AI Chat Health Check - Model Deprecation Detected",
      };
    }
  }

  // Send if synthetic test failed
  if (!result.syntheticTestPassed) {
    if (!previous || previous.syntheticTestPassed) {
      return {
        send: true,
        subject: "[Alert] AI Chat Health Check - Synthetic Test Failed",
      };
    }
  }

  // Send recovery notification
  if (previous) {
    const wasDeprecated = previous.deprecatedModels.length > 0;
    const wasFailing = !previous.syntheticTestPassed;

    if (
      (wasDeprecated && result.deprecatedModels.length === 0) ||
      (wasFailing && result.syntheticTestPassed)
    ) {
      return {
        send: true,
        subject: "[Recovered] AI Chat Health Check - All Systems Normal",
      };
    }
  }

  return { send: false, subject: "" };
}

async function runHealthCheck(env: Env): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const result: HealthCheckResult = {
    timestamp,
    allModelsAvailable: true,
    availableModels: [],
    deprecatedModels: [],
    resolvedReplacements: {},
    syntheticTestPassed: false,
    overrideWritten: false,
    emailSent: false,
  };

  // Step 1: Fetch all models from Anthropic API
  const allModels = await fetchAllModels(env.ANTHROPIC_API_KEY);
  const modelIds = new Set(allModels.map((m) => m.id));

  // Step 2: Check which hardcoded models still exist
  for (const model of ProdModelAPIAlias) {
    if (modelIds.has(model)) {
      result.availableModels.push(model);
    } else {
      result.deprecatedModels.push(model);
      result.allModelsAvailable = false;
    }
  }

  // Step 3: Resolve replacements for deprecated models
  if (result.deprecatedModels.length > 0) {
    for (const deprecated of result.deprecatedModels) {
      const family = getModelFamily(deprecated);
      if (family) {
        const replacement = resolveLatestByFamily(allModels, family);
        if (replacement) {
          result.resolvedReplacements[deprecated] = replacement.id;
        }
      }
    }

    // Build new model list: use replacements for deprecated, keep available ones
    const newModels: string[] = [];
    for (const model of ProdModelAPIAlias) {
      if (result.availableModels.includes(model)) {
        newModels.push(model);
      } else if (result.resolvedReplacements[model]) {
        newModels.push(result.resolvedReplacements[model]);
      }
    }

    // Write override to KV with 48h TTL
    if (newModels.length > 0) {
      const override: ModelOverride = {
        models: newModels,
        deprecated: result.deprecatedModels,
        updatedAt: Date.now(),
      };
      await env.AI_HEALTH_KV.put("model-override", JSON.stringify(override), {
        expirationTtl: 48 * 60 * 60, // 48 hours
      });
      result.overrideWritten = true;
    }
  }

  // Step 4: Synthetic test
  const syntheticResult = await runSyntheticTest();
  result.syntheticTestPassed = syntheticResult.passed;
  result.syntheticTestError = syntheticResult.error;

  // Step 5: Compare with previous status and send email if needed
  let previousStatus: PreviousStatus | null = null;
  try {
    const raw = await env.AI_HEALTH_KV.get("health-check-previous-status");
    if (raw) {
      previousStatus = JSON.parse(raw);
    }
  } catch {
    // Ignore parse errors
  }

  const emailDecision = shouldSendEmail(result, previousStatus);
  if (emailDecision.send) {
    const body = buildEmailBody(result);
    result.emailSent = await sendNotificationEmail(
      env,
      emailDecision.subject,
      body,
    );
  }

  // Step 6: Store health check records
  const currentStatus: PreviousStatus = {
    deprecatedModels: result.deprecatedModels,
    syntheticTestPassed: result.syntheticTestPassed,
  };
  await env.AI_HEALTH_KV.put(
    "health-check-previous-status",
    JSON.stringify(currentStatus),
  );

  await env.AI_HEALTH_KV.put(
    "health-check-latest",
    JSON.stringify(result),
  );

  const dateKey = `health-check-${timestamp.slice(0, 10)}`;
  await env.AI_HEALTH_KV.put(dateKey, JSON.stringify(result), {
    expirationTtl: 30 * 24 * 60 * 60, // 30 days
  });

  return result;
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runHealthCheck(env).catch((err) => {
        console.error("Health check failed:", err);
      }),
    );
  },

  async fetch(_request: Request, env: Env): Promise<Response> {
    try {
      const result = await runHealthCheck(env);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  },
};

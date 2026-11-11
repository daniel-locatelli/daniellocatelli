import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { env as cfEnv } from "cloudflare:workers";
import {
  DevModelAPIAlias,
  ProdModelAPIAlias,
  getSystemPrompt,
} from "@/config/ai";
import { formatUrlsAsMarkdown } from "@/lib/chat-markdown";

interface ModelOverride {
  models: string[];
  deprecated: string[];
  updatedAt: number;
}

/**
 * Read model override from KV, written by the ai-health-check Worker.
 * Returns the override model list if fresh and valid, otherwise null.
 */
async function getModelOverride(env: any): Promise<string[] | null> {
  try {
    const kv = env?.AI_HEALTH_KV;
    if (!kv) return null;

    const raw = await kv.get("model-override");
    if (!raw) return null;

    const override: ModelOverride = JSON.parse(raw);

    // KV TTL handles expiry, but double-check freshness (48h)
    const age = Date.now() - override.updatedAt;
    if (age > 48 * 60 * 60 * 1000) return null;

    if (!Array.isArray(override.models) || override.models.length === 0) {
      return null;
    }

    return override.models;
  } catch {
    return null;
  }
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question, stream: wantsStream } = (await request.json()) as {
      question?: string;
      /** Stream the answer as plain text instead of one JSON reply. */
      stream?: boolean;
    };
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
      });
    }

    const env = cfEnv as unknown as {
      AI_HEALTH_KV?: { get(key: string): Promise<string | null> };
      ANTHROPIC_API_KEY?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
    const ANTHROPIC_API_KEY =
      env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      console.error("Missing Anthropic API key");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 },
      );
    }

    // 1. Get relevant context from Supabase Vector Search
    const supabaseUrl = env?.SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
        },
      );
    }

    const vectorSearchEndpoint = `${supabaseUrl}/functions/v1/vector-search`;
    const vectorSearchResponse = await fetch(vectorSearchEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        query: question,
        match_threshold: 0.4, // Slightly lowered for better recall
        match_count: 15, // Increased for more context
      }),
    });

    if (!vectorSearchResponse.ok) {
      const errorText = await vectorSearchResponse.text();
      console.error("Vector Search Error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve context" }),
        { status: 500 },
      );
    }

    const { documents } = (await vectorSearchResponse.json()) as {
      documents: any[];
    };

    if (import.meta.env.DEV) {
      console.log(
        `Vector search returned ${documents.length} docs:`,
        documents.map((d: any) => d.title).join(", "),
      );
    }

    // Always include core CV context (Timeline + Summary & Skills)
    // so the AI has the full career chronology and identity context.
    // The timeline is a flat chronological list of all CV entries (work,
    // education, teaching, certifications, etc.) that prevents confabulation
    // about career transitions and dates.
    const existingIds = new Set(documents.map((d: any) => d.id));
    try {
      const coreUrl = new URL(`${supabaseUrl}/rest/v1/knowledge_entries`);
      coreUrl.searchParams.set("select", "id,content,url,title,type,metadata");
      coreUrl.searchParams.set(
        "or",
        "(title.ilike.*Timeline*,title.ilike.*Linha do Tempo*,title.ilike.*Zeitleiste*,title.ilike.*Summary*,title.ilike.*Resumo*,title.ilike.*Zusammenfassung*)",
      );
      coreUrl.searchParams.set("type", "eq.cv");
      coreUrl.searchParams.set("limit", "6");

      const coreResponse = await fetch(coreUrl.toString(), {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey!,
        },
      });
      if (coreResponse.ok) {
        const coreDocs = (await coreResponse.json()) as any[];
        if (import.meta.env.DEV) {
          console.log(
            `Core CV context: fetched ${coreDocs.length} docs — ${coreDocs.map((d: any) => d.title).join(", ")}`,
          );
        }
        for (const doc of coreDocs) {
          if (!existingIds.has(doc.id)) {
            documents.unshift(doc); // Prepend core docs so they appear first
            existingIds.add(doc.id);
          }
        }
      } else if (import.meta.env.DEV) {
        console.error(
          `Core CV context fetch failed: ${coreResponse.status} ${await coreResponse.text()}`,
        );
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error("Core CV context error:", e);
      }
      // Non-critical: continue with vector search results only
    }

    const context = documents
      .map((doc: any) => {
        const metadata = doc.metadata || {};
        const links = metadata.links
          ? `\nLinks: ${metadata.links.join(", ")}`
          : "";
        return `[Title: ${doc.title || "Untitled"}, URL: ${doc.url || "N/A"}]${links}\n${doc.content}`;
      })
      .join("\n\n---\n\n");

    // 2. Ask Claude
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const kvOverride = import.meta.env.DEV ? null : await getModelOverride(env);
    const modelsToTry = import.meta.env.DEV
      ? [DevModelAPIAlias]
      : (kvOverride ?? [...ProdModelAPIAlias]);

    const params = {
      max_tokens: 1024,
      system: getSystemPrompt(context),
      messages: [{ role: "user" as const, content: question }],
    };

    if (wantsStream) {
      // Commit to a model only once its stream has produced its first event,
      // so a failing model still falls through to the next one.
      for (const model of modelsToTry) {
        const stream = anthropic.messages.stream({ ...params, model });
        const events = stream[Symbol.asyncIterator]();
        try {
          await events.next();
        } catch (err) {
          console.error(`Error with model ${model}:`, err);
          continue;
        }
        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async pull(controller) {
            try {
              for (;;) {
                const { value, done } = await events.next();
                if (done) {
                  controller.close();
                  return;
                }
                if (
                  value.type === "content_block_delta" &&
                  value.delta.type === "text_delta"
                ) {
                  controller.enqueue(encoder.encode(value.delta.text));
                  return;
                }
              }
            } catch (err) {
              console.error(`Stream error with model ${model}:`, err);
              controller.error(err);
            }
          },
          cancel() {
            stream.abort();
          },
        });
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
            "x-content-type-options": "nosniff",
          },
        });
      }
      console.error("All Claude models failed.");
      return new Response(JSON.stringify({ error: "All models failed" }), {
        status: 502,
      });
    }

    let msg;

    for (const model of modelsToTry) {
      try {
        msg = await anthropic.messages.create({ ...params, model });
        break;
      } catch (err) {
        console.error(`Error with model ${model}:`, err);
      }
    }

    if (!msg) {
      console.error("All Claude models failed.");
      return new Response(
        JSON.stringify({
          error:
            "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.",
        }),
        { status: 500 },
      );
    }

    let answer =
      msg.content[0].type === "text"
        ? msg.content[0].text
        : "I'm sorry, I couldn't process that.";

    // Post-process to ensure all URLs are in markdown format
    answer = formatUrlsAsMarkdown(answer);

    return new Response(JSON.stringify({ answer }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("AI API Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

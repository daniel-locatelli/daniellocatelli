import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import {
  DevModelAPIAlias,
  ProdModelAPIAlias,
  getSystemPrompt,
} from "@/config/ai";

/**
 * Convert bare URLs to markdown format [url](url)
 * Avoids converting URLs that are already in markdown [text](url) format
 */
function formatUrlsAsMarkdown(text: string): string {
  // Match URLs that are NOT already in markdown format
  // This regex avoids matching URLs inside [text](url) patterns
  const urlRegex = /(?<!\]\()(?<!\[)https?:\/\/[^\s\[\]]+/g;
  return text.replace(urlRegex, (url) => `[${url}](${url})`);
}

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
      });
    }

    const env = (locals as any).runtime.env;
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

    const { documents } = await vectorSearchResponse.json();
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

    const modelsToTry = import.meta.env.DEV
      ? [DevModelAPIAlias]
      : ProdModelAPIAlias;

    let msg;

    for (const model of modelsToTry) {
      try {
        msg = await anthropic.messages.create({
          model: model,
          max_tokens: 1024,
          system: getSystemPrompt(context),
          messages: [{ role: "user", content: question }],
        });

        // If we reach here, the call was successful
        break;
      } catch (err) {
        console.error(`Error with model ${model}:`, err);
        // Continue to the next fallback model
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

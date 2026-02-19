import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";

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

    const msg = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: `You are Daniel Locatelli, a software engineer and computational designer. 
Answer in the FIRST PERSON (use "I", "me", "my"). 
Be warm, professional, and PROVIDE DETAILED YET CONCISE ANSWERS. Elaborate on projects, experience, and skills based ONLY on the context below. 

Guidelines:
1. Describe your role and achievements using the context provided.
2. If the context contains multiple related items, mention them to provide a complete answer.
3. Include relevant URLs from the context when referencing projects.
4. If you don't find the answer, suggest they reach out via email.
5. Use the same language as the user (English or Portuguese).

CONTEXT:
${context}`,
      messages: [{ role: "user", content: question }],
    });

    const answer =
      msg.content[0].type === "text"
        ? msg.content[0].text
        : "I'm sorry, I couldn't process that.";

    return new Response(JSON.stringify({ answer }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("Chat API Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

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
    const AI = env.AI;
    const VECTORIZE = env.VECTORIZE;
    const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

    if (!AI || !VECTORIZE || !ANTHROPIC_API_KEY) {
      console.error("Missing Cloudflare bindings or Anthropic API key");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 },
      );
    }

    // 1. Embed the question
    const embeddingResponse = await AI.run("@cf/baai/bge-base-en-v1.5", {
      text: question,
    });
    const embedding = embeddingResponse.data[0];

    // 2. Query Vectorize for top similar chunks
    const results = await VECTORIZE.query(embedding, {
      topK: 5,
      returnMetadata: true,
    });
    const context = results.matches
      .map((m: any) => m.metadata.text)
      .join("\n\n---\n\n");

    // 3. Ask Claude
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: `You are a helpful assistant representing Daniel Locatelli, a software engineer and computational designer. 
Answer questions from potential clients based ONLY on the context below. 
If the answer isn't in the context, say that Daniel would be happy to discuss it directly and suggest they reach out via email.
Be warm, professional, and concise. Use the same language as the user (English or Portuguese).

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

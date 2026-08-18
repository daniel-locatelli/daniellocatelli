import type { APIRoute } from "astro";
import { env as cfEnv } from "cloudflare:workers";
import {
  listProjects,
  listResearch,
  searchContent,
  getPage,
  type SearchEnv,
} from "@/lib/mcp/tools";
import {
  checkAndIncrementBudget,
  type KVNamespaceLike,
} from "@/lib/mcp/budget";

export const prerender = false;

const SEARCH_DAILY_CAP = 5000;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: any;
}

interface JsonRpcResult {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

const LOCALE_SCHEMA = {
  type: "string",
  enum: ["en", "pt", "de"],
  default: "en",
};

const TOOLS = {
  list_projects: {
    description:
      "List portfolio projects with title, summary, URL, and start date.",
    inputSchema: { type: "object", properties: { locale: LOCALE_SCHEMA } },
  },
  list_research: {
    description:
      "List research entries with title, summary, URL, and start date.",
    inputSchema: { type: "object", properties: { locale: LOCALE_SCHEMA } },
  },
  search_content: {
    description:
      "Vector search across all portfolio content. Returns up to 20 matches with title, URL, snippet, and similarity score.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
        locale: LOCALE_SCHEMA,
        limit: { type: "integer", default: 5, minimum: 1, maximum: 20 },
      },
    },
  },
  get_page: {
    description: "Fetch any daniellocatelli.com page as plain markdown.",
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: { url: { type: "string", format: "uri" } },
    },
  },
} as const;

const SERVER_INFO = { name: "daniel-locatelli-portfolio", version: "1.0.0" };
const PROTOCOL_VERSION = "2025-06-18";

// MCP streamable-HTTP spec (2025-06-18) permits either application/json
// (single response) or text/event-stream (multi-message stream). We don't
// stream, so application/json is the correct and spec-compliant choice.
function ok(id: JsonRpcRequest["id"], result: any): Response {
  const payload: JsonRpcResult = { jsonrpc: "2.0", id, result };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function err(
  id: JsonRpcRequest["id"],
  code: number,
  message: string,
): Response {
  const payload: JsonRpcResult = {
    jsonrpc: "2.0",
    id,
    error: { code, message },
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function asContent(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

export const POST: APIRoute = async ({ request }) => {
  let req: JsonRpcRequest;
  try {
    req = (await request.json()) as JsonRpcRequest;
  } catch {
    return err(null, -32700, "Parse error");
  }
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return err(req?.id ?? null, -32600, "Invalid Request");
  }

  const env: any = cfEnv ?? process.env;

  // Lifecycle handshake (MCP 2025-06-18). Stateless: no session IDs.
  if (req.method === "initialize") {
    return ok(req.id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
  }
  if (
    req.method === "notifications/initialized" ||
    req.method.startsWith("notifications/")
  ) {
    return new Response(null, { status: 202 });
  }
  if (req.method === "ping") {
    return ok(req.id, {});
  }

  if (req.method === "tools/list") {
    return ok(req.id, {
      tools: Object.entries(TOOLS).map(([name, meta]) => ({
        name,
        description: meta.description,
        inputSchema: meta.inputSchema,
      })),
    });
  }

  if (req.method !== "tools/call") {
    return err(req.id, -32601, `Method not found: ${req.method}`);
  }

  const name = req.params?.name as keyof typeof TOOLS | undefined;
  const args = (req.params?.arguments ?? {}) as any;
  if (!name || !(name in TOOLS)) {
    return err(req.id, -32602, `Unknown tool: ${String(name)}`);
  }

  try {
    if (name === "list_projects") {
      return ok(req.id, asContent(await listProjects({ locale: args.locale })));
    }
    if (name === "list_research") {
      return ok(req.id, asContent(await listResearch({ locale: args.locale })));
    }
    if (name === "get_page") {
      return ok(req.id, asContent(await getPage({ url: args.url }, { fetch })));
    }
    if (name === "search_content") {
      const kv: KVNamespaceLike | undefined = env?.AI_HEALTH_KV;
      if (!kv) {
        return err(req.id, -32004, "Budget storage unavailable");
      }
      const budget = await checkAndIncrementBudget({
        kv,
        cap: SEARCH_DAILY_CAP,
      });
      if (!budget.allowed) {
        return err(
          req.id,
          -32004,
          "Daily search budget exhausted; try again tomorrow.",
        );
      }
      const searchEnv: SearchEnv = {
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
      };
      const out = await searchContent(
        { query: args.query, limit: args.limit, locale: args.locale },
        { env: searchEnv, fetch },
      );
      return ok(req.id, asContent(out));
    }
  } catch (e) {
    return err(req.id, -32000, `Tool error: ${(e as Error).message}`);
  }

  return err(req.id, -32601, "Unhandled tool");
};

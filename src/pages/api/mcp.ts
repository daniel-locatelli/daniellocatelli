import type { APIRoute } from "astro";
import {
  listProjects,
  listResearch,
  searchContent,
  getProfile,
  getPage,
  isLocale,
} from "@/lib/mcp/tools";
import { PROFILES, profileFor } from "@/lib/chat-profiles";

export const prerender = false;

const MAX_QUERY_LENGTH = 500;

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
      "Keyword search over Daniel Locatelli's profile (roles, education, research, projects, publications, talks). Best for names and topics such as 'DOKwood', 'Revit plugin' or 'timber'; for broad questions about his career, call get_profile instead. Returns up to 20 matches with title, section, URL, snippet, and a 0-1 relevance score.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 1, maxLength: MAX_QUERY_LENGTH },
        locale: LOCALE_SCHEMA,
        limit: { type: "integer", default: 5, minimum: 1, maximum: 20 },
      },
    },
  },
  get_profile: {
    description:
      "Daniel Locatelli's whole profile as one markdown document (about 13k tokens): every role with what he did there, education, and a summary and link for every research page, project, publication and talk. The text the homepage chat answers from; use it for broad questions.",
    inputSchema: { type: "object", properties: { locale: LOCALE_SCHEMA } },
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

const SERVER_INFO = { name: "daniel-locatelli-portfolio", version: "1.1.0" };
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
    if (name === "get_profile") {
      return ok(
        req.id,
        asContent(getProfile({ locale: args.locale }, { profiles: PROFILES })),
      );
    }
    if (name === "search_content") {
      const query = args.query;
      if (
        typeof query !== "string" ||
        !query.trim() ||
        query.length > MAX_QUERY_LENGTH
      ) {
        return err(
          req.id,
          -32602,
          `query must be a non-empty string of at most ${MAX_QUERY_LENGTH} characters`,
        );
      }
      const locale = isLocale(args.locale) ? args.locale : "en";
      const out = searchContent(
        { query, limit: args.limit, locale },
        { profile: profileFor(locale) },
      );
      return ok(req.id, asContent(out));
    }
  } catch (e) {
    return err(req.id, -32000, `Tool error: ${(e as Error).message}`);
  }

  return err(req.id, -32601, "Unhandled tool");
};

import { test, expect } from "@playwright/test";

test.describe("Agent readiness — llms.txt (English)", () => {
  test("/llms.txt returns text/markdown with portfolio sections", async ({
    request,
  }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body).toMatch(/^# Daniel Locatelli\n/);
    expect(body).toContain("\n## Projects\n");
    expect(body).toContain("\n## Research\n");
    expect(body).toContain("\n## Teaching\n");
    expect(body).toContain("\n## Publications\n");
    expect(body).toContain("https://daniellocatelli.com/projects/");
  });
});

test.describe("Agent readiness — discoverability", () => {
  test("robots.txt advertises sitemap and welcomes AI crawlers", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain(
      "Sitemap: https://daniellocatelli.com/sitemap-index.xml",
    );
    expect(body).toContain("Content-Signal:");
    for (const bot of [
      "GPTBot",
      "ClaudeBot",
      "PerplexityBot",
      "Google-Extended",
      "CCBot",
    ]) {
      expect(body, `expected User-agent: ${bot}`).toContain(
        `User-agent: ${bot}`,
      );
    }
  });

  test("root response includes Link header pointing at sitemap", async ({
    request,
  }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const link = res.headers()["link"];
    expect(link, "Link header present").toBeDefined();
    expect(link).toContain("</sitemap-index.xml>");
    expect(link).toContain(`rel="sitemap"`);
  });

  test("root response includes X-Robots-Tag", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-robots-tag"]).toBe("all");
  });
});

test.describe("Agent readiness — llms.txt (locales)", () => {
  for (const locale of ["pt", "de"]) {
    test(`/${locale}/llms.txt returns localized content`, async ({
      request,
    }) => {
      const res = await request.get(`/${locale}/llms.txt`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
      const body = await res.text();
      expect(body).toMatch(/^# Daniel Locatelli\n/);
      expect(body).toContain(`https://daniellocatelli.com/${locale}/projects/`);
    });
  }
});

test.describe("Agent readiness — markdown variants", () => {
  test("project page is reachable at .md and returns text/markdown", async ({
    request,
  }) => {
    const res = await request.get("/projects/buildsystems-website.md");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body).toContain("# ");
    expect(body).toContain("BuildSystems");
  });

  test("portuguese project .md is reachable", async ({ request }) => {
    const res = await request.get("/pt/projects/buildsystems-website.md");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
  });
});

test.describe("Agent readiness — Accept: text/markdown negotiation", () => {
  test("project page with Accept: text/markdown returns markdown at canonical URL", async ({
    request,
  }) => {
    const res = await request.get("/projects/buildsystems-website", {
      headers: { Accept: "text/markdown" },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body).toContain("BuildSystems");
  });

  test("project page with Accept: text/html stays HTML", async ({
    request,
  }) => {
    const res = await request.get("/projects/buildsystems-website", {
      headers: { Accept: "text/html" },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/html/);
  });
});

test.describe("Agent readiness — MCP", () => {
  test("/.well-known/mcp.json declares streamable-http transport and four tools", async ({
    request,
  }) => {
    const res = await request.get("/.well-known/mcp.json");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("daniel-locatelli-portfolio");
    expect(json.transport?.type).toBe("streamable-http");
    expect(json.transport?.url).toBe("https://daniellocatelli.com/api/mcp");
    const names = (json.tools as any[]).map((t) => t.name).sort();
    expect(names).toEqual([
      "get_page",
      "list_projects",
      "list_research",
      "search_content",
    ]);
  });

  test("MCP initialize handshake returns protocol version and server info", async ({
    request,
  }) => {
    const res = await request.post("/api/mcp", {
      data: {
        jsonrpc: "2.0",
        id: 0,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "test", version: "0" },
        },
      },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.result.protocolVersion).toBe("2025-06-18");
    expect(json.result.serverInfo.name).toBe("daniel-locatelli-portfolio");
    expect(json.result.capabilities).toHaveProperty("tools");

    const notif = await request.post("/api/mcp", {
      data: { jsonrpc: "2.0", method: "notifications/initialized" },
    });
    expect(notif.status()).toBe(202);
  });

  test("MCP tools/list returns four tools with input schemas", async ({
    request,
  }) => {
    const res = await request.post("/api/mcp", {
      data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(1);
    const names = (json.result.tools as any[]).map((t) => t.name).sort();
    expect(names).toEqual([
      "get_page",
      "list_projects",
      "list_research",
      "search_content",
    ]);
    for (const t of json.result.tools)
      expect(t.inputSchema?.type).toBe("object");
  });

  test("MCP tools/call list_projects returns project items", async ({
    request,
  }) => {
    const res = await request.post("/api/mcp", {
      data: {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "list_projects", arguments: { locale: "en" } },
      },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    const content = json.result.content;
    expect(Array.isArray(content)).toBe(true);
    const text = content[0].text;
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty("title");
    expect(parsed[0]).toHaveProperty("url");
  });

  test("MCP returns JSON-RPC error for unknown method", async ({ request }) => {
    const res = await request.post("/api/mcp", {
      data: { jsonrpc: "2.0", id: 3, method: "does/not/exist" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.error?.code).toBe(-32601);
  });
});

test.describe("Agent readiness — Agent Skills", () => {
  test("/.well-known/agent-skills/index.json lists skills whose SKILL.md files resolve", async ({
    request,
  }) => {
    const res = await request.get("/.well-known/agent-skills/index.json");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.skills)).toBe(true);
    expect(json.skills.length).toBeGreaterThanOrEqual(2);
    for (const skill of json.skills) {
      expect(skill.type).toBe("skill-md");
      expect(skill.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
      const md = await request.get(skill.url);
      expect(md.status()).toBe(200);
      const body = await md.text();
      expect(body).toMatch(new RegExp(`^---\\r?\\nname: ${skill.name}\\r?\\n`));
    }
  });

  test("/.well-known/api-catalog links the agent-skills index", async ({
    request,
  }) => {
    const res = await request.get("/.well-known/api-catalog");
    const json = await res.json();
    const hrefs = json.linkset[0]["service-desc"].map((d: any) => d.href);
    expect(hrefs).toContain(
      "https://daniellocatelli.com/.well-known/agent-skills/index.json",
    );
  });
});

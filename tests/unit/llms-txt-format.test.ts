import { test } from "node:test";
import assert from "node:assert/strict";
import { formatLlmsTxt, type LlmsTxtEntry } from "../../src/lib/llms-txt-format";

const sample: { sections: { title: string; entries: LlmsTxtEntry[] }[] } = {
  sections: [
    {
      title: "Projects",
      entries: [
        { title: "BuildSystems Website", url: "https://daniellocatelli.com/projects/buildsystems-website", summary: "Astro + Notion CMS portfolio site." },
        { title: "Air Guitar", url: "https://daniellocatelli.com/projects/air-guitar-by-atelier-marko-brajovic-for-nike", summary: "" },
      ],
    },
  ],
};

test("formatLlmsTxt: title + tagline + section headers", () => {
  const out = formatLlmsTxt({
    title: "Daniel Locatelli",
    tagline: "AEC software engineer based in Berlin.",
    sections: sample.sections,
  });
  assert.ok(out.startsWith("# Daniel Locatelli\n"));
  assert.ok(out.includes("> AEC software engineer based in Berlin.\n"));
  assert.ok(out.includes("\n## Projects\n"));
});

test("formatLlmsTxt: each entry is a markdown link, summary appended after colon", () => {
  const out = formatLlmsTxt({
    title: "x",
    tagline: "y",
    sections: sample.sections,
  });
  assert.ok(
    out.includes(
      "- [BuildSystems Website](https://daniellocatelli.com/projects/buildsystems-website): Astro + Notion CMS portfolio site.",
    ),
  );
});

test("formatLlmsTxt: omits colon when summary is empty", () => {
  const out = formatLlmsTxt({
    title: "x",
    tagline: "y",
    sections: sample.sections,
  });
  assert.ok(
    out.includes(
      "- [Air Guitar](https://daniellocatelli.com/projects/air-guitar-by-atelier-marko-brajovic-for-nike)\n",
    ),
  );
  assert.ok(!out.includes("Air Guitar](...): "));
});

test("formatLlmsTxt: trims trailing whitespace per line and ends with single newline", () => {
  const out = formatLlmsTxt({
    title: "x",
    tagline: "y",
    sections: [],
  });
  assert.equal(out.endsWith("\n"), true);
  assert.equal(out.endsWith("\n\n"), false);
});

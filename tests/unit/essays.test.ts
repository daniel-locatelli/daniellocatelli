import { test } from "node:test";
import assert from "node:assert/strict";
import {
  publishedEssays,
  essayHref,
  formatEssayMonth,
} from "../../src/lib/essays";

const entries = [
  { id: "en/older", data: { Name: "Older", DateStart: "2026-11-30" } },
  { id: "en/newer", data: { Name: "Newer", DateStart: "2027-01-31" } },
  { id: "en/_draft", data: { Name: "Draft", DateStart: "2027-02-28" } },
  { id: "en/undated", data: { Name: "Undated" } },
  { id: "pt/older", data: { Name: "Mais antigo", DateStart: "2026-11-30" } },
];

test("publishedEssays: locale only, no drafts, no undated, newest first", () => {
  assert.deepEqual(
    publishedEssays(entries, "en").map((e) => e.id),
    ["en/newer", "en/older"],
  );
  assert.deepEqual(
    publishedEssays(entries, "pt").map((e) => e.id),
    ["pt/older"],
  );
  assert.deepEqual(publishedEssays(entries, "de"), []);
});

test("essayHref: default locale has no prefix", () => {
  assert.equal(essayHref({ id: "en/older" }, "en"), "/essays/older");
  assert.equal(essayHref({ id: "pt/older" }, "pt"), "/pt/essays/older");
  assert.equal(essayHref({ id: "de/older" }, "de"), "/de/essays/older");
});

test("formatEssayMonth: month and year, no timezone drift", () => {
  assert.equal(formatEssayMonth("2026-11-01", "en"), "November 2026");
  assert.equal(formatEssayMonth("2026-11-30", "pt"), "novembro de 2026");
  assert.equal(formatEssayMonth("2026-11-01", "de"), "November 2026");
});

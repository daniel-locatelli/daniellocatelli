import { test } from "node:test";
import assert from "node:assert/strict";
import { entityForCredit, findEntityImages, sourcesHref } from "../../src/lib/entities";

test("findEntityImages: finds md paths and mdx imports, deduplicated", () => {
  const body = [
    "![a](../../../assets/content/entities/ernst-haeckel/spumellaria-wide.png)",
    'import x from "@/assets/content/entities/ernst-haeckel/cyrtoidea.jpg";',
    "![b](../../../assets/content/entities/ernst-haeckel/spumellaria-wide.png \"Caption\")",
    "![c](../../../assets/content/research/other/x.png)",
  ].join("\n");
  assert.deepEqual(findEntityImages(body), [
    { entity: "ernst-haeckel", file: "spumellaria-wide.png" },
    { entity: "ernst-haeckel", file: "cyrtoidea.jpg" },
  ]);
});

test("entityForCredit: matches a credit that starts with the entity name", () => {
  assert.equal(entityForCredit("Ernst Haeckel"), "ernst-haeckel");
  assert.equal(entityForCredit("Ernst Haeckel, engravings by Adolf Giltsch"), "ernst-haeckel");
  assert.equal(entityForCredit("Gui Morelli"), undefined);
  assert.equal(entityForCredit("Ernst Haeckelson"), undefined);
});

test("sourcesHref: prefixes non-default locales", () => {
  assert.equal(sourcesHref("ernst-haeckel", "en", "en"), "/sources/ernst-haeckel");
  assert.equal(sourcesHref("ernst-haeckel", "de", "en"), "/de/sources/ernst-haeckel");
  assert.equal(sourcesHref("", "pt", "en"), "/pt/sources");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { stripCreditMarks } from "../../src/scripts/check-credits";

test("stripCreditMarks: removes the mark from a name inside a copyright block", () => {
  const input = "copyright:\n  name: © Burggraf / Reichert\n  href: \"https://x\"\n";
  const { text, lines } = stripCreditMarks(input);
  assert.equal(text, "copyright:\n  name: Burggraf / Reichert\n  href: \"https://x\"\n");
  assert.deepEqual(lines, [2]);
});

test("stripCreditMarks: handles plain, quoted and list copyright values", () => {
  assert.equal(stripCreditMarks("copyright: © NASA").text, "copyright: NASA");
  assert.equal(stripCreditMarks('copyright: "(c) NASA"').text, 'copyright: "NASA"');
  assert.equal(stripCreditMarks("copyright:\n  - © A\n  - B").text, "copyright:\n  - A\n  - B");
});

test("stripCreditMarks: handles Figure credit props", () => {
  assert.equal(stripCreditMarks('<Figure credit="© Gui Morelli">').text, '<Figure credit="Gui Morelli">');
  assert.equal(stripCreditMarks('<Figure credit={"© A"}>').text, '<Figure credit={"A"}>');
});

test("stripCreditMarks: leaves body text, imports and other name fields alone", () => {
  const input = [
    'import x from "@/assets/a/Production-2 © The Donum Estate.jpg";',
    "© Video by [Eduardo Ohara](https://www.eduardoohara.com/)",
    "author:",
    "  name: © Not a credit",
  ].join("\n");
  assert.deepEqual(stripCreditMarks(input).lines, []);
});

test("stripCreditMarks: a copyright block ends at the next key of equal indent", () => {
  const input = "copyright:\n  name: A\ntitle:\n  name: © B";
  assert.deepEqual(stripCreditMarks(input).lines, []);
});

test("stripCreditMarks: keeps CRLF line endings", () => {
  assert.equal(stripCreditMarks("copyright: © A\r\nx: 1").text, "copyright: A\r\nx: 1");
});

test("stripCreditMarks: handles credit link objects", () => {
  assert.equal(
    stripCreditMarks('<YouTube id="x" credit={{ name: "© A", href: "h" }} />').text,
    '<YouTube id="x" credit={{ name: "A", href: "h" }} />',
  );
});

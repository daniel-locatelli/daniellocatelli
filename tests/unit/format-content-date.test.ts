import { test } from "node:test";
import assert from "node:assert/strict";
import { formatContentDate } from "../../src/lib/utils";

test("keeps source precision", () => {
  assert.equal(formatContentDate("2019", "en"), "2019");
  assert.equal(formatContentDate("2019-03", "en"), "March 2019");
  assert.equal(formatContentDate("2019-03-05", "en"), "5 March 2019");
  assert.equal(
    formatContentDate("2026-08-20T23:45:12+02:00", "en"),
    "20 August 2026",
  );
});

test("localises per site locale", () => {
  assert.equal(formatContentDate("2024-04-27", "pt"), "27 de abril de 2024");
  assert.equal(formatContentDate("2024-04-27", "de"), "27. April 2024");
  assert.equal(formatContentDate("2024-04", "de"), "April 2024");
});

test("returns unparseable input unchanged", () => {
  assert.equal(formatContentDate("Spring 2019", "en"), "Spring 2019");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { figureCaption } from "../../src/lib/figure-caption";

test("alt doubles as the caption when there is no title", () => {
  assert.equal(figureCaption("A wall section", null), "A wall section");
  assert.equal(figureCaption("A wall section", undefined), "A wall section");
});

test('a title of "-" suppresses the visible caption', () => {
  assert.equal(figureCaption("Long verbal description of a diagram", "-"), null);
  assert.equal(figureCaption("Long verbal description of a diagram", " - "), null);
});

test("any other title replaces the alt as the caption", () => {
  assert.equal(figureCaption("Long verbal description", "Figure 3: template to sheet"), "Figure 3: template to sheet");
});

test("no alt and no title yields no caption", () => {
  assert.equal(figureCaption("", null), null);
  assert.equal(figureCaption(null, null), null);
});

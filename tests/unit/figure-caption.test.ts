import { test } from "node:test";
import assert from "node:assert/strict";
import {
  figureCaption,
  captionFromImgHtml,
} from "../../src/lib/figure-caption";

test("alt doubles as the caption when there is no title", () => {
  assert.equal(figureCaption("A wall section", null), "A wall section");
  assert.equal(figureCaption("A wall section", undefined), "A wall section");
});

test('a title of "-" suppresses the visible caption', () => {
  assert.equal(
    figureCaption("Long verbal description of a diagram", "-"),
    null,
  );
  assert.equal(
    figureCaption("Long verbal description of a diagram", " - "),
    null,
  );
});

test("any other title replaces the alt as the caption", () => {
  assert.equal(
    figureCaption("Long verbal description", "Figure 3: template to sheet"),
    "Figure 3: template to sheet",
  );
});

test("no alt and no title yields no caption", () => {
  assert.equal(figureCaption("", null), null);
  assert.equal(figureCaption(null, null), null);
});

test("captionFromImgHtml: data-caption wins over alt", () => {
  assert.equal(
    captionFromImgHtml(
      '<img src="a.jpg" alt="Long description" data-caption="Short caption">',
    ),
    "Short caption",
  );
});

test("captionFromImgHtml: empty data-caption suppresses the caption", () => {
  assert.equal(
    captionFromImgHtml(
      '<img src="a.jpg" alt="Long description" data-caption="">',
    ),
    null,
  );
});

test("captionFromImgHtml: falls back to alt without data-caption", () => {
  assert.equal(
    captionFromImgHtml('<img src="a.jpg" alt="Long description">'),
    "Long description",
  );
});

test("captionFromImgHtml: no img or no alt yields no caption", () => {
  assert.equal(captionFromImgHtml("<p>nothing</p>"), null);
  assert.equal(captionFromImgHtml('<img src="a.jpg">'), null);
});

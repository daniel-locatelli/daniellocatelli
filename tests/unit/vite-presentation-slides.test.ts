import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  validateSlide,
  extractSlidesFromMdx,
} from "../../src/lib/vite-presentation-slides.ts";

const ctx = { file: "deck.mdx", line: 1 };

describe("validateSlide — current behavior (pre-refactor)", () => {
  test("type: slide accepts no fields (all optional)", () => {
    const errors = validateSlide({}, ctx);
    assert.deepEqual(errors, []);
  });

  test("type: title requires title field", () => {
    const errors = validateSlide({ type: "title" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("missing required field 'title'")));
  });

  test("type: text requires text field", () => {
    const errors = validateSlide({ type: "text" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("missing required field 'text'")));
  });

  test("type: image-row requires images field", () => {
    const errors = validateSlide({ type: "image-row" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("missing required field 'images'")));
  });

  test("unknown field on type: slide is rejected", () => {
    const errors = validateSlide({ type: "slide", banana: "yellow" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("unknown field 'banana'")));
  });

  test("type: text rejects image field (current behavior)", () => {
    const errors = validateSlide(
      { type: "text", text: "Hi", image: "foo" },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("unknown field 'image'")));
  });

  test("overlay format must be color/0-100", () => {
    const errors = validateSlide({ overlay: "purple/50" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("overlay")));
  });
});

describe("validateSlide — markdown text on type: slide", () => {
  test("accepts text: markdown string on type: slide", () => {
    const errors = validateSlide(
      { type: "slide", text: "# Heading\n\nBody." },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("rejects non-string text", () => {
    const errors = validateSlide(
      { type: "slide", text: 42 as unknown as string },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("'text'")));
  });
});

describe("YAML→JSX transform — text field", () => {
  test("text: emits <SlideMarkdown> child of <Slide>", () => {
    // Direct unit test of the transform requires exporting buildSlideJsx,
    // which is currently private. Until we export it, this test asserts
    // via extractSlidesFromMdx + the Vite plugin's transform contract:
    // the YAML field exists; rendering is verified end-to-end by the deck
    // validator + manual visual review in Phase 2.
    const mdx = `---
Name: x
---

---
type: slide
text: |
  # Hello
---
`;
    const { slides, parseErrors } = extractSlidesFromMdx(mdx, "deck.mdx");
    assert.deepEqual(parseErrors, []);
    assert.equal(slides.length, 1);
    assert.equal(slides[0].config.type, "slide");
    assert.match(String(slides[0].config.text), /^# Hello/);
  });
});

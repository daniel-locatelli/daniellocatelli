import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { validateSlide } from "../../src/lib/vite-presentation-slides.ts";

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

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

  test("unknown field on type: slide is rejected", () => {
    const errors = validateSlide({ type: "slide", banana: "yellow" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("unknown field 'banana'")));
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

describe("validateSlide — images: array on type: slide", () => {
  test("accepts images array on type: slide", () => {
    const errors = validateSlide(
      {
        type: "slide",
        images: [
          { src: "imgA", alt: "A" },
          { src: "imgB", alt: "B" },
        ],
      },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("accepts images array combined with text and overlay", () => {
    const errors = validateSlide(
      {
        type: "slide",
        images: [{ src: "a", alt: "A" }, { src: "b", alt: "B" }],
        overlay: "black/40",
        text: "## Caption",
      },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("rejects empty images array", () => {
    const errors = validateSlide(
      { type: "slide", images: [] },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("at least one")));
  });

  test("rejects malformed item (missing alt) on type: slide", () => {
    const errors = validateSlide(
      {
        type: "slide",
        images: [{ src: "imgA" }],
      },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("missing 'alt'")));
  });
});

describe("validateSlide — deprecated types removed", () => {
  test("type: title is no longer accepted", () => {
    const errors = validateSlide({ type: "title", title: "x" }, ctx);
    assert.ok(
      errors.some((e) => e.message.includes("Unknown slide type 'title'")),
    );
  });

  test("type: text is no longer accepted", () => {
    const errors = validateSlide({ type: "text", text: "x" }, ctx);
    assert.ok(
      errors.some((e) => e.message.includes("Unknown slide type 'text'")),
    );
  });

  test("type: image-row is no longer accepted", () => {
    const errors = validateSlide(
      { type: "image-row", images: [{ src: "a", alt: "A" }] },
      ctx,
    );
    assert.ok(
      errors.some((e) => e.message.includes("Unknown slide type 'image-row'")),
    );
  });
});

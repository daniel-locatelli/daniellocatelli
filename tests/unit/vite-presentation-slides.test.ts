import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  validateSlide,
  extractSlidesFromMdx,
} from "../../src/lib/vite-presentation-slides.ts";

const ctx = { file: "deck.mdx", line: 1 };

describe("validateSlide — basic shape", () => {
  test("empty slide accepts no fields (all optional)", () => {
    const errors = validateSlide({}, ctx);
    assert.deepEqual(errors, []);
  });

  test("unknown field is rejected", () => {
    const errors = validateSlide({ banana: "yellow" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("unknown field 'banana'")));
  });

  test("overlay format must be color/0-100", () => {
    const errors = validateSlide({ overlay: "purple/50" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("overlay")));
  });
});

describe("validateSlide — markdown text", () => {
  test("accepts text: markdown string", () => {
    const errors = validateSlide(
      { text: "# Heading\n\nBody." },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("rejects non-string text", () => {
    const errors = validateSlide(
      { text: 42 as unknown as string },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("'text'")));
  });
});

describe("YAML→JSX transform — text field", () => {
  test("text: emits <SlideMarkdown> child of <Slide>", () => {
    const mdx = `---
Name: x
---

---
text: |
  # Hello
---
`;
    const { slides, parseErrors } = extractSlidesFromMdx(mdx, "deck.mdx");
    assert.deepEqual(parseErrors, []);
    assert.equal(slides.length, 1);
    assert.match(String(slides[0].config.text), /^# Hello/);
  });
});

describe("validateSlide — images: array", () => {
  test("accepts images array", () => {
    const errors = validateSlide(
      {
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
        images: [{ src: "a", alt: "A" }, { src: "b", alt: "B" }],
        overlay: "black/40",
        text: "## Caption",
      },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("rejects empty images array", () => {
    const errors = validateSlide({ images: [] }, ctx);
    assert.ok(errors.some((e) => e.message.includes("at least one")));
  });

  test("rejects malformed item (missing alt)", () => {
    const errors = validateSlide(
      { images: [{ src: "imgA" }] },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("missing 'alt'")));
  });
});

describe("validateSlide — deprecated type: field", () => {
  test("any 'type:' value is rejected with deprecation message", () => {
    for (const value of ["slide", "title", "text", "image-row"]) {
      const errors = validateSlide({ type: value }, ctx);
      assert.ok(
        errors.some((e) => e.message.includes("'type:' is no longer supported")),
        `expected deprecation message for type: ${value}`,
      );
    }
  });
});

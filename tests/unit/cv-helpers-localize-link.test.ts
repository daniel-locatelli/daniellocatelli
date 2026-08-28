import { test } from "node:test";
import assert from "node:assert/strict";
import { localizeLink } from "../../src/lib/cv-helpers";

test("localizeLink: prefixes a bare internal path on a non-default locale", () => {
  assert.equal(localizeLink("/projects/dokwood", "de"), "/de/projects/dokwood");
});

test("localizeLink: leaves a bare internal path alone on the default locale", () => {
  assert.equal(localizeLink("/projects/dokwood", "en"), "/projects/dokwood");
});

test("localizeLink: leaves external URLs unchanged", () => {
  assert.equal(localizeLink("https://hm.edu/x", "de"), "https://hm.edu/x");
});

test("localizeLink: does not double-prefix a path that already carries a locale", () => {
  assert.equal(
    localizeLink("/pt/projects/dokwood", "pt"),
    "/pt/projects/dokwood",
  );
  assert.equal(localizeLink("/de", "de"), "/de");
});

test("localizeLink: leaves locale-neutral static files unprefixed", () => {
  assert.equal(
    localizeLink("/documents/daniel-locatelli_tfg-fauusp.pdf", "pt"),
    "/documents/daniel-locatelli_tfg-fauusp.pdf",
  );
});

test("localizeLink: empty link stays empty", () => {
  assert.equal(localizeLink("", "de"), "");
});

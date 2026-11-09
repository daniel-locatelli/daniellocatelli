import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findLinkAnchors,
  sourceToPageUrl,
} from "../../src/lib/link-check/sources";

const SITE = "https://daniellocatelli.com";

test("sourceToPageUrl: maps relative, absolute and Windows dist paths", () => {
  assert.equal(
    sourceToPageUrl("dist/client/research/foo/index.html", SITE),
    "https://daniellocatelli.com/research/foo",
  );
  assert.equal(
    sourceToPageUrl(
      "/home/runner/work/x/x/dist/client/de/cv/index.html",
      SITE + "/",
    ),
    "https://daniellocatelli.com/de/cv",
  );
  assert.equal(
    sourceToPageUrl("C:\\repo\\dist\\client\\index.html", SITE),
    "https://daniellocatelli.com/",
  );
});

test("findLinkAnchors: footnote and its tooltip collapse to one anchor", () => {
  const url = "http://example.com/a";
  const html = `<h2 id="intro">Intro</h2><p>Text<sup><a href="#fn-x" id="fnref-x">1</a>
<span id="fn-x-tooltip" popover="manual">Ref <a href="${url}">${url}</a></span></sup></p>
<ol><li id="fn-x"><p>Ref <a href="${url}">${url}</a></p></li></ol>`;
  assert.deepEqual(findLinkAnchors(html, url), ["fn-x"]);
});

test("findLinkAnchors: prose link takes the nearest heading id", () => {
  const html = `<h2 id="a">A</h2><p>x</p><h2 id="b">B</h2><p><a href="http://e.com/?q=1&amp;r=2">l</a></p>`;
  assert.deepEqual(findLinkAnchors(html, "http://e.com/?q=1&r=2"), ["b"]);
});

test("findLinkAnchors: no preceding id or no match yields nothing", () => {
  assert.deepEqual(
    findLinkAnchors(`<p><a href="http://e.com">x</a></p>`, "http://e.com"),
    [],
  );
  assert.deepEqual(
    findLinkAnchors(`<p id="p">nothing</p>`, "http://e.com"),
    [],
  );
});

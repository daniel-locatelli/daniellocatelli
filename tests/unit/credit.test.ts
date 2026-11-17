import { test } from "node:test";
import assert from "node:assert/strict";
import { copyrightMark, isPublicDomainCredit } from "../../src/lib/credit";

test("copyrightMark: adds the mark to a protected creator", () => {
  assert.equal(copyrightMark("Gui Morelli"), "© ");
  assert.equal(copyrightMark("Estate of R. Buckminster Fuller"), "© ");
});

test("copyrightMark: no mark when the line already has one", () => {
  assert.equal(copyrightMark("© Burggraf / Reichert"), "");
});

test("copyrightMark: no mark for public-domain creators", () => {
  assert.equal(copyrightMark("Ernst Haeckel"), "");
  assert.equal(copyrightMark("Ernst Haeckel, engravings by Adolf Giltsch"), "");
  assert.equal(copyrightMark("Goethe: Versuch die Metamorphose der Pflanzen zu erklären"), "");
});

test("isPublicDomainCredit: a mixed line or a name prefix is not public domain", () => {
  assert.equal(isPublicDomainCredit("Ernst Haeckel; Estate of R. Buckminster Fuller"), false);
  assert.equal(isPublicDomainCredit("Ernst Haeckelson"), false);
});

---
name: reviewing-translations
description: Use when reviewing this site's Portuguese text for natural wording (a translation pass, a locale audit, a batch of new pt copy), or when harvesting Daniel's pt corrections into the style guide.
---

# Reviewing translations

Daniel reads Portuguese natively and has little time for translation work.
The review's job is to spend his attention only where a native judgement is
needed, and to turn every judgement he makes into a lasting example.

The guide is `docs/i18n/pt-BR.md`. Read it fully first, Corrections included.

## 1. Harvest

Collect corrections Daniel made by hand since the last harvest:

```bash
git log -p --no-merges <harvested-commit>..HEAD -- 'src/i18n/*/pt.ts' 'src/content/**/pt/**'
```

`<harvested-commit>` is the hash under "Corrections" in the guide. A commit
without a `Co-Authored-By: Claude` trailer is Daniel's own; each pt wording
change in it is a correction. Add every one to the Corrections table, then set
the harvested hash to `HEAD`. Done when every such commit has been read.

## 2. Native pass

Read the pt text in scope **with the English closed**. Where a string's
meaning depends on where it renders (a label before a name, a word whose
gender must agree), grep the components for its usage; the en file stays
closed. For every string ask:
would a Brazilian write this? Flag each calque, unnatural word order, wrong
register, false friend, and English term the glossary does not allow. Give
each flag a proposed rewrite and a confidence: _sure_ or _unsure_. Split a
long string into one item per sentence, so Daniel can accept parts. Done when
every string in scope has been judged, not just the ones that caught the eye.

## 3. Fidelity pass

Now open the English. Flag only meaning drift: something added, lost, or
changed. Wording is settled in step 2.

## 4. Ask Daniel

Present one short list, _sure_ items first, each as
`current → proposed (why, a few words)`, numbered so he can answer
"accept all except 3, 7: ...". Apply what he accepts, in pt only.

## 5. Record

Add every item Daniel decided to the Corrections table: accepted rewrites,
his alternatives, and rejections as "kept" with his reason. Add or confirm
glossary entries he settled. Done when the table reflects every decision from
step 4.
